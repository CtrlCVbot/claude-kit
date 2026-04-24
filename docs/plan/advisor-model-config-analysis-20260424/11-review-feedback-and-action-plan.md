# 분석 문서 리뷰 피드백 및 실행 계획

> **작성일**: 2026-04-24
> **리뷰 대상**: `docs/plan/advisor-model-config-analysis-20260424/` 전체 11개 파일 (00~10)
> **목적**: 분석 문서의 구현 가능성 · 실제 활용 가능성 · 개선점을 정리하고, 다음 행동을 결정하기 위한 피드백 문서

---

## TL;DR (한눈에 보기)

| 항목 | 판정 | 핵심 요약 |
|------|:---:|----------|
| 문서 자체 품질 | **✅ 우수** | 근거 인용 구체적, 현실 제약을 스스로 고백, Quick Win/장기 구분 명확 |
| Phase 1 (진단/Drift) | **✅ PASS** | 즉시 Quick Win 가능. 2~3일 작업, 리스크 낮음 |
| Phase 2 (중앙 정책) | **✅ PASS** | 기존 registry 패턴 활용 가능. 1주 작업 |
| Phase 3 (Codex Emitter) | **⚠️ CAUTION** | Codex 런타임 검증 실험 선행 필요 |
| Phase 4 (Advisor Direct) | **⛔ BLOCK** | claude-kit는 API request builder가 아님 → 구조적 불가 |
| Phase 4 (Advisor 문서화) | **⚠️ CAUTION** | 별도 ADR로 분리하고 direct integration은 별 프로젝트로 |

**권고 한 줄**: Phase 1A `model-config-report.js` 먼저 IDEA로 등록해 Quick Win 확보 → Phase 3 전에 Codex runtime Spike 1일 → Phase 4 direct integration은 보류하고 ADR로 마무리.

> [내 의견]
> 판단: 동의
> 이유: TL;DR의 판정은 원본 00~10 문서의 실제 근거와 크게 어긋나지 않는다. 특히 `Phase 1A 선행`, `Phase 3 전 Spike`, `Phase 4A direct integration 보류`는 현재 저장소 구조와 가장 잘 맞는 실행 순서다.
> 근거: `00-executive-summary.md`, `06-advisor-tool-applicability.md`, `09-risk-and-migration-plan.md`
> 적용 여부: 즉시 반영
> 메모: 후속 실행 문서에도 `1A → Spike → 3 → 4B` 흐름을 기본 경로로 고정하는 편이 좋다.

---

## 1. 분석 문서 개요

### 1-1. 문서가 무엇을 다루는가

claude-kit 저장소에서 AI 모델 구성이 **어디서, 어떻게, 왜** 바뀔 수 있는지를 분석하고, Anthropic 공식 기준 (Claude Code settings, subagents, Advisor tool)과 비교하여 개선안을 제시하는 패키지다.

### 1-2. 구성 파일 (11개)

| 파일 | 역할 |
|------|------|
| `00-executive-summary.md` | 핵심 결론, 문제 5개, 개선안 Top 10, 검증 실험 5개 |
| `01-terminology-normalization.md` | 용어 통일 |
| `02-as-is-model-config-map.md` | 현재 상태 레이어별 맵 (source → emitter → runtime) |
| `03-why-analysis-5w1h.md` | 5W1H 기반 문제 원인 분석 |
| `04-official-anthropic-benchmark.md` | Claude Code 공식 문서 + Advisor tool 공식 기준 |
| `05-gap-analysis-current-vs-official.md` | 공식 vs 현재 갭 14개 비교표 |
| `06-advisor-tool-applicability.md` | Advisor tool 직접 적용 가능성 판정 |
| `07-pipeline-improvement-proposals.md` | Source/Emitter/Runtime/Observability/Governance 개선안 |
| `08-feature-improvement-proposals.md` | 9개 기능 개선안 + 우선순위 매트릭스 |
| `09-risk-and-migration-plan.md` | 리스크 테이블 + 4-Phase Migration Plan |
| `10-source-map-and-evidence.md` | 근거 파일 매핑 |

### 1-3. 핵심 발견 3가지

`00-executive-summary.md` 11~16행 근거:

1. **Claude 모델 중앙 정책 부재**
   - Claude 에이전트 21개 전원 `model: opus` 고정
   - 중앙 정책 파일 없음 → frontmatter 분산 편집 부담
   - `.claude/settings.json`에 `model`, `availableModels`, `ANTHROPIC_DEFAULT_*` pinning env 기본 미포함

2. **Claude ↔ Codex parity 붕괴**
   - Codex 에이전트 20개 중 19개가 `model` 필드 누락
   - `buildCodexAgentToml()`이 `model` / `model_reasoning_effort`를 emit하지 않음
   - 단, 수동 TOML(`.codex/agents/kit-codex-sync-reviewer.toml`)은 이미 이 필드를 사용 중 → "emitter 기능 공백"이 정확한 표현

3. **Advisor tool 적용 불가**
   - Anthropic Advisor tool은 API-level beta 기능
   - claude-kit는 Claude Code/Codex용 자산을 패키징하는 도구 → API request body를 직접 생성하는 표면 없음
   - "직접 적용"은 불가, "전략 패턴 차용"은 가능

> [내 의견]
> 판단: 동의
> 이유: 세 가지 발견은 이번 분석 패키지의 핵심 축을 정확히 짚는다. 특히 "Codex 표면이 모델 필드를 못 쓰는 게 아니라 emitter가 metadata를 잃는다"는 해석은 문제 정의를 정교하게 만든다.
> 근거: `02-as-is-model-config-map.md`, `06-advisor-tool-applicability.md`, `.codex/agents/kit-codex-sync-reviewer.toml`
> 적용 여부: 즉시 반영
> 메모: 이후 구현 문서에서도 `플랫폼 한계`와 `emitter 공백`을 계속 분리해서 써야 한다.

### 1-4. 제안된 Migration Plan (4 Phase)

`09-risk-and-migration-plan.md` 14~57행 근거:

