# 리뷰 + PCC 검증 (`/plan-review`)

## 개요

기획 파이프라인 전 단계에서 산출물 품질을 검증하고 단계 간 일관성(PCC)을 확인하는 통합 리뷰 시스템이다. 리뷰는 PASS/WARN/FAIL 결과를 생성하며, FAIL 시 수정 후 재리뷰 루프를 최대 3회 반복한다.

---

## 사용법

```bash
/plan-review .plans/prd/00-draft/prd-2026-03-23-slug/ --type=prd
/plan-review .plans/ideas/10-screening/IDEA-20260325-001.md --type=idea
```

| `--type` | 대상 단계 | 리뷰 대상 |
|----------|----------|----------|
| `idea` | P1 | 개별 IDEA 파일 |
| `screening` | P2 | SCREENING-*.md 파일 |
| `first-pass` | P3 | first-pass.md |
| `prd` | P4 | prd.md (10개 섹션) |
| `wireframe` | P5 | wireframes/ 전체 |
| `stitch` | P6 | stitch/ HTML + design notes |

---

## 자동 트리거 시점

| 단계 | 커맨드 | 자동 트리거 |
|------|--------|:-----------:|
| P1 | `/plan-idea` | - |
| P2 | `/plan-screen` | - |
| P3 | `/plan-draft` | - |
| P4 | `/plan-prd` | **O** (작성 완료 시) |
| P5 | `/plan-wireframe` | **O** (작성 완료 시) |
| P6 | `/plan-stitch` | - (Step 4에서 검증 내장) |
| P7 | `/plan-bridge` | - (Pre-Check에서 manifest 확인) |

---

## 리뷰 흐름

```
산출물 완료
    |
    v
/plan-review {path} --type={stage}
    |
    v
+-------------------------------------+
|  plan-reviewer (opus, read-only)    |
|                                     |
|  1. 산출물 로드                     |
|  2. 단계별 리뷰 기준 적용           |
|  3. PCC 검증 실행 (해당 시)         |
|  4. 리뷰 리포트 생성               |
|  5. 결과 판정 (PASS/WARN/FAIL)     |
+-------------------------------------+
    |
    +-- PASS --> stage-manifest.json 업데이트 --> 다음 단계
    |
    +-- WARN --> 경고 표시 + manifest 업데이트 --> 진행 가능
    |
    +-- FAIL --> 수정 필요
                    |
                    v
              산출물 수정 --> /plan-review (재실행, 최대 3회)
```

---

## 단계별 리뷰 기준

### P1: Idea (4항목)

| # | 항목 | 심각도 | 기준 |
|---|------|--------|------|
| 1 | ID 형식 | ERROR | `IDEA-{YYYYMMDD}-{NNN}` 형식 준수 |
| 2 | 필수 필드 완성 | ERROR | Title, Source, Category, Description, Date, Status 모두 존재 |
| 3 | 카테고리 유효성 | WARN | feature/enhancement/bugfix/tech-debt 중 하나 |
| 4 | 설명 충실도 | WARN | Description 3줄 이상, 구체적 문제/가치 기술 |

### P2: Screening (5항목)

| # | 항목 | 심각도 | 기준 |
|---|------|--------|------|
| 1 | RICE 채점 완전성 | ERROR | R, I, C, E 모두 1~10 범위 |
| 2 | 채점 근거 | FLAG | 각 요소에 1줄 이상 근거 존재 |
| 3 | 정규화 정확성 | ERROR | RICE = (R*I*C)/E/100 올바르게 계산 |
| 4 | 임계값 적용 | ERROR | >=5.0 approved, 2.0~4.9 deferred, <2.0 rejected |
| 5 | PCC-01 | - | PCC 섹션 참조 |

### P3: First-Pass (4항목)

| # | 항목 | 심각도 | 기준 |
|---|------|--------|------|
| 1 | User Stories | ERROR | 최소 1개, 역할-행동-가치 형식 |
| 2 | 요구사항 | ERROR | 기능/비기능 요구사항 최소 1개씩 |
| 3 | 가행성 평가 | FLAG | 5개 항목 모두 평가됨 |
| 4 | Lite/Standard 판정 | ERROR | 6개 트리거 기준으로 판정, 근거 기술 |

### P4: PRD (8항목)

