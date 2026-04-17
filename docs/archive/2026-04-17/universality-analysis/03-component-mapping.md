# 03. src/claude/ vs 사용자 파일 매핑

> 의존 문서: [01-score-table.md](01-score-table.md)
> 73개 사용자 파일을 claude-kit 기존 컴포넌트와 비교하여 중복/보완/신규로 분류.

## 방법론

- 이름 매칭 + 기능 비교 + 내용 분석
- claude-kit 경로: `src/claude/{core,dev,plan}/{hooks,rules,skills,commands}/`

---

## 1. 중복 (27개) — claude-kit에 이미 존재

| # | 유형 | 사용자 파일 | claude-kit 경로 | 유사도 | 조치 |
|---|------|-----------|----------------|--------|------|
| 1 | rule | golden-principles.md | core/rules/golden-principles.md | 95% | kit 버전 유지 |
| 2 | rule | verification.md | core/rules/verification.md | 95% | kit 버전 유지 |
| 3 | rule | interaction.md | core/rules/interaction.md | 90% | kit 버전 유지 (MCP 섹션 제거됨) |
| 4 | rule | security.md | core/rules/security.md | 90% | kit 버전 유지 |
| 5 | rule | coding-style.md | core/rules/coding-style.md | 90% | kit 버전 유지 |
| 6 | rule | date-calculation.md | core/rules/date-calculation.md | 95% | kit 버전 유지 |
| 7 | hook | code-quality-reminder.sh | core/hooks/code-quality-reminder.js | 85% | kit 버전 유지 (JS) |
| 8 | hook | output-secret-filter.sh | core/hooks/output-secret-filter.js | 80% | kit 버전 유지 (JS) |
| 9 | hook | security-auto-trigger.sh | core/hooks/security-auto-trigger.js | 85% | kit 버전 유지 (JS) |
| 10 | hook | session-wrap-suggest.sh | core/hooks/session-wrap-suggest.js | 80% | kit 버전 유지 (JS) |
| 11 | hook | db-guard.sh | dev/hooks/dev-db-guard.js | 70% | kit 버전 유지 (범용 SQL 가드) |
| 12 | skill | continuous-learning-v2/ | core/skills/continuous-learning/ | 95% | kit 버전 유지 |
| 13 | skill | session-wrap/ | core/skills/session-wrap/ | 90% | kit 버전 유지 |
| 14 | skill | verification-engine/ | dev/skills/dev-verification-engine/ | 85% | kit 버전 유지 |
| 15 | skill | security-pipeline/ | dev/skills/dev-security-pipeline/ | 80% | kit 버전이 v2.0 |
| 16 | skill | frontend-code-review/ | dev/skills/dev-frontend-patterns/ | 70% | kit 버전이 더 포괄적 |
| 17 | cmd | explore.md | dev/commands/dev-explore.md | 90% | kit 버전 유지 |
| 18 | cmd | commit-push-pr.md | dev/commands/dev-commit-push-pr.md | 85% | kit 버전 유지 |
| 19 | cmd | plan.md | dev/commands/dev-plan.md | 85% | kit 버전 유지 |
| 20 | cmd | code-review.md | dev/commands/dev-review.md | 80% | kit 버전 유지 |
| 21 | cmd | refactor-clean.md | dev/commands/dev-refactor.md | 80% | kit 버전 유지 |
| 22 | cmd | handoff-verify.md | dev/commands/dev-handoff-verify.md | 85% | kit 버전 유지 |
| 23 | cmd | sync.md | dev/commands/dev-sync.md | 85% | kit 버전 유지 |
| 24 | cmd | sync-docs.md | dev/commands/dev-sync-docs.md | 80% | kit 버전 유지 |
| 25 | cmd | learn.md | dev/commands/dev-learn.md | 85% | kit 버전 유지 |
| 26 | cmd | build-fix.md | dev/commands/dev-build-fix.md | 85% | kit 버전 유지 |
| 27 | cmd | checkpoint.md | dev/commands/dev-checkpoint.md | 85% | kit 버전 유지 |

---

## 2. 보완 (5개) — 기존 컴포넌트 확장

