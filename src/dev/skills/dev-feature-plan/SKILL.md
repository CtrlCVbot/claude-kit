---
name: dev-feature-plan
description: Feature Standard 워크플로우. PRD→Overview→Package 자동 생성. /dev-feature 커맨드에서 참조.
user-invocable: false
---

# Feature Plan Standard 자동화

> `/dev-feature` 커맨드 실행 시 참조하는 워크플로우 스킬.
> PRD 승인본 → Feature Overview → Promote → Human Review → Feature Package까지 3 Phase로 자동 실행한다.

---

## 워크플로우 개요

```
Phase A (자동)          Phase B (사람)           Phase C (자동)
PRD 분석               Feature Overview         Feature Package
→ Overview 생성         → 사람 확인/조정          → 문서 세트 생성
→ Promote 생성          → 승인/수정/거부          → Overview 갱신
→ Consistency Check                             → AI 린트
                                                → 결과 출력
```

**핵심 규칙**: Phase A~B 동안 코드/테스트/설정 변경 금지 (문서만 생성).

---

## Phase A: PRD 분석 → Overview → Promote (자동 실행)

### A1. PRD 분석

입력: PRD 승인본 파일 경로
작업:
1. PRD 전체 내용 읽기
2. In/Out of Scope 식별
3. 상태 전이/예외/차단 조건 추출
4. 권한/보안 요구사항 추출
5. API/DB 영향 파악

PRD 검수 체크리스트 참조: `guide/prd-guide/prd-lint-checklist.md`

### A2. Lite/Standard 판정

기준: `guide/dev-feature-guide/dev-feature-package-lint.md`

Lite 조건(모두 참이면 Lite):
- 상태머신/다단계 플로우 없음
- 외부 연동 없음
- 멱등성/재시도/동시성 핵심 요구 아님
- API 변경 없거나 1개 수준
- DB 변경 없거나 경미한 컬럼 추가
- 고위험 도메인(정산/감사) 아님

**Lite 판정 시**: Feature Plan Lite 1파일만 생성하고 워크플로우 종료.
템플릿: `.plans/_template.md`

**Standard 판정 시**: 아래 A3~A6 계속 진행.

### A3. Feature Slug + Key 결정

Slug 규칙:
- PRD 제목에서 `kebab-case` 파생
- 예: "브로커 정산 엑셀 내보내기" → `broker-settlements-excel-export`

Key 규칙:
- Slug에서 3~8자 영문 대문자 약어 파생
- 예: `broker-settlements-excel-export` → `BSEE`
- 기존 Feature Key 중복 검사: `.plans/features/` 폴더 내 모든 `00-index.md` 확인
- Promote 이후 변경 금지

상세: `guide/dev-feature-guide/id-conventions.md`

### A4. Feature Overview 생성 (Section 1~5, 10 초안)

템플릿: `guide/dev-feature-guide/dev-feature-overview-template.md`
산출물: `.plans/features/active/{slug}/02-package/00-overview.md`

채움 대상 섹션:
- Section 1: 기본 정보 (REQ/TASK/TC 수는 Phase C에서 채움)
- Section 2: PRD 분석 (확신 vs 추정)
- Section 3: 파일 트리 + 와이어프레임
- Section 4: 로직 플로우
- Section 5: 시나리오 (Happy Path + Edge Cases)
- Section 10: 개발 전 확인 사항 (초안)

필수 규칙:
- PRD 명시 내용 → **확신(Certainty)** 으로 작성
- 애매한 부분 → **추정(Assumption)** + 질문(A/B 선택지)
- Happy Path + Failure/Edge **최소 3개**
- Side Effects(안 건드리지만 깨질 수 있는 곳) 포함
- 질문은 반드시 선택지(A/B) 형태로 작성
- API/DB 상세 설계, 마이그레이션 스크립트, 코드 구현 **금지**

### A4.5 PRD↔Overview Consistency Check (자동)

