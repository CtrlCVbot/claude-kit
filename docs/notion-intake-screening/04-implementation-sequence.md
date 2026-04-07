# Implementation Sequence — Intake Pipeline v1

> 4-Phase 구현 로드맵. 정책 고정 → 로컬 intake → 클러스터 → publish(v1.1)

---

## 전제 조건

이 로드맵은 다음 결정이 확정된 상태에서 시작한다:

- [x] 상태 머신 보존: intake 항목은 `new` + `intakeMode` 마커로 `00-inbox/` 경유 (GAP-D1-01)
- [x] 컴포넌트 네이밍 벤더 중립화 (GAP-D5-01)
- [x] `.plans/intake/` 폴더 구조 확정 (03-data-model-extension.md)
- [x] PCC-01 확장 방식 확정 (02-gap-analysis.md §4)
- [x] v1.0 로컬 전용 (Screening DB publish 이연)

---

## Phase 1: 정책 고정

**목표**: 코드 작성 전에 intake 파이프라인의 정책과 계약을 문서/스킬로 고정한다.

| # | 작업 | 산출물 | 유형 |
|---|------|--------|------|
| 1.1 | `plan-intake-workflow` 스킬 작성 | `src/plan/skills/plan-intake-workflow/SKILL.md` | skill |
| 1.2 | intake config.json 기본 템플릿 | `src/templates/intake-config.json` | template |
| 1.3 | IDEA 프론트매터 확장 가이드 반영 | `docs/guide/02-idea-management.md` 업데이트 | docs |
| 1.4 | PCC-01 #5, #6 항목 추가 | `docs/guide/07-review-pcc.md` 업데이트 | docs |

**완료 기준**:
- `plan-intake-workflow` 스킬이 정책 규칙을 명시 (상태 머신, 분류 기준, 리뷰 요건)
- config.json 템플릿이 속성 매핑 구조를 포함
- PCC-01 확장 2항목이 문서화됨

**의존성**: 없음 (최초 단계)

---

## Phase 2: 로컬 Intake (Bug Fast-Path)

**목표**: `fetch -> schema discovery -> index load -> candidate fetch -> skip -> normalize` 흐름을 구현하고, 가장 단순한 경로(bug fast-path)를 먼저 완성하여 end-to-end 동작을 검증한다.

| # | 작업 | 산출물 | 유형 |
|---|------|--------|------|
| 2.1 | `plan-intake-reader` 에이전트 작성 | `src/plan/agents/plan-intake-reader.md` | agent |
| 2.2 | `/plan-intake-sync` 커맨드 작성 (schema discovery + fetch + normalize + classify 서브 단계) | `src/plan/commands/plan-intake-sync.md` | command |
| 2.3 | `plan-intake-env-guard` hook 작성 | `src/plan/hooks/plan-intake-env-guard.js` | hook |
| 2.4 | `.plans/intake/` 폴더 자동 생성 로직 (setup.js 확장 또는 에이전트 내) | `scripts/setup.js` 수정 | script |
| 2.5 | Codex hook skip 규칙 추가 | `scripts/codex-hook-compat.js` 수정 | script |
| 2.6 | Bug fast-path 통합 테스트 | 테스트 시나리오 문서 | test |

**완료 기준**:
- `/plan-intake-sync` 실행 시 data source schema manifest와 column catalog가 생성됨
- row index(`row-index.json`)가 생성됨
- 기존 `sourceRowId`가 index 또는 row 폴더에 있으면 skip 동작이 확인됨
- 새 row는 `.plans/intake/rows/{sourceRowId}/` 아래에 저장됨
- `property_item` 보강 호출이 필요한 필드 정책이 문서화됨
- Bug 타입은 자동으로 `.plans/ideas/00-inbox/`에 IDEA 파일 생성 (status: `new`, intakeMode: `bug-fast`)
- `backlog.md`가 정상 갱신됨 (`/plan-idea list --refresh` 경유)
- `plan-intake-env-guard`가 `NOTION_API_TOKEN` 미설정 시 차단
- `.plans/intake/runs/{runId}/manifest.md`에 실행 이력 기록

**의존성**: Phase 1 완료

---

## Phase 3: 클러스터 경로

