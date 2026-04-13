# 09. verification.md 비교 분석

> 원본 위치: `~/.claude/rules/verification.md`
> 아카이브: `_archive/2026-04-10-originals/verification.md`
> 변경 강도: **NONE**
> 범용성 점수: 5 → 5

---

## 현재 내용 요약

검증 없는 완료 주장을 원천 차단하는 규칙 파일이다. golden-principles.md #10(증거 기반 완료)의 완전한 확장판으로, 7개 섹션에 걸쳐 검증 패턴, 레드 플래그, 적용 시점을 정의한다.

1. **The Iron Law** -- 신선한 검증 증거 없는 완료 주장 금지
2. **The Gate Function** -- IDENTIFY-RUN-READ-VERIFY-CLAIM 5단계
3. **Verification Checklist** -- 7가지 주장별 필수/불충분 증거 대조표
4. **Red-Green Verification** -- TDD 회귀 테스트용 3단계 확인
5. **Red Flags** -- 10가지 위험 사고 패턴
6. **Verification Patterns** -- 테스트/빌드/요구사항/에이전트 위임 4가지 패턴
7. **When to Apply / The Bottom Line** -- 적용 시점과 비타협 선언

---

## 변경 불필요 근거

### 1. 완전한 범용성 (5/5)

이 파일은 9개 전역 규칙 중 유일하게 범용성 만점을 받은 파일이다.

| 검증 항목 | 결과 | 비고 |
|-----------|------|------|
| 하드코딩된 에이전트 이름 | 없음 | "Agent Delegation" 패턴도 범용적으로 기술 |
| 언어/프레임워크 종속 예시 | 없음 | `[run test command]`, `[run build]` 등 플레이스홀더 사용 |
| 외부 경로 의존성 | 없음 | golden-principles.md #10 참조만 존재 (같은 rules/ 내부) |
| 조직 전용 용어 | 없음 | qjc, mologado 등 조직명 미사용 |
| MCP/도구 종속성 | 없음 | 특정 MCP 서버나 도구를 참조하지 않음 |

### 2. 중복 없음 -- 이 파일이 정본(SSOT)

verification.md는 "증거 기반 완료" 원칙의 정본이다. golden-principles.md #10이 이 파일의 요약본 역할을 하며, 다른 파일(testing.md 등)이 이 파일을 참조하는 방향이다. 축소 대상이 아니라 참조 대상이다.

### 3. 교차 참조 구조 정상

- golden-principles.md #10 → verification.md 참조 (정본 위임)
- testing.md → verification.md 참조 (변경 후, 08-testing.md에서 추가)
- 역방향 참조 불필요 (정본은 자기 완결적)

### 4. 토큰 효율 양호

117 라인, 약 750 토큰으로 내용 대비 토큰 소모가 적절하다. 테이블과 코드 블록이 정보 밀도를 높이고 있으며, 산문 형식으로 풀면 오히려 토큰이 늘어난다.

### 5. Red Flags 테이블의 높은 실용 가치

10가지 위험 사고 패턴 테이블은 LLM이 자기 검증을 건너뛰려 할 때 직접 참조하는 핵심 방어선이다. 축소하면 실효성이 떨어진다.

---

## 결론

**변경 사항 없음.** verification.md는 이 프로젝트에서 변경이 불필요한 유일한 파일이다. 범용성, SSOT 역할, 토큰 효율, 실용 가치 모든 면에서 현재 상태가 최적이다.

---

## 토큰 영향

| 항목 | Before | After | 변화 |
|------|:------:|:-----:|:----:|
| 총 라인 수 | 117 | 117 | 0 |
| 추정 토큰 | ~750 | ~750 | **0 (변경 없음)** |
| 조직 종속 참조 | 0개 | 0개 | -- |
| SSOT 중복 | 0건 | 0건 | -- |
