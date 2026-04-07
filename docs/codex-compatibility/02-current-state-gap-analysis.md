# 현재 상태와 갭 분석

> 왜 single `src` 구조와 기존 installer 접근으로는 에이전트 기능의 Codex 대응이 불명확해지는지 정리한 문서.

---

## 1. 현재 source 구조

현재 저장소의 source는 아래처럼 domain-first 구조다.

- `src/claude/core`
- `src/claude/dev`
- `src/claude/plan`

그리고 각 도메인 아래에 `agents`, `commands`, `skills`, `hooks`, `rules`가 섞여 있다.

이 구조는 Claude-first authoring에는 자연스럽지만, target ownership이 드러나지 않는다.

---

## 2. 현재 구조의 문제

### 2.1 `agent/command`의 target 불명확성

현재 `src/claude/dev/agents`, `src/claude/dev/commands`, `src/claude/plan/agents`, `src/claude/plan/commands`의 자산은 사실상 Claude용 문법과 흐름을 기준으로 작성되어 있다.

- Claude command 사용 예시
- Claude agent frontmatter
- `.claude/...` 경로 참조
- Claude 중심 workflow 설명

그런데 현재 구조만 보면 이 자산이 Claude 전용인지, Codex 대응까지 포함하는지 드러나지 않는다.

### 2.2 installer의 과도한 책임

기존 installer는 Codex 대응에서 아래 같은 전제를 가지기 쉽다.

- Claude `agents/commands`를 복사하거나
- Claude 자산을 runtime에 해석해서
- Codex용 결과물로 재구성할 수 있다고 기대

이 방식은 `skill` 일부에는 통할 수 있어도, `agent/command`에는 안정적이지 않다.

### 2.3 source ownership 부재

현재는 아래 질문에 source 차원 답이 없다.

- 이 기능의 Claude 정식 자산은 어디인가
- 이 기능의 Codex 정식 자산은 어디인가
- Codex 대응이 없으면 의도된 skip인가, 아직 미구현인가

즉 구조만 봐서는 "공통 source"처럼 보이지만, 실제로는 Claude 중심 source다.

### 2.4 output 책임 추적 어려움

`AGENTS.md`, `.codex/agents/*.toml`, `.codex/hooks.json`, `.codex/rules/*.rules` 같은 Codex output이 어디 source에서 왔는지 구조상 바로 설명하기 어렵다.

---

## 3. 왜 `src/claude + src/codex`가 필요한가

새 기준선에서는 source를 아래처럼 분리해야 한다.

- Claude용 정식 자산은 `src/claude`
- Codex용 정식 자산은 `src/codex`

이렇게 해야 아래가 가능해진다.

- `agent/command`를 target별 공식 문서 기준으로 따로 구현
- Codex installer가 Claude source를 해석하지 않고도 설치 가능
- 기능별 pairing과 skip 상태를 source ownership으로 설명 가능
- 새 기능 추가 시 "Codex 대응 준비 여부"를 문서와 구조에서 바로 확인 가능

---

## 4. 자산별 현재 판단

| 자산 | 현재 상태 | 현재 한계 |
|------|------|------|
| `agent` | 사실상 Claude 전용 | Codex sibling 책임이 드러나지 않음 |
| `command` | 사실상 Claude 전용 | installer가 암묵 변환할 것처럼 보이기 쉬움 |
| `skill` | 일부 재사용 가능 | target ownership이 구조에서 보이지 않음 |
| `instruction rule` | Claude-origin guidance | Codex에서는 guidance 소비층으로만 설명돼야 함 |
| `exec-policy rule` | 별도 source 없음 | Codex native policy 계층 부재 |
| `hook` | Claude 중심 설계 | Codex sibling 여부를 명시적으로 나눠야 함 |

---

## 5. 이 문서가 고정하는 결론

- 현재 단일 `src` 구조는 target ownership을 충분히 설명하지 못한다.
- Claude `agents/commands`는 Codex installer가 직접 runtime 변환 대상으로 삼아서는 안 된다.
- `agent/command`는 source 단계에서 `src/claude`와 `src/codex`로 분리해 두는 편이 더 명확하다.
- installer는 변환기보다 target별 source reader가 되어야 한다.
- `instruction rule` 같은 guidance 자산은 당장 전부 이중화하지 않고, Claude-origin shared asset로 설명하는 편이 낫다.

