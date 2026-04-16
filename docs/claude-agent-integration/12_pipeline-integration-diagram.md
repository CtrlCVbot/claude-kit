# 파이프라인 통합 순서도 (Pipeline Integration Diagram)

- 문서 ID: CAI-12
- 관련 문서: [11_work-breakdown-structure.md](./11_work-breakdown-structure.md) (WBS 분류 체계), [06_command-workflow-spec.md](./06_command-workflow-spec.md) (커맨드 워크플로우), [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md) (plan 통합)
- 목적: WBS가 기존 plan/copy/dev 파이프라인에 어떻게 합류하는지를 시각적으로 표현한다.

---

## 1. 전체 파이프라인 흐름도

> 권장안(C+D 혼합, Adaptive WBS)을 기준으로 작성.

```mermaid
flowchart TD
    %% ── Epic 진입 ──
    IDEA[/"💡 아이디어 진입\n/plan-idea"/]
    SCREEN{"🔍 /plan-screen\nRICE 스크리닝"}
    DRAFT{"📋 /plan-draft\nLite / Standard 판정"}

    IDEA --> SCREEN
    SCREEN -->|승인| DRAFT
    SCREEN -->|거부| REJECT[/"❌ 거부 — 백로그"/]

    %% ── Lite Epic 경로 (옵션 D) ──
    DRAFT -->|"Lite Epic\n(Feature < 3, P0 없음)"| LITE_EVIDENCE

    subgraph LITE["🟢 Lite Epic 경로 (옵션 D)"]
        LITE_EVIDENCE["/copy-reference-refresh\n증거 수집"]
        LITE_ANALYSIS_V["/copy-visual-review"]
        LITE_ANALYSIS_I["/copy-interaction-review"]
        LITE_GAP["/copy-gap-board\n갭 우선순위화"]
        LITE_PLAN["/copy-plan-unit\nStory → 실행 단위"]
        LITE_DEV["/dev-run\nTask 실행 (TDD)"]
        LITE_VERIFY["/copy-verify"]
        LITE_CLOSE["/copy-closeout"]

        LITE_EVIDENCE --> LITE_ANALYSIS_V
        LITE_EVIDENCE --> LITE_ANALYSIS_I
        LITE_ANALYSIS_V --> LITE_GAP
        LITE_ANALYSIS_I --> LITE_GAP
        LITE_GAP --> LITE_PLAN
        LITE_PLAN --> LITE_DEV
        LITE_DEV --> LITE_VERIFY
        LITE_VERIFY --> LITE_CLOSE
    end

    %% ── Standard Epic 경로 (옵션 C) ──
    DRAFT -->|"Standard Epic\n(Feature ≥ 3 또는 P0)"| MASTER_PRD

    subgraph STANDARD["🔵 Standard Epic 경로 (옵션 C)"]
        MASTER_PRD["/plan-prd\n마스터 Overview PRD"]
        MASTER_GATE{"🚪 마스터 PRD\n사용자 승인"}

        MASTER_PRD --> MASTER_GATE
    end

    %% ── Feature 분기 ──
    MASTER_GATE -->|승인| FEATURE_SPLIT

    subgraph FEATURES["⚡ Feature 병렬 트랙"]
        FEATURE_SPLIT{{"Feature 분류\nP0 / P1 / P2"}}

        %% P0 Feature
        subgraph P0_TRACK["🔴 P0 Feature (서브 PRD 필수)"]
            P0_PRD["/plan-prd (서브)"]
            P0_WIRE["/plan-wireframe"]
            P0_BRIDGE["/plan-bridge"]
            P0_EVIDENCE["/copy-reference-refresh"]
            P0_VR["/copy-visual-review"]
            P0_IR["/copy-interaction-review"]
            P0_GB["/copy-gap-board"]
            P0_PU["/copy-plan-unit"]
            P0_DEV["/dev-run"]
            P0_CV["/copy-verify"]
            P0_CC["/copy-closeout"]

            P0_PRD --> P0_WIRE --> P0_BRIDGE
            P0_BRIDGE --> P0_EVIDENCE
            P0_EVIDENCE --> P0_VR
            P0_EVIDENCE --> P0_IR
            P0_VR --> P0_GB
            P0_IR --> P0_GB
            P0_GB --> P0_PU --> P0_DEV --> P0_CV --> P0_CC
        end

        %% P1 Feature
        subgraph P1_TRACK["🟡 P1 Feature (Lite 실행)"]
            P1_EVIDENCE["/copy-reference-refresh"]
            P1_VR["/copy-visual-review"]
            P1_IR["/copy-interaction-review"]
            P1_GB["/copy-gap-board"]
            P1_PU["/copy-plan-unit (Lite)"]
            P1_DEV["/dev-run"]
            P1_CV["/copy-verify"]
            P1_CC["/copy-closeout"]

            P1_EVIDENCE --> P1_VR
            P1_EVIDENCE --> P1_IR
            P1_VR --> P1_GB
            P1_IR --> P1_GB
            P1_GB --> P1_PU --> P1_DEV --> P1_CV --> P1_CC
        end

        FEATURE_SPLIT -->|P0| P0_TRACK
        FEATURE_SPLIT -->|P1| P1_TRACK
        FEATURE_SPLIT -->|P2| P2_BACKLOG[/"⬜ P2 백로그\n다음 Phase에서 재평가"/]
    end

    %% ── Phase/R 게이트 ──
    P0_CC --> PHASE_GATE
    P1_CC --> PHASE_GATE
    LITE_CLOSE --> PHASE_GATE

    PHASE_GATE{"🚪 Phase/R 게이트\n사용자 승인"}
    PHASE_GATE -->|승인| ARCHIVE["/plan-archive\n완료 번들"]
    PHASE_GATE -->|P2 진행| P2_BACKLOG
```

