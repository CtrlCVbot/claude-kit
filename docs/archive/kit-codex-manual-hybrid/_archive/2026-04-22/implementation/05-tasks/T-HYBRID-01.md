# T-HYBRID-01 — Shared SSOT 경로 확정 (H1 해소)

**Phase**: 0 (설계 승인)
**우선순위**: P0 (Phase 1 시작 차단)
**선행**: 없음
**후행**: T-HYBRID-04

## 목적

FEEDBACK H1 지적: `03-target-architecture.md:22-30`에서 `src/shared/manuals/`를 canonical로 선정하되 "example" 꼬리표 잔존. 공식 확정 필요.

## 수행 내용

1. `03-target-architecture.md` §2 "예시" 표현을 "canonical"로 교체
2. 대안 경로(docs/shared/, 별도 패키지) 비교표 추가
3. `README.md`의 Phase 0 checklist에서 "SSOT 위치 확정" 체크

## AC

- [ ] `03-target-architecture.md` §2에 "canonical" 명시
- [ ] 비교표(3행: src/shared, docs/shared, 별도 패키지) 추가
- [ ] `docs/plan/kit-codex-manual-hybrid/README.md` checklist 갱신

## 파일

- `docs/plan/kit-codex-manual-hybrid/03-target-architecture.md`
- `docs/plan/kit-codex-manual-hybrid/README.md`

## 롤백

문서 revert 단건.
