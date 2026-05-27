# EPIC-20260527-001: claude-kit user-guide website

- **Status**: active
- **Parent idea**: `IDEA-20260527-001`
- **Created**: 2026-05-27
- **Prompt source**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#3-p25-plan-epic`

## Goal

Provide a Next.js documentation website for the existing `docs/user-guide-html/**` guide and use the implementation process itself as a visible `claude-kit` pipeline example.

## Why Epic Is Needed

This satisfies the Epic activation criteria:

| Criterion | Match |
| --- | --- |
| 3+ related features | Six child features are required |
| Cross-cutting requirements | Protected path guard, build safety, content parity, accessibility |
| Explicit sequencing | Shell before content, content before example polish, build safety before handoff |

## Scope

| In scope | Out of scope |
| --- | --- |
| Next.js docs routes | Production Vercel deployment |
| Planning command detail pages | Core command/agent/skill behavior changes |
| Pipeline example pages | Installer changes |
| Build/link/protected-path verification | `src/claude` or `src/codex` runtime changes |

## Success Metrics

| Metric | Target |
| --- | --- |
| Main docs routes | Home, planning index, command pages, lifecycle, reference, examples |
| Pipeline traceability | Every stage has a file-backed artifact |
| Build | `pnpm docs:build` passes |
| Non-regression | No protected path edits |

## Key Risks

| Risk | Mitigation |
| --- | --- |
| Pipeline documentation becomes performative | Require skill, prompt, artifact, verification, review per stage |
| Website work touches core runtime | Protected path review and diff check |
| HTML content gets lost | Use HTML inventory and route/source mapping |
| Next.js build affects package consumers | Keep docs scripts explicit and do not alter postinstall behavior |