---

## 2. WBS 계층별 생성 시점 다이어그램

> 각 분류 계층이 파이프라인 어디에서 탄생하는지를 표시.

```mermaid
flowchart LR
    subgraph PLAN["📋 Plan 단계"]
        direction TB
        PI["/plan-idea"]
        PS["/plan-screen"]
        PD["/plan-draft"]
        PP["/plan-prd"]
        PW["/plan-wireframe"]
        PB["/plan-bridge"]

        PI -->|"Epic 생성"| PS
        PS --> PD
        PD -->|"Feature 목록 도출"| PP
        PP --> PW --> PB
    end

    subgraph COPY["🔍 Copy 단계"]
        direction TB
        CR["/copy-reference-refresh"]
        CVR["/copy-visual-review"]
        CIR["/copy-interaction-review"]
        CGB["/copy-gap-board"]
        CPU["/copy-plan-unit"]
        CV["/copy-verify"]
        CC["/copy-closeout"]

        CR --> CVR
        CR --> CIR
        CVR --> CGB
        CIR --> CGB
        CGB -->|"Story 생성"| CPU
        CPU --> CV --> CC
    end

    subgraph DEV["🔧 Dev 단계"]
        direction TB
        DR["/dev-run"]
        DV["/dev-verify"]
        DC["/dev-commit"]

        DR -->|"Task 실행"| DV --> DC
    end

    PB --> CR
    CPU --> DR

    %% 계층 라벨
    EPIC["🟦 Epic\n/plan-idea"] -.-> PI
    FEATURE["🟩 Feature\n/plan-draft → /plan-prd"] -.-> PD
    STORY["🟨 Story\n/copy-gap-board"] -.-> CGB
    TASK["🟧 Task\n/dev-run"] -.-> DR
```

---

## 3. 병렬 실행 Swim Lane

> 어떤 작업이 동시에 진행 가능한지를 시간축으로 표현.

