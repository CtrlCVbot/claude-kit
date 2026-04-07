# Codex 호환 문서 개요

> `src/claude`와 `src/codex`를 분리한 target-separated authoring 기준으로, Claude 자산과 Codex 자산을 어떻게 나눠 설계하고 설치할지 설명하는 운영 문서 세트의 진입점.

---

## 1. 왜 기준선을 바꾸는가

기존 문서 세트는 `src`를 Claude-first source로 보고, 설치기가 Codex 대응을 해석하거나 변환하는 쪽에 무게를 두었다. 이 접근은 `agent`와 `command` 같은 에이전트 기능에서 한계가 컸다.

- Claude용 `agent/command`는 Claude 전용 문법과 실행 흐름에 강하게 묶여 있다.
- Codex는 `skill`, `AGENTS.md`, `.codex/agents/*.toml`, `.codex/hooks.json`, `.codex/rules/*.rules` 같은 별도 surface를 가진다.
- 따라서 Claude source를 installer가 런타임에 해석해서 Codex-native UX로 바꾸는 방식은 설명도 어렵고 유지보수도 어렵다.

이 문서 세트는 기준선을 아래처럼 고정한다.

- Claude용 정식 source tree는 `src/claude/{core,dev,plan}`다.
- Codex용 정식 source tree는 `src/codex/{core,dev,plan}`다.
- Codex installer는 Claude `agents/commands`를 직접 해석해 변환하는 역할이 아니다.
- Codex 대응이 필요한 에이전트 기능은 `src/codex`에 Codex-native 형태로 미리 authoring한다.

---

## 2. 새 source 모델

새 문서 세트는 source를 타깃별로 분리해 본다.

| source tree | 역할 |
|------|------|
| `src/claude/{core,dev,plan}` | Claude 타깃용 정식 source |
| `src/codex/{core,dev,plan}` | Codex 타깃용 정식 source |
| `src/templates` | 우선 shared infra로 유지하는 template 계층 |

이 구조의 핵심은 "설치 시 똑똑하게 변환"이 아니라 "타깃에 맞는 source를 미리 준비"하는 것이다.

---

## 3. 자산별 기본 원칙

- `agent`, `command`: 기본적으로 `src/claude`와 `src/codex`에 모두 별도 관리
- `skill`: Claude 정의를 우선 유지하되, Codex UX가 다르면 `src/codex` companion 허용
- `instruction rule`: 기본적으로 Claude source에서 관리하고 Codex에서는 `AGENTS.md` guidance로 소비
- `exec-policy rule`: 필요할 때만 `src/codex`에서 별도 관리
- `hook`: 공식 Codex hook surface와 플랫폼 제약에 맞는 경우만 `src/codex`에 별도 구현

즉 이 문서 세트는 "모든 자산을 무조건 이중화"하는 문서가 아니라, "에이전트 기능은 target-specific source로 분리하고, 나머지는 역할에 따라 shared 또는 selective split"하는 문서다.

---

## 4. 공식 Codex 기준선

이 문서 세트는 아래 공식 Codex 가이드를 기준으로 삼는다.

- [Plugins](https://developers.openai.com/codex/plugins)
- [Build plugins](https://developers.openai.com/codex/plugins/build)
- [Skills](https://developers.openai.com/codex/skills)
- [Hooks](https://developers.openai.com/codex/hooks)
- [Subagents](https://developers.openai.com/codex/subagents)
- [Subagent concepts](https://developers.openai.com/codex/concepts/subagents)
- [Rules](https://developers.openai.com/codex/rules)
- [Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration)
- [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)

특히 고정할 사실은 아래와 같다.

- Codex는 `.claude/*` 결과물을 직접 읽지 않는다.
- Codex는 Claude `agents/commands`를 자동 실행 surface로 취급하지 않는다.
- Codex용 `agent` 대응은 `skill`, `AGENTS.md`, `subagent`, `exec-policy`, `hook` 같은 공식 surface에 맞춰 별도로 authoring해야 한다.

---

## 5. 이 문서 세트가 답하는 질문

- 왜 single `src` + installer 변환 접근이 부족한가
- `src/claude`와 `src/codex`는 어떤 책임으로 나뉘어야 하는가
- 어떤 자산이 Codex sibling을 반드시 가져야 하는가
- Claude/Codex installer는 각각 어떤 source를 읽고 무엇을 읽지 않아야 하는가
- 새 에이전트 기능이 추가될 때 어떤 문서 계약과 pairing 규칙을 따라야 하는가

---

## 6. 읽는 순서

1. [01-requirements-and-success-criteria.md](./01-requirements-and-success-criteria.md)
2. [02-current-state-gap-analysis.md](./02-current-state-gap-analysis.md)
3. [03-source-layout-and-ownership.md](./03-source-layout-and-ownership.md)
4. [04-asset-mapping-rules.md](./04-asset-mapping-rules.md)
5. [05-installer-and-output-model.md](./05-installer-and-output-model.md)
6. [06-source-template-and-doc-improvements.md](./06-source-template-and-doc-improvements.md)
7. [07-rollout-plan.md](./07-rollout-plan.md)

---

## 7. 금지할 잘못된 전제

- Codex installer가 `src/claude/dev/agents`나 `src/claude/dev/commands`를 직접 해석해 runtime UX를 만든다고 쓰지 않는다.
- target-specific source 없이 installer만 똑똑해지면 해결된다고 가정하지 않는다.
- target 분리 이후에도 `agents/commands` direct copy를 허용하지 않는다.
- `src/core/rules/*.md` 같은 guidance 자산을 자동으로 Codex `.rules`로 컴파일한다고 전제하지 않는다.

