# claude-kit

AI 거버넌스 밀키트. TDD 강제 + Hexagonal + Clean Architecture + Rich Domain Model. Claude + Codex 멀티타겟.

## 핵심 원칙
- **TDD 필수**: 테스트 먼저 -> 구현 -> 리팩토링 (dev-tdd-guard.js가 차단)
- **Rich Domain Model** + Hexagonal Architecture
- **축약어 금지**: repository, service (전체 이름)

## 구조
- `apps/` -- 앱 | `packages/` -- 공유 패키지

## Skills
`.claude/skills/`에서 자동 로드. 컨텍스트에 맞는 스킬이 자동 활성화됨.

## Plan 도메인 설정 (다운스트림 프로젝트용 예시)

> 본 claude-kit 자체 레포는 plan 도메인을 활성화해 검증 중이며, 다운스트림 프로젝트는 아래 섹션을 자신의 CLAUDE.md(또는 AGENTS.md)에 맞게 조정해 포함한다.

### 아이디어 스크리닝 프레임워크

`/plan-screen --framework` 플래그 미지정 시 사용할 **기본 프레임워크**를 지정한다.

```markdown
## plan 도메인 기본 설정

- `idea-screening framework`: `rice` | `5axis` (기본: `rice`)
- `idea-screening thresholds` (선택): 프레임워크별 Go/Hold/Kill 임계값 오버라이드
  - RICE: Go ≥ 10.0, Hold 2.0 ~ 10.0, Kill < 2.0 (기본)
  - 5axis: Go ≥ 70, Hold 40 ~ 69, Kill < 40 (기본)
```

**해석 우선순위**: 커맨드 인자 `--framework` → 위 설정값 → `rice` 폴백. 폴백 시 에이전트 출력 첫 줄에 명시적 고지 (`> 프레임워크: RICE (폴백)`).

상세: `src/claude/plan/commands/plan-screen.md` 및 `src/claude/plan/skills/plan-screening-workflow/SKILL.md`.

### Plan 도메인 주요 룰 (SSOT)

- `src/claude/plan/rules/plan-epic-hierarchy.md` — Epic/Feature/Task 3단 계층 SSOT (§5 IDEA vs Feature 상태, T-FSTATE-02)
- `src/claude/plan/rules/rice-lane-weighted-adjustment.md` — RICE Lane 가중 조정 SSOT (T-RICE-01)
- `src/claude/core/rules/agent-file-ownership.md` — 에이전트 파일 소유권 매트릭스 (T-RACE-01, 도메인 간 공유)

### Phase A 피드백 개선 패키지 (진행 중)

- 원본: [`docs/plan/kit-feedback/phase-a-dry-run-20260423/`](docs/plan/kit-feedback/phase-a-dry-run-20260423/)
- 개선 계획: [`docs/plan/kit-feedback/phase-a-improvement-20260423/`](docs/plan/kit-feedback/phase-a-improvement-20260423/) — 18 TASK (Critical 3 + High 5 + Medium 7 + Low 3)
- 반영 현황 (2026-04-23):
  - Step 1 완료: T-RICE-01 · T-RACE-01 · T-FSTATE-02 (문서/룰)
  - Step 2 완료: T-EPMV-02 · T-EPMV-03 (커맨드 정의 + §4-1/§4-2 신설)
  - Step 3 완료: T-EPMV-01 (`epic-advance-rewrite.js` + 13 테스트 PASS)
  - Step 4A 완료: T-RACE-02 (`_read-cache-state.js` + 2 훅 + 27 테스트 PASS)
  - Step 4B 완료: T-FSTATE-01 (`_plan-state-sync-core.js` + `plan-state-sync.js` + 49 테스트 PASS) → **v2.4.1 8/8 완료**
  - Step 5 완료: v2.5.0 7 TASK
    - T-BRDG-02 (`writer-output-format.md` + 8 writer 에이전트 `<Output_Format>` 주입)
    - T-BRDG-01 (plan-bridge-writer `<Lightweight_Principles>` 신설, 00-context 40%+ 감소 목표)
    - T-PCC-01 (plan-reviewer PCC-07/08/09 + plan-review-criteria SKILL PCC 8 종 표)
    - T-TMPL-01 (`templates/phase-roadmap.md` 신규 + `/plan-epic phase generate` 서브커맨드)
    - T-SHOW-01 (`/plan-epic show` 집약 출력 + list `--status=active` 확장)
    - T-SHOW-02 (`writer-output-format.md §2-1` Phase 진행률 블록 표준)
    - T-REVP-01 (`checkpoint-policy.md §8` 수정 요청 표준 응답 + `/plan-revise` 커맨드 + plan-pipeline SKILL §수정 요청 처리)
  - Step 6 완료: Backlog 3 TASK (v2.6.0+ 승격 대비 선행 구현)
    - T-BKLG-01 (`_change-history-core.js` + 20 테스트 PASS + `post-edit-history.js` stub, `CLAUDE_ENABLE_POST_EDIT_HISTORY=1` 로 활성)
    - T-BKLG-02 (`dry-run-mode.md` 공통 규칙 + `/plan-epic` / `/plan-idea` `--dry-run` 플래그 정의)
    - T-BKLG-03 (`templates/implementation-hints.md` §5-A/B/C 구조 + `agent-file-ownership.md` 확장)
  - **Phase A 피드백 패키지 18/18 반영 완료** 🎉

