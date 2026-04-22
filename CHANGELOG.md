# Changelog

All notable changes to claude-kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

v2.4.0 정식 릴리스 (2026-06-23 목표) 로 이동 예정. Phase 3 전면 도입 (hook enable + `/plan-epic-adopt` + Codex sibling 동기화).

---

## [2.4.0-beta.1] - 2026-04-22

Hierarchical Plan Structure 도입 (Phase 2 beta). Epic(대) / Feature(중) / Task(소) 3단 Opt-in 계층 + v2.3.1 IMP-AGENT 001~009 소급 포함 + 다운스트림 템플릿 동기화.

### Added — v2.4.0 Phase 2 Epic 도메인

- **Rule**: `src/claude/plan/rules/plan-epic-hierarchy.md` (SSOT, Epic 계층 정의 + Opt-in 원칙 + 금지 사항)
- **Skill**: `src/claude/plan/skills/plan-epic-workflow/` (라이프사이클 + 상태 머신 + 3 템플릿: epic-brief / children-features / epic-binding)
- **Command**: `/plan-epic` (create/list/show/advance/archive 서브커맨드)
- **Hook**: `src/claude/plan/hooks/plan-epic-integrity.js` (FLAG only, Phase 2 disable 기본)
- **Parameter**: `/plan-idea --epic=EPIC-{ID}` Opt-in 자동 연결
- **Agent extension (IMP-AGENT-010)**: `plan-idea-collector` Epic_Binding 섹션 — Epic 존재 확인 + 프론트매터/backlog/children 자동 갱신
- **Agent extension (IMP-AGENT-011)**: `plan-prd-writer` Epic_Context 섹션 — Epic Brief §2 성공지표 인용 + 자매 Feature 참조
- **Skill extension**: `plan-idea-management` 에 Epic 연결 규칙 섹션

### Added — Downstream Template Sync

- `src/templates/claude-md/40-core.md` 신규 (core 도메인 블록 — telemetry, feedback-archiving, 주요 룰 SSOT)
- `scripts/claude-md-renderer.js` DOMAIN_BLOCKS 에 core 등록
- `src/templates/claude-md/{10-dev,20-plan,30-copy}.md` v2.3.1 + v2.4.0 반영 (dev-implementer / copy-implementer / Epic P0 + Spike)
- `scripts/quickstart-renderer.js` plan flow / actions / pipeline chooser / paths / mini glossary 확장 (Epic/Children Features/Spike/Telemetry 용어 추가)

### Tests

- `plan-epic-integrity.js` TDD 25 단위 테스트 (RED → GREEN 검증)
- 전체 테스트 스위트 294/294 pass, 회귀 0

### Migration (2.3.0 → 2.4.0-beta.1)

- `pnpm update claude-kit` → `postinstall` 자동 실행 → CLAUDE.md + CLAUDE-KIT-QUICKSTART.md 자동 재생성 (v2.3.1 + v2.4.0 반영)
- Epic 계층은 Opt-in — 기존 flat 플로우 변경 없음
- `plan-epic-integrity.js` 는 Phase 2 disable 기본, `.claude/settings.json` 에서 수동 enable 가능

---

## [2.3.1] - 2026-04-22 (retroactive)

IMP-AGENT 시리즈 9건 + kit-feedback-archiving Phase 3 전체 완료. CHANGELOG 소급 기록 (개별 release tag 없음, v2.4.0-beta.1 에 통합 태그).

### Added — IMP-AGENT 시리즈 (9건)

- **IMP-AGENT-001** — edit-coordinates v1.1: `binding_updates` 필드 추가 (dev-architect → dev-doc-updater architecture-binding 동기화 계약 승격). 하위호환 유지.
- **IMP-AGENT-002** — 리뷰 출력 표준화: code/security/database reviewer 출력 포맷 통일
- **IMP-AGENT-003** — archive guard 프롬프트: archive 원본 불변 보호 강화
- **IMP-AGENT-004** — Spike 워크플로우: `plan-bridge-writer` + `dev-architect` 협력 계약 (Day-End Go/No-Go/Extend 1일). TASK ID `SPIKE-{AREA}-NN`. Budget 1일 hard cap (IMP-KIT-036)
- **IMP-AGENT-005** — `dev-implementer` 신설: `/dev-run` 기본 디스패치, TDD Red-Green-Refactor 자율 실행 (BC-2.3.1-02)
- **IMP-AGENT-006** — `copy-implementer` 신설: `/copy-plan-unit` 승인 후 VF/IF gap 소비 + Execution Unit 범위 구현 (BC-2.3.1-03)
- **IMP-AGENT-007** — 도메인 간 핸드오프: plan → dev → copy 크로스 링크 표준화
- **IMP-AGENT-008** — 에이전트 frontmatter v1.1: `team_owner` / `release_stage` / `schema_version` 표준 필드 + migrate 스크립트
- **IMP-AGENT-009** — 에이전트 텔레메트리: 스키마 v1 + `/agent-report` 커맨드 + `agent-telemetry.md` 룰 (emit 훅 구현은 v2.4.0 후속 세션)

