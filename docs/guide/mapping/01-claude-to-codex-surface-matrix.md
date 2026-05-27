# Claude to Codex Surface Matrix

> Audience: dual-use 사용자, maintainer
> Related: [02-pairing-registry-and-exceptions.md](02-pairing-registry-and-exceptions.md), [../codex/02-runtime-surfaces.md](../codex/02-runtime-surfaces.md), [../sync/01-source-of-truth.md](../sync/01-source-of-truth.md)

## 대응 매트릭스

| 구성 요소 | Claude primary surface | Codex surface | 메모 |
|---|---|---|---|
| command | `.claude/commands/*.md` | `plugins/claude-kit/commands/*.md`, 필요 시 `.agents/skills/*/SKILL.md` | 복합 agentic command는 command wrapper + workflow skill을 기본으로 함 |
| agent | `.claude/agents/*.md` | `plugins/claude-kit/agents/*.md`, `.codex/agents/*.toml` | plugin과 direct-use 동시 존재 |
| skill | `.claude/skills/*/SKILL.md` | `plugins/claude-kit/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md` | plugin과 direct-use 동시 존재 |
| hook | `.claude/hooks/*.js` | Codex direct/fallback 전략에 따라 다름 | portability metadata 필요 |
| rule/guidance | `.claude/rules/*.md` | `AGENTS.md` managed section | 1:1 파일 복제가 아님 |

## 이 문서의 의미

- 같은 기능과 같은 파일은 다릅니다.
- Codex surface는 plugin output과 direct-use output이 함께 존재할 수 있습니다.
- Claude command가 긴 절차, 역할 위임, 검증 규칙을 포함하면 Codex에서는 command file을 실행 본체로 보지 않고 `workflow skill + subagent`로 재표현합니다.
- 이 경우 pairing registry는 command entry에 `primaryCodex: "skill"`, `transitionState: "command-wrapper"`, `codexSkill`을 기록합니다.
- hook과 rule은 command, agent, skill과 같은 방식으로 이해하면 오해가 생깁니다.
