# 하이브리드 모델

> Codex 호환을 `authoring metadata + transform catalog + runtime surfaces` 조합으로 설명하는 기준 모델.

---

## 1. 모델 요약

| 층 | 역할 | 설명 |
|----|------|------|
| Authoring | 선언 | 자산 작성자가 sidecar metadata로 Codex 처리 책임을 명시 |
| Transform layer | 변환 | catalog pipeline이 source asset을 Codex runtime surface로 매핑 |
| Quality gate | 검증 | `warn/strict`와 parity verification으로 drift를 차단 |

이 모델은 plugin 하나만으로 호환이 끝난다고 보지 않는다. Codex 호환은 plugin package, `AGENTS.md`, `.codex/hooks.json`, compatibility report까지 포함하는 다층 구조다.

---

## 2. 구조 흐름

```text
source asset
  -> sidecar metadata
  -> discover
  -> normalize catalog
  -> validate
  -> emit runtime surfaces
  -> compatibility report
  -> warn/strict gate
```

여기서 `emit runtime surfaces`는 단순 파일 복사가 아니라 아래 surface를 생성하는 단계다.

- `plugins/claude-kit/` plugin package root
- `.agents/plugins/marketplace.json` plugin registration
- `AGENTS.md` instruction surface
- `.codex/hooks.json` hook runtime config

---

## 3. 왜 이 모델을 선택하는가

기존 설명은 `claude-kit` 내부 분류를 그대로 Codex 런타임에 투영하는 경향이 있다. 이 방식은 문서와 실제 runtime이 어긋나기 쉽다.

대표적인 문제는 아래와 같다.

- `plugins/claude-kit/`가 보편적인 실행 루트처럼 읽힌다.
- hook 설명이 plugin 내부 `hooks.json` 중심으로 고정돼 있다.
- `agent`와 `command`가 Codex에서 그대로 실행 가능한 것처럼 보인다.
- 새 자산이 들어와도 어떤 surface로 변환되어야 하는지 늦게 드러난다.

하이브리드 모델은 이 문제를 아래처럼 분리해 해결한다.

- Authoring은 "이 자산이 Codex에서 어떤 surface로 가야 하는가"를 먼저 적게 한다.
- Transform layer는 "직복사가 아니라 어떤 재표현이 필요한가"를 판단한다.
- Quality gate는 "지원, 변환, skip 판단이 누락되지 않았는가"를 검증한다.

---

## 4. 설계 원칙

- 모든 installable asset은 Codex 처리 방식을 설명해야 한다.
- `skill`만 Codex의 직접 사용 가능한 기본 호환 단위로 본다.
- `rule`, `hook`, `agent`, `command`는 명시적 transform 또는 `skip`이 필요하다.
- Codex 미지원은 허용할 수 있지만, reason 없는 미지원은 허용하지 않는다.
- 소비자 설치 안정성과 저장소 내부 품질 게이트는 분리한다.

---

## 5. 기대 효과

- 문서가 Codex 공식 runtime surface와 같은 언어를 쓰게 된다.
- installer 설명이 "복사 규칙"이 아니라 "surface 생성 계약"으로 바뀐다.
- `skill/rule/hook` 우선 호환 전략과 `agent/command` 재설계 필요성이 문서에서 분리된다.
- 이후 구현 단계에서도 plugin, registration, instruction, hook config를 한 체계로 설명할 수 있다.
