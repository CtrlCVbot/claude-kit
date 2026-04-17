# Asset Spec: Fetch/Normalize Templates

이 문서는 `Fetch/Normalize` 단계가 읽고 쓰는 핵심 파일 계약을 정의한다. 구현자는 이 문서를 기준으로 `.plans/intake/` 산출물을 만들 수 있어야 한다.

## Template Inventory

| 파일 | 역할 | 작성 시점 | 작성 주체 |
|---|---|---|---|
| `.plans/intake/config.json` | schema discovery, mapping, indexing 설정 | 사전 준비 | 운영자 또는 setup flow |
| `SCHEMA-{runId}.md` | 실행 시점 schema snapshot | F0 | `plan-intake-reader` |
| `column-catalog.json` | source column catalog | F0 | `plan-intake-reader` |
| `rows/{sourceRowId}/meta.json` | row 폴더 메타데이터 | F5 | `plan-intake-reader` |
| `rows/{sourceRowId}/snapshots/SNAPSHOT-{runId}.md` | normalized snapshot | F5 | `plan-intake-reader` |
| `runs/{runId}/manifest.md` | 실행 요약 | F5 | `plan-intake-reader` |

## 1. `.plans/intake/config.json`

### Required Fields

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
    }
  },
  "indexing": {
    "mode": "sourceRowId",
    "skipIfIndexed": true
  }
}
```

### Notes

- `propertyId` 우선, `propertyName` 보조
- `fetchMode`는 `query` 또는 `property_item`
- `indexing.mode`는 v1에서 `sourceRowId` 고정

## 2. `SCHEMA-{runId}.md`

### Required Fields

- `runId`
- `dataSourceId`
- `schemaVersion`
- `retrievedAt`
- property 목록
- required mapping 검증 결과

### Example

```yaml
---
runId: "20260407-103000"
dataSourceId: "notion-data-source-id"
schemaVersion: "2026-04-07T10:30:00+09:00"
retrievedAt: "2026-04-07T10:30:00+09:00"
requiredMappingStatus: "ok"
---
```

## 3. `column-catalog.json`

### Required Fields

```json
{
  "dataSourceId": "notion-data-source-id",
  "schemaVersion": "2026-04-07T10:30:00+09:00",
  "columns": [
    {
      "propertyName": "Name",
      "propertyId": "title",
      "propertyType": "title",
      "requiredMapping": true,
      "valueRetrievableBy": "query"
    }
  ]
}
```

### Notes

- `valueRetrievableBy` 허용 값은 `query`, `property_item`, `unsupported/limited`
- catalog는 source schema를 요약하는 문서다

## 4. `rows/{sourceRowId}/meta.json`

### Required Fields

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

### Notes

- `status` 기본값은 `indexed`
- row-level failure row는 이 파일을 만들지 않는다

## 5. `rows/{sourceRowId}/snapshots/SNAPSHOT-{runId}.md`

### Required Fields

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
normalizeWarnings: []
---
```

### Notes

- provenance를 잃지 않도록 `mappedFields` 필수
- warning은 빈 배열이어도 필드 유지

## 6. `runs/{runId}/manifest.md`

### Required Fields

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

### Example

```yaml
---
runId: "20260407-103000"
status: "completed"
dataSourceId: "notion-data-source-id"
fetchedRows: 15
newRows: 4
skippedRows: 10
rowFailures: 1
---
```

## What This Template Pack Guarantees

- schema snapshot, row snapshot, run manifest의 역할이 섞이지 않는다.
- row 기준 저장 구조가 canonical이다.
- implementer는 각 파일의 필수 필드와 작성 시점을 다시 정할 필요가 없다.
