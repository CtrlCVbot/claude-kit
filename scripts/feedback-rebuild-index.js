#!/usr/bin/env node
/**
 * feedback-rebuild-index.js — kit-feedback-archiving Phase 3.3.4
 *
 * .claude/feedback-archive 전체 엔트리 재탐색 → stats.json / index.md / _rollups/ 재생성.
 * 설계: docs/plan/kit-feedback-archiving/04-archive-layout.md §8.2
 *
 * 사용:
 *   node scripts/feedback-rebuild-index.js            전체 재계산
 *   node scripts/feedback-rebuild-index.js --month 2026-04   특정 월 롤업만
 */

'use strict';

const fs = require('fs');
const path = require('path');

const {
  buildStatsFromEntries
} = require('../src/claude/core/archive/stats-aggregator.js');
const { renderIndexMd } = require('../src/claude/core/archive/index-renderer.js');
const { groupEntriesByMonth, buildMonthlyRollup, renderRollupMd } = require('../src/claude/core/archive/rollup-generator.js');

const ARCHIVE_ROOT = path.resolve(__dirname, '..', '.claude', 'feedback-archive');

function findEntryFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    // _rollups, schema 등 언더스코어 디렉터리 제외
    if (entry.isDirectory()) {
      if (entry.name.startsWith('_') || entry.name === 'schema') continue;
      results.push(...findEntryFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'stats.json') {
      results.push(full);
    }
  }
  return results;
}

function loadEntries(files) {
  const entries = [];
  for (const file of files) {
    try {
      entries.push(JSON.parse(fs.readFileSync(file, 'utf8')));
    } catch (err) {
      console.warn(`[rebuild] skip ${file}: ${err.message}`);
    }
  }
  return entries;
}

function main() {
  const monthArg = process.argv.includes('--month') ? process.argv[process.argv.indexOf('--month') + 1] : null;

  if (!fs.existsSync(ARCHIVE_ROOT)) {
    console.log('[rebuild] .claude/feedback-archive 없음 — skip (exit 0)');
    process.exit(0);
  }

  const files = findEntryFiles(ARCHIVE_ROOT);
  const entries = loadEntries(files);
  console.log(`[rebuild] ${entries.length} entries loaded from ${files.length} files`);

  // stats.json
  const stats = buildStatsFromEntries(entries);
  fs.writeFileSync(path.join(ARCHIVE_ROOT, 'stats.json'), JSON.stringify(stats, null, 2));
  console.log(`[rebuild] stats.json written (total_entries=${stats.total_entries})`);

  // index.md
  fs.writeFileSync(path.join(ARCHIVE_ROOT, 'index.md'), renderIndexMd(stats));
  console.log('[rebuild] index.md written');

  // 월별 롤업
  const rollupsDir = path.join(ARCHIVE_ROOT, '_rollups');
  fs.mkdirSync(rollupsDir, { recursive: true });

  const monthsToProcess = monthArg ? [monthArg] : Object.keys(groupEntriesByMonth(entries));
  for (const ym of monthsToProcess) {
    const rollup = buildMonthlyRollup(entries, ym);
    if (rollup.total_entries === 0) continue;
    fs.writeFileSync(path.join(rollupsDir, `${ym}.md`), renderRollupMd(rollup));
    console.log(`[rebuild] _rollups/${ym}.md written (entries=${rollup.total_entries})`);
  }

  console.log('[rebuild] done.');
}

main();
