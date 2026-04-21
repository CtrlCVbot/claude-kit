/**
 * IMP-KIT-011 RED — edit-coordinates 스키마 거버넌스 테스트
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-011-architect-schema.md
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/dev/_schemas/_router.js'
const { validate, getValidator, SUPPORTED_MAJORS } = pkg

const validPayload = {
  schema_version: '1.0',
  phase: 'C',
  agent: 'dev-architect',
  edits: [
    {
      id: 'edit-001',
      file_path: 'src/foo.ts',
      action: 'replace',
      line_range: [10, 20],
      new_content: 'hello'
    }
  ]
}

describe('edit-coordinates governance — ajv 런타임 검증', () => {
  describe('v1 스키마', () => {
    it('유효 payload 통과', () => {
      const result = validate(validPayload)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('schema_version 누락 시 거부', () => {
      const invalid = { ...validPayload }
      delete invalid.schema_version
      const result = validate(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('edits 배열 빈 경우 거부 (minItems: 1)', () => {
      const invalid = { ...validPayload, edits: [] }
      expect(validate(invalid).valid).toBe(false)
    })

    it('edit.id 필수 필드 누락 거부', () => {
      const invalid = {
        ...validPayload,
        edits: [{ file_path: 'x.ts', action: 'replace' }]
      }
      expect(validate(invalid).valid).toBe(false)
    })

    it('additionalProperties 허용 (minor 확장 대비)', () => {
      const extended = {
        ...validPayload,
        extraField: 'future',
        edits: [{ ...validPayload.edits[0], newField: 42 }]
      }
      expect(validate(extended).valid).toBe(true)
    })
  })

  describe('버전 라우터', () => {
    it('schema_version 1.0 → 유효', () => {
      expect(validate({ ...validPayload, schema_version: '1.0' }).valid).toBe(true)
    })

    it('schema_version 1.1 (minor) → 유효 (1.x 라우팅)', () => {
      expect(validate({ ...validPayload, schema_version: '1.1' }).valid).toBe(true)
    })

    it('schema_version 2.0 (major) → unsupported 에러', () => {
      const result = validate({ ...validPayload, schema_version: '2.0' })
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toMatch(/Unsupported|2\.0/i)
    })

    it('getValidator(1.x) 반환값 truthy', () => {
      expect(getValidator('1.0')).toBeTruthy()
      expect(getValidator('1.5')).toBeTruthy()
    })

    it('getValidator(2.x) null 반환', () => {
      expect(getValidator('2.0')).toBeNull()
    })
  })

  describe('SUPPORTED_MAJORS 상수', () => {
    it('현재 1만 포함', () => {
      expect(SUPPORTED_MAJORS).toEqual(['1'])
    })
  })

  describe('입력 정규화', () => {
    it('null/undefined 입력 시 invalid', () => {
      expect(validate(null).valid).toBe(false)
      expect(validate(undefined).valid).toBe(false)
    })

    it('schema_version 미지정 시 1.0 기본값 적용', () => {
      const withoutVersion = { ...validPayload }
      delete withoutVersion.schema_version
      // schema_version 없으면 거부 (required). 하지만 getValidator은 1.0 기본
      expect(getValidator(undefined)).toBeTruthy()
    })
  })
})
