'use strict';
/**
 * telemetry-rollup.js — IMP-AGENT-009 텔레메트리 일별 롤업 유틸리티
 *
 * ~/.claude/logs/agent-telemetry.jsonl 의 오래된 이벤트(기본 30일 이상)를
 * agent-telemetry-daily-YYYYMMDD.json 파일로 이관하고 원본에서 제거한다.
 *
 * 스크립트 실행: node src/claude/core/_utils/telemetry-rollup.js
 * 설계: docs/plan/kit-agent-improvements/IMP-AGENT-009-agent-telemetry.md §향후 확장
 */

const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { dirname, join } = require('node:path');

function groupByDay(events) {
  const groups = {};
  for (const event of events) {
    if (!event.timestamp) continue;
    const day = event.timestamp.slice(0, 10);
    if (!groups[day]) groups[day] = [];
    groups[day].push(event);
  }
  return groups;
}

function writeDailyRollup(events, day, outDir) {
  mkdirSync(outDir, { recursive: true });
  const fileName = `agent-telemetry-daily-${day.replace(/-/g, '')}.json`;
  const filePath = join(outDir, fileName);

  let existing = [];
  if (existsSync(filePath)) {
    try {
      existing = JSON.parse(readFileSync(filePath, 'utf8'));
    } catch {
      existing = [];
    }
  }

  const combined = [...existing, ...events];
  writeFileSync(filePath, JSON.stringify(combined, null, 2), 'utf8');
  return filePath;
}

/**
 * 로그 파일 롤업 실행.
 *
 * @param {string} logPath - 원본 JSONL 경로
 * @param {string} outDir - 일별 파일 저장 디렉터리
 * @param {object} [options]
 * @param {number} [options.retentionDays=30] - 보관 일수. 이보다 오래된 이벤트는 이관
 * @param {Date} [options.now=new Date()] - 기준 시각 (테스트용)
 * @returns {{archived: number, retained: number, files: string[]}}
 */
function rollupFile(logPath, outDir, options = {}) {
  const retentionDays = options.retentionDays ?? 30;
  const now = options.now ?? new Date();
  const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  if (!existsSync(logPath)) {
    return { archived: 0, retained: 0, files: [] };
  }

  const raw = readFileSync(logPath, 'utf8');
  const lines = raw.split('\n').filter(line => line.trim().length > 0);
  const events = [];
  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch {
      // malformed line skip
    }
  }

  const toArchive = [];
  const toRetain = [];
  for (const event of events) {
    if (!event.timestamp) {
      toRetain.push(event);
      continue;
    }
    const ts = new Date(event.timestamp);
    if (ts < cutoff) {
      toArchive.push(event);
    } else {
      toRetain.push(event);
    }
  }

  const files = [];
  if (toArchive.length > 0) {
    const groups = groupByDay(toArchive);
    for (const [day, dayEvents] of Object.entries(groups)) {
      files.push(writeDailyRollup(dayEvents, day, outDir));
    }
  }

  const retainedContent = toRetain.length > 0
    ? toRetain.map(e => JSON.stringify(e)).join('\n') + '\n'
    : '';
  mkdirSync(dirname(logPath), { recursive: true });
  writeFileSync(logPath, retainedContent, 'utf8');

  return {
    archived: toArchive.length,
    retained: toRetain.length,
    files
  };
}

function main() {
  const { homedir } = require('node:os');
  const home = homedir();
  const logPath = join(home, '.claude', 'logs', 'agent-telemetry.jsonl');
  const outDir = join(home, '.claude', 'logs');
  const result = rollupFile(logPath, outDir);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  groupByDay,
  writeDailyRollup,
  rollupFile,
  main
};
