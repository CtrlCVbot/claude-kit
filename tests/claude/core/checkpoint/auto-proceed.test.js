/**
 * IMP-KIT-016 RED — Checkpoint 자동 진행 플래그 테스트
 *
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md
 * 지표 #6: Human Checkpoint 수 < 3회/세션
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/checkpoint/auto-proceed.js'
const { decideCheckpoint, isCritical, CRITICAL_WHITELIST } = pkg

describe('auto-proceed — Checkpoint 자동 진행 로직', () => {
  describe('기본 동작', () => {
    it('autoProceedOnPass: true + reviewResult: PASS → proceed', () => {
      const result = decideCheckpoint({
        type: 'review-approval',
        reviewResult: 'PASS',
        autoProceedOnPass: true
      })
      expect(result.action).toBe('proceed')
      expect(result.userPromptRequired).toBe(false)
    })

    it('autoProceedOnPass: true + reviewResult: FAIL → halt', () => {
      const result = decideCheckpoint({
        type: 'review-approval',
        reviewResult: 'FAIL',
        autoProceedOnPass: true
      })
      expect(result.action).toBe('halt')
      expect(result.userPromptRequired).toBe(true)
    })

    it('autoProceedOnPass: false → 항상 halt (기존 동작)', () => {
      const result = decideCheckpoint({
        type: 'review-approval',
        reviewResult: 'PASS',
        autoProceedOnPass: false
      })
      expect(result.action).toBe('halt')
    })
  })

  describe('Critical 화이트리스트', () => {
    it('destructive 타입은 플래그 무시, 항상 halt', () => {
      const result = decideCheckpoint({
        type: 'destructive',
        reviewResult: 'PASS',
        autoProceedOnPass: true
      })
      expect(result.action).toBe('halt')
      expect(result.reason).toMatch(/critical/i)
    })

    it('external-api-call 타입은 플래그 무시', () => {
      const result = decideCheckpoint({
        type: 'external-api-call',
        reviewResult: 'PASS',
        autoProceedOnPass: true
      })
      expect(result.action).toBe('halt')
    })

    it('breaking-change 타입은 플래그 무시', () => {
      const result = decideCheckpoint({
        type: 'breaking-change',
        reviewResult: 'PASS',
        autoProceedOnPass: true
      })
      expect(result.action).toBe('halt')
    })

    it('initial-approval-gate 타입은 플래그 무시', () => {
      const result = decideCheckpoint({
        type: 'initial-approval-gate',
        reviewResult: 'PASS',
        autoProceedOnPass: true
      })
      expect(result.action).toBe('halt')
    })
  })

  describe('isCritical 헬퍼', () => {
    it('화이트리스트 매칭 타입에 true 반환', () => {
      expect(isCritical('destructive')).toBe(true)
      expect(isCritical('external-api-call')).toBe(true)
      expect(isCritical('breaking-change')).toBe(true)
      expect(isCritical('initial-approval-gate')).toBe(true)
    })

    it('비-critical 타입에 false 반환', () => {
      expect(isCritical('review-approval')).toBe(false)
      expect(isCritical('scope-confirmation')).toBe(false)
      expect(isCritical(null)).toBe(false)
      expect(isCritical(undefined)).toBe(false)
    })
  })

  describe('CRITICAL_WHITELIST 상수', () => {
    it('최소 4건 포함 (스펙 §2.2 요구)', () => {
      expect(CRITICAL_WHITELIST.length).toBeGreaterThanOrEqual(4)
      expect(CRITICAL_WHITELIST).toContain('destructive')
      expect(CRITICAL_WHITELIST).toContain('external-api-call')
      expect(CRITICAL_WHITELIST).toContain('breaking-change')
      expect(CRITICAL_WHITELIST).toContain('initial-approval-gate')
    })
  })

  describe('입력 정규화', () => {
    it('reviewResult 미지정 시 UNKNOWN으로 간주 → halt', () => {
      const result = decideCheckpoint({
        type: 'review-approval',
        autoProceedOnPass: true
      })
      expect(result.action).toBe('halt')
    })

    it('type 미지정 시 비-critical로 간주', () => {
      const result = decideCheckpoint({
        reviewResult: 'PASS',
        autoProceedOnPass: true
      })
      expect(result.action).toBe('proceed')
    })

    it('빈 입력 시 크래시 없이 halt 반환', () => {
      expect(() => decideCheckpoint({})).not.toThrow()
      expect(decideCheckpoint({}).action).toBe('halt')
    })
  })
})
