# Data Contracts

> 운영 레이어는 기존 흐름을 요약해서 보여주기 때문에, 필드 정의와 참조 규칙이 불분명하면 바로 중복 SSOT가 된다. 이 문서는 어떤 ID를 쓰고, 무엇을 직접 저장하며, 무엇을 파생 계산하는지 고정한다.

---

## ID 규칙

| 항목 | 패턴 | 예시 |
|------|------|------|
| Team | `team-{slug}` | `team-planning-studio` |
| Role | `role-{slug}` | `role-quality-governance-lead` |
| Pipeline | `pipe-{slug}` | `pipe-delivery-lifecycle` |
| Stage | `stage-{pipeline-scope}-{name}` | `stage-plan-p4-prd` |
| Gate | `gate-{slug}` | `gate-phase-e-dvc` |
| Metric | `metric-{slug}` | `metric-registry-coverage-ratio` |
| Asset | `{type}-{slug}` | `command-plan-review` |

규칙:

- ID는 사람이 읽을 수 있어야 한다.
- 경로는 ID의 근거가 아니라 부가 정보다.
- 문서, dashboard, 표는 가능하면 이름보다 ID를 기준으로 연결한다.

---

## Registry 구성

| Registry | 파일 | 역할 |
|---------|------|------|
| `OrgRegistry` | [`org-registry.yaml`](../../.plans/operating-system/org-registry.yaml) | 팀과 역할의 책임 모델 |
| `PipelineRegistry` | [`pipeline-registry.yaml`](../../.plans/operating-system/pipeline-registry.yaml) | pipeline, stage, gate 계약 |
| `AssetRegistry` | [`asset-registry.yaml`](../../.plans/operating-system/asset-registry.yaml) | canonical agent/command/skill/hook/doc inventory |
| `MetricCatalog` | [`metric-catalog.yaml`](../../.plans/operating-system/metric-catalog.yaml) | dashboard 지표 정의 |

---

## 필드 계약

### OrgRegistry

| 필드 | 의미 |
|------|------|
| `teamId`, `teamName`, `mission` | 팀 식별과 존재 이유 |
| `roleIds` | 팀이 소유한 역할 목록 |
| `ownedPipelines` | 주 소유 파이프라인 |
| `kpiIds` | 팀 성과를 읽을 기본 지표 |

### RoleRegistry

| 필드 | 의미 |
|------|------|
| `roleId`, `teamId` | 역할 소속 |
| `responsibilities` | 역할이 닫아야 하는 결과 |
| `ownedAgentIds` | 책임 기준으로 소유하는 agent |
| `decisionRights` | 승인/예외/정책 결정권 |
| `handoffTargets` | 공식 handoff 대상 |

### PipelineRegistry / StageRegistry / GateRegistry

| 필드 | 의미 |
|------|------|
| `pipelineId`, `stageIds`, `gateIds` | 구조 자체의 뼈대 |
| `entryCriteria`, `exitCriteria` | pipeline의 입구와 출구 |
| `purpose` | 해당 stage가 존재하는 이유 |
| `inputs`, `outputs` | 문서와 dashboard에서 읽을 artifact 이름 |
| `blockingGates` | 해당 stage를 멈출 수 있는 gate |
| `type`, `decider`, `sla`, `passCriteria`, `failAction` | gate의 행동 규칙 |

### AssetRegistry

| 필드 | 의미 |
|------|------|
| `artifactId`, `artifactType` | inventory의 기본 키 |
| `sourcePathPattern` | 실제 repo 경로 또는 패턴 |
| `ownerRoleId` | 소유 책임을 가지는 role |
| `consumerIds` | 이 asset을 사용하는 stage, gate, role, command |
| `freshnessRule` | 변경 시점을 판별하는 규칙 |

### MetricCatalog

| 필드 | 의미 |
|------|------|
| `metricId`, `name`, `definition` | 지표 식별과 계산 기준 |
| `sourceRegistry` | 지표가 의존하는 registry 또는 파생 view |
| `refreshRule` | 언제 다시 계산해야 하는지 |
| `dashboardPlacement` | 기본 노출 위치 |

---

## RunSnapshot 규칙

`RunSnapshot`은 새 파일이 아니다. 아래 세 소스를 합친 파생 view다.

- feature registry
- dependency graph
- `stage-manifest.json`

예시:

```yaml
runSnapshot:
  featureSlug: ds-picker-system
  teamId: team-delivery-studio
  roleId: role-delivery-engineering-lead
  pipelineId: pipe-delivery-lifecycle
  currentStageId: stage-delivery-d-implementation
  currentGateId: gate-phase-e-dvc
  status: active
  blockedBy: []
  sourceRefs:
    featureRegistry: .plans/{project}/feature-registry.yaml
    dependencyGraph: .plans/{project}/dependency-graph.yaml
    stageManifest: .plans/stage-manifest.json
```

운영 원칙:

- `RunSnapshot`은 dashboard와 review를 위한 read model이다.
- 원본 state 수정은 항상 기존 SSOT에서만 일어난다.
- `RunSnapshot`에 없는 정보는 원본 SSOT에서 다시 읽어야 한다.

---

## 참조 규칙

- registry 간 참조는 경로가 아니라 ID를 우선한다.
- `AssetRegistry`는 revision/archive 문서를 포함하지 않는다.
- 한 asset은 정확히 한 번만 inventory에 등록된다.
- 한 asset은 최소 하나의 `ownerRoleId`와 연결되어야 한다.
- `consumerIds`는 비즈니스 의미가 있는 연결만 적고, 단순 간접 관계는 생략한다.

---

## 집계 규칙

수기 숫자 대신 registry에서 계산한다.

```text
agents  = count(assets where artifactType == "agent")
commands = count(assets where artifactType == "command")
skills = count(assets where artifactType == "skill")
hooks = count(assets where artifactType == "hook")
docs = count(assets where artifactType == "doc")
orphanAssets = assets where ownerRoleId is null or consumerIds is empty
```

이 규칙 때문에 문서 본문에서는 “현재 00개” 같은 숫자를 고정값으로 적지 않는다.

---

## 관련 문서

- [02-pipeline-map.md](./02-pipeline-map.md)
- [04-visualization-spec.md](./04-visualization-spec.md)
- [guide/revision/04-guide-source-alignment.md](../guide/revision/04-guide-source-alignment.md)
- [team-orchestration/04-state-gates-lifecycle.md](../team-orchestration/04-state-gates-lifecycle.md)
