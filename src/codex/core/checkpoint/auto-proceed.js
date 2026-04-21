'use strict';
/**
 * auto-proceed.js — IMP-KIT-016 Checkpoint 자동 진행 유틸 (Codex sibling)
 *
 * Claude peer: src/claude/core/checkpoint/auto-proceed.js (동일 로직)
 * 정책 문서: src/codex/core/rules/checkpoint-policy.md
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md
 */

const path = require('path');
const fs = require('fs');

const CRITICAL_WHITELIST = [
  'destructive',
  'external-api-call',
  'breaking-change',
  'initial-approval-gate'
];

function isCritical(type) {
  if (!type || typeof type !== 'string') return false;
  return CRITICAL_WHITELIST.includes(type);
}

function decideCheckpoint(input) {
  const opts = input || {};
  const type = opts.type;
  const reviewResult = opts.reviewResult;
  const autoProceedOnPass = !!opts.autoProceedOnPass;

  if (isCritical(type)) {
    return {
      action: 'halt',
      userPromptRequired: true,
      reason: 'critical-whitelist: ' + type
    };
  }

  if (!autoProceedOnPass) {
    return { action: 'halt', userPromptRequired: true };
  }

  if (reviewResult === 'PASS') {
    return { action: 'proceed', userPromptRequired: false };
  }

  return {
    action: 'halt',
    userPromptRequired: true,
    reason: 'reviewResult=' + (reviewResult || 'UNKNOWN')
  };
}

function loadCriticalWhitelist() {
  try {
    const jsonPath = path.resolve(__dirname, '..', '_constants', 'critical-checkpoints.json');
    if (!fs.existsSync(jsonPath)) return CRITICAL_WHITELIST;
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const types = Array.isArray(data.whitelist)
      ? data.whitelist.map(e => e && e.type).filter(Boolean)
      : [];
    return types.length ? types : CRITICAL_WHITELIST;
  } catch {
    return CRITICAL_WHITELIST;
  }
}

module.exports = {
  decideCheckpoint,
  isCritical,
  loadCriticalWhitelist,
  CRITICAL_WHITELIST
};
