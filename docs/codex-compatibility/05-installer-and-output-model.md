# Installer And Output Model

> Claude/Codex 설치기가 각각 어떤 source를 읽고, 어떤 output을 만들며, 무엇을 읽지 않아야 하는지 정리한 문서.

---

## 1. installer 책임 재정의

새 기준선에서 installer의 핵심 역할은 변환기보다 target별 source reader다.

- Claude install은 `src/claude`를 읽는다.
- Codex install은 `src/codex`를 읽는다.
- Codex install은 필요한 shared guidance만 `src/claude/core` 계층에서 참조한다.

즉 installer는 Claude `agents/commands`를 직접 해석해 Codex-native UX를 만드는 주체가 아니다.

---

## 2. Claude install 모델

Claude install의 기준은 단순하다.

- 입력: `src/claude/{core,dev,plan}`
- 출력: `.claude/*`
- ownership: Claude source가 직접 책임

Claude용 `agent/command`는 계속 Claude install이 소비한다.

---

## 3. Codex install 모델

Codex install의 기준은 아래로 고정한다.

- 입력의 우선순위는 `src/codex`
- 보조 입력으로만 `src/claude/core` shared guidance를 참조 가능
- `src/claude/dev/agents`와 `src/claude/dev/commands`는 직접 읽지 않음
- `src/claude/plan/agents`와 `src/claude/plan/commands`도 직접 읽지 않음

이 규칙은 "Codex output은 Codex source에서 나온다"는 ownership을 지키기 위한 것이다.

---

## 4. output별 source 책임

| output | 기본 source 책임 |
|------|------|
| Codex plugin package / skills | `src/codex/*/skills` |
| `AGENTS.md` | `src/claude/core`의 shared guidance + 필요 시 `src/codex/core` guidance |
| `.codex/agents/*.toml` | `src/codex/*/agents` |
| `.codex/hooks.json` | `src/codex/*/hooks` |
| `.codex/rules/*.rules` | `src/codex/core/rules` 또는 Codex exec-policy source |

여기서 중요한 점은 `AGENTS.md`만 guidance 성격상 shared 입력을 받을 수 있고, `agents/commands` 자체를 Claude source에서 가져오지 않는다는 것이다.

---

## 5. installer가 읽지 말아야 하는 것

Codex install에서는 아래 전제를 금지한다.

- Claude `agent` markdown을 읽어서 Codex subagent로 자동 컴파일
- Claude `command` markdown을 읽어서 Codex entry flow로 자동 재구성
- Claude `agents/commands`를 plugin 경로로 direct copy
- target-specific source 없이 installer 내부 규칙만으로 Codex UX 완성

이 문서 세트는 위 접근을 명시적으로 비권장으로 둔다.

---

## 6. report 책임

향후 installer/report에는 최소한 아래가 드러나야 한다.

- 어떤 Codex output이 어떤 `src/codex` 자산에서 왔는가
- 어떤 shared guidance가 `AGENTS.md` 생성에 사용되었는가
- 어떤 `agent/command`가 paired 상태였는가
- 어떤 자산이 `codex-skip`이었는가

즉 report도 "변환 성공 여부"보다 "source ownership 추적"을 우선해야 한다.

---

## 7. 이 문서가 고정하는 결론

- Claude install은 `src/claude`를 읽는다.
- Codex install은 `src/codex`를 읽는다.
- Codex install은 Claude `agents/commands`를 직접 runtime 변환 대상으로 삼지 않는다.
- Codex output의 source 책임은 `src/codex` 기준으로 설명되어야 한다.

