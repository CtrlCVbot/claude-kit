# Bridge Context: user-guide-website

- **Stage**: P7 `/plan-bridge`
- **Prompt source**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#9-p7-plan-bridge`

## Development Handoff

Implement or verify the user-guide website against the approved PRD and package structure.

## Allowed Target Paths

| Path | Purpose |
| --- | --- |
| `src/app/**` | Next.js routes |
| `src/components/docs/**` | Docs UI components |
| `src/lib/docs/**` | Static docs content and navigation models |
| `docs/plans/user-guide-website/**` | Pipeline docs and execution logs |
| `.plans/**` | Pipeline artifacts |
| `package.json`, `next.config.mjs`, `tsconfig.json` | Docs build/runtime config |

## Protected Paths

Do not change:

- `src/claude/**`
- `src/codex/**`
- `src/templates/**`
- `scripts/setup.js`
- `.claude/**`
- `.agents/**`
- `.codex/**`

## Task Split

| Task | Requirement |
| --- | --- |
| TASK-UGW-001 | REQ-UGW-001 |
| TASK-UGW-002 | REQ-UGW-002 |
| TASK-UGW-003 | REQ-UGW-003 |
| TASK-UGW-004 | REQ-UGW-004 |
| TASK-UGW-005 | REQ-UGW-005 |
| TASK-UGW-006 | REQ-UGW-006 |

## Verification Handoff

Run or record:

1. `pnpm docs:build`
2. Route smoke for primary docs pages
3. Protected path diff check
4. Review against `.plans/features/active/user-guide-website/02-package/`
