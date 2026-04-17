# Design Analysis

- 문서 ID: CAI-APPENDIX-02
- 목적: CAI-10~13의 핵심 분석 근거를 보존한다. 본문 문서(01~06)의 설계 결정이 어떤 분석 과정을 거쳐 도출되었는지 추적할 수 있게 한다.
- 성격: 본문의 source of truth가 아니며, 구현 계획의 필수 입력도 아니다. 설계 근거 아카이브 역할만 한다.

## 1. 목적

본문 문서(01~06)는 확정된 설계 결정만 담는다. 그러나 왜 그 결정에 도달했는지, 어떤 대안을 검토했는지는 본문에 적지 않는다. 이 appendix는 그 분석 과정을 보존한다.

| 원본 문서 | 분석 주제 | 본문 반영 위치 |
| --- | --- | --- |
| CAI-10 | plan 워크플로우 통합 | 03-workflow-and-pipeline.md |
| CAI-11 | WBS 분류 체계 | 01-scope-and-decisions.md |
| CAI-12 | 파이프라인 다이어그램 | 03-workflow-and-pipeline.md |
| CAI-13 | 파이프라인 순서 | 01-scope-and-decisions.md, 03-workflow-and-pipeline.md |

## 2. CAI-10: Plan 워크플로우 통합 분석

**원본**: [archive/2026-04-16-original/10_plan-workflow-integration-plan.md](../archive/2026-04-16-original/10_plan-workflow-integration-plan.md)

### 2.1 분석 배경

기존 CAI 문서 패키지(00~09)는 `core`, `dev`, 그리고 프로젝트 전용 `/copy-*` 중심으로 설계되었다. 이후 claude-kit에 `plan` 도메인이 추가되면서 `/plan-idea`부터 `/plan-bridge`까지 기획 산출물을 개발 진입 전 단계로 연결하는 공식 흐름이 존재하게 되었다. CAI-10은 이 plan 기능을 copy 파이프라인에 어떻게 연결할지 분석한 문서다.

### 2.2 핵심 분석 내용

**plan 도메인 현황 분석**:
- 10 commands, 6 agents, 8 skills, 1 hook (`plan-doc-guard.js`)
- 활성 도메인: `core`, `dev`, `plan` (claude-kit 2.1.0 기준)
- `.plans/` 산출물은 아직 미생성 상태

**RICE 해석 보정**: Turner 프로젝트에서 RICE를 정밀 카피에 맞게 재해석하는 기준을 도출했다.
- **Reach** = 영향받는 뷰포트, 섹션, 상태, 반복 노출 빈도
- **Impact** = 원본 대비 체감 차이 감소 효과
- **Confidence** = reference/current screenshot, video, timing evidence 보유 수준
- **Effort** = CSS/JS 변경 규모, capture 재수집, QA 반복 비용

**Lite/Standard 판정**: `/plan-draft` 시점에서 규모에 따라 기획 깊이를 조절하는 기준을 도출했다. 작은 gap은 Lite(PRD 없이 바로 실행), 복잡한 영역은 Standard(마스터 PRD -> 서브 PRD)로 분류한다.

**plan/copy/dev 책임 경계 확정**:
- plan = 선별(screening), PRD, wireframe, bridge handoff
- copy = reference evidence, fidelity gap 분석, QA 검증
- dev = 승인된 요구사항의 구현

### 2.3 도출된 설계 결정

| 결정 | 근거 |
| --- | --- |
| plan은 copy의 pre-stage | plan이 "무엇을 할지"를 고정하고, copy가 "얼마나 다른지"를 측정 |
| `/plan-draft`에서 시나리오 + Feature 유형 + Lite/Standard를 동시 판정 | 가장 이른 시점에 파이프라인 경로를 결정하여 불필요한 분석 방지 |
| `.plans/` 생성은 별도 승인 | 무심코 plan command를 실행하면 새 planning tree가 생기므로 gate 필요 |

## 3. CAI-11: WBS 분류 체계 분석

**원본**: [archive/2026-04-16-original/11_work-breakdown-structure.md](../archive/2026-04-16-original/11_work-breakdown-structure.md)

### 3.1 분석 배경

CAI 문서에서 `대그룹 > 중그룹 > 소그룹 > 실행 단위` 계층은 언급되었지만, 분류 기준, 파이프라인 생성 시점, 병렬 실행 가능 구간, 분해 트리거가 부재했다.

