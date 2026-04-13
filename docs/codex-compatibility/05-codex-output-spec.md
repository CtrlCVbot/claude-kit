# Codex Output Spec

> conversion 결과로 생성될 `src/codex` authoring source의 최소 규격을 정의하는 문서

## 기본 원칙

- `src/codex`는 runtime artifact가 아니다.
- conversion output은 생성 후 사람이 수정할 수 있는 authoring source다.
- path와 file 형식은 Codex surface 기준으로 정의한다.

## 최소 출력 규격

| Claude kind | Codex output |
|-------------|--------------|
| `agent` | `src/codex/{domain}/agents/{identity}.toml` |
| write-capable `agent` | `src/codex/{domain}/agents/{identity}.toml` + `{identity}.contract.json` |
| `command` | `src/codex/{domain}/skills/{identity}/SKILL.md` |
| `skill` | `src/codex/{domain}/skills/{identity}/SKILL.md` |
| `hook` | `src/codex/{domain}/hooks/{identity}.js` + `{identity}.hook.json` |
| `instruction-rule` | 개별 file 생성 없음, `AGENTS.md` 합성 입력 |

## companion 의미

- `.contract.json`: write-capable subagent의 write boundary와 deliverable shape를 보강
- `.hook.json`: hook event, matcher, runtime note를 보강

## 이 문서에서 다루지 않는 것

- installer가 어떤 runtime artifact를 만드는지
- `.codex/agents/*.toml` 실제 최종 위치
- `.codex/hooks.json` 병합 방식

그 내용은 후속 handoff 문서로 넘긴다.
