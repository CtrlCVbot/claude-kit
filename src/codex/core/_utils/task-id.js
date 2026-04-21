'use strict';
/**
 * task-id.js — IMP-KIT-015 TASK ID 네이밍 유틸 (Codex sibling)
 * Claude peer: src/claude/core/_utils/task-id.js (동일 로직)
 */

const TASK_ID_PATTERNS = {
  dev:    /^T-[A-Z]{2,6}-\d{2,3}$/,
  plan:   /^TASK-[a-z0-9-]{3,40}-\d{2,3}$/,
  legacy: /^LEGACY-[A-Z]{2,6}-\d{2,3}$/,
  spike:  /^SPIKE-[A-Z]{2,6}-\d{2,3}$/
};

function validateTaskId(id, domain) {
  if (!id || typeof id !== 'string') return false;
  const pattern = TASK_ID_PATTERNS[domain];
  if (!pattern) return false;
  return pattern.test(id);
}

function detectDomain(id) {
  if (!id || typeof id !== 'string') return null;
  for (const domain of ['legacy', 'spike', 'dev', 'plan']) {
    if (TASK_ID_PATTERNS[domain].test(id)) return domain;
  }
  return null;
}

function suggestFix(id, domain) {
  if (!id || validateTaskId(id, domain)) return null;
  const prefixMap = {
    dev: 'T-',
    plan: 'TASK-',
    legacy: 'LEGACY-',
    spike: 'SPIKE-'
  };
  const prefix = prefixMap[domain];
  if (!prefix) return null;
  const hasPrefix = ['T-', 'TASK-', 'LEGACY-', 'SPIKE-'].some(p => id.startsWith(p));
  return hasPrefix ? id : prefix + id;
}

module.exports = {
  validateTaskId,
  detectDomain,
  suggestFix,
  TASK_ID_PATTERNS
};
