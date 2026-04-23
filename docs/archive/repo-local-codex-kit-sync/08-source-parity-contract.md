# Source parity contract

> **Status**: Archived draft plan (`docs/archive`, moved from `docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23

이 문서는 `src/claude/**`와 `src/codex/**`의 asset type별 매칭 계약입니다. `kit-analyze`, `kit-sync`, `kit-sync-agent`, `scripts/setup.js`는 이 저장소 안에서 이 계약을 기준으로 동작해야 합니다. 설치된 소비자 프로젝트 안에서 sync를 실행하는 계약이 아닙니다.

## 1. 공통 규칙

- 모든 Claude source asset은 Codex target strategy를 가져야 합니다.
- target strategy는 `paired-direct`, `paired-fallback`, `paired-review`, `blocked` 중 하나입니다.
- direct target이 source file이면 `src/codex/**` 아래에 있어야 합니다.
- fallback target이면 template/docs/skill reference 등 source-controlled artifact가 있어야 합니다.
- generated output은 parity 판단의 source가 아닙니다.
- `.claude/commands/kit-*`, `.claude/agents/kit-sync-agent.md`, `.claude/skills/kit-*`는 repo-maintenance toolchain이며 product parity asset이 아닙니다.
- `src/codex/kit/**` domain은 만들지 않습니다.

## 2. asset type 계약

| Type | Claude source | Codex source/fallback | Primary output |
|------|---------------|-----------------------|----------------|
| skill | `src/claude/<domain>/skills/<name>/SKILL.md` | `src/codex/<domain>/skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md`, plugin skill |
| command | `src/claude/<domain>/commands/<name>.md` | `src/codex/<domain>/skills/<name>/SKILL.md` 우선, 필요 시 `src/codex/<domain>/commands/<name>.md` | `.agents/skills/**`, plugin command |
| agent | `src/claude/<domain>/agents/<name>.md` | `src/codex/<domain>/agents/<name>.md` 또는 toml emitter source | `.codex/agents/*.toml`, plugin agent |
| hook | `src/claude/<domain>/hooks/<name>.js` | `src/codex/<domain>/hooks/<name>.js` 또는 fallback skill/docs | hook output 또는 fallback docs |
| rule | `src/claude/<domain>/rules/<name>.md` | `src/templates/AGENTS.md.template` inline guidance, 일부 rules policy candidate | `AGENTS.md` |
| agent-memory | `.claude/agent-memory/<agent>/*.md` 또는 source 후보 | skill references/docs | `.agents/skills/**/references` |

## 3. kit maintenance toolchain boundary

`kit-sync` 관련 도구는 일반 기능 자산과 다릅니다. 현재 `src/claude/kit/**` domain이 없고, `src/codex/kit/**`도 만들지 않습니다. Claude Code용 kit toolchain은 `.claude/` 아래에 존재하며, 이 저장소의 maintenance 도구로만 다룹니다.

| Maintenance source | 처리 방식 |
|------|------|
| `.claude/agents/kit-sync-agent.md` | repo-maintenance orchestration 참고. Codex product agent로 emit하지 않음 |
| `.claude/skills/kit-converter/**` | conversion rule 참고. Codex product skill로 emit하지 않음 |
| `.claude/skills/kit-scaffolding/**` | scaffold template 참고. Codex product skill로 emit하지 않음 |
| `.claude/skills/kit-validation/**` | validation schema 참고. Codex product skill로 emit하지 않음 |
| `.claude/commands/kit-*.md` | maintenance entry flow 참고. Codex product command/skill로 emit하지 않음 |

이 경계는 kit toolchain 자체에만 적용합니다. 일반 `dev`, `plan`, `copy`, `core` 자산은 계속 `src/claude/**`와 `src/codex/**` parity 계약을 따릅니다.

## 4. command transition contract

| State | Required evidence |
|------|-------------------|
| `command-primary` | `src/codex/**/commands/*.md` paired entry |
| `skill-primary` | `src/codex/**/skills/**/SKILL.md` primary entry |
| `dual-output` | command path와 skill path가 모두 registry/metadata에 연결 |
| `command-wrapper` | command가 linked skill을 안내/호출하는 wrapper임을 명시 |
| `deprecated-command` | backward compatibility 사유와 removal plan |

command transition은 registry `status`를 대체하지 않습니다. `status`는 pairing 관계를 표현하고, `transitionState`는 command workflow의 현재 노출 방식을 표현합니다.

## 5. status contract

`kit-analyze` report status와 persistent registry status는 분리합니다. `metadata-drift`나 `generated-mismatch`를 `src/pairing-registry.json`의 `status`에 직접 쓰면 기존 audit 흐름과 충돌합니다.

### 5.1 target strategy

| Strategy | Required evidence |
|------|-------------------|
| `paired-direct` | Claude source, Codex source, registry entry, optional official surface |
| `paired-fallback` | Claude source, fallback artifact, exception/portability rationale |
| `paired-review` | Claude source, review reason, owner/next action |
| `blocked` | Claude source, blocked reason, user decision needed |

### 5.2 analysis status

| Analysis status | Required evidence |
|------|-------------------|
| `missing` | Claude source exists, no Codex source/fallback |
| `drift` | paired source exists but content/metadata meaning diverges |
| `generated-mismatch` | source is correct but install output differs |
| `metadata-drift` | source exists but registry/portability metadata is stale |

### 5.3 persistent registry status

| Registry status | Required evidence |
|------|-------------------|
| `paired` | Claude source and Codex source/fallback relationship exists |
| `codex-skip` | Codex target intentionally skipped with reason |
| `codex-native-only` | Codex source exists without Claude source |
| `unpaired` | source exists but pairing decision has not been made |

## 6. registry v2 contract

`pairing-registry-v2`는 이미 `src/pairing-registry.json`과 validation schema에 적용되어 있습니다. 이 archived plan의 후속 해석은 "v2를 새로 도입"이 아니라 "v2 필드가 audit/report/install 판단에서 일관되게 쓰이도록 안정화"입니다. v2는 기존 relationship field를 유지하면서 command transition metadata를 추가합니다.

| Field | Type | Applies to | Meaning |
|------|------|------------|---------|
| `codex` | string or null | all | Existing Codex source path, usually command/agent/hook/skill path |
| `codexSkill` | string or null | command | Linked Codex skill source path when a command becomes skill-backed |
| `primaryCodex` | `command` / `skill` / `agent` / `hook` / `fallback` / `none` | all | Which Codex source/fallback is the primary user-facing target |
| `transitionState` | command transition enum or null | command | `command-primary`, `skill-primary`, `dual-output`, `command-wrapper`, `deprecated-command` |
| `driftStatus` | null / `content-drift` / `metadata-drift` / `generated-mismatch` | all | Last known non-pairing drift state from analyze |

Current and migration rules:

- Existing `type=command`, `status=paired` entries should remain or be normalized as `transitionState: "command-primary"`, `primaryCodex: "command"`, `codexSkill: null`.
- When a command is first converted to a skill, keep the existing `codex` command path and add `codexSkill`, `transitionState: "dual-output"`, `primaryCodex: "skill"` only after review.
- When a command is reduced to a wrapper, keep `codex` as wrapper path and set `transitionState: "command-wrapper"`.
- When command output is removed, set `transitionState: "skill-primary"`, keep `codexSkill`, and require a removal note or compatibility issue.
- `metadata-drift` updates portability/registry metadata first. It must not trigger source regeneration by itself.
- `audit-pairing`, `audit-drift`, docs generation, and validation scripts must treat v2 fields as known fields and must not recreate a separate v1/v2 migration plan.

`src/pairing-registry.json` should track asset identity, type, domain, persistent registry status, Claude path, Codex path, and optional linked Codex skill path. `src/exception-registry.json` should track intentional fallback, blocked, or review decisions. `src/claude/_meta/codex-portability.json` should explain official surface, evidence level, constraints, and fallback target.

## 7. `kit-analyze` required columns

| Column | Meaning |
|------|---------|
| `identity` | asset identity |
| `type` | skill/command/agent/hook/rule/agent-memory |
| `domain` | core/dev/plan/copy |
| `claudeSource` | source path |
| `codexCommand` | Codex command source path, if any |
| `codexSkill` | linked Codex skill source path, if any |
| `codexTarget` | primary source or fallback target |
| `strategy` | direct/fallback/review/blocked |
| `registryStatus` | paired/codex-skip/codex-native-only/unpaired |
| `analysisStatus` | paired/missing/drift/generated-mismatch/metadata-drift |
| `officialSurface` | Codex official feature if relevant |
| `installOutput` | direct-use/plugin/both/none |
| `verification` | required command/check |
| `transitionState` | command-primary/skill-primary/dual-output/command-wrapper/deprecated-command, if command |

## 8. non-goals

- `plugins/claude-kit/**`를 source로 삼지 않는다.
- generated `AGENTS.md`를 source로 삼지 않는다.
- Codex hooks experimental feature를 모든 hook의 필수 runtime으로 보지 않는다.
- Claude Code command를 Codex slash command로 1:1 복제하지 않는다.
- `src/codex/kit/**` domain을 만들지 않는다.
- `kit-sync-agent`나 `kit-*` commands를 소비자 프로젝트에 Codex agent/skill/command로 설치하지 않는다.
- 설치된 소비자 프로젝트 안에서 `kit-sync`를 실행하는 workflow를 만들지 않는다.
