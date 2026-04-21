/**
 * IMP-KIT-012 RED — bridge ↔ Phase A 경계 테스트
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/plan/boundary/bridge-phase-a.js'
const { canEdit, extractBridgeSections, BRIDGE_MARKER, PHASE_A_SECTION, RESPONSIBILITY_MATRIX } = pkg

describe('bridge-phase-a — 경계 검증', () => {
  describe('canEdit — Phase A가 Bridge 섹션 수정 가능 여부', () => {
    it('feature-intent 의도 섹션 (bridge 책임) → Phase A 수정 차단', () => {
      expect(canEdit({ phase: 'A', field: 'intent', file: 'feature-intent.md' }).allowed).toBe(false)
    })

    it('feature-intent 수용 기준 상세화 (phase A 책임) → 허용', () => {
      expect(canEdit({ phase: 'A', field: 'acceptance-detail', file: 'feature-intent.md' }).allowed).toBe(true)
    })

    it('bridge phase가 자신의 책임 섹션 편집 → 허용', () => {
      expect(canEdit({ phase: 'bridge', field: 'intent', file: 'feature-intent.md' }).allowed).toBe(true)
    })

    it('알 수 없는 file/field → 기본 허용 (경고만)', () => {
      const result = canEdit({ phase: 'A', field: 'unknown', file: 'unknown.md' })
      expect(result.allowed).toBe(true)
      expect(result.warning).toBeDefined()
    })
  })

  describe('extractBridgeSections — 초안 마커 추출', () => {
    it('<!-- bridge:section --> 마커로 둘러싸인 블록 추출', () => {
      const content = [
        'header',
        '<!-- bridge:section -->',
        '## 의도',
        '내용',
        '<!-- /bridge:section -->',
        '## Phase A 상세',
        '추가 내용'
      ].join('\n')
      const sections = extractBridgeSections(content)
      expect(sections.length).toBe(1)
      expect(sections[0]).toMatch(/## 의도/)
      expect(sections[0]).not.toMatch(/Phase A 상세/)
    })

    it('마커 없으면 빈 배열', () => {
      expect(extractBridgeSections('no markers here')).toEqual([])
    })

    it('다중 마커 모두 추출', () => {
      const content = [
        '<!-- bridge:section -->',
        'first',
        '<!-- /bridge:section -->',
        'middle',
        '<!-- bridge:section -->',
        'second',
        '<!-- /bridge:section -->'
      ].join('\n')
      expect(extractBridgeSections(content).length).toBe(2)
    })
  })

  describe('상수', () => {
    it('BRIDGE_MARKER 형식', () => {
      expect(BRIDGE_MARKER.start).toBe('<!-- bridge:section -->')
      expect(BRIDGE_MARKER.end).toBe('<!-- /bridge:section -->')
    })

    it('RESPONSIBILITY_MATRIX 5종 파일 + bridge/phase-a 책임', () => {
      expect(RESPONSIBILITY_MATRIX).toHaveProperty('feature-intent.md')
      expect(RESPONSIBILITY_MATRIX).toHaveProperty('stakeholder-matrix.md')
      expect(RESPONSIBILITY_MATRIX).toHaveProperty('dependency-graph.md')
      expect(RESPONSIBILITY_MATRIX).toHaveProperty('risk-register.md')
      expect(RESPONSIBILITY_MATRIX).toHaveProperty('acceptance-criteria.md')
    })
  })
})
