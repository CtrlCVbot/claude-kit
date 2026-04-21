/**
 * kit-feedback-archiving Phase 3.3.1 RED — stats.json 집계기 테스트
 * 설계: docs/plan/kit-feedback-archiving/04-archive-layout.md §4
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/archive/stats-aggregator.js'
const { updateStats, buildStatsFromEntries, defaultStats, STATS_VERSION } = pkg

const sampleEntry = (overrides = {}) => ({
  schema_version: '1.0',
  entry_id: '20260420-143022-plan-draft-feat-x',
  runtime: 'claude',
  command: '/plan-draft',
  domain: 'plan',
  session: { session_id: 's1', started_at: '', ended_at: '', duration_seconds: 322 },
  usage: { tools_used: {} },
  issues_observed: [
    { id: 'issue-001', type: 'permission_mismatch', severity: 'P0', related_imp_kit_id: 'IMP-KIT-001' }
  ],
  ...overrides
})

describe('stats-aggregator — Phase 3.3.1', () => {
  describe('defaultStats', () => {
    it('초기 stats 구조', () => {
      const s = defaultStats()
      expect(s.total_entries).toBe(0)
      expect(s.by_runtime).toEqual({ claude: 0, codex: 0, other: 0 })
      expect(s.by_domain).toEqual({ plan: 0, copy: 0, dev: 0, core: 0 })
      expect(s.by_severity).toEqual({ P0: 0, P1: 0, P2: 0 })
      expect(s.by_imp_kit).toEqual({})
      expect(Array.isArray(s.top_issue_types)).toBe(true)
      expect(Array.isArray(s.latest_entry_ids)).toBe(true)
    })
  })

  describe('updateStats — 증분 갱신', () => {
    it('새 엔트리 1건 추가 시 total +1', () => {
      const s = updateStats(defaultStats(), sampleEntry())
      expect(s.total_entries).toBe(1)
      expect(s.by_runtime.claude).toBe(1)
      expect(s.by_domain.plan).toBe(1)
    })

    it('이슈 severity 집계 (P0 1건)', () => {
      const s = updateStats(defaultStats(), sampleEntry())
      expect(s.by_severity.P0).toBe(1)
    })

    it('IMP-KIT 레퍼런스 집계', () => {
      const s = updateStats(defaultStats(), sampleEntry())
      expect(s.by_imp_kit['IMP-KIT-001']).toBe(1)
    })

    it('issue_types 집계', () => {
      const s = updateStats(defaultStats(), sampleEntry())
      const pm = s.top_issue_types.find(t => t.type === 'permission_mismatch')
      expect(pm.count).toBe(1)
    })

    it('latest_entry_ids에 엔트리 ID 추가 (최대 10개)', () => {
      let s = defaultStats()
      for (let i = 0; i < 12; i++) {
        s = updateStats(s, sampleEntry({
          entry_id: `2026042${i % 10}-100000-plan-draft-feat-${i}`
        }))
      }
      expect(s.latest_entry_ids.length).toBe(10)
    })

    it('generated_at 갱신 (ISO 8601)', () => {
      const s = updateStats(defaultStats(), sampleEntry())
      expect(s.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('buildStatsFromEntries — 전체 재계산', () => {
    it('여러 엔트리 합산', () => {
      const entries = [
        sampleEntry({ domain: 'plan', runtime: 'claude' }),
        sampleEntry({ domain: 'dev', runtime: 'claude' }),
        sampleEntry({ domain: 'copy', runtime: 'codex' })
      ]
      const s = buildStatsFromEntries(entries)
      expect(s.total_entries).toBe(3)
      expect(s.by_runtime.claude).toBe(2)
      expect(s.by_runtime.codex).toBe(1)
      expect(s.by_domain.plan).toBe(1)
    })

    it('빈 배열 → defaultStats', () => {
      const s = buildStatsFromEntries([])
      expect(s.total_entries).toBe(0)
    })

    it('top_issue_types는 count 내림차순 정렬', () => {
      const e1 = sampleEntry({
        issues_observed: [
          { type: 'permission_mismatch', severity: 'P0' },
          { type: 'permission_mismatch', severity: 'P0' },
          { type: 'cache_error', severity: 'P1' }
        ]
      })
      const s = buildStatsFromEntries([e1])
      expect(s.top_issue_types[0].type).toBe('permission_mismatch')
      expect(s.top_issue_types[0].count).toBe(2)
    })
  })

  describe('STATS_VERSION 상수', () => {
    it('버전 문자열 존재', () => {
      expect(STATS_VERSION).toBeDefined()
    })
  })
})
