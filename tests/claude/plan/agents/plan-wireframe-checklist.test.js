/**
 * IMP-KIT-010 RED — plan-wireframe-designer Pre-render 체크리스트 테스트
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/plan/agents/plan-wireframe-checklist.js'
const {
  validateWireframePrerender,
  applyPiiMasking,
  REQUIRED_VIEWPORTS,
  MIN_DECISION_LOG_ENTRIES
} = pkg

describe('plan-wireframe-checklist — Pre-render 검증', () => {
  describe('validateWireframePrerender — 4항목', () => {
    it('모든 항목 충족 → passed=true, missing 없음', () => {
      const result = validateWireframePrerender({
        hasFilledMockData: true,
        hasPiiMasking: true,
        viewports: ['1440', '1280', '1024', '768', '390'],
        decisionLogEntries: 3
      })
      expect(result.passed).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('가상 데이터 누락 → missing에 filled-mock-data', () => {
      const result = validateWireframePrerender({
        hasFilledMockData: false,
        hasPiiMasking: true,
        viewports: ['1440', '1280', '1024', '768', '390'],
        decisionLogEntries: 3
      })
      expect(result.passed).toBe(false)
      expect(result.missing).toContain('filled-mock-data')
    })

    it('PII 마스킹 누락 → missing에 pii-masking', () => {
      const result = validateWireframePrerender({
        hasFilledMockData: true,
        hasPiiMasking: false,
        viewports: ['1440', '1280', '1024', '768', '390'],
        decisionLogEntries: 3
      })
      expect(result.missing).toContain('pii-masking')
    })

    it('5 viewport 중 1개 누락 → missing에 viewports', () => {
      const result = validateWireframePrerender({
        hasFilledMockData: true,
        hasPiiMasking: true,
        viewports: ['1440', '1280', '1024', '768'],
        decisionLogEntries: 3
      })
      expect(result.missing).toContain('viewports')
    })

    it('decision-log 3항목 미만 → missing에 decision-log', () => {
      const result = validateWireframePrerender({
        hasFilledMockData: true,
        hasPiiMasking: true,
        viewports: ['1440', '1280', '1024', '768', '390'],
        decisionLogEntries: 2
      })
      expect(result.missing).toContain('decision-log')
    })

    it('모든 항목 누락 시 missing 4건', () => {
      const result = validateWireframePrerender({})
      expect(result.missing.length).toBe(4)
    })
  })

  describe('applyPiiMasking — 개인정보 마스킹', () => {
    it('전화번호 010-1234-5678 → 010-****-5678', () => {
      expect(applyPiiMasking('연락처: 010-1234-5678')).toBe('연락처: 010-****-5678')
    })

    it('사업자번호 123-45-67890 → ***-**-*****', () => {
      expect(applyPiiMasking('사업자번호: 123-45-67890')).toBe('사업자번호: ***-**-*****')
    })

    it('이미 마스킹된 값은 유지', () => {
      expect(applyPiiMasking('010-****-1234')).toBe('010-****-1234')
    })

    it('PII 미포함 텍스트 변경 없음', () => {
      expect(applyPiiMasking('Hello world')).toBe('Hello world')
    })
  })

  describe('상수', () => {
    it('REQUIRED_VIEWPORTS 5개', () => {
      expect(REQUIRED_VIEWPORTS).toEqual(['1440', '1280', '1024', '768', '390'])
    })

    it('MIN_DECISION_LOG_ENTRIES = 3', () => {
      expect(MIN_DECISION_LOG_ENTRIES).toBe(3)
    })
  })
})
