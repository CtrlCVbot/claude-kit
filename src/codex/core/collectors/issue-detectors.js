'use strict';
/**
 * issue-detectors.js — kit-feedback-archiving Phase 3.2.1 이슈 감지기 6종
 *
 * 1차 규칙 기반(휴리스틱) 추출. LLM 심층 분석은 Phase 3.2+ 옵션.
 * Claude peer/Codex sibling: src/codex/core/collectors/issue-detectors.js
 *
 * 설계:
 *  - 01-architecture.md §4.1 (1차 휴리스틱)
 *  - 02-feedback-schema.md §2.5.1 (10 issue types)
 *  - 02-feedback-schema.md §2.5.2 (P0/P1/P2 severity)
 */

const ISSUE_TYPES = [
  'permission_mismatch',
  'framework_drift',
  'cache_error',
  'missing_agent',
  'undefined_mode',
  'checkpoint_imbalance',
  'duplication',
  'trust_only',
  'truncation_ignored',
  'other'
];

const SEVERITY_LEVELS = ['P0', 'P1', 'P2'];

/**
 * 커맨드 prefix에서 도메인 추출.
 * @param {string} command
 * @returns {'plan'|'copy'|'dev'|'core'}
 */
function extractDomain(command) {
  if (!command || typeof command !== 'string') return 'core';
  const trimmed = command.trim().replace(/^\/+/, '');
  if (trimmed.startsWith('plan-')) return 'plan';
  if (trimmed.startsWith('copy-')) return 'copy';
  if (trimmed.startsWith('dev-')) return 'dev';
  return 'core';
}

function _base(type, severity, description, evidence, related) {
  return {
    type,
    severity,
    description,
    evidence: evidence || {},
    related_imp_kit_id: related || null
  };
}

/**
 * 에이전트 권한 부족/초과 감지.
 * @returns {{detected: boolean, type?: string, severity?: string, description?: string, evidence?: object, related_imp_kit_id?: string}}
 */