```
Phase 0. Audit only          → 변경 없음, 현재 effective model 수집
Phase 1. Non-breaking visibility → diagnostic report + drift detector + consistency checker
Phase 2. Source policy introduction → 중앙 model-policy 파일 + domain별 recommended model
Phase 3. Emitter parity repair → buildCodexAgentToml() 확장 + Codex source metadata 정규화
Phase 4. Advisor-ready experimentation → policy 문서화 + Claude target PoC
```

> [내 의견]
> 판단: 부분 동의
> 이유: 4-Phase 구분은 유효하지만, 실무 착수 관점에서는 `Phase 0 Audit only`를 별도 phase보다 `Phase 1A`의 첫 산출물로 흡수하는 쪽이 더 간결하다. 다만 문서 구조상 개념적 baseline으로 남겨두는 것은 무방하다.
> 근거: `09-risk-and-migration-plan.md`, `08-feature-improvement-proposals.md`
> 적용 여부: 조건부 반영
> 메모: 실제 backlog에서는 `Phase 0/1A`를 병합 표기하는 안을 권장한다.

---

## 2. 구현 가능성 (Feasibility) 분석

### 2-1. Phase별 판정표

| Phase | 기술 난이도 | 호환성 | 작업량 | 리스크 | 판정 |
|-------|:---:|:---:|:------:|:---:|:---:|
| Phase 1 진단/drift | 낮음 | 매우 높음 | 2~3일 | 낮음 | **PASS** |
| Phase 2 중앙 정책 | 낮음 | 높음 | 3~5일 | 낮음 | **PASS** |
| Phase 3 Codex emitter | 중 | 높음 | 2일 + 실험 | 중 | **CAUTION** |
| Phase 4 Advisor direct | 높음 | 없음 | 불가 | 높음 | **BLOCK** |
| Phase 4 Advisor docs | 중 | 보통 | 5~7일 | 중 | **CAUTION** |

> [내 의견]
> 판단: 동의
> 이유: 난이도와 판정 방향은 적절하다. 다만 기간 추정은 약속값이 아니라 rough sizing으로 취급해야 하며, 특히 Phase 2와 Phase 3은 schema/path 결정과 spike 결과에 따라 흔들릴 수 있다.
> 근거: `07-pipeline-improvement-proposals.md`, `09-risk-and-migration-plan.md`
> 적용 여부: 즉시 반영
> 메모: 구현 승격 시에는 날짜보다 `blocking 여부`와 `검증 완료 조건`을 함께 써두는 편이 안전하다.

### 2-2. Phase별 상세

#### Phase 1: Visibility (진단/Drift/Consistency) — ✅ PASS

**왜 쉬운가**
- Read-only 스크립트. Generated output 변경 없음
- 기존 `scripts/kit-audit`, `/kit-validate` 검증 패턴 재활용 가능
- 파일 I/O + JSON 처리만 필요

**구체 구현 위치**
- `scripts/model-config-report.js` (신규)
- `scripts/model-drift-check.js` (신규)
- 기존 `src/pairing-registry.json`, `src/exception-registry.json` 패턴과 호환

**예상 산출물**
- CLI로 현재 effective model을 레이어별(profile/settings/env/frontmatter) 표 출력
- Source vs Emitted vs Runtime 불일치 감지 리포트

> [내 의견]
> 판단: 동의
> 이유: 가장 저위험이면서 관측 가능성을 크게 올리는 단계다. read-only 성격이라 rollback 부담이 거의 없고, 이후 ROI/정책 논의를 데이터 기반으로 전환할 수 있다.
> 근거: `07-pipeline-improvement-proposals.md`, `08-feature-improvement-proposals.md`
> 적용 여부: 즉시 반영
> 메모: 이 피드백 문서의 제안대로 `1A(report)`와 `1B(check)`를 분리하면 착수성이 더 좋아진다.

#### Phase 2: Central Policy (`src/_meta/model-policy.json`) — ✅ PASS

**왜 쉬운가**
- 기존 `src/pairing-registry.json`, `src/exception-registry.json`와 동일한 정적 JSON 패턴
- ajv 스키마 검증 인프라 이미 존재 (`src/claude/dev/_schemas/_router.js`)
- Opt-in으로 도입 가능 → 하위 호환

**구체 구현 위치**
- `src/_meta/model-policy.json` (신규, 스키마 + 샘플 값)
- `scripts/setup.js`에 `modelPolicy` 로더 추가
- `docs/30-reference/02-agents.md` 갱신

**참고**: `07-pipeline-improvement-proposals.md` 18~37행의 SSOT 예시 JSON 구조 활용

> [내 의견]
> 판단: 부분 동의
> 이유: 중앙 정책 SSOT 도입 방향은 맞다. 다만 파일 경로를 `src/_meta/model-policy.json`으로 고정하는 것은 아직 이 저장소의 실제 소스 자산 구조와 완전히 합의된 상태가 아니다. 현재 `src` 루트에는 `_meta` 디렉터리가 없고, registry류는 루트 JSON으로 관리되고 있다.
> 근거: `10-source-map-and-evidence.md`, `src/pairing-registry.json`, `src/exception-registry.json`
> 적용 여부: 조건부 반영
> 메모: `중앙 정책 파일 도입`은 채택하되, 정확한 경로는 `src/model-policy.json`과 `src/_meta/model-policy.json` 중 하나를 구조 기준으로 다시 결정하는 편이 좋다.

#### Phase 3: Codex TOML Emitter 확장 — ⚠️ CAUTION

**왜 주의해야 하는가**
- 기술 난이도 자체는 낮음 (emitter에 필드 추가만)
- 하지만 **Codex runtime이 `model` 필드를 실제로 어떻게 해석하는지 공식 문서로 검증 불가** (`09-risk-and-migration-plan.md` 61행에서 스스로 고백)
- 현재 workspace `targets: ["claude"]` → Codex emitted runtime 검증 환경 없음

**필수 선행 작업**
1. Codex runtime TOML `model` 필드 해석 범위 확인 (공식 문서 또는 실험)
2. `/plan-spike codex-model-runtime` Spike 1일 배정 (Budget hard cap 준수)
3. 실험 결과에 따라 Phase 3 착수 여부 결정

