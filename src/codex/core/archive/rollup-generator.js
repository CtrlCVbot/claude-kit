'use strict';
/**
 * rollup-generator.js — Phase 3.3.3 (Codex sibling)
 * Claude peer: src/claude/core/archive/rollup-generator.js
 */

const { buildStatsFromEntries } = require('./stats-aggregator.js');

function _extractYearMonth(entryId) {
  if (!entryId || typeof entryId !== 'string') return null;
  const m = entryId.match(/^(\d{4})(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : null;
}

function groupEntriesByMonth(entries) {
  const groups = {};
  if (!Array.isArray(entries)) return groups;
  for (const entry of entries) {
    const key = _extractYearMonth(entry.entry_id);
    if (!key) continue;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return groups;
}

function buildMonthlyRollup(entries, yearMonth) {
  const groups = groupEntriesByMonth(entries);
  const target = groups[yearMonth] || [];
  const stats = buildStatsFromEntries(target);
  const durationSum = target.reduce((sum, e) => sum + (e.session?.duration_seconds || 0), 0);
  const avgDuration = target.length > 0 ? Math.round(durationSum / target.length) : 0;
  return {
    period: yearMonth,
    total_entries: target.length,
    by_runtime: stats.by_runtime,
    by_domain: stats.by_domain,
    by_severity: stats.by_severity,
    by_imp_kit: stats.by_imp_kit,
    top_issue_types: stats.top_issue_types,
    avg_session_duration: avgDuration
  };
}

function renderRollupMd(rollup) {
  const r = rollup || {};
  const runtime = r.by_runtime || {};
  const domain = r.by_domain || {};
  const severity = r.by_severity || {};
  const impKit = r.by_imp_kit || {};
  const issues = r.top_issue_types || [];
  const total = r.total_entries || 0;

  const domainLines = Object.entries(domain).filter(([, c]) => c > 0)
    .map(([name, c]) => `- ${name}: ${c}건 (${Math.round(c * 100 / (total || 1))}%)`).join('\n') || '- —';
  const issueLines = issues.slice(0, 5)
    .map((i, idx) => `${idx + 1}. ${i.type} (${i.count}건)`).join('\n') || '- —';
  const impKitLines = Object.entries(impKit).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([id, c]) => `- ${id}: ${c}건`).join('\n') || '- —';

  return [
    `# Feedback Rollup — ${r.period || '-'}`,
    '',
    '> 월 단위 자동 생성. 편집 금지.',
    '',
    '## 요약',
    `- 총 ${total}건 (Claude ${runtime.claude || 0} / Codex ${runtime.codex || 0})`,
    `- P0: ${severity.P0 || 0}건 / P1: ${severity.P1 || 0}건 / P2: ${severity.P2 || 0}건`,
    `- 평균 세션 duration: ${r.avg_session_duration || 0}초`,
    '',
    '## 도메인 분포',
    domainLines,
    '',
    '## 가장 빈번한 이슈 유형',
    issueLines,
    '',
    '## IMP-KIT 실제 발생 현황',
    impKitLines,
    ''
  ].join('\n');
}

module.exports = { groupEntriesByMonth, buildMonthlyRollup, renderRollupMd };
