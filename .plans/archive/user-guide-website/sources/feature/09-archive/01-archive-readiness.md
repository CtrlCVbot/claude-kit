# Archive Readiness: user-guide-website

- **단계**: A1 `/plan-archive --dry-run`
- **스킬 계약**: `plan-archive-workflow`
- **프롬프트 출처**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#13-a1-archive-readiness`

## 판정

최종 archive 실행 준비가 완료됐다.

`R2` route gap review와 `F1` focused fix를 거쳐 medium 이상 gap이 해소됐고, `V1` verification refresh가 통과했다. 다음 단계는 `plan-archive-workflow` 기준으로 active 산출물을 archive package로 이동하는 것이다.

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
| Verification refresh | done | `pnpm test`, `pnpm docs:build`, `pnpm check:docs`, route smoke, protected path diff 통과 |
| Route gap review | done | `.plans/features/active/user-guide-website/04-review/03-route-gap-review-results.md` |
| Final archive move | approved | 사용자 요청에 따라 순차 진행 승인 |

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
