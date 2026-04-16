# 작업 분류 체계 (Work Breakdown Structure)

- 문서 ID: CAI-11
- 관련 문서: [06_command-workflow-spec.md](./06_command-workflow-spec.md) (실행 단위 라이프사이클), [08_adoption-roadmap.md](./08_adoption-roadmap.md) (도입 로드맵), [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md) (plan 통합, Lite/Standard 판정)
- 목적: 대규모 기획을 체계적으로 분해하여 기존 plan/copy/dev 파이프라인에 매핑하는 분류 기준과 실행 전략을 정의한다.

---

## 1. 문제 정의

현재 CAI 문서에서 `대그룹 > 중그룹 > 소그룹 > 실행 단위` 계층은 언급되지만(CAI-10 §8), 다음이 부재하다:

1. 각 계층의 **분류 기준** (무엇이 "대"이고 무엇이 "소"인지)
2. 각 계층이 **어떤 파이프라인 단계에서 생성**되는지
3. **병렬 실행** 가능 구간과 조건
4. 한 계층에서 다음 계층으로 **분해되는 트리거와 게이트**

---

## 2. 분류 계층 정의

| 계층 | 코드 | 정의 | 규모 기준 | Turner 예시 | 파이프라인 생성 시점 |
|------|------|------|----------|------------|-------------------|
| **Epic** (대) | `E-{NN}` | 프로젝트 수준 목표. 복수 Phase/R을 포괄 | 10+ 파일 변경, 5+ 뷰포트, 전체 섹션 | "Turner 홈페이지 정밀 카피" | `/plan-idea` |
| **Feature** (중) | `F-{AREA}-{NN}` | 기능 영역 단위. 독립 PRD 또는 마스터 PRD의 섹션 | 3~10 파일, 2~3 뷰포트, 단일 섹션/컴포넌트 | "Header 충실도", "Hero 영역", "Commitments 상태" | `/plan-draft` → `/plan-prd` |
| **Story** (소) | `S-{AREA}-{NN}` | 단일 갭 또는 개선 항목. CAI-02/03의 Gap Row 1개 | 1~3 파일, 1~2 뷰포트 | "Header hover timing", "Hero CTA mobile weight" | `/copy-gap-board` → `/copy-plan-unit` |
| **Task** (마이크로) | `T-{AREA}-{NN}` | 원자적 구현 단위. 1 커밋 = 1 태스크 | 단일 파일, 단일 속성 변경 | "header hover duration 200ms→150ms", "스크린샷 비교" | `/dev-run` 내부 |

### 계층 간 관계

```
Epic (대)
 ├── Feature (중) ──── 독립 PRD 또는 마스터 PRD 섹션
 │    ├── Story (소) ── Gap Row (VF-*/IF-*) 1개
 │    │    ├── Task (마이크로) ── 구현 1 커밋
 │    │    └── Task (마이크로) ── 검증 1 커밋
 │    └── Story (소)
 └── Feature (중)
```

### 분류 판정 기준 (의사결정 트리)

```
아이디어 진입
  │
  ├── 영향 범위 ≥ 5 뷰포트 + 전체 섹션?
  │    YES → Epic (대)
  │    NO ↓
  ├── 영향 범위 ≥ 2 뷰포트 + 단일 영역?
  │    YES → Feature (중)
  │    NO ↓
  ├── 단일 Gap Row로 표현 가능?
  │    YES → Story (소)
  │    NO ↓
  └── 단일 파일/속성 변경?
       YES → Task (마이크로)
```

---

## 3. 옵션 비교

### 옵션 A: 마스터 PRD → 섹션별 분해

```
아이디어 → /plan-screen → /plan-draft(Standard)
  → 마스터 PRD 1개 (Epic 전체 커버)
    → PRD 내 섹션 = Feature
      → 각 Feature의 Gap Row = Story
        → 구현 = Task
```

**흐름**:
1. `/plan-idea` → Epic 등록
2. `/plan-screen` → RICE 스크리닝 (Epic 단위)
3. `/plan-draft` → Standard 판정
4. `/plan-prd` → **마스터 PRD 1개** (Header, Hero, Sections, Footer 모두 포함)
5. `/plan-wireframe` → 마스터 wireframe
6. `/plan-bridge` → Feature별 bridge context 생성
7. `/copy-gap-board` → Feature별 Gap Row 추출 → Story 생성
8. `/copy-plan-unit` → Story별 실행 단위 계획
9. `/dev-run` → Task 실행

**병렬 구간**: Step 7 이후 — Feature별 Story/Task 병렬 가능. 그 이전은 순차.

