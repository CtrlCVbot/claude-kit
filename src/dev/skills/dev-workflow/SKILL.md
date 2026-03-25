---
name: dev-workflow
description: Feature Package TASK 자동 실행. TDD 기반 Code Generation + Quality Gate. /dev 커맨드에서 참조.
user-invocable: false
---

# Dev Workflow — Feature Package TASK 자동 실행

> 트리거: `/dev` 커맨드 실행 시 이 스킬을 참조한다.
>
> 관련 문서:
> - Vertical Slice 패턴: `.plan/init/v4/phase-3-dev-system/01-vertical-slice-guide.md`
> - Dev Loop 설계: `.plan/init/v4/phase-3-dev-system/02-dev-workflow-automation.md`
> - DVC 검증: `.plan/guide/dev-feature-guide/dev-verification-check.md`

---

## 전체 흐름

```
/dev-feature (Phase A/B/C) → Feature Package 생성
                            │
                            ▼
/dev (Phase D1/D2/D3) → TASK별 TDD 루프
                            │
                            ▼ (모든 TASK 완료)
/dev-verify → DVC 검증 (6개 항목)
                            │
                            ▼
/dev-test-verify → 테스트 품질 검증
                            │
                            ▼
/dev-commit → 커밋 생성
```

---

## Phase D1: Task Resolution (자동)

### D1.1 — Feature Package 로드

Feature Package 경로에서 다음 파일을 읽는다:

| 파일 | 용도 |
|------|------|
| `02-package/08-dev-tasks.md` | TASK 목록 + 의존성 + 상태 |
| `02-package/01-requirements.md` | TASK가 참조하는 REQ |
| `00-context/02-decision-log.md` | 정책 결정 (DEC) |
| `02-package/09-test-cases.md` | TASK에 매핑된 TC |

### D1.2 — TASK 의존성 그래프 생성

```
08-dev-tasks.md에서 파싱:
  - 각 TASK의 상태: pending | in_progress | done | blocked
  - 각 TASK의 의존성: dependsOn

의존성 그래프 구성:
  {KEY}-TASK-001 → {KEY}-TASK-002 → {KEY}-TASK-004
                 → {KEY}-TASK-003 → {KEY}-TASK-004
  {KEY}-TASK-004 → {KEY}-TASK-005
```

### D1.3 — 다음 실행 가능 TASK 선택

```
조건:
  - 상태 = pending
  - 모든 의존 TASK가 done
  - 우선순위: 의존 순서 → TASK 번호 순

선택 불가 시 (모든 TASK가 done 또는 blocked):
  → Dev Loop 종료 → D3.8로 이동
```

### D1.4 — Context Bundle 수집

선택된 TASK에 대해 구현에 필요한 모든 컨텍스트를 수집:

```
Task Context Bundle:
  task: {KEY}-TASK-001
  category: Core | DB | UI | Auth | Feature
  requirements: [{KEY}-REQ-001, {KEY}-REQ-002]
  decisions: [{KEY}-DEC-001]
  testCases: [{KEY}-TC-001, {KEY}-TC-002]
  specs: [해당 Spec 문서 섹션]
  targetFiles: [생성/수정 대상 파일 경로]
```

카테고리별 추가 로드:

| 카테고리 | 추가 Spec |
|----------|----------|
| Core | `06-domain-logic.md` |
| DB | `05-db-migration-spec.md` |
| UI | `02-ui-spec.md` |
| Auth | `06-domain-logic.md` (권한 섹션) |
| Feature | `02-ui-spec.md` + `04-api-spec.md` |

---

## Phase D2: Code Generation (자동, TDD)

### D2.1 — 테스트 파일 생성 (Red)

1. Context Bundle의 TC에서 테스트 케이스 추출
2. Arrange-Act-Assert 구조로 테스트 작성
3. 테스트 실행 → **Red (실패 확인)**

```
테스트 파일 위치:
  [Core]    packages/core/src/{domain}/domain/__tests__/{target}.test.ts
  [DB]      packages/db/src/{domain}/__tests__/{target}.test.ts
  [UI]      packages/ui/src/__tests__/{target}.test.tsx
  [Feature] apps/{app}/features/{feature}/__tests__/{target}.test.ts(x)
```

### D2.2 — 구현 파일 생성 (Green)

1. REQ + DEC 기반으로 비즈니스 로직 구현
2. 레이어 규칙 준수 (Vertical Slice Guide 참조)
3. 테스트 실행 → **Green (최소 통과)**

카테고리별 생성 규칙:

| 카테고리 | 생성 패턴 |
|----------|----------|
| **Core** | Entity: private constructor + `from()` Factory, VO: immutable + `of()` + `equals()`, Port: interface 정의 |
| **DB** | Repository: Port 구현 + ORM 쿼리, Schema: ORM 스키마 정의, Migration: DDL 변경 |
| **UI** | Component: headless-first, Radix/shadcn 기반, Props interface 필수 |
| **Auth** | Token/Middleware: `profile.json`의 `auth` 전략에 따라 구현 |
| **Feature** | Page: Server Component, Action: Server Action + Repository 호출, Feature 격리 규칙 준수 |

### D2.3 — 리팩토링 (Refactor)

1. 중복 제거
2. 패턴 적용 (Factory, State Machine 등)
3. 테스트 실행 → **Refactor (테스트 유지 확인)**

---

## Phase D3: Quality Gate (자동)

### D3.1 — Gate 1: vitest 테스트 통과

```bash
npx vitest run {test-file}
# 모든 테스트 PASS 필수
```

### D3.2 — Gate 2: dev-tdd-guard.js 통과

```
dev-tdd-guard.js → exit 0
# 구현 파일에 대응하는 테스트 파일 존재 확인
```

