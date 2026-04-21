'use strict';
/**
 * index-renderer.js — Phase 3.3.2 (Codex sibling)
 * Claude peer: src/claude/core/archive/index-renderer.js
 */

function _renderImpKitRows(byImpKit) {
  const entries = Object.entries(byImpKit || {}).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return '| — | — | — |';
  return entries.map(([id, count]) => `| ${id} | ${count} | — |`).join('\n');
}

function _renderLatestRows(ids) {
  if (!ids || ids.length === 0) return '| — | — | — | — | — | — | — |';
  return ids.map((id) => {
    const m = id.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})\d{2}-(.+?)-(.+)$/);
    if (!m) return `| ? | ? | ? | ? | ? | 0 | [link](./${id}.json) |`;
    const [, y, mo, d, hh, mm, cmd, slug] = m;
    return `| ${y}-${mo}-${d} ${hh}:${mm} | codex | — | /${cmd} | ${slug} | 0 | [link](./${id}.json) |`;
  }).join('\n');
}

function renderIndexMd(stats) {
  const s = stats || {};
  const runtime = s.by_runtime || { claude: 0, codex: 0, other: 0 };
  const severity = s.by_severity || { P0: 0, P1: 0, P2: 0 };
  const total = s.total_entries || 0;
  const lastUpdated = s.generated_at || new Date().toISOString();

  return [
    '# Feedback Archive Index',
    '',
    '> 자동 생성 — 직접 편집 금지.',
    '',
    `Last updated: ${lastUpdated}`,
    '',
    '## 통계',
    '',
    `- 총 엔트리: ${total}건`,
    `- Claude: ${runtime.claude || 0}건 / Codex: ${runtime.codex || 0}건 / Other: ${runtime.other || 0}건`,
    `- P0 이슈: ${severity.P0 || 0}건 / P1: ${severity.P1 || 0}건 / P2: ${severity.P2 || 0}건`,
    '',
    '## 최근 10건',
    '',
    '| 시각 | runtime | domain | command | slug | P0 | 링크 |',
    '|------|---------|--------|---------|------|:-:|------|',
    _renderLatestRows(s.latest_entry_ids),
    '',
    '## IMP-KIT 관련 집계',
    '',
    '| IMP-KIT ID | 참조 건수 | 최근 발생 |',
    '|-----------|:-:|-----------|',
    _renderImpKitRows(s.by_imp_kit),
    ''
  ].join('\n');
}

module.exports = { renderIndexMd };
