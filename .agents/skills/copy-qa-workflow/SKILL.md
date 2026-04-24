<!-- kit:managed source=src/codex/copy/skills/copy-qa-workflow/SKILL.md hash=007b9365b5bd0fdfe66b46b5297f3072aabcf1e5582e11e35f3e3976c05a502d -->
<!-- kit-convert generated: 2026-04-24 -->
---
name: copy-qa-workflow
description: QA 검증 파이프라인 워크플로우 가이드
---

# QA Verification Pipeline

Gap 분석 결과를 9단계로 체계적으로 검증하고, 수용 가능 여부를 판정하는 워크플로우이다.

## 9단계 검증 순서

| 단계 | 검증 항목 | 판정 기준 |
|---|---|---|
| 1 | 타이포그래피 | font-family, size, weight, line-height 일치 |
| 2 | 색상 체계 | 디자인 토큰 대비 Delta-E < 3 |
| 3 | 간격/정렬 | margin, padding 오차 4px 이내 |
| 4 | 레이아웃 구조 | Flex/Grid 방향, 순서, 래핑 일치 |
| 5 | 반응형 동작 | 3개 뷰포트(desktop, tablet, mobile) 레이아웃 확인 |
| 6 | 인터랙션 상태 | hover, focus, active, disabled 시각 피드백 |
| 7 | 애니메이션/전환 | duration, easing, 방향 일치 |
| 8 | 접근성 | 대비율, focus ring, aria 속성 |
| 9 | 엣지 케이스 | 긴 텍스트, 빈 상태, 로딩, 에러 |

단계는 순서대로 진행한다. 이전 단계에서 P0 이슈가 있으면 해당 이슈 해결 후 다음 단계로 진행한다.

## Evidence 판정 기준

각 검증 항목에 대해 세 가지 판정을 내린다:

- **PASS**: 디자인과 구현이 허용 오차 내에서 일치
- **WARN**: 미세한 차이 존재, 수용 가능하나 기록 필요
- **FAIL**: 명확한 불일치, 수정 필요

## QA 결과 스키마

검증 결과는 구조화된 형태로 기록한다:

- `featureSlug`: Feature 식별자
- `verifiedAt`: 검증 시점 (ISO 8601)
- `stages[]`: 단계별 결과
  - `stage`: 단계 번호 (1-9)
  - `name`: 검증 항목명
  - `result`: `PASS` | `WARN` | `FAIL`
  - `findings[]`: 발견 사항 목록 (gap ID 참조)
- `summary`: 전체 PASS/WARN/FAIL 카운트
- `accepted`: 수용 여부 (boolean)

## 수용 판정 기준

Feature가 수용 가능하려면 다음 조건을 모두 충족해야 한다:

- P0 이슈: 0건
- P1 이슈: 0건 (또는 명시적 예외 승인)
- 전체 9단계 FAIL: 0건
- WARN: 기록되었으나 수용 판정에 영향 없음

## 참조

- Gap 분석 입력: `copy-gap-analysis` 스킬
- 완료 처리: `copy-closeout-workflow` 스킬
- 파이프라인 전체 흐름: `copy-pipeline` 스킬

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/copy/skills/copy-qa-workflow/SKILL.md`
