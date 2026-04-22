# claude-kit v2.3.0 → v2.4.0-beta.1 다운스트림 문서 동기화 계획 (Template Sync)

> **상태**: 계획 초안 v2 (2026-04-22)
> **범위**: claude-kit **v2.3.0 이후 shipped 된 모든 변경사항** (v2.3.1 IMP-AGENT 001~009 + kit-feedback-archiving Phase 3 + v2.4.0 beta Phase 2 Epic 도메인) 을 다운스트림 프로젝트 (예: `apps/landing`) 의 자동 생성 문서에 반영
> **대상 문서**: `CLAUDE.md` (kit-managed 섹션) + `CLAUDE-KIT-QUICKSTART.md`
> **상위 로드맵**: [`../kit-2.4.0-roadmap/README.md`](../kit-2.4.0-roadmap/README.md)
> **연관 IMP 시리즈**: [`../../archive/kit-agent-improvements-v2.3.1/`](../../archive/kit-agent-improvements-v2.3.1/) (shipped 2026-04-22) · [`../kit-agent-improvements-v2.4.0/`](../kit-agent-improvements-v2.4.0/) (IMP-AGENT-010~014 in planning)

---

## 0. 한 문장 요약

`apps/landing/CLAUDE.md` (kit-managed 섹션) + `CLAUDE-KIT-QUICKSTART.md` 가 **v2.3.0 상태로 고정** 되어 이후 shipped 된 **3 계열 변경** 이 반영 안 됨 — (1) **v2.3.1 IMP-AGENT 001~009** (신규 에이전트 2건 `dev-implementer` / `copy-implementer` + 에이전트 프롬프트 확장 + edit-coordinates v1.1 + frontmatter v1.1), (2) **kit-feedback-archiving Phase 3 + `/agent-report` 텔레메트리 + agent-telemetry 룰**, (3) **v2.4.0 beta Phase 2 Epic 도메인** (`/plan-epic`, `plan-epic-workflow` skill, `plan-epic-hierarchy.md` rule, `plan-epic-integrity.js` hook, `--epic` 파라미터). claude-kit 내부의 **렌더러 3종 + 템플릿 + package.json** 을 일괄 수정하고 **v2.4.0-beta.1** 태그 후 다운스트림에서 `pnpm update claude-kit` 재설치하면 자동 반영.

**비유**: 공장(claude-kit)이 **3번의 기능 업데이트** 를 진행했는데 설명서 템플릿을 한 번도 갱신 안 해서, 소매점(apps/landing)에 여전히 **v2.3.0 구형 설명서** 만 배송되고 있다. 템플릿 일괄 갱신 → 신 태그 배송 → 재설치 = 끝.

---

## 1. 현황 진단

### 1-1. 다운스트림 파일 현재 상태 (2026-04-22 기준)

| 파일 | 경로 | 현재 버전 표기 | stale 지표 |
|---|---|:---:|---|
| CLAUDE.md (kit-managed) | `apps/landing/CLAUDE.md` | `version: 2.3.0` | dev 에이전트 `dev-implementer` 없음 / copy 에이전트 `copy-implementer` 없음 / plan 파이프라인 Epic(P0) 없음 / `/agent-report` 없음 / Spike 모드 언급 없음 / edit-coordinates v1.1 없음 |
| Quick Start | `apps/landing/CLAUDE-KIT-QUICKSTART.md` | `버전: 2.3.0` | plan 압축 흐름에 Epic(P0) 없음 / 용어집에 Epic·Children Features·Epic Binding·Spike·Telemetry 없음 / Agent Frontmatter v1.1 언급 없음 / kit-feedback-archiving 언급 없음 |

### 1-2. claude-kit 내부 현재 상태

