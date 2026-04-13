# Source Layout And Ownership

> `src/claude`와 `src/codex`를 어떤 구조와 책임으로 운영할지 정리한 문서.

---

## 1. 목표 구조

새 source 구조는 아래를 기본으로 한다.

```text
src/
  claude/
    core/
    dev/
    plan/
  codex/
    core/
    dev/
    plan/
  templates/
```

핵심은 두 target이 같은 도메인 구조를 유지한다는 점이다. 이렇게 해야 기능 identity는 유지하면서도 target별 구현 형식을 분리할 수 있다.

---

## 2. 각 tree의 역할

| tree | 역할 |
|------|------|
| `src/claude` | Claude 타깃의 정식 authoring source |
| `src/codex` | Codex 타깃의 정식 authoring source |
| `src/templates` | target 간 공유 가능한 template과 infra |

`src/codex`는 설치 결과물을 넣는 폴더가 아니라, Codex-native source를 작성하는 폴더다.

---

## 3. 도메인 ownership

### `src/claude/{core,dev,plan}`

- 현재 `src` 아래에 있던 Claude용 자산의 정식 위치
- Claude 문법, Claude workflow, Claude 설치 결과물 기준으로 작성
- `agent/command`의 원본 authoring을 계속 담당

### `src/codex/{core,dev,plan}`

- Codex 대응 자산의 정식 위치
- Codex 공식 surface 기준으로 authoring
- `skill`, `AGENTS.md` guidance input, `.codex/agents/*.toml`, `.codex/hooks.json`, `.codex/rules/*.rules`에 필요한 source를 담음

### `src/templates`

- 당장은 shared infra로 유지
- target-specific template 차이가 커질 때만 후속 분리 검토

---

## 4. 기능 identity와 sibling 개념

새 구조에서는 같은 기능을 target별 sibling으로 본다.

예시:

- Claude: `src/claude/dev/agents/dev-architect.md`
- Codex: `src/codex/dev/agents/dev-architect.*`

중요한 점은 "같은 기능 identity"와 "같은 파일 형식"이 같지 않다는 것이다.

- 같은 기능 이름과 도메인을 유지해야 한다.
- 하지만 Codex sibling은 `.md`가 아닐 수도 있다.
- Codex sibling은 target surface에 맞는 형식을 가질 수 있다.

즉 sibling의 기준은 file extension이 아니라 기능 identity다.

---

## 5. ownership 규칙

- Claude `agent/command`를 추가한 사람이 Codex 대응 필요 여부도 함께 결정해야 한다.
- Codex sibling이 필요한 기능은 같은 기능 identity로 `src/codex`에 대응 자산을 둔다.
- Codex 대응이 없으면 `codex-skip`가 문서나 pairing metadata에 남아야 한다.
- shared 자산으로 남기는 경우도 "왜 shared인지"가 설명 가능해야 한다.

이 규칙의 목적은 "나중에 installer가 알아서 해결하겠지"라는 상태를 없애는 것이다.

---

## 6. 이 문서가 고정하는 결론

- `src/claude`와 `src/codex`는 병렬 source tree다.
- `agent/command`는 target별 ownership이 분명해야 한다.
- Codex sibling은 같은 도메인과 기능 identity를 유지하되, 형식은 Codex surface에 맞게 달라도 된다.
- `src/codex`는 보조 산출물 폴더가 아니라 정식 authoring 영역이다.

