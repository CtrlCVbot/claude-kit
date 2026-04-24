<!--
IMP-KIT-013 — Dev Gate 체크리스트 템플릿
유틸: src/claude/plan/agents/plan-dev-gate.js의 buildDevGateSection()이 동일 구조 생성.
-->

## Dev 착수 전 확인 (IMP-KIT-013)

> Standard dev Feature Draft에 자동 주입되는 4항목 체크리스트. Dev Phase B 진입 전 모두 충족 권장.

- [ ] **Legacy 격리**: 기존 코드 중 Feature 범위 내 Legacy 식별 → `LEGACY-{AREA}-{NN}` 접두사 TASK로 분리
- [ ] **TASK ID 네이밍**: `T-{AREA}-{NN}` (dev) / `TASK-{SLUG}-{NN}` (plan) 규칙 준수 (IMP-KIT-015)
- [ ] **의존 Feature 식별**: 선행 완료 필수 Feature slug 목록 (없으면 "독립")
- [ ] **데이터 마이그레이션 유무**: DB 스키마 변경 여부 + Codex 듀얼 타깃 영향

> 자동 검증: `validateDevGate()`. routing-metadata `dev_gate_flagged: true` 기록.
