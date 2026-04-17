# Data Model Extension Spec — Intake Pipeline v1

> `Fetch/Normalize` 기준 데이터 계약 재정의. 핵심은 `schema discovery + property mapping + row 기준 저장 구조 + sourceRowId 인덱싱`이다.

---

## 1. 설계 요약

`Fetch/Normalize`는 더 이상 "Notion row를 바로 내부 고정 필드로 변환"하는 단계가 아니다.

v2 기준으로 이 단계는 아래 3개의 계약을 순서대로 가진다.

1. **Source Schema Discovery**
   - 실제 Notion data source의 컬럼 목록과 타입을 읽는다.
2. **Property Mapping**
   - discovery 결과 위에 내부 필드 매핑을 얹는다.
3. **Row-based Persistence**
   - 결과를 실행(run) 단위가 아니라 `sourceRowId` 단위 폴더로 저장한다.

즉, "무슨 컬럼이 존재하는가"와 "우리가 어떤 컬럼을 내부 필드로 쓸 것인가"를 분리한다.

---

## 2. `.plans/intake/` 저장 구조

기존의 평면 `snapshots/` 중심 구조를 폐기하고, row 기준 구조로 재편한다.

```text
.plans/
├── ideas/                  ← 기존 (변경 없음)
├── features/               ← 기존 (변경 없음)
├── prd/                    ← 기존 (변경 없음)
├── wireframes/             ← 기존 (변경 없음)
├── stitch/                 ← 기존 (변경 없음)
├── reviews/                ← 기존 (변경 없음)
├── archive/                ← 기존 (변경 없음)
├── stage-manifest.json     ← 기존 (변경 없음)
│
└── intake/                 ← 신설
    ├── data-sources/
    │   └── {dataSourceId}/
    │       ├── schema/
    │       │   ├── SCHEMA-{runId}.md
    │       │   └── latest.json
    │       └── column-catalog.json
    ├── rows/
    │   └── {sourceRowId}/
    │       ├── meta.json
    │       ├── latest.md
    │       └── snapshots/
    │           └── SNAPSHOT-{runId}.md
    ├── indices/
    │   ├── row-index.json
    │   └── run-index.json
    ├── runs/
    │   └── {runId}/
    │       ├── manifest.md
    │       ├── errors.json
    │       └── fetched-row-ids.json
    └── config.json
```

### 핵심 원칙

- `rows/{sourceRowId}/`가 기본 저장 단위다.
- `runs/{runId}/`는 실행 이력과 로그를 저장하는 보조 구조다.
- `data-sources/{dataSourceId}/`는 schema discovery 결과를 저장하는 구조다.
- `indices/`는 빠른 skip 판단과 추적성 보조를 위한 읽기 최적화 계층이다.

---

## 3. Data Source Schema 저장 구조

### 3.1 `schema/`

Notion data source schema를 실행 시점마다 스냅샷으로 남긴다.

파일:

- `SCHEMA-{runId}.md`
- `latest.json`

목적:

- 실행 당시 어떤 컬럼이 있었는지 재현 가능하게 남긴다.
- mapping 실패가 "컬럼이 없어서인지", "매핑이 틀려서인지" 구분 가능하게 한다.

### 3.2 `column-catalog.json`

schema discovery 결과를 후속 단계가 읽기 쉬운 catalog 형태로 저장한다.

예시:

```json
{
  "dataSourceId": "abc123",
  "schemaVersion": "2026-04-07T10:30:00+09:00",
  "columns": [
    {
      "propertyName": "Name",
      "propertyId": "title",
      "propertyType": "title",
      "requiredMapping": true,
      "valueRetrievableBy": "query"
    },
    {
      "propertyName": "Related Issue",
      "propertyId": "AbCd",
      "propertyType": "relation",
      "requiredMapping": false,
      "valueRetrievableBy": "property_item"
    }
  ]
}
```

### 3.3 `valueRetrievableBy`

컬럼마다 값을 어디서 안정적으로 가져올 수 있는지 기록한다.

허용 값:

- `query`
- `property_item`
- `unsupported/limited`

이 값은 문서상 제약과 실제 테스트 결과를 반영하는 capability matrix 역할을 한다.

---

## 4. Row 기준 저장 구조

### 4.1 `rows/{sourceRowId}/`

