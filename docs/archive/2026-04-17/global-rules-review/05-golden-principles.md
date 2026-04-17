# 05. golden-principles.md 비교 문서

> 원본: `_archive/2026-04-10-originals/golden-principles.md`
> 변경 강도: **MEDIUM**

---

## 현재 내용 요약

12개 골든 원칙과 Anti-Rationalization 테이블로 구성된 SSOT 허브 파일. 다른 규칙 파일들이 이 파일의 원칙을 참조한다.

1. Immutability
2. Secrets in Environment Variables
3. Test First (TDD)
4. Conclusion First, Reasoning Second
5. Small Files, Small Functions
6. Validate at System Boundaries
7. Explain with Analogies
8. Context 50% Rule
9. HARD-GATE: No Coding Without Design
10. Evidence-Based Completion
11. SDD Review Enforcement
12. Surgical Changes

Anti-Rationalization 테이블: 17행 (원칙별 변명과 반박).

총 94줄, 약 650 토큰.

---

## 발견된 문제

| # | 위치 | 문제 유형 | 설명 |
|---|------|-----------|------|
| 1 | #2 | 언어 종속 | `process.env` -- Node.js/JavaScript 전용 참조 |
| 2 | #6 | 언어 종속 | `zod schemas` -- JavaScript 생태계 전용 라이브러리 |
| 3 | #9 | 스킬 종속 | `Run /plan first` -- 특정 스킬/커맨드 하드코딩 |
| 4 | Anti-Rationalization | 스킬 종속 | `Ralph Loop` 행 -- 특정 스킬 참조 |
| 5 | Anti-Rationalization | 스킬 종속 | `/simplify` 행 -- 특정 스킬 참조 |

---

## 제안 변경 사항

### 변경 1: #2 Secrets in Environment Variables

| 항목 | 내용 |
|------|------|
| **Before** | `Never hardcode secrets. Use process.env only; throw immediately if unset.` |
| **After** | `Never hardcode secrets. 환경변수 (process.env, os.environ, System.getenv 등) 사용; 미설정 시 즉시 에러 발생.` |
| **사유** | Node.js 전용 `process.env`만 언급 -> 다중 언어 힌트로 확장 |

### 변경 2: #6 Validate at System Boundaries

| 항목 | 내용 |
|------|------|
| **Before** | `Trust internal code, but validate user input and external API responses (e.g., zod schemas, parameterized queries).` |
| **After** | `Trust internal code, but validate user input and external API responses (e.g., 스키마 검증 라이브러리 (zod, pydantic 등), parameterized queries).` |
| **사유** | `zod`만 언급 -> 다중 언어 검증 라이브러리 힌트로 확장 |

### 변경 3: #9 HARD-GATE: No Coding Without Design

| 항목 | 내용 |
|------|------|
| **Before** | `Run /plan first if any of these apply: new feature (3+ files), architecture change, API endpoint change, DB schema change. No code until the user approves the plan. Exception: simple fixes (1-2 files, typo/bug patches).` |
| **After** | `구현 계획을 먼저 수립 if any of these apply: new feature (3+ files), architecture change, API endpoint change, DB schema change. No code until the user approves the plan. Exception: simple fixes (1-2 files, typo/bug patches).` |
| **사유** | `/plan` 스킬 하드코딩 제거 -> 범용 행위 기술로 전환 |

### 변경 4: Anti-Rationalization 테이블 -- Ralph Loop 행 삭제

| 항목 | 내용 |
|------|------|
| **Before** | `\| Ralph Loop \| "Let me just try one more approach" \| Stop. Plan first, then execute once \|` |
| **After** | (삭제) |
| **사유** | Ralph Loop은 특정 스킬(`/ralph-loop`) 전용 규칙. 범용 원칙이 아님 |

### 변경 5: Anti-Rationalization 테이블 -- /simplify 행 삭제

| 항목 | 내용 |
|------|------|
| **Before** | `\| /simplify \| "The complexity is necessary" \| Run /simplify. If it finds reduction, it wasn't necessary \|` |
| **After** | (삭제) |
| **사유** | `/simplify`는 특정 스킬 전용 규칙. 범용 원칙이 아님 |

### 유지 항목

| 섹션 | 사유 |
|------|------|
| 12개 원칙 전체 (개념) | SSOT 허브로서 모든 원칙 유지 필수 |
| Why/How 구조 | 원칙의 근거와 실행법을 명확히 전달 |
| Anti-Rationalization 15행 | 범용 변명/반박 쌍. 스킬 종속 2행만 제거 |
| #10 Evidence-Based 상세 | verification.md와 연계되나 요약은 여기서 유지 |
| #11 SDD Review | 범용 서브에이전트 개발 원칙 |
| #12 Surgical Changes | 범용 코드 변경 원칙 |

---

## 변경 후 내용 요약

12개 원칙 전체 유지. #2, #6에서 언어 종속 표현을 다중 언어 힌트로 확장. #9에서 스킬 하드코딩 제거. Anti-Rationalization 테이블에서 스킬 종속 2행(`Ralph Loop`, `/simplify`) 삭제하여 17행 -> 15행. SSOT 허브 역할은 변함없음.

---

## 토큰 영향

| 항목 | Before | After | 변동 |
|------|:------:|:-----:|:----:|
| 추정 토큰 | ~650 | ~620 | **-5%** |
| 변경 줄 수 | - | 5줄 수정 + 2줄 삭제 | - |

토큰 절감은 소폭이나, SSOT 허브이므로 내용 안정성이 최우선. 언어 종속 3건과 스킬 종속 3건을 범용화하여 **모든 프로젝트에서 참조 가능한 순수 원칙 파일**로 개선.
