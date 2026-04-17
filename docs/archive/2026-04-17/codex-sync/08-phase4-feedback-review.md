# Phase 4 구현 피드백 리뷰

> 대상 commit: `3c36d2d` (data/script — codex-portability + T18), `a4525b4` (4-tier 출력 + audit 확장)
> 기준 문서: `docs/codex-sync/04-rollout-validation-plan.md` §4.5 (Phase 4: Pipeline 확장)
> 리뷰 목표: Phase 5 진입 전, Phase 4 구현이 §4.5 완료 기준을 충족하는지 + 7개 통합 작업이 모두 반영되었는지 점검.
> 작성: 2026-04-15

## 1. Executive Summary

Phase 4의 핵심 목표(codex-portability.json SSOT, T18 setup.js, 4-tier 출력, C7 cross-check, C10 drift detection)는 모두 충족. 추가로 Phase 1~3의 후속 의무 4건도 동시 해소: T18 (Phase 1), C7 cross-check (Phase 1 I3), drift detection (Phase 2 N2), HOOK_PORTABILITY 7 hooks 정식 등록 (Phase 3 D1).

다만 Phase 5 진입 전에 다음 3가지는 정리해두는 편이 좋다.

1. **Phase 4 ✓ 완료 표기 누락** (Phase 1~3과 동일 패턴)
2. **kit-validation/SKILL.md description 미보강** (Phase 4 신규: codex-portability.json 도입, 새 스키마 candidate)
3. **codex-portability.json 자체에 schema validation 부재** — kit-validate가 이 파일을 검증할 schema 정의 없음 (Phase 5+ 보강 후보)

요약하면, **Phase 4는 통합 작업 7건을 모두 묶어 안정적으로 마무리됨. Phase 5 (runtime 검증) 진입 전 위 3건만 잠그면 충분.**

## 2. What Was Implemented

### 2.1 commit 3c36d2d — data/script layer

| 파일 | 변경 요지 |
|------|-----------|
| `src/claude/_meta/codex-portability.json` (NEW, 295줄) | Full portability manifest. 15 entries (9 hooks + 6 rules). vocabulary 정의 + sources 명시 + 각 entry의 strategy/officialSurface/officialBasis/evidenceLevel/docConstraints/fallbackTarget/exceptionId/claudeSource/codexSource/confidence. |
| `scripts/setup.js` | T18 적용: emitCodex가 paired-direct hook에 한해 SRC_CODEX 우선 source. getPortability(file) 조회 후 sourceRoots 분기. |
| `scripts/codex-hook-compat.js` | output-secret-filter.js compatible: false → true (T18 적용 후 안전). reason: null. Phase 1 deviation D1 해소. |

### 2.2 commit a4525b4 — command/agent/audit layer

| 파일 | 변경 요지 |
|------|-----------|
| `.claude/commands/kit-analyze.md` | Phase 2/3/4 모두 4-tier 적용. 출력 표 5컬럼(paired-direct/fallback/review/blocked). Evidence 분포 표 추가. 상세 표에 Strategy/Evidence/OfficialSurface/Fallback Target. |
| `.claude/commands/kit-convert.md` | 타입별 변환 규칙에 strategy 명시. Hook 분기(paired-direct vs paired-fallback). |
| `.claude/commands/kit-sync.md` | 4-tier strategy + evidence 보고 명시. SSOT 위계 명시. |
| `.claude/agents/kit-sync-agent.md` | Why_This_Matters에 codex-sync Phase 4 4-tier 보고 패턴 + SSOT 위계 추가. |
| `.claude/commands/kit-audit.md` | C7 확장 (Phase 1 I3): exception ↔ pairing vocabulary mapping cross-check 4가지 모순 패턴. C10 신규 (Phase 2 N2): rule/hook/sibling drift detection. |

### 2.3 통합된 후속 의무

