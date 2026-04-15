# Skipless Conversion Strategy

> 목표: Claude authoring source를 Codex sibling으로 옮길 때 `skip`을 마지막 예외로 낮추고, 공식 지원 여부와 repo 차원의 fallback을 명확히 구분한다.

## 0. 이 문서의 성격

- 이 문서는 설계 제안서다.
- 아래 분류와 상태 모델은 아직 `.claude`, `scripts`, `src` 구현에 반영됐다고 가정하지 않는다.
- 구현 반영 전에는 이 문서를 "목표 상태"와 "판단 기준"으로만 사용한다.

## 1. 문제 정의

현재 변환 정책은 다음 두 가지를 기본값처럼 사용한다.

- `rule`은 Codex에 대응 category가 없다고 보고 skip
- 일부 `hook`은 Claude runtime 의존성이 있으면 곧바로 skip

하지만 공식 문서 재검토 결과, 위 표현은 지나치게 단정적이다.

- Codex에는 [Rules](https://developers.openai.com/codex/rules)가 공식 기능으로 존재한다.
- Codex에는 [Hooks](https://developers.openai.com/codex/hooks)의 `Stop` event가 공식적으로 존재한다.
- 다만 Claude의 guidance-style `rule`과 Codex `Rules`는 용도가 다르다.
- Hooks는 공식 기능이지만 `experimental`이며, 2026-04-15 기준 Windows 지원과 tool 범위에 제약이 있다.

따라서 문제는 "Codex에 기능이 없다"가 아니라, "공식 surface의 의미와 제약이 Claude 원본과 다르며 그 차이를 무시한 skip 정책이 크다"에 가깝다.

## 2. 공식 재분류 요약

| 항목 | 분류 | 핵심 판단 |
|---|---|---|
| `hook` | `공식 지원` | Hooks는 공식 기능이다. 다만 `experimental`, Windows 제한, `Bash` 범위 제약을 함께 기록해야 한다. |
| `rule` | `공식 지원` | Codex `Rules`는 공식 기능이지만 exec/approval policy 중심이다. Claude guidance rule의 1:1 대응으로 쓰면 안 된다. |
| `session-wrap-suggest` | `검증 필요` | `Stop` hook 자체는 공식 지원이다. 다만 Claude session state 의존을 그대로 재현할 수 있는지는 별도 검증이 필요하다. |
| `output-secret-filter` | `검증 필요` | 공식 Hooks 범위 안에서는 일부 direct 유지 후보가 맞지만, 비-Bash 도구 결과까지 포괄한다고 단정하면 안 된다. |
| `AGENTS.md` fallback | `우회 가능` | `AGENTS.md`는 공식 instruction surface다. 다만 guidance rule 흡수는 repo 차원의 migration fallback이다. |

## 3. 설계 원칙

### 3.1 Direct Means "Within Documented Constraints"

`direct`는 단순히 같은 이름의 기능이 있다는 뜻이 아니다. 아래를 모두 만족해야 한다.

- 공식 surface가 존재한다.
- 공식 문서가 허용하는 event, tool, platform 범위 안에 들어간다.
- 현재 repo가 주장하는 동작이 그 범위를 넘지 않는다.

### 3.2 Fallback Is Repo-Level, Not Official Migration

`hook -> instruction/command/wrapper`와 `rule -> AGENTS.md/instruction/skill`은 공식 migration recipe가 아니다. 이 문서 세트에서는 이를 repo 차원의 fallback 전략으로만 다룬다.

### 3.3 Artifact First

runtime parity가 부족해도, 의도와 후속 작업 방향을 담은 산출물이 남아야 한다. 특히 guidance-style `rule`과 runtime-bound `hook`은 "동일 실행"보다 "의미 보존"을 우선한다.

### 3.4 SSOT Must Be Explicit

예외 상태와 변환 판단은 한 곳에서만 결정되어야 한다. `exception-registry`, `skip-registry`, compatibility script가 서로 다른 해석을 가지면 `/kit-sync`가 stale 판단을 반복한다.

### 3.5 Partial Port Is Still Useful

Claude와 Codex의 runtime model이 달라도, 공식 범위 안에서 direct로 남길 수 있는 부분은 direct로 유지하고, 나머지는 fallback 또는 `review-needed`로 분리한다.

## 4. 목표 상태

### 4.1 상태 모델

| 상태 | 의미 | 산출물 |
|---|---|---|
| `paired-direct` | 공식 surface와 제약 범위 안에서 direct 포팅 완료 | 정식 Codex sibling |
| `paired-fallback` | repo 차원의 fallback artifact로 의미를 보존한 상태 | `AGENTS.md` merge, skill, command, wrapper, note |
| `paired-review` | 초안은 생성됐지만 runtime 검증 또는 수동 판단이 남은 상태 | `review-needed` marker 또는 review 문서 |
| `blocked` | artifact 생성조차 안전하게 할 수 없는 상태 | 예외 레지스트리 + 근거 |

### 4.2 우선순위

| 우선순위 | 처리 방식 | 비고 |
|---|---|---|
| 1 | `paired-direct` | 공식 surface와 제약 범위가 맞을 때만 허용 |
| 2 | `paired-fallback` | 공식 surface가 의미상 1:1이 아니거나 repo-level 우회가 더 적합할 때 |
| 3 | `paired-review` | 자동 생성은 가능하지만 공식 근거 또는 runtime 검증이 부족할 때 |
| 4 | `blocked` | 최후의 예외 상태 |

## 4.3 현재 구현과의 차이

| 항목 | 현재 구현 기준 | 문서 제안 기준 |
|---|---|---|
| `rule` | 구조적으로 skip되기 쉬움 | semantic split 후 fallback 우선 |
| `session-wrap-suggest` | Stop/runtime 이유로 skip되기 쉬움 | `Stop` hook candidate + state 검증 분리 |
| `output-secret-filter` | stale skip 해석이 섞일 수 있음 | direct 후보이되 hook scope 제약 명시 |
| `AGENTS.md` fallback | 암묵적 우회안처럼 읽힐 수 있음 | 공식 surface 기반 repo-level fallback으로 명시 |

## 5. 적용 기준

### 5.1 Rule

`rule`은 더 이상 "Codex에는 없는 category"로 다루지 않는다.

- exec/approval policy 의미가 맞는 경우만 Codex [Rules](https://developers.openai.com/codex/rules) direct 후보로 본다.
- 일반 guidance-style `rule`은 [AGENTS.md](https://developers.openai.com/codex/guides/agents-md) 또는 [Skills](https://developers.openai.com/codex/skills) fallback으로 분류한다.
- direct 의미가 맞지 않는 guidance rule을 Codex `Rules`로 억지 매핑하지 않는다.

즉, `rule = skip`이 아니라 `rule = semantic split`이 기본값이다.

### 5.2 Hook

`hook`은 event 이름만 맞는다고 direct가 아니다.

- 공식 [Hooks](https://developers.openai.com/codex/hooks) 범위와 platform 제약 안에 있으면 `paired-direct`
- 공식 hook은 있으나 Claude 쪽 상태 의존이 남으면 `paired-review`
- direct 재현이 어렵지만 사람 호출 또는 별도 artifact로 의도를 보존할 수 있으면 `paired-fallback`
- 공식 근거도 없고 fallback도 설계하기 어려울 때만 `blocked`

### 5.3 AGENTS.md / Skills / Commands

이 surface들은 공식 기능이다. 다만 Claude `rule`이나 runtime-bound `hook`을 이쪽으로 옮기는 판단은 공식 1:1 매핑이 아니라 repo 차원의 migration 결정이다.

## 6. 이슈별 목표 방향

> "현재 상태" 컬럼은 본 문서 작성(Phase 0) 시점 기준이다. ✓로 표시한 항목은 후속 Phase에서 목표 상태에 도달함.

| 이슈 | Phase 0 시점 상태 | 목표 상태 | 진행 상태 |
|---|---|---|---|
| `rule` 6개 | 구조적으로 skip | guidance-style fallback으로 `paired-fallback` 이상 | ✓ Phase 2 완료 (commit `9cdbbbc`, `3d64eb9`): 모두 `paired-fallback` / `status=resolved` 전환 |
| `session-wrap-suggest` | Stop/runtime 의존으로 skip | `Stop` hook candidate 검토 후 `paired-fallback` 또는 `paired-review` | Phase 1 부분 완료 (`paired-fallback` 분류 + skill fallback target 명시), 실제 skill artifact 생성은 Phase 3 |
| `output-secret-filter` | Codex port 존재, 일부 기준은 stale skip | hook scope 제약을 명시한 `paired-direct` 후보 | ✓ Phase 1 완료 (commit `c794351`): `paired-direct` / `status=resolved` 확정 |

## 7. 성공 기준

| 항목 | 성공 기준 |
|---|---|
| `rule` | guidance-style rule이 무산출물 skip으로 남지 않음 |
| `hook` | direct 불가 사유와 runtime 검증 필요 사유가 분리되어 기록됨 |
| 문서 표현 | 공식 capability와 repo fallback이 혼용되지 않음 |
| sync 결과 | `skip`보다 `fallback`과 `review-needed`가 우선적으로 집계됨 |

## 8. 권장 의사결정

추천안은 아래와 같다.

- `rule`은 의미가 맞는 일부만 Codex `Rules` direct 후보로 두고, 현재 repo의 guidance-style rule은 `AGENTS.md`와 Skills 중심으로 흡수한다.
- `hook`은 direct hook 가능성부터 보되, 공식 문서 제약을 넘는 부분은 skill, command, wrapper, `review-needed`로 분리한다.
- `session-wrap-suggest`와 `output-secret-filter`는 둘 다 hook 계열이지만, 전자는 state 검증이 핵심이고 후자는 hook scope 문서화가 핵심이라는 점을 분리한다.

## 9. 후속 구현 후보

아래 항목은 구현 반영 제안이지, 현재 반영 상태가 아니다.

- `skip-registry`를 최종 판단 SSOT로 쓰지 않는다.
- `/kit-analyze`가 `skip` 대신 `fallback`과 `review-needed`를 집계하도록 바꾼다.
- `/kit-convert`가 `rule` 처리 시 no-op 로그 대신 merge snippet 또는 review stub을 생성하도록 바꾼다.
- `output-secret-filter`처럼 이미 paired된 항목은 "존재 여부"가 아니라 "공식 범위 설명"을 정합화한다.
