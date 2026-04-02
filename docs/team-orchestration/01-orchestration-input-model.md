# 입력 모델: Feature Registry 계약

> Team Orchestration이 받는 입력 계약을 정의한다. 오케스트레이터는 raw blueprint를 직접 입력으로 받지 않는다.

---

## 핵심 원칙

**Team Orchestration은 raw blueprint를 직접 입력으로 받지 않는다.**

블루프린트 프로젝트는 먼저 Entry Assessment와 Fast-Track 정규화를 거쳐, feature별 실행 단위가 결정되어야 한다. 오케스트레이터의 공식 입력은 **normalized feature registry**다.

---

## 파이프라인 위치

```
Blueprint source spec                    ← 참조만 (수정 금지)
  → Entry Assessment                     ← 진입점 판정 (P1/P3/P4)
  → Fast-Track Intake / Normalization    ← imported IDEA + screening
  → Approved PRD + Bridge path           ← execution SSOT 복원
  → Feature Registry                     ← 오케스트레이터 입력
  → Team Orchestration                   ← 조율 시작
```

---

## Feature Registry 최소 필드

| 필드 | 의미 | 예시 |
|------|------|------|
| `featureSlug` | 오케스트레이션 단위 식별자 | `ds-picker-system` |
| `entryPoint` | 어떤 경로로 정규화되었는지 | `P3-blueprint-fast-track` |
| `pipelineType` | Lite / Standard | `standard` |
| `executionPath` | 실행 SSOT 경로 | `.plans/prd/10-approved/prd-2026-04-02-ds-picker-system/` |
| `sourceRef` | 상위 source spec 참조 | blueprint 경로, entry decision 경로 |
| `hardDependencies` | 선행 실행 조건 | `["ds-url-state"]` |
| `approvalGates` | 사용자 승인 지점 | `[P2, B]` |

### YAML 예시

```yaml
featureRegistry:
  - featureSlug: ds-url-state
    entryPoint: P3-blueprint-fast-track
    pipelineType: standard
    executionPath: .plans/prd/10-approved/prd-2026-04-02-ds-url-state/
    sourceRef:
      blueprint: .plans/blueprints/ds-customizer/features/f1-url-state/plan.md
      entryDecision: .plans/blueprints/ds-customizer/entries/f1-entry-decision.md
    hardDependencies: []
    approvalGates: [P2, B]

  - featureSlug: ds-picker-system
    entryPoint: P3-blueprint-fast-track
    pipelineType: standard
    executionPath: .plans/prd/10-approved/prd-2026-04-02-ds-picker-system/
    sourceRef:
      blueprint: .plans/blueprints/ds-customizer/features/f2-picker-system/plan.md
      entryDecision: .plans/blueprints/ds-customizer/entries/f2-entry-decision.md
    hardDependencies: ["ds-url-state"]
    approvalGates: [P2, B]
```

---

## 오케스트레이터가 하지 않는 일

| 계층 | 이유 |
|------|------|
| Entry Assessment | 블루프린트 진입점 판단은 planning/guide 계층의 책임 |
| Fast-Track Intake | imported IDEA/screening, `/plan-draft` 정규화는 planning 계층 책임 |
| PRD 정규화 | execution SSOT 복원까지는 오케스트레이션 전 단계 |
| raw blueprint intake | 상위 source spec을 직접 실행 입력으로 쓰면 계약 위반 |

오케스트레이터는 위 과정의 **결과물**을 받아 feature 실행 순서와 gate를 관리한다.

---

## 허용 진입점

| entryPoint | 의미 | 오케스트레이터 시작 단계 |
|------------|------|----------------------|
| `P1` | 처음부터 파이프라인 전체 | P1 (`/plan-idea`) |
| `P3-blueprint-fast-track` | Fast-Track 정규화 완료 | P3 (`/plan-draft`) |
| `P4-normalized` | PRD 정규화 완료 | P4 (`/plan-prd`) |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [guide/12-blueprint-fast-track.md](../guide/12-blueprint-fast-track.md) | Entry Assessment / Fast-Track 계약 (상위 SSOT) |
| [guide/04-feature-planning.md](../guide/04-feature-planning.md) | P3 1차 기능 기획 |
| [02-operating-model.md](./02-operating-model.md) | 입력 수신 후 실행 주체 정의 |
