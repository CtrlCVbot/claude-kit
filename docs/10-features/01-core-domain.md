# Core Domain

> **Status**: Draft (P4, 2026-04-17)
> **Source**: `src/claude/core/`, [../30-reference/04-hooks.md](../30-reference/04-hooks.md), [../30-reference/05-rules.md](../30-reference/05-rules.md)
> **Related**: [Core Concepts](../00-overview/02-core-concepts.md)

`core` 도메인은 **프로젝트와 무관하게 항상 적용되는 공통 가드레일** 입니다. TDD 나 아키텍처 같은 프로젝트별 정책이 아니라, "AI 에이전트 사용 시 기본으로 있어야 하는 안전장치" 를 제공합니다.

## 역할

| 계층 | 제공 |
|------|------|
| 규칙 (rules) | 모든 세션에 상시 로드되는 원칙 문서 |
| 훅 (hooks) | 도구 호출을 가로채는 JS 가드 |
| 스킬 (skills) | 세션 관리 및 학습 자동화 |

옵트아웃 불가. `profile.json` 에서 `core` 를 빼도 무시되고 항상 설치됩니다 (README §설치 참조).

## 1. Rules — 상시 로드되는 원칙

| 규칙 | 역할 |
|------|------|
| [`golden-principles.md`](../../src/claude/core/rules/golden-principles.md) | 12가지 핵심 원칙 (불변성, TDD, 작은 파일·함수, 증거 기반 완료 등) |
| [`coding-style.md`](../../src/claude/core/rules/coding-style.md) | 불변성, 파일 구성, 에러 처리, 입력 검증, 품질 체크리스트 |
| [`security.md`](../../src/claude/core/rules/security.md) | 시크릿 관리, SQL 인젝션·XSS 방지, 원격 세션 보안 |
| [`verification.md`](../../src/claude/core/rules/verification.md) | "증거 없는 완료 주장 금지" — Iron Law 및 게이트 함수 |
| [`date-calculation.md`](../../src/claude/core/rules/date-calculation.md) | 날짜·시간 계산 시 `date`/`python3` 필수 사용 |
| [`interaction.md`](../../src/claude/core/rules/interaction.md) | 가정 명시, 비유 사용, 결론 우선, WebFetch 금지 |

이 규칙들은 설치 시 `.claude/rules/` 에 복사되며, Claude Code 세션 시작 시 컨텍스트로 자동 로드됩니다.

## 2. Hooks — 자동 가드

### 2.1 blocking hooks (exit 2 로 도구 호출 차단)

현재 `core` 도메인에는 **blocking hook 이 없습니다**. core 는 유연한 가드만 제공하고, 강한 차단은 `dev` / `plan` / `copy` 도메인 전용입니다.

### 2.2 reminder hooks (exit 0, 안내만)

| Hook | Event | 역할 |
|------|-------|------|
| [`output-secret-filter.js`](../../src/claude/core/hooks/output-secret-filter.js) | PostToolUse | 출력에서 시크릿 패턴 탐지·마스킹 |
| [`edit-tracker.js`](../../src/claude/core/hooks/edit-tracker.js) | PostToolUse (Edit\|Write) | 편집 파일을 `.ai/.edit-log.json` 에 기록 |
| [`code-quality-reminder.js`](../../src/claude/core/hooks/code-quality-reminder.js) | PostToolUse | 파일 크기, 중첩 깊이 등 품질 메트릭 알림 |
| [`security-auto-trigger.js`](../../src/claude/core/hooks/security-auto-trigger.js) | PostToolUse | 보안 패턴 감지 시 `/security-review` 제안 |
| [`session-wrap-suggest.js`](../../src/claude/core/hooks/session-wrap-suggest.js) | Stop | 세션 종료 시 후속 작업 제안 |

## 3. Skills — 컨텍스트 자동 로드

| 스킬 | 트리거 |
|------|--------|
| [`continuous-learning`](../../src/claude/core/skills/continuous-learning/SKILL.md) | Hook 관찰 기반 instinct 추출, 점수화, 스킬/커맨드로 진화 |
| [`session-wrap`](../../src/claude/core/skills/session-wrap/SKILL.md) | 세션 종료 시 4개 병렬 subagent 로 문서·패턴·학습·후속 작업 탐지 |
| [`session-wrap-suggest`](../../src/claude/core/skills/session-wrap-suggest/SKILL.md) | 활발한 작업 후 `/session-wrap` 실행 제안 (hook fallback) |

## 4. 설치 시 동작

`setup.js` 가 core 도메인을 처리할 때:

```
src/claude/core/rules/*.md     → .claude/rules/
src/claude/core/hooks/*.js     → .claude/hooks/
src/claude/core/skills/*/      → .claude/skills/
```

hooks 는 `.claude/settings.json` 의 `PreToolUse`/`PostToolUse`/`Stop` 배열에도 등록됩니다 (생성 규칙은 [settings 문서](../30-reference/06-settings.md) 참조).

## 5. 확장

새 core 레벨 가드를 추가하려면 `src/claude/core/` 하위에 파일을 두고 `scripts/setup.js` 의 해당 복사 로직에 포함되도록 합니다. 자세한 절차: [../40-contributing/02-adding-a-component.md](../40-contributing/02-adding-a-component.md) (P4 예정).

## 다음 읽기

- [02-dev-domain.md](02-dev-domain.md) — 구현 파이프라인
- [05-governance-guards.md](05-governance-guards.md) — hook 기반 가드의 전체 그림
