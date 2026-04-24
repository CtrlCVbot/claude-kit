---
name: dev-testing-backend
description: 백엔드 테스트 패턴. 도메인/어플리케이션/인프라 레이어별 테스트 전략 참조.
---
<!-- kit:managed source=src/codex/dev/skills/dev-testing-backend/SKILL.md hash=401c2ca70f8f06cdeb212a10de6b2b37395d1da3ee39a0bed33870cceee560d9 -->

# Testing Backend

백엔드 단위/통합 테스트 패턴. Vitest 기반.

## 테스트 레이어

| 레이어 | Mock 전략 | 검증 대상 |
|--------|----------|----------|
| Domain | 없음 (순수 TS) | 상태 전이, 검증 규칙, Factory |
| Application | Port interface mock | 오케스트레이션, 에러 핸들링 |
| Infrastructure | 실제 DB (testcontainers) | CRUD, 쿼리 정확성, 트랜잭션 |

## Mock 전략

- Port 인터페이스 기반 mock → 구현체 직접 mock 금지
- `vi.fn()` + `mockResolvedValue()` 사용
- Mock이 3개 이상이면 설계 재검토

```typescript
// Good: Port interface mock
const mockRepository: EntityRepositoryPort = {
  findById: vi.fn().mockResolvedValue(entity),
  save: vi.fn(),
};

// Bad: 구현체 직접 mock
vi.mock('./drizzle-entity-repository');
```

## 통합 테스트

- testcontainers로 실제 DB (PostgreSQL) 사용
- 테스트별 트랜잭션 롤백 또는 격리
- Seed 데이터: 최소한으로 (테스트 자체에서 setup)

## 검증 패턴

- `expect(result).toEqual()` 우선 (정확한 값 비교)
- `toMatchObject()` 제한적 사용 (부분 매칭 시에만)
- 에러: `expect(() => ...).toThrow(DomainError)`
- 비동기: `await expect(promise).rejects.toThrow()`

## 참조

- TDD 순서: `.claude/skills/tdd-workflow/SKILL.md`
- 프론트엔드: `.claude/skills/testing-frontend/SKILL.md`

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/skills/dev-testing-backend/SKILL.md`
