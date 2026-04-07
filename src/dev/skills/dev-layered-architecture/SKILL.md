---
name: dev-layered-architecture
description: 프로젝트 구조 SSOT를 코드 경계 규칙으로 해석한다. hexagonal, clean, service-module, minimal-layered를 지원한다.
---

# Dev Layered Architecture

이 스킬은 특정 패턴을 강제로 주입하지 않는다. 먼저 저장소의 현재 구조와 `.plans/project/00-dev-architecture.md`를 읽고, 거기에 적힌 레이어 계약을 코드 경계 규칙으로 변환한다.

## Required Inputs

- `.plans/project/00-dev-architecture.md`
- `.plans/features/active/{slug}/00-context/06-architecture-binding.md`

## Decision Model

구조 판단은 아래 네 축으로 나눈다.

| Axis | Options |
|---|---|
| Workspace Topology | monorepo, single-app, multi-service |
| Structure Mode | route-scoped, feature-scoped, hybrid, type-based |
| Layer Style | hexagonal, clean, service-module, minimal-layered |
| Stack Contract | language, framework, runtime, test, lint, db |

## Core Rule

기존 저장소 구조가 이미 일관되게 존재하면 그 구조를 채택한다. 새 구조 추천은 구조가 비어 있거나 충돌이 심할 때만 한다.

## Default Recommendation

구조가 비어 있고 TypeScript 중심 프로젝트라면 다음 조합을 기본 추천으로 둔다.

- Workspace: monorepo
- Structure Mode: route-scoped
- Layer Style: hexagonal
- Stack Contract: Next.js + TypeScript + Vitest

## Layer Mapping

레이어 이름과 위치는 구조 SSOT가 정한다. 아래는 기본 예시일 뿐 고정 경로가 아니다.

| Layer | Default Responsibility |
|---|---|
| Presentation | route entry, controller, UI assembly |
| Application | use case, orchestration, transaction boundary |
| Domain | entity, policy, invariant, domain service |
| Ports | external dependency contract |
| Infrastructure | repository, gateway, adapter, framework wiring |

## Dependency Direction

기본 방향은 아래와 같다.

```text
Presentation -> Application -> Domain
Infrastructure -> Ports -> Application/Domain
```

다만 구조 SSOT에 다른 규칙이 명시되어 있으면 그 규칙을 우선한다.

## Structure Mode Guidance

### route-scoped

- 기능 진입점은 라우트 근처에 둔다.
- 공유 가능한 코드는 packages 또는 shared 영역으로 올린다.
- 기능별 허용 경로는 바인딩 문서에 구체 경로로 적는다.

### feature-scoped

- 기능 단위 디렉터리에 presentation, application, domain, infrastructure를 묶는다.
- 라우트는 feature entry를 호출하는 얇은 셸로 유지한다.

### hybrid

- 라우트 진입점과 기능 모듈을 함께 사용한다.
- 화면 진입은 route에, 핵심 로직과 재사용 코드는 feature module이나 shared package에 둔다.

### type-based

- `components`, `hooks`, `lib`, `services` 같은 타입별 폴더를 유지한다.
- 대신 기능별 네임스페이스와 바인딩 경계가 반드시 있어야 한다.

## Rules

- 하드코딩된 디렉터리 예시보다 기능 바인딩의 실제 경로가 우선이다.
- 한 기능의 내부 구현이 다른 기능의 내부 구현을 직접 가져오지 않도록 한다.
- 레이어 규칙을 어기는 우회 의존성이 필요하면 먼저 구조 SSOT에 근거를 남긴다.
