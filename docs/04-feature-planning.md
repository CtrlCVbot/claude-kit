# P3~P4: 기능 기획 (`/plan-draft` + `/plan-prd`)

## 개요

승인된 아이디어(IDEA)를 구체적인 기능 기획서로 변환하는 단계다. P3(`/plan-draft`)에서 Lite/Standard 판정을 수행하여, Lite(단순 기능)는 단일 파일 기획으로 종료하고 바로 개발에 진입한다. Standard(복합 기능)는 First-Pass 문서를 생성한 뒤 P4(`/plan-prd`)에서 10개 섹션의 상세 PRD를 작성하고 승인 절차를 거친다.

---

## P3: 1차 기능 기획 (`/plan-draft`)

### 사용법

```bash
/plan-draft IDEA-20260320-001
/plan-draft IDEA-20260320-001 --force-standard
```

- `--force-standard`: Lite 판정 조건을 무시하고 강제로 Standard 경로로 진행한다.

### 전제조건

- 해당 IDEA가 `20-approved/` 폴더에 존재하고 상태가 **`approved`**여야 한다.
- `screened` 상태만으로는 실행 불가 -- 반드시 P2 스크리닝 후 승인된 아이디어만 입력 가능하다.
- `SCREENING-{YYYYMMDD}-{NNN}.md` 파일이 `10-screening/` 또는 `20-approved/`에 존재해야 한다.

### Lite/Standard 판정 기준

아래 6개 트리거 중 **하나라도 해당하면 Standard**, 모두 해당 없으면 **Lite**다.

| # | Standard 트리거 | 예시 |
|---|----------------|------|
| 1 | 상태머신 / 다단계 플로우 | 주문 상태 전이 (대기 -> 배차 -> 완료) |
| 2 | 외부 연동 / 재시도 정책 | 결제 API 호출, 웹훅 수신 |
| 3 | 멱등성 / 정산 / 감사 도메인 | 정산 중복 방지, 감사 로그 |
| 4 | API 변경 2개 이상 | 신규 엔드포인트 + 기존 수정 |
| 5 | DB 테이블 2개 이상 변경 | 신규 테이블 + 마이그레이션 |
| 6 | 고위험 도메인 | 정산, 감사, 권한, 세금 |

### Lite 경로

Lite는 단일 파일로 기획을 완성하며, P4~P7을 건너뛰고 바로 개발 워크플로우로 진입할 수 있다.

**산출물 경로:**

```
.plans/features/active/{slug}.md
```

**파일 구조:**

```markdown
# Feature: {feature-name}

- **Key**: {PRODUCT}-{NNN}
- **Status**: planning
- **Type**: feature | enhancement | bugfix | refactor
- **IDEA**: IDEA-{YYYYMMDD}-{NNN}

## Context
{왜 이 기능이 필요한지 1-3줄. RICE 점수 참조.}

## Requirements
- [ ] {요구사항 1}
- [ ] {요구사항 2}

## UI Changes
- {화면}: {변경 내용}

## Domain Logic
- {엔티티/VO 변경 요약}

## Tasks
1. [ ] {태스크 1} -- packages/{pkg}
2. [ ] {태스크 2} -- apps/{app}

## Test Cases
- [ ] {테스트 시나리오 1}
- [ ] {테스트 시나리오 2}

## Notes
{추가 메모, 제약 사항}
```

**개발 진입 방법:**

```bash
# Lite Plan 생성 후, /plan-bridge가 간소화 PRD를 자동 추출하여 배치
/dev-feature .plans/prd/10-approved/prd-YYYY-MM-DD-{slug}/
```

### Standard 경로

Standard는 First-Pass 문서를 생성한 뒤 P4(PRD)로 진행한다.

**산출물 경로:**

```
.plans/features/drafts/{slug}/first-pass.md
```

**First-Pass 문서 구조:**

```markdown
# First-Pass Feature Plan: {feature-name}

> IDEA: IDEA-{YYYYMMDD}-{NNN} | RICE: {score} | Date: {YYYY-MM-DD}

## 1. User Stories
### US-01: {역할}로서 {행동}을 하여 {가치}를 얻고 싶다
- **수용 기준**:
  - [ ] {기준 1}
  - [ ] {기준 2}

## 2. Rough Requirements
### 기능 요구사항
- {요구사항 1}
### 비기능 요구사항
- {성능/보안/확장성 요구사항}

## 3. Feasibility Assessment
| 항목 | 평가 | 비고 |
|------|------|------|
| 기술 가행성 | High / Medium / Low | {이유} |
| 기존 시스템 영향 | Minimal / Moderate / Significant | {이유} |
| 예상 작업량 | {기간 추정} | {근거} |
| 외부 의존성 | {목록} | {리스크} |
| 주요 리스크 | {목록} | {완화 방안} |

## 4. Lite/Standard 판정
| 트리거 | 해당 여부 | 근거 |
|--------|:---------:|------|
| 상태머신/다단계 플로우 | O/X | {설명} |
| 외부 연동 | O/X | {설명} |
| 멱등성/정산/감사 | O/X | {설명} |
| API 2개+ 변경 | O/X | {설명} |
| DB 테이블 2개+ 변경 | O/X | {설명} |
| 고위험 도메인 | O/X | {설명} |

**판정**: Standard (트리거 N개 해당)

## 5. 다음 단계
-> P4: `/plan-prd .plans/features/drafts/{slug}/first-pass.md`
```

