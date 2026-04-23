# Codex vs Claude Code 에이전트 기능 비교 문서 패키지

> **Status**: Draft (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **성격**: 정식 사용자 문서 승격 전 비교 초안 패키지

이 패키지는 `Codex`와 `Claude Code`를 처음 비교하는 사람을 위해 만들었습니다. 목표는 "이름이 비슷한 기능을 억지로 같은 것으로 보지 않고", 각 도구가 실제로 어떤 파일과 개념으로 동작하는지 초보자도 이해할 수 있게 정리하는 것입니다.

가장 중요한 원칙은 두 가지입니다.

1. 제품 설명은 공식 문서를 먼저 따른다.
2. 이 저장소의 `claude-kit` 예시는 제품 정의가 아니라 **repo-specific 예시**로만 사용한다.

## 이 패키지에서 다루는 질문

- `Codex`에서 말하는 `AGENTS.md`, `skills`, `subagents`, `plugins`는 각각 무엇인가?
- `Claude Code`에서 말하는 `CLAUDE.md`, `skills`, `subagents`, `settings.json`, `plugins`는 각각 무엇인가?
- `Claude Code`에는 잘 보이지만 `Codex`에는 직접 대응이 약한 `commands`, `rules`, `hooks`, `agent-memory`는 어떻게 이해해야 하는가?
- 둘은 어디가 비슷하고 어디가 다른가?
- 초보자는 무엇부터 익히는 것이 가장 덜 헷갈리는가?

## 읽는 순서

1. [01-agent-platform-overview.md](01-agent-platform-overview.md)
2. [02-codex-agent-features-for-beginners.md](02-codex-agent-features-for-beginners.md)
3. [03-claude-code-agent-features-for-beginners.md](03-claude-code-agent-features-for-beginners.md)
4. [04-codex-vs-claude-code-feature-comparison.md](04-codex-vs-claude-code-feature-comparison.md)
5. [05-when-to-use-codex-vs-claude-code.md](05-when-to-use-codex-vs-claude-code.md)
6. [06-beginner-faq.md](06-beginner-faq.md)
7. [07-agent-capability-matrix.md](07-agent-capability-matrix.md)
8. [08-claude-only-concepts-and-codex-alternatives.md](08-claude-only-concepts-and-codex-alternatives.md)

## 패키지 구성

| 문서 | 역할 |
|------|------|
| [01-agent-platform-overview.md](01-agent-platform-overview.md) | 두 플랫폼의 개념 지도를 먼저 잡아주는 입문 문서 |
| [02-codex-agent-features-for-beginners.md](02-codex-agent-features-for-beginners.md) | Codex의 에이전트 기능을 초보자 눈높이로 설명 |
| [03-claude-code-agent-features-for-beginners.md](03-claude-code-agent-features-for-beginners.md) | Claude Code의 에이전트 기능을 초보자 눈높이로 설명 |
| [04-codex-vs-claude-code-feature-comparison.md](04-codex-vs-claude-code-feature-comparison.md) | 유사점과 차이점을 같은 축으로 비교 |
| [05-when-to-use-codex-vs-claude-code.md](05-when-to-use-codex-vs-claude-code.md) | 상황별 선택 가이드 |
| [06-beginner-faq.md](06-beginner-faq.md) | 자주 헷갈리는 질문 정리 |
| [07-agent-capability-matrix.md](07-agent-capability-matrix.md) | 빠르게 조회하는 참조표 |
| [08-claude-only-concepts-and-codex-alternatives.md](08-claude-only-concepts-and-codex-alternatives.md) | Claude Code 중심 개념과 Codex 대안 |

## 이 저장소에서 연결할 예시

이 패키지는 아래 파일들을 실제 예시로 사용합니다.

- Codex repo-local skill 예시: [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md)
- Codex custom agent 예시: [../../../.codex/agents/kit-codex-sync-reviewer.toml](../../../.codex/agents/kit-codex-sync-reviewer.toml)
- Claude Code project subagent 예시: [../../../.claude/agents/kit-sync-agent.md](../../../.claude/agents/kit-sync-agent.md)
- Claude Code project skills 예시: [../../../.claude/skills/dev-workflow/SKILL.md](../../../.claude/skills/dev-workflow/SKILL.md)
- Claude Code project settings 예시: [../../../.claude/settings.json](../../../.claude/settings.json)
- Claude Code legacy command 예시: [../../../.claude/commands/dev-feature.md](../../../.claude/commands/dev-feature.md)
- Claude Code rules 예시: [../../../.claude/rules/verification.md](../../../.claude/rules/verification.md)
- Claude Code hook 예시: [../../../.claude/hooks/dev-tdd-guard.js](../../../.claude/hooks/dev-tdd-guard.js)
- Claude Code agent memory 예시: [../../../.claude/agent-memory/kit-sync-agent/MEMORY.md](../../../.claude/agent-memory/kit-sync-agent/MEMORY.md)

현재 이 브랜치에는 `Codex` 쪽의 `AGENTS.md`나 generated plugin 출력물이 항상 커밋되어 있지는 않으므로, 해당 부분은 공식 문서 설명을 기준으로 다루고 저장소 예시는 `skill`과 `custom agent` 중심으로 연결합니다.

## 이 패키지를 읽을 때 주의할 점

- `AGENTS.md`와 `CLAUDE.md`는 모두 "프로젝트 지침" 계열이지만, **동일 파일 규약이 아닙니다**.
- `skill`은 두 플랫폼 모두에서 중요한 개념이지만, 호출 방식과 주변 기능은 다를 수 있습니다.
- `plugin`은 두 플랫폼 모두에서 "배포/공유 단위"에 가깝지만, manifest 구조와 설치 경험은 다릅니다.
- `subagent`는 두 플랫폼 모두 지원하지만, **자동 위임 방식과 명시 호출 방식이 똑같지는 않습니다**.
- `rules`와 `hooks`는 두 플랫폼 모두 문서가 있지만, **Claude Code의 `.claude/rules/`와 hooks를 Codex의 `rules`/hooks에 그대로 대응시키면 안 됩니다**.

## 기존 문서와의 관계

- Codex 듀얼 타깃 운영 맥락: [../../20-user-guide/06-codex-dual-use.md](../../20-user-guide/06-codex-dual-use.md)
- 저장소의 agent 카탈로그: [../../30-reference/02-agents.md](../../30-reference/02-agents.md)

## 공식 문서

- OpenAI Codex: [Subagents](https://developers.openai.com/codex/subagents), [Agent Skills](https://developers.openai.com/codex/skills), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Build plugins](https://developers.openai.com/codex/plugins/build), [Rules](https://developers.openai.com/codex/rules), [Hooks](https://developers.openai.com/codex/hooks), [Memories](https://developers.openai.com/codex/memories)
- Claude Code: [Subagents](https://code.claude.com/docs/en/sub-agents), [Skills](https://code.claude.com/docs/en/skills), [Memory / CLAUDE.md](https://code.claude.com/docs/en/memory), [Settings](https://code.claude.com/docs/en/settings), [Plugins](https://code.claude.com/docs/en/plugins), [Commands](https://code.claude.com/docs/en/commands), [Hooks](https://code.claude.com/docs/en/hooks)
