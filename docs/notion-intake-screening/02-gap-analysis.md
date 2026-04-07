# Notion Intake-Screening v1 — Gap Analysis Report

> claude-kit v2.1 기획 파이프라인과의 적합성 평가 및 갭 분석

---

## 1. 리뷰 요약

**결론**: 설계 문서의 핵심 방향(외부 intake → 로컬 `.plans` SSOT → 외부 미러)은 claude-kit 아키텍처와 정합한다. 단, **7개 블로킹 갭**과 **네이밍/상태머신 충돌** 해소 후 구현 가능하다. v1.0은 로컬 전용(Notion publish 이연)으로 범위를 축소할 것을 권고한다.

---

## 2. 차원별 갭 분석

### D1. 파이프라인 적합성

| GAP | 심각도 | 설명 | 권고 |
|-----|--------|------|------|
| GAP-D1-01 | **HIGH** | Bug fast-path가 IDEA+SCREENING 동시 생성 → `new→screening→screened` 상태 머신 우회. `02-idea-management.md`의 상태 전환 다이어그램 위반 | intake 항목도 `new` 상태로 `00-inbox/` 진입 후 auto-advance. `intakeMode: bug-fast` 마커로 구분 |
| GAP-D1-02 | **MEDIUM** | Cluster-path의 "인간 리뷰 체크포인트"가 기존 P2 승인 게이트와 별개로 존재 → 리뷰 분기점 2개화 | 클러스터 리뷰를 P1 후처리(post-P1)로 위치시키고, 결과물은 `00-inbox/`에 IDEA로 등록. P2 승인 게이트는 그대로 유지 |
| GAP-D1-03 | **LOW** | "P0" 명칭 없이 "intake mini-pipeline"으로 명명 → 공식 파이프라인 번호 체계(P1-P8)와 불연속 | intake를 "P0"가 아닌 **Pre-P1 레이어**로 명시. 파이프라인 번호 부여하지 않음 (기존 P1-P8 체계 보존) |

### D2. 아키텍처 정합성

| GAP | 심각도 | 설명 | 권고 |
|-----|--------|------|------|
| GAP-D2-01 | **MEDIUM** | 2개 신규 hook(`plan-notion-env-guard`, `plan-screening-dedupe-guard`)이 `NOTION_API_TOKEN` 의존 → Codex hook 호환성 기준(09-architecture.md L176-196) "외부 환경변수 의존 = 제외" 해당 | `skippedForCodex` 대상으로 등록. `.claude-kit-meta.json`에 skip 사유 기록 |
| GAP-D2-02 | **LOW** | 신규 컴포넌트 9개 추가 시 plan 도메인 합계 25→34 (+36%). 도메인 균형 변화 | 수용 가능 범위. dev(41)와 비교 시 여전히 작음 |
| GAP-D2-03 | **LOW** | `setup.js` 수정 필요 — 새 hook 등록 + Codex compat 필터 업데이트 | `scripts/codex-hook-compat.js`에 2개 hook skip 규칙 추가 |

### D3. 데이터 모델 호환성

| GAP | 심각도 | 설명 | 권고 |
|-----|--------|------|------|
| GAP-D3-01 | **RESOLVED** | Normalized snapshot 저장 위치 미정의 | row 기준 구조로 확정: `.plans/intake/rows/{sourceRowId}/`, schema는 `data-sources/{dataSourceId}/`, 실행 이력은 `runs/{runId}/` |
| GAP-D3-02 | **HIGH** | IDEA 파일에 추가될 메타 필드(`source`, `sourceRowIds`, `intakeRunId`, `intakeMode`, `publishStatus`)의 스키마 미정의 | IDEA 프론트매터 확장 스키마 문서화 (03-data-model-extension.md) |
| GAP-D3-03 | **MEDIUM** | SCREENING 파일에 추가될 필드(`sourceCount`, `reviewMode`)의 기존 SCREENING 포맷과 호환성 미검증 | 기존 SCREENING 필수 필드(RICE 4요소 + 판정)에 영향 없음 확인. 선택 필드로 추가 |
| GAP-D3-04 | **MEDIUM** | `backlog.md` 인덱스 쓰기 소유권 충돌 — `plan-idea-collector`와 `plan-intake-reader` 양쪽에서 기록 | `backlog.md` 쓰기를 공유 유틸리티로 추출하거나, intake-reader가 IDEA 파일만 생성하고 backlog.md 업데이트는 `plan-idea-collector`에 위임 |
| GAP-D3-05 | **LOW** | `screening-matrix.md` 인덱스에 intake 출처 표시 컬럼 부재 | `Source` 컬럼 추가 (값: `manual` | `intake-bug` | `intake-cluster`) |