| 의무 | 출처 | Phase 4 처리 |
|------|------|--------------|
| T18 setup.js SRC_CODEX 우선 | Phase 1 D1 후속 (08-phase4 T18) | ✓ commit 3c36d2d |
| C7 audit cross-check | Phase 1 feedback I3 | ✓ commit a4525b4 |
| AGENTS.md drift detection | Phase 2 feedback N2 | ✓ commit a4525b4 (C10) |
| HOOK_PORTABILITY 7 informational | Phase 3 deviation D1 후속 | ✓ commit 3c36d2d (codex-portability.json) |

## 3. Verification Results

| # | 항목 | 결과 |
|---|------|------|
| 1 | codex-portability.json 유효성 + entries 수 | 15 (9 hooks + 6 rules) ✓ |
| 2 | T18 setup.js 적용 | preferCodex/sourceRoots 분기 존재 ✓ |
| 3 | output-secret-filter compatible:true | `{compatible:true, reason:null}` ✓ |
| 4 | filterCodexHooks 결과 변경 (output-secret-filter 이제 compatible) | 2 compatible + 1 skipped ✓ |
| 5 | kit-analyze 4-tier 컬럼 도입 | 5컬럼 표 + evidence 분포 ✓ |
| 6 | kit-audit C7 cross-check + C10 신규 | 4 모순 패턴 + 3 drift 패턴 ✓ |

## 4. Plan vs Implementation Drift

### 4.1 Deviation D1 — kit-sync.md / kit-sync-agent.md 최소 변경

**Plan 의도**: 4-tier 출력 + evidence 보고 자세히

**실제 구현**: Why_This_Matters에 reference note 추가만 (구체 출력 형식은 kit-analyze.md를 참조하도록 위임)

**근거**: kit-sync.md는 high-level overview, 출력 형식 SSOT는 kit-analyze.md (보고서 표). 중복 정의 회피.

**영향**: 없음. kit-sync-agent가 kit-analyze.md를 참조해 동일 4-tier 출력 가능.

### 4.2 부수 결정 — kit-list.md 미변경

`kit-list.md`도 `--target/--pairing` 플래그 외에 4-tier strategy 표시 가능했으나 이번 Phase 4 범위에 포함하지 않음. 우선순위 낮음 — Phase 5 또는 후속 작업에서 통합 가능.

## 5. Findings

### Critical

#### C1. Phase 4 ✓ 완료 표기 누락 (Phase 1~3과 동일 패턴)

`04-rollout-validation-plan.md` §3 표 Phase 4 row + §4.5 detail header에 ✓ 완료 표기 미적용. Phase 1, 2, 3 모두 이 패턴을 따랐으나 Phase 4만 누락.

**제안**: §3 row를 `대기` → `✓ 완료 (commit 3c36d2d, a4525b4, 2026-04-15)`. §4.5 header에 "— ✓ 완료". 통합한 4건 후속 의무 명시.

### Important

#### I1. `kit-validation/SKILL.md:37` description Phase 4 신규 미보강

Phase 1~3 누적 누락 패턴 반복. Phase 4가 추가한 항목:
- codex-portability.json 도입 (신규 데이터 SSOT)
- C7 cross-check 확장 (exception ↔ pairing)
- C10 drift detection (artifact 무결성)

**제안**: kit-validation은 schema 검증 도구이므로 codex-portability.json schema도 향후 추가 검토.

#### I2. codex-portability.json 자체 schema 정의 부재

신규 manifest이지만 `.claude/skills/kit-validation/references/`에 대응 schema 없음. 현재는 reader-discoverability에 의존.

**제안**: Phase 5 또는 별도 phase에서 `schema-codex-portability.md` 추가:
- `$schema = codex-portability-v1` 검증
- entries 배열 + 필수 필드 (identity, type, strategy, officialSurface, evidenceLevel, exceptionId)
- vocabulary와 entry value 일치 검증
- exceptionId가 exception-registry에 존재하는지 cross-check

#### I3. T18 적용의 setup.js 검증 미실행

