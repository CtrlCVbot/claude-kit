# T-EPMV-02 — git mv/mv 자동 분기 + fallback 문서화

**제안**: P-1 (EPMV)
**원본 피드백**: I-08 (Medium → P0 승격), N-09
**우선순위**: 🔴 P0 Critical (EPMV AREA 통합 실익)
**릴리스**: v2.4.1
**선행**: 없음
**후행**: T-EPMV-01

## 목적

Epic 파일이 **untracked** 상태일 때 `git mv` 실패(`fatal: source directory is empty`) 를 자동 감지하여 일반 `mv` 로 fallback. 신규 사용자의 당황 제거 + rule 문서화로 이해 확보.

## 수행 내용

1. `plan-epic.md` advance 내부 단계에 **tracked 감지 로직** 추가:
   ```bash
   # git ls-files 로 tracked 여부 확인
   if git ls-files .plans/epics/{prev-state}/EPIC-{ID}/ | grep -q .; then
     git mv .plans/epics/{prev-state}/EPIC-{ID}/ .plans/epics/{new-state}/EPIC-{ID}/
   else
     mv .plans/epics/{prev-state}/EPIC-{ID}/ .plans/epics/{new-state}/EPIC-{ID}/
   fi
   ```
2. `src/claude/plan/rules/plan-epic-hierarchy.md` §4 "상태 머신" 에 신규 섹션 추가:
   ```markdown
   ## 4-1. 파일 이동 방법 (git mv vs mv)

   ### 기본: git mv
   Epic 파일이 git tracked 상태이면 git mv 사용 (이력 보존).

   ### Fallback: 일반 mv
   git mv 실패 시 (source directory is empty 등) 일반 mv 로 이동.
   - 발생 조건: .plans/ 가 아직 커밋 전이거나 .gitignore 포함
   - 대응: git ls-files 로 tracked 여부 확인 후 자동 분기
   - 주의: 일반 mv 는 git 이력 추적 단절 — delete+add 로 인식

   ### 자동 분기 커맨드
   /plan-epic advance 내부에서 tracked 여부 감지 후 자동 선택.
   ```
3. `/plan-epic advance` 보고에 사용한 이동 방법 명시 (예: "mv 사용 (tracked 전)")

## AC

- [ ] `/plan-epic advance` 가 tracked 여부 자동 감지
- [ ] untracked 상태에서 `mv` fallback 정상 작동
- [ ] tracked 상태에서 `git mv` 우선 사용 + 이력 보존 확인
- [ ] `plan-epic-hierarchy.md` §4-1 섹션 존재 (≥20 줄)
- [ ] advance 보고에 사용된 이동 방법 표시

## 파일

- 수정: `src/claude/plan/commands/plan-epic.md` (advance 섹션 이동 로직)
- 수정: `src/claude/plan/rules/plan-epic-hierarchy.md` (§4-1 fallback 섹션)

## 롤백

tracked 감지 로직 제거 → 기존 방식(사용자 수동 분기)으로 복귀.

## 검증 방법

```bash
# Case 1: untracked 상태
# 새 Epic 생성 후 커밋 없이 advance
/plan-epic EPIC-TEST
/plan-epic advance EPIC-TEST --to=planning
# → mv 사용 보고

# Case 2: tracked 상태
# 기존 Epic (git add 된 상태) advance
/plan-epic advance EPIC-... --to=active
# → git mv 사용 보고 + git log 에 rename 감지
```
