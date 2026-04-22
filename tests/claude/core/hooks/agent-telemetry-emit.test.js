/**
 * IMP-AGENT-009 Phase 2 RED — agent-telemetry-emit 훅 테스트
 *
 * 스키마: src/claude/core/_schemas/agent-telemetry.schema.json (v1)
 * SSOT: .claude/rules/agent-telemetry.md
 * 설계: docs/archive/kit-agent-improvements-v2.3.1/IMP-AGENT-009-agent-telemetry.md
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import pkg from '../../../../src/claude/core/hooks/agent-telemetry-emit.js';
const {
  buildEvent,
  validateEvent,
  resolveLogPath,
  appendEvent,
  EVENT_TYPES
} = pkg;

describe('agent-telemetry-emit', () => {
  describe('EVENT_TYPES — 상수', () => {
    it('4가지 이벤트 타입 노출', () => {
      expect(EVENT_TYPES).toEqual(['invoked', 'completed', 'failed', 'timeout']);
    });
  });

  describe('buildEvent — 이벤트 빌더', () => {
    const baseData = {
      agent_name: 'dev-architect',
      session_id: 'sess-abc',
      invocation_id: 'inv-001'
    };

    it('invoked 이벤트: timestamp ISO 8601 + caller 포함', () => {
      const event = buildEvent({
        ...baseData,
        event_type: 'invoked',
        caller: { type: 'command', name: '/dev-feature' },
        input_bytes: 1024
      });
      expect(event.event_type).toBe('invoked');
      expect(event.agent_name).toBe('dev-architect');
      expect(event.invocation_id).toBe('inv-001');
      expect(event.caller).toEqual({ type: 'command', name: '/dev-feature' });
      expect(event.input_bytes).toBe(1024);
      expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('completed 이벤트: duration_ms 필수', () => {
      const event = buildEvent({
        ...baseData,
        event_type: 'completed',
        duration_ms: 8234,
        output_bytes: 2048
      });
      expect(event.event_type).toBe('completed');
      expect(event.duration_ms).toBe(8234);
      expect(event.output_bytes).toBe(2048);
    });

    it('failed 이벤트: error_class 필수', () => {
      const event = buildEvent({
        ...baseData,
        event_type: 'failed',
        duration_ms: 500,
        error_class: 'validation_error'
      });
      expect(event.event_type).toBe('failed');
      expect(event.error_class).toBe('validation_error');
    });

    it('agent_metadata 포함 (IMP-AGENT-008 연계)', () => {
      const event = buildEvent({
        ...baseData,
        event_type: 'invoked',
        caller: { type: 'user', name: 'main-session' },
        agent_metadata: {
          team_owner: 'dev',
          release_stage: 'stable'
        }
      });
      expect(event.agent_metadata.team_owner).toBe('dev');
      expect(event.agent_metadata.release_stage).toBe('stable');
    });

    it('timestamp 미지정 시 현재 시각 자동 채움', () => {
      const before = Date.now();
      const event = buildEvent({
        ...baseData,
        event_type: 'completed',
        duration_ms: 100
      });
      const ts = new Date(event.timestamp).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(Date.now() + 1000);
    });
  });

  describe('validateEvent — 스키마 검증', () => {
    it('유효한 invoked 이벤트: valid=true', () => {
      const event = buildEvent({
        event_type: 'invoked',
        agent_name: 'plan-bridge-writer',
        session_id: 'sess-1',
        invocation_id: 'inv-001',
        caller: { type: 'command', name: '/plan-bridge' }
      });
      const result = validateEvent(event);
      expect(result.valid).toBe(true);
    });

    it('invoked에 invocation_id 누락: valid=false', () => {
      const event = {
        event_type: 'invoked',
        agent_name: 'dev-architect',
        session_id: 'sess-1',
        timestamp: new Date().toISOString(),
        caller: { type: 'command', name: '/x' }
      };
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('failed에 error_class 누락: valid=false', () => {
      const event = {
        event_type: 'failed',
        agent_name: 'dev-architect',
        session_id: 'sess-1',
        invocation_id: 'inv-001',
        duration_ms: 500,
        timestamp: new Date().toISOString()
      };
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
    });

    it('알 수 없는 event_type: valid=false', () => {
      const event = {
        event_type: 'unknown_event',
        agent_name: 'dev-architect',
        session_id: 'sess-1',
        timestamp: new Date().toISOString()
      };
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
    });

    it('completed에 duration_ms 누락: valid=false', () => {
      const event = {
        event_type: 'completed',
        agent_name: 'dev-architect',
        session_id: 'sess-1',
        invocation_id: 'inv-001',
        timestamp: new Date().toISOString()
      };
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
    });
  });

  describe('resolveLogPath — 로그 경로', () => {
    it('홈 디렉터리 기반 기본 경로 (플랫폼 separator 포함)', () => {
      const path = resolveLogPath('/home/user');
      // path.sep 플랫폼별: posix "/" / win32 "\\". 양쪽 호환 정규식.
      expect(path).toMatch(/home[\\/]user[\\/]\.claude[\\/]logs[\\/]agent-telemetry\.jsonl$/);
    });

    it('Windows 스타일 홈 경로 (역슬래시 안전)', () => {
      const path = resolveLogPath('C:\\Users\\jhpark');
      expect(path).toMatch(/agent-telemetry\.jsonl$/);
      expect(path).toMatch(/\.claude/);
    });
  });

  describe('appendEvent — JSONL append', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = mkdtempSync(join(tmpdir(), 'telem-test-'));
    });

    afterEach(() => {
      rmSync(tmpDir, { recursive: true, force: true });
    });

    it('파일 없으면 디렉터리 생성 + 첫 줄 작성', () => {
      const logPath = join(tmpDir, 'nested/dir/telemetry.jsonl');
      const event = buildEvent({
        event_type: 'invoked',
        agent_name: 'dev-architect',
        session_id: 'sess-1',
        invocation_id: 'inv-001',
        caller: { type: 'command', name: '/x' }
      });
      appendEvent(event, logPath);
      expect(existsSync(logPath)).toBe(true);
      const content = readFileSync(logPath, 'utf8');
      expect(content.endsWith('\n')).toBe(true);
      const parsed = JSON.parse(content.trim());
      expect(parsed.agent_name).toBe('dev-architect');
    });

    it('여러 이벤트 append: 각 줄이 유효 JSON', () => {
      const logPath = join(tmpDir, 'telemetry.jsonl');
      const e1 = buildEvent({
        event_type: 'invoked',
        agent_name: 'a1',
        session_id: 's1',
        invocation_id: 'i1',
        caller: { type: 'user', name: 'main' }
      });
      const e2 = buildEvent({
        event_type: 'completed',
        agent_name: 'a1',
        session_id: 's1',
        invocation_id: 'i1',
        duration_ms: 100
      });
      appendEvent(e1, logPath);
      appendEvent(e2, logPath);
      const lines = readFileSync(logPath, 'utf8').trim().split('\n');
      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0]).event_type).toBe('invoked');
      expect(JSON.parse(lines[1]).event_type).toBe('completed');
    });

    it('유효하지 않은 이벤트 append 시도: 에러 throw', () => {
      const logPath = join(tmpDir, 'telemetry.jsonl');
      const badEvent = { event_type: 'invoked' }; // required fields 누락
      expect(() => appendEvent(badEvent, logPath)).toThrow();
    });
  });
});
