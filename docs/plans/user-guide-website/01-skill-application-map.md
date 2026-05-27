# 스킬 적용 맵

## 목적

이 문서는 이번 재시작에서 어떤 `claude-kit` 스킬을 어떤 단계에 적용했고, 각 스킬이 요구한 산출물 모양이 무엇이었는지 정리한다.

## 단계별 스킬과 산출물

| 단계 | 사용 스킬 | 필요한 산출물 | 활성 산출물 |
| --- | --- | --- | --- |
| P1 | `plan-idea-management` | IDEA 파일, backlog 행 | `.plans/ideas/20-approved/IDEA-20260527-001.md` |
| P2 | `plan-screening-workflow` | screening 파일, screening matrix | `.plans/ideas/10-screening/SCREENING-20260527-001.md` |
| P2.5 | `plan-epic-workflow` | Epic brief, children features | `.plans/epics/20-active/EPIC-20260527-001/**` |
| P3 | `plan-pipeline` draft 단계 | 1차 feature draft | `.plans/features/active/user-guide-website/01-draft/01-feature-draft.md` |
| P4 | `plan-prd-authoring` | 10개 섹션 PRD, `REQ-ID` | `.plans/prd/10-approved/user-guide-website-prd.md` |
| P5 | `plan-wireframe-design` | 화면, 내비게이션, 컴포넌트 문서 | `.plans/wireframes/user-guide-website/**` |
| P5.5 | `claude-design-workflow` | 디자인 checkpoint | `.plans/features/active/user-guide-website/00-context/03-design-checkpoint.md` |
| P6 | `plan-stitch-workflow` | mapping, context, validation | `.plans/stitch/user-guide-website/**` |
| P7 | bridge 계약 | wireframe, stitch, 개발 context | `.plans/bridge/user-guide-website/**` |
| D1 | `dev-feature-plan` | 구조 계약 기반 기능 패키지 | `.plans/features/active/user-guide-website/02-package/**` |
| D2 | `dev-workflow` | `TASK/REQ/TC` 구현 증거 | `.plans/features/active/user-guide-website/03-dev-notes/dev-output-summary.md` |
| R1 | `plan-review-criteria` | 리뷰 리포트, PCC 점검 | `.plans/features/active/user-guide-website/04-review/01-self-review.md` |
| A1 | `plan-archive-workflow` | archive readiness 또는 archive bundle | `.plans/features/active/user-guide-website/09-archive/01-archive-readiness.md` |

## 이전 패스와 달라진 점

이전 패스에서는 일부 스킬을 “참고 개념”처럼 다뤘다. 이번 재시작에서는 각 스킬을 산출물 계약으로 적용했다.

가장 큰 수정은 D1이다. `dev-feature-plan`은 architecture SSOT, feature architecture binding, PRD freeze, decision log, `02-package/00~10` 문서를 요구한다. 이번 산출물은 그 구조를 맞춘다.
