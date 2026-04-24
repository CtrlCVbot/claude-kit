# Core and Dev Domains

> Audience: Claude Code 중심 사용자
> Related: [02-plan-pipeline.md](02-plan-pipeline.md), [../../30-reference/01-commands.md](../../30-reference/01-commands.md), [../../30-reference/03-skills.md](../../30-reference/03-skills.md)

## domain 역할

| domain | 역할 |
|---|---|
| `core` | 기본 운영 규칙, 공통 command/skill/rule |
| `dev` | feature 구현 루프, TDD, verification, commit 흐름 |
| `plan` | idea에서 bridge까지 이어지는 planning pipeline |
| `copy` | catalog/reference에는 남아 있지만 이 guide의 주 흐름에는 포함하지 않는 보조 domain |

## 보통 이렇게 사용합니다

- 공통 작업 기반은 `core`
- 구현 중심 루프는 `dev`
- 기획과 설계는 `plan`
- `copy`는 현재 reference-first 성격이 강하므로 필요할 때 catalog를 lookup합니다.

## reference가 필요한 경우

- command 목록: [../../30-reference/01-commands.md](../../30-reference/01-commands.md)
- skill 목록: [../../30-reference/03-skills.md](../../30-reference/03-skills.md)
- agent 목록: [../../30-reference/02-agents.md](../../30-reference/02-agents.md)
