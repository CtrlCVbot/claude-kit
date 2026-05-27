# Runtime Surfaces

> Audience: Codex surface를 확인하려는 사용자
> Related: [../../30-reference/01-commands.md](../../30-reference/01-commands.md), [../../30-reference/02-agents.md](../../30-reference/02-agents.md), [../../30-reference/03-skills.md](../../30-reference/03-skills.md)

## Codex에서 보게 되는 surface

| surface | 경로 | 비고 |
|---|---|---|
| plugin commands | `plugins/claude-kit/commands/*.md` | plugin packaging 또는 wrapper output. agentic workflow의 실행 본체로 보지 않음 |
| plugin agents | `plugins/claude-kit/agents/*.md` | plugin packaging 결과 |
| plugin skills | `plugins/claude-kit/skills/*/SKILL.md` | plugin packaging 결과 |
| direct-use agents | `.codex/agents/*.toml` | agent direct-use surface |
| direct-use skills | `.agents/skills/*/SKILL.md` | skill direct-use surface |
| runtime guidance | `AGENTS.md` | rules와 guidance 전달 surface |

## agentic workflow 기준

기획, 개발, 검증처럼 여러 단계와 역할 위임이 있는 기능은 Codex에서 `plugin command`만으로 설명하지 않습니다.
기본 기준은 `direct-use skill`이 workflow 본체를 담고, 필요한 경우 `.codex/agents/*.toml` subagent를 명시적으로 선택하는 방식입니다.

`plugins/claude-kit/commands/*.md`는 사용자가 익숙한 command 이름을 보존하거나 plugin package에 포함하기 위한 wrapper로 둘 수 있습니다.
하지만 절차, guardrail, output 규칙의 source of truth는 `.agents/skills/*/SKILL.md`와 관련 subagent에 둡니다.

## lookup 문서

- commands: [../../30-reference/01-commands.md](../../30-reference/01-commands.md)
- agents: [../../30-reference/02-agents.md](../../30-reference/02-agents.md)
- skills: [../../30-reference/03-skills.md](../../30-reference/03-skills.md)

이 문서는 어디에서 보이는가를 설명하고, 실제 source-of-truth와 유지보수 절차는 `sync` 축에서 다룹니다.
