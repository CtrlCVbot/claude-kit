# 구현 단계 계획

> 문서 기준선을 실제 구현 준비 단계로 연결하기 위한 계획 문서.

---

## 1. 목적

이 문서는 곧바로 파일을 복사하는 installer를 만들기 위한 계획이 아니라, source asset을 Codex runtime surface로 변환하는 `transform installer`를 준비하기 위한 계획이다.

핵심은 아래 두 질문에 답하는 것이다.

- 어떤 자산을 우선 direct-use 또는 transform 대상으로 정리할 것인가
- 어떤 자산은 명시적으로 `skip` 정책을 세울 것인가

---

## 2. 1단계: 문서 기준 재정렬

- `docs/codex-compatibility/`를 활성 SSOT로 고정한다.
- `plugins/claude-kit/`, `AGENTS.md`, `.codex/hooks.json`, compatibility report를 Codex runtime surface 기준으로 다시 설명한다.
- `agent`와 `command`의 direct copy 가정을 문서에서 제거한다.

완료 기준:

- 설명 문서 `00`~`04`가 같은 용어와 같은 runtime model을 사용한다.

---

## 3. 2단계: metadata 계약 정비

- sidecar metadata가 source asset의 Codex 처리 방식을 명시하도록 문서 계약을 고정한다.
- `codex.emitMode`는 `plugin-skill`, `agents-md`, `codex-hook-config`, `generate`, `skip` 기준으로 설명한다.
- `skill/rule/hook`은 우선 지원 대상으로, `agent/command`는 transform 또는 `skip` 정책 대상으로 분리한다.

완료 기준:

- 문서만 읽어도 새 asset이 direct-use, transform, skip 중 어디에 속하는지 판단할 수 있다.

---

## 4. 3단계: transform installer 설계

- 설치기 흐름을 `discover -> normalize -> validate -> emit`로 유지하되, `emit`의 의미를 runtime surface 생성으로 명확히 한다.
- Codex emitter는 아래 산출물 생성기로 정의한다.
  - plugin package root
  - plugin registration
  - instruction surface
  - hook runtime config
- legacy hardcode, hook filter, rule summary의 drift 포인트를 runtime mismatch 문제로 다시 정리한다.

완료 기준:

- 구현자가 setup.js 분리 방향을 "복사기"가 아니라 "surface emitter"로 이해할 수 있다.

---

## 5. 4단계: parity gate 설계

- `warn`과 `strict`를 소비자 설치와 저장소 품질 게이트로 분리해 설명한다.
- parity verification은 metadata 누락, unsupported direct copy, skip reason 누락, surface 충돌을 검증하는 단계로 정의한다.
- compatibility report는 emitted/skipped/warnings를 남기는 결과 문서로 설명한다.

완료 기준:

- parity verification이 무엇을 실패로 보고, 무엇을 warning으로 남기는지 문서화된다.

---

## 6. 우선순위 원칙

- 먼저 정리할 대상은 `skill`, `rule`, `hook`이다.
- `agent`와 `command`는 explicit transform 정책이 없으면 direct copy하지 않는다.
- Windows hooks는 공식 지원 복귀 전까지 설계 대상이되 기본 활성화 대상은 아니다.

---

## 7. 구현 준비 완료 조건

- 기능 설명 문서와 계획 문서가 같은 runtime surface 용어를 사용한다.
- 문서 세트만으로도 source asset, transform layer, runtime surface, compatibility report의 관계가 일관되게 이해된다.
- 이후 코딩 단계에서는 Codex 공식 runtime과 어긋나는 전제를 다시 가져오지 않아도 된다.
