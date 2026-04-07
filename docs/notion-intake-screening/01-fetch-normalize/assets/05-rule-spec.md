# Asset Spec: Fetch/Normalize Contract Rule

## Purpose

이 문서는 `Fetch/Normalize` 단계에서 반드시 지켜야 할 invariant를 고정한다. 실제 구현 시 독립 rule asset으로 만들지, skill 내부 policy로 둘지는 후속 선택이지만, 계약 자체는 여기서 확정한다.

## Audience

- skill 작성자
- hook 작성자
- agent/command 구현자

## Inputs

- stage spec
- data model spec
- template contracts

## Outputs

- 고정 정책 집합
- 금지 행동 목록
- 구현 시 흔들리면 안 되는 우선순위

## Owned Decisions

- 어떤 규칙을 v1 invariant로 잠글 것인가
- 어떤 규칙은 후속 확장 대상으로 남길 것인가

## Non-Goals

- 분류 규칙 정의
- cluster merge 규칙 정의
- screening publish 규칙 정의

## Locked Rules

### 1. `propertyId` 우선

- mapping은 `propertyId`를 우선 사용한다.
- `propertyName`은 보조 식별자다.

### 2. Strict `sourceRowId` dedupe

- dedupe 기준은 `sourceRowId` 하나로 잠근다.
- title, description, hash 유사도는 쓰지 않는다.

### 3. Row folder 우선

- row 보관의 기본 단위는 run이 아니라 row다.
- canonical storage unit은 `rows/{sourceRowId}/`다.

### 4. `updatedAt` 미사용

- v1에서는 row 수정 시점 비교를 하지 않는다.
- 수정 row 재수집은 후속 버전의 문제다.

### 5. One-way normalized snapshot production

- 이 단계는 raw Notion payload를 internal normalized snapshot으로 바꾸는 데만 책임이 있다.
- downstream 단계가 raw payload에 다시 의존하도록 설계하면 안 된다.

## Optional Implementation Choice

v1에서는 아래 둘 다 허용한다.

- skill 내부 policy로 구현
- 독립 rule asset으로 구현

단, 어떤 형식을 택하든 위 invariant는 바뀌지 않아야 한다.

## Forbidden Moves

- dedupe를 title similarity로 대체
- `Fetch/Normalize` 안에서 분류나 cluster 판단까지 수행
- row storage보다 run storage를 canonical source로 취급
- hydrate 실패를 묵살하고 provenance 없는 snapshot 생성

## Failure Modes

- 구현 단계에서 optimization을 이유로 `updatedAt` 비교를 끼워 넣음
- property name 변경에 취약한 설계로 회귀함
- next stage가 raw payload를 다시 읽게 되어 stage 경계가 무너짐

## Acceptance

- 이 문서를 보면 `Fetch/Normalize`에서 흔들리면 안 되는 결정이 명확해야 한다.
- implementer가 선택할 수 있는 부분과 선택하면 안 되는 부분이 분리되어야 한다.
