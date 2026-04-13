# Conversion Tooling Requirements

> Claude → Codex 전환을 지원하기 위해 `.claude` 메타 툴이 가져야 할 요구사항을 구현 관점에서 확정하는 문서

## 단계 위치

- 실행 단계: `4단계`
- 선행 조건: `10`, `11`, `12`
- 후속 문서: `14`

## 목적

`src/claude` 분석 결과와 `src/codex` sibling 설계를 바탕으로, `.claude` 메타 툴이 무엇을 생성하고 무엇을 검증하며 언제 `pairing-registry`를 갱신해야 하는지 구현 가능 수준으로 고정한다.

## 이번 단계에서 먼저 잠글 결정

- 신규 user-facing top-level command는 만들지 않는다.
- Phase 4 범위에서는 기존 `kit-*` 확장을 우선하고, 필요한 경우 내부 helper capability만 추가한다.
- `pairing-registry`는 `agent`, `command`, `skill`, `hook`의 pairing lifecycle을 추적한다.
- `instruction-rule`은 `AGENTS.md` synthesis 대상이므로 `pairing-registry`의 개별 엔트리 대상으로 보지 않는다.
- Codex sibling은 아래 pair 규칙을 따른다.
  - `subagent`: `*.toml`
  - write-capable `subagent`: `*.toml` + `*.contract.json`
  - `skill`: `SKILL.md`
  - `hook`: `*.js` + `*.hook.json`
- `/kit-validate`는 authoring source만 검증한다.
- `/kit-validate`의 FAIL은 선택한 target tree 안의 source/schema/companion pair 문제에 한정한다.
- opposite target sibling 누락, `required/optional/codex-skip` parity 판단은 `kit-audit C7`과 `kit-maintainer`의 책임이다.
- Claude-origin `skip` identity는 registry에서 `codex-skip`으로 기록한다.
- `.codex/agents/*.toml`, `.codex/hooks.json`, `AGENTS.md` 같은 runtime artifact는 setup/emitter 또는 후속 검증 단계의 책임으로 둔다.

## 현재 메타 툴과의 즉시 정렬 포인트

| 도구 | 현재 상태 | 이번 단계에서 바로 고칠 계약 |
|------|-----------|-----------------------------|
| `kit-create` | Codex `agent`를 `.md`, Codex `command`를 `commands/*.md`로 가정 | `agent -> *.toml`, `command -> skills/*/SKILL.md`, `hook -> *.js + *.hook.json`, write-capable `subagent -> *.contract.json`으로 전환 |
| `kit-validate` | target별 source 검증은 있으나 companion pair 검증이 약함 | `*.hook.json`, `*.contract.json` 검증 추가, cross-target parity FAIL은 `kit-audit C7`로 분리 |
| `kit-list` | target/pairing 표시는 가능하나 companion completeness 표시 없음 | primary sibling + companion completeness + registry 상태를 같이 보여주도록 확장 |
| `kit-audit` | C7 pairing 개념은 있으나 pair 세부 계약이 얕음 | required sibling 누락, companion 누락, orphan registry, invalid skip reason까지 검사 |
| `kit-maintainer` | 듀얼 스캔과 스키마 검증 언급 있음 | pairing-registry repair, companion pair repair 후보 제안, bulk drift 관리까지 명시 |

## 기존 확장 대상

- `kit-create`
- `kit-validate`
- `kit-list`
- `kit-audit`
- `kit-maintainer`

## 신규 내부 capability

신규 user-facing command는 만들지 않지만, 아래 내부 capability는 추가 가능 대상으로 본다.

- `pairing-resolver`
  - 목적: `src/claude`, `src/codex`, `pairing-registry`를 합쳐 normalized identity record를 만든다.
- `codex-companion-scaffolder`
  - 목적: `*.hook.json`, `*.contract.json` 같은 companion source를 일관된 schema로 생성한다.

## capability 책임 매트릭스

