/**
 * IMP-KIT-008 RED — plan-idea-screener 재판정 메모리 기록 테스트
 * 스펙: docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-008-screener-memory.md
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/plan/agents/plan-idea-screener-rescoring.js'
const { buildRescoringLogEntry, shouldRecord, isValidEntry } = pkg

const validPrev = { status: 'Hold', score: 8.5, framework: 'rice', date: '2026-02-15' }
const validNew = { status: 'Go', score: 12.3, framework: 'rice', date: '2026-04-21' }

describe('plan-idea-screener-rescoring — 재판정 메모리', () => {
  describe('shouldRecord — 전환 감지', () => {
    it('Hold → Go 전환 시 true', () => {
      expect(shouldRecord(validPrev, validNew)).toBe(true)
    })

    it('Go → Go 재평가 시 false', () => {
      const prev = { ...validPrev, status: 'Go' }
      const cur = { ...validNew, status: 'Go' }
      expect(shouldRecord(prev, cur)).toBe(false)
    })

    it('Hold → Hold 재평가 (점수만 변경) 시 false', () => {
      const prev = { ...validPrev, status: 'Hold', score: 5.0 }
      const cur = { ...validNew, status: 'Hold', score: 7.0 }
      expect(shouldRecord(prev, cur)).toBe(false)
    })

    it('Kill → Go (복구) 전환 시 true', () => {
      const prev = { ...validPrev, status: 'Kill' }
      expect(shouldRecord(prev, validNew)).toBe(true)
    })
  })

  describe('buildRescoringLogEntry — 엔트리 렌더', () => {
    it('필수 필드 모두 포함', () => {
      const md = buildRescoringLogEntry({
        ideaId: 'IDEA-042',
        timestamp: '2026-04-21 10:00',
        prev: validPrev,
        new: validNew,
        rationale: 'Reach 상향 근거 추가, Effort 재검토'
      })
      expect(md).toMatch(/### IDEA-042 — 2026-04-21 10:00/)
      expect(md).toMatch(/이전 판정.*Hold.*RICE 8\.5/)
      expect(md).toMatch(/신규 판정.*Go.*RICE 12\.3/)
      expect(md).toMatch(/프레임워크.*RICE → RICE/)
      expect(md).toMatch(/Reach 상향 근거/)
    })

    it('프레임워크 변경(RICE → 5axis) 표시', () => {
      const md = buildRescoringLogEntry({
        ideaId: 'IDEA-043',
        timestamp: '2026-04-22',
        prev: { ...validPrev, framework: 'rice' },
        new: { ...validNew, framework: '5axis' },
        rationale: '프레임워크 변경 실험'
      })
      expect(md).toMatch(/프레임워크.*RICE → 5axis/)
    })
  })

  describe('isValidEntry — 스키마 검증', () => {
    it('필수 필드 모두 존재 시 true', () => {
      expect(isValidEntry({
        ideaId: 'IDEA-042',
        prev: validPrev,
        new: validNew,
        rationale: '...'
      })).toBe(true)
    })

    it('ideaId 누락 시 false', () => {
      expect(isValidEntry({
        prev: validPrev,
        new: validNew,
        rationale: '...'
      })).toBe(false)
    })

    it('prev.score 누락 시 false', () => {
      expect(isValidEntry({
        ideaId: 'IDEA-042',
        prev: { status: 'Hold' },
        new: validNew,
        rationale: '...'
      })).toBe(false)
    })
  })
})
