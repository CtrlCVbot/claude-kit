# 03. Pain Points — 겪은 불편 (개선 대상)

> Phase A 실행 중 실제로 관찰된 마찰점·이슈·개선 필요 사항 18 건. 각 항목은 "관찰 → 증거 → 영향 → 빈도" 구조. 연결된 개선 제안은 [`04-improvement-proposals.md`](./04-improvement-proposals.md) 참조.

---

## N-01. Epic 디렉터리 전이 시 대량 링크 갱신 부담 🔴 Critical

- **관찰**: `draft → planning → active` 상태 전이 시 `.plans/epics/{state}/EPIC-.../` 경로가 바뀌면 모든 참조 파일의 링크 갱신 필요
- **증거**:
  - Step 3 (draft → planning) 후 IDEA 파일·backlog·Feature Package 의 경로 링크 수동 수정 필요
  - Step 8 (planning → active) 후 **13 파일**에 `10-planning/EPIC-` 잔존 (grep 검증)
  - 본 세션에서는 sed 일괄 치환으로 해결 (잔존 링크 정리 Step)
- **영향**:
  - 수동 갱신 부담 + 놓칠 위험 (문서 일관성 저하)
  - 신규 사용자는 어디를 갱신해야 하는지 알기 어려움
  - 링크 깨짐이 즉시 드러나지 않고 나중에 발견됨
