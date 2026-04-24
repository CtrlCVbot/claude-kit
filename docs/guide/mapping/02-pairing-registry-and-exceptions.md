# Pairing Registry and Exceptions

> Audience: 대응 상태를 이해하려는 사용자
> Related: [../../30-reference/07-pairing-registry.md](../../30-reference/07-pairing-registry.md), [../sync/01-source-of-truth.md](../sync/01-source-of-truth.md)

## pairing registry가 설명하는 것

| 항목 | 의미 |
|---|---|
| `paired` | Claude와 Codex 양쪽이 정렬된 상태 |
| `codex-skip` | Codex로 1:1 이식하지 않기로 확인된 상태 |
| `unpaired` | 아직 Codex 정렬이 끝나지 않은 상태 |
| `primaryCodex` | Codex에서 어떤 surface를 공식 경로로 보는지 |
| `transitionState` | 이행 중 상태인지 여부 |
| `driftStatus` | 대응 자산 사이 drift 여부 |

## exception과 portability

- `src/exception-registry.json`은 skip, fallback, review 이유를 설명합니다.
- `src/claude/_meta/codex-portability.json`은 hook portability 전략을 설명합니다.

세부 lookup은 [../../30-reference/07-pairing-registry.md](../../30-reference/07-pairing-registry.md)에서 확인하세요.