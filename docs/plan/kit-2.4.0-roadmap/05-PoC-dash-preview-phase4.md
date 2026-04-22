# 05. PoC — dash-preview Phase 4 Epic 실 시뮬레이션

> **한 문장 요약**: 방금 등록한 4 IDEA (Lane 1~4) 를 **EPIC-20260422-001** "dash-preview Phase 4" 에 children 으로 묶어 실제 Epic 구조로 운영한 사례. kit 변경 없이 문서만으로 PoC 수행.
>
> **비유**: 요리 레시피를 **실제 한 끼 조리해보는 단계**. 아직 대량 양산이 아니라 시식용 한 끼를 만들어 맛을 본다.

---

## 1. PoC 배경

### 입력 상황
- 사용자 피드백 10 이슈 (`apps/landing/.plans/archive/dash-preview-phase3/improvements/`)
- 4 Lane 으로 그룹화된 IDEA 4건 (2026-04-22 등록)
  - `IDEA-20260422-001` (Lane 1 라이트 모드, 단독)
  - `IDEA-20260422-002` (Lane 2 Mock data)
  - `IDEA-20260422-003` (Lane 3 UI + 오버레이)
  - `IDEA-20260422-004` (Lane 4 정리)

### 현재 kit 의 한계 (flat 구조)
- 4 IDEA 가 "dash-preview Phase 4" 라는 공통 목표의 자식임을 표현할 방법 없음
- `backlog.md` 에 4 IDEA 가 **형제 (sibling) 로만** 기록 — 제목의 "(Lane 1, 단독)" 같은 수동 태그만 단서
- RICE 점수도 4 IDEA 독립 평가 → 전체 "Phase 4" 관점 우선순위 관리 부재

### PoC 가 보여줄 것
1. Epic 구조로 4 IDEA 를 묶으면 **관리가 간단해지는가?**
2. Epic Brief / Children Features 문서 작성 **비용 < 이득** 인가?
3. kit 변경 없이 **문서만으로** 성립 가능한가?

---

## 2. PoC 시뮬레이션 — 실제 생성할 문서

### 2-1. Epic Brief (`.plans/epics/00-draft/EPIC-20260422-001/00-epic-brief.md`)

```markdown
# Epic: dash-preview Phase 4 — 사용자 피드백 10 이슈 반영

> **ID**: EPIC-20260422-001
> **상태**: draft
> **기간**: 2026-04-23 ~ 2026-06-15 (예상 6~8주)
> **책임자**: Claude + 사용자
> **예상 RICE (가중합)**: ~130 (자식 RICE 평균, 아래 §4 참조)

## 1. 목적 (Why)

dash-preview Phase 3 release 후 사용자 피드백 10 이슈 (`apps/landing/.plans/archive/dash-preview-phase3/improvements/issues.md` + `proposals.md`) 를 체계적으로 반영한다.

피드백 성격:
- 전역 테마 (라이트 모드 지원 부재)
- Mock data 일관성 결함 (추출↔적용 불일치, 조기 노출, 시나리오 부족, 옵션 연동)
- 레이아웃 개선 (DateTimeCard 수직 스택) + 오버레이 좌표 버그
- 정리 요청 (JSON 뷰어 제거, 자동배차 라벨 변경)

본 Epic 은 **해당 10 이슈의 체계적 반영**을 목표로 하며, 4 Lane 병렬 구조로 효율을 극대화한다.

## 2. 성공 지표 (What)

- AI 추출값 ↔ 폼 적용값 **완전 일치** (하차지/화물 품목/운임 자릿수 전부)
- AI_APPLY 진입 전 수치 비노출 (Step 기반 gate)
- 재방문 시 3개 이상 시나리오 순환
- 옵션 토글 시 추가 요금 파생값 반영
- Col 2 DateTimeCard 2열 배치로 세로 길이 축소
- 인터랙티브 오버레이 좌표 1~2px 이내 일치
- 라이트 모드 WCAG AA 대비 + axe-core 0 violations
- 기존 622 Phase 3 tests + 916 LEGACY tests regression 0

## 3. 범위 (Scope)

### In-scope (4 Feature)
- F1: 라이트 모드 인프라 (IDEA-20260422-001)
- F2: Mock data 일관성 + 시나리오 세트 (IDEA-20260422-002)
- F3: UI 레이아웃 + 오버레이 좌표 (IDEA-20260422-003)
- F4: 정리 — JSON 제거 + 자동배차 라벨 (IDEA-20260422-004)

### Out-of-scope
- broker 앱 통합 (별도 Epic)
- Mobile CardView 고도화 (Phase 5 후보)
- i18n (접근성 관련이지만 별도 Epic)

## 4. 자식 Feature 요약

| Feature | 예상 RICE | 권장 순서 | Lane | Target 기간 |
|---|:---:|:---:|:---:|---|
| F4 정리 (IDEA-004) | 250 | **1차** (가장 빠름) | 4 | 2026-04-23 ~ 24 (1일) |
| F3 UI + 오버레이 | 128 | 2차 | 3 | 2026-04-25 ~ W1 종료 |
| F2 Mock data | 107 | 3차 | 2 | W2 전체 |
| F1 라이트 모드 | 33 | 4차 (최종, 단독) | 1 | W3~W4 |

## 5. 마일스톤 (Epic 수준)

- **M-Epic-1 (2026-04-24)**: F4 정리 완료 (JSON 뷰어 제거 + 자동배차 라벨)
- **M-Epic-2 (2026-05-02)**: F3 UI/오버레이 + F2 Mock data 착수 (병렬)
- **M-Epic-3 (2026-05-16)**: F2 Mock data 완료 + F3 완료
- **M-Epic-4 (2026-06-15)**: F1 라이트 모드 완료 → Epic archived

## 6. 리스크

| # | 리스크 | 완화 |
|---|---|---|
| 1 | F1 라이트 모드가 F2/F3 병행 시 merge 충돌 | F1 은 단독 (최후 or 최초), 병렬 금지 |
| 2 | F2 Mock data 스키마 재설계 (C1) 공수 과소평가 | Spike 1일 우선 (dash-preview Phase 3 경험 승계) |
| 3 | F3 오버레이 좌표 수정이 [5] JSON 제거와 충돌 | F4 를 F3 이후로 순차 처리 |
| 4 | F1 완료 후 F2/F3 회귀 | axe-core + 기존 622+916 test regression 게이트 필수 |

## 7. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — 4 children Feature 정의, Lane 기반 순서 |
```