### D3.3 — Gate 3: turbo run typecheck 통과

```bash
pnpm turbo run typecheck --filter={package}
# 타입 에러 없음
```

### D3.4 — Gate 4: turbo run lint 통과

```bash
pnpm turbo run lint --filter={package}
# 린트 에러 없음
```

### D3.5 — Gate 5: REQ↔TC 매핑 검증

```
TASK가 참조하는 REQ에 대한 TC가 구현되었는지 확인
# 매핑 누락 시 FAIL
```

### D3.6 — 실패 시 처리

```
실패 게이트에 따라 자동 복구 시도:
  Gate 1 (테스트 실패): 에러 분석 → 구현 코드 수정 → 재실행
  Gate 2 (테스트 없음): 테스트 파일 생성 → 재시도
  Gate 3 (타입 에러): 타입 수정 → 재빌드
  Gate 4 (린트 에러): 자동 수정 가능 시 수정, 불가 시 수동 개입 요청
  Gate 5 (TC 누락): 누락된 TC에 대한 테스트 추가

3회 연속 실패 시:
  → TASK 상태를 blocked 처리
  → 03-dev-notes/에 실패 로그 기록
  → 사용자에게 수동 개입 요청
```

### D3.7 — 성공 시 처리

```
1. TASK 상태를 done으로 갱신 (08-dev-tasks.md)
2. TASK의 Files 필드에 생성/수정된 파일 경로 기록
3. D1으로 돌아가 다음 TASK 선택
```

### D3.8 — 전체 TASK 완료 시: dev-output-summary 생성

```
모든 TASK가 done 상태일 때:
1. dev-output-summary.md 생성 (guide/dev-feature-guide/dev-output-summary-template.md 참조)
   - 위치: Feature Package 루트 또는 03-dev-notes/
2. 실행 결과 요약 출력
3. `/dev-verify` 실행 안내
```

### D3.9 — `/dev-verify` 안내

```
모든 TASK 완료. 다음 단계:
1. /dev-verify {feature-package-path} — 요건 충족 검증
2. /dev-test-verify — 테스트 품질 검증
3. /dev-commit — 커밋 생성
```

---

## 세션 경계 처리

### 세션 종료 시

- 현재 TASK 상태가 `08-dev-tasks.md`에 자동 반영
- in_progress 상태의 TASK가 있으면 다음 세션에서 해당 TASK부터 재개

### `/continue`로 재개 시

1. `08-dev-tasks.md` 읽기
2. 마지막 done TASK 확인
3. 다음 pending TASK부터 D1 시작

---

## Dev Loop 중 발견 사항 처리

### Back-Propagation 트리거

| 발견 | 처리 |
|------|------|
| 새 Edge Case | TC 추가 권장 → FLAG (dev-notes 기록) |
| 정책 결정 필요 | DEC 추가 → 사람 확인 (Loop 일시 중단) |
| TC 부족 | TC 추가 → 자동 (09-test-cases.md 갱신) |
| REQ 불일치 | REQ 수정 제안 → FLAG (dev-notes 기록) |

> 상세: `guide/dev-feature-guide/back-propagation-check.md` 참조

---

## 코드 품질 규칙 (요약)

1. **레이어 의존성**: Domain ← Application ← Ports → Infrastructure
2. **Feature 격리**: features/A → features/B (금지)
3. **축약어 금지**: repository (O) / repo (X)
4. **테스트 구조**: 하나의 테스트는 하나만 검증, Arrange-Act-Assert
5. **에러 처리**: Domain→DomainError, Application→Result, Presentation→HTTP 응답

---

## Stack Alternatives

> 위 Phase D1~D3는 TypeScript 기본 스택 기준. `profile.json`의 `stack.*` 필드에 따라 아래로 대체.

### D3 Quality Gate — 스택별 명령어

| Gate | typescript (기본) | java | python |
|------|-------------------|------|--------|
| D3.1 테스트 | `npx vitest run {test-file}` | `./gradlew test --tests '{class}'` | `pytest {file} -v` |
| D3.2 TDD Guard | dev-tdd-guard.js | dev-tdd-guard.js (polyglot) | dev-tdd-guard.js (polyglot) |
| D3.3 타입 체크 | `pnpm turbo run typecheck` | `./gradlew compileJava` | `mypy {module}` |
| D3.4 린트 | `pnpm turbo run lint` | `./gradlew checkstyleMain` | `ruff check .` |
| D3.5 REQ↔TC | 스택 무관 | 스택 무관 | 스택 무관 |

### D2 테스트 파일 위치 — 스택별

| 카테고리 | typescript | java | python |
|---------|-----------|------|--------|
| Core | `packages/core/src/{domain}/__tests__/` | `core/src/test/java/{pkg}/` | `core/tests/` |
| DB | `packages/db/src/{domain}/__tests__/` | `infra/src/test/java/{pkg}/` | `infra/tests/` |
| Feature | `apps/{app}/features/{feat}/__tests__/` | `api/src/test/java/{pkg}/` | `api/tests/` |

### D2 생성 패턴 — 스택별

| 패턴 | typescript | java | python |
|------|-----------|------|--------|
| Entity Factory | `private constructor` + `from()` | package-private + `static create()` | `@classmethod` factory |
| VO immutability | `readonly` + `of()` + `equals()` | `record` 또는 final fields | `@dataclass(frozen=True)` |
| Port interface | `interface` | `interface` | `abc.ABC` + `@abstractmethod` |
| Repository impl | Drizzle ORM queries | Spring Data JPA / MyBatis | SQLAlchemy queries |
| Server Action | Next.js Server Action | `@RestController` | FastAPI Router |
