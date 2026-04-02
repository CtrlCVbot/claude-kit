# Team Orchestration revision 체크리스트

> 목적
> - 원문 `team-orchestration/00~07`을 바로 수정하기 전에, `현재 문서 -> 목표 구조` 매핑과 공통 계약을 체크리스트로 고정한다.
> - 이번 문서는 문장 교정 목록이 아니라 **구조 재편 체크리스트**다.

> 공통 기준
> - `12 agents / 30 commands / 24 skills`
> - `Blueprint = source spec`
> - `Approved PRD = execution SSOT`
> - `Phase B = Human Review`
> - `/dev-verify = DVC 6항목`
> - `stage-manifest.json` 확장 + Team Lead single-writer
> - ds-customizer 경로는 `.plans/blueprints/ds-customizer/...`

---

## 1. 공통 블로커

- [ ] raw blueprint를 오케스트레이션 직접 입력처럼 설명하는 서술을 제거한다.
- [ ] 오케스트레이션 입력을 `normalized feature registry`로 고정한다.
- [ ] `orchestration-state.json`을 새 SSOT처럼 설명하는 단락을 제거하거나 proposal history로 낮춘다.
- [ ] 실행 ownership을 `Team Lead / Feature Agent / specialist agent` 3계층으로 고정한다.
- [ ] hard dependency와 ownership dependency를 다른 레이어로 분리한다.
- [ ] ds-customizer를 generic rule 본문이 아니라 `pilot appendix`로 내린다.
- [ ] actual inventory/path truth를 `12 / 30 / 24`, `.plans/blueprints/ds-customizer` 기준으로 맞춘다.
- [ ] `03-dag-engine.md` 같은 가짜 문서명과 깨진 링크를 모두 추적한다.

---

## 2. 현재 문서 -> 목표 구조 매핑

| 현재 문서 | 목표 문서 | 조치 | revision 완료 기준 |
|-----------|-----------|------|--------------------|
| `00-overview.md` | `00-overview` | rewrite | 범용 목적, 불변 계약, 읽기 순서만 남음 |
| `01-architecture.md` | `01-orchestration-input-model`, `02-operating-model`, `04-state-gates-lifecycle` | split | 입력 계약, 역할 책임, 상태 구조가 분리됨 |
| `02-team-model.md` | `02-operating-model` | merge | 역할/보고 프로토콜로 흡수됨 |
| `03-dependency-engine.md` | `03-scheduler-and-dependencies` | rewrite-base | hard dependency DAG 중심으로 정리됨 |
| `04-pipeline-orchestrator.md` | `04-state-gates-lifecycle` | merge | stage/gate/lifecycle로 재편됨 |
| `05-approval-gates.md` | `04-state-gates-lifecycle` | merge | Human Review, gate 기록, retry/resume으로 흡수됨 |
| `06-agent-skill-mapping.md` | `05-assets-and-integration` | rewrite | actual asset + missing runtime backlog 중심으로 재작성됨 |
| `07-integration-plan.md` | `07-rollout-roadmap` | rewrite | pilot-first 도입 순서와 구현 분리 계획으로 바뀜 |
| ds-customizer-specific sections | `06-ds-customizer-pilot` | appendixize | pilot rules가 본문에서 분리됨 |

---

## 3. canonical 구조 체크리스트

### 3.1 `00-overview`

- [ ] "범용 목적"과 "pilot example"의 경계를 첫 화면에서 분명히 한다.
- [ ] 불변 계약 6개를 상단에 고정한다.
- [ ] 실제 없는 runtime asset을 이미 존재하는 것처럼 서술하지 않는다.

### 3.2 `01-orchestration-input-model`

- [ ] raw blueprint direct input 금지 규칙을 명시한다.
- [ ] `Entry Assessment` 이후 오케스트레이터가 feature registry를 소비한다는 흐름을 적는다.
- [ ] registry 최소 필드를 아래로 고정한다.
  - [ ] `featureSlug`
  - [ ] `entryPoint`
  - [ ] `pipelineType`
  - [ ] `executionPath`
  - [ ] `sourceRef`
  - [ ] `hardDependencies`
  - [ ] `approvalGates`

