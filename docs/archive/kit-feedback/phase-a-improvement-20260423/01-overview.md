# 01. Overview — 수용 범위 · AC · 리스크

> **결론**: Phase A Dry-Run 피드백 18 건을 10 AREA 18 TASK 로 분해. v2.4.1(긴급) 8 TASK · v2.5.0(중기) 7 TASK · Backlog 3 TASK 로 배치. Breaking Change 없음(v2.4.1) + minor 가능성(v2.5.0 Bridge 경량화). 수용 기준 8 건 달성 시 Phase A 재실행 마찰점 90% 감소 예상.

---

## 1. 패러다임 전환 요약

**이전 상태 (v2.4.0-beta.1, 2026-04-22 기준)**:
- Epic/Feature/Task 3 단 계층 **도입 완료** (Opt-in)
- plan-epic-workflow skill + command + rule + hook(disable) 구성
- `plan-epic-integrity.js` Phase 3 enable 예정 (cross-reference 검증)

**피드백 발견 (Phase A 1 일 실사용)**:
- 계층 구조 자체는 작동 (10 이슈 → 5 Feature 그룹화 성공)
- **수동 부담이 큼**: Epic advance 13 파일 링크 갱신 · 4 곳 상태 동기 · 에이전트 편집 race · Lane 가중 규칙 암묵
- **SSOT 미비**: RICE Lane 가중, Feature 상태, 파일 소유권

**개선 방향**:
1. **자동화 격차 해소**: advance · 상태 동기 · Read 캐시 재인증을 hook/script 화
2. **SSOT 보강**: RICE 가중 룰 · 파일 소유권 · Feature 상태 머신 문서화
3. **품질 검증 확장**: PCC 항목 5 → 8 (Epic 계층 특유 검증 추가)

---

## 2. 수용 범위 (In-Scope)

| 영역 | v2.4.1 | v2.5.0 | Backlog |
|------|:---:|:---:|:---:|
| **EPMV** Epic advance 자동화 | ✓ | | |
| **FSTATE** Feature 상태 SSOT | ✓ | | |
| **RACE** 에이전트 충돌 방지 | ✓ | | |
| **RICE** Lane 가중 규칙 | ✓ | | |
| **BRDG** Bridge 5 파일 경량화 | | ✓ | |
| **PCC** plan-reviewer PCC 확장 | | ✓ | |
| **TMPL** Phase 로드맵 템플릿 | | ✓ | |
| **SHOW** plan-epic show 실사용 | | ✓ | |
| **REVP** 수정 요청 프로토콜 | | ✓ | |
| **BKLG** 역방향 동기 · dry-run · 이력 | | | ✓ |

### 2-1. Out-of-Scope (본 패키지에서 제외)

- Step 9 (`/dev-feature` + `/dev-run` 실제 구현) 피드백 — 미실행 단계로 근거 부재
- `copy` 도메인 피드백 — Phase A F1/F5 모두 dev Feature 로 판정되어 copy 미가동
- Phase B/C 전환 피드백 — 별도 세션 예정
- Spike 모드 피드백 — 본 세션 미가동 (IMP-AGENT-004)
- 팀 협업 피드백 — 단일 사용자 세션 (TeamCreate 미사용)

---

## 3. 릴리스 배치 전략

### 3-1. v2.4.1 (긴급 개선, 2026-05 예상)

**8 TASK** — Critical 3 (EPMV AREA 통합) + High 5 (FSTATE/RACE/RICE):

| TASK | 제목 | 난이도 | 파일 변경 예상 |
|------|------|:---:|:---:|
| T-EPMV-01 | `/plan-epic advance` 자동 링크 재작성 | Medium | 2 신규 + 1 수정 |
| T-EPMV-02 | git mv/mv 자동 분기 + fallback 문서화 | Low | 1 수정 + 1 rule 섹션 |
| T-EPMV-03 | advance 게이트 자동 검증 | Low | 1 수정 |
| T-FSTATE-01 | plan-state-sync.js 훅 구현 | Medium | 1 신규 hook |
| T-FSTATE-02 | Feature/IDEA 상태 머신 SSOT 문서 | Low | rule 1 섹션 확장 |
| T-RACE-01 | agent-file-ownership.md 룰 신설 | Low | 1 신규 rule |
| T-RACE-02 | Read 캐시 자동 재인증 개선 | Medium | 1 hook 개선 |
| T-RICE-01 | rice-lane-weighted-adjustment.md 룰 | Low | 1 신규 rule |

**구현 순서 권장**: T-FSTATE-02 → T-RICE-01 → T-RACE-01 (순수 문서) → T-EPMV-02 → T-RACE-02 → T-FSTATE-01 → T-EPMV-03 → T-EPMV-01 (통합 완성)

**총 예상 기간**: 5~7 인·일 (실 병렬 가능 범위 고려 시 3 일 내 가능)

