/**
 * T-FSTATE-01 — plan-state-sync 훅 entrypoint 테스트 (경로 매칭 + 보조 함수)
 *
 * syncAll 의 I/O 부분은 통합 테스트 영역. 본 파일은 filesystem-independent 로직만 검증.
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/plan/hooks/plan-state-sync.js'
const {
  isIdeaFile,
  extractPrevStateFromOldString,
  IDEA_PATH_REGEX,
} = pkg

describe('plan-state-sync hook — isIdeaFile', () => {
  it('IDEA 파일 경로 매칭 (Unix)', () => {
    expect(isIdeaFile('.plans/ideas/00-inbox/IDEA-20260423-007.md')).toBe(true)
    expect(isIdeaFile('.plans/ideas/10-screening/IDEA-20260423-008.md')).toBe(true)
    expect(isIdeaFile('.plans/ideas/20-approved/IDEA-20260423-009.md')).toBe(true)
    expect(isIdeaFile('.plans/ideas/90-archive/IDEA-20260423-010.md')).toBe(true)
  })

  it('IDEA 파일 경로 매칭 (Windows 백슬래시)', () => {
    expect(isIdeaFile('.plans\\ideas\\00-inbox\\IDEA-20260423-007.md')).toBe(true)
  })

  it('non-IDEA 파일 불매칭', () => {
    expect(isIdeaFile('.plans/ideas/backlog.md')).toBe(false)
    expect(isIdeaFile('.plans/features/active/hero/00-context/01-prd-freeze.md')).toBe(false)
    expect(isIdeaFile('.plans/epics/00-draft/EPIC-20260422-001/00-epic-brief.md')).toBe(false)
  })

  it('빈/undefined 입력 → false', () => {
    expect(isIdeaFile('')).toBe(false)
    expect(isIdeaFile(null)).toBe(false)
    expect(isIdeaFile(undefined)).toBe(false)
  })

  it('잘못된 IDEA ID 형식은 불매칭', () => {
    // YYYYMMDD-NNN 이 아닌 경우
    expect(isIdeaFile('.plans/ideas/00-inbox/IDEA-2026-0423-007.md')).toBe(false)
    expect(isIdeaFile('.plans/ideas/00-inbox/IDEA-20260423-7.md')).toBe(false)
  })
})

describe('plan-state-sync hook — extractPrevStateFromOldString', () => {
  it('상태 라인 추출', () => {
    expect(extractPrevStateFromOldString('상태: inbox')).toBe('inbox')
    expect(extractPrevStateFromOldString('상태: screened')).toBe('screened')
    expect(extractPrevStateFromOldString('상태: approved')).toBe('approved')
  })

  it('status 영문 키 fallback', () => {
    expect(extractPrevStateFromOldString('status: archived')).toBe('archived')
  })

  it('frontmatter context 내부에서 추출', () => {
    const old = `---
id: IDEA-20260423-007
상태: inbox
Epic: null
---
# 본문`
    expect(extractPrevStateFromOldString(old)).toBe('inbox')
  })

  it('따옴표 처리', () => {
    expect(extractPrevStateFromOldString('상태: "screened"')).toBe('screened')
    expect(extractPrevStateFromOldString("상태: 'approved'")).toBe('approved')
  })

  it('상태 라인 없음 → null', () => {
    expect(extractPrevStateFromOldString('# 본문만')).toBe(null)
    expect(extractPrevStateFromOldString('')).toBe(null)
    expect(extractPrevStateFromOldString(null)).toBe(null)
  })
})

describe('plan-state-sync hook — IDEA_PATH_REGEX', () => {
  it('RegExp 인스턴스', () => {
    expect(IDEA_PATH_REGEX).toBeInstanceOf(RegExp)
  })

  it('패턴이 IDEA 파일만 매칭', () => {
    expect(IDEA_PATH_REGEX.test('.plans/ideas/00-inbox/IDEA-20260423-007.md')).toBe(true)
    expect(IDEA_PATH_REGEX.test('.plans/ideas/IDEA-20260423-007.md')).toBe(true)  // 직속 허용
    expect(IDEA_PATH_REGEX.test('src/foo/IDEA-20260423-007.md')).toBe(false)
  })
})
