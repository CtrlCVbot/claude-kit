# As-Is Model Config Map

## 현재 프로젝트 스냅샷

| 항목 | 현재 상태 | 근거 |
|---|---|---|
| active domains | `core`, `dev` | `profile.json`, `scripts/setup.js::resolveActiveDomains()` |
| active targets | `claude` only | `profile.json`, `node scripts/setup.js --dry-run` |
| package manager | `npm` | `profile.json` |
| runtime settings | `.claude/settings.json` 생성됨 | repo current state |
| codex direct-use emission | 현재 비활성 | dry-run 결과 |

## 레이어별 맵

| 레이어 | 파일 | 현재 동작 | 모델 구성 영향 |
|---|---|---|---|
| Install profile | `profile.json` | 활성 domain/target을 선택 | 어떤 모델-bearing 자산이 배포되는지 간접 결정 |
| Claude source asset | `src/claude/**/agents/*.md` | agent frontmatter에 `model`, `memory`, `color` 보유 | Claude agent별 모델 직접 지정 |
| Codex source asset | `src/codex/**/agents/*.md` | 일부는 frontmatter, 다수는 heading 기반 변환본 | Codex 쪽 모델 정보가 대부분 소실됨 |
| Settings emitter | `scripts/setup.js::buildSettingsTemplate()` | permissions/hooks/env 생성 | 현재는 `model`과 pinning env를 기본 생성하지 않음 |
| Settings merge | `scripts/merge-settings.js` | 기존 settings를 보존하며 kit 관리 항목 병합 | 기존 사용자의 `model`/env가 남아 있을 수 있음 |
| Codex agent emitter | `scripts/setup.js::buildCodexAgentToml()` | TOML에 `name`, `description`, `sandbox_mode`, `developer_instructions`만 출력 | Codex runtime으로 모델/effort 전달 누락 |
| Pairing metadata | `src/pairing-registry.json` | Claude/Codex 자산 관계 추적 | 모델 parity 검증은 수행하지 않음 |
| Exception metadata | `src/exception-registry.json` | intentional gap 관리 | 모델 관련 예외는 현재 없음 |

## Claude 에이전트 모델 분포

정량 관찰:

- `src/claude/**/agents/*.md` 기준 Claude 에이전트 21개
- 21개 모두 `model: opus`

이 말은 현재 저장소의 Claude 에이전트 모델 정책이 "domain별 차등"이 아니라 "전면 Opus 고정"에 가깝다는 뜻이다.

## Codex 에이전트 모델 분포

정량 관찰:

- `src/codex/**/agents/*.md` 기준 20개
- `model: opus` 유지: 1개 (`src/codex/dev/agents/dev-implementer.md`)
- `model` frontmatter 없음: 19개

이 상태는 다음 두 가능성을 시사한다.

1. 변환 과정에서 모델 메타데이터가 빠졌다.
2. Codex 쪽에서는 모델을 다른 레이어에서 주입할 계획이었으나 아직 파이프라인이 완성되지 않았다.

현재 저장소에는 두 번째를 보장하는 중앙 정책 파일이 없으므로, 실질적으로는 "메타데이터 손실"로 보는 편이 안전하다.

## `.claude/settings.json`의 현재 역할

현재 생성된 `.claude/settings.json`은 다음을 관리한다.

- permissions allow/deny
- hooks
- env
  - `ENABLE_TOOL_SEARCH=auto:5`
  - `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

현재 기본 생성되지 않는 것:

- `model`
- `availableModels`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`
- `CLAUDE_CODE_SUBAGENT_MODEL`

즉, 저장소가 Claude 모델 구성을 "settings 중심"이 아니라 "agent frontmatter + 사용자 override 허용" 방식으로 두고 있다고 볼 수 있다.

## `merge-settings.js`가 만드는 실제 결과

`merge-settings.js`는 다음 규칙으로 기존 settings를 보존한다.

| 영역 | 병합 방식 | 의미 |
|---|---|---|
| permissions | 기존 + template union | 사용자가 추가한 허용/차단 규칙 유지 |
| hooks | 기존 command 기준 dedupe 후 template 추가 | 기존 훅 유지 |
| env | `{...template, ...existing}` | existing이 template를 override |

결론적으로 사용자가 기존 `.claude/settings.json`에 `model` 또는 `ANTHROPIC_MODEL` 계열을 넣어두었다면, claude-kit가 이를 명시적으로 제거하지 않는다.  
이것은 유연성이지만, 동시에 source asset과 runtime의 모델 drift를 숨길 수 있다.

## Codex TOML 생성 경로의 현재 상태

`buildCodexAgentToml()`는 현재 아래 필드만 출력한다.

- `name`
- `description`
- `sandbox_mode`
- `developer_instructions`

출력하지 않는 필드:

- `model`
- `model_reasoning_effort`
- `nickname_candidates`
- 기타 frontmatter 메타데이터

반면 저장소의 수동 관리 TOML인 `.codex/agents/kit-codex-sync-reviewer.toml`은 `model = "gpt-5.4-mini"`와 `model_reasoning_effort = "medium"`를 실제로 사용한다.  
따라서 "Codex는 모델을 못 받는다"가 아니라, "현재 emitter가 모델을 내보내지 않는다"가 더 정확하다.

## Pairing / Exception의 현재 의미

### Pairing Registry

`src/pairing-registry.json`는 `dev-code-reviewer`, `plan-reviewer` 등 agent identity가 `paired`인지 추적한다.  
하지만 이 registry는 "같은 identity가 존재한다"는 수준의 추적이지, `model` parity를 보증하지는 않는다.

### Exception Registry

`src/exception-registry.json`는 hook/rule portability 예외를 관리한다.  
현재 모델 메타데이터 손실에 대한 active exception은 없다.  
이 말은 현재의 모델 gap이 "공식 예외 처리된 차이"라기보다, 아직 설계 명세가 정리되지 않은 공백일 가능성이 높다는 뜻이다.

## 현행 구조를 한 문장으로 요약하면

현재 `claude-kit`의 모델 구성은 Claude 쪽에서는 agent frontmatter에 강하게 결합되어 있고, Codex 쪽에서는 소스 변환과 TOML emission 과정에서 대부분 사라지며, settings와 registry 계층은 그 공백을 메워주지 못하는 상태다.

