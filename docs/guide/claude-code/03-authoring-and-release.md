# Authoring and Release

> Audience: 작성자, maintainer
> Related: [../sync/02-maintenance-workflow.md](../sync/02-maintenance-workflow.md), [../../30-reference/08-cli-scripts.md](../../30-reference/08-cli-scripts.md)

이 문서는 기존 development setup, component 추가, domain authoring, release checklist를 하나의 authoring lifecycle로 묶습니다.

## authoring lifecycle

| 단계 | 핵심 질문 |
|---|---|
| setup | 저장소와 toolchain이 준비되었는가 |
| add component | command, agent, skill, hook 중 무엇을 추가하는가 |
| domain authoring | 어느 domain에 넣고 어떤 registry를 갱신해야 하는가 |
| quality gate | 문서, registry, artifact drift가 없는가 |
| release | version, tag, checklist가 준비되었는가 |

## 최소 체크리스트

- source tree에서 수정하고 있는가
- registry와 metadata가 같이 갱신되었는가
- `check:docs`, pairing/drift 관련 검증을 확인했는가
- release 기준이 충족되었는가

sync나 generated output 경계가 얽히면 [../sync/02-maintenance-workflow.md](../sync/02-maintenance-workflow.md)를 먼저 봅니다.