| # | 사용자 파일 | claude-kit 파일 | 추가 가치 | 병합 난이도 | 조치 |
|---|-----------|----------------|----------|------------|------|
| 1 | security-review.md | dev/commands/dev-security-review.md | CWE+STRIDE 통합 워크플로우 | MED | kit에 사용자 패턴 병합 |
| 2 | quick-commit.md | dev/commands/dev-commit.md | 간편 커밋 (확인 최소화) | LOW | kit에 변형 커맨드 추가 |
| 3 | verify-loop.md | dev/commands/dev-verify-all.md | 자동 재시도 (최대 3회) | LOW | kit에 재시도 로직 병합 |
| 4 | tdd.md | dev/commands/dev-test-verify.md | 단위 작업 TDD 전용 | LOW | kit에 단위 TDD 모드 추가 |
| 5 | auto.md | dev/commands/dev-run.md | 원스톱 계획→구현→PR | MED | kit에 자동화 파이프라인 병합 |

---

## 3. 신규 (41개) — claude-kit에 없음

### hooks (10개)

| # | 파일 | ★ | 제안 도메인 | 제안 경로 | 우선순위 |
|---|------|---|----------|----------|---------|
| 1 | remote-command-guard.sh | 5 | core | core/hooks/ | HIGH |
| 2 | rate-limiter.sh | 5 | core | core/hooks/ | HIGH |
| 3 | mcp-usage-tracker.sh | 5 | core | core/hooks/ | MED |
| 4 | context-sync-suggest.sh | 4 | core | core/hooks/ | MED |
| 5 | work-tracker-prompt.sh | 4 | core | core/hooks/ | MED |
| 6 | work-tracker-tool.sh | 4 | core | core/hooks/ | MED |
| 7 | work-tracker-stop.sh | 4 | core | core/hooks/ | MED |
| 8 | task-completed.sh | 4 | core | core/hooks/ | LOW |
| 9 | forge-update-check.sh | 2 | -- | 제외 | -- |
| 10 | expensive-mcp-warning.sh | 3 | dev | dev/hooks/ (조건부) | LOW |

### skills (10개)

| # | 스킬 | ★ | 제안 도메인 | 제안 경로 | 우선순위 |
|---|------|---|----------|----------|---------|
| 1 | team-orchestrator/ | 5 | core | core/skills/ | HIGH |
| 2 | build-system/ | 5 | core | core/skills/ | HIGH |
| 3 | using-superpowers/ | 5 | core | core/skills/ | HIGH |
| 4 | strategic-compact/ | 5 | core | core/skills/ | MED |
| 5 | eval-harness/ | 4 | dev | dev/skills/ | MED |
| 6 | skill-factory/ | 4 | core | core/skills/ | MED |
| 7 | manage-skills/ | 4 | core | core/skills/ | LOW |
| 8 | verify-implementation/ | 4 | dev | dev/skills/ | LOW |
| 9 | cc-dev-agent/ | 4 | dev | dev/skills/ | LOW |
| 10 | prompts-chat/ | 3 | -- | 조건부 또는 제외 | LOW |

### commands (18개)

| # | 커맨드 | ★ | 제안 도메인 | 제안 경로 | 우선순위 |
|---|--------|---|----------|----------|---------|
| 1 | pull.md | 5 | dev | dev/commands/ | HIGH |
| 2 | update-docs.md | 5 | dev | dev/commands/ | HIGH |
| 3 | update-codemaps.md | 5 | dev | dev/commands/ | HIGH |
| 4 | worktree-start.md | 5 | dev | dev/commands/ | HIGH |
| 5 | worktree-cleanup.md | 5 | dev | dev/commands/ | HIGH |
| 6 | orchestrate.md | 4 | dev | dev/commands/ | HIGH |
| 7 | init-project.md | 4 | dev | dev/commands/ | MED |
| 8 | next-task.md | 4 | dev | dev/commands/ | MED |
| 9 | agent-router.md | 4 | dev | dev/commands/ | MED |
| 10 | guide.md | 4 | dev | dev/commands/ | MED |
| 11 | suggest-automation.md | 4 | dev | dev/commands/ | MED |
| 12 | eval.md | 4 | dev | dev/commands/ | LOW |
| 13 | web-checklist.md | 4 | dev | dev/commands/ | LOW |
| 14 | show-setup.md | 4 | dev | dev/commands/ | LOW |
| 15 | e2e.md | 3 | dev | dev/commands/ (조건부) | LOW |
| 16 | test-coverage.md | 3 | dev | dev/commands/ (조건부) | LOW |


