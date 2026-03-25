---
name: dev-frontend-patterns
description: 프론트엔드 UI 패턴. CVA + Tailwind v4, 5-Tier 상태 관리, 컴포넌트 설계 시 참조.
---

# Frontend Patterns

서비스 앱 프론트엔드 UI 패턴. CVA + Tailwind v4 + 5-Tier 상태 관리.

## Tech Stack Reference

> 아래 패턴에서 사용하는 패키지 목록. `profile.json`의 `frontend.*` 필드로 선택.

| 범주 | 기본 도구 | 패키지 | profile 필드 |
|------|----------|--------|-------------|
| UI Primitives | Radix UI | `@radix-ui/react-*` | `frontend.uiPrimitives` |
| Component System | shadcn/ui | CVA + clsx + tailwind-merge | `frontend.componentSystem` |
| Styling | Tailwind v4 | `tailwindcss@^4.0` | `frontend.styling` |
| Global State | Jotai | `jotai@^2.15` | `frontend.stateGlobal` |
| Server Data | SWR | `swr@^2.3` | `frontend.stateServer` |
| URL State | nuqs | `nuqs@^2.7` | `frontend.stateUrl` |
| Forms | react-hook-form | `react-hook-form@^7.62` | `frontend.stateForms` |
| Validation | Zod | `zod@^3.25` | `frontend.formValidation` |
| Theme | next-themes | `next-themes@^0.4` | `frontend.theme` |
| Animation | Motion | `motion@^12.12` | `frontend.animation` |
| Icons | Lucide | `lucide-react@^0.474` | `frontend.icons` |
| Toast | Sonner | `sonner@^2.0` | `frontend.toast` |
| **조건부** | | | |
| Dates | date-fns | `date-fns@^4.1` + `react-day-picker@^9.7` | `frontend.dates` |
| Charts | Recharts | `recharts@^2.15` | `frontend.charts` |
| Tables | TanStack Table | `@tanstack/react-table@^8.9` | `frontend.tables` |
| Carousel | Embla | `embla-carousel-react@^8.5` | `frontend.carousel` |
| DnD | dnd-kit | `@dnd-kit/core@^6.3` | `frontend.dnd` |

> 버전 + 대안 선택: `.plan/init/v4/profile-schema.md` (`frontend` 섹션)
> 패키지 매핑: `.plan/init/v4/phase-0-monorepo/00-monorepo-scaffolding.md`

## 컴포넌트 패턴

| 패턴 | 용도 | 예시 |
|------|------|------|
| CVA + cn() | 변형 기반 스타일링 | Button(variant, size) |
| Props Extension | HTML 요소 props 확장 | React.ComponentProps<"button"> |
| Slot (asChild) | 렌더링 요소 교체 | `<Button asChild><Link /></Button>` |
| Compound Component | 관련 컴포넌트 그룹화 | Card.Header + Card.Content |
| data-* 속성 | 컴포넌트 식별 + CSS 선택자 | data-slot, data-variant |

### CVA 패턴

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const variants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "h-9 px-4", sm: "h-8 px-3" },
  },
  defaultVariants: { variant: "default", size: "default" },
})
```

### cn() 유틸리티

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 상태 관리 5-Tier

| 범위 | 도구 | 위치 | 영속성 |
|------|------|------|--------|
| 전역 | Jotai (atomWithStorage) | hooks/ | localStorage |
| Feature 로컬 | React Context | features/{name}/hooks/ | 메모리 |
| URL | nuqs | page.tsx | URL |
| 서버 데이터 | SWR / Server Component | infrastructure/ | 캐시 |
| 폼 | react-hook-form + Zod | presentation/ | 메모리 |

> Feature 상태(Context)는 해당 Feature 외부에서 접근 금지.

## 스타일링

- Tailwind CSS v4 + CSS 변수 (OKLCH 색상 공간)
- CSS Module 금지 — Tailwind 유틸리티로 통일
- 테마: `:root` / `.dark` CSS 변수 전환
- 커스텀 variant: `@custom-variant dark (&:is(.dark *))`

## Provider 아키텍처

```
루트 layout.tsx
  └── ThemeProvider (next-themes)
      └── NuqsAdapter (URL 상태)
          └── TooltipProvider
              └── (main) layout.tsx
                  └── SidebarProvider
                      └── {children}
```

## 참조

- Feature Module: `.claude/skills/dev-feature-module/SKILL.md`
- 레이어 규칙: `.claude/skills/layered-architecture/SKILL.md`
- 상세 분석: `.plan/init/v4/unified-frontend-architecture.md`
