# Implementation Roadmap

## Purpose

This roadmap defines how the user-guide website work proceeds through the actual `claude-kit` pipeline.

The roadmap is intentionally pipeline-first. Existing Next.js code is treated as implementation evidence, but the canonical execution path is the `.plans` package created by the stages below.

## Protected Boundaries

| Boundary | Rule |
| --- | --- |
| `src/claude/**` | Do not modify for the docs website |
| `src/codex/**` | Do not modify for the docs website |
| `src/templates/**` | Do not modify unless a separate template task is approved |
| `scripts/setup.js` | Do not modify for the docs website |
| `.claude/**`, `.agents/**`, `.codex/**` | Treat as runtime/tooling surfaces, not website implementation targets |

## Stage Roadmap

| Stage | Skill used | Active artifact | Gate |
| --- | --- | --- | --- |
| P1 | `plan-idea-management` | `.plans/ideas/20-approved/IDEA-20260527-001.md` | Idea includes core protection and docs-surface scope |
| P2 | `plan-screening-workflow` | `.plans/ideas/10-screening/SCREENING-20260527-001.md` | Go decision with non-regression risk controls |
| P2.5 | `plan-epic-workflow` | `.plans/epics/20-active/EPIC-20260527-001/**` | Child feature map and dependency order are explicit |
| P3 | `plan-pipeline` draft step | `.plans/features/active/user-guide-website/01-draft/01-feature-draft.md` | Scope is concrete enough for PRD |
| P4 | `plan-prd-authoring` | `.plans/prd/10-approved/user-guide-website-prd.md` | 10 PRD sections and REQ IDs exist |
| P5 | `plan-wireframe-design` | `.plans/wireframes/user-guide-website/**` | SCR IDs map to REQ IDs |
| P5.5 | `claude-design-workflow` | `.plans/features/active/user-guide-website/00-context/03-design-checkpoint.md` | Design checkpoint recorded even if no external Claude Design run occurs |
| P6 | `plan-stitch-workflow` | `.plans/stitch/user-guide-website/**` | Stitch decision recorded even if Google Stitch is not used |
| P7 | Bridge contract | `.plans/bridge/user-guide-website/**` | Required bridge docs exist for `dev-feature-plan` |
| D1 | `dev-feature-plan` | `.plans/features/active/user-guide-website/02-package/**` | Package has overview, REQ, TASK, TC, release checklist |
| D2 | `dev-workflow` | `.plans/features/active/user-guide-website/03-dev-notes/dev-output-summary.md` | Current implementation is mapped to TASK/REQ/TC evidence |
| R1 | `plan-review-criteria` | `.plans/features/active/user-guide-website/04-review/**` | No high or critical open issue |
| A1 | `plan-archive-workflow` | `.plans/features/active/user-guide-website/09-archive/01-archive-readiness.md` | Archive is prepared but not finalized until deployment decision |

## Feature Breakdown

| Feature | Purpose | Status in this restart |
| --- | --- | --- |
| `docs-shell` | Next.js shell, shared layout, navigation | Covered by REQ-UGW-001 and TASK-UGW-001 |
| `planning-content-migration` | Planning command detail pages and references | Covered by REQ-UGW-002 and TASK-UGW-002 |
| `runtime-tabs-and-matrices` | Claude/Codex tabs and feature matrices | Covered by REQ-UGW-003 and TASK-UGW-003 |
| `pipeline-example-pages` | Document this pipeline execution as user-facing examples | Covered by REQ-UGW-004 and TASK-UGW-004 |
| `vercel-preview-safety` | Build and preview safety checks | Covered by REQ-UGW-005 and TASK-UGW-005 |
| `guide-sync` | Identify future docs sync targets | Covered by REQ-UGW-006 and TASK-UGW-006 |

## Execution Order

1. Rebuild planning artifacts under `.plans`.
2. Rebuild docs package under `docs/plans/user-guide-website`.
3. Compare the current implementation against the new Feature Package.
4. Record gaps as TASK status rather than silently editing the code.
5. Run verification commands.
6. Commit the pipeline restart separately from any future implementation fix.

## Completion Criteria

| Criterion | Required evidence |
| --- | --- |
| Pipeline was actually executed | `execution-log.md` includes stage, skill, prompt, artifact, verification, and review |
| Dev package is valid | `02-package/00-overview.md` through `10-release-checklist.md` exist |
| Current implementation is traceable | `03-dev-notes/dev-output-summary.md` maps routes/components/data to TASK/REQ/TC |
| Existing core is protected | Review confirms no `src/claude`, `src/codex`, `scripts/setup.js` edits |
| User can continue | Next action list is clear and file-backed |
