# Option B Detail Pack Overview

## Purpose

이 문서는 `Hybrid Claude Team (Session-Aware Orchestration)`의 상세 구현 설명 문서군 인덱스다.
루트 문서가 비교와 추천 결정을 담당한다면,
이 폴더는 실제 구현자가 `Option B`를 설계와 문서, 자산 정의 수준으로 구체화할 때 읽는 설명 묶음이다.

## Audience

이 폴더의 주 독자는 아래와 같다.

- Option B를 실제 문서 구조와 구현 사양으로 옮길 구현자
- `skills`, `commands`, `hooks`, `rules` 추가 설계를 맡은 설계자
- `ai-worker` 같은 workload에 Option B를 적용할 리드 구현자

## Read After

- [03-option-b-hybrid-claude-team.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/03-option-b-hybrid-claude-team.md)
- [06-recommended-operating-model.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/06-recommended-operating-model.md)
- [07-additions-backlog.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/07-additions-backlog.md)
- [08-review-integration-plan.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/08-review-integration-plan.md)

## Read Next

- [01-session-modes-and-handoffs.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/01-session-modes-and-handoffs.md)

## Why Option B

Option B는 아래 두 요구를 동시에 만족시키기 위한 절충안이다.

| 요구 | Option B의 답 |
| --- | --- |
| 기존 `plan-*`, `dev-*`, `verify` backbone을 버리고 싶지 않다 | backbone은 유지하고 운영층만 덧댄다 |
| `ai-worker`처럼 `program -> package -> ticket bundle` 계층이 분명한 workload를 더 부드럽게 밀고 싶다 | bundle, session mode, ownership 규칙을 추가한다 |

Option A는 도입이 가장 쉽지만 운영자가 병목이 되기 쉽다.
Option C는 강력하지만 지금 당장 구현하기에는 구조가 무겁다.
Option B는 그 중간에서
"지금 있는 자산을 최대한 살리면서 팀 오케스트레이션 감각을 추가하는 안"으로 위치한다.

## What Session-Aware Means

`Session-Aware`는 "무조건 멀티세션"을 뜻하지 않는다.
뜻은 더 단순하다.

- 세션 경계를 고려해 문서와 handoff를 설계한다
- 필요 없을 때는 단일 세션으로 간다
- handoff가 길어지거나 병렬 위험이 생길 때만 mode를 올린다

즉, Option B는 고정된 팀 모양이 아니라
workload 크기와 리스크에 반응하는 운영 모델이다.

## Core Terms

| 용어 | 요약 정의 |
| --- | --- |
| `Operator Session` | bundle 전달과 stage 진행을 중재하는 기준 세션 |
| `Elastic Team Topology` | workload와 리스크에 따라 팀 구성을 조절하는 원칙 |
| `Session Mode` | `Compact`, `Handoff`, `Isolated Parallel` 중 하나의 운영 방식 |
| `Session Boundary Policy` | 언제 세션을 나누고 언제 한 세션에 머무를지 정하는 기준 |
| `Handoff Bundle` | stage 간 전달의 최소 표준 묶음 |
| `Session-Bootstrap Skill` | handoff bundle을 읽고 다음 stage를 여는 자산 |
| `File Ownership / Isolation Strategy` | 병렬 편집 충돌을 막는 규칙 |
| `subagent_type mapping` | 역할별 Claude Code agent type 선택 기준 |

## How To Read This Folder

이 폴더는 아래 순서로 읽으면 된다.

| 순서 | 문서 | 읽는 이유 |
| --- | --- | --- |
| 1 | [00-overview.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/00-overview.md) | 전체 그림과 루트 문서와의 관계를 잡는다 |
| 2 | [01-session-modes-and-handoffs.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/01-session-modes-and-handoffs.md) | 운영 mode와 handoff 프로토콜을 이해한다 |
| 3 | [02-asset-specification.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/02-asset-specification.md) | 실제 추가 자산의 목적과 최소 동작을 이해한다 |
| 4 | [03-ai-worker-walkthrough.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/03-ai-worker-walkthrough.md) | `ai-worker`에 어떻게 적용되는지 concrete example로 본다 |

## Relation To Root Docs

루트 문서는 비교와 추천을 담당하고,
이 폴더는 상세 설명과 구현 사양을 담당한다.

| Root summary doc | Option B detail doc | Why this split exists |
| --- | --- | --- |
| [03-option-b-hybrid-claude-team.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/03-option-b-hybrid-claude-team.md) | [00-overview.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/00-overview.md), [01-session-modes-and-handoffs.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/01-session-modes-and-handoffs.md) | 루트 문서는 비교안 요약이고, 상세 문서는 Option B만 깊게 설명한다 |
| [06-recommended-operating-model.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/06-recommended-operating-model.md) | [01-session-modes-and-handoffs.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/01-session-modes-and-handoffs.md) | 추천 운영 모델의 실제 mode 선택 기준과 handoff 구조를 풀어쓴다 |
| [07-additions-backlog.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/07-additions-backlog.md) | [02-asset-specification.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/02-asset-specification.md) | 백로그 우선순위를 asset 사양 수준으로 확장한다 |
| [08-review-integration-plan.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/08-review-integration-plan.md) | [00-overview.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/00-overview.md), [01-session-modes-and-handoffs.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/01-session-modes-and-handoffs.md), [02-asset-specification.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/02-asset-specification.md) | 리뷰 반영 이후의 정교한 설명 구조를 별도 폴더로 제공한다 |

## Implementation Reader's Checklist

이 폴더를 다 읽으면 구현자는 아래를 설명할 수 있어야 한다.

1. Option B의 정체성이 왜 `Session-Aware Orchestration`인지
2. 언제 `Compact Mode`, `Handoff Mode`, `Isolated Parallel Mode`를 쓰는지
3. handoff bundle이 어떤 구조를 가져야 하는지
4. 어떤 asset이 선행이고 어떤 asset이 조건부인지
5. `ai-worker`에서 `P1-02`를 기준으로 실제로 어떤 흐름이 나오는지

## Suggested Starting Point

처음 읽는 사람은 아래 질문으로 시작하면 좋다.

- 지금 내가 해결하려는 문제는 mode 선택 문제인가
- handoff bundle 표준화 문제인가
- 추가 asset 정의 문제인가
- `ai-worker` 같은 실제 workload 적용 문제인가

이 질문에 따라 바로 다음 문서를 고르면 된다.
