# 04. git-workflow-v2.md 비교 문서

> 원본: `_archive/2026-04-10-originals/git-workflow-v2.md`
> 변경 강도: **MEDIUM**

---

## 현재 내용 요약

Git 워크플로우 규칙 파일로 4개 섹션으로 구성:

1. **Commit Message Format** -- conventional commits 형식 (`feat`, `fix` 등)
2. **Pull Request Workflow** -- PR 생성 5단계 절차
3. **Feature Implementation Workflow** -- 계획, TDD, 코드 리뷰, 커밋의 4단계 워크플로우
4. **GitHub Organization** -- 레포 생성 및 클론 커맨드

총 64줄, 약 380 토큰.

---

## 발견된 문제

| # | 위치 | 문제 유형 | 설명 |
|---|------|-----------|------|
| 1 | Feature Workflow #1 | 조직 종속 | `Use **planner** agent` -- 특정 에이전트 이름 하드코딩 |
| 2 | Feature Workflow #2 | 조직 종속 | `Use **tdd-guide** agent` -- 특정 에이전트 이름 하드코딩 |
| 3 | Feature Workflow #3 | 조직 종속 | `Use **code-reviewer** agent` -- 특정 에이전트 이름 하드코딩 |
| 4 | Feature Workflow #1 | SSOT 중복 | 계획 우선 원칙이 golden-principles.md #9와 중복 |
| 5 | Feature Workflow #2 | SSOT 중복 | TDD 절차가 golden-principles.md #3과 중복 |

---

## 제안 변경 사항

### 변경 1: Feature Implementation Workflow -- Plan First

| 항목 | 내용 |
|------|------|
| **Before** | `1. **Plan First**` / `- Use **planner** agent to create implementation plan` / `- Identify dependencies and risks` / `- Break down into phases` |
| **After** | `1. **Plan First**` / `- 구현 계획 수립 (See golden-principles.md #9)` / `- 의존성과 리스크 식별` / `- 단계별 분해` / `- 프로젝트에 구성된 에이전트가 있으면 활용` |
| **사유** | 특정 에이전트 이름 제거, SSOT 참조 추가, 범용 표현으로 전환 |

### 변경 2: Feature Implementation Workflow -- TDD Approach

| 항목 | 내용 |
|------|------|
| **Before** | `2. **TDD Approach**` / `- Use **tdd-guide** agent` / `- Write tests first (RED)` / `- Implement to pass tests (GREEN)` / `- Refactor (IMPROVE)` / `- Verify 80%+ coverage` |
| **After** | `2. **TDD Approach**` / `- TDD 방식 적용 (See golden-principles.md #3)` / `- Write tests first (RED)` / `- Implement to pass tests (GREEN)` / `- Refactor (IMPROVE)` / `- Verify 80%+ coverage` / `- 프로젝트에 구성된 에이전트가 있으면 활용` |
| **사유** | 특정 에이전트 이름 제거, SSOT 참조 추가. RED-GREEN-IMPROVE 절차는 이 문맥에서 유지 |

### 변경 3: Feature Implementation Workflow -- Code Review

| 항목 | 내용 |
|------|------|
| **Before** | `3. **Code Review**` / `- Use **code-reviewer** agent immediately after writing code` / `- Address CRITICAL and HIGH issues` / `- Fix MEDIUM issues when possible` |
| **After** | `3. **Code Review**` / `- 코드 리뷰 수행` / `- CRITICAL, HIGH 이슈 해결` / `- MEDIUM 이슈 가능한 수정` / `- 프로젝트에 구성된 에이전트가 있으면 활용` |
| **사유** | 특정 에이전트 이름 제거, 범용 표현으로 전환 |

### 유지 항목

| 섹션 | 사유 |
|------|------|
| Commit Message Format | 범용 규칙. conventional commits는 언어/프로젝트 무관 |
| Pull Request Workflow | 범용 5단계 절차. 특정 도구 의존 없음 |
| GitHub Organization | 범용 커맨드. `your-org` 플레이스홀더 사용 중 |
| Commit & Push (step 4) | 변경 없음 |

---

## 변경 후 내용 요약

4개 섹션 구조 유지. Feature Implementation Workflow에서 특정 에이전트 이름 3건을 범용 표현으로 전환하고, golden-principles.md로의 SSOT 참조를 추가. 각 단계에 "프로젝트에 구성된 에이전트가 있으면 활용" 메모를 통일 배치.

---

## 토큰 영향

| 항목 | Before | After | 변동 |
|------|:------:|:-----:|:----:|
| 추정 토큰 | ~380 | ~350 | **-8%** |
| 변경 줄 수 | - | 9줄 | - |

토큰 절감은 미미하나, 주요 목적은 **조직 종속 제거**와 **SSOT 참조 연결**이므로 크기보다 범용성 개선이 핵심.
