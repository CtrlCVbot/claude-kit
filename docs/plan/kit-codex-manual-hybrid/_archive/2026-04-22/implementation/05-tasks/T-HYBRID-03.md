# T-HYBRID-03 — A/B/C 정량화 테이블 attachment 확인 (H3 해소)

**Phase**: 0 (설계 승인)
**우선순위**: P0
**선행**: 없음
**후행**: T-HYBRID-12

## 목적

FEEDBACK H3 지적: 정량화 필요 — 이미 `06-src-codex-abc-classification.md:32-50`에서 149 파일 3/104/42 분류 완료. attachment 링크 유효성 최종 확인 + Phase 6 완료 기준에 반영.

## 수행 내용

1. `06-src-codex-abc-classification.md`의 분류 테이블 재검증 (파일 실존 여부)
2. `00-executive-summary.md` 또는 `04-migration-plan.md` Phase 6에 "A+B 제거 → C만 잔존" 링크 추가
3. `README.md` Phase 0 checklist에서 H3 체크

## AC

- [ ] 06 문서의 A 클래스 3개 파일 실존 확인 (grep)
- [ ] Phase 6 완료 기준 표현을 "src/codex ≤ 50 파일 (C-only)"로 정량화
- [ ] README checklist 갱신

## 파일

- `docs/plan/kit-codex-manual-hybrid/06-src-codex-abc-classification.md`
- `docs/plan/kit-codex-manual-hybrid/04-migration-plan.md`
- `docs/plan/kit-codex-manual-hybrid/README.md`

## 롤백

revert 단건.
