# Daily Workflow

> **Status**: Draft (P4, 2026-04-17)
> **Source**: `src/claude/dev/commands/`, [../10-features/02-dev-domain.md](../10-features/02-dev-domain.md)
> **Related**: [03-first-run.md](03-first-run.md), [05-plan-pipeline.md](05-plan-pipeline.md)

dev 도메인으로 **기능 1개를 처음부터 끝까지 구현** 하는 일상 흐름입니다. 예시로 "사용자 프로필 페이지 추가" 를 만들어본다고 가정합니다.

## 0. 전제

- PRD (또는 간단한 요구사항 문서) 가 있음 — plan 도메인으로 먼저 만드는 경우 [05-plan-pipeline.md](05-plan-pipeline.md) 참조
- `dev` 도메인이 활성 (`profile.json`)

## 1. Feature Package 생성 — `/dev-feature`

```
/dev-feature .plans/prd/user-profile-page.md
```

입력된 PRD 를 읽어 다음을 생성합니다.

- `.plans/features/active/user-profile-page/` 디렉터리
- `00-context/` (routing-metadata, 구조 계약 등)
- TASK 목록 (`T-FE-01`, `T-BE-01`, `T-DB-01` ...)
- 각 TASK 에 담당 레이어·수용 기준·의존성 명시

## 2. 구현 루프 — `/dev-run`

```
/dev-run .plans/features/active/user-profile-page
```

TASK 를 하나씩 꺼내 **TDD 루프** 를 돕 돕니다.

### 2.1 Red — 실패 테스트 먼저

```
src/__tests__/UserProfile.test.tsx 작성
→ 현재 아직 없는 UserProfile 컴포넌트 import 시 실패 확인
```

`dev-tdd-guard.js` 가 이 단계 없이 구현 파일을 바로 편집하려 하면 `exit 2` 로 차단합니다.

### 2.2 Green — 최소 구현

```
src/components/UserProfile.tsx 작성
→ 테스트 통과하는 최소 코드
```

### 2.3 Refactor — 개선

테스트를 통과한 상태에서만 구조 개선. 테스트 깨지면 되돌아감.

## 3. 검증 — `/dev-verify`

```
/dev-verify
```

dev-verify-agent 서브에이전트가 새 컨텍스트에서 실행합니다.

| 단계 | 검증 |
|------|------|
| Type | `tsc --noEmit` 또는 프로젝트별 타입체크 |
| Lint | ESLint / Biome 등 |
| Test | `pnpm test` (vitest/jest) |
| Build | `pnpm build` |

실패 시: 실패 증거를 포함한 리포트 반환. 사용자가 수정 후 재실행.

## 4. 리뷰

작업 중 필요에 따라:

```
/dev-review               — 일반 품질 리뷰
/dev-security-review      — OWASP + STRIDE
/dev-test-verify          — 테스트 품질 검증
```

각 커맨드는 전문 서브에이전트를 호출합니다 ([../10-features/02-dev-domain.md §서브에이전트](../10-features/02-dev-domain.md)).

## 5. 커밋 — `/dev-commit` 또는 `/dev-commit-push-pr`

### 5.1 로컬 커밋만

```
/dev-commit
```

Conventional Commit 메시지 자동 생성. 변경 파일을 범위별로 제안.

### 5.2 푸시 + PR 생성까지

```
/dev-commit-push-pr
```

커밋 → push → `gh pr create` 를 한번에. PR 본문은 전체 커밋 이력을 분석해 자동 작성.

## 6. 다음 TASK 계속 — `/dev-continue`

현재 세션이 길어지면 `/dev-continue` 로 체크포인트 저장 후 새 세션에서 이어갑니다.

```
/dev-checkpoint   — 현재 상태 저장
/dev-continue     — 다음 세션 시작 시 체크포인트에서 재개
```

## 7. 전체 흐름 요약

```
PRD
 │
 ▼
/dev-feature   →  Feature Package + TASK 목록
 │
 ▼
/dev-run
 ├─ TASK1: Red → Green → Refactor
 ├─ TASK2: Red → Green → Refactor
 └─ ...
 │
 ▼
/dev-verify    →  type + lint + test + build 통과
 │
 ▼
/dev-review    →  품질·보안 리뷰
 │
 ▼
/dev-commit-push-pr   →  PR 생성
```

## 8. 자주 하는 실수

| 실수 | 올바른 대응 |
|------|-----------|
| TDD 가드 차단을 피하려 테스트를 `.test.md` 로 우회 | 실제 실행되는 테스트로 작성 |
| `/dev-verify` 없이 `/dev-commit` | verify 실패 무시는 Iron Law 위반 (`verification.md`) |
| 여러 TASK 를 한 커밋에 묶기 | 1 TASK = 1 Commit 원칙 (계획적 예외만 허용) |
| Feature Package 범위 밖 파일 편집 | scope-guard 경고. 정말 필요하면 TASK 로 분할 |
| "이거만 빨리 고치고" 와 `--no-verify` | 훅 우회 금지 — 근본 원인 해결 |

## 다음 단계

- [05-plan-pipeline.md](05-plan-pipeline.md) — PRD 가 아직 없을 때
- [07-troubleshooting.md](07-troubleshooting.md) — 막혔을 때
- [../10-features/02-dev-domain.md](../10-features/02-dev-domain.md) — 기능 레벨 상세
