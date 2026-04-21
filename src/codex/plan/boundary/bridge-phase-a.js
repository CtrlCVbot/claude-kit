'use strict';
/**
 * bridge-phase-a.js — IMP-KIT-012 (Codex sibling)
 * Claude peer: src/claude/plan/boundary/bridge-phase-a.js (동일 로직)
 */

const BRIDGE_MARKER = {
  start: '<!-- bridge:section -->',
  end: '<!-- /bridge:section -->'
};

const PHASE_A_SECTION = '## Phase A 상세';

const RESPONSIBILITY_MATRIX = {
  'feature-intent.md': { bridge: ['intent', 'purpose'], 'phase-a': ['acceptance-detail', 'requirement-elaboration'] },
  'stakeholder-matrix.md': { bridge: ['key-stakeholders'], 'phase-a': ['raci-matrix'] },
  'dependency-graph.md': { bridge: ['high-level-dependencies'], 'phase-a': ['file-module-dependencies'] },
  'risk-register.md': { bridge: ['major-risks'], 'phase-a': ['mitigation-actions'] },
  'acceptance-criteria.md': { bridge: ['criteria-headlines'], 'phase-a': ['given-when-then'] }
};

function canEdit(input) {
  const opts = input || {};
  const phase = String(opts.phase || '').toLowerCase();
  const field = opts.field;
  const file = opts.file;

  const matrix = RESPONSIBILITY_MATRIX[file];
  if (!matrix) return { allowed: true, warning: '매트릭스 외 파일: ' + file };

  if (phase === 'bridge' && matrix.bridge.includes(field)) return { allowed: true };
  if (phase === 'a' && matrix['phase-a'].includes(field)) return { allowed: true };

  if (phase === 'a' && matrix.bridge.includes(field)) {
    return {
      allowed: false,
      reason: 'Phase A는 bridge 책임 섹션(' + field + ')을 수정할 수 없습니다.'
    };
  }

  return { allowed: true, warning: '매트릭스 외 조합: ' + phase + '/' + field };
}

function extractBridgeSections(content) {
  if (!content || typeof content !== 'string') return [];
  const sections = [];
  let idx = 0;
  while (true) {
    const start = content.indexOf(BRIDGE_MARKER.start, idx);
    if (start === -1) break;
    const end = content.indexOf(BRIDGE_MARKER.end, start + BRIDGE_MARKER.start.length);
    if (end === -1) break;
    sections.push(content.slice(start + BRIDGE_MARKER.start.length, end).trim());
    idx = end + BRIDGE_MARKER.end.length;
  }
  return sections;
}

module.exports = { canEdit, extractBridgeSections, BRIDGE_MARKER, PHASE_A_SECTION, RESPONSIBILITY_MATRIX };
