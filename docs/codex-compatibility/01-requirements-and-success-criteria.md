# 요구사항과 성공 기준

> `src/claude + src/codex` 기준으로 문서 세트를 다시 짤 때, 무엇을 고정해야 하는지 정리한 문서.

---

## 1. 요구사항 정리

이번 요구사항은 아래처럼 정리된다.

| 번호 | 요구사항 | 의미 |
|------|------|------|
| 1 | 현재 `src`의 Claude 자산을 `src/claude/{core,dev,plan}`로 재해석 | Claude 타깃 source를 명시적으로 분리 |
| 2 | Codex 대응 자산을 `src/codex/{core,dev,plan}`에 별도 저장 | Codex-native authoring을 정식화 |
| 3 | Codex installer는 `src/codex`를 읽어 설치 | Claude `agents/commands`의 런타임 변환 금지 |
| 4 | 새 `agent/command`는 Claude 자산만으로 완료로 보지 않음 | Codex sibling 또는 `codex-skip` 필요 |
| 5 | 공식 Codex 문서 기준으로 각 target의 구현 형식을 설명 | 내부 편의보다 공식 surface 우선 |

---

## 2. 직접 분리 대상과 비직접 분리 대상

이 문서 세트는 자산을 아래처럼 구분한다.

### 직접 분리 대상

- `agent`
- `command`

이 두 종류는 target-specific UX 차이가 커서, 기본적으로 `src/claude`와 `src/codex`를 모두 갖는 것을 원칙으로 한다.

### 선택적 분리 대상

- `skill`
- `hook`
- `exec-policy rule`

이 자산들은 Codex UX나 공식 surface 요구가 있을 때 `src/codex` sibling을 허용한다.

### Claude-origin shared 대상

- `instruction rule`
- 일부 shared reference
- 초기 단계의 `templates`

이 자산들은 우선 Claude 쪽 source를 기준으로 유지하고, Codex에서는 guidance나 shared infra로 소비한다.

---

## 3. 성공 기준

문서 세트는 아래 질문에 결정 완료 상태로 답해야 한다.

1. 어떤 자산이 `src/codex` sibling을 반드시 가져야 하는가
2. 어떤 자산은 Claude-origin shared로 남아도 되는가
3. Codex installer는 어떤 source를 읽고, 어떤 source를 읽지 않아야 하는가
4. 새 `agent/command` 추가 시 pairing과 completion 기준은 무엇인가
5. `AGENTS.md`, `.codex/agents/*.toml`, `.codex/hooks.json`, `.codex/rules/*.rules`의 source 책임은 어디에 있는가

문서 세트의 성공 기준은 아래로 고정한다.

1. `00-overview.md`만 읽어도 새 기준이 `install-time transform`이 아니라 `target-separated authoring`이라는 점이 이해된다.
2. `agent/command`는 기본적으로 `src/claude`와 `src/codex` 모두에서 관리된다고 분명히 적혀 있다.
3. Codex installer가 Claude `agents/commands`를 직접 읽지 않는다는 점이 문서 전반에서 일관된다.
4. `instruction rule`과 `exec-policy rule`의 역할이 분리된다.
5. 문서만 읽어도 후속 구현자가 `src/claude`, `src/codex`, installer 책임을 다시 결정하지 않아도 된다.

---

## 4. 평가 기준

문서 안의 구조 제안은 아래 기준으로 읽는다.

| 기준 | 질문 |
|------|------|
| 공식 가이드 적합성 | 각 target source가 공식 surface에 맞게 설명되는가 |
| 소스 ownership 명확성 | Claude와 Codex 책임 경계가 분명한가 |
| 유지보수성 | 새 기능 추가 시 pairing 규칙이 단순한가 |
| 설치기 단순성 | installer가 해석기보다 target selector로 작동하는가 |
| 문서 명확성 | 어떤 자산이 shared인지 target-specific인지 한 번에 보이는가 |

---

## 5. 비범위

이번 문서 세트는 아래를 직접 구현하지 않는다.

- 실제 `src -> src/claude` 이동
- 실제 `src/codex` 디렉터리 생성
- 실제 installer 로직 변경
- 실제 metadata 스키마 확정

이번 단계는 구조와 책임을 문서로 고정하는 단계다.

