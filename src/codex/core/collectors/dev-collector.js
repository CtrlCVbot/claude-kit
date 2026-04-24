'use strict';
/**
 * dev-collector.js — kit-feedback-archiving Phase 3.2.4
 *
 * dev 7 커맨드별 dev_specific 필드 + SubagentStop 누적 aggregator.
 * Claude peer/Codex sibling: src/codex/core/collectors/dev-collector.js
 * 설계: docs/plan/kit-feedback-archiving/03-trigger-points.md §3.3 + §4.2
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEV_COMMANDS = [
  '/dev-architecture', '/dev-feature', '/dev-verify', '/dev-verify-all',
  '/dev-verify-fe', '/dev-commit', '/dev-commit-push-pr'
];

const TRACKED_AGENTS = [
  'plan-draft-writer', 'plan-bridge-writer', 'dev-architect', 'dev-doc-updater',
  'plan-wireframe-designer', 'plan-idea-screener', 'plan-prd-writer', 'plan-reviewer',
  'copy-reference-baseline'
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

// ============================================================
// SubagentStop aggregator (tmpdir 마커 기반)
// ============================================================

function _markerPath(sessionId) {
  return path.join(os.tmpdir(), 'claude-kit-subagent-' + sessionId + '.jsonl');
}

/**
 * SubagentStop 발동 시 호출 — 에이전트 완료 레코드 append.
 */
function recordSubagentStop(input) {
  const opts = input || {};
  if (!opts.sessionId || !opts.agent) return;

  const record = {
    agent: opts.agent,
    status: opts.status || 'success',
    timestamp: new Date().toISOString()
  };

  try {
    fs.appendFileSync(_markerPath(opts.sessionId), JSON.stringify(record) + '\n');
  } catch {
    // fail-open
  }
}

/**
 * 세션별 누적된 SubagentStop 레코드 배열 반환.
 */
function readAggregatedAgents(sessionId) {
  if (!sessionId) return [];
  try {
    const marker = _markerPath(sessionId);
    if (!fs.existsSync(marker)) return [];
    const content = fs.readFileSync(marker, 'utf8');
    return content.split(/\r?\n/)
      .filter(Boolean)
      .map(line => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * 세션 누적 마커 비움 (Stop 훅 종료 후 정리).
 */
function clearAggregatedAgents(sessionId) {
  if (!sessionId) return;
  try {
    const marker = _markerPath(sessionId);
    if (fs.existsSync(marker)) fs.unlinkSync(marker);
  } catch {
    // ignore
  }
}

// ============================================================
// dev 커맨드별 수집기
// ============================================================

function _collectFeature(t) {
  const phase = _firstMatch(t, /Phase\s+([ABC])\b/, 1);
  const fileCount = _num(t, /(\d+)\s+files?\s+modified/i, 1);
  const buildStatus = _firstMatch(t, /Build\s+status:\s*(success|failure|warning)/i, 1);
  return {
    phase,
    files_modified_count: fileCount,
    build_status: buildStatus
  };
}

function _parseTestResults(t) {
  const tests = t.match(/Tests?:?\s*(\d+)\s+passed(?:,?\s*(\d+)\s+failed)?/i);
  const coverage = _num(t, /Coverage:?\s*(\d+)\s*%/i, 1);
  if (!tests && coverage === null) return null;
  return {
    passed: tests ? parseInt(tests[1], 10) : 0,
    failed: tests && tests[2] ? parseInt(tests[2], 10) : 0,
    coverage_percent: coverage
  };
}

function _collectVerify(t) {
  return {
    test_results: _parseTestResults(t),
    tdd_violations: _num(t, /TDD\s+violations?\s+detected:\s*(\d+)/i, 1)
  };
}

function _collectArchitecture(t) {
  return {
    ssot_new: _num(t, /SSOT\s+entries:?\s*(\d+)\s+new/i, 1),
    ssot_updated: _num(t, /SSOT\s+entries:?\s*\d+\s+new,\s*(\d+)\s+updated/i, 1)
  };
}

function _collectCommit(t) {
  return {
    commit_files_count: _num(t, /Committed?\s+(\d+)\s+files?/i, 1),
    commit_message_length: _num(t, /Message\s+length:?\s*(\d+)\s+chars?/i, 1)
  };
}

function _collectCommitPushPr(t) {
  return Object.assign(_collectCommit(t), {
    pr_checklist_completion: _num(t, /Checklist\s+completion:?\s*(\d+)\s*%/i, 1)
  });
}

const COLLECTORS = {
  '/dev-architecture': _collectArchitecture,
  '/dev-feature': _collectFeature,
  '/dev-verify': _collectVerify,
  '/dev-verify-all': _collectVerify,
  '/dev-verify-fe': _collectVerify,
  '/dev-commit': _collectCommit,
  '/dev-commit-push-pr': _collectCommitPushPr
};

/**
 * dev 도메인 커맨드의 특화 필드 수집.
 * sessionId 전달 시 SubagentStop 누적 기록에서 agents_chain 추출.
 */
function collectDevSpecific(input) {
  const opts = input || {};
  const command = opts.command || '';
  const transcript = typeof opts.transcript === 'string' ? opts.transcript : '';
  const sessionId = opts.sessionId;

  const collector = COLLECTORS[command];
  if (!collector) return {};

  const base = collector(transcript);

  if (sessionId) {
    const aggregated = readAggregatedAgents(sessionId);
    base.agents_chain = aggregated.map(a => a.agent);
  }

  return base;
}

module.exports = {
  collectDevSpecific,
  recordSubagentStop,
  readAggregatedAgents,
  clearAggregatedAgents,
  DEV_COMMANDS,
  TRACKED_AGENTS
};
