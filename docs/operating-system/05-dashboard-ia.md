# Dashboard IA

> 대시보드는 새 앱이 아니라, 현재 repo 안에서 관리 가능한 Markdown 기반 운영 뷰를 뜻한다. 이 문서는 어떤 섹션을 어떤 순서로 배치할지와 각 섹션이 답해야 하는 질문을 정의한다.

---

## 기본 섹션

| Section | 운영 질문 | 데이터 소스 | 주 사용자 |
|--------|-----------|------------|----------|
| `Overview` | 지금 전체 상태가 어떤가 | `RunSnapshot`, `MetricCatalog` | 오너, 리드 전원 |
| `Teams` | 누가 무엇을 맡는가 | `OrgRegistry`, `AssetRegistry` | 오너, 팀 리드 |
| `Pipelines` | 어느 stage/gate가 병목인가 | `PipelineRegistry`, `RunSnapshot` | 기획/개발 리드 |
| `Agents` | 어떤 자동화 자산이 어떤 역할 아래 있는가 | `AssetRegistry` | 운영자, 품질 리드 |
| `Runs` | 현재 feature 실행 흐름은 어떤가 | `RunSnapshot`, dependency graph | 개발 리드 |
| `Blockers` | 무엇이 막고 있으며 누구 결정을 기다리는가 | `RunSnapshot` | 오너, 품질 리드 |
| `Assets` | 누락된 inventory나 owner 공백이 있는가 | `AssetRegistry` | 품질 리드 |
| `Metrics` | 이번 주에 좋아졌는가 나빠졌는가 | `MetricCatalog`, `RunSnapshot` | 오너 |

---

## 섹션 배치 원칙

- 위에서 아래로 갈수록 “경영 시야 -> 실행 세부”가 되도록 배치한다.
- 같은 정보를 다른 섹션에서 반복하지 않는다.
- 각 섹션은 하나의 대표 질문만 먼저 답하게 한다.
- drill-down은 `Overview -> Teams/Pipelines -> Runs/Blockers -> Assets/Metrics` 순으로 설계한다.

---

## Markdown 레이아웃 초안

```md
# Claude Kit Company OS Dashboard

## Overview
- Active runs
- Blocked features
- Approval wait hours

## Teams
- Team ownership table
- Role handoff map

## Pipelines
- Planning / Delivery / Orchestration / Operating review map
- Open gates

## Agents
- Agent ownership list
- Commands/skills coverage

## Runs
- Run-state board
- Dependency DAG

## Blockers
- Approval queue
- Dependency blockers

## Assets
- Registry coverage
- Orphan assets

## Metrics
- Weekly trend
- Exceptions
```

---

## 섹션별 기본 카드

### Overview

- active feature count
- blocked feature count
- approval wait hours
- verify pass rate

### Teams

- team mission table
- role ownership matrix
- cross-team handoff list

### Pipelines

- open gate list
- current stage distribution
- bridge-to-delivery latency

### Agents

- agent ownership list
- command to stage mapping
- skill to command mapping

### Runs

- feature stage board
- dependency DAG
- latest run snapshot updatedAt

### Blockers

- awaiting approval queue
- blocked by dependency list
- stale state alerts

### Assets

- orphan asset count
- docs excluded by scope
- missing ownerRoleId exceptions

### Metrics

- KPI definition table
- weekly delta
- action-required metrics

---

## 정보 구조 해석

- `Overview`는 상황판이다. 여기서 충분히 알 수 없을 때만 아래 섹션으로 내려간다.
- `Teams`와 `Pipelines`는 구조를 이해하기 위한 영역이다.
- `Runs`와 `Blockers`는 당장 조치할 대상을 찾기 위한 영역이다.
- `Assets`와 `Metrics`는 시스템 건강도를 보는 영역이다.

---

## 관련 문서

- [04-visualization-spec.md](./04-visualization-spec.md)
- [06-operating-rhythm.md](./06-operating-rhythm.md)
- [asset-registry.yaml](../../.plans/operating-system/asset-registry.yaml)