| # | 항목 | 심각도 | 기준 |
|---|------|--------|------|
| 1 | 10개 섹션 존재 | ERROR | Background ~ Open Questions 모두 존재 |
| 2 | Goals 측정 가능 | ERROR | 정량적 지표 포함 (수치, 비율, 시간 등) |
| 3 | US 수용 기준 | ERROR | 모든 US에 수용 기준 체크리스트 존재 |
| 4 | FR 우선순위 | FLAG | Must/Should/Could 분류 |
| 5 | NFR 구체성 | FLAG | 구체적 수치 기준 포함 |
| 6 | Non-Goals vs Out of Scope | WARN | 두 섹션이 명확히 구분됨 |
| 7 | Open Questions | WARN | 결정권자 + 기한 포함 |
| 8 | PCC-03 | - | PCC 섹션 참조 |

### P5: Wireframe (7항목)

| # | 항목 | 심각도 | 기준 |
|---|------|--------|------|
| 1 | Screen List 완전성 | ERROR | PRD의 모든 FR에 대응하는 화면 존재 |
| 2 | ASCII 와이어프레임 | ERROR | 모든 화면에 와이어프레임 존재 |
| 3 | Navigation Map | ERROR | 모든 화면 간 이동 관계 Mermaid 표현 |
| 4 | User Flow | FLAG | Happy Path + Edge Case 최소 1개 |
| 5 | State Diagram | FLAG | 상태 전이가 있는 경우 필수 |
| 6 | Interaction Notes | WARN | 모든 화면에 인터랙션 주석 존재 |
| 7 | PCC-04 | - | PCC 섹션 참조 |

### P6: Stitch (6항목)

| # | 항목 | 심각도 | 기준 |
|---|------|--------|------|
| 1 | HTML 파일 존재 | ERROR | 모든 화면에 대응하는 HTML 존재 |
| 2 | HTML 유효성 | ERROR | 유효한 HTML5 구조 |
| 3 | 디자인 일관성 | FLAG | 색상/컴포넌트 패턴 일관 |
| 4 | Design Notes | WARN | 디자인 결정사항 문서화 |
| 5 | Wireframe 반영 | FLAG | 주요 레이아웃 구조 유지 |
| 6 | PCC-05 | - | PCC 섹션 참조 |

---

## PCC 5종 상세

PCC(Planning Consistency Check)는 단계 간 일관성을 검증한다. 해당 단계 리뷰 시 자동 실행된다.

### PCC-01: Idea <-> Screen (4항목)

**시점**: `/plan-screen` 완료 후

| # | 검증 항목 | 심각도 | 설명 |
|---|----------|--------|------|
| 1 | 전수 스크리닝 | ERROR | backlog.md의 모든 screening/screened IDEA에 `SCREENING-*.md` 개별 파일 존재 |
| 2 | ID 일치 | ERROR | screening-matrix.md의 모든 IDEA ID가 개별 IDEA 파일로 존재 |
| 3 | 상태 동기화 | WARN | 개별 SCREENING 파일의 판정과 backlog.md 인덱스 상태 일치 |
| 4 | 승인 게이트 | ERROR | `approved` 상태의 IDEA는 반드시 `20-approved/` 폴더에 존재 (`screened`만으로 불가) |

### PCC-02: Screen <-> Feature (3항목)

**시점**: `/plan-draft` 완료 후

| # | 검증 항목 | 심각도 | 설명 |
|---|----------|--------|------|
| 1 | 승인 커버리지 | ERROR | 모든 approved IDEA에 first-pass 또는 Lite plan 존재 |
| 2 | IDEA 참조 유효성 | ERROR | First-pass의 IDEA 참조가 `20-approved/`에 존재하고 approved 상태 |
| 3 | RICE 일치 | WARN | First-pass의 RICE 점수가 `SCREENING-{YYYYMMDD}-{NNN}.md`와 동일 |

### PCC-03: Feature <-> PRD (5항목)

**시점**: `/plan-prd` 완료 후

| # | 검증 항목 | 심각도 | 설명 |
|---|----------|--------|------|
| 1 | US 커버리지 | ERROR | First-pass의 모든 US가 PRD Section 4에 존재 |
| 2 | FR 커버리지 | ERROR | First-pass의 기능 요구사항이 PRD Section 5에 반영 |
| 3 | NFR 커버리지 | FLAG | First-pass의 비기능 요구사항이 PRD Section 6에 반영 |
| 4 | 리스크 커버리지 | WARN | First-pass의 리스크가 PRD Section 8에 반영 |
| 5 | Effort 일관성 | WARN | RICE Effort와 PRD 작업량 추정이 일관적 |

