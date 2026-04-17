# Fetch/Normalize Stage Spec

> 대상 단계: `Fetch/Normalize`
>
> 목적: Notion pain-point data source에서 row와 schema를 함께 읽어 와서, 내부 공통 계약에 맞는 `normalized snapshot`과 `row index`를 생성한다.
>
> 범위: 이 문서는 `Fetch/Normalize` 단계만 다룬다. `Classify/Route`, `Cluster/Review`, `Screening/Sync`는 포함하지 않는다.

---

## 1. 이 문서의 역할

이 문서는 `Fetch/Normalize` 단계 자체의 SSOT다. stage가 무엇을 입력으로 받고, 어떤 순서로 처리하며, 무엇을 출력으로 남기는지 정의한다.

이번 설계의 핵심은 아래 세 가지다.

1. 내부 공통 스키마를 고정 가정하지 않는다.
2. 실제 Notion data source의 컬럼 스키마를 먼저 읽는다.
3. row 저장과 dedupe를 `sourceRowId` 기준으로 수행한다.

즉, 이 단계는 "fetch + normalize"만이 아니라 `schema discovery + indexing + row persistence`를 함께 책임진다.

---

## 2. 단계 목표

`Fetch/Normalize`의 목표는 아래 5가지를 동시에 만족하는 것이다.

1. Notion data source schema를 읽어 실제 컬럼 목록과 타입을 파악한다.
2. schema 위에 내부 필드 매핑을 얹는다.
3. candidate row를 가져오되 이미 수집한 row는 건너뛴다.
4. 새 row만 normalized snapshot으로 저장한다.
5. 다음 단계가 Notion 원본 구조를 몰라도 동작할 수 있게 내부 계약을 안정화한다.

즉, 이 단계의 진짜 역할은 "외부 시스템을 내부 파이프라인이 소비 가능한 읽기 모델로 바꾸는 것"이다.

---

## 3. In Scope / Out of Scope

### In Scope

- data source schema discovery
- column catalog 생성
- property mapping 적용
- row candidate fetch
- `sourceRowId` 기반 skip 판단
- row별 snapshot 저장
- row index 생성/갱신
- run manifest 기록
- 필요 시 property item 보강 호출 정책 정의

### Out of Scope

- `bug/error` vs `change-request` 분류
- cluster 후보 생성
- IDEA 생성
- `backlog.md` 업데이트
- screening DB publish
- `updatedAt` 기반 재수집
- content hash 기반 dedupe

---

## 4. 선행 조건

### 4.1 설정 파일

`03-data-model-extension.md`에서 정의한 `.plans/intake/config.json` 구조가 준비되어 있어야 한다.

최소 필요 개념:

```json
{
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

### 4.2 환경변수

최소 환경변수:

- `NOTION_API_TOKEN`
- `NOTION_PAIN_POINT_DATABASE_ID`

### 4.3 로컬 폴더 구조

아래 폴더가 존재하거나 실행 시 생성 가능해야 한다.

```text
.plans/intake/
  data-sources/
  rows/
  indices/
  runs/
  config.json
