# Claude To Codex Surface Mapping

> 기존 Claude 자산을 Codex 공식 surface로 전환하는 규칙을 정의하는 문서

## 단계 위치

- 실행 단계: `3단계-a`
- 선행 조건: `08`, `09`
- 후속 문서: `11`, `12`, `13`

## 목적

이 문서는 기존 `src/claude` 자산을 어떤 Codex surface로 바꿀지 확정한다.  
핵심은 “새로 만들 때 어떻게 할지”가 아니라 “이미 있는 자산을 어떻게 읽어 Codex로 전환할지”다.

## Codex target surfaces

- `subagent`
- `skill`
- `hook`
- `AGENTS.md`
- `exec-policy rule`
- `skip`

## 기본 전환 규칙

| Claude kind | Codex target | 기본 규칙 |
|-------------|--------------|-----------|
| `agent` | `subagent` | Claude agent를 읽어 Codex subagent 초안 생성 |
| `command` | `skill` | Claude command를 user-facing Codex skill로 재표현 |
| `skill` | `skill` | 가능한 한 같은 identity의 Codex skill로 전환 |
| `hook` | `hook` or `skip` | Codex hook runtime 제약을 통과하는 경우만 전환 |
| `instruction-rule` | `AGENTS.md` | 개별 file conversion이 아니라 synthesis 입력으로 사용 |

## 자동 변환 금지 규칙

- Claude `agent` markdown를 그대로 Codex runtime path에 복사하지 않는다.
- Claude `command` markdown를 `commands/` 형태로 Codex에 복사하지 않는다.
- `instruction-rule`을 Codex `.rules`로 1:1 변환하지 않는다.
- unsupported hook을 억지로 `.codex/hooks.json`에 넣지 않는다.

## 수동 검토가 필요한 전환

아래 자산은 auto-convert 초안 생성은 가능하지만 수동 검토가 필수다.

| identity | 이유 | 기본 처리 |
|----------|------|-----------|
| `plan-prd-writer` | write-heavy, output contract 중요 | `subagent + contract` |
| `dev-doc-updater` | 문서 쓰기 범위 제한 필요 | `subagent + contract` |
| `plan-wireframe-designer` | 산출물 형식과 write target 명확화 필요 | `subagent + contract` |

## skip 기준

아래 부류는 기본적으로 `codex-skip` 후보로 본다.

- Claude runtime 의존성이 강한 hook
- Stop event 등 Codex 대응 surface가 없는 기능
- Codex 공식 surface에 자연스럽게 매핑되지 않는 보조 기능

대표 예시는 아래로 잠근다.

- `session-wrap-suggest` -> `codex-skip`
- `output-secret-filter` -> `codex-skip`

## 이 단계의 산출물

- kind별 전환 규칙
- high-risk identity 목록
- `codex-skip` 기준

## 완료 기준

- 모든 Claude kind가 Codex 대응 surface 하나로 귀결된다.
- 수동 검토가 필요한 자산과 명시적 skip 후보가 분리된다.
- 이후 `11`에서 path/format 규격을 고정할 수 있다.
