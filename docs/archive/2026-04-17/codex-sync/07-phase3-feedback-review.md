# Phase 3 구현 피드백 리뷰

> 대상 commit: `ce8b6f1` (feat/codex-sync Phase 3 — Hook fallback 도입)
> 기준 문서: `docs/codex-sync/04-rollout-validation-plan.md` §4.4 (Phase 3: Hook fallback 도입)
> 리뷰 목표: Phase 4 진입 전, Phase 3 구현이 §4.4 완료 기준을 충족하는지 + 인접 vocabulary 정합성을 점검한다.
> 작성: 2026-04-15

## 1. Executive Summary

Phase 3의 핵심 목표(session-wrap-suggest skill artifact 생성, Hook 분류 표 추가, EX-001 status 전환)는 모두 충족되었고, 7개 검증 체크가 모두 통과했다. EX-007 (security) 정책성 review도 Plan agent 권장(옵션 A — 보수적 처리)에 따라 docConstraints 보강만 진행, exec-policy split은 Phase 4+로 이연.

다만 Phase 4 진입 전에 다음 3가지는 정리해두는 편이 좋다.

1. **`04-rollout-validation-plan.md` §4.4 Phase 3 ✓ 완료 표기 누락** (Phase 1, 2 패턴 비대칭)
2. **`kit-validation/SKILL.md:37` description 미보강** (Phase 3 신규 검증 row "skill fallbackTarget" 누락 — Phase 1 I2 + Phase 2 I3와 동일 패턴 반복)
3. **session-wrap-suggest.js Hook 파일에 fallback artifact 참조 주석 부재** (reader가 Hook → skill 관계를 발견하기 어려움)

요약하면, **Phase 3 자체는 안정적이다. Phase 4 진입 전 위 3건 doc-only 패치만 처리하면 vocabulary 일관성과 reader-facing 발견성이 회복된다.**

## 2. What Was Implemented

### 2.1 commit ce8b6f1 — Hook fallback 도입

| 파일 | 변경 요지 |
|------|-----------|
| `src/claude/core/skills/session-wrap-suggest/SKILL.md` (NEW) | EX-001 fallback artifact. Stop hook 의도(threshold 30회 도구 호출 시 /session-wrap 제안)를 runtime-independent하게 보존. Claude/Codex 양쪽에서 invoke 가능. |
| `src/exception-registry.json` | EX-001 status `active` → `resolved` + skill 경로 docConstraints 추가. EX-007 docConstraints에 Phase 3 review note (exec-policy 후보 vs guidance only 식별) |
| `.claude/skills/kit-converter/references/conversion-rules.md` | Hook 변환 섹션 재구조화. 9개 hook 분류 표 (2 special-case + 7 informational paired-direct). PostToolUse Bash 범위 / Stop 공식 지원 / Windows 비활성화 / Platform 주의사항 명시. |
| `.claude/skills/kit-validation/references/schema-exception-registry.md` | 신규 WARN row: `status=resolved + strategy=paired-fallback + fallbackTarget=skill` → `src/claude/{domain}/skills/{component}/SKILL.md` 존재 검증 |
| `.claude/skills/kit-converter/references/skip-registry.md` | Hook 비-direct 표에 status 컬럼 추가, session-wrap-suggest row resolved + skill 경로 명시 |

### 2.2 Distribution (Phase 3 후)

| strategy / status | 개수 | 항목 |
|---|---|---|
| paired-direct / resolved | 1 | EX-002 (output-secret-filter) |
| paired-fallback / resolved | 7 | EX-001 (session-wrap-suggest, Phase 3) + EX-003~008 (6 rules, Phase 2) |

**모든 8 entries가 resolved 상태.** Phase 3 후 active 상태 entry 0건.

## 3. Verification Results

7개 검증 체크 모두 통과.

| # | 항목 | 결과 |
|---|------|------|
| 1 | session-wrap-suggest/SKILL.md 존재 | 4361 bytes ✓ |
| 2 | EX-001 status=resolved + docConstraints에 skill 경로 | true ✓ |
| 3 | EX-007 Phase 3 review note 추가 | true ✓ |
| 4 | conversion-rules.md Hook 분류 표 9 hook entry | 10 (header + 9) ✓ |
| 5 | schema-exception-registry skill fallbackTarget WARN row | 1 ✓ |
| 6 | skip-registry session-wrap-suggest resolved | 매치 ✓ |
| 7 | distribution = 1 paired-direct/resolved + 7 paired-fallback/resolved | OK ✓ |

