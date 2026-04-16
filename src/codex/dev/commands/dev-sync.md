<!-- kit-convert generated: 2026-04-16 -->
<!-- REVIEW NEEDED: complex command -->
# dev-sync — Codex Entry Flow

## Overview

git pull + 문서 동기화 통합 (pull → sync-docs v7 순차 실행).

## Invocation

```
dev-sync [--no-pull] [--check-only] [작업설명]
```

## Parameters

| 플래그 | 설명 |
|--------|------|
| `--no-pull` | pull 건너뛰고 문서 동기화만 실행 (`dev-sync-docs`와 동일) |
| `--check-only` | 문서 변경 필요 사항만 보여주고 수정하지 않음 |
| (없음) | pull + 문서 동기화 모두 실행 |

## Workflow

### Phase 1: Git Pull (`--no-pull` 시 스킵)

#### 1-1. 현재 상태 확인

```bash
git branch --show-current
git status --short
```

커밋되지 않은 변경사항이 있으면 경고:
```
작업 중인 변경사항이 있습니다. stash 후 진행할까요? (Y/n)
```
- Y: `git stash` 후 진행, pull 후 `git stash pop`
- n: 그대로 pull 시도

#### 1-2. Pull 실행

```bash
git pull origin main
```

충돌 발생 시 Phase 2 진행하지 않고 충돌 보고 후 중단.

---

### Phase 2: 문서 동기화 (sync-docs v7 로직)

#### 2-0. 모드 결정 (CRITICAL)

`--check-only` 플래그가 있으면:
- **모든 Write/Edit 도구 호출을 금지한다.**
- Read/Glob/Grep/Bash(git)만 사용한다.

#### 2-1. 작업 설명 확인

인자로 전달된 작업 설명을 확인한다. 없으면 최근 커밋 메시지에서 추론한다.

```bash
git log --oneline -5
```

#### 2-2. 변경된 코드 분석

diff 범위 자동 감지 (main 분기점 또는 최근 커밋 기반).

`NO_COMMITS`가 출력되면 종료한다.

**충돌 해결 원칙:** 소스 코드(git diff)가 최우선 진실 소스(source of truth)이다.

#### 2-3. prompt_plan.md 동기화

완료된 작업 항목 체크, 진행 상황 갱신, 다음 단계 업데이트.

#### 2-4. spec.md 동기화

구현된 기능, API 변경사항, 데이터 모델 변경 반영.

#### 2-5. CLAUDE.md 동기화 (60줄 제한)

**60줄 제한 규칙 (CRITICAL):** CLAUDE.md는 **60줄 이하**를 유지한다.

Core 정보만 허용 (프로젝트 개요, 기술 스택, 필수 명령어, 핵심 디렉토리, Git 워크플로우, Rules 참조).

코딩 규칙/패턴 상세는 rules/ 파일로 라우팅.

#### 2-6. rules/ 동기화

`.claude/rules/` 디렉토리의 규칙 파일을 코드 변경에 맞게 동기화한다.

#### 2-7. CLAUDE.md 줄 수 최종 검증

| 줄 수 | 상태 | 동작 |
|-------|------|------|
| ≤ 60 | 정상 | 완료 |
| 61-80 | 경고 | 출력에 경고 표시, 분리 제안 |
| > 80 | 초과 | 상세 내용을 rules/로 분리 실행 |

## Output

**전체 실행 (pull + sync):**

```
════════════════════════════════════════════════════════════════
  Sync v7 (pull + docs)
════════════════════════════════════════════════════════════════

  [Pull]
    브랜치: {branch}
    상태: {up-to-date | N commits pulled}

  [Docs]
    작업: {작업 설명}
    prompt_plan.md  {업데이트 | 없음 | 변경없음}
    spec.md         {업데이트 | 없음 | 변경없음}
    CLAUDE.md       {업데이트 | 없음 | 변경없음} (N줄)
    rules/          {N개 업데이트 | 변경없음}

  CLAUDE.md: N줄 (정상 / 경고: 60줄 초과)

  다음: /quick-commit

════════════════════════════════════════════════════════════════
```

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/dev/commands/dev-sync.md
