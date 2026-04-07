# Codex 호환 문서 개요

> `docs/codex-compatibility/`를 `claude-kit`의 Codex 호환 활성 SSOT로 다시 고정하는 진입 문서.

---

## 1. 이 문서 세트의 목적

이 문서 세트는 `claude-kit`의 Codex 호환을 `claude-kit` 내부 분류가 아니라, Codex가 실제로 읽는 runtime surface 기준으로 설명한다.

이 폴더에서 답하려는 질문은 아래와 같다.

- 어떤 source asset이 Codex에서 직접 사용 가능한가
- 어떤 자산은 변환이 필요하고, 어떤 자산은 skip되어야 하는가
- installer는 무엇을 복사하는 대신 어떤 runtime surface를 생성해야 하는가
- Codex 호환성은 어떤 용어와 보고 체계로 설명되어야 하는가

이 문서 세트는 현재 시점의 기준 문서이며, `README`와 `docs/guide/*`는 후속 동기화 대상으로 본다.

---

## 2. 현재 문제 정의

현재 설명의 가장 큰 문제는 단순한 하드코딩 drift만이 아니다. 일부 문서가 `plugins/claude-kit/`를 Codex의 보편적인 실행 루트처럼 설명하고, hooks와 agents/commands의 런타임 위치를 Codex 공식 모델과 다르게 전제하고 있다는 점도 함께 수정해야 한다.

이 문서 세트는 아래 세 가지 교정점을 기준선으로 삼는다.

- `plugins/claude-kit/`는 **plugin package root**다.
- hooks의 런타임 기준 위치는 **`.codex/hooks.json`** 이다.
- `agent`와 `command`는 Codex에서 **1:1 네이티브 실행 단위가 아니라 변환 또는 skip 대상**이다.

---

## 3. 핵심 모델

Codex 호환은 아래 세 층으로 설명한다.

| 층 | 역할 |
|------|------|
| `source assets` | `agent`, `command`, `skill`, `hook`, `rule`, `template` 같은 원본 자산 |
| `transform layer` | sidecar metadata와 catalog pipeline으로 Codex 처리 방식을 결정하는 계층 |
| `runtime surfaces` | Codex가 실제로 읽는 plugin package, registration, instruction, hook config, report |

즉 목표는 "Claude 구조를 Codex 경로로 복사"가 아니라, "원본 자산을 Codex가 이해하는 surface로 재표현"하는 것이다.

---

## 4. 핵심 용어

| 용어 | 의미 |
|------|------|
| `plugin package root` | `plugins/claude-kit/` 아래의 repo-local plugin 번들 |
| `plugin registration` | `.agents/plugins/marketplace.json`에 플러그인을 등록하는 단계 |
| `instruction surface` | `AGENTS.md`에 규칙/지침을 요약해 반영하는 surface |
| `hook runtime config` | `.codex/hooks.json`에 hook 실행 구성을 기록하는 surface |
| `plugin-bundled skill` | Codex에서 직접 사용할 수 있는 기본 호환 단위 |
| `compatibility report` | emitted/skipped/warnings를 남기는 설치 결과 보고 |

---

## 5. 읽는 순서

설명 문서:

1. [01-hybrid-model.md](./01-hybrid-model.md)
2. [02-feature-contracts.md](./02-feature-contracts.md)
3. [03-installer-flow.md](./03-installer-flow.md)
4. [04-target-behavior.md](./04-target-behavior.md)

실행 계획 및 운영 문서:

1. [05-implementation-plan.md](./05-implementation-plan.md)
2. [06-rollout-plan.md](./06-rollout-plan.md)
3. [07-authoring-checklist.md](./07-authoring-checklist.md)

---

## 6. 근거 문서

이 활성 문서 세트는 아래 아카이브 문서를 핵심 근거로 재구성했다.

- [05-recommended-hybrid-model.md](./_archive/2026-04-hybrid-redesign/05-recommended-hybrid-model.md)
- [06-rollout-plan.md](./_archive/2026-04-hybrid-redesign/06-rollout-plan.md)
- [07-authoring-checklist.md](./_archive/2026-04-hybrid-redesign/07-authoring-checklist.md)

옵션 비교 문서는 역사적 배경으로만 남기고, 이 폴더의 활성 문서에서는 최종 선택된 모델만 다룬다.

---

## 7. 기준 원칙

- Codex 호환 설명은 `path copy`보다 `runtime surface 생성` 기준으로 쓴다.
- `skill`만 Codex의 직접 사용 가능한 기본 호환 단위로 설명한다.
- `rule`, `hook`, `agent`, `command`는 각기 다른 변환 계약을 가져야 한다.
- Codex 미지원은 숨기지 않고, `compatibility report`에 reason과 함께 남긴다.
