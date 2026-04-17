# Phase 2 구현 피드백 리뷰

> 대상 commit: `9cdbbbc` (feat/codex-sync Medium merge), `3d64eb9` (docs/codex-sync stale 표현 교체)
> 대상 계획: `~/.claude/plans/fluttering-floating-cherny.md` (Phase 2)
> 기준 문서: `docs/codex-sync/04-rollout-validation-plan.md` §4.3 (Phase 2: Rule fallback 도입)
> 리뷰 목표: Phase 3 진입 전, 구현과 계획의 차이 + 인접 문서의 stale 표현 + Phase 2 vocabulary 일관성을 점검한다.
> 작성: 2026-04-15

## 1. Executive Summary

Phase 2의 핵심 목표(6개 rule을 AGENTS.md.template Medium merge로 fallback artifact 생성, 4개 stale 표현 제거, EX-003~008 status 전환)는 모두 충족되었고, 12개 검증 체크가 모두 통과했다. Plan agent가 검증한 5개 결정(merge 깊이, pairing-registry 미추가, security 처리, kit-analyze 컬럼, commit 분할)도 그대로 실행되었다.

다만 Phase 3 진입 전에 다음 4가지는 정리해두는 편이 좋다.

1. **Phase 2 범위 밖에 있던 인접 vocabulary stale 4건**: `kit-create.md` (3줄) + `kit-convert.md` (1줄)에서 rule을 여전히 "claude-origin shared"로 부른다. 행동(rule은 Codex sibling 파일을 갖지 않음)은 정확하지만, Phase 2가 만든 사실(`AGENTS.md.template`에 inline merge 됨)을 반영하지 않는다.
2. **상위 설계 문서 4건의 stale 프레이밍**: `12-implementation-plan.md`는 "6 rule-skip", `03-sync-pipeline-design.md`는 "rule = skip 고정", `01-skipless-conversion-strategy.md`는 "현재: 구조적으로 skip"으로 Phase 2 이전 상태를 현재형으로 기술한다. `13-sync-approval-and-full-port.md`는 codex-sync와 다른 대안 경로를 명시적으로 superseded 표시하지 않아 reader가 두 경로 사이에서 혼란스러울 수 있다.
3. **`04-rollout-validation-plan.md` Phase 2 완료 표기 누락**: Phase 1은 §3 표 + §4.2에 ✓ 표기를 추가했으나 Phase 2는 동일 패턴을 따르지 않았다.
4. **`kit-validation/SKILL.md:37` description 미보강**: Phase 1 피드백 I2가 권장한 description 보강이 Phase 1에서도 미반영, Phase 2에서도 미반영 — Phase 2가 추가한 신규 검증 row 3개도 함께 누락.

요약하면, **Phase 2 자체는 안정적이다. Phase 3 진입 전 위 4건 doc-only 패치만 처리하면 vocabulary 정합성이 회복된다.**

## 2. What Was Implemented

### 2.1 commit 9cdbbbc — artifact 생성 layer

| 파일 | 변경 요지 |
|------|-----------|
| `src/templates/AGENTS.md.template` | 41줄 → 161줄. 6개 h3 (verification/security/golden-principles/coding-style/interaction/date-calculation)에 Medium merge. 각 h3에 핵심 bullet 5~10개 + 예시 1건 + "전체 가이드: src/claude/core/rules/{name}.md" reference. 상단 maintenance 주석 추가. |
| `src/exception-registry.json` | EX-003, 004, 005, 006, 008 status `active` → `resolved`. EX-007도 `resolved` + docConstraints에 `policy-review-pending: Phase 3 exec-policy reclassification candidate` 추가. |
| `.claude/skills/kit-validation/references/schema-exception-registry.md` | 3개 신규 row 추가: status=resolved + paired-fallback INFO / + agents_md WARN (artifact 무결성) / docConstraints policy-review-pending INFO. |

### 2.2 commit 3d64eb9 — 문서 정합 layer

