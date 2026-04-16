<!-- kit-convert generated: 2026-04-16 -->
<!-- REVIEW NEEDED: complex command -->
# dev-sync-docs — Codex Entry Flow

## Overview

prompt_plan.md, spec.md, CLAUDE.md + rules/ 문서 동기화 (v7). 변경된 코드를 기반으로 프로젝트 문서를 일관되게 업데이트한다.

## Invocation

```
dev-sync-docs [--check-only]
```

## Parameters

| 플래그 | 설명 |
|--------|------|
| `--check-only` | 실제 수정 없이 변경 필요 항목만 출력 |
| (없음) | 문서 동기화 실행 |

## Workflow

### 0단계: 작업 설명 확인

인자로 전달된 작업 설명을 확인한다.
인자가 없으면 최근 커밋 메시지에서 작업 내용을 추론한다.

```bash
git log --oneline -5
```

---

### 1단계: 모드 결정 (CRITICAL)

인자에 `--check-only`가 포함되어 있으면:
- **모든 Write/Edit 도구 호출을 금지한다.**
- 각 단계에서 "변경이 필요한 항목"만 수집한다.
- Read/Glob/Grep/Bash(git)만 사용한다.

---

### 2단계: 변경된 코드 분석

**diff 범위 자동 감지:**

```bash
BASE=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null)
if [ -n "$BASE" ] && [ "$BASE" != "$(git rev-parse HEAD)" ]; then
  git diff --name-only "$BASE"..HEAD
  git diff --stat "$BASE"..HEAD
else
  COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
  if [ "$COMMIT_COUNT" -eq 0 ]; then
    echo "NO_COMMITS"
  elif [ "$COMMIT_COUNT" -ge 3 ]; then
    git diff --name-only HEAD~3..HEAD
  else
    git diff --name-only HEAD~1..HEAD
  fi
fi
```

`NO_COMMITS`가 출력되면 동기화할 변경사항이 없으므로 사용자에게 알리고 종료한다.

**충돌 해결 원칙:** 소스 코드(git diff)가 최우선 진실 소스(source of truth)이다.

---

### 3단계: prompt_plan.md 동기화

Glob 패턴으로 `prompt_plan.md`를 탐색한다 (`./prompt_plan.md`, `./.claude/prompt_plan.md`, `./docs/prompt_plan.md`).

업데이트 항목:
- 완료된 작업 항목 체크 (`- [x]`)
- 진행 상황 갱신
- 다음 단계 업데이트

파일이 없으면 건너뛴다.

---

### 4단계: spec.md 동기화

Glob 패턴으로 `spec.md`를 탐색한다.

업데이트 항목:
- 구현된 기능 반영
- API 변경사항 반영
- 데이터 모델 변경 반영

---

### 5단계: CLAUDE.md 동기화 (60줄 제한)

**60줄 제한 규칙 (CRITICAL):** CLAUDE.md는 **60줄 이하**를 유지한다.

**CLAUDE.md에 허용되는 내용 (Core 정보만):** 프로젝트 개요, 기술 스택, 필수 명령어, 핵심 디렉토리 구조, Git 워크플로우, Rules 참조 안내.

**CLAUDE.md에 넣으면 안 되는 내용 → rules/로 이동:** 코딩 스타일/컨벤션 상세, 테스트 규칙, API 설계, 보안, DB 패턴.

---

### 6단계: rules/ 동기화

`.claude/rules/` 디렉토리의 규칙 파일을 코드 변경에 맞게 동기화한다.

변경 성격별 대상 rules 파일 매핑:
- API 엔드포인트 추가/변경 → `rules/api-design.md`
- DB 스키마/마이그레이션 → `rules/database.md`
- 컴포넌트 패턴 변경 → `rules/frontend.md`
- 테스트 설정 변경 → `rules/testing.md`
- 인증/보안 변경 → `rules/security.md`
- 빌드/CI 변경 → `rules/build.md`

**판단 기준:**
- 기존 rules 파일에 해당 주제가 있으면 → 해당 파일 업데이트
- 해당 주제의 rules 파일이 없으면 → 새 rules 파일 생성하지 않음 (알림만)

---

### 7단계: CLAUDE.md 줄 수 검증

| 줄 수 | 상태 | 동작 |
|-------|------|------|
| ≤ 60 | 정상 | 완료 |
| 61-80 | 경고 | 출력에 경고 표시, 분리 제안 |
| > 80 | 초과 | 상세 내용을 rules/로 분리 실행 |

---

### 8단계: 커밋 안내

동기화로 파일이 변경된 경우 다음 액션을 안내한다.

---

### 9단계: 출력

**동기화 완료 시:**

```
════════════════════════════════════════════════════════════════
  Sync Docs v7 (문서 동기화)
════════════════════════════════════════════════════════════════

  작업: [완료한 작업 설명]

  동기화 결과:
    prompt_plan.md  [업데이트 / 없음 / 변경없음]
    spec.md         [업데이트 / 없음 / 변경없음]
    CLAUDE.md       [업데이트 / 없음 / 변경없음] (N줄)
    rules/          [N개 업데이트 / 변경없음]

  CLAUDE.md: N줄 (정상 / 경고: 60줄 초과)

  다음: /quick-commit

════════════════════════════════════════════════════════════════
```

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/dev/commands/dev-sync-docs.md