| 장점 | 단점 |
|------|------|
| 전체 조감도가 하나의 PRD에 있어 일관성 높음 | PRD 작성이 병목 (Epic 전체를 한 번에 설계) |
| Feature 간 의존성을 PRD에서 미리 식별 | PRD 승인 전까지 모든 Feature가 대기 |
| 공유 제약(글로벌 스타일, 반응형 브레이크포인트)을 중앙 관리 | PRD 크기가 커져 리뷰 부담 증가 |
| 기존 `/plan-prd` 커맨드 1회 실행으로 충분 | Feature 간 독립성이 높을 때 불필요한 결합 |

---

### 옵션 B: 영역별 독립 PRD

```
아이디어 → /plan-screen → /plan-draft
  → 영역별 Lite/Standard 판정
    → Standard: 영역별 독립 PRD (Feature = PRD)
    → Lite: 바로 /copy-plan-unit (Story)
```

**흐름**:
1. `/plan-idea` → Epic 등록
2. `/plan-screen` → RICE 스크리닝 (Epic 단위)
3. `/plan-draft` → Epic을 **Feature 목록으로 분해** + 각 Feature별 Lite/Standard 판정
4. Standard Feature: `/plan-prd` × N개 (Feature별 독립 PRD)
5. Lite Feature: `/copy-gap-board` → `/copy-plan-unit` (PRD 건너뜀)
6. 각 Feature PRD → `/plan-bridge` → Story → Task

**병렬 구간**: Step 4부터 — 모든 Feature가 독립적으로 병렬 진행.

| 장점 | 단점 |
|------|------|
| Feature별 즉시 병렬 진행 가능 | Feature 간 공유 제약(글로벌 CSS 변수 등) 관리 어려움 |
| 한 Feature가 지연되어도 다른 Feature 진행 가능 | PRD 수가 많아져 문서 관리 부담 |
| Lite/Standard 분기로 작은 갭은 빠르게 처리 | 전체 조감도가 부재 — Feature 간 충돌 사후 발견 |
| 각 PRD가 짧아 리뷰 빠름 | `/plan-prd` 커맨드를 Feature 수만큼 반복 실행 |

---

### 옵션 C: 하이브리드 (마스터 개요 + 서브 PRD)

```
아이디어 → /plan-screen → /plan-draft(Standard)
  → 마스터 Overview PRD (전체 조감 + 공유 제약 + Feature 목록)
    → 서브 PRD × N (Feature별 상세)
      → 각 서브 PRD → Story → Task
```

**흐름**:
1. `/plan-idea` → Epic 등록
2. `/plan-screen` → RICE 스크리닝
3. `/plan-draft` → Standard 판정
4. `/plan-prd` (1차) → **마스터 Overview PRD**: 전체 범위, 공유 제약, Feature 목록, 우선순위, 의존성 매트릭스
5. 마스터 승인 후 → `/plan-prd` (2차~) × N → **서브 PRD**: Feature별 상세 요구사항
6. `/plan-wireframe` → Feature별 (복잡한 것만)
7. `/plan-bridge` → Feature별 bridge context
8. `/copy-gap-board` → Story 추출
9. `/copy-plan-unit` + `/dev-run` → Task

**병렬 구간**: Step 5부터 — 마스터 승인 후 서브 PRD 병렬 작성. Step 8부터 Feature별 병렬 실행.

| 장점 | 단점 |
|------|------|
| 전체 조감 + 병렬 실행 모두 확보 | 문서 2단계 (마스터 → 서브) 관리 필요 |
| 공유 제약을 마스터에서 중앙 관리 | 마스터 PRD 승인이 첫 번째 병목 |
| Feature 간 의존성을 마스터에서 미리 정의 | 작은 Epic에는 오버엔지니어링 |
| 서브 PRD가 짧아 리뷰 효율적 | `/plan-prd`를 N+1회 실행 |

---

### 옵션 D: 갭 보드 기반 점진적 정제 (Progressive Refinement)

```
아이디어 → /plan-screen
  → /copy-reference-refresh (증거 수집 먼저)
    → /copy-visual-review + /copy-interaction-review (갭 분석)
      → /copy-gap-board (우선순위화된 갭 목록)
        → P0 갭: /plan-prd (필요시) → /copy-plan-unit → /dev-run
        → P1 갭: /copy-plan-unit (Lite) → /dev-run
        → P2 갭: 백로그 대기
```

**흐름**:
1. `/plan-idea` → Epic 등록
2. `/plan-screen` → RICE 스크리닝
3. **PRD 전에 증거 수집**: `/copy-reference-refresh` → 베이스라인 캡처
4. **갭 분석 먼저**: `/copy-visual-review` + `/copy-interaction-review` (병렬)
5. `/copy-gap-board` → 우선순위화된 갭 목록 (Feature/Story가 자연스럽게 도출)
6. P0 갭이 복잡하면 → `/plan-prd` (해당 Feature만)
7. P1 갭은 → `/copy-plan-unit` (Lite 실행 단위)
8. `/dev-run` → Task 실행

