'use strict';
/**
 * plan-wireframe-checklist.js — IMP-KIT-010 Pre-render 체크리스트 유틸
 *
 * plan-wireframe-designer 에이전트가 산출물 생성 후 본 유틸로 자체 검증.
 * 4항목 (filled-mock-data / pii-masking / viewports / decision-log) 미충족 시 재생성 루프.
 *
 * Claude peer/Codex sibling: src/codex/plan/agents/plan-wireframe-checklist.js
 * PII 마스킹 규칙: src/claude/plan/_constants/pii-masking-rules.json
 * decision-log 템플릿: src/claude/plan/_templates/decision-log.template.md
 * 스펙: docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-010-wireframe-checklist.md
 */

const REQUIRED_VIEWPORTS = ['1440', '1280', '1024', '768', '390'];
const MIN_DECISION_LOG_ENTRIES = 3;

/**
 * Pre-render 4항목 검증.
 * @param {object} [input]
 * @returns {{passed: boolean, missing: string[]}}
 */
function validateWireframePrerender(input) {
  const opts = input || {};
  const missing = [];

  if (!opts.hasFilledMockData) missing.push('filled-mock-data');
  if (!opts.hasPiiMasking) missing.push('pii-masking');

  const viewports = Array.isArray(opts.viewports) ? opts.viewports : [];
  const hasAllViewports = REQUIRED_VIEWPORTS.every(vp => viewports.includes(vp));
  if (!hasAllViewports) missing.push('viewports');

  const decisionLogEntries = typeof opts.decisionLogEntries === 'number' ? opts.decisionLogEntries : 0;
  if (decisionLogEntries < MIN_DECISION_LOG_ENTRIES) missing.push('decision-log');

  return {
    passed: missing.length === 0,
    missing
  };
}

/**
 * PII 마스킹 규칙 적용 (전화번호, 사업자번호).
 * @param {string} text
 * @returns {string}
 */
function applyPiiMasking(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;

  // 전화번호: 010-1234-5678 → 010-****-5678 (이미 * 포함 시 skip)
  result = result.replace(/\b(\d{3})-(\d{3,4})-(\d{4})\b/g, (match, p1, p2, p3) => {
    if (match.includes('*')) return match;
    return p1 + '-' + '*'.repeat(p2.length) + '-' + p3;
  });

  // 사업자번호: 123-45-67890 → ***-**-***** (10자리)
  result = result.replace(/\b(\d{3})-(\d{2})-(\d{5})\b/g, (match) => {
    if (match.includes('*')) return match;
    return '***-**-*****';
  });

  return result;
}

module.exports = {
  validateWireframePrerender,
  applyPiiMasking,
  REQUIRED_VIEWPORTS,
  MIN_DECISION_LOG_ENTRIES
};
