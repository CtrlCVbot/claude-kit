# 06 `src/codex` A-B-C Classification Draft

> 목적: `src/codex` 파일을 Phase 0 기준으로 A/B/C에 1차 분류하고, Phase 6 제거 기준의 초안으로 사용한다.
> 작성일: 2026-04-21
> 성격: draft

## 1. 분류 기준

이 문서는 [02-current-state-audit.md](./02-current-state-audit.md)에서 정의한 A/B/C rubric을 실제 `src/codex` 파일 목록에 적용한 초안이다.

| Class | 정의 | 처리 방향 |
|---|---|---|
| A | `src/claude` peer와 해시가 완전히 같은 단순 중복 | 제거 우선순위 최상 |
| B | 의도는 같지만 Codex packaging, wording, entry format 때문에 표현이 바뀐 자산 | shared manual 또는 alias/router 구조로 흡수 검토 |
| C | Codex runtime, hook, schema, executable code, runtime data처럼 동작 차이에 직접 닿는 자산 | Codex native surface 유지 후보 |

## 2. 적용 방법

이번 초안은 아래 순서로 분류했다.

1. `src/codex` 전체 파일 목록 수집
2. 같은 상대 경로의 `src/claude` peer 존재 여부 확인
3. peer가 있으면 SHA256 해시 비교
4. same-hash면 `A`
5. 나머지 파일 중 실행 코드, hooks, schemas, constants, registry, collectors, boundary, checkpoint는 `C`
6. 나머지 문서형 commands, agents, skills, rules, templates, references는 `B`

이 초안은 사람이 하나씩 수작업으로 판정한 최종본이 아니라, 유지보수 의사결정에 쓸 수 있는 `규칙 기반 초안`이다.

## 3. 집계 결과

### 전체 분포

실측 기준 `src/codex` 파일 수는 `149`개다.

| Class | Count | 비율 |
|---|---:|---:|
| A | 3 | 2.0% |
| B | 104 | 69.8% |
| C | 42 | 28.2% |
| Total | 149 | 100.0% |

### 도메인별 분포

| Domain | A | B | C | Total |
|---|---:|---:|---:|---:|
| `copy` | 0 | 16 | 0 | 16 |
| `core` | 0 | 11 | 22 | 33 |
| `dev` | 0 | 44 | 6 | 50 |
| `plan` | 3 | 33 | 14 | 50 |

## 4. 대표 근거

### A 대표 예시

- `plan/_templates/design-manifest.template.md`
- `plan/_templates/design-prompt-highfidelity.template.md`
- `plan/_templates/design-prompt-wireframe.template.md`

이 3개는 같은 상대 경로의 `src/claude` peer와 해시가 완전히 같다. 따라서 shared source로 올리거나 generator에서 중복 생성을 멈추면 가장 먼저 제거할 수 있는 후보다.

### B 대표 예시

- [src/codex/dev/commands/dev-feature.md](../../../src/codex/dev/commands/dev-feature.md)
- [src/codex/dev/skills/dev-workflow/SKILL.md](../../../src/codex/dev/skills/dev-workflow/SKILL.md)
- [src/codex/plan/agents/plan-reviewer.md](../../../src/codex/plan/agents/plan-reviewer.md)

대표 diff를 보면 공통 패턴이 보인다.

- Claude의 slash command 형식을 Codex entry flow 형식으로 재서술
- frontmatter 또는 prompt wrapper를 Codex-friendly markdown 구조로 재배치
- `Claude sibling` 또는 `authoring source` 같은 packaging 메모 추가

즉, 의도와 역할은 거의 같지만 표현과 전달 방식이 바뀐 경우가 대부분이라 `B`가 타당하다.

### C 대표 예시

- [src/codex/core/hooks/feedback-collector.js](../../../src/codex/core/hooks/feedback-collector.js)
- [src/codex/core/_schemas/stage-manifest-router.js](../../../src/codex/core/_schemas/stage-manifest-router.js)
- [src/codex/plan/boundary/bridge-phase-a.js](../../../src/codex/plan/boundary/bridge-phase-a.js)

대표 diff를 보면 다음 성격이 강하다.

- archive 경로, runtime 기본값, 지원 이벤트 같은 동작 차이 존재
- hook runtime 제약에 맞춘 축약 또는 fallback 처리
- schema, router, collector 같은 executable asset 차이

이런 자산은 shared manual로 완전히 치환하기보다 Codex native surface로 남길 가능성이 크므로 `C`로 본다.

## 5. 해석 포인트

### 5.1 `B`가 많다는 의미

`B`가 100개 이상이라는 것은 `src/codex`의 다수가 `완전한 별도 기능`이 아니라 `같은 기능의 Codex 표현 변형`일 가능성이 높다는 뜻이다.

즉, long-form manual과 router/alias 설계가 안정화되면 가장 큰 제거 효과는 `B` 구간에서 나온다.

### 5.2 `C`가 적지 않다는 의미

`C`가 42개라는 것은 `manual-only`가 성립하지 않는다는 근거이기도 하다.

- Codex hook
- schema
- boundary
- executable helper
- runtime data

이 영역은 여전히 native surface가 필요하다.

### 5.3 Codex-only placeholder

`core/.gitkeep`, `dev/.gitkeep`, `plan/.gitkeep`는 Claude peer가 없는 Codex-only 구조 보존 파일이다. 이 초안에서는 `B`로 두었다.

이유는 다음과 같다.

- 실행 로직은 아니다.
- 하지만 generator와 packaging 정리 전에는 구조적 의미가 있다.
- 최종 Phase 6에서 제거 여부를 다시 판단해야 한다.

## 6. 한계와 보완 필요 사항

이 초안은 다음 한계를 가진다.

1. `B`와 `C`의 경계가 모두 파일 확장자만으로 해결되지는 않는다.
2. 일부 `.js` 파일은 실제로는 thin wrapper일 수 있다.
3. 일부 `.md` 파일은 workflow 진입 semantics 차이 때문에 `C`에 가까울 수 있다.

따라서 구현 직전에는 아래 보완이 필요하다.

1. `C` 파일 42개에 대한 수동 리뷰
2. `B` 파일 중 alias/router 흡수 우선순위 산정
3. generator 단에서 same-hash `A` 제거 실험

## 7. 산출물

- 상세 CSV: [src-codex-abc-classification.csv](./artifacts/src-codex-abc-classification.csv)

이 CSV는 아래 컬럼을 가진다.

| Column | 의미 |
|---|---|
| `class` | A / B / C |
| `peer` | 같은 상대 경로의 Claude peer 존재 여부 |
| `path` | `src/codex` 기준 상대 경로 |
| `rationale` | 1차 분류 근거 |
| `confidence` | `confirmed` 또는 `likely` |
