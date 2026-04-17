# Pilot Migration Candidates

> conversion 규칙을 검증할 대표 pilot 세트를 고정하는 문서

## 목적

모든 기능을 한 번에 전환하지 않고, 서로 다른 패턴을 대표하는 작은 세트로 먼저 기준을 검증한다.

## pilot 세트

| 패턴 | identity | 검증 포인트 |
|------|----------|------------|
| read-only subagent | `dev-architect` | `.toml` 기본 변환 |
| write-capable subagent | `plan-prd-writer` | `.toml + .contract.json` |
| command to skill | `dev-feature` | Claude command를 Codex skill로 재표현 |
| hook-pair | `dev-tdd-guard` | `.js + .hook.json` |
| skip | `session-wrap-suggest` | `codex-skip` 기준 검증 |

## pilot 성공 기준

- 5개 모두 Codex target 하나로 귀결된다.
- `auto-convert`, `convert-with-review`, `skip`가 실제 데이터로 검증된다.
- pilot 결과로 `05`와 `06`의 규칙이 흔들리지 않는다.

## pilot 이후 결정

- 같은 패턴의 나머지 기능을 bulk conversion으로 넘길 수 있는가
- 어떤 kind에 추가 수동 리뷰 규칙이 필요한가
- 어떤 skip 기준이 더 필요해지는가
