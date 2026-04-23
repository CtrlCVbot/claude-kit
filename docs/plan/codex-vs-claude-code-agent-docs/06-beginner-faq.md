# Beginner FAQ

> **Status**: Draft (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **Related**: [04-codex-vs-claude-code-feature-comparison.md](04-codex-vs-claude-code-feature-comparison.md), [07-agent-capability-matrix.md](07-agent-capability-matrix.md)

## Q1. `AGENTS.md`와 `CLAUDE.md`는 같은 것인가?

아니요. 둘 다 프로젝트 지침을 담는다는 점은 비슷하지만, 공식 규약은 다릅니다. `Codex`는 `AGENTS.md`를 중심으로 설명하고, `Claude Code`는 `CLAUDE.md`를 중심으로 설명합니다. Claude Code 공식 문서는 필요하면 `CLAUDE.md`에서 `@AGENTS.md`를 import하는 패턴까지 설명합니다.

## Q2. `skill`과 `subagent`는 무엇이 다른가?

간단히 말하면:

- `skill`은 절차와 지식 묶음
- `subagent`는 역할과 책임을 가진 보조 에이전트

예를 들어 "코드 리뷰 체크리스트"는 `skill`에 가깝고, "리뷰만 전담하는 reviewer"는 `subagent`에 가깝습니다.

## Q3. `skill`과 `plugin`은 무엇이 다른가?

`skill`은 재사용 가능한 작업 단위이고, `plugin`은 그 skill이나 agent를 설치/공유 가능한 묶음으로 배포하는 단위입니다. 초보자는 먼저 skill을 이해하고, 그다음 plugin을 보는 편이 좋습니다.

## Q4. Claude Code에는 왜 `settings.json`이 따로 중요한가?

공식 문서 기준으로 `CLAUDE.md`는 행동을 유도하는 지침이고, `settings.json`은 권한이나 허용/차단 같은 기술 설정을 강제하는 층입니다. 그래서 같은 "설정"처럼 보여도 역할이 다릅니다.

## Q5. Claude Code의 custom command는 이제 없는가?

완전히 사라졌다기보다, 최신 공식 설명은 `skill` 중심입니다. 기존 `.claude/commands/` 파일도 계속 동작하지만, 문서에서는 custom commands가 skills로 통합되었다고 설명합니다.

이 저장소에서는 [../../../.claude/commands/dev-feature.md](../../../.claude/commands/dev-feature.md) 같은 legacy 형태와 [../../../.claude/skills/dev-workflow/SKILL.md](../../../.claude/skills/dev-workflow/SKILL.md) 같은 skill 형태를 함께 볼 수 있습니다.

## Q6. Codex의 subagent는 자동으로 항상 실행되는가?

현재 공식 문서 기준으로는 아닙니다. Codex는 subagent를 **명시적으로 요청했을 때** 실행한다고 설명합니다. 그래서 초보자는 먼저 skill과 지침 파일을 익히고, subagent는 고급 역할 분리 도구로 이해하는 편이 좋습니다.

## Q7. Claude Code의 subagent는 어떻게 부를 수 있나?

공식 문서 기준으로는 세 가지 감각이 있습니다.

- 자연어로 이름을 말해 위임 유도
- `@` mention으로 특정 subagent 보장 호출
- `--agent`나 관련 설정으로 세션 전체에 agent 성격 적용

즉, `Codex`보다 호출 UX가 좀 더 다양하게 드러납니다.

## Q8. 이 저장소에서 초보자가 제일 먼저 열어볼 파일은 무엇인가?

비교 목적이라면 아래 순서가 좋습니다.

1. Codex skill 예시: [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md)
2. Codex custom agent 예시: [../../../.codex/agents/kit-codex-sync-reviewer.toml](../../../.codex/agents/kit-codex-sync-reviewer.toml)
3. Claude Code subagent 예시: [../../../.claude/agents/kit-sync-agent.md](../../../.claude/agents/kit-sync-agent.md)
4. Claude Code skill 예시: [../../../.claude/skills/dev-workflow/SKILL.md](../../../.claude/skills/dev-workflow/SKILL.md)
5. Claude Code settings 예시: [../../../.claude/settings.json](../../../.claude/settings.json)

## Q9. 이 저장소에 Codex용 `AGENTS.md`가 없으면 Codex 설명은 못 하는가?

아닙니다. 제품 기능 설명은 공식 문서 기준으로 가능하고, 저장소 예시는 실제로 존재하는 skill과 custom agent부터 연결하면 됩니다. 오히려 이렇게 하면 "공식 개념"과 "현재 브랜치의 실제 예시"를 구분해서 설명할 수 있습니다.

## Q10. 둘 중 하나만 먼저 배워야 한다면?

비교 학습 목적이라면:

- 지침/설정 분리를 배우고 싶으면 `Claude Code`
- repo-local skill과 custom agent 예시를 빨리 체감하고 싶으면 `Codex`

둘 다 본다면 `skill` 개념부터 공통으로 잡는 것이 가장 효율적입니다.

## Q11. Claude Code의 `.claude/rules/`는 Codex `rules`와 같은가?

아니요. Claude Code의 `.claude/rules/`는 프로젝트 행동 지침을 여러 Markdown 파일로 나누고 path별로 로드하는 구조입니다. Codex `rules`는 공식 문서 기준으로 sandbox 밖에서 실행할 command 승인/권한을 제어하는 experimental 규칙에 가깝습니다.

따라서 Claude Code rules를 Codex로 옮길 때는 보통 `AGENTS.md`나 `skill`로 옮기는 것이 먼저이고, command 허용 정책만 Codex `rules` 후보로 봐야 합니다.

## Q12. Claude Code hooks는 Codex에서도 그대로 쓸 수 있나?

그대로 쓰는 것은 위험합니다. Codex에도 hooks 문서가 있지만 experimental이고 feature flag가 필요하며, 현재 공식 문서 기준으로 Windows support가 temporarily disabled입니다. 이 저장소의 현재 환경이 Windows이므로, hooks parity보다는 explicit verification command와 fallback artifact 패턴을 우선 설명하는 편이 안전합니다.

## Q13. `agent-memory`는 Codex memories와 같은가?

부분적으로만 비슷합니다. 둘 다 이전 작업에서 얻은 유용한 맥락을 다음 작업에 가져오는 목적은 있지만, 팀 규칙의 source of truth로 쓰면 안 됩니다. 중요한 규칙은 `AGENTS.md`, `CLAUDE.md`, checked-in docs, skill reference에 남기고, memory는 보조 recall layer로 봐야 합니다.

## Q14. Claude Code command를 Codex에서는 무엇으로 바꿔야 하나?

대부분은 Codex `skill`부터 검토합니다. 배포가 필요하면 plugin으로 묶고, 단순 세션 제어는 Codex built-in slash command를 사용합니다. 검증이나 운영 절차가 핵심인 command라면 skill 본문에 실행해야 할 명령과 조건을 명시하는 것이 좋습니다.

## 공식 문서

- OpenAI Codex: [Subagents](https://developers.openai.com/codex/subagents), [Agent Skills](https://developers.openai.com/codex/skills), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Build plugins](https://developers.openai.com/codex/plugins/build), [Rules](https://developers.openai.com/codex/rules), [Hooks](https://developers.openai.com/codex/hooks), [Memories](https://developers.openai.com/codex/memories)
- Claude Code: [Subagents](https://code.claude.com/docs/en/sub-agents), [Skills](https://code.claude.com/docs/en/skills), [Memory / CLAUDE.md](https://code.claude.com/docs/en/memory), [Settings](https://code.claude.com/docs/en/settings), [Plugins](https://code.claude.com/docs/en/plugins), [Commands](https://code.claude.com/docs/en/commands), [Hooks](https://code.claude.com/docs/en/hooks)
