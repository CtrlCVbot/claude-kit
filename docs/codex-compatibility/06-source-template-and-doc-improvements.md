# Source Template And Doc Improvements

> `src/claude + src/codex` 구조를 실제로 운영하려면 source 작성 규칙, pairing 표기, template 방향을 어떻게 정리해야 하는지 설명하는 문서.

---

## 1. source 작성 규칙

새 구조에서 source 작성은 아래 순서를 따른다.

1. 기능 identity를 먼저 정한다.
2. 이 기능이 `agent`인지 `command`인지 `skill`인지 결정한다.
3. `src/claude` 자산과 `src/codex` sibling이 모두 필요한지 판단한다.
4. 필요한 경우 같은 도메인 아래 target별 source를 함께 준비한다.

이 규칙의 목적은 "Codex 대응은 나중에 installer가 해준다"는 흐름을 없애는 것이다.

---

## 2. pairing 표기 방식

문서 세트는 pairing 상태가 source 수준에서 드러나야 한다고 본다.

최소한 아래 정보가 필요하다.

- 기능 identity
- target
- counterpart path 또는 counterpart identity
- 상태

권장 상태 값:

- `paired`
- `codex-skip`
- `codex-native-only`

표현 방식은 후속 구현에서 정하되, 문서 기준으로는 per-asset metadata 또는 domain manifest 중 하나가 필요하다고 본다.

---

## 3. naming과 ownership 규칙

- 같은 기능은 Claude와 Codex에서 같은 도메인과 같은 기능 이름을 유지한다.
- Codex sibling은 file extension이 달라도 된다.
- ownership은 target별로 분리하되, semantic parity 판단은 기능 단위로 묶어 본다.

예를 들어 `dev-architect`라는 기능이 있다면, Claude와 Codex에서 형식은 달라도 같은 기능군으로 취급해야 한다.

---

## 4. template 방향

현재 `src/templates`는 우선 shared infra로 유지한다. 다만 문서상 검토 포인트는 아래다.

- target 공통 template인지
- Claude 전용 template인지
- Codex 전용 template인지

초기 원칙은 아래와 같다.

- 공통으로 유지 가능한 template은 `src/templates`에 둔다.
- target-specific 문법 차이가 큰 template은 후속 단계에서 분리 검토한다.
- `AGENTS.md`와 Codex-specific config template은 역할이 다르므로 같은 template로 설명하지 않는다.

---

## 5. 문서 개선 포인트

새 문서 세트는 아래 메시지를 일관되게 유지해야 한다.

- target-separated authoring이 기본 기준선이다.
- `agent/command`는 direct copy나 runtime reinterpretation 대상이 아니다.
- Codex sibling은 정식 source다.
- shared guidance와 target-specific source를 구분한다.
- installer는 해석기보다 source selector에 가깝다.

---

## 6. 이 문서가 고정하는 결론

- 새 기능 작성 규칙에는 pairing 판단이 반드시 포함된다.
- pairing 상태는 source 수준에서 드러나야 한다.
- template은 우선 shared로 두되, target-specific 차이가 크면 후속 분리 검토 대상이다.
- 문서와 source 작성 규칙은 같은 메시지를 반복해야 한다.

