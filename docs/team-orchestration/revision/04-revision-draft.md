# Team Orchestration revision 초안

> 목적
> - 원문 `team-orchestration/00~07`을 나중에 재작성할 때 바로 옮겨 쓸 수 있는 대표 문안, 새 목차, 새 표를 제공한다.
> - 이번 문서는 canonical 구조를 실제 문장 수준으로 내려놓는 드래프트다.

> 기본 전제
> - 전체 문서 시제는 `proposed design / pilot-aligned target`
> - Team Orchestration은 blueprint intake 계층이 아니라 정규화 후 실행 조율 계층
> - ds-customizer는 첫 consumer이지만 본문이 아닌 pilot appendix

---

## 1. 새 문서 세트 목차 초안

```text
00-overview.md
01-orchestration-input-model.md
02-operating-model.md
03-scheduler-and-dependencies.md
04-state-gates-lifecycle.md
05-assets-and-integration.md
06-ds-customizer-pilot.md
07-rollout-roadmap.md
```

---

## 2. 상단 공통 안내문 초안

아래 문안은 `00-overview` 또는 각 문서 상단 공통 note로 재사용할 수 있다.

```text
이 문서 세트는 Team Orchestration의 현재 구현 설명서가 아니라, claude-kit guide 계약 위에서 정렬된 proposed design / pilot-aligned target이다.

핵심 원칙:
- Blueprint는 source spec으로만 유지한다.
- Approved PRD가 execution SSOT다.
- Team Orchestration은 Entry Assessment와 Fast-Track 정규화가 끝난 feature registry를 입력으로 소비한다.
- 상태 추적은 Team Lead single-writer 기반의 stage-manifest 확장으로 기록한다.
```

---

## 3. 핵심 표 초안

### 3.1 입력 계약 표

```text
| 필드 | 의미 | 예시 |
|------|------|------|
| `featureSlug` | 오케스트레이션 단위 식별자 | `ds-picker-system` |
| `entryPoint` | 어떤 경로로 정규화되었는지 | `P3-blueprint-fast-track` |
| `pipelineType` | Lite / Standard | `standard` |
| `executionPath` | 실행 SSOT 경로 | `.plans/prd/10-approved/prd-2026-04-02-ds-picker-system/` |
| `sourceRef` | 상위 source spec 참조 | blueprint 경로, entry decision 경로 |
| `hardDependencies` | 선행 실행 조건 | `["ds-url-state"]` |
| `approvalGates` | 사용자 승인 지점 | `[P2, B]` |
```

### 3.2 실행 ownership 표

```text
| 주체 | 책임 | 금지되는 오해 |
|------|------|---------------|
| Team Lead | spawn, queue control, approval, aggregation, manifest write | 직접 feature stage를 수행하지 않음 |
| Feature Agent | feature 단위 stage execution | 중앙 상태 writer가 아님 |
| specialist agent | 특정 command 내부 전문 작업 | 독립 orchestrator가 아님 |
```

### 3.3 generic vs pilot 구분 표

```text
| 항목 | generic 본문 | ds-customizer appendix |
|------|--------------|------------------------|
| 입력 계약 | O | - |
| Team Lead single-writer | O | - |
| hard dependency DAG 규칙 | O | - |
| F1/F8 역할 | - | O |
| LockButton / PresetPicker ownership | - | O |
| shared code 승격 일반 규칙 | O | 예시만 appendix |
| 8-feature 구체 그래프 | - | O |
```

---

## 4. 대표 교체 문안

### 4.1 입력 모델 설명 초안

```text
Team Orchestration은 raw blueprint를 직접 입력으로 받지 않는다.
블루프린트 프로젝트는 먼저 Entry Assessment와 Fast-Track 정규화를 거쳐, feature별 실행 단위가 결정되어야 한다.

따라서 오케스트레이터의 공식 입력은 raw blueprint가 아니라 normalized feature registry다.
```

### 4.2 상태 모델 설명 초안

```text
Team Orchestration은 신규 `orchestration-state.json`을 공식 SSOT로 도입하지 않는다.
상태 추적은 기존 `stage-manifest.json`을 확장하여 관리하며, Team Lead만 이 문서를 기록하는 single-writer다.

Feature Agent는 각 stage 완료/실패/승인 대기 상태를 메시지로 보고하고,
Team Lead가 이를 manifest에 반영한다.
```

### 4.3 dependency 해석 가이드 초안

```text
이 문서에서 말하는 dependency graph는 hard dependency만 표현한다.
즉, 어떤 feature가 다른 feature의 실행 완료를 실제로 기다려야 하는지를 나타낸다.

반면 컴포넌트/파일 ownership 분리는 DAG가 아니라 ownership matrix에서 관리한다.
예를 들어 `LockButton -> F3`, `PresetPicker -> F5` 같은 규칙은 pilot appendix의 ownership 표에 속한다.
```

### 4.4 Human Review / DVC 문안 초안

```text
Phase B는 코드 리뷰가 아니라 Human Review다.
목적은 Feature Overview 승인/수정/반려를 결정하는 것이다.

Phase E는 `/dev-verify`를 통해 DVC 6항목 검증을 수행하고, 통과 시 `/dev-commit`으로 이어진다.
```

### 4.5 actual asset 문안 초안

```text
claude-kit 현재 repo truth 기준:
- agents 12
- commands 30
- skills 24

따라서 `dev-frontend-reviewer`와 같은 항목은 현재 실재 자산이 아니라 과거 설계 흔적 또는 future proposal로만 다뤄야 한다.
```

### 4.6 pilot appendix 문안 초안

```text
ds-customizer는 Team Orchestration 규칙을 검증하는 첫 consumer다.
이 appendix는 범용 규칙을 덮어쓰지 않고, generic 계약이 실제 복합 blueprint 프로젝트에 어떻게 투영되는지를 보여주는 pilot 예시다.
```

---

## 5. 링크/경로 교체 메모

- `.plans/ds-customizer/...` -> `.plans/blueprints/ds-customizer/...`
- `03-dag-engine.md` -> `03-dependency-engine.md`
- `13개 에이전트`, `23+ 스킬` -> `12 agents / 30 commands / 24 skills`

---

## 6. 대표 도식 초안

### 6.1 상위 흐름

```text
Blueprint source spec
-> Entry Assessment
-> Fast-Track Intake / Normalization
-> Approved PRD + Bridge path
-> Feature Registry
-> Team Orchestration
-> Feature Agents
```

### 6.2 lifecycle 요약

```text
Feature Registry Ready
-> Team Lead enqueue
-> Feature Agent stage execution
-> Team Lead gate/manifest update
-> dependency release
-> next feature ready
```

---

## 7. 적용 완료 기준

- 대표 문안만 읽어도 raw blueprint direct input 금지와 feature registry 입력이 분명하다.
- Team Lead single-writer, Human Review, DVC 6항목이 흔들리지 않는다.
- ds-customizer는 appendix/pilot로만 읽히고 generic 본문을 점유하지 않는다.
