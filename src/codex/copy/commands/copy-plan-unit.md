<!-- kit-convert generated: 2026-04-17 -->
<!-- REVIEW NEEDED: complex command -->
# copy-plan-unit — Codex Entry Flow

갭 Row를 실행 단위 계획으로 전환. 시나리오 C 전용.

## Overview

Gap Board의 개별 Row를 실행 단위(execution unit) 계획으로 전환한다. 시나리오 C 전용.

## Invocation

```
copy-plan-unit VF-HEADER-01
copy-plan-unit IF-MENU-01
```

## Parameters

- 인자: Gap Row ID (VF-* 또는 IF-* 형식)

## Preconditions

- Prioritized Gap Board가 존재한다 (`copy-gap-board` 완료).
- 지정된 Gap Row ID가 보드에 등록되어 있다.
- 시나리오 C 컨텍스트에서 실행한다.

## Workflow

1. 지정된 Gap Row를 Gap Board에서 로드한다.
2. 실행 단위 계획을 작성한다.
   - **Purpose**: 이 단위가 해결하는 갭 설명
   - **Tasks**: 구체적 작업 목록
   - **Preconditions**: 선행 조건
   - **Deliverables**: 산출물 목록
   - **Completion Criteria**: 완료 판정 기준
3. Story ID를 부여한다: `S-{AREA}-{NN}` (예: `S-HEADER-01`).

## Output

- Execution Unit Plan (Story ID 포함)

## Rules

- 시나리오 C에서만 사용한다. 시나리오 A/B에서는 실행을 거부한다.
- 하나의 Gap Row는 하나의 Story에 매핑한다 (1:1).
- 복수 Gap Row를 묶어야 하면 사용자 확인 후 진행한다.
- Story ID는 기존 ID와 중복되지 않아야 한다.

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/copy/commands/copy-plan-unit.md