| 항목 | 상태 |
|---|---|
| `package.json` version | **2.3.0** (v2.3.1 / v2.4.0 미 bump) |
| v2.3.1 IMP-AGENT 001~009 구현 | ✅ shipped (docs/archive/kit-agent-improvements-v2.3.1/) |
| v2.3.1 kit-feedback-archiving Phase 3 | ✅ shipped (커밋 65368b3) |
| v2.4.0 beta Phase 2 Step 1-6 구현 | ✅ push 완료 (c687daa) |
| `scripts/setup.js` | Epic/telemetry 도메인 출력 분기 **없음** |
| `scripts/claude-md-renderer.js` | kit-managed 섹션의 plan/dev/copy 블록이 **v2.3.0 상태** |
| `scripts/quickstart-renderer.js` + `src/templates/CLAUDE-KIT-QUICKSTART.md.template` | v2.3.0 기준 |

### 1-3. apps/landing 설치 정보

- `package.json`: `"claude-kit": "github:CtrlCVbot/claude-kit"` (GitHub 직접 설치, 태그 미고정)
- **재설치 경로**: `pnpm update claude-kit` → `postinstall` → `scripts/setup.js` 재실행 → CLAUDE.md 병합 + QUICKSTART 재생성

---

## 2. 반영 안 된 내용 전수 체크리스트

### 2-A. dev 도메인 (v2.3.1 IMP-AGENT 시리즈)

**CLAUDE.md kit-managed `## dev 도메인` 섹션 갱신**:

- [ ] 주요 서브에이전트 목록에 **`dev-implementer`** 추가 (IMP-AGENT-005, `/dev-run` 기본 디스패치)
- [ ] 리뷰 출력 표준화 주석 (IMP-AGENT-002 — code/security/database reviewer 출력 포맷 통일)
- [ ] archive guard 프롬프트 (IMP-AGENT-003 — archive 원본 불변 보호)
- [ ] edit-coordinates v1.1 언급 (IMP-AGENT-001 — `binding_updates` 필드로 architecture-binding 동기화 계약)
- [ ] 에이전트 frontmatter v1.1 (IMP-AGENT-008 — `team_owner` / `release_stage` / `schema_version`)
- [ ] 도메인 간 핸드오프 언급 (IMP-AGENT-007 — plan→dev→copy 크로스 링크)

### 2-B. copy 도메인 (v2.3.1 IMP-AGENT-006)

**CLAUDE.md kit-managed `## copy 도메인` 섹션 갱신**:

- [ ] 주요 서브에이전트 목록에 **`copy-implementer`** 추가 (IMP-AGENT-006, VF/IF gap 소비 + Execution Unit 범위 구현)

### 2-C. plan 도메인 (v2.3.1 Spike + v2.4.0 Epic)

**CLAUDE.md kit-managed `## plan 도메인` 섹션 갱신**:

- [ ] 파이프라인 순서에 **P0 `/plan-epic`** 단계 추가 (Opt-in 명시)
- [ ] 주요 커맨드 목록에 `/plan-epic` 추가
- [ ] 주요 커맨드 목록에 `/plan-idea --epic=EPIC-{ID}` 파라미터 표기
- [ ] 신규 skill 언급: `plan-epic-workflow`
- [ ] 신규 rule 언급: `plan-epic-hierarchy.md`
- [ ] 신규 hook 언급: `plan-epic-integrity.js` (Phase 2 disable 기본, Phase 3 enable)
- [ ] **Spike 모드 언급** (IMP-AGENT-004 — plan-bridge-writer + dev-architect 협력 계약)
- [ ] 주요 서브에이전트 목록에 누락 에이전트 보강 (`plan-bridge-writer`, `plan-draft-writer` 이미 shipped 확인 후 반영)
- [ ] "Opt-in 계층 — Epic 없이도 100% 호환" 한 줄 고지

### 2-D. core 도메인 (v2.3.1 텔레메트리 + feedback-archiving)

**CLAUDE.md kit-managed `## claude-kit 활성 구성` 또는 신규 `## core 도메인` 섹션 신설**:

