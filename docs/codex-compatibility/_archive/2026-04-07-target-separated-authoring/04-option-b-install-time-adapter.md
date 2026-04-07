# Option B: 설치 시 변환

> Claude-first `src` 자산을 유지하고, 설치기에서 Codex 위치와 형식으로 변환하는 방안.

---

## 1. 핵심 아이디어

이 옵션은 source authoring은 그대로 두고, installer가 Codex 대응을 전부 담당하게 한다.

즉 기본 가정은 아래와 같다.

- `src`는 Claude-first SSOT다.
- Codex 대응은 source가 아니라 installer가 해석한다.
- source 자산은 최대한 중복 없이 유지한다.

---

## 2. 장점

- 기존 `src` 자산 재사용성이 가장 높다.
- 작성자 입장에서 새 기능 추가 부담이 가장 적다.
- skill과 instruction rule처럼 구조가 비교적 단순한 자산은 자동 변환이 잘 맞는다.
- 저장소가 두 벌의 source tree로 갈라지지 않는다.

---

## 3. 단점

- installer가 source semantics를 너무 많이 알아야 한다.
- `command`와 `agent`처럼 Claude 전용 개념이 강한 자산은 변환 품질이 낮아질 수 있다.
- 변환이 복잡해질수록 문서와 코드의 암묵 규칙이 다시 늘어난다.
- "설치만 해보면 되겠지" 식의 숨은 규칙이 생겨 drift가 커질 수 있다.
- prose instruction과 exec-policy를 자동 변환으로 묶으려 하면 보안 의미가 왜곡될 수 있다.

---

## 4. 자산 종류별 적용 모습

| 자산 | 이 옵션에서의 기본 처리 |
|------|------|
| `skill` | plugin-bundled skill로 직접 재사용 |
| `instruction rule` | `AGENTS.md` summary로 자동 변환 |
| `exec-policy rule` | explicit asset이 있을 때만 `.codex/rules/*.rules`로 emit |
| `hook` | `.codex/hooks.json`으로 자동 변환 |
| `command` | skill 또는 documented entrypoint로 변환 시도 |
| `agent` | skill, `AGENTS.md` guidance, custom subagent로 변환 시도 |

문제는 마지막 세 항목이다. `hook`, `command`, `agent`는 변환 규칙이 조금만 어긋나도 Codex 사용 경험이 어색해진다. `exec-policy rule`은 더 보수적으로 다뤄야 한다.

---

## 5. rules compile 관점

이 옵션에서 가장 조심해야 할 부분은 rules다.

- `src/core/rules/*.md`는 작업 지침이므로 `AGENTS.md`로 변환하는 것은 자연스럽다.
- 하지만 이 markdown을 `.codex/rules/*.rules`로 자동 컴파일하는 것은 권장하기 어렵다.
- 공식 exec-policy rules는 `prefix_rule`, `allow/prompt/forbidden`, most restrictive wins, shell wrapper 처리 같은 보안 의미를 가진다.
- prose instruction은 승인 정책으로 바로 환원되지 않는다.
- 따라서 installer는 instruction rule을 `AGENTS.md`로 보내되, `.rules`는 explicit asset 또는 companion asset이 있을 때만 다루는 편이 안전하다.

이 점을 무시하면 "작업 지침"과 "샌드박스 밖 실행 정책"이 섞이게 된다.

---

## 6. subagent compile 관점

이 옵션은 이론상 아래 같은 변환을 포함할 수 있다.

```text
Claude agent markdown -> custom subagent TOML + companion instructions
```

하지만 이 변환은 자동화 난이도가 높다.

- `developer_instructions`를 source markdown에서 안정적으로 추출하기 어렵다.
- `model`, `sandbox_mode`, `model_reasoning_effort`를 자동 추론하면 잘못된 기본값이 들어갈 위험이 있다.
- write-heavy agent를 subagent로 자동 변환하면 병렬 충돌이나 권한 문제가 커질 수 있다.
- subagents는 명시적 trigger가 필요한데, 기존 agent markdown이 그 trigger 방식을 항상 설명하지는 않는다.

즉 installer가 subagent surface까지 완전히 자동 생성하는 방식은 일부 asset에는 유효해도, 전면 기본안으로는 위험하다.

---

## 7. 평가표

| 평가 축 | 평가 | 메모 |
|------|------|------|
| Codex 공식 가이드 적합성 | 중간 | 변환 품질에 따라 달라짐 |
| 기존 `src` 자산 재사용성 | 높음 | source 중복 최소화 가능 |
| 자산 중복/드리프트 위험 | 중간 | source 중복은 적지만 installer 암묵 규칙이 늘어남 |
| 설치기 복잡도 | 높음 | 분류, 변환, 예외 처리 부담 큼 |
| 작성자 부담 | 낮음 | 새 source를 많이 추가하지 않아도 됨 |
| Codex 사용자 경험 | 중간 | skill은 좋지만 command/agent는 불안정 |
| 향후 유지보수성 | 중간 | installer가 커질수록 난이도 상승 |
| subagent 적합성 | 중간 | 일부 agent는 가능하지만 전면 자동화는 위험 |
| 병렬/충돌 위험 | 중간-높음 | write-heavy agent 자동 변환 시 특히 큼 |
| 설정 복잡도 | 높음 | TOML, parent inheritance, config 병합 부담 존재 |
| 승인 정책 적합성 | 낮음-중간 | `.rules`를 자동 추론하면 의미 왜곡 위험 |

---

## 8. 언제 적합한가

이 옵션은 아래 자산에 특히 잘 맞는다.

- 이미 Codex skill 구조와 유사한 `skill`
- instruction surface로 바꾸기 쉬운 `instruction rule`
- 공식 hook surface 안에 들어오는 일부 `hook`
- narrow and opinionated한 read-heavy `agent`

반대로 아래 자산에는 단독 기본안으로 쓰기 어렵다.

- Claude slash command 의미가 강한 `command`
- broad orchestration이나 shared write가 많은 `agent`
- 보안 의미를 갖는 `exec-policy rule`

즉 설치 시 변환만으로 모든 문제를 해결하려 하면 결국 installer가 너무 많은 의미를 떠맡게 된다.
