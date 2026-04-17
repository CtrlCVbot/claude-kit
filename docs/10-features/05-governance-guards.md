# Governance Guards

> **Status**: Draft (P4, 2026-04-17)
> **Source**: `src/claude/{core,dev,plan,copy}/hooks/*.js`, [../30-reference/04-hooks.md](../30-reference/04-hooks.md)
> **Related**: [01-core-domain.md](01-core-domain.md), [02-dev-domain.md](02-dev-domain.md), [03-plan-domain.md](03-plan-domain.md)

claude-kit 의 가장 핵심적인 메커니즘은 **hook 기반 자동 가드** 입니다. 사용자나 에이전트가 규칙을 "기억" 할 필요 없이, 도구 호출 시점에 JS 훅이 개입해 차단 또는 안내합니다.

## 1. Event 종류

| Event | 시점 | 주 용도 |
|-------|------|--------|
| `PreToolUse` | 도구 호출 직전 | **차단 (exit 2)** 또는 사전 안내 |
| `PostToolUse` | 도구 호출 완료 후 | 결과 기록, 사후 리마인더 |
| `Stop` | 세션 종료 시점 | 정리·후속 작업 제안 |

hook 은 JSON 입력을 stdin 으로 받고 stdout 으로 메시지를, exit code 로 결과 (0=정상 / 2=차단) 를 반환합니다.

## 2. Action 분류

| 분류 | exit code | 동작 |
|------|-----------|------|
| **BLOCKING** | 2 | 도구 호출을 차단하고 메시지를 사용자·에이전트에 노출 |
| **REMINDER** | 0 | 차단 없이 안내 메시지만 출력 |
| **LOG** | 0 | 사용자에게 보이지 않지만 내부 로그 기록 |

## 3. 전체 가드 테이블

### 3.1 core 도메인 (5)

| Hook | Event | Action | 역할 |
|------|-------|--------|------|
| [`output-secret-filter`](../../src/claude/core/hooks/output-secret-filter.js) | PostToolUse | LOG | 출력의 시크릿 패턴 탐지·마스킹 |
| [`edit-tracker`](../../src/claude/core/hooks/edit-tracker.js) | PostToolUse (Edit\|Write) | LOG | 편집 파일을 `.ai/.edit-log.json` 기록 |
| [`code-quality-reminder`](../../src/claude/core/hooks/code-quality-reminder.js) | PostToolUse | REMINDER | 파일 크기·중첩 등 품질 메트릭 경고 |
| [`security-auto-trigger`](../../src/claude/core/hooks/security-auto-trigger.js) | PostToolUse | REMINDER | 보안 키워드 감지 시 `/security-review` 제안 |
| [`session-wrap-suggest`](../../src/claude/core/hooks/session-wrap-suggest.js) | Stop | REMINDER | 세션 종료 시 `/session-wrap` 실행 제안 |

### 3.2 dev 도메인 (3)

| Hook | Event | Action | 역할 |
|------|-------|--------|------|
| [`dev-tdd-guard`](../../src/claude/dev/hooks/dev-tdd-guard.js) | PreToolUse (Edit\|Write) | **BLOCKING** | 테스트 없는 편집 차단 (TS/Java/Python) |
| [`dev-db-guard`](../../src/claude/dev/hooks/dev-db-guard.js) | PreToolUse (Bash) | **BLOCKING** | 위험한 DB 명령 (`DROP`, `TRUNCATE` 등) 차단 |
| [`dev-feature-scope-guard`](../../src/claude/dev/hooks/dev-feature-scope-guard.js) | PreToolUse (Edit\|Write) | REMINDER | Feature Package 범위 밖 편집 경고 |

### 3.3 plan 도메인 (1)

| Hook | Event | Action | 역할 |
|------|-------|--------|------|
| [`plan-doc-guard`](../../src/claude/plan/hooks/plan-doc-guard.js) | PreToolUse (Edit\|Write) | **BLOCKING** | 기획 문서 무결성 검증, 승인 게이트 우회 차단 |

### 3.4 copy 도메인 (5)