- [ ] `/agent-report` 커맨드 언급 (IMP-AGENT-009)
- [ ] `agent-telemetry.md` 룰 언급 (IMP-AGENT-009, ~/.claude/logs/agent-telemetry.jsonl)
- [ ] `spike-workflow-agents.md` 룰 언급 (IMP-AGENT-004)
- [ ] kit-feedback-archiving Phase 3 언급 (index/stats/rollup)
- [ ] `task-id-naming.md` 룰 (IMP-KIT-015) — 4 패턴 (dev/plan/legacy/spike)
- [ ] `edit-coordinates-governance.md` v1.1 (IMP-KIT-011)
- [ ] `checkpoint-policy.md` (IMP-KIT-016 autoProceedOnPass)

### 2-E. QUICKSTART 반영

**`CLAUDE-KIT-QUICKSTART.md` 갱신**:

- [ ] "이번 설치 결과 요약" 의 `버전: 2.3.0` → `2.4.0-beta.1`
- [ ] **plan 압축 흐름 표에 P0 행 추가**:
  - `P0 /plan-epic [--epic=EPIC-...] Opt-in Epic 생성 .plans/epics/{status}/EPIC-.../`
- [ ] P1 `/plan-idea` 행에 `--epic` 파라미터 표기
- [ ] **dev 압축 흐름**에 `/dev-run` 을 `dev-implementer` 에이전트가 수행한다는 주석
- [ ] **copy 압축 흐름**에 `copy-implementer` 언급 (C5 /copy-plan-unit 승인 후)
- [ ] **"지금 바로 해볼 첫 액션" 에 D 추가**:
  - D. Epic 으로 묶어 관리할 때 (`/plan-epic` → `/plan-idea --epic=...` → `/plan-screen` → ... )
- [ ] **최소 용어집 확장**:
  - `Epic` · `Children Features` · `Epic Binding` · `3단 계층 (Epic/Feature/Task)`
  - `Spike` (Standard Feature 진입 전 1일 게이트 검증)
  - `Telemetry` (~/.claude/logs/agent-telemetry.jsonl)
  - `Agent Frontmatter v1.1` (team_owner / release_stage / schema_version)
- [ ] 최소 경로 구조 트리에 `epics/{status}/EPIC-.../` 추가 (Opt-in)
- [ ] Claude / Codex 차이 표에 v2.3.1 텔레메트리 이벤트 경로 추가

### 2-F. 비고 — v2.4.0-beta.1 릴리스 동반 작업

- [ ] `package.json` version `2.3.0` → `2.4.0-beta.1` bump
- [ ] `CHANGELOG.md` v2.3.1 + v2.4.0-beta.1 두 항목 정리 (v2.3.1 소급 기록 포함)
- [ ] Git tag `v2.4.0-beta.1` 생성

---

## 3. 근본 원인

### 3-1. 왜 v2.3.0 으로 고정됐나?

다운스트림 두 파일은 **claude-kit 의 `postinstall` 이 재생성** 하지만, v2.3.0 이후 세 번의 변경 계열(v2.3.1 IMP-AGENT / Phase 3 / v2.4.0 beta)에서 **모두 렌더러·템플릿을 건드리지 않음**:

| 미수정 파일 | 역할 | 결과 |
|---|---|---|
| `scripts/claude-md-renderer.js` | kit-managed 섹션의 도메인 블록 렌더링 | dev/plan/copy 블록이 v2.3.0 상태 |
| `src/templates/CLAUDE-KIT-QUICKSTART.md.template` + `scripts/quickstart-renderer.js` | QUICKSTART 재생성 | 흐름 표 / 용어집 / 액션 목록 v2.3.0 |
| `scripts/setup.js` | postinstall 엔트리 | version 선언이 package.json 의 2.3.0 참조 |
| `package.json` | version 선언 | 2.3.0 에서 bump 없음 (v2.3.1 / v2.4.0 모두) |

### 3-2. 누락 발생 패턴 — 반복 방지 교훈

