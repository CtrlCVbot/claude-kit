# dev Domain

> **Status**: Draft (P4, 2026-04-17)
> **Source**: `src/claude/dev/`, [../30-reference/01-commands.md](../30-reference/01-commands.md), [../30-reference/02-agents.md](../30-reference/02-agents.md)
> **Related**: [Core Concepts](../00-overview/02-core-concepts.md), [User Guide → Daily Workflow](../20-user-guide/04-daily-workflow.md)

`dev` 도메인은 **요구사항이 정해진 상태에서 바로 구현할 때** 쓰는 파이프라인입니다. PRD 를 입력받아 Feature Package 로 전환하고, 각 TASK 를 TDD 로 구현하며, DVC 검증과 커밋·PR 까지 자동화합니다.

## 파이프라인 개요

```
 PRD 문서  →  /dev-feature   →  Feature Package 생성 (.plans/features/active/{slug}/)
                                 └─ TASK 목록 분할

 Feature Package →  /dev-run  →  TASK 별 TDD 루프 (Red → Green → Refactor)
                                 └─ dev-tdd-guard 가 테스트 없는 편집 차단

 구현 완료   →  /dev-verify     →  DVC (Document-Verification Consistency) 검증
               /dev-verify-all     타입체크·테스트·린트·빌드 실행
                                   증거 수집

 검증 통과   →  /dev-commit     →  커밋 메시지 자동 생성
               /dev-commit-push-pr → push + PR 생성
```

## 주요 커맨드

| Command | 입력 | 출력 |
|---------|------|------|
| [`/dev-architecture`](../../src/claude/dev/commands/dev-architecture.md) | 프로젝트 스캔 | 구조 SSOT 결정 (hexagonal/clean/service-module/minimal-layered) |
| [`/dev-feature <prd>`](../../src/claude/dev/commands/dev-feature.md) | 승인된 PRD 경로 | Feature Package + TASK 분할 |
| [`/dev-run <package>`](../../src/claude/dev/commands/dev-run.md) | Feature Package 경로 | TASK 별 TDD 구현 |
| [`/dev-plan`](../../src/claude/dev/commands/dev-plan.md) | 짧은 요청 | AI 가 구현 계획 작성, 승인 후 코딩 |
| [`/dev-explore`](../../src/claude/dev/commands/dev-explore.md) | 자유 질문 | 반복 정제 코드베이스 탐색 |
| [`/dev-verify`, `/dev-verify-all`, `/dev-verify-fe`](../../src/claude/dev/commands/dev-verify.md) | — | 검증 파이프라인 실행 |
| [`/dev-review`, `/dev-security-review`, `/dev-test-verify`](../../src/claude/dev/commands/dev-review.md) | — | 리뷰 서브에이전트 호출 |
| [`/dev-commit`, `/dev-commit-push-pr`](../../src/claude/dev/commands/dev-commit.md) | — | 커밋 및 PR 생성 |
| [`/dev-refactor`](../../src/claude/dev/commands/dev-refactor.md) | 리팩토링 요청 | 안전한 단계별 리팩토링 |
| [`/dev-build-fix`](../../src/claude/dev/commands/dev-build-fix.md) | 빌드 오류 | 증분 수정 |
| [`/dev-sync`, `/dev-sync-docs`](../../src/claude/dev/commands/dev-sync.md) | — | Git pull + 문서 동기화 |
| [`/dev-handoff-verify`](../../src/claude/dev/commands/dev-handoff-verify.md) | 세션 전환 | 핸드오프 + 자동 검증 |
| [`/dev-continue`, `/dev-checkpoint`, `/dev-learn`](../../src/claude/dev/commands/dev-continue.md) | — | 작업 연속성·교훈 기록 |

전체 커맨드 목록: [30-reference/01-commands.md](../30-reference/01-commands.md) (자동 생성).

## 주요 서브에이전트

| Agent | 역할 |
|-------|------|
| [`dev-architect`](../../src/claude/dev/agents/dev-architect.md) | 시스템 설계·확장성·기술 결정. 새 기능 기획, 리팩토링, 아키텍처 결정 시 |
| [`dev-code-reviewer`](../../src/claude/dev/agents/dev-code-reviewer.md) | 코드 품질·보안·유지보수성 리뷰. 코드 작성·수정 직후 필수 |
| [`dev-security-reviewer`](../../src/claude/dev/agents/dev-security-reviewer.md) | OWASP Top 10, 시크릿, SSRF, 인젝션 등 취약점 탐지 |
| [`dev-database-reviewer`](../../src/claude/dev/agents/dev-database-reviewer.md) | PostgreSQL 쿼리·스키마·성능 최적화 |
| [`dev-doc-updater`](../../src/claude/dev/agents/dev-doc-updater.md) | 코드맵·README·가이드 업데이트 |
| `dev-verify-agent` | 새 컨텍스트에서 빌드·타입·린트·테스트 검증 파이프라인 실행 |

