# Claude Code Review Integration Plan

## 1. 리뷰 목적과 이번 단계 비범위

이 문서는 리뷰 권고(Claude Code 팀 기능 하드 제약, 하네스 적합성, 도메인 범용화)를
`docs/team-orchestration` 00~07 문서군에 어떻게 반영할지 정리한
후속 편집용 통합 계획서다.

> 주: 원본 리뷰 문서들(`review-claude-code-fit.md`, `review-harness-fit.md`, `review-domain-generalization.md`)은
> 제안이 `option-b/` 상세 문서에 흡수된 후 삭제되었다.

이번 문서의 역할은 리뷰 내용을 그대로 상속하는 것이 아니다.
역할은 리뷰 입력을 아래 세 가지로 정규화하는 것이다.

- 확정적으로 채택할 제약
- 작업용 가정으로 둘 고려사항
- 운영 모델 설계 시 선택지로 둘 항목

즉, 다음 편집자는 이 문서만 읽고도
리뷰의 어떤 주장을 채택, 보류, 기각했는지 판단할 수 있어야 한다.

### 이번 단계에서 하는 일

- 리뷰 권고 R1~R8을 실행 가능한 문서 수정 항목으로 변환한다.
- `Option B 유지`와 `Option B 재해석`을 분리한다.
- 후속 문서 편집에서 사용할 운영 모드와 용어를 고정한다.

### 이번 단계에서 하지 않는 일

- 기존 `00-current-capability-map.md` ~ `07-additions-backlog.md` 직접 수정
- 실제 skill, command, hook, rule 구현
- 실제 hook 등록 방식, command 문법, bundle 생성 로직 확정

## 2. 검증 상태별 Claude Code 고려사항

기존 리뷰는 여러 유효한 문제를 짚었지만,
모든 항목이 같은 수준의 확정 사실은 아니다.
후속 문서 편집은 아래 분류를 상위 전제로 둔다.

### A. Rejected / Corrected Input

| 항목 | 기존 리뷰 입력 | 이 문서의 처리 |
| --- | --- | --- |
| Team size cap | `최대 팀원 3명 + 리더 1명` | 하드 제약으로 채택하지 않는다 |

`최대 팀원 3명`은 더 이상 문서군 전체를 구속하는 상위 사실로 쓰지 않는다.
대신 팀 규모는 workload 크기, handoff 횟수, 병렬 편집 위험, 오퍼레이터 부담을 기준으로 조정하는
`Elastic Team Topology` 문제로 다룬다.

### B. Adopted Working Constraints

| 항목 | 후속 문서에서 채택하는 이유 |
| --- | --- |
| Hub-and-spoke communication assumption | 직접 agent 간 전달보다 오퍼레이터 세션 중재 handoff가 문서상 더 안전하다 |
| Session boundary and persistence risk | 세션 경계가 생기면 문맥과 진행 상태가 약해질 수 있으므로 문서화가 필요하다 |
| File collision risk under parallel editing | 병렬 처리 설명에는 ownership과 isolation 전략이 필요하다 |
| Hook event concretization | 추상 hook 이름만으로는 후속 구현자가 연결 지점을 판단하기 어렵다 |
| `subagent_type` explicit mapping | 역할별 agent type 차이가 문서 구현 계획에 영향을 준다 |

이 항목들은 "절대 구조 강제"가 아니라
후속 문서 편집에서 반드시 명시해야 할 운영 고려사항으로 채택한다.

### C. Operating Choices

Option B는 단일 정답이 아니라 아래 운영 모드 중 하나를 고르는 방식으로 설명한다.

| Session Mode | 언제 쓰는가 | 핵심 특징 |
| --- | --- | --- |
| `Compact Mode` | 작은 package, 짧은 handoff, 단일 흐름 작업 | 단일 세션 중심 운영 가능 |
| `Handoff Mode` | planning과 delivery, delivery와 verification 사이에 문서형 인계가 필요한 경우 | handoff bundle과 session boundary를 명시한다 |
| `Isolated Parallel Mode` | 병렬 처리 이점이 크고 파일 충돌 위험을 통제해야 하는 경우 | ownership + worktree 또는 디렉터리 파티셔닝을 전제로 한다 |