| 파일 | 변경 요지 |
|------|-----------|
| `.claude/skills/kit-converter/references/conversion-rules.md` | `## Rule 처리 (skip)` → `## Rule 처리 (paired-fallback / AGENTS.md merge)` 섹션 재작성 (5단계 처리 로직 명시). |
| `.claude/commands/kit-convert.md` line 69 | `Rule: skip 처리 (로그만)` → `Rule: paired-fallback (AGENTS.md.template merge artifact 활용)`. |
| `.claude/commands/kit-analyze.md` line 54 | `rule: 항상 skip (claude-origin shared)` → `rule: 항상 paired-fallback (artifact는 src/templates/AGENTS.md.template에 inline merge)`. 출력 표 Skip 컬럼에 Note 1 각주. |
| `.claude/skills/kit-converter/SKILL.md` line 20 | `rule \| codex-skip (AGENTS.md guidance)` → `rule \| paired-fallback (AGENTS.md.template inline merge — discrete sibling 없음)`. |
| `.claude/skills/kit-converter/references/skip-registry.md` | "Rule fallback" 표에 status 컬럼 신규 추가 (모두 resolved), 각 row에 AGENTS.md.template ### {name} merged + EX-XXX ID 명시. |

### 2.3 status 분포 (Phase 2 후)

| strategy / status | 개수 | 항목 |
|---|---|---|
| paired-direct / resolved | 1 | EX-002 (output-secret-filter) |
| paired-fallback / resolved | 6 | EX-003~008 (6 rules) |
| paired-fallback / active | 1 | EX-001 (session-wrap-suggest) |

## 3. Verification Results

12개 검증 체크 모두 통과.

| # | 항목 | 결과 |
|---|------|------|
| 1 | AGENTS.md.template 6 h3 | 6 ✓ |
| 2 | line count 150~250 | 161 ✓ |
| 3 | 6개 reference 링크 존재 | 6 ✓ |
| 4 | exception-registry: 6 rule resolved | true ✓ |
| 5 | EX-007 docConstraints에 policy-review-pending | true ✓ |
| 6 | strategy/status 분포 | 1 paired-direct/resolved + 6 paired-fallback/resolved + 1 paired-fallback/active ✓ |
| 7 | 4개 stale "rule = skip" 표현 모두 제거 | 0 매치 ✓ |
| 8 | conversion-rules.md "Rule 처리 (paired-fallback" 섹션 | 1 ✓ |
| 9 | skip-registry "resolved" 매치 | 8 (target ≥6) ✓ |
| 10 | pairing-registry 미변경 | exit 0, no diff ✓ |
| 11 | schema-exception-registry paired-fallback row 추가 | 5 매치 ✓ |
| 12 | vocabulary mapping 일관성 | rule entry는 의도적으로 pairing-registry에 없음 ✓ |

## 4. Plan vs Implementation Drift

### 4.1 Deviation D1 — kit-analyze.md Note 위치

**계획서 권장**: 출력 표 아래 blockquote로 분리

```diff
  | rule    | 6    | 0    | 0      | 6    |
+ 
+ > Note: Skip 컬럼은 ... Phase 4에서 Fallback 컬럼이 분리될 예정.
```

**실제 구현**: 출력 표 (code block) 내부에 inline `Note 1` 마커 + 각주 본문

```
  | rule    | 6    | 0    | 0      | 6    |  ← Note 1
  
  Note 1: rule 6개는 codex-sync Phase 2 이후 실제로는 paired-fallback ...
```

**근거**: kit-analyze.md의 출력 표는 큰 code block(line 60~84) 내부에 있어, blockquote로 분리하면 code block을 닫고 markdown으로 전환했다가 다시 code block을 열어야 하는 부자연스러운 구조가 된다. inline `← Note 1` 마커는 code block 안에서도 자연스럽게 표시되고, 본문도 같은 code block 안에 들어간다.

