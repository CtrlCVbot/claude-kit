# Agent Platform Overview

> **Status**: Draft (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **Related**: [README.md](README.md), [04-codex-vs-claude-code-feature-comparison.md](04-codex-vs-claude-code-feature-comparison.md)

처음에는 두 플랫폼을 이렇게 이해하면 됩니다. 둘 다 "코딩 작업을 대신 수행하거나 보조하는 에이전트 도구"이지만, 사용자가 커스터마이즈하는 표면이 조금 다릅니다. `Codex`는 `AGENTS.md`, `skills`, `subagents`, `plugins`를 중심으로 설명되고, `Claude Code`는 `CLAUDE.md`, `skills`, `subagents`, `settings.json`, `plugins`를 중심으로 설명됩니다.

핵심은 "둘 다 에이전트를 확장할 수 있다"는 공통점보다, **무엇을 지침으로 두고 무엇을 재사용 가능한 워크플로로 두는지**를 구분하는 것입니다.

## 한 장으로 보는 개념 지도

| 질문 | Codex | Claude Code | 초보자 메모 |
|------|-------|-------------|-------------|
| 프로젝트 공통 지침은 어디에 적나? | `AGENTS.md` | `CLAUDE.md` | 둘 다 프로젝트 규칙을 담지만 파일명과 로딩 규칙이 다르다 |
| 반복 작업 플레이북은 어디에 적나? | `skill` | `skill` | 두 플랫폼 모두 `skill`이 중요하다 |
| 특정 역할의 전문 보조 에이전트는? | `subagent` / custom agent | `subagent` | 둘 다 지원하지만 호출 감각이 조금 다르다 |
| 공유/배포 가능한 묶음은? | `plugin` | `plugin` | 둘 다 배포 단위지만 manifest와 설치 방식이 다르다 |
| 기술적 제한이나 권한 설정은? | 환경/도구 설정과 별도 구성 | `settings.json`이 강하게 보임 | Claude Code는 설정과 행동 지침을 더 분리해 설명한다 |

## 초보자에게 가장 중요한 구분

### 1. 지침 파일과 워크플로 문서는 다르다

- `AGENTS.md` 또는 `CLAUDE.md`는 "이 저장소에서는 어떻게 일해야 하는가"를 적는 넓은 규칙에 가깝습니다.
- `skill`은 "이런 요청이 오면 어떤 순서로 처리하라"는 반복 가능한 절차에 가깝습니다.

초보자가 가장 많이 헷갈리는 지점은, 큰 지침 문서 안에 모든 절차를 넣어버리는 것입니다. 공식 문서는 두 플랫폼 모두 **절차성 있는 내용은 skill로 분리**하는 방향을 권장합니다.

### 2. skill과 plugin은 같은 것이 아니다

- `skill`은 재사용 가능한 작업 단위입니다.
- `plugin`은 그 skill이나 agent를 다른 사람도 설치하고 쓰게 만드는 배포 단위입니다.

즉, "무엇을 하게 할 것인가"는 `skill`, "어떻게 묶어서 배포할 것인가"는 `plugin`으로 보는 편이 이해가 쉽습니다.

### 3. subagent는 또 다른 skill이 아니다

`subagent`는 긴 설명서를 읽는 지식 조각이 아니라, 특정 역할을 맡아 별도 맥락으로 일하는 보조 에이전트에 가깝습니다. 예를 들어 "코드 리뷰만 하는 reviewer", "동기화 상태만 확인하는 inspector"처럼 역할을 분리할 때 잘 맞습니다.

## 이 저장소에서 먼저 보면 좋은 예시

- Codex skill 예시: [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md)
- Codex custom agent 예시: [../../../.codex/agents/kit-codex-sync-reviewer.toml](../../../.codex/agents/kit-codex-sync-reviewer.toml)
- Claude Code subagent 예시: [../../../.claude/agents/kit-sync-agent.md](../../../.claude/agents/kit-sync-agent.md)
- Claude Code skill 예시: [../../../.claude/skills/dev-workflow/SKILL.md](../../../.claude/skills/dev-workflow/SKILL.md)
- Claude Code settings 예시: [../../../.claude/settings.json](../../../.claude/settings.json)

## 먼저 외우면 좋은 한 줄 요약

- `Codex`: "프로젝트 규칙은 `AGENTS.md`, 반복 워크플로는 `skill`, 전문 역할은 `subagent`, 공유는 `plugin`"
- `Claude Code`: "프로젝트 기억은 `CLAUDE.md`, 반복 워크플로는 `skill`, 전문 역할은 `subagent`, 강한 설정은 `settings.json`, 공유는 `plugin`"

## 공식 문서

- OpenAI Codex: [Subagents](https://developers.openai.com/codex/subagents), [Agent Skills](https://developers.openai.com/codex/skills), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Build plugins](https://developers.openai.com/codex/plugins/build)
- Claude Code: [Subagents](https://code.claude.com/docs/en/sub-agents), [Skills](https://code.claude.com/docs/en/skills), [Memory / CLAUDE.md](https://code.claude.com/docs/en/memory), [Settings](https://code.claude.com/docs/en/settings), [Plugins](https://code.claude.com/docs/en/plugins)
