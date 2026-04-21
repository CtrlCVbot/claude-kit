'use strict';
/**
 * issue-detectors.js — kit-feedback-archiving Phase 3.2.1 (Codex sibling)
 * Claude peer: src/claude/core/collectors/issue-detectors.js (동일 로직)
 */

const ISSUE_TYPES = [
  'permission_mismatch', 'framework_drift', 'cache_error', 'missing_agent',
  'undefined_mode', 'checkpoint_imbalance', 'duplication', 'trust_only',
  'truncation_ignored', 'other'
];

const SEVERITY_LEVELS = ['P0', 'P1', 'P2'];

function extractDomain(command) {
  if (!command || typeof command !== 'string') return 'core';
  const trimmed = command.trim().replace(/^\/+/, '');
  if (trimmed.startsWith('plan-')) return 'plan';
  if (trimmed.startsWith('copy-')) return 'copy';
  if (trimmed.startsWith('dev-')) return 'dev';
  return 'core';
}

function _base(type, severity, description, evidence, related) {
  return { type, severity, description, evidence: evidence || {}, related_imp_kit_id: related || null };
}

function detectPermissionMismatch(input) {
  const transcript = (input && typeof input.transcript === 'string') ? input.transcript : '';
  const match = transcript.match(/Tool\s+['"]?(\w+)['"]?\s+(?:is\s+)?not\s+available\s+for\s+agent\s+['"]?([\w-]+)['"]?/i);
  if (match) {
    return Object.assign({ detected: true },
      _base('permission_mismatch', 'P0',
        `Agent '${match[2]}' lacks tool '${match[1]}'`,
        { log_excerpt: match[0] }, 'IMP-KIT-001'));
  }
  return { detected: false };
}

function detectFrameworkDrift(input) {
  const opts = input || {};
  const transcript = typeof opts.transcript === 'string' ? opts.transcript : '';
  const declared = opts.declaredFramework;

  if (/framework\s+drift/i.test(transcript)) {
    return Object.assign({ detected: true },
      _base('framework_drift', 'P1', 'Explicit drift warning',
        { log_excerpt: transcript.match(/.{0,80}framework\s+drift.{0,80}/i)[0] }, 'IMP-KIT-002'));
  }
  if (declared) {
    const actualMentions = { rice: /\b(RICE)\s+점수/i, '5axis': /\b(5축|5axis)/i };
    for (const [fw, re] of Object.entries(actualMentions)) {
      if (re.test(transcript) && fw !== declared.toLowerCase()) {
        return Object.assign({ detected: true },
          _base('framework_drift', 'P1',
            `Declared framework=${declared} but transcript uses ${fw}`,
            { log_excerpt: transcript.match(re)?.[0] || '' }, 'IMP-KIT-002'));
      }
    }
  }
  return { detected: false };
}

function detectCacheError(input) {
  const transcript = (input && typeof input.transcript === 'string') ? input.transcript : '';
  if (/File\s+has\s+not\s+been\s+read\s+yet/i.test(transcript)) {
    return Object.assign({ detected: true },
      _base('cache_error', 'P1', 'Read cache invalidation detected',
        { log_excerpt: transcript.match(/.{0,80}File\s+has\s+not\s+been\s+read\s+yet.{0,80}/i)[0] }, 'IMP-KIT-005'));
  }
  return { detected: false };
}

function detectCheckpointImbalance(input) {
  const count = (input && typeof input.humanCheckpoints === 'number') ? input.humanCheckpoints : 0;
  if (count >= 7) {
    return Object.assign({ detected: true },
      _base('checkpoint_imbalance', 'P0', `Session accumulated ${count} Human Checkpoints`, { count }, 'IMP-KIT-016'));
  }
  if (count >= 3) {
    return Object.assign({ detected: true },
      _base('checkpoint_imbalance', 'P1', `Session accumulated ${count} Human Checkpoints`, { count }, 'IMP-KIT-016'));
  }
  return { detected: false };
}

function detectDuplication(input) {
  const opts = input || {};
  const newContent = typeof opts.newContent === 'string' ? opts.newContent : '';
  const existingContents = (opts.existingContents && typeof opts.existingContents === 'object') ? opts.existingContents : {};
  if (!newContent) return { detected: false };
  let guard;
  try { guard = require('../hooks/no-duplication-guard.js'); }
  catch { return { detected: false }; }
  let maxSim = 0;
  let maxPath = null;
  for (const [p, existing] of Object.entries(existingContents)) {
    const sim = guard.computeSimilarity(newContent, existing);
    if (sim > maxSim) { maxSim = sim; maxPath = p; }
  }
  if (maxSim >= 0.8) {
    return Object.assign({ detected: true },
      _base('duplication', 'P1', `High similarity (${(maxSim * 100).toFixed(1)}%) with ${maxPath}`,
        { similarity: maxSim, file_ref: maxPath }, 'IMP-KIT-017'));
  }
  return { detected: false };
}

function detectTrustOnly(input) {
  const transcript = (input && typeof input.transcript === 'string') ? input.transcript : '';
  const reportsSuccess = /agent\s+reported\s+success|agent\s+completed/i.test(transcript);
  const hasPositiveVerif = /(?<!without\s)(?<!no\s)(git\s+diff|diff\s+confirmed)/i.test(transcript);
  if (reportsSuccess && !hasPositiveVerif) {
    return Object.assign({ detected: true },
      _base('trust_only', 'P1', 'Agent success without verification',
        { log_excerpt: transcript.match(/agent\s+(reported\s+success|completed)[^\n]{0,80}/i)?.[0] || '' },
        'IMP-KIT-011'));
  }
  return { detected: false };
}

function detectAllIssues(input) {
  const opts = input || {};
  const detected = [
    detectPermissionMismatch(opts), detectFrameworkDrift(opts), detectCacheError(opts),
    detectCheckpointImbalance(opts), detectDuplication(opts), detectTrustOnly(opts)
  ].filter(r => r.detected);

  return detected.map((result, idx) => {
    const { detected: _d, ...rest } = result;
    return Object.assign({ id: 'issue-' + String(idx + 1).padStart(3, '0') }, rest);
  });
}

module.exports = {
  detectPermissionMismatch, detectFrameworkDrift, detectCacheError,
  detectCheckpointImbalance, detectDuplication, detectTrustOnly,
  detectAllIssues, extractDomain, ISSUE_TYPES, SEVERITY_LEVELS
};