**영향**: 의미 보존됨. 시각적으로 plan과 약간 다르지만 readability는 acceptable. 변경 불필요.

### 4.2 Deviation D2 — AGENTS.md.template 161줄 (계획서 ~190줄)

**계획서 추정**: 합 ~155줄 추가 → 41 + 155 - 9 = ~187줄

**실제**: 161줄 (계획 대비 -29줄, 약 15% 적음)

**근거**: Medium merge 해석을 한 단계 더 compact하게 적용. 각 h3가 25줄 대신 20줄 평균. 결과: 핵심 정보는 모두 보존되었지만 예시 일부와 일부 row가 압축됨. 특히 golden-principles의 Anti-Rationalization 표는 17 rows 중 4 rows만 추출 (가장 자주 인용되는 항목들).

**영향**: 800줄 가이드라인 대비 더 안전 (20% 점유). 단점: §5 I4에서 다룸 (Anti-Rationalization 표 일부 변명이 빠짐).

### 4.3 부수 변경 — EX-003~008 detail에 "commit hash TBD" 미포함

계획서는 "AGENTS.md.template Medium merge로 artifact 생성됨 (Phase 2, **commit hash TBD**)"를 detail에 넣을 것을 권장. 실제는 commit hash 부분 생략. **근거**: commit 시점에 hash가 결정되므로 placeholder를 commit 전에 채울 수 없다. 후처리로 hash를 채우려면 별도 커밋이 필요해 비효율. **영향**: detail 필드는 commit hash 없이도 의미 명확.

## 5. Findings

### Critical

#### C1. `kit-create.md` + `kit-convert.md`의 "claude-origin shared" vocabulary stale (4 lines)

Phase 2 이후 rule은 단순히 "claude-origin shared"가 아니라 "claude-origin discrete file + AGENTS.md.template inline merge로 Codex와 sharing"되는 상태다. 그러나 다음 4 줄은 구 vocabulary 유지:

| 위치 | 현재 표현 |
|------|-----------|
| `.claude/commands/kit-create.md:52` | `\| rule \| claude \| claude-origin shared \|` |
| `.claude/commands/kit-create.md:62` | `\| rule \| 기본값 \| **거부** (claude-origin shared) \| **거부** \| 불필요 \|` |
| `.claude/commands/kit-create.md:183` | `- rule 타입은 --target codex를 거부한다 (claude-origin shared).` |
| `.claude/commands/kit-convert.md:103` | `- --type rule은 거부 (claude-origin shared, 변환 파일 없음).` |

**행동은 정확** (rule은 Codex 전용 sibling 파일을 만들지 않음). **하지만 reason 문구**가 Phase 2가 만든 사실(AGENTS.md.template inline merge로 Codex와 sharing)을 반영하지 않는다.

**제안**: 4개 줄의 reason을 다음 패턴으로 통일.

> 변경 전: `claude-origin shared`
> 변경 후: `claude-origin (AGENTS.md.template inline merge로 Codex와 sharing, paired-fallback)`

#### C2. `12-implementation-plan.md`의 "rule-skip" 4 lines stale

Phase 4 implementation plan 문서가 rule을 여전히 "rule-skip"으로 기술한다.

| 위치 | 현재 표현 |
|------|-----------|
| `docs/meta-tooling/12-implementation-plan.md:31` | `\| 4 \| skip-registry.md \| codex-skip 대상 8개 (2 hooks + 6 rules) \| 10-conversion §5 \|` |
| line 51 | `- [ ] skip-registry.md: **8개** 엔트리 (session-wrap-suggest, output-secret-filter + 6 rules)` |
| line 69 | `- EX-003~008: 6개 rules (rule-skip, claude-origin shared guidance)` |
| line 79 | `- [ ] 엔트리가 11-consistency-tooling.md §5 마이그레이션 테이블과 일치 (2 hook-skip + 6 rule-skip)` |

**제안**: 4개 줄을 갱신하거나 문서 상단에 "이 문서는 Phase 0~3 시점 기준. Phase 2 이후 rule은 paired-fallback/resolved 상태" 헤더 추가.

