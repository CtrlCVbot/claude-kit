# Design Checkpoint: user-guide-website

- **단계**: P5.5 `/plan-design`
- **프롬프트 출처**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#7-p55-plan-design`

## 결정

기존 HTML guide의 시각 방향은 참고하되, Next.js 사이트는 landing page가 아니라 docs-first interface로 구현한다.

## Claude Design 사용 여부

| 항목 | 결정 |
| --- | --- |
| 외부 Claude Design 실행 | 이번 재시작에서는 필요 없음 |
| 이유 | 새 visual identity보다 문서 구조와 증거 복구가 목적이다. |
| 필수 기록 | P5.5를 생략하지 않기 위해 checkpoint를 남긴다. |

## UI 원칙

| 원칙 | 적용 |
| --- | --- |
| Docs-first | 긴 설명, 표, command reference, artifact path를 읽기 쉽게 만든다. |
| Runtime clarity | Claude/Codex 차이를 tab 또는 matrix로 보여준다. |
| Calm visual style | marketing-heavy hero보다 문서형 구조를 우선한다. |
| Accessibility | tab, link, table이 모바일에서도 읽혀야 한다. |

## P6 Handoff

`/plan-stitch`는 PRD 요구사항, wireframe screen, 현재 HTML/Next prototype 구조를 비교한다. 외부 visual asset은 필요하지 않다.
