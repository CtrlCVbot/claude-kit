# Claude Feature Baseline

> Claude 기능 전체를 공식 Claude Code 기준과 현재 저장소 기준으로 동시에 정리하는 기준 문서

## 단계 위치

- 실행 단계: `1단계`
- 선행 조건: 없음
- 후속 문서: `09`, `10`

## 목적

Codex 전환 설계를 시작하기 전에, 현재 `src/claude`에 어떤 기능이 실제로 존재하는지 빠짐없이 파악한다. 이 문서는 `agents`만이 아니라 Claude Code의 공식 기능 surface와 저장소 내부 authoring 자산 전체를 함께 본다.

## 공식 Claude 기능 기준

이 문서에서 Claude 기능은 아래 범위를 포함한다.

- `subagents`
- `skills`
- `custom commands`
- `hooks`
- `memory / instructions`
- `settings / permissions`

## 저장소 자산 맵핑

현재 저장소에서는 위 기능을 아래처럼 해석한다.

| 공식 기능 | 저장소 자산 |
|------|------|
| subagents | `src/claude/*/agents/*.md` |
| skills | `src/claude/*/skills/**/SKILL.md` |
| custom commands | `src/claude/*/commands/*.md` |
| hooks | `src/claude/*/hooks/*.js` + `.claude/settings.json` |
| memory / instructions | `CLAUDE.md` 또는 후속 instruction surface |
| settings / permissions | `.claude/settings.json` |
| 공통 guidance | `src/claude/core/rules/*.md` |

## 현재 인벤토리 기준선

### core

- agents: 없음
- commands: 없음
- hooks: 5개
- rules: 6개
- skills: 2개

### dev

- agents: 6개
- commands: 21개
- hooks: 3개
- skills: 15개

### plan

- agents: 6개
- commands: 10개
- hooks: 1개
- skills: 8개

## 전체 수량 요약

| domain | agents | commands | hooks | rules | skills | subtotal |
|------|--------|----------|------|------|--------|----------|
| `core` | 0 | 0 | 5 | 6 | 2 | 13 |
| `dev` | 6 | 21 | 3 | 0 | 15 | 45 |
| `plan` | 6 | 10 | 1 | 0 | 8 | 25 |
| total | 12 | 31 | 9 | 6 | 25 | 83 |

## 집계 규칙

- 이 문서의 수량은 “파일 수”가 아니라 “기능 자산 수”를 센다.
- `agents`, `commands`, `rules`, `hooks`는 실행 또는 지침 자산 파일 기준으로 센다.
- `skills`는 `SKILL.md`를 가진 skill 디렉터리 1개를 기능 1개로 센다.
- `package.json`, helper asset, example file 같은 보조 파일은 집계에서 제외한다.
- hook source 수와 settings 등록 수는 다를 수 있으므로 별도 상태로 기록한다.

## 현재 runtime / 운영 surface 상태

| surface | 현재 상태 | 메모 |
|------|-----------|------|
| `.claude/settings.json` | 존재 | permissions + hooks 등록 포함 |
| `CLAUDE.md` | 없음 | memory / instruction surface는 아직 부재 |
| `.claude/rules/` | 없음 | 공통 guidance는 `src/claude/core/rules`에만 존재 |
| 등록된 hook source | 8개 | `dev-feature-scope-guard`는 source는 있으나 현재 settings 미등록 |
| `src/codex` 자산 | 없음 | `.gitkeep`만 존재 |
| `pairing-registry` | 존재 | `entries` 비어 있음 |

## 현재 baseline 사실

- `src/codex`에는 아직 `.gitkeep` 외 실제 자산이 없다.
- `src/pairing-registry.json`은 존재하지만 `entries`는 비어 있다.
- 저장소 루트 `CLAUDE.md`는 현재 없다.
- 따라서 이 단계는 migration이 아니라 **현황 파악과 분류 기준 확정** 단계다.

## 이 문서의 카탈로그 계약

1단계 baseline은 “전수 조사 + 공통 분류” 단계이므로, 각 Claude 기능은 아래 최소 컬럼으로 정리한다.

| 컬럼 | 설명 |
|------|------|
| 기능 identity | 도메인 접두사를 포함한 이름 |
| domain | `core`, `dev`, `plan` |
| source kind | `agent`, `command`, `skill`, `hook`, `instruction-rule` |
| source path | `src/claude/...` 실제 경로 |
| 역할 | 이 기능이 해결하는 작업 |
| 호출/트리거 방식 | 명시 호출, hook, background, 지침 등 |
| tool 범위 | read-only / write / monitor |
| 상태 메모 | runtime 등록 상태, shared 성격, 후속 판단 메모 |

