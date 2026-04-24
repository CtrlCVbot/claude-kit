# Generated Output Boundaries

> Audience: maintainer
> Related: [01-source-of-truth.md](01-source-of-truth.md), [../codex/02-runtime-surfaces.md](../codex/02-runtime-surfaces.md)

## generated output으로 취급해야 하는 것

| 경로 | 역할 |
|---|---|
| `plugins/claude-kit/**` | Codex plugin packaging output |
| `.agents/skills/**` | Codex direct-use skill output |
| `.codex/agents/*.toml` | Codex direct-use agent output |
| `AGENTS.md` managed section | Codex runtime guidance output |

## 하지 말아야 할 것

- generated output을 primary fix path로 삼기
- `AGENTS.md`를 source tree 대용으로 사용하기
- plugin output 수정만으로 parity가 해결된다고 가정하기

## 올바른 흐름

1. source와 metadata를 수정합니다.
2. emitter를 다시 실행합니다.
3. generated output과 guide 설명을 검증합니다.