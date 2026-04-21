#!/usr/bin/env node
/**
 * Metric #7 — /plan-review 수동 호출 = 0 검증
 *
 * Phase 2.1 IMP-KIT-007 구현 시 실제 로직으로 교체:
 *  - `.claude/logs/command-invocations.jsonl` 분석
 *  - `/plan-review` 호출 중 `source == "auto"` 비율 계산
 *  - 수동 호출 0건 확인 → exit 0 / 실패 → exit 1
 *
 * 현재는 placeholder — CI에서 exit 0 반환.
 */
console.log('[verify-auto-review] 2.3.0 지표 #7 측정 스크립트 (Phase 2.1 IMP-KIT-007 구현 예정)')
console.log('[verify-auto-review] placeholder — 실제 측정 로직 미구현, 통과 처리')
process.exit(0)
