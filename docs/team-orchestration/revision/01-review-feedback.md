# Team Orchestration revision 리뷰 피드백

> 목적
> - 기존 `team-orchestration/00~07` 문서 세트를 단순 보정이 아니라 `전면 재구성` 기준으로 다시 진단한다.
> - 이번 revision 세트는 "원문 수정 지시서"이자 "새 canonical 구조 제안"을 겸한다.
> - 기준 SSOT는 최근 claude-kit guide 개선안과 블루프린트 Fast-Track 규칙이다.

> 이번 라운드 공통 기준
> - `Blueprint = source spec`
> - `Approved PRD = execution SSOT`
> - `Entry Assessment -> Fast-Track Intake -> /plan-bridge -> /dev-feature`
> - `Phase B = Human Review`
> - `/dev-verify = DVC 6항목`
> - `stage-manifest.json`은 오케스트레이션 추적의 기준 상태 축
> - actual inventory truth = `12 agents / 30 commands / 24 skills`

---

## 1. 한 줄 결론

현재 `team-orchestration` 문서 세트는 설계 밀도는 높지만, 문장 보정만으로는 살릴 수 없다. `범용 오케스트레이션 모델`, `ds-customizer 전용 예시`, `future-state 런타임 제안`, `현재 claude-kit 계약`이 한 문서 안에 동시에 섞여 있기 때문이다.

따라서 이번 revision의 결론은 명확하다.

- 기존 `00~07`은 유지하되, revision에서는 **새 canonical 정보구조**를 먼저 세운다.
- ds-customizer는 본문이 아니라 **pilot appendix**로 내린다.
- raw blueprint를 직접 오케스트레이션 입력으로 보는 설명은 제거하고, **정규화된 feature registry**를 공식 입력으로 고정한다.
- `orchestration-state.json`은 새 SSOT 후보가 아니라 **폐기/역사적 제안**으로만 다룬다.

---

## 2. 왜 전면 재구성인가

### 2.1 문서 시제가 섞여 있다

- [00-overview.md](../00-overview.md), [01-architecture.md](../01-architecture.md), [07-integration-plan.md](../07-integration-plan.md)은 아직 없는 자산을 마치 곧바로 사용할 수 있는 것처럼 서술한다.
- 실제 저장소에는 `team-lead`, `team-orchestrate`, dependency-graph runtime이 없다.

즉, 이 문서 세트는 현재 구현 설명서가 아니라 `proposed design / pilot-aligned target`이어야 한다.

### 2.2 오케스트레이션 입력 모델이 없다

현재 원문은 `dependency-graph.yaml`과 ds-customizer feature plan을 거의 직접 입력처럼 다룬다. 하지만 최근 claude-kit guide 계약상:

- 블루프린트는 `source spec`
- 개발 입력은 `approved PRD`
- Fast-Track 이전에는 `Entry Assessment`가 먼저

따라서 Team Orchestration은 raw blueprint를 직접 소비하는 계층이 아니라, **Entry Assessment와 정규화가 끝난 feature registry를 소비하는 계층**으로 재정의해야 한다.

### 2.3 상태 모델이 현재 claude-kit 축과 충돌한다

- [00-overview.md](../00-overview.md), [01-architecture.md](../01-architecture.md)는 `orchestration-state.json`을 중앙 SSOT처럼 설명한다.
- 최근 guide 쪽 개선 기준은 `stage-manifest.json` 확장과 `reviewPassed` 기록을 중심으로 정리됐다.

따라서 revision에서는 `orchestration-state.json`을 폐기 후보 또는 과거 제안으로만 남기고, **single-writer 기반 stage-manifest 확장**으로 통일해야 한다.

### 2.4 범용 규칙과 pilot 규칙의 경계가 흐리다

현재 ds-customizer 예시는 풍부하지만, 다음 항목들이 일반 규칙처럼 읽힌다.

- F1 중심 phase gate
- F8의 통합 역할
- `LockButton -> F3`, `PresetPicker -> F5`
- `route-local -> app-shared -> package`

이 중 일부는 범용 규칙으로 승격 가능하지만, 일부는 ds-customizer pilot 규칙이다. revision은 이 경계를 문서 구조 수준에서 분리해야 한다.

---

## 3. 고정해야 할 핵심 진단

### 3.1 raw blueprint 직접 입력 서술은 금지

오케스트레이션 입력은 raw blueprint가 아니다. 최소한 아래 정보가 정규화된 뒤여야 한다.

