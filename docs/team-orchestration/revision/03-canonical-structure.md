# Team Orchestration canonical 구조 제안

> 목적
> - `team-orchestration` 문서 세트의 목표 정보구조를 결정 완료 상태로 정의한다.
> - 이 문서는 원문 재작성 전, 무엇을 어떤 문서로 나눌지에 대한 canonical 설계다.

---

## 1. 기본 관점

Team Orchestration은 블루프린트 intake 계층이 아니다. 이미 정규화가 끝난 feature 실행 단위를 **조율**하는 계층이다.

즉, 계층은 아래 순서로 읽혀야 한다.

```text
Blueprint source spec
-> Entry Assessment
-> Fast-Track Intake / Normalization
-> Approved PRD + Bridge path 복원
-> Team Orchestration
-> Feature-level execution
```

오케스트레이터는 위 흐름 중 앞의 4단계를 대체하지 않는다. 그 결과물을 소비한다.

---

## 2. 불변 계약

아래 8개는 팀 오케스트레이션 문서 세트의 non-negotiable contract다.

| # | 계약 | 의미 |
|---|------|------|
| 1 | `Blueprint = source spec` | 블루프린트 원본은 참조만 한다. |
| 2 | `Approved PRD = execution SSOT` | 개발 공식 입력은 승인된 PRD다. |
| 3 | `Entry Assessment first` | 오케스트레이션은 진입점 판정 이전 계층이 아니다. |
| 4 | `Feature registry input` | 오케스트레이터는 정규화된 feature registry를 입력으로 받는다. |
| 5 | `stage-manifest single-writer` | Team Lead만 상태를 기록한다. |
| 6 | `Phase B = Human Review` | 개발 승인 게이트 명칭을 통일한다. |
| 7 | `/dev-verify = DVC 6항목` | 개발 검증 의미를 고정한다. |
| 8 | `Pilot appendix separation` | ds-customizer는 본문이 아니라 appendix/pilot consumer다. |

---

## 3. canonical 문서 세트

### 3.1 `00-overview`

목적:

- 이 문서 세트가 해결하는 범용 문제
- 불변 계약
- 독자별 읽기 순서
- 현재 구현이 아니라 `proposed design / pilot-aligned target`임을 선언

이 문서에 넣지 않을 것:

- 상세 DAG 예시
- runtime 스키마 전체
- ds-customizer 고유 ownership 규칙

### 3.2 `01-orchestration-input-model`

목적:

- 오케스트레이터가 받는 입력 계약 정의
- Entry Assessment 이후 어떤 단위가 오케스트레이션 대상이 되는지 설명
- raw blueprint direct input 금지 규칙 명시

최소 입력 모델:

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
```

### 3.3 `02-operating-model`

목적:

- Team Lead / Feature Agent / specialist agent 책임 분리
- single-writer와 보고 프로토콜 정의
- approval, aggregation, escalation 책임 분리

공식 운영 모델:

| 주체 | 책임 |
|------|------|
| Team Lead | spawn, queue control, approval, aggregation, manifest write |
| Feature Agent | feature 단위 stage execution, stage result report |
| specialist agent | 특정 command 내부 전문 작업 |

### 3.4 `03-scheduler-and-dependencies`

목적:

- hard dependency DAG
- ready queue, wave, slot, recycle, priority 규칙
- cycle detection, partial failure isolation

핵심 원칙:

- 그래프는 hard dependency만 표현
- ownership dependency는 별도 ownership matrix에서 관리
- ready queue 우선순위는 `priority -> dependency depth -> FIFO`

### 3.5 `04-state-gates-lifecycle`

목적:

- `stage-manifest.json` 확장 구조
- P2, reviewPassed, Human Review, DVC, retry/resume/escalation 기록
- stage와 gate를 같은 문서에서 lifecycle 관점으로 통합

상태 모델 원칙:

- Team Lead single-writer
- Feature Agent는 메시지 보고만 수행
- manifest는 feature 상태 + gate 결과 + orchestration metadata를 함께 표현

### 3.6 `05-assets-and-integration`

목적:

- actual claude-kit assets와 오케스트레이션의 접점을 설명
- 현재 없는 runtime asset은 proposal backlog로만 관리

이 문서에 반드시 들어갈 것:

- `12 agents / 30 commands / 24 skills`
- `team-orchestrate`, `team-lead`는 현재 absent asset
- guide/command SSOT 참조점

### 3.7 `06-ds-customizer-pilot`

목적:

- 첫 consumer로서 ds-customizer pilot을 상세히 담는다
- generic rule이 실제 예시에 어떻게 투영되는지 보여준다

pilot에만 속하는 정보:

- 8-feature graph
- F1 foundation, F8 app shell + integration
- `LockButton -> F3`, `PresetPicker -> F5`
- shared code 승격 예시

### 3.8 `07-rollout-roadmap`

목적:

- 문서 정렬, 명세 정렬, runtime 설계, 구현 도입 순서
- 이번 라운드와 다음 라운드 범위 분리

---

## 4. generic 본문과 pilot appendix의 경계

### generic 본문에 둘 것

- feature registry 입력 계약
- Team Lead single-writer
- hard dependency DAG
- Human Review
- DVC 6항목
- retry/resume/escalation lifecycle
- actual asset mapping

### ds-customizer appendix로 내릴 것

- 8-feature specific graph
- F1/F8 naming
- 특정 UI 컴포넌트 소유권
- pilot 기준 phase/wave 해석
- App Shell 통합 세부 규칙

---

## 5. 상태 계약

Team Orchestration은 신규 중앙 상태 파일을 추가 SSOT로 두지 않는다.

### 공식 상태 축

- `stage-manifest.json` 확장 사용
- Team Lead single-writer
- feature별 stage/gate/orchestration metadata 저장

### 최소 확장 필드

```json
{
  "features": {
    "ds-picker-system": {
      "currentStage": "P4",
      "status": "in_progress",
      "reviewPassed": false,
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
      }
    }
  }
}
```

---

## 6. 금지 규칙

아래는 canonical 구조에서 명시적으로 금지한다.

- raw blueprint를 `/dev-feature` 입력처럼 취급
- `orchestration-state.json`을 공식 SSOT로 가정
- 아직 없는 runtime asset을 현재 자산처럼 기술
- `13 agents`, `23+ skills` 같은 stale inventory 사용
- generic rule과 pilot rule을 같은 레벨로 섞기

---

## 7. 결론

Team Orchestration canonical 구조의 핵심은 단순히 문서를 더 잘 나누는 것이 아니다. **입력 계약, 상태 계약, 역할 계약, generic/pilot 경계**를 먼저 고정하는 것이다. 이 문서가 먼저 잠기면, 이후 원문 `00~07` 재작성은 결정이 아니라 번역 작업에 가까워진다.
