# Claude Code 중심 개념과 Codex 대안

> **Status**: Draft (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **Related**: [04-codex-vs-claude-code-feature-comparison.md](04-codex-vs-claude-code-feature-comparison.md), [07-agent-capability-matrix.md](07-agent-capability-matrix.md)

`Claude Code`에는 `.claude/commands/`, `.claude/rules/`, hooks, agent memory처럼 프로젝트 안에서 눈에 잘 보이는 개념이 많습니다. `Codex`에도 `slash commands`, `rules`, `hooks`, `memories` 문서가 있지만, 이름이 같거나 비슷하다고 해서 바로 같은 기능으로 보면 안 됩니다.

초보자에게 가장 안전한 이해 방식은 다음입니다. **직접 대응되는지, 부분 대응인지, 설계로 보완해야 하는지**를 먼저 나누고, 그다음 Codex에서 쓸 수 있는 대안을 고릅니다.

## 전체 대응표

| Claude Code 개념 | 역할 | Codex 직접 대응 여부 | Codex에서 가능한 대안 | 이 저장소 적용 제안 |
|------|------|------|------|------|
| `.claude/commands/` | 세션 안에서 `/command`로 실행하는 반복 작업 entrypoint | 부분 대응 | Codex built-in slash command, `skill`, plugin command, 명시 프롬프트 | 신규 반복 절차는 Codex `skill`로 먼저 작성 |
| `.claude/rules/` | 프로젝트 지침을 여러 파일로 나누고 path별로 조건부 로딩 | 부분 대응 | `AGENTS.md`, Codex `skill`, Codex `rules`는 권한/명령 승인용으로 분리 | 행동 지침은 `AGENTS.md`/skill, 명령 허용 정책은 Codex `rules`로 분리 |
| Claude Code hooks | tool lifecycle에 끼어들어 차단, 검증, 알림, agent/prompt hook 실행 | 부분 대응 | Codex hooks는 experimental, feature flag 필요, Windows disabled; 대안은 명시 검증 command와 fallback artifact | 중요한 guard는 `node scripts/...` 검증 명령으로 문서화하고, 가능하면 Codex hook은 후속 실험으로 분리 |
| `agent-memory` / auto memory | Claude 또는 subagent가 다음 세션에 쓸 학습 내용을 저장 | 부분 대응 | Codex memories는 off by default인 local recall layer; 팀 규칙은 `AGENTS.md`/문서에 유지 | agent별 운영 기억은 문서/skill references로 고정하고, 개인 recall은 Codex memories에 맡김 |
| `settings.json` | 권한, 환경 변수, hooks, agent 등 강제 설정 | 부분 대응 | `~/.codex/config.toml`, repo config, `rules`, hooks feature flag | 강제 정책은 Codex config/rules, 행동 지침은 `AGENTS.md`로 분리 |
| `CLAUDE.md` / `CLAUDE.local.md` | 프로젝트/개인 지침과 메모리 로딩 | 부분 대응 | `AGENTS.md`, `AGENTS.override.md`, skill, checked-in docs | 공유 규칙은 `AGENTS.md`, 개인 규칙은 global 또는 override로 분리 |
| `.claude/` project-local 구성 | agent, skill, command, hook, rules를 한 디렉터리에 배치 | 직접 동치 없음 | `.agents/skills/`, `.codex/agents/`, `.codex/hooks.json`, plugin 구조 | Codex 예시는 project-local skill/agent부터 만들고 plugin 승격은 후속 |

## 1. `commands`

Claude Code의 `commands`는 세션 안에서 `/`로 빠르게 실행하는 entrypoint입니다. 최신 공식 문서 기준으로는 built-in command와 bundled skill이 함께 보이며, 직접 추가하는 반복 작업은 `skills` 문서와 더 가깝게 설명됩니다. 기존 `.claude/commands/` 파일은 계속 동작하지만, 새로 설명할 때는 skill 중심으로 보는 편이 안전합니다.

Codex에도 slash commands가 있습니다. 다만 Codex CLI 공식 문서는 `/model`, `/permissions`, `/agent`, `/status`처럼 **세션 제어용 built-in slash command**를 중심으로 설명합니다. 따라서 Claude Code의 project command를 Codex에 그대로 옮긴다고 보는 것은 위험합니다.

Codex 대안:

- 반복 절차는 `skill`로 작성한다.
- 배포가 필요하면 plugin에 포함한다.
- 단발성 작업은 명시 프롬프트 또는 문서화된 manual workflow로 둔다.
- 검증이 필요한 command 성격이면 실행할 명령을 skill 본문에 명확히 적는다.

이 저장소 적용:

- Claude Code legacy command 예시: [../../../.claude/commands/dev-feature.md](../../../.claude/commands/dev-feature.md)
- Codex 대안 예시: [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md)

## 2. `rules`

Claude Code의 `.claude/rules/`는 프로젝트 지침을 여러 Markdown 파일로 나누고, 필요하면 `paths` frontmatter로 특정 파일 패턴에만 로드되게 만드는 구조입니다. 이 rules는 행동 지침에 가깝습니다.

Codex에도 `rules` 문서가 있지만, 역할이 다릅니다. Codex rules는 sandbox 밖에서 실행할 수 있는 명령을 제어하는 experimental 승인/권한 규칙에 가깝습니다. 따라서 Claude Code의 `.claude/rules/testing.md`를 Codex `rules/default.rules`로 그대로 옮기면 목적이 달라집니다.

Codex 대안:

- 넓은 프로젝트 지침은 `AGENTS.md`에 둔다.
- path별 절차나 반복 체크리스트는 `skill`로 분리한다.
- shell command 허용/승인 정책은 Codex `rules`로 둔다.
- 팀 전체가 반드시 따라야 하는 규칙은 checked-in docs에도 남긴다.

이 저장소 적용:

- Claude Code rules 예시: [../../../.claude/rules/verification.md](../../../.claude/rules/verification.md)
- Codex 대안은 "검증 원칙은 `AGENTS.md` 또는 skill", "명령 승인 정책은 Codex rules"로 분리하는 방식을 권장합니다.

## 3. `hooks`

Claude Code hooks는 tool lifecycle에 강하게 연결되어 있습니다. `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop` 같은 이벤트에서 command, HTTP, prompt, agent hook을 실행하고, 경우에 따라 작업을 차단하거나 추가 검증을 수행할 수 있습니다.

Codex에도 hooks 공식 문서가 있으며, custom script를 agentic loop에 주입하는 기능으로 설명됩니다. 다만 현재 공식 문서 기준으로 experimental이고, `config.toml` feature flag가 필요하며, Windows support가 temporarily disabled라고 명시되어 있습니다. 이 저장소 사용 환경이 Windows인 점을 고려하면, Claude Code hooks와 같은 방식으로 바로 의존하기는 어렵습니다.

Codex 대안:

- 필수 검증은 명시 실행 명령으로 skill에 적는다.
- hook이 하던 알림은 fallback artifact나 closeout checklist로 바꾼다.
- 생성물 검증은 `node scripts/setup.js --dry-run`처럼 explicit verification command로 둔다.
- hook parity가 필요한 경우 Codex hook은 별도 실험/후속 과제로 분리한다.

이 저장소 적용:

- Claude Code hook 예시: [../../../.claude/hooks/dev-tdd-guard.js](../../../.claude/hooks/dev-tdd-guard.js)
- Codex-facing 검증 예시: [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md)

## 4. `agent-memory`

Claude Code는 auto memory와 subagent memory를 설명합니다. `CLAUDE.md`는 사람이 쓰는 지침이고, auto memory는 Claude가 반복 패턴과 학습 내용을 저장하는 recall layer입니다. subagent도 자기 memory를 가질 수 있습니다.

Codex에도 memories가 있습니다. 공식 문서 기준으로 Codex memories는 off by default이며, 이전 thread의 안정적인 선호, 반복 워크플로, 기술 스택, 알려진 함정 등을 다음 작업에 가져오는 local recall layer입니다. 다만 팀이 반드시 따라야 하는 규칙은 memory가 아니라 `AGENTS.md`나 checked-in docs에 두라고 설명합니다.

Codex 대안:

- 팀 규칙과 작업 절차는 `AGENTS.md`, docs, skill에 고정한다.
- 개인적 선호나 반복 학습은 Codex memories에 맡긴다.
- agent별 장기 운영 지식은 skill `references/`나 문서로 version-controlled 형태를 우선한다.
- memory만 믿고 중요한 guard를 생략하지 않는다.

이 저장소 적용:

- repo-specific agent memory 예시: [../../../.claude/agent-memory/kit-sync-agent/MEMORY.md](../../../.claude/agent-memory/kit-sync-agent/MEMORY.md)
- Codex에서는 이 내용을 그대로 "자동 agent memory"로 옮기기보다, 검증 가능한 지식은 skill reference나 docs로 승격하는 편이 안전합니다.

## 5. `settings.json`, `CLAUDE.md`, `.claude/` 구조

Claude Code는 `.claude/` 디렉터리 아래에 agents, skills, commands, hooks, rules, settings를 모아두는 project-local 구성이 매우 눈에 잘 보입니다. 초보자에게는 이 구조가 "Claude Code 확장 패키지"처럼 느껴질 수 있습니다.

Codex는 같은 이름의 `.codex/` 하나로 모든 것을 동일하게 담는 구조라고 단정하면 안 됩니다. 이 저장소에서도 Codex skill은 [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md)에 있고, custom agent는 [../../../.codex/agents/kit-codex-sync-reviewer.toml](../../../.codex/agents/kit-codex-sync-reviewer.toml)에 있습니다. plugin으로 배포할 때는 또 별도 manifest와 marketplace 개념이 들어옵니다.

Codex 대안:

- 지침: `AGENTS.md`
- 반복 절차: `.agents/skills/<name>/SKILL.md`
- 보조 에이전트: `.codex/agents/*.toml`
- lifecycle script: `.codex/hooks.json` 또는 user/repo hooks, 단 현재 제약 확인 필요
- 배포: plugin + marketplace

## 초보자용 결론

- `commands`는 Codex에서 skill 또는 plugin command 후보로 해석한다.
- `.claude/rules/`는 Codex `rules`와 목적이 다르다. 행동 지침은 `AGENTS.md`/skill에 둔다.
- Claude Code hooks와 Codex hooks는 이름이 같아도 성숙도와 지원 환경이 다르다.
- `agent-memory`는 Codex memories와 일부 비슷하지만, 팀 규칙의 source of truth로 쓰면 안 된다.
- `.claude/` 구조 전체를 Codex에 1:1로 복제하려 하지 말고, 지침/skill/agent/plugin/검증 명령으로 역할을 다시 나눈다.

## 공식 문서

- OpenAI Codex: [Slash commands](https://developers.openai.com/codex/cli/slash-commands), [Rules](https://developers.openai.com/codex/rules), [Hooks](https://developers.openai.com/codex/hooks), [Memories](https://developers.openai.com/codex/memories), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Agent Skills](https://developers.openai.com/codex/skills)
- Claude Code: [Commands](https://code.claude.com/docs/en/commands), [Memory / rules](https://code.claude.com/docs/en/memory), [Hooks](https://code.claude.com/docs/en/hooks), [Subagents](https://code.claude.com/docs/en/sub-agents), [Skills](https://code.claude.com/docs/en/skills), [Settings](https://code.claude.com/docs/en/settings)