**병렬 구간**: Step 4 (visual + interaction 분석 병렬) + Step 6~7 (P0 PRD 작성과 P1 Lite 실행 병렬).

| 장점 | 단점 |
|------|------|
| **증거 기반**: PRD를 쓰기 전에 실제 갭을 먼저 확인 | 전체 범위를 미리 파악하기 어려움 |
| CAI 철학(capture-first, fidelity-first)에 가장 부합 | 구조적 문제(아키텍처 변경)를 놓칠 수 있음 |
| 작은 갭은 PRD 없이 바로 실행 → 빠른 반복 | Feature 간 의존성 관리가 사후적 |
| 불필요한 문서 생산 최소화 | 대규모 Epic에서 방향 잡기 어려울 수 있음 |
| P0/P1/P2 우선순위로 자연스런 점진적 개선 | 전체 완료 시점 예측 어려움 |

---

## 4. 옵션 비교 요약

| 기준 | A: 마스터 PRD | B: 독립 PRD | C: 하이브리드 | D: 갭 보드 기반 |
|------|:---:|:---:|:---:|:---:|
| **병렬성** | 낮음 (PRD 후) | 높음 (draft 후) | 중간 (마스터 후) | 높음 (분석 후) |
| **전체 조감** | 높음 | 낮음 | 높음 | 중간 |
| **문서 부담** | 중간 (1 PRD) | 높음 (N PRD) | 높음 (1+N PRD) | 낮음 (필요시만) |
| **첫 실행까지 시간** | 길다 | 중간 | 중간 | 짧다 |
| **CAI 철학 정합** | 중간 | 중간 | 중간 | 높음 |
| **의존성 관리** | 강함 | 약함 | 강함 | 약함 |
| **작은 Epic 적합** | 부적합 | 적합 | 부적합 | 적합 |
| **큰 Epic 적합** | 적합 | 위험 | 적합 | 위험 |

---

## 5. 권장안: C+D 혼합 (Adaptive WBS)

대규모 기획에는 **옵션 C**(구조적 안전성)와 **옵션 D**(증거 기반 점진성)를 결합한다.

### 5.1 핵심 아이디어

> **마스터 Overview로 방향을 잡되, 실제 분해는 갭 보드가 주도한다.**

```
Epic 진입
  │
  ├── /plan-screen (RICE)
  │
  ├── /plan-draft → Lite or Standard 판정
  │    │
  │    ├── Lite Epic (Feature 3개 미만, P1/P2 위주)
  │    │    → 옵션 D 적용: 증거 → 갭 보드 → 즉시 실행
  │    │
  │    └── Standard Epic (Feature 3개 이상, P0 포함)
  │         │
  │         ├── /plan-prd (마스터 Overview)
  │         │    - 전체 Feature 목록
  │         │    - 공유 제약 (글로벌 CSS, 브레이크포인트, 타이포 스케일)
  │         │    - Feature 간 의존성 매트릭스
  │         │    - 우선순위 (P0 Feature 먼저)
  │         │
  │         ├── 마스터 승인
  │         │
  │         ├── [병렬] Feature별 진행:
  │         │    ├── P0 Feature → /plan-prd (서브) → /plan-wireframe → /plan-bridge
  │         │    ├── P1 Feature → /copy-gap-board → /copy-plan-unit (Lite)
  │         │    └── P2 Feature → 백로그
  │         │
  │         └── 각 Feature 내부:
  │              └── 옵션 D 적용: 증거 → 갭 → Story → Task
```

### 5.2 판정 기준표

| 판정 시점 | 조건 | 결과 | 적용 옵션 |
|----------|------|------|----------|
| `/plan-draft` | Feature 3개 미만 + P0 없음 | Lite Epic | D (갭 보드 직행) |
| `/plan-draft` | Feature 3개 이상 또는 P0 존재 | Standard Epic | C (마스터 → 서브) |
| 마스터 PRD 내 | P0 Feature | 서브 PRD 필수 | C 경로 |
| 마스터 PRD 내 | P1 Feature | Lite 실행 | D 경로 |
| 마스터 PRD 내 | P2 Feature | 백로그 | 보류 |

### 5.3 커맨드 매핑

| 계층 | 생성 커맨드 | 승인 게이트 | 병렬 가능 |
|------|-----------|-----------|----------|
| Epic (대) | `/plan-idea` → `/plan-screen` | 스크리닝 승인 | - |
| Feature (중) | `/plan-draft` → `/plan-prd` (마스터/서브) | PRD 승인 | 서브 PRD 간 병렬 |
| Story (소) | `/copy-gap-board` → `/copy-plan-unit` | P0 = 사용자 승인 | Feature 내 Story 간 병렬 |
| Task (마이크로) | `/dev-run` 내부 | 자동 (TDD 가드) | Story 내 Task 순차 |

