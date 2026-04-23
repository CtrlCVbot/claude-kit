# Installation output contract

> **Status**: Draft plan (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23

이 문서는 `claude-kit`가 소비자 프로젝트에 설치될 때 Codex target이 active이면 생성되어야 하는 output 계약입니다. 핵심은 plugin output과 direct-use output을 분리하되, 둘 다 같은 `src/codex/**` source에서 파생되게 하는 것입니다. 설치된 소비자 프로젝트 안에서 `kit-sync`를 실행하는 계약이 아닙니다.

## 1. 현재 output

현재 `scripts/setup.js`는 Codex target에 대해 주로 다음을 생성합니다.

| Output | 현재 경로 | 성격 |
|------|-----------|------|
| plugin root | `plugins/claude-kit/**` | plugin generated output |
| plugin manifest | `plugins/claude-kit/.codex-plugin/plugin.json` | generated output |
| marketplace | `.agents/plugins/marketplace.json` | generated/merged output |
| hooks manifest | `plugins/claude-kit/hooks.json` | generated output |
| project guidance | `AGENTS.md` | template-generated/preserved output |

문제는 사용자가 원하는 "설치된 프로젝트에서 바로 Codex agent/skill을 쓰는 direct-use output"이 plugin output과 분리되어 있지 않다는 점입니다. 단, `kit-sync-agent`와 `.claude/commands/kit-*` maintenance toolchain은 설치 output에 포함하지 않습니다.

## 2. 목표 output

Codex target active 시 설치는 다음 output을 생성해야 합니다.

| Output | Target path | Source | Required |
|------|-------------|--------|----------|
| repo-local skills | `.agents/skills/**` | `src/codex/**/skills/**` | yes |
| repo-local agents | `.codex/agents/*.toml` | `src/codex/**/agents/**` + emitter | yes |
| project instructions | `AGENTS.md` | `src/templates/AGENTS.md.template` | yes |
| hook fallback docs | docs or skill references | `src/codex/**/hooks/**`, portability metadata | yes for fallback |
| Codex hooks config | `.codex/hooks.json` | hook source + portability | optional, gated |
| plugin output | `plugins/claude-kit/**` | `src/codex/**` | yes, if plugin target enabled |
| marketplace | `.agents/plugins/marketplace.json` | marketplace template | yes, if plugin output enabled |

설치 output exclusion:

- `.codex/agents/kit-sync-agent.toml`을 생성하지 않습니다.
- `.agents/skills/kit-converter`, `.agents/skills/kit-scaffolding`, `.agents/skills/kit-validation`, `.agents/skills/kit-sync`를 생성하지 않습니다.
- `src/codex/kit/**`를 source로 읽지 않습니다.

## 3. direct-use vs plugin

| 기준 | direct-use output | plugin output |
|------|-------------------|---------------|
| 목적 | 설치된 소비자 프로젝트에서 즉시 사용 | 배포/marketplace 설치 |
| 대표 경로 | `.agents/skills`, `.codex/agents`, `AGENTS.md` | `plugins/claude-kit` |
| 사용자 호출 | `$skill`, custom agent | plugin command/skill namespace |
| source | `src/codex/**`, templates | `src/codex/**`, plugin templates |
| source-of-truth 여부 | no | no |

## 4. emitter 변경 요구사항

`scripts/setup.js` 또는 후속 emitter는 다음 정책을 가져야 합니다.

1. Codex source는 `src/codex/**`를 우선 읽는다.
2. `src/codex/**`가 없고 fallback이 승인된 경우에만 `src/claude/**`를 사용한다.
3. direct-use output과 plugin output을 별도 함수로 생성한다.
4. generated output을 다시 source로 읽지 않는다.
5. update install에서는 사용자 소유 파일을 보존한다.
6. `--dry-run`은 direct-use output과 plugin output을 모두 preview한다.

## 5. 생성 함수 후보

| Function | 역할 |
|------|------|
| `emitCodexDirectUse(projectRoot, activeDomains)` | `.agents/skills`, `.codex/agents`, `AGENTS.md` 생성 |
| `emitCodexPlugin(projectRoot, activeDomains)` | `plugins/claude-kit/**`, marketplace 생성 |
| `resolveCodexSource(domain, type, identity)` | `src/codex` 우선, 승인 fallback 처리 |
| `buildCodexAgentToml(sourceAgent)` | Codex custom agent toml 생성 |
| `buildCodexSkillOutput(sourceSkill)` | repo-local skill output 생성 |
| `previewCodexOutputs()` | dry-run summary |

## 6. Codex agent TOML 생성 스키마

`buildCodexAgentToml(sourceAgent)`는 `src/codex/{domain}/agents/{identity}.md`를 읽어 `.codex/agents/{identity}.toml`을 생성합니다. `.claude/agents/kit-sync-agent.md` 같은 maintenance agent source는 입력으로 받지 않습니다.

| TOML field | Source mapping | Required |
|------|------|------|
| `name` | filename identity를 snake_case로 변환하거나 source metadata의 name | yes |
| `description` | 첫 문단, heading 아래 설명, 또는 source metadata description | yes |
| `developer_instructions` | `## Role`, `## Capabilities`, `## Constraints`, `## Output Format`, `## Failure Modes`, `## Codex 참고 사항`를 순서대로 병합 | yes |
| `model` | Claude `model` frontmatter 또는 Codex source metadata 매핑 | no |
| `model_reasoning_effort` | source metadata 또는 default policy | no |
| `sandbox_mode` | Read-only agent는 `read-only`, write-capable은 default 또는 explicit | no |
| `nickname_candidates` | source metadata 또는 generated defaults | no |

검증 규칙:

- `name`, `description`, `developer_instructions`가 없으면 FAIL입니다.
- Claude XML `<Agent_Prompt>`가 남아 있으면 source conversion 단계에서 먼저 Codex agent Markdown으로 변환해야 합니다.
- write-capable Claude agent는 `.toml` 생성 전 review marker 또는 explicit sandbox policy가 필요합니다.
- filename이 아니라 `name` field가 Codex custom agent의 source of truth입니다.

## 7. direct-use output 보존/merge 정책

`.agents/skills/**`와 `.codex/agents/**`는 사용자가 직접 수정할 수 있는 repo-local output입니다. 설치 시 다음 정책을 적용해야 합니다.

| 상황 | 정책 |
|------|------|
| fresh install, output 없음 | 생성 |
| managed marker 있고 source hash 일치 | 안전 갱신 |
| managed marker 있고 source hash 불일치 | conflict report 후 보존 |
| managed marker 없음, 같은 경로 존재 | 덮어쓰기 금지 |
| user override가 있는 output | 보존, `.generated` 후보 또는 report만 생성 |

권장 managed marker:

```text
<!-- kit:managed source=src/codex/... hash=... -->
```

권장 install manifest:

- `.claude-kit-meta.json`에 direct-use output source hash 기록
- conflict report에 `path`, `source`, `reason`, `recommended action` 포함
- `--dry-run`에서 overwrite 후보를 먼저 표시

## 8. 검증 시나리오

| Scenario | Expected |
|------|----------|
| fresh install with Codex target | `.agents/skills`, `.codex/agents`, `AGENTS.md`, plugin output 생성 |
| fresh install with Codex target | `kit-sync-agent`와 `kit-*` maintenance commands/skills 미생성 |
| update install with existing `AGENTS.md` | existing `AGENTS.md` 보존, status reported |
| update install with user-edited `.agents/skills/*` | 덮어쓰기 금지, conflict report |
| update install with user-edited `.codex/agents/*` | 덮어쓰기 금지, conflict report |
| missing Codex source | fallback 승인 없으면 analyze/sync 경고 |
| hooks disabled environment | `.codex/hooks.json` 자동 의존 금지, fallback docs/skills 생성 |
| plugin disabled future mode | direct-use output은 계속 생성 |

## 9. verification commands

- `node scripts/setup.js --dry-run`
- `node scripts/codex-hook-compat.js`
- source inventory check for `src/claude/**` vs `src/codex/**`
- local output existence check for `.agents/skills/**`, `.codex/agents/**`, `AGENTS.md`
- JS emitter 변경 시 `pnpm test`
