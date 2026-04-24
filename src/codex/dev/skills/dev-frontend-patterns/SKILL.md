<!-- kit-convert generated: 2026-04-24 -->
---
name: dev-frontend-patterns
description: 프론트엔드 UI 패턴과 상태 관리 기준. 실제 배치 경로는 구조 SSOT와 기능 바인딩을 따른다.
---

# Frontend Patterns

프론트엔드 구현은 일관된 UI 패턴과 상태 관리 규칙을 따르되, 컴포넌트와 훅의 실제 위치는 프로젝트 구조 SSOT와 기능 바인딩으로 결정한다.

## Stack Defaults

아래는 TypeScript 기반 기본 예시다. 실제 사용 여부는 `profile.json` 또는 구조 SSOT의 stack contract를 따른다.

| Category | Default |
|---|---|
| UI primitives | Radix UI |
| Component variant | CVA |
| Styling | Tailwind CSS |
| Global state | Jotai |
| Server state | SWR 또는 framework-native fetch |
| URL state | nuqs |
| Form | react-hook-form |
| Validation | Zod |
| Theme | next-themes |

## Component Rules

- 변형이 있는 UI는 CVA나 동등한 variant 시스템으로 정의한다.
- 공용 스타일 병합은 `cn()` 같은 단일 유틸로 통일한다.
- 범용 컴포넌트는 shared 영역에, 기능 전용 컴포넌트는 feature local에 둔다.
- shared와 local 판단은 기능 바인딩의 `Shared-vs-Local Rule`을 따른다.

## State Rules

| Scope | Preferred Pattern |
|---|---|
| Global app state | atom/store |
| Feature-local state | feature context 또는 feature-local hook |
| URL-coupled state | router or query-state adapter |
| Server state | server component, fetch layer, SWR |
| Form state | form library + schema validation |

## Provider Rules

- 전역 provider는 앱 shell이나 루트 layout에 둔다.
- feature 전용 provider는 해당 feature의 허용 경로 안에 둔다.
- provider 배치도 구조 SSOT와 바인딩에 맞춰야 한다.

## Styling Rules

- 토큰과 테마 값은 shared styling contract를 따른다.
- 기능 전용 스타일은 기능 허용 경로 안에서만 추가한다.
- 새 디자인 토큰이 필요하면 shared policy에 맞게 승격 여부를 결정한다.

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/skills/dev-frontend-patterns/SKILL.md`