#### C3. `03-sync-pipeline-design.md` line 13 "rule = skip 고정" (현재 문제 표 stale)

```
| `rule = skip` 고정 | `conversion-rules.md`에서 `rule`이 구조적으로 no-op로 처리된다. |
```

이 행은 "현재 문제" 표에 있는데 Phase 2가 이 문제를 해결했다. 문서가 reader에게 "지금도 문제다"라고 잘못 알린다.

**제안**: 행을 `~~rule = skip~~ 고정 (Phase 2 해결: paired-fallback/resolved 전환)` 또는 표를 "Phase 1 시점 문제"로 명시해 시점 고정.

#### C4. `13-sync-approval-and-full-port.md` 대안 경로 미명시 (codex-sync와 contradictory)

이 문서는 EX-003~008에 대해 "codex-native-replacement" 대안 설계를 제시 (line 215+). codex-sync Phase 2는 다른 경로(AGENTS.md merge + status=resolved)를 선택했다. 두 경로가 동시에 활성 문서로 존재하면 reader가 어느 쪽이 truth인지 모호.

특히 line 250 `EX-003~008: status 유지 (active)`은 Phase 2 실제 구현(`status=resolved`)과 직접 충돌.

**제안**: `13-sync-approval-and-full-port.md` 상단에 다음 추가:

> **STATUS**: 본 문서는 sync-approval 워크플로우의 Part 1만 active. Part 2 ("codex-skip 완전 이식")는 docs/codex-sync/ Phase 1~2가 다른 경로(AGENTS.md merge + status=resolved)를 선택했으므로 superseded. EX-003~008 처리는 `docs/codex-sync/05-phase1-feedback-review.md`와 `docs/codex-sync/06-phase2-feedback-review.md` 참조.

### Important

#### I1. `04-rollout-validation-plan.md` Phase 2 ✓ 완료 표기 누락

Phase 1은 §3 표 row + §4.2 detail header에 모두 ✓ 완료 표기를 추가했다 (commit `7a0e8d4`). Phase 2는 동일 패턴 미적용 — 현재 §3 표 Phase 2 row는 "대기" 그대로, §4.3 헤더도 "Phase 2: Rule fallback 도입"만 명시.

**제안**: §3 Phase 2 row를 `대기` → `✓ 완료 (commit 9cdbbbc, 3d64eb9, 2026-04-15)`로 변경. §4.3 헤더에 "— ✓ 완료 (2026-04-15)" 추가. Phase 1과 동일한 패턴으로 후속 의무(Phase 3 정책성 review, Phase 4 drift detection 등)도 명시.

#### I2. `01-skipless-conversion-strategy.md` line 121 stale

```
| `rule` 6개 | 구조적으로 skip | guidance-style fallback으로 `paired-fallback` 이상 |
```

이 행은 "현재 이슈별 목표 방향" 표에 있다. "현재" 컬럼이 Phase 1 시점 기준이라면 OK이지만 명시되어 있지 않아 reader가 "지금도 구조적으로 skip"이라고 오해할 수 있다.

**제안**: "현재" 컬럼을 "Phase 1 시점" 또는 "Phase 0 기준"으로 명시. 또는 행을 `~~구조적으로 skip~~ → Phase 2에서 paired-fallback/resolved 전환됨`으로 갱신.

#### I3. `kit-validation/SKILL.md:37` description 보강 (Phase 1 I2 + Phase 2 신규 row 모두 누락)

Phase 1 피드백 I2가 권장한 description 보강이 Phase 1에서도 미반영, Phase 2에서도 미반영. 현재:

```
| 10 | schema-exception-registry.md | src/exception-registry.json | $schema, entries, 필수 필드, id 형식, status enum |
```

