# 01. Process Timeline (Phase 0~4)

> 작업을 시간순으로 재구성. 각 Phase의 입력 / 행위 / 결과 / 판단 포인트를 기록.

## 전체 흐름

```
┌─────────┐   ┌────────┐   ┌──────────┐   ┌────────┐   ┌─────────┐
│ Phase 0 │ → │ Phase 1│ → │ Phase 2  │ → │ Phase 3│ → │ Phase 4 │
│ 백업    │   │ 삭제   │   │ 재생성   │   │ 검증   │   │ 정리    │
└─────────┘   └────────┘   └──────────┘   └────────┘   └─────────┘
   안전망       경계 확보      핵심 작업       regression    마무리
                              (subagent)     체크
```

## Phase 0 — 백업 & 현재 상태 보존

**입력**: main 브랜치, 사용자의 in-progress docs 재구성 작업 (staged 25 rename + 2 untracked 디렉토리)

**행위**:

1. `git status` 로 현재 상태 확인 → **깨끗하지 않음** 발견
2. 사용자에게 in-progress 작업 처리 방식 확인 → `git stash push -u -m "..." -- docs/` 선택
3. `backup/codex-before-resync-20260424` 브랜치 생성
4. `.codex/config.toml` (untracked) 을 `git add` 하여 백업 스냅샷에 포함
5. commit `8e352a4 chore: codex 재정리 전 스냅샷 (src/codex + .codex)` 생성
6. `git checkout main` 으로 복귀

**결과**:

- 백업 브랜치 `backup/codex-before-resync-20260424` (`8e352a4`, 166 codex 파일 포함)
- stash@{0} 에 사용자 docs 작업 보관 (26 tracked + 41 untracked entries)
- main 작업 트리 깨끗 (codex 작업용 zero-state 준비 완료)

**판단 포인트**:

- `.codex/config.toml` 은 main 체크아웃 과정에서 working tree 에서 사라졌으나, 백업 브랜치에 보존되어 있고 Phase 2에서 어차피 재생성될 예정이라 OK 판정
- 탐색 에이전트의 초기 보고와 실제 상태에 불일치 발견 (`.codex/agents/kit-codex-sync-reviewer.toml` 은 untracked가 아니라 tracked) — 플랜을 현장에서 수정

## Phase 1 — 전면 삭제

**입력**: main, 백업 브랜치 확보 완료, stash@{0} 격리 완료

**행위**:

1. `git rm -rf src/codex/` → 164 tracked files 삭제
2. `git rm -rf .codex/` → 1 tracked file (`kit-codex-sync-reviewer.toml`) 삭제
3. `git status` 확인 → 예상 외 staged 25 rename 발견 (stash가 완전히 isolate 하지 못함)
4. `git commit --only -m "..." -- src/codex/ .codex/` 로 **codex 경로만 선별 커밋**
5. `git restore --staged docs/` 로 남은 docs rename을 index에서 해제 (working tree에는 duplicate 상태로 남김)

**결과**:

- commit `5d6f6ce chore(codex): src/codex + .codex 전면 삭제 (재생성 준비)` (165 files, -15533 lines)
- working tree `src/codex/`, `.codex/` 완전 empty
- docs/ duplicate 34 entries 잔존 (Phase 4에서 정리 예정)

**판단 포인트**:

- 단일 커밋으로 삭제와 재생성을 묶을지 vs 별도로 나눌지 고민했으나, **재생성 실패 시 중간 상태로부터 rollback 가능하도록** 별도 커밋 결정
- `git commit --only` 플래그로 staging area 의 docs rename 을 건너뛰고 codex 경로만 선별 커밋하여 원자성 확보

## Phase 2 — Claude SSOT 기반 전체 재생성

**입력**: 빈 `src/codex/` + 빈 `.codex/`, 보존된 `src/claude/**` + `src/exception-registry.json` + `src/pairing-registry.json` + `src/claude/_meta/codex-portability.json`

**행위**:

1. 메인 세션에서 `kit-sync-agent` 서브에이전트 호출 (Opus, write-capable)
2. 에이전트가 내부적으로 수행:
   - `/kit-analyze --all` 에 해당하는 자산 분류 (auto / review / skip)
   - `/kit-convert --all --force` 에 해당하는 전체 변환
   - `src/exception-registry.json` active / resolved 항목별 처리
   - paired-review 26개 자동 변환 + `<!-- REVIEW NEEDED: ... -->` marker 삽입
   - `.codex/config.toml` + `.codex/agents/kit-codex-sync-reviewer.toml` 템플릿/백업 기반 재생성
   - `src/pairing-registry.json` 의 114 paired entries 의 `lastSyncedAt` + `contentHash` 일괄 갱신
3. 메인으로 최종 보고 반환 (변환 집계 + REVIEW NEEDED 목록 + Agent Edit Race 주의사항)
4. 메인 세션이 Read 로 샘플 5파일 캐시 재인증 (Agent Edit Race 방지)
5. `git add src/codex/ .codex/ src/pairing-registry.json` → pathspec 선별
6. staged 내용 검증 (174 파일 = Add 173 + Modify 1, 외부 경로 없음)
7. commit `61d1bc5 chore(codex): Claude SSOT 기반 전체 재생성 (kit-sync-agent --resync --force)` (174 files, +19429 / −158)

**결과**:

- `src/codex/` 171 신규 파일:
  - core 50 (hooks 12 + skills 8 + rules 5 + commands 1 + utility 23 + `.gitkeep` 1)
  - dev 51 (agents 7 + commands 21 + hooks 4 + skills 15 + rules 1 + _schemas 3 + `.gitkeep` 1)
  - plan 53 (agents 12 + commands 11 + hooks 4 + skills 9 + rules 2 + utility 14 + `.gitkeep` 1)
  - copy 17 (agents 4 + commands 7 + skills 5 + `.gitkeep` 1)
- `.codex/` 2 파일 (config.toml + kit-codex-sync-reviewer.toml)
- `src/pairing-registry.json` 1699 → 1819 라인 (약 +120 라인 = 114 × 2 필드)
- 29 파일에 REVIEW NEEDED marker 삽입

**판단 포인트**:

- 에이전트 프롬프트에 `docs/` 경로 편집 금지를 명시 → 사용자 in-progress 작업 보호
- exception-registry 는 read-only 로 전달 → 설계 결정 회피
- paired-review 26개를 "변환은 하되 marker 삽입" 으로 처리 → 사용자가 나중에 검토 가능

## Phase 3 — 검증 (C7 + C8 + C3-lite)

**입력**: 재생성 완료된 src/codex/, 갱신된 pairing-registry

**행위**:

1. C7 (페어링 일관성): `audit-c7.js` 스크립트 작성 후 실행
   - pairing-registry ↔ 파일시스템 일관성
   - exception-registry ↔ pairing-registry cross-check
   - paired-fallback artifact 존재 여부 확인
2. C8 (교차 참조): `> 참조:` 블록 6개 추출 후 경로 실존 여부 확인
3. C3-lite: 0바이트 파일, REVIEW NEEDED marker 카운트, frontmatter syntax 확인
4. 발견된 FAIL / WARN 항목을 backup 브랜치와 비교 → **전부 pre-existing 확인**

**결과**:

- C7: 1 FAIL (EX-009 strategy/status 모순) + 6 WARN (AGENTS.md.template 섹션 누락)
- C8: 5 dead references (`dev-` 접두사 누락)
- C3-lite: 0 issues, REVIEW NEEDED 29개 marker 독립 검증 통과
- **Phase 2 재생성으로 인한 신규 regression: 0건**

**판단 포인트**:

- C7 FAIL 이 backup 에서도 동일하게 존재 → Phase 2 품질 이슈 아님
- WARN 6건은 AGENTS.md.template 파일 자체가 7라인 placeholder 뿐임을 발견 → Phase 2 이전부터 fallback artifact 가 실제로 존재하지 않았던 것. 에이전트의 Phase 2 보고 중 "이미 존재" 표현은 부정확
- 본 검증은 "Phase 2 quality gate" 역할만 수행. 기존 이슈 해결은 별도 세션 대상

