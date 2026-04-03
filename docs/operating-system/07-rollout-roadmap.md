# Rollout Roadmap

> 이 로드맵은 실행 엔진 구현이 아니라, 운영 가능한 문서/레지스트리 세트를 순서 있게 도입하기 위한 것이다. 각 단계는 다음 단계를 위해 필요한 의사결정을 먼저 닫도록 구성한다.

---

## 단계별 순서

| Phase | 목표 | 주요 산출물 | 완료 기준 |
|------|------|------------|----------|
| 1 | 경계 고정 | `00-overview`, `01-company-map` | `guide`, `team-orchestration`, `operating-system` 경계가 합의됨 |
| 2 | 레지스트리 정의 | `org-registry`, `pipeline-registry`, `asset-registry`, `metric-catalog`, `03-data-contracts` | ID 체계와 ownership/gate 모델이 고정됨 |
| 3 | 시각화 규칙 고정 | `04-visualization-spec` | 최소 5개 view가 어떤 데이터에서 생성되는지 명확함 |
| 4 | 대시보드 IA 고정 | `05-dashboard-ia` | 운영자가 읽을 기본 섹션과 카드가 정의됨 |
| 5 | 운영 cadence 고정 | `06-operating-rhythm` | review, triage, refresh 주기가 명확함 |
| 6 | pilot 투영 | 기존 `ds-customizer` 예시와 연결 | feature 하나 이상이 조직/파이프라인/asset view로 추적 가능 |

---

## 파일 작성 순서

1. [00-overview.md](./00-overview.md)
2. [01-company-map.md](./01-company-map.md)
3. [`../../.plans/operating-system/org-registry.yaml`](../../.plans/operating-system/org-registry.yaml)
4. [`../../.plans/operating-system/pipeline-registry.yaml`](../../.plans/operating-system/pipeline-registry.yaml)
5. [02-pipeline-map.md](./02-pipeline-map.md)
6. [`../../.plans/operating-system/asset-registry.yaml`](../../.plans/operating-system/asset-registry.yaml)
7. [`../../.plans/operating-system/metric-catalog.yaml`](../../.plans/operating-system/metric-catalog.yaml)
8. [03-data-contracts.md](./03-data-contracts.md)
9. [04-visualization-spec.md](./04-visualization-spec.md)
10. [05-dashboard-ia.md](./05-dashboard-ia.md)
11. [06-operating-rhythm.md](./06-operating-rhythm.md)
12. [07-rollout-roadmap.md](./07-rollout-roadmap.md)

이 순서를 유지하면 문서가 항상 registry를 참조하는 방향으로만 쓰이게 된다.

---

## 선후관계

- `01-company-map`은 `org-registry`가 있어야 안정된다.
- `02-pipeline-map`은 `pipeline-registry`와 함께 움직여야 한다.
- `04-visualization-spec`은 `RunSnapshot` 정의가 `03-data-contracts`에서 먼저 닫혀야 한다.
- `05-dashboard-ia`는 view spec과 metric placement가 정리된 뒤에 써야 중복이 없다.

---

## Pilot 적용 순서

### 1차 대상

- [team-orchestration/06-ds-customizer-pilot.md](../team-orchestration/06-ds-customizer-pilot.md)

### 투영 체크

- `ds-url-state` 같은 foundation feature가 어떤 team/role 아래 보이는가
- `ds-picker-system`이 어떤 stage와 gate에 위치하는가
- `ds-layout-assembly`의 blocker가 dependency DAG와 run-state 보드에 같은 의미로 나타나는가
- 관련 planning/delivery 자산의 ownerRoleId가 모두 채워져 있는가

---

## 다음 라운드 후보

- registry를 읽어 Markdown overview를 자동 생성하는 스크립트
- `RunSnapshot` 생성 규칙을 실제 command나 report 포맷으로 구체화
- stale doc, orphan asset을 자동 탐지하는 검증 스크립트

---

## 비목표

- 새 orchestration runtime 구현
- 새 approval engine 구현
- 기존 `guide`나 `team-orchestration`의 SSOT 치환
- 웹 대시보드 제품 구현

---

## 관련 문서

- [00-overview.md](./00-overview.md)
- [03-data-contracts.md](./03-data-contracts.md)
- [06-operating-rhythm.md](./06-operating-rhythm.md)
