# T-HYBRID-04 — src/shared/manuals/ 스캐폴드 + 6개 매뉴얼 초안

**Phase**: 1 (Shared 매뉴얼 추출)
**우선순위**: P0
**선행**: T-HYBRID-01
**후행**: T-HYBRID-05, T-HYBRID-06

## 목적

기획 `03-target-architecture.md:32-50`의 shared 매뉴얼 6종 스캐폴드 생성. Claude + Codex 공통 SSOT 확보.

## 수행 내용

1. `src/shared/manuals/` 디렉터리 생성
2. 6개 매뉴얼 초안 작성 (≤300줄/파일):
   - `workflow-routing.md` — /dev-*, /plan-*, /copy-* intent 라우팅
   - `plan-pipeline.md` — plan 도메인 파이프라인 (idea→screen→draft→prd)
   - `dev-pipeline.md` — dev 도메인 파이프라인 (feature→run→verify)
   - `copy-pipeline.md` — copy 도메인 파이프라인 (6 lifecycle stages)
   - `hook-behavior.md` — Claude/Codex 훅 거동 차이
   - `runtime-differences.md` — Claude vs Codex 런타임 속성 비교

## AC

- [ ] `src/shared/manuals/` 디렉터리 존재
- [ ] 6개 파일 존재 (≥100줄 각)
- [ ] 각 파일에 "출처" 섹션 — 기존 Claude 자산 파일 참조
- [ ] 기존 `src/claude/{D}/skills/{N}/SKILL.md` 등의 중복 설명부에 shared 링크 삽입 계획 포함

## 파일

- 신규: `src/shared/manuals/*.md` (6개)

## 롤백

`rm -rf src/shared/manuals/` — opt-in 상태이므로 파이프라인 영향 없음.
