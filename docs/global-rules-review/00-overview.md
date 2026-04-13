# 전역 규칙 파일 범용성 개선 프로젝트

## 목적

전역 규칙 파일(`~/.claude/rules/`)은 모든 프로젝트에 적용되므로 **조직/프로젝트 특화 내용을 제거**하고 범용 원칙만 남겨야 한다. 이 프로젝트는 9개 규칙 파일을 감사하여 범용성, 중복 제거(SSOT), 토큰 효율을 개선한다.

---

## 점수 비교표

| # | 파일 | Before | After | 변경 강도 |
|---|------|--------|-------|-----------|
| 1 | agents-v2.md | 1 | 4 | HIGH |
| 2 | coding-style.md | 3 | 5 | MEDIUM |
| 3 | date-calculation.md | 4 | 5 | LOW |
| 4 | git-workflow-v2.md | 2 | 4 | MEDIUM |
| 5 | golden-principles.md | 3 | 5 | MEDIUM |
| 6 | interaction.md | 2 | 4 | MEDIUM |
| 7 | security.md | 3 | 5 | LOW-MEDIUM |
| 8 | testing.md | 2 | 4 | MEDIUM |
| 9 | verification.md | 5 | 5 | NONE |

- **Before 점수 기준**: 1=조직 종속, 2=일부 범용+중복 다수, 3=대체로 범용+중복 일부, 4=범용+경미한 중복, 5=범용+중복 없음
- **After 점수 기준**: 동일 척도. SSOT 참조로 대체된 중복은 감점하지 않음

---

## 중복 제거 SSOT 맵

동일 원칙이 여러 파일에 반복되면 **하나의 정본(SSOT)**을 지정하고, 나머지는 1줄 참조로 대체한다.

| 원칙 | SSOT (정본) | 축소 대상 파일 | 축소 방식 |
|------|-------------|---------------|-----------|
| 불변성 (Immutability) | golden-principles.md #1 | coding-style.md | 체크리스트 항목만 유지 (코드 예시 삭제) |
| TDD | golden-principles.md #3 | testing.md | 1줄 요약 + `golden-principles.md #3 참조` |
| | | git-workflow-v2.md | 참조만 (`golden-principles.md #3`) |
| 결론 우선 | golden-principles.md #4 | interaction.md | 1줄 요약 + `golden-principles.md #4 참조` |
| 유추 설명 | golden-principles.md #7 | interaction.md | 범용 예시 + `golden-principles.md #7 참조` |
| 파일 크기 | golden-principles.md #5 | coding-style.md | 체크리스트 항목만 유지 (본문 삭제) |
| 증거 기반 완료 | verification.md (전문) | golden-principles.md #10 | 요약 1-2줄 + `verification.md 참조` |

---

## 토큰 영향 요약

| 항목 | Before (추정) | After (추정) | 절감 |
|------|:------------:|:------------:|:----:|
| 전체 규칙 토큰 | ~4,800 | ~2,800 | **42%** |
| 중복 제거 절감분 | - | ~1,200 | 25% |
| 조직 종속 제거분 | - | ~800 | 17% |

---

## 문서 읽기 순서

| # | 문서 | 설명 |
|---|------|------|
| 00 | 본 문서 | 프로젝트 개요, 점수표, SSOT 맵 |
| 01 | [agents-v2.md](./01-agents-v2.md) | 에이전트 오케스트레이션 (HIGH) |
| 02 | [coding-style.md](./02-coding-style.md) | 코딩 스타일 (MEDIUM) |
| 03 | [date-calculation.md](./03-date-calculation.md) | 날짜 계산 (LOW) |
| 04 | git-workflow-v2.md | Git 워크플로우 (MEDIUM) |
| 05 | golden-principles.md | 골든 원칙 (MEDIUM) |
| 06 | interaction.md | 상호작용 규칙 (MEDIUM) |
| 07 | security.md | 보안 가이드라인 (LOW-MEDIUM) |
| 08 | [testing.md](./08-testing.md) | 테스트 규칙 (MEDIUM) |
| 09 | [verification.md](./09-verification.md) | 검증 규칙 (NONE -- 변경 없음) |
| 10 | [추가 제안사항](./10-additional-suggestions.md) | 신규 파일 제안, 구조 재편, 토큰 최적화 |