## Phase 4 — 정리

**입력**: Phase 2 커밋 완료, working tree 에 docs/ duplicate + agent-memory 변경

**행위**:

1. `audit-c7.js` 임시 스크립트 삭제 (`/c/Users/user/.claude/plans/`)
2. `.claude/agent-memory/kit-sync-agent/` 2개 파일 별도 커밋 `f5cdaeb chore(agent-memory): kit-sync-agent zero-state resync 작업 메모 추가` (2 files, +25 lines)
3. stash@{0} 처리:
   - `git stash show --include-untracked -p stash@{0}` 시도 → duplicate entry 오류 (docs/README.md가 tracked와 untracked 양쪽에 존재)
   - 우회: tracked 부분은 `git stash show -p stash@{0} > docs-restructure-stash-tracked-20260424.patch`
   - untracked 부분은 `git archive stash@{0}^3 -- docs/ > docs-restructure-stash-untracked-20260424.tar`
   - `docs-restructure-stash-20260424-README.md` 에 복원 가이드 작성
   - `git stash drop stash@{0}` 실행
4. working tree 잔여 46 entries (사용자의 docs 재구성 작업) 는 유지

**결과**:

- main 브랜치 5 commits ahead of origin/main (기존 7 + codex 삭제 1 + codex 재생성 1 + agent-memory 1 + 기존 docs 1)

  잠깐, 실제 git 출력은 +9 ahead 였음. 기존 +7 (docs 관련) + 이번 +3 = 10이지만 git 계산상 +9. (docs 가 이미 기존 ahead 7에 포함되어 있었던 것)
- 안전망 자산 3건 + backup 브랜치 1건 = 총 4중 보장
- 임시 스크립트 정리됨
- stash 비어 있음

**판단 포인트**:

- stash pop 대신 patch / tar export 선택 이유: 복원 시점에 working tree 가 어떤 상태일지 모르기에 **명시적 복원 절차가 더 안전**
- agent-memory 는 codex 자산이 아니지만 kit-sync-agent 의 학습 기록이라 보존 가치가 있어 별도 커밋

## 시간 소요 대략

| Phase | 실소요 | 주요 비용 |
|:---:|:---:|-----|
| 0 | 짧음 | 현재 상태 확인 + 브랜치 생성 |
| 1 | 짧음 | git rm + 커밋 |
| 2 | **가장 긺** | subagent 가 171 파일 생성 + registry 갱신 (~16분) |
| 3 | 중간 | audit-c7.js 작성 + 실행 + backup 비교 |
| 4 | 짧음 | stash 처리 + 커밋 |

## 참고: 실제 커맨드 시퀀스 (재현용)

아래는 숙련자가 본 작업을 되돌아보거나 유사 작업을 수행할 때 참조하는 명령 목록이다.

```bash
# Phase 0
git checkout -b backup/codex-before-resync-20260424
git add .codex/config.toml
git commit -m "chore: codex 재정리 전 스냅샷 (src/codex + .codex)"
git checkout main

# docs in-progress 격리
git stash push --include-untracked -m "docs: guide 재구성 중간 스냅샷" -- docs/

# Phase 1
git rm -rf src/codex/
git rm -rf .codex/
git commit --only -m "chore(codex): src/codex + .codex 전면 삭제 (재생성 준비)" -- src/codex/ .codex/
git restore --staged docs/

# Phase 2 (subagent 호출은 생략, 결과물만 기록)
git add src/codex/ .codex/ src/pairing-registry.json
git commit -m "chore(codex): Claude SSOT 기반 전체 재생성 (kit-sync-agent --resync --force)"

# Phase 3 검증 (생략)

# Phase 4
git add .claude/agent-memory/kit-sync-agent/
git commit -m "chore(agent-memory): kit-sync-agent zero-state resync 작업 메모 추가"
git stash show -p stash@{0} > <patch-path>
git archive stash@{0}^3 -- docs/ > <tar-path>
git stash drop stash@{0}
```
