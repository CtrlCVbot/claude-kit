# Asset Spec: `plan-intake-workflow` For Fetch/Normalize

## Purpose

`plan-intake-workflow`는 notion intake 전체 흐름을 설명하는 상위 skill이지만, 이 문서는 그중 `Fetch/Normalize` 단계에서 skill이 어떤 기준과 체크리스트를 제공해야 하는지 정의한다.

## Audience

- `plan` 도메인 skill 작성자
- intake pipeline 설계를 문서화하는 사람
- `/plan-intake-sync` 프롬프트와 워크플로우를 조립할 사람

## Inputs

- [01-stage-spec.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/01-stage-spec.md)
- [02-data-flow-and-decisions.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/02-data-flow-and-decisions.md)
- [06-template-spec.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/assets/06-template-spec.md)
- `.plans/intake/config.json` 계약

## Outputs

- `Fetch/Normalize` 단계 실행 체크리스트
- 필수 선행 조건 확인 순서
- stage exit condition
- 다음 단계로 넘길 요약 형식

## Owned Decisions

- stage 시작 전 무엇을 확인해야 하는가
- schema discovery와 row fetch 사이의 순서를 어떻게 안내할 것인가
- `Fetch/Normalize` 완료를 어떤 조건으로 판단할 것인가
- 실패 시 어떤 수준의 summary를 남겨 handoff할 것인가

## Non-Goals

- Notion API 호출 코드 구현
- storage writer 구현
- hook 실행 자체의 구현
- `Classify/Route` 분류 기준 정의

## Skill Responsibilities

### 1. Preflight Checklist

skill은 아래를 먼저 확인하도록 안내해야 한다.

- `NOTION_API_TOKEN` 존재
- `NOTION_PAIN_POINT_DATABASE_ID` 존재
- `.plans/intake/config.json` 존재
- `propertyMapping`과 `schemaDiscovery` 설정 유효

### 2. Stage Checklist

skill은 아래 실행 순서를 강제해야 한다.

1. schema 먼저 조회
2. 필수 매핑 검증
3. row index 로드
4. row fetch
5. existing row skip
6. 필요한 필드 hydrate
7. normalized snapshot persist
8. run manifest summarize

### 3. Exit Condition

skill은 stage 완료를 아래처럼 판단해야 한다.

- schema manifest 생성됨
- column catalog 생성됨
- new row만 row folder 아래에 저장됨
- skip/failure/warning이 run summary에 구분되어 남음

### 4. Handoff Summary

skill은 다음 단계에 아래 정보를 넘기게 해야 한다.

- `runId`
- `schemaVersion`
- new row snapshot 목록
- skipped row 목록
- row failure 목록
- warning summary

## Failure Modes

- 선행 조건 누락인데도 fetch를 시작함
- schema discovery 전에 row fetch부터 수행함
- `sourceRowId` skip 정책을 무시하고 중복 snapshot을 만듦
- summary 없이 다음 단계로 넘겨 추적성이 끊김

## Acceptance

- skill 문서만 읽어도 `Fetch/Normalize`의 운영 순서를 재현할 수 있어야 한다.
- skill은 stage spec을 반복 설명하지 않고, 체크리스트와 exit condition에 집중해야 한다.
- 구현자가 이 skill을 command 또는 agent 프롬프트에 바로 녹일 수 있어야 한다.
