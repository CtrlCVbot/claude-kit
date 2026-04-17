# Asset Spec: `plan-intake-reader`

## Purpose

`plan-intake-reader`는 `Fetch/Normalize` 단계의 메인 agent다. 이 agent는 Notion data source schema와 row를 읽고, row-based storage에 normalized snapshot을 남기는 흐름을 오케스트레이션한다.

## Audience

- agent 프롬프트 설계자
- `/plan-intake-sync` command 작성자
- sub-agent 구조를 설계하는 사람

## Inputs

- command options: `limit`, `cursor`, `since`, `dry-run`
- `.plans/intake/config.json`
- Notion schema + row payload
- existing `row-index.json`
- existing `rows/{sourceRowId}/`

## Outputs

- schema manifest
- column catalog
- normalized row snapshots
- updated row index
- run manifest
- next stage handoff summary

## Owned Decisions

- sub-agent를 어떤 순서로 호출할 것인가
- schema validation과 row hydration을 어디서 중재할 것인가
- skip, failure, warning 결과를 run summary로 어떻게 정리할 것인가

## Non-Goals

- bug/change classification
- cluster candidate 생성
- screening artifact 생성
- publish 수행

## Responsibility Boundary

### Agent가 해야 하는 일

- `Fetch/Normalize` stage 전체 orchestration
- schema reader, row fetcher, hydrator, persister 조합
- run-level failure와 row-level failure 구분
- output artifact 간 참조 정합성 확인

### Agent가 하지 않는 일

- 환경변수 존재 여부를 hook 대신 자체 guard로 이중 구현하지 않음
- 분류 정책을 확정하지 않음
- downstream 단계 artifact 생성하지 않음

## Collaboration With Command

`/plan-intake-sync`는 user-facing entrypoint다. `plan-intake-reader`는 그 안에서 실제 `Fetch/Normalize` 실행 책임을 가진다.

경계는 아래로 잠근다.

- command: 옵션 파싱, 실행 모드 해석, 결과 요약 노출
- agent: schema fetch, row fetch, hydration, persistence orchestration

## Collaboration With Storage

storage는 agent의 하위 구현 책임으로 취급한다. 다만 storage layout 자체는 [06-template-spec.md](/C:/Program Files (user)/mologado/claude-kit/docs/notion-intake-screening/01-fetch-normalize/assets/06-template-spec.md) 문서를 따른다.

즉, agent는 storage 규약을 소비하지 정의하지는 않는다.

## Failure Modes

- command와 agent가 둘 다 옵션 필터링을 해 책임이 중복됨
- persister 실패가 row failure인지 run failure인지 구분되지 않음
- hydrate 결과와 snapshot 결과의 provenance가 끊김

## Acceptance

- 이 문서만 읽어도 `plan-intake-reader`가 stage owner라는 점이 분명해야 한다.
- sub-agent를 붙이더라도 최종 orchestration 책임은 메인 agent에 남아 있어야 한다.
- implementer가 command/agent/storage 경계를 다시 결정할 필요가 없어야 한다.
