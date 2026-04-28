# Rule Catalog — Code Quality

> 프론트엔드 코드 리뷰 시 점검할 코딩 컨벤션. 위반 발견 시 PR 전 수정 권장.
> 참조 패턴 가이드: [`dev-frontend-patterns`](../../dev-frontend-patterns/SKILL.md) (Component Rules / Styling Rules)

## 1. Conditional class names use utility function

- **IsUrgent**: True
- **Category**: Code Quality

### Description

조건부 CSS 는 공유 `cn()` 유틸리티로 처리한다. 커스텀 ternary, 문자열 결합, template string 사용 금지. 클래스 로직 중앙화로 컴포넌트 일관성 + 유지보수성 확보.

(상세 가이드: [`dev-frontend-patterns/SKILL.md` Component Rules](../../dev-frontend-patterns/SKILL.md))

### Suggested Fix

```ts
import { cn } from '@/utils/classnames'
const classNames = cn(isActive ? 'text-primary-600' : 'text-gray-500')
```

## 2. Tailwind-first styling

- **IsUrgent**: True
- **Category**: Code Quality

### Description

Tailwind CSS utility 우선 사용. `.module.css` 신설은 Tailwind 조합으로 불가능한 경우만 허용. 일관성 + 유지보수성.

(상세 가이드: [`dev-frontend-patterns/SKILL.md` Styling Rules](../../dev-frontend-patterns/SKILL.md))

본 카탈로그는 Code Quality rule 추가/수정/삭제 시 함께 갱신.

## 3. Classname ordering for easy overrides

- **Category**: Code Quality

### Description

컴포넌트 작성 시 incoming `className` prop 을 컴포넌트 자체 클래스 뒤에 배치. 다운스트림 소비자가 스타일을 override / extend 할 수 있도록 보장. 컴포넌트 기본값 유지 + 외부 호출자가 특정 스타일 변경/제거 가능.

### Suggested Fix

```tsx
import { cn } from '@/utils/classnames'

const Button = ({ className }) => {
  return <div className={cn('bg-primary-600', className)}></div>
}
```

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-28 | 초안 — 전역 frontend-code-review 흡수 (IMP-AGENT-016) | Claude (메인테이너 역할) |