아래 상세 항목은 1단계에서 전수 강제하지 않고, `10`, `11`, `12`에서 기능별로 확정한다.

- 입력 계약
- 출력 계약
- Claude 전용 문법
- Codex 대응 필요 여부

단, 다음 단계 판단에 직접 영향을 주는 정보는 1단계에서도 `상태 메모`에 미리 남긴다.

## 실행 체크리스트

1. `src/claude/core`, `src/claude/dev`, `src/claude/plan`의 모든 자산을 수집한다.
2. `agents`만이 아니라 `commands`, `skills`, `hooks`, `core/rules`를 같은 표에 넣는다.
3. 기능 identity가 중복되는 자산이 있는지 확인한다.
4. 각 자산의 역할과 trigger를 guide 문서 해석과 연결할 준비를 한다.
5. 집계 규칙이 수량 표와 일관되게 재현되는지 교차 확인한다.
6. Codex 대응 판단은 임시 메모만 남기고, 최종 결정은 `10`, `11`에서 한다.

## 산출물

- Claude 기능 카탈로그 1개
- source kind 분류표 1개
- 집계 규칙 1개
- 미분류 항목 목록 1개

## 완료 기준

- 모든 Claude 기능이 `agent`, `command`, `skill`, `hook`, `instruction-rule` 중 하나로 분류된다.
- `core`가 공통 기능 계층으로 설명되고, “Claude 기능이 없는 영역”처럼 쓰이지 않는다.
- 수량 표가 집계 규칙과 일관되게 재현 가능하다.
- 각 전수 표가 최소 카탈로그 계약인 `identity / domain / source kind / source path / 역할 / trigger / tool 범위 / 상태 메모`를 충족한다.
- 이후 문서가 baseline 사실을 다시 조사하지 않고 이 문서를 참조할 수 있다.

## 핵심 해석 규칙

- `core`는 “Claude 기능이 없는 영역”이 아니라 공통 hook/rule/skill 계층이다.
- `rules`는 현재 저장소에서 공통 instruction/guidance 자산으로 취급한다.
- `commands`는 저장소 authoring 기준으로 유지하되, Codex 전환 시에는 Claude 공식 기능과 동일 surface라고 가정하지 않는다.
- 이후 문서들은 이 baseline을 기준으로만 Claude 기능을 분류한다.

## 전수 카탈로그

### core hooks

| identity | source path | 역할 | trigger | tool 범위 | 상태 메모 |
|------|-------------|------|---------|----------|----------|
| `code-quality-reminder` | `src/claude/core/hooks/code-quality-reminder.js` | 편집 후 코드 품질 점검 리마인드 | `PostToolUse(Edit\|Write)` | guard / reminder | settings 등록됨 |
| `edit-tracker` | `src/claude/core/hooks/edit-tracker.js` | 편집 파일 로그 기록 | `PostToolUse(Edit\|Write)` | observe / log | settings 등록됨 |
| `output-secret-filter` | `src/claude/core/hooks/output-secret-filter.js` | 출력 시 시크릿 필터링 | `PostToolUse(*)` | observe / filter | settings 등록됨 |
| `security-auto-trigger` | `src/claude/core/hooks/security-auto-trigger.js` | 보안 검토 자동 트리거 | `PostToolUse(Edit\|Write)` | observe / trigger | settings 등록됨 |
| `session-wrap-suggest` | `src/claude/core/hooks/session-wrap-suggest.js` | 세션 종료 시 정리 제안 | `Stop` | observe / suggest | settings 등록됨 |

### core rules

| identity | source path | 역할 | trigger | 범위 | 상태 메모 |
|------|-------------|------|---------|------|----------|
| `coding-style` | `src/claude/core/rules/coding-style.md` | 불변성, 파일 조직, 코딩 스타일 기준 | 항상 적용되는 guidance | instruction-rule | 공통 규칙 |
| `date-calculation` | `src/claude/core/rules/date-calculation.md` | 날짜/시간 계산 시 도구 사용 강제 | 항상 적용되는 guidance | instruction-rule | 공통 규칙 |
| `golden-principles` | `src/claude/core/rules/golden-principles.md` | 클린 코드 기본 원칙 | 항상 적용되는 guidance | instruction-rule | 공통 규칙 |
| `interaction` | `src/claude/core/rules/interaction.md` | 모호성 처리와 상호작용 원칙 | 항상 적용되는 guidance | instruction-rule | 공통 규칙 |
| `security` | `src/claude/core/rules/security.md` | 보안 검증 원칙 | 항상 적용되는 guidance | instruction-rule | 공통 규칙 |
| `verification` | `src/claude/core/rules/verification.md` | evidence-based completion과 검증 규칙 | 항상 적용되는 guidance | instruction-rule | 공통 규칙 |

