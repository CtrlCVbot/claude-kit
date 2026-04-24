# Core Concepts

> Audience: 모든 사용자
> Related: [00-overview.md](00-overview.md), [../mapping/02-pairing-registry-and-exceptions.md](../mapping/02-pairing-registry-and-exceptions.md), [../sync/01-source-of-truth.md](../sync/01-source-of-truth.md)

## 용어 요약

| 용어 | 의미 |
|---|---|
| domain | `core`, `dev`, `plan`, `copy`처럼 기능 묶음을 나누는 단위 |
| target | `claude`, `codex`처럼 출력이 향하는 runtime 대상 |
| component type | command, agent, skill, hook, rule 같은 구성 요소 유형 |
| pairing | Claude와 Codex 자산 사이의 대응 관계 |
| SSOT | live source와 metadata가 모이는 single source of truth |
| profile | 설치 시 활성화할 domain, target, project 메타데이터를 담는 설정 |

## 이해 순서

1. domain은 무슨 일을 하느냐를 나눕니다.
2. target은 어디에 배포되느냐를 나눕니다.
3. component type은 어떤 surface로 제공되느냐를 나눕니다.
4. pairing과 exception은 Claude/Codex 대응 상태를 설명합니다.
5. SSOT는 어떤 파일을 믿어야 하는지 결정합니다.

## 중요 원칙

- generated output은 결과물이지 primary edit target이 아닙니다.
- Claude와 Codex는 같은 경험을 목표로 하지만 surface는 완전히 같지 않습니다.
- guide는 흐름을 설명하고, reference는 lookup을 담당합니다.