```

---

## 5. 입력 계약

### 5.1 외부 입력

| 입력 | 설명 | 필수 여부 |
|---|---|---|
| Notion data source schema | 컬럼 목록과 타입 정의 | 필수 |
| Notion row 목록 | pain-point 원본 row | 필수 |
| Notion API token | 인증 | 필수 |

### 5.2 로컬 입력

| 입력 | 설명 | 필수 여부 |
|---|---|---|
| `.plans/intake/config.json` | schema discovery / property mapping / indexing 설정 | 필수 |
| `row-index.json` | 기존 수집 row 인덱스 | 선택 |
| `rows/{sourceRowId}/` 폴더 | 기존 row 저장 여부 확인 | 선택 |

### 5.3 커맨드 입력

향후 `/plan-intake-sync`가 아래 옵션을 가질 수 있다.

- `--limit N`
- `--cursor`
- `--since YYYY-MM-DD`
- `--dry-run`

이 옵션은 커맨드가 해석한 뒤 `Fetch/Normalize` 단계에 전달하는 것으로 본다.

---

## 6. 출력 계약

이 단계의 출력은 4개 계층으로 나뉜다.

### 6.1 schema 출력

위치:

```text
.plans/intake/data-sources/{dataSourceId}/schema/
```

파일:

- `SCHEMA-{runId}.md`
- `latest.json`

### 6.2 column catalog 출력

위치:

```text
.plans/intake/data-sources/{dataSourceId}/column-catalog.json
```

### 6.3 row 출력

위치:

```text
.plans/intake/rows/{sourceRowId}/
```

파일:

- `meta.json`
- `latest.md`
- `snapshots/SNAPSHOT-{runId}.md`

### 6.4 index + run 출력

위치:

```text
.plans/intake/indices/
.plans/intake/runs/{runId}/
```

파일:

- `row-index.json`
- `run-index.json`
- `manifest.md`
- `errors.json`
- `fetched-row-ids.json`

---

## 7. 내부 계약: 2단계 구조

기존처럼 단일 내부 공통 스키마만 정의하면 실제 DB와 충돌하기 쉽다. 따라서 아래 2단계 구조를 사용한다.

### 7.1 Source Column Catalog

목적:

- 실제 data source의 컬럼 목록과 타입을 기록
- 어떤 컬럼이 필수 매핑 대상인지 표시
- 어떤 방식으로 값 조회가 가능한지 기록

예시:

```json
{
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

`valueRetrievableBy` 허용 값:

- `query`
- `property_item`
- `unsupported/limited`

### 7.2 Normalized Snapshot Schema

목적:

- catalog 위에 내부 필드를 정의
- 각 내부 필드가 어느 source property에서 왔는지 추적

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

핵심은 "무슨 컬럼이 있었는가"와 "우리가 무엇을 내부 필드로 썼는가"를 분리하는 것이다.

---

## 8. Property Mapping 규칙

### 8.1 기본 원칙

- `propertyId` 우선, `propertyName` 보조
- `required`는 내부 필드 기준
- `fetchMode`는 필드별 값 조회 전략을 의미

### 8.2 `fetchMode`

허용 값:

- `query`
- `property_item`

해석:

- `query`: `Query a data source` 응답만 사용
- `property_item`: 필요 시 `Retrieve a page property item` 보강 호출 허용

### 8.3 capability matrix와의 관계

`fetchMode=query`로 설정했더라도, 공식 문서상 값이 잘릴 수 있는 타입이면 warning이 남아야 한다.

예:

- relation
- rollup
- formula

이 경우 문서에 "기본은 query, 필요 필드는 property_item 승격" 원칙을 명시한다.

---

## 9. Strict sourceRowId 인덱싱 정책

v1의 dedupe는 아래 규칙으로 잠근다.

1. `row-index.json`에 `sourceRowId`가 있으면 skip
2. 인덱스가 손상돼도 `rows/{sourceRowId}/` 폴더가 있으면 skip
3. `updatedAt` 비교 없음
4. content hash 비교 없음

이 정책은 보수적이지만, v1의 목적이 구조 안정화이므로 적절하다.

### row-index 예시

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

---

## 10. 실행 순서

`Fetch/Normalize`는 아래 6단계로 확정한다.

### F0 Discover Schema

- `Retrieve a data source` 호출
- schema manifest 생성
- column catalog 생성
- 필수 매핑 대상 컬럼 존재 여부 검증

### F1 Load Index

- `row-index.json` 로드
- 기존 row 폴더 존재 여부 확인 준비

### F2 Fetch Candidate Rows

- `Query a data source` 호출
- pagination 처리
- 가능한 경우 `filter_properties` 사용

### F3 Skip Existing Rows

- `sourceRowId`가 index에 있으면 skip
- index가 없어도 row 폴더가 있으면 skip

### F4 Hydrate Required Values

- query 결과만으로 충분한 속성은 그대로 사용
- `fetchMode=property_item`인 필드만 보강 호출

### F5 Normalize And Persist

- normalized snapshot 생성
- row 폴더 저장
- `meta.json`, `latest.md`, `row-index.json` 갱신
- run manifest 기록

---

## 11. 오류 처리 정책

### 11.1 run-level failure

아래는 즉시 실패:

- `NOTION_API_TOKEN` 없음
- data source id 없음
- `config.json` 없음
- data source schema 조회 실패
- 필수 매핑 컬럼이 실제 schema에 없음

### 11.2 row-level failure

아래는 개별 row만 실패 처리:

- `sourceRowId` 추출 불가
- title 추출 불가
- row 구조 parsing 불가

### 11.3 warning

아래는 warning:

- 선택 필드 누락
- property type 불일치
- `fetchMode=query`인데 값이 제한적으로 들어옴

---

## 12. Notion 공식 문서 기반 retrieval 정책

문서에는 아래 사실을 명시한다.

- data source schema는 `Retrieve a data source`의 `properties`에서 읽을 수 있다.
- row 목록은 `Query a data source`로 가져올 수 있다.
- 일부 속성값은 query/page 응답만으로 불완전할 수 있다.
- relation/rollup/formula 등은 `Retrieve a page property item` 보강 호출이 필요할 수 있다.

참고 문서:

- [Retrieve a data source](https://developers.notion.com/reference/retrieve-a-data-source)
- [Query a data source](https://developers.notion.com/reference/query-a-data-source)
- [Page properties](https://developers.notion.com/reference/page-property-values)
- [Page property items](https://developers.notion.com/reference/property-item-object)

---

## 13. 테스트 계획

### schema discovery

1. 실제 data source schema에서 `propertyName`, `propertyId`, `propertyType`가 manifest와 catalog에 기록된다.
2. 필수 매핑 컬럼이 schema에 없으면 run이 실패한다.

### value retrieval

1. 일반 텍스트/select/multi_select 값은 query 결과만으로 normalize된다.
2. relation/rollup/formula처럼 제한 가능성이 있는 속성은 `fetchMode=property_item`일 때만 추가 호출된다.
3. `fetchMode=query`인데 값이 불완전하면 warning이 남는다.

### indexing

1. 같은 `sourceRowId`를 다시 만나면 새 snapshot을 만들지 않고 skip 기록만 남긴다.
2. row index가 손상돼도 `rows/{sourceRowId}/` 폴더 존재 여부로 2차 방어가 된다.

### folder layout

1. 새 row는 반드시 `rows/{sourceRowId}/` 폴더 아래에 저장된다.
2. 최신 snapshot 포인터와 run manifest가 함께 갱신된다.

### failure handling

1. token/data source id/config 누락은 run-level failure다.
2. title 또는 sourceRowId 추출 실패는 row-level failure다.
3. 선택 컬럼 누락은 warning이다.

---

## 14. 구현 작업 분해

1. data source schema reader 정의
2. schema manifest / column catalog serializer 정의
3. property mapping resolver 정의
4. candidate row fetcher 정의
5. row index loader / skip checker 정의
6. property item hydrator 정의
7. row folder writer 정의
8. run manifest writer 정의

핵심은 1~6번이다. 이 부분이 정리되면 후속 단계는 normalized snapshot만 읽으면 된다.

---

## 15. 구현 전 최종 결정 필요 항목

아래는 문서화 후에도 별도 결정 메모로 잠글 수 있는 항목이다.

1. `runId`를 `YYYYMMDD`로 둘지 `YYYYMMDD-HHMMSS`로 둘지
2. `latest.md`를 실제 복사본으로 둘지 포인터 개념으로 둘지
3. relation/rollup/formula의 기본 `fetchMode` 권장값을 타입별로 더 세분화할지
4. `filter_properties` 기본 사용 범위를 어디까지 허용할지

---

## 16. 완료 기준

`Fetch/Normalize` 단계는 아래를 만족하면 완료로 본다.

1. data source schema를 읽고 catalog를 생성할 수 있다.
2. property mapping 위에 normalized snapshot을 만들 수 있다.
3. `sourceRowId` 기준으로 기존 row를 안정적으로 skip한다.
4. 새 row는 `rows/{sourceRowId}/` 폴더 아래에 저장된다.
5. 다음 단계가 Notion 원본이 아니라 normalized snapshot만 읽어도 동작할 수 있다.