| capability | 기존 확장 / 신규 | 입력 | 출력 | 실패 조건 | 자동 갱신 |
|-----------|------------------|------|------|----------|----------|
| `kit-create` | 기존 확장 | `type`, `domain`, `name`, `--target`, `--skip-codex`, hook 옵션, 권한 옵션 | Claude source, Codex primary sibling, 필요한 companion source, 사용자 안내 | 잘못된 target 조합, 중복 identity, missing skip reason, unsupported rule target, template mismatch | source 파일, `src/pairing-registry.json` |
| `kit-validate` | 기존 확장 | component filter, `--type`, `--domain`, `--target`, `--verbose` | source validation report, companion validation report | schema 위반, target tree 내부의 `*.hook.json` 누락, write-capable target의 `*.contract.json` 누락, primary/companion path mismatch | 없음 |
| `kit-list` | 기존 확장 | `--domain`, `--type`, `--target`, `--pairing`, `--verbose` | inventory, pairing 상태, companion completeness 요약 | malformed registry, duplicate identity, target/path mismatch 경고 | 없음 |
| `kit-audit` | 기존 확장 | `--category`, `--fix`, `--verbose` | 전수 감사 결과, category별 FAIL/WARN, safe-fix 제안 | required sibling 누락, invalid `codex-skip`, orphan registry, companion source 누락, stale path, legacy `rule` registry entry | `--fix`일 때 안전한 registry cleanup만 허용 |
| `kit-maintainer` | 기존 확장 | repo 전체 상태, audit 결과, registry 상태 | bulk repair proposal, drift 요약, 문서 반영 제안 | ambiguous rename/delete, conflicting identity, unresolved source authority | 승인된 repair에 한해 source / registry / docs |
| `pairing-resolver` | 신규 내부 | `src/claude`, `src/codex`, `src/pairing-registry.json` | normalized identity records | duplicate source identity, incompatible target surface, registry/status conflict | 없음 |
| `codex-companion-scaffolder` | 신규 내부 | normalized identity, target surface, write policy, hook event metadata | `*.hook.json`, `*.contract.json` scaffold | missing event/matcher, missing write boundary, unsupported source kind | companion source 파일 |

## artifact별 생성/검증 책임

| artifact | 생성 책임 | 검증 책임 | 후속 소비 |
|---------|----------|----------|----------|
| `src/codex/{domain}/agents/{identity}.toml` | `kit-create` | `kit-validate --target codex` | setup/emitter -> `.codex/agents/*.toml` |
| `src/codex/{domain}/agents/{identity}.contract.json` | `kit-create` + `codex-companion-scaffolder` | `kit-validate --target codex` | subagent scaffold, audit, maintainer |
| `src/codex/{domain}/skills/{identity}/SKILL.md` | `kit-create` | `kit-validate --target codex` | plugin/install path |
| `src/codex/{domain}/hooks/{identity}.js` | `kit-create` | `kit-validate --target codex` | setup/emitter |
| `src/codex/{domain}/hooks/{identity}.hook.json` | `kit-create` + `codex-companion-scaffolder` | `kit-validate --target codex` | setup/emitter -> `.codex/hooks.json` |
| `src/pairing-registry.json` | `kit-create`, `kit-maintainer`, 제한적 `kit-audit --fix` | `kit-audit`, `kit-list --pairing` | 모든 parity tooling |
| `src/claude/core/rules/*.md` | Claude source authoring | source scan + doc lint | `AGENTS.md` synthesis input |

## pairing-registry lifecycle 계약

