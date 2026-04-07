# 롤아웃 계획

> 문서 기준을 실제 저장소 적용 순서로 연결하는 마이그레이션 계획.

---

## 1. 단계별 순서

| 단계 | 목표 | 이유 |
|------|------|------|
| 1 | 문서 기준 재정의 | Codex 공식 runtime과 어긋나는 설명을 먼저 정리하기 위해 |
| 2 | metadata 용어와 surface 용어 통일 | 작성자와 구현자가 같은 언어를 쓰게 하기 위해 |
| 3 | `skill/rule/hook` 매핑 우선 정리 | direct-use와 transform의 핵심 경계를 먼저 고정하기 위해 |
| 4 | `agent/command`의 transform-or-skip 정책 도입 | unsupported direct copy를 제거하기 위해 |
| 5 | installer/검증 계획 정합화 | 실제 구현 전에 surface emitter 모델을 합의하기 위해 |

---

## 2. 먼저 정리할 자산

문서 기준 우선순위는 아래와 같다.

1. `skill`
2. `rule`
3. `hook`
4. `agent`
5. `command`
6. `template`

우선순위의 기준은 "Codex에서 직접 사용할 수 있는가"와 "공식 runtime surface가 분명한가"다.

- `skill`은 direct-use 기준을 잡기 가장 쉽다.
- `rule`은 `AGENTS.md`로의 변환 계약을 고정해야 한다.
- `hook`는 `.codex/hooks.json`과 플랫폼 제한을 함께 설명해야 한다.
- `agent`와 `command`는 마지막에 transform-or-skip 정책을 잠근다.

---

## 3. legacy bridge를 두는 이유

문서 기준으로는 최종 모델을 먼저 고정하더라도, 실제 구현에서는 legacy 구조가 한동안 공존할 수 있다. 따라서 rollout 계획에는 아래 메시지를 함께 둔다.

- 최종 모델은 `source asset -> transform layer -> runtime surface`다.
- 구현 과정에서는 legacy bridge가 잠시 존재할 수 있다.
- 다만 문서상 기준은 먼저 official Codex runtime model로 고정한다.

---

## 4. Windows hooks 정책

Windows hooks는 공식 지원이 복귀하기 전까지 아래처럼 취급한다.

- 설계 대상이다.
- 문서에는 제한 사항을 명시한다.
- 기본 활성화 대상으로 설명하지 않는다.
- parity 기준에서도 무조건 full support 전제로 다루지 않는다.

---

## 5. 완료 판단 기준

아래 조건이 만족되면 문서 기준 rollout이 끝난 것으로 본다.

- 새 문서 세트 8개가 같은 runtime surface 용어를 사용한다.
- `hooks.json` 언급이 `.codex/hooks.json` 기준으로 정렬된다.
- `agent`와 `command`를 direct copy로 설명하는 문장이 없다.
- 작성자가 새 asset의 target surface를 체크리스트로 판단할 수 있다.

---

## 6. 후속 구현과의 연결

이 문서는 세부 구현을 담지 않는다. 대신 [05-implementation-plan.md](./05-implementation-plan.md)과 함께, 어떤 순서로 Codex 호환 구조를 구현해야 하는지 팀 합의의 기준선을 제공한다.