이 선택지를 반영한 결과,
Option B의 공식 해석은 더 이상
`Hybrid Claude Team (Multi-Session Protocol)`이 아니라
`Hybrid Claude Team (Session-Aware Orchestration)`이 된다.

## 3. 유지할 강점과 반드시 보정할 가정

### 유지할 강점

아래 요소는 그대로 유지한다.

| 유지 항목 | 유지 이유 |
| --- | --- |
| 역할 기반 stage 사고 | `ai-worker`의 package/ticket 구조를 소화하는 데 여전히 유효하다 |
| handoff bundle 7-item 표준 | 세션 간 전달뿐 아니라 단일 세션 내 handoff 품질 기준으로도 유효하다 |
| 독립 verification stage | `/dev-handoff-verify` backbone과 가장 잘 맞는다 |
| Option A -> B -> C 스펙트럼 | 점진 도입 전략으로 현실적이다 |
| P0/P1/P2 backlog 구분 | 문서화 이후 구현 우선순위를 정하기 좋다 |

### 반드시 보정할 가정

아래 가정은 후속 문서 편집에서 수정해야 한다.

| 기존 가정 | 보정 방향 |
| --- | --- |
| `Lead`끼리 직접 handoff 가능 | 오퍼레이터 세션이 handoff bundle을 중재한다고 쓴다 |
| Option B는 항상 다중 세션이어야 한다 | `Session Boundary Policy`에 따라 모드를 선택한다고 쓴다 |
| `Session-Bootstrap Skill`은 무조건 P0 최상단이다 | `Handoff Mode` 이상에서 우선순위가 높은 조건부 P0 자산으로 둔다 |
| 병렬화는 ownership만 있으면 충분하다 | ownership + isolation 전략이 필요하다고 쓴다 |
| hook 이름만 정하면 된다 | 실제 Claude Code 이벤트에 매핑해야 한다 |
| Option B 점수 우위가 크다 | 운영 복잡도 기준으로 다시 보정한다 |

## 4. 리뷰 권고 R1~R8 재해석

| 리뷰 항목 | 원래 리뷰의 초점 | 이 문서의 채택 방식 |
| --- | --- | --- |
| R1 | Option B를 다중 세션 프로토콜로 재정의 | `Session Boundary Policy`를 명시하는 방향으로 완화 |
| R2 | `Lead` 명칭을 `Agent`로 교체 | 채택. 용어 혼동 제거 목적은 유지 |
| R3 | `Session-Bootstrap Skill`을 P0 최상단으로 승격 | 조건부 채택. `Handoff Mode`에서 우선순위가 높은 자산으로 둔다 |
| R4 | handoff bundle 파일 경로/포맷 명시 | 채택. bundle 문서화 품질 향상에 필요 |
| R5 | 병렬 처리 점수 하향 + 파일 파티셔닝 전략 추가 | 채택. 단, 근거를 팀원 수 제한이 아닌 coordination/isolation 비용으로 바꾼다 |
| R6 | hook 이벤트 매핑 명시 | 채택 |
| R7 | 비교 매트릭스 점수 보정 | 채택. 단, 보정 근거를 다시 쓴다 |
| R8 | `subagent_type` 매핑 명시 | 채택 |

### Option B 재정의

후속 문서 편집에서는 아래 결정을 바꾸지 않는다.

- Option B의 공식 해석은 `Hybrid Claude Team (Session-Aware Orchestration)`이다.
- 작은 package는 `Compact Mode`로 단일 세션 운영 가능하다.
- package handoff가 길어질 때만 `Handoff Mode`를 쓴다.
- 병렬 편집 위험이 있을 때만 `Isolated Parallel Mode`를 쓴다.

## 5. 고정 용어와 인터페이스

후속 편집 단계에서는 아래 용어를 기준 언어로 고정한다.

