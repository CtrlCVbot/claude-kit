# Phase 1 구현 피드백 리뷰

> 대상 커밋: `c794351` (chore/codex-sync), `957fb8d` (refactor/scripts)
> 대상 계획: `~/.claude/plans/fluttering-floating-cherny.md` (Phase 1)
> 기준 문서: `docs/codex-sync/04-rollout-validation-plan.md` §4.2 (Phase 1: 레지스트리 정합성 회복)
> 리뷰 목표: Phase 2 진입 전, 구현과 계획의 차이를 드러내고 후속 단계 영향이 있는 결정을 잠근다.
> 작성: 2026-04-15

## 1. Executive Summary

Phase 1의 목표(레지스트리 정합성 회복)는 4개 파일에 걸쳐 모두 반영되었고, 10개 검증 체크가 모두 통과했다. `output-secret-filter`가 4개 surface(exception-registry, pairing-registry, skip-registry view, codex-hook-compat)에서 일관된 `paired-direct` 상태로 보인다는 §4.2 완료 기준도 충족한다.

다만 Phase 2 진입 전에 다음 3가지는 잠궈둘 필요가 있다.

1. **계획서 vs 구현 deviation 1건**: `output-secret-filter.js`의 `compatible` 값이 계획서 literal(`true`)과 다르게 `false`로 구현되었다. 이 결정은 setup.js 회귀를 막기 위함이며, 대신 setup.js가 Phase 4에서 `src/codex/` source를 직접 읽는 작업이 명시적 후속으로 묶여야 한다.
2. **Phase 2가 건드릴 stale 표현이 4곳 남아있다**: `rule = skip` 기반 문장이 `kit-convert.md`, `kit-analyze.md`, `kit-converter/SKILL.md`, `conversion-rules.md`에 그대로 있다. Phase 2 문서 패치 범위에 모두 포함되어야 한다.
3. **registry vocabulary 불일치**: `exception-registry.status`는 `active|resolved|expired|revoked`인데 `pairing-registry.status`는 `paired|codex-skip`이다. C7 audit이 두 registry를 cross-check하려면 vocabulary mapping 표가 먼저 잠겨야 한다.

요약하면, **Phase 1 구현 자체는 안정적이다. Phase 2로 가기 전에 위 3건만 결정해두면 후속 작업 비용이 크게 줄어든다.**

## 2. What Was Implemented

### 2.1 commit c794351 — 데이터 + 스키마 + 문서 view

| 파일 | 변경 요지 |
|------|-----------|
| `src/exception-registry.json` | 5개 신규 필드(`strategy` / `officialSurface` / `evidenceLevel` / `docConstraints` / `fallbackTarget`) 추가, EX-001~008 재분류 |
| `.claude/skills/kit-validation/references/schema-exception-registry.md` | 신규 필드 검증 규칙 + 조건부 무결성 검증 + status enum에 `resolved` 추가 |
| `.claude/skills/kit-converter/references/skip-registry.md` | "Codex 전환 비-direct 대상 view (서술형)"으로 재명명, "SSOT가 아니다" 명시, exception-registry 우선 선언 |

### 2.2 commit 957fb8d — 스크립트 구조화

| 파일 | 변경 요지 |
|------|-----------|
| `scripts/codex-hook-compat.js` | flat `EXCLUDED_HOOKS` → 구조화 `HOOK_PORTABILITY` (strategy/officialSurface/evidenceLevel/docConstraints), backward-compat 함수 서명 유지, 신규 export `getPortability()` 추가 |

### 2.3 entry 재분류 결과

| ID | component | status | strategy | officialSurface | fallbackTarget |
|----|-----------|--------|----------|-----------------|----------------|
| EX-001 | session-wrap-suggest | active | paired-fallback | hooks.stop | skill |
| EX-002 | output-secret-filter | resolved | paired-direct | hooks | null |
| EX-003 | coding-style | active | paired-fallback | agents_md | agents-guidance |
| EX-004 | date-calculation | active | paired-fallback | agents_md | agents-guidance |
| EX-005 | golden-principles | active | paired-fallback | agents_md | agents-guidance |
| EX-006 | interaction | active | paired-fallback | agents_md | agents-guidance |
| EX-007 | security | active | paired-fallback | agents_md | agents-guidance |
| EX-008 | verification | active | paired-fallback | agents_md | agents-guidance |

분포: 7 paired-fallback + 1 paired-direct.

## 3. Verification Results

10개 검증 체크가 모두 통과했다.

