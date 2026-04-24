# 04. Domain: dev (47 entries)

> **dev 도메인은 claude-kit 의 핵심 기능 구현체.** 기능 구현 / 아키텍처 / 테스트 / 리뷰 / 커밋 워크플로우가 여기 모여 있다.

## 요약

| 항목 | 값 |
|------|---|
| pairing entries | 47 (전원 paired) |
| codex 물리 파일 수 | 47 + `_schemas/` 3 + `.gitkeep` 1 = **51 파일** |
| REVIEW NEEDED marker | **5 파일** (모두 write-capable agent) |
| 관련 exception | 없음 (dev 도메인은 exception-registry 에 등록 없음) |

## 타입별 집계

| 타입 | paired | 비고 |
|------|:---:|-----|
| agent | 7 | write-capable 5 (REVIEW NEEDED marker) |
| command | 21 | 모두 paired-direct |
| hook | 3 | TDD / DB / feature-scope 가드 |
| rule | 1 | edit-coordinates-governance |
| skill | 15 | dev 워크플로우·테스트·리팩토링 등 |
| **합계** | **47** | |

## Agents (7)

| Identity | Status | Hash | REVIEW | 비고 |
|----------|:---:|---|:---:|------|
| [dev-architect](../../../src/codex/dev/agents/dev-architect.md) | ✓ | `5b6dea7f` | — | 아키텍처 설계 리뷰 (Read-only) |
| [dev-code-reviewer](../../../src/codex/dev/agents/dev-code-reviewer.md) | ✓ | `d36ef023` | — | 코드 품질 리뷰 (Bash 포함, Read-only) |
| [dev-database-reviewer](../../../src/codex/dev/agents/dev-database-reviewer.md) | ✓ | `eef90ef0` | 🔶 wc | SQL / migration 작성 가능 |
| [dev-doc-updater](../../../src/codex/dev/agents/dev-doc-updater.md) | ✓ | `348e1113` | 🔶 wc | 코드맵 / 문서 업데이트 |
| [dev-implementer](../../../src/codex/dev/agents/dev-implementer.md) | ✓ | `cea54a8f` | 🔶 wc | `/dev-run` 기본 디스패치 에이전트 (IMP-AGENT-005) |
| [dev-security-reviewer](../../../src/codex/dev/agents/dev-security-reviewer.md) | ✓ | `a5a592eb` | 🔶 wc | 보안 리뷰 + fix 작성 |
| [dev-verify-agent](../../../src/codex/dev/agents/dev-verify-agent.md) | ✓ | `2e8a5d40` | 🔶 wc | 검증 서브에이전트 (≤10 파일/라운드) |

🔶 wc = write-capable agent (Write / Edit / Bash 보유) — Codex runtime 에서 의도된 권한 범위인지 확인 필요.

## Commands (21)

`/dev-*` 계열 모두 포함. 주요 그룹:

### 워크플로우 진입점 (기능 개발 사이클)

| Identity | Hash | 비고 |
|----------|---|------|
| [dev-feature](../../../src/codex/dev/commands/dev-feature.md) | `71a59fea` | PRD → Feature Package 생성 진입점 |
| [dev-run](../../../src/codex/dev/commands/dev-run.md) | `60c02d33` | Feature Package TASK TDD 자동 구현 |
| [dev-plan](../../../src/codex/dev/commands/dev-plan.md) | `f56d6b9b` | 구현 계획 수립 |
| [dev-continue](../../../src/codex/dev/commands/dev-continue.md) | `c5b55e8c` | 작업 이어하기 |
| [dev-checkpoint](../../../src/codex/dev/commands/dev-checkpoint.md) | `90d9f04b` | 작업 상태 저장 / 복원 |

### 검증 & 품질 (verify / review)

