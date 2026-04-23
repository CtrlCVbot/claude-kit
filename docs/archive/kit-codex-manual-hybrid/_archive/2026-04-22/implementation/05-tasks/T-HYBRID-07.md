# T-HYBRID-07 — kit-sync-agent 7-phase 재설계 (Phase 1.5 신설)

**Phase**: 3 (플러그인 축소)
**우선순위**: P0 (파이프라인 핵심)
**선행**: T-HYBRID-05
**후행**: T-HYBRID-08, T-HYBRID-15

## 목적

`03-kit-sync-impact.md` §3.1에 정의된 Phase 1.5(shared manifest awareness)를 `kit-sync-agent`에 추가. 기존 6-phase → **7-phase** 오케스트레이션.

## 수행 내용

1. `src/claude/core/agents/kit-sync-agent.md`에 Phase 1.5 섹션 추가
2. Phase 1.5 로직:
   - `src/shared/manifests/*.json` 존재 확인
   - 스키마 검증 (`/kit-validate --target shared`)
   - 현재 스코프와 매니페스트 교집합 계산
   - 5-tier 전략 분류 (shared-direct 포함)
3. Phase 2 scale decision 로직에 shared-direct 분기 추가
4. 회귀 시나리오 RT-1(shared 없음), RT-2(shared 있음) 테스트

## AC

- [ ] kit-sync-agent.md에 Phase 1.5 명시
- [ ] RT-1: shared 미존재 시 기존 6-phase 동작
- [ ] RT-2: shared 존재 시 5-tier 출력에 shared-direct 포함
- [ ] Phase 2 분기 문서화

## 파일

- `src/claude/core/agents/kit-sync-agent.md`
- `src/claude/core/commands/kit-sync.md` (플래그 업데이트 시)

## 롤백

문서 revert 단건. shared 미존재 시 기존 경로 그대로 동작.
