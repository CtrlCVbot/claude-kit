/**
 * IMP-KIT-007 RED — plan-review 자동 후속 트리거 테스트
 *
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-007-plan-review-auto-trigger.md
 * 지표 #7: /plan-review 수동 호출 = 0
 */
import { describe, it, expect } from 'vitest'

// 구현은 Step 2 (GREEN)에서 생성된다.
import {
  decideTrigger,
  TRIGGER_COMMANDS,
  REVIEW_COMMAND
} from '../../../../src/claude/plan/hooks/plan-review-trigger.js'

describe('plan-review-trigger — Stop 훅 결정 로직', () => {
  describe('트리거 조건', () => {
    it('/plan-prd 실행 + /plan-review 미실행 → systemMessage 반환', () => {
      const result = decideTrigger({
        commandsExecuted: ['/plan-idea', '/plan-screen', '/plan-prd'],
        autoReview: true
      })
      expect(result.systemMessage).toBeDefined()
      expect(result.systemMessage).toContain('/plan-review')
    })

    it('/plan-draft 실행 + /plan-review 미실행 → systemMessage 반환', () => {
      const result = decideTrigger({
        commandsExecuted: ['/plan-draft'],
        autoReview: true
      })
      expect(result.systemMessage).toContain('/plan-review')
    })

    it('/plan-wireframe 실행 + /plan-review 미실행 → systemMessage 반환', () => {
      const result = decideTrigger({
        commandsExecuted: ['/plan-wireframe'],
        autoReview: true
      })
      expect(result.systemMessage).toContain('/plan-review')
    })
  })

  describe('비트리거 조건', () => {
    it('/plan-review 이미 실행 → systemMessage 없음', () => {
      const result = decideTrigger({
        commandsExecuted: ['/plan-prd', '/plan-review'],
        autoReview: true
      })
      expect(result.systemMessage).toBeUndefined()
    })

    it('autoReview: false → systemMessage 없음', () => {
      const result = decideTrigger({
        commandsExecuted: ['/plan-prd', '/plan-draft', '/plan-wireframe'],
        autoReview: false
      })
      expect(result.systemMessage).toBeUndefined()
    })

    it('트리거 커맨드 전혀 없음 (/plan-idea/screen만) → systemMessage 없음', () => {
      const result = decideTrigger({
        commandsExecuted: ['/plan-idea', '/plan-screen'],
        autoReview: true
      })
      expect(result.systemMessage).toBeUndefined()
    })

    it('빈 커맨드 리스트 → systemMessage 없음', () => {
      const result = decideTrigger({
        commandsExecuted: [],
        autoReview: true
      })
      expect(result.systemMessage).toBeUndefined()
    })
  })

  describe('상수 export', () => {
    it('TRIGGER_COMMANDS는 3개 커맨드 (prd/draft/wireframe)', () => {
      expect(TRIGGER_COMMANDS).toEqual([
        '/plan-prd',
        '/plan-draft',
        '/plan-wireframe'
      ])
    })

    it('REVIEW_COMMAND는 /plan-review', () => {
      expect(REVIEW_COMMAND).toBe('/plan-review')
    })
  })

  describe('입력 정규화', () => {
    it('autoReview 미지정 시 기본 true로 간주', () => {
      const result = decideTrigger({ commandsExecuted: ['/plan-prd'] })
      expect(result.systemMessage).toContain('/plan-review')
    })

    it('commandsExecuted 미지정 시 systemMessage 없음 (크래시 금지)', () => {
      expect(() => decideTrigger({ autoReview: true })).not.toThrow()
      const result = decideTrigger({ autoReview: true })
      expect(result.systemMessage).toBeUndefined()
    })
  })
})
