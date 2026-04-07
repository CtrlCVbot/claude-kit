# Reference Profile: notion-intake-screening

**한 줄 요약:** 이 profile은 Notion pain-point DB에서 들어오는 운영 입력을 `claude-kit` planning 구조에 연결하는 외부 intake + screening sync 흐름을 공통 오케스트레이션 모델로 설명한다.

## 1. problem shape

이 profile은 "사람이 직접 정리한 아이디어"가 아니라 "외부 운영 도구에 쌓이는 pain-point row"를 planning 시스템으로 들여오는 문제를 다룬다.

핵심 특징은 아래와 같다.

- 입력이 Notion DB row 단위로 들어온다.
- 일부는 `bug/error`, 일부는 `change-request`다.
- change-request는 여러 row를 하나의 idea 후보로 묶어야 한다.
- screening 결과는 local `.plans`와 Notion screening DB 양쪽에 남길 필요가 있다.
- v1에서는 `screened`까지만 책임지고 `approved`로 자동 승격하지 않는다.

## 2. phase mapping

### generic term translation

| Generic term | notion-intake-screening term |
| --- | --- |
| `OrchestrationProfile` | external intake + screening sync flow |
| `PhaseContract` | intake preparation, cluster review, screening sync |
| `StageContract` | Fetch/Normalize, Classify/Route, Cluster/Review, Screening/Sync |
| `ArtifactContract` | normalized snapshot, cluster candidate list, local idea/screening artifact, publish record |
| `EvidenceRecord` | source row provenance, review decision, publish status |

### family emphasis

| intake artifact or stage | Dominant family | 설명 |
| --- | --- | --- |
| Fetch/Normalize | `Discovery` | 외부 pain-point 데이터를 내부 계약에 맞게 정규화 |
| Classify/Route | `Discovery` | bug/error와 change-request를 정책적으로 분기 |
| Cluster/Review | `Specification` | change-request를 idea 후보로 정리하고 human checkpoint 수행 |
| Screening/Sync | `Specification` / `Operations` | local screening 산출물 생성 및 외부 screening DB sync |

## 3. team shape

| Family | primary team | supporting team |
| --- | --- | --- |
| `Discovery` | Planning Studio | Assurance Desk |
| `Specification` | Planning Studio | Assurance Desk |
| `Operations` | Planning Studio | Assurance Desk |

이 profile에서는 새 팀을 만드는 것보다 기존 `Planning Studio`가 owner가 되고, `Assurance Desk`가 publish policy와 dedupe 관점에서 지원하는 구조가 적합하다.

## 4. gate points

| gate point | generic gate 해석 | 목적 |
| --- | --- | --- |
| bug/error auto-route | policy gate | 현재 동작 오류를 human checkpoint 없이 screening으로 보낼지 결정 |
| cluster review | human approval | 어떤 row 묶음이 하나의 idea인지 최종 확정 |
| screening publish dedupe | automated verification | 같은 source row 또는 cluster를 중복 publish하지 않도록 보장 |
| approve handoff exclusion | scope boundary gate | v1에서 `approved -> P3` 자동 진입을 막아 범위를 제한 |

## 5. artifacts/evidence

| 단계 | artifact | evidence |
| --- | --- | --- |
| Fetch/Normalize | normalized snapshot | source row id, source URL, capturedAt |
| Classify/Route | routing result | classification rationale |
| Cluster/Review | candidate idea list, reviewed idea set | human review decision, merge/split reason |
| Screening/Sync | local `IDEA`, local `SCREENING`, publish record | publish status, dedupe key, mirrored row id |

## 6. what is generic vs product-specific

### generic

- external intake를 planning 앞단의 별도 책임으로 두는 방식
- bug/error와 change-request를 다른 gate로 다루는 방식
- local artifact를 생성 근거로, 외부 DB를 mirror로 두는 방식
- cluster review를 human checkpoint로 두는 방식

### product-specific

- 실제 Notion DB property 이름
- 특정 pain-point 분류 용어
- cluster key 정의 방식
- screening DB 화면 구조와 필드 naming
- 어떤 수준까지 자동 publish를 허용할지에 대한 운영 정책
