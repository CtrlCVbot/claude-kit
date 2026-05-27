# Feature Draft: user-guide-website

- **Stage**: P3 `/plan-draft`
- **Input**: `IDEA-20260527-001`, `EPIC-20260527-001`
- **Prompt source**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#4-p3-plan-draft`

## One-Line Summary

Turn the existing HTML guide into a maintainable Next.js documentation website while preserving `claude-kit` core behavior and documenting the full pipeline as an example.

## Primary Users

| User | Need |
| --- | --- |
| New `claude-kit` user | Understand planning and development commands quickly |
| Maintainer | Verify that docs website changes do not touch core runtime |
| Claude/Codex user | Compare how pipeline concepts map across runtimes |

## User Flow

1. User opens the docs website.
2. User reads the overview and planning pipeline.
3. User drills into a command page such as `/plan-idea` or `/plan-epic`.
4. User switches Claude/Codex tabs where relevant.
5. User opens lifecycle/reference/example pages for deeper process details.

## Route Impact

| Route | Purpose |
| --- | --- |
| `/` | Overview and entry points |
| `/planning` | Planning pipeline map |
| `/planning/[slug]` | Command detail pages |
| `/planning/lifecycle` | Artifact lifecycle |
| `/planning/reference` | Reference and rules |
| `/examples/[slug]` | Pipeline execution examples |

## Protected Boundaries

Do not modify `src/claude/**`, `src/codex/**`, `src/templates/**`, `scripts/setup.js`, `.claude/**`, `.agents/**`, or `.codex/**` for this feature.

## Draft Decision

Proceed to Standard PRD because the work has multiple routes, content models, UI components, and verification gates.
