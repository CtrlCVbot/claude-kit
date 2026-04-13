# 08. testing.md 비교 분석

> 원본 위치: `~/.claude/rules/testing.md`
> 아카이브: `_archive/2026-04-10-originals/testing.md`
> 변경 강도: **MEDIUM**
> 범용성 점수: 2 → 4

---

## 현재 내용 요약

테스트 요구사항을 정의하는 파일로, `paths:` frontmatter를 통해 테스트 파일 편집 시에만 조건부 로딩된다. 내용은 크게 5개 섹션으로 구성:

1. **paths: frontmatter** -- glob 패턴 기반 조건부 로딩
2. **Minimum Test Coverage: 80%** -- 커버리지 기준
3. **Test Types** -- 단위/통합/E2E 유형 정의
4. **Test-Driven Development** -- 6단계 TDD 워크플로우 상세
5. **Troubleshooting / Agent Support** -- tdd-guide, e2e-runner 에이전트 참조

---

## 발견된 문제점

| # | 문제 | 유형 | 심각도 |
|---|------|------|--------|
| 1 | TDD 섹션이 golden-principles.md #3과 동일 내용을 6단계로 반복 | SSOT 중복 | MEDIUM |
| 2 | E2E 테스트에 "Playwright" 하드코딩 -- 프로젝트마다 프레임워크가 다름 | 범용성 위반 | LOW |
| 3 | Troubleshooting에 "tdd-guide agent" 참조 -- 조직 전용 에이전트 | 조직 종속 | MEDIUM |
| 4 | Agent Support 섹션 전체가 조직 전용 (tdd-guide, e2e-runner) | 조직 종속 | HIGH |
| 5 | verification.md의 증거 기반 완료 원칙에 대한 교차 참조 부재 | 연결 누락 | LOW |

---

## 제안 변경사항

### 변경 1: paths: frontmatter -- 유지

변경 없음. 조건부 로딩 패턴은 토큰 효율에 핵심이므로 그대로 유지한다.

### 변경 2: Minimum Test Coverage -- 유지

변경 없음. 80% 커버리지 기준은 범용적이며 golden-principles.md #3과 일관된다.

### 변경 3: E2E 테스트 프레임워크 범용화

| Before | After |
|--------|-------|
| `3. **E2E Tests** - Critical user flows (Playwright)` | `3. **E2E Tests** - Critical user flows (프로젝트 E2E 프레임워크 사용)` |

**근거**: Cypress, Playwright, Selenium 등 프로젝트마다 E2E 프레임워크가 다르다. 전역 규칙은 특정 도구를 강제하지 않아야 한다.

### 변경 4: TDD 섹션 축소 (SSOT 중복 제거)

| Before | After |
|--------|-------|
| `## Test-Driven Development` | `## Test-Driven Development` |
| `MANDATORY workflow:` | `TDD는 필수 워크플로우다.` |
| `1. Write test first (RED)` | `golden-principles.md #3에서 완전한 RED-GREEN-IMPROVE 사이클을 참조한다.` |
| `2. Run test - it should FAIL` | _(삭제)_ |
| `3. Write minimal implementation (GREEN)` | _(삭제)_ |
| `4. Run test - it should PASS` | _(삭제)_ |
| `5. Refactor (IMPROVE)` | _(삭제)_ |
| `6. Verify coverage (80%+)` | _(삭제)_ |

**근거**: golden-principles.md #3이 TDD의 정본(SSOT)이다. 동일 내용을 6단계로 반복하면 유지보수 시 불일치가 발생한다. 1줄 요약 + 참조로 대체하여 SSOT를 보장한다.

### 변경 5: Troubleshooting 정리

| Before | After |
|--------|-------|
| `1. Use **tdd-guide** agent` | _(삭제)_ |
| `2. Check test isolation` | `1. Check test isolation` |
| `3. Verify mocks are correct` | `2. Verify mocks are correct` |
| `4. Fix implementation, not tests (unless tests are wrong)` | `3. Fix implementation, not tests (unless tests are wrong)` |

**근거**: "tdd-guide agent"는 조직 전용 에이전트 이름이다. 범용 트러블슈팅 원칙만 남긴다.

### 변경 6: Agent Support 섹션 전체 삭제

| Before | After |
|--------|-------|
| `## Agent Support` | _(섹션 전체 삭제)_ |
| `- **tdd-guide** - Use PROACTIVELY...` | _(삭제)_ |
| `- **e2e-runner** - Playwright E2E testing specialist` | _(삭제)_ |

**근거**: 에이전트 라우팅은 agents-v2.md(또는 프로젝트별 agent-catalog)의 영역이다. 전역 테스트 규칙에 특정 에이전트 이름을 포함하면 다른 프로젝트에서 혼란을 준다.

### 변경 7: verification.md 교차 참조 추가

| Before | After |
|--------|-------|
| _(없음)_ | `> 테스트 통과를 주장하기 전에 반드시 verification.md의 증거 기반 완료 규칙을 따른다.` |

**근거**: 테스트 결과 보고 시 증거 없이 "통과했다"고 주장하는 패턴을 방지한다.

---

## 변경 후 내용 요약

```markdown
---
paths:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/tests/**"
  - "**/__tests__/**"
  - "**/playwright/**"
---

# Testing Requirements

> 테스트 통과를 주장하기 전에 반드시 verification.md의 증거 기반 완료 규칙을 따른다.

## Minimum Test Coverage: 80%

Test Types (ALL required):
1. **Unit Tests** - Individual functions, utilities, components
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows (프로젝트 E2E 프레임워크 사용)

## Test-Driven Development

TDD는 필수 워크플로우다. golden-principles.md #3에서 완전한 RED-GREEN-IMPROVE 사이클을 참조한다.

## Troubleshooting Test Failures

1. Check test isolation
2. Verify mocks are correct
3. Fix implementation, not tests (unless tests are wrong)
```

---

## 토큰 영향

| 항목 | Before | After | 변화 |
|------|:------:|:-----:|:----:|
| 총 라인 수 | 40 | 23 | -17 (42% 감소) |
| 추정 토큰 | ~280 | ~160 | **-120 (~43% 절감)** |
| 조직 종속 참조 | 3개 | 0개 | 전부 제거 |
| SSOT 중복 | 1건 (TDD 6단계) | 0건 | 참조로 대체 |
| paths: frontmatter | 유지 | 유지 | (조건부 로딩 보존) |
