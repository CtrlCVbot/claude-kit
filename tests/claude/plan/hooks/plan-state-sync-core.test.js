/**
 * T-FSTATE-01 RED — IDEA 상태 SSOT 동기 core 모듈 테스트
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-FSTATE-01.md
 * SSOT: src/claude/plan/rules/plan-epic-hierarchy.md §5 (T-FSTATE-02)
 * 대응: I-02 (High), N-04 — IDEA frontmatter 상태 변경 시 3 곳 수동 갱신 부담.
 *
 * 본 모듈은 순수 함수만 제공 (파일 I/O 없음). hook 파일이 이 모듈을 사용해
 * 실제 동기 작업을 수행한다. lockfile · rollback · 로그는 hook 책임.
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/plan/hooks/_plan-state-sync-core.js'
const {
  parseFrontmatter,
  extractIdeaIdFromPath,
  mapIdeaToFeatureState,
  updateBacklogRow,
  updateChildrenFeatureState,
  appendBindingSyncRow,
  decideStateSync,
  STATE_TRANSITIONS,
  IDEA_STATES,
  FEATURE_STATES
} = pkg

describe('_plan-state-sync-core — 상수', () => {
  it('IDEA_STATES 는 4 개 상태', () => {
    expect(IDEA_STATES).toEqual(['inbox', 'screened', 'approved', 'archived'])
  })

  it('FEATURE_STATES 는 4 개 상태', () => {
    expect(FEATURE_STATES).toEqual(['pending', 'approved', 'active', 'archived'])
  })

  it('STATE_TRANSITIONS 는 IDEA → Feature 매핑', () => {
    expect(STATE_TRANSITIONS).toHaveProperty('inbox', 'pending')
    expect(STATE_TRANSITIONS).toHaveProperty('screened', 'pending')
    expect(STATE_TRANSITIONS).toHaveProperty('approved', 'approved')
    expect(STATE_TRANSITIONS).toHaveProperty('archived', 'archived')
  })
})

describe('_plan-state-sync-core — parseFrontmatter', () => {
  it('상태 / Epic / slug 필드 추출', () => {
    const content = `---
id: IDEA-20260423-007
상태: screened
Epic: EPIC-20260422-001
slug: hero-refresh
---
# 본문`
    const fm = parseFrontmatter(content)
    expect(fm.id).toBe('IDEA-20260423-007')
    expect(fm.상태).toBe('screened')
    expect(fm.Epic).toBe('EPIC-20260422-001')
    expect(fm.slug).toBe('hero-refresh')
  })

  it('status 영문 키 지원 (fallback)', () => {
    const content = `---
id: IDEA-20260423-008
status: approved
---
# 본문`
    const fm = parseFrontmatter(content)
    expect(fm.status).toBe('approved')
  })

  it('Epic 없음 → null 또는 undefined', () => {
    const content = `---
id: IDEA-20260423-009
상태: inbox
---`
    const fm = parseFrontmatter(content)
    expect(fm.Epic == null).toBe(true)
  })

  it('frontmatter 없음 → {} 반환 (fail-open)', () => {
    const fm = parseFrontmatter('# 본문만')
    expect(fm).toEqual({})
  })

  it('malformed frontmatter → {} 반환', () => {
    const fm = parseFrontmatter('---\n상태 approved\n---')  // no colon
    expect(typeof fm).toBe('object')
  })

  it('따옴표로 감싼 값 처리', () => {
    const content = `---
id: "IDEA-20260423-010"
상태: 'approved'
---`
    const fm = parseFrontmatter(content)
    expect(fm.id).toBe('IDEA-20260423-010')
    expect(fm.상태).toBe('approved')
  })
})

describe('_plan-state-sync-core — extractIdeaIdFromPath', () => {
  it('IDEA-YYYYMMDD-NNN 패턴 추출', () => {
    expect(extractIdeaIdFromPath('.plans/ideas/00-inbox/IDEA-20260423-007.md'))
      .toBe('IDEA-20260423-007')
    expect(extractIdeaIdFromPath('/abs/path/IDEA-20260101-001.md'))
      .toBe('IDEA-20260101-001')
  })

  it('Windows 경로 지원', () => {
    expect(extractIdeaIdFromPath('.plans\\ideas\\00-inbox\\IDEA-20260423-007.md'))
      .toBe('IDEA-20260423-007')
  })

  it('패턴 없음 → null', () => {
    expect(extractIdeaIdFromPath('.plans/ideas/backlog.md')).toBe(null)
    expect(extractIdeaIdFromPath('')).toBe(null)
  })
})

describe('_plan-state-sync-core — mapIdeaToFeatureState', () => {
  it('4 개 IDEA 상태 → Feature 상태 매핑', () => {
    expect(mapIdeaToFeatureState('inbox')).toBe('pending')
    expect(mapIdeaToFeatureState('screened')).toBe('pending')
    expect(mapIdeaToFeatureState('approved')).toBe('approved')
    expect(mapIdeaToFeatureState('archived')).toBe('archived')
  })

  it('미지의 상태 → null (안전 기본값)', () => {
    expect(mapIdeaToFeatureState('unknown')).toBe(null)
    expect(mapIdeaToFeatureState('')).toBe(null)
    expect(mapIdeaToFeatureState(null)).toBe(null)
  })
})

describe('_plan-state-sync-core — updateBacklogRow', () => {
  const backlog = `# Backlog

| ID | 제목 | 카테고리 | 상태 | 등록일 | 위치 | 파일 | Epic |
|---|---|---|---|---|---|---|---|
| IDEA-20260423-007 | Hero 리프레시 | feature | inbox | 2026-04-23 | 00-inbox | [file](00-inbox/IDEA-20260423-007.md) | — |
| IDEA-20260423-008 | Stitch 연동 | improvement | screened | 2026-04-23 | 10-screening | [file](10-screening/IDEA-20260423-008.md) | [EPIC-20260422-001](../epics/00-draft/EPIC-20260422-001/00-epic-brief.md) |
`

  it('해당 IDEA 행의 상태 컬럼 치환', () => {
    const updated = updateBacklogRow(backlog, 'IDEA-20260423-007', 'screened')
    expect(updated).toContain('| IDEA-20260423-007 | Hero 리프레시 | feature | screened |')
    // 다른 행은 변하지 않음
    expect(updated).toContain('| IDEA-20260423-008 | Stitch 연동 | improvement | screened |')
  })

  it('존재하지 않는 IDEA → 원본 그대로', () => {
    const updated = updateBacklogRow(backlog, 'IDEA-99999999-999', 'approved')
    expect(updated).toBe(backlog)
  })

  it('이미 같은 상태 → 원본 그대로 (idempotent)', () => {
    const updated = updateBacklogRow(backlog, 'IDEA-20260423-007', 'inbox')
    expect(updated).toBe(backlog)
  })

  it('빈 content → 빈 문자열', () => {
    expect(updateBacklogRow('', 'IDEA-20260423-007', 'approved')).toBe('')
  })
})

describe('_plan-state-sync-core — updateChildrenFeatureState', () => {
  const children = `# Children Features — EPIC-20260422-001

## 1. Feature 목록

### F1 — Hero 리프레시

- **IDEA**: [IDEA-20260423-007](../../../ideas/00-inbox/IDEA-20260423-007.md)
- **Lane**: 2 (single fidelity)
- **RICE 예상**: 48.0 (3 × 4 × 80% / 2)
- **범위**: components/hero/
- **상태**: pending

### F2 — Stitch 연동

- **IDEA**: [IDEA-20260423-008](../../../ideas/10-screening/IDEA-20260423-008.md)
- **Lane**: 1 (multi)
- **RICE 예상**: 60.0
- **범위**: ...
- **상태**: pending

---

## 2. 의존성 매트릭스
`

  it('F1 의 IDEA-...-007 상태 갱신 → F1 만 변경', () => {
    const updated = updateChildrenFeatureState(children, 'IDEA-20260423-007', 'approved')
    // F1 섹션은 approved 로 변경
    expect(updated).toMatch(/F1[\s\S]*?IDEA-20260423-007[\s\S]*?\*\*상태\*\*: approved/)
    // F2 섹션은 pending 그대로
    expect(updated).toMatch(/F2[\s\S]*?IDEA-20260423-008[\s\S]*?\*\*상태\*\*: pending/)
  })

  it('존재하지 않는 IDEA → 원본 그대로', () => {
    const updated = updateChildrenFeatureState(children, 'IDEA-99999999-999', 'approved')
    expect(updated).toBe(children)
  })

  it('같은 상태로 갱신 → 원본 그대로 (idempotent)', () => {
    const updated = updateChildrenFeatureState(children, 'IDEA-20260423-007', 'pending')
    expect(updated).toBe(children)
  })

  it('다음 F 섹션을 침범하지 않음', () => {
    const updated = updateChildrenFeatureState(children, 'IDEA-20260423-007', 'active')
    // F2 는 pending 유지 (F1 의 상태만 active 로 바뀜)
    const f2 = updated.match(/F2[\s\S]+?(?=---|\n## |$)/)
    expect(f2[0]).toContain('**상태**: pending')
  })
})

describe('_plan-state-sync-core — appendBindingSyncRow', () => {
  const binding = `# Epic Binding: hero-refresh

> **Feature**: hero-refresh
> **Epic**: EPIC-20260422-001

## 6. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 |

## 7. 상태 동기 기록 (자동 갱신)

| 타임스탬프 | IDEA 상태 | Feature 상태 |
|---|---|---|
`

  it('§7 끝에 새 행 append', () => {
    const updated = appendBindingSyncRow(binding, {
      timestamp: '2026-04-23T12:00:00Z',
      ideaState: 'approved',
      featureState: 'approved'
    })
    expect(updated).toContain('| 2026-04-23T12:00:00Z | approved | approved |')
    // 기존 내용 보존
    expect(updated).toContain('## 6. 변경 이력')
    expect(updated).toContain('| 2026-04-22 | 초안 |')
  })

  it('§7 이 없는 binding → 섹션 자동 생성 후 append', () => {
    const noSection = `# Epic Binding: x

## 6. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 |
`
    const updated = appendBindingSyncRow(noSection, {
      timestamp: '2026-04-23T12:00:00Z',
      ideaState: 'screened',
      featureState: 'pending'
    })
    expect(updated).toContain('## 7. 상태 동기 기록')
    expect(updated).toContain('| 2026-04-23T12:00:00Z | screened | pending |')
  })

  it('필수 필드 누락 → 원본 그대로 + warning 반환 없음 (safe no-op)', () => {
    const updated = appendBindingSyncRow(binding, {})
    expect(updated).toBe(binding)
  })

  it('빈 content → 빈 문자열', () => {
    expect(appendBindingSyncRow('', { timestamp: 't', ideaState: 'inbox', featureState: 'pending' })).toBe('')
  })
})

describe('_plan-state-sync-core — decideStateSync (통합 결정)', () => {
  it('IDEA 상태 변경 없음 → skipped=true', () => {
    const result = decideStateSync({
      prevState: 'inbox',
      newState: 'inbox',
      ideaId: 'IDEA-20260423-007'
    })
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('no-change')
  })

  it('IDEA-ID 없음 → skipped=true', () => {
    const result = decideStateSync({
      prevState: 'inbox',
      newState: 'screened',
      ideaId: null
    })
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('no-idea-id')
  })

  it('Epic 없음 → backlog 만 동기 대상', () => {
    const result = decideStateSync({
      prevState: 'inbox',
      newState: 'screened',
      ideaId: 'IDEA-20260423-007',
      epicId: null
    })
    expect(result.skipped).toBe(false)
    expect(result.targets).toContain('backlog')
    expect(result.targets).not.toContain('children')
    expect(result.targets).not.toContain('binding')
  })

  it('Epic 연결 IDEA → backlog + children + binding 3곳 동기', () => {
    const result = decideStateSync({
      prevState: 'screened',
      newState: 'approved',
      ideaId: 'IDEA-20260423-007',
      epicId: 'EPIC-20260422-001',
      featureSlug: 'hero-refresh'
    })
    expect(result.skipped).toBe(false)
    expect(result.targets).toEqual(expect.arrayContaining(['backlog', 'children', 'binding']))
    expect(result.featureState).toBe('approved')
  })

  it('미지의 상태 전이 → skipped=true, reason=invalid-state', () => {
    const result = decideStateSync({
      prevState: 'inbox',
      newState: 'unknown',
      ideaId: 'IDEA-20260423-007'
    })
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('invalid-state')
  })

  it('Feature 상태 매핑 결과 포함', () => {
    const result = decideStateSync({
      prevState: 'approved',
      newState: 'archived',
      ideaId: 'IDEA-20260423-007',
      epicId: 'EPIC-20260422-001'
    })
    expect(result.featureState).toBe('archived')
  })
})
