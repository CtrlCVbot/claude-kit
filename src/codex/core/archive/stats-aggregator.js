'use strict';
/**
 * stats-aggregator.js — Phase 3.3.1 (Codex sibling)
 * Claude peer: src/claude/core/archive/stats-aggregator.js (동일 로직)
 */

const STATS_VERSION = '1.0';
const MAX_LATEST_IDS = 10;

function defaultStats() {
  return {
    stats_version: STATS_VERSION,
    generated_at: new Date().toISOString(),
    total_entries: 0,
    by_runtime: { claude: 0, codex: 0, other: 0 },
    by_domain: { plan: 0, copy: 0, dev: 0, core: 0 },
    by_severity: { P0: 0, P1: 0, P2: 0 },
    by_imp_kit: {},
    top_issue_types: [],
    latest_entry_ids: []
  };
}

function _inc(obj, key) {
  if (obj[key] === undefined) obj[key] = 0;
  obj[key] += 1;
}

function _rebuildTopIssueTypes(typeCounts) {
  return Object.entries(typeCounts).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
}

function updateStats(existing, entry) {
  if (!entry || typeof entry !== 'object') return existing;
  const s = JSON.parse(JSON.stringify(existing || defaultStats()));
  s.total_entries += 1;
  if (entry.runtime) _inc(s.by_runtime, entry.runtime);
  if (entry.domain) _inc(s.by_domain, entry.domain);

  const typeCounts = {};
  for (const item of s.top_issue_types) typeCounts[item.type] = item.count;

  if (Array.isArray(entry.issues_observed)) {
    for (const issue of entry.issues_observed) {
      if (issue.severity) _inc(s.by_severity, issue.severity);
      if (issue.related_imp_kit_id) _inc(s.by_imp_kit, issue.related_imp_kit_id);
      if (issue.type) _inc(typeCounts, issue.type);
    }
  }
  s.top_issue_types = _rebuildTopIssueTypes(typeCounts);

  if (entry.entry_id) {
    s.latest_entry_ids.unshift(entry.entry_id);
    s.latest_entry_ids = s.latest_entry_ids.slice(0, MAX_LATEST_IDS);
  }
  s.generated_at = new Date().toISOString();
  return s;
}

function buildStatsFromEntries(entries) {
  const list = Array.isArray(entries) ? entries : [];
  let stats = defaultStats();
  for (const entry of list) stats = updateStats(stats, entry);
  return stats;
}

module.exports = { updateStats, buildStatsFromEntries, defaultStats, STATS_VERSION, MAX_LATEST_IDS };
