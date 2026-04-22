# T-HYBRID-11 — 훅 정리 (keep/delete/hold)

**Phase**: 5 (훅 cleanup)
**우선순위**: P0 (Phase 6 차단)
**선행**: T-HYBRID-09
**후행**: T-HYBRID-12, T-HYBRID-15

## 목적

`03-kit-sync-impact.md` §5: 17개 훅 전수 분류 — `hookPolicy: keep|delete|hold`. Phase 6 진입 전 `hold` 잔존 0 필수.

## 수행 내용

1. `src/claude/_meta/codex-portability.json` 스키마 확장 — `hookPolicy`, `windowsSupport` 추가
2. 17개 훅 각각에 대해 판정:
   - 공식 보장 범위(Bash Pre/PostToolUse) + 동작 확인 → `keep`
   - Codex 불가 + Claude-only → `delete` (skill fallback 유지)
   - 증거 부족 → `hold` → 추가 조사 후 재판정
3. `scripts/codex-hook-compat.js`의 `HOOK_PORTABILITY` 상수 동기화
4. `schema-codex-portability.md` 검증 확장

## AC

- [ ] 17개 훅 모두 `hookPolicy` 값 보유
- [ ] `hold` 잔존 = 0 (Phase 5 완료 기준)
- [ ] `windowsSupport: false` 훅 명시 (Codex Windows 훅 disabled)
- [ ] `/kit-validate --name <hook>` PASS

## 파일

- `src/claude/_meta/codex-portability.json`
- `scripts/codex-hook-compat.js`
- `src/claude/core/skills/kit-validation/references/schema-codex-portability.md`

## 롤백

`hookPolicy` 필드 값 제거 (필드는 유지). 기본값 `hold`로 간주 → emitter 동작 안전.
