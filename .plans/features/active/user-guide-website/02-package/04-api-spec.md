# API Spec: user-guide-website

이 기능에는 runtime API가 필요하지 않다.

문서 웹사이트는 `src/lib/docs/**`의 static TypeScript content를 사용한다.

## Non-API Contract

| Data source | Consumer |
| --- | --- |
| `src/lib/docs/navigation.ts` | Docs shell navigation |
| `src/lib/docs/planning-pages.ts` | Planning route pages |
| `src/lib/docs/examples.ts` | Pipeline example routes |