가이드: `guide/dev-feature-guide/cross-phase-consistency-check.md` (Section 1: PDC)

작업:
1. PDC-01~05 검증 실행 (**5개 병렬**)
   - PRD 원문 + Overview Section 2~5 비교
   - Scope Drift / Assumption Gap / Missing Coverage / Contradictory Certainty / Edge Case Sufficiency
2. FLAG/ERROR 있으면 Overview Section 6.1에 기록
3. 결과를 A6에 전달

### A5. Promote 산출물 생성

워크플로우: `guide/dev-feature-guide/prd-to-feature-workflow.md`

산출물(필수):
1. `.plans/features/active/{slug}/00-context/00-index.md`
   - Feature Key 선언 (Promote 이후 변경 금지)
2. `.plans/features/active/{slug}/00-context/01-prd-freeze.md`
   - PRD 링크 + 승인일 + 버전 + 범위 요약(5~10줄)
   - 링크만 두는 것 금지
3. `.plans/features/active/{slug}/00-context/02-decision-log.md`
   - Overview Section 2.3에서 DECIDED된 항목 → `{KEY}-DEC-###` 형식
   - 미결정 항목은 PROPOSED 상태로 기록
4. `.plans/features/active/{slug}/02-package/00-index.md`
   - Lite/Standard 판정 결과 + 생성할 문서 세트 확정

### A6. Overview Section 6~7 채움 (Consistency Check + 결정 양식)

작업:
- Overview Section 6.1에 A4.5 PDC 결과 기록
- Overview Section 7에 추정/질문/Decision 후보를 결정 양식으로 정리
- Section 7의 모든 항목에 빈 "결정" 열을 남겨 사람이 채울 수 있게 함

---

### A6.5 Phase A Integrity Report (자동)

가이드: `guide/dev-feature-guide/cross-phase-consistency-check.md` (Section 2: AIR)

작업:
1. AIR-01~03 실행 (**3개 병렬**)
   - PRD Freeze 충분성 / Decision 정합성 / PROPOSED 완전성
2. AIR-04 실행 (A4.5 결과 의존 — **순차**)
   - A4.5 PDC 결과가 Overview Section 6에 포함되었는지 확인
3. AIR 결과를 Overview Section 6.1에 추가

---

## Phase B: Human Review (단일 체크포인트)

### B1. Feature Overview 제시

Overview 생성 완료 후:
1. Section 2 (PRD 분석)는 요약만 인라인 출력
2. Section 6 (Consistency Check) 결과 출력
3. Section 7 (조정 필요)는 **전문** 인라인 출력
4. 생성된 산출물 목록 출력
5. 사용자 응답 대기

출력 형식:
```
## Feature Overview: {FEATURE_NAME}

### PRD 분석 요약 (Section 2)
- 기능 목적: ...
- Lite/Standard: Standard (근거: ...)
- 확신 영역: N개, 추정 영역: N개, Edge Cases: N개

### Consistency Check (Section 6)
- PDC: PASS (5/5)
- AIR: PASS (4/4)

### 조정 필요 (Section 7)
[Section 7 전문 출력]

### 생성된 파일
- 02-package/00-overview.md (Feature Overview)
- 00-context/00-index.md (Key: {KEY})
- ...

승인/수정 요청/거부 중 선택해주세요.
```

### B2. 피드백 처리

| 응답 | 처리 |
|------|------|
| 승인 | Phase C 진행 |
| 수정 요청 | 지시에 따라 Overview/Promote 수정 후 재제시 |
| 거부 | 워크플로우 중단, 사유 기록 |

---

## Phase C: Feature Package 생성 (승인 후 자동 실행)

### C1. Feature Package 생성

가이드: `guide/dev-feature-guide/dev-feature-package.md`
입력: `00-context/` + `02-package/00-overview.md` + `02-package/00-index.md`

