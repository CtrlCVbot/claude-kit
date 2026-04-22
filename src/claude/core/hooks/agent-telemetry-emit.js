'use strict';
/**
 * agent-telemetry-emit.js — IMP-AGENT-009 텔레메트리 이벤트 emit 훅
 *
 * claude-kit 에이전트의 SubagentStart/SubagentStop 훅 발동 시 호출되어
 * ~/.claude/logs/agent-telemetry.jsonl 에 이벤트를 append 한다.
 *
 * 프롬프트·출력 내용은 저장하지 않는다 (크기만 기록).
 * fail-open: 스키마 검증 실패·파일 쓰기 실패 시 프로세스를 중단시키지 않는다.
 *
 * 스키마: src/claude/core/_schemas/agent-telemetry.schema.json (v1)
 * SSOT: .claude/rules/agent-telemetry.md
 * 설계: docs/archive/kit-agent-improvements-v2.3.1/IMP-AGENT-009-agent-telemetry.md
 *
 * Claude peer/Codex sibling: src/codex/core/hooks/agent-telemetry-emit.js (미구현)
 */

const { appendFileSync, mkdirSync } = require('node:fs');
const { dirname, join } = require('node:path');
const { homedir } = require('node:os');

const EVENT_TYPES = ['invoked', 'completed', 'failed', 'timeout'];

const REQUIRED_BY_EVENT = {
  invoked: ['event_type', 'agent_name', 'timestamp', 'session_id', 'invocation_id', 'caller'],
  completed: ['event_type', 'agent_name', 'timestamp', 'session_id', 'invocation_id', 'duration_ms'],
  failed: ['event_type', 'agent_name', 'timestamp', 'session_id', 'invocation_id', 'duration_ms', 'error_class'],
  timeout: ['event_type', 'agent_name', 'timestamp', 'session_id', 'invocation_id', 'duration_ms']
};

/**
 * 텔레메트리 이벤트 객체 생성.
 *
 * @param {object} data - 입력 필드. event_type/agent_name/session_id 필수.
 * @returns {object} JSONL 직렬화 대상 이벤트.
 */
function buildEvent(data) {
  const event = {
    event_type: data.event_type,
    agent_name: data.agent_name,
    session_id: data.session_id,
    timestamp: data.timestamp || new Date().toISOString()
  };

  const optionalFields = [
    'invocation_id',
    'duration_ms',
    'input_bytes',
    'output_bytes',
    'error_class',
    'caller',
    'agent_metadata',
    'metadata'
  ];
  for (const field of optionalFields) {
    if (data[field] !== undefined) {
      event[field] = data[field];
    }
  }
  return event;
}

/**
 * 스키마 기반 최소 검증.
 * ajv 로드 없이 필수 필드만 확인 (fail-open 목적상 가볍게).
 *
 * @param {object} event
 * @returns {{valid: boolean, errors?: string[]}}
 */
function validateEvent(event) {
  const errors = [];

  if (!EVENT_TYPES.includes(event.event_type)) {
    errors.push(`invalid event_type: ${event.event_type}`);
    return { valid: false, errors };
  }

  const required = REQUIRED_BY_EVENT[event.event_type];
  for (const field of required) {
    if (event[field] === undefined || event[field] === null) {
      errors.push(`missing required field: ${field}`);
    }
  }

  if (event.caller !== undefined) {
    if (typeof event.caller !== 'object' || !event.caller.type) {
      errors.push('caller.type required when caller present');
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * 로그 파일 경로 계산.
 * @param {string} [home] - 홈 디렉터리 (테스트 시 오버라이드)
 */
function resolveLogPath(home) {
  const base = home || homedir();
  return join(base, '.claude', 'logs', 'agent-telemetry.jsonl');
}

/**
 * 이벤트를 JSONL 파일에 append.
 * 디렉터리 없으면 생성. 스키마 위반 시 throw (호출부 fail-open 처리 책임).
 */
function appendEvent(event, logPath) {
  const result = validateEvent(event);
  if (!result.valid) {
    throw new Error(`invalid event: ${result.errors.join(', ')}`);
  }
  const dir = dirname(logPath);
  mkdirSync(dir, { recursive: true });
  appendFileSync(logPath, JSON.stringify(event) + '\n', 'utf8');
}

/**
 * 훅 엔트리포인트. Claude Code SubagentStart/SubagentStop payload를 stdin으로 받는다.
 * fail-open: 어떤 예외든 조용히 exit(0).
 */
function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const hookEvent = data.hook_event_name || '';

      const eventTypeMap = {
        SubagentStart: 'invoked',
        SubagentStop: data.status === 'error' ? 'failed' : 'completed'
      };
      const eventType = eventTypeMap[hookEvent];
      if (!eventType) {
        process.exit(0);
      }

      const agentName = data.agent_name || data.subagent_type || data.tool_name;
      const sessionId = data.session_id || process.env.CLAUDE_SESSION_ID;
      const invocationId = data.invocation_id || `${sessionId}-${Date.now()}`;

      if (!agentName || !sessionId) {
        process.exit(0);
      }

      const eventData = {
        event_type: eventType,
        agent_name: agentName,
        session_id: sessionId,
        invocation_id: invocationId
      };

      if (eventType === 'invoked') {
        eventData.caller = data.caller || { type: 'user', name: 'main-session' };
        if (typeof data.input_bytes === 'number') {
          eventData.input_bytes = data.input_bytes;
        }
      } else {
        eventData.duration_ms = typeof data.duration_ms === 'number' ? data.duration_ms : 0;
        if (typeof data.output_bytes === 'number') {
          eventData.output_bytes = data.output_bytes;
        }
        if (eventType === 'failed') {
          eventData.error_class = data.error_class || 'unknown_error';
        }
      }

      if (data.agent_metadata) {
        eventData.agent_metadata = data.agent_metadata;
      }

      const event = buildEvent(eventData);
      appendEvent(event, resolveLogPath());
    } catch {
      // fail-open
    }
    process.exit(0);
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  buildEvent,
  validateEvent,
  resolveLogPath,
  appendEvent,
  EVENT_TYPES
};