### D4. 검증 체인 연결

| GAP | 심각도 | 설명 | 권고 |
|-----|--------|------|------|
| GAP-D4-01 | **HIGH** | PCC-01 #1 "전수 스크리닝" — intake로 생성된 IDEA가 `00-inbox/` 대신 직접 `10-screening/`에 배치되면 PCC-01 검증 논리 위반 | GAP-D1-01 권고에 따라 `00-inbox/` 경유 필수화 → PCC-01 기존 로직 유지 가능 |
| GAP-D4-02 | **MEDIUM** | Intake 출처 IDEA의 추적성(provenance) 검증 항목 부재 | PCC-01에 2항목 확장: (a) `intakeMode` 마커가 있는 IDEA는 `sourceRowIds` 필수, (b) intake 클러스터 IDEA는 `sourceCount >= 2` |
| GAP-D4-03 | **LOW** | 클러스터 병합 결과의 일관성 검증 체계 부재 (merge/split 이력 추적) | v1에서는 클러스터 리뷰 결정을 `.plans/intake/clusters/{runId}/review-decision.md`에 기록. 별도 PCC는 v2에서 검토 |

### D5. 컴포넌트 네이밍

| GAP | 심각도 | 설명 | 권고 |
|-----|--------|------|------|
| GAP-D5-01 | **MEDIUM** | 벤더명 "notion" 포함 (`plan-notion-intake-reader`, `plan-notion-env-guard`, `plan-notion-intake-workflow`) → 기존 에이전트는 역할 기반 이름 (collector, screener, writer, designer) | 벤더 중립화: `plan-intake-reader`, `plan-intake-env-guard`, `plan-intake-workflow`. Notion 특화 설정은 환경변수/config에서 처리 |
| GAP-D5-02 | **LOW** | `/plan-intake-review` 커맨드명이 기존 `/plan-review`(품질 리뷰)와 혼동 가능 | `/plan-intake-cluster-review`로 명확화하거나, 도움말 설명에서 구분 강조 |

### D6. 범위 리스크

| GAP | 심각도 | 설명 | 완화 전략 |
|-----|--------|------|----------|
| GAP-D6-01 | **RESOLVED** | Notion 속성명 팀별 변동성 — `productArea`, `screen`, `feature` 등이 팀마다 다를 수 있음 | schema discovery + property mapping 분리로 완화. 매핑 누락 시 run-level 실패 또는 warning으로 구분 |
| GAP-D6-02 | **HIGH** | 클러스터 과잉 병합(over-grouping) — 4개 키 중 3개 일치 기준이 너무 관대할 수 있음 | v1에서 자동 병합 금지. 클러스터 후보만 제시하고 인간 리뷰에서 최종 결정. merge 기준을 config로 조정 가능하게 |
| GAP-D6-03 | **RESOLVED** | Dedupe 안정성 | v1은 strict `sourceRowId` 단일 인덱스 정책으로 잠금. `updatedAt`/hash 비교는 후속 버전 검토 |
| GAP-D6-04 | **MEDIUM** | Screening DB가 우발적 SSOT화 — 팀이 Notion에서 직접 수정하기 시작하면 로컬과 불일치 | v1.0에서 Screening DB publish 자체를 이연. 로컬 전용으로 시작하여 SSOT 원칙 고수 |
| GAP-D6-05 | **MEDIUM** | 클러스터 리뷰 UX 복잡성 — merge/split/discard/rewrite 4개 액션 vs 기존 approve/hold/reject 3개 | v1에서는 merge/discard만 지원. split/rewrite는 v1.1 |
| GAP-D6-06 | **LOW** | Bug fast-path auto-route 오분류 시 change-request가 리뷰 없이 통과 | classify 단계에 confidence score 도입. threshold(예: 0.8) 미만 시 수동 분류 폴백 |
| GAP-D6-07 | **LOW** | 대량 intake 시 backlog.md 크기 폭증 | intake 배치당 최대 건수 제한 (config, 기본값 50). 초과 시 다음 배치로 분할 |

