---
name: "source-command-copy-visual-review"
description: "visual 갭 분석"
---

# source-command-copy-visual-review

Use this skill when the user asks to run the migrated source command `copy-visual-review`.

## Command Template

# /copy-visual-review

디자인 기준과 구현 사이의 시각적(visual) 갭을 분석하고, VF-* Gap Row를 생성한다.

## Usage

```bash
/copy-visual-review --section {section} --viewport {viewport}
```

- `--section`: 분석 대상 섹션 (예: `header`, `hero`)
- `--viewport`: 분석 뷰포트 (예: `desktop`, `mobile`)

## Preconditions

- evidence manifest가 존재한다 (`/copy-reference-refresh` 완료).
- 해당 section/viewport의 기준 캡처가 manifest에 등록되어 있다.
- **manifest.json의 `mode`가 `"full"`이어야 함** (IMP-KIT-006). `mode: "reference-only"`이면 갭 분석 불가 — 일반 모드로 `/copy-reference-refresh` 재실행 요구. `mode` 필드 미기재는 backward compat로 `full`로 간주.

## Workflow

1. evidence manifest를 로드하여 대상 section/viewport의 기준 데이터를 확인한다.
2. `copy-fidelity` 에이전트를 스폰하여 visual diff를 실행한다.
3. 발견된 차이를 VF-* Gap Row(예: `VF-HEADER-01`)로 생성한다.
4. 각 Gap Row에 priority를 분류한다 (P0/P1/P2).

## Output

- Visual Gap Board (VF-* Gap Row 목록)

## Rules

- 시나리오 A/B: QA 시점에서만 실행한다 (`/copy-verify`가 자동 체이닝).
- 시나리오 C: 기획 시점에서 독립 실행한다.
- `/copy-interaction-review`와 항상 병렬 실행 가능하다.
- evidence manifest가 없으면 `/copy-reference-refresh`를 먼저 실행하도록 안내한다.
