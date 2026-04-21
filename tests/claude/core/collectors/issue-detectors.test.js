/**
 * kit-feedback-archiving Phase 3.2.1 RED — 이슈 감지기 6종 테스트
 * 설계: docs/plan/kit-feedback-archiving/01-architecture.md §4.1 + 02-feedback-schema.md §2.5.1
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/collectors/issue-detectors.js'
const {
  detectPermissionMismatch,
  detectFrameworkDrift,
  detectCacheError,
  detectCheckpointImbalance,
  detectDuplication,
  detectTrustOnly,
  detectAllIssues,
  extractDomain,
  ISSUE_TYPES,
  SEVERITY_LEVELS
} = pkg

describe('issue-detectors — Phase 3.2.1', () => {
  describe('extractDomain — 커맨드 prefix 기반 도메인 추출', () => {
    it('/plan-* → plan', () => {
      expect(extractDomain('/plan-draft')).toBe('plan')
      expect(extractDomain('/plan-review')).toBe('plan')
    })
    it('/copy-* → copy', () => {
      expect(extractDomain('/copy-reference-refresh')).toBe('copy')
    })
    it('/dev-* → dev', () => {
      expect(extractDomain('/dev-feature')).toBe('dev')
      expect(extractDomain('/dev-verify-all')).toBe('dev')
    })
    it('알 수 없는 커맨드 → core (기본)', () => {
      expect(extractDomain('/something-else')).toBe('core')
      expect(extractDomain(null)).toBe('core')
    })
  })

  describe('detectPermissionMismatch — 에이전트 권한 부족/초과', () => {
    it('"Tool X not available for agent Y" 로그 감지', () => {
      const result = detectPermissionMismatch({
        transcript: "Tool 'Edit' is not available for agent 'dev-architect'. Returning..."
      })
      expect(result.detected).toBe(true)
      expect(result.severity).toBe('P0')
      expect(result.evidence.log_excerpt).toMatch(/Edit.*dev-architect/)
    })

    it('권한 오류 없는 세션 → detected=false', () => {
      expect(detectPermissionMismatch({ transcript: 'normal session' }).detected).toBe(false)
    })

    it('빈 입력 시 crash 없음', () => {
      expect(() => detectPermissionMismatch({})).not.toThrow()
      expect(detectPermissionMismatch({}).detected).toBe(false)
    })
  })

  describe('detectFrameworkDrift — description과 실제 동작 불일치', () => {
    it('"framework drift" 명시적 경고 감지', () => {
      const result = detectFrameworkDrift({
        transcript: 'Warning: framework drift detected — rice used but description says 5axis'
      })
      expect(result.detected).toBe(true)
    })

    it('프레임워크 명시적 출력 없는 케이스 (silent drift 가능성)', () => {
      const result = detectFrameworkDrift({
        transcript: 'RICE 점수 계산 완료',
        declaredFramework: '5axis'
      })
      expect(result.detected).toBe(true)
      expect(result.severity).toBe('P1')
    })

    it('정상 케이스 → detected=false', () => {
      const result = detectFrameworkDrift({
        transcript: '> 프레임워크: RICE',
        declaredFramework: 'rice'
      })
      expect(result.detected).toBe(false)
    })
  })

  describe('detectCacheError — Read 캐시 인증 실패', () => {
    it('"File has not been read yet" 감지', () => {
      const result = detectCacheError({
        transcript: 'Error: File has not been read yet in this session.'
      })
      expect(result.detected).toBe(true)
      expect(result.type).toBe('cache_error')
      expect(result.related_imp_kit_id).toBe('IMP-KIT-005')
    })

    it('정상 세션 → detected=false', () => {
      expect(detectCacheError({ transcript: 'file read successfully' }).detected).toBe(false)
    })
  })

  describe('detectCheckpointImbalance — Checkpoint 과다', () => {
    it('세션당 Checkpoint 3회 이상 → P1 감지', () => {
      const result = detectCheckpointImbalance({ humanCheckpoints: 5 })
      expect(result.detected).toBe(true)
      expect(result.severity).toBe('P1')
    })

    it('5회 이상 → P0 승격', () => {
      const result = detectCheckpointImbalance({ humanCheckpoints: 7 })
      expect(result.severity).toBe('P0')
    })

    it('2회 이하 → detected=false', () => {
      expect(detectCheckpointImbalance({ humanCheckpoints: 2 }).detected).toBe(false)
    })
  })

  describe('detectDuplication — 재복제 감지 (IMP-KIT-017 연계)', () => {
    it('유사도 높은 파일 작성 감지', () => {
      const original = 'Lorem ipsum dolor sit amet consectetur adipiscing elit'
      const result = detectDuplication({
        newContent: original,
        existingContents: { 'docs/A.md': original }
      })
      expect(result.detected).toBe(true)
      expect(result.related_imp_kit_id).toBe('IMP-KIT-017')
    })

    it('전혀 다른 내용 → detected=false', () => {
      const result = detectDuplication({
        newContent: 'Completely different Korean text 한글 내용',
        existingContents: { 'docs/A.md': 'Lorem ipsum dolor sit amet consectetur' }
      })
      expect(result.detected).toBe(false)
    })
  })

  describe('detectTrustOnly — 에이전트 결과 검증 없이 통과', () => {
    it('"agent reported success" 만으로 후속 수행 감지', () => {
      const result = detectTrustOnly({
        transcript: 'Agent reported success. Proceeding without VCS verification.'
      })
      expect(result.detected).toBe(true)
    })

    it('git diff 언급 있으면 미감지', () => {
      const result = detectTrustOnly({
        transcript: 'Agent completed. git diff confirmed 7 files changed.'
      })
      expect(result.detected).toBe(false)
    })
  })

  describe('detectAllIssues — 통합 감지기', () => {
    it('입력 기반 복수 이슈 감지 및 배열 반환', () => {
      const issues = detectAllIssues({
        transcript: "Tool 'Edit' is not available for agent 'dev-architect'. File has not been read yet.",
        humanCheckpoints: 1
      })
      expect(Array.isArray(issues)).toBe(true)
      const types = issues.map(i => i.type)
      expect(types).toContain('permission_mismatch')
      expect(types).toContain('cache_error')
    })

    it('빈 입력 → 빈 배열', () => {
      expect(detectAllIssues({})).toEqual([])
    })

    it('각 issue에 id 자동 부여 (issue-001, issue-002, ...)', () => {
      const issues = detectAllIssues({
        transcript: "Tool 'Edit' not available. File has not been read yet.",
        humanCheckpoints: 5
      })
      expect(issues[0].id).toMatch(/^issue-\d{3}$/)
    })
  })

  describe('상수', () => {
    it('ISSUE_TYPES 10종 포함 (02-feedback-schema §2.5.1)', () => {
      expect(ISSUE_TYPES).toContain('permission_mismatch')
      expect(ISSUE_TYPES).toContain('framework_drift')
      expect(ISSUE_TYPES).toContain('cache_error')
      expect(ISSUE_TYPES).toContain('duplication')
      expect(ISSUE_TYPES.length).toBe(10)
    })

    it('SEVERITY_LEVELS = [P0, P1, P2]', () => {
      expect(SEVERITY_LEVELS).toEqual(['P0', 'P1', 'P2'])
    })
  })
})
