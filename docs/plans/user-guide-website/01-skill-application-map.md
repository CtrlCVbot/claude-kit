# Skill Application Map

## Purpose

This document records which skill was used for each stage and what output shape was required.

## Skill Map

| Stage | Skill | Required output | Active artifact |
| --- | --- | --- | --- |
| P1 | `plan-idea-management` | IDEA file + backlog row | `.plans/ideas/20-approved/IDEA-20260527-001.md` |
| P2 | `plan-screening-workflow` | Screening file + screening matrix | `.plans/ideas/10-screening/SCREENING-20260527-001.md` |
| P2.5 | `plan-epic-workflow` | Epic brief + children features | `.plans/epics/20-active/EPIC-20260527-001/**` |
| P3 | `plan-pipeline` draft step | First-pass draft | `.plans/features/active/user-guide-website/01-draft/01-feature-draft.md` |
| P4 | `plan-prd-authoring` | 10-section PRD with REQ IDs | `.plans/prd/10-approved/user-guide-website-prd.md` |
| P5 | `plan-wireframe-design` | Screens, navigation, components | `.plans/wireframes/user-guide-website/**` |
| P5.5 | `claude-design-workflow` | Design checkpoint | `.plans/features/active/user-guide-website/00-context/03-design-checkpoint.md` |
| P6 | `plan-stitch-workflow` | Mapping, context, validation | `.plans/stitch/user-guide-website/**` |
| P7 | Bridge contract | Wireframe, stitch, context handoff | `.plans/bridge/user-guide-website/**` |
| D1 | `dev-feature-plan` | Architecture-bound Feature Package | `.plans/features/active/user-guide-website/02-package/**` |
| D2 | `dev-workflow` | TASK/REQ/TC implementation evidence | `.plans/features/active/user-guide-website/03-dev-notes/dev-output-summary.md` |
| R1 | `plan-review-criteria` | Review report and PCC checks | `.plans/features/active/user-guide-website/04-review/01-self-review.md` |
| A1 | `plan-archive-workflow` | Archive readiness or archive bundle | `.plans/features/active/user-guide-website/09-archive/01-archive-readiness.md` |

## Correction From Previous Pass

The previous pass treated some skills as conceptual references. This restart treats them as output contracts.

The biggest correction is D1: `dev-feature-plan` requires architecture SSOT, feature architecture binding, PRD freeze, decision log, and `02-package/00` through `10`.
