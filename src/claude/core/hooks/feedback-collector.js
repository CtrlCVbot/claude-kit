'use strict';
/**
 * feedback-collector.js — kit-feedback-archiving Phase 3.1 기본 인프라
 *
 * 설계 문서:
 *  - docs/plan/kit-feedback-archiving/01-architecture.md (컴포넌트)
 *  - docs/plan/kit-feedback-archiving/02-feedback-schema.md (JSON Schema)
 *  - docs/plan/kit-feedback-archiving/03-trigger-points.md (훅 지점)
 *  - docs/plan/kit-feedback-archiving/04-archive-layout.md (저장 구조)
 *
 * 역할: Stop 훅 발동 시 세션 메타데이터로 피드백 엔트리 생성 → `.claude/feedback-archive/{runtime}/{domain}/` 저장.
 * IMP-KIT-007의 `plan-review-trigger.js`에서 체이닝되는 feedback-collector (chain-point).
 *
 * Claude peer/Codex sibling: src/codex/core/hooks/feedback-collector.js
 * 스키마: src/claude/core/_schemas/feedback-entry.schema.json
 *
 * Phase 3.1 범위: 엔트리 생성·스키마 검증·redaction·경로 결정만. 파일 쓰기/index 갱신은 Phase 3.3.
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

/**
 * 민감 정보 치환.
 * @param {string} text
 * @returns {string}
 */
function applyRedactions(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  for (const { pattern, replacement } of REDACTION_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * entry_id 생성: {YYYYMMDD}-{HHmmss}-{command-suffix}-{slug}
 * @param {object} input
 * @returns {string}
 */
function buildEntryId(input) {
  const opts = input || {};
  const ts = opts.timestamp instanceof Date ? opts.timestamp : new Date();

  const pad = (n) => String(n).padStart(2, '0');
  const datePart = ts.getFullYear() + pad(ts.getMonth() + 1) + pad(ts.getDate());
  const timePart = pad(ts.getHours()) + pad(ts.getMinutes()) + pad(ts.getSeconds());

  const rawCmd = opts.command || '/unknown';
  const commandSuffix = rawCmd.replace(/^\/+/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  const slug = opts.slug
    ? String(opts.slug).replace(/[^a-zA-Z0-9_-]/g, '-')
    : 'unknown';

  return datePart + '-' + timePart + '-' + commandSuffix + '-' + slug;
}

/**
 * 아카이브 저장 경로 계산.
 * @param {object} input
 * @returns {string}
 */
function archivePath(input) {
  const opts = input || {};
  const runtime = opts.runtime || 'other';
  const domain = opts.domain || 'core';
  const entryId = opts.entryId || 'unknown';
  return '.claude/feedback-archive/' + runtime + '/' + domain + '/' + entryId + '.json';
}

/**
 * 기본 엔트리 객체 생성 (필수 필드 + 빈 배열/객체).
 * issues_observed 등 상세 필드는 도메인별 수집기(Phase 3.2)에서 추가.
 * @param {object} input
 * @returns {object}
 */
function buildBaseEntry(input) {
  const opts = input || {};
  const startedAt = opts.startedAt;
  const endedAt = opts.endedAt;
  const duration = startedAt && endedAt
    ? Math.max(0, Math.floor((new Date(endedAt) - new Date(startedAt)) / 1000))
    : 0;

  const entryId = opts.entryId || buildEntryId({
    timestamp: endedAt ? new Date(endedAt) : new Date(),
    command: opts.command,
    slug: opts.slug
  });

  return {
    schema_version: SCHEMA_VERSION,
    entry_id: entryId,
    runtime: opts.runtime || 'other',
    command: opts.command || '/unknown',
    domain: opts.domain || 'core',
    session: {
      session_id: opts.sessionId || '',
      started_at: startedAt || '',
      ended_at: endedAt || '',
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

/**
 * feedback-entry.schema.json 검증.
 * @param {object} entry
 * @returns {{valid: boolean, errors: Array}}
 */
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

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const sessionId = data.session_id || process.env.CLAUDE_SESSION_ID || '';
      if (!sessionId) {
        process.exit(0);
      }

      // Phase 3.2 도메인별 수집이 여기에 확장됨.
      // 현재는 no-op (구조만 준비).
      // chain-point: plan-review-trigger 이후 feedback-collector가 발동됨.
    } catch {
      // 파싱 실패 시 조용히 exit 0 (세션 종료 차단 금지)
    }
    process.exit(0);
  });
}

module.exports = {
  buildEntryId,
  applyRedactions,
  buildBaseEntry,
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