**구체 구현 위치**
- `scripts/setup.js::buildCodexAgentToml()` 확장
- Codex source conversion pipeline (model frontmatter 보존)

> [내 의견]
> 판단: 동의
> 이유: 이 단계의 핵심은 구현 난이도보다 검증 표면 부족이다. 현재 workspace가 `targets: ["claude"]`이므로 emitter 수정만 먼저 들어가면 "작동한다고 가정하는 문서"만 늘어날 위험이 있다.
> 근거: `profile.json`, `06-advisor-tool-applicability.md`, `09-risk-and-migration-plan.md`
> 적용 여부: 즉시 반영
> 메모: Phase 3는 `Spike PASS`를 formal gate로 명시하는 것이 좋다.

#### Phase 4A: Advisor Direct Integration — ⛔ BLOCK

**왜 불가능한가**
- `06-advisor-tool-applicability.md` 51~54행이 명확히 지적:
  > "현재 `claude-kit`는 Claude API request body를 직접 생성하지 않는다. 따라서 `tools: [{type: "advisor_20260301", ...}]`를 주입할 정확한 표면이 없다."
- claude-kit은 **자산 패키징 도구**이지 API 클라이언트가 아님
- Advisor tool은 executor/advisor가 같은 API 요청 내부에서 동작하는 server-side 기능

**결론**
- claude-kit 안에서 구현 시도는 구조적으로 불가
- 진짜 필요하면 **별도 런타임 래퍼 프로젝트**로 분리 필요

