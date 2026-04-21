// 2.3.0 테스트 인프라 스모크 테스트
// Phase 2.1 담당자가 RED 테스트를 추가하기 전까지 `pnpm test` 통과 보증
import { describe, it, expect } from 'vitest'

describe('claude-kit test infrastructure smoke', () => {
  it('vitest runner is configured', () => {
    expect(typeof describe).toBe('function')
    expect(typeof it).toBe('function')
    expect(typeof expect).toBe('function')
  })

  it('placeholder — Phase 2.1 IMP-KIT-007~017 테스트가 추가되면 본 테스트는 삭제 가능', () => {
    expect(true).toBe(true)
  })
})
