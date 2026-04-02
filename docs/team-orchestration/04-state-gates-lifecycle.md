# 상태 모델 + 게이트 + Lifecycle

> `stage-manifest.json` 확장, 게이트 3종, Feature Lifecycle, Retry/Resume/Escalation을 통합한다.

---

## 상태 모델

Team Orchestration은 신규 `orchestration-state.json`을 공식 SSOT로 도입하지 않는다. 상태 추적은 기존 `stage-manifest.json`을 확장하여 관리하며, **Team Lead만 이 파일을 기록하는 single-writer**다.

Feature Agent는 각 stage 완료/실패/승인 대기 상태를 메시지로 보고하고, Team Lead가 이를 manifest에 반영한다.

### stage-manifest.json 확장 스키마

```json
{
  "features": {
    "ds-picker-system": {
      "type": "standard",
      "stages": {
        "idea": { "status": "done", "completedAt": "..." },
        "prd": { "status": "review-pass", "completedAt": "..." },
        "wireframe": { "status": "in-progress" }
      },
      "orchestration": {
        "entryPoint": "P3-blueprint-fast-track",
        "pipelineType": "standard",
        "executionPath": ".plans/prd/10-approved/prd-2026-04-02-ds-picker-system/",
        "hardDependencies": ["ds-url-state"],
        "sourceRef": {
          "blueprint": ".plans/blueprints/ds-customizer/features/f2-picker-system/plan.md"
        },
        "reportedBy": "feature-agent-f2",
        "lastReportedAt": "2026-04-02T10:30:00+09:00"
      },
      "gates": {
        "p2-approval": { "status": "approved", "decidedBy": "user", "decidedAt": "..." },
        "phaseB-approval": { "status": "pending" },
        "phaseE-verify": { "status": "pending", "attempts": 0 }
      }
    }
  }
}
```

### 게이트 필드 정의

| 필드 | 설명 |
|------|------|
| `status` | `pending` / `in-progress` / `PASS` / `FAIL` / `approved` / `rejected` / `on-hold` / `escalated` |
| `attempts` | 시도 횟수 (최대 3) |
| `decidedBy` | `user` / `auto` / `dag` |
| `decidedAt` | ISO 8601 |
| `pccResults` / `dvcResults` | 검증 결과 (해당 시) |

---

## 게이트 3종 분류

| 유형 | 게이트 | 시점 | 트리거 주체 | 차단 여부 |
|------|--------|------|------------|:---------:|
| **사용자 승인** | P2 RICE 승인 | P2 완료 후 | Team Lead | Blocking |
| **사용자 승인** | Phase B Human Review | Phase A 완료 후 | Team Lead | Blocking |
| **자동 검증** | P4 /plan-review | P4 완료 시 | Feature Agent | Blocking |
| **자동 검증** | P5 /plan-review | P5 완료 시 | Feature Agent | Blocking |
| **자동 검증** | Phase E /dev-verify | Phase D 완료 후 | Feature Agent | Blocking |
| **Phase 전환** | DAG 의존성 충족 | /dev-verify PASS 후 | DAG Engine | Auto |

---

## 사용자 승인 게이트

### P2 RICE 승인

Team Lead가 RICE 점수 요약 + 에이전트 제안(Go/Hold/Kill)을 사용자에게 제시한다.

| 응답 | 행동 |
|------|------|
| `approved` | `20-approved/`로 이동, P3 자동 시작 |
| `on-hold` | `90-archive/`로 이동, 재개 가능 |
| `rejected` | `90-archive/`로 이동, 종료 |

여러 Feature가 동시에 P2를 완료한 경우, 일괄 승인을 지원한다.

### Phase B Human Review

Phase B는 **코드 리뷰가 아니라 Human Review**다. 목적은 Feature Overview 승인/수정/반려를 결정하는 것이다.

| 응답 | 행동 |
|------|------|
| `approved` | Phase C 자동 시작 |
| `revision` | Phase A6으로 돌아가 Overview 갱신 |
| `rejected` | Phase A 전체 재생성 |

승인 대기는 해당 Feature만 차단한다. 다른 Feature는 독립적으로 계속 진행된다.

---

## 자동 검증 게이트

### /plan-review (P4, P5)

PCC 검증을 포함한 자동 리뷰. 심각도 → 판정:
- ERROR ≥ 1 → FAIL (차단, 수정 필수)
- FLAG ≥ 1 → WARN (사람 확인 후 진행 가능)
- WARN만 → LOG (기록만, 진행에 영향 없음)

### Phase E /dev-verify

`/dev-verify`는 **DVC 6항목 검증**을 수행한다:

| ID | 검증 항목 | 심각도 |
|----|----------|--------|
| DVC-01 | REQ Coverage | FLAG |
| DVC-02 | TC Implementation | FLAG |
| DVC-03 | TASK Completion | ERROR |
| DVC-04 | Pattern Compliance | WARN |
| DVC-05 | Edge Case Discovery | WARN |
| DVC-06 | Scope Alignment | FLAG |

### FAIL 시 자동 재시도

```
검증 실행 → PASS → 다음 단계
         → FAIL → 시도 < 3 → 자동 수정 → 재검증
                → 시도 = 3 → Team Lead 에스컬레이션
                              → 사용자 결정: retry / skip / archive
```

---

## Lifecycle 흐름

### 전체 파이프라인

```
P1 → P2 → [P2 Gate: 승인] → P3 → P4 → [P4 Review] → P5 → [P5 Review] → P6 → P7
  → Phase A → [Phase B: Human Review] → Phase C → Phase D → [Phase E: DVC] → 완료
```

Lite 판정 시 P4~P6을 건너뛰고 P3 → P7로 직행한다.

### Feature 완료 조건

```
feature.status = completed
  IFF
    /dev-verify result == PASS
    AND
    /dev-commit result == SUCCESS
```

### Phase 전환

DAG Engine이 Feature 완료를 감지하면 후행 Feature의 의존성을 체크하고, 모두 충족 시 자동 spawn을 Team Lead에 요청한다.

---

## 타임아웃 처리

| 게이트 | 기본 타임아웃 | 알림 주기 | 타임아웃 행동 |
|--------|:-----------:|:---------:|-------------|
| P2 RICE 승인 | 24시간 | 8시간마다 | `on-hold` 자동 전환 |
| Phase B Review | 12시간 | 4시간마다 | `on-hold` 자동 전환 |

타임아웃은 `rejected`가 아닌 `on-hold`로 처리되어 `--resume`으로 재개 가능하다.

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [02-operating-model.md](./02-operating-model.md) | Team Lead single-writer 역할 |
| [03-scheduler-and-dependencies.md](./03-scheduler-and-dependencies.md) | DAG 기반 Phase 전환 |
| [guide/08-dev-workflow.md](../guide/08-dev-workflow.md) | Phase B = Human Review, DVC 6항목 |
