# Changelog

All notable changes to claude-kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

다음 릴리스: **v2.2.0** 권장 (MINOR — feature 추가, breaking 은 저장소 variant 한정).

### Added
- 문서 패키지 5계층 재구축 (`docs/00-overview`, `10-features`, `20-user-guide`, `30-reference`, `40-contributing`) — 31개 문서 드래프트 + reference 6개 자동 생성
- `scripts/docs-generate.js` — commands/agents/skills/hooks/rules/pairing-registry reference 자동 생성기 + `--check` drift 검증
- `docs/archive/2026-04-17/` — 이전 설계·리뷰 이력 동결 (14개 디렉터리 + `_guide/` 14개 파일)
- `docs/plan/documentation-package-plan.md` — 재구축 계획서
- copy 도메인 5개 hook 에 Hook/Event/Action 정형 JSDoc (reference 자동 생성 품질 향상)

### Changed
- 루트 `README.md` "저장소 문서" 섹션을 신규 docs 트리로 전면 갱신
- `docs/30-reference/05-rules.md` summary 추출 로직 — blockquote 내 markdown 링크를 텍스트로 치환
- 04-release-checklist.md, 01-development-setup.md 외 contributing 문서의 `check:quickstart` 언급 정리

### Removed
- **Breaking (저장소 variant 한정)**: `scripts/generate-quickstart-doc.js` 제거. 설치본 `CLAUDE-KIT-QUICKSTART.md` 하나로 단일화 (setup.js 가 quickstart-renderer 직접 호출 경로는 유지)
- **Breaking (npm scripts)**: `package.json` 에서 `generate:quickstart`, `check:quickstart` 스크립트 제거
- `docs/guide/` 14개 파일 → `docs/archive/2026-04-17/_guide/` 로 이동

### Migration (Unreleased → 2.2.0)
- `pnpm check:quickstart` CI 게이트를 쓰던 경우 → `pnpm check:docs` 로 대체 (reference drift 검증)
- `docs/guide/...` 링크가 외부에 있다면 → `docs/archive/2026-04-17/_guide/...` 또는 신규 `docs/20-user-guide/...` 로 갱신

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