### Added — kit-feedback-archiving Phase 3

- Phase 3.3 index/stats/rollup 전체 완료 (커밋 `65368b3`)
- IMP-KIT-007 자동 후속 트리거 + IMP-KIT-024 stub → `IMP-AGENT-009` 승계
- 피드백 엔트리 자동 아카이빙 경로 확립

### Rules 신규

- `src/claude/core/rules/agent-telemetry.md` — 텔레메트리 스키마 + 수집 파이프라인 + 개인정보 보호 원칙
- `src/claude/core/rules/spike-workflow-agents.md` — Spike 모드 에이전트 협력 계약

---

## [2.3.0] - 2026-04-21

P1 백로그 **11건 전체 완료**. **프로세스 자동화 + 에이전트 메모리/권한 보완 + 경계·네이밍 정리** 3개 그룹으로 수동 개입 최소화·문서 SSOT 강화·Dev 착수 Gate 조기화 달성. D1/D2/D3 이해관계자 승인 완료 ([`stakeholder-approval.md`](docs/archive/kit-2.3.0-roadmap/_reviews/2026-04-21-stakeholder-approval.md)).

### Added (P1 11건)

**Phase 2.1 — 프로세스 자동화 (3건)**

- **IMP-KIT-007** — `/plan-review` 자동 후속 트리거 ([`f57b44d`](https://github.com/CtrlCVbot/claude-kit/commit/f57b44d))
  - Stop 훅 `plan-review-trigger.js` (Claude+Codex), decideTrigger 순수 함수
  - `autoReview` 설정 (`~/.claude/settings.json`의 `"autoReview": false`로 비활성)
  - `chain-point: feedback-collector` 표식 (kit-feedback-archiving Phase 3 연계)
  - 11 단위 테스트
- **IMP-KIT-016** — Checkpoint 자동 진행 플래그 ([`a081bd7`](https://github.com/CtrlCVbot/claude-kit/commit/a081bd7))
  - `--auto-proceed-on-pass` 플래그 + Critical 화이트리스트 (destructive/external-api-call/breaking-change/initial-approval-gate)
  - `src/claude/core/checkpoint/auto-proceed.js` decideCheckpoint 순수 함수
  - `src/claude/core/rules/checkpoint-policy.md` 정책 SSOT
  - 13 단위 테스트
- **IMP-KIT-017** — 재복제 금지 Skill 수준 강제 ([`f03535b`](https://github.com/CtrlCVbot/claude-kit/commit/f03535b))
  - `golden-principles.md §13 Document Non-Duplication` 원칙 추가
  - `no-duplication-guard.js` (8-gram Jaccard 유사도) + opt-in 활성
  - 11 단위 테스트

**Phase 2.2 — 에이전트 메모리/권한 보완 (4건)**

- **IMP-KIT-009** — plan-idea-screener 파일 이동 화이트리스트 ([`5a2f073`](https://github.com/CtrlCVbot/claude-kit/commit/5a2f073))
  - `plan-idea-move-guard.js` PreToolUse Bash matcher (10-screening ↔ 20-approved/30-on-hold)
  - `idea-folders.json` 4 폴더 SSOT
  - 13 단위 테스트
- **IMP-KIT-008** — screener 재판정 메모리 유틸 ([`38ed8f2`](https://github.com/CtrlCVbot/claude-kit/commit/38ed8f2))
  - `plan-idea-screener-rescoring.js` (shouldRecord/buildRescoringLogEntry/isValidEntry)
  - `rescoring-log-entry.schema.json` + 템플릿
  - 9 단위 테스트
- **IMP-KIT-010** — wireframe Pre-render 체크리스트 ([`108f8b5`](https://github.com/CtrlCVbot/claude-kit/commit/108f8b5))
  - `plan-wireframe-checklist.js` (validateWireframePrerender 4항목 + applyPiiMasking)
  - `pii-masking-rules.json` 2 규칙 (phone-kr, business-id-kr)
  - `decision-log.template.md`
  - 12 단위 테스트
- **IMP-KIT-011** — edit-coordinates 스키마 거버넌스 ([`a37fccd`](https://github.com/CtrlCVbot/claude-kit/commit/a37fccd))
  - ajv 2020-12 런타임 검증 (`_router.js`의 validate/getValidator/extractMajor)
  - `edit-coordinates-governance.md` SemVer + 하위호환 보장 + action enum 확장 절차
  - 13 단위 테스트

**Phase 2.3 — 경계·네이밍 정리 (4건)**

- **IMP-KIT-015** — TASK ID 네이밍 표준 유틸 ([`e58ca37`](https://github.com/CtrlCVbot/claude-kit/commit/e58ca37))
  - 4 패턴 (`T-{AREA}-{NN}`, `TASK-{SLUG}-{NN}`, `LEGACY-{AREA}-{NN}`, `SPIKE-{AREA}-{NN}`)
  - `task-id.js` (validateTaskId/detectDomain/suggestFix)
  - `task-id-naming.md` 규칙 SSOT
  - 20 단위 테스트
- **IMP-KIT-013** — Dev Gate Draft 조기 플래그 ([`527ca78`](https://github.com/CtrlCVbot/claude-kit/commit/527ca78))
  - `plan-dev-gate.js` (buildDevGateSection Standard dev만 + validateDevGate)
  - 4항목 체크리스트 (Legacy 격리, TASK ID 네이밍, 의존 Feature, 마이그레이션)
  - `dev-gate-items.json` + 템플릿
  - 8 단위 테스트
- **IMP-KIT-012** — bridge ↔ Phase A 경계 유틸 ([`3aec71a`](https://github.com/CtrlCVbot/claude-kit/commit/3aec71a))
  - `bridge-phase-a.js` (canEdit + extractBridgeSections)
  - `bridge-phase-a-matrix.json` (5 파일 × bridge/phase-a 책임)
  - BRIDGE_MARKER + PHASE_A_SECTION
  - 9 단위 테스트
- **IMP-KIT-014** — stage-manifest 스키마 거버넌스 ([`b22f43d`](https://github.com/CtrlCVbot/claude-kit/commit/b22f43d), [`f1279ba`](https://github.com/CtrlCVbot/claude-kit/commit/f1279ba))
  - `stage-manifest.schema.json` v1.0 + `stage-manifest-router.js` (validateStageManifest/checkConsumerPaths)
  - `stage-manifest-consumers.json` 소비자 등록부
  - `scripts/validate-stage-manifest-schema.js` CI 검증 스크립트 (D3 후속 보강)
  - 11 단위 테스트

### Added (테스트 인프라)

- Vitest 2.1.9 + `@vitest/coverage-v8` 2.1.9 devDependency ([`9b4154b`](https://github.com/CtrlCVbot/claude-kit/commit/9b4154b))
- ajv 8.18.0 devDependency (IMP-KIT-011/014 공통)
- **132 단위 테스트** passed (12 test files) — `pnpm test`
- `vitest.config.ts` (v8 coverage, passWithNoTests)
- `tests/` 디렉터리 구조 (claude/{core,plan,dev}/ hooks/agents/_schemas/_utils/boundary/)
- GitHub Actions CI `.github/workflows/verify-2.3.0.yml` 3 jobs: test · audit-pairing · verify-metrics ([`0729510`](https://github.com/CtrlCVbot/claude-kit/commit/0729510))

### Added (문서)

- `docs/archive/kit-2.3.0-roadmap/` 전체 문서 패키지 ([`c7915b1`](https://github.com/CtrlCVbot/claude-kit/commit/c7915b1))
  - 최상위 9 문서 (README, 00~08)
  - 상세 스펙 11건 (IMP-KIT-007~017)
  - `_reviews/` 리뷰 이력 (메인테이너 기술 리뷰·이슈 해소·이해관계자 승인·2단계 리뷰·IMP-KIT별 리뷰 11건·3단계 통합 리뷰)
  - `_assignments/` Phase 2.1 담당자·주간 회고 템플릿·인프라 체크리스트

### Changed

- `package.json` — devDependencies (vitest, @vitest/coverage-v8, ajv) + scripts (test, test:watch, test:coverage)
- `.gitignore` — `coverage/`, `*.tsbuildinfo` 추가
- `scripts/setup.js` — `buildHooksConfig` plan 도메인에 Stop 훅(IMP-KIT-007) + Bash matcher(IMP-KIT-009) 추가
- `src/claude/core/rules/golden-principles.md` — §13 Document Non-Duplication + Anti-Rationalization 표 1행 추가
- `src/claude/plan/commands/plan-draft.md`, `src/codex/plan/commands/plan-draft.md` — "자동 리뷰" 단계 4 삽입

### Breaking Changes

- **BC-2.3.0-01** TASK ID 네이밍 규칙 강제 (IMP-KIT-015)
  - 4 패턴 미매칭 ID(`M1-07`, `LEGACY` 등)는 경고 수준에서 시작
  - 2.4.0+ 차단 수준으로 단계 상향 예정
  - **마이그레이션**: 기존 Feature의 TASK ID를 `T-{AREA}-{NN}` 등으로 변환
- **BC-2.3.0-02** stage-manifest.json `schema_version` 필수 (IMP-KIT-014)
  - 새로 생성되는 `stage-manifest.json`은 `"schema_version": "1.0"` 필수
  - 기존 파일은 v0으로 간주, 경고 출력
  - **마이그레이션**: 기존 stage-manifest 상단에 `"schema_version": "1.0"` 추가
- **BC-2.3.0-03** edit-coordinates ajv 런타임 검증 (IMP-KIT-011)
  - IMP-KIT-001 v1 payload는 **그대로 통과** — 하위호환 보장
  - 사실상 Behavioral Change (향후 재분류 검토)

### Migration (2.2.1 → 2.3.0)

1. `pnpm install --ignore-workspace` (monorepo workspace 격리 필수)
2. TASK ID 변환 (BC-01): 기존 Feature의 `stage-manifest.json` 및 Draft 문서 검색 → 4 패턴 준수
3. stage-manifest 스키마 버전 (BC-02): 기존 파일에 `"schema_version": "1.0"` 추가
4. 테스트 러너 도입 확인: `pnpm test` 명령 동작

### 릴리스 메트릭

| 지표 | 값 |
|------|----|
| P1 구현 | **11/11 (100%)** |
| 단위 테스트 | **132 passed** (12 files) |
| 커밋 수 | **18개** (세션 내) |
| 듀얼 타깃 | **Claude + Codex sibling 완비** (~22 sibling 파일) |
| 문서 | 31+ 파일 (스펙·리뷰·assignments) |

### 제한 사항 (4단계 회귀 이월)

- **지표 #7~#10 실측 대기**: stub 구현 완료, 실제 측정은 dash-preview-phase3 복제 회귀 시나리오 필요
- **에이전트 프롬프트 명시적 참조**: 30+ 기존 커맨드·에이전트 .md는 정책 SSOT 방식 암묵적 참조 (Phase 2.1 마무리 통합 시 선택적 보강)
- **가드 훅 runtime 미등록 항목**: IMP-KIT-015 task-id 검증 → plan-doc-guard 확장, IMP-KIT-011 validator → dev-doc-updater 입력 연계는 후속
- **Codex 원칙 문서**: IMP-KIT-017 §13은 Claude golden-principles.md에 추가, Codex AGENTS.md.template 반영은 이월
- **audit-pairing FAIL 10건**: copy 도메인 unpaired 기존 이슈 (본 릴리스 범위 외), 2.4.0에서 해소 예정

### 설계 패턴 (공통)

1. **TDD Red-Green-Improve**: 11건 모두 적용
2. **순수 함수 export**: `decide*`/`validate*`/`build*` 함수로 분리, 테스트 용이
3. **정책 SSOT**: 정책 문서 1건 + JSON 상수로 30+ .md 개별 수정 회피
4. **Codex 듀얼 타깃 동시 sibling**: 모든 IMP-KIT의 Codex peer 동시 생성
5. **opt-in 훅 등록**: 성능 부담 가드는 사용자 설정 기반 활성화

---

## [2.2.1] - 2026-04-20

IMP-KIT-027 `/plan-design` 신설 + wireframe 후속 단계 택일 구조 전환. 2.2.0 릴리스 직후 별도 스프린트로 구현.

### Added

- **IMP-KIT-027** — `/plan-design` Claude Design 통합 ([`41330d3`](https://github.com/CtrlCVbot/claude-kit/commit/41330d3), [`993e500`](https://github.com/CtrlCVbot/claude-kit/commit/993e500), [`28580b9`](https://github.com/CtrlCVbot/claude-kit/commit/28580b9))
  - 신규 커맨드 `/plan-design` + 서브에이전트 `plan-design-writer`
  - 신규 스킬 `claude-design-workflow` + 2단계 프롬프트 템플릿 (`design-prompt-wireframe.template.md` · `design-prompt-highfidelity.template.md` · `design-manifest.template.md`)
  - `routing-metadata.schema.json` v1 신설 — `post_wireframe_path` enum (`design` / `stitch` / `design+stitch` / `stitch+design` / `skipped` / `null`) 으로 배타 게이트 구현
  - `--force-sequential` + `--sequential-reason` 플래그 (stitch 후 design 순차 실행 허용, 사유 필수)
  - `--register` URL 검증: scheme 정확히 `https` + hostname 정확히 `claude.ai` (서브도메인 불허, userinfo spoofing 차단)
  - `--fidelity` 플래그 (wireframe / highfidelity / both) + `--ignore-mismatch` (SCR-ID 누락 우회)
  - Standard Feature 전용 (Lite 거부 + `/dev-feature` 또는 `/copy-reference-refresh` 안내)
  - Codex sibling 전체 동기화 (커맨드·에이전트·스킬·템플릿·스키마)

### Changed

- `/plan-stitch` 와 `/plan-design` **배타 관계화** — wireframe 후 택일. 동시 실행 차단, 순차 실행은 `--force-sequential` 필수
- `/plan-bridge` Checkpoint 로직 추가 — `post_wireframe_path: null` 감지 시 [1] design / [2] stitch / [3] skip 선택 프롬프트. `[3] skip` 시 `skip_reason` 기록
- `plan-draft-writer` routing-metadata 초기값에 `schema_version: "1.0"` + `post_wireframe_path: null` 기록 (후속 단계 추적 준비)
- `/plan-wireframe` 커맨드 설명에 "design/stitch 의 선행 필수" 명시

### Docs

- `docs/10-features/03-plan-domain.md` — 파이프라인 다이어그램·커맨드·에이전트·스킬·산출물 표에 `/plan-design` 체계 반영 ([`289a012`](https://github.com/CtrlCVbot/claude-kit/commit/289a012))
- `docs/20-user-guide/05-plan-pipeline.md` — §5 를 3-step(구조 확정 / 시각 완성 택일 / Checkpoint skip) 구조로 재구성 ([`289a012`](https://github.com/CtrlCVbot/claude-kit/commit/289a012))
- `docs/20-user-guide/07-troubleshooting.md` + `README.md` + `01-installation.md` — Windows pnpm postinstall 트러블슈팅 가이드 추가 ([`679b451`](https://github.com/CtrlCVbot/claude-kit/commit/679b451))

---

## [2.2.0] - 2026-04-20

dash-preview-phase3 세션 회고에서 도출된 **P0 블로커 6건**을 모두 해결. **62건의 독립 리뷰 이슈 전수 반영**. 에이전트 권한 경계, 프레임워크 silent drift, Read 캐시 에러, Hybrid 수동 지시를 **0으로** 만드는 것이 릴리스 목표.

### Added (P0 6건)

- **IMP-KIT-001** — dev-architect Phase별 에이전트 자동 체이닝 ([`01790d4`](https://github.com/CtrlCVbot/claude-kit/commit/01790d4), [`537e55f`](https://github.com/CtrlCVbot/claude-kit/commit/537e55f))
  - `edit-coordinates.schema.json` v1 신설 (`$id`에 v1 suffix, action별 conditional required)
  - dev-architect의 read-only 원칙은 유지 — B안 역할 분리 채택
  - Phase A→C 연결 무결성 (JSON 미출력 시 1회 재요청 → 사용자 알림 3단계 절차)
- **IMP-KIT-002** — plan-idea-screener 프레임워크 파라미터화 ([`26962cc`](https://github.com/CtrlCVbot/claude-kit/commit/26962cc), [`37dbddf`](https://github.com/CtrlCVbot/claude-kit/commit/37dbddf))
  - `--framework rice|5axis` 플래그 + 기본값 CLAUDE.md 또는 `rice` 폴백
  - `rice.schema.json`, `5axis.schema.json` 각각 분리
  - Silent drift 방지: 출력 첫 줄에 프레임워크 명시 강제
  - `--rescore` 시 기존 파일을 `.prev-{framework}.md`로 rename (이력 보존)
- **IMP-KIT-003** — plan-draft-writer 에이전트 신설 ([`adc84b7`](https://github.com/CtrlCVbot/claude-kit/commit/adc84b7), [`0e9d52f`](https://github.com/CtrlCVbot/claude-kit/commit/0e9d52f))
  - 3중 판정(Lite/Standard + 시나리오 A/B/C + Feature 유형 copy/dev) 표준화
  - Hybrid 감지 (결정론적 시그널 + 휴리스틱 키워드, 휴리스틱 시 사용자 확인)
  - routing-metadata `override: {field, from, to, reason}` 필드로 감사 추적
  - 파일 구조 통일 (`.plans/features/active/{slug}/{slug}.md` + `00-context/`)
- **IMP-KIT-004** — plan-bridge-writer 에이전트 신설 ([`68be186`](https://github.com/CtrlCVbot/claude-kit/commit/68be186), [`e7e7742`](https://github.com/CtrlCVbot/claude-kit/commit/e7e7742))
  - Standard Feature 전용 (Lite는 bridge 생략)
  - copy-reference-baseline과 병렬 실행 보증 (`00-context/` vs `evidence/` 배타 — 쌍방)
  - 구조 게이트: SSOT frontmatter `status: approved` 검증
- **IMP-KIT-005** — 서브에이전트 완료 후 Read 캐시 재인증 가이드 ([`84a11b2`](https://github.com/CtrlCVbot/claude-kit/commit/84a11b2), [`785ef24`](https://github.com/CtrlCVbot/claude-kit/commit/785ef24))
  - SubagentStop 훅 `agent-completion-cache-invalidate.js` 신설 (`setup.js`에 등록)
  - 실제 `tools:` 필드 기반 에이전트 분류 (Read-only 8종 / Write-capable 11종)
  - Set 기반 exact equality 매칭 + tmpdir 마커 dedup
  - Codex fallback Skill (`src/claude/core/skills/agent-completion-cache-invalidate/`)
  - verification.md + interaction.md + AGENTS.md.template mirror 업데이트
- **IMP-KIT-006** — Hybrid (reference-only) 모드 공식 정의 ([`de2234e`](https://github.com/CtrlCVbot/claude-kit/commit/de2234e), [`742b176`](https://github.com/CtrlCVbot/claude-kit/commit/742b176))
  - `--reference-only` / `--full` 플래그 도입
  - manifest.json `mode: "full"|"reference-only"` 필드 + backward compat
  - `copy-visual-review`/`copy-interaction-review`/`copy-gap-board` Preconditions에 `mode: "full"` 게이트 추가
  - copy-evidence.md Manifest Schema SSOT 확장

### Added (문서 패키지)

- `docs/archive/kit-2.2.0-roadmap/` — 2.2.0 로드맵 문서 패키지 (14개 문서, [`466665d`](https://github.com/CtrlCVbot/claude-kit/commit/466665d))
  - Executive summary / 로드맵 / P0 6건 상세 스펙 / P1·P2 요약 / 검증 전략 / 릴리스 노트 / 회귀 시나리오
- `docs/plan/kit-feedback-archiving/` — 파이프라인 피드백 자동 아카이빙 시스템 설계 (8개 문서, [`17cbf11`](https://github.com/CtrlCVbot/claude-kit/commit/17cbf11))
  - Phase 2 설계 완료, Phase 3~5 구현은 2.3.0+ 예정
- Phase 1.3 회귀 시나리오 문서 ([`3224a36`](https://github.com/CtrlCVbot/claude-kit/commit/3224a36))
  - `08-regression-scenario.md` V1 신설 + `07-release-notes-2.2.0-draft.md` V4 확정

### Added (이전 Unreleased 항목)

- 문서 패키지 5계층 재구축 (`docs/00-overview`, `10-features`, `20-user-guide`, `30-reference`, `40-contributing`) — 31개 문서 드래프트 + reference 6개 자동 생성
- `scripts/docs-generate.js` — commands/agents/skills/hooks/rules/pairing-registry reference 자동 생성기 + `--check` drift 검증
- `docs/archive/2026-04-17/` — 이전 설계·리뷰 이력 동결 (14개 디렉터리 + `_guide/` 14개 파일)
- `docs/plan/documentation-package-plan.md` — 재구축 계획서
- copy 도메인 5개 hook 에 Hook/Event/Action 정형 JSDoc

### Changed

- `src/claude/dev/agents/dev-architect.md` — Output_Format에 편집 좌표 JSON 섹션 (선택적), Constraints에 "JSON 출력 허용" 예외 추가
- `src/claude/dev/agents/dev-doc-updater.md` — Input_Format 섹션 신설 (체이닝 입력 처리 7단계 + rationale fallback + line_range 역전 검증)
- `src/claude/plan/commands/plan-screen.md` — `--framework` 플래그 + Rescore 정책
- `src/claude/plan/agents/plan-idea-screener.md` — description 정정 (RICE **또는** 5축)
- `src/claude/plan/skills/plan-screening-workflow/SKILL.md` — 양 프레임워크 워크플로우 병기
- `src/claude/plan/commands/plan-draft.md` — 에이전트 호출 래퍼로 전환
- `src/claude/plan/commands/plan-bridge.md` — 에이전트 호출 래퍼 + Standard 전용 명시
- `src/claude/copy/commands/copy-reference-refresh.md` — `--reference-only` / `--full` 플래그
- `src/claude/copy/agents/copy-reference-baseline.md` — 모드 분기 + `00-context/` 접근 금지 (쌍방 배타)
- `src/claude/copy/rules/copy-commands.md` — Hybrid Feature 처리 섹션 공식화
- `src/claude/copy/rules/copy-evidence.md` — Manifest Schema에 `mode` 필드 추가
- `src/claude/core/rules/verification.md` — "Agent Edit Race (Read Cache)" 섹션 신설 + 에이전트 분류표
- `src/claude/core/rules/interaction.md` — "Agent Delegation & Read Cache" 섹션 신설 + 이모지 제거
- `src/templates/AGENTS.md.template` — verification/interaction mirror 업데이트
- `CLAUDE.md` — "Plan 도메인 설정 (다운스트림 프로젝트용 예시)" 섹션 추가
- `scripts/setup.js` — `buildHooksConfig`에 `SubagentStop` 이벤트 추가
- 루트 `README.md` "저장소 문서" 섹션을 신규 docs 트리로 전면 갱신

### Added (신규 에이전트/스킬/훅)

- 에이전트: `plan-draft-writer` (Claude+Codex), `plan-bridge-writer` (Claude+Codex)
- 훅: `agent-completion-cache-invalidate.js`
- 스킬: `agent-completion-cache-invalidate` (Codex fallback artifact)

### Added (신규 스키마)

- `src/claude/dev/_schemas/edit-coordinates.schema.json` (v1)
- `src/claude/plan/_schemas/rice.schema.json`
- `src/claude/plan/_schemas/5axis.schema.json`
- Codex 동등본 3종

### Removed

- **Breaking (저장소 variant 한정)**: `scripts/generate-quickstart-doc.js` 제거. 설치본 `CLAUDE-KIT-QUICKSTART.md` 하나로 단일화
- **Breaking (npm scripts)**: `package.json` 에서 `generate:quickstart`, `check:quickstart` 스크립트 제거
- `docs/guide/` 14개 파일 → `docs/archive/2026-04-17/_guide/` 로 이동

### Migration (2.1.0 → 2.2.0)

- `pnpm check:quickstart` CI 게이트를 쓰던 경우 → `pnpm check:docs` 로 대체
- `docs/guide/...` 외부 링크 → `docs/archive/2026-04-17/_guide/...` 또는 `docs/20-user-guide/...`로 갱신
- `/plan-screen` 호출 시 프레임워크 명시 권장 (미지정 시 `rice` 기본값 폴백)
- `/plan-draft` Hybrid dev Feature 감지 시 `--reference-only` 플래그 안내
- 기존 manifest.json (mode 필드 없음) → backward compat로 `"full"`로 간주
- dev-architect 호출 후 편집 필요 시 → 자동으로 dev-doc-updater로 체이닝 (수동 재위임 불필요)
- write-capable 에이전트 완료 후 같은 파일 Edit 시 → Read 재호출 권장 (훅이 자동 알림)

### 테스트 인프라 알림

- 본 릴리스의 IMP-KIT 각 스펙은 `tests/**/*.test.ts` 파일을 참고 명세로 포함하고 있으나, 리포지토리에 **Vitest/Jest 등 테스트 러너가 구성되지 않아 실행 불가**
- 본 릴리스의 검증은 **dash-preview-phase3 복제 회귀 시나리오** (문서화된 체크리스트 기반 수동 실행)가 유일한 수단
- 자동화된 단위 테스트는 2.3.0+에서 테스트 인프라 도입 후 추가 예정

### 릴리스 메트릭

- **P0 구현**: 6건 전체 완료
- **독립 리뷰**: 6회 수행 (dev-code-reviewer)
- **리뷰 이슈**: 62건 전수 반영
- **커밋 수**: 16개 (릴리스 범위)
- **변경 파일**: src/ + docs/ + scripts/ + CLAUDE.md + AGENTS.md.template

---

## [2.1.0] - 2026-04-06

Codex 멀티타깃 지원 도입.

### Added
- **Codex 타깃 지원**: `src/codex/{core,dev,plan}/` SSOT + `plugins/claude-kit/` 설치 출력
- **Meta-tooling**: `kit-scaffolding` 스킬, `kit-validation` 스킬, `/kit-create`, `/kit-list`, `/kit-audit`, `/kit-validate` 커맨드
- **Pairing registry**: `src/pairing-registry.json` + `src/exception-registry.json` (Claude↔Codex 자산 매핑 추적)
- **Kit 메타 자산**: `/kit-sync`, `/kit-convert`, `/kit-analyze`, `kit-sync-agent`, `kit-maintainer`
- **Self-contained QUICKSTART** (2026-04-14): 설치 직후 루트에 생성되는 `CLAUDE-KIT-QUICKSTART.md`
- **copy 도메인** (2026-04-16): commands (7), agents (4), skills (4), hooks (5), rules (5). UI 충실도 관리 파이프라인
- **Content drift detection** (2026-04-17): `scripts/audit-drift.js`, `scripts/audit-pairing.js` 강화
- **Codex v1 hook 호환성 분류**: `scripts/codex-hook-compat.js` + `src/claude/_meta/codex-portability.json`
- Phase 4 Codex 통합 (2026-04-07, [83766af](https://github.com/CtrlCVbot/claude-kit/commit/83766af))

### Changed
- `src/{domain}/` → `src/claude/{domain}/` 타깃 분리 구조로 마이그레이션
- `setup.js` 에 `SRC_CLAUDE` / `SRC_CODEX` / `TEMPLATES` 분리 상수 도입
- `CLAUDE.md` / `AGENTS.md` 렌더링을 도메인별 블록 조합 방식으로 전환 (`src/templates/claude-md/`)
- 블루프린트 Fast-Track 가이드 반영

### Fixed
- Codex v1 리뷰 피드백 6개 이슈 ([6d6f1f5](https://github.com/CtrlCVbot/claude-kit/commit/6d6f1f5))
- 코드 리뷰 이슈 HIGH 2 + MEDIUM 5 + LOW 4 ([6338816](https://github.com/CtrlCVbot/claude-kit/commit/6338816))
- team-orchestration 문서 4가지 충돌 정리

---

## [2.0.0] - 2026-03-25

AI 거버넌스 인프라 초기 릴리스 + 도메인 분리 도입.

### Added
- **도메인 분리 아키텍처**: `core` / `dev` / `plan` (opt-in)
- **TDD 강제**: `dev-tdd-guard.js` (Edit|Write blocking, TypeScript/Java/Python 지원)
- **Governance guards**: `dev-db-guard.js` (DB 위험 명령), `dev-feature-scope-guard.js` (범위 초과 편집)
- **plan 파이프라인**: `/plan-idea` → `/plan-screen` → `/plan-draft` → `/plan-prd` → `/plan-bridge`
- **plan 아카이브·개선 시스템**: `/plan-archive`, `/plan-improve`
- **아이디어 상태별 폴더 구조**: `.plans/ideas/00-inbox/`, `10-screened/` + 명시적 승인 게이트
- **team-orchestration 운영 모델** 문서화
- **블루프린트 Fast-Track 가이드**

### Changed
- 초기 디렉터리 구조에서 도메인 분리 구조로 전환

---

## Prior to v2.0.0

v2.0.0 이전의 변경 이력은 **git log 에서 직접 확인** 하세요. 공식 릴리스 노트는 보존되지 않았습니다.

```bash
git log --until=2026-03-25 --oneline
```

---

## 관리 지침

### Unreleased 섹션 유지
- 새 변경은 `[Unreleased]` 아래 해당 카테고리(Added/Changed/Deprecated/Removed/Fixed/Security)에 추가
- 릴리스 시점에 `[Unreleased]` → `[X.Y.Z] - YYYY-MM-DD` 로 승격

### 카테고리
- **Added**: 새 기능
- **Changed**: 기존 기능 변경 (파괴적이지 않은)
- **Deprecated**: 향후 제거 예정
- **Removed**: 제거됨 (Breaking 표시 권장)
- **Fixed**: 버그 수정
- **Security**: 보안 수정

### 릴리스 절차
`docs/40-contributing/04-release-checklist.md` 참조.
