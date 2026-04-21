/**
 * IMP-KIT-014 RED — stage-manifest 스키마 거버넌스 테스트
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/_schemas/stage-manifest-router.js'
const { validateStageManifest, checkConsumerPaths, SUPPORTED_MAJORS } = pkg

const validManifest = {
  schema_version: '1.0',
  slug: 'hero-refresh',
  stages: {
    P1: { status: 'done' },
    P2: { status: 'done' },
    P3: { status: 'in-progress' }
  }
}

describe('stage-manifest governance — 스키마 검증', () => {
  describe('v1 유효성', () => {
    it('유효 manifest 통과', () => {
      const result = validateStageManifest(validManifest)
      expect(result.valid).toBe(true)
    })

    it('schema_version 누락 거부', () => {
      const invalid = { ...validManifest }
      delete invalid.schema_version
      expect(validateStageManifest(invalid).valid).toBe(false)
    })

    it('slug 누락 거부', () => {
      const invalid = { ...validManifest }
      delete invalid.slug
      expect(validateStageManifest(invalid).valid).toBe(false)
    })

    it('stages 누락 거부', () => {
      const invalid = { ...validManifest }
      delete invalid.stages
      expect(validateStageManifest(invalid).valid).toBe(false)
    })

    it('additionalProperties 허용 (minor 확장)', () => {
      const extended = {
        ...validManifest,
        blueprintSource: 'path/to/blueprint',
        customField: 'future'
      }
      expect(validateStageManifest(extended).valid).toBe(true)
    })
  })

  describe('버전 라우팅', () => {
    it('schema_version 1.0 유효', () => {
      expect(validateStageManifest({ ...validManifest, schema_version: '1.0' }).valid).toBe(true)
    })

    it('schema_version 1.5 (minor) 유효', () => {
      expect(validateStageManifest({ ...validManifest, schema_version: '1.5' }).valid).toBe(true)
    })

    it('schema_version 2.0 (major) unsupported', () => {
      const result = validateStageManifest({ ...validManifest, schema_version: '2.0' })
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toMatch(/Unsupported|2\.0/i)
    })
  })

  describe('소비자 등록부 검증 — checkConsumerPaths', () => {
    it('모든 consumer reads 경로가 schema properties에 존재 시 valid=true', () => {
      const consumers = [
        { id: 'test-1', reads: ['schema_version'] },
        { id: 'test-2', reads: ['slug', 'stages'] }
      ]
      const result = checkConsumerPaths(consumers)
      expect(result.valid).toBe(true)
      expect(result.missingPaths).toEqual([])
    })

    it('schema 외 경로 참조 시 valid=false + missingPaths 보고', () => {
      const consumers = [
        { id: 'broken', reads: ['nonexistent_field'] }
      ]
      const result = checkConsumerPaths(consumers)
      expect(result.valid).toBe(false)
      expect(result.missingPaths).toContain('nonexistent_field')
    })
  })

  describe('상수', () => {
    it('SUPPORTED_MAJORS = [1]', () => {
      expect(SUPPORTED_MAJORS).toEqual(['1'])
    })
  })
})