> [내 의견]
> 판단: 동의
> 이유: 현재 저장소는 API request body를 직접 조립하지 않으므로 Anthropic `Advisor tool`을 repo 안에서 바로 activate할 표면이 없다. 이건 우선순위 문제가 아니라 아키텍처 경계 문제에 가깝다.
> 근거: `06-advisor-tool-applicability.md`, [Advisor tool](https://platform.claude.com/docs/ko/agents-and-tools/tool-use/advisor-tool)
> 적용 여부: 즉시 반영
> 메모: direct integration 논의는 별도 wrapper/runtime 프로젝트로 분리하는 판단이 맞다.

#### Phase 4B: Advisor-ready 정책 문서화 — ⚠️ CAUTION

**가능하지만 주의점**
- Spec/ADR 작성은 가능
- 하지만 runtime에서 자동 escalation을 구현할 표면이 없어서 "문서로만 남음"
- `08-feature-improvement-proposals.md` 9개 기능 중 6~9번이 여기 해당 → P2~P3로 격하 권장

> [내 의견]
> 판단: 동의
> 이유: 이 단계는 구현보다 ADR/정책 문서의 성격이 강하다. 현재 단계에서 우선순위를 높게 잡기보다 Phase 1~3에서 확인된 사실을 흡수하는 문서로 두는 편이 더 실용적이다.
> 근거: `06-advisor-tool-applicability.md`, `08-feature-improvement-proposals.md`
> 적용 여부: 즉시 반영
> 메모: 제목도 `Advisor-ready`보다는 `Multi-Model Orchestration Policy`처럼 capability-neutral하게 다듬는 편이 안전하다.

### 2-3. 선행 작업 · 의존성

```
Phase 1 ─────────────────────────► 즉시 착수 가능
   │
   ▼
Phase 2 ─────────────────────────► Phase 1 완료 후
   │
   ▼
[Spike: Codex runtime 검증]  ─►  Phase 3 착수 여부 결정
   │
   ▼
Phase 3 ─────────────────────────► Spike PASS 시
   │
   ▼
Phase 4B (문서화만) ─────────────► 선택적 ADR
```

> [내 의견]
> 판단: 동의
> 이유: 의존성 흐름이 단순하고 명확하다. 이 다이어그램만 있어도 어떤 일이 blocker인지, 무엇이 병렬 가능한지 기존 문서보다 훨씬 빨리 파악된다.
> 근거: `09-risk-and-migration-plan.md`
> 적용 여부: 즉시 반영
> 메모: 이후 실행 문서에는 `parallel 가능` 라벨도 같이 붙이면 더 좋다.

### 2-4. 잠재 블로커 3가지

`09-risk-and-migration-plan.md` 59~63행 근거:

1. **Codex runtime model TOML 해석 범위 미확인** — Phase 3 효과성의 핵심 불확실성
2. **현재 workspace `targets: ["claude"]`** — Codex emitted runtime 실검증 환경 부재
3. **Advisor tool의 API 표면 부재** — claude-kit 구조 자체가 API client가 아님

> [내 의견]
> 판단: 동의
> 이유: 세 블로커는 실제 의사결정 게이트로 쓰기에 적절하다. 특히 1번과 3번은 기술 검증이 아니라 scope boundary를 결정하는 블로커라 우선 표시가 필요하다.
> 근거: `09-risk-and-migration-plan.md`, `10-source-map-and-evidence.md`
> 적용 여부: 즉시 반영
> 메모: 이후 실행 문서에서는 blocker를 `P0 gate`로 표시하면 더 명확하다.

---

## 3. 실제 활용 가능성 (Usability) 분석

### 3-1. 페르소나별 ROI

#### Persona 1: 팀 리드 (모델 비용 책임자) — ✅ PASS

**현재 불편**: "우리 팀이 어느 모델 얼마나 쓰는지" 즉시 확인할 수단 없음

**Phase 1 도입 후**:
- `scripts/model-config-report.js` 실행 → 레이어별 effective model + 영향도 즉시 가시화
- Opus 전면 고정(21개 에이전트) 탈출 → domain별 차등 정책으로 비용 30~50% 절감 여지

**활용도**: 매우 높음

> [내 의견]
> 판단: 부분 동의
> 이유: 팀 리드 관점의 활용도는 높다. 다만 `비용 30~50% 절감`은 현재 실측 데이터 없이 제시된 가설 수준이므로 수치로 단정하기보다 `절감 여지 검증 가능` 정도로 낮춰 적는 편이 안전하다.
> 근거: `00-executive-summary.md`, `10-source-map-and-evidence.md`
> 적용 여부: 조건부 반영
> 메모: Phase 1A 보고서가 나오기 전까지는 정량 효과를 가설로만 유지한다.

#### Persona 2: claude-kit 메인테이너 — ✅ PASS

**현재 불편**: 모델 정책 변경 시 21개 frontmatter 파일을 분산 편집

**Phase 2 도입 후**:
- 중앙 정책 파일 1곳 수정 → 전 에이전트 전파
- Phase 1 drift detector로 source↔runtime 불일치 조기 감지

**활용도**: 매우 높음

> [내 의견]
> 판단: 동의
> 이유: 유지보수성 측면에서 가장 직접적인 수혜자다. 이 페르소나는 현재 문서가 제안한 SSOT, drift detector, parity check의 가치를 가장 잘 설명해준다.
> 근거: `02-as-is-model-config-map.md`, `07-pipeline-improvement-proposals.md`
> 적용 여부: 즉시 반영
> 메모: 메인테이너 관점 문단은 최종 PRD에도 거의 그대로 재사용 가능하다.

#### Persona 3: Codex 사용자 — ⚠️ CAUTION

**현재 불편**: Codex 에이전트에 model 메타데이터가 대부분 누락

**Phase 3 도입 후**:
- Codex agent가 실제로 `model` 필드를 쓸 수 있어야 이득
- 현재 저장소 `targets: ["claude"]` → Codex 자산 배포 자체가 비활성

**활용도**: Codex 활성화 프로젝트가 등장하기 전까진 "미래 대비"

> [내 의견]
> 판단: 동의
> 이유: Codex 쪽 가치는 인정하되, 현재 repo의 active target이 아니므로 ROI를 미래 대비로 분류한 점이 정확하다.
> 근거: `profile.json`, `10-source-map-and-evidence.md`
> 적용 여부: 즉시 반영
> 메모: Codex 관련 일은 spike 전까지는 `준비 작업`으로 표현하는 편이 적절하다.

#### Persona 4: Advisor tool 실험자 — ⛔ BLOCK

**현재 불편**: Sonnet executor + Opus advisor 조합으로 비용 절감 실험하고 싶음

**Phase 4 도입 후**:
- claude-kit 내부에선 spec 문서만 남고 실제 실행 표면 없음
- Advisor tool은 Anthropic API 직접 호출 필요 → 별도 런타임 래퍼 프로젝트 필요

**활용도**: 매우 제한적 (문서로만 의미)

> [내 의견]
> 판단: 동의
> 이유: 이 페르소나는 문서상 이해를 돕는 용도로는 의미가 있지만, 현 저장소 안에서 바로 만족시킬 수 있는 사용자상은 아니다. 그래서 roadmap의 핵심 persona로 두기보다 참고 persona로 두는 편이 낫다.
> 근거: `06-advisor-tool-applicability.md`, [Advisor tool](https://platform.claude.com/docs/ko/agents-and-tools/tool-use/advisor-tool)
> 적용 여부: 조건부 반영
> 메모: Phase 4A가 별도 프로젝트로 분리되면 그쪽 문서에서 주 페르소나로 승격하는 편이 맞다.

### 3-2. 투자 대비 효과

| Phase | 투자 | 기대 효과 | ROI |
|-------|------|----------|-----|
| Phase 1 | 3~5일 | 모델 사용 가시성 + 비용 진단 기반 | **⭐⭐⭐⭐⭐** 매우 높음 |
| Phase 2 | 1주 | 정책 중앙화 + drift 해소 | **⭐⭐⭐⭐** 높음 |
| Phase 3 | 1~2주 + 실험 | Codex parity 복구 | **⭐⭐⭐** 중간 (Codex 활성 프로젝트 수 의존) |
| Phase 4A (direct) | 불가 | — | **⛔ N/A** |
| Phase 4B (문서) | 5~7일 | Advisor 전략 가이드 | **⭐⭐** 낮음~중간 (spec 한정) |

> [내 의견]
> 판단: 부분 동의
> 이유: 상대적 ROI 방향성은 타당하다. 다만 별점과 일정은 근거 데이터가 아니라 판단 보조용 heuristic이므로 최종 의사결정 문서에서는 근거 구간과 가정치를 함께 적는 것이 좋다.
> 근거: `00-executive-summary.md`, `09-risk-and-migration-plan.md`
> 적용 여부: 조건부 반영
> 메모: 숫자·별점 표기는 유지하되 `추정치` 표시를 추가하는 개선을 권장한다.

### 3-3. 기존 워크플로우 통합 지점

| 통합점 | 패턴 |
|--------|------|
| `/kit-audit` 커맨드 | drift/consistency check 체인 연동 |
| `scripts/setup.js postinstall` | model policy 로딩 시점 |
| `CLAUDE.md` 활성 구성 섹션 | "plan 도메인 기본 설정"과 동일 패턴으로 추가 |
| `pairing-registry.json` | metadata parity 필드 확장 |
| `exception-registry.json` | model-gap 카테고리 추가 |

> [내 의견]
> 판단: 부분 동의
> 이유: 통합 후보는 적절하다. 다만 `scripts/setup.js postinstall`과 `CLAUDE.md` 변경은 설정 표면을 넓히므로, Phase 1 단계에서 바로 건드리기보다 Phase 2 이후로 미루는 편이 안전하다.
> 근거: `07-pipeline-improvement-proposals.md`, `docs/30-reference/06-settings.md`
> 적용 여부: 조건부 반영
> 메모: 우선순위는 `audit/report → registry/parity → setup integration` 순서를 권장한다.

---

## 4. 문서 강점 · 약점

### 4-1. 강점 👍

1. **근거 인용이 구체적**
   - 모든 주장이 `scripts/setup.js`, `src/pairing-registry.json`, `src/claude/**/agents/*.md` 등 실제 파일 경로로 뒷받침
   - `10-source-map-and-evidence.md` 별도 파일로 증거 매핑

2. **현실 제약을 스스로 고백**
   - `06-advisor-tool-applicability.md`에서 "direct integration은 부적합" 명시
   - `09 §남은 리스크`에서 검증 부재 3가지 인정

3. **Quick Win / Mid-term / Long-term 구분 명확**
   - `07-pipeline-improvement-proposals.md` §6 분류표
   - `08-feature-improvement-proposals.md` 우선순위 매트릭스 (가치 × 난이도 × 순서)

4. **공식 Anthropic 기준 대조**
   - `04-official-anthropic-benchmark.md`에서 Claude Code, settings, subagents, Advisor tool 공식 문서 링크 + 요약
   - 5W1H 분석 (`03-why-analysis-5w1h.md`)

> [내 의견]
> 판단: 동의
> 이유: 이 강점 평가는 원문 문서의 실제 장점을 잘 집는다. 특히 근거 중심 서술과 "구조적으로 안 되는 것"을 명시한 점은 이후 구현 논의의 낭비를 줄여준다.
> 근거: `04-official-anthropic-benchmark.md`, `10-source-map-and-evidence.md`
> 적용 여부: 즉시 반영
> 메모: 이 강점 요약은 문서 패키지의 executive intro에도 재활용할 수 있다.

### 4-2. 약점 👎

1. **Advisor 이름 오용**
   - Advisor tool direct 적용이 불가한데 문서 5개 섹션에 걸쳐 등장
   - → 권장: "Multi-Model Orchestration Policy"로 재명명

2. **가설-실험의 blocking 관계 미정리**
   - `00 §검증 실험 5개`, `09 §실험 5개`를 나열했으나 어느 것이 blocker이고 어느 것이 parallel 가능한지 불명
   - → 권장: 실험 간 의존성 DAG 추가

3. **ROI 수치 부재**
   - 모든 제안이 정성적 ("비용 절감 여지 있음")
   - "현재 월 API 비용 추정 + Opus 전면 고정 대비 절감 시나리오" 없음

4. **Timeline/Lane 판정 부재**
   - Migration Plan이 단계만 정의, 각 Phase별 duration/parallelizable 미기재
   - RICE Lane (Lite/Standard) 판정 없음

5. **Breaking Change 분류 누락**
   - Phase 3 `buildCodexAgentToml()` 확장은 기존 Codex TOML 출력 스키마 변경
   - BC-?-01 지정 필요 (현재 kit 규약)

6. **IMP ID 미배정**
   - claude-kit의 `task-id-naming.md` 4 패턴 (T-/TASK-/LEGACY-/SPIKE-)과 매칭 안 됨
   - IDEA → Screen → Draft → PRD 플로우로 승격 필요

> [내 의견]
> 판단: 부분 동의
> 이유: 약점 6개 중 2, 4, 5, 6은 대체로 수용 가능하다. 반면 1번 `Advisor 이름 오용`은 완전한 오용이라기보다 범위가 넓어 보이는 naming issue에 가깝고, 3번 ROI 수치 부재는 현재 분석 단계에서는 의도적 보수성으로도 볼 수 있다.
> 근거: `00-executive-summary.md`, `06-advisor-tool-applicability.md`, `.claude/rules/task-id-naming.md`
> 적용 여부: 조건부 반영
> 메모: 명칭 조정은 `Advisor` 삭제보다 부제 추가나 섹션 재배치부터 검토하는 편이 좋다.

---

## 5. 개선 피드백 (누락 · 대안 · 재설계)

### 5-1. 누락 항목 (6개)

| # | 누락 내용 | 영향 | 제안 |
|:-:|----------|------|------|
| 1 | Codex runtime 검증 실험 | Phase 3 효과성 불확실 | Phase 0에 "Codex TOML model 해석 실험" Spike 포함 |
| 2 | Model policy 스키마 구체성 | Phase 2 구현 시 재논의 필요 | `version`, `$schema`, `overrides` 계층, `exception-registry`와의 경계 정의 |
| 3 | Migration timeline | 일정 추정 불가 | Phase별 duration + parallelizable 여부 + RICE Lane 판정 |
| 4 | ROI/비용 수치 | 의사결정 근거 부족 | 현재 월 API 비용 추정 + 도메인별 모델 차등 시 절감 시나리오 |
| 5 | Breaking Change 분류 | 사용자 전파 전략 부재 | Phase 3 BC-?-01 지정, migration 전략 명시 |
| 6 | IMP ID 미배정 | Feature Package 승격 불가 | IDEA → Screen → Draft → PRD 플로우로 재포장 |

> [내 의견]
> 판단: 동의
> 이유: 누락 6개 중 가장 즉시 반영할 항목은 1, 3, 5, 6이다. 2번은 schema/path가 아직 열려 있고, 4번은 데이터 수집 체계가 생긴 뒤 정교화하는 것이 맞다.
> 근거: `07-pipeline-improvement-proposals.md`, `09-risk-and-migration-plan.md`, `.claude/rules/task-id-naming.md`
> 적용 여부: 즉시 반영
> 메모: `누락` 목록은 곧바로 backlog 변환 가능하다.

### 5-2. 대안 설계 (3개)

#### 대안 1: Phase 1을 1A/1B로 분할

**현재안**: Phase 1 = diagnostic report + drift detector + consistency checker 동시

**대안안**:
- **1A**: `model-config-report.js` (상태 출력만) → **즉시 ship**
- **1B**: `model-drift-check.js` + consistency checker → Phase 2 정책과 묶기

**이유**: 1A만 ship해도 가시성 가치 즉시 발생. 1B는 중앙 정책이 있어야 drift 판정 기준이 선명해짐.

> [내 의견]
> 판단: 동의
> 이유: 이 분리는 실행성과 설득력을 동시에 높인다. 1A만으로도 사용자에게 visible value를 줄 수 있고, 1B는 정책 기준선이 생긴 뒤 정확도가 높아진다.
> 근거: `08-feature-improvement-proposals.md`, `09-risk-and-migration-plan.md`
> 적용 여부: 즉시 반영
> 메모: 이후 문서에서는 Phase 1을 계속 단일 덩어리로 쓰기보다 `1A/1B`를 병기하는 편이 좋다.

#### 대안 2: Phase 4를 "문서-only"로 격하

**현재안**: Phase 4 = advisor-ready execution policy + pairing policy + escalation trigger spec + PoC

**대안안**: Phase 4 = **ADR 1건 작성 후 종료**. Advisor direct integration은 별도 프로젝트.

**이유**:
- `06-advisor-tool-applicability.md` §추천 접근 스스로 "1단계 진단부터"라고 인정
- claude-kit 아키텍처 한계로 direct integration 구조적 불가
- "Multi-Model Orchestration Policy" ADR로 문서 가치는 보존

> [내 의견]
> 판단: 동의
> 이유: 현재 구조에서 가장 현실적인 정리다. direct integration을 억지로 남겨두기보다 ADR로 의사결정과 경계만 남기면 문서 가치와 실행 가능성을 동시에 확보할 수 있다.
> 근거: `06-advisor-tool-applicability.md`
> 적용 여부: 즉시 반영
> 메모: ADR 제목은 `Multi-Model Orchestration Policy` 또는 `Advisor-pattern Applicability` 정도가 적절하다.

#### 대안 3: `exception-registry.json` 확장 먼저

**현재안**: Phase 2에서 `src/_meta/model-policy.json` 신설

**대안안**: 기존 `src/exception-registry.json`에 `model-gap` 카테고리 추가로 먼저 시작

**이유**:
- 기존 스키마 재사용 → 도입 비용 절감
- Phase 1 drift detector가 찾은 gap을 exception으로 일단 기록 → 정책 SSOT 탄생 전 과도기 대응
- 추후 Phase 2에서 `model-policy.json`으로 승격해도 이관 비용 적음

> [내 의견]
> 판단: 부분 동의
> 이유: 과도기 대응으로는 좋지만, exception registry는 `허용된 예외`를 기록하는 표면이지 `권장 정책`의 SSOT로 오래 쓰기엔 성격이 다르다. 브리지 단계로는 유효하나 최종 도착점으로 삼으면 안 된다.
> 근거: `src/exception-registry.json`, `07-pipeline-improvement-proposals.md`
> 적용 여부: 조건부 반영
> 메모: Phase 1~2 사이 임시 레이어로는 검토 가능하다.

### 5-3. 재설계 제안

**문서 재명명**: "Advisor Model Config Analysis" → "**Model Configuration & Orchestration Analysis**"

**이유**: Advisor tool direct integration이 불가한 현실을 반영. Multi-Model Orchestration Policy 문서로 재포장하면 Phase 4B 문서 가치 보존 + 오해 방지.

> [내 의견]
> 판단: 부분 동의
> 이유: 오해를 줄이기 위한 방향은 맞다. 다만 이번 패키지는 애초에 사용자의 요청상 `Advisor tool`을 핵심 비교축으로 삼았으므로, 제목에서 Advisor를 완전히 제거하면 검색성과 추적성이 떨어질 수 있다.
> 근거: 사용자 요청 맥락, `04-official-anthropic-benchmark.md`, `06-advisor-tool-applicability.md`
> 적용 여부: 조건부 반영
> 메모: 전체 rename보다는 부제 추가 또는 `Advisor tool applicability`를 한 장으로 국한하는 방식이 더 균형적이다.

---

## 6. 우선순위 및 실행 계획

### 6-1. 단계별 권장 행동

| # | 단계 | 판정 | 권장 행동 | 시점 |
|:-:|-----|:---:|----------|-----|
| 1 | Phase 1A (diagnostic report) | ✅ 지금 | `/plan-idea`로 IDEA 등록 → Quick Win 착수 | **즉시** |
| 2 | Phase 1B + Phase 2 | ✅ 승격 | Standard Feature로 IMP-KIT-* 배정, v2.5.0 후보 | v2.5.0 |
| 3 | Codex runtime Spike | ⚠️ 선행 | `/plan-spike codex-model-runtime` (1일 Budget cap) | v2.5.0 전 |
| 4 | Phase 3 (Codex emitter) | Spike 결과 의존 | Spike PASS 시 Standard Feature로 승격 | v2.5.0 또는 v2.6.0 |
| 5 | Phase 4A (Advisor direct) | ⛔ 보류 | 별도 런타임 래퍼 프로젝트 검토 | 보류 |
| 6 | Phase 4B (Advisor ADR) | ✅ 선택적 | "Multi-Model Orchestration Policy" ADR 작성 | 여유 있을 때 |

> [내 의견]
> 판단: 동의
> 이유: 실행 우선순위가 합리적이고, 구현 가능성·검증 필요성·구조 한계를 분리한 점이 좋다.
> 근거: `09-risk-and-migration-plan.md`, `08-feature-improvement-proposals.md`
> 적용 여부: 즉시 반영
> 메모: `Phase 1A IDEA 등록`은 바로 backlog화할 수 있다.

### 6-2. 즉시 착수 가능한 Backlog

`09-risk-and-migration-plan.md` 73~79행 + 본 리뷰 수정사항 반영:

1. ✅ `scripts/model-config-report.js` (Phase 1A, Quick Win)
2. ⏳ `scripts/model-drift-check.js` (Phase 1B, Phase 2와 묶음)
3. ⏳ `src/_meta/model-policy.json` (Phase 2, 또는 `exception-registry.json` 확장으로 대체)
4. ⏳ `scripts/setup.js` Codex TOML model emission 확장 (Phase 3, Spike 후)
5. ⏳ `src/pairing-registry.json` metadata parity 필드 설계 (Phase 2 부속)

> [내 의견]
> 판단: 부분 동의
> 이유: 1, 2, 5는 바로 backlog로 옮기기 좋다. 3은 경로 확정이, 4는 spike 결과가 필요하므로 동일한 `즉시 착수 backlog`로 묶기보다 상태를 분리하는 편이 더 정확하다.
> 근거: `07-pipeline-improvement-proposals.md`, `09-risk-and-migration-plan.md`
> 적용 여부: 조건부 반영
> 메모: backlog 표시에 `ready / needs-spike / needs-schema-decision` 상태 컬럼을 추가하면 좋다.

### 6-3. 검증해야 할 가설 (실험 설계)

원본 `09 §실험으로 먼저 검증해야 할 가설` 5개 + 본 리뷰 추가:

| # | 가설 | 검증 방법 | 우선순위 |
|:-:|------|----------|:---:|
| 1 | Codex TOML `model` 필드를 실제 런타임이 반영한다 | `/plan-spike codex-model-runtime` 1일 | **P0** (Phase 3 blocker) |
| 2 | Opus 전면 고정 → domain별 차등으로 비용 30%+ 절감 | Phase 1A 진단 리포트로 실측 | P1 |
| 3 | 중앙 정책 파일이 frontmatter 직접 편집보다 유지보수성 높다 | Phase 2 도입 후 6개월 drift 건수 비교 | P2 |
| 4 | `availableModels`는 강제보다 진단/권장 모드가 수용성 높다 | 팀 피드백 수집 (설문) | P2 |
| 5 | `haiku executor + opus advisor` 조합이 대표 워크로드에서 유효하다 | 별도 런타임 래퍼 프로젝트에서 벤치마크 | P3 (claude-kit 밖) |

> [내 의견]
> 판단: 동의
> 이유: 가설 목록이 구현 순서와 잘 연결돼 있다. 특히 1번을 `P0 blocker`로 격상한 점이 적절하다.
> 근거: `09-risk-and-migration-plan.md`, `10-source-map-and-evidence.md`
> 적용 여부: 즉시 반영
> 메모: 2번과 4번은 Phase 1A 결과가 나오면 자연스럽게 업데이트할 수 있다.

---

## 7. 다음 단계 체크리스트

리뷰 결과를 반영한 실행 체크리스트.

### 7-1. 즉시 (이번 주)

- [ ] Phase 1A `model-config-report.js` IDEA 등록 (`/plan-idea "Claude 모델 진단 리포트"`)
- [ ] 본 분석 문서를 "Model Configuration & Orchestration Analysis"로 재명명 검토
- [ ] Phase 2 스키마 설계 사전 검토 (`version`, `$schema`, `overrides` 계층)

### 7-2. 단기 (v2.5.0 이전)

- [ ] Phase 1A IDEA → Screen → Draft → PRD 플로우 진행
- [ ] Codex runtime Spike 설계 (`/plan-spike codex-model-runtime`, Budget 1일)
- [ ] Phase 1B + Phase 2 Feature Package 작성 검토
- [ ] Migration Plan에 RICE Lane 판정 + duration 추가

### 7-3. 중기 (v2.5.0 반영)

- [ ] Phase 1A ship
- [ ] Phase 2 ship (또는 `exception-registry.json` 확장으로 부분 구현)
- [ ] Phase 3 Spike 실행 → Go/No-Go 결정
- [ ] Phase 3 Spike PASS 시 Feature Package 승격

### 7-4. 장기 (v2.6.0 이후)

- [ ] Phase 3 ship (Spike PASS 시)
- [ ] Phase 4B ADR 작성 ("Multi-Model Orchestration Policy")
- [ ] Phase 4A는 별도 런타임 래퍼 프로젝트로 분리 검토

> [내 의견]
> 판단: 동의
> 이유: 체크리스트 구조가 실행 단계와 잘 맞고, 주간/버전/장기 축이 분리돼 있어 추적하기 쉽다.
> 근거: `09-risk-and-migration-plan.md`
> 적용 여부: 즉시 반영
> 메모: 다만 `문서 재명명`은 체크리스트의 필수 항목보다는 검토 항목으로 낮추는 쪽을 권장한다.

---

## 8. 결론

### 8-1. 분석 문서에 대한 평가

**품질**: 우수 ✅
- 근거 인용 구체적, 현실 제약을 스스로 고백, 구조적 한계 인정
- Quick Win / Long-term 구분이 실행 가능한 수준으로 정리됨

**한계**: 중간 ⚠️
- Advisor tool을 전면에 내세웠으나 claude-kit에서 direct 적용 불가 → 오해 소지
- Timeline/Lane/BC 분류 등 kit 규약 준수 필요

### 8-2. 최종 권고 3줄

1. **Phase 1A는 지금 바로 IDEA로 등록하여 Quick Win 확보**
2. **Phase 3은 Codex runtime Spike 1일로 검증 후 착수 결정**
3. **Phase 4 Advisor direct integration은 보류, ADR 문서화로 마무리**

> [내 의견]
> 판단: 동의
> 이유: 전체 총평은 과장되지 않고 균형이 좋다. `문서 품질은 높지만, 구현 전환에는 naming/roadmap/BC 규약 보강이 필요하다`는 결론에 동의한다.
> 근거: `00-executive-summary.md`, `.claude/rules/task-id-naming.md`
> 적용 여부: 즉시 반영
> 메모: 최종 권고 3줄은 다음 턴 구현 우선순위로 그대로 사용 가능하다.

---

## 최종 적용 정리

### 즉시 적용

| 항목 | 판단 | 이유 | 필요한 선행조건 | 관련 문서/근거 |
|---|---|---|---|---|
| Phase 1을 `1A(report)` / `1B(check)`로 분리 | 채택 | 가장 빠른 Quick Win과 후속 정책 정합성을 동시에 확보한다. | 없음 | `08-feature-improvement-proposals.md`, `09-risk-and-migration-plan.md` |
| Codex runtime Spike를 Phase 3의 `P0 gate`로 명시 | 채택 | 현재 `targets: ["claude"]` 상태에서 Spike 없이 emitter 확장에 들어가면 검증 공백이 남는다. | `/plan-spike codex-model-runtime` 정의 | `06-advisor-tool-applicability.md`, `09-risk-and-migration-plan.md`, `profile.json` |
| Phase 4A direct integration 보류, Phase 4B는 ADR/document-only로 축소 | 채택 | 현재 저장소는 API request body를 직접 구성하지 않아 direct integration 표면이 없다. | 없음 | `06-advisor-tool-applicability.md`, [Advisor tool](https://platform.claude.com/docs/ko/agents-and-tools/tool-use/advisor-tool) |
| Phase 3에 Breaking Change 분류 추가 | 채택 | `buildCodexAgentToml()` 출력 스키마 변경은 사용자 전파와 migration 전략이 필요하다. | Phase 3 착수 결정 | `09-risk-and-migration-plan.md`, `.claude/rules/task-id-naming.md` |
| 구현 승격 시 IDEA → Screen → Draft → PRD 및 TASK ID 규약 적용 | 채택 | 분석 문서에서 구현 문서로 넘어갈 때 추적성과 검증 규약을 맞춰야 한다. | 구현 승격 결정 | `.claude/rules/task-id-naming.md` |
| 실험 항목에 blocker/parallel 관계 표기 추가 | 채택 | 실험을 나열하는 것보다 의존성을 명확히 해야 착수 판단이 빨라진다. | 없음 | 본 문서 `2-3`, `2-4`, `6-3` |

### 조건부 적용

| 항목 | 판단 | 이유 | 필요한 선행조건 | 관련 문서/근거 |
|---|---|---|---|---|
| 중앙 정책 파일(`model-policy.json`) 도입 | 조건부 채택 | 방향은 맞지만, path와 schema 경계가 아직 열려 있다. | path/schema 결정 | `07-pipeline-improvement-proposals.md`, `10-source-map-and-evidence.md` |
| 정책 파일 경로를 `src/_meta/model-policy.json`로 고정 | 조건부 채택 | `_meta` 디렉터리는 현재 repo의 기존 관례가 아니므로 구조 기준 확인이 필요하다. | source asset 구조 합의 | `src/pairing-registry.json`, `src/exception-registry.json` |
| ROI/비용 절감 수치 추가 | 조건부 채택 | 정량 지표는 유용하지만 현재는 실측 데이터가 없다. | Phase 1A 보고서 또는 운영 비용 데이터 | `00-executive-summary.md`, `10-source-map-and-evidence.md` |
| `exception-registry.json`을 과도기 브리지로 활용 | 조건부 채택 | 예외 기록용으로는 좋지만 장기 SSOT로는 성격이 다르다. | 임시 운영 원칙 수립 | `src/exception-registry.json`, `07-pipeline-improvement-proposals.md` |
| 문서 제목/부제에서 orchestration 강조 강화 | 조건부 채택 | 오해 방지에는 도움이 되지만 사용자 원래 요청의 검색성도 유지해야 한다. | 제목 정책 결정 | 사용자 요청 맥락, `04-official-anthropic-benchmark.md`, `06-advisor-tool-applicability.md` |
| `setup.js postinstall`, `CLAUDE.md` 통합점 추가 | 조건부 채택 | Phase 1에서 바로 건드리기보다 정책 기준선이 생긴 뒤 붙이는 편이 안전하다. | Phase 2 이후 | `07-pipeline-improvement-proposals.md`, `docs/30-reference/06-settings.md` |

### 보류

| 항목 | 판단 | 이유 | 필요한 선행조건 | 관련 문서/근거 |
|---|---|---|---|---|
| Phase 4B ADR 즉시 작성 | 보류 | 방향은 타당하지만, Phase 1~3의 사실관계가 더 쌓인 뒤 문서화하는 편이 낭비가 적다. | Phase 1 결과, 가능하면 Phase 3 Spike 결과 | `06-advisor-tool-applicability.md`, `08-feature-improvement-proposals.md` |
| 정교한 월간 비용 시뮬레이션 문서화 | 보류 | 데이터 없는 상태에서 수치를 쓰면 오히려 오판 가능성이 높다. | 운영 사용량 데이터 | 본 문서 `3-1`, `3-2` |
| `haiku executor + opus advisor` 벤치마크 | 보류 | 흥미로운 실험이지만 claude-kit 내부 scope가 아니라 별도 runtime 프로젝트 성격이 더 강하다. | 별도 wrapper/runtime 프로젝트 확보 | [Advisor tool](https://platform.claude.com/docs/ko/agents-and-tools/tool-use/advisor-tool), 본 문서 `6-3` |

### 비적용

| 항목 | 판단 | 이유 | 필요한 선행조건 | 관련 문서/근거 |
|---|---|---|---|---|
| 패키지 전체에서 `Advisor` 명칭을 완전히 제거 | 비적용 | 이번 분석은 사용자의 요구상 `Advisor tool` 비교가 핵심 축이었고, 이를 완전히 제거하면 추적성과 검색성이 떨어진다. | 없음 | 사용자 요청 맥락, `04-official-anthropic-benchmark.md`, `06-advisor-tool-applicability.md` |
| `exception-registry.json`을 최종 정책 SSOT로 사용 | 비적용 | 예외 레지스트리는 정책 자체보다 예외와 우회 근거를 기록하는 표면에 가깝다. | 없음 | `src/exception-registry.json` |
| 비용 절감 30~50%를 현재 문서에 확정 수치로 반영 | 비적용 | 아직 실측 근거가 없어 과도한 확정 표현이 된다. | 없음 | 본 문서 `3-1`, `3-2`, `10-source-map-and-evidence.md` |

## 추천 다음 액션

1. `Phase 1A`를 별도 IDEA로 등록하고 `model-config-report.js` 범위를 최소 기능으로 확정한다.
2. `Phase 3` 이전 필수 gate로 `codex-model-runtime` Spike를 등록해 `model` TOML 해석 여부를 먼저 검증한다.
3. 구현 승격용 문서에는 `TASK ID`, `Breaking Change`, `blocker/parallel 실험 관계` 3가지를 기본 메타데이터로 추가한다.
4. 중앙 정책 파일 도입은 유지하되, 파일 경로는 `src/model-policy.json`과 `src/_meta/model-policy.json` 중 repo 관례에 맞는 쪽으로 다시 결정한다.
5. `Phase 4`는 direct integration이 아니라 `Multi-Model Orchestration Policy` ADR 범위로 축소해 관리한다.

## 댓글 추가 위치 요약

- `TL;DR`, `핵심 발견`, `Migration Plan`, `Phase별 판정/상세`, `블로커`, `페르소나 ROI`, `ROI 표`, `통합 지점`, `강점/약점`, `누락/대안/재설계`, `우선순위`, `Backlog`, `가설`, `체크리스트`, `결론` 위치에 섹션형 댓글을 추가했다.
- 댓글 유형은 `즉시 수용`, `조건부 수용`, `보류`, `비적용 근거 보강`으로 나눠 판단했다.
- 특히 `Advisor naming`, `중앙 정책 파일 경로`, `ROI 수치`, `exception-registry 활용 범위`는 원문을 유지하면서도 적용 범위를 좁혀 코멘트했다.