| 용어 | 정의 | 반영 이유 |
| --- | --- | --- |
| `Operator Session` | 팀 orchestration과 bundle 전달을 중재하는 기준 세션 | handoff 책임을 명확히 한다 |
| `Elastic Team Topology` | workload 크기와 위험도에 따라 팀 규모와 구성 방식을 조정하는 원칙 | 고정 팀원 수 가정을 제거한다 |
| `Session Mode` | `Compact`, `Handoff`, `Isolated Parallel` 중 하나의 운영 모드 | Option B를 적응형 운영 모델로 설명하기 위함 |
| `Session Boundary Policy` | 언제 세션을 나누고 언제 단일 세션으로 유지할지 정하는 기준 | 멀티세션 강제를 피하고 선택 기준을 남긴다 |
| `Handoff Bundle` | 세션 간 또는 stage 간 전달의 최소 표준 묶음 | review의 강점을 유지하면서 범용성을 높인다 |
| `Session-Bootstrap Skill` | handoff bundle을 읽고 다음 stage를 여는 자산 | 세션 전환이 필요한 경우의 핵심 자산 |
| `File Ownership / Isolation Strategy` | 병렬 편집 충돌을 막기 위한 파일 분리/격리 규칙 | C5 성격의 위험을 정책 수준으로 다룬다 |
| `subagent_type mapping` | 역할별 Claude Code agent type 표 | 실제 도구 사용 제약 반영 |

## 6. `review item -> target doc -> planned change` 매핑 표

| Review Item | Target Doc | Planned Change |
| --- | --- | --- |
| R1 | `03-option-b-hybrid-claude-team.md` | Option B 정의를 `Session-Aware Orchestration`으로 재작성하고 mode 선택 기준을 추가 |
| R1 | `06-recommended-operating-model.md` | flow를 단일 정답이 아닌 `Compact` / `Handoff` / `Isolated Parallel` 선택 구조로 정리 |
| R2 | `03-option-b-hybrid-claude-team.md` | `Planning Lead` 등 명칭을 `Planning Agent` 등으로 변경하고 `Operator Session` 정의 추가 |
| R2 | `06-recommended-operating-model.md` | 팀 표와 운영 순서에서 `Lead` 표현 정리 |
| R3 | `07-additions-backlog.md` | `Session-Bootstrap Skill`을 `Handoff Mode P0` 또는 조건부 P0 자산으로 재배치 |
| R4 | `06-recommended-operating-model.md` | handoff bundle 파일 경로/포맷을 문서화 항목으로 추가 |
| R4 | `07-additions-backlog.md` | bundle file path/format 항목을 구현 전 문서화 요구사항으로 추가 |
| R5 | `05-comparison-matrix.md` | Option B의 도입 난이도, 운영자 부담, 병렬 처리, 적합도 점수를 운영 복잡도 기준으로 재보정 |
| R5 | `03-option-b-hybrid-claude-team.md` | 병렬 처리 설명에 ownership과 isolation 전략을 함께 전제로 추가 |
| R5 | `04-option-c-control-tower.md` | 병렬 처리 강점 설명에 충돌 방지 전제를 추가 |
| R6 | `07-additions-backlog.md` | `ownership-hook`, `handoff-bundle-hook`, `doc-sync-trigger`, `status-report-hook`를 실제 이벤트에 매핑 |
| R7 | `05-comparison-matrix.md` | 리뷰 보정 점수 또는 보정 주석 반영 |
| R8 | `06-recommended-operating-model.md` | 역할별 `subagent_type` 표 추가 |
| R8 | `07-additions-backlog.md` | `subagent_type mapping`을 문서화 항목으로 추가 |
| Validated constraints | `00-current-capability-map.md` | 확정 제약과 운영 고려사항을 분리해 상위 가정으로 추가 |
| Validated constraints | `01-ai-worker-workload-map.md` | workload orchestration 설명에 session boundary policy와 handoff bundle 가정 추가 |

## 7. 문서별 수정 지시

### A. 상위 가정 문서

#### 대상

- `00-current-capability-map.md`
- `01-ai-worker-workload-map.md`

#### 수정 지시

- Claude Code 관련 내용을 `확정 제약`과 `운영 고려사항`으로 나누어 추가한다.
- `ai-worker` orchestration을 무조건 세션 분리하는 모델이 아니라
  `Session Boundary Policy`를 선택하는 모델로 설명한다.
- handoff bundle을 단일 세션에서도 쓸 수 있는 전달 표준,
  세션 분리 시에는 지속 메커니즘으로 설명한다.

### B. Option B 핵심 문서

#### 대상

- `03-option-b-hybrid-claude-team.md`

#### 수정 지시

