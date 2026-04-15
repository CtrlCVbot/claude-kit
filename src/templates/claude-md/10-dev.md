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