- **빈도**: Epic 상태 전이 시마다 발생 (생명주기당 최소 3 회: draft→planning, planning→active, active→completed)
- **해결 제안**: [I-01](./04-improvement-proposals.md#i-01-epic-전이-자동-링크-갱신-도구)

## N-02. 에이전트 간 Epic 파일 편집 race 위험 🟠 High

- **관찰**: 병렬 에이전트 호출 시 `01-children-features.md` 같은 Epic 공통 파일을 동시 편집하면 마지막 쓴 것만 살아남음
- **증거**:
  - 본 세션에서 F5/F1 Screening 을 병렬로 진행하지 못하고 **순차 실행** 으로 회피 (사용자 확인)
  - F5/F1 Bridge 에이전트 프롬프트에 "Epic 파일 편집 금지, 메인 세션이 담당" 명시적 지시 필수
  - Bridge 에이전트가 IDEA 파일 수정 후 메인이 Read 재호출 필요한 케이스 4~5 회 관찰
- **영향**: 병렬 실행 이점 상실, 복잡한 조율 부담
- **빈도**: 여러 Feature 를 동시에 진행할 때마다 (현재 규모로는 모든 Step)
- **해결 제안**: [I-03](./04-improvement-proposals.md#i-03-에이전트-파일-소유권-매트릭스)

## N-03. Read 캐시 invalidation 수동 대응 🟠 High

- **관찰**: 에이전트가 파일 수정 후 메인 세션의 Read 캐시는 stale. Edit 시 "File has not been read yet" 에러 발생.
- **증거**:
  - 본 세션 4~5 회 Edit 실패 관찰 (Step 1 직후·Step 2 직후·Step 7a·7b 직후 등)
  - `agent-completion-cache-invalidate` 훅이 warning 표시하나 메인이 수동으로 Read 재호출해야 함
  - Bridge 에이전트도 보고 말미에 "Agent Edit Race 주의" 섹션 반복 명시 필요
- **영향**: 한 번의 Edit 가 Read + Edit 2 단계가 되어 시간·토큰 소비 증가
- **빈도**: write-capable 에이전트 호출 직후 메인이 같은 파일 Edit 시마다
- **해결 제안**: [I-04](./04-improvement-proposals.md#i-04-read-캐시-자동-재인증)

## N-04. Feature 상태 SSOT 부재 — 4 곳 동기 부담 🟠 High

- **관찰**: 하나의 Feature 상태 (approved/active/archived) 가 4 곳에 분산 — IDEA frontmatter · backlog.md 행 · Epic Children §1 `상태` 필드 · 08-epic-binding.md §7 상태 동기 표
- **증거**:
  - Step 8 에서 F5/F1 상태 `inbox → approved` 전이 시 위 4 곳을 수동 업데이트
  - 각 에이전트가 일부만 갱신 (예: Screening 에이전트는 IDEA + backlog 만, Epic Children 은 메인 담당)
  - Step 8 직후에도 binding §7 상태 동기 표를 별도 Edit 로 갱신 (§1 Epic 상태 라인과 별개)
- **영향**: 한 곳 업데이트 후 나머지 잊으면 불일치. `plan-epic-integrity.js` 훅이 Phase 3 enable 되기 전까지 감지 불가.
- **빈도**: 상태 전이마다 (IDEA 생애주기당 4~5 회)
- **해결 제안**: [I-02](./04-improvement-proposals.md#i-02-feature-상태-ssot--자동-동기화)

## N-05. RICE Lite/Standard Lane 가중 조정 규칙 불투명 🟠 High

- **관찰**: RICE 공식 임계값 (Go ≥ 10 / Hold 2~10 / Kill < 2) 과 실제 Lite/Standard Lane 판정 결과 간 괴리를 에이전트가 자의적으로 해소
- **증거**:
  - F5 RICE **5.95** (raw Hold) → Lite Lane 가중으로 Go 제안
  - F1 RICE **1.89** (raw Kill 하단) → Standard Lane 가중으로 Go 제안
  - 두 경우 모두 "Lane 이면 효과가 작은 분자/큰 분모라 raw 점수가 낮아지므로 보정" 논리이지만 이 규칙은 **SSOT 문서에 없음**
- **영향**:
  - 판정 기준의 투명성·재현성 저하
  - 사용자가 "이 가중은 어디 근거인가?" 매번 질문 가능
  - 에이전트가 승격 기준을 해석하므로 일관성 저하
- **빈도**: 스크리닝마다 (Lite 는 항상 raw 점수 낮고, Standard 도 Effort 크면 낮음)
- **해결 제안**: [I-05](./04-improvement-proposals.md#i-05-rice-lane-가중-조정-규칙-ssot-문서화)

## N-06. Bridge 5 파일의 정보 중복 (golden #13 위반 소지) 🟡 Medium

- **관찰**: `00-context/` 5 파일 모두에 Epic 지표·Feature 범위·의존성 등이 **반복 인용**
- **증거**:
  - F1 `01-product-context.md` + `02-scope-boundaries.md` + `03-design-decisions.md` + `08-epic-binding.md` 4 곳에 "Epic §2 지표 4" 원문 또는 요약 반복
  - `02-scope-boundaries.md` §4 Tailwind 4 정정 SSOT 로 지정됨에도 PRD §7.1 과 내용 중복
  - PRD REQ/NFR 이 `04-implementation-hints.md` TASK 힌트로 재서술
- **영향**:
  - 한 곳 갱신 시 나머지 stale 위험
  - golden-principles #13 (Document Non-Duplication) 원칙 위반
  - 신규 사용자가 "어떤 파일이 SSOT 인가?" 헷갈림
- **빈도**: 모든 Feature Package 생성 시 (F5, F1 모두 관찰)
- **해결 제안**: [I-11](./04-improvement-proposals.md#i-11-bridge-5-파일-경량화--중복-최소화)

## N-07. plan-epic advance 게이트 자동 검증 부재 🟡 Medium

- **관찰**: Epic 상태 전이 시 게이트 조건 (planning→active 는 자식 Feature 1 건 이상 approved) 을 **사용자가 수동 판단**
- **증거**:
  - Step 3 (draft → planning): 메인 세션이 "자식 IDEA 최소 1 건" 조건을 수동 확인 후 advance
  - Step 8 (planning → active): "자식 Feature 중 최소 1 건 approved" 조건을 수동 확인 후 advance
  - `/plan-epic advance` 커맨드가 자동 검증하지 않음 (현재는 사용자 책임)
- **영향**: 게이트 미충족 전이 가능성 + 전이 후 실수 발견
- **빈도**: Epic 전이마다 (생명주기당 4 회)
- **해결 제안**: [I-06](./04-improvement-proposals.md#i-06-plan-epic-advance-게이트-자동-검증)

## N-08. Phase 로드맵의 Phase B/C 비이식성 🟡 Medium

- **관찰**: `01-children-features.md` §4 Phase A 실행 로드맵 (9 단계) 이 **A 전용 하드코딩**. Phase B/C 는 별도 세션에서 유사한 로드맵을 다시 작성해야 함.
- **증거**:
  - 본 세션에서 Phase A 9 단계를 사용자 요청으로 수동 작성 (§4 섹션 10 분 작성)
  - Phase B (F2 + F4) 와 Phase C (F3) 는 동일 9 단계 패턴 적용 가능하나 재사용 메커니즘 없음
  - §5 Phase 전환 규칙에 "새 세션에서 Step 1 재개" 만 안내, 로드맵 자체의 복사·수정은 사용자 몫
- **영향**: Phase 전환마다 로드맵 수동 작성 반복. 시간 낭비 + 일관성 저하 리스크.
- **빈도**: Phase 전환마다 (Epic 당 2~3 회)
- **해결 제안**: [I-07](./04-improvement-proposals.md#i-07-phase-로드맵-템플릿화)

## N-09. git mv 실패 + 대안 경로 문서화 부재 🟡 Medium

- **관찰**: `git mv .plans/epics/00-draft/EPIC-.../ .plans/epics/10-planning/EPIC-.../` 시도 시 "source directory is empty" 에러 (파일이 untracked)
- **증거**:
  - Step 3 실행 시 `git mv` → `fatal: source directory is empty` → `git ls-files .plans/epics/` 로 untracked 확인 → 일반 `mv` 로 전환
  - `.gitignore` 에 `.plans/` 미설정이므로 git 추적 대상이지만 아직 커밋 전이라 untracked
  - `plan-epic-hierarchy.md` §4 "파일 이동" 항목에 `git mv` 언급하나 untracked 케이스 처리 미설명
- **영향**:
  - 처음 사용자가 당황 + 해결 방법 모색 필요
  - 일반 `mv` 로 대체 시 git 이력 추적 단절 (tracked 전환 시)
- **빈도**: Epic 초기 상태 전이마다 (Epic 파일이 tracked 되기 전)
- **해결 제안**: [I-08](./04-improvement-proposals.md#i-08-epic-advance-fallback-경로-문서화)

## N-10. 에이전트 보고 형식 불일치 🟡 Medium

- **관찰**: writer 계 에이전트 (idea-collector, draft-writer, prd-writer, bridge-writer) 각자 **다른 보고 형식** 사용
- **증거**:
  - `plan-idea-collector`: "등록 완료" 헤더 + 메타·diff·다음 단계
  - `plan-draft-writer`: "Phase A Step 5 완료 보고" + 파일 경로·판정 결과·결정 포인트·다음 단계
  - `plan-prd-writer`: "F1 PRD 작성 완료 보고" + 10 섹션 요약 테이블·Epic 인용 확인·Tailwind 정정 확인
  - `plan-bridge-writer`: 파일 테이블 + 각 파일 섹션 요약 + Epic binding 핵심 + TASK 힌트 표
  - reviewer 계는 IMP-AGENT-002 로 표준화됐으나 writer 계 미표준
- **영향**: 사용자가 매번 새 형식 해석 필요. 상위 오케스트레이터 에이전트가 결과 파싱 어려움.
- **빈도**: 모든 에이전트 호출 (매번)
- **해결 제안**: [I-09](./04-improvement-proposals.md#i-09-writer-에이전트-출력-포맷-표준화)

## N-11. "수정 요청" 채널 부재 🟡 Medium

- **관찰**: 사용자 승인은 "Y/N/수정" 패턴이나 **"수정" 선택 시 세부 사항 전달 형식이 없음**
- **증거**:
  - 본 세션 사용자는 "Y" 로 모두 승인했으나 만약 수정이 필요했다면 자연어 서술 (예: "A 섹션 방향 전환") 로 해야 함
  - 에이전트가 "수정 지정 시 어떤 형식으로?" 안내 없음
  - 재실행 시 이전 결과와 수정 지시를 어떻게 결합할지 프로토콜 없음
- **영향**:
  - 사용자 지시가 모호 → 에이전트가 추측 → 의도 불일치 가능
  - 반복 수정 시 매번 전체 컨텍스트 재설명 부담
- **빈도**: 사용자 수정 요청 시마다 (본 세션 3 회: Phase A 로드맵 추가·F5 A 섹션 수정·F1 범위 확장)
- **해결 제안**: [I-12](./04-improvement-proposals.md#i-12-수정-요청-프로토콜-표준화)

## N-12. Epic show/list 커맨드 미검증 🟡 Medium

- **관찰**: `/plan-epic list`, `/plan-epic show` 커맨드가 `plan-epic.md` 에 정의되어 있으나 **본 세션에서 사용 안 됨**
- **증거**:
  - 모든 Epic 상태·자식 Feature 확인은 메인 세션이 index.md 와 children-features.md 를 직접 Read 로 확인
  - `/plan-epic show EPIC-20260422-001` 같은 커맨드 미실행
- **영향**:
  - 조회 커맨드의 실사용성 미검증
  - 편의성 vs 직접 Read 대비 이점 불명
- **빈도**: 본 세션 0 회 사용 (불명 — 사용자가 몰라서 인지 불편해서인지)
- **해결 제안**: [I-13](./04-improvement-proposals.md#i-13-plan-epic-조회-커맨드-실사용성-향상)

## N-13. Feature 상태 vs IDEA 상태 구분 불명확 🟡 Medium

- **관찰**: "상태" 라는 용어가 IDEA 레벨 (inbox/screened/approved/archived) 과 Feature 레벨 (pending/approved/active/archived) 두 차원에 존재하지만 **교차 관계가 명확하지 않음**
- **증거**:
  - IDEA-20260423-001 frontmatter `상태: approved` (IDEA 레벨)
  - Epic Children §1 F5 `**상태**: approved` (Feature 레벨, IDEA 상태 따라감?)
  - 08-epic-binding.md §7 상태 동기표에 "Feature 상태 `approved` → `active` 전이는 `/dev-feature` 가 수행" 라고만 안내
  - "언제 Feature 는 approved 에서 active 로?" — `/dev-feature` 호출 시점? 실제 TASK 시작 시점?
- **영향**: 상태 전이 타이밍 모호 → 사용자가 언제 무엇을 바꿔야 할지 혼란
- **빈도**: 지속적 (각 단계마다)
- **해결 제안**: [I-14](./04-improvement-proposals.md#i-14-feature-상태-머신-명시화)

## N-14. PCC 항목 확장 누락 (Epic 계층 도입 반영 미흡) 🟡 Medium

- **관찰**: `plan-reviewer` PCC 5 종 은 **기존 flat 구조 기준** 으로 설계됨. Epic 계층 도입에 따른 새 검증 항목 (예: Epic binding 양방향 링크 일관성) 미포함.
- **증거**:
  - PCC-01 "Epic binding 일관성" 이 있으나 단방향 (PRD → Epic 인용) 만 검증
  - 역방향 (Epic `01-children-features.md` ↔ Feature `08-epic-binding.md`) cross-reference 무결성 검증 부재
  - Epic 의존성 매트릭스 현재성·Phase 로드맵 정합성 등 Epic 레벨 검증 부재
- **영향**: Epic 계층 특유의 불일치 놓칠 위험
- **빈도**: PCC 검증마다 (Epic 연결 Feature 는 모두)
- **해결 제안**: [I-10](./04-improvement-proposals.md#i-10-pcc-항목-확장-epic-계층-반영)

## N-15. TASK 힌트 (PR 분할) 의 역방향 동기 부재 🟢 Low

- **관찰**: Bridge 단계에서 제시한 PR 분할 (F1 6 개 PR) 이 실제 Step 9 구현 시 **변경될 가능성** — 예: 4 개로 통합 또는 8 개로 쪼개기. 변경 시 Epic Children / PRD / Feature Package 로 역방향 반영 경로 부재
- **증거**: F1 Bridge 04-implementation-hints.md 가 "6 PR 분할 + TASK T-THEME-01~08" 예상하나 실제 구현자가 달리 쪼개면 이 문서는 stale
- **영향**: 기획 문서와 실제 구현 결과의 불일치 (archive 시점에 revisit 필요)
- **빈도**: Step 9 실행 시 (현재 세션 미검증, 예측)
- **해결 제안**: [I-15](./04-improvement-proposals.md#i-15-task-힌트-역방향-동기-경로)

## N-16. dry-run / 시뮬레이션 모드 부재 🟢 Low

- **관찰**: 신규 사용자가 `/plan-epic` 을 **실제 파일 생성 없이** 학습할 방법 없음
- **증거**:
  - 본 세션에서도 첫 Epic 생성 시 "이게 맞는 경로인가?" 자문하며 실제 파일 만듦
  - 실수 시 롤백 (파일 삭제) 필요
  - `.claude/skills/plan-epic-workflow/` 내 예시 파일 있으나 실행 시뮬레이션은 없음
- **영향**: learning curve 가파름 + 실수 복구 비용
- **빈도**: 신규 사용자 · 테스트 환경 · 복잡 Epic 실험 시
- **해결 제안**: [I-16](./04-improvement-proposals.md#i-16-dry-run-모드-도입)

## N-17. 사용자 경험 (UX) — 진행률 가시성 부재 🟢 Low

- **관찰**: Phase A 9 단계 중 현재 어느 단계인지 실시간 표시 없음 (메인 세션이 매번 수동 보고)
- **증거**:
  - 본 세션에서 "Step 5a 완료 → Step 5b 진입" 같은 표시는 메인 세션이 응답 텍스트에 수동 삽입
  - TodoWrite 로 추적하나 Epic 계층 관점의 "Phase A 진행률 N/9" 같은 요약 뷰 부재
  - `/plan-epic show` 는 자식 Feature 상태 표시하나 Phase 로드맵 진행률은 미제공
- **영향**: 긴 세션에서 "어디까지 왔나?" 재확인 필요
- **빈도**: 지속적
- **해결 제안**: [I-17](./04-improvement-proposals.md#i-17-phase-진행률-가시화)

## N-18. 문서 품질 관점 — 변경 이력 수동 append 의존 🟢 Low

- **관찰**: 모든 주요 문서 (IDEA, backlog, Epic brief/children, binding, routing-metadata) 의 §N 변경 이력이 **에이전트·메인 세션의 수동 append** 에 의존
- **증거**:
  - 본 세션에서 변경 이력 append 를 놓치지 않기 위해 각 Edit 에 명시적 instruction 포함
  - backlog.md 변경 이력 5 건 중 일부는 실제로 여러 상태 전이를 한 행으로 합침 (granularity 일관성 저하)
  - 변경 이력이 누락된 경우에도 경고 없음
- **영향**:
  - 이력 누락·중복·granularity 불일치 (문서 품질 저하)
  - 자동화 가능한 작업이 수동
- **빈도**: 각 Edit마다 잠재적 누락 가능
- **해결 제안**: [I-18](./04-improvement-proposals.md#i-18-변경-이력-자동-append-hook)

---

## 요약 — Pain-points 를 Severity 별 분류

### Critical (1 건) — 즉시 개선 필수
- N-01 Epic 전이 자동 링크 갱신

### High (4 건) — v2.4.1 대상 권장
- N-02 Epic 파일 편집 race
- N-03 Read 캐시 invalidation
- N-04 Feature 상태 SSOT
- N-05 RICE Lane 가중 조정 규칙 SSOT

### Medium (8 건) — v2.5.0 또는 차기 Epic 후보
- N-06 Bridge 5 파일 중복
- N-07 advance 게이트 자동 검증
- N-08 Phase 로드맵 템플릿화
- N-09 git mv 실패 fallback 문서화
- N-10 writer 에이전트 출력 표준화
- N-11 "수정 요청" 프로토콜
- N-12 show/list 커맨드 실사용성
- N-13 Feature vs IDEA 상태 구분
- N-14 PCC 항목 확장

### Low (5 건) — backlog 유지
- N-15 TASK 힌트 역방향 동기
- N-16 dry-run 모드
- N-17 진행률 가시화
- N-18 변경 이력 자동 append

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-23 | 초안 — Phase A Step 1~8 경험 기준 pain points 18 건, severity 분류 |