Human Checkpoint에서 사용자가 범위를 확인하면 P4로 진행하고, 수정 요청 시 재생성, 반려 시 아이디어로 복귀한다.

---

## P4: PRD 상세 작성 (`/plan-prd`)

### 사용법

```bash
/plan-prd .plans/features/drafts/{slug}/first-pass.md
/plan-prd .plans/prd/00-draft/prd-2026-03-23-{slug}/ --revision
```

- `--revision`: 리뷰 피드백을 반영하여 기존 PRD를 재작성한다.

**전제조건:**
- First-Pass 문서가 존재해야 한다.
- P3에서 Standard 판정을 받은 기능이어야 한다.

### PRD 10개 섹션

| # | 섹션 | 설명 |
|---|------|------|
| 1 | Background (배경) | 현재 문제 상황, 비즈니스 맥락 |
| 2 | Goals (목표) | 측정 가능한 구체적 목표 (정량 지표 포함) |
| 3 | Non-Goals (비목표) | 이번 범위에서 명시적으로 제외하는 항목 |
| 4 | User Stories (사용자 스토리) | 역할-행동-가치 형식 + 수용 기준 |
| 5 | Functional Requirements (기능 요구사항) | Must/Should/Could 우선순위 부여 |
| 6 | Non-Functional Requirements (비기능 요구사항) | 성능, 보안, 확장성 등 구체적 수치 |
| 7 | Out of Scope (범위 외) | Non-Goals보다 구체적으로 혼동 가능 항목 명시 |
| 8 | Dependencies & Risks (의존성 및 리스크) | 외부/내부 의존성 + 리스크 완화 방안 |
| 9 | Success Metrics (성공 지표) | 현재값 -> 목표값 + 측정 방법 |
| 10 | Open Questions (미결 사항) | 결정권자 + 기한 포함 |

### PRD 산출물 경로

```
# 작성 중 (Draft)
.plans/prd/00-draft/prd-{YYYY-MM-DD}-{slug}/
  prd.md              <- PRD 본문
  appendix/           <- 부속 자료 (선택)

# 승인 후 (Approved)
.plans/prd/10-approved/prd-{YYYY-MM-DD}-{slug}/
  prd.md
  appendix/
```

### PRD 승인 흐름

PRD 작성 완료 시 `/plan-review --type=prd`가 자동 트리거된다.

```
PRD 작성 완료
  -> /plan-review 자동 실행
       |
       +-- PASS -> Human Checkpoint
       |            +-- 승인: 00-draft/ -> 10-approved/ 이동, Status를 approved로 변경
       |            +-- 수정: 피드백 입력 -> --revision으로 재작성
       |            +-- 반려: 기획 단계로 복귀
       |
       +-- FAIL -> 수정 -> 재작성 -> /plan-review 재실행
```

**PRD 리뷰 기준:**
- 10개 섹션이 모두 존재하는가
- Goals가 측정 가능한가
- Non-Goals와 Out of Scope가 명확히 구분되었는가
- User Stories에 수용 기준이 포함되었는가
- 기능 요구사항에 Must/Should/Could 우선순위가 있는가
- Open Questions에 결정권자와 기한이 있는가

승인되면 `10-approved/`가 개발 워크플로우(`/dev-feature`)의 입력 경로가 된다.

### PCC-02: Screen <-> Feature 일관성 검증

| # | 검증 항목 | 심각도 |
|---|----------|--------|
| 1 | 모든 `approved` IDEA에 first-pass 또는 Lite plan이 존재 | ERROR |
| 2 | First-pass의 IDEA 참조가 `20-approved/`에 존재하고 `approved` 상태 | ERROR |
| 3 | First-pass의 RICE 점수가 `SCREENING-{YYYYMMDD}-{NNN}.md`와 일치 | WARN |

### PCC-03: Feature <-> PRD 일관성 검증

| # | 검증 항목 | 심각도 |
|---|----------|--------|
| 1 | First-Pass의 모든 User Stories가 PRD Section 4에 존재 | ERROR |
| 2 | First-Pass의 기능 요구사항이 PRD Section 5에 반영됨 | ERROR |
| 3 | First-Pass의 비기능 요구사항이 PRD Section 6에 반영됨 | FLAG |
| 4 | First-Pass의 리스크가 PRD Section 8에 반영됨 | WARN |
| 5 | RICE Effort와 PRD 작업량 추정이 일관적 | WARN |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| P2: RICE 스크리닝 | 이전 단계 -- approved 아이디어 공급 |
| P5: 와이어프레임 | 다음 단계 -- 승인된 PRD 기반 |
| 리뷰 + PCC | PCC-02, PCC-03 검증 상세 |
| 산출물 구조 | `.plans/features/`, `.plans/prd/` 디렉토리 구조 |
| P7: Bridge | PRD -> 10-approved/ -> /dev-feature 연결 |
