# Codex-Skip 대상 레지스트리

> Codex 전환 대상에서 제외되는 컴포넌트 목록과 사유

## Hook Skip (2개)

| Identity | 타입 | 도메인 | 사유 |
|----------|------|--------|------|
| output-secret-filter | hook | core | `CLAUDE_REMOTE_SESSION` 환경변수 의존. Codex runtime에서 재현 불가 |
| session-wrap-suggest | hook | core | Claude Stop 이벤트 + tmpdir 마커 의존. Codex runtime 호환 미확인 |

## Rule Skip (6개)

| Identity | 타입 | 도메인 | 사유 |
|----------|------|--------|------|
| coding-style | rule | core | claude-origin shared guidance. Codex에서는 AGENTS.md로 소비 |
| date-calculation | rule | core | claude-origin shared guidance |
| golden-principles | rule | core | claude-origin shared guidance |
| interaction | rule | core | claude-origin shared guidance |
| security | rule | core | claude-origin shared guidance |
| verification | rule | core | claude-origin shared guidance |

## 총계

- Hook skip: 2개
- Rule skip: 6개
- **합계: 8개**

## 참고

- 이 문서는 변환 규칙 참조용 (문서).
- Phase 4c 이후 런타임 면제 판단은 `src/exception-registry.json`이 담당한다.
- `scripts/codex-hook-compat.js`의 `isCodexCompatible()` 결과와 일치해야 한다.
