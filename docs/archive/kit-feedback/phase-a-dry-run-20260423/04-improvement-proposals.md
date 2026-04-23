# 04. Improvement Proposals — 구체 개선 제안

> Pain-points ([03-pain-points.md](./03-pain-points.md)) 와 1:N 매핑된 구체 개선 제안 18 건. 각 항목은 "문제 → 제안 → 구현 예시 → 우선순위 → 난이도 → 예상 효과" 구조.

---

## I-01. Epic 전이 자동 링크 갱신 도구

- **연결**: [N-01](./03-pain-points.md#n-01-epic-디렉터리-전이-시-대량-링크-갱신-부담-critical) 🔴 Critical
- **문제**: `draft → planning → active` 전이 시 13 파일의 `10-planning/EPIC- → 20-active/EPIC-` 경로를 수동 갱신해야 함.
- **제안**:
  - `/plan-epic advance --to={state}` 커맨드에 **자동 링크 재작성** 통합
  - 내부적으로 `sed` 또는 정규식 기반 find-replace 실행
  - 전이 전/후 상태 경로를 알고 있으므로 안전한 패턴 `/{prev-state}/EPIC-{ID}/` → `/{new-state}/EPIC-{ID}/` 만 치환 (설명·이력 서사 보존)
- **구현 예시**:
  ```bash
  # /plan-epic advance EPIC-20260422-001 --to=active 내부 단계
  1. 게이트 검증 (자식 Feature approved ≥ 1)
  2. 파일 이동: mv .plans/epics/10-planning/EPIC-... .plans/epics/20-active/EPIC-...
  3. 자동 링크 재작성:
     find .plans -type f -name "*.md" -exec sed -i 's|/10-planning/EPIC-20260422-001/|/20-active/EPIC-20260422-001/|g' {} \;
  4. index.md 갱신
  5. 변경 이력 append
  ```
  - 또는 Node.js 스크립트 `src/claude/plan/hooks/epic-advance-rewrite.js` 로 추출해 `/plan-epic advance` 가 호출
- **우선순위**: 🔴 Critical
- **난이도**: Medium (sed 는 안전 패턴 정의 + 변경 이력 서사 보존 테스트 필요)
- **예상 효과**: Epic advance 수동 부담 ~90% 감소 (5 분 → 30 초)

---

## I-02. Feature 상태 SSOT + 자동 동기화

- **연결**: [N-04](./03-pain-points.md#n-04-feature-상태-ssot-부재--4-곳-동기-부담-high) 🟠 High
- **문제**: Feature 상태가 IDEA frontmatter · backlog.md · Epic Children §1 · binding §7 등 4 곳에 분산되어 수동 동기화 부담.
- **제안**:
  - **IDEA frontmatter 를 SSOT 로 지정**
  - 나머지 3 곳은 hook 으로 자동 동기화
  - `plan-state-sync.js` 훅 (`.claude/hooks/` 또는 `src/claude/plan/hooks/` 에 배치)
    - Trigger: `PreToolUse` 또는 `UserPromptSubmit` (Edit 감지)
    - Action: IDEA frontmatter `상태:` 값 변경 감지 시 나머지 3 곳 자동 업데이트
- **구현 예시**:
  ```javascript
  // plan-state-sync.js pseudo-code
  const ideaFiles = glob('.plans/ideas/*/IDEA-*.md')
  const states = new Map()
  for (const f of ideaFiles) {
    const fm = parseFrontmatter(f)
    states.set(fm.id, fm.status)
  }
  // backlog.md 의 각 row 상태 컬럼 갱신
  // Epic `01-children-features.md` §1 F{N} 섹션의 `**상태**:` 갱신
  // Feature Package `08-epic-binding.md` §7 상태 동기 표 갱신 (현재 시점 row)
  ```
  - 또는 `/plan-status-sync` 서브커맨드로 수동 실행도 제공
- **우선순위**: 🟠 High
- **난이도**: Medium (여러 파일 패턴 매칭 + 안전한 in-place edit)
- **예상 효과**: 상태 전이 시 동기화 부담 제거 (4 수동 Edit → 0 Edit). 불일치 리스크 제거.

---

## I-03. 에이전트 파일 소유권 매트릭스

- **연결**: [N-02](./03-pain-points.md#n-02-에이전트-간-epic-파일-편집-race-위험-high) 🟠 High
- **문제**: 병렬 에이전트 호출 시 Epic 공통 파일 (`01-children-features.md`) 편집 race. 매번 "Epic 파일 편집 금지" 를 프롬프트로 전달해야 함.
- **제안**:
  - 각 파일 유형별 **소유 에이전트** 명시하는 매트릭스 (`.claude/rules/agent-file-ownership.md`)
  - "1차 작성자 / 후속 갱신 담당자 / 메인 전담 (race 위험)" 3 구분
  - 에이전트 `tools:` 필드에 직접 파일 경로 허용 목록 포함 가능 (향후 enhancement)
- **구현 예시**:
  ```markdown
  # agent-file-ownership.md

  | 파일 유형 | 1차 작성 | 후속 갱신 | 메인 전담 (race 위험) |
  |-----------|---------|----------|---------------------|
  | `.plans/ideas/00-inbox/IDEA-*.md` | plan-idea-collector | plan-idea-screener, plan-draft-writer, plan-prd-writer, plan-bridge-writer | — |
  | `.plans/ideas/backlog.md` | plan-idea-collector | plan-idea-screener | — |
  | `.plans/epics/*/EPIC-*/00-epic-brief.md` | /plan-epic (메인) | plan-idea-collector (§7 IDEA 링크만) | 메인 (§3 범위, §4 표 등) |
  | `.plans/epics/*/EPIC-*/01-children-features.md` | /plan-epic (메인) | plan-idea-collector (F{N} IDEA 필드만) | **메인 전담** (§1 상태, §2 매트릭스 등) |
  | `.plans/drafts/{slug}/01-draft.md` | plan-draft-writer | — | — |
  | `.plans/drafts/{slug}/02-prd.md` | plan-prd-writer | — | — |
  | `.plans/features/active/{slug}/00-context/01-04.md` | plan-bridge-writer | — | — |
  | `.plans/features/active/{slug}/00-context/08-epic-binding.md` | plan-bridge-writer | — | 메인 (§1 Epic 상태 라인, §7 상태 동기) |
  ```
- **우선순위**: 🟠 High
- **난이도**: Low (문서화 + 에이전트 프롬프트 자동 주입)
- **예상 효과**: race 차단 + 에이전트 프롬프트 작성 부담 감소

---

## I-04. Read 캐시 자동 재인증

- **연결**: [N-03](./03-pain-points.md#n-03-read-캐시-invalidation-수동-대응-high) 🟠 High
- **문제**: 에이전트가 파일 수정 후 메인 Edit 시 "File has not been read yet" 에러 반복.
- **제안**:
  - **Option A (단기)**: `agent-completion-cache-invalidate` 훅 개선 — 수정 파일 목록을 구조화 JSON 으로 기록 → 메인 세션의 다음 Edit 이 해당 파일 대상이면 자동 Read 선행
  - **Option B (중기)**: 메인 세션에 "에이전트가 편집한 파일" 리스트를 system reminder 로 지속 노출 + Edit 도구가 자동 Read 선행
  - **Option C (장기)**: 에이전트 종료 시 수정 파일 내용을 메인 세션 캐시에 전달 (커뮤니케이션 프로토콜 확장)
- **구현 예시** (Option A):
  ```javascript
  // agent-completion-cache-invalidate.js (hook)
  // 에이전트 완료 시
  const modifiedFiles = detectAgentEditsFromSession()
  // 메인 세션 매니페스트에 기록
  writeFileSync('.claude/state/pending-reread.json', JSON.stringify(modifiedFiles))
  ```
  - 메인 Edit 도구 전 hook: `pending-reread.json` 확인 → 대상 파일이면 자동 Read → 목록에서 제거
- **우선순위**: 🟠 High
- **난이도**: Medium (hook + tool integration)
- **예상 효과**: Edit 실패 0 건 + 세션 흐름 매끄러움

---

## I-05. RICE Lane 가중 조정 규칙 SSOT 문서화

- **연결**: [N-05](./03-pain-points.md#n-05-rice-litestandard-lane-가중-조정-규칙-불투명-high) 🟠 High
- **문제**: "Lite Lane 가중 조정으로 Go 승격" / "Standard Lane 가중" 같은 규칙이 에이전트 내부 판단. SSOT 없음.
- **제안**:
  - `.claude/rules/rice-lane-weighted-adjustment.md` 신설
  - 공식 임계값 (Go ≥ 10 / Hold 2~10 / Kill < 2) + Lane 별 보정 규칙 명시
  - 에이전트 `plan-idea-screener` 가 이 룰을 직접 참조
- **구현 예시**:
  ```markdown
  # RICE Lane 가중 조정 규칙

  ## 1. 공식 Raw 임계값

  | 판정 | Raw RICE |
  |:---:|:---:|
  | Go | ≥ 10.0 |
  | Hold | 2.0 ~ 10.0 |
  | Kill | < 2.0 |

  ## 2. Lane 가중 조정

  ### 2-1. Lite Lane 승격 조건
  Raw RICE 가 Hold 범위 (2.0~10.0) 인 경우, 다음 **3 조건 모두** 충족 시 Go 로 승격:
  - Lane = Lite (`triggers_matched = []`)
  - Effort ≤ 2 인·일
  - Confidence ≥ 80%
  - 선행 의존성 해소 효과 존재 (Epic 의존성 매트릭스 `→` 관계)

  ### 2-2. Standard Lane 승격 조건
  Raw RICE < 2.0 이거나 Hold 하단 (2.0~5.0) 인 경우, 다음 **4 조건 모두** 충족 시 Go 로 승격:
  - Lane = Standard (6 트리거 중 3+ 매칭)
  - Impact ≥ 3 (큼 이상)
  - Epic 필수 지표 직접 대응 (Single-충족 Feature)
  - 의존성 허브 역할 (다수 Feature 가 본 Feature 기반)

  ### 2-3. 승격 거부
  위 조건 미충족 시 Raw 판정 유지 (Hold 또는 Kill).

  ## 3. 로그 요구
  에이전트는 SCREENING 섹션에 다음 기록 필수:
  - Raw RICE 점수
  - 공식 판정
  - Lane 가중 조정 여부 + 충족 조건 항목
  - 최종 권장 판정
  ```
- **우선순위**: 🟠 High
- **난이도**: Low (룰 문서 작성 + 에이전트 프롬프트 참조 링크)
- **예상 효과**: 판정 투명성 + 재현성 + 사용자 의문 감소

---

## I-06. plan-epic advance 게이트 자동 검증

- **연결**: [N-07](./03-pain-points.md#n-07-plan-epic-advance-게이트-자동-검증-부재-medium) 🟡 Medium
- **문제**: 상태 전이 게이트 조건 (planning→active 는 자식 Feature approved ≥ 1 등) 을 사용자 수동 판단.
- **제안**:
  - `/plan-epic advance` 커맨드가 게이트 조건 자동 확인
  - 미충족 시 HARD FAIL + 구체 사유 + `--force` 옵션으로 덮어쓰기 (critical-checkpoint 로 사용자 경고)
- **구현 예시**:
  ```bash
  $ /plan-epic advance EPIC-20260422-001 --to=active

  # 내부 단계:
  1. 현재 상태 확인: .plans/epics/index.md 에서 EPIC-... 행 → `planning`
  2. 전이 방향 확인: planning → active (허용)
  3. 게이트 조건 자동 검증:
     - .plans/ideas/*/IDEA-*.md 중 `Epic: EPIC-20260422-001` frontmatter + `상태: approved` 인 파일 카운트
     - ≥ 1 이면 PASS
  4. 검증 실패 시:
     ERROR: 게이트 미충족 — 자식 Feature approved 0 건 (최소 1 필요)
     SUGGEST: /plan-screen 진행 후 사용자 Go 승인
     USE --force TO OVERRIDE (경고 로그 기록)
  5. PASS 시 파일 이동 + 링크 재작성 (I-01 와 통합)
  ```
- **우선순위**: 🟡 Medium
- **난이도**: Low (파일 스캔 + 조건 검증)
- **예상 효과**: 게이트 미충족 전이 차단 + 사용자 학습 지원

---

## I-07. Phase 로드맵 템플릿화

- **연결**: [N-08](./03-pain-points.md#n-08-phase-로드맵의-phase-bc-비이식성-medium) 🟡 Medium
- **문제**: Phase A 9 단계 로드맵이 A 전용 하드코딩. Phase B/C 는 별도 세션에서 유사 로드맵 수작업.
- **제안**:
  - `/plan-epic-phase generate --phase=B` 같은 서브커맨드 도입
  - 템플릿 (`plan-epic-workflow/templates/phase-roadmap.md`) 기반으로 Phase 내 자식 Feature 목록 + 9 단계 (IDEA/Screen/Advance/Draft/PRD/Bridge/Advance/Dev/Verify) 자동 생성
  - Phase 별 변수 주입: `{phase-slug}`, `{feature-list}`, `{start-date}`, `{end-date}`
- **구현 예시**:
  ```markdown
  # phase-roadmap.md 템플릿 (in plan-epic-workflow/templates/)

  ### Phase {PHASE} ({START} ~ {END}) — {TITLE}

  **이유**: {PHASE_RATIONALE}

  - **{FEATURES} 병렬/순차**
  {#each FEATURE}
  - {FEATURE_ID}: {FEATURE_SUMMARY}
  {/each}
  - 예상 완료: **M-Epic-{M_N}**

  ### Phase {PHASE} 실행 로드맵 (9 단계)

  Phase {PHASE} 는 `/plan-idea → /plan-screen → /plan-draft → ... → /dev-run` 파이프라인을 **{FEATURES}** 에 대해 수행...

  #### Step 1. {FEATURE[0]} IDEA 등록
  ...
  ```
  - 사용: `/plan-epic-phase generate --phase=B --features=F2,F4` → children-features.md §4 에 Phase B 로드맵 삽입
- **우선순위**: 🟡 Medium
- **난이도**: High (템플릿 엔진 + 변수 치환 + Epic 문서 안전 병합)
- **예상 효과**: Phase 전환 시 로드맵 작성 시간 10 분 → 30 초. Phase 간 구조 일관성.

---

## I-08. Epic advance fallback 경로 문서화

- **연결**: [N-09](./03-pain-points.md#n-09-git-mv-실패--대안-경로-문서화-부재-medium) 🟡 Medium
- **문제**: `git mv` 실패 (untracked 파일) 시 대안 경로 문서화 부재.
- **제안**:
  - `plan-epic-hierarchy.md` §4 "상태 머신" 에 **git mv fallback** 섹션 추가
  - `/plan-epic advance` 커맨드가 `git ls-files` 확인 후 자동으로 `git mv` vs `mv` 선택
- **구현 예시**:
  ```markdown
  ## 4-1. 파일 이동 방법 (git mv vs mv)

  ### 기본: git mv
  Epic 파일이 git tracked 상태이면 `git mv` 사용 (이력 보존).

  ### Fallback: 일반 mv
  `git mv` 실패 시 (source directory is empty 에러 등) 일반 `mv` 로 이동.
  - 발생 조건: `.plans/` 가 아직 커밋 전이거나 `.gitignore` 에 포함된 경우
  - 대응: `git ls-files .plans/epics/{state}/EPIC-.../` 로 tracked 여부 확인 후 분기
  - 주의: 일반 `mv` 는 git 이력 추적 단절 — 이후 커밋 시 delete+add 로 인식

  ### 자동 분기 커맨드
  `/plan-epic advance` 내부에서 tracked 여부 감지 후 자동 선택.
  ```
- **우선순위**: 🟡 Medium
- **난이도**: Low (문서 + 커맨드 분기 로직)
- **예상 효과**: 신규 사용자 당황 방지 + 일관된 성공률

---

## I-09. Writer 에이전트 출력 포맷 표준화

- **연결**: [N-10](./03-pain-points.md#n-10-에이전트-보고-형식-불일치-medium) 🟡 Medium
- **문제**: writer 계 에이전트 (idea-collector, draft-writer, prd-writer, bridge-writer) 각자 다른 보고 형식.
- **제안**:
  - IMP-AGENT-002 (reviewer 표준화) 를 writer 계로 확장 — 예: IMP-AGENT-012 writer 출력 표준
  - 공통 섹션: 생성/수정 파일 (경로·크기·라인수) / 주요 결정 (있으면) / 검증 결과 / 다음 단계 / Agent Edit Race 주의
- **구현 예시**:
  ```markdown
  # writer-output-format.md (표준)

  ## 필수 섹션

  ### 1. 생성 / 수정 파일
  | 파일 | 상태 | 크기 | 주요 섹션 |
  |------|:---:|-----:|----------|
  | ... (절대 경로) | 신규/수정 | XX KB | §1, §2, §N |

  ### 2. 주요 결정 (해당 시)
  - 결정 항목 1: 값 + 근거 2~3 문장
  - ...

  ### 3. 검증 결과 (해당 시)
  - 자동 검증: PASS/FAIL + 이유
  - 수동 검증 권장: 항목 리스트

  ### 4. 다음 단계
  - 직접 다음 커맨드: `/plan-...`
  - 선행 조건: ...

  ### 5. Agent Edit Race 주의
  - 수정 파일 목록 (메인 Read 재호출 대상)
  ```
- **우선순위**: 🟡 Medium
- **난이도**: Low (표준 문서 + 에이전트 프롬프트 업데이트)
- **예상 효과**: 사용자 보고 해석 시간 감소 + 오케스트레이션 편의

---

## I-10. PCC 항목 확장 (Epic 계층 반영)

- **연결**: [N-14](./03-pain-points.md#n-14-pcc-항목-확장-누락-epic-계층-도입-반영-미흡-medium) 🟡 Medium
- **문제**: plan-reviewer PCC 5 종 이 flat 구조 기준. Epic 계층 검증 부재.
- **제안**:
  - PCC-07: Epic ↔ Feature binding 양방향 링크 무결성 (IMP-AGENT-010 정합)
  - PCC-08: Feature 상태 SSOT 동기 (I-02 와 연동)
  - PCC-09: Epic 의존성 매트릭스 현재성 (Phase 실행 상 반영)
- **구현 예시**:
  ```markdown
  ### PCC-07: Epic Binding 양방향 무결성

  검증 항목:
  - Feature `08-epic-binding.md` 의 Epic ID / 경로 / 상태 라인 ↔ Epic `00-epic-brief.md` `01-children-features.md` §1 F{N} 의 IDEA 필드
  - 양쪽 모두에서 참조 존재 + 상태 일치
  - 불일치 시 FAIL + 권장 수정

  ### PCC-08: Feature 상태 SSOT 동기

  검증 항목:
  - IDEA frontmatter `상태:` ↔ backlog.md 행 상태 컬럼
  - ↔ Epic Children §1 F{N} `**상태**:` 필드
  - ↔ binding §7 상태 동기 표의 현재 시점 row
  - 4 곳 일치 여부

  ### PCC-09: 의존성 매트릭스 현재성

  검증 항목:
  - Epic Children §2 의존성 매트릭스에 명시된 관계 (`✓`, `→`, `X`, `△`) 와 실제 Phase 실행 순서 정합
  - 예: F5 ↔ F2 `→` 인데 두 Feature 가 같은 Phase 에 배치되면 WARN
  ```
- **우선순위**: 🟡 Medium
- **난이도**: Low (기존 plan-reviewer 확장)
- **예상 효과**: Epic 계층 특유 불일치 조기 발견

---

## I-11. Bridge 5 파일 경량화 + 중복 최소화

- **연결**: [N-06](./03-pain-points.md#n-06-bridge-5-파일의-정보-중복-golden-13-위반-소지-medium) 🟡 Medium
- **문제**: `00-context/01-04` + `08-epic-binding.md` 5 파일이 IDEA/Draft/PRD 정보를 반복 인용.
- **제안**:
  - **Option A**: 각 파일에서 "링크 + 1~2 문장 요약" 원칙 적용 (전문 복사 금지)
  - **Option B**: 01-03 을 단일 `00-context.md` 로 통합 (04 implementation-hints + 08 binding 은 유지)
  - **Option C**: 01-04 를 IDEA/Draft/PRD 에 역병합 (Feature Package = Draft + PRD + binding 만)
- **구현 예시** (Option A 권장):
  ```markdown
  # 00-context/01-product-context.md (경량화 후)

  ## 1. 목적
  본 Feature 의 목적은 [IDEA §1 원문 요약](../../../../ideas/00-inbox/IDEA-20260423-002.md#1-원문-요약) 참조.

  **한 줄 요약**: landing 전역 라이트 모드 인프라 구축 — 접근성 WCAG AA 확장

  ## 2. Epic 연결
  Epic §2 지표 4 단독 충족 — 상세 매핑은 [`08-epic-binding.md` §3-2](./08-epic-binding.md#3-2-f1-의-직접-기여-본-feature-단독-충족) 참조.

  ## 3. 성공 지표
  PRD §10 SM-1 ~ SM-10 승계. 상세: [PRD §10](../../../../drafts/f1-landing-light-theme/02-prd.md#10-success-metrics).
  ```
  - 10+ 라인 반복 인용 → 3~5 라인 링크
- **우선순위**: 🟡 Medium
- **난이도**: Low (bridge-writer 에이전트 프롬프트 수정 + 템플릿 경량화)
- **예상 효과**: Feature Package 총 라인 수 40~50% 감소 + golden #13 준수 + SSOT 부담 감소

---

## I-12. "수정 요청" 프로토콜 표준화

- **연결**: [N-11](./03-pain-points.md#n-11-수정-요청-채널-부재-medium) 🟡 Medium
- **문제**: 사용자 "수정" 선택 시 세부 사항 전달 형식 없음.
- **제안**:
  - Checkpoint 에서 "Y / 수정 / N" 3 옵션 명시 + "수정" 선택 시 자연어 prompt 유도
  - 에이전트 재호출 시 **이전 산출물 + 사용자 수정 지시** 를 구조화 prompt 로 전달
  - `/plan-revise {artifact-path}` 서브커맨드 도입 (선택)
- **구현 예시**:
  ```markdown
  # Checkpoint 응답 패턴

  에이전트 보고 말미에 고정 형식:

  > **승인 요청** (Checkpoint type: {type}):
  > - **Y** = 현재 결과 승인 → 다음 단계 진입
  > - **수정** = 세부 수정 요청 (예: "A 섹션 scope 재작성", "판정 Lite → Standard")
  > - **N** = 전면 거부 (재작업 불가 이유 명시)

  사용자가 "수정" 선택 시 에이전트가 재호출되어:
  {
    "prev_artifact": "...Draft path...",
    "user_modification_request": "사용자 자연어 지시",
    "preserved_sections": ["§1", "§2"],
    "revise_sections": ["§3", "§4"]
  }
  ```
- **우선순위**: 🟡 Medium
- **난이도**: Medium (Checkpoint 도구 + 에이전트 재호출 프로토콜)
- **예상 효과**: 수정 지시 명확성 + 재실행 시 이전 컨텍스트 보존

---

## I-13. /plan-epic 조회 커맨드 실사용성 향상

- **연결**: [N-12](./03-pain-points.md#n-12-epic-showlist-커맨드-미검증-medium) 🟡 Medium
- **문제**: `/plan-epic list`, `/plan-epic show` 커맨드 정의되어 있으나 사용 안 됨.
- **제안**:
  - `/plan-epic show` 출력에 Phase 진행률 + 자식 Feature 상태 + 다음 Checkpoint 포함
  - `/plan-epic list --status=active` 는 현재 진행 중 Epic 한 눈에 보기
  - 문서화에 "Epic 정보 빠르게 확인하려면 `show` 권장" 명시
- **구현 예시**:
  ```bash
  $ /plan-epic show EPIC-20260422-001

  # Epic: dash-preview Phase 4 — Phase 3 피드백 반영
  - ID: EPIC-20260422-001
  - 상태: active
  - 기간: 2026-04-23 ~ 2026-05-20 (M-Epic-1: 05-06 / M-Epic-2: 05-14 / M-Epic-3: 05-20)
  - Phase 진행률: A (기획 완료, Step 8/9) / B (대기) / C (대기)

  ## 자식 Feature (5)
  | ID | 제목 | Phase | Lane | 상태 | TASK 진행 |
  |----|------|:---:|:---:|:---:|:---:|
  | F1 | 라이트 모드 (landing 전역) | A | Standard | approved (bridge 완료) | 0/8 |
  | F5 | UI 잔재 정리 | A | Lite | approved (bridge 완료) | 0/4 |
  | F2 | Mock 재설계 | B | Standard | pending | — |
  | F3 | 옵션↔요금 | C | Lite | pending | — |
  | F4 | 레이아웃+HitArea | B | Standard | pending | — |

  ## 다음 Checkpoint
  - Phase A Step 9 /dev-feature 진입 (사용자 지시 대기)

  ## 주요 링크
  - Epic Brief: ...
  - Children Features: ...
  ```
- **우선순위**: 🟡 Medium
- **난이도**: Medium (IDEA/backlog/Epic 집약 로직)
- **예상 효과**: 현재 상태 파악 시간 감소 + 직접 Read 의존도 감소

---

## I-14. Feature 상태 머신 명시화

- **연결**: [N-13](./03-pain-points.md#n-13-feature-상태-vs-idea-상태-구분-불명확-medium) 🟡 Medium
- **문제**: IDEA 상태 vs Feature 상태 교차 관계 모호.
- **제안**:
  - `plan-epic-hierarchy.md` 에 **IDEA 상태** · **Feature 상태** 명확 구분 섹션 추가
  - 각 상태 전이 Trigger 명시 (어떤 커맨드가 언제 변경)
- **구현 예시**:
  ```markdown
  ## X. IDEA 상태 vs Feature 상태

  ### IDEA 상태 (IDEA frontmatter)
  - `inbox` → `screened` → `approved` → `archived`
  - Trigger:
    - inbox → screened: `/plan-screen` (에이전트) + 사용자 승인
    - screened → approved: 사용자 Go 판정 (Critical checkpoint)
    - approved → archived: `/plan-archive {slug}` (전체 Feature archive)

  ### Feature 상태 (Feature Package 레벨, Epic Children §1 + binding §7)
  - `pending` → `approved` → `active` → `archived`
  - Trigger:
    - pending → approved: IDEA approved 전이와 동기 (자동)
    - approved → active: `/dev-feature {path}` (Feature Package 활성화, TASK 생성)
    - active → archived: `/dev-verify` + `/dev-commit` + Feature 완료 후

  ### 교차 관계
  | IDEA 상태 | 해당 Feature 상태 |
  |-----------|------------------|
  | inbox | pending |
  | screened | pending (변화 없음) |
  | approved | approved (1:1 동기) |
  | archived | archived |

  Feature `active` 상태는 IDEA `approved` 하위 단계 — 같은 IDEA 가 여러 Feature 로 분해되는 경우 없음 (1:1).
  ```
- **우선순위**: 🟡 Medium
- **난이도**: Low (문서화)
- **예상 효과**: 사용자 혼란 제거 + 자동 동기화 (I-02) 설계 근거 제공

---

## I-15. TASK 힌트 역방향 동기 경로

- **연결**: [N-15](./03-pain-points.md#n-15-task-힌트-pr-분할-의-역방향-동기-부재-low) 🟢 Low
- **문제**: Bridge 단계 PR 분할 / TASK 힌트가 실제 구현 시 변경되면 기획 문서 stale.
- **제안**:
  - `/dev-feature` 또는 `/dev-run` 실행 시 **실제 TASK 구조** 를 Feature Package `04-implementation-hints.md` 로 역기록
  - TASK 기획 vs 실제 차이 변경 이력에 append
- **구현 예시**:
  ```markdown
  ## 04-implementation-hints.md — 갱신 패턴

  ### 5-A. 기획 단계 TASK 힌트 (bridge-writer 작성)
  | 예상 TASK ID | PR | 범위 | 예상 소요 |
  |--------------|-----|------|---------|
  | T-THEME-01 | PR-1 | ... | 1 인·일 |
  | ... | ... | ... | ... |

  ### 5-B. 실제 구현 TASK (dev-feature 단계에서 역기록)
  | 실제 TASK ID | PR | 범위 | 실제 소요 | 기획 대비 차이 |
  |--------------|-----|------|---------|-------------|
  | T-THEME-01 | PR-1 | ... | 0.5 인·일 | ▼ 0.5 |
  | T-THEME-02a | PR-1 | ... (쪼갬) | 0.5 인·일 | 분할 |
  | T-THEME-02b | PR-2 | ... | 0.3 인·일 | 분할 |

  ### 5-C. 기획 ↔ 실제 괴리 분석 (archive 시)
  - 계획 대비 -20% 단축 (원인: next-themes 의 `ThemeProvider` wrapper 로 T-THEME-02/03 통합)
  - ...
  ```
- **우선순위**: 🟢 Low
- **난이도**: Medium (dev-feature 확장 + 기록 책임 분담)
- **예상 효과**: 회고 품질 향상 + 미래 Phase 견적 정확도 개선

---

## I-16. dry-run 모드 도입

- **연결**: [N-16](./03-pain-points.md#n-16-dry-run--시뮬레이션-모드-부재-low) 🟢 Low
- **문제**: 신규 사용자 학습 / 복잡 Epic 실험을 위한 시뮬레이션 모드 없음.
- **제안**:
  - `/plan-epic --dry-run` 플래그 — 실제 파일 생성 없이 "이렇게 생성될 것" 요약 출력
  - `/plan-idea --dry-run` 등 주요 커맨드에 확장
- **구현 예시**:
  ```bash
  $ /plan-epic "TestEpic" --dry-run

  # [DRY-RUN] Epic 생성 시뮬레이션
  활성화 기준 검증:
  - 3+ Feature 동일 Theme: ❓ (자식 Feature 목록 필요)
  - cross-cutting 요구: ❓
  - 명시 의존성: ❓

  생성될 파일:
  - .plans/epics/00-draft/EPIC-20260423-003/00-epic-brief.md (~100 라인)
  - .plans/epics/00-draft/EPIC-20260423-003/01-children-features.md (~140 라인, Phase A 로드맵 포함)
  - .plans/epics/index.md (1 행 추가)

  제안 다음 단계:
  - /plan-idea "..." --epic=EPIC-20260423-003 로 자식 IDEA 등록
  - Epic advance planning 게이트: 자식 IDEA ≥ 1
  ```
- **우선순위**: 🟢 Low
- **난이도**: Medium (모든 커맨드에 dry-run 플래그 + 시뮬레이션 로직)
- **예상 효과**: 신규 사용자 learning curve 완만 + 실험적 Epic 탐색 비용 감소

---

## I-17. Phase 진행률 가시화

- **연결**: [N-17](./03-pain-points.md#n-17-사용자-경험-ux--진행률-가시성-부재-low) 🟢 Low
- **문제**: Phase A 9 단계 중 현재 위치 실시간 표시 없음.
- **제안**:
  - `/plan-epic show` 에 Phase 진행률 표시 (I-13 와 통합)
  - 에이전트 보고 말미에 "Phase {N} Step {X}/{Y}" 자동 표시
  - TodoWrite 와 Epic 로드맵 자동 동기화
- **구현 예시**:
  ```markdown
  # 에이전트 보고 말미 표준 형식 (IMP-AGENT-012 일부)

  ---

  ### Phase A 진행률

  [▓▓▓▓▓▓▓▓░] 8/9 (Step 8 Epic advance 완료)

  다음: Step 9 /dev-feature + /dev-run (병렬 구현)
  ```
- **우선순위**: 🟢 Low
- **난이도**: Low (표준 텍스트 삽입)
- **예상 효과**: 세션 장기화 시 방향 감각 유지

---

## I-18. 변경 이력 자동 append Hook

- **연결**: [N-18](./03-pain-points.md#n-18-문서-품질-관점--변경-이력-수동-append-의존-low) 🟢 Low
- **문제**: 모든 문서 변경 이력이 수동 append. 누락·granularity 불일치.
- **제안**:
  - `post-edit` hook 으로 변경 이력 자동 append
  - Edit 시 파일·날짜·요약 (사용자 또는 에이전트 지정) 수집 → 파일 말미 §N 변경 이력 append
- **구현 예시**:
  ```javascript
  // .claude/hooks/post-edit-history.js
  on('PostToolUse', ({tool, args}) => {
    if (tool !== 'Edit' && tool !== 'Write') return
    const file = args.file_path
    if (!file.endsWith('.md')) return

    // 변경 이력 테이블 위치 감지 (## N. 변경 이력 패턴)
    const content = readFileSync(file)
    const match = content.match(/## \d+\. 변경 이력\n\n\| 날짜 \| 내용 \|\n\|[\s\S]+?\n((?:\| .+ \|\n)+)/)
    if (!match) return

    // 오늘 날짜 + edit 요약 수집
    const date = new Date().toISOString().split('T')[0]
    const summary = await promptEditSummary() // 사용자에게 1 줄 요약 요청 (또는 자동 diff 분석)
    const newRow = `| ${date} | ${summary} |`

    // append
    ...
  })
  ```
- **우선순위**: 🟢 Low
- **난이도**: High (edit 요약 수집 UX + 패턴 감지 안정성)
- **예상 효과**: 변경 이력 누락 0 + granularity 일관성

---

## 우선순위 요약 (실행 로드맵 후보)

### v2.4.1 (긴급 개선, 2026-05 예상)
- **I-01** Epic 전이 자동 링크 갱신 🔴 Critical
- **I-02** Feature 상태 SSOT 자동 동기 🟠 High
- **I-03** 에이전트 파일 소유권 매트릭스 🟠 High
- **I-04** Read 캐시 자동 재인증 🟠 High
- **I-05** RICE Lane 가중 규칙 SSOT 🟠 High

### v2.5.0 (중기, 2026-Q3)
- **I-06** Advance 게이트 자동 검증
- **I-07** Phase 로드맵 템플릿화
- **I-08** git mv fallback 문서화
- **I-09** Writer 에이전트 출력 표준
- **I-10** PCC 항목 확장
- **I-11** Bridge 5 파일 경량화
- **I-12** 수정 요청 프로토콜
- **I-13** plan-epic show 개선
- **I-14** Feature 상태 머신 명시화

### Backlog (우선순위 Low)
- **I-15** TASK 힌트 역방향 동기
- **I-16** dry-run 모드
- **I-17** Phase 진행률 가시화
- **I-18** 변경 이력 자동 append

---

## 다음 단계 제안

1. **claude-kit 메인테이너 리뷰**: 본 제안 18 건을 실제 로드맵에 편입할지 판단
2. **스펙 작성**: 우선순위 High 이상 (I-01~I-05) 5 건을 `docs/plan/kit-2.4.1-roadmap/{IMP-KIT-NNN}-*.md` 형태 상세 스펙화
3. **IDEA 화**: 본 피드백을 `.plans/ideas/` 에 5~18 건의 IDEA 로 분할 등록 가능 (선택)

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-23 | 초안 — Phase A Step 1~8 경험 기준 개선 제안 18 건, 우선순위·난이도·효과 명시 |
