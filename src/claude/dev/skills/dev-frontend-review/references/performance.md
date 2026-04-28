# Rule Catalog — Performance

> React 성능 패턴 위반 점검. 불필요한 렌더링 / 메모리 누수 방지.

## 1. React Flow data usage

- **IsUrgent**: True
- **Category**: Performance

### Description

React Flow 렌더링 시 UI 소비는 `useNodes` / `useEdges` 우선 사용. 노드/엣지 상태를 read / mutate 하는 callback 내부에서는 `useStoreApi` 사용. Flow 데이터를 이 hook 외부에서 수동 추출하지 않는다.

> Note: React Flow 미사용 프로젝트에서는 본 rule 면제.

### Suggested Fix

```tsx
// WRONG (UI 렌더링에서 직접 store 접근)
const nodes = useStoreApi().getState().nodes

// RIGHT (UI 렌더링)
import { useNodes } from 'reactflow'
const nodes = useNodes()

// RIGHT (callback 내부 mutation)
import { useStoreApi } from 'reactflow'
const store = useStoreApi()
const handleClick = () => {
  const nodes = store.getState().nodes
  // ...
}
```

## 2. Complex prop memoization

- **IsUrgent**: True
- **Category**: Performance

### Description

복잡한 prop 값 (객체, 배열, Map) 을 자식 컴포넌트에 전달 전 `useMemo` 로 wrap. 안정적인 reference 보장 + 불필요한 re-render 방지.

(상세 가이드: [`dev-frontend-patterns/SKILL.md` State Rules](../../dev-frontend-patterns/SKILL.md))

### Suggested Fix

WRONG:

```tsx
<HeavyComp
    config={{
        provider: ...,
        detail: ...
    }}
/>
```

RIGHT:

```tsx
const config = useMemo(() => ({
    provider: ...,
    detail: ...
}), [provider, detail]);

<HeavyComp config={config} />
```

본 카탈로그는 Performance rule 추가/수정/삭제 시 함께 갱신.

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-28 | 초안 — 전역 frontend-code-review 흡수 (IMP-AGENT-016) | Claude (메인테이너 역할) |