### 3.3 `02-operating-model`

- [ ] Team Lead가 single-writer임을 명시한다.
- [ ] Feature Agent가 stage execution 주체임을 명시한다.
- [ ] specialist agent는 command 내부 수행 주체임을 명시한다.
- [ ] 보고 프로토콜과 상태 기록 주체가 충돌하지 않는다.

### 3.4 `03-scheduler-and-dependencies`

- [ ] 그래프는 hard dependency만 표현한다고 명시한다.
- [ ] ownership dependency는 scheduler 밖의 ownership matrix로 보낸다.
- [ ] ready queue 우선순위를 고정한다.
  - [ ] priority
  - [ ] dependency depth
  - [ ] FIFO
- [ ] wave, parallel slot, recycle 기준이 포함된다.

### 3.5 `04-state-gates-lifecycle`

- [ ] 상태 기록은 `stage-manifest.json` 확장 기준으로 쓴다.
- [ ] `reviewPassed`와 planning gate 기록이 기존 guide와 충돌하지 않는다.
- [ ] `Phase B = Human Review`로 통일한다.
- [ ] `Phase E = /dev-verify (DVC 6항목)`로 통일한다.
- [ ] retry / resume / escalation 규칙을 상태 기록과 함께 설명한다.

### 3.6 `05-assets-and-integration`

- [ ] actual inventory를 `12 / 30 / 24`로 맞춘다.
- [ ] `dev-frontend-reviewer`를 현재 자산처럼 서술하지 않는다.
- [ ] 현재 없는 runtime asset은 proposal backlog로만 표기한다.
- [ ] `.plans/blueprints/ds-customizer/...` 기준 경로 예시를 사용한다.

### 3.7 `06-ds-customizer-pilot`

- [ ] ds-customizer가 첫 consumer임을 명시한다.
- [ ] F1/F8 역할을 pilot rule로 고정한다.
- [ ] ownership matrix와 hard dependency graph를 분리해 보여준다.
- [ ] shared code 승격 규칙을 `route-local -> app-shared -> package`로 일반화한다.

### 3.8 `07-rollout-roadmap`

- [ ] 문서 정렬 단계와 runtime 구현 단계를 분리한다.
- [ ] 이번 라운드 범위와 다음 라운드 범위를 분리한다.
- [ ] pilot-first 도입 순서를 명시한다.

---

## 4. 금지 서술 체크리스트

- [ ] raw blueprint -> `/dev-feature` 직행
- [ ] `orchestration-state.json`을 공식 SSOT로 전제
- [ ] 없는 runtime asset을 "이미 있음"처럼 기술
- [ ] `13개 에이전트`, `23+ 스킬`, `commands 28`, `skills 23`
- [ ] `.plans/ds-customizer/...` 경로 사용
- [ ] `03-dag-engine.md` 링크 유지
- [ ] `Phase B = 코드 리뷰`
- [ ] `/dev-verify = 9종 검증`처럼 읽히는 표현

---

## 5. 완료 판정

- [ ] revision 문서 전체에서 `12 / 30 / 24`, `Human Review`, `DVC 6항목`, `.plans/blueprints/ds-customizer` 기준이 일치한다.
- [ ] 오케스트레이션 입력이 feature registry라는 점이 모든 문서에서 흔들리지 않는다.
- [ ] ds-customizer-specific rule은 appendix 성격으로만 읽힌다.
- [ ] 기존 원문 중 무엇이 rewrite/split/merge/appendixize 대상인지 한 번에 보인다.
- [ ] 원문 반영 전 필요한 canonical 구조와 교체 문안이 모두 준비된다.

---

## 6. 권장 진행 순서

1. [01-review-feedback.md](./01-review-feedback.md)로 문제 분류를 확정한다.
2. [03-canonical-structure.md](./03-canonical-structure.md)로 목표 구조를 먼저 고정한다.
3. [04-revision-draft.md](./04-revision-draft.md)에서 대표 문안과 표를 준비한다.
4. [05-claude-kit-alignment.md](./05-claude-kit-alignment.md)로 guide/commands 정합성을 잠근다.
5. 그 다음에만 원문 `00~07` 수정에 들어간다.
