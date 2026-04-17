# Fetch/Normalize Documentation Package

> canonical package path: `docs/notion-intake-screening/01-fetch-normalize/`

이 폴더는 `Fetch/Normalize` 단계의 설명과 구현 준비 문서를 한 묶음으로 정리한 패키지다. 목표는 기능 구현이 아니라, 구현자가 `stage behavior`, `asset responsibility`, `template contract`, `command integration`을 분리된 상태로 바로 읽을 수 있게 만드는 것이다.

## Purpose

- `Fetch/Normalize` 단계의 SSOT를 한 폴더로 정리한다.
- stage 문서와 asset 문서를 분리한다.
- 구현 전에 필요한 결정들을 문서 수준에서 잠근다.
- 다음 단계인 `Classify/Route`로 넘기는 handoff 계약까지 명확하게 남긴다.

## Read Order

1. [01-stage-spec.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/01-stage-spec.md)
2. [02-data-flow-and-decisions.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/02-data-flow-and-decisions.md)
3. [06-template-spec.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/assets/06-template-spec.md)
4. [02-agent-spec.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/assets/02-agent-spec.md)
5. [03-subagent-spec.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/assets/03-subagent-spec.md)
6. [01-skill-spec.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/assets/01-skill-spec.md)
7. [04-hook-spec.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/assets/04-hook-spec.md)
8. [05-rule-spec.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/assets/05-rule-spec.md)
9. [07-command-integration.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/assets/07-command-integration.md)
10. [01-doc-implementation-plan.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/plans/01-doc-implementation-plan.md)
11. [02-review-checklist.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/plans/02-review-checklist.md)

## Document Map

| 문서 | 역할 |
|---|---|
| `01-stage-spec.md` | `Fetch/Normalize` 단계 자체의 입출력, 순서, 실패 정책 |
| `02-data-flow-and-decisions.md` | schema discovery, row fetch, hydrate, persist의 흐름과 판단 기준 |
| `assets/01-skill-spec.md` | `plan-intake-workflow`의 `Fetch/Normalize` 책임 |
| `assets/02-agent-spec.md` | `plan-intake-reader`의 역할과 소유 범위 |
| `assets/03-subagent-spec.md` | schema reader, row fetcher, hydrator, persister 설계 |
| `assets/04-hook-spec.md` | `plan-intake-env-guard`의 guard 범위 |
| `assets/05-rule-spec.md` | 단계 invariant와 정책 고정 |
| `assets/06-template-spec.md` | `.plans/intake/*` 산출물 계약 |
| `assets/07-command-integration.md` | `/plan-intake-sync`와의 연결 계약 |
| `plans/01-doc-implementation-plan.md` | 문서 작성 및 정리 순서 |
| `plans/02-review-checklist.md` | 리뷰어가 볼 항목 |

## Review Questions

- stage spec과 asset spec의 역할 분리가 명확한가?
- `plan-intake-reader`와 4개 sub-agent의 책임 경계가 자연스러운가?
- `plan-intake-env-guard`가 stage logic과 중복되지 않는가?
- template 문서를 보고 `.plans/intake/` 산출물 구조를 구현자가 바로 만들 수 있는가?
- `Fetch/Normalize` 단계가 `Classify/Route`를 침범하지 않고 handoff만 정의하고 있는가?

## Boundaries

- 이 패키지는 문서 전용이다.
- `src/`, `scripts/`, registry, setup 관련 실제 구현은 다루지 않는다.
- `Classify/Route`, `Cluster/Review`, `Screening/Sync`의 상세 구현은 포함하지 않는다.
