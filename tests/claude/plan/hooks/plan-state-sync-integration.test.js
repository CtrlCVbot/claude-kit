/**
 * T-FSTATE-01 — plan-state-sync 통합 테스트
 *
 * 임시 디렉터리에 실제 파일 fixture 를 만들고 syncAll 을 호출해
 * 3 곳 동기 + rollback + Epic 미연결 케이스를 검증한다.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('plan-state-sync 통합 — 실제 파일 동기', () => {
  let tmpDir
  let originalCwd

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plan-state-sync-'))
    originalCwd = process.cwd()
    process.chdir(tmpDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch {}
    // 모듈 캐시 초기화 — cwd 의존 경로 재평가
    const hookPath = path.join(__dirname, '..', '..', '..', '..', 'src', 'claude', 'plan', 'hooks', 'plan-state-sync.js')
    const corePath = path.join(__dirname, '..', '..', '..', '..', 'src', 'claude', 'plan', 'hooks', '_plan-state-sync-core.js')
    try { delete require.cache[require.resolve(hookPath)] } catch {}
    try { delete require.cache[require.resolve(corePath)] } catch {}
  })

  function setupBacklog(content) {
    const ideasDir = path.join(tmpDir, '.plans', 'ideas')
    fs.mkdirSync(ideasDir, { recursive: true })
    fs.writeFileSync(path.join(ideasDir, 'backlog.md'), content, 'utf8')
  }

  function setupIdea(status, ideaId, content) {
    const dir = path.join(tmpDir, '.plans', 'ideas', status)
    fs.mkdirSync(dir, { recursive: true })
    const filePath = path.join(dir, `${ideaId}.md`)
    fs.writeFileSync(filePath, content, 'utf8')
    return filePath
  }

  function setupEpicChildren(statusDir, epicId, content) {
    const dir = path.join(tmpDir, '.plans', 'epics', statusDir, epicId)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, '01-children-features.md'), content, 'utf8')
  }

  function setupBinding(slug, content) {
    const dir = path.join(tmpDir, '.plans', 'features', 'active', slug, '00-context')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, '08-epic-binding.md'), content, 'utf8')
  }

  function loadHook() {
    // cwd 변경 후 모듈 로드 — 경로 상수들이 새 cwd 기준으로 평가됨
    return require('../../../../src/claude/plan/hooks/plan-state-sync.js')
  }

  it('Epic 없는 IDEA: backlog 만 갱신', () => {
    setupBacklog(`# Backlog

| ID | 제목 | 카테고리 | 상태 | 등록일 | 위치 | 파일 | Epic |
|---|---|---|---|---|---|---|---|
| IDEA-20260423-007 | A | feature | inbox | 2026-04-23 | 00-inbox | [f](00-inbox/IDEA-20260423-007.md) | — |
`)

    const ideaPath = setupIdea('00-inbox', 'IDEA-20260423-007', `---
id: IDEA-20260423-007
상태: screened
Epic: null
---
# 본문`)

    const { syncAll } = loadHook()
    const content = fs.readFileSync(ideaPath, 'utf8')
    const result = syncAll({ ideaFilePath: ideaPath, newContent: content, prevState: 'inbox' })

    expect(result.synced).toBe(true)
    expect(result.targets).toContain('backlog')
    expect(result.targets).not.toContain('children')
    expect(result.targets).not.toContain('binding')

    const backlog = fs.readFileSync(path.join(tmpDir, '.plans', 'ideas', 'backlog.md'), 'utf8')
    expect(backlog).toContain('| IDEA-20260423-007 | A | feature | screened |')
  })

  it('Epic 연결 IDEA: backlog + children + binding 3곳 모두 갱신', () => {
    setupBacklog(`# Backlog

| ID | 제목 | 카테고리 | 상태 | 등록일 | 위치 | 파일 | Epic |
|---|---|---|---|---|---|---|---|
| IDEA-20260423-007 | Hero | feature | screened | 2026-04-23 | 10-screening | [f](10-screening/IDEA-20260423-007.md) | EPIC-20260422-001 |
`)

    setupEpicChildren('00-draft', 'EPIC-20260422-001', `# Children Features — EPIC-20260422-001

## 1. Feature 목록

### F1 — Hero 리프레시

- **IDEA**: [IDEA-20260423-007](../../../ideas/10-screening/IDEA-20260423-007.md)
- **Lane**: 2
- **범위**: components/hero/
- **상태**: pending

---

## 2. 의존성 매트릭스
`)

    setupBinding('hero-refresh', `# Epic Binding: hero-refresh

> **Feature**: hero-refresh
> **Epic**: EPIC-20260422-001

## 6. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 |

## 7. 상태 동기 기록 (자동 갱신)

| 타임스탬프 | IDEA 상태 | Feature 상태 |
|---|---|---|
`)

    const ideaPath = setupIdea('10-screening', 'IDEA-20260423-007', `---
id: IDEA-20260423-007
상태: approved
Epic: EPIC-20260422-001
slug: hero-refresh
---
# 본문`)

    const { syncAll } = loadHook()
    const content = fs.readFileSync(ideaPath, 'utf8')
    const result = syncAll({ ideaFilePath: ideaPath, newContent: content, prevState: 'screened' })

    expect(result.synced).toBe(true)
    expect(result.targets).toEqual(expect.arrayContaining(['backlog', 'children', 'binding']))

    const backlog = fs.readFileSync(path.join(tmpDir, '.plans', 'ideas', 'backlog.md'), 'utf8')
    expect(backlog).toContain('| IDEA-20260423-007 | Hero | feature | approved |')

    const children = fs.readFileSync(
      path.join(tmpDir, '.plans', 'epics', '00-draft', 'EPIC-20260422-001', '01-children-features.md'),
      'utf8'
    )
    expect(children).toMatch(/F1[\s\S]*?\*\*상태\*\*: approved/)

    const binding = fs.readFileSync(
      path.join(tmpDir, '.plans', 'features', 'active', 'hero-refresh', '00-context', '08-epic-binding.md'),
      'utf8'
    )
    expect(binding).toMatch(/\|\s*20\d{2}-\d{2}-\d{2}T[\d:.Z-]+\s*\|\s*approved\s*\|\s*approved\s*\|/)
  })

  it('동일 상태로 갱신 시도 → 변화 없음 (idempotent)', () => {
    setupBacklog(`# Backlog

| ID | 제목 | 카테고리 | 상태 | 등록일 | 위치 | 파일 | Epic |
|---|---|---|---|---|---|---|---|
| IDEA-20260423-007 | A | feature | inbox | 2026-04-23 | 00-inbox | [f](00-inbox/IDEA-20260423-007.md) | — |
`)

    const ideaPath = setupIdea('00-inbox', 'IDEA-20260423-007', `---
id: IDEA-20260423-007
상태: inbox
---
# 본문`)

    const { syncAll } = loadHook()
    const content = fs.readFileSync(ideaPath, 'utf8')
    const result = syncAll({ ideaFilePath: ideaPath, newContent: content, prevState: 'inbox' })

    expect(result.synced).toBe(false)
    expect(result.reason).toBe('no-change')
  })

  it('IDEA ID 추출 실패 → skipped', () => {
    const { syncAll } = loadHook()
    const result = syncAll({
      ideaFilePath: '.plans/ideas/not-an-idea.md',
      newContent: '---\n상태: screened\n---',
      prevState: 'inbox'
    })
    expect(result.synced).toBe(false)
    expect(result.reason).toBe('no-idea-id')
  })

  it('Epic 디렉터리 없음 → children skip (에러 없음)', () => {
    setupBacklog(`# Backlog

| ID | 제목 | 카테고리 | 상태 | 등록일 | 위치 | 파일 | Epic |
|---|---|---|---|---|---|---|---|
| IDEA-20260423-007 | A | feature | inbox | 2026-04-23 | 00-inbox | [f](00-inbox/IDEA-20260423-007.md) | EPIC-20260422-001 |
`)

    const ideaPath = setupIdea('00-inbox', 'IDEA-20260423-007', `---
id: IDEA-20260423-007
상태: screened
Epic: EPIC-20260422-001
---`)

    const { syncAll } = loadHook()
    const content = fs.readFileSync(ideaPath, 'utf8')
    const result = syncAll({ ideaFilePath: ideaPath, newContent: content, prevState: 'inbox' })

    // Epic 연결되어 있으나 실제 디렉터리 없음 → backlog 만 갱신
    expect(result.synced).toBe(true)
    expect(result.targets).toContain('backlog')
    expect(result.targets).not.toContain('children')
  })
})
