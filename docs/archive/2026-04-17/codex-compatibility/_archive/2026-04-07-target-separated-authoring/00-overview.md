# Codex 호환 문서 개요

> `src`의 Claude Code 기반 자산을 Codex에서도 쓸 수 있게 만들기 위해, 공식 Codex surface를 기준으로 아이디어를 비교하고 추천안을 고르기 위한 문서 세트의 진입점.

---

## 1. 이 문서 세트가 다루는 문제

현재 `claude-kit`의 기능 자산은 `src` 아래에 Claude Code 중심으로 작성되고, 설치 시 기본적으로 `.claude/`에 배치된다. 사용자는 이 기능을 Codex에서도 쓰고 싶지만, Codex는 `.claude/*`를 직접 사용하지 못한다.

이 문서 세트는 아래 요구를 해결하기 위한 비교와 추천을 목적으로 한다.

1. `src` 자산은 Claude Code 에이전트 기능을 기반으로 구현된다.
2. 이 기능을 Codex에서도 사용하고 싶다.
3. `.claude`에 생성된 결과물은 Codex가 직접 읽지 못한다.
4. 따라서 Claude 기능 구현 시 Codex 대응을 같이 하거나, 설치 시 Codex 형식으로 변환해야 한다.
5. 이 모든 판단은 Codex 공식 가이드를 기준으로 해야 한다.

이번 개정에서 특히 추가로 다루는 축은 두 가지다.

- `subagents`: 기존 문서 세트는 plugin, skill, `AGENTS.md`, hooks는 다뤘지만, Codex 공식 `subagents` 가이드가 요구하는 custom agent surface와 운영 규칙을 충분히 반영하지 못했다.
- 공식 Codex `Rules`: 기존 문서 세트는 `src/core/rules/*.md` 같은 작업 지침과, `.codex/rules/*.rules` 기반의 실행 승인 정책을 같은 `rule`이라는 말로 다루기 쉬운 상태였다.

---

## 2. 현재 저장소의 출발점

현재 저장소는 이미 Claude와 Codex를 동시에 언급하지만, 실제 구조는 Claude-first에 가깝다.

- `src`는 `core`, `dev`, `plan` 도메인으로 나뉜다.
- 각 도메인에는 `agents`, `commands`, `skills`, `hooks`, `rules`가 있다.
- 여기서 `src/core/rules/*.md`는 이름상 `rules`지만, 실제 내용은 coding style, verification, security 같은 작업 지침이다.
- `scripts/setup.js`는 Claude용 `.claude/`와 Codex용 `plugins/claude-kit/`를 함께 생성한다.
- 그러나 Codex 쪽은 `agents`, `commands`, `skills`를 거의 그대로 복사하고, hooks도 filename 예외 필터 기반으로만 처리한다.
- `agent` 자산을 Codex의 custom subagent surface로 어떻게 옮길지에 대한 문서 계약이 없다.
- `.codex/rules/*.rules`나 `requirements.toml [rules]`에 해당하는 exec-policy 자산은 현재 저장소에 없다.

즉 현재 문제는 "Codex 설치가 아예 없다"가 아니라, "Codex 공식 surface에 맞춘 설계 계약 없이 Claude 자산을 거의 그대로 옮기고 있다"는 점이다.

---

## 3. 이번 문서 세트의 기준선

이 문서 세트는 아래 공식 Codex 가이드를 기준으로 판단한다.