T18 코드 변경은 적용됐으나 실제 `node scripts/setup.js`로 plugin 생성 + Codex 버전이 복사되는지 검증 안 함. Phase 5 runtime 검증에서 처리 대상.

### Nice to Have

#### N1. C10 drift detection은 명세만 있고 구현 없음

`kit-audit.md` C10에 3가지 drift 패턴이 명시됐지만 실제 구현(git log 비교, semantic comparison)은 별도 작업. Phase 5+ runtime 검증 또는 별도 audit 구현 task로 이연.

#### N2. codex-portability.json의 9 hook entries 중 7개가 "추정" evidenceLevel

7개 informational paired-direct hook (code-quality-reminder, security-auto-trigger, edit-tracker, dev-tdd-guard, dev-feature-scope-guard, plan-doc-guard, dev-db-guard 일부)의 evidenceLevel이 "추정"이다. Phase 5 runtime 검증에서 실제 Codex 환경에서 PostToolUse Edit|Write matcher 동작 확인 후 "공식 지원" 또는 "검증 필요"로 갱신 권장.

## 6. Recommended Adjustments (Phase 5 진입 전)

다음 2건은 Phase 5를 시작하기 전 doc-only 패치로 처리.

1. **C1 Phase 4 ✓ 완료 표기**: `04-rollout-validation-plan.md` §3 + §4.5 (Phase 1~3과 동일 패턴).
2. **I1 kit-validation/SKILL.md description 보강**: codex-portability.json 도입 + C7 cross-check + C10 drift 언급 (선택, kit-validation은 SKILL.md 자체보다 schema 추가가 더 의미 있음).

다음 3건은 Phase 5 또는 후속 작업에서 처리.

3. **I2 schema-codex-portability.md 신규** — Phase 5 또는 별도 schema task.
4. **I3 T18 runtime 검증** — Phase 5 runtime test (실제 setup.js 실행).
5. **N1 C10 drift detection 구현** — Phase 5+ audit 구현 task.

## 7. Suggested Next Order

1. 이 문서(08-phase4-feedback-review.md) 검토.
2. §6 항목 1 결정 (Phase 4 ✓ 완료 표기, doc 패치).
3. Phase 5 시작 (runtime 검증 — dry-run, sample conversion, T18 실행 검증, codex-portability schema, C10 drift 구현).

## 8. Reference Notes

### Phase 4에서 변경된 파일 (8개)

- `src/claude/_meta/codex-portability.json` (NEW, full manifest)
- `scripts/setup.js` (T18)
- `scripts/codex-hook-compat.js` (output-secret-filter compatible:true)
- `.claude/commands/kit-analyze.md` (4-tier 출력)
- `.claude/commands/kit-convert.md` (4-tier 처리 분기)
- `.claude/commands/kit-sync.md` (4-tier 보고 명시)
- `.claude/agents/kit-sync-agent.md` (SSOT 위계)
- `.claude/commands/kit-audit.md` (C7 cross-check + C10 신규)

### 영향 받는 파일 (§6 Phase 4 후속 처리)

- `docs/codex-sync/04-rollout-validation-plan.md` (§3 + §4.5, C1)
- `.claude/skills/kit-validation/SKILL.md` (line 37, I1, 선택)
- `.claude/skills/kit-validation/references/schema-codex-portability.md` (NEW, I2, Phase 5+)

### 관련 commit

- `3c36d2d` feat(codex-sync): Phase 4 (1/3) — codex-portability.json SSOT + T18 setup.js 확장 + output-secret-filter compatible:true
- `a4525b4` feat(codex-sync): Phase 4 (2/3) — 4-tier 출력 + C7 cross-check + C10 drift detection

### 이전 phase 피드백

- `docs/codex-sync/05-phase1-feedback-review.md`
- `docs/codex-sync/06-phase2-feedback-review.md`
- `docs/codex-sync/07-phase3-feedback-review.md`