| Identity | Hash | 비고 |
|----------|---|------|
| [dev-verify](../../../src/codex/dev/commands/dev-verify.md) | `09da522b` | 통합 검증 |
| [dev-verify-all](../../../src/codex/dev/commands/dev-verify-all.md) | `c4dd97ca` | 전수 검증 |
| [dev-verify-fe](../../../src/codex/dev/commands/dev-verify-fe.md) | `9aee7d6e` | 프론트엔드 전용 검증 |
| [dev-test-verify](../../../src/codex/dev/commands/dev-test-verify.md) | `14195d16` | 테스트 품질 검증 |
| [dev-handoff-verify](../../../src/codex/dev/commands/dev-handoff-verify.md) | `469daa9f` | 빌드 / 타입 / 린트 / 테스트 검증 파이프라인 |
| [dev-build-fix](../../../src/codex/dev/commands/dev-build-fix.md) | `a3533f9c` | 빌드 오류 자동 수정 |
| [dev-review](../../../src/codex/dev/commands/dev-review.md) | `0b46f6f5` | 아키텍처 코드 리뷰 |
| [dev-security-review](../../../src/codex/dev/commands/dev-security-review.md) | `89d9959f` | CWE 기반 보안 검토 + STRIDE |

### 커밋 & 동기화

| Identity | Hash | 비고 |
|----------|---|------|
| [dev-commit](../../../src/codex/dev/commands/dev-commit.md) | `de17e497` | 커밋 생성 |
| [dev-commit-push-pr](../../../src/codex/dev/commands/dev-commit-push-pr.md) | `deed2ed5` | 검증 후 커밋 + PR + MCP 알림 |
| [dev-sync](../../../src/codex/dev/commands/dev-sync.md) | `4ed8df67` | pull + 문서 동기화 |
| [dev-sync-docs](../../../src/codex/dev/commands/dev-sync-docs.md) | `06e2b0ef` | 문서 동기화만 |

### 기타

| Identity | Hash | 비고 |
|----------|---|------|
| [dev-architecture](../../../src/codex/dev/commands/dev-architecture.md) | `2a636b00` | 구조 SSOT 관리 |
| [dev-explore](../../../src/codex/dev/commands/dev-explore.md) | `b3117441` | 코드베이스 탐색 |
| [dev-learn](../../../src/codex/dev/commands/dev-learn.md) | `a37f7415` | 교훈 기록 + 자동화 제안 |
| [dev-refactor](../../../src/codex/dev/commands/dev-refactor.md) | `b46ea8f5` | 구조적 리팩토링 |

## Hooks (3)

| Identity | Hash | 비고 |
|----------|---|------|
| [dev-tdd-guard](../../../src/codex/dev/hooks/dev-tdd-guard.js) | `5fb44fdb` | 테스트 없는 구현 Edit / Write 차단 |
| [dev-db-guard](../../../src/codex/dev/hooks/dev-db-guard.js) | `993f96f4` | 위험한 DB Bash 명령 차단 |
| [dev-feature-scope-guard](../../../src/codex/dev/hooks/dev-feature-scope-guard.js) | `ac116f15` | Feature Package 범위 밖 편집 경고 |

## Rule (1)

| Identity | Hash | 비고 |
|----------|---|------|
| [edit-coordinates-governance](../../../src/codex/dev/rules/edit-coordinates-governance.md) | `4e65ad4c` | dev-architect → dev-doc-updater 체이닝 JSON 스키마 거버넌스 (IMP-KIT-011) |

## Skills (15)

dev 워크플로우의 구체적 절차와 패턴을 담는 디렉토리 기반 skill 15개:

### 워크플로우 핵심

| Identity | Hash | 비고 |
|----------|---|------|
| [dev-workflow](../../../src/codex/dev/skills/dev-workflow/SKILL.md) | `cda3617d` | Feature Package TASK TDD 구현 |
| [dev-feature-plan](../../../src/codex/dev/skills/dev-feature-plan/SKILL.md) | `160c561d` | PRD → Feature Package 전환 |
| [dev-tdd-workflow](../../../src/codex/dev/skills/dev-tdd-workflow/SKILL.md) | `9fef5079` | TDD Red-Green-Refactor |
| [dev-refactoring](../../../src/codex/dev/skills/dev-refactoring/SKILL.md) | `859e145b` | 안전한 리팩토링 절차 |

