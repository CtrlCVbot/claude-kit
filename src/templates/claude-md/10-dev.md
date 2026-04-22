## dev 도메인

- **TDD 가드**: `dev-tdd-guard.js`가 테스트 없는 구현(`Edit|Write`)을 차단한다.
- **DB 가드**: `dev-db-guard.js`가 위험한 DB 명령(`Bash`)을 차단한다.
- **Feature Scope 가드**: `dev-feature-scope-guard.js`가 Feature Package 범위 밖 편집을 경고한다.
- **주요 커맨드**
  - `/dev-feature <prd-path>` — PRD를 읽어 Feature Package 생성
  - `/dev-run <package-path>` — TASK별 TDD 자동 구현 루프
  - `/dev-verify`, `/dev-verify-all` — DVC(Document-Verification Consistency) 검증
  - `/dev-commit`, `/dev-commit-push-pr` — 커밋 및 PR 생성
- **주요 서브에이전트**: `dev-architect`, `dev-code-reviewer`, `dev-security-reviewer`, `dev-database-reviewer`, `dev-doc-updater`, `dev-verify-agent`, `dev-implementer` (IMP-AGENT-005, `/dev-run` 기본 디스패치)
- **에이전트 계약 (v2.3.1)**
  - 리뷰 출력 표준화 (IMP-AGENT-002): code/security/database reviewer 출력 포맷 통일
  - edit-coordinates v1.1 (IMP-AGENT-001): dev-architect → dev-doc-updater 체이닝 시 `binding_updates` 필드로 architecture-binding 동기화
  - archive guard 프롬프트 (IMP-AGENT-003): archive 원본 불변 보호
  - 도메인 간 핸드오프 (IMP-AGENT-007): plan → dev → copy 크로스 링크
  - frontmatter v1.1 (IMP-AGENT-008): `team_owner` / `release_stage` / `schema_version` 필드 표준
