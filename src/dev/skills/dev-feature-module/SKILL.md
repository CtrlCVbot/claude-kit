---
name: dev-feature-module
description: Feature Module 구조. Feature 디렉토리 레이아웃, 상태 격리, 생성 기준 참조.
---

# Feature Module

Feature Module 구조와 격리 규칙.

## 디렉토리 구조

```
apps/{app}/features/{feature-name}/
├── presentation/          ← UI 컴포넌트 (CVA + cn() 패턴)
│   ├── {component}.tsx
│   └── {component}.test.tsx
├── infrastructure/        ← Server Action, Repository 호출
│   ├── actions.ts
│   └── actions.test.ts
├── hooks/                 ← Feature 전용 훅 (Context 기반)
│   └── use-{name}.ts
├── __tests__/             ← 통합 테스트 (해당 시)
└── CLAUDE.md              ← Feature 컨텍스트 (~10줄)
```

## Feature 생성 기준

| 조건 | Feature Module | 직접 page.tsx 렌더링 |
|------|---------------|---------------------|
| 비즈니스 로직 있음 | O | - |
| Server Action 있음 | O | - |
| 3개+ 컴포넌트 조합 | O | - |
| 단순 정보 표시 | - | O |
| 설정/about 페이지 | - | O |

> 모든 페이지에 Feature를 강제하지 않는다. 복잡도가 낮은 페이지는 page.tsx에서 직접 components/를 사용.

## 격리 규칙

| 방향 | 허용 | 금지 |
|------|------|------|
| Feature → packages/ | O | - |
| Feature → components/, hooks/, lib/ | O | - |
| Feature → Feature | - | X (ESLint 강제) |
| pages/ → Feature | O | - |

> ESLint `no-restricted-imports`로 Feature 간 import를 정적 분석 수준에서 차단.

## 앱 레벨 공유 디렉토리

Feature에 속하지 않는 앱 레벨 공유 코드:

| 디렉토리 | 용도 | 예시 |
|---------|------|------|
| `components/` | 공유 UI 컴포넌트 | 레이아웃, 내비게이션 |
| `components/ui/` | shadcn 프리미티브 | Button, Input, Badge |
| `hooks/` | 공유 훅 (Jotai atom) | useConfig, useMediaQuery |
| `lib/` | 유틸리티 | cn(), config |
| `styles/` | 글로벌 CSS | Tailwind v4, 테마 변수 |

## 공유 코드 추출

- 2개 이상 Feature에서 필요 → `packages/`로 추출
- 공통 컴포넌트: `packages/ui`
- 공통 로직: `packages/core`
- 공통 유틸: `packages/core/**/shared/`

## Feature CLAUDE.md 템플릿

```markdown
# {Feature Name}
{1줄 설명}. {관련 도메인/Entity 참조}
## 참조
- REQ: `.plans/features/active/{slug}/02-package/01-requirements.md`
- TC: `.plans/features/active/{slug}/02-package/09-test-cases.md`
```

> 각 Feature에 ~10줄 컨텍스트 파일. 해당 Feature 작업 시 자동 로딩.

## 참조

- 레이어 규칙: `.claude/skills/layered-architecture/SKILL.md`
- 컴포넌트/상태/스타일: `.claude/skills/frontend-patterns/SKILL.md`
- ESLint Feature Isolation: `eslint.config.mjs` (Tier 2)
