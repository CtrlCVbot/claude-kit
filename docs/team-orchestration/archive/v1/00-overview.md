# Team Orchestration 개요

> **한 줄 요약**: 기존 claude-kit의 13개 에이전트와 23+ 스킬을 재사용하면서, 다수 Feature를 DAG 기반 의존성과 Phase Gate로 병렬 오케스트레이션하는 시스템.

---

## 1. 해결하는 문제

### 단일 에이전트 순차 실행의 한계

현재 claude-kit은 `/plan-idea` ~ `/dev-commit`까지 **하나의 세션이 하나의 Feature를 순차 처리**한다. ds-customizer처럼 8개 Feature가 P1~P7 + A~E 파이프라인을 거쳐야 하는 경우, 다음과 같은 문제가 발생한다:

| 문제 | 설명 |
|------|------|
| **직렬 병목** | F2~F5는 F1만 의존하므로 4개를 병렬로 진행할 수 있지만, 단일 세션에서는 순차 실행만 가능 |
| **컨텍스트 단절** | Feature 간 전환 시 세션 컨텍스트가 리셋되어 의존성 추적이 수동 |
| **수동 게이트 관리** | Phase 간 진입 조건(F1 완료 → Phase 2 시작)을 사용자가 직접 추적 |
| **실패 전파** | F4 실패 시 F8에 미치는 영향을 수동으로 판단해야 함 |
| **상태 파편화** | 각 Feature의 진행 상태가 `stage-manifest.json`, `backlog.md`, Git 이력에 분산 |

### Team Orchestration이 제공하는 것

- Feature 단위로 에이전트를 병렬 스폰하여 **독립 Feature 동시 진행**
- DAG 기반 의존성 추적으로 **자동 Phase Gate 관리**
- 중앙 상태 저장소(`orchestration-state.json`)로 **전체 진행 상황 단일 뷰**
- Feature 격리로 **실패 범위 제한** (한 Feature 실패가 다른 Feature에 전파되지 않음)

---

## 2. 범용 설계 원칙

### 원칙 1: 기존 스킬/에이전트 재사용 우선

Team Orchestration은 **새로운 에이전트나 스킬을 만들지 않는다**. 기존 13개 에이전트와 23+ 스킬을 그대로 호출한다. Orchestration Layer는 "무엇을 언제 호출할지"만 결정하는 순수한 조율 계층이다.

이 원칙의 핵심은 "오케스트레이터는 일을 하지 않는다"에 있다. 비유하자면 오케스트라 지휘자가 악기를 연주하지 않듯이, Orchestration Layer는 `/plan-prd`나 `/dev-run`을 직접 실행하지 않고 적절한 에이전트에게 위임한다.

기술적으로, 이는 Skill tool을 통한 기존 커맨드 호출과 Task tool을 통한 에이전트 스폰으로 구현된다. Orchestration Layer가 담당하는 것은 호출 순서, 입력 경로 결정, 결과 확인뿐이다.

### 원칙 2: Feature 단위 격리 (slug 기반)

각 Feature는 고유한 `slug`(예: `ds-url-state`, `ds-picker-system`)로 식별되며, 모든 산출물은 slug별 디렉토리에 격리된다. Feature 간 파일 충돌이 구조적으로 불가능하다.

이는 아파트 동(building)과 같다. 각 세대(Feature)는 독립된 공간을 가지며, 한 세대의 리모델링이 옆 세대에 영향을 주지 않는다. 공용부(Foundation인 F1)만 모든 세대가 공유한다.

```
.plans/ideas/00-inbox/IDEA-...-ds-url-state.md      ← F1 전용
.plans/ideas/00-inbox/IDEA-...-ds-picker-system.md   ← F2 전용
.plans/prd/10-approved/prd-...-ds-url-state/         ← F1 전용
.plans/prd/10-approved/prd-...-ds-picker-system/     ← F2 전용
```

Feature 에이전트가 자신의 slug 외부 파일을 수정하는 것은 금지된다. 공유 코드(types, utils)는 Foundation Feature(F1)가 정의하고, 나머지 Feature는 이를 import만 한다.

### 원칙 3: DAG 기반 의존성

Feature 간 의존성을 Directed Acyclic Graph(DAG)로 모델링한다. DAG는 순환을 허용하지 않으므로, 실행 순서가 항상 결정적이다.

```
F1 → F2, F3, F4, F5
F5 → F6, F7
F1~F7 → F8
```

DAG의 각 노드는 Feature이고, 간선(edge)은 "선행 Feature의 `/dev-verify` PASS"를 의미한다. DAG Scheduler는 선행 노드가 모두 완료된 Feature를 자동으로 실행 대기열에 추가한다.

