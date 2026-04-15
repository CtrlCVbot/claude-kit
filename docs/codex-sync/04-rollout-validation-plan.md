# Rollout And Validation Plan

## 1. 목적

skipless conversion 전략을 실제 구현으로 옮길 때, 공식 문서 기준과 repo 차원의 fallback 설계가 섞이지 않도록 단계별 적용 순서와 검증 방법을 정의한다.

## 2. rollout 원칙

- 한 번에 모든 category를 바꾸지 않는다.
- 첫 단계에서 문서 표현 정합성을 먼저 맞춘다.
- 문서 승인 전에는 `.claude`, `scripts`, `src`를 변경하지 않는다.
- stale registry 정리와 상태 모델 확장을 먼저 수행한다.
- `rule` fallback은 구현 난도가 낮고 효과가 크므로 먼저 적용한다.
- runtime 의존 `hook`은 direct parity가 아니라 공식 surface 범위와 상태 의존 분리를 기준으로 판단한다.

## 3. 단계별 계획

| 단계 | 상태 | 목표 | 주요 작업 | 예상 결과 |
|---|---|---|---|---|
| Phase 0 | ✓ 반영됨 (docs) | 문서 표현 정합성 보정 | `docs/codex-sync`를 공식 문서 기준으로 교정 | direct, fallback, 검증 필요의 의미가 고정됨 |
| Phase 1 | ✓ 완료 (commit `c794351`, `957fb8d`, 2026-04-15) | 레지스트리 정합성 회복 | stale skip 기준 제거, registry 역할 분리 | false skip 제거 |
| Phase 2 | ✓ 완료 (commit `9cdbbbc`, `3d64eb9`, 2026-04-15) | `rule` fallback 도입 | `AGENTS.md` merge snippet, review stub 생성 | guidance-style rule이 무산출물 skip으로 남지 않음 |
| Phase 3 | 대기 | `hook` fallback 도입 | `session-wrap-suggest` 재평가, hook scope 반영 | runtime-bound hook 손실 축소 |
| Phase 4 | 대기 | sync pipeline 확장 | `/kit-analyze`, `/kit-convert`, `/kit-sync` 상태 모델과 evidence 기록 추가 | `fallback` / `review-needed` 집계 가능 |
| Phase 5 | 대기 | runtime 검증과 audit | dry-run, sample conversion, 문서/코드 정합성 점검 | rollout 가능 여부 결정 |

> Phase 1 회고 및 후속 의무는 [05-phase1-feedback-review.md](./05-phase1-feedback-review.md) 참조.

## 4. 단계별 상세

### 4.1 Phase 0: 문서 표현 정합성 보정

대상 파일:

- `docs/codex-sync/00-overview.md`
- `docs/codex-sync/01-skipless-conversion-strategy.md`
- `docs/codex-sync/02-hook-rule-porting-matrix.md`
- `docs/codex-sync/03-sync-pipeline-design.md`
- `docs/codex-sync/04-rollout-validation-plan.md`
- `docs/codex-sync/sync-report-2026-04-15.md`

주요 작업:

- 공식 지원과 repo fallback을 분리해 서술
- `Stop` hook 부재 전제 제거
- `rule category` 부재 전제 제거
- `output-secret-filter`의 hook scope 제약 명시

완료 기준:

- 핵심 쟁점 문단에 공식 문서 링크가 붙어 있다
- 과하게 단정된 표현이 제거되어 있다
- 구현 반영 전 단계라는 점이 문서에 명시되어 있다

### 4.2 Phase 1: 레지스트리 정합성 회복 — ✓ 완료 (2026-04-15)

> 반영 commit: `c794351` (chore/codex-sync), `957fb8d` (refactor/scripts).
> 회고와 후속 의무는 [05-phase1-feedback-review.md](./05-phase1-feedback-review.md) 참조.

대상 파일 (실제 변경됨):

- `src/exception-registry.json` — 5개 신규 필드 추가 + EX-001~008 재분류
- `.claude/skills/kit-validation/references/schema-exception-registry.md` — 신규 필드 검증 규칙
- `.claude/skills/kit-converter/references/skip-registry.md` — 서술형 view로 강등
- `scripts/codex-hook-compat.js` — `HOOK_PORTABILITY` 구조화

주요 작업 (완료):

- resolved 예외가 stale skip 기준에 남지 않도록 정리 ✓
- `exception-registry`를 우선 판단 SSOT로 명시 ✓
- `skip-registry`를 설명 문서 또는 generated view로 격하 ✓