### 3-2. v2.5.0 (중기, 2026-06 or Q3)

**7 TASK** — Medium 7:

| TASK | 제목 | 난이도 | BC 가능성 |
|------|------|:---:|:---:|
| T-BRDG-01 | Bridge 5 파일 경량화 (링크+요약 원칙) | Low | ⚠ minor 가능 |
| T-BRDG-02 | Writer 에이전트 출력 표준 | Low | - |
| T-PCC-01 | PCC-07~09 추가 (Epic binding/상태/매트릭스) | Low | - |
| T-TMPL-01 | Phase 로드맵 템플릿화 + `/plan-epic-phase generate` | High | - |
| T-SHOW-01 | `/plan-epic show` 집약 출력 개선 | Medium | - |
| T-SHOW-02 | 에이전트 보고 Phase 진행률 표준 | Low | - |
| T-REVP-01 | 수정 요청 프로토콜 + `/plan-revise` | Medium | - |

**BC 알림**: T-BRDG-01 은 `00-context/` 5 파일 내용을 축소. 아직 dev-implementer 가 Feature Package 를 참조하는 규약이 완성되지 않은 상태이므로 v2.5.0 minor 내 통합 가능. 단 기존 archived Feature Package 의 5 파일은 그대로 보존 (강제 마이그레이션 없음).

### 3-3. Backlog (Low)

**3 TASK** — 필요 시점 활성화:

| TASK | 제목 | 난이도 | 활성화 조건 |
|------|------|:---:|-----------|
| T-BKLG-01 | 변경 이력 자동 append hook | High | edit 요약 수집 UX 합의 후 |
| T-BKLG-02 | dry-run 모드 | Medium | 신규 사용자 온보딩 필요 시 |
| T-BKLG-03 | TASK 힌트 역방향 동기 | Medium | Step 9 dev-feature 실사용 경험 축적 후 |

---

## 4. 수용 기준 (Acceptance Criteria)

| # | 기준 | 검증 방법 |
|:-:|------|----------|
| AC-1 | `/plan-epic advance --to={state}` 1 커맨드로 파일 이동 + 전체 링크 재작성 + 게이트 검증 + index 갱신 완료 | 실제 advance 실행 → 잔존 구 경로 링크 0 개 |
| AC-2 | IDEA frontmatter `상태:` 변경 시 backlog/Children §1/binding §7 3 곳 자동 동기 | 수동 Edit 1 → 후속 3 곳 자동 반영 |
| AC-3 | 병렬 에이전트 호출 시 `01-children-features.md` 동시 편집 race 0 건 | 파일 소유권 매트릭스 참조한 2 에이전트 동시 호출 → 충돌 경고 |
| AC-4 | RICE Lane 가중 판정이 `rice-lane-weighted-adjustment.md` 룰 근거 기반 | screening 출력에 "Lane 가중 조정 + 충족 조건 항목" 명시 |
| AC-5 | Bridge 5 파일 총 라인 수 40% 이상 감소 (현행 기준) | F1 Bridge 재실행 → 라인 수 비교 |
| AC-6 | plan-reviewer PCC 실행 시 8 종 검증 수행 (5 → 8) | 검증 출력 섹션 8 개 표시 |
| AC-7 | `/plan-epic-phase generate --phase=B --features=F2,F4` 로 Phase B 로드맵 자동 생성 | 생성된 §4 로드맵이 Phase A 구조와 일치 |
| AC-8 | `/plan-epic show EPIC-...` 호출 시 Phase 진행률 + 자식 Feature 상태 + 다음 Checkpoint 집약 출력 | 본 세션에서 사용한 정보를 한 커맨드로 파악 |

---

## 5. 리스크 및 완화

| # | 리스크 | 영향 | 완화 |
|:-:|--------|:---:|------|
| R1 | `sed -i` 기반 링크 재작성이 서사/설명 텍스트의 구 경로 문자열까지 치환 | 🔴 High | T-EPMV-01: 치환 패턴을 `/{state}/EPIC-{ID}/` 완전 매칭으로 제한 + 변경 파일 목록 출력 + dry-run 플래그 |
| R2 | plan-state-sync.js hook 이 여러 파일 동시 수정 시 race 재도입 | 🟠 Medium | T-FSTATE-01: 순차 in-place edit 보장 + 잠금 파일(lockfile) + 에러 시 rollback |
| R3 | 파일 소유권 매트릭스가 기존 에이전트 프롬프트와 상충 | 🟠 Medium | T-RACE-01: 먼저 매트릭스 문서 신설 → 에이전트 프롬프트 차후 단계 참조 추가 (2 단계 배포) |
| R4 | PCC 항목 확장 시 기존 PRD 에 대한 회귀 실패 | 🟡 Low | T-PCC-01: PCC-07~09 는 WARN 수준 우선 (v2.5.0), FAIL 승격은 v2.5.1 이후 |
| R5 | T-TMPL-01 템플릿 엔진 도입 시 기존 Epic 의 Phase 로드맵 덮어쓰기 위험 | 🟡 Low | generate 는 **추가만**, 기존 §4 존재 시 중단 + `--overwrite` 플래그 명시 |
| R6 | Bridge 5 파일 경량화 후 dev-implementer 가 참조 실패 | 🟡 Low | T-BRDG-01: archived Feature Package 는 원본 유지 (강제 마이그레이션 없음) + v2.5.0 전 dev-implementer 계약 합의 |

