# 06. interaction.md 비교 문서

> 원본: `_archive/2026-04-10-originals/interaction.md`
> 변경 강도: **MEDIUM**

---

## 현재 내용 요약

상호작용 규칙 파일로 6개 섹션으로 구성:

1. **State Assumptions Before Coding** (CRITICAL) -- 가정 명시 후 코딩 (줄 1-22)
2. **Explain with Analogies** -- React useEffect 예시 (줄 24-38)
3. **Conclusion First** -- React useMemo 예시 (줄 40-54)
4. **Be Honest About Uncertainty** -- 불확실성 표현 규칙 (줄 56-63)
5. **context7 MCP Usage** -- MCP 도구 사용법 (줄 64-85)
6. **Web Fetching** (CRITICAL) -- WebFetch 금지 및 대안 (줄 87-98)

총 99줄, 약 580 토큰.

---

## 발견된 문제

| # | 위치 | 문제 유형 | 설명 |
|---|------|-----------|------|
| 1 | Explain with Analogies | 언어 종속 | React `useEffect` 예시 -- JavaScript/React 전용 |
| 2 | Conclusion First | 언어 종속 | React `useMemo` 예시 -- JavaScript/React 전용 |
| 3 | context7 MCP Usage | 환경 종속 | context7 MCP 도구 세부 사용법 -- MCP 설정에 의존 |
| 4 | Web Fetching | 환경 종속 | jina-reader, fetch MCP 도구 -- MCP 설정에 의존 |
| 5 | Explain with Analogies | SSOT 중복 | golden-principles.md #7과 원칙 중복 |
| 6 | Conclusion First | SSOT 중복 | golden-principles.md #4와 원칙 중복 |

---

## 제안 변경 사항

### 변경 1: Explain with Analogies -- 예시 범용화

| 항목 | 내용 |
|------|------|
| **Before** | `# BAD: No analogy` / `"useEffect runs side effects after component rendering."` / `# GOOD: Analogy first` / `"useEffect is like a restaurant's closing routine. After serving food (rendering), you do the dishes and restock (side effects). Technically, it's a Hook that runs after component rendering."` |
| **After** | `# BAD: No analogy` / `"이벤트 리스너는 지정된 이벤트 발생 시 콜백 함수를 실행한다."` / `# GOOD: Analogy first` / `"이벤트 리스너는 초인종과 같다. 누군가 버튼을 누르면(이벤트 발생) 알림이 울리고(콜백 실행) 대응할 수 있다. 기술적으로는, 지정된 이벤트 발생 시 등록된 콜백 함수를 실행하는 메커니즘이다."` / `See golden-principles.md #7` |
| **사유** | React 전용 예시 -> 언어 무관 개념으로 교체. SSOT 참조 추가 |

### 변경 2: Conclusion First -- 예시 범용화

| 항목 | 내용 |
|------|------|
| **Before** | `# BAD` / `"Looking at React's rendering cycle... (10 lines) ...so use useMemo."` / `# GOOD` / `"Wrap it with useMemo. The expensive calculation repeats on every render."` |
| **After** | `# BAD` / `"데이터베이스 쿼리를 분석해보면... (10줄) ...그래서 캐싱이 필요합니다."` / `# GOOD` / `"캐싱을 적용하세요. 동일 쿼리가 매 요청마다 반복 실행되고 있습니다."` / `See golden-principles.md #4` |
| **사유** | React 전용 예시 -> 언어/프레임워크 무관 예시로 교체. SSOT 참조 추가 |

### 변경 3: context7 MCP Usage 섹션 삭제

| 항목 | 내용 |
|------|------|
| **Before** | context7 MCP 사용법 22줄 (When to Use, Steps, Exceptions 포함) |
| **After** | (전체 삭제 -> 향후 mcp-preferences.md로 이동 예정) |
| **사유** | MCP 도구 설정은 환경별 차이가 크며, 전역 규칙이 아닌 MCP 설정 파일에서 관리해야 함 |

### 변경 4: Web Fetching 섹션 삭제

| 항목 | 내용 |
|------|------|
| **Before** | Web Fetching 규칙 12줄 (WebFetch 금지, jina-reader/fetch 대안 테이블) |
| **After** | (전체 삭제 -> 향후 mcp-preferences.md로 이동 예정) |
| **사유** | MCP 도구 우선순위는 환경별 설정이며, 전역 상호작용 규칙과 무관 |

### 유지 항목

| 섹션 | 사유 |
|------|------|
| State Assumptions Before Coding | 범용 규칙. 언어/도구 무관하게 적용 가능. 예시도 범용 |
| Be Honest About Uncertainty | 범용 규칙. 특정 환경 의존 없음 |
| Explain with Analogies (구조) | 원칙 자체는 유지, 예시만 범용화 |
| Conclusion First (구조) | 원칙 자체는 유지, 예시만 범용화 |

---

## 변경 후 내용 요약

6개 섹션 -> 4개 섹션. State Assumptions Before Coding과 Be Honest About Uncertainty는 원문 유지. Explain with Analogies와 Conclusion First는 React 전용 예시를 언어 무관 예시로 교체하고 golden-principles.md SSOT 참조를 추가. context7 MCP Usage와 Web Fetching 2개 섹션은 전체 삭제하여 향후 mcp-preferences.md로 이동.

---

## 토큰 영향

| 항목 | Before | After | 변동 |
|------|:------:|:-----:|:----:|
| 추정 토큰 | ~580 | ~370 | **-36%** |
| 삭제 줄 수 | - | ~34줄 (MCP 2섹션) | - |
| 수정 줄 수 | - | ~10줄 (예시 교체) | - |

**가장 큰 토큰 절감**. MCP 관련 2개 섹션 삭제가 전체 절감의 대부분을 차지. 상호작용 규칙의 본질(가정 명시, 유추 설명, 결론 우선, 불확실성 인정)은 온전히 보존.
