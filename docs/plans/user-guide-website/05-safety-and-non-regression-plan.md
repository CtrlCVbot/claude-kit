# Safety and Non-Regression Plan

## Purpose

The docs website must not break existing `claude-kit` behavior.

## Protected Path Check

| Path | Expected status |
| --- | --- |
| `src/claude/**` | unchanged |
| `src/codex/**` | unchanged |
| `src/templates/**` | unchanged |
| `scripts/setup.js` | unchanged |
| `.claude/**` | unchanged |
| `.agents/**` | unchanged |
| `.codex/**` | unchanged |

## Verification Gates

| Gate | Command / Method | Required before completion |
| --- | --- | --- |
| Unit/regression tests | `pnpm test` | yes |
| Docs build | `pnpm docs:build` | yes |
| Route smoke | Local route check | yes if preview is running |
| Protected path diff | `git diff --name-only` filtered by protected paths | yes |
| Review | `.plans/features/active/user-guide-website/04-review/01-self-review.md` | yes |

## Failure Policy

| Failure | Action |
| --- | --- |
| Protected path diff appears | Stop and isolate unrelated changes |
| Build fails | Record failure and fix only docs website scope |
| Content mismatch | Update content model or docs package, not runtime source |
| Review high/critical issue | Fix before commit if local and safe |