### 아키텍처

| Identity | Hash | 비고 |
|----------|---|------|
| [dev-architecture-decision](../../../src/codex/dev/skills/dev-architecture-decision/SKILL.md) | `369aebda` | 구조 감지 및 추천 |
| [dev-layered-architecture](../../../src/codex/dev/skills/dev-layered-architecture/SKILL.md) | `3e4ab7e5` | 구조 SSOT 해석 (hexagonal / clean / service-module / minimal-layered) |
| [dev-domain-modeling](../../../src/codex/dev/skills/dev-domain-modeling/SKILL.md) | `d3668cc5` | Rich Domain Model 설계 |
| [dev-feature-module](../../../src/codex/dev/skills/dev-feature-module/SKILL.md) | `67428a48` | 기능 구현 단위 배치 |
| [dev-frontend-patterns](../../../src/codex/dev/skills/dev-frontend-patterns/SKILL.md) | `77d7c463` | 프론트엔드 UI 패턴 / 상태 관리 |
| [dev-observability](../../../src/codex/dev/skills/dev-observability/SKILL.md) | `39d11dd6` | 구조화 로깅 / 에러 추적 / 메트릭 |

### 테스트

| Identity | Hash | 비고 |
|----------|---|------|
| [dev-testing-backend](../../../src/codex/dev/skills/dev-testing-backend/SKILL.md) | `e26cc040` | 백엔드 레이어별 테스트 전략 |
| [dev-testing-frontend](../../../src/codex/dev/skills/dev-testing-frontend/SKILL.md) | `aebe1e29` | 컴포넌트 / 훅 / 페이지 테스트 |
| [dev-testing-e2e](../../../src/codex/dev/skills/dev-testing-e2e/SKILL.md) | `d8326d24` | Playwright E2E 테스트 |
| [dev-verification-engine](../../../src/codex/dev/skills/dev-verification-engine/SKILL.md) | `39ef8053` | 서브에이전트 fresh-context 검증 루프 |

### 보안

| Identity | Hash | 비고 |
|----------|---|------|
| [dev-security-pipeline](../../../src/codex/dev/skills/dev-security-pipeline/SKILL.md) | `db16a38c` | CWE Top 25 + STRIDE 자동 검증 |

## 변환 시 주의사항

- **write-capable agent 5개**: dev 도메인에서 REVIEW NEEDED marker 가 붙은 유일한 케이스. Codex runtime 의 tool 권한 모델이 Claude Code 와 동등한지 확인해야 함.
- **dev-tdd-guard**: TDD 강제 hook. 이 훅이 동작하지 않으면 "테스트 없는 구현" 방지 기능이 사라지므로 Codex runtime 에서 PreToolUse 매칭 동작 우선 확인 필요.
- **commands 21개 중 `> 참조:` 블록을 가진 6개**: dev-feature, dev-refactor, dev-review, dev-run, dev-test-verify, dev-verify-fe — 그 중 5개가 **dead reference** (C8 감사). Claude 원본에서부터 `dev-` 접두사가 누락된 상태 ([10 Known Issues](10-known-issues.md) 참조).

## Claude 원본과의 비교

모든 47 entries 가 Claude 원본과 **1:1 대응**:

```
Claude:  src/claude/dev/{type}/{name}{.md|.js}
Codex:   src/codex/dev/{type}/{name}{.md|.js}
```

## 참조

- [07 REVIEW NEEDED Catalog](07-review-needed-catalog.md) — write-capable agent 5개 상세 검토 가이드
- [10 Known Issues](10-known-issues.md) — dev command 5개 dead reference
