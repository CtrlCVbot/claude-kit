# Conversion Tooling Requirements

> 기존 Claude 자산을 Codex sibling으로 전환하기 위한 메타 툴 요구사항을 정의하는 문서

## 단계 위치

- 실행 단계: `4단계`
- 선행 조건: `10`, `11`, `12`
- 후속 문서: `14`

## 목적

이 문서는 create-time scaffolding이 아니라 migration tooling을 먼저 정의한다.  
핵심 public workflow는 `kit-convert`다.

## 핵심 엔트리포인트

| 명령 | 책임 |
|------|------|
| `kit-convert` | 기존 Claude 자산을 읽어 Codex sibling preview/generation 수행 |
| `kit-validate` | 생성된 target source와 companion pair schema 검증 |
| `kit-audit C7` | cross-target parity, drift, missing required sibling 검증 |
| `kit-maintainer` | bulk repair proposal과 migration follow-up 정리 |
| `kit-create` | migration 규칙이 안정화된 뒤 재사용 |

## `kit-convert` 요구사항

### 기본 동작

- 기본 모드는 `preview`
- 실제 쓰기는 `--apply`로만 수행
- 입력 범위는 아래를 지원한다.
  - `--identity`
  - `--domain`
  - `--kind`
  - `--all`

### 출력

- conversion plan preview
- 생성 대상 `src/codex` path 목록
- companion pair 생성 여부
- manual review 필요 여부
- `codex-skip` 후보와 사유

### 실제 생성 시 해야 할 일

- `src/claude` source 읽기
- `src/codex` sibling 생성
- `*.hook.json` / `*.contract.json` companion 생성
- `src/pairing-registry.json` 갱신

## pairing-registry 계약

이 문서 세트에서 `pairing-registry`는 create-time registry보다 먼저 migration status registry다.

최소 기록 항목은 아래로 잠근다.

- `identity`
- `kind`
- `domain`
- `claudeSource`
- `codexSource`
- `status`
- `manualReviewRequired`
- `skipReason`

기본 상태값은 아래로 고정한다.

- `paired`
- `codex-skip`
- `codex-native-only`

## `kit-validate` 계약

- `kit-validate`는 selected target source만 본다.
- Claude target 검증은 Claude source/schema만 본다.
- Codex target 검증은 Codex source/schema와 companion pair만 본다.
- opposite-target sibling 부재는 `kit-validate`의 FAIL 사유가 아니다.

Codex 쪽 FAIL 예시는 아래다.

- missing `*.hook.json`
- invalid `*.hook.json`
- write-capable subagent인데 missing `*.contract.json`
- invalid `*.contract.json`

## `kit-audit C7` 계약

`kit-audit C7`는 cross-target completeness와 drift를 본다.

주요 검사는 아래다.

- missing required Codex sibling
- invalid `codex-skip`
- orphan registry entry
- generated source와 registry 불일치
- manual review pending 항목 누락

## `kit-maintainer` 계약

- bulk migration repair proposal 생성
- `needs manual review` 항목 목록화
- registry 정리 제안
- rename/delete 후 orphan cleanup 제안

자동 삭제/자동 rename은 기본 동작으로 두지 않는다.

## `kit-create` 재사용 원칙

- `kit-create`는 1차 migration pipeline이 안정화된 뒤에만 재사용한다.
- 초기 구현에서는 `kit-convert`가 authoritative source다.
- create-time Codex sibling generation은 migration 규칙을 복제하지 않고 재사용해야 한다.

## 완료 기준

- migration tooling의 핵심 public workflow가 `kit-convert`로 고정된다.
- `kit-validate`와 `kit-audit C7`의 책임이 분리된다.
- `pairing-registry`가 migration status registry로 정의된다.
- `kit-create`는 2차 단계라는 점이 명확해진다.
