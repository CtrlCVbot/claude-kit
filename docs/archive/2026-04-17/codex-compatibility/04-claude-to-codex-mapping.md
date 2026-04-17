# Claude To Codex Mapping

> Claude kind별 Codex target surface 매핑 규칙을 정의하는 문서

## Codex targets

- `subagent`
- `skill`
- `hook-pair`
- `AGENTS.md synthesis`
- `codex-skip`

## 기본 매핑

| Claude kind | Codex target | 이유 |
|-------------|--------------|------|
| `agent` | `subagent` | 역할 중심 전문 에이전트와 가장 가까움 |
| `command` | `skill` | user-facing entry를 Codex skill로 재표현 |
| `skill` | `skill` | 구조 유사성이 가장 높음 |
| `hook` | `hook-pair` 또는 `codex-skip` | runtime config 분리 필요 |
| `instruction-rule` | `AGENTS.md synthesis` | 개별 파일 복사보다 합성이 적합 |

## 매핑 금지 규칙

- Claude `agent` markdown를 Codex runtime path로 직접 복사하지 않는다.
- Claude `command`를 Codex `commands/`로 복사하지 않는다.
- `instruction-rule`을 Codex `.rules`로 1:1 변환하지 않는다.
- unsupported hook을 억지로 Codex hook에 넣지 않는다.

## 대표 결정

- `dev-architect` -> `subagent`
- `plan-prd-writer` -> `subagent`
- `dev-feature` -> `skill`
- `dev-tdd-guard` -> `hook-pair`
- `session-wrap-suggest` -> `codex-skip`

## 출력

이 문서의 산출물은 “kind별 기본 규칙”이다. 개별 path와 companion 규격은 `05`에서 확정한다.
