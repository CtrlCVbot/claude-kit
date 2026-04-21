'use strict';
/**
 * plan-wireframe-checklist.js — IMP-KIT-010 (Codex sibling)
 * Claude peer: src/claude/plan/agents/plan-wireframe-checklist.js (동일 로직)
 */

const REQUIRED_VIEWPORTS = ['1440', '1280', '1024', '768', '390'];
const MIN_DECISION_LOG_ENTRIES = 3;

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

function applyPiiMasking(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;

  result = result.replace(/\b(\d{3})-(\d{3,4})-(\d{4})\b/g, (match, p1, p2, p3) => {
    if (match.includes('*')) return match;
    return p1 + '-' + '*'.repeat(p2.length) + '-' + p3;
  });

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