## 4. Plan vs Implementation Drift

### 4.1 Deviation D1 — HOOK_PORTABILITY 7 hooks 미추가 (의도적)

**Explore agent 권장**: 모든 hook 9개를 HOOK_PORTABILITY에 등록 (paired-direct 7개 추가)

**실제 구현**: 2 special-case만 등록 유지. 7개는 conversion-rules.md 분류 표에 "informational paired-direct"로 명시.

**근거**:
- HOOK_PORTABILITY 원래 설계 의도는 "special case만"
- Phase 4 codex-portability.json이 full manifest 담당 예정 (04-rollout-validation-plan.md §4.5)
- 7개 informational hook은 setup.js 기본 동작(default compatible:true)으로 충분

**영향**: 없음. Phase 4에서 codex-portability.json 도입 시 자연스럽게 등록될 예정.

### 4.2 Deviation D2 — Phase 3 ✓ 완료 표기 누락

Phase 1과 Phase 2는 commit 후 같은 세션에서 04-rollout-validation-plan.md에 ✓ 표기를 추가했다 (각각 commit `7a0e8d4`, `f02297c`). Phase 3은 이 패턴을 따르지 않았다.

**§5 C1에서 다룸**.

## 5. Findings

### Critical

#### C1. `04-rollout-validation-plan.md` §3 + §4.4 Phase 3 ✓ 완료 표기 누락

Phase 1, 2 패턴과 비대칭. 현재 §3 표 Phase 3 row는 "대기" 그대로, §4.4 헤더도 "Phase 3: Hook fallback 도입"만 명시.

**제안**: §3 Phase 3 row를 `대기` → `✓ 완료 (commit ce8b6f1, 2026-04-15)`로 변경. §4.4 헤더에 "— ✓ 완료 (2026-04-15)" 추가. Phase 1, 2와 동일 패턴으로 후속 의무도 명시 (예: T18 setup.js 확장은 Phase 4, codex-portability.json 도입은 Phase 4).

### Important

#### I1. `kit-validation/SKILL.md:37` description Phase 3 신규 row 미보강

Phase 1 feedback I2, Phase 2 feedback I3와 동일한 누락. Phase 3에서 추가한 검증 row("skill fallbackTarget" WARN)도 description에 반영 안 됨.

**현재**:
> $schema, entries, 필수 필드, id 형식, status enum (active/resolved/expired/revoked), Phase 1 SSOT 필드 (...), 조건부 무결성 (...), Phase 2 artifact 무결성 (...), policy-review-pending INFO

**제안**:
> ... + Phase 3 hook fallback artifact 무결성 (paired-fallback resolved + skill fallbackTarget → src/claude/{domain}/skills/{component}/SKILL.md 존재 검증)

#### I2. `session-wrap-suggest.js` Hook 파일에 fallback artifact 참조 주석 부재

원본 Hook 파일(`src/claude/core/hooks/session-wrap-suggest.js`)이 Phase 3 skill artifact의 존재를 모른다. reader가 Hook → skill 관계를 발견하려면 exception-registry나 skip-registry를 거쳐야 함 — discoverability 약함.

**제안**: Hook 파일 상단 JSDoc에 다음 줄 추가:
> `* Codex fallback: src/claude/core/skills/session-wrap-suggest/SKILL.md (EX-001 paired-fallback)`

Phase 3 commit 범위가 아니었지만 5초짜리 surgical 변경.

#### I3. session-wrap-suggest skill의 Codex 자동 호출 메커니즘 부재

skill artifact는 생성됐지만 Codex 사용자가 명시적으로 invoke해야 호출됨. Claude는 Stop hook이 자동 trigger되지만 Codex는 동등 메커니즘 명시 안 됨.

**현재 SKILL.md "Runtime별 호출 패턴"**: Codex는 "host runtime의 세션 종료 trigger 또는 명시적 호출"

