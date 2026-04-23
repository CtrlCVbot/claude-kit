# 01. Pipeline Overview — Phase A Step 1~8 실행 기록

> Phase A 기획 단계의 실제 실행 시퀀스·커맨드·결과물·소요 시간 기록. 재현 가능한 형태로 정리.

---

## 1. 실행 전 상태 (2026-04-22 말)

- dash-preview-phase3 Feature `archived` 상태 (6 일간 41 TASK 완료, 622 + 916 tests)
- Phase 3 archive 직후 사용자가 `.plans/archive/dash-preview-phase3/improvements/` 에 10 이슈 + proposals 문서 작성
- Epic 미생성 상태 (`.plans/epics/` 디렉터리 부재)

---

## 2. Phase A 9 단계 실행 흐름 (실제 소요)

### Step 0 (사전): Epic 생성 (`/plan-epic`)

- **실행 커맨드**: `/plan-epic "C:\...improvements 문서들 분석후 진행해주세요"`
- **실행 날짜**: 2026-04-22
- **소요**: 초기 분석 + 5 Feature 그룹화 + Brief/Children 작성 ≈ 30~40 분
- **산출**:
  - `.plans/epics/00-draft/EPIC-20260422-001/00-epic-brief.md` (~108 라인)
  - `.plans/epics/00-draft/EPIC-20260422-001/01-children-features.md` (~145 라인)
  - `.plans/epics/index.md` (~30 라인)
- **주요 의사 결정**:
  - 10 이슈 → 5 Feature (F1 라이트 모드, F2 Mock 재설계, F3 옵션↔요금, F4 레이아웃+HitArea, F5 UI 잔재 정리)
  - Phase A (F1 + F5 병렬) / Phase B (F2 + F4 병렬) / Phase C (F3 단독)
  - 의존성 매트릭스 작성 (F2 ↔ F5 `→`, F1 ↔ F5 `✓` 등)

### Step -1 (후속 수정, 2026-04-23 초): Phase A 로드맵을 Epic 문서에 추가

- **배경**: 사용자 요청 "PHASE A 로드맵을 EPIC 문서에 추가"
- **구현**: `01-children-features.md` 에 §4 "Phase A 실행 로드맵 (9 단계)" 섹션 신설
- **편집 수**: 3 edits (§4 삽입 + §5~7 섹션 번호 +1 + §7 변경 이력 추가)
- **소요**: 10 분

### Step A (후속 수정): F5 IDEA A 섹션 방향 전환

- **배경**: 사용자 요청 "A. AiExtractJsonViewer 제거 를 파일 삭제 대신 화면에서 보이지 않게만"
- **구현**: IDEA-20260423-001 §3-A + Epic §3 F5 In-scope + Epic Children §1 F5 섹션 + §2 F2↔F5 근거 + §3 Phase A + §4 종료 조건 모두 동기
- **편집 수**: 13 edits (IDEA 5 + Brief 3 + Children 5)
- **소요**: 20 분
- **영향**: 의존성 매트릭스 근거 변경 (`jsonViewerOpen` 필드 "제거" → "유지"). Phase A 종료 조건 문구 갱신.

### Step B (후속 수정): F1 범위 확장 (dash-preview → landing 전역)

- **배경**: 사용자 요청 "002의 라이트 모드는 전체 랜딩페이지"
- **구현**: IDEA-20260423-002 + Epic Brief §2 지표 4 + §3 F1 In-scope + §5 M-Epic-1 + §6 리스크 1 수정 + 리스크 6 신규 추가 + Epic Children §1 F1 + §2 근거 + §3 Phase A + §4 종료 조건 모두 동기
- **편집 수**: 17 edits (IDEA 9 + Brief 6 + Children 5)
- **소요**: 30 분
- **영향**: F1 Lane = Standard 유지 (상향 없음), Effort 2~3 주 → 실제로는 Epic Phase A Target 유지 (2026-05-06, Risk-6 로 1주 연장 가능성 명시)

### Step 1: F5 IDEA 등록 (`/plan-idea`)

- **실행 커맨드**: `/plan-idea "F5 UI 잔재 정리 ..." --epic=EPIC-20260422-001`
- **호출 에이전트**: `plan-idea-collector`
- **소요**: 약 2.5 분 (에이전트 처리 시간 기준)
- **산출**:
  - `.plans/ideas/00-inbox/IDEA-20260423-001.md` 신규
  - `.plans/ideas/backlog.md` 신규 + F5 행 추가
  - Epic `01-children-features.md` §1 F5 IDEA 필드 자동 갱신 (IMP-AGENT-010)
  - Epic `00-epic-brief.md` §7 자식 IDEA 링크 갱신

