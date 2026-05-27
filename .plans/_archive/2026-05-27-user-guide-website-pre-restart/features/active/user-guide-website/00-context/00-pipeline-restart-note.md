# Pipeline Restart Note: user-guide-website

- **Feature ID**: `user-guide-website`
- **Epic**: `EPIC-20260527-001`
- **Parent idea**: `IDEA-20260527-001`
- **Restart date**: 2026-05-27
- **Reason**: 이전 진행은 Next.js 구현과 검증까지 완료했지만, `claude-kit` 파이프라인 기준의 P3 이후 `.plans` 산출물이 누락되었다.

## 재시작 원칙

이번 재시작은 기존 커밋과 구현을 삭제하지 않는다. 이미 만들어진 Next.js 문서 사이트는 prototype/evidence로 보존하고, 공식 진행 기록은 `.plans/features/active/user-guide-website/` 아래에 P3부터 P7, D1, D2, Review, Archive readiness까지 빠짐없이 남긴다.

## 이미 존재하는 기준 산출물

| 단계 | 산출물 | 상태 |
| --- | --- | --- |
| P1 `/plan-idea` | `.plans/ideas/20-approved/IDEA-20260527-001.md` | 완료 |
| P2 `/plan-screen` | `.plans/ideas/10-screening/SCREENING-20260527-001.md` | 완료 |
| P2.5 `/plan-epic` | `.plans/epics/20-active/EPIC-20260527-001/00-epic-brief.md` | 완료 |
| P2.5 children | `.plans/epics/20-active/EPIC-20260527-001/01-children-features.md` | 완료 |
| Feature brief | `.plans/features/briefs/*.md` | 완료 |

## 이번 canonical run에서 반드시 생성할 산출물

| 단계 | 파일 |
| --- | --- |
| P3 `/plan-draft` | `01-draft/01-feature-draft.md` |
| P4 `/plan-prd` | `02-prd/01-prd.md` |
| P5 `/plan-wireframe` | `03-wireframe/01-wireframe.md` |
| P5.5 `/plan-design` | `04-design/01-design-checkpoint.md` |
| P6 `/plan-stitch` | `05-stitch/01-stitch-decision.md` |
| P7 `/plan-bridge` | `06-bridge/01-dev-handoff.md` |
| D1 `/dev-feature` | `07-dev/01-feature-package.md` |
| D2 `/dev-run` | `07-dev/02-implementation-log.md` |
| Review | `08-review/01-plan-review.md`, `08-review/02-dev-review.md` |
| Archive readiness | `09-archive/01-archive-readiness.md` |

