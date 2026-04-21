/**
 * IMP-KIT-013 RED — Dev Gate Draft 조기 플래그 테스트
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/plan/agents/plan-dev-gate.js'
const { buildDevGateSection, validateDevGate, DEV_GATE_ITEMS } = pkg

describe('plan-dev-gate — Dev 착수 전 확인 섹션', () => {
  describe('buildDevGateSection — 섹션 생성', () => {
    it('Standard dev Feature 4항목 모두 포함', () => {
      const md = buildDevGateSection({
        slug: 'hero-refresh',
        scope: 'Standard',
        featureType: 'dev'
      })
      expect(md).toMatch(/## Dev 착수 전 확인/)
      expect(md).toMatch(/Legacy 격리/)
      expect(md).toMatch(/TASK ID 네이밍/)
      expect(md).toMatch(/의존 Feature 식별/)
      expect(md).toMatch(/데이터 마이그레이션/)
    })

    it('hybrid (dev + reference-only) Feature도 섹션 생성', () => {
      const md = buildDevGateSection({
        slug: 'hero-refresh',
        scope: 'Standard',
        featureType: 'dev',
        hybrid: true
      })
      expect(md).toMatch(/## Dev 착수 전 확인/)
    })

    it('Lite Feature는 빈 문자열 반환 (섹션 미주입)', () => {
      const md = buildDevGateSection({
        slug: 'simple',
        scope: 'Lite',
        featureType: 'dev'
      })
      expect(md).toBe('')
    })

    it('copy Feature는 빈 문자열 반환', () => {
      const md = buildDevGateSection({
        slug: 'hero-visual',
        scope: 'Standard',
        featureType: 'copy'
      })
      expect(md).toBe('')
    })
  })

  describe('validateDevGate — 4항목 충족 검증', () => {
    it('모든 항목 체크 완료 → passed=true', () => {
      const result = validateDevGate({
        legacyIsolationChecked: true,
        taskIdPatternSelected: true,
        dependenciesIdentified: true,
        migrationTypeDecided: true
      })
      expect(result.passed).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('Legacy 격리 누락 → missing', () => {
      const result = validateDevGate({
        legacyIsolationChecked: false,
        taskIdPatternSelected: true,
        dependenciesIdentified: true,
        migrationTypeDecided: true
      })
      expect(result.missing).toContain('legacy-isolation')
    })

    it('모든 항목 누락 시 missing 4건', () => {
      const result = validateDevGate({})
      expect(result.missing.length).toBe(4)
      expect(result.passed).toBe(false)
    })
  })

  describe('DEV_GATE_ITEMS 상수', () => {
    it('4항목 포함', () => {
      expect(DEV_GATE_ITEMS.length).toBe(4)
      expect(DEV_GATE_ITEMS.map(i => i.key)).toEqual([
        'legacy-isolation',
        'task-id-pattern',
        'dependencies',
        'migration-type'
      ])
    })
  })
})