<!-- kit:managed:start -->
## claude-kit 활성 구성

- domains: core, dev, plan, copy | targets: claude, codex | version: 2.4.0-beta.1
- Kit 관리 영역. 아래 섹션들은 `pnpm install` (또는 `pnpm update claude-kit`) 실행 시 `postinstall` 훅을 통해 재생성된다. 직접 편집 지양.

## core 도메인

- **에이전트 텔레메트리 (v2.3.1, IMP-AGENT-009)**: `~/.claude/logs/agent-telemetry.jsonl` 에 호출·완료·실패 이벤트 기록. 로컬 전용, 외부 전송 없음. 스키마: `agent-telemetry.schema.json` v1.
- **텔레메트리 조회 커맨드**: `/agent-report [--period 7d|30d|all] [--team dev|plan|copy] [--format json]` — 에이전트별 성공률·소요시간·실패 패턴 집계.
- **피드백 아카이빙 (v2.3.1, Phase 3 완료)**: `kit-feedback-archiving` 인프라 — index / stats / rollup. 자동화된 장기 보관 경로.
- **주요 룰 (SSOT)**
  - `golden-principles.md` — 13 핵심 원칙 (TDD, 불변성, 보안, HARD-GATE, 증거 기반, Document Non-Duplication 등)
  - `verification.md` — 완료 전 검증 (Iron Law, Agent Edit Race 포함)
  - `agent-telemetry.md` (v2.3.1) — 텔레메트리 스키마 + 수집 파이프라인
  - `edit-coordinates-governance.md` v1.1 (IMP-KIT-011) — architecture-binding 동기화 계약
  - `task-id-naming.md` (IMP-KIT-015) — 4 패턴 (`T-{AREA}-{NN}` / `TASK-{SLUG}-{NN}` / `LEGACY-{AREA}-{NN}` / `SPIKE-{AREA}-{NN}`)
  - `checkpoint-policy.md` (IMP-KIT-016) — Human Checkpoint 정책, `autoProceedOnPass` 플래그
  - `spike-workflow-agents.md` (IMP-AGENT-004) — Spike 모드 에이전트 협력 계약
- **개인정보 보호**: 텔레메트리는 에이전트 프롬프트·출력 원문 저장 금지. 이름·타임스탬프·크기 지표·에러 클래스만 저장.

## dev 도메인

- **TDD 가드**: `dev-tdd-guard.js`가 테스트 없는 구현(`Edit|Write`)을 차단한다.
- **DB 가드**: `dev-db-guard.js`가 위험한 DB 명령(`Bash`)을 차단한다.
- **Feature Scope 가드**: `dev-feature-scope-guard.js`가 Feature Package 범위 밖 편집을 경고한다.
- **주요 커맨드**
  - `/dev-feature <prd-path>` — PRD를 읽어 Feature Package 생성
  - `/dev-run <package-path>` — TASK별 TDD 자동 구현 루프
  - `/dev-verify`, `/dev-verify-all` — DVC(Document-Verification Consistency) 검증
  - `/dev-commit`, `/dev-commit-push-pr` — 커밋 및 PR 생성
- **주요 서브에이전트**: `dev-architect`, `dev-code-reviewer`, `dev-security-reviewer`, `dev-database-reviewer`, `dev-doc-updater`, `dev-verify-agent`, `dev-implementer` (IMP-AGENT-005, `/dev-run` 기본 디스패치), `dev-build-fixer` (IMP-AGENT-013), `dev-e2e-runner` (IMP-AGENT-014), `dev-refactor-cleaner` (IMP-AGENT-015)
- **에이전트 계약 (v2.3.1)**
  - 리뷰 출력 표준화 (IMP-AGENT-002): code/security/database reviewer 출력 포맷 통일
  - edit-coordinates v1.1 (IMP-AGENT-001): dev-architect → dev-doc-updater 체이닝 시 `binding_updates` 필드로 architecture-binding 동기화
  - archive guard 프롬프트 (IMP-AGENT-003): archive 원본 불변 보호
  - 도메인 간 핸드오프 (IMP-AGENT-007): plan → dev → copy 크로스 링크
  - frontmatter v1.1 (IMP-AGENT-008): `team_owner` / `release_stage` / `schema_version` 필드 표준

## plan 도메인

