# PRD: user-guide-website

- **Stage**: P4 `/plan-prd`
- **Status**: approved
- **Input draft**: `.plans/features/active/user-guide-website/01-draft/01-feature-draft.md`
- **Prompt source**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#5-p4-plan-prd`

## 1. Overview

The user-guide website converts `docs/user-guide-html/**` into a Next.js documentation site. It must also explain the website build process as a real `claude-kit` pipeline example.

The site is not a replacement for `claude-kit` runtime assets. It is a documentation surface that makes existing planning and development workflows easier to learn.

## 2. Problem Statement

The existing HTML guide is useful but is difficult to extend as a structured website. It also does not fully show how the `claude-kit` pipeline is used from idea to implementation.

The previous implementation pass created useful code and docs, but the pipeline artifacts were partially retroactive. This PRD fixes that by requiring traceable `.plans` outputs.

## 3. Goals & Non-Goals

| Goals | Non-Goals |
| --- | --- |
| Provide a Next.js docs website | Change `claude-kit` core commands |
| Preserve HTML reference content | Change installer behavior |
| Explain planning pipeline commands in detail | Deploy to production automatically |
| Record the project as a pipeline example | Replace source guide docs as SSOT |
| Verify protected paths are untouched | Modify Claude/Codex source assets |

## 4. User Stories

| ID | Story |
| --- | --- |
| US-UGW-001 | As a new user, I want a structured docs website so that I can learn the planning pipeline step by step. |
| US-UGW-002 | As a maintainer, I want route and artifact mapping so that I can verify content migration without losing information. |
| US-UGW-003 | As a Claude/Codex user, I want runtime-specific explanations so that I do not confuse commands, skills, subagents, and docs surfaces. |
| US-UGW-004 | As a contributor, I want the website build process documented as an example so that I can repeat the pipeline correctly. |

## 5. Functional Requirements

| REQ-ID | Priority | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| REQ-UGW-001 | Must | Provide a docs shell with home, navigation, and consistent page layout | Home and planning routes render with shared shell |
| REQ-UGW-002 | Must | Convert planning guide content into route-backed docs pages | Planning index, lifecycle, reference, and command pages exist |
| REQ-UGW-003 | Must | Show Claude/Codex differences using tabs or matrices where relevant | Runtime tabs are keyboard-readable and not copy-only |
| REQ-UGW-004 | Must | Add pipeline example pages based on this restart | Example pages reference `.plans` and `docs/plans` artifacts |
| REQ-UGW-005 | Must | Provide build and protected path verification | `pnpm docs:build` passes and protected path diff is documented |
| REQ-UGW-006 | Should | Record follow-up sync targets for guide/meta-tooling docs | Handoff doc lists follow-up files and reasons |

## 6. UX Requirements

| UX ID | Requirement |
| --- | --- |
| UX-UGW-001 | The first screen must feel like docs, not a marketing landing page |
| UX-UGW-002 | Planning command pages must support deep reading with sections, tables, and artifact paths |
| UX-UGW-003 | Claude/Codex comparisons must use real tab UI where both runtimes are shown |
| UX-UGW-004 | Mobile layout must keep navigation usable without hiding essential content |

## 7. Technical Considerations

| Area | Decision |
| --- | --- |
| Framework | Next.js app router under `src/app` |
| Data model | Static TypeScript content in `src/lib/docs` |
| UI | Reusable docs components in `src/components/docs` |
| Build | `pnpm docs:build` |
| Protected paths | No website task may edit runtime source paths |

## 8. Milestones

| Milestone | Description |
| --- | --- |
| M1 | Rebuild pipeline docs and `.plans` artifacts |
| M2 | Verify implementation against Feature Package |
| M3 | Fix any package/code mismatch in a follow-up change |
| M4 | Run build, route smoke, and protected path checks |
| M5 | Prepare archive readiness and handoff |

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Runtime source regression | High | Protected path diff check |
| Pipeline artifact drift | High | Stage-by-stage execution log |
| Content loss | Medium | HTML inventory and route mapping |
| Build failure | Medium | `pnpm docs:build` gate |
| Scope creep into deployment | Medium | Preview-only decision |

## 10. Success Metrics

| Metric | Target |
| --- | --- |
| Route coverage | Home, planning, command details, lifecycle, reference, examples |
| Package completeness | `02-package/00` through `10` exist |
| Verification | Build and docs checks recorded |
| Review | No open high/critical issue |
| Traceability | REQ -> TASK -> TC mapping exists |