완료 기준 (충족):

- `output-secret-filter`가 direct 또는 paired 상태로 일관되게 보인다 ✓ (4개 surface 모두 paired-direct)

후속 의무 (Phase 4 task로 이동):

- `setup.js`의 `emitCodex`가 `paired-direct` hook에 한해 `SRC_CODEX`를 우선 source로 사용하도록 확장 (08-phase4-codex-implementation.md T18 참조)
- `output-secret-filter.js`의 `HOOK_PORTABILITY.compatible`을 `true`로 전환 (T18과 동시)

### 4.3 Phase 2: Rule fallback 도입 — ✓ 완료 (2026-04-15)

> 반영 commit: `9cdbbbc` (feat/codex-sync Medium merge), `3d64eb9` (docs/codex-sync stale 표현 교체).
> 회고와 후속 의무는 [06-phase2-feedback-review.md](./06-phase2-feedback-review.md) 참조.

대상 파일 (실제 변경됨, Phase 1 피드백 §5 C3 반영):

- `.claude/skills/kit-converter/references/conversion-rules.md` — `## Rule 처리 (skip)` → `## Rule 처리 (paired-fallback / AGENTS.md merge)` 섹션 재작성 ✓
- `.claude/commands/kit-convert.md` line 69 — `Rule: skip` → `paired-fallback` ✓
- `.claude/commands/kit-analyze.md` line 54 — `rule: 항상 skip` → `항상 paired-fallback` + 출력 표 Note 1 각주 ✓
- `.claude/skills/kit-converter/SKILL.md` line 20 — `rule | codex-skip` → `paired-fallback (inline merge)` ✓
- `.claude/skills/kit-converter/references/skip-registry.md` — Rule fallback 표 status 컬럼 모두 resolved ✓
- `src/templates/AGENTS.md.template` — 6 h3 Medium merge (~9줄 → 161줄) + maintenance 주석 ✓
- `src/exception-registry.json` — EX-003~008 status `active` → `resolved`. EX-007에 `policy-review-pending` 추가 ✓
- `.claude/skills/kit-validation/references/schema-exception-registry.md` — Phase 2 신규 row 3개 (paired-fallback INFO/WARN, policy-review-pending INFO) ✓

주요 작업 (완료):

- `rule = skip` 규칙 제거 (4개 파일) ✓
- exec-policy rule과 guidance-style rule을 분리 (conversion-rules.md 재작성) ✓
- `rule -> AGENTS.md` merge 규칙 추가 (AGENTS.md.template Medium merge) ✓
- EX-003~008 (6 rules) artifact 생성 + status 전환 ✓
- pairing-registry는 의도적으로 미변경 (rule은 discrete sibling이 아닌 inline merge snippet) ✓

완료 기준 (충족):

