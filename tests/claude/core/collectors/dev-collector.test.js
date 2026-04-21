/**
 * kit-feedback-archiving Phase 3.2.4 RED — dev-collector + SubagentStop aggregator
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import pkg from '../../../../src/claude/core/collectors/dev-collector.js'
const {
  collectDevSpecific,
  recordSubagentStop,
  readAggregatedAgents,
  clearAggregatedAgents,
  DEV_COMMANDS,
  TRACKED_AGENTS
} = pkg

describe('dev-collector — Phase 3.2.4', () => {
  describe('/dev-feature (핵심)', () => {
    it('phase + files_modified_count 추출', () => {
      const result = collectDevSpecific({
        command: '/dev-feature',
        transcript: 'Phase C 완료. 7 files modified. Build status: success.'
      })
      expect(result.phase).toBe('C')
      expect(result.files_modified_count).toBe(7)
      expect(result.build_status).toBe('success')
    })

    it('phase A 인식', () => {
      const result = collectDevSpecific({
        command: '/dev-feature',
        transcript: 'Phase A 분석 단계'
      })
      expect(result.phase).toBe('A')
    })
  })

  describe('/dev-verify + dev-verify-all + dev-verify-fe', () => {
    it('test_results 추출 (passed/failed/coverage)', () => {
      const result = collectDevSpecific({
        command: '/dev-verify',
        transcript: 'Tests: 34 passed, 0 failed. Coverage: 87%'
      })
      expect(result.test_results).toEqual({ passed: 34, failed: 0, coverage_percent: 87 })
    })

    it('TDD violations 감지 (dev-verify-all)', () => {
      const result = collectDevSpecific({
        command: '/dev-verify-all',
        transcript: 'TDD violations detected: 2'
      })
      expect(result.tdd_violations).toBe(2)
    })

    it('dev-verify-fe 동일 패턴', () => {
      const result = collectDevSpecific({
        command: '/dev-verify-fe',
        transcript: 'Tests: 15 passed, 2 failed. Coverage: 72%'
      })
      expect(result.test_results.passed).toBe(15)
      expect(result.test_results.failed).toBe(2)
    })
  })

  describe('/dev-architecture', () => {
    it('구조 SSOT 신규/업데이트 건수', () => {
      const result = collectDevSpecific({
        command: '/dev-architecture',
        transcript: 'SSOT entries: 3 new, 1 updated'
      })
      expect(result.ssot_new).toBe(3)
      expect(result.ssot_updated).toBe(1)
    })
  })

  describe('/dev-commit + /dev-commit-push-pr', () => {
    it('commit 원자성 (파일 수)', () => {
      const result = collectDevSpecific({
        command: '/dev-commit',
        transcript: 'Committed 4 files. Message length: 180 chars.'
      })
      expect(result.commit_files_count).toBe(4)
      expect(result.commit_message_length).toBe(180)
    })

    it('PR push (dev-commit-push-pr)', () => {
      const result = collectDevSpecific({
        command: '/dev-commit-push-pr',
        transcript: 'PR created. Checklist completion: 90%'
      })
      expect(result.pr_checklist_completion).toBe(90)
    })
  })

  describe('SubagentStop aggregator', () => {
    const testSessionId = 'test-session-' + Date.now()

    afterEach(() => {
      clearAggregatedAgents(testSessionId)
    })

    it('recordSubagentStop → 단일 마커 파일 생성', () => {
      recordSubagentStop({
        sessionId: testSessionId,
        agent: 'dev-architect',
        status: 'success'
      })
      const aggregated = readAggregatedAgents(testSessionId)
      expect(aggregated).toHaveLength(1)
      expect(aggregated[0].agent).toBe('dev-architect')
    })

    it('여러 에이전트 누적', () => {
      recordSubagentStop({ sessionId: testSessionId, agent: 'dev-architect', status: 'success' })
      recordSubagentStop({ sessionId: testSessionId, agent: 'dev-doc-updater', status: 'success' })
      recordSubagentStop({ sessionId: testSessionId, agent: 'plan-reviewer', status: 'success' })

      const aggregated = readAggregatedAgents(testSessionId)
      expect(aggregated).toHaveLength(3)
      expect(aggregated.map(a => a.agent)).toEqual([
        'dev-architect', 'dev-doc-updater', 'plan-reviewer'
      ])
    })

    it('clearAggregatedAgents → 비움', () => {
      recordSubagentStop({ sessionId: testSessionId, agent: 'dev-architect', status: 'success' })
      clearAggregatedAgents(testSessionId)
      expect(readAggregatedAgents(testSessionId)).toHaveLength(0)
    })

    it('세션별 독립', () => {
      const other = 'test-other-' + Date.now()
      recordSubagentStop({ sessionId: testSessionId, agent: 'dev-architect', status: 'success' })
      recordSubagentStop({ sessionId: other, agent: 'plan-reviewer', status: 'success' })

      expect(readAggregatedAgents(testSessionId)).toHaveLength(1)
      expect(readAggregatedAgents(other)).toHaveLength(1)
      clearAggregatedAgents(other)
    })
  })

  describe('agents_chain 통합', () => {
    it('SubagentStop 누적 + dev-collector 통합으로 agents_chain 반환', () => {
      const sessionId = 'test-chain-' + Date.now()
      recordSubagentStop({ sessionId, agent: 'dev-architect', status: 'success' })
      recordSubagentStop({ sessionId, agent: 'dev-doc-updater', status: 'success' })

      const result = collectDevSpecific({
        command: '/dev-feature',
        transcript: 'Phase C',
        sessionId
      })
      expect(result.agents_chain).toEqual(['dev-architect', 'dev-doc-updater'])
      clearAggregatedAgents(sessionId)
    })
  })

  describe('상수', () => {
    it('DEV_COMMANDS 7개', () => {
      expect(DEV_COMMANDS.length).toBe(7)
      expect(DEV_COMMANDS).toContain('/dev-feature')
      expect(DEV_COMMANDS).toContain('/dev-commit-push-pr')
    })

    it('TRACKED_AGENTS 9개 포함 (03-trigger-points §4.2)', () => {
      expect(TRACKED_AGENTS).toContain('dev-architect')
      expect(TRACKED_AGENTS).toContain('plan-draft-writer')
      expect(TRACKED_AGENTS.length).toBeGreaterThanOrEqual(9)
    })
  })

  describe('범용', () => {
    it('비-dev 커맨드 → 빈 객체', () => {
      expect(collectDevSpecific({ command: '/plan-draft' })).toEqual({})
    })
  })
})
