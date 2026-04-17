# coding-style.md 비교 문서

- **변경 강도**: MEDIUM
- **점수**: 3 -> 5

---

## 현재 내용 요약

`coding-style.md`는 코딩 스타일 규칙을 5개 섹션으로 정의한다:

1. **Immutability** -- JS 코드 예시 포함 (19줄)
2. **File Organization** -- 파일 크기 제한, 응집도 원칙 (6줄)
3. **Error Handling** -- TypeScript try-catch 예시 (12줄)
4. **Input Validation** -- zod 라이브러리 고정 예시 (10줄)
5. **Code Quality Checklist** -- 8개 체크 항목

---

## 발견된 문제

| # | 문제 | 심각도 |
|---|------|--------|
| 1 | Immutability 섹션이 `golden-principles.md #1`과 완전 중복 (코드 예시까지 동일) | HIGH |
| 2 | File Organization 섹션이 `golden-principles.md #5`와 중복 (800 max 동일) | MEDIUM |
| 3 | Error Handling의 `console.error` 사용이 같은 파일 체크리스트의 "No console.log statements"와 모순 | MEDIUM |
| 4 | Input Validation이 `zod` (TypeScript 전용)에 고정 -- Python/Go 프로젝트에 부적합 | MEDIUM |
| 5 | Code Quality Checklist의 "No mutation", "Files are focused (<800 lines)"가 위 섹션과 이중 서술 | LOW |

---

## 변경 제안

### Before/After 비교

| 섹션 | Before | After | 조치 |
|------|--------|-------|------|
| Immutability (줄 3-21) | JS 코드 예시 포함 19줄 | `> golden-principles.md #1 참조` (1줄) | REPLACE with ref |
| File Organization (줄 24-29) | 4개 원칙 나열 6줄 | `> golden-principles.md #5 참조` (1줄) | REPLACE with ref |
| Error Handling (줄 31-43) | TypeScript try-catch + `console.error` | 언어 무관 패턴 + 로깅 방식 미지정 | REWRITE |
| Input Validation (줄 45-58) | `zod` 고정 TypeScript 예시 | 범용 설명 + 다중 라이브러리 예시 | REWRITE |
| Code Quality Checklist (줄 60-70) | 8개 항목 (중복 2개 포함) | 6개 항목 (중복 제거) | TRIM |

### 섹션별 변경 상세

**Immutability -- SSOT 참조로 대체**

```
# Before (19줄)
## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate:

\```javascript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
\```
```

```
# After (1줄)
## Immutability

> golden-principles.md #1 참조. 모든 데이터 변환은 새 객체 생성.
```

**File Organization -- SSOT 참조로 대체**

```
# Before (6줄)
## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large components
- Organize by feature/domain, not by type
```

```
# After (1줄)
## File Organization

> golden-principles.md #5 참조. 기능/도메인별 구성, 타입별 구성 금지.
```

**Error Handling -- 언어 무관으로 재작성**

```
# Before (TypeScript 고정)
ALWAYS handle errors comprehensively:

\```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
\```
```

```
# After (언어 무관)
## Error Handling

모든 외부 호출과 I/O 작업에 에러 처리 필수:
- 에러를 삼키지 않는다 (silent catch 금지)
- 구조화된 로깅 사용 (logger.error, 프레임워크 로거 등)
- 사용자 친화적 메시지로 재포장하여 전파
- 민감 정보 노출 금지 (스택 트레이스, 내부 경로 등)

참고: `console.error`는 디버깅용으로만 허용. 프로덕션 코드에서는 구조화된 로거 사용.
```

**Input Validation -- 범용화**

```
# Before (zod 고정)
ALWAYS validate user input:

\```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
\```
```

```
# After (범용)
## Input Validation

시스템 경계에서 모든 외부 입력 검증 필수 (golden-principles.md #6 참조):
- 스키마 검증 라이브러리 사용: zod (TS), pydantic (Python), joi (Node.js), JSON Schema 등
- 검증 실패 시 명확한 에러 메시지 반환
- 검증 통과 후에만 비즈니스 로직 진입
```

**Code Quality Checklist -- 중복 항목 제거**

```
# Before (8개)
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)          ← golden-principles #5와 중복
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] No mutation (immutable patterns used)   ← golden-principles #1와 중복
```

```
# After (6개)
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No debug-only 출력문 (console.log, print 등)
- [ ] No hardcoded values (secrets, magic numbers)
```

---

## After 내용 요약

개선 후 `coding-style.md`는 다음으로 구성된다:

1. **Immutability** -- 1줄 SSOT 참조
2. **File Organization** -- 1줄 SSOT 참조
3. **Error Handling** -- 언어 무관 원칙 (5줄)
4. **Input Validation** -- 범용 스키마 검증 안내 (3줄)
5. **Code Quality Checklist** -- 6개 항목 (중복 제거, 언어 무관)

---

## 토큰 영향

| 항목 | Before | After | 변화 |
|------|:------:|:-----:|:----:|
| 추정 토큰 | ~550 | ~330 | **-40%** |
| 삭제 대상 | JS/TS 코드 블록 2개, 중복 본문 2개, 중복 체크리스트 항목 2개 | -- | -- |
| 추가 대상 | -- | SSOT 참조 2줄, 범용 설명 ~8줄 | +~60 토큰 |
| 비고 | `console.error` vs "No console.log" 모순 해결 | 로깅 기준을 명확화 | -- |