순환 의존성이 감지되면 오케스트레이션을 즉시 중단하고 사용자에게 의존성 그래프를 출력한다.

### 원칙 4: 승인 게이트는 사용자 주도

자동화할 수 있는 검증(테스트, 빌드, 린트)은 자동화하되, **의사결정 게이트는 반드시 사용자 승인**을 거친다.

사용자 승인이 필요한 게이트:

| 게이트 | 단계 | 설명 |
|--------|------|------|
| P2 승인 | `/plan-screen` 후 | Go/Hold/Kill 최종 결정 |
| Phase B | `/dev-feature` 후 | Feature Overview 검토 및 승인 |
| Phase Gate | Phase N → N+1 | 다음 Phase 진입 승인 |
| 최종 배포 | 전체 완료 후 | 통합 결과 확인 및 배포 결정 |

오케스트레이터가 게이트에 도달하면 작업을 일시 중단하고 사용자에게 현재 상태를 요약 보고한다. 사용자가 승인하면 다음 단계로 진행하고, 거부하면 피드백을 반영하여 해당 단계를 재실행한다.

### 원칙 5: 실패 격리

한 Feature의 실패가 독립된 다른 Feature의 진행을 차단하지 않는다.

실패 격리 규칙:

| 시나리오 | 동작 |
|----------|------|
| F3 테스트 실패 | F2, F4, F5는 계속 진행. F8만 대기 |
| F5 PRD 리뷰 실패 | F5만 재작업. F2, F3, F4는 무관 |
| F1 (Foundation) 실패 | **모든 후속 Feature 대기** (유일한 예외) |
| F6 빌드 에러 | F7은 계속 진행 (F6, F7은 상호 독립) |

실패한 Feature는 `failed` 상태로 표시되고, 사용자에게 알림이 전달된다. 사용자가 수동 개입으로 문제를 해결한 후 해당 Feature만 재시작할 수 있다.

---

## 3. 드라이빙 유스케이스: ds-customizer

### 프로젝트 개요

shadcn/ui Design System Customizer와 동일한 기능을 8개 Feature로 분리하여 처음부터 구현하는 프로젝트. 각 Feature가 독립된 P1~P7 기획 + A~E 개발 파이프라인을 거친다.

### 8개 Feature 요약

| # | Feature | slug | Phase | 의존 |
|---|---------|------|-------|------|
| F1 | URL 상태 관리 기반 | `ds-url-state` | 1 | 없음 |
| F2 | Picker 컴포넌트 시스템 | `ds-picker-system` | 2 | F1 |
| F3 | 히스토리+랜덤+리셋 | `ds-interaction-system` | 2 | F1 |
| F4 | Preview 시스템 | `ds-preview-system` | 2 | F1 |
| F5 | 프리셋 코드 시스템 | `ds-preset-system` | 2 | F1 |
| F6 | 프로젝트 생성+CLI | `ds-project-creation` | 3 | F1, F5 |
| F7 | API Routes+v0 Export | `ds-api-export` | 3 | F1, F5 |
| F8 | 레이아웃+통합 조립 | `ds-layout-assembly` | 4 | F1~F7 |

### 4 Phase 실행 구조

```
Phase 1: F1 (Foundation)           ← 순차
Phase 2: F2, F3, F4, F5           ← 4개 병렬
Phase 3: F6, F7                    ← 2개 병렬 (F5 완료 후)
Phase 4: F8 (통합)                 ← 순차 (F1~F7 전체 완료 후)
```

### Phase Gate 조건

| Gate | 조건 | 검증 방법 |
|------|------|----------|
| Phase 1 → 2 | F1 `/dev-verify` PASS | orchestration-state.json 확인 |
| Phase 2 → 3 | F5 `/dev-verify` PASS | F2~F4는 독립 진행 가능 |
| Phase 3 → 4 | F1~F7 전체 `/dev-verify` PASS | 전체 상태 확인 |

---

## 4. 기존 인프라 현황

### 에이전트 (13)

| 도메인 | 에이전트 | 역할 |
|--------|---------|------|
| plan | plan-idea-collector | 아이디어 수집 + 백로그 관리 |
| plan | plan-idea-screener | RICE 스크리닝 + 채점 |
| plan | plan-prd-writer | PRD 10개 섹션 작성 |
| plan | plan-wireframe-designer | 와이어프레임 + Mermaid 다이어그램 |
| plan | plan-stitch-integrator | Stitch 프롬프트 생성 + HTML 검증 |
| plan | plan-reviewer | 산출물 리뷰 + PCC 검증 |
| dev | dev-architect | 아키텍처 분석 + 기술 의사결정 |
| dev | dev-code-reviewer | 코드 품질 + 보안 리뷰 |
| dev | dev-database-reviewer | PostgreSQL 쿼리/스키마/보안 리뷰 |
| dev | dev-doc-updater | 문서 + 코드맵 자동 생성 |
| dev | dev-security-reviewer | OWASP Top 10 보안 분석 |
| dev | dev-verify-agent | 빌드/타입/린트/테스트 검증 |
| dev | dev-frontend-reviewer | 접근성/CVA/반응형/성능 리뷰 |

