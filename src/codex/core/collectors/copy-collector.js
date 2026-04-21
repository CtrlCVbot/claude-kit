'use strict';
/**
 * copy-collector.js — kit-feedback-archiving Phase 3.2.3 (Codex sibling)
 * Claude peer: src/claude/core/collectors/copy-collector.js (동일 로직)
 */

const COPY_COMMANDS = [
  '/copy-reference-refresh', '/copy-visual-review', '/copy-interaction-review',
  '/copy-gap-board', '/copy-plan-unit', '/copy-verify', '/copy-closeout'
];

function _firstMatch(text, re, group) {
  const m = text.match(re);
  return m ? (group !== undefined ? m[group] : m[0]) : null;
}

function _num(text, re, group) {
  const v = _firstMatch(text, re, group);
  if (v === null) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function _parseGapSummary(text, prefix) {
  const re = new RegExp(prefix + '\\s*(?:—|-)\\s*P0:\\s*(\\d+),\\s*P1:\\s*(\\d+),\\s*P2:\\s*(\\d+)', 'i');
  const m = text.match(re);
  return m ? { P0: parseInt(m[1], 10), P1: parseInt(m[2], 10), P2: parseInt(m[3], 10) } : null;
}

function _collectReferenceRefresh(t) {
  const hasModeIndicator = /(--reference-only|--full)/i.test(t);
  const refOnly = /--reference-only/i.test(t);
  const evidence = t.match(/Evidence:\s*valid\s+(\d+),?\s*stale\s+(\d+),?\s*missing\s+(\d+)/i);
  return {
    variant: _firstMatch(t, /SITE_VARIANT=(\w+)/, 1),
    reference_only_mode: hasModeIndicator ? refOnly : null,
    evidence_status: evidence ? { valid: parseInt(evidence[1], 10), stale: parseInt(evidence[2], 10), missing: parseInt(evidence[3], 10) } : null
  };
}

function _collectVisualReview(t) { return { gap_summary: _parseGapSummary(t, 'Visual\\s+gaps') }; }
function _collectInteractionReview(t) { return { gap_summary: _parseGapSummary(t, 'Interaction\\s+gaps') }; }
function _collectGapBoard(t) {
  return {
    total_gaps: _num(t, /Total\s+gaps\s+consolidated:\s*(\d+)/i, 1),
    gap_summary: _parseGapSummary(t, 'Priority\\s+distribution')
  };
}
function _collectPlanUnit(t) { return { execution_units: _num(t, /Execution\s+Units?\s+created:\s*(\d+)/i, 1) }; }
function _collectVerify(t) { return { verify_result: _firstMatch(t, /Verify\s+result:\s*(PASS|WARN|FAIL)/i, 1) }; }
function _collectCloseout(t) { return { gap_resolution_rate: _num(t, /Gap\s+resolution\s+rate:\s*(\d+)\s*%/i, 1) }; }

const COLLECTORS = {
  '/copy-reference-refresh': _collectReferenceRefresh,
  '/copy-visual-review': _collectVisualReview,
  '/copy-interaction-review': _collectInteractionReview,
  '/copy-gap-board': _collectGapBoard,
  '/copy-plan-unit': _collectPlanUnit,
  '/copy-verify': _collectVerify,
  '/copy-closeout': _collectCloseout
};

function collectCopySpecific(input) {
  const opts = input || {};
  const collector = COLLECTORS[opts.command || ''];
  if (!collector) return {};
  return collector(typeof opts.transcript === 'string' ? opts.transcript : '');
}

module.exports = { collectCopySpecific, COPY_COMMANDS };
