/**
 * IMP-KIT-015 RED — TASK ID 네이밍 표준 테스트
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/_utils/task-id.js'
const { validateTaskId, detectDomain, suggestFix, TASK_ID_PATTERNS } = pkg

describe('task-id — 4패턴 검증', () => {
  describe('dev 패턴 T-{AREA}-{NN}', () => {
    it('T-HERO-01 유효', () => expect(validateTaskId('T-HERO-01', 'dev')).toBe(true))
    it('T-AUTH-123 유효 (3자리)', () => expect(validateTaskId('T-AUTH-123', 'dev')).toBe(true))
    it('T-HERO-1 무효 (2자리 미만)', () => expect(validateTaskId('T-HERO-1', 'dev')).toBe(false))
    it('T-A-01 무효 (AREA 2자 미만)', () => expect(validateTaskId('T-A-01', 'dev')).toBe(false))
    it('t-hero-01 무효 (소문자)', () => expect(validateTaskId('t-hero-01', 'dev')).toBe(false))
  })

  describe('plan 패턴 TASK-{SLUG}-{NN}', () => {
    it('TASK-hero-refresh-03 유효', () => expect(validateTaskId('TASK-hero-refresh-03', 'plan')).toBe(true))
    it('TASK-a-01 무효 (slug 3자 미만)', () => expect(validateTaskId('TASK-a-01', 'plan')).toBe(false))
    it('TASK-HERO-01 무효 (slug은 소문자)', () => expect(validateTaskId('TASK-HERO-01', 'plan')).toBe(false))
  })

  describe('legacy 패턴 LEGACY-{AREA}-{NN}', () => {
    it('LEGACY-AUTH-07 유효', () => expect(validateTaskId('LEGACY-AUTH-07', 'legacy')).toBe(true))
    it('LEGACY 무효 (접미사 없음)', () => expect(validateTaskId('LEGACY', 'legacy')).toBe(false))
  })

  describe('spike 패턴 SPIKE-{AREA}-{NN}', () => {
    it('SPIKE-PERF-02 유효', () => expect(validateTaskId('SPIKE-PERF-02', 'spike')).toBe(true))
  })

  describe('detectDomain — 자동 감지', () => {
    it('T-HERO-01 → dev', () => expect(detectDomain('T-HERO-01')).toBe('dev'))
    it('TASK-hero-refresh-03 → plan', () => expect(detectDomain('TASK-hero-refresh-03')).toBe('plan'))
    it('LEGACY-AUTH-07 → legacy', () => expect(detectDomain('LEGACY-AUTH-07')).toBe('legacy'))
    it('SPIKE-PERF-02 → spike', () => expect(detectDomain('SPIKE-PERF-02')).toBe('spike'))
    it('M1-07 → null (비표준)', () => expect(detectDomain('M1-07')).toBe(null))
  })

  describe('suggestFix — 수정 제안', () => {
    it('M1-07 → T-M1-07 제안 (dev 접두사)', () => {
      expect(suggestFix('M1-07', 'dev')).toBe('T-M1-07')
    })

    it('hero-refresh-03 → TASK-hero-refresh-03 제안 (plan)', () => {
      expect(suggestFix('hero-refresh-03', 'plan')).toBe('TASK-hero-refresh-03')
    })

    it('이미 유효한 ID는 null 반환 (수정 불필요)', () => {
      expect(suggestFix('T-HERO-01', 'dev')).toBe(null)
    })
  })

  describe('TASK_ID_PATTERNS 상수', () => {
    it('4 패턴 포함', () => {
      expect(TASK_ID_PATTERNS.dev).toBeInstanceOf(RegExp)
      expect(TASK_ID_PATTERNS.plan).toBeInstanceOf(RegExp)
      expect(TASK_ID_PATTERNS.legacy).toBeInstanceOf(RegExp)
      expect(TASK_ID_PATTERNS.spike).toBeInstanceOf(RegExp)
    })
  })
})