### Step 2: F1 IDEA 등록

- **실행 커맨드**: `/plan-idea "F1 라이트 모드 전환 인프라 ..." --epic=EPIC-20260422-001`
- **호출 에이전트**: `plan-idea-collector`
- **소요**: 약 2 분
- **산출**: IDEA-20260423-002 + backlog F1 행 + Epic 갱신

### Step 3: Epic `draft → planning` 전이 (`/plan-epic advance`)

- **실행 수단**: 메인 세션이 직접 Bash + Edit 수행 (커맨드 재호출 없음, 게이트 조건 확인 후)
- **사용 명령**: `git mv` 시도 → 실패 (source empty) → 일반 `mv` 로 전환
- **산출**:
  - `mv .plans/epics/00-draft/EPIC-20260422-001 .plans/epics/10-planning/EPIC-20260422-001`
  - index.md 상태 컬럼 갱신 (`draft → planning`) + 경로 갱신 + 상태별 요약 + 변경 이력
- **소요**: 5 분
- **이슈**: `git ls-files` 로 확인 시 `.plans/epics/` 아래 파일들이 **untracked** 상태 → `git mv` 실패. 일반 `mv` 로 대체.

### Step 4a: F5 RICE 스크리닝 (`/plan-screen`)

- **호출 에이전트**: `plan-idea-screener`
- **소요**: 에이전트 처리 약 2.7 분 + 사용자 승인 (`Y`)
- **결과**: RICE 5.95 (Reach 7 / Impact 2 / Confidence 85% / Effort 2). **Lite Lane 가중 조정으로 Go 판정 제안**.
- **특이**: Raw RICE 5.95 는 공식 Hold 범위 (2.0~10.0) 상단이지만 에이전트가 Lite Lane 가중으로 Go 로 승격. 이 조정 규칙은 현재 SSOT 문서화 안됨 (에이전트 내부 판단).

### Step 4b: F1 RICE 스크리닝

- **호출 에이전트**: `plan-idea-screener`
- **소요**: 약 2.3 분 + 사용자 승인
- **결과**: RICE 1.89 raw (Reach 9 / Impact 3 / Confidence 70% / Effort 10 인·일). **Raw 는 공식 Kill 하단 (<2.0) 직하**. Standard Lane 가중 조정으로 Go 승격.
- **특이**: Standard 대형 Feature 는 Effort 가 분모로 커서 RICE 절대값이 Go/Hold 임계 아래로 떨어짐. "Standard Lane 가중" 이 Lite 가중과 대칭 규칙이나 SSOT 부재.

### Step 5a: F5 Draft (`/plan-draft`)

- **호출 에이전트**: `plan-draft-writer`
- **소요**: 약 4.4 분 + 사용자 승인
- **결과**: Lane Lite / 시나리오 B / Feature 유형 dev / Hybrid false 확정. 결정 포인트 3 건 확정 (tooltip 문구·hit-area key·import 처리).
- **산출**: `.plans/drafts/f5-ui-residue-cleanup/01-draft.md` + `07-routing-metadata.md`

### Step 5b: F1 Draft

- **호출 에이전트**: `plan-draft-writer`
- **소요**: 약 7.9 분 + 사용자 승인
- **결과**: Lane Standard / 시나리오 A / Feature 유형 dev / Hybrid false. 결정 포인트 6 건 확정 (next-themes · system follow · SSR hydration 3 중 방어 · navbar 우상단 · lucide Sun/Moon · 6 PR 분할).
- **중요 발견**: **Tailwind 4 기술 정정** — IDEA §3-A / §6 의 `tailwind.config.ts` 가 본 프로젝트에 미존재 (`@theme inline` 사용). Draft §5.1 에 명시 + PRD 전파 대상.
- **산출**: `.plans/drafts/f1-landing-light-theme/01-draft.md` + `07-routing-metadata.md`

### Step 6: F1 PRD 작성 (`/plan-prd`) + PCC 검증