생성 순서(필수):
1. `02-package/00-index.md` 갱신 (목차/타입)
2. `02-package/01-requirements.md` (SSOT, `{KEY}-REQ-###`)
3. `02-package/02-ui-spec.md` (REQ 참조)
4. (조건 충족 시) `02-package/03-flow.md`
5. (조건 충족 시) `02-package/04-api-spec.md`
6. (조건 충족 시) `02-package/05-db-migration-spec.md`
7. `02-package/06-domain-logic.md` (REQ 참조)
8. (조건 충족 시) `02-package/07-error-handling.md`
9. `02-package/08-dev-tasks.md` (`{KEY}-TASK-###`, 모든 TASK는 REQ 매핑)
10. `02-package/09-test-cases.md` (`{KEY}-TC-###`, 모든 TC는 REQ 매핑)
11. `02-package/10-release-checklist.md`

옵션 문서 생성 조건: `guide/dev-feature-guide/dev-feature-package-lint.md` 참조

SSOT 규칙:
- 요구사항 "정의"는 `01-requirements.md`에만 존재
- UI/Domain/Tasks/TC는 REQ를 참조/매핑 (재서술 금지)
- ID는 `{KEY}-REQ/DEC/TASK/TC-###` 형태
- 삭제/재채번 금지 (Deprecated 처리)

### C1.5 Overview↔Package Consistency Check (자동)

가이드: `guide/dev-feature-guide/cross-phase-consistency-check.md` (Section 3: DPC)

작업:
1. DPC-01~06 검증 실행 (**6개 병렬**)
   - Overview Section 2~5 + Decision Log + Feature Package 비교
   - REQ Coverage / Decision 반영 / REQ Traceability / Scope Boundary / SSOT 재서술 감지 / REQ Inflation
2. 결과를 Overview Section 6.2에 기록
3. 결과를 C2 린트 + C3 결과 출력에 통합

### C1.6 Overview 갱신

Feature Package 생성 후 Overview를 갱신:
- Section 1: REQ/TASK/TC 수 채움
- Section 6.2: DPC 결과 채움
- Section 8: Requirements 요약 채움 (01-requirements.md 기준)
- Section 9: Tasks 요약 + PR 전략 채움 (08-dev-tasks.md 기준)
- Section 10: 개발 전 확인 사항 갱신

### C2. AI 자가 린트

기준: `guide/dev-feature-guide/dev-feature-package-lint.md` + `feature-package-review-checklist.md`

체크 항목:
- [ ] SSOT: 요구사항이 `01-requirements.md`에만 정의
- [ ] 매핑: 모든 TASK가 REQ 참조, 모든 TC가 REQ 참조
- [ ] 옵션 문서: 조건 없는데 생성하지 않았는지
- [ ] PRD Freeze: 링크만 있지 않고 범위 요약 포함
- [ ] Decision Log: DECIDED 항목만 기록
- [ ] Cross-Phase: C1.5 검증 결과에 ERROR 없음

### C3. 결과 출력

출력 형식:
```
## Feature Package 생성 완료

### 생성된 문서
- 02-package/00-overview.md (Feature Overview — 갱신 완료)
- 02-package/01-requirements.md (REQ N개)
- 02-package/02-ui-spec.md
- ...

### 일관성 검증 결과
- PRD↔Overview (PDC): PASS (5/5)
- Phase A Integrity (AIR): PASS (4/4)
- Overview↔Package (DPC): PASS (6/6)

### 린트 결과
- SSOT: PASS
- REQ↔TASK 매핑: PASS (N/N)
- REQ↔TC 매핑: PASS (N/N)
- 옵션 문서: PASS

### 다음 단계
- 00-overview.md로 전체 구조 확인 후 개발 착수 권장
- 리뷰: prompt/set-feature-package-docs.md (예시 3)
- 코드 구현: prompt/set-feature-package-docs.md (예시 4)
```
