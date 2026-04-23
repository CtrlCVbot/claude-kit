# T-TMPL-01 — Phase 로드맵 템플릿화 + `/plan-epic-phase generate`

**제안**: P-7 (TMPL)
**원본 피드백**: I-07 (Medium), N-08
**우선순위**: 🟡 P2 Medium
**릴리스**: v2.5.0
**선행**: 없음
**후행**: 없음

## 목적

Phase A 9 단계 로드맵이 `01-children-features.md` §4 에 A 전용 하드코딩. Phase B/C 는 별도 세션에서 유사 작성 반복. 템플릿 기반 자동 생성으로 시간 10 분 → 30 초.

## 수행 내용

1. `src/claude/plan/skills/plan-epic-workflow/templates/phase-roadmap.md` 신규 템플릿:

   ```markdown
   ### Phase {PHASE} ({START} ~ {END}) — {TITLE}

   **이유**: {PHASE_RATIONALE}

   - **{FEATURES_SUMMARY}**
   {#each FEATURE}
   - {FEATURE_ID}: {FEATURE_SUMMARY}
   {/each}
   - 예상 완료: **M-Epic-{M_N}**

   ---

   ### Phase {PHASE} 실행 로드맵 (9 단계)

   Phase {PHASE} 는 `/plan-idea → /plan-screen → /plan-draft → ... → /dev-run` 파이프라인을 **{FEATURES_LIST}** 에 대해 수행한다.

   #### Step 1. {FEATURE[0]_ID} IDEA 등록
   - 커맨드: `/plan-idea "{FEATURE[0]_TITLE}" --epic={EPIC_ID}`
   - 에이전트: plan-idea-collector

   #### Step 2. {FEATURE[0]_ID} 스크리닝
   - 커맨드: `/plan-screen IDEA-...`
   - 에이전트: plan-idea-screener
   - Checkpoint: Critical (사용자 Go 필수)

   #### Step 3. {EPIC_ID} advance draft → planning (IDEA ≥ 1 조건 충족)
   - 커맨드: `/plan-epic advance {EPIC_ID} --to=planning`

   #### Step 4. {FEATURE[1]_ID} IDEA + 스크리닝
   - Step 1~2 반복

   #### Step 5. Draft 단계 (모든 Feature 병렬)
   - 커맨드: `/plan-draft IDEA-... ` × N
   - 에이전트: plan-draft-writer

   #### Step 6. PRD 단계 (Standard Feature 만)
   - 커맨드: `/plan-prd DRAFT-path`
   - 에이전트: plan-prd-writer + plan-reviewer (PCC 8 종)

   #### Step 7. Bridge 단계
   - 커맨드: `/plan-bridge {slug}`
   - 에이전트: plan-bridge-writer

   #### Step 8. {EPIC_ID} advance planning → active (Feature approved ≥ 1 조건)
   - 커맨드: `/plan-epic advance {EPIC_ID} --to=active`

   #### Step 9. 구현 (병렬)
   - 커맨드: `/dev-feature {path}` + `/dev-run {path}`
   - 에이전트: dev-implementer (TeamCreate 권장)

   ---

   ### Phase 전환 규칙

   Phase {PHASE} 완료 시 세션 종료 → Phase {NEXT_PHASE} 는 **별도 세션** 에서 재개 (context 50% 규칙).
   ```

2. `/plan-epic-phase generate` 서브커맨드 구현:

   ```bash
   $ /plan-epic-phase generate --phase=B --features=F2,F4

   # 내부 단계:
   1. Epic Brief §3 에서 Feature 목록 조회 → F2, F4 메타 추출
   2. templates/phase-roadmap.md 변수 치환:
      - {PHASE}: B
      - {TITLE}: "Phase 3 피드백 구현 - 중"
      - {START}, {END}: M-Epic 기반 자동 계산
      - {FEATURES}: [F2, F4]
      - 기타 Feature 메타 주입
   3. Epic `01-children-features.md` §4 에 **안전 병합**:
      - 기존 §4 에 Phase A 로드맵 존재 → Phase B 섹션 append
      - 기존 §4 에 Phase B 존재 → 중단 + `--overwrite` 플래그 요구
   4. 변경 보고 + 다음 단계 안내
   ```

3. 안전 검증:
   - `--overwrite` 없이 기존 Phase 덮어쓰기 시도 시 **HARD FAIL**
   - 사용자 명시적 의사 확인

4. `src/claude/plan/commands/plan-epic.md` 수정:
   - `phase generate` 서브커맨드 문서화
   - 사용 예시 포함

5. `src/claude/plan/skills/plan-epic-workflow/SKILL.md` 수정:
   - "Phase 전환" 섹션에 본 서브커맨드 사용법 추가
   - 템플릿 기반 접근 명시

## AC

- [ ] `phase-roadmap.md` 템플릿 존재 (≥100 줄)
- [ ] 변수 치환 필드 ≥ 8 개 명시
- [ ] `/plan-epic-phase generate --phase=B --features=F2,F4` 실행 가능
- [ ] 생성된 §4 가 Phase A 구조와 일관
- [ ] `--overwrite` 없이 기존 Phase 덮어쓰기 차단
- [ ] Phase 전환 시간 10 분 → 30 초 단축 검증

## 파일

- 신규: `src/claude/plan/skills/plan-epic-workflow/templates/phase-roadmap.md`
- 수정: `src/claude/plan/commands/plan-epic.md` (phase generate 서브커맨드)
- 수정: `src/claude/plan/skills/plan-epic-workflow/SKILL.md`

## 리스크

- **R5**: 템플릿 치환이 기존 §4 Phase A 덮어쓸 위험 → **완화**: append-only + `--overwrite` 플래그 명시

## 롤백

`phase generate` 서브커맨드 제거 + 템플릿 파일 보존 (재활성화 용이). 수동 작성 방식으로 복귀.

## 보존 원칙

- **P-02 의존성 매트릭스 + Phase 실행 순서**: 템플릿이 매트릭스 섹션 포함 유지.
- **P-17 Phase 세션 분리 권장**: 템플릿에 "Phase 전환 규칙" 섹션 유지.
