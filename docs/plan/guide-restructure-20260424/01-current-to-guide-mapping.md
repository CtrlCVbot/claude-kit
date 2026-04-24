# 현재 active docs -> 신규 `docs/guide` 구조 매핑

## 핵심 매핑

| 현재 섹션 | 현재 처리 | 새 canonical entry |
|---|---|---|
| `docs/README.md` | bridge | `docs/guide/README.md` |
| `docs/00-overview/**` | archive + bridge | `docs/guide/shared/**`, `docs/guide/mapping/**`, `docs/guide/sync/**` |
| `docs/10-features/**` | archive + bridge | `docs/guide/claude-code/**`, `docs/guide/codex/**`, `docs/guide/mapping/**` |
| `docs/20-user-guide/**` | archive + bridge | `docs/guide/shared/**`, `docs/guide/claude-code/**`, `docs/guide/codex/**` |
| `docs/30-reference/**` | active support reference 유지 | guide 본문에서 링크 |
| `docs/40-contributing/**` | archive + bridge | `docs/guide/claude-code/**`, `docs/guide/sync/**` |