### core skills

| identity | source path | 역할 | trigger | tool 범위 | 상태 메모 |
|------|-------------|------|---------|----------|----------|
| `continuous-learning-v2` | `src/claude/core/skills/continuous-learning/SKILL.md` | 세션 관찰 → instinct → skill/command/agent 진화 | hook 기반 학습/자동화 흐름 | orchestration | commands/agents 진화 언급 |
| `session-wrap` | `src/claude/core/skills/session-wrap/SKILL.md` | 세션 종료 정리, 병렬 subagent 오케스트레이션 | `/session-wrap`, 세션 종료 | orchestration | 4개 병렬 subagent + 1개 검증 subagent |

### dev agents

| identity | source path | 역할 | trigger | tool 범위 | 상태 메모 |
|------|-------------|------|---------|----------|----------|
| `dev-architect` | `src/claude/dev/agents/dev-architect.md` | 시스템 설계, 아키텍처 진단, 구조 권고 | 새 기능 기획, 대규모 리팩토링, 설계 검토 | read-only | `Read/Grep/Glob` |
| `dev-code-reviewer` | `src/claude/dev/agents/dev-code-reviewer.md` | 코드 품질/보안/유지보수성 리뷰 | 코드 변경 직후, 리뷰 요청 | read-heavy | `Read/Grep/Glob/Bash` |
| `dev-database-reviewer` | `src/claude/dev/agents/dev-database-reviewer.md` | PostgreSQL 스키마/쿼리/성능/보안 검토 | SQL, 마이그레이션, DB 성능 문제 | write-capable | `Read/Write/Edit/Bash/Grep/Glob` |
| `dev-doc-updater` | `src/claude/dev/agents/dev-doc-updater.md` | 코드맵/README/가이드 문서 갱신 | 문서 동기화, codemap 업데이트 | write-capable | docs/CODEMAPS, README, guide 갱신 |
| `dev-security-reviewer` | `src/claude/dev/agents/dev-security-reviewer.md` | 시크릿, SSRF, 인젝션 등 보안 취약점 탐지/수정 | 인증/API/민감 데이터 변경 후 | write-capable | OWASP Top 10 성격 |
| `dev-verify-agent` | `src/claude/dev/agents/dev-verify-agent.md` | fresh-context 검증 파이프라인 실행 | 빌드/타입/린트/테스트 검증 | write-capable | verification subagent |

### dev commands

