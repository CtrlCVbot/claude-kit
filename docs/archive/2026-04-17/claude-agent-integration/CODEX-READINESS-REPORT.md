# Codex 전환 준비 분석 리포트

- 생성일: 2026-04-16
- 생성 도구: `/kit-analyze`
- 분석 범위: `src/claude/{core,dev,plan,copy}/` 전체
- 브랜치: `feat/copy-domain`

## 1. 요약

| 전략 | 컴포넌트 수 | 비율 | 설명 |
|------|------------|------|------|
| paired-direct | 8 | 7.8% | 즉시 전환 가능 |
| paired-fallback | 0 | 0.0% | - |
| paired-review | 26 | 25.5% | 검토 후 전환 (copy 도메인 전체) |
| blocked | 68 | 66.7% | dev/plan 도메인 추가 분석 필요 |
| **전체** | **102** | **100%** | |

## 2. 도메인별

| 도메인 | 전체 | paired | unpaired | 구성 |
|--------|------|--------|----------|------|
| core | 6 | 6 | 0 | hook(4), skill(2) |
| dev | 45 | 45 | 0 | agent(6), command(21), hook(3), skill(15) |
| plan | 25 | 25 | 0 | agent(6), command(10), hook(1), skill(8) |
| copy | 26 | 0 | 26 | agent(4), command(7), hook(5), rule(5), skill(5) |

## 3. 타입별 (4-tier)

| 타입 | 전체 | paired-direct | paired-fallback | paired-review | blocked |
|------|------|---------------|-----------------|---------------|---------|
| agent | 16 | 0 | 0 | 4 | 12 |
| command | 38 | 0 | 0 | 7 | 31 |
| hook | 13 | 8 | 0 | 5 | 0 |
| rule | 11 | 0 | 0 | 5 | 6 |
| skill | 24 | 0 | 0 | 5 | 19 |

## 4. copy 도메인 상세 (26 컴포넌트)

모든 copy 컴포넌트는 `paired-review` / `unpaired` / evidenceLevel `추정` 상태다.

### 4.1 에이전트 (4개)

| Identity | Tools | OfficialSurface | 비고 |
|----------|-------|-----------------|------|
| copy-fidelity | Read, Glob, Grep, Bash | subagents | RO |
| copy-interaction-fidelity | Read, Glob, Grep, Bash | subagents | RO |
| copy-qa-reviewer | Read, Glob, Grep, Bash | subagents | RO |
| copy-reference-baseline | Read, Glob, Grep, Bash, **Write** | subagents | WR (review) |

### 4.2 커맨드 (7개)

| Identity | OfficialSurface | 비고 |
|----------|-----------------|------|
| copy-reference-refresh | cli | manifest 생성 |
| copy-visual-review | cli | VF-* rows |
| copy-interaction-review | cli | IF-* rows |
| copy-gap-board | cli | 우선순위 통합 |
| copy-plan-unit | cli | 시나리오 C 전용 |
| copy-verify | cli | QA 검증 |
| copy-closeout | cli | 승인/잔여 리스크 |

### 4.3 훅 (5개)

| Identity | Event | OfficialSurface | 비고 |
|----------|-------|-----------------|------|
| copy-evidence-reminder | PostToolUse Edit\|Write | hooks | reminder |
| copy-doc-drift-check | PostToolUse Edit\|Write | hooks | reminder |
| copy-scope-guard | PreToolUse Edit\|Write | hooks | reminder (→blocking 전환 가능) |
| copy-variant-env-guard | PostToolUse Edit\|Write | hooks | reminder |
| copy-gate-stop | Stop | hooks.stop | 비활성 (exit 0) |

### 4.4 룰 (5개)

| Identity | OfficialSurface | FallbackTarget | 비고 |
|----------|-----------------|----------------|------|
| copy-fidelity-rule | agents_md | agents-guidance | AGENTS.md merge 예정 |
| copy-evidence-rule | agents_md | agents-guidance | AGENTS.md merge 예정 |
| copy-gates-rule | agents_md | agents-guidance | AGENTS.md merge 예정 |
| copy-commands-rule | agents_md | agents-guidance | AGENTS.md merge 예정 |
| copy-variant-rule | agents_md | agents-guidance | AGENTS.md merge 예정 |

