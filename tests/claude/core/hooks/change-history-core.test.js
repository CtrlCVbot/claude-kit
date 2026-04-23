/**
 * T-BKLG-01 RED — 변경 이력 자동 append core 모듈 테스트
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-BKLG-01.md
 * 대응: I-18 (Low), N-18 — 변경 이력 수동 append 누락·granularity 불일치.
 *
 * 본 모듈은 순수 함수만 제공 (파일 I/O 없음). hook 파일이 이 모듈을 사용해
 * 실제 append 작업을 수행. 활성화 조건 충족 (UX 합의) 전까지 hook 은 비활성 stub.
 */
import { describe, it, expect } from 'vitest'
import pkg from '../../../../src/claude/core/hooks/_change-history-core.js'
const {
  detectChangeLogSection,
  isDuplicateEntryToday,
  buildRow,
  appendRowToContent,
  today,
} = pkg

describe('_change-history-core — detectChangeLogSection', () => {
  it('`## N. 변경 이력` 헤더 + 표 감지', () => {
    const content = `# 제목

## 1. 개요

## 5. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-22 | 초안 작성 |
`
    const result = detectChangeLogSection(content)
    expect(result.found).toBe(true)
    expect(result.sectionNumber).toBe(5)
    expect(result.tableStartLine).toBeGreaterThan(0)
  })

  it('작성자 컬럼 있는 변형 감지', () => {
    const content = `## 7. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 | Claude |
`
    const result = detectChangeLogSection(content)
    expect(result.found).toBe(true)
  })

  it('표 없음 → found=false', () => {
    const content = `## 1. 개요

본문만 있음.`
    const result = detectChangeLogSection(content)
    expect(result.found).toBe(false)
  })

  it('빈 content → found=false', () => {
    expect(detectChangeLogSection('').found).toBe(false)
    expect(detectChangeLogSection(null).found).toBe(false)
    expect(detectChangeLogSection(undefined).found).toBe(false)
  })

  it('"변경 이력" 텍스트만 있고 표 없음 → found=false', () => {
    const content = `## 5. 변경 이력

초안 작성했습니다.`
    const result = detectChangeLogSection(content)
    expect(result.found).toBe(false)
  })
})

describe('_change-history-core — isDuplicateEntryToday', () => {
  const content = `## 5. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-22 | 초안 |
| 2026-04-23 | 기능 추가 |
`

  it('오늘 날짜 이미 존재 → true', () => {
    expect(isDuplicateEntryToday(content, '2026-04-23')).toBe(true)
  })

  it('오늘 날짜 없음 → false', () => {
    expect(isDuplicateEntryToday(content, '2026-04-24')).toBe(false)
  })

  it('빈 content → false (안전)', () => {
    expect(isDuplicateEntryToday('', '2026-04-23')).toBe(false)
  })

  it('날짜 파라미터 없음 → false', () => {
    expect(isDuplicateEntryToday(content, '')).toBe(false)
    expect(isDuplicateEntryToday(content, null)).toBe(false)
  })
})

describe('_change-history-core — buildRow', () => {
  it('2-column (날짜 / 내용)', () => {
    expect(buildRow({ date: '2026-04-23', summary: '테스트' }))
      .toBe('| 2026-04-23 | 테스트 |')
  })

  it('3-column (일시 / 변경 / 작성자)', () => {
    expect(buildRow({ date: '2026-04-23', summary: '테스트', author: 'Claude' }))
      .toBe('| 2026-04-23 | 테스트 | Claude |')
  })

  it('summary 에 pipe 문자 → 이스케이프', () => {
    expect(buildRow({ date: '2026-04-23', summary: 'A | B' }))
      .toBe('| 2026-04-23 | A \\| B |')
  })

  it('필수 필드 누락 → null', () => {
    expect(buildRow({})).toBe(null)
    expect(buildRow({ date: '2026-04-23' })).toBe(null)
    expect(buildRow({ summary: 'x' })).toBe(null)
  })
})

describe('_change-history-core — appendRowToContent', () => {
  it('변경 이력 표 끝에 새 행 append', () => {
    const content = `# 제목

## 5. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-22 | 초안 |
`
    const result = appendRowToContent(content, { date: '2026-04-23', summary: '기능 추가' })
    expect(result.changed).toBe(true)
    expect(result.content).toContain('| 2026-04-23 | 기능 추가 |')
    expect(result.content).toContain('| 2026-04-22 | 초안 |')  // 기존 보존
  })

  it('중복 오늘 날짜 → changed=false (idempotent)', () => {
    const content = `## 5. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | 이미 존재 |
`
    const result = appendRowToContent(content, { date: '2026-04-23', summary: '중복 시도' })
    expect(result.changed).toBe(false)
    expect(result.reason).toBe('duplicate-today')
  })

  it('표 없는 파일 → changed=false + reason=no-section', () => {
    const result = appendRowToContent('본문만', { date: '2026-04-23', summary: '테스트' })
    expect(result.changed).toBe(false)
    expect(result.reason).toBe('no-section')
  })

  it('summary 없음 → changed=false + reason=no-summary', () => {
    const content = `## 5. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-22 | 초안 |
`
    const result = appendRowToContent(content, { date: '2026-04-23', summary: '' })
    expect(result.changed).toBe(false)
    expect(result.reason).toBe('no-summary')
  })

  it('3-column 작성자 포함 표에 appendi', () => {
    const content = `## 7. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 | Claude |
`
    const result = appendRowToContent(content, {
      date: '2026-04-23',
      summary: '기능',
      author: 'Claude'
    })
    expect(result.changed).toBe(true)
    expect(result.content).toContain('| 2026-04-23 | 기능 | Claude |')
  })
})

describe('_change-history-core — today()', () => {
  it('YYYY-MM-DD 형식 반환', () => {
    const result = today()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('mockDate 지원 (테스트용)', () => {
    expect(today('2026-04-23T12:00:00Z')).toBe('2026-04-23')
  })
})