| 이벤트 | owner | 기대 동작 |
|--------|-------|-----------|
| `/kit-create --target both` | `kit-create` | `paired` 엔트리 생성 또는 갱신 |
| `/kit-create --target claude --skip-codex "reason"` | `kit-create` | `codex-skip` 엔트리 생성, `reason` 필수 |
| `/kit-create --target codex` | `kit-create` | `codex-native-only` 엔트리 생성 |
| Claude-origin `skip` surface (예: `session-wrap-suggest`) | `kit-create` 또는 `kit-maintainer` | `codex-skip` 엔트리 유지, 대체 Codex entrypoint를 `reason` 또는 companion note로 기록 |
| Codex companion만 추가 | `kit-maintainer` 또는 수동 수정 후 tooling | 기존 엔트리 보정, primary/companion completeness 갱신 |
| rename/delete | `kit-maintainer` 우선 | orphan 엔트리 감지 후 수리 제안, 자동 삭제는 safe case만 허용 |
| `instruction-rule` 수정 | registry 대상 아님 | `AGENTS.md` synthesis 영향만 audit 대상 |

## legacy migration bridge

- 과거 Phase 4 문서나 기존 명령 문맥에 남아 있는 `type: "rule"` registry 엔트리는 이제 legacy로 본다.
- 새 엔트리는 `rule` 타입으로 `pairing-registry`에 쓰지 않는다.
- 기존 legacy `rule` 엔트리를 발견하면:
  - `kit-audit C7`: WARN 또는 migration-needed로 보고
  - `kit-maintainer`: 제거 또는 shared-guidance 주석 전환을 제안
  - `kit-validate`: source schema 검증만 수행하고 registry 부재를 실패로 보지 않는다
- 이 bridge는 Wave C에서 정리하고, 후속 `docs/meta-tooling/*` 반영 시 함께 동기화한다.

## validation 경계

| 범위 | owner | 이번 단계 결정 |
|------|-------|----------------|
| authoring source schema | `kit-validate` | 포함 |
| primary/companion pair completeness | `kit-validate`, `kit-audit` | 선택한 target tree 기준으로 포함 |
| cross-target required/optional parity | `kit-audit`, `kit-maintainer` | 포함 |
| target surface mapping 일관성 | `kit-audit`, `kit-maintainer` | 포함 |
| runtime artifact schema | setup/emitter 또는 후속 검증 | 이번 단계 제외 |
| install 결과 parity | setup/emitter 검증 | 이번 단계 제외 |

## 구현자가 바로 따라야 할 규칙

- `kit-create`는 `command -> src/codex/*/skills/*/SKILL.md` 규칙을 직접 생성해야 한다.
- `kit-create`는 `hook` 생성 시 `.js`와 `.hook.json`을 같이 생성해야 한다.
- `kit-create`는 write-capable `subagent` 생성 시 `.toml`과 `.contract.json`을 같이 생성해야 한다.
- `kit-validate --target claude`는 Codex sibling 부재만으로 FAIL하지 않는다.
- `kit-validate --target codex`는 Claude source 부재만으로 FAIL하지 않는다.
- `kit-validate`는 primary source만 통과해도 성공으로 보지 않고, 같은 target tree 안의 companion pair까지 본다.
- `required` 항목의 missing sibling FAIL은 `kit-audit C7`이 담당한다.
- `optional` 항목은 누락될 수 있지만, 존재할 경우 schema와 pair completeness는 반드시 맞아야 한다.
- `skip` target surface로 확정된 Claude-origin identity는 registry에서 `codex-skip`으로 남겨 tooling이 추적 가능해야 한다.
- `instruction-rule`은 Codex sibling 생성 대상이 아니라 shared guidance 처리 대상으로 남긴다.

## 완료 기준

- `kit-create`, `kit-validate`, `kit-list`, `kit-audit`, `kit-maintainer` 각각의 확장 책임이 중복 없이 정리된다.
- 신규 내부 capability가 필요하면 user-facing command와 구분되어 적힌다.
- hook config pair와 write contract pair를 어떤 도구가 생성/검증하는지 명확히 적힌다.
- `pairing-registry`가 무엇을 추적하고 무엇을 추적하지 않는지 고정된다.
- `14`에서 구현 순서를 바로 잠글 수 있다.

## 다음 문서

- 실제 구현 흐름: [14-conversion-workflow-and-roadmap.md](./14-conversion-workflow-and-roadmap.md)
