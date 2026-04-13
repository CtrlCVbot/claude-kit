# Guide Alignment Audit

> migration-first 목표와 충돌하는 `docs/guide` 설명을 정리하는 문서

## 단계 위치

- 실행 단계: `2단계`
- 선행 조건: `08`
- 후속 문서: `10`, `14`

## 목적

기존 guide 문서 중 무엇이 새 migration pipeline과 충돌하는지 먼저 잠가서, conversion tooling 설계와 guide 설명이 서로 다른 방향으로 가지 않게 한다.

## 판정 기준

각 guide 문서는 아래 중 하나로 분류한다.

| 판정 | 의미 |
|------|------|
| `aligned` | migration-first 목표와 충돌하지 않음 |
| `needs-update` | 구현 전 또는 pilot 이전에 설명을 바로잡아야 함 |
| `follow-up` | 지금 당장 막히지는 않지만 실제 migration 후 반영이 필요함 |

## audit 결과

| 문서 | 판정 | 현재 설명 | 문제 이유 | 목표 설명 | 반영 시점 |
|------|------|-----------|-----------|-----------|-----------|
| `00-overview.md` | `needs-update` | Codex 전반 소개가 create-time/target-separated authoring 중심 | 1차 목표가 migration이라는 점이 약함 | `src/claude`를 1차 입력으로 보는 migration 기준 명시 | pilot 전 |
| `01-planning-pipeline.md` | `follow-up` | planning workflow는 맞지만 Codex 대응 흐름이 없음 | plan 계열 pilot 후 용어 맞춤 필요 | Claude plan -> Codex sibling 전환 지점 추가 | bulk migration 전 |
| `03-screening.md` | `needs-update` | 일부 링크/참조와 개념 정리가 오래됨 | migration guide 링크와 용어 정렬 필요 | screening 단계의 결과가 conversion inventory로 이어짐을 명시 | pilot 전 |
| `08-dev-workflow.md` | `follow-up` | dev workflow는 유효하나 hook/agent 설명이 현재 runtime 기준과 100% 일치하지 않음 | 실제 Codex pilot 뒤에 보정 필요 | dev workflow 결과가 Codex sibling generation으로 연결됨을 반영 | pilot 후 |
| `09-architecture.md` | `needs-update` | legacy Codex path-copy 모델이 남아 있음 | migration-first와 정면 충돌 | `src/claude -> conversion tooling -> src/codex -> installer` 구조로 교체 | pilot 전 |
| `10-glossary.md` | `needs-update` | `path copy`, old plugin/hook 용어가 남아 있음 | 새 vocabulary와 충돌 | `migration`, `conversion output`, `codex-skip`, `companion pair` 용어 추가 | pilot 전 |

나머지 guide 문서는 현재 단계에서 `aligned`로 본다.

## 핵심 수정 메시지

- Codex 대응의 1차 목표는 create-time sibling generation이 아니라 existing-source migration이다.
- `src/codex`는 installer 출력이 아니라 conversion-generated authoring source다.
- `kit-create`는 핵심 public workflow가 아니며, `kit-convert`와 migration validation이 먼저 온다.
- `hooks`, `subagents`, `AGENTS.md`는 모두 Claude 직접 복사가 아니라 Codex surface 재표현의 결과다.

## 이 단계의 산출물

- guide 수정 우선순위 목록
- pilot 전 즉시 수정 대상
- pilot 후 반영 대상

## 완료 기준

- 어떤 guide를 지금 고치고, 어떤 guide를 migration 완료 후 갱신할지 구분된다.
- `09-architecture`와 `10-glossary`가 핵심 교정 대상이라는 점이 고정된다.
