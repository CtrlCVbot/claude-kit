/**
 * IMP-AGENT-009 Phase 2 — telemetry-rollup 테스트
 * 설계: docs/archive/kit-agent-improvements-v2.3.1/IMP-AGENT-009-agent-telemetry.md §향후 확장
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import pkg from '../../../../src/claude/core/_utils/telemetry-rollup.js';
const { groupByDay, writeDailyRollup, rollupFile } = pkg;

function jsonl(objs) {
  return objs.map(o => JSON.stringify(o)).join('\n') + '\n';
}

describe('telemetry-rollup', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'rollup-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('groupByDay — 타임스탬프 기반 일별 그룹화', () => {
    it('동일 날짜 이벤트를 한 그룹으로', () => {
      const events = [
        { timestamp: '2026-04-20T10:00:00Z', agent_name: 'a' },
        { timestamp: '2026-04-20T15:30:00Z', agent_name: 'b' },
        { timestamp: '2026-04-21T09:00:00Z', agent_name: 'c' }
      ];
      const groups = groupByDay(events);
      expect(Object.keys(groups).sort()).toEqual(['2026-04-20', '2026-04-21']);
      expect(groups['2026-04-20']).toHaveLength(2);
      expect(groups['2026-04-21']).toHaveLength(1);
    });

    it('timestamp 누락 이벤트는 skip', () => {
      const events = [
        { agent_name: 'no-ts' },
        { timestamp: '2026-04-20T10:00:00Z', agent_name: 'a' }
      ];
      const groups = groupByDay(events);
      expect(Object.keys(groups)).toEqual(['2026-04-20']);
    });
  });

  describe('writeDailyRollup — 일별 파일 생성', () => {
    it('YYYYMMDD 파일명 + JSON 배열 저장', () => {
      const events = [
        { timestamp: '2026-04-20T10:00:00Z', agent_name: 'a', event_type: 'invoked' }
      ];
      const outDir = join(tmpDir, 'logs');
      writeDailyRollup(events, '2026-04-20', outDir);
      const file = join(outDir, 'agent-telemetry-daily-20260420.json');
      expect(existsSync(file)).toBe(true);
      const parsed = JSON.parse(readFileSync(file, 'utf8'));
      expect(parsed).toHaveLength(1);
      expect(parsed[0].agent_name).toBe('a');
    });
  });

  describe('rollupFile — end-to-end 처리', () => {
    it('30일 이상 된 이벤트만 일별 파일로 이관 + 원본에서 제거', () => {
      const now = new Date();
      const old = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString();
      const recent = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
      const events = [
        { timestamp: old, agent_name: 'old', event_type: 'invoked', session_id: 's', invocation_id: 'i1', caller: { type: 'user' } },
        { timestamp: recent, agent_name: 'recent', event_type: 'invoked', session_id: 's', invocation_id: 'i2', caller: { type: 'user' } }
      ];

      const logPath = join(tmpDir, 'agent-telemetry.jsonl');
      const outDir = join(tmpDir, 'rollups');
      writeFileSync(logPath, jsonl(events));

      const result = rollupFile(logPath, outDir, { retentionDays: 30, now });
      expect(result.archived).toBe(1);
      expect(result.retained).toBe(1);

      const remaining = readFileSync(logPath, 'utf8').trim().split('\n').map(l => JSON.parse(l));
      expect(remaining).toHaveLength(1);
      expect(remaining[0].agent_name).toBe('recent');
    });

    it('원본 파일 없음: 조용히 no-op', () => {
      const logPath = join(tmpDir, 'missing.jsonl');
      const result = rollupFile(logPath, tmpDir, { retentionDays: 30 });
      expect(result.archived).toBe(0);
      expect(result.retained).toBe(0);
    });
  });
});
