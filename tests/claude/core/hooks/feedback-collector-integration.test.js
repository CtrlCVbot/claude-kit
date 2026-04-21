/**
 * kit-feedback-archiving Phase 3.2.5 RED — 통합 테스트 (end-to-end)
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/hooks/feedback-collector.js'
import devPkg from '../../../../src/claude/core/collectors/dev-collector.js'
const { buildFullEntry, detectRuntime } = pkg
const { recordSubagentStop, clearAggregatedAgents } = devPkg

describe('feedback-collector Phase 3.2.5 — main() 통합', () => {
  describe('buildFullEntry — 전체 엔트리 생성', () => {
    it('plan 도메인: base + plan_specific + issues 통합', () => {
      const entry = buildFullEntry({
        command: '/plan-draft',
        runtime: 'claude',
        sessionId: 'sess-test-1',
        startedAt: '2026-04-20T14:25:00+09:00',
        endedAt: '2026-04-20T14:30:22+09:00',
        transcript: 'Draft 판정: Standard, 시나리오 C, Feature 유형: hybrid',
        slug: 'feat-x'
      })
      expect(entry.schema_version).toBe('1.0')
      expect(entry.domain).toBe('plan')
      expect(entry.plan_specific).toBeDefined()
      expect(entry.plan_specific.draft_category).toBe('Standard')
      expect(Array.isArray(entry.issues_observed)).toBe(true)
    })

    it('dev 도메인: agents_chain 포함', () => {
      const sessionId = 'sess-dev-' + Date.now()
      recordSubagentStop({ sessionId, agent: 'dev-architect', status: 'success' })
      recordSubagentStop({ sessionId, agent: 'dev-doc-updater', status: 'success' })

      const entry = buildFullEntry({
        command: '/dev-feature',
        runtime: 'claude',
        sessionId,
        startedAt: '2026-04-20T15:00:00+09:00',
        endedAt: '2026-04-20T15:10:00+09:00',
        transcript: 'Phase C 완료. 7 files modified.'
      })

      expect(entry.domain).toBe('dev')
      expect(entry.dev_specific.phase).toBe('C')
      expect(entry.dev_specific.agents_chain).toEqual(['dev-architect', 'dev-doc-updater'])

      clearAggregatedAgents(sessionId)
    })

    it('이슈 감지된 엔트리는 issues_observed 배열에 포함', () => {
      const entry = buildFullEntry({
        command: '/dev-feature',
        runtime: 'claude',
        sessionId: 'sess-issue-1',
        startedAt: '2026-04-20T15:00:00+09:00',
        endedAt: '2026-04-20T15:10:00+09:00',
        transcript: "Tool 'Edit' is not available for agent 'dev-architect'. File has not been read yet.",
        humanCheckpoints: 5
      })
      expect(entry.issues_observed.length).toBeGreaterThanOrEqual(3)
      const types = entry.issues_observed.map(i => i.type)
      expect(types).toContain('permission_mismatch')
      expect(types).toContain('cache_error')
      expect(types).toContain('checkpoint_imbalance')
    })

    it('copy 도메인: copy_specific 포함', () => {
      const entry = buildFullEntry({
        command: '/copy-verify',
        runtime: 'claude',
        sessionId: 'sess-copy-1',
        startedAt: '2026-04-20T16:00:00+09:00',
        endedAt: '2026-04-20T16:05:00+09:00',
        transcript: 'Verify result: PASS'
      })
      expect(entry.copy_specific.verify_result).toBe('PASS')
    })

    it('생성된 엔트리는 feedback-entry.schema.json v1.0 스키마 유효', () => {
      const entry = buildFullEntry({
        command: '/plan-draft',
        runtime: 'claude',
        sessionId: 'sess-valid-1',
        startedAt: '2026-04-20T14:25:00+09:00',
        endedAt: '2026-04-20T14:30:22+09:00',
        transcript: 'normal session'
      })
      const { validateFeedbackEntry } = pkg
      const result = validateFeedbackEntry(entry)
      expect(result.valid).toBe(true)
    })
  })

  describe('detectRuntime', () => {
    it('CLAUDE_SESSION_ID 있으면 claude', () => {
      expect(detectRuntime({ env: { CLAUDE_SESSION_ID: 'x' } })).toBe('claude')
    })
    it('CODEX_SESSION_ID 있으면 codex', () => {
      expect(detectRuntime({ env: { CODEX_SESSION_ID: 'x' } })).toBe('codex')
    })
    it('둘 다 없으면 other', () => {
      expect(detectRuntime({ env: {} })).toBe('other')
    })
    it('명시적 runtime 우선', () => {
      expect(detectRuntime({ runtime: 'codex', env: { CLAUDE_SESSION_ID: 'x' } })).toBe('codex')
    })
  })
})