**제안**: Phase 3 의도가 "fallback artifact 보존"이므로 자동 호출은 비범위. 그러나 Codex 사용자 가이드(별도 문서)에 "session-wrap-suggest skill 자동 호출 설정 방법"을 Phase 4+에서 정리하면 좋음. **현재는 변경 불필요**, Phase 4 검토 항목.

### Nice to Have

#### N1. EX-007 Phase 3 review note이 EX-007에만 있고 EX-008 (verification) 등 다른 rule entry는 review 누락

Phase 3 EX-007 review에서 "exec-policy 후보 vs guidance only" 분리 분석을 했는데, 다른 5개 rule (EX-003~006, 008)에는 동일 분석 없음. 일관성 차원에서:

**제안**: 다른 5개 rule에도 한 줄씩 "Phase 3 review: pure guidance, no exec-policy candidates" 메모 추가. 또는 Phase 3 review 결과를 별도 문서(`docs/codex-sync/phase3-rule-review.md`)로 통합. **우선순위 낮음 — Phase 4 codex-portability.json 도입 시 자연스럽게 통합 가능**.

#### N2. session-wrap-suggest skill의 trigger 임계값 (30회) 정당화 부재

원본 Hook과 동일한 값(30)을 그대로 사용. SKILL.md `--threshold N` 인자로 customize 가능하지만 30이라는 값의 evidence 없음.

**제안**: SKILL.md "트리거 조건" 섹션에 30 임계값의 근거 추가 (예: "원본 Hook 채택값. 90% 사용자 세션에서 한 번 미만 발화 보장"). **우선순위 낮음** — Phase 5 runtime 검증에서 데이터 수집 가능.

## 6. Recommended Adjustments (Phase 4 진입 전)

다음 3건은 Phase 4를 시작하기 전 doc-only 패치로 처리.

1. **C1 Phase 3 ✓ 완료 표기**: `04-rollout-validation-plan.md` §3 표 + §4.4 헤더 (Phase 1, 2와 동일 패턴).
2. **I1 kit-validation/SKILL.md:37 description 보강**: Phase 3 hook fallback artifact 무결성 row 명시.
3. **I2 session-wrap-suggest.js JS 파일에 fallback artifact 참조 주석 추가**: 5초 surgical 변경, discoverability 향상.

다음 2건은 Phase 4~5 작업 중 자연스럽게 함께 처리.

4. **I3 Codex 자동 호출 메커니즘** — Phase 4 codex-portability.json 또는 별도 가이드.
5. **N1 다른 5 rule entry review note 일관성** — Phase 4 통합 가능.
6. **N2 임계값 evidence** — Phase 5 runtime 검증.

## 7. Suggested Next Order

Phase 4 진입 전 다음 순서를 권장:

1. 이 문서(07-phase3-feedback-review.md) 검토.
2. §6 항목 1~3 결정 (모두 doc/주석 5분 패치).
3. Phase 4 시작 (sync pipeline 확장 — codex-portability.json + 4-tier 컬럼 + T18 setup.js + drift detection).

## 8. Reference Notes

### Phase 3에서 변경된 파일 (5개)

- `src/claude/core/skills/session-wrap-suggest/SKILL.md` (NEW)
- `src/exception-registry.json` (EX-001 + EX-007)
- `.claude/skills/kit-converter/references/conversion-rules.md`
- `.claude/skills/kit-validation/references/schema-exception-registry.md`
- `.claude/skills/kit-converter/references/skip-registry.md`

### 영향 받는 파일 (§6 Phase 3 후속 처리)

- `docs/codex-sync/04-rollout-validation-plan.md` (§3 + §4.4, C1)
- `.claude/skills/kit-validation/SKILL.md` (line 37, I1)
- `src/claude/core/hooks/session-wrap-suggest.js` (JSDoc 주석, I2)

### 관련 commit

- `ce8b6f1` feat(codex-sync): Phase 3 — Hook fallback 도입 (session-wrap-suggest skill artifact + Hook 분류 표)

### 이전 phase 피드백

- `docs/codex-sync/05-phase1-feedback-review.md`
- `docs/codex-sync/06-phase2-feedback-review.md`
