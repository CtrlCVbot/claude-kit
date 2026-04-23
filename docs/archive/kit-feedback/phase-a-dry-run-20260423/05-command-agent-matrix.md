# 05. Command × Agent Matrix — 커맨드·에이전트별 상세 피드백

> 본 세션에서 사용한 7 커맨드 · 6 에이전트 각각의 강점·약점·개선점 상세 기록. 개별 유닛 개선 담당자 참고용.

---

## Part A. 커맨드 (7 종)

### A-1. `/plan-epic` (Epic 생성)

- **사용 횟수**: 1 회 (Epic 생성)
- **실제 프롬프트 예**: `"C:\...improvements 문서들 분석후 진행해주세요"`
- **실행 소요**: 약 35 분 (분석 + 5 Feature 그룹화 + Brief/Children 작성)

**강점**:
- Activation 기준 (3 중 하나 이상) 사전 검증으로 Over-engineering 가드 (P-01)
- Brief + Children 2 파일 구조로 "요약 vs 상세" 분리
- `index.md` 자동 생성으로 메타 인덱스 확보

**약점**:
- 사용자의 자연어 지시 (파일 경로만 주기) 를 받아 자동으로 5 Feature 구조화 결정 — 사용자는 판단 과정 통제 어려움
- Epic Brief §3 자식 Feature 목록이 `(IDEA-{미정})` 로 시작 — 추후 IDEA 등록 시 수동 갱신 필요 (IMP-AGENT-010 이 일부 자동화하나 `IDEA-{미정}` → `IDEA-...` 치환은 메인 담당)
- Activation 기준 3 중 하나 미충족 시 "독립 Feature 권장" 경로가 있으나 **자연스러운 fallback 커맨드** 없음 (예: `/plan-idea` 직접 호출 유도)

**개선 제안**:
- Epic Brief 초안에 IDEA 필드를 "미등록 (다음 커맨드: `/plan-idea ...`)" 로 명시 (현재도 일부 반영됨)
- Activation 미충족 시 자동 "Epic 없이 독립 Feature 로 진행하시겠어요?" 프롬프트

### A-2. `/plan-epic advance --to={state}` (상태 전이)

- **사용 횟수**: 2 회 (draft→planning, planning→active)
- **실제 소요**: 각 5~15 분
- **사용 방식**: 메인 세션이 커맨드 형태가 아닌 **Bash + Edit 조합** 으로 수동 실행

**강점**:
- 게이트 조건 (자식 IDEA/Feature 카운트) 명시되어 있음

**약점** (매우 강함):
- **자동 링크 갱신 없음** (N-01 Critical) — 13 파일 수동 수정
- **게이트 자동 검증 없음** (N-07) — 사용자 책임
- **커맨드 형태로 실행하지 않고 메인이 수동 수행** — 커맨드 정의는 있으나 실제 사용 편의 부재

**개선 제안**:
- I-01 (자동 링크 갱신) + I-06 (게이트 자동 검증) 통합 구현
- 실제 `/plan-epic advance` 호출 시 `git mv`/`mv` 분기 (I-08) · 링크 재작성 · index.md 갱신 · binding 동기 + 게이트 검증 한 번에 수행

### A-3. `/plan-idea` (IDEA 등록)

- **사용 횟수**: 2 회 (F5, F1)
- **호출 에이전트**: `plan-idea-collector`
- **실제 소요**: 각 2~2.5 분

**강점**:
- `--epic=EPIC-...` 옵션으로 Epic 자동 바인딩 (P-14, IMP-AGENT-010)
- backlog.md 자동 생성·갱신
- Epic Children §1 F{N} 섹션 IDEA 필드 자동 치환
- 템플릿 기반 IDEA 파일 10 섹션 일관 구조

