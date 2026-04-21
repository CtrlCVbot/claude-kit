/**
 * kit-feedback-archiving Phase 3.3.2 RED — index.md 렌더러 + 3.3.3 롤업
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/archive/index-renderer.js'
import rollupPkg from '../../../../src/claude/core/archive/rollup-generator.js'
import statsPkg from '../../../../src/claude/core/archive/stats-aggregator.js'
const { renderIndexMd } = pkg
const { buildMonthlyRollup, renderRollupMd, groupEntriesByMonth } = rollupPkg

const entry = (overrides = {}) => ({
  schema_version: '1.0',
  entry_id: '20260420-143022-plan-draft-feat-x',
  runtime: 'claude',
  command: '/plan-draft',
  domain: 'plan',
  session: { duration_seconds: 322 },
  usage: {},
  issues_observed: [{ type: 'permission_mismatch', severity: 'P0', related_imp_kit_id: 'IMP-KIT-001' }],
  ...overrides
})

describe('index-renderer — Phase 3.3.2', () => {
  it('헤더 + 통계 + 최근 엔트리 포함', () => {
    const stats = statsPkg.buildStatsFromEntries([
      entry({ entry_id: '20260420-143022-plan-draft-feat-x' }),
      entry({ entry_id: '20260420-135010-dev-feature-feat-y', domain: 'dev', command: '/dev-feature' })
    ])
    const md = renderIndexMd(stats)
    expect(md).toMatch(/# Feedback Archive Index/)
    expect(md).toMatch(/총 엔트리.*2/)
    expect(md).toMatch(/Last updated:/)
    expect(md).toMatch(/P0.*1/)
    expect(md).toMatch(/IMP-KIT-001/)
  })

  it('빈 stats → 헤더 + 0 엔트리', () => {
    const md = renderIndexMd(statsPkg.defaultStats())
    expect(md).toMatch(/총 엔트리.*0/)
  })

  it('직접 편집 금지 경고 포함', () => {
    const md = renderIndexMd(statsPkg.defaultStats())
    expect(md).toMatch(/자동 생성|직접 편집 금지/)
  })
})

describe('rollup-generator — Phase 3.3.3', () => {
  describe('groupEntriesByMonth', () => {
    it('entry_id에서 YYYYMM 추출하여 그룹화', () => {
      const entries = [
        entry({ entry_id: '20260420-143022-plan-draft-a' }),
        entry({ entry_id: '20260415-143022-plan-draft-b' }),
        entry({ entry_id: '20260301-143022-plan-draft-c' })
      ]
      const groups = groupEntriesByMonth(entries)
      expect(groups['2026-04']).toHaveLength(2)
      expect(groups['2026-03']).toHaveLength(1)
    })

    it('entry_id 형식 불일치는 제외', () => {
      const entries = [
        entry({ entry_id: 'bad' }),
        entry({ entry_id: '20260420-143022-plan-draft-a' })
      ]
      const groups = groupEntriesByMonth(entries)
      expect(groups['2026-04']).toHaveLength(1)
    })
  })

  describe('buildMonthlyRollup', () => {
    it('월별 요약 객체 생성', () => {
      const entries = [
        entry({ entry_id: '20260420-143022-plan-draft-a' }),
        entry({ entry_id: '20260415-143022-dev-feature-b', domain: 'dev', command: '/dev-feature' })
      ]
      const rollup = buildMonthlyRollup(entries, '2026-04')
      expect(rollup.period).toBe('2026-04')
      expect(rollup.total_entries).toBe(2)
      expect(rollup.by_runtime.claude).toBe(2)
      expect(rollup.by_domain.plan).toBe(1)
      expect(rollup.by_domain.dev).toBe(1)
    })

    it('avg_session_duration 계산', () => {
      const entries = [
        entry({ session: { duration_seconds: 300 } }),
        entry({ session: { duration_seconds: 500 } })
      ]
      const rollup = buildMonthlyRollup(entries, '2026-04')
      expect(rollup.avg_session_duration).toBe(400)
    })

    it('지정 월 외 엔트리는 제외', () => {
      const entries = [
        entry({ entry_id: '20260301-143022-plan-draft-old' }),
        entry({ entry_id: '20260420-143022-plan-draft-new' })
      ]
      const rollup = buildMonthlyRollup(entries, '2026-04')
      expect(rollup.total_entries).toBe(1)
    })
  })

  describe('renderRollupMd', () => {
    it('월별 요약 마크다운 렌더', () => {
      const rollup = buildMonthlyRollup([
        entry({ entry_id: '20260420-143022-plan-draft-a' })
      ], '2026-04')
      const md = renderRollupMd(rollup)
      expect(md).toMatch(/# Feedback Rollup.*2026-04/)
      expect(md).toMatch(/총.*1/)
      expect(md).toMatch(/도메인 분포/)
    })
  })
})
