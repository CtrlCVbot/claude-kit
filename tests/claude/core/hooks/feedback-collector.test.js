/**
 * kit-feedback-archiving Phase 3.1 RED — feedback-collector 테스트
 * 설계 문서: docs/plan/kit-feedback-archiving/02-feedback-schema.md + 04-archive-layout.md
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/hooks/feedback-collector.js'
const {
  buildEntryId,
  applyRedactions,
  validateFeedbackEntry,
  archivePath,
  buildBaseEntry,
  REDACTION_PATTERNS,
  SCHEMA_VERSION
} = pkg

describe('feedback-collector Phase 3.1', () => {
  describe('buildEntryId — 네이밍 규칙 (04-archive-layout §2)', () => {
    it('기본 형식: YYYYMMDD-HHmmss-command-suffix-slug', () => {
      const id = buildEntryId({
        timestamp: new Date('2026-04-20T14:30:22+09:00'),
        command: '/plan-draft',
        slug: 'dash-preview-phase3'
      })
      expect(id).toMatch(/^\d{8}-\d{6}-plan-draft-dash-preview-phase3$/)
    })

    it('slug 미지정 시 "unknown"', () => {
      const id = buildEntryId({
        timestamp: new Date('2026-04-20T10:00:00+09:00'),
        command: '/plan-screen'
      })
      expect(id).toMatch(/unknown$/)
    })

    it('command의 슬래시 제거', () => {
      const id = buildEntryId({
        timestamp: new Date('2026-04-20T10:00:00+09:00'),
        command: '/plan-review',
        slug: 'feat-x'
      })
      expect(id).toMatch(/-plan-review-/)
      expect(id).not.toContain('//')
    })
  })

  describe('applyRedactions — 민감 정보 치환 (02-feedback-schema §7)', () => {
    it('macOS 홈 경로 치환', () => {
      expect(applyRedactions('/Users/jhpark/project')).toMatch(/\[REDACTED:USER_HOME\]\/project/)
    })

    it('Linux 홈 경로 치환', () => {
      expect(applyRedactions('/home/runner/work')).toMatch(/\[REDACTED:USER_HOME\]\/work/)
    })

    it('Windows 홈 경로 치환', () => {
      expect(applyRedactions('C:\\Users\\jhpark\\docs')).toMatch(/\[REDACTED:USER_HOME\]/)
    })

    it('API 키 형태 치환 (sk-...)', () => {
      expect(applyRedactions('key=sk-proj-abcdef1234567890')).toMatch(/\[REDACTED:API_KEY\]/)
    })

    it('비민감 텍스트 변경 없음', () => {
      expect(applyRedactions('Hello world')).toBe('Hello world')
    })

    it('배열 패턴 정의', () => {
      expect(REDACTION_PATTERNS.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('buildBaseEntry — 최소 엔트리 구조', () => {
    it('필수 최상위 필드 포함 (02-feedback-schema §2.1)', () => {
      const entry = buildBaseEntry({
        command: '/plan-draft',
        domain: 'plan',
        runtime: 'claude',
        sessionId: 'sess-abc',
        startedAt: '2026-04-20T14:25:00+09:00',
        endedAt: '2026-04-20T14:30:22+09:00',
        slug: 'feat-x'
      })
      expect(entry.schema_version).toBe(SCHEMA_VERSION)
      expect(entry.runtime).toBe('claude')
      expect(entry.command).toBe('/plan-draft')
      expect(entry.domain).toBe('plan')
      expect(entry.entry_id).toMatch(/\d{8}-\d{6}-plan-draft-feat-x/)
      expect(entry.session).toBeDefined()
      expect(entry.session.duration_seconds).toBe(322)
    })

    it('usage 객체 기본 구조', () => {
      const entry = buildBaseEntry({
        command: '/plan-draft',
        domain: 'plan',
        runtime: 'claude',
        sessionId: 'sess-abc',
        startedAt: '2026-04-20T14:25:00+09:00',
        endedAt: '2026-04-20T14:30:22+09:00'
      })
      expect(entry.usage).toHaveProperty('agents_invoked')
      expect(entry.usage).toHaveProperty('tools_used')
    })

    it('metadata.collector_version 포함', () => {
      const entry = buildBaseEntry({
        command: '/plan-draft',
        domain: 'plan',
        runtime: 'claude',
        sessionId: 'sess-abc',
        startedAt: '2026-04-20T14:25:00+09:00',
        endedAt: '2026-04-20T14:30:22+09:00'
      })
      expect(entry.metadata.collector_version).toBeDefined()
    })
  })

  describe('validateFeedbackEntry — JSON Schema 검증', () => {
    const validEntry = {
      schema_version: '1.0',
      entry_id: '20260420-143022-plan-draft-feat-x',
      runtime: 'claude',
      command: '/plan-draft',
      domain: 'plan',
      session: {
        session_id: 'sess-abc',
        started_at: '2026-04-20T14:25:00+09:00',
        ended_at: '2026-04-20T14:30:22+09:00',
        duration_seconds: 322
      },
      usage: {
        agents_invoked: [],
        tools_used: { Read: 0, Edit: 0, Write: 0, Bash: 0, Grep: 0, Glob: 0 }
      }
    }

    it('유효 엔트리 통과', () => {
      expect(validateFeedbackEntry(validEntry).valid).toBe(true)
    })

    it('schema_version 누락 거부', () => {
      const invalid = { ...validEntry }
      delete invalid.schema_version
      expect(validateFeedbackEntry(invalid).valid).toBe(false)
    })

    it('runtime enum 외 값 거부', () => {
      expect(validateFeedbackEntry({ ...validEntry, runtime: 'unknown' }).valid).toBe(false)
    })

    it('domain enum 외 값 거부', () => {
      expect(validateFeedbackEntry({ ...validEntry, domain: 'marketing' }).valid).toBe(false)
    })

    it('entry_id 형식 위반 거부', () => {
      expect(validateFeedbackEntry({ ...validEntry, entry_id: 'invalid' }).valid).toBe(false)
    })
  })

  describe('archivePath — 저장 경로 (04-archive-layout §1)', () => {
    it('runtime/domain/entry-id.json 형식', () => {
      const p = archivePath({
        runtime: 'claude',
        domain: 'plan',
        entryId: '20260420-143022-plan-draft-feat-x'
      })
      expect(p).toBe('.claude/feedback-archive/claude/plan/20260420-143022-plan-draft-feat-x.json')
    })

    it('codex runtime', () => {
      expect(archivePath({
        runtime: 'codex',
        domain: 'dev',
        entryId: 'test'
      })).toBe('.claude/feedback-archive/codex/dev/test.json')
    })
  })
})