| 릴리스 | 구현 내용 | 렌더러 갱신 |
|---|---|:---:|
| v2.3.1 IMP-AGENT 001~009 | 에이전트 2건 신설 + 프롬프트 8건 확장 + 룰 2건 신설 | ❌ |
| v2.3.1 kit-feedback-archiving Phase 3 | core 인프라 + /agent-report | ❌ |
| v2.4.0 Phase 2 Step 1-6 | Epic 도메인 신규 (rule/skill/command/hook) | ❌ |

**패턴**: "구현은 하되 다운스트림 생성 경로는 검증 안 함". Phase 2 Step 7 E2E 에 **renderer 동기화 체크리스트** 포함 필요.

---

## 4. 옵션 비교

### 옵션 A — 수동 편집 (즉시, drift 재발)

- `apps/landing/CLAUDE.md` kit:managed 섹션 + QUICKSTART 직접 편집
- 커버 내용: 2-A ~ 2-E 전체 (~50 체크 항목)
- **공수**: ~1.5시간 (범위 확대로 옵션 A 도 무거워짐)
- **단점**: 다음 `pnpm install` 시 전체 덮어써짐, 유지보수 부담 영구

### 옵션 B1 — claude-kit 템플릿 수정 + v2.4.0-beta.1 태그 (권장)

- claude-kit 의 렌더러 3종 + 템플릿 + package.json + CHANGELOG 수정
- v2.4.0-beta.1 태그 + GitHub push + apps/landing 에서 `pnpm update`
- **공수**: ~3~4시간 (범위 3 계열 모두 커버)
- **장점**: 자동 반영, drift 방지, 다른 다운스트림 동시 반영
- **단점**: 세션 분할 필요 (컨텍스트 50% 규칙)

### 옵션 C — 하이브리드

옵션 A 임시 반영 (1.5h) + 옵션 B1 후속 (3~4h) — **중복 투자**. 권장 아님.

---

## 5. 권장: 옵션 B1

**근거**:
- claude-kit main 이 이미 v2.4.0 Phase 2 까지 push 완료 (c687daa). 태그만 생성하면 즉시 `v2.4.0-beta.1` 릴리스 가능
- v2.3.1 은 shipped 표기만 있고 version bump 없었음 → v2.4.0-beta.1 에 **소급 포함**
- apps/landing 이 `github:CtrlCVbot/claude-kit` (태그 미고정) → `pnpm update` 만으로 최신 main 반영
- 옵션 A 는 범위 확대로 공수·drift 모두 증가

**옵션 A 배제 사유**: 50+ 체크 항목을 kit:managed 영역 수동 편집 → 다음 `pnpm install` 시 100% 덮어써짐 → 투자 손실.

---

## 6. 실행 계획 (옵션 B1)

### 분할 원칙 (컨텍스트 50% 규칙)

총 공수 ~3~4시간을 **3 세션** 으로 분할:

| 세션 | Step | 내용 | 예상 시간 |
|:---:|---|---|:---:|
| **S1** | **탐색** | renderer 3 파일 + template 1 파일 구조 분석 + plan/dev/copy 블록 위치 매핑 | ~30분 |
| **S2** | **구현 + 검증** | Step A (4 파일 수정) + Step B (postinstall + 테스트 294/294) | ~2~3시간 |
| **S3** | **릴리스 + 적용** | Step C (커밋 + 태그 + push) + Step D (apps/landing pnpm update + 검증 + 커밋) | ~45분 |

### Step A — claude-kit 템플릿 수정 (S2, ~2시간)

| # | 작업 | 파일 | 범위 |
|:---:|---|---|---|
| A1 | dev 도메인 블록 갱신 | `scripts/claude-md-renderer.js` (또는 plan/dev/copy 블록 위치) | §2-A 6 항목 반영 |
| A2 | copy 도메인 블록 갱신 | 동일 | §2-B 1 항목 반영 |
| A3 | plan 도메인 블록 갱신 | 동일 | §2-C 8 항목 반영 (Epic + Spike) |
| A4 | core 도메인 신규 또는 확장 | 동일 | §2-D 7 항목 반영 |
| A5 | QUICKSTART 템플릿 갱신 | `src/templates/CLAUDE-KIT-QUICKSTART.md.template` + `scripts/quickstart-renderer.js` | §2-E 9 항목 반영 |
| A6 | version bump | `package.json` | 2.3.0 → 2.4.0-beta.1 |
| A7 | CHANGELOG | `CHANGELOG.md` (없으면 신설) | v2.3.1 + v2.4.0-beta.1 |