---

### 2-2. Children Features (`01-children-features.md`)

```markdown
# Children Features — EPIC-20260422-001

> dash-preview Phase 4 의 4 자식 Feature 실행 지도.

## 1. Feature 목록

### F1 — 라이트 모드 인프라
- **IDEA**: IDEA-20260422-001
- **Lane**: 1 (단독, 가장 광범위)
- **RICE 예상**: 33 (Reach 5 × Impact 3 × Confidence 3 / Effort 4)
- **범위**: globals.css + layout.tsx + dash-preview 전 컴포넌트 색상 스윕
- **상태**: pending IDEA (아직 screening 전)

### F2 — Mock data 일관성 + 시나리오 세트
- **IDEA**: IDEA-20260422-002
- **Lane**: 2 (mock-data.ts 집중)
- **RICE 예상**: 107 (Reach 5 × Impact 4 × Confidence 4 / Effort 3)
- **범위**: `src/lib/mock-data.ts` + order-form + estimate-info-card + settlement
- **상태**: pending IDEA

### F3 — UI 레이아웃 + 오버레이 좌표
- **IDEA**: IDEA-20260422-003
- **Lane**: 3 (hit-areas.ts 집중)
- **RICE 예상**: 128 (Reach 4 × Impact 4 × Confidence 4 / Effort 2)
- **범위**: hit-areas.ts + interactive-overlay + preview-chrome + order-form Col 2
- **상태**: pending IDEA

### F4 — 정리 (JSON 제거 + 자동배차 라벨)
- **IDEA**: IDEA-20260422-004
- **Lane**: 4 (가장 작음)
- **RICE 예상**: 250 (Reach 5 × Impact 2 × Confidence 5 / Effort 1) — Lite Feature
- **범위**: ai-panel (JSON 뷰어 제거) + estimate-info-card (라벨)
- **상태**: pending IDEA

## 2. 의존성 매트릭스

|         | F1 Light | F2 Mock | F3 UI | F4 Clean |
|---|:---:|:---:|:---:|:---:|
| F1      | —        | X       | X     | △        |
| F2      |          | —       | ✓     | X        |
| F3      |          |         | —     | X        |
| F4      |          |         |       | —        |

- ✓: 완전 독립 병렬
- X: 파일 충돌
- △: 대부분 독립 (라이트 모드 vs 라벨 변경은 거의 충돌 없음)

## 3. 실행 순서 (RICE + Lane 기반)

### Phase A (2026-04-23 ~ 24, 1~2일) — F4 정리
**이유**: RICE 250 (가장 높음), Lite Feature (PRD 생략 가능), 즉시 완료

### Phase B (2026-04-25 ~ 05-09, 2주) — F3 병렬 F2
**이유**: F2 ⊥ F3 완전 독립, 병렬 실행 가능. 같은 개발자가 switch context 하면 비효율이므로 Lane 단위로 분리.
- F3 주 작업: Lane 3 담당 → hit-areas 재작성
- F2 주 작업: Lane 2 담당 → mock-data 스키마 재설계 + 시나리오 세트

### Phase C (2026-05-16 ~ 06-15, 4주) — F1 라이트 모드
**이유**: F1 은 광범위 색상 클래스 스윕 → 다른 Feature 완료 후 전역 적용이 안전.

## 4. 진행 대시보드

(각 Feature 의 상태/테스트/번들/리뷰 실시간 집계, 후속 IMP-KIT-028 활용 시 자동 생성 가능)

| Feature | 상태 | TASK 진행 | 테스트 | 번들 영향 | 리뷰 |
|---|:---:|:---:|:---:|:---:|:---:|
| F4 | pending | — | — | — | — |
| F3 | pending | — | — | — | — |
| F2 | pending | — | — | — | — |
| F1 | pending | — | — | — | — |

## 5. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — 4 Feature 순서 + 의존성 매트릭스 |
```