### PCC-04: PRD <-> Wireframe (4항목)

**시점**: `/plan-wireframe` 완료 후

| # | 검증 항목 | 심각도 | 설명 |
|---|----------|--------|------|
| 1 | FR-Screen 매핑 | ERROR | PRD의 모든 FR에 대응하는 Screen 존재 |
| 2 | Screen-Wireframe 매핑 | ERROR | Screen List의 모든 화면에 ASCII 와이어프레임 존재 |
| 3 | US-Flow 매핑 | FLAG | PRD User Stories 흐름이 Navigation Map에 반영 |
| 4 | State 매핑 | WARN | PRD 상태 전이가 State Diagram에 반영 (해당 시) |

### PCC-05: Wireframe <-> Stitch (3항목)

**시점**: `/plan-stitch` 완료 후

| # | 검증 항목 | 심각도 | 설명 |
|---|----------|--------|------|
| 1 | Screen-HTML 매핑 | ERROR | 와이어프레임의 모든 화면에 Stitch HTML 존재 |
| 2 | 레이아웃 반영 | FLAG | 와이어프레임 주요 레이아웃 구조가 Stitch에 반영 |
| 3 | 변경 문서화 | WARN | 차이점이 design-notes.md에 기록 |

---

## PCC 요약 테이블

| ID | 검증 | 시점 | 비교 대상 | 항목 수 | 심각도 분포 |
|----|------|------|----------|:-------:|-----------|
| PCC-01 | Idea <-> Screen | `/plan-screen` 후 | IDEA files <-> SCREENING files + 승인 게이트 | 4 | 3E + 1W |
| PCC-02 | Screen <-> Feature | `/plan-draft` 후 | matrix <-> first-pass | 3 | 2E + 1W |
| PCC-03 | Feature <-> PRD | `/plan-prd` 후 | first-pass <-> prd | 5 | 2E + 1F + 2W |
| PCC-04 | PRD <-> Wireframe | `/plan-wireframe` 후 | prd <-> wireframe | 4 | 2E + 1F + 1W |
| PCC-05 | Wireframe <-> Stitch | `/plan-stitch` 후 | wireframe <-> stitch | 3 | 1E + 1F + 1W |
| **합계** | | | | **19** | **10E + 3F + 6W** |

---

## 심각도 체계

| 심각도 | 의미 | 행동 | 아이콘 |
|--------|------|------|--------|
| **ERROR** | 필수 항목 누락/불일치 | **차단** -- 수정 필수, 다음 단계 진행 불가 | `[E]` |
| **FLAG** | 주요 불일치 (수동 확인 필요) | **경고** -- 사람 확인 후 진행 가능 | `[F]` |
| **WARN** | 경미한 불일치 | **기록** -- 다음 단계 진행 가능 | `[W]` |
| **PASS** | 일치 확인됨 | **통과** | `[P]` |

### 최종 판정 규칙

| ERROR 수 | FLAG 수 | 최종 판정 |
|:--------:|:-------:|----------|
| >= 1 | any | **FAIL** |
| 0 | >= 1 | **WARN** (사람 확인 필요) |
| 0 | 0 | **PASS** |

---

## plan-reviewer 에이전트

| 항목 | 값 |
|------|-----|
| **모델** | opus |
| **역할** | 산출물 품질 검증 + PCC 일관성 검증 |
| **읽기 권한** | `.plans/` 전체 (read-only) |
| **쓰기 권한** | `.plans/reviews/`, `.plans/stage-manifest.json` |
| **제한** | 리뷰 대상 문서는 읽기만, 수정 금지 |

핵심 지시:

1. 리뷰 대상 문서를 수정하지 않는다 (read-only)
2. 단계별 리뷰 기준을 엄격히 적용한다
3. PCC를 해당 단계에 맞춰 자동 실행한다
4. ERROR 발견 시 구체적 수정 방향을 제시한다
5. 리뷰 리포트를 `.plans/reviews/`에 생성한다
6. `stage-manifest.json`을 업데이트한다

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [01-planning-pipeline.md](./01-planning-pipeline.md) | 파이프라인 전체 흐름 |
| [12-blueprint-fast-track.md](./12-blueprint-fast-track.md) | Fast-Track 경로의 reviewPassed 영속화 규칙 |
| [02-idea-management.md](./02-idea-management.md) | PCC-01 대상 (P1~P2) |
| [10-glossary.md](./10-glossary.md) | 용어 정의 |