### 5.4 병렬 실행 규칙

| 규칙 | 설명 |
|------|------|
| **Feature 간 병렬** | 마스터 PRD 승인 후, 의존성 없는 Feature는 동시 진행 가능 |
| **Story 간 병렬** | 같은 Feature 내에서도 파일 충돌 없으면 병렬 가능 |
| **Task 순차** | 같은 Story 내 Task는 TDD 사이클(RED→GREEN→IMPROVE) 순차 |
| **Phase/R 게이트** | Phase 또는 R 경계에서는 모든 병렬 작업 합류 후 사용자 승인 |
| **증거 → 분석 병렬** | `/copy-visual-review`와 `/copy-interaction-review`는 항상 병렬 가능 |

---

## 6. Turner 프로젝트 적용 예시

### 예시: "Turner 홈페이지 정밀 카피" Epic

```
E-01: Turner 홈페이지 정밀 카피 (Epic)
  │
  ├── /plan-screen → Standard 판정 (Feature 6개, P0 2개)
  │
  ├── /plan-prd (마스터 Overview)
  │    - F-HEADER: Header 충실도 (P0) ← 서브 PRD 필요
  │    - F-HERO: Hero 영역 (P0) ← 서브 PRD 필요
  │    - F-NEWS: News 섹션 (P1) ← Lite
  │    - F-COMMUNITY: Community 섹션 (P1) ← Lite
  │    - F-COMMITMENTS: Commitments 상태 (P1) ← Lite
  │    - F-FOOTER: Footer 영역 (P2) ← 백로그
  │    - 공유 제약: 타이포 스케일, 브레이크포인트, 글로벌 CSS 변수
  │    - 의존성: F-HEADER → F-HERO (sticky header가 hero에 영향)
  │
  ├── [마스터 승인]
  │
  ├── [병렬 트랙 1] F-HEADER (P0, 서브 PRD)
  │    ├── /plan-prd (서브) → /plan-wireframe → /plan-bridge
  │    ├── /copy-reference-refresh (header 상태 캡처)
  │    ├── /copy-visual-review → /copy-interaction-review
  │    ├── /copy-gap-board
  │    │    ├── S-HEADER-01: hover timing (VF-HEADER-01) → /copy-plan-unit → /dev-run
  │    │    ├── S-HEADER-02: mega menu panel (IF-HEADER-HOVER-01) → /copy-plan-unit → /dev-run
  │    │    └── S-HEADER-03: sticky transition (IF-HEADER-STICKY-01) → /copy-plan-unit → /dev-run
  │    └── /copy-verify → /copy-closeout
  │
  ├── [병렬 트랙 2] F-HERO (P0, 서브 PRD)
  │    ├── (F-HEADER 의존 → sticky 해결 후 시작)
  │    └── ... (동일 패턴)
  │
  ├── [병렬 트랙 3] F-NEWS + F-COMMUNITY + F-COMMITMENTS (P1, Lite)
  │    ├── /copy-reference-refresh → /copy-visual-review → /copy-gap-board
  │    ├── 각 Gap Row → /copy-plan-unit (Lite) → /dev-run
  │    └── /copy-verify → /copy-closeout
  │
  └── [Phase/R 게이트] → 사용자 승인 → F-FOOTER (P2) 진행 여부 결정
```

---

## 7. 기존 문서와의 관계

| 기존 문서 | 본 문서와의 관계 |
|----------|---------------|
| CAI-06 (command workflow) | 6단계 실행 단위 라이프사이클을 Story/Task에 적용 |
| CAI-08 (adoption roadmap) | A0~A9 도입 순서는 인프라; WBS는 실제 프로젝트 실행 시 적용 |
| CAI-10 (plan integration) | Lite/Standard 판정, 대그룹/중그룹/소그룹 용어의 구체화 |
| CAI-02~05 (agent specs) | Gap Row(VF-*/IF-*) = Story 계층에 1:1 매핑 |
| CAI-09 (readiness checklist) | WBS 적용 전 readiness 확인 필요 |

---

## 8. 자기 검증

| 항목 | 기준 | 확인 |
|------|------|------|
| 옵션 3개 이상 제시 | A/B/C/D 4개 | [ ] |
| 각 옵션에 장단점 비교 | 4개 모두 표로 비교 | [ ] |
| 분류 계층 정의 | Epic/Feature/Story/Task + 기준 + 예시 | [ ] |
| 병렬 구간 명시 | 각 옵션 + 권장안에 병렬 규칙 | [ ] |
| 커맨드 매핑 | 4 계층 × 생성 커맨드 + 게이트 | [ ] |
| 기존 문서 미수정 | 신규 문서만 추가 | [ ] |
| Turner 예시 | 구체적 적용 시나리오 포함 | [ ] |
