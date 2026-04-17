# Asset Mapping Rules

> 어떤 자산이 `src/codex` sibling을 가져야 하고, 어떤 자산은 shared 또는 Claude-origin으로 남아도 되는지 정리한 문서.

---

## 1. 기본 매핑 규칙

이 문서 세트는 자산을 아래 세 부류로 본다.

| 부류 | 설명 |
|------|------|
| `required codex sibling` | `src/codex` 대응 자산이 반드시 있어야 함 |
| `optional codex sibling` | Codex UX 차이나 공식 surface 필요가 있을 때만 추가 |
| `claude-origin shared` | 우선 Claude source에서 관리하고 Codex는 소비만 함 |

---

## 2. 자산별 기본 정책

| 자산 | 기본 정책 | 설명 |
|------|------|------|
| `agent` | `required codex sibling` | target별 실행 모델 차이가 커서 분리 authoring 필요 |
| `command` | `required codex sibling` | Claude command와 Codex entry flow가 다르므로 분리 필요 |
| `skill` | `optional codex sibling` | 재사용 가능하지만 UX 차이가 크면 Codex용 companion 허용 |
| `instruction rule` | `claude-origin shared` | 기본적으로 Claude에서 관리하고 Codex는 `AGENTS.md` guidance로 소비 |
| `exec-policy rule` | `optional codex sibling` | 필요 시 `src/codex`에만 별도 관리 |
| `hook` | `optional codex sibling` | 공식 Codex hook surface에 맞는 경우만 별도 구현 |

---

## 3. `agent`와 `command` 규칙

새 `agent`와 `command`는 아래 중 하나여야 한다.

1. `src/claude`와 `src/codex`에 모두 대응 자산이 있다.
2. Codex 대응이 의도적으로 없고, 그 이유가 `codex-skip`로 남아 있다.

즉 Claude 자산만 추가해 놓고 Codex 대응을 나중으로 미루는 상태를 완료로 보지 않는다.

---

## 4. pairing 규칙

pairing은 아래 원칙으로 유지한다.

- 같은 도메인 아래 동일한 기능 identity를 쓴다.
- Codex sibling은 같은 파일명이 아니어도 된다.
- pairing 상태는 최소한 아래 중 하나가 드러나야 한다.
  - paired
  - codex-skip
  - codex-native-only

이 상태는 추후 metadata나 pairing registry로 표현할 수 있다.

---

## 5. shared 자산 규칙

`instruction rule`과 일부 reference는 우선 Claude-origin shared로 둔다.

- 예: `src/claude/core/rules/*.md`
- Codex에서는 이를 `AGENTS.md` guidance 생성의 입력으로 소비
- 이 자산들은 당장 `src/codex`로 전부 복제하지 않는다

반대로 exec-policy는 shared prose가 아니라 Codex-native asset가 더 자연스럽다.

---

## 6. Codex sibling의 책임

Codex sibling은 Claude 자산의 요약본이 아니다. 아래 책임 중 하나를 가진다.

- Codex skill로 직접 노출되는 source
- Codex subagent 정의 또는 그 입력 source
- Codex hook config를 만드는 source
- Codex exec-policy를 만드는 source
- Codex용 documented entry flow를 설명하는 source

즉 Codex sibling은 "변환 결과의 흔적"이 아니라 "Codex 타깃을 위한 정식 source"다.

---

## 7. 이 문서가 고정하는 결론

- `agent`와 `command`는 기본적으로 `src/codex` sibling을 가져야 한다.
- `instruction rule`은 shared/Claude-origin 자산으로 둔다.
- `exec-policy rule`, `hook`, `skill`은 역할이 필요할 때만 Codex sibling을 둔다.
- pairing 상태는 항상 source 수준에서 드러나야 한다.