- [Plugins](https://developers.openai.com/codex/plugins)
- [Build plugins](https://developers.openai.com/codex/plugins/build)
- [Skills](https://developers.openai.com/codex/skills)
- [Hooks](https://developers.openai.com/codex/hooks)
- [Subagents](https://developers.openai.com/codex/subagents)
- [Subagent concepts](https://developers.openai.com/codex/concepts/subagents)
- [Rules](https://developers.openai.com/codex/rules)
- [Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration)
- [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Slash commands in Codex CLI](https://developers.openai.com/codex/cli/slash-commands)

문서에서 특히 고정할 사실은 아래와 같다.

- Codex는 `.claude/*`를 직접 사용하는 모델이 아니다.
- 로컬/배포형 skill은 Codex의 공식 지원 surface다.
- plugin은 `plugins/*` + `.agents/plugins/marketplace.json` 구조를 가진다.
- 프로젝트 지침은 `AGENTS.md`가 공식 instruction surface다.
- hooks의 공식 runtime config는 `.codex/hooks.json`이다.
- subagents는 `.codex/agents/*.toml`과 `.codex/config.toml [agents]`를 통해 설정되는 별도 surface다.
- 공식 Codex `Rules`는 `.codex/rules/*.rules` 기반의 exec-policy surface다.
- `requirements.toml [rules]`는 admin이 강제하는 restrictive policy layer다.
- `prefix_rule`은 샌드박스 밖 명령 실행을 `allow`, `prompt`, `forbidden`으로 제어한다.
- Codex는 여러 exec-policy rule이 동시에 맞으면 가장 restrictive한 결정을 우선한다.
- subagents는 자동으로 spawn되지 않고, 명시적 지시가 있을 때만 쓰는 워크플로우다.
- `/agent`는 built-in slash command이며, Claude의 agent markdown을 자동 실행하는 surface가 아니다.

---

## 4. Codex 공식 surface

이 문서 세트는 Codex target surface를 아래처럼 본다.

| surface | 의미 |
|------|------|
| repo plugin package | 공유 skill과 plugin 산출물을 담는 bundle |
| repo plugin registration | `.agents/plugins/marketplace.json` 등록 surface |
| project `AGENTS.md` | repository-level instruction surface |
| project `.codex/hooks.json` | hook runtime config |
| project `.codex/agents/*.toml` | project-scoped custom subagent 정의 surface |
| project `.codex/config.toml [agents]` | `max_threads`, `max_depth` 등 subagent 전역 설정 surface |
| project `.codex/rules/*.rules` | 샌드박스 밖 실행 승인 정책을 담는 exec-policy surface |
| admin `requirements.toml [rules]` | 조직 단위 restrictive policy surface |
| compatibility report | emitted/skipped/transform 결과 보고 |

이번 개정의 핵심은 `subagents`와 공식 `Rules`를 둘 다 이 표의 1급 항목으로 다루는 것이다.

---

## 5. 이 문서 세트에서 쓰는 `rule`의 의미

이 문서 세트에서는 `rule`이라는 단어를 단독으로 쓰지 않는다. 항상 아래 둘 중 하나로 구분한다.

- `instruction rule`: 현재 `src/core/rules/*.md` 같은 작업 지침 자산. Codex에서는 기본적으로 `AGENTS.md`로 반영한다.
- `exec-policy rule`: 공식 Codex `.codex/rules/*.rules` 및 `requirements.toml [rules]` 같은 실행 승인 정책. Codex 보안 레이어다.

이 구분을 하지 않으면 "작업 지침"과 "샌드박스 밖 실행 정책"이 같은 기능처럼 보이기 때문에, 이후 설치기와 source 설계가 계속 흔들리게 된다.

---

## 6. 문서 세트의 질문

이 문서 세트는 아래 질문에 답한다.

- 현재 `src` 자산 구조와 설치기는 어디에서 Codex와 어긋나는가
- Codex 대응을 언제 "같이 구현"하고, 언제 "설치 시 변환"해야 하는가
- 어떤 자산은 skill로 재사용하고, 어떤 자산은 subagent로 가야 하며, 어떤 자산은 Codex 전용 구현이 더 적절한가
- `src/core/rules/*.md` 같은 instruction rule은 어떻게 Codex에 반영하고, 공식 exec-policy rule은 어떤 별도 자산으로 다뤄야 하는가
- 가장 현실적인 추천안은 무엇이며, 그 추천안에 맞게 소스와 설치기를 어떻게 개선해야 하는가

---

## 7. 읽는 순서

1. [01-requirements-and-success-criteria.md](./01-requirements-and-success-criteria.md)
2. [02-current-state-gap-analysis.md](./02-current-state-gap-analysis.md)
3. [03-option-a-dual-authoring.md](./03-option-a-dual-authoring.md)
4. [04-option-b-install-time-adapter.md](./04-option-b-install-time-adapter.md)
5. [05-option-c-hybrid-recommended.md](./05-option-c-hybrid-recommended.md)
6. [06-source-and-installer-improvements.md](./06-source-and-installer-improvements.md)
7. [07-doc-writing-and-rollout-plan.md](./07-doc-writing-and-rollout-plan.md)

---

## 8. 이 문서 세트에서 금지하는 잘못된 전제

- `.claude/*` 결과물을 Codex가 직접 읽는다고 가정하지 않는다.
- `plugins/claude-kit/agents`나 `plugins/claude-kit/commands`가 자동 실행 surface라고 쓰지 않는다.
- `plugins/claude-kit/hooks.json`을 공식 hook runtime location이라고 쓰지 않는다.
- Claude agent markdown 복사를 Codex subagent 지원과 동일시하지 않는다.
- `src/core/rules/*.md`를 Codex `.rules`와 동일시하지 않는다.
- prose 기반 작업 지침을 `.rules`로 자동 컴파일할 수 있다고 전제하지 않는다.
- subagents가 자동으로 spawn된다고 쓰지 않는다.
- slash command 지원을 곧바로 목표로 두지 않고, 공식 Codex skill/plugin/hook/AGENTS/subagent/rules surface 기준으로만 설명한다.
