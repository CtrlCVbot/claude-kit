'use strict';
/**
 * plan-dev-gate.js — IMP-KIT-013 (Codex sibling)
 * Claude peer: src/claude/plan/agents/plan-dev-gate.js (동일 로직)
 */

const DEV_GATE_ITEMS = [
  { key: 'legacy-isolation',  title: 'Legacy 격리',      desc: '기존 코드 중 Feature 범위 내 Legacy 식별 → LEGACY-{AREA}-{NN} 접두사 TASK로 분리' },
  { key: 'task-id-pattern',   title: 'TASK ID 네이밍',    desc: 'T-{AREA}-{NN} (dev) / TASK-{SLUG}-{NN} (plan) 규칙 준수' },
  { key: 'dependencies',      title: '의존 Feature 식별', desc: '선행 완료 필수 Feature slug 목록' },
  { key: 'migration-type',    title: '데이터 마이그레이션 유무', desc: 'DB 스키마 변경 여부 + 듀얼 타깃 영향' }
];

function buildDevGateSection(input) {
  const opts = input || {};
  const scope = String(opts.scope || '').toLowerCase();
  const featureType = String(opts.featureType || '').toLowerCase();
  if (scope !== 'standard') return '';
  if (featureType !== 'dev') return '';

  const lines = [
    '## Dev 착수 전 확인 (IMP-KIT-013)',
    '',
    '> Standard dev Feature Draft에 자동 주입되는 4항목 체크리스트.',
    ''
  ];
  DEV_GATE_ITEMS.forEach((item) => {
    lines.push('- [ ] **' + item.title + '**: ' + item.desc);
  });
  return lines.join('\n');
}

function validateDevGate(input) {
  const opts = input || {};
  const missing = [];
  if (!opts.legacyIsolationChecked) missing.push('legacy-isolation');
  if (!opts.taskIdPatternSelected) missing.push('task-id-pattern');
  if (!opts.dependenciesIdentified) missing.push('dependencies');
  if (!opts.migrationTypeDecided) missing.push('migration-type');
  return { passed: missing.length === 0, missing };
}

module.exports = { buildDevGateSection, validateDevGate, DEV_GATE_ITEMS };
