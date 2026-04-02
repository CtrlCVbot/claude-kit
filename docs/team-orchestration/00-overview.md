# Team Orchestration 개요

> **Document Status**: 이 문서 세트는 현재 구현 설명서가 아니라, claude-kit guide 계약 위에서 정렬된 **proposed design / pilot-aligned target**이다.

---

## 해결하는 문제

현재 claude-kit은 하나의 세션이 하나의 Feature를 순차 처리한다. 다수 Feature가 P1~P7 + A~E 파이프라인을 거쳐야 하는 경우 직렬 병목, 컨텍스트 단절, 수동 게이트 관리, 상태 파편화 문제가 발생한다.

Team Orchestration은 정규화된 Feature 단위를 DAG 기반 의존성과 Phase Gate로 **병렬 조율**하는 계층이다.

---

## 불변 계약

| # | 계약 | 의미 |
|---|------|------|
| 1 | `Blueprint = source spec` | 블루프린트 원본은 참조만 한다 |
| 2 | `Approved PRD = execution SSOT` | 개발 공식 입력은 승인된 PRD다 |
| 3 | `Entry Assessment first` | 오케스트레이션은 진입점 판정 이전 계층이 아니다 |
| 4 | `Feature registry input` | 오케스트레이터는 정규화된 feature registry를 입력으로 받는다 |
| 5 | `stage-manifest single-writer` | Team Lead만 상태를 기록한다 |
| 6 | `Phase B = Human Review` | 개발 승인 게이트 명칭 통일 |
| 7 | `/dev-verify = DVC 6항목` | 개발 검증 의미 고정 |
| 8 | `Pilot appendix separation` | ds-customizer는 본문이 아니라 appendix/pilot consumer |

---

## 범용 설계 원칙

### 원칙 1: 기존 에이전트/스킬 재사용 우선

오케스트라 지휘자가 악기를 연주하지 않듯이, Orchestration Layer는 `/plan-prd`나 `/dev-run`을 직접 실행하지 않고 적절한 에이전트에게 위임한다. 기존 12개 에이전트와 23개 스킬을 그대로 호출한다.

### 원칙 2: Feature 단위 격리 (slug 기반)

각 Feature는 고유한 `slug`로 식별되며, 모든 산출물은 slug별 디렉토리에 격리된다. Feature 에이전트가 자신의 slug 외부 파일을 수정하는 것은 금지된다.

### 원칙 3: DAG 기반 의존성

Feature 간 의존성을 Directed Acyclic Graph로 모델링한다. DAG의 간선은 "선행 Feature의 `/dev-verify` PASS"를 의미한다. 순환 의존성이 감지되면 즉시 중단한다.

### 원칙 4: 승인 게이트는 사용자 주도

자동화할 수 있는 검증은 자동화하되, 의사결정 게이트(P2 RICE 승인, Phase B Human Review)는 반드시 사용자 승인을 거친다.

### 원칙 5: 실패 격리

한 Feature의 실패가 독립된 다른 Feature의 진행을 차단하지 않는다. Foundation Feature 실패만 예외적으로 모든 후속 Feature를 대기시킨다.

---

## 파이프라인 위치

```
Blueprint source spec
  → Entry Assessment
  → Fast-Track Intake / Normalization
  → Approved PRD + Bridge path
  → Feature Registry
  → Team Orchestration      ← 이 계층
  → Feature Agents
```

오케스트레이터는 위 흐름 중 앞의 4단계를 대체하지 않는다. 그 결과물을 소비한다.

---

## 문서 세트 목차

| # | 문서 | 설명 |
|---|------|------|
| -- | [QUICKSTART.md](./QUICKSTART.md) | **실행 가이드: 팀 AI 시작하기** |
| 00 | **이 문서** | 개요, 불변 계약, 설계 원칙 |
| 01 | [01-orchestration-input-model.md](./01-orchestration-input-model.md) | 입력 계약: Feature Registry 정의 |
| 02 | [02-operating-model.md](./02-operating-model.md) | 운영 모델: Team Lead / Feature Agent / Specialist 역할 분리 |
| 03 | [03-scheduler-and-dependencies.md](./03-scheduler-and-dependencies.md) | DAG 스케줄링, Wave, Ready Queue, 실패 전파 |
| 04 | [04-state-gates-lifecycle.md](./04-state-gates-lifecycle.md) | stage-manifest 확장, 게이트 3종, Lifecycle |
| 05 | [05-assets-and-integration.md](./05-assets-and-integration.md) | claude-kit 자산 매핑, 신규 컴포넌트 Proposal |
| 06 | [06-ds-customizer-pilot.md](./06-ds-customizer-pilot.md) | ds-customizer Pilot: 8-Feature 예시 |
| 07 | [07-rollout-roadmap.md](./07-rollout-roadmap.md) | 도입 로드맵, 구현 순서 |

### 독자별 읽기 순서

| 독자 | 순서 |
|------|------|
| 처음 사용 | **QUICKSTART** → 06 |
| 전체 이해 | 00 → 01 → 02 → 03 → 04 → 05 → 07 |
| 구현 담당자 | 00 → 02 → 03 → 04 → 05 → 07 |
| 파일럿 운영자 | QUICKSTART → 00 → 01 → 06 |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [guide/00-overview.md](../guide/00-overview.md) | claude-kit 전체 워크플로우 |
| [guide/08-dev-workflow.md](../guide/08-dev-workflow.md) | 개발 워크플로우 Phase A~E |
| [guide/09-architecture.md](../guide/09-architecture.md) | 아키텍처 + 컴포넌트 카탈로그 |
| [guide/12-blueprint-fast-track.md](../guide/12-blueprint-fast-track.md) | 블루프린트 Fast-Track |