각 Notion row는 고유 폴더를 가진다.

예시:

```text
.plans/intake/rows/notion-row-abc123/
  meta.json
  latest.md
  snapshots/
    SNAPSHOT-20260407-103000.md
```

이 구조의 목적은 아래와 같다.

- 이미 가져온 row를 빠르게 확인
- 한 row의 최신 상태와 최초 수집 이력 분리
- run 기준 파일명이 아니라 sourceRowId 기준으로 안전하게 추적

### 4.2 `meta.json`

최소 필드:

```json
{
  "sourceRowId": "notion-row-abc123",
  "rowFolderPath": ".plans/intake/rows/notion-row-abc123",
  "firstSeenRunId": "20260407-103000",
  "latestSnapshotId": "SNAPSHOT-20260407-103000",
  "schemaVersion": "2026-04-07T10:30:00+09:00",
  "status": "indexed"
}
```

### 4.3 `latest.md`

- 최신 normalized snapshot의 포인터 역할
- 구현 시 실제 사본으로 둘지, 링크 개념으로 둘지는 자유지만 문서상 의미는 "이 row의 최신 normalized 결과"다

### 4.4 `snapshots/`

- row별 snapshot 이력 보관 폴더
- v1은 strict skip 정책이므로 일반적으로 첫 snapshot만 존재할 가능성이 높다
- 그래도 구조는 이력 보관 가능 형태로 유지한다

---

## 5. 인덱스 구조

### 5.1 `row-index.json`

역할:

- `sourceRowId` 기준 dedupe
- row 폴더 바로 탐색

예시:

```json
{
  "mode": "sourceRowId",
  "items": {
    "notion-row-abc123": {
      "rowFolderPath": ".plans/intake/rows/notion-row-abc123",
      "latestSnapshotId": "SNAPSHOT-20260407-103000",
      "firstSeenRunId": "20260407-103000"
    }
  }
}
```

### 5.2 `run-index.json`

역할:

- 어떤 run이 언제 실행됐는지 요약
- run 폴더 탐색 보조

예시:

```json
{
  "runs": {
    "20260407-103000": {
      "path": ".plans/intake/runs/20260407-103000",
      "fetchedRows": 15,
      "newRows": 4,
      "skippedRows": 11,
      "status": "completed"
    }
  }
}
```

---

## 6. `config.json` 계약

기존 `notionPropertyMapping`만 있는 구조는 부족하다. 아래 개념을 포함하는 구조로 바꾼다.

```json
{
  "version": "1.0",
  "schemaDiscovery": {
    "dataSourceId": "notion-data-source-id",
    "writeSchemaManifest": true,
    "writeColumnCatalog": true
  },
  "propertyMapping": {
    "title": {
      "propertyId": "title",
      "propertyName": "Name",
      "required": true,
      "fetchMode": "query"
    },
    "description": {
      "propertyName": "Description",
      "required": false,
      "fetchMode": "query"
    },
    "relatedIssue": {
      "propertyName": "Related Issue",
      "required": false,
      "fetchMode": "property_item"
    }
  },
  "indexing": {
    "mode": "sourceRowId",
    "skipIfIndexed": true
  },
  "extraColumns": {
    "recordInCatalog": true,
    "includeInSnapshot": false
  },
  "batchMaxRows": 50
}
```

### 6.1 권장 원칙

- `propertyId` 우선, `propertyName` 보조
- `required`는 내부 필드 기준
- `fetchMode`는 value retrieval capability와 함께 해석

### 6.2 `fetchMode`

허용 값:

- `query`
- `property_item`

해석 규칙:

- `query`: query 응답만으로 값을 가져온다
- `property_item`: 필요 시 `Retrieve a page property item` 보강 호출을 허용한다

---

## 7. Source Column Catalog와 Normalized Snapshot Schema의 분리

기존처럼 내부 스키마를 먼저 고정하면 실제 DB 컬럼 현실과 충돌하기 쉽다. 따라서 2단계 계약으로 분리한다.

### 7.1 1단계: Source Column Catalog

목적:

- 실제 data source에 어떤 컬럼이 존재하는지 기록
- 어떤 컬럼이 어떤 방식으로 값 조회 가능한지 기록
- 매핑 누락과 schema drift를 감지

필수 속성:

