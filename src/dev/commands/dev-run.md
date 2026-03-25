# 개발 실행

Feature Package의 TASK를 TDD 방식으로 순차 구현합니다.

> 참조: `.claude/skills/dev-workflow/SKILL.md`

## 입력
- Feature Package 경로 (필수): 인자 또는 대화에서 지정
- 예: `/dev .plans/features/active/payment-subscription-flow`

## 워크플로우 (3 Phase)

### Phase D1: Task Resolution (자동)
1. Feature Package 로드 (`02-package/08-dev-tasks.md`)
2. TASK 의존성 그래프 생성
3. 다음 실행 가능 TASK 선택 (의존성 순서, pending 상태)
4. Context Bundle 수집 (REQ + DEC + TC + Spec 문서)

### Phase D2: Code Generation (자동, TDD)
5. 테스트 파일 생성 (Red: TC 기반 실패 테스트)
6. 구현 파일 생성 (Green: REQ + DEC 기반 최소 구현)
7. 리팩토링 (Refactor: 테스트 통과 유지하며 개선)

### Phase D3: Quality Gate (자동)
8. 5개 게이트 통과 확인 (vitest, tdd-guard, typecheck, lint, REQ↔TC 매핑)
9. TASK 상태 갱신 (pending → done)
10. 다음 TASK로 반복 (D1으로 돌아감)

## 옵션
- **전체 자동**: 모든 TASK를 순차 실행 (기본)
- **단일 TASK**: 다음 1개 TASK만 실행 후 중단

## 완료 시
- `08-dev-tasks.md` 상태 갱신
- `dev-output-summary.md` 생성 (`guide/dev-feature-guide/dev-output-summary-template.md` 참조)
- `/dev-verify` 실행 안내

## 규칙
- TDD 순서 절대 준수: 테스트 → 구현 → 리팩토링
- Quality Gate 3회 연속 실패 시 TASK blocked 처리 + `03-dev-notes/` 기록
- Feature Package 범위 밖 코드 변경 금지
- 세션 경계: `08-dev-tasks.md` 상태로 진행도 추적, `/continue`로 재개 가능

## Stack Alternatives

> 위 워크플로우는 TypeScript 기본 스택 기준. `profile.json`의 `stack.*` 필드에 따라 D3 게이트 명령어가 달라진다.

| Gate | typescript (기본) | java | python |
|------|-------------------|------|--------|
| 테스트 | vitest | `./gradlew test` | pytest |
| TDD Guard | dev-tdd-guard.js | dev-tdd-guard.js (polyglot) | dev-tdd-guard.js (polyglot) |
| 타입 체크 | turbo typecheck | `./gradlew compileJava` | mypy |
| 린트 | turbo lint | checkstyle + spotbugs | ruff check |
