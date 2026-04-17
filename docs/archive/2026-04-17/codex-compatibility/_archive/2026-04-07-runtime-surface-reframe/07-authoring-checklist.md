# 작성 체크리스트

> 새 asset을 추가하거나 수정할 때, 그 자산이 Codex의 어떤 runtime surface로 매핑되는지 먼저 확인하기 위한 체크리스트.

---

## 1. 기본 원칙

새 asset을 추가할 때는 "Claude에서 잘 동작하는가"만 보면 안 된다. 먼저 아래를 확인한다.

- 모든 installable asset은 Codex 처리 방식을 설명해야 한다.
- `skill` 외 자산은 direct copy보다 transform 필요 여부를 먼저 본다.
- `hook`, `rule`, `template`는 암묵 처리하지 않는다.
- Codex 미지원은 숨기지 않고 reason과 함께 기록한다.

---

## 2. 공통 체크

| 질문 | 확인 내용 |
|------|-----------|
| 자산 종류 | `agent`, `command`, `skill`, `hook`, `rule`, `template` 중 무엇인가 |
| 도메인 | `core`, `dev`, `plan` 중 어디에 속하는가 |
| targets | Claude, Codex 중 어디를 지원하는가 |
| target surface | Codex에서 `plugin-bundled skill`, `AGENTS.md`, `.codex/hooks.json`, `generate`, `skip` 중 어디로 가는가 |
| support level | `full`, `partial`, `none` 중 무엇인가 |
| 미지원 이유 | `partial` 또는 `none`이면 이유가 적혀 있는가 |
| 요약 설명 | 사람이 읽을 짧은 설명이 있는가 |

첫 질문은 항상 이것이다.

> 이 자산은 Codex의 어떤 runtime surface로 매핑되는가?

---

## 3. skill 추가 시 추가 확인

- plugin-bundled skill로 설명 가능한가
- Codex에서 직접 사용 가능한 기본 호환 단위인지 명시했는가
- slash command가 아니라 skill invocation 단위라는 점이 혼동되지 않는가

---

## 4. hook 추가 시 추가 확인

- `hooks.phase`와 `hooks.matcher`를 명시했는가
- `.codex/hooks.json`으로 표현 가능한가
- 실행 스크립트 경로와 runtime config가 함께 설명되는가
- 플랫폼 제한, 특히 Windows 제한을 확인했는가
- 호환되지 않는 경우 skip reason이 적혀 있는가

---

## 5. rule 추가 시 추가 확인

- Codex에서 어떤 summary로 반영되는지 설명 가능한가
- `AGENTS.md` 문맥에서 어떤 메시지로 요약될지 적을 수 있는가
- summary 대신 `skip`이면 이유가 적혀 있는가

---

## 6. agent / command 추가 시 추가 확인

- direct copy를 기본값으로 가정하지 않았는가
- `skill` 또는 `AGENTS.md` 기반으로 변환할 수 있는가
- 변환 규칙이 없다면 `skip` 정책과 이유가 명시됐는가
- custom slash command를 현재 Codex 호환 목표로 착각하지 않았는가

---

## 7. template 추가 시 추가 확인

- plugin, report, context 중 어떤 산출물을 생성하는지 적혀 있는가
- 직접 실행 자산인지, 내부 생성 자산인지 구분되는가
- runtime surface와의 관계가 문서상 설명되는가

---

## 8. 마지막 확인

- 문서에서 쓰는 용어가 `plugin package root`, `plugin registration`, `instruction surface`, `hook runtime config`와 충돌하지 않는가
- 새 asset이 들어와도 installer가 어떤 transform을 해야 하는지 설명 가능한가
- 작성자가 이 asset의 Codex 처리 방식을 한 문장으로 설명할 수 있는가