### 스킬 (23+)

| 도메인 | 스킬 | 관련 커맨드 |
|--------|------|------------|
| core | continuous-learning | -- |
| core | session-wrap | -- |
| plan (7) | plan-idea-management, plan-screening-workflow, plan-pipeline, plan-prd-authoring, plan-wireframe-design, plan-stitch-workflow, plan-review-criteria | /plan-* |
| dev (14) | dev-tdd-workflow, dev-workflow, dev-refactoring, dev-domain-modeling, dev-layered-architecture, dev-feature-module, dev-testing-*, dev-frontend-patterns, dev-security-pipeline, dev-verification-engine, dev-observability, dev-tenant-isolation | /dev-* |

### 커맨드 (28)

| 도메인 | 수량 | 주요 커맨드 |
|--------|------|------------|
| plan | 8 | /plan-idea, /plan-screen, /plan-draft, /plan-prd, /plan-wireframe, /plan-stitch, /plan-bridge, /plan-review |
| dev | 20 | /dev-feature, /dev-run, /dev-verify, /dev-commit, /dev-review, /dev-security-review 등 |

---

## 5. v6 team-orchestrator / orchestrate 참조 관계

Team Orchestration 설계는 claude-forge v6의 `team-orchestrator` 스킬과 `/orchestrate` 커맨드를 기반으로 확장한다.

### 재사용하는 개념

| v6 개념 | 활용 방식 |
|---------|----------|
| TeamCreate / SendMessage | Feature 에이전트 팀 생성 및 통신 |
| TaskCreate / TaskUpdate | Feature 내부 Task 관리 |
| Wave 기반 병렬 실행 | Feature 간 Phase 병렬 실행으로 확장 |
| 파일 소유권 분리 | slug 기반 Feature 격리로 자연스럽게 해결 |
| Self-Claim 메커니즘 | Feature 완료 후 다음 Feature 자동 시작 |
| Plan Approval Mode | Phase Gate에서 사용자 승인으로 확장 |

### 확장하는 부분

| 영역 | v6 (단일 Feature) | Team Orchestration (다중 Feature) |
|------|-------------------|-----------------------------------|
| 스코프 | 1개 Feature 내 Task 병렬화 | 다수 Feature 간 병렬화 |
| 의존성 | Task 간 blockedBy | Feature 간 DAG + Phase Gate |
| 상태 추적 | prompt_plan.md 체크리스트 | orchestration-state.json 중앙 관리 |
| 파이프라인 | /orchestrate가 직접 실행 | 기존 /plan-*, /dev-* 커맨드 위임 |
| 실패 처리 | Task 재배정 | Feature 격리 + 독립 진행 |

---

## 6. 문서 세트 목차

| # | 문서 | 설명 |
|---|------|------|
| 00 | **00-overview.md** (이 문서) | 개요, 설계 원칙, 유스케이스, 기존 인프라 |
| 01 | 01-architecture.md | 3-Layer 아키텍처, 통합 지점, 상태 저장소, 데이터 흐름 |
| 02 | 02-dag-scheduler.md | DAG 구성, Wave 그룹화, Phase Gate 로직 상세 |
| 03 | 03-state-management.md | orchestration-state.json 스키마, 상태 전이, 영속성 |
| 04 | 04-feature-agent.md | Feature 에이전트 프롬프트 설계, 파이프라인 단계별 동작 |
| 05 | 05-error-recovery.md | 실패 유형별 복구 전략, 재시작 프로토콜 |
| 06 | 06-command-reference.md | /team-orchestrate 커맨드 인터페이스, 플래그, 사용 예시 |
| 07 | 07-extension-guide.md | 커스텀 파이프라인 단계 추가, 새 프로젝트 적용 가이드 |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| `claude-kit/docs/00-overview.md` | claude-kit 전체 워크플로우 |
| `claude-kit/docs/09-architecture.md` | 기존 아키텍처 + 컴포넌트 카탈로그 |
| `claude-forge/skills/team-orchestrator/SKILL.md` | v6 Team Orchestrator 스킬 |
| `claude-forge/commands/orchestrate.md` | v6 /orchestrate 커맨드 |
| `.plans/ds-customizer/00-master-plan.md` | ds-customizer 마스터 플랜 |
| `.plans/ds-customizer/02-pipeline-guide.md` | Feature별 파이프라인 실행 가이드 |