- **호출 에이전트 1**: `plan-prd-writer` (약 7.7 분)
- **호출 에이전트 2**: `plan-reviewer` (약 2.3 분)
- **소요**: 약 10 분 (writer + reviewer) + 사용자 승인
- **PRD 내용**: 10 섹션 (~330 라인), REQ-14 + NFR-10 + SM-10 + R-9 건. Epic §2 지표 4 양쪽 인용 (§3 Goals + §10 Success Metrics).
- **PCC 결과**: 5/5 PASS (Low 이슈 2 건 Non-Blocking). Epic binding·Draft↔PRD 일관성·요구사항 테스트 가능성·User Story 형식·Success Metrics 정량성 모두 통과.
- **산출**: `.plans/drafts/f1-landing-light-theme/02-prd.md` + IDEA §9 PRD 엔트리

### Step 7a: F5 Bridge (`/plan-bridge`)

- **호출 에이전트**: `plan-bridge-writer`
- **소요**: 약 6.4 분
- **결과**: 5 파일 생성 (`00-context/01-04` + `08-epic-binding.md`) + TASK 힌트 4 건 (T-CLEANUP-01~04, 1.75 인·일)
- **산출 경로**: `.plans/features/active/f5-ui-residue-cleanup/`

### Step 7b: F1 Bridge

- **호출 에이전트**: `plan-bridge-writer`
- **소요**: 약 12.5 분 (파일 5 종 + TASK 힌트 8 건 T-THEME-01~08, 10 인·일)
- **Tailwind 4 SSOT**: `02-scope-boundaries.md` §4 를 정정 SSOT 로 지정. 03/04 에는 `tailwind.config.ts` 언급 0 건 준수.
- **산출 경로**: `.plans/features/active/f1-landing-light-theme/`

### Step 8: Epic `planning → active` 전이

- **실행 수단**: 메인 세션 직접 수행
- **작업**:
  - Children §1 F5/F1 상태 `inbox → approved` + Draft/PRD/Feature Package 링크 추가 (3 edits)
  - `mv .plans/epics/10-planning/... .plans/epics/20-active/...`
  - index.md (3 edits: 상태 + 경로 + 요약 + 이력)
  - F5 + F1 `08-epic-binding.md` Epic 상태 라인 `planning → active` + 경로 replace_all
  - §7 상태 동기 표 업데이트
- **소요**: 15 분 (Read 재호출·Edit 순차 포함)

### Step 후속 (Optional): 잔존 링크 정리

- **배경**: Step 8 Epic 디렉터리 이동 후 13 파일에 `10-planning/EPIC-` 경로 링크 잔존 (기능 무영향이나 문서 일관성 문제)
- **실행**: Bash `find + xargs sed` 일괄 치환
  - drafts + features/active 10 파일
  - IDEA 2 + backlog 1 파일
- **검증**: 전수 `grep` 결과 잔존 0 건 (설명·이력 서사 2 건만 유지)
- **소요**: 5 분

---

## 3. 실행 시간 요약

| Step | 시간 (분) | 주요 작업 |
|:-:|:---:|---|
| Epic 생성 (0) | 35 | 분석 + 5 Feature 그룹화 + Brief/Children 초안 |
| Phase A 로드맵 추가 (-1) | 10 | §4 삽입 + 섹션 재번호 |
| F5 A 섹션 방향 전환 (A) | 20 | 13 edits |
| F1 범위 확장 (B) | 30 | 17 edits |
| Step 1 (F5 IDEA) | 2.5 | plan-idea-collector |
| Step 2 (F1 IDEA) | 2 | plan-idea-collector |
| Step 3 (draft → planning) | 5 | mv + index.md |
| Step 4a (F5 Screen) | ~4 | plan-idea-screener + 승인 |
| Step 4b (F1 Screen) | ~4 | plan-idea-screener + 승인 |
| Step 5a (F5 Draft) | ~6 | plan-draft-writer + 승인 |
| Step 5b (F1 Draft) | ~10 | plan-draft-writer + 승인 + Tailwind 4 발견 |
| Step 6 (F1 PRD + PCC) | ~12 | plan-prd-writer + plan-reviewer + 승인 |
| Step 7a (F5 Bridge) | ~7 | plan-bridge-writer |
| Step 7b (F1 Bridge) | ~13 | plan-bridge-writer |
| Step 8 (planning → active) | 15 | mv + index + binding + Children 동기 |
| 잔존 링크 정리 | 5 | sed 일괄 치환 |
| **총합** | **약 181 분 (3 시간)** | Epic 생성부터 Step 8 + 정리까지 |

**추가 사용자 대화 시간** (승인·재지시·피드백 요청 등): 약 40~50 분 추정

실제 wall-clock time: **약 4 시간** (Claude API 응답 + 사용자 판단 + 수정 요청 포함).

