'use strict';
/**
 * plan-dev-gate.js — IMP-KIT-013 Dev Gate Draft 조기 플래그 유틸
 *
 * plan-draft-writer 에이전트가 Standard dev/hybrid Feature Draft 작성 시
 * buildDevGateSection()으로 "Dev 착수 전 확인" 섹션 생성 후 Draft 산출물에 주입.
 * validateDevGate()는 Phase B 진입 시점에 4항목 충족 검증.
 *
 * Claude peer/Codex sibling: src/codex/plan/agents/plan-dev-gate.js
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-013-dev-gate-draft-flag.md
 */

const DEV_GATE_ITEMS = [
  { key: 'legacy-isolation',  title: 'Legacy 격리',      desc: '기존 코드 중 Feature 범위 내 Legacy 식별 → LEGACY-{AREA}-{NN} 접두사 TASK로 분리' },
  { key: 'task-id-pattern',   title: 'TASK ID 네이밍',    desc: 'T-{AREA}-{NN} (dev) / TASK-{SLUG}-{NN} (plan) 규칙 준수 (IMP-KIT-015 참조)' },
  { key: 'dependencies',      title: '의존 Feature 식별', desc: '선행 완료 필수 Feature slug 목록 (없으면 "독립")' },
  { key: 'migration-type',    title: '데이터 마이그레이션 유무', desc: 'DB 스키마 변경 여부 + Codex 듀얼 타깃 영향' }
];

/**
 * Dev Gate 섹션 markdown 생성.
 * Standard dev/hybrid Feature에만 섹션 반환, 그 외 빈 문자열.
 * @param {object} input
 * @returns {string}
 */
function buildDevGateSection(input) {
  const opts = input || {};
  const scope = String(opts.scope || '').toLowerCase();
  const featureType = String(opts.featureType || '').toLowerCase();

  // Lite 또는 copy Feature는 섹션 주입 생략
  if (scope !== 'standard') return '';
  if (featureType !== 'dev') return '';

  const lines = [
    '## Dev 착수 전 확인 (IMP-KIT-013)',
    '',
    '> Standard dev Feature Draft에 자동 주입되는 4항목 체크리스트. Dev Phase B 진입 전 모두 충족 권장.',
    ''
  ];

  DEV_GATE_ITEMS.forEach((item, idx) => {
    lines.push('- [ ] **' + item.title + '**: ' + item.desc);
  });

  lines.push('');
  lines.push('> 자동 검증: `validateDevGate()` (src/claude/plan/agents/plan-dev-gate.js). routing-metadata `dev_gate_flagged: true` 기록.');

  return lines.join('\n');
}

/**
 * 4항목 충족 검증.
 * @param {object} [input]
 * @returns {{passed: boolean, missing: string[]}}
 */
function validateDevGate(input) {
  const opts = input || {};
  const missing = [];

  if (!opts.legacyIsolationChecked) missing.push('legacy-isolation');
  if (!opts.taskIdPatternSelected) missing.push('task-id-pattern');
  if (!opts.dependenciesIdentified) missing.push('dependencies');
  if (!opts.migrationTypeDecided) missing.push('migration-type');

  return {
    passed: missing.length === 0,
    missing
  };
}

module.exports = {
  buildDevGateSection,
  validateDevGate,
  DEV_GATE_ITEMS
};
