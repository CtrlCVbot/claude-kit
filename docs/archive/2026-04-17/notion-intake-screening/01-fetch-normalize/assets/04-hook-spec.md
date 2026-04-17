# Asset Spec: `plan-intake-env-guard`

## Purpose

`plan-intake-env-guard`는 `Fetch/Normalize` 실행 전에 환경과 필수 설정이 갖춰졌는지 확인하는 guard다. 목적은 잘못된 상태에서 Notion fetch나 storage write 흐름이 시작되는 것을 막는 것이다.

## Audience

- hook 설계자
- `/plan-intake-sync` 실행 조건을 정의하는 사람
- setup/compat 반영을 준비하는 사람

## Inputs

- 환경변수
- `.plans/intake/config.json`
- command invocation context

## Outputs

- allow
- block with reason
- warning message

## Owned Decisions

- stage 시작 전 무엇을 필수로 검사할 것인가
- block과 warning을 어떻게 나눌 것인가
- 어떤 값이 누락되면 즉시 차단할 것인가

## Non-Goals

- row dedupe 판단
- row skip 판단
- hydrate 방식 결정
- storage layout 검증 전부 수행

## Guard Scope

필수 검증 항목은 아래로 고정한다.

- `NOTION_API_TOKEN`
- `NOTION_PAIN_POINT_DATABASE_ID` 또는 동등한 data source id 설정
- `.plans/intake/config.json` 존재
- `schemaDiscovery.dataSourceId` 존재
- `propertyMapping` 존재

## Block Conditions

- token 누락
- data source id 누락
- config 파일 누락
- config parse 실패
- `propertyMapping` 자체 부재

## Warning Conditions

- 선택 필드 mapping 누락
- `extraColumns` 설정 부재
- `writeSchemaManifest` 같은 선택 옵션의 기본값 의존

## Deliberate Non-Ownership

아래는 hook이 아니라 stage logic 소유다.

- `sourceRowId` skip
- existing row folder 확인
- `property_item` hydrate 여부
- row-level failure 판정

즉, hook은 "시작해도 되는가"만 판단하고, "어떻게 처리할 것인가"는 판단하지 않는다.

## Failure Modes

- hook이 stage logic까지 침범해 책임이 비대해짐
- command와 hook이 동일 검증을 중복 수행함
- warning이어야 할 항목을 block으로 잡아 운영성이 떨어짐

## Acceptance

- 이 문서를 보면 `plan-intake-env-guard`의 범위가 preflight guard로만 한정된다는 점이 분명해야 한다.
- implementer가 row skip이나 hydrate 로직을 hook으로 밀어넣지 않게 경계가 분명해야 한다.