## 가드 훅

| Hook | Event | Action |
|------|-------|--------|
| [`dev-tdd-guard.js`](../../src/claude/dev/hooks/dev-tdd-guard.js) | PreToolUse (Edit\|Write) | **BLOCKING (exit 2)** — 테스트 없는 편집 차단 |
| [`dev-db-guard.js`](../../src/claude/dev/hooks/dev-db-guard.js) | PreToolUse (Bash) | **BLOCKING** — `DROP`, `TRUNCATE` 등 위험한 DB 명령 차단 |
| [`dev-feature-scope-guard.js`](../../src/claude/dev/hooks/dev-feature-scope-guard.js) | PreToolUse (Edit\|Write) | **REMINDER** — Feature Package 범위 밖 편집 경고 |

### TDD 가드 동작 원리

편집 대상 파일을 분석해 **매칭되는 테스트 파일이 있는지** 확인합니다.

- TypeScript: `foo.ts` → `foo.test.ts`, `foo.spec.ts`, `__tests__/foo.ts` 등
- Java: `Foo.java` → `FooTest.java` 등
- Python: `foo.py` → `test_foo.py`, `tests/test_foo.py` 등

면제 패턴: `*.md`, `*.json`, `*.config.{ts,js}`, `*.d.ts`, `migrations/`, `index.ts` 등.

자세한 구현: [../../src/claude/dev/hooks/dev-tdd-guard.js](../../src/claude/dev/hooks/dev-tdd-guard.js) 참조.

## 주요 스킬

| 스킬 | 역할 |
|------|------|
| [`dev-tdd-workflow`](../../src/claude/dev/skills/dev-tdd-workflow/SKILL.md) | Red-Green-Refactor 사이클 가이드 |
| [`dev-architecture-decision`](../../src/claude/dev/skills/dev-architecture-decision/SKILL.md) | 구조 감지/추천 — SSOT 와 feature binding 생성 |
| [`dev-domain-modeling`](../../src/claude/dev/skills/dev-domain-modeling/SKILL.md) | Entity, Value Object, State Machine, Factory Method |
| [`dev-feature-plan`](../../src/claude/dev/skills/dev-feature-plan/SKILL.md) | 승인된 PRD → Feature Overview + Feature Package |
| [`dev-workflow`](../../src/claude/dev/skills/dev-workflow/SKILL.md) | Feature Package TASK 를 구조 계약 안에서 TDD 로 구현 |
| [`dev-testing-backend`, `dev-testing-frontend`, `dev-testing-e2e`](../../src/claude/dev/skills/dev-testing-backend/SKILL.md) | 레이어별 테스트 전략 |
| [`dev-refactoring`](../../src/claude/dev/skills/dev-refactoring/SKILL.md) | 안전한 리팩토링 절차 |
| [`dev-observability`](../../src/claude/dev/skills/dev-observability/SKILL.md) | 구조화 로깅, 에러 추적, 메트릭 패턴 |
| [`dev-security-pipeline`](../../src/claude/dev/skills/dev-security-pipeline/SKILL.md) | CWE Top 25 + STRIDE 자동 검증 |
| [`dev-verification-engine`](../../src/claude/dev/skills/dev-verification-engine/SKILL.md) | 서브에이전트 기반 fresh-context 검증 루프 |
| [`dev-frontend-patterns`, `dev-layered-architecture`, `dev-feature-module`](../../src/claude/dev/skills/dev-frontend-patterns/SKILL.md) | 구조/배치 계약 |

## 핵심 게이트

| 게이트 | 조건 | 동작 |
|--------|------|------|
| HARD-GATE | 새 기능 (3+ 파일) / API / DB 스키마 변경 | 사용자가 계획 승인 전까지 코딩 금지 |
| TDD | 테스트 없는 Edit/Write | dev-tdd-guard 가 exit 2 |
| SDD 리뷰 | 서브에이전트 위임 완료 | 독립적 VCS diff 검증 후에만 완료 선언 |
| 증거 기반 | 완료 주장 | 테스트 결과·빌드 exit 0 등 증거 필수 |

이 게이트들은 [core 도메인의 규칙 파일](../../src/claude/core/rules/golden-principles.md) 에서 정의되며, dev 도메인 훅이 강제 집행합니다.

## 다음 읽기

- [03-plan-domain.md](03-plan-domain.md) — PRD 전 단계 (기획 파이프라인)
- [05-governance-guards.md](05-governance-guards.md) — 가드 훅 전체 그림
- [../20-user-guide/04-daily-workflow.md](../20-user-guide/04-daily-workflow.md) — 실제 사용 흐름
