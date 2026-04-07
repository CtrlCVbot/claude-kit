# Asset Spec: Fetch/Normalize Sub-Agents

이 문서는 `plan-intake-reader` 아래에 둘 수 있는 sub-agent 설계를 정리한다. 실제 구현이 독립 agent일지, 내부 worker일지는 후속 구현 단계에서 결정하되, 책임 경계는 이 문서 기준으로 잠근다.

## Shared Rules

- parent agent는 `plan-intake-reader`다.
- sub-agent는 `Fetch/Normalize` 단계만 다룬다.
- sub-agent는 `.plans/intake/*` 산출물 계약을 직접 바꾸지 않는다.
- schema, row, hydration, persistence 책임은 서로 겹치지 않는다.

## `plan-intake-schema-reader`

### Purpose

Notion data source schema를 읽고 schema manifest와 column catalog 생성을 위한 원천 데이터를 제공한다.

### Inputs

- `NOTION_API_TOKEN`
- `dataSourceId`
- `propertyMapping`

### Outputs

- raw schema payload
- parsed property list
- required mapping validation result

### Independent Use

- 가능
- schema drift 점검이나 config 검증용 dry-run에서 단독 실행 가능하다.

### Failure Handling

- schema fetch 실패는 run failure로 escalates
- required mapping 누락은 run failure로 escalates

### Parent Handoff

parent에는 아래를 넘긴다.

- `schemaVersion`
- `properties`
- `requiredMappingStatus`

## `plan-intake-row-fetcher`

### Purpose

Notion data source row를 command 옵션에 맞춰 가져오고, raw candidate row 목록을 준비한다.

### Inputs

- `dataSourceId`
- `limit`
- `cursor`
- `since`
- `filter_properties`

### Outputs

- candidate raw rows
- pagination state
- fetched row count

### Independent Use

- 부분 가능
- row fetch dry-run에서 단독 사용 가능하지만, skip 판단은 parent와 함께 봐야 한다.

### Failure Handling

- fetch 실패는 run failure
- 개별 row payload 이상은 parent가 row-level failure로 낮출 수 있다

### Parent Handoff

- raw row list
- page cursor info
- fetch summary

## `plan-intake-property-hydrator`

### Purpose

query 결과만으로 충분하지 않은 속성에 대해 `property_item` 보강 호출을 수행하고 normalize 가능한 field set을 만든다.

### Inputs

- raw row payload
- `propertyMapping`
- `fetchMode`
- schema property metadata

### Outputs

- hydrated field values
- warning list
- hydrate failure info

### Independent Use

- 불가
- schema 정보와 row payload를 모두 알아야 하므로 parent context가 필요하다.

### Failure Handling

- 필수 필드 hydrate 실패는 row failure
- 선택 필드 hydrate 실패는 warning

### Parent Handoff

- normalized field candidates
- warning list
- failure classification

## `plan-intake-row-persister`

### Purpose

normalized snapshot과 row metadata를 row 기준 폴더 구조에 기록하고 row index, run manifest를 갱신하는 데 필요한 write payload를 만든다.

### Inputs

- `sourceRowId`
- normalized snapshot
- existing row folder state
- existing row index state
- run summary state

### Outputs

- row folder write set
- index update set
- run manifest update set

### Independent Use

- 부분 가능
- 정적 fixture를 이용한 storage contract 검증에는 단독 사용 가능하다.

### Failure Handling

- row folder write 실패는 row failure가 기본
- index 또는 run manifest 전체 갱신 불가 시 run failure로 상승 가능

### Parent Handoff

- persisted snapshot path
- updated index entry
- manifest delta

## Why These Four

이 네 개로 쪼개는 이유는 `Fetch/Normalize` 단계의 주요 책임 축과 정확히 맞기 때문이다.

- schema discovery
- raw row acquisition
- selective value hydration
- row-based persistence

`skip checker`를 별도 sub-agent로 두지 않는 이유는 `plan-intake-reader`가 index와 row folder를 함께 보며 orchestration 차원에서 결정하는 편이 자연스럽기 때문이다.

## Acceptance

- 네 sub-agent를 합치면 `Fetch/Normalize` 전체가 완성되어야 한다.
- 어떤 sub-agent도 분류, clustering, screening 책임을 가져가면 안 된다.
- parent agent가 최종 run summary를 소유하도록 경계가 유지되어야 한다.
