# Phase Roadmap 템플릿 — 사용법 문서

> **T-TMPL-01 (v2.5.0)**: Epic `01-children-features.md §4` 의 Phase 로드맵을 자동 생성한다. Phase A 9 단계 하드코딩을 대체 — Phase B / C 도 30 초 내 생성.

**순수 템플릿 본문**: [`phase-roadmap.template.md`](./phase-roadmap.template.md) (변수 치환 대상)
**소비 커맨드**: `/plan-epic phase generate --phase=B --features=F2,F4`
**상위 스킬**: [`../SKILL.md`](../SKILL.md)
**거버넌스**: [`template-governance.md §3-2`](../../../../core/rules/template-governance.md)

---

## 1. 변수 치환 필드 (≥ 8)

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

## 2. 템플릿 본문 위치

순수 본문은 **[`phase-roadmap.template.md`](./phase-roadmap.template.md)** 에 있다. `/plan-epic phase generate` 구현이 해당 파일을 로드하여 변수 치환 수행.

---

## 3. 변수 치환 규칙

1. **필수 필드**: `{PHASE}`, `{EPIC_ID}`, `{FEATURES_LIST}` — 누락 시 HARD FAIL
2. **선택 필드**: 나머지 — 누락 시 `TBD` 로 치환
3. **배열 필드** (`{FEATURE[N]_*}`): `--features=F2,F4` 파라미터 순서대로 0-indexed 배열 전개
4. **날짜 필드** (`{START}`, `{END}`): Milestone 기반 자동 계산 가능 (Epic Brief §4 M-Epic 값 참조)
5. **한 줄 요약** (`{FEATURES_SUMMARY}`): `N Feature 병렬` 또는 `N Feature 순차` 자동 생성
6. **Handlebars-like 반복문** (`{#each FEATURE} ... {/each}`): pre-processor 가 FEATURE 배열을 순회하며 블록을 반복

---

## 4. 안전 검증 (append-only)

템플릿 치환 결과를 `01-children-features.md §4` 에 병합할 때:

1. 기존 §4 에 동일 `### Phase {PHASE}` 헤더가 **없으면** append
2. **있으면** HARD FAIL + `--overwrite` 플래그 요구
3. `--overwrite` 지정 시 기존 Phase 섹션 백업 (`01-children-features.prev-{timestamp}.md`) 후 덮어쓰기

---

## 5. 관련 자산

- **스킬**: [`../SKILL.md §Phase 로드맵 자동 생성`](../SKILL.md)
- **커맨드**: `/plan-epic phase generate`
- **거버넌스**: [`src/claude/core/rules/template-governance.md`](../../../../core/rules/template-governance.md) §3-2 네이밍
- **관련 rule**: [`plan-epic-hierarchy.md`](../../../rules/plan-epic-hierarchy.md)

---

## 6. 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — T-TMPL-01 (Phase A 피드백 Step 5, v2.5.0) | Claude (메인테이너 역할) |
| 2026-04-23 | T-TMPL-05 — 템플릿 본문을 `phase-roadmap.template.md` 로 분리. 본 파일은 사용법 문서로 재구성. | Claude (메인테이너 역할) |
