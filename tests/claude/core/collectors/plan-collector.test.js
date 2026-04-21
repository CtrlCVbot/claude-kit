/**
 * kit-feedback-archiving Phase 3.2.2 RED — plan-collector 테스트
 * 설계: docs/plan/kit-feedback-archiving/03-trigger-points.md §3.1
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/collectors/plan-collector.js'
const { collectPlanSpecific, PLAN_COMMANDS } = pkg

describe('plan-collector — Phase 3.2.2 (9 커맨드)', () => {
  describe('/plan-idea', () => {
    it('IDEA ID 추출', () => {
      const result = collectPlanSpecific({
        command: '/plan-idea',
        transcript: 'Created IDEA-20260420-042 in 00-inbox/'
      })
      expect(result.idea_id).toBe('IDEA-20260420-042')
    })

    it('IDEA ID 없으면 null', () => {
      const result = collectPlanSpecific({ command: '/plan-idea', transcript: 'no idea here' })
      expect(result.idea_id).toBeNull()
    })
  })

  describe('/plan-screen', () => {
    it('framework + score 추출', () => {
      const result = collectPlanSpecific({
        command: '/plan-screen',
        transcript: '프레임워크: RICE. 점수: 72.5. 판정: Go.'
      })
      expect(result.screening_framework).toBe('rice')
      expect(result.screening_score).toBeCloseTo(72.5, 1)
    })

    it('5axis 프레임워크 인식', () => {
      const result = collectPlanSpecific({
        command: '/plan-screen',
        transcript: '프레임워크: 5axis. 점수: 85.'
      })
      expect(result.screening_framework).toBe('5axis')
      expect(result.screening_score).toBe(85)
    })
  })

  describe('/plan-draft', () => {
    it('draft_category + scenario + feature_type 추출', () => {
      const result = collectPlanSpecific({
        command: '/plan-draft',
        transcript: 'Draft 판정: Standard, 시나리오 C, Feature 유형: hybrid'
      })
      expect(result.draft_category).toBe('Standard')
      expect(result.scenario).toBe('C')
      expect(result.feature_type).toBe('hybrid')
    })

    it('Lite + copy Feature', () => {
      const result = collectPlanSpecific({
        command: '/plan-draft',
        transcript: 'Lite 판정, 시나리오 A, Feature 유형: copy'
      })
      expect(result.draft_category).toBe('Lite')
      expect(result.scenario).toBe('A')
      expect(result.feature_type).toBe('copy')
    })
  })

  describe('/plan-prd', () => {
    it('REQ 개수 추출', () => {
      const result = collectPlanSpecific({
        command: '/plan-prd',
        transcript: 'Generated 74 REQ-xxx entries across 10 sections.'
      })
      expect(result.prd_req_count).toBe(74)
    })
  })

  describe('/plan-review', () => {
    it('severity 분포 추출', () => {
      const result = collectPlanSpecific({
        command: '/plan-review',
        transcript: '심각도 분포: CRITICAL 0, HIGH 1, MEDIUM 2, LOW 3'
      })
      expect(result.review_severity_distribution).toEqual({
        critical: 0, high: 1, medium: 2, low: 3
      })
    })

    it('자동 트리거 여부', () => {
      const result = collectPlanSpecific({
        command: '/plan-review',
        transcript: '[Plan Review] auto-triggered by IMP-KIT-007'
      })
      expect(result.auto_triggered).toBe(true)
    })
  })

  describe('/plan-wireframe', () => {
    it('재호출 횟수 추출', () => {
      const result = collectPlanSpecific({
        command: '/plan-wireframe',
        transcript: 'wireframe recall: 3 times (IMP-KIT-010 target <= 1)'
      })
      expect(result.wireframe_recall_count).toBe(3)
    })

    it('viewport coverage', () => {
      const result = collectPlanSpecific({
        command: '/plan-wireframe',
        transcript: 'Viewports covered: 1440, 1280, 1024, 768, 390'
      })
      expect(result.viewport_coverage).toEqual(['1440', '1280', '1024', '768', '390'])
    })
  })

  describe('/plan-stitch', () => {
    it('stitch 실행 횟수', () => {
      const result = collectPlanSpecific({
        command: '/plan-stitch',
        transcript: 'Stitch executions: 2'
      })
      expect(result.stitch_executions).toBe(2)
    })
  })

  describe('/plan-bridge', () => {
    it('PCC 상태 추출', () => {
      const result = collectPlanSpecific({
        command: '/plan-bridge',
        transcript: 'PCC status: PASS. Parallel executions: 3.'
      })
      expect(result.bridge_pcc_status).toBe('PASS')
      expect(result.parallel_executions).toBe(3)
    })
  })

  describe('/plan-archive', () => {
    it('완료율 + 미완 항목', () => {
      const result = collectPlanSpecific({
        command: '/plan-archive',
        transcript: 'Archive completion: 87%. Pending items: 3'
      })
      expect(result.archive_completion_rate).toBe(87)
      expect(result.pending_items).toBe(3)
    })
  })

  describe('범용', () => {
    it('비-plan 커맨드 → 빈 객체', () => {
      const result = collectPlanSpecific({ command: '/dev-feature', transcript: '...' })
      expect(result).toEqual({})
    })

    it('빈 transcript → 모든 필드 null/기본값', () => {
      const result = collectPlanSpecific({ command: '/plan-draft', transcript: '' })
      expect(result).toBeDefined()
      expect(Object.values(result).every(v => v === null || v === undefined)).toBe(true)
    })

    it('PLAN_COMMANDS 9개 포함', () => {
      expect(PLAN_COMMANDS.length).toBe(9)
      expect(PLAN_COMMANDS).toContain('/plan-idea')
      expect(PLAN_COMMANDS).toContain('/plan-archive')
    })
  })
})