---

### 2-3. IDEA 파일 프론트매터 수정 (수동 적용)

각 IDEA-20260422-00{1~4}.md 파일 상단 메타에 **`epic:` 필드 추가** (권장 예시):

```markdown
# IDEA-20260422-001 — dash-preview 라이트 모드 인프라

> **카테고리**: improvement
> **상태**: new
> **등록일**: 2026-04-22
> **Epic**: [EPIC-20260422-001](../../epics/00-draft/EPIC-20260422-001/00-epic-brief.md)
> **파생 출처**: dash-preview-phase3 archive 이후 사용자 피드백 ...
```

---

### 2-4. `backlog.md` epic 컬럼 추가 (4행만, 기존 행은 "—" 로)

```markdown
| ID | 제목 | 카테고리 | 상태 | 등록일 | 위치 | 파일 | Epic |
|----|------|---------|------|--------|------|------|------|
| IDEA-001 | OPTIC 랜딩 페이지 | feature | archived | 2026-03-31 | `90-archive/` | [file] | — |
| IDEA-20260417-001 | dash-preview Phase 3 | improvement | archived | 2026-04-22 | `archive/` | [file] | — |
| IDEA-20260422-001 | dash-preview 라이트 모드 인프라 (Lane 1) | improvement | new | 2026-04-22 | `00-inbox/` | [file] | [EPIC-20260422-001](../epics/00-draft/EPIC-20260422-001/00-epic-brief.md) |
| IDEA-20260422-002 | dash-preview Mock data 일관성 + 시나리오 (Lane 2) | improvement | new | 2026-04-22 | `00-inbox/` | [file] | [EPIC-20260422-001](../epics/00-draft/EPIC-20260422-001/00-epic-brief.md) |
| IDEA-20260422-003 | dash-preview UI 레이아웃 + 오버레이 (Lane 3) | improvement | new | 2026-04-22 | `00-inbox/` | [file] | [EPIC-20260422-001](../epics/00-draft/EPIC-20260422-001/00-epic-brief.md) |
| IDEA-20260422-004 | dash-preview 정리 (Lane 4) | improvement | new | 2026-04-22 | `00-inbox/` | [file] | [EPIC-20260422-001](../epics/00-draft/EPIC-20260422-001/00-epic-brief.md) |
```

---

## 3. PoC 실행 시나리오 (가정)

### Day 1 (2026-04-23)
- Epic Brief + Children Features 작성 (~1시간)
- 4 IDEA 프론트매터에 `epic:` 추가 (~5분)
- `backlog.md` epic 컬럼 4행 추가 (~5분)
- **총 소요**: ~1.5시간

### Day 2 (2026-04-24)
- F4 정리 (IDEA-004) screening → draft → 구현 → archive (Lite Feature, 반나절)
- Epic Brief 의 "자식 Feature 요약" 표에서 F4 상태 "archived" 로 업데이트 (~5분)

### PoC 관찰 기록 (Day 2 저녁 작성)

#### 06-poc-observations.md (샘플)
```markdown
# PoC Observations — Day 2

## 효과
- Epic Brief 의 "자식 Feature 요약" 표가 실시간 대시보드처럼 동작
- F4 완료 시 전체 진행률 (1/4 Feature 완료) 한눈에 파악
- F2/F3 병렬 착수 시 Epic 의 "의존성 매트릭스" 가 충돌 체크 도구로 기능

## 비용
- Epic Brief 작성 1시간 (README + §1~§7)
- Children Features 작성 30분
- 4 IDEA 메타 수정 5분
- backlog.md 수정 5분
- 총: ~1시간 40분

## 판정
- 효과 > 비용? **YES** (4 IDEA 를 묶어 관리하는 이득이 1시간 40분 투자 대비 명확)
- kit 변경 없이 성립? **YES** (파일 추가만 + 메타 필드만)
- 친절한 문서화 기여? **YES** (Epic Brief §1-§2 가 "왜 이 Epic 이 필요한가" 전달)

## Phase 2 진입 권고
- Exit Criteria 5/5 충족
- `/plan-epic` 커맨드 구현으로 위 작업 자동화 (예: 1시간 40분 → 15분 예상)
```