**약점**:
- Epic Brief §3 자식 Feature 목록의 `(IDEA-{미정})` 표기는 **Brief 파일** 에 있는데 Epic-collector 가 수정 안 함 (메인 담당 영역). 사용자 관점에서는 "왜 Brief §3 는 안 바뀌나?" 혼란 가능
- IDEA 파일 slug 자동 생성 없음 — Draft 단계에서 slug 결정 → 이때 IDEA ID 와 slug 의 일관성 유지 어려움 (ex: IDEA-20260423-001 ↔ slug `f5-ui-residue-cleanup` — 연결은 수동)

**개선 제안**:
- Epic Brief §3 의 `(IDEA-{미정})` 도 자동 갱신 (현재 Children §1 만 갱신)
- IDEA 파일에 "제안 slug" 필드 미리 포함 (Draft 단계에서 최종 확정)

### A-4. `/plan-screen` (RICE 스크리닝)

- **사용 횟수**: 2 회 (F5, F1)
- **호출 에이전트**: `plan-idea-screener`
- **실제 소요**: 각 ~4 분 (에이전트 2.5 분 + 사용자 승인 대기)
- **플래그**: `--framework=rice` 명시적 지정 (5axis 프레임워크도 있으나 미사용)

**강점**:
- RICE 4 축 정성 + 정량 혼합 접근 (P-09)
- 각 축 근거 파일·라인 인용 요구 → 증거 기반 (golden #10)
- Go/Hold/Kill 판정 + 대안 분석 포함

**약점**:
- **Lite/Standard Lane 가중 조정 규칙 SSOT 부재** (N-05) — 에이전트 내부 판단
- Critical checkpoint 이라 `autoProceedOnPass` 무관 항상 정지 — 사용자가 승인 매번 해야 (이것은 장점이지만 반복 피로)
- `--framework=5axis` 사용 경험 없음 (본 세션 RICE 만)

**개선 제안**:
- I-05 (RICE Lane 가중 조정 규칙 SSOT) 적용 → 에이전트가 룰 직접 참조
- 대량 Feature (>3) 일괄 스크리닝 시 **batch 모드** 추가 (현재는 1 IDEA = 1 호출)

### A-5. `/plan-draft` (1 차 기능 기획)

- **사용 횟수**: 2 회 (F5, F1)
- **호출 에이전트**: `plan-draft-writer`
- **실제 소요**: F5 ~6 분, F1 ~10 분 (Tailwind 4 발견 포함)

**강점**:
- 3 중 판정 (Lane/시나리오/Feature 유형) 동시 결정 (P-03)
- Routing metadata JSON 생성 → 후속 단계 자동화 기반 (P-04)
- 결정 포인트 확정 + 권장 근거 제시 (F1 6 건, F5 3 건)
- **기술 정정 조기 발견** 기능 (P-15) — Tailwind 4 케이스

**약점**:
- F1 같은 대규모 Feature (Standard + Greenfield) 는 결정 포인트 6+ 건 확정이 버거움 — PRD 와 중복되는 깊이의 분석 수행
- Slug 선정 근거가 Draft §1 에 개별 서술되어 일관성 검증 어려움 (기존 컨벤션 참조 부재)

**개선 제안**:
- Draft 에이전트가 **프로젝트 기술 스택 자동 스캔** (package.json + config 파일) 하여 기술 정정 자동 감지 확대 (현재는 Tailwind 4 만 우연 발견)
- Slug 컨벤션 SSOT (`f{N}-{kebab-case}` 또는 프로젝트별 설정) 문서화 + 자동 생성 후 사용자 확인

### A-6. `/plan-prd` (PRD 10 섹션 작성)

- **사용 횟수**: 1 회 (F1 만, F5 는 Lite 로 PRD 생략)
- **호출 에이전트**: `plan-prd-writer` + `plan-reviewer`
- **실제 소요**: writer 7.7 분 + reviewer 2.3 분 = 10 분

**강점**:
- 10 섹션 (Overview / Problem / Goals / User Stories / Requirements / UX / Tech / Milestones / Risks / SM) 표준
- Epic §2 지표 직접 인용 (IMP-AGENT-011 준수)
- REQ/NFR/SM 정량 ID 부여
- PCC 5 종 자동 검증으로 품질 보장 (P-06)

**약점**:
- PRD 길이 (~460 라인, 10 섹션) 가 **단일 파일** — 섹션별 파일 분할 옵션 부재
- Tailwind 4 정정 사항을 Draft §5.1 에서 PRD §7.1 로 전파하는 과정이 에이전트 내부 처리 (암묵) — 다른 기술 정정 케이스에서 동일 보장?
- PCC 5 종 은 기본 flat 구조 기준 (N-14) — Epic 계층 도입 반영 미흡

**개선 제안**:
- PRD 분할 옵션 (`--split-sections`): 10 섹션을 `.plans/drafts/{slug}/prd/{NN}-{section}.md` 로 분할
- PCC 확장 (I-10) — PCC-07 (binding 무결성) · PCC-08 (상태 SSOT) · PCC-09 (매트릭스 현재성)

### A-7. `/plan-bridge` (개발 핸드오프)

- **사용 횟수**: 2 회 (F5, F1)
- **호출 에이전트**: `plan-bridge-writer`
- **실제 소요**: F5 ~7 분, F1 ~13 분

**강점**:
- 5 파일 패키지 구조 (P-05) — Product Context / Scope / Decisions / Implementation Hints / Epic Binding
- Epic §2 지표 단독 충족 매핑 테이블 (08-epic-binding §3-2)
- TASK 힌트 + PR 매핑 + 예상 소요 자동 제시

**약점**:
- **5 파일 정보 중복** (N-06) — Epic 지표·범위 등이 01/02/03/08 반복 인용
- Bridge 가 Epic 파일 수정하지 않는 원칙을 매번 프롬프트로 전달 — 파일 소유권 매트릭스 (I-03) 부재
- F1 Bridge 는 Tailwind 4 정정 SSOT 를 02-scope-boundaries.md §4 로 지정했으나 다른 에이전트 (dev-implementer) 가 이 관례를 인식 가능한지 불명

**개선 제안**:
- I-11 (Bridge 5 파일 경량화) 적용 → 링크 + 1~2 문장 요약 원칙
- I-03 (파일 소유권 매트릭스) 자동 주입

---

## Part B. 에이전트 (6 종)

### B-1. `plan-idea-collector`

- **호출 횟수**: 2 회 (F5, F1)
- **도구 권한**: Read / Grep / Glob / Write / Edit / Bash
- **평균 처리 시간**: ~2.3 분

**수행 작업 품질**:
- IDEA 10 섹션 일관 구조 ✅
- backlog.md 행 추가 + Epic Children F{N} IDEA 필드 자동 갱신 ✅ (IMP-AGENT-010)
- 당일 채번 (001 → 002) 로직 ✅

**관찰된 이슈**:
- Epic Brief `§7 자식 IDEA 링크` 는 갱신하나 `§3 자식 Feature 목록`의 `(IDEA-{미정})` 표기는 미갱신
- backlog.md 신규 생성 시 "마지막 채번" 테이블 + 변경 이력 + 상태 범례 등 풍부한 기본 내용 제공 (긍정)

**개선 제안**:
- Brief §3 자동 갱신 추가
- 에이전트 출력 표준 포맷 (I-09) 적용

### B-2. `plan-idea-screener`

- **호출 횟수**: 2 회
- **도구 권한**: Read / Grep / Glob / Write / Edit / Bash
- **평균 처리 시간**: ~2.5 분

**수행 작업 품질**:
- RICE 4 축 근거 파일·라인 인용 우수 ✅
- Lite/Standard Lane 가중 조정 판정 로직 작동 (F5 5.95 → Go, F1 1.89 → Go)
- IDEA §8 Screening 섹션 추가 + 상태 `inbox → screened` 전이 + backlog 갱신 ✅

**관찰된 이슈**:
- Lane 가중 조정 규칙이 에이전트 내부 룰 (N-05)
- Go 판정 시 "Critical checkpoint, 사용자 승인 대기" 명시는 좋으나, Hold/Kill 대안 분석이 형식적 (실제 대안 선택 가이드 부족)

**개선 제안**:
- I-05 (RICE 가중 규칙 SSOT) 참조 룰 명시
- Hold/Kill 판정 시 **구체 대안 경로** 제시 강화 (예: "이 Feature 를 F2 로 합치면 Effort 50% 감소 + 의존성 해소")

### B-3. `plan-draft-writer`

- **호출 횟수**: 2 회
- **도구 권한**: Read / Grep / Glob / Write / Edit
- **평균 처리 시간**: F5 ~4.4 분, F1 ~7.9 분

**수행 작업 품질**:
- 3 중 판정 (Lane/시나리오/Feature 유형) 확정 + 결정 포인트 확정 ✅
- Routing metadata 12 필드 JSON 생성 ✅
- **프로젝트 기술 스택 실제 확인** (Tailwind 4 발견) ✅

**관찰된 이슈**:
- F1 Draft 는 결정 포인트 6 건 모두 "권장 근거 2~3 문장" 서술 — 이는 Draft 수준을 넘어 PRD 내용 일부 선행 (PRD 로 역할 넘김 불명확)
- Slug 선정 근거를 Draft §1 에 서술 (컨벤션 SSOT 없음)

**개선 제안**:
- 결정 포인트 확정 깊이 조절 — Draft 는 "결정값 + 1 문장 근거" 수준, 상세 근거는 PRD 에서
- 프로젝트 스캔 범위 확장 — Tailwind 외 Next.js / React / TypeScript / 테스트 프레임워크 version 등 자동 검증

### B-4. `plan-prd-writer`

- **호출 횟수**: 1 회 (F1)
- **도구 권한**: Read / Grep / Glob / Write / Edit
- **처리 시간**: ~7.7 분

**수행 작업 품질**:
- 10 섹션 + 각 섹션 REQ/NFR/SM 정량 ID 부여 ✅
- Epic §2 지표 4 양쪽 인용 (Goals + Success Metrics) ✅ (IMP-AGENT-011)
- Tailwind 4 정정을 §7.1 경고 blockquote 로 명시 ✅
- Epic 메타 라인 + 자매 Feature 링크 제시 ✅

**관찰된 이슈**:
- **사용자 스토리 §4** 가 7 건으로 자연스러우나 모두 "As a / I want / So that" 3 부 형식 엄격 준수 — 일부 스토리는 더 간결해도 무방
- §9 Risks 가 9 건 (R1~R9) — 다수는 중복 맥락 (R3 hydration, R7 Turbopack 등 세분화) — 실제 우선순위는 2~3 건

**개선 제안**:
- User Story 형식 유연성 (일부 축약 허용)
- Risks 섹션에서 "High/Medium/Low" 분류로 우선순위 명시 (현재 영향/확률 2 컬럼)

### B-5. `plan-reviewer`

- **호출 횟수**: 1 회 (F1 PRD PCC 검증)
- **도구 권한**: Read / Grep / Glob (Read-only)
- **처리 시간**: ~2.3 분

**수행 작업 품질**:
- PCC 5 종 각 PASS/WARN/FAIL 명확 판정 ✅
- 증거 파일·라인 인용 (L85-89 등) ✅
- Low 이슈 2 건도 놓치지 않고 보고 ✅ (Non-Blocking 명시)
- Read-only 이므로 메인 세션 캐시 영향 없음 ✅ (P-07)

**관찰된 이슈**:
- PCC 항목이 5 종 고정 — Epic 계층 관련 PCC-07~09 부재 (N-14)
- PCC-02 "Draft ↔ PRD 일관성" 검증 시 Draft §4 결정 포인트 6 → PRD §7 Tech/§6 UX 매핑 테이블 수작업 작성 — 자동화 여지

**개선 제안**:
- I-10 (PCC 확장) — Epic binding / Feature 상태 SSOT / 의존성 매트릭스 현재성 추가
- Draft → PRD 매핑 자동 생성 (edit-coordinates 기반)

### B-6. `plan-bridge-writer`

- **호출 횟수**: 2 회 (F5, F1)
- **도구 권한**: Read / Grep / Glob / Write / Edit / Bash
- **평균 처리 시간**: F5 ~6.4 분, F1 ~12.5 분

**수행 작업 품질**:
- Feature Package 5 파일 생성 + 각 역할 분리 ✅
- 08-epic-binding §3-2 Epic 지표 매핑 테이블 ✅
- TASK 힌트 + PR 매핑 + 예상 소요 정량 ✅
- **Epic 파일 편집 금지 원칙** 준수 (메인 담당 영역 침범 안 함) ✅

**관찰된 이슈**:
- **파일 중복** (N-06) — Epic 지표·Feature 범위·의존성이 5 파일에 반복
- F1 은 Tailwind 4 정정 SSOT 를 02-scope-boundaries.md §4 로 지정했으나 03/04 에는 `tailwind.config.ts` 언급 0 건 강제 — **수동 정책 적용**. 다른 에이전트가 이 관례를 자연스럽게 이어갈지 불명.
- F1 Bridge 는 F5 와 달리 "자매 Feature PR-6 순서 의존" 명시 — 정교한 협업 설계이나 Epic `01-children-features.md` §2 의존성 매트릭스와 동기화는 수동

**개선 제안**:
- I-11 (5 파일 경량화) — 링크 + 요약 원칙
- Tailwind 4 같은 정정 SSOT 를 **메타데이터** (routing-metadata 확장 필드) 로 옮겨 다른 에이전트가 기계적으로 참조 가능

---

## Part C. 기타 도구 (본 세션 활용)

### C-1. TodoWrite

- **사용 횟수**: 약 10 회 (Phase A Step 진행에 따라 갱신)
- **평가**: Phase A 9 단계 진행률 추적에 유용. 다만 Epic 로드맵 §4 의 Step 정의와 이중화 (수동 동기).
- **개선**: I-17 (Phase 진행률 가시화) 와 통합 — Epic 로드맵 ↔ TodoWrite 자동 동기

### C-2. Bash (mv, sed, grep, git)

- **사용 횟수**: 6 회
- **평가**: Epic 파일 이동 + 잔존 링크 정리에 효과적. Windows Git Bash 에서 sed `-i` 정상 작동.
- **개선**: I-01 (자동 링크 갱신 도구) 내부화 후 직접 Bash 사용 빈도 감소

### C-3. Read / Edit / Write

- **사용 횟수**: Read ~15 회, Edit ~50 회, Write ~6 회
- **평가**: 표준 도구. 캐시 invalidation 이슈 (N-03) 가 반복.
- **개선**: I-04 (Read 캐시 자동 재인증)

### C-4. Agent tool (서브에이전트 호출)

- **사용 횟수**: 10 회 (6 에이전트 × 1~2 회)
- **평가**: 에이전트별 역할 분리 효과적. 다만 동일 파일 편집 race + 출력 포맷 불일치 (N-02, N-10)
- **개선**: I-03 (파일 소유권 매트릭스), I-09 (출력 표준)

---

## 정리 — 에이전트 우선순위 개선

| 에이전트 | Severity | 주요 개선 |
|---------|:---:|----------|
| plan-idea-collector | Medium | Epic Brief §3 자동 갱신 + slug 제안 |
| plan-idea-screener | High | RICE Lane 가중 규칙 SSOT 참조 (I-05) |
| plan-draft-writer | Medium | 프로젝트 기술 스택 자동 스캔 확대 |
| plan-prd-writer | Medium | User Story 유연성 + Risks 우선순위 분류 |
| plan-reviewer | Medium | PCC-07~09 추가 (I-10) |
| plan-bridge-writer | High | 5 파일 경량화 (I-11) + 중복 제거 |

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-23 | 초안 — Phase A Step 1~8 경험 기준 커맨드 7 + 에이전트 6 상세 피드백 |
