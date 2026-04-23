/**
 * T-RACE-02 RED — Read 캐시 재인증 state 모듈 테스트
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-RACE-02.md
 * SSOT: src/claude/core/rules/agent-file-ownership.md (T-RACE-01) +
 *        src/claude/core/rules/verification.md (Agent Edit Race)
 * 대응: N-03 — 에이전트 완료 후 메인 Edit 시 "File has not been read yet" 에러 반복.
 *
 * 본 모듈은 순수 함수만 제공 (파일 I/O 없음). hook 파일이 이 모듈을 사용해
 * .claude/state/pending-reread.json 을 직렬화·역직렬화한다.
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/hooks/_read-cache-state.js'
const {
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
  STATE_VERSION
} = pkg

describe('_read-cache-state — 버전 + 기본 state', () => {
  it('STATE_VERSION 은 문자열 상수', () => {
    expect(typeof STATE_VERSION).toBe('string')
    expect(STATE_VERSION.length).toBeGreaterThan(0)
  })

  it('createState() → 빈 state 객체', () => {
    const state = createState()
    expect(state).toHaveProperty('version', STATE_VERSION)
    expect(state).toHaveProperty('pending')
    expect(Array.isArray(state.pending)).toBe(true)
    expect(state.pending.length).toBe(0)
  })
})

describe('_read-cache-state — isReadOnlyAgent (T-RACE-01 매트릭스 참조)', () => {
  it('dev-architect 는 read-only', () => {
    expect(isReadOnlyAgent('dev-architect')).toBe(true)
  })
  it('dev-code-reviewer, plan-reviewer 는 read-only', () => {
    expect(isReadOnlyAgent('dev-code-reviewer')).toBe(true)
    expect(isReadOnlyAgent('plan-reviewer')).toBe(true)
  })
  it('copy 도메인 read-only 3 종', () => {
    expect(isReadOnlyAgent('copy-fidelity')).toBe(true)
    expect(isReadOnlyAgent('copy-interaction-fidelity')).toBe(true)
    expect(isReadOnlyAgent('copy-qa-reviewer')).toBe(true)
  })
  it('Claude Code 기본 read-only', () => {
    expect(isReadOnlyAgent('Explore')).toBe(true)
    expect(isReadOnlyAgent('Plan')).toBe(true)
  })
  it('plan-draft-writer 는 write-capable', () => {
    expect(isReadOnlyAgent('plan-draft-writer')).toBe(false)
  })
  it('plan-bridge-writer, plan-idea-collector 는 write-capable', () => {
    expect(isReadOnlyAgent('plan-bridge-writer')).toBe(false)
    expect(isReadOnlyAgent('plan-idea-collector')).toBe(false)
  })
  it('빈 이름은 read-only 아님 (false) — 안전 기본값', () => {
    expect(isReadOnlyAgent('')).toBe(false)
    expect(isReadOnlyAgent(null)).toBe(false)
    expect(isReadOnlyAgent(undefined)).toBe(false)
  })
  it('부분 문자열 매칭 금지 — exact equality', () => {
    // "plan-reviewer" 가 read-only 이지만 "plan-reviewer-writer" 는 write-capable
    expect(isReadOnlyAgent('plan-reviewer-writer')).toBe(false)
  })
})

describe('_read-cache-state — appendPendingAgent', () => {
  it('새 entry 추가', () => {
    const state = createState()
    const updated = appendPendingAgent(state, {
      agent: 'plan-draft-writer',
      sessionId: 'sess-1',
      timestamp: '2026-04-23T14:00:00Z'
    })
    expect(updated.pending.length).toBe(1)
    expect(updated.pending[0]).toMatchObject({
      agent: 'plan-draft-writer',
      sessionId: 'sess-1',
      timestamp: '2026-04-23T14:00:00Z'
    })
  })

  it('불변성 — 원본 state 는 변경 안 됨', () => {
    const state = createState()
    const before = state.pending.length
    appendPendingAgent(state, {
      agent: 'plan-draft-writer',
      sessionId: 'sess-1',
      timestamp: '2026-04-23T14:00:00Z'
    })
    expect(state.pending.length).toBe(before)
  })

  it('동일 session+agent 중복 → 항목 수 유지 + timestamp 갱신', () => {
    let state = appendPendingAgent(createState(), {
      agent: 'plan-draft-writer',
      sessionId: 'sess-1',
      timestamp: '2026-04-23T14:00:00Z'
    })
    state = appendPendingAgent(state, {
      agent: 'plan-draft-writer',
      sessionId: 'sess-1',
      timestamp: '2026-04-23T14:05:00Z'
    })
    expect(state.pending.length).toBe(1)
    expect(state.pending[0].timestamp).toBe('2026-04-23T14:05:00Z')
  })

  it('다른 session 또는 다른 agent → 독립 항목', () => {
    let state = appendPendingAgent(createState(), {
      agent: 'plan-draft-writer',
      sessionId: 'sess-1',
      timestamp: '2026-04-23T14:00:00Z'
    })
    state = appendPendingAgent(state, {
      agent: 'plan-draft-writer',
      sessionId: 'sess-2',  // 다른 session
      timestamp: '2026-04-23T14:01:00Z'
    })
    state = appendPendingAgent(state, {
      agent: 'plan-bridge-writer',  // 다른 agent
      sessionId: 'sess-1',
      timestamp: '2026-04-23T14:02:00Z'
    })
    expect(state.pending.length).toBe(3)
  })

  it('read-only 에이전트 append 시도 → 무시 (state 불변)', () => {
    const state = appendPendingAgent(createState(), {
      agent: 'plan-reviewer',
      sessionId: 'sess-1',
      timestamp: '2026-04-23T14:00:00Z'
    })
    expect(state.pending.length).toBe(0)
  })

  it('필수 필드 누락 시 예외', () => {
    expect(() => appendPendingAgent(createState(), {})).toThrow()
    expect(() => appendPendingAgent(createState(), { agent: 'x' })).toThrow()
    expect(() => appendPendingAgent(createState(), { agent: 'x', sessionId: 's' })).toThrow()
  })
})

describe('_read-cache-state — 조회 함수', () => {
  function populateState() {
    let state = appendPendingAgent(createState(), {
      agent: 'plan-draft-writer',
      sessionId: 'sess-A',
      timestamp: '2026-04-23T14:00:00Z'
    })
    state = appendPendingAgent(state, {
      agent: 'plan-bridge-writer',
      sessionId: 'sess-A',
      timestamp: '2026-04-23T14:05:00Z'
    })
    state = appendPendingAgent(state, {
      agent: 'plan-draft-writer',
      sessionId: 'sess-B',
      timestamp: '2026-04-23T14:10:00Z'
    })
    return state
  }

  it('isAgentPending — 존재 확인', () => {
    const state = populateState()
    expect(isAgentPending(state, 'sess-A', 'plan-draft-writer')).toBe(true)
    expect(isAgentPending(state, 'sess-A', 'plan-bridge-writer')).toBe(true)
    expect(isAgentPending(state, 'sess-A', 'plan-prd-writer')).toBe(false)
    expect(isAgentPending(state, 'sess-C', 'plan-draft-writer')).toBe(false)
  })

  it('hasAnyPending — 세션 기준', () => {
    const state = populateState()
    expect(hasAnyPending(state, 'sess-A')).toBe(true)
    expect(hasAnyPending(state, 'sess-B')).toBe(true)
    expect(hasAnyPending(state, 'sess-C')).toBe(false)
  })

  it('listPendingAgents — 세션별 필터링', () => {
    const state = populateState()
    const agentsA = listPendingAgents(state, 'sess-A')
    expect(agentsA.length).toBe(2)
    expect(agentsA.map((e) => e.agent).sort()).toEqual(['plan-bridge-writer', 'plan-draft-writer'])

    const agentsB = listPendingAgents(state, 'sess-B')
    expect(agentsB.length).toBe(1)
    expect(agentsB[0].agent).toBe('plan-draft-writer')

    const agentsC = listPendingAgents(state, 'sess-C')
    expect(agentsC.length).toBe(0)
  })
})

describe('_read-cache-state — 제거 함수', () => {
  it('clearAgent — 해당 session+agent 만 제거 (다른 항목 보존)', () => {
    let state = appendPendingAgent(createState(), {
      agent: 'plan-draft-writer',
      sessionId: 'sess-A',
      timestamp: '2026-04-23T14:00:00Z'
    })
    state = appendPendingAgent(state, {
      agent: 'plan-bridge-writer',
      sessionId: 'sess-A',
      timestamp: '2026-04-23T14:05:00Z'
    })

    const cleared = clearAgent(state, 'sess-A', 'plan-draft-writer')
    expect(cleared.pending.length).toBe(1)
    expect(cleared.pending[0].agent).toBe('plan-bridge-writer')
  })

  it('clearAgent — 존재하지 않는 항목은 no-op', () => {
    const state = appendPendingAgent(createState(), {
      agent: 'plan-draft-writer',
      sessionId: 'sess-A',
      timestamp: '2026-04-23T14:00:00Z'
    })
    const cleared = clearAgent(state, 'sess-C', 'plan-draft-writer')
    expect(cleared.pending.length).toBe(1)
  })

  it('clearSession — 해당 session 전체 제거', () => {
    let state = appendPendingAgent(createState(), {
      agent: 'plan-draft-writer',
      sessionId: 'sess-A',
      timestamp: '2026-04-23T14:00:00Z'
    })
    state = appendPendingAgent(state, {
      agent: 'plan-bridge-writer',
      sessionId: 'sess-A',
      timestamp: '2026-04-23T14:05:00Z'
    })
    state = appendPendingAgent(state, {
      agent: 'plan-draft-writer',
      sessionId: 'sess-B',
      timestamp: '2026-04-23T14:10:00Z'
    })
    const cleared = clearSession(state, 'sess-A')
    expect(cleared.pending.length).toBe(1)
    expect(cleared.pending[0].sessionId).toBe('sess-B')
  })
})

describe('_read-cache-state — 직렬화', () => {
  it('serialize → deserialize 왕복', () => {
    const state = appendPendingAgent(createState(), {
      agent: 'plan-draft-writer',
      sessionId: 'sess-1',
      timestamp: '2026-04-23T14:00:00Z'
    })
    const json = serialize(state)
    expect(typeof json).toBe('string')
    const parsed = deserialize(json)
    expect(parsed.version).toBe(STATE_VERSION)
    expect(parsed.pending.length).toBe(1)
    expect(parsed.pending[0].agent).toBe('plan-draft-writer')
  })

  it('deserialize — 잘못된 JSON → 빈 state 반환 (fail-open)', () => {
    const parsed = deserialize('{ this is not json')
    expect(parsed.version).toBe(STATE_VERSION)
    expect(parsed.pending.length).toBe(0)
  })

  it('deserialize — 빈 문자열 → 빈 state', () => {
    expect(deserialize('').pending.length).toBe(0)
    expect(deserialize(null).pending.length).toBe(0)
    expect(deserialize(undefined).pending.length).toBe(0)
  })

  it('deserialize — 스키마 불일치 → 빈 state (안전)', () => {
    const parsed = deserialize('{"foo": "bar"}')
    expect(parsed.version).toBe(STATE_VERSION)
    expect(parsed.pending.length).toBe(0)
  })

  it('serialize — JSON 은 2-space indent 로 읽기 쉬움', () => {
    const state = createState()
    const json = serialize(state)
    expect(json).toContain('\n')  // multi-line
    expect(json).toContain('  ')  // indented
  })
})