### 3.2 4가지 WBS 옵션 비교

| 옵션 | 접근 | 병렬성 | 전체 조감 | 문서 부담 |
| --- | --- | --- | --- | --- |
| A: 마스터 PRD | Epic 전체를 1개 PRD로 커버 | 낮음 | 높음 | 중간 |
| B: 독립 PRD | Feature별 독립 PRD | 높음 | 낮음 | 높음 |
| C: 하이브리드 | 마스터 개요 + 서브 PRD | 중간 | 높음 | 높음 |
| D: 갭 보드 기반 | 증거 수집 먼저 -> 점진적 정제 | 높음 | 중간 | 낮음 |

### 3.3 시나리오 적응형 WBS(C+D 혼합) 권장안

대규모 기획에는 옵션 C(구조적 안전성)와 D(증거 기반 점진성)를 결합하는 것을 권장했다. 시나리오(A/B/C)에 따라 파이프라인 순서를 결정하고, 규모(Lite/Standard)에 따라 문서 깊이를 조절한다.

### 3.4 카피 시나리오 3분류 도출 배경

WBS 분류와 별개로, 카피 작업의 시나리오에 따라 파이프라인 순서가 달라지는 것을 발견했다.

| 시나리오 | 상황 | 갭 분석 역할 |
| --- | --- | --- |
| A: 백지 카피 | 원본은 있지만 구현이 없음 | 무의미 (비교할 현재가 없음) |
| B: 부분 카피 | 기존 프로젝트에 원본의 특정 부분만 가져옴 | 해당 없음 (새 부분이라 시도한 적 없음) |
| C: 충실도 교정 | 이미 카피를 시도했는데 원본과 다름 | 핵심 (현재 vs 원본 차이) |

이 3분류가 본문 01-scope-and-decisions.md의 시나리오 의사결정 트리로 확정되었다.

### 3.5 WBS 4계층 확정

| 계층 | 코드 | 규모 기준 | 파이프라인 생성 시점 |
| --- | --- | --- | --- |
| Epic (대) | `E-{NN}` | 10+ 파일, 5+ 뷰포트, 전체 섹션 | `/plan-idea` |
| Feature (중) | `F-{AREA}-{NN}` | 3~10 파일, 2~3 뷰포트 | `/plan-draft` -> `/plan-prd` |
| Story (소) | `S-{AREA}-{NN}` | 1~3 파일, Gap Row 1개 | `/copy-gap-board` |
| Task (마이크로) | `T-{AREA}-{NN}` | 단일 파일, 1 커밋 | `/dev-run` 내부 |

## 4. CAI-12: 파이프라인 다이어그램 분석

**원본**: [archive/2026-04-16-original/12_pipeline-integration-diagram.md](../archive/2026-04-16-original/12_pipeline-integration-diagram.md)

### 4.1 분석 배경

CAI-11의 WBS가 기존 plan/copy/dev 파이프라인에 어떻게 합류하는지를 시각적으로 표현하기 위해 5개 Mermaid 다이어그램을 설계했다.

### 4.2 5개 다이어그램의 설계 근거

| 다이어그램 | 목적 | 핵심 설계 판단 |
| --- | --- | --- |
| 전체 파이프라인 흐름도 | 시나리오 A/B/C 분기와 Dev 경로를 한눈에 표시 | 시나리오 A/B는 PRD 먼저, C는 갭 먼저 |
| WBS 계층별 생성 시점 | 각 분류 계층이 어떤 커맨드에서 탄생하는지 표시 | Epic=plan-idea, Feature=plan-draft, Story=copy-gap-board, Task=dev-run |
| 병렬 실행 Swim Lane | 어떤 작업이 동시에 진행 가능한지 시간축으로 표현 | P0 Feature 간 병렬, P0+P1 병렬, visual+interaction 분석 병렬 |
| 분기점 의사결정 | 아이디어가 어떤 계층/시나리오로 분류되는지 의사결정 흐름 | 영향 범위 -> 계층 판정, 구현 존재 여부 -> 시나리오 판정 |
| 상태 전이 | Epic/Feature/Story의 생명주기 상태 | Idea -> Screening -> Drafting -> ... -> Archived |

### 4.3 시나리오x규모 매트릭스 도출