---

## 4. Exit Criteria 체크리스트 (Phase 1 → Phase 2)

| # | 기준 | 증거 |
|---|---|---|
| 1 | Epic Brief + Children Features 문서 작성 완료 | `.plans/epics/00-draft/EPIC-20260422-001/` 파일 존재 |
| 2 | 4 IDEA 모두 `epic: EPIC-...` 메타 부착 | `grep -l "epic: EPIC-20260422-001" .plans/ideas/00-inbox/` |
| 3 | `/plan-screen` 을 통해 최소 2 IDEA 가 Go 판정 | screening-matrix.md 에 2행 "Go" |
| 4 | Epic 의 Children Features 문서 업데이트 실제로 유용 | PoC observations "효과 > 비용? YES" |
| 5 | 문서 drift 탐지 가능 | Children Features §4 진행 대시보드 vs 실제 IDEA 상태 |

---

## 5. PoC 실패 시나리오 (Fail 판정 시 조치)

| 실패 유형 | 징후 | 조치 |
|---|---|---|
| 문서 부담 과다 | Epic Brief 작성 3시간 이상 | 템플릿 축소 (섹션 5개 → 3개) |
| Children Features 가 "뻔한" 문서 | IDEA 행 복제만 | 의존성 매트릭스 제거, 진행률만 유지 |
| 병렬 실행 리듬 손상 | F4 완료 후 F2/F3 착수 전 Epic 재검토 부담 | Epic 을 "archive 시점에만 작성" 으로 축소 |
| RICE 통합 혼란 | Epic RICE vs Feature RICE 충돌 | Feature RICE 만 유지, Epic 은 총합 (sum) 으로 |

→ 실패 시 Phase 2 건너뛰고 "Epic 개념 자체를 철회" 도 선택지.

---

## 6. PoC 이후 다음 작업 (Phase 2 진입 시)

### Phase 2 우선순위
1. `/plan-epic` 커맨드 구현 (Epic Brief + Children Features 자동 생성)
2. `plan-epic-workflow` skill 추가
3. `/plan-idea --epic=...` 파라미터 지원
4. `backlog.md` epic 컬럼 공식화

### Phase 2 에서 본 PoC 의 성과를 계승
- 본 PoC 의 Epic Brief 양식이 `plan-epic-workflow/templates/epic-brief.md` 로 승격
- Children Features 양식도 템플릿화
- PoC observations 양식은 `06-poc-observations.md` 로 Epic 별 표준화

---

## 7. 사용자 액션 (승인 받을 것)

### 즉시 실행 가능한 액션 (Phase 1 PoC)

```bash
# 1. Epic 디렉터리 생성 (수동)
mkdir -p .plans/epics/00-draft/EPIC-20260422-001

# 2. 본 문서 §2-1 Epic Brief 를 복사해 `.plans/epics/00-draft/EPIC-20260422-001/00-epic-brief.md` 로 저장

# 3. 본 문서 §2-2 Children Features 를 복사해 `.plans/epics/00-draft/EPIC-20260422-001/01-children-features.md` 로 저장

# 4. 4 IDEA 파일 프론트매터에 `epic:` 필드 수동 추가

# 5. `.plans/ideas/backlog.md` 에 epic 컬럼 추가 (4행만, 기존 행은 "—")
```

**또는**: 이 PoC 단계 자체를 자동화하려면 Phase 2 의 `/plan-epic` 커맨드 구현 후 1 라인 실행.

---

## 8. 관련 자료

- `README.md` — 전체 패키지 요약
- `01-계층-설계.md` — Epic/Feature/Task 정의
- `02-마이그레이션-규칙.md` — 시나리오 A (본 PoC 가 시나리오 A)
- `04-로드맵.md` — Phase 1 정의 (본 PoC 가 Phase 1 실행)
- `.plans/ideas/00-inbox/IDEA-20260422-00{1~4}.md` — PoC 대상 IDEA
- `apps/landing/.plans/archive/dash-preview-phase3/improvements/{issues,proposals}.md` — 원본 피드백

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — dash-preview Phase 4 Epic PoC 시뮬레이션 (Epic Brief + Children Features 실 작성안 + 관찰 기록 양식) |
