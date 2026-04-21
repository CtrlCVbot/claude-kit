'use strict';
/**
 * task-id.js — IMP-KIT-015 TASK ID 네이밍 표준 유틸
 *
 * 4패턴 정규식 + validateTaskId / detectDomain / suggestFix.
 * 관련 상수: src/claude/core/_constants/task-id-patterns.json
 * 관련 규칙: src/claude/core/rules/task-id-naming.md
 * Claude peer/Codex sibling: src/codex/core/_utils/task-id.js
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-015-task-id-naming.md
 */

const TASK_ID_PATTERNS = {
  dev:    /^T-[A-Z]{2,6}-\d{2,3}$/,
  plan:   /^TASK-[a-z0-9-]{3,40}-\d{2,3}$/,
  legacy: /^LEGACY-[A-Z]{2,6}-\d{2,3}$/,
  spike:  /^SPIKE-[A-Z]{2,6}-\d{2,3}$/
};

/**
 * TASK ID가 지정 도메인 패턴에 매칭되는지 검증.
 * @param {string} id
 * @param {'dev'|'plan'|'legacy'|'spike'} domain
 * @returns {boolean}
 */
function validateTaskId(id, domain) {
  if (!id || typeof id !== 'string') return false;
  const pattern = TASK_ID_PATTERNS[domain];
  if (!pattern) return false;
  return pattern.test(id);
}

/**
 * 어떤 도메인 패턴에 매칭되는지 자동 감지.
 * @param {string} id
 * @returns {'dev'|'plan'|'legacy'|'spike'|null}
 */
function detectDomain(id) {
  if (!id || typeof id !== 'string') return null;
  for (const domain of ['legacy', 'spike', 'dev', 'plan']) {
    if (TASK_ID_PATTERNS[domain].test(id)) return domain;
  }
  return null;
}

/**
 * 무효한 ID를 지정 도메인 형식으로 수정 제안.
 * 이미 유효하면 null 반환.
 * @param {string} id
 * @param {'dev'|'plan'|'legacy'|'spike'} domain
 * @returns {string|null}
 */
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
  // 이미 접두사가 있으면 그대로, 아니면 추가
  const hasPrefix = ['T-', 'TASK-', 'LEGACY-', 'SPIKE-'].some(p => id.startsWith(p));
  return hasPrefix ? id : prefix + id;
}

module.exports = {
  validateTaskId,
  detectDomain,
  suggestFix,
  TASK_ID_PATTERNS
};
