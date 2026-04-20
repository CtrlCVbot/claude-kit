<!-- kit-convert generated: 2026-04-17 -->
<!-- REVIEW NEEDED: complex command -->
# copy-interaction-review — Codex Entry Flow

interaction state 갭 분석.

## Overview

디자인 기준과 구현 사이의 인터랙션 상태(interaction state) 갭을 분석하고, IF-* Gap Row를 생성한다.

## Invocation

```
copy-interaction-review --section {section} --viewport {viewport}
```

## Parameters

- `--section`: 분석 대상 섹션 (예: `menu`, `form`)
- `--viewport`: 분석 뷰포트 (예: `desktop`, `mobile`)

## Preconditions

- evidence manifest가 존재한다 (`copy-reference-refresh` 완료).
- 해당 section/viewport의 기준 캡처가 manifest에 등록되어 있다.
- **manifest.json의 `mode`가 `"full"`이어야 함** (IMP-KIT-006). `mode: "reference-only"`이면 갭 분석 불가 — 일반 모드로 `copy-reference-refresh` 재실행 요구. `mode` 필드 미기재는 backward compat로 `full`로 간주.

## Workflow

1. evidence manifest를 로드하여 대상 section/viewport의 인터랙션 기준을 확인한다.
2. `copy-interaction-fidelity` 에이전트를 스폰하여 interaction state diff를 실행한다.
3. 발견된 차이를 IF-* Gap Row(예: `IF-MENU-01`)로 생성한다.
4. 각 Gap Row에 priority를 분류한다 (P0/P1/P2).

## Output

- Interaction Gap Board (IF-* Gap Row 목록)

## Rules

- 시나리오 A/B: QA 시점에서만 실행한다 (`copy-verify`가 자동 체이닝).
- 시나리오 C: 기획 시점에서 독립 실행한다.
- `copy-visual-review`와 항상 병렬 실행 가능하다.
- hover, focus, active, disabled 등 모든 인터랙션 상태를 포함한다.

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/copy/commands/copy-interaction-review.md