| # | 항목 | 결과 |
|---|------|------|
| 1 | exception-registry JSON 유효성 | OK (8 entries) |
| 2 | 모든 entry에 `strategy` + `evidenceLevel` 존재 | true |
| 3 | EX-001 재분류 (paired-fallback / hooks.stop / fallbackTarget=skill / status=active) | OK |
| 4 | EX-002 재분류 (paired-direct / hooks / status=resolved) | OK |
| 5 | skip-registry "SSOT가 아니다" 명시 | 1 match |
| 6 | `isCodexCompatible('output-secret-filter.js')` 형식 (compatible boolean + reason) | OK (값은 §4.1 deviation 참조) |
| 7 | `getPortability('session-wrap-suggest.js')` strategy + fallbackTarget 포함 객체 반환 | OK |
| 8 | `filterCodexHooks` shape backward-compat | OK (1 compatible + 2 skipped, 기존과 동일) |
| 9 | exception-registry EX-002 paired-direct ↔ pairing-registry status=paired 일관성 | OK |
| 10 | strategy 분포 = 8 entries 합 | 7 paired-fallback + 1 paired-direct = 8 |

## 4. Plan vs Implementation Drift

### 4.1 Deviation D1 — `output-secret-filter.js` `compatible` 값

**계획서 literal**: `compatible: true` (verification check #6에서 `{compatible:true, reason:null}` 명시)

**실제 구현**: `compatible: false`, `reason: 'paired-direct: Codex sibling lives at src/codex/core/hooks/ (do not copy Claude-only source)'`

**근거**:

- `src/claude/core/hooks/output-secret-filter.js`는 `CLAUDE_REMOTE_SESSION` 게이트만 있는 Claude-only 구현 (114줄)
- Codex 전용 dual-aware sibling이 `src/codex/core/hooks/output-secret-filter.js`에 존재 (`CODEX_SANDBOX || CLAUDE_REMOTE_SESSION` + `.codex/logs/` 경로, 127줄)
- `compatible: true`로 바꾸면 `setup.js`(line 557, `path.join(SRC_CLAUDE, ...)`)가 Claude-only 소스를 Codex plugin으로 복사하는 회귀 발생
- 계획서 §리스크에 명시된 "기존 setup.js 등 호출자 무영향" 원칙 우선

**영향**: setup.js 동작이 보존된다. 대신 Phase 4가 `setup.js`의 emitCodex가 paired-direct hook에 한해 `SRC_CODEX`에서 읽도록 확장하는 작업을 명시적으로 떠안아야 한다.

**제안**: Phase 4 작업 항목에 다음 한 줄을 추가한다.

> "T-X: setup.js의 emitCodex가 `HOOK_PORTABILITY[file].strategy === 'paired-direct'`인 hook에 한해 `SRC_CODEX/{domain}/hooks/{file}`을 우선 읽고, 없으면 `SRC_CLAUDE` fallback으로 폴백한다. 동시에 `output-secret-filter.js`의 `HOOK_PORTABILITY.compatible`을 `true`로 전환한다."

### 4.2 부수 변경 — feedback-review.md 삭제 동반 커밋

`commit c794351`에 `docs/meta-tooling/feedback-review.md` 삭제가 함께 들어갔다. 이 파일 삭제는 Phase 1 작업 시작 전 이미 staged 상태였고, 의미상 `docs/codex-sync/` 신규 doc set로 대체되는 흐름과 어긋나지 않으므로 분리 commit하지 않았다.

**영향**: 없음. 다만 다음 Phase에서는 Phase 작업 시작 전 `git status`를 먼저 정리하는 절차를 추가한다.

## 5. Findings

### Critical

#### C1. setup.js의 `SRC_CODEX` 미사용은 Phase 4 정식 항목으로 등록되어야 한다

현재 `setup.js`는 `SRC_CODEX` 상수를 정의해두지만 실제 hook 복사 경로(line 557)에서는 `SRC_CLAUDE`만 읽는다. Phase 1의 D1 deviation은 이 한계를 우회하기 위함이다.

이 한계는 다음 항목들이 모두 영향을 받는다.

- `output-secret-filter`의 `compatible` 전환 (D1과 직결)
- 향후 paired-direct로 전환되는 다른 hook
- Phase 4 `/kit-analyze` 4-tier 출력 신뢰성

**제안**: Phase 4 spec 문서 (예: `docs/meta-tooling/08-phase4-codex-implementation.md`)에 setup.js 확장 task를 추가한다. 미루면 D1이 stale technical-debt로 굳는다.

#### C2. registry vocabulary 표가 먼저 잠겨야 한다

현재:

| Registry | status 값 |
|----------|-----------|
| `exception-registry.json` | `active` / `resolved` / `expired` / `revoked` |
| `pairing-registry.json` | `paired` / `codex-skip` (관찰됨) |

Phase 1은 두 registry의 mapping을 명시하지 않았다. C7 audit이 cross-check를 하려면 다음과 같은 표가 필요하다.

| exception strategy | pairing status | 의미 |
|--------------------|----------------|------|
| `paired-direct` + `resolved` | `paired` | 정상 paired 완료 |
| `paired-fallback` + `active` | `paired` (artifact 생성 후) 또는 entry 없음 (artifact 생성 전) | Phase 2~3 진행 중 |
| `paired-review` | `paired` 또는 entry 없음 | review 중 |
| `blocked` | `codex-skip` | 진짜 skip |

**제안**: Phase 4 pipeline 확장 작업 전에 이 표를 `docs/codex-sync/03-sync-pipeline-design.md` §7에 추가한다.

#### C3. Phase 2가 건드릴 stale "rule = skip" 표현이 4곳에 남아있다

현재 코드베이스에 다음 표현이 살아있다.

| 위치 | 표현 |
|------|------|
| `.claude/commands/kit-convert.md:69` | "Rule: skip 처리 (로그만)" |
| `.claude/commands/kit-analyze.md:54` | "rule: 항상 `skip` (claude-origin shared)" |
| `.claude/skills/kit-converter/SKILL.md:20` | "rule \| codex-skip (AGENTS.md guidance)" |
| `.claude/skills/kit-converter/references/conversion-rules.md:78` | "## Rule 처리 (skip)" |

Phase 1은 이 4곳을 의도적으로 건드리지 않았다 (Phase 2 범위). 그러나 현재 시점에서는 exception-registry와 4개 문서가 contradictory 상태다.

**제안**: Phase 2 작업 항목에 위 4개 파일을 모두 명시적으로 포함한다. 누락 시 Phase 1과 Phase 2 사이의 transition window에서 `/kit-analyze`나 `/kit-convert`가 stale 판단을 출력할 수 있다.

### Important

#### I1. `04-rollout-validation-plan.md`에 Phase 1 완료 표기가 필요하다

현재 `04-rollout-validation-plan.md`는 모든 Phase를 "예상 결과"로 기술한다. Phase 1은 이미 구현되었으므로 §3 표 또는 §4.2 헤더에 "✓ 2026-04-15 commit c794351, 957fb8d로 반영됨" 같은 status note가 들어가는 편이 좋다.

**근거**: Phase 2~5 작업자가 Phase 1 완료 상태를 문서만 보고 알 수 있어야 한다.

#### I2. `kit-validation/SKILL.md`의 schema 카운트는 갱신 불필요하지만 description 갱신은 권장

`kit-validation/SKILL.md:37`는 "schema-exception-registry.md ... status enum"으로 generic하게 적혀있어 enum 값 변경(active|expired|revoked → +resolved)에는 기술적으로 영향이 없다. 하지만 신규 5개 필드(strategy, officialSurface, evidenceLevel, docConstraints, fallbackTarget) 검증이 추가된 점은 이 description에 한 줄로 보강하는 편이 자연스럽다.

**제안**: line 37을 다음으로 보강한다.

> `| 10 | schema-exception-registry.md | src/exception-registry.json | $schema, entries, 필수 필드, id 형식, status enum, Phase 1 SSOT 필드 (strategy/evidenceLevel) |`

#### I3. C7 audit이 exception-registry를 인지하도록 확장 명세 필요

현재 `kit-audit.md` C7는 `pairing-registry.json`만 본다. Phase 1 이후 exception-registry의 `strategy=paired-direct`와 pairing-registry의 `status=paired`가 cross-check 대상이 된다.

**제안**: Phase 4 pipeline 확장 시 C7 명세에 다음 한 줄 추가.

> "exception-registry의 `strategy=paired-direct`/`paired-fallback` entry가 pairing-registry와 모순되지 않는지 (FAIL: paired-direct인데 pairing-registry에 paired entry 없음)"

#### I4. `compatible` field 의미가 미묘하게 overloaded

`HOOK_PORTABILITY.compatible`은 두 가지 의미가 섞여있다.

- 의미 A: hook의 Codex runtime 호환성 (개념적)
- 의미 B: setup.js가 Claude source를 Codex plugin으로 복사할지 여부 (operational)

`output-secret-filter`에서 의미 A는 true(Codex sibling이 호환됨)지만 의미 B는 false(Claude source는 Codex용이 아니므로 복사 안 함)이다. 현재 코드는 의미 B만 코드화한다.

**제안**: 다음 두 가지 옵션 중 하나로 잠근다.

- 옵션 1 (현행 유지): `compatible`은 setup.js operational 의미만 가진다. 의미 A는 `strategy === 'paired-direct'`로 추론. JSDoc에 명시.
- 옵션 2 (분리): `pluginCopyEligible` 같은 별도 필드를 추가하고 `compatible`을 의미 A로 명확화. setup.js가 `pluginCopyEligible`을 본다.

옵션 1이 backward-compat 측면에서 안전하다. 옵션 2는 Phase 4 setup.js 확장과 동시에 도입하는 편이 일관적.

### Nice to Have

#### N1. registry vocabulary 통일 후보

`pairing-registry.status="paired"`와 `exception-registry.status="resolved"`가 같은 paired-direct 상태를 표현한다. Phase 4에서 codex-portability.json을 도입할 때 vocabulary를 통일하는 편이 audit 가독성이 좋다.

**예**: 두 registry 모두 `paired` / `paired-fallback` / `review-needed` / `blocked`로 통일.

#### N2. 검증 자동화

Phase 1이 통과한 10개 체크는 수동 node CLI 호출이다. 향후 Phase 검증이 늘어날수록 `.claude/skills/kit-validation/references/`에 검증 스크립트나 명령으로 정리하는 편이 좋다.

#### N3. `getPortability()` 사용처 지정

신규 export `getPortability()`는 현재 어디에서도 호출되지 않는다. Phase 4 `/kit-analyze`가 활용 예정으로 설계되었으므로, Phase 4 spec에 호출 지점을 명시한다.

## 6. Recommended Adjustments (Phase 2 진입 전)

다음 4건은 Phase 2를 시작하기 전에 결정만 잠궈도 충분하다. 구현은 해당 Phase에서 처리.

1. **C1 Phase 4 항목 등록**: setup.js emitCodex가 `SRC_CODEX`를 paired-direct hook 우선 source로 사용하도록 확장하는 task를 `docs/meta-tooling/08-phase4-codex-implementation.md`에 추가한다.
2. **C2 vocabulary mapping 표 추가**: `docs/codex-sync/03-sync-pipeline-design.md` §7에 exception-registry status ↔ pairing-registry status mapping 표를 추가한다.
3. **C3 Phase 2 범위 확정**: Phase 2 작업 항목에 4개 stale rule=skip 표현 (§5 C3 표) 모두 포함을 명시한다.
4. **I1 Phase 1 completion mark**: `04-rollout-validation-plan.md` §3 또는 §4.2에 commit hash와 함께 "Phase 1 완료" 표시 추가.

다음 2건은 Phase 2~4 작업 중 자연스럽게 함께 처리하면 된다.

5. **I2 SKILL.md description 보강**: kit-validation Phase 4 확장 시 함께 처리.
6. **I4 `compatible` 의미 잠금**: Phase 4 setup.js 확장 시 옵션 1 또는 2 선택.

## 7. Suggested Next Order

Phase 2 진입 전에 다음 순서를 권장한다.

1. 이 문서(05-phase1-feedback-review.md) 검토.
2. §6 항목 1~4 결정 (문서 patch만, 코드 변경 없음).
3. Phase 2 시작 (rule fallback 도입).

이 순서로 가면 Phase 2 작업자가 Phase 1 완료 상태와 후속 의무를 한눈에 알 수 있다.

## 8. Reference Notes

### 변경된 파일

- `src/exception-registry.json`
- `.claude/skills/kit-validation/references/schema-exception-registry.md`
- `.claude/skills/kit-converter/references/skip-registry.md`
- `scripts/codex-hook-compat.js`

### 영향 받는 파일 (Phase 2~4 후속)

- `.claude/commands/kit-convert.md` (rule=skip 표현)
- `.claude/commands/kit-analyze.md` (rule=skip 표현)
- `.claude/commands/kit-audit.md` (C7 cross-check 확장)
- `.claude/skills/kit-converter/SKILL.md` (rule track 표)
- `.claude/skills/kit-converter/references/conversion-rules.md` (rule 처리 섹션)
- `.claude/skills/kit-validation/SKILL.md` (description 보강)
- `scripts/setup.js` (emitCodex SRC_CODEX 확장)
- `docs/meta-tooling/08-phase4-codex-implementation.md` (Phase 4 task 추가)
- `docs/codex-sync/03-sync-pipeline-design.md` (vocabulary mapping 표)
- `docs/codex-sync/04-rollout-validation-plan.md` (Phase 1 완료 표기)

### 관련 commit

- `c794351` chore(codex-sync): Phase 1 — exception-registry 스키마 확장 + skip-registry view 강등
- `957fb8d` refactor(scripts): Phase 1 — codex-hook-compat 분류 구조화

### 관련 plan

- `~/.claude/plans/fluttering-floating-cherny.md`
