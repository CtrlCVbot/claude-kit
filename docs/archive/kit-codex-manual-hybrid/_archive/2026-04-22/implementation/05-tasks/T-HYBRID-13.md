# T-HYBRID-13 — 레거시 alias/router 100% 커버리지

**Phase**: 3 (플러그인 축소)
**우선순위**: P0 (R-IMP-5 HIGH 완화)
**선행**: T-HYBRID-07
**후행**: T-HYBRID-12

## 목적

FEEDBACK M1 대응: 현재 `/dev-*`, `/plan-*`, `/copy-*` 명시 복제로 UX 유지 중. shared 전환 시 router layer로 공식화 — 100% intent 커버리지 확보.

## 수행 내용

1. 6개 대표 intent 선정 (기획 `05:21`의 "legacy UX compat" 6개):
   - `/dev-feature`, `/dev-run`, `/dev-verify`
   - `/plan-draft`, `/plan-prd`
   - `/copy-visual-review`
2. 각 intent에 대해 router 매핑 정의 (`src/shared/manuals/workflow-routing.md` 내 표)
3. router 구현 (커맨드 파일의 Entry Flow 섹션 강화)
4. 테스트: 6개 intent 전부 router 경유로 올바른 워크플로우 안내
5. `kit-audit C8`에 router 무결성 검증 추가

## AC

- [ ] 6개 intent × {매핑, 테스트 결과} 기록
- [ ] 100% 커버리지 (미매핑 intent 0)
- [ ] AC-6 (01-overview) 달성

## 파일

- `src/shared/manuals/workflow-routing.md`
- `src/claude/core/commands/*` (router 참조 포함)

## 롤백

router 미완성 시: `KIT_ROUTER_ENABLED=false` 환경변수 → 기존 직접 호출 경로 복원.