> ※ forge-update.md는 Forge 설치 파일이므로 분석 범위에서 제외.

### 기타 (2개)

| # | 파일 | ★ | 분류 | 비고 |
|---|------|---|------|------|
| 1 | cc-chips/ | 3 | 프로젝트 종속 | 별도 repo, 독립 프로젝트 |
| 2 | settings.json | 4 | 범용 템플릿 | 개인 설정 분리 권장 |

### rules (3개)

| # | 파일 | ★ | 제안 도메인 | 제안 경로 | 우선순위 |
|---|------|---|----------|----------|---------|
| 1 | git-workflow-v2.md | 5 | core | core/rules/ | HIGH |
| 2 | agents-v2.md | 5 | core | core/rules/ | MED |
| 3 | testing.md | 4 | core | core/rules/ (paths: 조건부) | MED |

---

## 4. 역방향 갭 — claude-kit에만 있고 사용자에게 없는 컴포넌트

| 도메인 | 컴포넌트 | 유형 | 설명 |
|--------|---------|------|------|
| core | edit-tracker.js | hook | 편집 파일 로그 (.ai/.edit-log.json) |
| dev | dev-feature-scope-guard.js | hook | 기능 범위 경계 강제 |
| dev | dev-tdd-guard.js | hook | TDD 워크플로우 강제 |
| dev | dev-domain-modeling/ | skill | Rich Domain Model 설계 |
| dev | dev-layered-architecture/ | skill | 계층 아키텍처 해석 |
| dev | dev-observability/ | skill | 구조화 로깅, 메트릭 패턴 |
| dev | dev-refactoring/ | skill | 리팩토링 워크플로우 |
| dev | dev-tdd-workflow/ | skill | TDD 사이클 가이드 |
| dev | dev-testing-backend/ | skill | 백엔드 테스트 패턴 |
| dev | dev-testing-e2e/ | skill | E2E 테스트 패턴 |
| dev | dev-testing-frontend/ | skill | 프론트엔드 테스트 패턴 |
| dev | dev-workflow/ | skill | 개발 워크플로우 통합 |
| dev | dev-architecture-decision/ | skill | 아키텍처 결정 기록 (ADR) |
| dev | dev-feature-module/ | skill | 기능 모듈 분리 패턴 |
| dev | dev-feature-plan/ | skill | 기능 구현 계획 자동화 |
| dev | dev-architecture.md | cmd | 아키텍처 분석/설계 |
| dev | dev-commit.md | cmd | 커밋 워크플로우 |
| dev | dev-continue.md | cmd | 이전 작업 이어서 진행 |
| dev | dev-feature.md | cmd | 기능 구현 통합 워크플로우 |
| dev | dev-verify.md | cmd | 단일 검증 실행 |
| dev | dev-verify-fe.md | cmd | 프론트엔드 검증 |
| plan | plan-* (전체 도메인) | 혼합 | 아이디어→심사→PRD→와이어프레임 파이프라인 |

---

## 5. 요약

| 구분 | 수량 | 비율 |
|------|------|------|
| 중복 | 27 | 37% |
| 보완 | 5 | 7% |
| 신규 | 39 | 53% |
| 기타 | 2 | 3% |
| **합계** | **73** | **100%** |

### 역방향 갭

| 구분 | 수량 |
|------|------|
| claude-kit에만 존재하는 hooks | 3 |
| claude-kit에만 존재하는 skills | 11 |
| claude-kit에만 존재하는 commands | 5 |
| claude-kit에만 존재하는 plan 도메인 | 전체 (agents 6, commands 9, skills 8, hooks 1) |
| **역방향 갭 합계 (plan 제외)** | **19** |