---

## 6. Breaking Change 판정

| TASK | BC 여부 | 사유 |
|------|:---:|------|
| T-EPMV-01 ~ 03 | **없음** | `/plan-epic advance` 커맨드 기능 확장 (기존 수동 플로우와 호환) |
| T-FSTATE-01 | **없음** | 신규 hook 추가 (기존 파일 구조 변경 없음) |
| T-FSTATE-02 | **없음** | rule 문서 섹션 추가 |
| T-RACE-01 | **없음** | 신규 rule 추가 (기존 에이전트 무영향) |
| T-RACE-02 | **없음** | 기존 hook 개선 (behavior 하위 호환) |
| T-RICE-01 | **없음** | 신규 rule 추가 + screener 참조 링크 |
| T-BRDG-01 | ⚠ **minor 가능** | Feature Package 구조 축소 — dev-implementer 참조 규약 미확정 시 minor 표기 |
| T-BRDG-02 | **없음** | Writer 출력 형식 표준 (소비자 없음) |
| T-PCC-01 | **없음** | PCC 항목 추가 (기존 5 종 유지) |
| T-TMPL-01 | **없음** | 신규 서브커맨드 |
| T-SHOW-01 ~ 02 | **없음** | 기존 커맨드 출력 확장 |
| T-REVP-01 | **없음** | 신규 서브커맨드 |
| T-BKLG-01 ~ 03 | **없음 or minor** | 구현 시점 재검토 |

**결론**: v2.4.1 patch release **Breaking Change 없음**. v2.5.0 T-BRDG-01 만 minor 가능성.

---

## 7. 구현 의존성 매트릭스

| TASK | 선행 | 후행 |
|------|------|------|
| T-FSTATE-02 | — | T-FSTATE-01, T-PCC-01 |
| T-RICE-01 | — | — |
| T-RACE-01 | — | 모든 에이전트 프롬프트 갱신 (후속) |
| T-EPMV-02 | — | T-EPMV-01 |
| T-RACE-02 | — | — |
| T-FSTATE-01 | T-FSTATE-02 | T-PCC-01 |
| T-EPMV-03 | — | T-EPMV-01 |
| T-EPMV-01 | T-EPMV-02, T-EPMV-03 | — |
| T-BRDG-01 | — | T-PCC-01 (부분) |
| T-BRDG-02 | — | — |
| T-PCC-01 | T-FSTATE-01, T-FSTATE-02 | — |
| T-TMPL-01 | — | — |
| T-SHOW-01 | T-FSTATE-01 (실시간 상태 조회) | T-SHOW-02 |
| T-SHOW-02 | T-SHOW-01 | — |
| T-REVP-01 | — | — |
| T-BKLG-* | — | — |

---

## 8. 성공 기준 (Phase A 재실행 시)

본 개선 적용 후 Phase A 재실행 시 측정 지표:

| 지표 | 현행 (Dry-Run 기준) | 목표 (v2.4.1 후) |
|------|:---:|:---:|
| Epic advance 소요 시간 | 5~15 분 × 2 회 | 30 초 × 2 회 |
| 상태 동기 수동 Edit 수 | 4 회 (IDEA + backlog + Children + binding) | 1 회 (IDEA frontmatter 만) |
| Read 캐시 재인증 Edit 실패 | 4~5 회 | 0 회 |
| RICE Lane 가중 판정 출처 질문 | ~2 회 | 0 회 (룰 링크 명시) |
| 병렬 에이전트 race 회피 프롬프트 추가 | 매 호출 | 자동 (파일 소유권 매트릭스 참조) |
| Bridge 5 파일 총 라인 수 | ~800 (F1 기준) | ~480 (40% 감소, v2.5.0 후) |

---

## 9. 참조

- 피드백 원본: [`phase-a-dry-run-20260423/`](../phase-a-dry-run-20260423/)
- 현행 인벤토리: [`03-kit-inventory.md`](03-kit-inventory.md)
- 개선 제안 상세: [`04-proposal.md`](04-proposal.md)
- TASK: [`05-tasks/`](05-tasks/)

---

## 10. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | 초안 — 범위 · AC-1~8 · BC 판정 · 리스크 R1~R6 |