| identity | source path | 역할 | trigger | tool 범위 | 상태 메모 |
|------|-------------|------|---------|----------|----------|
| `dev-architecture` | `src/claude/dev/commands/dev-architecture.md` | 구조 감지/추천 + architecture SSOT 생성 | `/dev-architecture` | workflow-defined | 구조 SSOT와 binding 생성 |
| `dev-build-fix` | `src/claude/dev/commands/dev-build-fix.md` | 빌드 에러 자동 수정 | `/dev-build-fix` | write / build-fix | 재빌드 루프 포함 |
| `dev-checkpoint` | `src/claude/dev/commands/dev-checkpoint.md` | 작업 상태 저장/복원 | `/dev-checkpoint` | write / filesystem | git + mkdir/rm/cp 사용 |
| `dev-commit-push-pr` | `src/claude/dev/commands/dev-commit-push-pr.md` | 검증 후 커밋, PR, 머지, 알림 | `/dev-commit-push-pr` | repo ops | `git`, `gh` 포함 |
| `dev-commit` | `src/claude/dev/commands/dev-commit.md` | 커밋 메시지 생성과 커밋 | `/dev-commit` | repo ops | Conventional Commits |
| `dev-continue` | `src/claude/dev/commands/dev-continue.md` | 이전 세션 작업 재개 | `/dev-continue` | workflow / resume | `.plans`, git status 기반 |
| `dev-explore` | `src/claude/dev/commands/dev-explore.md` | 코드베이스 탐색 | `/dev-explore` | read-heavy | 반복 정제 탐색 |
| `dev-feature` | `src/claude/dev/commands/dev-feature.md` | PRD를 Feature Overview/Package로 전환 | `/dev-feature` | workflow / planning bridge | feature package 생성 |
| `dev-handoff-verify` | `src/claude/dev/commands/dev-handoff-verify.md` | handoff + 빌드/테스트/린트 통합 검증 | `/dev-handoff-verify` | orchestration / write | `Task` 기반 fresh context |
| `dev-learn` | `src/claude/dev/commands/dev-learn.md` | 교훈 기록과 자동화 제안 | `/dev-learn` | write / learning | suggestion 통합 |
| `dev-plan` | `src/claude/dev/commands/dev-plan.md` | 구현 전 계획 수립 | `/dev-plan` | planning / approval gate | planner agent 호출 |
| `dev-refactor` | `src/claude/dev/commands/dev-refactor.md` | 구조적 리팩토링 | `/dev-refactor` | write workflow | 테스트 안전망 강조 |
| `dev-review` | `src/claude/dev/commands/dev-review.md` | 아키텍처 규칙 준수 리뷰 | `/dev-review` | review | 레이어 규칙 중심 |
| `dev-run` | `src/claude/dev/commands/dev-run.md` | Feature Package TASK 구현 | `/dev-run` | write workflow | TDD 구현 루프 |
| `dev-security-review` | `src/claude/dev/commands/dev-security-review.md` | CWE/STRIDE 보안 검토 | `/dev-security-review` | review / analysis | effort:max 강제 |
| `dev-sync-docs` | `src/claude/dev/commands/dev-sync-docs.md` | prompt/spec/CLAUDE/rules 문서 동기화 | `/dev-sync-docs` | write / docs | docs sync |
| `dev-sync` | `src/claude/dev/commands/dev-sync.md` | git pull + 문서 동기화 | `/dev-sync` | repo ops / docs | sync-docs 래퍼 |
| `dev-test-verify` | `src/claude/dev/commands/dev-test-verify.md` | 백엔드 테스트 품질 검증 | `/dev-test-verify` | review / verification | test quality |
| `dev-verify-all` | `src/claude/dev/commands/dev-verify-all.md` | 백엔드+프론트엔드 통합 검증 | `/dev-verify-all` | orchestration / verification | verify 합성 |
| `dev-verify-fe` | `src/claude/dev/commands/dev-verify-fe.md` | 프론트엔드 테스트 품질 검증 | `/dev-verify-fe` | review / verification | frontend testing |
| `dev-verify` | `src/claude/dev/commands/dev-verify.md` | Feature Package 구현 검증 | `/dev-verify` | verification | DVC 기반 |

### dev hooks

| identity | source path | 역할 | trigger | tool 범위 | 상태 메모 |
|------|-------------|------|---------|----------|----------|
| `dev-db-guard` | `src/claude/dev/hooks/dev-db-guard.js` | DB 관련 명령 보호/검증 | `PreToolUse(Bash)` | blocking guard | settings 등록됨 |
| `dev-feature-scope-guard` | `src/claude/dev/hooks/dev-feature-scope-guard.js` | feature scope 벗어난 변경 차단 | 미등록 | blocking guard | source 존재, 현재 settings 미등록 |
| `dev-tdd-guard` | `src/claude/dev/hooks/dev-tdd-guard.js` | 테스트 없이 편집 차단 | `PreToolUse(Edit\|Write)` | blocking guard | settings 등록됨 |

### dev skills