### D7. 구현 준비도

| GAP | 심각도 | 블로킹 | 설명 |
|-----|--------|:------:|------|
| GAP-D7-01 | **RESOLVED** | N | `Source Column Catalog + propertyMapping` 2단계 구조로 해소 |
| GAP-D7-02 | **RESOLVED** | N | row 기준 폴더 구조로 확정 |
| GAP-D7-03 | **HIGH** | **Y** | IDEA/SCREENING 프론트매터 확장 스키마 미정의 |
| GAP-D7-04 | **HIGH** | **Y** | 클러스터 fingerprint 알고리즘 미정의 |
| GAP-D7-05 | **MEDIUM** | **Y** | `backlog.md` 쓰기 소유권 정책 미결정 |
| GAP-D7-06 | **MEDIUM** | **Y** | PCC-01 확장 vs PCC-00 신설 결정 미완 |
| GAP-D7-07 | **MEDIUM** | **Y** | Hook 구현 계약 (이벤트 타입, matcher, 에러 처리) 미정의 |

### D8. 팀 오케스트레이션 정합성

| GAP | 심각도 | 설명 | 권고 |
|-----|--------|------|------|
| GAP-D8-01 | **LOW** | 3개 신규 에이전트가 기존 6개 plan 에이전트와 별도 세션에서 실행 → 세션 간 컨텍스트 단절 | normalized snapshot + cluster candidate가 파일 기반 핸드오프 역할. team-orchestration 문서의 "핸드오프 번들 7항목" 기준 충족 확인 필요 |
| GAP-D8-02 | **LOW** | Planning Studio가 intake 소유권도 갖게 되면 역할 과부하 가능 | intake를 Planning Studio 내부의 "sub-responsibility"로 위치시키되, 에이전트 수 제한(C1: 3+1)은 세션별 적용이므로 위반 없음 |

---

## 3. 컴포넌트 최종 판정 매트릭스

| 컴포넌트 | 유형 | 판정 | 블로킹 갭 | 비고 |
|----------|------|------|----------|------|
| `plan-intake-workflow` | skill | **Adopt** | - | 정책 우선 접근. 구현 1순위 |
| `/plan-intake-review` | command | **Adopt** | - | 인간 체크포인트 필수. `/plan-intake-cluster-review`로 개명 권고 |
| `plan-intake-reader` | agent | **Modify** | D7-01, D7-03 | `plan-notion-intake-reader` → `plan-intake-reader`. 속성 매핑 스키마 필요 |
| `plan-change-clusterer` | agent | **Modify** | D7-04 | fingerprint/merge 기준 구체화. v1에서는 merge/discard만 |
| `/plan-intake-sync` | command | **Modify** | D7-02 | 서브 단계(fetch→normalize→classify→route) 문서화 |
| `plan-intake-env-guard` | hook | **Modify** | D7-07 | `plan-notion-env-guard` → `plan-intake-env-guard`. Codex skip 대상 |
| `plan-screening-publisher` | agent | **Defer v1.1** | D6-04 | Screening DB publish 이연 |
| `/plan-screen-sync` | command | **Defer v1.1** | D6-04 | publisher 의존 |
| `plan-screening-dedupe-guard` | hook | **Defer v1.1** | D7-04 | fingerprint 알고리즘 확정 후 |

