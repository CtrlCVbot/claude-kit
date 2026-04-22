/**
 * P2-F RED — plan-epic-integrity 훅 테스트 (v2.4.0 Phase 2 Step 6)
 *
 * 스펙: docs/plan/kit-2.4.0-roadmap/03-kit-반영-포인트.md §8-1
 * SSOT: src/claude/plan/rules/plan-epic-hierarchy.md §8 "Epic ↔ Feature Binding"
 * 기본: disabled (Phase 2). Phase 3 에서 enable 전환.
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/plan/hooks/plan-epic-integrity.js'
const {
  decideIntegrityGuard,
  isEpicRelated,
  parseEpicBinding,
  parseChildrenFeatures,
  detectBindingMismatch
} = pkg

describe('plan-epic-integrity — Epic ↔ Feature binding 검증', () => {
  describe('기본 동작 (disabled default, Phase 2)', () => {
    it('빈 input → skipped=true, reason=disabled', () => {
      const result = decideIntegrityGuard({})
      expect(result.valid).toBe(true)
      expect(result.skipped).toBe(true)
      expect(result.reason).toBe('disabled')
    })

    it('enabled=false 명시 → skipped=true, reason=disabled', () => {
      const result = decideIntegrityGuard({ enabled: false, filePath: '.plans/epics/foo/00-epic-brief.md' })
      expect(result.skipped).toBe(true)
      expect(result.reason).toBe('disabled')
    })

    it('input 없음(undefined) → skipped=true', () => {
      const result = decideIntegrityGuard()
      expect(result.skipped).toBe(true)
    })
  })

  describe('경로 필터 (isEpicRelated)', () => {
    it('Epic children-features.md 는 관련 파일', () => {
      expect(isEpicRelated('.plans/epics/00-draft/EPIC-20260422-001/01-children-features.md')).toBe(true)
    })

    it('Feature 의 08-epic-binding.md 는 관련 파일', () => {
      expect(isEpicRelated('.plans/features/active/foo/00-context/08-epic-binding.md')).toBe(true)
    })

    it('Epic brief 는 관련 파일', () => {
      expect(isEpicRelated('.plans/epics/20-active/EPIC-20260422-001/00-epic-brief.md')).toBe(true)
    })

    it('일반 src 파일은 관련 파일 아님', () => {
      expect(isEpicRelated('src/claude/plan/hooks/foo.js')).toBe(false)
    })

    it('Windows 백슬래시 경로도 매칭', () => {
      expect(isEpicRelated('.plans\\epics\\00-draft\\EPIC-X\\01-children-features.md')).toBe(true)
    })

    it('빈/null filePath 는 false', () => {
      expect(isEpicRelated('')).toBe(false)
      expect(isEpicRelated(null)).toBe(false)
      expect(isEpicRelated(undefined)).toBe(false)
    })

    it('비-Epic 관련 파일 → skipped=true (enabled=true 여도 관련 없으면 skip)', () => {
      const result = decideIntegrityGuard({ enabled: true, filePath: 'src/foo.ts' })
      expect(result.skipped).toBe(true)
      expect(result.reason).toBe('not-epic-related')
    })
  })

  describe('parseEpicBinding — 08-epic-binding.md 파싱', () => {
    it('Epic ID 와 Feature slug 추출', () => {
      const content = '# Epic Binding: foo-feature\n\n> **Epic**: EPIC-20260422-001\n'
      const result = parseEpicBinding(content)
      expect(result).toEqual({ epicId: 'EPIC-20260422-001', featureSlug: 'foo-feature' })
    })

    it('Epic ID 없으면 null 반환', () => {
      expect(parseEpicBinding('# Random content\nNo Epic here.')).toBeNull()
    })

    it('Feature slug 없어도 Epic ID 추출', () => {
      const content = '> **Epic**: EPIC-20260422-001\nNo title.'
      const result = parseEpicBinding(content)
      expect(result?.epicId).toBe('EPIC-20260422-001')
      expect(result?.featureSlug).toBeNull()
    })

    it('빈 content 는 null', () => {
      expect(parseEpicBinding('')).toBeNull()
      expect(parseEpicBinding(null)).toBeNull()
    })
  })

  describe('parseChildrenFeatures — 01-children-features.md 파싱', () => {
    it('F{N} 헤더의 Feature slug 추출', () => {
      const content = '## 1. Feature 목록\n\n### F1 — foo\n\n### F2 — bar\n'
      const result = parseChildrenFeatures(content)
      expect(result).toHaveLength(2)
      expect(result[0].slug).toBe('foo')
      expect(result[1].slug).toBe('bar')
    })

    it('F 헤더 없고 IDEA ID 만 있는 경우 IDEA 기반 추출', () => {
      const content = '- IDEA: IDEA-20260422-001\n- IDEA: IDEA-20260422-002'
      const result = parseChildrenFeatures(content)
      expect(result.length).toBeGreaterThan(0)
      expect(result.some(f => f.ideaId === 'IDEA-20260422-001')).toBe(true)
    })

    it('빈 content 는 빈 배열', () => {
      expect(parseChildrenFeatures('')).toEqual([])
      expect(parseChildrenFeatures(null)).toEqual([])
    })
  })

  describe('detectBindingMismatch — 불일치 탐지', () => {
    it('binding 은 있으나 Epic children 에 없음 → 경고', () => {
      const bindings = [{ featureSlug: 'foo', epicId: 'EPIC-X' }]
      const epicChildren = { 'EPIC-X': [] }
      const warnings = detectBindingMismatch(bindings, epicChildren)
      expect(warnings).toHaveLength(1)
      expect(warnings[0]).toMatch(/foo/)
      expect(warnings[0]).toMatch(/EPIC-X/)
    })

    it('Epic children 에 있으나 binding 없음 → 경고', () => {
      const bindings = []
      const epicChildren = { 'EPIC-X': [{ slug: 'foo' }] }
      const warnings = detectBindingMismatch(bindings, epicChildren)
      expect(warnings).toHaveLength(1)
      expect(warnings[0]).toMatch(/foo/)
    })

    it('binding 과 children 일치 → 경고 없음', () => {
      const bindings = [{ featureSlug: 'foo', epicId: 'EPIC-X' }]
      const epicChildren = { 'EPIC-X': [{ slug: 'foo' }] }
      expect(detectBindingMismatch(bindings, epicChildren)).toEqual([])
    })

    it('입력 없으면 빈 배열', () => {
      expect(detectBindingMismatch([], {})).toEqual([])
      expect(detectBindingMismatch(null, null)).toEqual([])
    })

    it('여러 Epic 에 걸친 복합 케이스 — bar 는 일치, baz 는 binding 없음', () => {
      const bindings = [
        { featureSlug: 'foo', epicId: 'EPIC-X' },
        { featureSlug: 'bar', epicId: 'EPIC-Y' }
      ]
      const epicChildren = {
        'EPIC-X': [{ slug: 'foo' }],
        'EPIC-Y': [{ slug: 'bar' }, { slug: 'baz' }]
      }
      const warnings = detectBindingMismatch(bindings, epicChildren)
      expect(warnings).toHaveLength(1)
      expect(warnings[0]).toMatch(/baz/)
    })
  })

  describe('decideIntegrityGuard — 통합 (enabled=true + 관련 파일)', () => {
    it('일치 케이스 → valid=true, warnings=[], skipped=false', () => {
      const input = {
        enabled: true,
        filePath: '.plans/epics/00-draft/EPIC-X/01-children-features.md',
        bindings: [{ featureSlug: 'foo', epicId: 'EPIC-X' }],
        epicChildrenMap: { 'EPIC-X': [{ slug: 'foo' }] }
      }
      const result = decideIntegrityGuard(input)
      expect(result.valid).toBe(true)
      expect(result.warnings).toEqual([])
      expect(result.skipped).toBe(false)
    })

    it('불일치 케이스 → valid=false, warnings 존재, BLOCK 아님 (FLAG only)', () => {
      const input = {
        enabled: true,
        filePath: '.plans/epics/00-draft/EPIC-X/01-children-features.md',
        bindings: [{ featureSlug: 'foo', epicId: 'EPIC-X' }],
        epicChildrenMap: { 'EPIC-X': [] }
      }
      const result = decideIntegrityGuard(input)
      expect(result.valid).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.blocked).not.toBe(true)
    })

    it('bindings/epicChildrenMap 미제공 시에도 에러 없이 valid=true', () => {
      const input = {
        enabled: true,
        filePath: '.plans/epics/00-draft/EPIC-X/01-children-features.md'
      }
      const result = decideIntegrityGuard(input)
      expect(result.valid).toBe(true)
      expect(result.warnings).toEqual([])
    })
  })
})
