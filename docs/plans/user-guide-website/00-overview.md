# User Guide Website Pipeline Restart

## Purpose

This package documents the user-guide website work as an actual `claude-kit` pipeline execution, not as a retroactive summary.

The website itself is a secondary docs surface. The primary product remains `claude-kit`: its commands, agents, skills, hooks, rules, source layout, installer, and multi-target behavior must not regress.

## Restart Decision

The earlier planning docs and `.plans` records were archived on 2026-05-27 because they described the intended pipeline but did not fully satisfy the required skill outputs, especially the `dev-feature-plan` package structure.

This restart rebuilds the active artifacts from the pipeline order:

```text
P1 plan-idea
-> P2 plan-screen
-> P2.5 plan-epic
-> P3 plan-draft
-> P4 plan-prd
-> P5 plan-wireframe
-> P5.5 plan-design
-> P6 plan-stitch
-> P7 plan-bridge
-> D1 dev-feature
-> D2 dev-run / review
-> A1 archive readiness
```

## Stable Inputs

| Input | Role |
| --- | --- |
| `docs/user-guide-html/**` | Existing HTML reference to preserve as migration evidence |
| `src/app/**`, `src/components/docs/**`, `src/lib/docs/**` | Current Next.js implementation, treated as prototype/evidence until matched by package docs |
| `.agents/skills/**/SKILL.md` | Actual skill contracts used for this restart |
| `docs/plans/user-guide-website/_archive/2026-05-27-pipeline-restart/**` | Historical docs only |
| `.plans/_archive/2026-05-27-user-guide-website-pre-restart/**` | Historical `.plans` only |

## Active Outputs

| Output | Description |
| --- | --- |
| `.plans/ideas/**` | P1/P2 idea and screening artifacts |
| `.plans/epics/**` | P2.5 Epic scope and child features |
| `.plans/prd/**` | P4 approved PRD |
| `.plans/wireframes/**` | P5 screen, navigation, and component wireframes |
| `.plans/stitch/**` | P6 mapping and integration checkpoint |
| `.plans/bridge/**` | P7 bridge documents required by `dev-feature-plan` |
| `.plans/features/active/user-guide-website/**` | D1/D2 feature package and implementation evidence |
| `docs/plans/user-guide-website/**` | Human-readable runbook, roadmap, execution log, review, and handoff docs |

## Non-Goals

| Non-goal | Reason |
| --- | --- |
| Rewrite `src/claude`, `src/codex`, or installer internals | The website is docs-only support, not core runtime change |
| Delete the existing implementation | Current code is useful prototype evidence |
| Treat archive files as current state | Restart requires fresh active artifacts |
| Claim skill usage without evidence | Every stage log must name the skill and output |

## Reading Order

1. `06-pipeline-prompt-runbook.md`
2. `04-implementation-roadmap.md`
3. `execution-log.md`
4. `.plans/features/active/user-guide-website/02-package/00-overview.md`
5. `.plans/features/active/user-guide-website/02-package/08-dev-tasks.md`
6. `.plans/features/active/user-guide-website/03-dev-notes/dev-output-summary.md`
