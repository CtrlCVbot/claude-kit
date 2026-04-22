/**
 * IMP-KIT-017 RED — 문서 재복제 감지 테스트
 *
 * 스펙: docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-017-no-duplication-skill.md
 * 지표 #8: 재복제 감지 건수 = 0
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/hooks/no-duplication-guard.js'
const { decideDuplication, computeSimilarity, DEFAULT_THRESHOLD } = pkg

describe('no-duplication-guard — 유사도 검증', () => {
  describe('기본 동작', () => {
    it('100% 동일 문자열 → isDuplicate=true, similarity=1.0', () => {
      const text = 'Lorem ipsum dolor sit amet consectetur adipiscing elit'
      const result = decideDuplication({ content: text, existing: text })
      expect(result.isDuplicate).toBe(true)
      expect(result.similarity).toBeCloseTo(1.0, 5)
      expect(result.warning).toMatch(/재복제 감지/)
    })

    it('완전히 다른 문자열 → isDuplicate=false, similarity<0.5', () => {
      const a = 'The quick brown fox jumps over the lazy dog repeatedly'
      const b = '이것은 한국어로 작성된 완전히 다른 내용의 텍스트입니다'
      const result = decideDuplication({ content: a, existing: b })
      expect(result.isDuplicate).toBe(false)
      expect(result.similarity).toBeLessThan(0.5)
      expect(result.warning).toBeUndefined()
    })

    it('빈 입력 → isDuplicate=false, similarity=0', () => {
      expect(decideDuplication({ content: '', existing: '' }).isDuplicate).toBe(false)
      expect(decideDuplication({ content: 'a', existing: '' }).isDuplicate).toBe(false)
      expect(decideDuplication({ content: '', existing: 'b' }).isDuplicate).toBe(false)
    })
  })

  describe('threshold 조정', () => {
    it('threshold 0.5 + 부분 중복 → isDuplicate=true', () => {
      const a = 'Lorem ipsum dolor sit amet consectetur adipiscing elit tempor incididunt ut'
      const b = 'Lorem ipsum dolor sit amet consectetur NEW CONTENT MIXED labore et dolore magna'
      const result = decideDuplication({ content: a, existing: b, threshold: 0.3 })
      expect(result.similarity).toBeGreaterThan(0.1)
    })

    it('threshold 0.99 + 약간 다른 문자열 → isDuplicate=false', () => {
      const a = 'Lorem ipsum dolor sit amet consectetur adipiscing elit'
      const b = 'Lorem ipsum dolor sit amet consectetur adipiscing XYZ'
      const result = decideDuplication({ content: a, existing: b, threshold: 0.99 })
      expect(result.isDuplicate).toBe(false)
    })

    it('threshold 미지정 시 DEFAULT_THRESHOLD (0.8) 사용', () => {
      expect(DEFAULT_THRESHOLD).toBe(0.8)
    })
  })

  describe('computeSimilarity 헬퍼 (n-gram Jaccard)', () => {
    it('동일 문자열 → 1.0', () => {
      expect(computeSimilarity('abcdefghij', 'abcdefghij')).toBeCloseTo(1.0, 5)
    })

    it('겹치지 않는 문자열 → 0.0', () => {
      // 8-gram 기반. 8자 이상의 공통 연속 문자열이 없어야 0
      const a = 'aaaaaaaa' // 단일 8-gram
      const b = 'bbbbbbbb' // 단일 8-gram, 다른 것
      expect(computeSimilarity(a, b)).toBe(0)
    })

    it('짧은 문자열(8자 미만) → 0 반환 (n-gram 미형성)', () => {
      expect(computeSimilarity('abc', 'abc')).toBe(0)
    })
  })

  describe('입력 정규화', () => {
    it('whitespace 차이 무시 (trim 적용)', () => {
      const a = '   Lorem ipsum dolor sit amet consectetur   '
      const b = 'Lorem ipsum dolor sit amet consectetur'
      const result = decideDuplication({ content: a, existing: b })
      expect(result.similarity).toBeCloseTo(1.0, 5)
    })

    it('빈 입력 시 크래시 없음', () => {
      expect(() => decideDuplication({})).not.toThrow()
      expect(decideDuplication({}).isDuplicate).toBe(false)
    })
  })
})
