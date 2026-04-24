## Claude / Codex 차이

{{TARGET_DIFF_NOTE}}

| 항목 | Claude | Codex |
|------|--------|-------|
{{TARGET_DIFF_ROWS}}

- 공통점: 같은 `core/dev/plan` 흐름을 공유한다.
- 차이점: 설치 결과 경로, 컨텍스트 문서, hooks/rules 반영 방식이 다르다.
- Codex hooks는 부분 지원이다. 공식 지원/검증 필요/skip 분류는 `src/claude/_meta/codex-portability.json`과 `scripts/codex-hook-compat.js`를 기준으로 보며, `Edit|Write` matcher 기반 hook은 현재 Codex에서 제한될 수 있다.
- `session-wrap-suggest.js`는 Claude session state 의존성 때문에 Codex plugin hook에서 의도적으로 제외되며, skill fallback으로 다룬다.
