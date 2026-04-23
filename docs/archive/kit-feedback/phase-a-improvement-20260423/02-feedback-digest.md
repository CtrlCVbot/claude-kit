# 02. Feedback Digest — 피드백 18 건 요약 + 재분류

> **목적**: `phase-a-dry-run-20260423/04-improvement-proposals.md` 18 건을 **본 개선 패키지 관점**에서 P0/P1/P2 재분류. 원본 우선순위(Critical/High/Medium/Low)를 존중하되, **구현 순서·통합 실익**을 고려하여 2 건 승격 조정.

**참조**: 원본 피드백은 [`04-improvement-proposals.md`](../phase-a-dry-run-20260423/04-improvement-proposals.md). 여기서는 요약 + 재분류 근거만 기록 (golden #13 중복 금지).

---

## 1. P0 — Critical (v2.4.1 블로커)

### P0-1. I-01 Epic 전이 자동 링크 갱신 → [T-EPMV-01]

- **문제**: `draft → planning → active` 전이 시 13 파일 링크 수동 갱신
- **제안 요지**: `/plan-epic advance` 커맨드에 `sed` 기반 안전 치환 통합
- **빈도**: Epic 생명주기당 3~4 회
- **수용 근거**: 수동 부담 최대 지점. 본 패키지의 **대표 Critical**.

### P0-2. I-08 git mv/mv 자동 분기 → [T-EPMV-02]

- **원본 분류**: Medium
- **승격**: **P0** (EPMV AREA 통합)
- **승격 근거**: T-EPMV-01 구현 시 파일 이동 로직이 선행 필요. 분리 구현은 2 회 방문(T-EPMV-01 수정 재발) 유발. `/plan-epic advance` 한 커맨드 내 일괄 처리 실익 큼.
- **제안 요지**: `git ls-files` tracked 확인 후 `git mv` vs `mv` 자동 선택 + rule 문서화

### P0-3. I-06 advance 게이트 자동 검증 → [T-EPMV-03]

- **원본 분류**: Medium
- **승격**: **P0** (EPMV AREA 통합)
- **승격 근거**: advance 는 "파일 이동 + 링크 재작성 + 게이트 검증" 이 논리적으로 한 트랜잭션. 게이트 없이 실행하면 상태 롤백 비용 큼. T-EPMV-01 과 통합 시 "HARD FAIL → 안전 종료 → 롤백 없음" 보장.
- **제안 요지**: 자식 Feature approved ≥ 1 조건 자동 확인 + `--force` 플래그로 덮어쓰기

---

## 2. P1 — High (v2.4.1 목표)

### P1-1. I-02 Feature 상태 SSOT 자동 동기 → [T-FSTATE-01]

- **문제**: IDEA frontmatter · backlog · Children §1 · binding §7 4 곳 수동 동기
- **제안 요지**: IDEA frontmatter 를 SSOT 지정 + `plan-state-sync.js` hook 으로 나머지 3 곳 자동 갱신
- **빈도**: 상태 전이마다 (IDEA 당 4~5 회)

### P1-2. I-14 Feature 상태 머신 SSOT 문서 → [T-FSTATE-02]

- **원본 분류**: Medium
- **승격**: **P1** (T-FSTATE-01 선행 요구)
- **승격 근거**: I-02 구현 시 "IDEA 상태 `approved` → Feature 상태 `approved` 자동 동기" 로직의 트리거 규칙이 문서화되어 있어야 함. 문서 없이 hook 구현 시 암묵적 규칙 → 추후 재해석 리스크.
- **제안 요지**: `plan-epic-hierarchy.md` 에 IDEA 상태(4 종) vs Feature 상태(4 종) + 교차 전이 트리거 섹션 추가

### P1-3. I-03 파일 소유권 매트릭스 → [T-RACE-01]

- **문제**: 병렬 에이전트 호출 시 Epic 공통 파일 편집 race
- **제안 요지**: `agent-file-ownership.md` rule 신설 (1 차 작성 / 후속 갱신 / 메인 전담 3 구분)
- **빈도**: 다중 Feature 동시 진행마다

### P1-4. I-04 Read 캐시 자동 재인증 → [T-RACE-02]

- **문제**: 에이전트 파일 수정 후 메인 Edit 시 "File has not been read yet" 에러
- **제안 요지**: `agent-completion-cache-invalidate` hook 개선 — 수정 파일 목록 구조화 기록 → Edit 선행 자동 Read
- **빈도**: write-capable 에이전트 호출 직후마다

### P1-5. I-05 RICE Lane 가중 규칙 SSOT → [T-RICE-01]

- **문제**: Lane 가중 조정 규칙이 에이전트 내부 판단, SSOT 없음
- **제안 요지**: `rice-lane-weighted-adjustment.md` rule 신설 + `plan-idea-screener` 참조
- **빈도**: 스크리닝마다 (Lite 는 항상 raw 점수 낮음)

---

## 3. P2 — Medium (v2.5.0 목표)

### P2-1. I-11 Bridge 5 파일 경량화 → [T-BRDG-01]

- **문제**: `00-context/01-04` + `08-epic-binding.md` 5 파일 정보 중복 (golden #13 위반)
- **제안 요지 (Option A 권장)**: 각 파일에서 "링크 + 1~2 문장 요약" 원칙 적용
- **예상 효과**: Feature Package 총 라인 수 40~50% 감소

### P2-2. I-09 Writer 에이전트 출력 표준 → [T-BRDG-02]

- **문제**: idea-collector · draft-writer · prd-writer · bridge-writer 각자 다른 보고 형식
- **제안 요지**: IMP-AGENT-002(reviewer 표준화) 를 writer 계로 확장 — IMP-AGENT-012 명명 후속
- **카테고리**: BRDG AREA 에 포함 (Bridge 관련 표준화 확장)

### P2-3. I-10 PCC 항목 확장 → [T-PCC-01]

- **문제**: PCC 5 종 이 flat 구조 기준, Epic 계층 미검증
- **제안 요지**: PCC-07(Epic binding 양방향) + PCC-08(상태 SSOT) + PCC-09(의존성 매트릭스 현재성) 추가
- **선행 의존**: T-FSTATE-01 (상태 SSOT 구현) + T-FSTATE-02 (상태 머신 문서)

### P2-4. I-07 Phase 로드맵 템플릿화 → [T-TMPL-01]

- **문제**: Phase A 9 단계 로드맵이 A 전용 하드코딩
- **제안 요지**: `/plan-epic-phase generate --phase=B` 서브커맨드 + `phase-roadmap.md` 템플릿
- **난이도**: High (템플릿 엔진 + 변수 치환 + 안전 병합)

### P2-5. I-13 plan-epic show 실사용성 → [T-SHOW-01]

- **문제**: `/plan-epic show` 정의되어 있으나 본 세션 0 회 사용
- **제안 요지**: Phase 진행률 + 자식 Feature 상태 + 다음 Checkpoint 집약 출력

### P2-6. I-12 수정 요청 프로토콜 → [T-REVP-01]

- **문제**: "Y/수정/N" 선택 시 "수정" 세부 전달 형식 없음
- **제안 요지**: Checkpoint 표준 응답 형식 + `/plan-revise` 서브커맨드 (선택)

---

## 4. P3 — Low (Backlog)

### P3-1. I-17 Phase 진행률 가시화 → [T-SHOW-02]

- **원본 분류**: Low
- **조정**: SHOW AREA 편입 (구현 지점 동일: `/plan-epic show` 출력 + 에이전트 보고 말미)
- **제안 요지**: 에이전트 보고 말미 "Phase {N} Step {X}/{Y}" 자동 표시 + TodoWrite 동기

### P3-2. I-18 변경 이력 자동 append → [T-BKLG-01]

- **문제**: 모든 문서 변경 이력 수동 append 의존
- **제안 요지**: `post-edit` hook + edit 요약 수집 UX
- **난이도**: High (UX 합의 필요)
- **활성화 조건**: edit 요약 수집 UX 합의 후

### P3-3. I-16 dry-run 모드 → [T-BKLG-02]

- **문제**: 신규 사용자 학습 / 실험 경로 없음
- **제안 요지**: 주요 커맨드에 `--dry-run` 플래그
- **활성화 조건**: 신규 사용자 온보딩 필요 시점

### P3-4. I-15 TASK 힌트 역방향 동기 → [T-BKLG-03]

- **문제**: Bridge 단계 PR 분할이 실제 구현 시 stale
- **제안 요지**: `/dev-feature` 또는 `/dev-run` 실행 시 실제 TASK 구조를 `04-implementation-hints.md` 로 역기록
- **활성화 조건**: Step 9 dev-feature 실사용 경험 축적 후

---

## 5. 조정 사항 요약

| 항목 | 원본 분류 | 본 패키지 분류 | 조정 사유 |
|------|:---:|:---:|----------|
| I-06 advance 게이트 검증 | Medium | **P0** | EPMV AREA 통합 실익 |
| I-08 git mv fallback | Medium | **P0** | EPMV AREA 통합 실익 |
| I-14 Feature 상태 머신 | Medium | **P1** | T-FSTATE-01 선행 필수 |
| I-17 진행률 가시화 | Low | P3 (SHOW AREA) | 구현 지점 동일 |

**조정 유지**: 나머지 14 건은 원본 분류 그대로.

---

## 6. Pain-point 대응 완성도

`03-pain-points.md` N-01~N-18 대응:

| N | 대응 TASK | 상태 |
|:-:|----------|:---:|
| N-01 | T-EPMV-01 | ✓ |
| N-02 | T-RACE-01 | ✓ |
| N-03 | T-RACE-02 | ✓ |
| N-04 | T-FSTATE-01 + T-FSTATE-02 | ✓ |
| N-05 | T-RICE-01 | ✓ |
| N-06 | T-BRDG-01 | ✓ |
| N-07 | T-EPMV-03 | ✓ |
| N-08 | T-TMPL-01 | ✓ |
| N-09 | T-EPMV-02 | ✓ |
| N-10 | T-BRDG-02 | ✓ |
| N-11 | T-REVP-01 | ✓ |
| N-12 | T-SHOW-01 | ✓ |
| N-13 | T-FSTATE-02 | ✓ |
| N-14 | T-PCC-01 | ✓ |
| N-15 | T-BKLG-03 | ✓ |
| N-16 | T-BKLG-02 | ✓ |
| N-17 | T-SHOW-02 | ✓ |
| N-18 | T-BKLG-01 | ✓ |

**완성도**: 18/18 (100%)

---

## 7. Positive Findings 보존 원칙

`02-positive-findings.md` P-01~P-18 의 특성은 **의도적으로 보존**. 본 개선이 이들을 훼손하지 않도록 각 TASK 의 "보존 원칙" 섹션에 명시:

| P | 보존 대상 | 관련 TASK |
|:-:|----------|----------|
| P-01 | Epic Activation 기준 (3 중 하나 이상) | T-EPMV-03 게이트 검증 통합 시 유지 |
| P-02 | 의존성 매트릭스 + Phase 실행 순서 | T-TMPL-01 템플릿이 매트릭스 섹션 생성 유지 |
| P-03 | 3 중 판정 (Lane/시나리오/Feature 유형) | 영향 없음 (draft-writer 유지) |
| P-04 | Routing Metadata | 영향 없음 |
| P-05 | Bridge 5 파일 패키지 | T-BRDG-01 경량화 하되 5 파일 구조 유지 |
| P-06 | PCC 5 종 품질 보장 | T-PCC-01 은 확장만 (기존 5 종 유지) |
| P-07 | Read-only 에이전트 분리 | T-RACE-01 소유권 매트릭스가 이 분리 전제 |
| P-08 | Checkpoint 정책 | T-REVP-01 는 Checkpoint 확장 (기존 타입 유지) |
| P-09 | Epic 성공 지표 정량성 | 영향 없음 |
| P-10 | IDEA 생애주기 일관성 | T-FSTATE-01 이 오히려 강화 |
| P-11 | backlog.md 인덱스 | T-FSTATE-01 이 자동 갱신으로 강화 |
| P-12 | Feature Slug 일관성 | 영향 없음 |
| P-13 | TeamCreate 구상 | 영향 없음 |
| P-14 | IMP-AGENT-010 Epic 자동 바인딩 | T-FSTATE-01 이 확장 |
| P-15 | Tailwind 4 같은 조기 발견 | draft-writer 개선 권장 (상세 매트릭스에만 기록) |
| P-16 | Epic 상태 머신 명확성 | T-EPMV-02 fallback 문서화가 보강 |
| P-17 | Phase 세션 분리 권장 | T-TMPL-01 템플릿화 후에도 유지 |
| P-18 | Cross-reference 링크 밀도 | T-BRDG-01 경량화는 "링크 + 요약" 원칙으로 오히려 강화 |

---

## 8. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | 초안 — 18 건 P0/P1/P2/P3 재분류, 3 건 승격 조정, 완성도 18/18 |
