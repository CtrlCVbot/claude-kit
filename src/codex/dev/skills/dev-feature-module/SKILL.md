<!-- kit-convert generated: 2026-04-24 -->
---
name: dev-feature-module
description: 기능 구현 단위를 현재 구조 계약에 맞게 배치한다. 고정 디렉터리를 가정하지 않고 기능 바인딩을 따른다.
---

# Dev Feature Module

기능 패키지는 특정 폴더 구조를 강제하지 않는다. 먼저 프로젝트 구조 SSOT와 기능 구조 바인딩을 읽고, 그 기능이 어디에 살아야 하는지부터 고정한다.

## Required Inputs

- `.plans/project/00-dev-architecture.md`
- `.plans/features/active/{slug}/00-context/06-architecture-binding.md`

## Non-Negotiable Rule

허용된 구현 경로는 기능 바인딩의 `Allowed Target Paths`가 결정한다. 바인딩 밖 경로에 파일을 만들거나 수정하려면 먼저 문서를 갱신해야 한다.

## Structure Modes

| Mode | Typical Entry | Typical Local Area | Typical Shared Area |
|---|---|---|---|
| route-scoped | `app/.../page.tsx`, route loader | route segment 하위 폴더 | `packages/*`, `shared/*` |
| feature-scoped | `features/{feature}` | feature 내부 레이어 폴더 | `packages/*`, `shared/*` |
| hybrid | route + feature module | route shell + feature core | `packages/*` |
| type-based | `components`, `hooks`, `lib`, `services` | 기능 네임스페이스 폴더 | 공용 타입별 폴더 |

위 표는 예시다. 실제 경로는 항상 바인딩 문서를 따른다.

## Placement Rules

### Local First

- 한 기능에서만 쓰는 UI, 훅, 서비스, 어댑터는 feature local로 둔다.
- 이름만 일반적이고 실제로는 기능 전용인 코드는 shared로 올리지 않는다.

### Shared by Rule

- 두 곳 이상에서 재사용되고 기능 맥락이 사라질 때만 shared 후보로 본다.
- shared 승격 위치는 구조 SSOT의 shared policy를 따른다.

### Test Placement

- 테스트 경로도 바인딩 문서에 적힌 target path와 같은 모드로 맞춘다.
- route-scoped면 route 근처 테스트를, feature-scoped면 feature 내부 테스트를 우선한다.

## Isolation Rules

- 다른 feature의 내부 구현을 직접 import하지 않는다.
- 다른 feature와 연결해야 하면 shared contract, public entry, port, facade 중 구조 SSOT에 허용된 방식만 사용한다.
- 새 공유 코드가 필요하면 기능 바인딩의 `Shared-vs-Local Rule`과 충돌하지 않는지 먼저 확인한다.

## Example Binding Questions

- 이 기능의 실제 진입 경로는 어디인가
- 이 기능이 수정할 수 있는 코드 경로는 어디까지인가
- 테스트는 어느 트리 안에 둬야 하는가
- shared 승격 기준은 무엇인가

답은 추측하지 말고 바인딩 문서에서 가져온다.

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/skills/dev-feature-module/SKILL.md`
