# Archive Readiness: user-guide-website

- **단계**: A1 `/plan-archive --dry-run`
- **스킬 계약**: `plan-archive-workflow`
- **프롬프트 출처**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#13-a1-archive-readiness`

## 판정

이번 재시작 커밋에서는 최종 archive를 수행하지 않는다.

이유는 `plan-archive-workflow`가 최종 완료/배포 결정 이후의 archive를 기대하기 때문이다. 현재는 archive readiness 증거만 남기고, 사용자가 승인하면 최종 archive를 진행한다.

## Readiness Checklist

| 점검 | 상태 | 증거 |
| --- | --- | --- |
| P1 idea | done | `.plans/ideas/20-approved/IDEA-20260527-001.md` |
| P2 screening | done | `.plans/ideas/10-screening/SCREENING-20260527-001.md` |
| P2.5 epic | done | `.plans/epics/20-active/EPIC-20260527-001/**` |
| P3 draft | done | `.plans/features/active/user-guide-website/01-draft/01-feature-draft.md` |
| P4 PRD | done | `.plans/prd/10-approved/user-guide-website-prd.md` |
| P5 wireframe | done | `.plans/wireframes/user-guide-website/**` |
| P5.5 design | done | `.plans/features/active/user-guide-website/00-context/03-design-checkpoint.md` |
| P6 stitch | done | `.plans/stitch/user-guide-website/**` |
| P7 bridge | done | `.plans/bridge/user-guide-website/**` |
| D1 dev package | done | `.plans/features/active/user-guide-website/02-package/**` |
| D2 implementation evidence | done | `.plans/features/active/user-guide-website/03-dev-notes/dev-output-summary.md` |
| Verification refresh | done | `pnpm test`, `pnpm docs:build`, protected path diff 통과 |
| Final archive move | pending | 사용자 승인 필요 |

## Archive 후보 경로

| Source | 후보 archive 위치 |
| --- | --- |
| `.plans/ideas/**IDEA-20260527-001**` | `.plans/archive/user-guide-website/sources/ideas/` |
| `.plans/epics/20-active/EPIC-20260527-001/**` | `.plans/archive/user-guide-website/sources/epic/` |
| `.plans/features/active/user-guide-website/**` | `.plans/archive/user-guide-website/sources/feature/` |
| `.plans/prd/10-approved/user-guide-website-prd.md` | `.plans/archive/user-guide-website/sources/prd/` |
| `.plans/wireframes/user-guide-website/**` | `.plans/archive/user-guide-website/sources/wireframes/` |
| `.plans/stitch/user-guide-website/**` | `.plans/archive/user-guide-website/sources/stitch/` |
| `.plans/bridge/user-guide-website/**` | `.plans/archive/user-guide-website/sources/bridge/` |
