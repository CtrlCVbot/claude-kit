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

#### Step 3. {EPIC_ID} advance draft → planning (IDEA ≥ 1 조건 충족 시)
- 커맨드: `/plan-epic advance {EPIC_ID} --to=planning`
- (Phase A 에서 이미 planning 진입했다면 skip)

#### Step 4. {FEATURE[1]_ID} IDEA + 스크리닝
- Step 1~2 반복 (Phase 내 모든 후속 Feature 에 대해)

#### Step 5. Draft 단계 (모든 Feature 병렬)
- 커맨드: `/plan-draft IDEA-...` × N
- 에이전트: plan-draft-writer
- Lite 판정은 PRD 단계 생략 가능

#### Step 6. PRD 단계 (Standard Feature 만)
- 커맨드: `/plan-prd DRAFT-path`
- 에이전트: plan-prd-writer + plan-reviewer (PCC 8 종, T-PCC-01)

#### Step 7. Bridge 단계
- 커맨드: `/plan-bridge {slug}`
- 에이전트: plan-bridge-writer (경량화 원칙, T-BRDG-01)

#### Step 8. {EPIC_ID} advance planning → active (Feature approved ≥ 1 조건)
- 커맨드: `/plan-epic advance {EPIC_ID} --to=active`
- 자동 검증: `plan-epic-hierarchy.md §4-2` 게이트 조건

#### Step 9. 구현 (병렬)
- 커맨드: `/dev-feature {path}` + `/dev-run {path}`
- 에이전트: dev-implementer (TeamCreate 권장 시 병렬 실행)

---

### Phase 전환 규칙

Phase {PHASE} 완료 시 세션 종료 → Phase {NEXT_PHASE} 는 **별도 세션** 에서 재개.

- **Context 50% 규칙** (golden-principles #8): 한 세션에서 Phase 2 개 이상 진행 비권장.
- 다음 세션 시작 시 `/plan-epic show {EPIC_ID}` 로 현재 상태 확인 후 재개.
- 다음 커맨드: `/plan-epic phase generate --phase={NEXT_PHASE} --features=...` (본 템플릿 재사용)
