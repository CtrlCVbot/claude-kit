# Handoff: user-guide-website

## Current State

The user-guide website pipeline has been restarted and documented through archive readiness.

The current Next.js implementation is mapped as evidence, but the verification refresh still decides whether code follow-up is needed.

## Immediate Follow-Up

| Priority | Action | Reason |
| --- | --- | --- |
| 1 | Run `pnpm test` | Existing package regression check |
| 2 | Run `pnpm docs:build` | Next.js docs build check |
| 3 | Run protected path diff | Confirm website work did not touch runtime assets |
| 4 | Update release checklist statuses | Keep package evidence current |
| 5 | Decide final archive vs active follow-up | Archive only after verification and approval |

## Later Follow-Up

| Target | Follow-up |
| --- | --- |
| `docs/guide/**` | Sync user-facing guide references after website docs stabilize |
| `docs/meta-tooling/**` | Reference the website as an example only after validation |
| `README.md` | Add website docs link after preview/deploy decision |
| Vercel | Preview setup after local build passes |