### Step B — 검증 (S2, ~30분)

| # | 작업 | 내용 |
|:---:|---|---|
| B1 | 전체 테스트 회귀 | `pnpm test` — 294/294 유지 |
| B2 | 샘플 프로젝트로 postinstall 재실행 검증 | claude-kit 로컬 설치 → 두 파일 출력 확인 |
| B3 | kit-managed 마커 보존 검증 | 마커 외부 수동 편집 영역 변경 0 |
| B4 | Codex AGENTS.md 영향 확인 (선택) | Codex 타겟도 동시 업데이트 여부 결정 |

### Step C — 릴리스 (S3, ~20분)

| # | 작업 | 내용 |
|:---:|---|---|
| C1 | 커밋 분리 | `chore(release): v2.4.0-beta.1 — v2.3.1 IMP-AGENT + v2.4.0 Phase 2 소급 포함` + `docs(templates): downstream sync (CLAUDE.md + QUICKSTART)` |
| C2 | 태그 | `git tag v2.4.0-beta.1 -m "v2.3.1 IMP-AGENT 001~009 + Phase 2 Epic 도메인"` |
| C3 | push | `git push origin main --tags` |

### Step D — 다운스트림 적용 (S3, ~15분)

| # | 작업 | 저장소 | 내용 |
|:---:|---|---|---|
| D1 | `cd apps/landing && pnpm update claude-kit` | mologado/apps/landing | postinstall 재실행 |
| D2 | CLAUDE.md + QUICKSTART diff 확인 | — | §2-A ~ §2-E 50+ 항목 반영 여부 |
| D3 | 변경사항 커밋 | landing repo | `docs(kit): claude-kit v2.4.0-beta.1 반영 (v2.3.1 IMP-AGENT + Phase 2 Epic)` |

---

## 7. 제약 및 리스크

| 리스크 | 확률 | 영향 | 완화 |
|---|:---:|:---:|---|
| 렌더러 구조 이해 부족으로 Step A 시간 초과 | 중 | 중 | S1 탐색 세션에서 plan/dev/copy 블록 위치 사전 매핑 |
| 50+ 체크 항목 누락 발생 | 중 | 중 | S2 구현 후 S3 전에 체크리스트 전수 대조 |
| kit-managed 마커 외부 수동 편집 손실 | 낮 | 고 | `claude-md-merger.js` 의 마커 보존 로직 기존 검증됨 |
| v2.4.0-beta.1 태그 후 회귀 발생 | 낮 | 고 | beta.1 태그로 정식 v2.4.0 분리, 필요 시 beta.2 재태그 |
| Codex AGENTS.md 템플릿도 동반 수정 필요 | 중 | 저 | S2 에서 결정 (포함 or Phase 3 이관) |
| landing repo 가 별도 git 인지 재확인 필요 | 낮 | 중 | 별도 repo 이면 D3 커밋은 해당 repo 에서 수행 |
| v2.3.1 내용이 CHANGELOG 없어 soft 손실 | 중 | 저 | Step A7 에서 소급 기록 (git log 기반) |

---

## 8. 성공 지표

| # | 지표 | 측정 |
|---|---|---|
| 1 | `apps/landing/CLAUDE.md` kit:managed 섹션에 §2-A/B/C/D 체크 항목 **40건 이상** 반영 | grep + 수동 체크 |
| 2 | `apps/landing/CLAUDE-KIT-QUICKSTART.md` 에 §2-E 항목 **9건 전부** 반영 | grep + 수동 체크 |
| 3 | 두 파일 모두 `버전: 2.4.0-beta.1` 표기 | grep version |
| 4 | 수동 편집 영역 (kit:managed 마커 외부) 변경 0 | diff 검증 |
| 5 | claude-kit 전체 테스트 회귀 0 (294/294 유지) | `pnpm test` |
| 6 | pnpm update 후 postinstall 경고/에러 0 | stdout 확인 |
| 7 | Git tag `v2.4.0-beta.1` 생성 + push 완료 | `git tag -l "v2.4.0*"` |

