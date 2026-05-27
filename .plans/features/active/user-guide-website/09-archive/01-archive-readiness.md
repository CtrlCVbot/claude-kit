# Archive Readiness: user-guide-website

- **Stage**: A1 `/plan-archive --dry-run`
- **Skill contract**: `plan-archive-workflow`
- **Prompt source**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#13-a1-archive-readiness`

## Decision

Archive is **not finalized** in this restart commit.

Reason: `plan-archive-workflow` expects a final completion/deployment decision. This restart creates archive readiness evidence but keeps the feature active until the user approves final archive.

## Readiness Checklist

| Check | Status | Evidence |
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
| D2 implementation evidence | partial | `.plans/features/active/user-guide-website/03-dev-notes/dev-output-summary.md` |
| Verification refresh | done | `pnpm test`, `pnpm docs:build`, protected path diff all passed |
| Final archive move | pending | Requires approval after verification |

## Archive Candidate Paths

| Source | Candidate archive destination |
| --- | --- |
| `.plans/ideas/**IDEA-20260527-001**` | `.plans/archive/user-guide-website/sources/ideas/` |
| `.plans/epics/20-active/EPIC-20260527-001/**` | `.plans/archive/user-guide-website/sources/epic/` |
| `.plans/features/active/user-guide-website/**` | `.plans/archive/user-guide-website/sources/feature/` |
| `.plans/prd/10-approved/user-guide-website-prd.md` | `.plans/archive/user-guide-website/sources/prd/` |
| `.plans/wireframes/user-guide-website/**` | `.plans/archive/user-guide-website/sources/wireframes/` |
| `.plans/stitch/user-guide-website/**` | `.plans/archive/user-guide-website/sources/stitch/` |
| `.plans/bridge/user-guide-website/**` | `.plans/archive/user-guide-website/sources/bridge/` |