- `coding-style`, `verification`, `security` 등 6개 rule이 전부 artifact를 남긴다 ✓
- 위 4개 파일에서 `rule = skip` 표현이 모두 fallback 표현으로 대체된다 ✓ (grep 0 매치)
- EX-003~008의 status가 모두 `resolved`로 전환되고 [03-sync-pipeline-design.md §7.1](./03-sync-pipeline-design.md#71-vocabulary-mapping-exception-registry--pairing-registry) vocabulary mapping과 모순 없음 ✓

후속 의무 (Phase 3+ 이연):

- EX-007 (security) `policy-review-pending` 항목 — Phase 3에서 exec-policy 후보로 재검토
- AGENTS.md.template과 `src/claude/core/rules/` drift detection — Phase 4 audit (06-phase2-feedback-review.md N2)
- kit-analyze 출력 표 4-tier 컬럼 정식 분리 (paired-direct/fallback/review/blocked) — Phase 4
- Anti-Rationalization 표 추가 row 보강 (선택) — Phase 4 (06-phase2-feedback-review.md I4)

### 4.4 Phase 3: Hook fallback 도입

대상 파일:

- `scripts/codex-hook-compat.js`
- `.claude/skills/kit-converter/references/conversion-rules.md`
- fallback 대상 파일들

주요 작업:

- `Stop` hook 존재 여부와 Claude 상태 파일 의존을 분리해 분류
- `PostToolUse`의 `Bash` 전용 범위를 고려해 hook 설명과 direct 판정을 조정
- Windows hook 제한을 고려해 platform note를 추가
- `session-wrap-suggest`의 target을 hook candidate, skill, command, review-needed 중 하나로 명시

완료 기준:

- runtime-bound hook이 무조건 `blocked`가 아니라 `paired-fallback` 또는 `paired-review`로 이동한다

### 4.5 Phase 4: Pipeline 확장

대상 파일:

- `.claude/commands/kit-analyze.md`
- `.claude/commands/kit-convert.md`
- `.claude/commands/kit-sync.md`
- `.claude/agents/kit-sync-agent.md`
- 필요 시 `src/claude/_meta/codex-portability.json`

주요 작업:

- 상태 모델 확장
- `evidenceLevel`, `officialSurface`, `docConstraints` 기록
- 보고서 형식 업데이트

완료 기준:

- dry-run에서 `direct`, `fallback`, `review-needed`, `blocked`와 evidence 정보가 함께 표시된다

## 5. 검증 계획

| 검증 항목 | 방법 | 통과 기준 |
|---|---|---|
| 문서 표현 정합성 | 금지 문구 검색, 링크 점검 | 잘못된 전제 문구가 제거됨 |
| `Stop` hook 검증 | 공식 Hooks 문서와 문서 표현 비교 | 기능 존재와 상태 의존이 분리되어 기록됨 |
| `PostToolUse` 범위 검증 | 공식 Hooks 문서와 사례 비교 | Bash 범위를 넘는 direct claim이 없음 |
| Windows 제약 검증 | 공식 Hooks 문서와 rollout 문구 비교 | Windows 제한이 문서에 반영됨 |
| `Rules` 의미 검증 | 공식 Rules 문서와 guidance fallback 비교 | exec-policy와 guidance가 분리되어 있음 |
| registry 정합성 | stale 예외와 skip 기준 비교 | resolved 항목이 false skip으로 남지 않음 |

## 6. 샘플 검증 시나리오

### Scenario A: `output-secret-filter`

- 기대 상태: `paired-direct` 후보 또는 `paired-review`
- 확인 사항:
  - prompt-side validation과 Bash-scoped post-processing으로 설명이 좁혀졌는가
  - 비-Bash 도구 결과 전체 후처리처럼 쓰인 문장이 제거됐는가
  - registry 설명이 resolved 상태와 충돌하지 않는가

### Scenario B: `session-wrap-suggest`

- 기대 상태: `paired-fallback` 또는 `paired-review`
- 확인 사항:
  - `Stop` hook 존재 여부와 Claude 상태 파일 의존이 분리되어 있는가
  - hook candidate, skill, command, review-needed 중 선택 이유가 문서화되어 있는가

### Scenario C: `verification`

- 기대 상태: `paired-fallback`
- 확인 사항:
  - `AGENTS.md` merge snippet 생성 방향이 분명한가
  - guidance-style rule이 Codex `Rules` direct처럼 설명되지 않는가

## 7. rollback 기준

| 조건 | rollback 방식 |
|---|---|
| 공식 근거보다 강한 문장이 다시 들어감 | 문서 정합성 단계로 되돌리고 표현을 보수적으로 수정 |
| `rule` fallback이 중복만 늘리고 의미 분리가 흐려짐 | `AGENTS.md` merge 범위를 줄이고 review stub만 유지 |
| `hook` fallback이 지나치게 추상적임 | wrapper 설계를 보류하고 explicit `review-needed` note로 강등 |
| evidence 모델이 tooling 복잡도만 높임 | `officialSurface`와 `evidenceLevel` 최소 필드만 유지 |

## 8. open questions

- `session-wrap-suggest`가 필요한 후속 제안을 `Stop` hook 안에서 충분한 문맥과 함께 만들 수 있는가
- `output-secret-filter`의 현재 Codex 포트가 문서상 허용된 hook 범위를 실제로 넘지 않는가
- Windows 환경에서 hook 관련 문서를 어떤 수준까지 direct 전략으로 열어둘 것인가

## 9. 최종 완료 기준

- `rule` 6개 모두 무산출물 skip이 아니다
- runtime-bound `hook`은 direct 불가 사유와 fallback 사유가 분리되어 기록된다
- `/kit-sync --dry-run` 문서와 보고서가 official capability와 repo fallback을 구분해 설명한다
- `sync-report-2026-04-15.md`는 스냅샷으로 보존되며, 이후 해석 보정은 editorial note로만 추가된다
- 문서 승인 전에는 구현 반영이 진행되지 않는다
