/**
 * IMP-KIT-009 RED — plan-idea-screener 파일 이동 가드 테스트
 *
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-009-screener-file-move.md
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/plan/hooks/plan-idea-move-guard.js'
const { decideMoveGuard, ALLOWED_FOLDERS, isIdeaMoveCommand } = pkg

describe('plan-idea-move-guard — 파일 이동 화이트리스트', () => {
  describe('허용 패턴', () => {
    it('10-screening → 20-approved 이동 허용', () => {
      const cmd = 'mv .plans/ideas/10-screening/IDEA-042.md .plans/ideas/20-approved/IDEA-042.md'
      const result = decideMoveGuard({ command: cmd })
      expect(result.allowed).toBe(true)
    })

    it('10-screening → 30-on-hold 이동 허용', () => {
      const cmd = 'mv .plans/ideas/10-screening/IDEA-042.md .plans/ideas/30-on-hold/IDEA-042.md'
      const result = decideMoveGuard({ command: cmd })
      expect(result.allowed).toBe(true)
    })

    it('00-inbox → 10-screening 이동 허용 (스크리닝 착수)', () => {
      const cmd = 'mv .plans/ideas/00-inbox/IDEA-042.md .plans/ideas/10-screening/IDEA-042.md'
      const result = decideMoveGuard({ command: cmd })
      expect(result.allowed).toBe(true)
    })
  })

  describe('거부 패턴', () => {
    it('20-approved → 외부 경로 이동 차단', () => {
      const cmd = 'mv .plans/ideas/20-approved/IDEA-042.md /tmp/IDEA-042.md'
      const result = decideMoveGuard({ command: cmd })
      expect(result.allowed).toBe(false)
      expect(result.reason).toMatch(/허용되지 않은/)
    })

    it('rm 명령 차단 (이동 아닌 삭제)', () => {
      const cmd = 'rm .plans/ideas/20-approved/IDEA-042.md'
      const result = decideMoveGuard({ command: cmd })
      expect(result.allowed).toBe(false)
    })

    it('cp 명령 차단 (이동 아닌 복제 — IMP-KIT-017 원칙)', () => {
      const cmd = 'cp .plans/ideas/10-screening/IDEA-042.md .plans/ideas/20-approved/IDEA-042.md'
      const result = decideMoveGuard({ command: cmd })
      expect(result.allowed).toBe(false)
    })

    it('ideas 내 경로를 ideas 밖으로 이동 차단 (경로 혼합)', () => {
      const cmd = 'mv .plans/ideas/20-approved/IDEA-042.md ./archive/IDEA-042.md'
      const result = decideMoveGuard({ command: cmd })
      expect(result.allowed).toBe(false)
    })
  })

  describe('가드 범위 외 (비-IDEA mv)', () => {
    it('ideas 밖 mv는 skipped — 본 가드 관심사 아님', () => {
      const cmd = 'mv src/foo.ts src/bar.ts'
      const result = decideMoveGuard({ command: cmd })
      expect(result.allowed).toBe(true)
      expect(result.skipped).toBe(true)
    })
  })

  describe('비대상 커맨드 (guard 무관)', () => {
    it('git status 같은 일반 Bash는 allowed=true, isIdeaMoveCommand=false', () => {
      const cmd = 'git status'
      expect(isIdeaMoveCommand(cmd)).toBe(false)
      const result = decideMoveGuard({ command: cmd })
      expect(result.allowed).toBe(true)
      expect(result.skipped).toBe(true)
    })

    it('echo, ls 등 비-mv 커맨드도 skipped 반환', () => {
      expect(decideMoveGuard({ command: 'echo hello' }).skipped).toBe(true)
      expect(decideMoveGuard({ command: 'ls -la' }).skipped).toBe(true)
    })
  })

  describe('ALLOWED_FOLDERS 상수', () => {
    it('4개 폴더 포함 (inbox/screening/approved/on-hold)', () => {
      expect(ALLOWED_FOLDERS).toContain('00-inbox')
      expect(ALLOWED_FOLDERS).toContain('10-screening')
      expect(ALLOWED_FOLDERS).toContain('20-approved')
      expect(ALLOWED_FOLDERS).toContain('30-on-hold')
      expect(ALLOWED_FOLDERS.length).toBe(4)
    })
  })

  describe('입력 정규화', () => {
    it('빈 커맨드 시 skipped', () => {
      expect(decideMoveGuard({}).skipped).toBe(true)
      expect(decideMoveGuard({ command: '' }).skipped).toBe(true)
    })

    it('크래시 없음', () => {
      expect(() => decideMoveGuard({})).not.toThrow()
    })
  })
})