function detectPermissionMismatch(input) {
  const opts = input || {};
  const transcript = typeof opts.transcript === 'string' ? opts.transcript : '';
  const match = transcript.match(/Tool\s+['"]?(\w+)['"]?\s+(?:is\s+)?not\s+available\s+for\s+agent\s+['"]?([\w-]+)['"]?/i);
  if (match) {
    return Object.assign({ detected: true },
      _base('permission_mismatch', 'P0',
        `Agent '${match[2]}' lacks tool '${match[1]}' — delegation required`,
        { log_excerpt: match[0] },
        'IMP-KIT-001'));
  }
  return { detected: false };
}

/**
 * Framework drift 감지 — description과 실제 동작 불일치.
 */
function detectFrameworkDrift(input) {
  const opts = input || {};
  const transcript = typeof opts.transcript === 'string' ? opts.transcript : '';
  const declared = opts.declaredFramework;

  if (/framework\s+drift/i.test(transcript)) {
    return Object.assign({ detected: true },
      _base('framework_drift', 'P1', 'Explicit drift warning',
        { log_excerpt: transcript.match(/.{0,80}framework\s+drift.{0,80}/i)[0] },
        'IMP-KIT-002'));
  }

  // silent drift: declaredFramework와 transcript의 실제 프레임워크 불일치
  if (declared) {
    const actualMentions = {
      rice: /\b(RICE)\s+점수/i,
      '5axis': /\b(5축|5axis)/i
    };
    for (const [fw, re] of Object.entries(actualMentions)) {
      if (re.test(transcript) && fw !== declared.toLowerCase()) {
        return Object.assign({ detected: true },
          _base('framework_drift', 'P1',
            `Declared framework=${declared} but transcript uses ${fw}`,
            { log_excerpt: transcript.match(re)?.[0] || '' },
            'IMP-KIT-002'));
      }
    }
  }

  return { detected: false };
}

/**
 * Read 캐시 인증 실패 감지.
 */
function detectCacheError(input) {
  const opts = input || {};
  const transcript = typeof opts.transcript === 'string' ? opts.transcript : '';
  if (/File\s+has\s+not\s+been\s+read\s+yet/i.test(transcript)) {
    return Object.assign({ detected: true },
      _base('cache_error', 'P1', 'Read cache invalidation detected',
        { log_excerpt: transcript.match(/.{0,80}File\s+has\s+not\s+been\s+read\s+yet.{0,80}/i)[0] },
        'IMP-KIT-005'));
  }
  return { detected: false };
}

/**
 * Human Checkpoint 과다 감지.
 */
function detectCheckpointImbalance(input) {
  const opts = input || {};
  const count = typeof opts.humanCheckpoints === 'number' ? opts.humanCheckpoints : 0;
  // 3~6회 → P1 (2.3.0 지표 <3 초과), 7회 이상 → P0
  if (count >= 7) {
    return Object.assign({ detected: true },
      _base('checkpoint_imbalance', 'P0',
        `Session accumulated ${count} Human Checkpoints (severe fatigue)`,
        { count },
        'IMP-KIT-016'));
  }
  if (count >= 3) {
    return Object.assign({ detected: true },
      _base('checkpoint_imbalance', 'P1',
        `Session accumulated ${count} Human Checkpoints (above 2.3.0 target <3)`,
        { count },
        'IMP-KIT-016'));
  }
  return { detected: false };
}

/**
 * 재복제 감지 (IMP-KIT-017 유틸 재사용).
 */
function detectDuplication(input) {
  const opts = input || {};
  const newContent = typeof opts.newContent === 'string' ? opts.newContent : '';
  const existingContents = opts.existingContents && typeof opts.existingContents === 'object' ? opts.existingContents : {};
  if (!newContent) return { detected: false };

  let guard;
  try {
    guard = require('../hooks/no-duplication-guard.js');
  } catch {
    return { detected: false };
  }

  let maxSim = 0;
  let maxPath = null;
  for (const [p, existing] of Object.entries(existingContents)) {
    const sim = guard.computeSimilarity(newContent, existing);
    if (sim > maxSim) { maxSim = sim; maxPath = p; }
  }

  if (maxSim >= 0.8) {
    return Object.assign({ detected: true },
      _base('duplication', 'P1',
        `High similarity (${(maxSim * 100).toFixed(1)}%) with ${maxPath}`,
        { similarity: maxSim, file_ref: maxPath },
        'IMP-KIT-017'));
  }
  return { detected: false };
}

/**
 * Agent 결과 trust-only 감지.
 */
function detectTrustOnly(input) {
  const opts = input || {};
  const transcript = typeof opts.transcript === 'string' ? opts.transcript : '';
  const reportsSuccess = /agent\s+reported\s+success|agent\s+completed/i.test(transcript);
  // "without verification" 부정 키워드는 verification 매치에서 제외
  const hasPositiveVerif = /(?<!without\s)(?<!no\s)(git\s+diff|diff\s+confirmed)/i.test(transcript);
  if (reportsSuccess && !hasPositiveVerif) {
    return Object.assign({ detected: true },
      _base('trust_only', 'P1',
        'Agent success taken at face value without VCS/diff verification',
        { log_excerpt: transcript.match(/agent\s+(reported\s+success|completed)[^\n]{0,80}/i)?.[0] || '' },
        'IMP-KIT-011'));
  }
  return { detected: false };
}

/**
 * 모든 감지기 실행 → issues 배열 반환.
 * 각 이슈에 순차적 id(issue-001, issue-002, ...) 자동 부여.
 */
function detectAllIssues(input) {
  const opts = input || {};
  const detected = [
    detectPermissionMismatch(opts),
    detectFrameworkDrift(opts),
    detectCacheError(opts),
    detectCheckpointImbalance(opts),
    detectDuplication(opts),
    detectTrustOnly(opts)
  ].filter(r => r.detected);

  return detected.map((result, idx) => {
    const { detected: _d, ...rest } = result;
    return Object.assign({ id: 'issue-' + String(idx + 1).padStart(3, '0') }, rest);
  });
}

module.exports = {
  detectPermissionMismatch,
  detectFrameworkDrift,
  detectCacheError,
  detectCheckpointImbalance,
  detectDuplication,
  detectTrustOnly,
  detectAllIssues,
  extractDomain,
  ISSUE_TYPES,
  SEVERITY_LEVELS
};
