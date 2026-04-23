# 언제 Codex를 쓰고 언제 Claude Code를 쓸까

> **Status**: Draft (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **Related**: [04-codex-vs-claude-code-feature-comparison.md](04-codex-vs-claude-code-feature-comparison.md), [06-beginner-faq.md](06-beginner-faq.md)

초보자에게 가장 실용적인 질문은 "그래서 지금 어떤 도구를 먼저 쓰면 되나?"입니다. 이 문서는 기능 우열을 가리기보다, **작업 성격에 따라 어떤 쪽이 더 자연스러운지**를 정리합니다.

## 빠른 추천표

| 상황 | 먼저 추천 | 이유 |
|------|-----------|------|
| Codex용 repo-local skill 예시를 만들고 싶다 | Codex | 공식 개념과 저장소 예시가 바로 연결된다 |
| 프로젝트 규칙과 강제 설정을 분리해서 운영하고 싶다 | Claude Code | `CLAUDE.md`와 `settings.json` 역할 분리가 분명하다 |
| 자동 또는 반자동 subagent 위임 감각을 익히고 싶다 | Claude Code | 자동 위임, `@` mention, 세션 agent 설명이 더 직접적이다 |
| 병렬 보조 에이전트를 명시적으로 써서 작업을 쪼개고 싶다 | Codex | subagent를 명시 요청하는 흐름을 배우기 좋다 |
| 개인/프로젝트용 절차를 가볍게 빠르게 추가하고 싶다 | 둘 다 가능 | 둘 다 skill 중심 접근이 유효하다 |
| 팀에 배포 가능한 확장 단위를 만들고 싶다 | 둘 다 가능 | 둘 다 plugin 개념이 있지만 구조가 다르다 |

## 상황별 해설

### 1. "프로젝트 규칙부터 잡고 싶다"

추천:

- `Codex`를 쓰는 팀이면 `AGENTS.md`
- `Claude Code`를 쓰는 팀이면 `CLAUDE.md` + 필요 시 `settings.json`

특히 운영 제약, 권한 차단, 환경 변수 정책까지 함께 관리하고 싶다면 `Claude Code` 쪽이 초보자에게 더 구조적으로 보일 수 있습니다.

### 2. "반복 작업을 문서처럼 재사용하고 싶다"

추천:

- 두 플랫폼 모두 `skill` 우선

예를 들어 "이 저장소에서 Codex sync 관련 수정은 어디를 먼저 봐야 하는가" 같은 절차는 긴 지침 문서보다 skill로 빼는 편이 좋습니다. 이 저장소의 [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md)가 바로 그런 예시입니다.

### 3. "전문 역할을 가진 보조 에이전트를 두고 싶다"

추천:

- 자동 위임과 명시 호출을 함께 쓰고 싶으면 `Claude Code`
- 명시적으로 병렬 보조 에이전트를 쓰는 감각을 익히고 싶으면 `Codex`

둘 다 가능하지만, 초보자가 체감하는 사용성은 다릅니다.

### 4. "팀 공유와 배포를 생각하고 있다"

추천:

- 먼저 project-local 구성으로 검증
- 나중에 plugin으로 승격

이 흐름은 두 플랫폼 모두 비슷합니다. Claude Code 공식 문서도 standalone `.claude/`로 먼저 실험하고, 필요하면 plugin으로 전환하라고 안내합니다. Codex도 skill과 plugin을 구분해 설명합니다.

## 이 저장소 기준 현실적인 추천

이 저장소에서 지금 바로 예시를 보여주려면 아래 순서가 가장 자연스럽습니다.

1. Codex repo-local skill 예시를 보여준다.
2. Codex custom agent 예시를 보여준다.
3. Claude Code 쪽에서는 `.claude/skills/`, `.claude/agents/`, `.claude/settings.json`을 연결해 비교한다.

즉, "Codex는 skill/agent 예시", "Claude Code는 skill/agent/settings 예시"로 배우면 초보자가 구조 차이를 빠르게 잡기 쉽습니다.

## 피해야 할 접근

- 한 플랫폼의 파일명을 다른 플랫폼에 그대로 대응시키기
- plugin부터 먼저 배우기
- skill과 subagent를 같은 것으로 설명하기
- `CLAUDE.md`와 `settings.json`을 하나로 뭉개서 설명하기

## 공식 문서

- OpenAI Codex: [Subagents](https://developers.openai.com/codex/subagents), [Agent Skills](https://developers.openai.com/codex/skills), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Build plugins](https://developers.openai.com/codex/plugins/build)
- Claude Code: [Subagents](https://code.claude.com/docs/en/sub-agents), [Skills](https://code.claude.com/docs/en/skills), [Memory / CLAUDE.md](https://code.claude.com/docs/en/memory), [Settings](https://code.claude.com/docs/en/settings), [Plugins](https://code.claude.com/docs/en/plugins)