- `propertyName`
- `propertyId`
- `propertyType`
- `requiredMapping`
- `valueRetrievableBy`

### 7.2 2단계: Normalized Snapshot Schema

목적:

- Source Column Catalog 위에 내부 필드를 정의
- 내부 필드가 어떤 source column에서 왔는지 추적 가능하게 함

예시:

```yaml
---
id: SNAPSHOT-20260407-103000
runId: "20260407-103000"
sourceRowId: "notion-row-abc123"
schemaVersion: "2026-04-07T10:30:00+09:00"
mappedFields:
  title:
    propertyId: "title"
    propertyName: "Name"
  description:
    propertyName: "Description"
title: "브로커별 정산 금액 불일치"
description: "..."
normalizeWarnings: []
---
```

핵심은 내부 필드가 어디서 왔는지 알 수 있어야 한다는 점이다.

---

## 8. Strict sourceRowId 인덱싱 정책

v1의 dedupe 정책은 단순하고 강하게 간다.

### 정책

- `sourceRowId`가 이미 index에 있으면 skip
- `row-index.json`이 손상되어도 `rows/{sourceRowId}/` 폴더가 있으면 skip
- `updatedAt` 비교 없음
- content hash 비교 없음

### 이유

- v1의 목표는 중복 억제와 구조 안정화다
- row 수정 추적까지 넣으면 상태 모델과 재수집 정책이 복잡해진다
- 후속 버전에서 `sourceRowId + updatedAt` 또는 content hash를 검토할 수 있다

---

## 9. run 구조

기존 단일 `RUN-{runId}.md` 파일 구조는 로그와 에러가 커질수록 관리가 어렵다. run 폴더 구조로 정리한다.

### `runs/{runId}/manifest.md`

최소 필드:

- `runId`
- `startedAt`
- `completedAt`
- `status`
- `dataSourceId`
- `schemaVersion`
- `fetchedRows`
- `newRows`
- `skippedRows`
- `rowFailures`

### `runs/{runId}/errors.json`

- row-level failure
- schema mismatch
- API failure

### `runs/{runId}/fetched-row-ids.json`

- 이번 run에서 본 row id 목록
- skip/신규 여부와 무관하게 fetch 대상 전체를 기록

---

## 10. 기존 IDEA/SCREENING 확장과의 관계

이번 문서 수정은 주로 `Fetch/Normalize` 단계의 저장 구조를 바꾸는 것이므로, IDEA/SCREENING 프론트매터 확장 자체는 유지할 수 있다.

다만 해석은 아래처럼 정리한다.

- `sourceRowIds`: `rows/{sourceRowId}/` 기준으로 추적 가능한 row id 목록
- `intakeRunId`: row가 처음 내부 파이프라인에 편입된 run id
- `sourceCount`: cluster 단계에서만 의미 있음
- `publishStatus`: 여전히 v1.1 이후 필드

즉, row 저장 구조가 바뀌더라도 IDEA/SCREENING 확장 필드의 의미는 유지된다.

---

## 11. Notion 공식 문서 기준 capability 메모

문서에는 아래 사실을 명시한다.

- data source schema는 `Retrieve a data source`의 `properties`에서 확인 가능
- row 목록은 `Query a data source`로 가져옴
- 일부 속성은 query/page 응답만으로 값이 충분하지 않을 수 있음
- relation/rollup/formula 등은 `Retrieve a page property item`이 필요할 수 있음

참고 문서:

- [Retrieve a data source](https://developers.notion.com/reference/retrieve-a-data-source)
- [Query a data source](https://developers.notion.com/reference/query-a-data-source)
- [Page properties](https://developers.notion.com/reference/page-property-values)
- [Page property items](https://developers.notion.com/reference/property-item-object)

---

## 12. 문서 차원의 완료 기준

이 문서가 완료되었다고 보려면 아래 5가지가 잠겨 있어야 한다.

1. source schema discovery와 property mapping이 분리되어 있다.
2. row 기준 폴더 구조가 확정되어 있다.
3. `sourceRowId` strict skip 정책이 확정되어 있다.
4. schema manifest, column catalog, row index, run manifest의 역할이 구분되어 있다.
5. `Fetch/Normalize` 다음 단계가 Notion 원본이 아니라 normalized snapshot만 읽도록 계약이 정리되어 있다.