```mermaid
gantt
    title Turner 홈페이지 카피 — 병렬 실행 계획 (예시)
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 🟦 Epic
    /plan-idea + /plan-screen       :e1, 2026-04-16, 1d
    /plan-draft (Standard 판정)     :e2, after e1, 1d
    마스터 Overview PRD              :e3, after e2, 2d
    마스터 PRD 승인                   :milestone, m1, after e3, 0d

    section 🔴 P0: Header
    서브 PRD + wireframe             :h1, after m1, 2d
    /plan-bridge                     :h2, after h1, 1d
    증거 수집 + 갭 분석               :h3, after h2, 2d
    Story 실행 (3개)                 :h4, after h3, 3d
    검증 + closeout                  :h5, after h4, 1d

    section 🔴 P0: Hero
    서브 PRD + wireframe             :hr1, after m1, 2d
    /plan-bridge                     :hr2, after hr1, 1d
    증거 수집 + 갭 분석               :hr3, after h3, 2d
    Story 실행 (2개)                 :hr4, after hr3, 2d
    검증 + closeout                  :hr5, after hr4, 1d

    section 🟡 P1: News+Community+Commitments
    증거 수집 (Lite)                 :p1, after m1, 1d
    갭 분석 + 갭 보드                 :p2, after p1, 2d
    Story 실행 (5개, 병렬)           :p3, after p2, 3d
    검증 + closeout                  :p4, after p3, 1d

    section 🚪 게이트
    Phase/R 승인                     :milestone, m2, after h5, 0d
```

---

## 4. 진입 조건표

### 4.1 계층 생성 진입 조건

| 계층 | 생성 조건 | 진입 커맨드 | 필수 입력 | 게이트 |
|------|----------|-----------|----------|-------|
| **Epic** | 아이디어 존재 + 사용자 요청 | `/plan-idea` | 아이디어 설명 | 없음 (누구나 등록 가능) |
| **Feature** | Epic이 `/plan-screen` 통과 + Lite/Standard 판정 완료 | `/plan-draft` | 스크리닝 결과 | `/plan-screen` 승인 |
| **Story** | Feature의 갭 분석 완료 + 갭 보드 생성 | `/copy-gap-board` | visual/interaction gap board | P0 Story = 사용자 승인 |
| **Task** | Story의 실행 단위 계획 승인 | `/dev-run` | 실행 단위 계획서 | TDD 가드 (자동) |

### 4.2 단계 전환 진입 조건

| 전환 | 조건 | 검증 방법 |
|------|------|----------|
| Plan → Copy | `/plan-bridge` 완료 + bridge context 승인 | bridge 문서 존재 확인 |
| Copy 분석 → Copy 실행 | `/copy-gap-board` 완료 + P0 갭 사용자 승인 | gap board + 사용자 확인 |
| Copy → Dev | `/copy-plan-unit` 완료 + 실행 단위 계획 승인 | 실행 단위 계획서 존재 |
| Dev → Copy 검증 | `/dev-run` 완료 (구현 + 테스트 통과) | 테스트 결과 + 빌드 성공 |
| Copy 검증 → Closeout | `/copy-verify` 통과 (READY_FOR_USER_GATE) | QA 결과 보고서 |
| Feature Closeout → Phase 게이트 | 모든 Feature의 `/copy-closeout` 완료 | 전체 Feature closeout 확인 |
| Phase 게이트 → 다음 Phase | 사용자 승인 | 명시적 승인 |

### 4.3 병렬 진입 조건

| 병렬 구간 | 조건 | 충돌 방지 |
|----------|------|----------|
| visual + interaction 분석 | 동일 Feature 내, 베이스라인 캡처 완료 후 | 분석 영역 분리 (시각 vs 인터랙션) |
| P0 Feature 간 | 마스터 PRD 승인 + 의존성 없음 | 의존성 매트릭스 확인 |
| P0 + P1 병렬 | 마스터 PRD 승인 | P0이 글로벌 CSS 변경 시 P1 대기 |
| Story 간 병렬 | 같은 Feature 내, 파일 충돌 없음 | 변경 파일 목록 사전 확인 |
| Lite Epic + Standard Epic | 서로 다른 Epic | Epic 간 파일 충돌 없음 확인 |

---

## 5. 분기점 의사결정 다이어그램