- 제목 또는 서두에서 `Hybrid Claude Team (Session-Aware Orchestration)` 정체성을 명시한다.
- `Lead` 용어를 제거하고 `Planning Agent`, `Delivery Agent`, `Assurance Agent`로 바꾼다.
- `Compact Mode`, `Handoff Mode`, `Isolated Parallel Mode`를 구분해 설명한다.
- `New Team Composition`, `Pipeline Overlay`, `Operator Flow`, `Risks`, `Fit for ai-worker`는
  모드 선택 기준이 드러나도록 다시 쓴다.
- 병렬 처리 설명에는 `File Ownership / Isolation Strategy`를 전제로 붙인다.

### C. 비교 판단 문서

#### 대상

- `05-comparison-matrix.md`

#### 수정 지시

- Option B의 점수를 팀원 수 제한이 아니라 운영 복잡도, session handoff 비용,
  병렬 coordination 비용 기준으로 다시 계산한다.
- Option B의 상대 우위는 유지하되,
  Option A와의 차이를 과도하게 벌리지 않는다.
- 병렬 처리 강점은 유지하되 파일 충돌 위험과 ownership/isolation 비용을 함께 적는다.

### D. 추천 운영 모델 문서

#### 대상

- `06-recommended-operating-model.md`

#### 수정 지시

- 운영 모델 서두에 `Session Mode` 선택 기준을 추가한다.
- `Compact Mode`에서는 단일 세션 운영이 가능하다고 명시한다.
- `Handoff Mode`에서는 bundle과 `Session-Bootstrap Skill`이 핵심 자산이라고 쓴다.
- `Isolated Parallel Mode`에서는 ownership과 worktree 또는 디렉터리 파티셔닝을 같이 적는다.
- 역할별 `subagent_type mapping` 표를 추가 대상으로 명시한다.

### E. additions backlog 문서

#### 대상

- `07-additions-backlog.md`

#### 수정 지시

- `Session-Bootstrap Skill`을 무조건 P0 최상단으로 두지 말고
  `Handoff Mode P0` 또는 조건부 P0 자산으로 정리한다.
- hook 후보를 실제 Claude Code 이벤트(`PreToolUse`, `PostToolUse`, `Notification`) 기준으로 정리한다.
- `handoff bundle file path/format`, `File Ownership / Isolation Strategy`,
  `subagent_type mapping`을 문서화 대상 항목으로 추가한다.
- backlog 우선순위 설명에도 `Session Mode`별 필요도가 달라진다는 점을 반영한다.

## 8. 후속 문서 편집 우선순위

후속 편집은 아래 순서로 진행한다.

1. `03-option-b-hybrid-claude-team.md`
2. `06-recommended-operating-model.md`
3. `07-additions-backlog.md`
4. `05-comparison-matrix.md`
5. `00-current-capability-map.md`
6. `01-ai-worker-workload-map.md`
7. 필요 시 `04-option-c-control-tower.md`

이 순서를 택하는 이유는
Option B의 정체성과 운영 모드를 먼저 고정해야
운영 모델, backlog 우선순위, 비교 점수가 함께 정렬되기 때문이다.

## 9. 다음 편집 단계의 완료 조건

후속 편집이 완료되었다고 보려면 아래 조건을 만족해야 한다.

1. `최대 팀원 3명` 같은 고정 인원 가정이 문서군에서 제거된다.
2. Option B가 `Hybrid Claude Team (Session-Aware Orchestration)`으로 명확히 서술된다.
3. Option B 안에서 `Compact Mode`, `Handoff Mode`, `Isolated Parallel Mode`의 차이가 구분된다.
4. handoff bundle이 전달 표준으로 유지되며, 세션 분리 시에는 지속 메커니즘으로 설명된다.
5. 병렬 처리 설명마다 ownership과 isolation 전략이 함께 언급된다.
6. `Session-Bootstrap Skill`이 조건부 우선순위 자산으로 정리된다.
7. hook 후보가 실제 Claude Code 이벤트에 매핑된다.
8. `subagent_type mapping`이 문서상에서 빠지지 않는다.
9. 비교 매트릭스의 Option B 점수가 운영 복잡도 기준으로 보정된다.

이 조건을 만족하면,
그 다음 단계에서야 기존 00~07 문서를 실제로 수정하는 작업이 안전하게 시작될 수 있다.