- `featureSlug`
- `entryPoint`
- `pipelineType`
- `executionPath`
- `sourceRef`
- `hardDependencies`
- `approvalGates`

즉, Team Orchestration은 blueprint intake 계층이 아니라 **정규화 후 실행 조율 계층**이다.

### 3.2 actual inventory/path truth가 오래됐다

현재 원문에는 아래 drift가 있다.

- `13개 에이전트`, `23+ 스킬`
- `dev-frontend-reviewer`
- `.plans/ds-customizer/...`
- `03-dag-engine.md`

이번 revision 기준 truth는 아래다.

- `12 agents / 30 commands / 24 skills`
- `dev-frontend-reviewer`는 현재 자산이 아님
- ds-customizer 경로는 `.plans/blueprints/ds-customizer/...`
- 깨진 링크는 `03-dependency-engine.md` 기준으로 정리

### 3.3 실행 ownership을 3계층으로 고정

이번 revision의 공식 실행 모델은 아래다.

| 주체 | 공식 책임 | 금지되는 오해 |
|------|-----------|---------------|
| Team Lead | spawn, approval, aggregation, single-writer | 직접 stage 실행 주체로 서술 금지 |
| Feature Agent | feature 단위 stage execution | 중앙 상태 writer로 서술 금지 |
| specialist agent | command 내부 전문 작업 | Team Lead 직속 상태관리자로 서술 금지 |

### 3.4 dependency는 두 종류로 분리

Team Orchestration이 관리해야 하는 dependency는 하나가 아니다.

- `hard dependency`: 실제 실행 선행 조건
- `ownership dependency`: 파일/컴포넌트 소유권 분리 규칙

문서가 이 둘을 섞으면 DAG가 과도하게 복잡해지고, 반대로 ownership 충돌이 scheduler 문제처럼 오해된다.

---

## 4. 원문별 권장 조치

| 현재 문서 | 권장 조치 | revision 기준 설명 |
|-----------|-----------|--------------------|
| [00-overview.md](../00-overview.md) | `rewrite` | 범용 목적, 불변 계약, 읽기 순서만 남긴다 |
| [01-architecture.md](../01-architecture.md) | `split` | 입력 모델, 운영 모델, 상태/게이트로 분해 |
| [02-team-model.md](../02-team-model.md) | `merge` | 운영 모델 문서에 흡수 |
| [03-dependency-engine.md](../03-dependency-engine.md) | `rewrite-base` | hard dependency DAG 문서의 베이스로 유지 |
| [04-pipeline-orchestrator.md](../04-pipeline-orchestrator.md) | `merge` | 상태/게이트/lifecycle 문서로 통합 |
| [05-approval-gates.md](../05-approval-gates.md) | `merge` | 상태/게이트/lifecycle 문서로 통합 |
| [06-agent-skill-mapping.md](../06-agent-skill-mapping.md) | `rewrite` | actual asset + missing runtime backlog 문서로 재작성 |
| [07-integration-plan.md](../07-integration-plan.md) | `rewrite` | pilot-first rollout roadmap로 재작성 |

### ds-customizer 전용 섹션의 처리

현재 원문에 흩어진 ds-customizer 내용은 대부분 별도 appendix 문서로 모으는 것이 좋다.

- 8-feature dependency graph
- F1/F8 역할
- ownership matrix
- shared code 승격 규칙
- App Shell 통합 규칙

이 내용은 새 구조에서 `06-ds-customizer-pilot`로 이동하는 것이 적절하다.

---

## 5. revision 문서가 해야 하는 역할

이번 revision 세트는 단순 피드백 문서가 아니라 아래 세 역할을 동시에 수행해야 한다.

1. `문제 진단`
현재 원문이 왜 그대로는 위험한지 설명

2. `canonical 구조 제안`
무엇을 어떤 문서로 재배치해야 하는지 결정 완료된 형태로 제시

3. `claude-kit 정합성 고정`
Fast-Track, Human Review, DVC 6항목, stage-manifest, execution SSOT와 모순되지 않게 경계 조건을 고정

---

## 6. 결론

이번 revision 라운드는 "기존 00~07을 다듬는 작업"이 아니라, **범용 오케스트레이션 문서 구조를 다시 세우는 작업**이다. ds-customizer는 첫 consumer이자 강한 pilot이지만, 본문 전체를 차지하면 안 된다. revision은 이를 분리해:

- 본문 = generic invariant
- appendix = ds-customizer pilot
- alignment = claude-kit 계약

으로 재구성하는 방향을 명시적으로 고정해야 한다.
