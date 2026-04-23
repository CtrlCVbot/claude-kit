# Commands source parity와 Codex skills 전환 전략

> **Status**: Draft plan (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23

이 문서의 핵심은 `.claude/commands` runtime 파일을 `.agents/skills`로 복사하는 것이 아닙니다. `src/claude/**/commands/*.md`의 의도를 분석해 `src/codex/**/skills/**/SKILL.md` 또는 `src/codex/**/commands/*.md` 중 알맞은 Codex source asset으로 매칭하는 것입니다.

## 1. 공식 개념 기준

- Claude Code commands는 session workflow entrypoint이며, 공식 commands 문서에서도 일부 entry가 bundled skill로 표시됩니다.
- Codex CLI slash commands는 session control 중심입니다.
- Codex에서 reusable workflow authoring format은 skill입니다.

따라서 Claude command의 대부분은 Codex source에서 skill로 재구성할 수 있습니다. 다만 현재 저장소에는 이미 `src/codex/**/commands/*.md`와 `pairing-registry`의 paired command가 다수 존재하므로, 기존 command를 즉시 skill로 뒤집지 않습니다. command는 전환 상태를 거쳐 skill-primary로 이동해야 합니다.

## 2. command 전환 상태

| State | 의미 | Registry/분석 규칙 |
|------|------|------|
| `command-primary` | 기존 `src/codex/**/commands/*.md`가 primary Codex source | 현재 paired command의 기본값. missing/drift로 오판하지 않음 |
| `skill-primary` | `src/codex/**/skills/<name>/SKILL.md`가 primary user workflow | command가 없거나 wrapper일 수 있음 |
| `dual-output` | command와 skill이 모두 같은 workflow를 제공 | `kit-analyze`가 중복이 아니라 의도된 transition으로 표시 |
| `command-wrapper` | command는 skill 호출/안내 wrapper만 담당 | command 본문 drift보다 linked skill drift를 우선 |
| `deprecated-command` | backward compatibility용 command | 신규 기능 추가 금지, removal plan 필요 |

## 3. command 전환 판단표

| Claude command 유형 | Codex source target | 기본 state |
|------|------|------|
| 기존 paired command | 기존 `src/codex/**/commands/*.md` 유지 | `command-primary` |
| 긴 workflow command | `src/codex/**/skills/<name>/SKILL.md`로 신규 전환 | `dual-output` → `skill-primary` |
| 단순 wrapper command | `src/codex/**/commands/*.md` 유지 또는 skill wrapper | `command-wrapper` |
| kit orchestration | product source 변환 대상 아님. `.claude/commands/kit-*` maintenance toolchain으로 유지 | registry target 없음 |
| verification command | skill + explicit command list | `skill-primary` |
| CLI/session control | Codex built-in slash command 사용 | source 변환 대상 아님 |

## 4. 현재 source mapping 방향

| Source group | Claude source | Codex target |
|------|------|------|
| dev commands | `src/claude/dev/commands/*.md` | `src/codex/dev/skills/*` 우선, 필요 시 `src/codex/dev/commands/*` |
| plan commands | `src/claude/plan/commands/*.md` | plan skills 또는 commands |
| copy commands | `src/claude/copy/commands/*.md` | copy skills/commands |
| kit commands | `.claude/commands/kit-*.md` maintenance toolchain | `src/codex/kit/**` 없음, 소비자 설치 output 아님 |

`kit` domain은 v1에서 새 `src/claude/kit/**`도, `src/codex/kit/**`도 만들지 않습니다. 현재 `.claude/commands/kit-*`, `.claude/agents/kit-sync-agent.md`, `.claude/skills/kit-converter/**`, `.claude/skills/kit-scaffolding/**`, `.claude/skills/kit-validation/**`는 이 저장소의 maintenance toolchain으로 유지합니다. 이 toolchain은 소비자 프로젝트에 설치되는 Codex command/skill/agent가 아닙니다.

## 5. maintenance toolchain alignment gate

현재 `.claude` maintenance toolchain은 command를 기본적으로 `src/codex/{domain}/commands/{identity}.md`로 변환하는 계약을 갖고 있습니다. 이 문서의 목표인 skill-primary 전환과 충돌하지 않으려면, 실제 변환 실행 전에 toolchain 계약을 먼저 맞춰야 합니다.

| Toolchain asset | 현재 충돌 | alignment 후 계약 |
|------|------|------|
| `.claude/skills/kit-converter/SKILL.md` | command → Entry Flow command required sibling | command별 target을 `command-primary`, `skill-primary`, `dual-output`, `command-wrapper` 중 하나로 판정 |
| `.claude/commands/kit-convert.md` | 변환 target이 command path 중심 | preview/report에 `targetKind`, `codexCommand`, `codexSkill`, `transitionState` 표시 |
| `.claude/commands/kit-create.md` | command는 `both` required sibling 기본값 | workflow command는 skill scaffold를 우선하고, command는 wrapper/compat 필요 시만 생성 |
| `.claude/commands/kit-validate.md` | command/skill을 별도 schema로만 검증 | 같은 workflow의 command+skill 중복을 `dual-output` 또는 `command-wrapper` 상태로 검증 |
| `.claude/skills/kit-validation/references/schema-pairing-registry.md` | `paired`/`codex-skip` 중심 v1 schema | command transition field와 linked `codexSkill`을 허용하는 migration schema |

이 gate가 통과되기 전에는 `kit-sync-agent`가 기존 `.claude` toolchain을 자동 변환 엔진으로 실행하면 안 됩니다. 이 상태에서는 analyze/report만 허용하고, product source 생성은 보류합니다. gate를 통과해도 `kit-*` toolchain 자체를 `src/codex/kit/**`으로 생성하지 않습니다.

## 6. `kit-analyze` 책임

commands에 대해 `kit-analyze`는 다음을 판단합니다.

- `src/claude/**/commands/*.md` identity
- 대응 `src/codex/**/commands/*.md` 존재 여부
- 대응 `src/codex/**/skills/**/SKILL.md` 존재 여부
- command가 skill로 전환되어야 하는지, command로 유지되어야 하는지
- paired/missing/drift/review/blocked 상태
- command transition state: `command-primary`, `skill-primary`, `dual-output`, `command-wrapper`, `deprecated-command`
- maintenance toolchain alignment 상태: `aligned` / `needs-alignment`

## 7. `kit-sync` 책임

commands에 대해 `kit-sync`는 다음을 수행합니다.

| 상태 | 동작 |
|------|------|
| missing skill | `src/codex/**/skills/<name>/SKILL.md` 생성 후보 |
| missing command | plugin command output이 필요할 때만 `src/codex/**/commands/*.md` 생성 후보 |
| drift | Codex skill/command 갱신 |
| dual-output | command와 skill의 역할 중복/분리 상태 갱신 |
| command-wrapper | wrapper가 linked skill만 안내하는지 검증 |
| review | 승인 게이트 후 변환 |
| blocked | exception registry 후보 |
| needs-alignment | source 생성 중단, toolchain 계약 갱신 요구 |

## 8. registry migration 규칙

- 기존 `command, paired` entry는 기본적으로 `command-primary`로 유지합니다.
- command를 skill로 승격할 때는 즉시 기존 command entry를 삭제하지 않고 `dual-output` 상태를 먼저 기록합니다.
- registry에는 `codex` command path와 `codexSkill` 후보 path를 함께 추적하는 extension을 둡니다.
- command가 wrapper가 되면 `codex`는 wrapper command path를 유지하고 `codexSkill`을 primary target으로 표시합니다.
- deprecated command는 removal version 또는 후속 cleanup issue를 가져야 합니다.

## 9. 설치 output

목표 emitter는 `src/codex/**/skills/**`를 읽어 `.agents/skills/**` direct-use output을 생성해야 합니다. plugin command가 필요한 경우 `plugins/claude-kit/commands/**`도 생성할 수 있지만, direct-use skill이 primary user surface입니다.

## 10. 검증 기준

- 모든 `src/claude/**/commands/*.md`가 Codex target type을 가져야 합니다.
- skill로 변환한 command는 `description`에 trigger와 boundary가 있어야 합니다.
- `src/codex/**/commands`와 `src/codex/**/skills`가 같은 workflow를 중복 정의할 때는 반드시 `dual-output` 또는 `command-wrapper` state를 가져야 합니다.
- generated output이 아니라 source asset diff로 drift를 판단해야 합니다.
- `.claude` maintenance toolchain이 command → command-only 변환 계약으로 남아 있으면 실제 product source 생성 phase로 넘어가면 안 됩니다.
- `.claude/commands/kit-*`는 command→skill migration 대상에서 제외되어야 하며, `src/codex/kit/**` target을 만들면 안 됩니다.
