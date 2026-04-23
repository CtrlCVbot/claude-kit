# kit-analyze / kit-sync / kit-sync-agent 재정의

> **Status**: Draft plan (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23

`kit-sync-agent`의 목적은 plugin output을 고치는 것이 아니며, 소비자 프로젝트에 설치되어 sync를 실행하는 것도 아닙니다. 목적은 이 `claude-kit` 저장소 안에서 `src/claude/**`와 `src/codex/**`의 source parity를 유지하고, 설치 시 Codex direct-use output과 plugin output이 같은 source에서 생성되도록 보장하는 것입니다.

## 1. `kit-analyze`

`kit-analyze`는 읽기 전용 source parity analyzer입니다.

필수 입력:

- `.claude/agents/kit-sync-agent.md`
- `.claude/skills/kit-converter/**`
- `.claude/skills/kit-scaffolding/**`
- `.claude/skills/kit-validation/**`
- `.claude/commands/kit-*.md`
- `src/claude/**`
- `src/codex/**`
- `src/templates/AGENTS.md.template`
- `src/pairing-registry.json`
- `src/exception-registry.json`
- `src/claude/_meta/codex-portability.json`
- `scripts/setup.js`
- `scripts/codex-hook-compat.js`

출력해야 할 상태:

| 상태 | 의미 |
|------|------|
| `paired-direct` | Codex source로 직접 대응 |
| `paired-fallback` | template/skill/docs/reference로 의미 보존 |
| `paired-review` | 자동 전환 전 사람 검토 필요 |
| `blocked` | Codex에서 의미 보존 불가 |
| `missing` | Claude source는 있으나 Codex target 없음 |
| `drift` | paired source 간 의미 불일치 |
| `generated-mismatch` | source는 맞지만 install output이 다름 |

## 2. `kit-sync`

`kit-sync`는 `kit-analyze` 결과를 바탕으로 source asset을 갱신합니다.

수정 가능한 대상:

- `src/codex/**`
- `src/templates/**`
- `src/pairing-registry.json`
- `src/exception-registry.json`
- `src/claude/_meta/codex-portability.json`
- 필요 시 source docs

직접 수정하지 않을 대상:

- `plugins/claude-kit/**`
- generated `AGENTS.md`
- `.agents/plugins/marketplace.json`
- generated `hooks.json`
- `.codex-plugin/plugin.json`

`--resync`는 paired source drift를 감지해 `src/codex/**`를 다시 맞추는 mode입니다. generated output 재생성은 검증 단계입니다.

## 3. `kit-sync-agent`

`kit-sync-agent`는 source parity orchestration agent입니다.

역할:

1. 기존 `.claude` maintenance toolchain을 읽어 현재 변환 규칙을 확인한다.
2. maintenance toolchain alignment gate를 통과했는지 확인한다.
3. `kit-analyze` 결과를 읽는다.
4. missing/drift/review/metadata-drift 항목을 분류한다.
5. 자동 변환 가능 항목과 승인 필요 항목을 나눈다.
6. 승인된 경우 `kit-converter`, `kit-scaffolding`, `kit-validation` 규칙에 따라 `kit-sync` 절차로 source를 갱신한다.
7. emitter dry-run으로 installation output 영향을 확인한다.

agent가 항상 지켜야 할 원칙:

- actual emitter wins: `scripts/setup.js`가 현재 무엇을 읽는지 먼저 확인한다.
- generated output은 primary edit target이 아니다.
- rules guidance와 Codex `.rules` command policy를 혼동하지 않는다.
- hooks direct source와 hook runtime activation을 분리한다.
- 대규모 변경은 승인 게이트를 둔다.

## 4. pipeline

```text
kit-analyze
  ├─ source inventory
  ├─ maintenance toolchain inspection
  ├─ registry/exception/portability merge
  ├─ parity + drift report
  └─ installation impact estimate

kit-sync
  ├─ approved conversion
  ├─ kit-converter/scaffolding/validation reuse
  ├─ src/codex update
  ├─ template/docs fallback update
  ├─ registry update
  └─ verification proposal

kit-sync-agent
  ├─ orchestrates analyze/sync
  ├─ enforces approval gates
  ├─ delegates review if needed
  └─ reports source + output status
```

## 5. output format

```markdown
## Kit Sync Source Parity Report

| 항목 | 결과 |
|------|------|
| task class | analyze / sync / resync / install-output-check |
| source checked | scripts/setup.js, registries, src/claude, src/codex |
| parity result | paired / missing / drift / fallback / blocked |
| edit target | source path only |
| generated output edit | no |
| install output impact | direct-use / plugin / both |
| maintenance alignment | aligned / needs-alignment |
| verification | commands run or required |
```

## 6. maintenance toolchain 재사용 계약

`kit-sync-agent`는 새 변환 로직을 임의로 발명하지 않습니다. v1에서는 기존 Claude Code maintenance toolchain을 다음처럼 참고합니다. 단, "재사용"은 현재 계약을 그대로 실행하거나 toolchain 자체를 Codex asset으로 포팅한다는 뜻이 아닙니다. 현재 toolchain에는 command → Codex command-only 변환 계약이 남아 있으므로, command→skill 전략과 충돌하는 부분은 먼저 alignment해야 합니다.

| Toolchain asset | 재사용 방식 |
|------|------|
| `.claude/skills/kit-converter/SKILL.md` | 타입별 `src/claude` → `src/codex` 변환 규칙의 1차 근거 |
| `.claude/skills/kit-scaffolding/SKILL.md` | 신규 Claude/Codex source asset 생성 템플릿 근거 |
| `.claude/skills/kit-validation/SKILL.md` | 변환 후 schema validation 근거 |
| `.claude/agents/kit-sync-agent.md` | 승인 게이트, resync, pairing-registry 갱신 workflow 근거 |
| `.claude/commands/kit-*.md` | `kit-analyze`, `kit-sync`, `kit-convert`, `kit-audit` entry flow 근거 |

이 계약에 따라 `kit-sync-agent` 개선은 "plugin output을 고치는 새 agent"가 아니라 기존 kit toolchain을 Codex source parity pipeline으로 승격하는 작업입니다.

이 계약은 `src/codex/kit/**` 생성을 요구하지 않습니다. `kit-sync-agent`, `kit-converter`, `kit-scaffolding`, `kit-validation`, `kit-*` commands는 이 저장소의 maintenance toolchain으로 남고, 소비자 프로젝트에 Codex agent/skill로 설치되지 않습니다.

### 6.1 alignment 필수 항목

| Asset | alignment 요구사항 |
|------|--------------------|
| `.claude/skills/kit-converter/SKILL.md` | command row를 `Entry Flow command required sibling` 단일 계약에서 command/skill target selection 계약으로 변경 |
| `.claude/commands/kit-convert.md` | preview와 result에 `targetKind`, `codexCommand`, `codexSkill`, `transitionState`를 표시 |
| `.claude/commands/kit-create.md` | command 생성 기본값을 "항상 Codex command sibling"에서 "workflow command는 skill 우선, command는 wrapper/compat 필요 시"로 변경 |
| `.claude/commands/kit-validate.md` | `skill-primary`, `dual-output`, `command-wrapper`를 schema 검증 대상으로 포함 |
| `.claude/skills/kit-validation/references/schema-pairing-registry.md` | `pairing-registry-v2` 또는 호환 migration schema로 `codexSkill`, `primaryCodex`, `transitionState`, `driftStatus`를 검증 |

alignment가 끝나기 전 `kit-sync-agent`는 자동 product source 생성을 하면 안 됩니다. 이 경우 report에는 `maintenance alignment: needs-alignment`를 표시하고, 생성 후보만 제안합니다.

## 7. 설치와의 연결

`kit-sync-agent`가 이 저장소에서 source parity를 맞춘 뒤 `scripts/setup.js --dry-run`으로 설치 output 영향까지 확인해야 합니다. 목표는 소비자 프로젝트에서 Codex target active 시 다음이 생성되는 것입니다.

- `.agents/skills/**`
- `.codex/agents/**`
- `AGENTS.md`
- plugin output

`kit-sync-agent` 자체나 `.claude/commands/kit-*`는 위 설치 output에 포함하지 않습니다.

이 설치 계약은 [09-installation-output-contract.md](09-installation-output-contract.md)에 정의합니다.
