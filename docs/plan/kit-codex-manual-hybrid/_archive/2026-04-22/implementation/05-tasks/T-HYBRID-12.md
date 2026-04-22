# T-HYBRID-12 — src/codex/ A+B 파일 제거 (Phase 6)

**Phase**: 6 (중복 제거 — v2.4.0 major)
**우선순위**: P0
**선행**: T-HYBRID-07, T-HYBRID-08, T-HYBRID-10, T-HYBRID-11, T-HYBRID-13
**후행**: T-HYBRID-15

## 목적

기획 `06-src-codex-abc-classification.md:32-50` 기반: A(3) + B(104) = 107 파일 제거. `src/codex/`는 C(42)만 잔존.

## 수행 내용

1. 삭제 전 스냅샷: `_archive/2026-XX-XX/src-codex-ab-removed/`
2. A 클래스 3개 즉시 삭제:
   - `src/codex/plan/_templates/design-manifest.template.md`
   - `src/codex/plan/_templates/design-prompt-highfidelity.template.md`
   - `src/codex/plan/_templates/design-prompt-wireframe.template.md`
3. B 클래스 104개는 도메인별 5개 이상 PR로 분할:
   - copy 16 / core 11 / dev 44 / plan 33
4. 각 PR에 `/kit-audit C7 C8 C11` PASS 확인
5. `pairing-registry.json` 해당 엔트리 제거 (`sourceType=shared`로 전환 또는 삭제)

## AC

- [ ] `src/codex/` 파일 수 ≤ 50 (C만 잔존)
- [ ] `/kit-list --target codex` 출력 확인
- [ ] `_archive/` 스냅샷 생성
- [ ] 각 삭제 PR은 단일 PR revert 가능
- [ ] AC-2 (01-overview) 달성

## 파일

- 삭제: `src/codex/` A+B 107개
- 수정: `src/pairing-registry.json`
- 신규: `_archive/2026-XX-XX/src-codex-ab-removed/`

## 롤백

각 PR revert → `_archive/`에서 복원 스크립트 실행.
