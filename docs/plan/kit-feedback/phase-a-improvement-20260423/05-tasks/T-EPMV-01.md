# T-EPMV-01 — `/plan-epic advance` 자동 링크 재작성

**제안**: P-1 (EPMV)
**원본 피드백**: I-01 (Critical), N-01
**우선순위**: 🔴 P0 Critical
**릴리스**: v2.4.1
**선행**: T-EPMV-02 (git mv 분기), T-EPMV-03 (게이트 검증)
**후행**: 없음 (EPMV AREA 완성)

## 목적

`/plan-epic advance` 커맨드에 **자동 링크 재작성** 통합. `draft → planning → active` 전이 시 13 파일(또는 그 이상)의 `/prev-state/EPIC-{ID}/` → `/new-state/EPIC-{ID}/` 경로를 단일 커맨드로 치환. 수동 부담 90% 감소.

## 수행 내용

1. `src/claude/plan/scripts/epic-advance-rewrite.js` 신규 스크립트 작성:
   - 입력: `{epicId, prevState, newState, dryRun}` 객체
   - 로직:
     ```javascript
     // 1. .plans 하위 .md 파일 목록 수집
     const files = glob('.plans/**/*.md')
     // 2. 안전 패턴만 치환 (/{prev}/EPIC-{ID}/ → /{new}/EPIC-{ID}/)
     const pattern = new RegExp(`/${prevState}/EPIC-${epicId}/`, 'g')
     const replacement = `/${newState}/EPIC-${epicId}/`
     // 3. 각 파일 변경 여부 + 변경 개수 집계
     // 4. dryRun=true 면 치환 건수만 반환, 실제 write 안 함
     // 5. 변경 파일 목록 + 치환 건수 반환
     ```
2. `plan-epic.md` 커맨드 정의 확장 — `advance` 서브커맨드에 내부 단계 상세:
   ```
   Step 1. 현재 상태 조회 (.plans/epics/index.md)
   Step 2. 전이 허용 여부 검증 (T-EPMV-03 로직)
   Step 3. 게이트 자동 검증 (T-EPMV-03)
   Step 4. 파일 이동 (T-EPMV-02 분기)
   Step 5. **epic-advance-rewrite.js 호출** (본 TASK)
   Step 6. index.md 갱신
   Step 7. 변경 파일 목록 + 치환 건수 보고
   ```
3. `--dry-run` 플래그 지원 — 실제 변경 없이 치환 예상 보고
4. 안전 검증: 치환 패턴이 설명/서사 텍스트의 구 경로 문자열까지 치환하지 않도록 **`/` 경계 필수** (절대 경로 패턴만)
5. 테스트 케이스: Phase A dry-run 기준 13 파일 치환 회귀 테스트 1 건

## AC

- [ ] `epic-advance-rewrite.js` 존재 + 단위 테스트 통과
- [ ] `/plan-epic advance EPIC-{ID} --to=active` 호출 시 잔존 구 경로 링크 **0 개** (grep 검증)
- [ ] `--dry-run` 플래그로 실제 변경 없이 예상 보고
- [ ] 치환 건수 + 파일 목록 출력 명확
- [ ] 서사 텍스트 내 구 경로 문자열 **치환 안 됨** (안전 회귀 테스트)
- [ ] `plan-epic.md` advance 섹션 갱신 (내부 단계 + 플래그)

## 파일

- 신규: `src/claude/plan/scripts/epic-advance-rewrite.js`
- 신규: `src/claude/plan/scripts/epic-advance-rewrite.test.js`
- 수정: `src/claude/plan/commands/plan-epic.md`

## 리스크

- **R1**: `sed -i` 기반 치환이 설명 텍스트의 구 경로 문자열까지 치환 → **완화**: `/` 경계 패턴 + 변경 파일 목록 출력 + 단위 테스트 1 건 + dry-run 플래그

## 롤백

스크립트 호출부를 advance 커맨드에서 제거 → 기존 수동 플로우로 복귀. 스크립트 파일은 보존(재활성화 용이).

## 검증 방법

```bash
# 1. 테스트 Epic 생성 + 자식 Feature 2 건 approved
# 2. advance draft→planning 실행 → dry-run 먼저
/plan-epic advance EPIC-... --to=planning --dry-run
# 3. 실제 실행
/plan-epic advance EPIC-... --to=planning
# 4. 잔존 링크 검증
grep -r "/00-draft/EPIC-..." .plans/ | wc -l  # 기대: 0
```
