'use strict';
/**
 * plan-collector.js — kit-feedback-archiving Phase 3.2.2
 *
 * 9개 plan 커맨드별 plan_specific 필드 추출.
 * Claude peer/Codex sibling: src/codex/core/collectors/plan-collector.js
 * 설계: docs/plan/kit-feedback-archiving/03-trigger-points.md §3.1
 */

const PLAN_COMMANDS = [
  '/plan-idea', '/plan-screen', '/plan-draft', '/plan-prd', '/plan-review',
  '/plan-wireframe', '/plan-stitch', '/plan-bridge', '/plan-archive'
];

function _firstMatch(text, re, group) {
  const m = text.match(re);
  return m ? (group !== undefined ? m[group] : m[0]) : null;
}

function _numberFromMatch(text, re, group) {
  const v = _firstMatch(text, re, group);
  if (v === null) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function _collectIdea(transcript) {
  return {
    idea_id: _firstMatch(transcript, /IDEA-\d{8}-\d{3,}/)
  };
}

function _collectScreen(transcript) {
  const frameworkRaw = _firstMatch(transcript, /프레임워크:\s*(RICE|rice|5axis|5축)/, 1);
  const framework = frameworkRaw
    ? (frameworkRaw.toLowerCase() === 'rice' ? 'rice' : '5axis')
    : null;
  return {
    screening_framework: framework,
    screening_score: _numberFromMatch(transcript, /점수:\s*(\d+(?:\.\d+)?)/, 1)
  };
}

function _collectDraft(transcript) {
  const categoryRaw = _firstMatch(transcript, /(Lite|Standard)\s*판정/, 1)
    || _firstMatch(transcript, /판정:\s*(Lite|Standard)/, 1);
  return {
    draft_category: categoryRaw,
    scenario: _firstMatch(transcript, /시나리오\s*([ABC])/, 1),
    feature_type: _firstMatch(transcript, /유형:\s*(copy|dev|hybrid)/, 1)
  };
}

function _collectPrd(transcript) {
  return {
    prd_req_count: _numberFromMatch(transcript, /(\d+)\s*REQ[-\s]/, 1)
  };
}

function _collectReview(transcript) {
  const critical = _numberFromMatch(transcript, /CRITICAL\s*(\d+)/, 1);
  const high = _numberFromMatch(transcript, /HIGH\s*(\d+)/, 1);
  const medium = _numberFromMatch(transcript, /MEDIUM\s*(\d+)/, 1);
  const low = _numberFromMatch(transcript, /LOW\s*(\d+)/, 1);
  const anyFound = [critical, high, medium, low].some(v => v !== null);
  return {
    review_severity_distribution: anyFound ? {
      critical: critical || 0,
      high: high || 0,
      medium: medium || 0,
      low: low || 0
    } : null,
    auto_triggered: /\[Plan\s+Review\]\s+auto-triggered|IMP-KIT-007/i.test(transcript) ? true : null
  };
}

function _collectWireframe(transcript) {
  const viewports = [];
  const viewportMatch = transcript.match(/Viewports?\s+covered?:\s*([^\n]+)/i);
  if (viewportMatch) {
    const parsed = viewportMatch[1].match(/\d{3,4}/g);
    if (parsed) viewports.push(...parsed);
  }
  return {
    wireframe_recall_count: _numberFromMatch(transcript, /wireframe\s+recall:\s*(\d+)/i, 1),
    viewport_coverage: viewports.length ? viewports : null
  };
}

function _collectStitch(transcript) {
  return {
    stitch_executions: _numberFromMatch(transcript, /Stitch\s+executions?:\s*(\d+)/i, 1)
  };
}

function _collectBridge(transcript) {
  return {
    bridge_pcc_status: _firstMatch(transcript, /PCC\s+status:\s*(PASS|WARN|FAIL)/i, 1),
    parallel_executions: _numberFromMatch(transcript, /Parallel\s+executions?:\s*(\d+)/i, 1)
  };
}

function _collectArchive(transcript) {
  return {
    archive_completion_rate: _numberFromMatch(transcript, /completion:\s*(\d+)\s*%/i, 1),
    pending_items: _numberFromMatch(transcript, /Pending\s+items?:\s*(\d+)/i, 1)
  };
}

const COLLECTORS = {
  '/plan-idea': _collectIdea,
  '/plan-screen': _collectScreen,
  '/plan-draft': _collectDraft,
  '/plan-prd': _collectPrd,
  '/plan-review': _collectReview,
  '/plan-wireframe': _collectWireframe,
  '/plan-stitch': _collectStitch,
  '/plan-bridge': _collectBridge,
  '/plan-archive': _collectArchive
};

/**
 * plan 도메인 커맨드의 특화 필드 수집.
 * @param {object} input
 * @param {string} input.command — 실행된 커맨드 (e.g. '/plan-draft')
 * @param {string} input.transcript — 세션 로그 텍스트
 * @returns {object} plan_specific 필드 (비-plan 커맨드는 빈 객체)
 */
function collectPlanSpecific(input) {
  const opts = input || {};
  const command = opts.command || '';
  const transcript = typeof opts.transcript === 'string' ? opts.transcript : '';

  const collector = COLLECTORS[command];
  if (!collector) return {};

  return collector(transcript);
}

module.exports = {
  collectPlanSpecific,
  PLAN_COMMANDS
};
