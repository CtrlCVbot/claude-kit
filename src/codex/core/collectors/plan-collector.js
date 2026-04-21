'use strict';
/**
 * plan-collector.js — kit-feedback-archiving Phase 3.2.2 (Codex sibling)
 * Claude peer: src/claude/core/collectors/plan-collector.js (동일 로직)
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

function _collectIdea(t) { return { idea_id: _firstMatch(t, /IDEA-\d{8}-\d{3,}/) }; }

function _collectScreen(t) {
  const frameworkRaw = _firstMatch(t, /프레임워크:\s*(RICE|rice|5axis|5축)/, 1);
  const framework = frameworkRaw ? (frameworkRaw.toLowerCase() === 'rice' ? 'rice' : '5axis') : null;
  return {
    screening_framework: framework,
    screening_score: _numberFromMatch(t, /점수:\s*(\d+(?:\.\d+)?)/, 1)
  };
}

function _collectDraft(t) {
  const categoryRaw = _firstMatch(t, /(Lite|Standard)\s*판정/, 1)
    || _firstMatch(t, /판정:\s*(Lite|Standard)/, 1);
  return {
    draft_category: categoryRaw,
    scenario: _firstMatch(t, /시나리오\s*([ABC])/, 1),
    feature_type: _firstMatch(t, /유형:\s*(copy|dev|hybrid)/, 1)
  };
}

function _collectPrd(t) { return { prd_req_count: _numberFromMatch(t, /(\d+)\s*REQ[-\s]/, 1) }; }

function _collectReview(t) {
  const c = _numberFromMatch(t, /CRITICAL\s*(\d+)/, 1);
  const h = _numberFromMatch(t, /HIGH\s*(\d+)/, 1);
  const m = _numberFromMatch(t, /MEDIUM\s*(\d+)/, 1);
  const l = _numberFromMatch(t, /LOW\s*(\d+)/, 1);
  const anyFound = [c, h, m, l].some(v => v !== null);
  return {
    review_severity_distribution: anyFound
      ? { critical: c || 0, high: h || 0, medium: m || 0, low: l || 0 }
      : null,
    auto_triggered: /\[Plan\s+Review\]\s+auto-triggered|IMP-KIT-007/i.test(t) ? true : null
  };
}

function _collectWireframe(t) {
  const viewports = [];
  const vm = t.match(/Viewports?\s+covered?:\s*([^\n]+)/i);
  if (vm) {
    const parsed = vm[1].match(/\d{3,4}/g);
    if (parsed) viewports.push(...parsed);
  }
  return {
    wireframe_recall_count: _numberFromMatch(t, /wireframe\s+recall:\s*(\d+)/i, 1),
    viewport_coverage: viewports.length ? viewports : null
  };
}

function _collectStitch(t) { return { stitch_executions: _numberFromMatch(t, /Stitch\s+executions?:\s*(\d+)/i, 1) }; }

function _collectBridge(t) {
  return {
    bridge_pcc_status: _firstMatch(t, /PCC\s+status:\s*(PASS|WARN|FAIL)/i, 1),
    parallel_executions: _numberFromMatch(t, /Parallel\s+executions?:\s*(\d+)/i, 1)
  };
}

function _collectArchive(t) {
  return {
    archive_completion_rate: _numberFromMatch(t, /completion:\s*(\d+)\s*%/i, 1),
    pending_items: _numberFromMatch(t, /Pending\s+items?:\s*(\d+)/i, 1)
  };
}

const COLLECTORS = {
  '/plan-idea': _collectIdea, '/plan-screen': _collectScreen, '/plan-draft': _collectDraft,
  '/plan-prd': _collectPrd, '/plan-review': _collectReview, '/plan-wireframe': _collectWireframe,
  '/plan-stitch': _collectStitch, '/plan-bridge': _collectBridge, '/plan-archive': _collectArchive
};

function collectPlanSpecific(input) {
  const opts = input || {};
  const collector = COLLECTORS[opts.command || ''];
  if (!collector) return {};
  return collector(typeof opts.transcript === 'string' ? opts.transcript : '');
}

module.exports = { collectPlanSpecific, PLAN_COMMANDS };