```mermaid
flowchart TD
    START((시작)) --> Q1{"아이디어가\n기존 Epic에\n속하는가?"}

    Q1 -->|Yes| Q1A{"기존 Feature에\n속하는가?"}
    Q1A -->|Yes| ADD_STORY["기존 Feature에\nStory 추가"]
    Q1A -->|No| ADD_FEATURE["기존 Epic에\nFeature 추가"]

    Q1 -->|No| Q2{"영향 범위가\n5+ 뷰포트 +\n전체 섹션?"}
    Q2 -->|Yes| NEW_EPIC["새 Epic 생성\n/plan-idea"]
    Q2 -->|No| Q3{"2+ 뷰포트 +\n단일 영역?"}
    Q3 -->|Yes| NEW_FEATURE["새 Feature 생성\n/plan-draft"]
    Q3 -->|No| Q4{"단일 Gap Row?"}
    Q4 -->|Yes| NEW_STORY["새 Story 생성\n/copy-gap-board"]
    Q4 -->|No| NEW_TASK["새 Task 생성\n/dev-run"]

    NEW_EPIC --> Q5{"Feature ≥ 3\n또는 P0?"}
    Q5 -->|Yes| STANDARD["Standard 경로\n마스터 PRD → 서브 PRD"]
    Q5 -->|No| LITE_PATH["Lite 경로\n증거 → 갭 보드 → 실행"]

    ADD_FEATURE --> Q5
```

---

## 6. 상태 전이 다이어그램

> Epic/Feature/Story의 생명주기 상태.

```mermaid
stateDiagram-v2
    [*] --> Idea : /plan-idea
    Idea --> Screening : /plan-screen
    Screening --> Rejected : 거부
    Screening --> Drafting : 승인

    Drafting --> LitePlanning : Lite 판정
    Drafting --> StandardPlanning : Standard 판정

    StandardPlanning --> MasterPRD : /plan-prd
    MasterPRD --> MasterApproved : 사용자 승인
    MasterApproved --> SubPRD : P0 Feature
    MasterApproved --> LitePlanning : P1 Feature

    LitePlanning --> EvidenceCollection : /copy-reference-refresh
    SubPRD --> EvidenceCollection : /plan-bridge

    EvidenceCollection --> GapAnalysis : /copy-visual + interaction-review
    GapAnalysis --> GapBoard : /copy-gap-board
    GapBoard --> ExecutionPlanning : /copy-plan-unit
    ExecutionPlanning --> Implementation : /dev-run
    Implementation --> Verification : /copy-verify

    Verification --> Ready : READY_FOR_USER_GATE
    Verification --> NeedsRepair : NEEDS_REPAIR
    NeedsRepair --> Implementation : 수정 후 재실행

    Ready --> Closeout : /copy-closeout
    Closeout --> PhaseGate : Phase/R 경계
    PhaseGate --> Archived : /plan-archive
    PhaseGate --> LitePlanning : P2 진행 결정

    Rejected --> [*]
    Archived --> [*]
```

---

## 7. 기존 문서와의 관계

| 기존 문서 | 본 문서 참조 위치 |
|----------|---------------|
| CAI-06 (command workflow) | §4.2 단계 전환 진입 조건 — 6단계 라이프사이클 기반 |
| CAI-08 (adoption roadmap) | 인프라 도입(A0~A9) 완료 후 본 다이어그램의 런타임 흐름 적용 |
| CAI-10 (plan integration) | §1 전체 흐름도 — Lite/Standard 분기 기반 |
| CAI-11 (WBS) | §1~§5 — 모든 다이어그램이 CAI-11의 4계층 분류를 시각화 |
| CAI-02~05 (agent specs) | §4.1 — Gap Row(VF-*/IF-*) = Story 계층 |
| CAI-09 (readiness) | §4.2 — `.plans/` 생성 게이트 SSOT 참조 |

---

## 8. 자기 검증

| 항목 | 기준 | 확인 |
|------|------|------|
| Mermaid 다이어그램 포함 | 5개 (전체 흐름, 계층 생성, Gantt, 의사결정, 상태 전이) | [ ] |
| 진입 조건표 포함 | 3개 (계층 생성, 단계 전환, 병렬) | [ ] |
| 게이트 표시 | 모든 분기점에 게이트/조건 명시 | [ ] |
| 병렬 구간 구분 | swim lane(Gantt) + 서브그래프(flowchart) | [ ] |
| 대/중/소/마이크로 표시 | 계층별 생성 시점 다이어그램에 표시 | [ ] |
| 기존 문서 미수정 | 신규 문서만 추가 | [ ] |