Phase 1+2가 추가한 검증:
- Phase 1: strategy / officialSurface / evidenceLevel / docConstraints / fallbackTarget 필드
- Phase 1: 조건부 무결성 검증 (strategy=blocked/paired-direct/paired-fallback/officialSurface=hooks*/agents_md)
- Phase 2: status=resolved + paired-fallback INFO / + agents_md WARN / docConstraints policy-review-pending INFO

**제안**: line 37을 다음으로 보강.

> `| 10 | schema-exception-registry.md | src/exception-registry.json | $schema, entries, 필수 필드, id 형식, status enum, Phase 1 SSOT 필드 (strategy/evidenceLevel), 조건부 무결성, paired-fallback artifact 무결성 (Phase 2) |`

#### I4. AGENTS.md.template Anti-Rationalization 표 4/17 rows만 포함

Phase 2 Medium merge 결과 `golden-principles`의 Anti-Rationalization 표 17 rows 중 4 rows만 추출됨 (TDD 두 변명 + Quick fix + While I'm here). 빠진 변명 13개 중 핵심 후보:

- "Need mutation for performance" (Immutability)
- "It's just the test environment" (Secrets)
- "It's small enough" (File size)
- "Hard to conclude without context" (Conclusion)
- "Still have room left" (Context)
- "It already works fine" (Evidence)
- "Skip review, move to next task" (SDD)
- "The complexity is necessary" (/simplify)
- "Need abstraction for extensibility" (Simplicity)

이 빠진 변명들이 Codex agent가 자주 마주칠 가능성이 있는 경우 보강 후보. **하지만** 800줄 guideline 여유분이 있고 Medium merge 정의가 "전체 보존 아님"이므로, 우선순위는 NICE-TO-HAVE에 가깝다.

**제안**: 우선순위는 낮음. AGENTS.md.template를 ~190줄로 키울 의향이 있다면 5~7 rows 추가 가능. 그렇지 않으면 그대로 유지.

#### I5. `kit-analyze.md` Note 1 위치 — code block 내부

D1에서 다룬 deviation. inline `← Note 1` 마커는 code block 안에서 자연스럽지만, blockquote로 분리한 plan보다 시각적 강조가 약함. Phase 4가 4-tier 컬럼 분리할 때 함께 재구조화 가능.

**제안**: Phase 4 작업 시 함께 처리. 단독 변경 불필요.

### Nice to Have

#### N1. AGENTS.md.template 161줄 — 계획 ~190줄 대비 under-target

Medium merge 해석이 더 compact하게 적용된 결과. 800줄 guideline 대비 20% 점유로 안전한 위치. I4와 함께 보강 시 ~190줄로 늘릴 수 있지만 불필수.

#### N2. AGENTS.md.template과 `src/claude/core/rules/` drift 자동 감지

현재는 maintenance 주석으로만 reminder. Phase 4 audit C7 또는 신규 카테고리 (예: C10 artifact-drift)에서 다음을 자동 감지하면 좋음:

- `src/claude/core/rules/{name}.md`가 변경됐는데 `AGENTS.md.template ### {name}` 섹션이 변경되지 않은 commit

**제안**: Phase 4 task에 추가 (08-phase4-codex-implementation.md T19 후보).

#### N3. `kit-list.md` 출력 표시 — rule이 paired-fallback임을 표현 가능

`kit-list.md` line 61의 출력 예시:
```
rules (6):    coding-style, date-calculation, golden-principles,
```

Phase 2 후 rule은 paired-fallback이므로 `rules (6, paired-fallback): ...` 같은 표시 가능. 우선순위 낮음 — Phase 4 4-tier 출력 도입 시 자연 통합.

## 6. Recommended Adjustments (Phase 3 진입 전)

다음 7건은 Phase 3을 시작하기 전 doc-only 패치로 처리. 코드/runtime 변경 없음.

1. **C1 vocabulary 갱신**: `kit-create.md` 3 줄 + `kit-convert.md` line 103 — "claude-origin shared" → "claude-origin (AGENTS.md.template inline merge로 Codex와 sharing, paired-fallback)" 패턴 통일.
2. **C2 12-implementation-plan.md 갱신**: 4 줄 또는 문서 상단에 "Phase 0~3 시점 기준" 헤더 추가.
3. **C3 03-sync-pipeline-design.md line 13 갱신**: `~~rule = skip~~ 고정 (Phase 2 해결: paired-fallback/resolved)`.
4. **C4 13-sync-approval-and-full-port.md superseded 표기**: 상단에 codex-sync 경로가 우선임을 명시 + EX-003~008 처리 결과 링크.
5. **I1 Phase 2 ✓ 완료 표기**: `04-rollout-validation-plan.md` §3 + §4.3 (Phase 1과 동일 패턴).
6. **I2 01-skipless-conversion-strategy.md line 121 갱신**: "현재" 컬럼을 시점 명시 또는 행 갱신.
7. **I3 kit-validation/SKILL.md:37 description 보강**: Phase 1 SSOT 필드 + 조건부 무결성 + paired-fallback artifact 무결성 언급.

다음 3건은 Phase 3~4 작업 중 자연스럽게 함께 처리.

8. **I4 AGENTS.md.template Anti-Rationalization 보강** (선택): 5~7 rows 추가하면 ~180줄.
9. **I5 kit-analyze.md Note 재구조화**: Phase 4 4-tier 컬럼 분리 시 함께.
10. **N2 drift detection audit**: Phase 4 T19 후보로 등록.

## 7. Suggested Next Order

Phase 3 진입 전 다음 순서를 권장:

1. 이 문서(06-phase2-feedback-review.md) 검토.
2. §6 항목 1~7 결정 (모두 doc-only 패치).
3. Phase 3 시작 (Hook fallback 도입 — session-wrap-suggest skill 생성, hook scope 분류 보강, EX-007 정책성 문구의 exec-policy 후보 분리).

이 순서로 가면 Phase 3 작업자가 Phase 2 완료 상태와 vocabulary 합의를 한눈에 알 수 있다.

## 8. Reference Notes

### Phase 2에서 변경된 파일 (8개)

- `src/templates/AGENTS.md.template` (artifact 본체)
- `src/exception-registry.json` (status 전환 + EX-007 docConstraints)
- `.claude/skills/kit-validation/references/schema-exception-registry.md` (3 신규 row)
- `.claude/skills/kit-converter/references/conversion-rules.md` (Rule 섹션 재작성)
- `.claude/commands/kit-convert.md` (line 69)
- `.claude/commands/kit-analyze.md` (line 54 + Note 1)
- `.claude/skills/kit-converter/SKILL.md` (line 20)
- `.claude/skills/kit-converter/references/skip-registry.md` (status 컬럼)

### 영향 받는 파일 (§6 Phase 2 후속 처리)

- `.claude/commands/kit-create.md` (3 lines, C1)
- `.claude/commands/kit-convert.md` (line 103, C1)
- `.claude/skills/kit-validation/SKILL.md` (line 37, I3)
- `docs/meta-tooling/12-implementation-plan.md` (4 lines, C2)
- `docs/codex-sync/03-sync-pipeline-design.md` (line 13, C3)
- `docs/codex-sync/01-skipless-conversion-strategy.md` (line 121, I2)
- `docs/codex-sync/04-rollout-validation-plan.md` (§3 + §4.3, I1)
- `docs/meta-tooling/13-sync-approval-and-full-port.md` (header note, C4)

### 관련 commit

- `9cdbbbc` feat(codex-sync): Phase 2 — 6개 rule을 AGENTS.md.template Medium merge로 fallback artifact 생성
- `3d64eb9` docs(codex-sync): Phase 2 — kit-converter 4개 stale "rule = skip" 표현 fallback 표현으로 교체

### 관련 plan

- `~/.claude/plans/fluttering-floating-cherny.md`

### 이전 phase 피드백

- `docs/codex-sync/05-phase1-feedback-review.md`
