# Project Development Architecture SSOT

## Purpose

This file is the architecture source of truth required before `/dev-feature` can create a Feature Package.

## Structure Mode

`hybrid-docs-app`

The repository remains an npm package / toolkit first. The Next.js app is a documentation surface inside the same repository.

## Stack Contract

| Layer | Stack |
| --- | --- |
| App router | Next.js `src/app/**` |
| UI components | React components under `src/components/docs/**` |
| Content model | Static TypeScript data under `src/lib/docs/**` |
| Styling | `src/app/globals.css` plus component-level class usage |
| Verification | `pnpm test`, `pnpm docs:build`, route smoke, protected path diff |

## Shared-vs-Local Rule

| Rule | Decision |
| --- | --- |
| Docs-only UI | Keep under `src/components/docs/**` |
| Website content data | Keep under `src/lib/docs/**` |
| Runtime kit assets | Keep separate under `src/claude/**`, `src/codex/**`, `src/templates/**` |
| Generated outputs | Do not edit as source of truth |

## Protected Runtime Boundaries

Website work must not modify:

- `src/claude/**`
- `src/codex/**`
- `src/templates/**`
- `scripts/setup.js`
- `.claude/**`
- `.agents/**`
- `.codex/**`

## Allowed Documentation App Paths

- `src/app/**`
- `src/components/docs/**`
- `src/lib/docs/**`
- `docs/plans/user-guide-website/**`
- `.plans/**`
- `package.json`
- `next.config.mjs`
- `tsconfig.json`
- `next-env.d.ts`
