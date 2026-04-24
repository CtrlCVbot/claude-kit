# Runtime Surfaces

> Audience: Codex surface를 확인하려는 사용자
> Related: [../../30-reference/01-commands.md](../../30-reference/01-commands.md), [../../30-reference/02-agents.md](../../30-reference/02-agents.md), [../../30-reference/03-skills.md](../../30-reference/03-skills.md)

## Codex에서 보게 되는 surface

| surface | 경로 | 비고 |
|---|---|---|
| plugin commands | `plugins/claude-kit/commands/*.md` | command는 현재 plugin surface가 기본 |
| plugin agents | `plugins/claude-kit/agents/*.md` | plugin packaging 결과 |
| plugin skills | `plugins/claude-kit/skills/*/SKILL.md` | plugin packaging 결과 |
| direct-use agents | `.codex/agents/*.toml` | agent direct-use surface |
| direct-use skills | `.agents/skills/*/SKILL.md` | skill direct-use surface |
| runtime guidance | `AGENTS.md` | rules와 guidance 전달 surface |

## lookup 문서

- commands: [../../30-reference/01-commands.md](../../30-reference/01-commands.md)
- agents: [../../30-reference/02-agents.md](../../30-reference/02-agents.md)
- skills: [../../30-reference/03-skills.md](../../30-reference/03-skills.md)

이 문서는 어디에서 보이는가를 설명하고, 실제 source-of-truth와 유지보수 절차는 `sync` 축에서 다룹니다.