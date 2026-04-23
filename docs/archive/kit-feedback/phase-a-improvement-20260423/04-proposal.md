# 04. Proposal — 10 영역 개선 제안

> **목적**: 피드백 18 건을 **claude-kit 자산 영향** 관점에서 10 개선 영역으로 재구성. 각 영역은 "배경 → 제안 → 변경 자산 → 수용 기준 → TASK 분해" 구조.

**설계 원칙**:
- **신규 최소화**: 기존 커맨드·룰 확장 우선, 신규는 필요 시만
- **SSOT 원칙**: 중복 정보 금지 (golden #13)
- **Opt-in 유지**: 기존 사용자 플로우 하위 호환

---

## P-1. EPMV — Epic Move 자동화

> 🔴 **Critical** · v2.4.1 · BC 없음 · **3 TASK**

### 배경

Phase A 실행 시 Epic 상태 전이(`draft → planning → active`)가 수동 파일 이동 + 13 파일 링크 갱신 + 사용자 책임 게이트 검증 3 단계를 각각 수행. 생명주기당 3~4 회 발생 → 시간 낭비 + 누락 리스크.

**관련 피드백**: N-01(Critical) + N-07(Medium) + N-09(Medium) → EPMV AREA 통합

### 제안

`/plan-epic advance --to={state}` 커맨드에 **파일 이동 + 링크 재작성 + 게이트 검증** 3 동작을 1 커맨드 트랜잭션으로 통합.

```bash
$ /plan-epic advance EPIC-20260422-001 --to=active

# 내부 순서:
1. 현재 상태 조회 (.plans/epics/index.md)
2. 전이 허용 여부 검증 (draft→planning→active→completed→archived)
3. 게이트 자동 검증:
   - planning 진입: 자식 IDEA ≥ 1
   - active 진입: 자식 Feature approved ≥ 1
   - completed 진입: 자식 Feature 모두 completed
4. 파일 이동:
   - git ls-files 확인 → tracked 면 git mv, 아니면 mv (자동 분기)
5. 링크 재작성:
   - find .plans -name "*.md" -exec sed -i 's|/{prev}/EPIC-{ID}/|/{new}/EPIC-{ID}/|g' {} \;
6. index.md 갱신 (Epic 행의 상태 컬럼)
7. 변경 파일 목록 보고

게이트 미충족 시: HARD FAIL + 사유 + `--force` 옵션 안내 + Critical checkpoint 경고
```

### 변경 자산

| 자산 | 변경 유형 | 영향 |
|------|:---:|------|
| `src/claude/plan/commands/plan-epic.md` | 수정 | advance 섹션 확장 (내부 단계 + 플래그) |
| `src/claude/plan/scripts/epic-advance-rewrite.js` | **신규** | 링크 재작성 로직 추출 (테스트 가능성 향상) |
| `src/claude/plan/rules/plan-epic-hierarchy.md` | 수정 | §4 "상태 머신" 에 fallback 섹션 + tracked 분기 기록 |
| `src/claude/plan/skills/plan-epic-workflow/SKILL.md` | 수정 | advance 사용법 갱신 |

### TASK

- [T-EPMV-01](05-tasks/T-EPMV-01.md) — 자동 링크 재작성 구현 (sed 안전 패턴 + dry-run 플래그)
- [T-EPMV-02](05-tasks/T-EPMV-02.md) — git mv/mv 자동 분기 + rule 섹션 추가
- [T-EPMV-03](05-tasks/T-EPMV-03.md) — 게이트 자동 검증 통합

### 수용 기준

AC-1: 1 커맨드로 파일 이동 + 링크 재작성 + 게이트 검증 완료, 잔존 구 경로 0 개.

---

## P-2. FSTATE — Feature 상태 SSOT

> 🟠 **High** · v2.4.1 · BC 없음 · **2 TASK**

### 배경

Feature 상태(`pending/approved/active/archived`)가 4 곳(IDEA frontmatter · backlog 행 · Epic Children §1 · binding §7)에 분산. 한 곳 갱신 후 나머지 누락 시 `plan-epic-integrity.js` Phase 3 enable 전까지 감지 불가.

**관련 피드백**: N-04(High) + N-13(Medium) → FSTATE AREA

### 제안

**IDEA frontmatter `상태:` 를 SSOT 지정**. 변경 감지 시 hook 이 나머지 3 곳 자동 갱신.

#### P-2.1 IDEA 상태 vs Feature 상태 명시 (선행)

`plan-epic-hierarchy.md` 에 다음 섹션 추가:

```markdown
## X. IDEA 상태 vs Feature 상태 (SSOT)

### IDEA 상태 (IDEA frontmatter — SSOT)
- inbox → screened → approved → archived
- Trigger:
  - inbox → screened: /plan-screen (에이전트)
  - screened → approved: 사용자 Go 판정 (Critical checkpoint)
  - approved → archived: /plan-archive {slug}

### Feature 상태 (파생, 자동 동기)
- pending → approved → active → archived
- Trigger:
  - pending ↔ IDEA inbox/screened
  - approved ↔ IDEA approved (1:1 동기)
  - active: /dev-feature 호출 시점
  - archived ↔ IDEA archived
```

#### P-2.2 `plan-state-sync.js` 훅

```javascript
// Trigger: PostToolUse (Edit|Write) on IDEA 파일
// Action:
1. IDEA frontmatter 상태 변경 감지
2. 3 곳 자동 갱신:
   - backlog.md 해당 행의 상태 컬럼
   - Epic Children §1 F{N} 의 `**상태**:` 필드
   - Feature Package 08-epic-binding.md §7 상태 동기 표 (Epic 에 연결된 경우)
3. 에러 시 rollback + 사용자 경고
```

### 변경 자산

| 자산 | 변경 유형 | 영향 |
|------|:---:|------|
| `src/claude/plan/rules/plan-epic-hierarchy.md` | 수정 | 새 섹션 "IDEA 상태 vs Feature 상태" |
| `src/claude/plan/hooks/plan-state-sync.js` | **신규** | SSOT 동기 hook |
| `src/claude/plan/skills/plan-epic-workflow/templates/epic-binding.md` | 수정 | §7 상태 동기 표가 hook 가 갱신 대상임을 명시 |

### TASK

- [T-FSTATE-01](05-tasks/T-FSTATE-01.md) — plan-state-sync.js 훅 구현
- [T-FSTATE-02](05-tasks/T-FSTATE-02.md) — IDEA/Feature 상태 머신 SSOT 문서

### 수용 기준

AC-2: IDEA frontmatter 수정 → 나머지 3 곳 자동 갱신 (단일 Edit 로 4 곳 반영).

---

## P-3. RACE — 에이전트 충돌 방지

> 🟠 **High** · v2.4.1 · BC 없음 · **2 TASK**

### 배경

병렬 에이전트 호출 시 Epic 공통 파일(`01-children-features.md`) 동시 편집 race + 에이전트 완료 후 메인 Edit 시 Read 캐시 stale 에러.

**관련 피드백**: N-02(High) + N-03(High)

### 제안

#### P-3.1 파일 소유권 매트릭스 (신규 룰)

`src/claude/core/rules/agent-file-ownership.md` — 도메인 간 공유 SSOT:

```markdown
# Agent File Ownership Matrix

| 파일 유형 | 1차 작성 | 후속 갱신 | 메인 전담 (race 위험) |
|-----------|---------|----------|---------------------|
| `.plans/ideas/00-inbox/IDEA-*.md` | plan-idea-collector | plan-idea-screener/-draft-writer/-prd-writer/-bridge-writer | — |
| `.plans/ideas/backlog.md` | plan-idea-collector | plan-idea-screener | — |
| `.plans/epics/*/EPIC-*/00-epic-brief.md` | (메인 /plan-epic) | plan-idea-collector (§7 자식 IDEA 링크만) | 메인 (§3 범위 등) |
| `.plans/epics/*/EPIC-*/01-children-features.md` | (메인 /plan-epic) | plan-idea-collector (F{N} IDEA 필드만) | **메인 전담** (§1 상태, §2 매트릭스) |
| `.plans/drafts/{slug}/01-draft.md` | plan-draft-writer | — | — |
| `.plans/drafts/{slug}/02-prd.md` | plan-prd-writer | — | — |
| `.plans/features/active/{slug}/00-context/*.md` | plan-bridge-writer | — | — |
| `.plans/features/active/{slug}/00-context/08-epic-binding.md` | plan-bridge-writer | — | 메인(§1 Epic 상태, §7 상태 동기) |
```

각 에이전트 프롬프트는 본 룰을 참조 (프롬프트 차후 단계에서 주입).

#### P-3.2 Read 캐시 자동 재인증 개선

`agent-completion-cache-invalidate` hook(core)를 확장:
- 에이전트 종료 시 수정 파일 목록을 `.claude/state/pending-reread.json` 에 기록
- 메인의 다음 Edit 대상이 목록에 포함되면 자동 Read 선행
- 성공 시 목록에서 제거

### 변경 자산

| 자산 | 변경 유형 | 영향 |
|------|:---:|------|
| `src/claude/core/rules/agent-file-ownership.md` | **신규** | 도메인 간 공유 SSOT |
| `src/claude/core/hooks/agent-completion-cache-invalidate.js` | 수정 | 구조화 JSON 기록 |
| `src/claude/core/rules/verification.md` | 수정 | Agent Edit Race 섹션에 자동 재인증 섹션 추가 |

### TASK

- [T-RACE-01](05-tasks/T-RACE-01.md) — agent-file-ownership.md 룰 신설
- [T-RACE-02](05-tasks/T-RACE-02.md) — Read 캐시 자동 재인증 hook 개선

### 수용 기준

AC-3: 병렬 에이전트 호출 시 `01-children-features.md` 동시 편집 race 0 건.

---

## P-4. RICE — Lane 가중 규칙 SSOT

> 🟠 **High** · v2.4.1 · BC 없음 · **1 TASK**

### 배경

RICE 공식 임계값(Go ≥ 10 / Hold 2~10 / Kill < 2)과 실제 Lite/Standard 판정 결과 간 괴리를 `plan-idea-screener` 가 내부 룰로 해소. SSOT 없음 → 재현성·투명성 저하.

**관련 피드백**: N-05(High)

### 제안

`src/claude/plan/rules/rice-lane-weighted-adjustment.md` 신설. 공식 임계값 + Lane 별 보정 규칙 + 로그 요구사항 명시. `plan-idea-screener` 는 본 룰을 직접 참조.

규칙 요지:
- **Lite Lane 승격**: Raw Hold(2~10) + Effort ≤ 2 + Confidence ≥ 80% + 선행 의존성 해소 (4 조건 모두)
- **Standard Lane 승격**: Raw < 2 또는 Hold 하단(2~5) + Impact ≥ 3 + Epic 지표 단독 충족 + 의존성 허브 (4 조건 모두)
- **로그 필수**: Raw RICE + 공식 판정 + Lane 가중 조정 여부 + 충족 조건 항목 + 최종 권장 판정

### 변경 자산

| 자산 | 변경 유형 | 영향 |
|------|:---:|------|
| `src/claude/plan/rules/rice-lane-weighted-adjustment.md` | **신규** | SSOT |
| `src/claude/plan/agents/plan-idea-screener.md` | 수정 | 룰 참조 링크 + 로그 요구 명시 |
| `src/claude/plan/skills/plan-screening-workflow/SKILL.md` | 수정 | 룰 참조 섹션 추가 |

### TASK

- [T-RICE-01](05-tasks/T-RICE-01.md) — rice-lane-weighted-adjustment.md 신설 + 에이전트·스킬 참조

### 수용 기준

AC-4: screening 출력에 "Lane 가중 조정 + 충족 조건 항목" 명시. 룰 링크로 근거 추적 가능.

---

## P-5. BRDG — Bridge 최적화

> 🟡 **Medium** · v2.5.0 · ⚠ minor 가능 · **2 TASK**

### 배경

Feature Package `00-context/` 5 파일 정보 중복(golden #13 위반) + Writer 에이전트 출력 형식 불일치(IMP-AGENT-002 Writer 계 미적용).

**관련 피드백**: N-06(Medium) + N-10(Medium)

### 제안

#### P-5.1 Bridge 5 파일 경량화 (Option A — 링크+요약)

각 파일에서 IDEA/Draft/PRD 원문 인용 대신 **링크 + 1~2 문장 요약**:

```markdown
# 00-context/01-product-context.md (경량화 후)

## 1. 목적
[IDEA §1 참조](path). **한 줄 요약**: ...

## 2. Epic 연결
Epic §2 지표 N 단독 충족 — 상세는 [08-epic-binding.md §3-2](./08-epic-binding.md#3-2-...).

## 3. 성공 지표
PRD §10 SM-1 ~ SM-N 승계. 상세: [PRD §10](path).
```

예상 효과: Feature Package 총 라인 수 40~50% 감소.

#### P-5.2 Writer 출력 표준 (IMP-AGENT-012 명명 후속)

writer 계 에이전트(idea-collector/draft-writer/prd-writer/bridge-writer) 보고 공통 5 섹션:
1. 생성/수정 파일 (경로·크기·라인수)
2. 주요 결정 (해당 시)
3. 검증 결과 (해당 시)
4. 다음 단계 (직접 다음 커맨드 + 선행 조건)
5. Agent Edit Race 주의 (수정 파일 목록)

### 변경 자산

| 자산 | 변경 유형 | 영향 |
|------|:---:|------|
| `src/claude/plan/agents/plan-bridge-writer.md` | 수정 | 5 파일 경량화 원칙 반영 |
| `src/claude/core/rules/writer-output-format.md` | **신규** | SSOT |
| `src/claude/plan/agents/plan-idea-collector.md` | 수정 | 출력 표준 참조 |
| `src/claude/plan/agents/plan-draft-writer.md` | 수정 | 출력 표준 참조 |
| `src/claude/plan/agents/plan-prd-writer.md` | 수정 | 출력 표준 참조 |

### TASK

- [T-BRDG-01](05-tasks/T-BRDG-01.md) — Bridge 5 파일 경량화 (링크+요약 원칙)
- [T-BRDG-02](05-tasks/T-BRDG-02.md) — Writer 출력 표준 (IMP-AGENT-012)

### 수용 기준

AC-5: Bridge 5 파일 총 라인 수 40% 이상 감소 (F1 재실행 기준).

---

## P-6. PCC — 검증 항목 확장

> 🟡 **Medium** · v2.5.0 · BC 없음 · **1 TASK**

### 배경

`plan-reviewer` PCC 5 종이 flat 구조 기준. Epic 계층 특유 검증(binding 양방향 · 상태 SSOT · 매트릭스 현재성) 부재.

**관련 피드백**: N-14(Medium)

### 제안

PCC 확장 3 항목 (기존 5 종 유지):

- **PCC-07**: Epic Binding 양방향 무결성 — Feature `08-epic-binding.md` ↔ Epic `01-children-features.md` §1 F{N} cross-reference
- **PCC-08**: Feature 상태 SSOT 동기 — IDEA frontmatter ↔ backlog ↔ Children §1 ↔ binding §7 4 곳 일치
- **PCC-09**: 의존성 매트릭스 현재성 — Children §2 매트릭스 관계 ↔ 실제 Phase 실행 순서 정합

### 변경 자산

| 자산 | 변경 유형 | 영향 |
|------|:---:|------|
| `src/claude/plan/agents/plan-reviewer.md` | 수정 | PCC-07~09 추가 |
| `src/claude/plan/skills/plan-review-criteria/SKILL.md` | 수정 | 검증 항목 8 종 |
| `src/claude/plan/hooks/plan-epic-integrity.js` | 수정 | Phase 3 enable 시 PCC-07~09 와 일관성 보장 |

### TASK

- [T-PCC-01](05-tasks/T-PCC-01.md) — PCC-07~09 추가

### 수용 기준

AC-6: plan-reviewer 실행 시 8 종 검증 수행. PCC-07~09 는 v2.5.0 WARN 수준 (v2.5.1 FAIL 승격 고려).

---

## P-7. TMPL — Phase 로드맵 템플릿화

> 🟡 **Medium** · v2.5.0 · BC 없음 · **1 TASK**

### 배경

Phase A 9 단계 로드맵이 `01-children-features.md` §4 에 A 전용 하드코딩. Phase B/C 는 별도 세션에서 유사 작성 반복 (약 10 분/회).

**관련 피드백**: N-08(Medium)

### 제안

`/plan-epic-phase generate --phase={A|B|C} --features={F1,F2,...}` 서브커맨드:
- `phase-roadmap.md` 템플릿 기반으로 Phase 내 Feature + 9 단계 자동 생성
- 변수: `{phase-slug}`, `{feature-list}`, `{start-date}`, `{end-date}`, `{phase-rationale}`
- 안전 병합: 기존 §4 존재 시 **중단** + `--overwrite` 플래그 명시

### 변경 자산

| 자산 | 변경 유형 | 영향 |
|------|:---:|------|
| `src/claude/plan/commands/plan-epic.md` | 수정 | `phase generate` 서브커맨드 추가 |
| `src/claude/plan/skills/plan-epic-workflow/templates/phase-roadmap.md` | **신규** | 템플릿 |
| `src/claude/plan/skills/plan-epic-workflow/SKILL.md` | 수정 | Phase 전환 섹션 갱신 |

### TASK

- [T-TMPL-01](05-tasks/T-TMPL-01.md) — Phase 템플릿화 + 서브커맨드

### 수용 기준

AC-7: `/plan-epic-phase generate --phase=B --features=F2,F4` 실행 시 Phase B 로드맵 자동 생성, Phase A 구조와 일관.

---

## P-8. SHOW — Epic 조회 실사용성

> 🟡 **Medium** · v2.5.0 · BC 없음 · **2 TASK**

### 배경

`/plan-epic show EPIC-...` 커맨드 정의되어 있으나 본 Dry-Run 세션 **0 회 사용**. 대신 메인 세션이 `index.md` 와 `children-features.md` 직접 Read. + Phase 진행률 가시성 부재.

**관련 피드백**: N-12(Medium) + N-17(Low)

### 제안

#### P-8.1 `/plan-epic show` 집약 출력

```bash
$ /plan-epic show EPIC-20260422-001

# Epic: dash-preview Phase 4 — Phase 3 피드백 반영
- ID: EPIC-20260422-001
- 상태: active
- 기간: 2026-04-23 ~ 2026-05-20 (M-Epic-1/2/3)
- Phase 진행률: A (기획 완료, 8/9) / B (대기) / C (대기)

## 자식 Feature (5)
| ID | 제목 | Phase | Lane | 상태 | TASK 진행 |
|----|------|:---:|:---:|:---:|:---:|
| F1 | ... | A | Standard | approved | 0/8 |
| ... |

## 다음 Checkpoint
- Phase A Step 9 /dev-feature (사용자 지시 대기)
```

#### P-8.2 에이전트 보고 Phase 진행률 표준

writer 계 에이전트 보고 말미에 표준 블록:

```markdown
### Phase A 진행률

[▓▓▓▓▓▓▓▓░] 8/9 (Step 8 Epic advance 완료)

다음: Step 9 /dev-feature + /dev-run (병렬 구현)
```

### 변경 자산

| 자산 | 변경 유형 | 영향 |
|------|:---:|------|
| `src/claude/plan/commands/plan-epic.md` | 수정 | `show` 출력 확장 |
| `src/claude/core/rules/writer-output-format.md` | 수정 | Phase 진행률 섹션 추가 (P-5 에서 신설 후) |

### TASK

- [T-SHOW-01](05-tasks/T-SHOW-01.md) — `/plan-epic show` 집약 출력 구현
- [T-SHOW-02](05-tasks/T-SHOW-02.md) — 에이전트 보고 Phase 진행률 표준

### 수용 기준

AC-8: `/plan-epic show EPIC-...` 호출 시 Phase 진행률 + Feature 상태 + 다음 Checkpoint 집약 확인.

---

## P-9. REVP — 수정 요청 프로토콜

> 🟡 **Medium** · v2.5.0 · BC 없음 · **1 TASK**

### 배경

Checkpoint 시 "Y/N/수정" 3 옵션 중 "수정" 선택 시 **세부 전달 형식 없음**. 에이전트 재호출 시 이전 산출물 + 수정 지시를 어떻게 결합할지 프로토콜 부재.

**관련 피드백**: N-11(Medium)

### 제안

#### P-9.1 Checkpoint 표준 응답 형식

```markdown
> **승인 요청** (Checkpoint type: {type}):
> - **Y** = 현재 결과 승인 → 다음 단계 진입
> - **수정** = 세부 수정 요청 (자연어, 예: "A 섹션 scope 재작성")
> - **N** = 전면 거부 (재작업 불가 이유 명시)
```

#### P-9.2 에이전트 재호출 프로토콜

```json
{
  "prev_artifact": "...Draft path...",
  "user_modification_request": "사용자 자연어 지시",
  "preserved_sections": ["§1", "§2"],
  "revise_sections": ["§3", "§4"]
}
```

선택적 `/plan-revise {artifact-path}` 서브커맨드.

### 변경 자산

| 자산 | 변경 유형 | 영향 |
|------|:---:|------|
| `src/claude/core/rules/checkpoint-policy.md` | 수정 | "수정 요청 표준 응답" 섹션 추가 |
| `src/claude/plan/commands/plan-revise.md` | **신규** (선택) | 선택적 서브커맨드 |
| `src/claude/plan/skills/plan-pipeline/SKILL.md` | 수정 | "수정 요청" 처리 패턴 |

### TASK

- [T-REVP-01](05-tasks/T-REVP-01.md) — 수정 요청 프로토콜 + `/plan-revise`(선택)

### 수용 기준

Checkpoint 시 사용자의 "수정" 선택이 구조화된 JSON 으로 에이전트에 재전달되어 이전 컨텍스트 손실 없이 재실행 가능.

---

## P-10. BKLG — Backlog 묶음

> 🟢 **Low** · Backlog · BC 없음 · **3 TASK**

### 배경

우선순위 Low 3 건(I-18 변경 이력 자동화 · I-16 dry-run · I-15 TASK 역방향 동기)을 단일 AREA 로 묶어 향후 활성화 조건 충족 시 구현.

**관련 피드백**: N-15(Low) + N-16(Low) + N-18(Low)

### 제안

각 TASK 는 스펙만 작성, 구현은 활성화 조건 충족 시.

### TASK

- [T-BKLG-01](05-tasks/T-BKLG-01.md) — 변경 이력 자동 append hook (edit 요약 UX 합의 후)
- [T-BKLG-02](05-tasks/T-BKLG-02.md) — dry-run 모드 (신규 사용자 온보딩 필요 시)
- [T-BKLG-03](05-tasks/T-BKLG-03.md) — TASK 힌트 역방향 동기 (Step 9 실사용 경험 후)

### 수용 기준

Backlog 유지. 활성화 조건 충족 시 우선순위 재평가.

---

## 11. 통합 릴리스 계획

### v2.4.1 (2026-05 예상)

**총 8 TASK** (Critical 3 + High 5):

```
T-FSTATE-02 (룰 문서) → T-RICE-01 (룰 문서) → T-RACE-01 (룰 문서)
                          ↓
T-EPMV-02 → T-RACE-02 → T-FSTATE-01 → T-EPMV-03 → T-EPMV-01
```

### v2.5.0 (2026-Q3)

**총 7 TASK** (Medium 7):

```
T-BRDG-02 (Writer 출력 표준) → T-BRDG-01 (Bridge 경량화)
T-PCC-01 (PCC 확장)
T-TMPL-01 (Phase 템플릿)
T-SHOW-01 → T-SHOW-02
T-REVP-01
```

### Backlog

**3 TASK** — 활성화 조건 충족 시.

---

## 12. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | 초안 — 10 영역 제안 (EPMV/FSTATE/RACE/RICE/BRDG/PCC/TMPL/SHOW/REVP/BKLG) + 릴리스 계획 |
