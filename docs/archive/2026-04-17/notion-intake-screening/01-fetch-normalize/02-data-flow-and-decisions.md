# Fetch/Normalize Data Flow And Decisions

이 문서는 `Fetch/Normalize` 단계의 흐름과 판단 지점을 분리해서 보여 준다. `01-stage-spec.md`가 단계 SSOT라면, 이 문서는 구현자가 orchestration과 decision boundary를 빠르게 이해하기 위한 보조 문서다.

## End-to-End Flow

```text
Retrieve a data source
        |
        v
  build schema manifest
        |
        v
  build column catalog
        |
        v
   load config mapping
        |
        v
    load row index
        |
        v
 Query a data source
        |
        v
  skip existing rows?
     |          |
    yes         no
     |          |
     v          v
 skip log   hydrate required values
                    |
                    v
            normalize snapshot
                    |
                    v
         persist row folder + index + run
                    |
                    v
     handoff normalized rows to next stage
```

## Decision Table

| 결정 지점 | 입력 | 결정 기준 | 결과 |
|---|---|---|---|
| schema discovery 시작 여부 | token, data source id, config | 필수 값 존재 여부 | 없으면 run 실패 |
| 필수 매핑 유효성 | retrieved schema, property mapping | required field가 schema에 존재하는가 | 없으면 run 실패 |
| candidate row fetch 범위 | command options, config | `limit`, `cursor`, `since`, `dry-run` 적용 | fetch 대상 row 집합 결정 |
| 기존 row skip 여부 | `sourceRowId`, row-index, row folder | index 또는 row folder 존재 여부 | skip 또는 hydrate |
| hydrate 방식 | `propertyType`, `fetchMode`, query result | `property_item` 필요 여부 | query-only 또는 property_item 호출 |
| warning 여부 | normalized field value | 잘림, 불완전 값, 선택 필드 누락 | warning 추가 |
| row 실패 여부 | row parse 결과 | title/sourceRowId 추출 가능 여부 | row failure 또는 persist |
| handoff 포함 여부 | normalized snapshot | skip/failure가 아닌가 | next stage 대상 포함 |

## Query vs Property Item

### 기본 원칙

- 기본은 `query`다.
- 특정 필드만 `property_item`으로 승격한다.
- `property_item`은 전 row 전 필드 기본 전략이 아니다.

### `query`를 유지하는 경우

- `title`
- `rich_text`
- `number`
- `select`
- `multi_select`
- `status`
- `date`
- `checkbox`
- `url`
- `email`
- `phone_number`

### `property_item`을 고려하는 경우

- `relation`
- `rollup`
- `formula`
- query 응답에서 값 손실 가능성이 명시되거나 관측되는 타입

### decision note

- `propertyType`이 `relation`, `rollup`, `formula`여도 무조건 `property_item`을 쓰지는 않는다.
- 실제 호출 여부는 `propertyMapping.{field}.fetchMode`가 결정한다.
- `fetchMode=query`로 지정된 필드가 불완전하면 실패가 아니라 warning을 남긴다.

## Skip Decision

### 우선 순위

1. `row-index.json`
2. `rows/{sourceRowId}/` 폴더 존재 여부

### 잠근 정책

- `updatedAt` 비교 없음
- content hash 비교 없음
- title 유사도 비교 없음

### 이유

- v1의 목표는 재수집 최적화보다 안정적인 중복 방지다.
- row가 수정되었더라도 v1에서는 재수집하지 않는다.
- 후속 버전에서만 `updatedAt` 또는 hash 기반 재평가를 검토한다.

## Failure Boundary

### Run-level failure

- 환경변수 누락
- data source schema 조회 실패
- 필수 매핑 불일치
- config parse 실패

### Row-level failure

- row id 추출 불가
- title 추출 불가
- property hydrate 실패로 snapshot 구성 불가

### Warning

- 선택 필드 누락
- 타입 불일치
- query-only 결과 불완전

## Handoff Shape To `Classify/Route`

`Fetch/Normalize`는 다음 단계에 아래 수준의 정보를 넘겨야 한다.

```yaml
runId: "20260407-103000"
dataSourceId: "notion-data-source-id"
schemaVersion: "2026-04-07T10:30:00+09:00"
newRows:
  - sourceRowId: "notion-row-abc123"
    snapshotPath: ".plans/intake/rows/notion-row-abc123/snapshots/SNAPSHOT-20260407-103000.md"
    warningCount: 0
skippedRows:
  - "notion-row-def456"
rowFailures:
  - sourceRowId: "notion-row-ghi789"
    reason: "title missing"
```

핵심은 다음 단계가 Notion raw payload를 다시 읽지 않고, normalized snapshot과 run summary만 읽어도 되게 만드는 것이다.

## What This Document Locks

- stage flow는 `schema -> index -> fetch -> skip -> hydrate -> persist` 순서를 가진다.
- hydrate는 stage 내부 결정이며 hook이나 next stage 책임이 아니다.
- skip은 `sourceRowId` 기준의 stage logic이다.
- `Fetch/Normalize`는 row를 정리할 뿐, 분류나 screening 판단은 하지 않는다.