**목표**: Change-request 타입의 클러스터링 + 인간 리뷰 체크포인트를 구현한다.

| # | 작업 | 산출물 | 유형 |
|---|------|--------|------|
| 3.1 | `plan-change-clusterer` 에이전트 작성 | `src/plan/agents/plan-change-clusterer.md` | agent |
| 3.2 | `/plan-intake-cluster-review` 커맨드 작성 | `src/plan/commands/plan-intake-cluster-review.md` | command |
| 3.3 | 클러스터 fingerprint 로직 구현 (에이전트 내) | plan-change-clusterer 내부 | agent |
| 3.4 | 클러스터 리뷰 → IDEA 생성 파이프라인 | plan-intake-reader + plan-idea-collector 연동 | integration |
| 3.5 | 클러스터 경로 통합 테스트 | 테스트 시나리오 문서 | test |

**완료 기준**:
- Change-request 스냅샷이 `.plans/intake/clusters/{runId}/candidates.md`에 후보 생성
- `/plan-intake-cluster-review` 실행 시 merge/discard 결정 인터페이스 제공
- merge 결정 시 `review-decision.md` 기록 + IDEA 파일 생성 (intakeMode: `cluster`)
- PCC-01 #5, #6 검증 통과

**의존성**: Phase 2 완료 (fetch/normalize/classify 인프라 공유)

---

## Phase 4: Screening DB Publish (v1.1 — 이연)

**목표**: 로컬 intake 결과를 Notion Screening DB에 미러링한다.

| # | 작업 | 산출물 | 유형 |
|---|------|--------|------|
| 4.1 | `plan-screening-publisher` 에이전트 작성 | `src/plan/agents/plan-screening-publisher.md` | agent |
| 4.2 | `/plan-screen-sync` 커맨드 작성 | `src/plan/commands/plan-screen-sync.md` | command |
| 4.3 | `plan-screening-dedupe-guard` hook 작성 | `src/plan/hooks/plan-screening-dedupe-guard.js` | hook |
| 4.4 | Dedupe fingerprint 알고리즘 확정 | config.json 확장 | config |
| 4.5 | Publish 통합 테스트 | 테스트 시나리오 문서 | test |

**완료 기준**:
- screened 상태 IDEA가 Notion Screening DB에 one-way publish
- 중복 발행 방지 (dedupe-guard)
- `publishStatus` 필드 업데이트 (`unpublished` → `published`)
- 역방향 sync 없음 (one-way 원칙 유지)

**의존성**: Phase 3 완료 + Screening DB 스키마 확정

---

## 기존 가이드 문서 업데이트 매트릭스

각 Phase 완료 시점에 해당 가이드 문서를 업데이트한다.

| 문서 | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------|:-------:|:-------:|:-------:|:-------:|
| `01-planning-pipeline.md` | Pre-P1 설명 추가 | 파이프라인 다이어그램 확장 | - | - |
| `02-idea-management.md` | 확장 필드 문서화 | intakeMode 상태 전환 | cluster 경로 | - |
| `03-screening.md` | - | Source 컬럼 | - | publish 상태 |
| `07-review-pcc.md` | PCC-01 #5, #6 | - | - | - |
| `09-architecture.md` | intake/ 폴더 구조 | 컴포넌트 카탈로그 +3 | 컴포넌트 카탈로그 +2 | 컴포넌트 카탈로그 +3 |
| `10-glossary.md` | intake 용어 추가 | - | cluster 용어 | publish 용어 |

---

## 컴포넌트 최종 목록 (Phase별)

| Phase | 컴포넌트 | 유형 | 모델 |
|:-----:|----------|------|------|
| 1 | `plan-intake-workflow` | skill | - |
| 2 | `plan-intake-reader` | agent | sonnet |
| 2 | `/plan-intake-sync` | command | - |
| 2 | `plan-intake-env-guard` | hook | - |
| 3 | `plan-change-clusterer` | agent | sonnet |
| 3 | `/plan-intake-cluster-review` | command | - |
| 4 | `plan-screening-publisher` | agent | sonnet |
| 4 | `/plan-screen-sync` | command | - |
| 4 | `plan-screening-dedupe-guard` | hook | - |

**합계**: v1.0 = 6개 (Phase 1-3), v1.1 = +3개 (Phase 4)
