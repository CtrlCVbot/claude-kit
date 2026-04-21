'use strict';
/**
 * feedback-collector.js — kit-feedback-archiving Phase 3.1 (Codex sibling)
 * Claude peer: src/claude/core/hooks/feedback-collector.js
 *
 * Codex v1 hook runtime의 Stop 이벤트 지원 여부에 따라 fallback Skill 필요할 수 있음.
 * 자세한 내용: docs/plan/kit-feedback-archiving/05-codex-vs-claude.md
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const SCHEMA_VERSION = '1.0';
const COLLECTOR_VERSION = '1.0.0';

const REDACTION_PATTERNS = [
  { name: 'USER_HOME', pattern: /\/Users\/[^/\s]+/g, replacement: '[REDACTED:USER_HOME]' },
  { name: 'USER_HOME', pattern: /\/home\/[^/\s]+/g, replacement: '[REDACTED:USER_HOME]' },
  { name: 'USER_HOME', pattern: /C:\\Users\\[^\\/\s]+/g, replacement: '[REDACTED:USER_HOME]' },
  { name: 'API_KEY', pattern: /sk-[a-zA-Z0-9-_]{10,}/g, replacement: '[REDACTED:API_KEY]' },
  { name: 'EMAIL', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[REDACTED:EMAIL]' }
];

const schema = require('../_schemas/feedback-entry.schema.json');
const ajv = new Ajv({ allErrors: true, strict: false });
const validator = ajv.compile(schema);

function applyRedactions(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  for (const { pattern, replacement } of REDACTION_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function buildEntryId(input) {
  const opts = input || {};
  const ts = opts.timestamp instanceof Date ? opts.timestamp : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const datePart = ts.getFullYear() + pad(ts.getMonth() + 1) + pad(ts.getDate());
  const timePart = pad(ts.getHours()) + pad(ts.getMinutes()) + pad(ts.getSeconds());
  const commandSuffix = (opts.command || '/unknown').replace(/^\/+/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  const slug = opts.slug ? String(opts.slug).replace(/[^a-zA-Z0-9_-]/g, '-') : 'unknown';
  return datePart + '-' + timePart + '-' + commandSuffix + '-' + slug;
}

function archivePath(input) {
  const opts = input || {};
  return '.codex/feedback-archive/' + (opts.runtime || 'other') + '/' + (opts.domain || 'core') + '/' + (opts.entryId || 'unknown') + '.json';
}

function buildBaseEntry(input) {
  const opts = input || {};
  const duration = opts.startedAt && opts.endedAt
    ? Math.max(0, Math.floor((new Date(opts.endedAt) - new Date(opts.startedAt)) / 1000))
    : 0;
  const entryId = opts.entryId || buildEntryId({
    timestamp: opts.endedAt ? new Date(opts.endedAt) : new Date(),
    command: opts.command,
    slug: opts.slug
  });
  return {
    schema_version: SCHEMA_VERSION,
    entry_id: entryId,
    runtime: opts.runtime || 'codex',
    command: opts.command || '/unknown',
    domain: opts.domain || 'core',
    session: {
      session_id: opts.sessionId || '',
      started_at: opts.startedAt || '',
      ended_at: opts.endedAt || '',
      duration_seconds: duration,
      user: opts.user || 'anonymous'
    },
    context: opts.context || {},
    usage: {
      agents_invoked: [],
      skills_loaded: [],
      tools_used: { Read: 0, Edit: 0, Write: 0, Bash: 0, Grep: 0, Glob: 0 },
      manual_edits_count: 0,
      human_checkpoints: 0,
      reruns: 0,
      parallel_executions: 0
    },
    issues_observed: [],
    agent_capability_gaps: [],
    suggestions: [],
    metadata: {
      collector_version: COLLECTOR_VERSION,
      collection_method: 'heuristic',
      deep_analysis_used: false,
      redactions_applied: [],
      warnings: []
    }
  };
}

function validateFeedbackEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return { valid: false, errors: ['entry is not an object'] };
  }
  const valid = validator(entry);
  return {
    valid: valid === true,
    errors: valid === true ? [] : (validator.errors || [])
  };
}

function writeEntry(entryPath, entry) {
  const absPath = path.resolve(entryPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, JSON.stringify(entry, null, 2));
}

// Phase 3.2.5 — 도메인별 수집기 통합 (Codex sibling)
const issueDetectors = require('../collectors/issue-detectors.js');
const planCollector = require('../collectors/plan-collector.js');
const copyCollector = require('../collectors/copy-collector.js');
const devCollector = require('../collectors/dev-collector.js');

function detectRuntime(input) {
  const opts = input || {};
  if (opts.runtime) return opts.runtime;
  const env = opts.env || process.env;
  if (env.CODEX_SESSION_ID) return 'codex';
  if (env.CLAUDE_SESSION_ID) return 'claude';
  return 'other';
}

function buildFullEntry(input) {
  const opts = input || {};
  const command = opts.command || '/unknown';
  const domain = issueDetectors.extractDomain(command);
  const base = buildBaseEntry(Object.assign({ domain }, opts));
  if (domain === 'plan') base.plan_specific = planCollector.collectPlanSpecific(opts);
  else if (domain === 'copy') base.copy_specific = copyCollector.collectCopySpecific(opts);
  else if (domain === 'dev') base.dev_specific = devCollector.collectDevSpecific(opts);
  base.issues_observed = issueDetectors.detectAllIssues(opts);
  return base;
}

function main() {
  // Codex v1 hook runtime의 Stop 이벤트 지원 여부에 따라 동작.
  // 미지원 시 fallback Skill로 전환 필요 (05-codex-vs-claude.md 참조).
  process.exit(0);
}

module.exports = {
  buildEntryId,
  applyRedactions,
  buildBaseEntry,
  buildFullEntry,
  detectRuntime,
  validateFeedbackEntry,
  archivePath,
  writeEntry,
  main,
  REDACTION_PATTERNS,
  SCHEMA_VERSION,
  COLLECTOR_VERSION
};

if (require.main === module) {
  main();
}
