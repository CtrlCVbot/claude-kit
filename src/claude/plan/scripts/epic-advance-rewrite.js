/**
 * T-EPMV-01 — Epic Advance 자동 링크 재작성
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-EPMV-01.md
 * SSOT: src/claude/plan/rules/plan-epic-hierarchy.md §4-1, §4-2
 * 대응: N-01 (Critical) — Phase A Dry-Run 에서 관측된 13 파일 수동 링크 갱신 부담 제거.
 *
 * 핵심 원칙:
 * - 치환 패턴은 `/{prevState}/{epicId}/` 완전 매칭 (슬래시 경계)
 * - 서사 텍스트(경로 아닌 문자열)는 치환 대상 아님 — 회귀 테스트로 보호
 * - dryRun 플래그로 변경 없이 예상치만 확인 가능
 *
 * 공개 함수 3종:
 * - buildReplacementPattern({ epicId, prevState, newState })
 * - replaceInFile(filePath, pattern, replacement, { dryRun })
 * - rewriteEpicLinks({ rootDir, epicId, prevState, newState, dryRun })
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * 정규식 메타문자 이스케이프.
 */
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * `{ epicId, prevState, newState }` 로부터 안전 치환 패턴과 치환 문자열 생성.
 *
 * 반환: { pattern: RegExp, replacement: string }
 */
export function buildReplacementPattern(options) {
  if (options === null || typeof options !== 'object') {
    throw new Error('buildReplacementPattern: options 객체 필요 (epicId, prevState, newState)')
  }
  const { epicId, prevState, newState } = options
  if (!epicId) throw new Error('buildReplacementPattern: epicId 누락')
  if (!prevState) throw new Error('buildReplacementPattern: prevState 누락')
  if (!newState) throw new Error('buildReplacementPattern: newState 누락')

  const source = `/${escapeRegExp(prevState)}/${escapeRegExp(epicId)}/`
  return {
    pattern: new RegExp(source, 'g'),
    replacement: `/${newState}/${epicId}/`
  }
}

/**
 * 단일 파일에 치환을 적용. dryRun=true 면 변경 없이 예상 건수만 반환.
 *
 * 반환: { changed: boolean, count: number }
 */
export function replaceInFile(filePath, pattern, replacement, { dryRun = false } = {}) {
  if (!filePath) throw new Error('replaceInFile: filePath 필요')
  if (!(pattern instanceof RegExp)) throw new Error('replaceInFile: pattern 은 RegExp 이어야 함')

  const original = readFileSync(filePath, 'utf8')
  // global 플래그 덕분에 matchAll 또는 단순 match 로 횟수 계산 가능
  const matches = original.match(pattern)
  const count = matches ? matches.length : 0

  if (count === 0) {
    return { changed: false, count: 0 }
  }

  if (!dryRun) {
    const replaced = original.replace(pattern, replacement)
    writeFileSync(filePath, replaced, 'utf8')
  }

  return { changed: true, count }
}

/**
 * rootDir 하위 `.plans/**\/*.md` 파일을 재귀적으로 수집.
 */
function collectMarkdownFiles(baseDir) {
  if (!existsSync(baseDir)) return []
  const results = []
  const stack = [baseDir]

  while (stack.length > 0) {
    const current = stack.pop()
    let entries
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      continue  // 권한 오류 등은 건너뜀
    }
    for (const entry of entries) {
      const fullPath = join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(fullPath)
      }
    }
  }

  // 결정적 순서 유지 (테스트 안정성)
  return results.sort()
}

/**
 * rootDir/.plans 하위 모든 .md 파일에 대해 Epic 경로 치환 수행.
 *
 * 반환: { changedFiles: string[], totalReplacements: number, dryRun: boolean }
 */
export function rewriteEpicLinks(options) {
  if (options === null || typeof options !== 'object') {
    throw new Error('rewriteEpicLinks: options 객체 필요')
  }
  const { rootDir, epicId, prevState, newState, dryRun = false } = options
  if (!rootDir) throw new Error('rewriteEpicLinks: rootDir 누락')
  if (!epicId) throw new Error('rewriteEpicLinks: epicId 누락')
  if (!prevState) throw new Error('rewriteEpicLinks: prevState 누락')
  if (!newState) throw new Error('rewriteEpicLinks: newState 누락')

  const { pattern, replacement } = buildReplacementPattern({ epicId, prevState, newState })
  const plansDir = join(rootDir, '.plans')
  const files = collectMarkdownFiles(plansDir)

  const changedFiles = []
  let totalReplacements = 0

  for (const file of files) {
    try {
      const stat = statSync(file)
      if (!stat.isFile()) continue
    } catch {
      continue
    }
    const { changed, count } = replaceInFile(file, pattern, replacement, { dryRun })
    if (changed) {
      changedFiles.push(file)
      totalReplacements += count
    }
  }

  return {
    changedFiles,
    totalReplacements,
    dryRun
  }
}