다이어그램 분석 과정에서 시나리오(A/B/C)와 규모(Lite/Standard)의 조합이 6가지 파이프라인 경로를 만든다는 것을 확인했다. 이 매트릭스가 본문 03-workflow-and-pipeline.md의 핵심 경로표로 확정되었다.

### 4.4 진입 조건표 설계

각 계층 생성, 단계 전환, 병렬 진입에 대한 조건표를 설계했다. 이 조건표가 본문의 게이트 정의에 반영되었다.

## 5. CAI-13: 파이프라인 순서 분석

**원본**: [archive/2026-04-16-original/13_pipeline-order-analysis.md](../archive/2026-04-16-original/13_pipeline-order-analysis.md)

### 5.1 분석 배경

CAI-11의 Standard 경로에서 PRD/wireframe과 copy 분석의 순서가 문제였다. 기존에는 PRD를 먼저 쓰고 copy 분석을 나중에 하는 구조였는데, 시나리오 C(충실도 교정)에서는 갭 데이터 없이 PRD를 쓰면 추측 기반이 된다.

### 5.2 3가지 대안 비교

| 대안 | 접근 | PRD 정확도 | plan 순서 유지 |
| --- | --- | --- | --- |
| A: 역전 | copy 분석 먼저 -> PRD | 높음 | 깨짐 |
| B: 2-패스 | 탐색적 분석 -> PRD -> 정밀 분석 | 높음 | 유지 |
| C: 범위+상세 PRD | 범위 PRD -> 갭 분석 -> 상세 PRD | 높음 | 유지 |

### 5.3 시나리오별 순서 권장안

분석 결과, 시나리오에 따라 순서가 달라져야 한다는 결론에 도달했다.

| 시나리오 | 권장 순서 | 근거 |
| --- | --- | --- |
| A: 백지 카피 | PRD 먼저 | 비교할 현재 구현이 없으므로 갭 분석 불가 |
| B: 부분 카피 | PRD 먼저 | 해당 영역이 미구현이므로 갭 분석 불가 |
| C: 충실도 교정 | 갭 분석 먼저 | 현재 구현이 존재하므로 갭 측정 가능. 갭 데이터가 상세 PRD의 입력 |

이 권장안이 본문 01-scope-and-decisions.md의 시나리오별 순서 결정과 03-workflow-and-pipeline.md의 워크플로우 정의에 확정되었다.

### 5.4 Feature 유형(copy/dev) 라우팅 분석

copy 워크플로우가 필요 없는 Feature가 존재한다는 것을 발견했다. 새 기능 추가, API/백엔드 변경, 접근성 개선, 성능 최적화 등은 원본 비교가 불필요하다.

이에 따라 Feature를 두 가지 유형으로 분류하는 것을 권장했다:

| 유형 | 정의 | 적용 워크플로우 |
| --- | --- | --- |
| Copy Feature | 원본과의 시각적/인터랙션 차이를 닫는 작업 | plan -> copy -> dev |
| Dev Feature | 원본에 없는 새 기능이나 비시각적 변경 | plan -> dev 직행 |

`/plan-draft` 시점에 Feature 유형을 태깅하는 것을 권장했으며, 이 결정이 본문에 확정되었다.

### 5.5 검토한 반대 의견

| 반대 | 분석 결과 |
| --- | --- |
| PRD를 2번 쓰면 오버엔지니어링 | 범위 PRD는 영역 목록 + 뷰포트 + 우선순위 3가지만 담는 얇은 문서 |
| 모든 Feature에 copy를 적용하면 일관성이 높다 | 불필요한 갭 분석 비용이 Feature 수에 비례하여 증가 |
| Hybrid Feature 유형이 필요한가 | 실제 적용 시 빈번하지 않으면 제거 가능. copy/dev 2분류로 단순화 |

## 6. 원본 참조 경로 요약

| 원본 문서 | 경로 |
| --- | --- |
| CAI-10 | `archive/2026-04-16-original/10_plan-workflow-integration-plan.md` |
| CAI-11 | `archive/2026-04-16-original/11_work-breakdown-structure.md` |
| CAI-12 | `archive/2026-04-16-original/12_pipeline-integration-diagram.md` |
| CAI-13 | `archive/2026-04-16-original/13_pipeline-order-analysis.md` |
