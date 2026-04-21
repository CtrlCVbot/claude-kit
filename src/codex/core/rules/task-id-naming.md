# TASK ID 네이밍 표준 (Codex)

> **결론**: IMP-KIT-015. Claude peer: `src/claude/core/rules/task-id-naming.md` (동일 규칙).

**정규식 SSOT**: `src/codex/core/_constants/task-id-patterns.json`
**유틸**: `src/codex/core/_utils/task-id.js`

## 1. 4패턴

| 도메인 | 패턴 | 예시 |
|--------|------|------|
| dev | `T-{AREA}-{NN}` | `T-HERO-01` |
| plan | `TASK-{SLUG}-{NN}` | `TASK-hero-refresh-03` |
| legacy | `LEGACY-{AREA}-{NN}` | `LEGACY-AUTH-07` |
| spike | `SPIKE-{AREA}-{NN}` | `SPIKE-PERF-02` |

## 2. 마이그레이션 (BC-2.3.0-01)

2.3.0: 경고 수준 → 2.4.0+: 차단.

## 3. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Codex sibling) | Claude (메인테이너 역할) |