### 4.5 스킬 (5개)

| Identity | OfficialSurface | 비고 |
|----------|-----------------|------|
| copy-pipeline | skills | 파이프라인 전체 가이드 |
| copy-evidence-management | skills | evidence/manifest 관리 |
| copy-gap-analysis | skills | 갭 분석 워크플로우 |
| copy-qa-workflow | skills | QA 검증 파이프라인 |
| copy-closeout-workflow | skills | closeout 프로세스 |

## 5. paired-direct 컴포넌트 (8개, 즉시 전환 가능)

모두 hook 타입. Codex Hooks API 기반으로 동작 확인됨.

| Identity | Domain | Event | 비고 |
|----------|--------|-------|------|
| output-secret-filter | core | PostToolUse * | EX-002 |
| edit-tracker | core | PostToolUse Edit\|Write | |
| code-quality-reminder | core | PostToolUse Edit\|Write | Edit\|Write 매처 Codex 미동작 주의 |
| security-auto-trigger | core | PostToolUse Edit\|Write | Edit\|Write 매처 Codex 미동작 주의 |
| dev-db-guard | dev | PreToolUse Bash | Bash 매처 공식 보장 |
| dev-tdd-guard | dev | PreToolUse Edit\|Write | Edit\|Write 매처 Codex 미동작 주의 |
| dev-feature-scope-guard | dev | PreToolUse Edit\|Write | Edit\|Write 매처 Codex 미동작 주의 |
| plan-doc-guard | plan | PreToolUse Edit\|Write | Edit\|Write 매처 Codex 미동작 주의 |

## 6. 주요 발견

| # | 발견 | 영향 | 조치 |
|---|------|------|------|
| 1 | copy 도메인 26개 전부 unpaired | Codex에서 copy 워크플로우 미사용 | Codex 포팅 시 paired-review → paired-direct 전환 |
| 2 | Edit\|Write 매처 hook이 Codex에서 미동작 | 6개 hook이 Codex에서 실질적으로 비활성 | Bash 매처로 대체하거나 Codex API 확인 필요 |
| 3 | core rules 6개가 blocked 상태 | AGENTS.md merge 패턴으로 전환 필요 | EX-003~008 패턴 참조 |
| 4 | copy rules 5개 → paired-review | AGENTS.md 통합 시 paired-fallback 전환 예정 | 기존 core rules 전환 패턴 재사용 |
| 5 | dev/plan 68개가 blocked | 대량 전환 작업 필요 | 별도 포팅 계획 수립 |

## 7. 전환 우선순위 제안

| 순서 | 대상 | 수량 | 전략 | 이유 |
|------|------|------|------|------|
| 1 | copy skills | 5 | paired-direct (auto) | 스킬은 구조 동일, 즉시 전환 가능 |
| 2 | copy agents (RO) | 3 | paired-direct (auto) | Write 미포함, 구조 동일 |
| 3 | copy commands | 7 | paired-direct (review) | CLI 표면 통합 검증 필요 |
| 4 | copy rules | 5 | paired-fallback | AGENTS.md merge 패턴 적용 |
| 5 | copy agent (WR) | 1 | paired-direct (review) | Write 도구 포함, 권한 검증 필요 |
| 6 | copy hooks | 5 | paired-review | Codex 런타임 검증 후 결정 |

## 8. 레지스트리 참조

| 레지스트리 | 위치 | copy 항목 |
|-----------|------|----------|
| exception-registry.json | `src/exception-registry.json` | EX-010~014 (hook 5개) |
| pairing-registry.json | `src/pairing-registry.json` | 26개 (status: unpaired) |
| codex-portability.json | `src/claude/_meta/codex-portability.json` | 26개 (strategy: paired-review) |
