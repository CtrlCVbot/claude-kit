<!-- kit-convert generated: 2026-04-24 -->
---
name: dev-tdd-workflow
description: TDD Red-Green-Refactor 워크플로우. 테스트 작성, 구현 순서, tdd-guard 차단 훅 관련 작업 시 참조.
---

# TDD Workflow

프로덕션 코드보다 테스트를 먼저 작성한다. dev-tdd-guard.js가 이를 차단 수준으로 강제한다.

## Red-Green-Refactor

1. **유즈케이스 정의**: 구현할 동작을 한 문장으로 정의
2. **Red**: 실패하는 테스트 작성. 유즈케이스 하나당 테스트 하나.
3. **Green**: 테스트를 통과하는 최소 코드. 과도한 설계 금지.
4. **Refactor**: 테스트 통과 상태 유지하면서 코드 개선.

## 원칙

- 하나의 테스트는 하나만 검증한다
- Arrange-Act-Assert 각 단계 명확
- setup이 복잡하면 프로덕션 코드 설계를 의심한다:
  - assert 여러 개 -> 책임 분리 필요
  - setup이 길다 -> 의존성 과다 -> 인터페이스 단순화
  - 테스트 작성 어려움 -> 결합도 높음 -> 구조 개선

## 면제

설정 파일, DB 마이그레이션, .d.ts, 단순 오타, index.ts, 문서 파일

## 참조

- 차단 훅: `.claude/hooks/dev-tdd-guard.js` (exit 2)
- 백엔드 테스트: `.claude/skills/testing-backend/SKILL.md` (Tier 2)
- 프론트엔드 테스트: `.claude/skills/dev-testing-frontend/SKILL.md` (Tier 2)

---

## Stack Alternatives

> 위 워크플로우는 TypeScript/vitest 기준. `stack.language`에 따른 TDD 도구 대응:

### 테스트 프레임워크 + 어서션

| stack.language | 테스트 러너 | 어서션 | Mock |
|----------------|-----------|--------|------|
| typescript (기본) | vitest | vitest 내장 | vi.fn(), vi.mock() |
| java | JUnit 5 | AssertJ | Mockito |
| python | pytest | pytest 내장 / assertpy | unittest.mock / pytest-mock |

### 테스트 파일 네이밍

| stack.language | 테스트 파일 패턴 | 위치 |
|----------------|-----------------|------|
| typescript | `{name}.test.ts` / `{name}.spec.ts` | `__tests__/` 또는 형제 |
| java | `{Name}Test.java` | `src/test/java/{package}/` |
| python | `test_{name}.py` | `tests/` |

### tdd-guard 면제 패턴

| stack.language | 면제 대상 |
|----------------|----------|
| typescript (기본) | .json, .yaml, .config.*, .d.ts, index.ts, schema/, migrations/ |
| java | *Config.java, *Application.java, *Dto.java, *Exception.java, *Repository.java (Spring Data interface) |
| python | \_\_init\_\_.py, conftest.py, *_config.py, alembic/, migrations/ |

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/skills/dev-tdd-workflow/SKILL.md`
