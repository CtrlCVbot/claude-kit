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

<!-- kit:managed:start -->
## claude-kit 활성 구성

- domains: core, dev | targets: claude | version: 2.1.0
- Kit 관리 영역. 아래 섹션들은 `pnpm claude-kit:setup` 실행 시 재생성된다. 직접 편집 지양.

## dev 도메인

- **TDD 가드**: `dev-tdd-guard.js`가 테스트 없는 구현(`Edit|Write`)을 차단한다.
- **DB 가드**: `dev-db-guard.js`가 위험한 DB 명령(`Bash`)을 차단한다.
- **Feature Scope 가드**: `dev-feature-scope-guard.js`가 Feature Package 범위 밖 편집을 경고한다.
- **주요 커맨드**
  - `/dev-feature <prd-path>` — PRD를 읽어 Feature Package 생성
  - `/dev-run <package-path>` — TASK별 TDD 자동 구현 루프
  - `/dev-verify`, `/dev-verify-all` — DVC(Document-Verification Consistency) 검증
  - `/dev-commit`, `/dev-commit-push-pr` — 커밋 및 PR 생성
- **주요 서브에이전트**: `dev-architect`, `dev-code-reviewer`, `dev-security-reviewer`, `dev-database-reviewer`, `dev-doc-updater`, `dev-verify-agent`

# currentDate
Today's date is 2026-04-16.
<!-- kit:managed:end -->
