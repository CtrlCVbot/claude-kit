# T-HYBRID-15 — scripts/setup.js shared-first emitter 재구성

**Phase**: 6 (v2.4.0 major)
**우선순위**: P0
**선행**: T-HYBRID-07, T-HYBRID-08, T-HYBRID-10, T-HYBRID-11, T-HYBRID-12
**후행**: 없음 (v2.4.0 cut 직전)

## 목적

기획 `04-migration-plan.md:149-157`에서 `scripts/setup.js`는 "shared manifest 기반 재구성" 대상. Phase 6 완료 기준에 포함.

## 수행 내용

1. 현재 `buildHooksConfig()` + `emitCodex()` 로직을 **4단계로 재구성**:
   - (1) Load shared/manifests/*.json
   - (2) Emit Claude runtime (`.claude/`) with shared refs
   - (3) Emit Codex runtime (AGENTS.md + `.codex/agents/*.toml` + skills + filtered hooks)
   - (4) Post-emit validation: `/kit-audit C7 C8 C11`
2. v2.3.x 호환: shared manifest 없으면 기존 경로
3. v2.4.0: shared manifest 필수, 없으면 build 실패
4. `HOOK_PORTABILITY` 대신 `codex-portability.json`의 `hookPolicy` 참조

## AC

- [ ] setup.js의 emit 흐름이 4단계 구조화됨
- [ ] shared 존재/부재 모두에 대해 smoke test
- [ ] v2.4.0 cut 시 `/kit-audit C11` + build 성공
- [ ] 다운스트림(`mologado`) postinstall smoke test PASS
- [ ] AC-8 (01-overview) 달성

## 파일

- `scripts/setup.js`
- `scripts/codex-hook-compat.js` (소비 측 변경)

## 롤백

- v2.3.x: shared 미존재로 회귀 가능
- v2.4.0: `pnpm install claude-kit@2.3.x` 다운그레이드 가이드 배포
