/**
 * T-EPMV-01 RED — epic-advance-rewrite 스크립트 테스트
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-EPMV-01.md
 * SSOT: src/claude/plan/rules/plan-epic-hierarchy.md §4-1 (파일 이동 방법)
 * 대응: N-01 (Critical) — 13 파일 수동 링크 갱신 부담 90% 감소 목표
 *
 * 테스트 전략:
 * - 임시 디렉터리(os.tmpdir)에 가상 .plans 구조를 구축 → 치환 후 파일 내용 검증
 * - dryRun / 서사 보존 / 다중 치환 / 매치 없음 케이스 커버
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  buildReplacementPattern,
  replaceInFile,
  rewriteEpicLinks
} from '../../../../src/claude/plan/scripts/epic-advance-rewrite.js'

let workDir

beforeEach(() => {
  workDir = mkdtempSync(join(tmpdir(), 'epmv-01-'))
})

afterEach(() => {
  rmSync(workDir, { recursive: true, force: true })
})

function writeFile(relPath, content) {
  const full = join(workDir, relPath)
  mkdirSync(join(full, '..'), { recursive: true })
  writeFileSync(full, content, 'utf8')
  return full
}

describe('buildReplacementPattern — 안전 치환 패턴 생성', () => {
  it('경로 경계가 포함된 정규식 패턴 반환 (매칭 행동 기준)', () => {
    const { pattern, replacement } = buildReplacementPattern({
      epicId: 'EPIC-20260422-001',
      prevState: '00-draft',
      newState: '10-planning'
    })
    // Node.js RegExp 는 source 에서 `/` 를 `\/` 로 이스케이프 저장할 수 있으므로
    // 문자열 포함 대신 실제 매칭으로 경계를 검증한다.
    expect(pattern.test('/00-draft/EPIC-20260422-001/')).toBe(true)
    expect(pattern.test('00-draft EPIC-20260422-001')).toBe(false)  // 경계 없는 서사
    expect(pattern.flags).toContain('g')
    expect(replacement).toBe('/10-planning/EPIC-20260422-001/')
  })

  it('필수 인자 누락 시 예외', () => {
    expect(() => buildReplacementPattern({})).toThrow(/epicId|prevState|newState/)
    expect(() => buildReplacementPattern({ epicId: 'x' })).toThrow()
  })

  it('epicId 에 정규식 메타문자가 들어와도 이스케이프', () => {
    const { pattern } = buildReplacementPattern({
      epicId: 'EPIC-2026.04-001',
      prevState: '00-draft',
      newState: '10-planning'
    })
    // 점(.) 이 리터럴 매칭이어야 함
    expect(pattern.source).toContain('\\.')
  })
})

describe('replaceInFile — 파일 단위 치환', () => {
  it('경로 패턴 매칭 시 파일 내용 치환 + 변경 건수 반환', () => {
    const file = writeFile(
      'doc.md',
      '참조: [Epic](../epics/00-draft/EPIC-20260422-001/00-epic-brief.md)'
    )
    const { pattern, replacement } = buildReplacementPattern({
      epicId: 'EPIC-20260422-001',
      prevState: '00-draft',
      newState: '10-planning'
    })
    const result = replaceInFile(file, pattern, replacement, { dryRun: false })
    expect(result.changed).toBe(true)
    expect(result.count).toBe(1)
    const after = readFileSync(file, 'utf8')
    expect(after).toContain('/10-planning/EPIC-20260422-001/')
    expect(after).not.toContain('/00-draft/EPIC-20260422-001/')
  })

  it('dryRun=true 이면 파일 변경 없이 예상 건수 반환', () => {
    const original = '경로: .plans/epics/00-draft/EPIC-A/foo.md'
    const file = writeFile('dry.md', original)
    const { pattern, replacement } = buildReplacementPattern({
      epicId: 'EPIC-A',
      prevState: '00-draft',
      newState: '10-planning'
    })
    const result = replaceInFile(file, pattern, replacement, { dryRun: true })
    expect(result.changed).toBe(true)
    expect(result.count).toBe(1)
    expect(readFileSync(file, 'utf8')).toBe(original)
  })

  it('매치 없으면 changed=false + count=0', () => {
    const file = writeFile('noop.md', '관련 없음: foo/bar.md')
    const { pattern, replacement } = buildReplacementPattern({
      epicId: 'EPIC-A',
      prevState: '00-draft',
      newState: '10-planning'
    })
    const result = replaceInFile(file, pattern, replacement, { dryRun: false })
    expect(result.changed).toBe(false)
    expect(result.count).toBe(0)
  })

  it('서사 텍스트의 구 경로 문자열은 치환 안 됨 (슬래시 경계 안전)', () => {
    // 실제 경로가 아니라 "00-draft 상태" 같은 서사는 보존
    const original = '현재 00-draft 상태입니다. Epic 10-planning 으로 전이 예정.'
    const file = writeFile('narrative.md', original)
    const { pattern, replacement } = buildReplacementPattern({
      epicId: 'EPIC-A',
      prevState: '00-draft',
      newState: '10-planning'
    })
    const result = replaceInFile(file, pattern, replacement, { dryRun: false })
    expect(result.changed).toBe(false)
    expect(readFileSync(file, 'utf8')).toBe(original)
  })

  it('한 파일 내 다중 매치 모두 치환', () => {
    const file = writeFile(
      'multi.md',
      [
        '[A](../epics/00-draft/EPIC-X/a.md)',
        '[B](../epics/00-draft/EPIC-X/b.md)',
        '[C](../epics/00-draft/EPIC-X/c.md)'
      ].join('\n')
    )
    const { pattern, replacement } = buildReplacementPattern({
      epicId: 'EPIC-X',
      prevState: '00-draft',
      newState: '10-planning'
    })
    const result = replaceInFile(file, pattern, replacement, { dryRun: false })
    expect(result.count).toBe(3)
    const after = readFileSync(file, 'utf8')
    expect(after.match(/10-planning\/EPIC-X/g).length).toBe(3)
    expect(after).not.toContain('/00-draft/EPIC-X/')
  })
})

describe('rewriteEpicLinks — 디렉터리 전체 재작성', () => {
  it('.plans 하위 모든 .md 수집 후 치환 (비-md 파일 제외)', () => {
    writeFile('.plans/ideas/backlog.md', '참조: ../epics/00-draft/EPIC-Y/00-epic-brief.md')
    writeFile(
      '.plans/features/active/foo/00-context/08-epic-binding.md',
      '[Epic](../../../../epics/00-draft/EPIC-Y/00-epic-brief.md)'
    )
    writeFile('.plans/ideas/unrelated.md', '내용 없음')
    writeFile('.plans/data.json', '{"epicPath": "../epics/00-draft/EPIC-Y/"}')  // 비-md

    const result = rewriteEpicLinks({
      rootDir: workDir,
      epicId: 'EPIC-Y',
      prevState: '00-draft',
      newState: '10-planning',
      dryRun: false
    })

    expect(result.changedFiles.length).toBe(2)
    expect(result.totalReplacements).toBe(2)

    const backlog = readFileSync(join(workDir, '.plans/ideas/backlog.md'), 'utf8')
    expect(backlog).toContain('/10-planning/EPIC-Y/')

    // json 은 미치환 (안전)
    const json = readFileSync(join(workDir, '.plans/data.json'), 'utf8')
    expect(json).toContain('/00-draft/EPIC-Y/')
  })

  it('dryRun=true 면 파일 변경 없이 예상 요약 반환', () => {
    const filePath = writeFile('.plans/ideas/a.md', 'link: ../epics/00-draft/EPIC-Z/x.md')
    const original = readFileSync(filePath, 'utf8')

    const result = rewriteEpicLinks({
      rootDir: workDir,
      epicId: 'EPIC-Z',
      prevState: '00-draft',
      newState: '10-planning',
      dryRun: true
    })

    expect(result.dryRun).toBe(true)
    expect(result.changedFiles.length).toBe(1)
    expect(result.totalReplacements).toBe(1)
    expect(readFileSync(filePath, 'utf8')).toBe(original)
  })

  it('.plans 디렉터리 없으면 빈 결과 반환 (에러 아님)', () => {
    const result = rewriteEpicLinks({
      rootDir: workDir,  // .plans 미생성 상태
      epicId: 'EPIC-NONE',
      prevState: '00-draft',
      newState: '10-planning'
    })
    expect(result.changedFiles).toEqual([])
    expect(result.totalReplacements).toBe(0)
  })

  it('필수 인자 누락 시 예외', () => {
    expect(() => rewriteEpicLinks({ rootDir: workDir })).toThrow()
    expect(() =>
      rewriteEpicLinks({
        rootDir: workDir,
        epicId: 'E',
        prevState: 'p'
        // newState 누락
      })
    ).toThrow()
  })

  it('회귀 — Phase A 13 파일 규모 시뮬레이션', () => {
    // Dry-Run 세션에서 관측된 13 파일 패턴을 축소 재현
    const files = [
      '.plans/ideas/backlog.md',
      '.plans/ideas/00-inbox/IDEA-20260423-001.md',
      '.plans/ideas/00-inbox/IDEA-20260423-002.md',
      '.plans/features/active/f1-foo/00-context/01-product-context.md',
      '.plans/features/active/f1-foo/00-context/02-scope-boundaries.md',
      '.plans/features/active/f1-foo/00-context/08-epic-binding.md',
      '.plans/features/active/f5-bar/00-context/01-product-context.md',
      '.plans/features/active/f5-bar/00-context/08-epic-binding.md',
      '.plans/drafts/f1-foo/01-draft.md',
      '.plans/drafts/f1-foo/02-prd.md',
      '.plans/drafts/f5-bar/01-draft.md',
      '.plans/epics/10-planning/EPIC-20260422-001/00-epic-brief.md',
      '.plans/epics/10-planning/EPIC-20260422-001/01-children-features.md'
    ]
    for (const f of files) {
      writeFile(f, `Epic 경로: ../epics/10-planning/EPIC-20260422-001/brief.md`)
    }

    const result = rewriteEpicLinks({
      rootDir: workDir,
      epicId: 'EPIC-20260422-001',
      prevState: '10-planning',
      newState: '20-active',
      dryRun: false
    })

    expect(result.changedFiles.length).toBe(13)
    expect(result.totalReplacements).toBe(13)

    // 잔존 구 경로 0
    for (const f of files) {
      const content = readFileSync(join(workDir, f), 'utf8')
      expect(content).not.toContain('/10-planning/EPIC-20260422-001/')
      expect(content).toContain('/20-active/EPIC-20260422-001/')
    }
  })
})
