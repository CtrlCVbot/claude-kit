<!-- kit-convert generated: 2026-04-16 -->
---
name: dev-workflow
description: Feature Package TASK를 구조 계약 안에서 TDD로 구현한다. /dev-run에서 참조한다.
user-invocable: false
---

# Dev Workflow

이 스킬은 Feature Package의 TASK를 구현하되, 요구사항 추적과 구조 준수를 동시에 만족시키는 개발 루프를 정의한다.

## Required Reads

- `.plans/project/00-dev-architecture.md`
- `.plans/features/active/{slug}/00-context/06-architecture-binding.md`
- `02-package/01-requirements.md`
- `02-package/08-dev-tasks.md`
- `02-package/09-test-cases.md`
- `00-context/02-decision-log.md`

## Phase D1: Task Resolution

### D1.1 Load Contract

- 구조 SSOT에서 layer style, stack contract, shared policy를 읽는다.
- 기능 바인딩에서 allowed target paths, layer mapping, test path 정책을 읽는다.

### D1.2 Pick Next Task

- `pending` 상태이며 모든 선행 TASK가 끝난 항목을 선택한다.
- TASK가 가리키는 REQ와 TC를 함께 묶는다.

### D1.3 Build Task Context Bundle

Context Bundle에는 최소한 아래 항목이 있어야 한다.

- TASK id
- linked REQ ids
- linked TC ids
- linked DEC ids
- allowed target paths
- expected test paths
- layer mapping

## Phase D2: TDD Implementation

### D2.1 Red

- TC를 기준으로 테스트를 먼저 만든다.
- 테스트가 실패하는지 확인한다.

### D2.2 Green

- 기능 바인딩 안의 경로에서만 최소 구현을 작성한다.
- 구조 SSOT의 레이어 규칙을 지킨다.

### D2.3 Refactor

- 중복 제거와 이름 정리를 하되 REQ 추적과 테스트 통과 상태를 유지한다.

## Phase D3: Quality Gate

아래 게이트를 순서대로 통과시킨다.

1. Scope Guard: 바인딩 밖 경로 수정이 없는가
2. TDD Guard: 구현에 대응하는 테스트가 있는가
3. Test Run: 선택한 테스트가 통과하는가
4. Typecheck: 현재 스택 기준 정적 검사 통과 여부
5. Lint: 현재 스택 기준 린트 통과 여부
6. Traceability: TASK, REQ, TC 연결이 유지되는가

## Failure Handling

- Scope Guard 실패: 기능 바인딩 갱신 없이 구현을 계속하지 않는다.
- 구조 충돌 발견: 임시 우회보다 구조 문서 정리를 먼저 한다.
- 동일 TASK가 세 번 연속 막히면 `blocked`로 기록하고 원인을 남긴다.

## Completion

- 성공한 TASK는 `done`으로 갱신한다.
- 생성 또는 수정 파일을 TASK 기록에 남긴다.
- 모든 TASK가 끝나면 `03-dev-notes/dev-output-summary.md`를 만들고 `/dev-verify`로 넘긴다.

## Stack Notes

- TypeScript가 기본이지만 명령은 구조 SSOT의 stack contract를 따른다.
- 테스트, 타입체크, 린트 명령은 스택에 맞게 바꾸되 게이트의 의미는 유지한다.

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/dev/skills/dev-workflow/SKILL.md
