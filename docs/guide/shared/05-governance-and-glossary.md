# Governance and Glossary

> Audience: 공통 운영 원칙을 확인하려는 사용자
> Related: [01-core-concepts.md](01-core-concepts.md), [../../30-reference/05-rules.md](../../30-reference/05-rules.md)

## governance 요약

- domain과 target을 섞어 설명하지 않습니다.
- guide와 reference를 분리합니다.
- generated output을 source of truth처럼 취급하지 않습니다.
- maintainer workflow를 일반 사용자 guide에 섞지 않습니다.

## 자주 보는 용어

| 용어 | 의미 |
|---|---|
| dual-use | Claude와 Codex를 함께 사용하는 구성 |
| direct-use surface | Codex에서 plugin 없이 직접 소비하는 skill/agent surface |
| plugin surface | `plugins/claude-kit/**` 아래에 생성되는 Codex plugin output |
| pairing registry | Claude/Codex 대응 상태를 기록하는 registry |
| portability | hook이 Codex에서 어떻게 이식/대체되는지 나타내는 metadata |

전체 catalog가 필요하면 [../../30-reference/05-rules.md](../../30-reference/05-rules.md)와 [../../30-reference/07-pairing-registry.md](../../30-reference/07-pairing-registry.md)를 참고하세요.