| Hook | Event | Action | 역할 |
|------|-------|--------|------|
| [`copy-scope-guard`](../../src/claude/copy/hooks/copy-scope-guard.js) | PreToolUse (Edit\|Write) | REMINDER | 실행 단위 범위 밖 편집 경고 |
| [`copy-evidence-reminder`](../../src/claude/copy/hooks/copy-evidence-reminder.js) | PostToolUse (Edit\|Write) | REMINDER | 시각/인터랙션 파일 수정 시 evidence 갱신 안내 |
| [`copy-doc-drift-check`](../../src/claude/copy/hooks/copy-doc-drift-check.js) | PostToolUse (Edit\|Write) | REMINDER | 구현 파일과 copy 문서 간 drift 감지 |
| [`copy-variant-env-guard`](../../src/claude/copy/hooks/copy-variant-env-guard.js) | PostToolUse (Edit\|Write) | REMINDER | variant/host map 환경 변수 변경 시 QA 안내 |
| [`copy-gate-stop`](../../src/claude/copy/hooks/copy-gate-stop.js) | Stop | REMINDER (기본 비활성) | Phase/R 종료 후 자동 진행 안내 |

## 4. 차단이 발생했을 때

### 4.1 TDD 가드에 막혔을 때

에러 메시지 예:
```
❌ [dev-tdd-guard] 테스트 없는 편집 차단
   대상: src/services/user.ts
   매칭되는 테스트 없음. 다음 중 하나를 먼저 작성하세요:
   - src/services/user.test.ts
   - src/services/__tests__/user.ts
```

**대응**:
1. 테스트 파일을 먼저 작성 (Red 단계)
2. 실행해서 실패 확인
3. 그 다음에 구현 파일 편집 가능 (Green)

면제가 필요하면 hook 소스의 `TS_EXEMPT_PATTERNS` 배열에 패턴 추가 (주의 깊게).

### 4.2 DB 가드에 막혔을 때

```
❌ [dev-db-guard] 위험한 DB 명령 차단
   명령: DROP TABLE users
   프로덕션 데이터 파괴 위험. 마이그레이션 스크립트로 처리하세요.
```

**대응**:
- 마이그레이션 파일을 만들어 git-tracked 상태로 처리
- 테스트 환경이면 `.env` 로 명시하고 별도 세션에서 실행

### 4.3 Plan doc 가드에 막혔을 때

```
❌ [plan-doc-guard] 승인 게이트 우회 시도
   .plans/features/active/foo/prd.md 편집 차단
   /plan-screen 결과가 승인 상태여야 /plan-draft 가능
```

**대응**: 승인 단계 절차대로 실행 (`/plan-screen` → 사용자 승인 → `/plan-draft`).

## 5. Hook 개발 표준

새 hook 작성 시 다음 구조를 따릅니다 (dev-tdd-guard 참조).

```js
#!/usr/bin/env node
/**
 * Hook: {이름}
 * Event: {PreToolUse|PostToolUse|Stop} [(matcher)]
 * Action: {BLOCKING|REMINDER|LOG} (exit {0|2}) — {한 줄 설명}
 */
'use strict';

// stdin 으로 JSON 입력 받기
let input = '';
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  const payload = JSON.parse(input);
  // 로직...
  if (shouldBlock) {
    console.log('❌ [hook-name] 메시지');
    process.exit(2);
  }
  process.exit(0);
});
```

자세한 컨벤션은 기여자 가이드에 통합 예정입니다 ([../40-contributing/02-adding-a-component.md](../40-contributing/02-adding-a-component.md), P4 예정).

## 6. Codex 에서의 가드

Codex 는 hook 매처 문법이 제한적이라 일부 가드는 **부분 지원 또는 skip** 됩니다. 자세한 분류는 [04-multi-target.md](04-multi-target.md) §5 참조.

실제 Codex 설치본에 포함된 hook 목록: `plugins/claude-kit/hooks.json` 생성 결과 확인.

## 7. 가드 비활성화

**원칙**: 가드는 비활성화하지 않습니다. 차단 이유가 있다면 그 이유를 해결.

불가피하게 비활성화가 필요하면:
- 일시적: `.claude/settings.local.json` 에 해당 hook 항목을 `"enabled": false` 로 오버라이드 (개인 환경 한정)
- 영구적: `profile.json` 에서 해당 도메인 제거 (전체 기능 함께 사라짐)
- 예외 사유: `src/exception-registry.json` 에 기록

## 다음 읽기

- [../30-reference/04-hooks.md](../30-reference/04-hooks.md) — hook 전체 카탈로그 (자동 생성)
- [01-core-domain.md](01-core-domain.md), [02-dev-domain.md](02-dev-domain.md), [03-plan-domain.md](03-plan-domain.md) — 도메인별 컨텍스트