- **기획 가드**: `plan-doc-guard.js`가 `Edit|Write` 전에 기획 문서 무결성을 검증한다.
- **무결성 훅 (Opt-in, v2.4.0)**: `plan-epic-integrity.js` (Phase 2 disable 기본, Phase 3 enable) — Epic ↔ Feature binding cross-reference 검증 (FLAG only, BLOCK 아님).
- **Epic 계층 (Opt-in, v2.4.0)**: Epic(대) / Feature(중) / Task(소) 3단 parent-child. Epic 없이도 기존 flat 플로우 100% 호환. SSOT: `plan-epic-hierarchy.md`.
- **파이프라인 (순서 강제)**
  0. `/plan-epic "{제목}"` — **(Opt-in, v2.4.0)** Epic 생성, `.plans/epics/00-draft/EPIC-{YYYYMMDD}-{NNN}/`
  1. `/plan-idea "아이디어" [--epic=EPIC-...]` — `.plans/ideas/00-inbox/`에 수집 (Epic 자동 연결 optional, IMP-AGENT-010)
  2. `/plan-screen <IDEA-ID>` — RICE 스크리닝 + 승인 게이트
  3. `/plan-draft <IDEA-ID>` — 1차 기능 기획 (Lite/Standard 판정)
  4. `/plan-prd <draft-path>` — Standard 기능 PRD 상세 작성 (Epic 있으면 Epic Brief §2 성공지표 인용, IMP-AGENT-011)
  5. `/plan-wireframe` — 와이어프레임 구조 확정 (옵션, design/stitch 선행 필수)
  6. `/plan-design` 또는 `/plan-stitch` — wireframe 후 **택일** (Claude Design 2단계 프롬프트 / Stitch 시안 통합)
  7. `/plan-bridge <slug>` — 개발 핸드오프
  8. `/plan-archive <slug>` — 완료 기능 번들화
- **핵심 게이트**: `/plan-screen` 완료 후 사용자의 **명시적 승인** 없이는 `/plan-draft` 이후 단계로 진입하지 않는다.
- **배타 규칙**: `/plan-design`과 `/plan-stitch`는 동시 실행 차단. 순차 실행은 `--force-sequential` 필수.
- **Spike 모드 (v2.3.1, IMP-AGENT-004)**: Standard Feature 전용. `plan-bridge-writer` + `dev-architect` 협력 계약. Budget 1일 hard cap (IMP-KIT-036). TASK ID: `SPIKE-{AREA}-NN` (IMP-KIT-015).
- **산출 경로**: `.plans/epics/` (Opt-in), `.plans/ideas/`, `.plans/prd/`, `.plans/features/active/<slug>/`, `.plans/design/<slug>/`, `.plans/archive/<slug>/`
- **주요 서브에이전트**: `plan-idea-collector`, `plan-idea-screener`, `plan-prd-writer`, `plan-reviewer`, `plan-wireframe-designer`, `plan-design-writer`, `plan-stitch-integrator`, `plan-bridge-writer`, `plan-draft-writer`
- **v2.4.0 신규 자산**: skill `plan-epic-workflow` (라이프사이클 + Epic Brief/Children Features/Epic Binding 3 템플릿), rule `plan-epic-hierarchy.md` (SSOT), command `/plan-epic`, hook `plan-epic-integrity.js` (Phase 2 disable 기본)

## copy 도메인

- **Evidence Reminder**: `copy-evidence-reminder.js`가 시각/인터랙션 파일 수정 시 evidence 갱신을 안내한다.
- **Scope Guard**: `copy-scope-guard.js`가 실행 단위 범위 밖 편집을 경고한다.
- **Doc Drift Check**: `copy-doc-drift-check.js`가 문서-구현 drift를 감지한다.
- **Variant Guard**: `copy-variant-env-guard.js`가 variant/host map 변경 시 QA를 안내한다.
- **Gate Stop**: `copy-gate-stop.js`가 Phase/R 종료 후 자동 진행을 차단한다 (기본 비활성).
- **시나리오 분류**: A(백지), B(부분), C(충실도 교정). `/plan-draft`에서 판정.
- **주요 커맨드**
  - `/copy-reference-refresh` — 기준 캡처 + manifest 생성/갱신
  - `/copy-visual-review` — visual 갭 분석
  - `/copy-interaction-review` — interaction 갭 분석
  - `/copy-gap-board` — 갭 우선순위 통합
  - `/copy-plan-unit` — 갭→실행 단위 전환
  - `/copy-verify` — build/evidence/document 검증
  - `/copy-closeout` — 승인 + 잔여 리스크 기록
- **주요 서브에이전트**: `copy-fidelity`, `copy-interaction-fidelity`, `copy-reference-baseline`, `copy-qa-reviewer`, `copy-implementer` (IMP-AGENT-006, `/copy-plan-unit` 승인 후 VF/IF gap 소비 + Execution Unit 범위 구현)

# Current Date
Today's date is 2026-04-24.
<!-- kit:managed:end -->
