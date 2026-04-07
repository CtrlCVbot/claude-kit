# Asset Spec: `/plan-intake-sync` Integration

## Purpose

이 문서는 `/plan-intake-sync`가 `Fetch/Normalize` 단계를 어떻게 호출하고 어떤 결과를 받는지 정의한다. command 구현 자체가 아니라, command와 stage 사이의 계약을 고정하는 문서다.

## Audience

- command 작성자
- `plan-intake-reader` 설계자
- pipeline stage 경계를 문서화하는 사람

## Inputs

- user invocation
- command flags
- `.plans/intake/config.json`
- `plan-intake-workflow`
- `plan-intake-reader`

## Outputs

- stage invocation contract
- command flag mapping
- command result summary shape

## Owned Decisions

- 어떤 command 옵션이 `Fetch/Normalize`에 영향을 주는가
- `dry-run`을 어떻게 해석할 것인가
- next stage로 무엇을 handoff할 것인가

## Non-Goals

- classify 실행
- cluster review 실행
- screening publish 실행

## Proposed Invocation Contract

### Command Signature

```text
/plan-intake-sync [--limit N] [--cursor TOKEN] [--since YYYY-MM-DD] [--dry-run]
```

### Stage Mapping

| command flag | stage 반영 방식 |
|---|---|
| `--limit` | row fetch 상한 |
| `--cursor` | pagination 시작점 |
| `--since` | candidate row 필터 조건 |
| `--dry-run` | storage write 없이 summary와 preview만 생성 |

## `dry-run` Interpretation

`dry-run`은 아래까지 허용한다.

- schema discovery
- column catalog preview
- candidate row fetch
- skip 판단
- hydrate 필요성 판단
- run summary preview

`dry-run`에서 하지 않는 일:

- row folder write
- row index update
- manifest commit write

## Output Summary Shape

command는 user에게 최소 아래 정보를 보여줄 수 있어야 한다.

- `runId`
- fetched row 수
- new row 수
- skipped row 수
- row failure 수
- warning 수

다음 단계로는 아래 structured summary를 넘긴다.

```yaml
runId: "20260407-103000"
mode: "fetch-normalize"
newSnapshots:
  - ".plans/intake/rows/notion-row-abc123/snapshots/SNAPSHOT-20260407-103000.md"
skippedRows:
  - "notion-row-def456"
rowFailures:
  - sourceRowId: "notion-row-ghi789"
    reason: "title missing"
```

## Boundary To Next Stage

`Fetch/Normalize`가 끝나면 `/plan-intake-sync`는 `Classify/Route`에 raw Notion payload를 넘기지 않는다. 다음 단계는 snapshot path와 run summary만 읽는 구조를 기준으로 삼는다.

## Failure Modes

- command가 stage 내부 로직까지 가져가 경계가 흐려짐
- `dry-run`에서도 실제 write를 해 버림
- next stage로 raw payload를 넘겨 단계 분리를 깨뜨림

## Acceptance

- implementer가 command와 stage 간 경계를 다시 설계할 필요가 없어야 한다.
- `dry-run` 의미가 명확해야 한다.
- next stage handoff가 raw payload가 아니라 normalized artifact 기준이라는 점이 분명해야 한다.
