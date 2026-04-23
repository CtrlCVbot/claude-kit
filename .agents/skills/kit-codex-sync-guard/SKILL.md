---
name: kit-codex-sync-guard
description: Guard workflow for Codex-facing work in this claude-kit repository. Use when modifying or reviewing `src/claude/**`, `src/codex/**`, `scripts/setup.js`, `src/pairing-registry.json`, AGENTS templates, `plugins/claude-kit/**`, `.agents/plugins/marketplace.json`, `hooks.json`, `.codex-plugin/plugin.json`, or when asked about Codex porting, Codex sync, emitter behavior, generated runtime output, plugin wiring, or where a Codex change should actually be made.
---

# Kit Codex Sync Guard

Use this skill only for Codex-facing changes in this repository. Stay out of ordinary docs edits, general application code changes, and work unrelated to Codex sync or runtime generation.

## 1. Classify the request first

Classify the task before touching files.

- Treat it as `source asset change` when the request changes authoring sources such as `src/claude/**`, `src/codex/**`, templates, or sync metadata.
- Treat it as `generated runtime inspection` when the request is about `plugins/claude-kit/**`, `AGENTS.md`, `.agents/plugins/marketplace.json`, `hooks.json`, or `.codex-plugin/plugin.json`.
- Treat it as `plugin wiring` when the request is about discovery, registration, emitted structure, runtime manifests, or why Codex sees or does not see a command, skill, or hook.

Pick the smallest class that fits. Do not widen scope unless the repo evidence forces it.

## 2. Confirm the actual source of truth

Do not trust docs alone. Read the current implementation first.

- Read `scripts/setup.js` to confirm which paths the emitter actually reads and writes.
- Read `src/pairing-registry.json` to confirm whether the relevant asset is paired, unpaired, skipped, or stale.
- Read `src/exception-registry.json` when a Codex gap might be intentional.
- Use repository docs only as supporting context after code-level confirmation.

Follow this rule strictly: actual emitter behavior wins over static documentation.

## 3. Treat generated output as generated output

Assume these are generated runtime outputs unless the task is explicitly about validating emitted results:

- `plugins/claude-kit/**`
- `AGENTS.md`
- `.agents/plugins/marketplace.json`
- `plugins/claude-kit/hooks.json`
- `plugins/claude-kit/.codex-plugin/plugin.json`

Do not edit those files as the primary fix path unless the task is inspection-only or the user explicitly asks to patch generated output for debugging. Prefer fixing the upstream source or emitter logic instead.

## 4. Decide edit location from the current emitter

Choose edit targets from the path that the current emitter really consumes, not from outdated assumptions.

- For Codex-facing skills, commands, or agents, verify that `scripts/setup.js` currently emits direct Codex surfaces from `SRC_CODEX`.
- For hooks, check `scripts/codex-hook-compat.js` and the portability metadata before deciding whether Codex uses a Codex-specific file or a Claude fallback.
- For pairing-related work, update the authoring source and the pairing metadata only when the task truly changes the asset relationship.

Important repo-specific fact:

- Some project docs describe `src/codex/` as Codex SSOT.
- The current `scripts/setup.js` implementation emits Codex direct-use and plugin `agents`, `commands`, and `skills` from `SRC_CODEX`.
- Hook handling is different: paired-direct hooks prefer `SRC_CODEX`, while explicitly compatible fallback hooks may still read `SRC_CLAUDE`.
- Therefore, use `src/codex/` as the default active edit target for Codex-facing `agents`, `commands`, and `skills`, but still check the emitter before changing behavior.

## 5. Recommend verification before closeout

Suggest the smallest relevant verification set for the change.

- Run `node scripts/codex-hook-compat.js` for hook-related changes or when Codex hook portability is in question.
- Run `node scripts/setup.js --dry-run` for emitter, runtime generation, path routing, or generated-output questions.
- Run `pnpm test` when JavaScript logic changes could affect repo behavior.
- Use targeted file inspection of emitted outputs after dry-run reasoning when the request is about discovery or registration.

If a recommended verification cannot run in the current repo, say that clearly and state what was checked instead.

## 6. Respect non-Codex boundaries

Do not activate or apply this workflow for:

- normal docs editing with no Codex runtime implication
- generic code refactors outside the Codex sync surface
- product or business logic work unrelated to plugin emission, pairing, or Codex runtime assets

If the task is mostly outside this boundary, give control back to the more relevant workflow and keep this skill's influence minimal.
