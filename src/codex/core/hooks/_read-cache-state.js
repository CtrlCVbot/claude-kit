'use strict';
/**
 * _read-cache-state.js — Read 캐시 재인증 상태 모듈 (순수 함수)
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-RACE-02.md
 * SSOT: src/claude/core/rules/agent-file-ownership.md (T-RACE-01)
 * 대응: N-03 — 에이전트 완료 후 메인 Edit 시 "File has not been read yet" 에러 반복.
 *
 * 책임:
 *  - SubagentStop 시 pending 항목 append
 *  - PreToolUse(Edit|Write) 시 pending 조회
 *  - 파일 I/O 없음 (serialize/deserialize 로 분리) — 테스트 용이성
 *
 * Read-only 에이전트 제외 원칙:
 *  - agent-completion-cache-invalidate.js 의 READ_ONLY_AGENTS 와 동일 목록 (SSOT 통합 후속 작업 시 상수 공유 고려)
 *  - verification.md 의 Read-only 에이전트 표와 일치
 *
 * 불변성:
 *  - append/clear 는 새 state 객체 반환. 원본은 변경 안 함.
 */

const STATE_VERSION = '1';

const READ_ONLY_AGENTS = new Set([
  'dev-architect',
  'dev-code-reviewer',
  'plan-reviewer',
  'copy-fidelity',
  'copy-interaction-fidelity',
  'copy-qa-reviewer',
  'Explore',
  'Plan',
]);

function isReadOnlyAgent(name) {
  if (!name || typeof name !== 'string') return false;
  return READ_ONLY_AGENTS.has(name);
}

function createState() {
  return {
    version: STATE_VERSION,
    pending: [],
  };
}

function appendPendingAgent(state, { agent, sessionId, timestamp } = {}) {
  if (!agent) throw new Error('appendPendingAgent: agent 필수');
  if (!sessionId) throw new Error('appendPendingAgent: sessionId 필수');
  if (!timestamp) throw new Error('appendPendingAgent: timestamp 필수');

  // read-only 에이전트는 append 생략 (cache invalidation 대상 아님)
  if (isReadOnlyAgent(agent)) {
    return {
      version: state.version || STATE_VERSION,
      pending: [...(state.pending || [])],
    };
  }

  const existingIndex = (state.pending || []).findIndex(
    (entry) => entry.sessionId === sessionId && entry.agent === agent
  );

  const next = [...(state.pending || [])];
  if (existingIndex >= 0) {
    // 중복 → timestamp 갱신
    next[existingIndex] = { ...next[existingIndex], timestamp };
  } else {
    next.push({ agent, sessionId, timestamp });
  }

  return {
    version: state.version || STATE_VERSION,
    pending: next,
  };
}

function isAgentPending(state, sessionId, agent) {
  if (!state || !Array.isArray(state.pending)) return false;
  return state.pending.some(
    (entry) => entry.sessionId === sessionId && entry.agent === agent
  );
}

function hasAnyPending(state, sessionId) {
  if (!state || !Array.isArray(state.pending)) return false;
  return state.pending.some((entry) => entry.sessionId === sessionId);
}

function listPendingAgents(state, sessionId) {
  if (!state || !Array.isArray(state.pending)) return [];
  return state.pending.filter((entry) => entry.sessionId === sessionId);
}

function clearAgent(state, sessionId, agent) {
  return {
    version: state.version || STATE_VERSION,
    pending: (state.pending || []).filter(
      (entry) => !(entry.sessionId === sessionId && entry.agent === agent)
    ),
  };
}

function clearSession(state, sessionId) {
  return {
    version: state.version || STATE_VERSION,
    pending: (state.pending || []).filter(
      (entry) => entry.sessionId !== sessionId
    ),
  };
}

function serialize(state) {
  return JSON.stringify(state, null, 2);
}

function deserialize(raw) {
  if (!raw || typeof raw !== 'string') return createState();
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return createState();
    if (!Array.isArray(parsed.pending)) return createState();
    return {
      version: parsed.version || STATE_VERSION,
      pending: parsed.pending.filter(
        (entry) =>
          entry &&
          typeof entry === 'object' &&
          typeof entry.agent === 'string' &&
          typeof entry.sessionId === 'string'
      ),
    };
  } catch {
    return createState();
  }
}

module.exports = {
  createState,
  appendPendingAgent,
  isAgentPending,
  hasAnyPending,
  listPendingAgents,
  clearAgent,
  clearSession,
  isReadOnlyAgent,
  serialize,
  deserialize,
  STATE_VERSION,
  READ_ONLY_AGENTS,
};
