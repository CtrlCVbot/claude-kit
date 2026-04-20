# Changelog

All notable changes to claude-kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

다음 릴리스: **v2.2.1** (hotfix — IMP-KIT-027 `/plan-design` + wireframe 후속 단계 택일 구조). 스펙 `ready-to-implement` 상태.

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

- `docs/plan/kit-2.2.0-roadmap/` — 2.2.0 로드맵 문서 패키지 (14개 문서, [`466665d`](https://github.com/CtrlCVbot/claude-kit/commit/466665d))
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
