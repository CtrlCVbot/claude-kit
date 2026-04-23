# Phase Roadmap Template (T-TMPL-01)

> **T-TMPL-01 (Phase A 피드백 Step 5, v2.5.0)**: Epic `01-children-features.md §4` 의 Phase 로드맵 자동 생성용 템플릿. Phase A 9 단계 하드코딩 대체 → Phase B/C 도 30 초 내 생성.

**변수 치환 필드** (≥8):

| 필드 | 타입 | 예시 | 설명 |
|------|------|------|------|
| `{PHASE}` | string | `B` | Phase 식별자 (A/B/C/D...) |
| `{TITLE}` | string | `피드백 구현 - 중` | Phase 제목 |
| `{START}` | date | `2026-05-07` | 시작일 |
| `{END}` | date | `2026-05-14` | 종료일 |
| `{PHASE_RATIONALE}` | text | `F1 완료 후 병렬 가능` | 선정 사유 |
| `{EPIC_ID}` | string | `EPIC-20260422-001` | 상위 Epic |
| `{FEATURES_LIST}` | string | `F2, F4` | 쉼표 구분 Feature 목록 |
| `{FEATURES_SUMMARY}` | string | `2 Feature 병렬` | 한 줄 요약 |
| `{FEATURE[N]_ID}` | string | `F2` | 개별 Feature ID (배열 인덱스) |
| `{FEATURE[N]_TITLE}` | string | `Mock 재설계` | Feature 제목 |
| `{M_N}` | integer | `2` | Milestone 번호 |
| `{NEXT_PHASE}` | string | `C` | 다음 Phase 식별자 |

---

## 생성 결과 샘플 (Phase B 예시)

````markdown
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
- 다음 커맨드: `/plan-epic-phase generate --phase={NEXT_PHASE} --features=...` (본 템플릿 재사용)

````

---

## 변수 치환 규칙

1. **필수 필드**: `{PHASE}`, `{EPIC_ID}`, `{FEATURES_LIST}` — 누락 시 HARD FAIL
2. **선택 필드**: 나머지 — 누락 시 `TBD` 로 치환
3. **배열 필드** (`{FEATURE[N]_*}`): `--features=F2,F4` 파라미터 순서대로 0-indexed 배열 전개
4. **날짜 필드** (`{START}`, `{END}`): Milestone 기반 자동 계산 가능 (Epic Brief §4 M-Epic 값 참조)
5. **한 줄 요약** (`{FEATURES_SUMMARY}`): `N Feature 병렬` 또는 `N Feature 순차` 자동 생성

---

## 안전 검증 (append-only)

템플릿 치환 결과를 `01-children-features.md §4` 에 병합할 때:

1. 기존 §4 에 동일 `### Phase {PHASE}` 헤더가 **없으면** append
2. **있으면** HARD FAIL + `--overwrite` 플래그 요구
3. `--overwrite` 지정 시 기존 Phase 섹션 백업 (`01-children-features.prev-{timestamp}.md`) 후 덮어쓰기

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | 초안 — T-TMPL-01 (Phase A 피드백 Step 5) | Claude (메인테이너 역할) |