| identity | source path | 역할 | trigger | tool 범위 | 상태 메모 |
|------|-------------|------|---------|----------|----------|
| `dev-architecture-decision` | `src/claude/dev/skills/dev-architecture-decision/SKILL.md` | 구조 SSOT와 feature binding 해석 | `/dev-architecture`, `/plan-bridge`, `/dev-feature` | guidance / workflow | 구조 기준 |
| `dev-domain-modeling` | `src/claude/dev/skills/dev-domain-modeling/SKILL.md` | rich domain model 설계 패턴 | domain modeling 시 | guidance | entity/value object/state machine |
| `dev-feature-module` | `src/claude/dev/skills/dev-feature-module/SKILL.md` | 기능 구현 단위 배치 규칙 | feature 구현 시 | guidance | 구조 계약 기반 |
| `dev-feature-plan` | `src/claude/dev/skills/dev-feature-plan/SKILL.md` | PRD → Feature Overview/Package 전환 | `/dev-feature` | workflow | package generation |
| `dev-frontend-patterns` | `src/claude/dev/skills/dev-frontend-patterns/SKILL.md` | 프론트엔드 UI/상태 관리 패턴 | FE 작업 시 | guidance | frontend patterns |
| `dev-layered-architecture` | `src/claude/dev/skills/dev-layered-architecture/SKILL.md` | layered/hexagonal 구조 규칙 해석 | 아키텍처 검토 시 | guidance | 구조 SSOT 해석 |
| `dev-observability` | `src/claude/dev/skills/dev-observability/SKILL.md` | 로그/에러/메트릭 패턴 | observability 작업 시 | guidance | observability |
| `dev-refactoring` | `src/claude/dev/skills/dev-refactoring/SKILL.md` | 안전한 리팩토링 절차 | `/dev-refactor` | workflow | 테스트 안전망 |
| `dev-security-pipeline` | `src/claude/dev/skills/dev-security-pipeline/SKILL.md` | CWE Top 25 + STRIDE 보안 파이프라인 | security review 시 | workflow | 보안 검증 엔진 |
| `dev-tdd-workflow` | `src/claude/dev/skills/dev-tdd-workflow/SKILL.md` | TDD red-green-refactor 루프 | 테스트 주도 개발 시 | workflow | tdd-guard 연계 |
| `dev-testing-backend` | `src/claude/dev/skills/dev-testing-backend/SKILL.md` | 백엔드 테스트 전략 | backend test design | guidance | testing |
| `dev-testing-e2e` | `src/claude/dev/skills/dev-testing-e2e/SKILL.md` | Playwright E2E 테스트 패턴 | e2e test 작성 시 | guidance | e2e |
| `dev-testing-frontend` | `src/claude/dev/skills/dev-testing-frontend/SKILL.md` | 프론트엔드 테스트 전략 | frontend test design | guidance | testing |
| `dev-verification-engine` | `src/claude/dev/skills/dev-verification-engine/SKILL.md` | fresh-context 기반 통합 검증 엔진 | verify workflow 시 | orchestration | subagent 기반 |
| `dev-workflow` | `src/claude/dev/skills/dev-workflow/SKILL.md` | Feature Package TASK 구현 워크플로우 | `/dev-run` | workflow | TDD implementation loop |

### plan agents

| identity | source path | 역할 | trigger | tool 범위 | 상태 메모 |
|------|-------------|------|---------|----------|----------|
| `plan-idea-collector` | `src/claude/plan/agents/plan-idea-collector.md` | 아이디어 수집/구조화/등록 | `/plan-idea` 등록 시 | write-capable | inbox + backlog 갱신 |
| `plan-idea-screener` | `src/claude/plan/agents/plan-idea-screener.md` | RICE 기반 스크리닝과 상태 제안 | `/plan-screen` | write-capable | `approved`는 사용자 승인 후 |
| `plan-prd-writer` | `src/claude/plan/agents/plan-prd-writer.md` | 10개 섹션 PRD 자동 작성 | `/plan-prd` | write-capable | PRD authoring |
| `plan-reviewer` | `src/claude/plan/agents/plan-reviewer.md` | 기획 산출물 품질 리뷰와 PCC 검증 | `/plan-review` | read-only | PASS/WARN/FAIL 판정 |
| `plan-stitch-integrator` | `src/claude/plan/agents/plan-stitch-integrator.md` | PRD + Wireframe 통합과 매핑 검증 | `/plan-stitch` | write-capable | mapping / stitching |
| `plan-wireframe-designer` | `src/claude/plan/agents/plan-wireframe-designer.md` | ASCII + Mermaid 와이어프레임 설계 | `/plan-wireframe` | write-capable | UX 설계 |

### plan commands

| identity | source path | 역할 | trigger | tool 범위 | 상태 메모 |
|------|-------------|------|---------|----------|----------|
| `plan-archive` | `src/claude/plan/commands/plan-archive.md` | 완료 기능 아카이빙 | `/plan-archive` | workflow / write | archive bundle 생성 |
| `plan-bridge` | `src/claude/plan/commands/plan-bridge.md` | 기획 → 개발 브리지 컨텍스트 확인 | `/plan-bridge` | workflow | handoff gate |
| `plan-draft` | `src/claude/plan/commands/plan-draft.md` | 아이디어 기반 first-pass 기획 | `/plan-draft` | workflow / write | Lite/Standard 판정 |
| `plan-idea` | `src/claude/plan/commands/plan-idea.md` | 아이디어 등록/조회/관리 | `/plan-idea` | workflow / write | collector agent 스폰 |
| `plan-improve` | `src/claude/plan/commands/plan-improve.md` | 아카이브 기능 개선 요청 등록/분석 | `/plan-improve` | workflow / write | archive 연계 |
| `plan-prd` | `src/claude/plan/commands/plan-prd.md` | 상세 PRD 작성 | `/plan-prd` | workflow / write | PRD writer agent 스폰 |
| `plan-review` | `src/claude/plan/commands/plan-review.md` | 산출물 리뷰와 PCC 검증 | `/plan-review` | review | reviewer agent 스폰 |
| `plan-screen` | `src/claude/plan/commands/plan-screen.md` | 아이디어 스크리닝 실행 | `/plan-screen` | workflow / write | Go/Hold/Kill 제안 |
| `plan-stitch` | `src/claude/plan/commands/plan-stitch.md` | PRD + Wireframe 통합 | `/plan-stitch` | workflow / write | stitch integrator |
| `plan-wireframe` | `src/claude/plan/commands/plan-wireframe.md` | 와이어프레임 생성 | `/plan-wireframe` | workflow / write | wireframe designer |

