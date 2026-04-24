---
name: dev-domain-modeling
description: Rich Domain Model 설계. Entity, Value Object, State Machine, Factory Method 패턴 사용 시 참조.
---

# Domain Modeling

Rich Domain Model 설계. 비즈니스 로직을 도메인 객체에 캡슐화한다.

## Entity Interface + Domain Class 패턴

- **Data Interface**: 순수 데이터 구조 (interface)
- **Domain Class**: 행위 + 검증 + 상태 전이
  - private constructor + Factory Method (from(), of())
  - 내부 상태 직접 변경 + getChanges()
  - getter는 필요 시만 (한 줄 정의)

## State Machine

상태 전이를 도메인 클래스에 캡슐화:
```typescript
startSharing(actionType: ActionType): void {
  this.ensureCanStartSharing(actionType);  // 전이 가능 검증
  this._shareStatus = 'SHARING';
  this._dirty = true;
}
```

## 서비스는 오케스트레이션만

```typescript
async execute(request) {
  const model = await this.repository.findById(id);  // 로드
  model.doSomething();                                 // 도메인 로직
  await this.repository.save(model);                   // 저장
}
```

## 테스트 전략

| 레이어 | Mock | 검증 대상 |
|--------|------|----------|
| Domain | 없음 | 상태 전이, 검증 규칙 |
| Application | 외부 API만 | 오케스트레이션 플로우 |

## 참조

- 레이어 규칙: `.claude/skills/dev-layered-architecture/SKILL.md`
- 도메인 위치: `packages/core/src/**/domain/`

---

## Stack Alternatives

> 위 패턴은 TypeScript 기준. `stack.language`에 따른 도메인 모델링 대응:

### Entity + Factory 패턴

| stack.language | 패턴 | 예시 |
|----------------|------|------|
| typescript (기본) | `private constructor` + `static from()` | `Order.from(data)` |
| java | package-private constructor + `public static create()` | `Order.create(customerId, items)` |
| python | `@classmethod` factory + `__init__` with validation | `Order.create(customer_id, items)` |

### Value Object

| stack.language | immutability | 동등성 |
|----------------|-------------|--------|
| typescript | `readonly` fields + `of()` + `equals()` | manual `equals()` |
| java | `record` (Java 16+) 또는 final fields | `record` 자동 / manual `equals()` |
| python | `@dataclass(frozen=True)` | `@dataclass` 자동 `__eq__` |

### State Machine

| stack.language | 상태 전이 패턴 |
|----------------|---------------|
| typescript | 메서드 내부 `this._status = newStatus` + dirty flag |
| java | 메서드 내부 `this.status = newStatus` + JPA `@Version` |
| python | 메서드 내부 `self._status = new_status` + change tracking |

### 도메인 위치

| stack.language | 경로 |
|----------------|------|
| typescript | `packages/core/src/**/domain/` |
| java | `core/src/main/java/{pkg}/domain/` |
| python | `core/src/{proj}_core/{domain}/domain/` |
