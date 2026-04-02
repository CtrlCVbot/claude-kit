# 운영 모델: 역할 분리 + 통신 프로토콜

> Team Lead / Feature Agent / Specialist Agent의 책임 분리와 통신 프로토콜을 정의한다.

---

## 3계층 실행 모델

| 주체 | 책임 | 금지되는 오해 |
|------|------|---------------|
| **Team Lead** | spawn, queue control, approval, aggregation, manifest write | 직접 feature stage를 수행하지 않음 |
| **Feature Agent** | feature 단위 stage execution, stage result report | 중앙 상태 writer가 아님 |
| **Specialist Agent** | 특정 command 내부 전문 작업 | 독립 orchestrator가 아님 |

```
Team Lead (Main Session)
  └── Feature Agent (Teammate — general-purpose)
        └── Specialist Agent (Task tool 호출)
            예: plan-idea-collector, plan-prd-writer, dev-verify-agent ...
```

---

## Team Lead

팀의 중앙 허브. 모든 Feature Agent는 Team Lead를 통해서만 통신한다.

| 책임 | 설명 |
|------|------|
| DAG 스케줄링 | Feature Registry + dependency graph에서 Ready Queue를 관리 |
| Phase 게이트 | Phase 전환 조건 충족 여부 판단, 다음 Wave 시작 |
| 승인 큐 관리 | Feature Agent의 P2/B 승인 요청을 수집, 사용자에게 전달, 결과 회신 |
| 진행 보고 | 전체 Feature 상태를 테이블로 사용자에게 주기적 보고 |
| Manifest write | `stage-manifest.json`에 상태 기록 (single-writer) |
| 에이전트 생명주기 | Feature Agent spawn, monitoring, shutdown |

**Single-Writer 규칙**: Team Lead만 `stage-manifest.json`을 기록한다. Feature Agent는 상태 메시지를 보고하고, Team Lead가 이를 manifest에 반영한다.

```
Team Lead는 교통 관제탑과 같다.
활주로(동시 슬롯)가 제한되어 있으므로, 이착륙(spawn/종료) 순서를 조율하고
비행기(Feature Agent) 간 충돌을 방지한다.
```

---

## Feature Agent

Feature 1개를 전담하는 general-purpose 에이전트. P1~E 파이프라인을 순차 실행한다.

| 책임 | 설명 |
|------|------|
| 파이프라인 실행 | 할당된 Feature의 P1→P2→...→P7→A→B→C→D→E 순차 진행 |
| 스킬 호출 | 각 단계에서 기존 `plan-*` / `dev-*` 커맨드를 호출 |
| 상태 보고 | 각 단계 완료/실패 시 Team Lead에게 메시지 보고 |
| 승인 요청 | P2, Phase B에서 Team Lead에게 승인 요청 |
| 산출물 격리 | Feature slug 기준 폴더에 모든 산출물 생성 |

### 생명주기

```
[*] → Queued → Spawning → Running → Completed → [*]
                              ↕
                       AwaitingApproval
                              ↓ (실패 시)
                           Failed → Queued (재시도) 또는 [*] (포기)
```

**Spawn 조건** (두 조건 모두 충족):
1. 의존성 충족: `hardDependencies`의 모든 Feature가 `completed`
2. 슬롯 가용: 현재 활성 Feature Agent 수 < 3

### 파이프라인 단계별 호출

| 단계 | 호출 커맨드 |
|------|-----------|
| P1 | `/plan-idea` |
| P2 | `/plan-screen` → 승인 대기 |
| P3 | `/plan-draft` |
| P4 | `/plan-prd` |
| P5 | `/plan-wireframe` |
| P6 | `/plan-stitch` |
| P7 | `/plan-bridge` |
| A | `/dev-feature` |
| B | Human Review → 승인 대기 |
| C | Package Generation (자동) |
| D | `/dev-run` |
| E | `/dev-verify` → `/dev-commit` |

---

## 통신 프로토콜

### 메시지 타입

| 타입 | 방향 | 용도 |
|------|------|------|
| `status_update` | Agent → Lead | 단계 진입/완료 보고 |
| `approval_request` | Agent → Lead | P2/B 승인 요청 |
| `approval_response` | Lead → Agent | 승인/거부 응답 |
| `error_report` | Agent → Lead | 에러 발생 알림 |
| `shutdown_request` | Lead → Agent | 종료 지시 |
| `assignment` | Lead → Agent | Feature 할당 (spawn 시) |

### 승인 대기 흐름

```
Feature Agent                    Team Lead                     User
     │                              │                            │
     ├─ approval_request ─────────>│                            │
     │  (stage: "P2", feature)      ├─ 진행 보고 + 승인 요청 ──>│
     │                              │<── 승인/거부 ──────────────┤
     │<── approval_response ────────┤                            │
     ├─ 다음 단계 진행...           │                            │
```

---

## 팀 크기 전략

### Claude Code 제한

```
Main Session (Team Lead)   = 1
Teammates (Feature Agent)  ≤ 3
동시 최대                  = 4
```

### Wave 기반 에이전트 재활용

동시 슬롯(3)보다 많은 Feature를 처리할 때, 먼저 완료된 에이전트의 슬롯을 재활용한다.

```
Wave A: [Feature-1, Feature-2, Feature-3]   → 3 슬롯 동시
         Feature-2 완료 → 슬롯 해제
Wave B: [Feature-4]                         → 빈 슬롯에 즉시 spawn
```

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [01-orchestration-input-model.md](./01-orchestration-input-model.md) | Feature Registry 입력 계약 |
| [03-scheduler-and-dependencies.md](./03-scheduler-and-dependencies.md) | DAG 스케줄링, Wave 도출 |
| [04-state-gates-lifecycle.md](./04-state-gates-lifecycle.md) | 상태 기록 + 게이트 상세 |
