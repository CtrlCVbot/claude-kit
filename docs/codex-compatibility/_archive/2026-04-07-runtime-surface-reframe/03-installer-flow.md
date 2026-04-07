# Installer 흐름

> Codex 호환 installer를 "경로 복사기"가 아니라 "runtime surface 생성기"로 설명하기 위한 기준 문서.

---

## 1. 기본 파이프라인

문서 기준 installer 흐름은 아래 네 단계로 고정한다.

```text
discover -> normalize -> validate -> emit
```

이 흐름은 Claude와 Codex를 서로 다른 예외 묶음으로 설명하지 않는다. 두 타깃은 같은 catalog를 읽고, 다른 runtime surface를 생성하는 emitter다.

---

## 2. 단계별 역할

| 단계 | 역할 |
|------|------|
| `discover` | `src`와 sidecar metadata에서 installable asset을 찾음 |
| `normalize` | source asset을 catalog 항목으로 정리하고 target surface를 계산 |
| `validate` | metadata 누락, unsupported direct copy, 충돌 가능성을 검토 |
| `emit` | Claude/Codex가 실제로 읽는 runtime surface를 생성 |

`emit` 단계의 핵심은 "어디에 복사했는가"보다 "Codex가 무엇을 읽을 수 있게 만들었는가"다.

---

## 3. Codex emitter가 생성해야 하는 surface

Codex 쪽 `emit`은 아래 4종을 기준으로 설명한다.

| surface | 의미 |
|------|------|
| `plugins/claude-kit/` | plugin package root |
| `.agents/plugins/marketplace.json` | plugin registration |
| `AGENTS.md` | instruction surface |
| `.codex/hooks.json` | hook runtime config |

`plugins/claude-kit/hooks.json`은 runtime surface가 아니다. 문서에서는 더 이상 이 경로를 Codex hook의 기본 런타임 위치처럼 설명하지 않는다.

---

## 4. catalog가 필요한 이유

legacy 설명은 설치기가 파일 경로, filename, 예외 리스트를 직접 기억하는 방식에 가깝다. 이 방식은 자산 수가 늘수록 Codex의 실제 runtime model과 문서가 어긋나기 쉽다.

catalog를 기준으로 설명하면 아래가 가능해진다.

- source asset과 target surface를 분리해 설명할 수 있다.
- `skill`의 direct-use와 `rule/hook/agent/command`의 transform 필요성을 같은 구조에서 다룰 수 있다.
- validation과 compatibility report를 `emit` 이전에 설계할 수 있다.

---

## 5. legacy hardcode가 drift를 만드는 지점

문서에서는 아래를 대표적인 drift 사인으로 본다.

- setup.js 안의 category별 하드코딩
- hook 호환 여부를 filename 기준으로 따로 들고 있는 구조
- rules를 별도 자산이 아니라 `AGENTS.md` 요약에 간접 반영하는 방식
- `agent`와 `command`를 Codex native runtime component처럼 설명하는 서술

이 문서의 목적은 legacy를 비난하는 것이 아니라, 왜 transform 중심 설명으로 넘어가야 하는지 기준선을 제공하는 데 있다.

---

## 6. Claude와 Codex의 관계

문서 기준 관계는 아래와 같다.

- 입력은 같다: `src` asset + metadata
- 해석의 기준은 같다: catalog
- 차이가 나는 곳은 `emit` 결과 surface다

즉 타깃 차이는 숨은 예외가 아니라 emitter 계약의 차이로 설명되어야 한다.

---

## 7. 구현 계획과의 연결

이 문서는 코드 변경 계획을 직접 담지 않지만, [05-implementation-plan.md](./05-implementation-plan.md)와 [06-rollout-plan.md](./06-rollout-plan.md)가 참조할 구조적 기준을 제공한다.
