<!-- kit-convert generated: 2026-04-24 -->
---
name: dev-refactoring
description: 안전한 리팩토링 절차. 코드 냄새 식별, 테스트 안전망 기반 단계적 개선 참조.
---

# Refactoring

안전한 리팩토링 절차. 테스트 통과를 유지하면서 구조를 개선한다.

## 절차

1. **코드 냄새 식별**: 대상 코드의 문제 명확화
2. **테스트 커버리지 확인**: >= 80% (안전망)
   - 부족 시 테스트 보강 우선
3. **작은 단위 변경**: 한 번에 하나의 리팩토링만
4. **테스트 실행**: 각 변경 후 `npx vitest run`
5. **반복**: 3~4를 목표 달성까지

## 코드 냄새 → 패턴

| 코드 냄새 | 리팩토링 패턴 |
|----------|-------------|
| 긴 함수 (> 30줄) | Extract Method |
| 거대 클래스 (> 200줄) | Extract Class |
| Feature Envy | Move Method |
| 산탄총 수술 | Move Field + Inline Class |
| 조건 분기 과다 | Replace Conditional with Polymorphism |
| 중복 코드 | Extract Method / Pull Up Method |
| 매직 넘버 | Replace Magic Number with Constant |

## 레이어별 주의점

| 레이어 | 주의 사항 |
|--------|----------|
| Domain | 외부 의존 도입 금지, 상태 전이 로직 보존 |
| Application | Port interface 변경 시 Infrastructure도 수정 |
| Feature | Feature 간 의존 도입 금지 |

## 금지

- 기능 변경과 리팩토링을 동시에 수행
- 테스트 없이 리팩토링 시작
- 한 번에 대규모 변경

## 참조

- TDD: `.claude/skills/tdd-workflow/SKILL.md`
- 레이어 규칙: `.claude/skills/layered-architecture/SKILL.md`

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/skills/dev-refactoring/SKILL.md`