---

## 9. 승인 후 다음 단계

사용자 승인 시 **3 세션 분할 진행**:

1. **S1 탐색 (~30분)**: `scripts/claude-md-renderer.js` + `scripts/quickstart-renderer.js` + `src/templates/CLAUDE-KIT-QUICKSTART.md.template` 읽기 + plan/dev/copy 블록 위치 매핑 + S2 세부 설계 확정
2. **S2 구현+검증 (~2.5시간)**: Step A1~A7 (7 파일 수정) + Step B (테스트 + postinstall 검증)
3. **S3 릴리스+적용 (~45분)**: Step C (커밋/태그/push) + Step D (landing pnpm update + 커밋)

**본 계획 승인 전에는 claude-kit 템플릿 수정 착수 금지** (HARD-GATE).

---

## 10. Scope 경계 (명시적 제외)

### 본 계획 포함

- v2.3.1 IMP-AGENT 001~009 반영 (9 항목)
- v2.3.1 kit-feedback-archiving Phase 3 반영
- v2.4.0 beta Phase 2 Step 1-6 반영
- apps/landing 의 CLAUDE.md + QUICKSTART

### 본 계획 미포함 (별도 작업)

- **Codex 타겟 `AGENTS.md`** 동기화 — Step B4 에서 결정 (포함 가능성 열려 있음)
- **다운스트림 `.claude/agents/`, `.claude/rules/` 등 개별 파일** 동기화 — postinstall 이 자동 처리 (본 계획 범위 아님)
- **v2.4.0 Phase 3 전면 도입 후 재동기화** — v2.4.0 정식 릴리스(2026-06-23 예정) 시점 별도 계획
- **apps/landing 외 다른 다운스트림 프로젝트 동기화** — `pnpm update` 일괄 적용으로 해결 (본 계획은 landing 을 테스트 베드로)
- **IMP-AGENT-010~014 (v2.4.0 에이전트 개선 계획)** — Phase 2 beta 진입 시점에 별도 (이미 계획서 있음)

---

## 11. 관련 자료

- [v2.4.0 Roadmap](../kit-2.4.0-roadmap/README.md) — 상위 로드맵
- [v2.4.0 에이전트 개선 계획 (IMP-AGENT-010~014)](../kit-agent-improvements-v2.4.0/README.md) — 본 계획과 별개 병행
- [v2.3.1 IMP-AGENT 시리즈 (shipped)](../../archive/kit-agent-improvements-v2.3.1/) — v2.3.1 범위 SSOT
- `scripts/setup.js` — postinstall 메인 엔트리
- `scripts/claude-md-merger.js` — CLAUDE.md kit-managed 섹션 병합 로직
- `scripts/claude-md-renderer.js` — kit-managed 섹션 렌더링
- `scripts/quickstart-renderer.js` + `src/templates/CLAUDE-KIT-QUICKSTART.md.template` — QUICKSTART 생성
- `docs/archive/kit-agent-improvements-v2.3.1/decision-log.md` — v2.3.1 설계 결정 이력

---

## 12. 변경 이력

| 날짜 | 내용 | 작성자 |
|---|---|---|
| 2026-04-22 | 초안 v1 — Phase 2 Step 1-6 (Epic 도메인) 만 반영 범위 | Claude (메인테이너 역할) |
| 2026-04-22 | 초안 v2 — **범위 확장**: v2.3.1 IMP-AGENT 001~009 + Phase 3 + v2.4.0 beta 전체 (3 계열 통합). §2 체크리스트를 도메인별 5 카테고리로 재구성 + §6 세션 분할 + §10 Scope 경계 명시 | Claude (메인테이너 역할) |