---

## 4. 생성 / 수정 파일 인벤토리

### 4-1. Epic (3 파일)

- `00-epic-brief.md` — 10 섹션, ~115 라인 (최종)
- `01-children-features.md` — 7 섹션, ~295 라인 (최종, Phase A 로드맵 포함)
- `.plans/epics/index.md` — ~35 라인

### 4-2. IDEAs (3 파일)

- `IDEA-20260423-001.md` (F5) — 8 → 10 섹션 확장, ~270 라인
- `IDEA-20260423-002.md` (F1) — 8 → 10 섹션, ~310 라인
- `backlog.md` — ~40 라인

### 4-3. Drafts (5 파일)

- `drafts/f5-ui-residue-cleanup/01-draft.md`
- `drafts/f5-ui-residue-cleanup/07-routing-metadata.md`
- `drafts/f1-landing-light-theme/01-draft.md`
- `drafts/f1-landing-light-theme/02-prd.md` (~460 라인, 10 섹션)
- `drafts/f1-landing-light-theme/07-routing-metadata.md`

### 4-4. Feature Packages (10 파일)

- `features/active/f5-ui-residue-cleanup/00-context/{01-product-context, 02-scope-boundaries, 03-design-decisions, 04-implementation-hints, 08-epic-binding}.md`
- `features/active/f1-landing-light-theme/00-context/{01-product-context, 02-scope-boundaries, 03-design-decisions, 04-implementation-hints, 08-epic-binding}.md`

### 4-5. Kit Feedback (본 패키지, 6 파일)

- `kit-feedback/phase-a-dry-run-20260423/{README, 01-pipeline-overview, 02-positive-findings, 03-pain-points, 04-improvement-proposals, 05-command-agent-matrix}.md`

**총 생성·수정 파일**: 약 27 파일 (Phase A 기획 단계만)

---

## 5. Checkpoint (사용자 승인) 기록

| # | Checkpoint | 타입 | 사용자 응답 |
|:-:|-----------|:---:|:---:|
| 1 | Step 4a F5 Screening Go | `initial-approval-gate` (Critical) | Y |
| 2 | Step 4b F1 Screening Go | `initial-approval-gate` (Critical) | Y |
| 3 | Step 5a F5 Draft 판정 | `scope-confirmation` | Y |
| 4 | Step 5b F1 Draft 판정 | `scope-confirmation` | Y |
| 5 | Step 6 F1 PRD PCC 결과 | `review-approval` | Y |

**중간 사용자 요청 (Checkpoint 외)**:
- Step 1 직후: "F5 A 섹션 방향 수정 — 파일 삭제 → 화면 숨김"
- Step 2 직후: "002 범위 확장 — landing 전역 + 001 Epic 반영 확인"
- Step 8 종료 후: "B (잔존 링크 정리 먼저, Step 9 자동 진입 금지)"

---

## 6. 에이전트 호출 패턴 (실제 관찰)

### 6-1. Read-only 에이전트 (Read 재호출 불필요)

- `plan-reviewer` (Step 6) — Read/Grep/Glob 만 사용

### 6-2. Write-capable 에이전트 (메인 세션 Edit 전 Read 재호출 필요)

- `plan-idea-collector` (Step 1, 2) — IDEA 파일 + backlog.md + Epic 2 파일 수정
- `plan-idea-screener` (Step 4a, 4b) — IDEA §8 SCREENING 추가 + backlog 갱신
- `plan-draft-writer` (Step 5a, 5b) — drafts/{slug}/ 신규 + IDEA §9 추가
- `plan-prd-writer` (Step 6) — drafts/{slug}/02-prd.md 신규 + IDEA §9-5 추가
- `plan-bridge-writer` (Step 7a, 7b) — features/active/{slug}/00-context/ 5 파일 + IDEA §10/11 추가

### 6-3. Read 재호출 발생 횟수 (관찰)

- 약 4~5 회 "File has not been read yet in this session" 에러 경험
- 메인이 `Agent` 호출 후 바로 `Edit` 시도 시 발생
- 해결: Edit 실패 → Read 호출 → Edit 재시도

---

## 7. 실행 중 발생한 미해결 작업

Step 9 (/dev-feature + /dev-run 병렬) 은 **사용자 명시 지시** 로 자동 진입 차단. Phase A 기획 단계 완료 후 사용자 승인 대기 중.

---

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-23 | 초안 — Phase A Step 1~8 종료 직후 작성 |
