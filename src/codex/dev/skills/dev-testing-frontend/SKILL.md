<!-- kit-convert generated: 2026-04-24 -->
---
name: dev-testing-frontend
description: 프론트엔드 테스트 패턴. 컴포넌트/훅/페이지 테스트 전략 참조.
---

# Testing Frontend

프론트엔드 컴포넌트/훅 테스트. Vitest + Testing Library 기반.

## 컴포넌트 테스트

| 대상 | 테스트 패턴 | 도구 |
|------|-----------|------|
| Primitive | render + screen.getBy* | @testing-library/react |
| Composite | 데이터 표시 + 인터랙션 | @testing-library/react + userEvent |
| Server Component | 비동기 렌더링 | async render |
| Client Component | 상태 변경 + 이벤트 | userEvent + waitFor |

```typescript
// 컴포넌트 테스트 패턴
it('renders label and value', () => {
  render(<StatCard label="총 건수" value={42} />);
  expect(screen.getByText('총 건수')).toBeInTheDocument();
  expect(screen.getByText('42')).toBeInTheDocument();
});
```

## 훅 테스트

- `renderHook()` + `act()` 패턴
- 상태 변경 검증: `result.current.value`
- 비동기 훅: `waitFor(() => expect(...))`

## Server Action 테스트

- Repository mock (Port interface 기반)
- 성공/실패 시나리오 분리
- revalidatePath 등 Next.js API는 mock

```typescript
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
```

## MSW (Mock Service Worker)

- 외부 API 호출 모킹
- `server.use(http.get(...))` 패턴
- 에러 응답 시나리오 포함

## 접근성

- `toBeVisible()`, `toHaveAttribute('role', ...)` 검증
- `screen.getByRole()` 우선 사용 (semantic query)

## 참조

- TDD 순서: `.claude/skills/tdd-workflow/SKILL.md`
- 백엔드: `.claude/skills/testing-backend/SKILL.md`

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/skills/dev-testing-frontend/SKILL.md`