---

## 4. PCC 확장 제안

### PCC-01 확장 (기존 4항목 → 6항목)

PCC-00 신설 대신 PCC-01에 intake 출처 검증을 추가한다. 이유: intake 결과물은 결국 IDEA↔SCREENING 일관성의 일부이며, 별도 PCC로 분리하면 검증 실행 시점이 달라져 관리 복잡성 증가.

| # | 검증 항목 | 심각도 | 설명 |
|---|----------|--------|------|
| 5 | Intake 출처 유효성 | ERROR | `intakeMode` 마커가 있는 IDEA는 `sourceRowIds` 필드 필수. 빈 배열 불가 |
| 6 | Intake 클러스터 최소 건수 | WARN | `intakeMode: cluster`인 IDEA는 `sourceCount >= 2`. 단건 클러스터는 경고 |

---

## 5. 리스크 레지스터

| # | 리스크 | 영향 | 발생 확률 | 완화 전략 | 소유 |
|---|--------|------|----------|----------|------|
| R1 | Notion 속성명 변동으로 normalize 실패 | HIGH | MEDIUM | 매핑 테이블 외부화 + WARN 폴백 | Planning Studio |
| R2 | 클러스터 과잉 병합으로 이질적 요청 합체 | HIGH | MEDIUM | 자동 병합 금지, 인간 리뷰 필수 | Planning Studio |
| R3 | Screening DB SSOT화로 로컬과 불일치 | HIGH | LOW | v1.0 publish 이연 | Assurance Desk |
| R4 | Bug 오분류 → 리뷰 없이 통과 | MEDIUM | LOW | confidence threshold + 수동 폴백 | Planning Studio |
| R5 | backlog.md 동시 쓰기 충돌 | MEDIUM | MEDIUM | 단일 소유권 정책 확립 | Planning Studio |
| R6 | 대량 intake로 backlog 크기 폭증 | LOW | MEDIUM | 배치 건수 제한 (기본 50건) | Planning Studio |
| R7 | 클러스터 리뷰 UX 복잡성으로 사용자 이탈 | MEDIUM | LOW | v1 액션 2개 제한 (merge/discard) | Planning Studio |

---

## 6. 종합 권고

### 즉시 조치 (구현 전 필수)

1. **GAP-D3-02**: IDEA 메타 확장 스키마 확정 → `03-data-model-extension.md`
2. **GAP-D1-01**: 상태 머신 보존 결정 — intake 항목은 `new` + `intakeMode` 마커로 `00-inbox/` 경유
3. **GAP-D5-01**: 컴포넌트 네이밍 벤더 중립화

### 범위 축소 권고

4. **v1.0은 로컬 전용**: Screening DB publish (publisher agent, `/plan-screen-sync`, dedupe-guard) 3개 컴포넌트를 v1.1로 이연 → 구현 범위 ~40% 축소
5. **클러스터 리뷰 액션 제한**: merge/split/discard/rewrite → v1에서는 merge/discard만

### 기존 가이드 업데이트 대상

| 문서 | 업데이트 내용 |
|------|-------------|
| `01-planning-pipeline.md` | Pre-P1 intake 레이어 추가 설명, 파이프라인 다이어그램 확장 |
| `02-idea-management.md` | IDEA 프론트매터 확장 필드, `intakeMode` 마커, 상태 전환 다이어그램 업데이트 |
| `03-screening.md` | screening-matrix.md `Source` 컬럼 추가 |
| `07-review-pcc.md` | PCC-01 #5, #6 항목 추가 |
| `09-architecture.md` | 컴포넌트 카탈로그 + `.plans/` 폴더 구조에 `intake/` 추가 |
