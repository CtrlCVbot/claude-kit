'use strict';
/**
 * bridge-phase-a.js — IMP-KIT-012 bridge ↔ dev-feature Phase A 경계 유틸
 *
 * plan-bridge-writer가 초안(의도 수준) 생성 시 <!-- bridge:section --> 마커 주입.
 * dev-feature Phase A가 Bridge 섹션을 수정하지 않고 "Phase A 상세" append-only.
 * canEdit() 유틸로 Phase별 책임 매트릭스 검증.
 *
 * Claude peer/Codex sibling: src/codex/plan/boundary/bridge-phase-a.js
 * 책임 매트릭스 SSOT: src/claude/core/_constants/bridge-phase-a-matrix.json
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-012-bridge-phase-a-boundary.md
 */

const BRIDGE_MARKER = {
  start: '<!-- bridge:section -->',
  end: '<!-- /bridge:section -->'
};

const PHASE_A_SECTION = '## Phase A 상세';

const RESPONSIBILITY_MATRIX = {
  'feature-intent.md': {
    bridge: ['intent', 'purpose'],
    'phase-a': ['acceptance-detail', 'requirement-elaboration']
  },
  'stakeholder-matrix.md': {
    bridge: ['key-stakeholders'],
    'phase-a': ['raci-matrix']
  },
  'dependency-graph.md': {
    bridge: ['high-level-dependencies'],
    'phase-a': ['file-module-dependencies']
  },
  'risk-register.md': {
    bridge: ['major-risks'],
    'phase-a': ['mitigation-actions']
  },
  'acceptance-criteria.md': {
    bridge: ['criteria-headlines'],
    'phase-a': ['given-when-then']
  }
};

/**
 * Phase가 해당 field를 편집할 수 있는지 검증.
 * @param {object} input
 * @returns {{allowed: boolean, warning?: string, reason?: string}}
 */
function canEdit(input) {
  const opts = input || {};
  const phase = String(opts.phase || '').toLowerCase();
  const field = opts.field;
  const file = opts.file;

  const matrix = RESPONSIBILITY_MATRIX[file];
  if (!matrix) {
    return {
      allowed: true,
      warning: '매트릭스에 등록되지 않은 파일: ' + file + '. 기본 허용.'
    };
  }

  // bridge phase는 bridge 책임 필드 편집 가능
  if (phase === 'bridge' && matrix.bridge.includes(field)) {
    return { allowed: true };
  }

  // Phase A는 phase-a 책임 필드만 편집 가능
  if (phase === 'a' && matrix['phase-a'].includes(field)) {
    return { allowed: true };
  }

  // Phase A가 bridge 책임 필드 수정 시도 → 차단
  if (phase === 'a' && matrix.bridge.includes(field)) {
    return {
      allowed: false,
      reason: 'Phase A는 bridge 책임 섹션(' + field + ')을 수정할 수 없습니다. Bridge 단계로 돌아가거나 Phase A 상세 섹션에 append하세요.'
    };
  }

  return {
    allowed: true,
    warning: '매트릭스에 명시되지 않은 조합 (' + phase + '/' + field + '). 기본 허용.'
  };
}

/**
 * markdown 내용에서 <!-- bridge:section --> 마커로 둘러싸인 섹션 추출.
 * @param {string} content
 * @returns {string[]}
 */
function extractBridgeSections(content) {
  if (!content || typeof content !== 'string') return [];
  const sections = [];
  const startMarker = BRIDGE_MARKER.start;
  const endMarker = BRIDGE_MARKER.end;
  let idx = 0;
  while (true) {
    const start = content.indexOf(startMarker, idx);
    if (start === -1) break;
    const end = content.indexOf(endMarker, start + startMarker.length);
    if (end === -1) break;
    const section = content.slice(start + startMarker.length, end).trim();
    sections.push(section);
    idx = end + endMarker.length;
  }
  return sections;
}

module.exports = {
  canEdit,
  extractBridgeSections,
  BRIDGE_MARKER,
  PHASE_A_SECTION,
  RESPONSIBILITY_MATRIX
};
