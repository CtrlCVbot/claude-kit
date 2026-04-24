# 11. Rollback & Recovery

> **본 작업은 4중 안전망으로 보호된다.** 문제 발생 시 단계별로 되돌릴 수 있다.

## 4중 안전망

| # | 안전망 | 위치 | 용도 |
|:---:|--------|-----|------|
| 1 | Backup branch | `backup/codex-before-resync-20260424` (commit `8e352a4`) | codex 자산 전체 상태 snapshot |
| 2 | Phase 1 commit | `5d6f6ce` | 삭제만 된 중간 상태 (재생성 실패 시) |
| 3 | docs stash tracked patch | `C:\Users\user\.claude\plans\docs-restructure-stash-tracked-20260424.patch` | 사용자 docs 재구성 rename + modify 복원 |
| 4 | docs stash untracked tar | `C:\Users\user\.claude\plans\docs-restructure-stash-untracked-20260424.tar` | 사용자 docs 재구성 untracked 파일 복원 |

## Recovery 시나리오

### 시나리오 A: Phase 2 재생성 결과가 맘에 안 듦

**원하는 결과**: 2026-04-24 작업 전 상태로 완전 복원

```bash
cd "/c/Program Files (user)/mologado/claude-kit"

# 현재 작업 커밋했다면 되돌리기
git reset --hard backup/codex-before-resync-20260424

# 아직 커밋 전이라면 working tree 정리
git clean -fd src/codex/ .codex/   # Phase 2 생성 파일 삭제
git checkout backup/codex-before-resync-20260424 -- src/codex/ .codex/ src/pairing-registry.json
```

**결과**: src/codex/ 164 파일 + .codex/ 1 파일 + pairing-registry 원본으로 복원. backup 커밋 `8e352a4` 상태.

**주의**: 이 후 docs 재구성 작업 복원은 [시나리오 C](#시나리오-c-docs-재구성-작업-복원) 참조.

### 시나리오 B: Phase 2 재생성 중 실패 / 부분 복원

**상황**: Phase 2 가 일부 파일만 생성하고 중단되었거나, 재생성 후 일부 파일이 손상

**Phase 1 (삭제 완료) 상태로 되돌리기**:

```bash
cd "/c/Program Files (user)/mologado/claude-kit"
git reset --hard 5d6f6ce   # Phase 1 commit
```

**결과**: src/codex/ + .codex/ 완전 비어 있는 상태. 이 상태에서 Phase 2 재실행 가능.

### 시나리오 C: docs 재구성 작업 복원

**상황**: 사용자의 in-progress docs 재구성 작업을 원복하거나 현재 working tree 와 비교

#### C-1. Tracked 변경 (rename + modify 26건) 복원

```bash
cd "/c/Program Files (user)/mologado/claude-kit"

# 먼저 working tree 현재 docs 변경 제거 (필요 시)
git checkout HEAD -- docs/
git clean -fd docs/

# patch apply
git apply /c/Users/user/.claude/plans/docs-restructure-stash-tracked-20260424.patch
```

**주의**: 현재 working tree 가 깨끗하지 않으면 충돌 발생. `--check` 플래그로 미리 시뮬레이션:

```bash
git apply --check /c/Users/user/.claude/plans/docs-restructure-stash-tracked-20260424.patch
```

#### C-2. Untracked 파일 (60 파일) 복원

```bash
cd "/c/Program Files (user)/mologado/claude-kit"
tar xf /c/Users/user/.claude/plans/docs-restructure-stash-untracked-20260424.tar
```

**주의**: 기존 파일을 덮어쓰므로 임시 디렉토리에 먼저 풀어 비교 권장:

```bash
mkdir -p /tmp/docs-restore-preview
tar xf /c/Users/user/.claude/plans/docs-restructure-stash-untracked-20260424.tar -C /tmp/docs-restore-preview
diff -r /tmp/docs-restore-preview/docs docs
```

#### C-3. 복원 검증

```bash
git status docs/        # 예상: ~42 entries (원래 stash 상태)
```

### 시나리오 D: 부분 복원 (특정 파일만)

**상황**: Phase 2 재생성된 파일 중 특정 파일만 backup 버전으로 교체

```bash
cd "/c/Program Files (user)/mologado/claude-kit"

# 예: src/codex/dev/agents/dev-architect.md 를 backup 으로 교체
git checkout backup/codex-before-resync-20260424 -- src/codex/dev/agents/dev-architect.md
```

**주의**:
- 이 방식은 pairing-registry 의 contentHash 와 불일치 발생 가능
- `/kit-audit --content` 실행 시 drift 감지됨
- 필요 시 pairing-registry 의 해당 엔트리 수동 업데이트

### 시나리오 E: pairing-registry 만 복원

**상황**: Phase 2 의 lastSyncedAt / contentHash 갱신을 되돌리고 싶음 (드문 경우)

```bash
cd "/c/Program Files (user)/mologado/claude-kit"
git checkout backup/codex-before-resync-20260424 -- src/pairing-registry.json
```

**결과**: pairing-registry 만 2026-04-24 이전 상태. codex 파일들은 현재 상태 유지. → **불일치 상태 주의** — `/kit-audit --category C7` 에서 FAIL 다수 발생 가능.

## Backup 자산 무결성 검증

현재 모든 안전망 자산이 유효한지 확인:

```bash
cd "/c/Program Files (user)/mologado/claude-kit"

# 1. Backup branch
git show backup/codex-before-resync-20260424 --stat | head -3
# 예상: commit 8e352a4, chore: codex 재정리 전 스냅샷

# 2. docs patch 파일
ls -la /c/Users/user/.claude/plans/docs-restructure-stash-tracked-20260424.patch
# 예상: 약 21KB

# 3. docs tar 파일
tar tf /c/Users/user/.claude/plans/docs-restructure-stash-untracked-20260424.tar | wc -l
# 예상: 60 entries

# 4. README 파일
cat /c/Users/user/.claude/plans/docs-restructure-stash-20260424-README.md | head -5
```

## Backup 자산 정리 시점

언제 이 안전망을 제거해도 되는가:

| 자산 | 정리 가능 조건 |
|------|---------------|
| `backup/codex-before-resync-20260424` 브랜치 | Phase 2 재생성 결과에 문제 없음 확인 + 최소 2주 경과 |
| `docs-restructure-stash-*.patch/tar` | 사용자가 docs 재구성 작업을 main 에 merge 완료 후 |
| `docs-restructure-stash-20260424-README.md` | 위 patch/tar 과 함께 제거 |

정리 명령:

```bash
# branch 삭제
git branch -D backup/codex-before-resync-20260424

# docs stash 아카이브 삭제
rm /c/Users/user/.claude/plans/docs-restructure-stash-*.patch
rm /c/Users/user/.claude/plans/docs-restructure-stash-*.tar
rm /c/Users/user/.claude/plans/docs-restructure-stash-*-README.md
```

## 되돌리기 금지 / 주의 사항

| 명령 | 왜 위험한가 |
|------|------------|
| `git push --force origin main` | 원격 저장소의 다른 작업자에게 영향 |
| `git reset --hard origin/main` | origin 이 backup 보다 낡았으면 backup 브랜치 정보 손실 가능 |
| `git branch -D backup/codex-before-resync-20260424` (너무 이른 시점) | rollback 안전망 소실 |

## 참조

- [01 Process Timeline](01-process-timeline.md) — Phase별 커밋 시퀀스
- [09 Pairing Registry Changes](09-pairing-registry-changes.md) — 메타데이터 변경 상세
