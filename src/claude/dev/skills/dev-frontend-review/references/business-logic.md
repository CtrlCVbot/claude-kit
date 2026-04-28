# Rule Catalog — Business Logic

> 비즈니스 로직 / Provider 컨텍스트 / store 사용 패턴 점검.

## 1. Provider 의존 컴포넌트의 사용 컨텍스트 보장

- **IsUrgent**: True
- **Category**: Business Logic

### Description

특정 Provider (예: Context Provider, Store Provider) 에 의존하는 컴포넌트는 **모든 사용 컨텍스트에서 해당 Provider 가 보장**되어야 한다. 다른 컨텍스트에서 import 시 blank screen / runtime error 발생 위험.

### 예시 (실제 사례)

`workflowStore` Provider 에 의존하는 노드 컴포넌트가 RAG Pipe 템플릿 생성 컨텍스트에서 blank screen 발생 → workflowStore Provider 부재가 원인.
([Dify Issue #29168 참조](https://github.com/langgenius/dify/issues/29168))

### Suggested Fix

특정 store / Provider 의존성을 회피하고 라이브러리 표준 hook 사용:

```tsx
// WRONG (workflowStore Provider 의존 — 다른 컨텍스트에서 깨짐)
import useNodes from '@/app/components/workflow/store/workflow/use-nodes'

// RIGHT (reactflow 표준 — 모든 컨텍스트에서 동작)
import { useNodes } from 'reactflow'
```

### 일반 원칙

- 컴포넌트가 어떤 Provider 컨텍스트에서 사용 가능한지 **명시적으로 문서화**
- 가능하면 Provider 비의존 / 라이브러리 표준 hook 우선
- 의존성이 불가피하면 컴포넌트 사용처 제한 (file path 패턴 / lint rule / TypeScript brand 등)

(상세 가이드: [`dev-frontend-patterns/SKILL.md` Provider Rules](../../dev-frontend-patterns/SKILL.md))

본 카탈로그는 Business Logic rule 추가/수정/삭제 시 함께 갱신.

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-28 | 초안 — 전역 frontend-code-review 흡수 + 일반화 (IMP-AGENT-016) | Claude (메인테이너 역할) |
