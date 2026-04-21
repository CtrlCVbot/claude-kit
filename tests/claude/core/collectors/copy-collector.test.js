/**
 * kit-feedback-archiving Phase 3.2.3 RED — copy-collector 테스트
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/collectors/copy-collector.js'
const { collectCopySpecific, COPY_COMMANDS } = pkg

describe('copy-collector — Phase 3.2.3 (7 커맨드)', () => {
  describe('/copy-reference-refresh', () => {
    it('variant + reference-only 모드 감지', () => {
      const result = collectCopySpecific({
        command: '/copy-reference-refresh',
        transcript: 'SITE_VARIANT=kr, --reference-only 모드 활성. Evidence: valid 8, stale 0, missing 0.'
      })
      expect(result.variant).toBe('kr')
      expect(result.reference_only_mode).toBe(true)
      expect(result.evidence_status).toEqual({ valid: 8, stale: 0, missing: 0 })
    })

    it('--full 모드 (기본)', () => {
      const result = collectCopySpecific({
        command: '/copy-reference-refresh',
        transcript: 'SITE_VARIANT=jp, --full 모드'
      })
      expect(result.variant).toBe('jp')
      expect(result.reference_only_mode).toBe(false)
    })
  })

  describe('/copy-visual-review', () => {
    it('gap 분포 추출 (visual)', () => {
      const result = collectCopySpecific({
        command: '/copy-visual-review',
        transcript: 'Visual gaps — P0: 0, P1: 4, P2: 3'
      })
      expect(result.gap_summary).toEqual({ P0: 0, P1: 4, P2: 3 })
    })
  })

  describe('/copy-interaction-review', () => {
    it('interaction gap 분포', () => {
      const result = collectCopySpecific({
        command: '/copy-interaction-review',
        transcript: 'Interaction gaps — P0: 1, P1: 2, P2: 5'
      })
      expect(result.gap_summary).toEqual({ P0: 1, P1: 2, P2: 5 })
    })
  })

  describe('/copy-gap-board', () => {
    it('통합 gap 건수', () => {
      const result = collectCopySpecific({
        command: '/copy-gap-board',
        transcript: 'Total gaps consolidated: 12. Priority distribution — P0: 1, P1: 6, P2: 5'
      })
      expect(result.total_gaps).toBe(12)
      expect(result.gap_summary).toEqual({ P0: 1, P1: 6, P2: 5 })
    })
  })

  describe('/copy-plan-unit', () => {
    it('Execution Unit 수 추출', () => {
      const result = collectCopySpecific({
        command: '/copy-plan-unit',
        transcript: 'Execution Units created: 4'
      })
      expect(result.execution_units).toBe(4)
    })
  })

  describe('/copy-verify', () => {
    it('PASS 판정', () => {
      const result = collectCopySpecific({
        command: '/copy-verify',
        transcript: 'Verify result: PASS'
      })
      expect(result.verify_result).toBe('PASS')
    })

    it('FAIL 판정', () => {
      const result = collectCopySpecific({
        command: '/copy-verify',
        transcript: 'Verify result: FAIL — 3 P0 blocking'
      })
      expect(result.verify_result).toBe('FAIL')
    })
  })

  describe('/copy-closeout', () => {
    it('gap 해결률 추출', () => {
      const result = collectCopySpecific({
        command: '/copy-closeout',
        transcript: 'Closeout complete. Gap resolution rate: 92%'
      })
      expect(result.gap_resolution_rate).toBe(92)
    })
  })

  describe('범용', () => {
    it('비-copy 커맨드 → 빈 객체', () => {
      expect(collectCopySpecific({ command: '/plan-draft' })).toEqual({})
    })

    it('COPY_COMMANDS 7개 포함', () => {
      expect(COPY_COMMANDS.length).toBe(7)
      expect(COPY_COMMANDS).toContain('/copy-reference-refresh')
      expect(COPY_COMMANDS).toContain('/copy-closeout')
    })
  })
})