### plan hooks

| identity | source path | 역할 | trigger | tool 범위 | 상태 메모 |
|------|-------------|------|---------|----------|----------|
| `plan-doc-guard` | `src/claude/plan/hooks/plan-doc-guard.js` | 기획 문서 구조/형식 검증과 코드 편집 차단 | `PreToolUse(Edit\|Write)` | blocking guard | settings 등록됨 |

### plan skills

| identity | source path | 역할 | trigger | tool 범위 | 상태 메모 |
|------|-------------|------|---------|----------|----------|
| `plan-archive-workflow` | `src/claude/plan/skills/plan-archive-workflow/SKILL.md` | 아카이빙 워크플로우 | archive 작업 시 | workflow | archive bundle |
| `plan-idea-management` | `src/claude/plan/skills/plan-idea-management/SKILL.md` | 아이디어 수집/분류/태깅/우선순위 | idea management 시 | workflow | backlog 관리 |
| `plan-pipeline` | `src/claude/plan/skills/plan-pipeline/SKILL.md` | P1~P7 전체 기획 파이프라인 오케스트레이션 | full planning pipeline | orchestration | end-to-end plan |
| `plan-prd-authoring` | `src/claude/plan/skills/plan-prd-authoring/SKILL.md` | PRD 작성 표준과 품질 기준 | PRD 작성 시 | guidance | PRD criteria |
| `plan-review-criteria` | `src/claude/plan/skills/plan-review-criteria/SKILL.md` | 리뷰 기준과 PCC 체크리스트 | review 시 | guidance | PCC |
| `plan-screening-workflow` | `src/claude/plan/skills/plan-screening-workflow/SKILL.md` | 스크리닝 평가/판정 로직 | screening 시 | workflow | RICE 기준 |
| `plan-stitch-workflow` | `src/claude/plan/skills/plan-stitch-workflow/SKILL.md` | PRD + Wireframe + HTML 통합 규칙 | stitch 시 | workflow | mapping |
| `plan-wireframe-design` | `src/claude/plan/skills/plan-wireframe-design/SKILL.md` | 와이어프레임 설계 원칙 | wireframe design 시 | guidance | ASCII / Mermaid |

## 1단계 리뷰 노트

### 확인된 강점

- `core`는 hooks, rules, skills로 구성된 공통 기능 계층으로 명확히 존재한다.
- `dev`와 `plan`은 각각 `agent + command + skill + hook` 조합으로 workflow가 잘 나뉘어 있다.
- `plan` 도메인은 command가 agent를 스폰하고, skill이 기준을 제공하는 형태로 구조가 일관적이다.
- `dev` 도메인은 구조/검증/보안/문서 동기화까지 폭넓은 workflow를 이미 갖추고 있다.

### 현재 드러난 기준선 이슈

- `CLAUDE.md`가 없어 memory / instruction surface는 문서상만 존재하고 실제 파일은 없다.
- `dev-feature-scope-guard`는 source는 존재하지만 현재 `.claude/settings.json`에는 등록되지 않았다.
- `commands`는 저장소에서 중요한 authoring 자산이지만, Codex 전환 시 direct copy 대상이 아니라 재표현 대상이다.
- `rules`는 runtime 폴더 자산이 아니라 공통 guidance 자산으로 보는 편이 현재 구조에 맞다.

## 다음 문서

- guide 정렬: [09-guide-alignment-audit.md](./09-guide-alignment-audit.md)
- Codex 매핑: [10-claude-to-codex-surface-mapping.md](./10-claude-to-codex-surface-mapping.md)
