# Core Concepts

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../../README.md](../../README.md), [../../src/templates/profile.json.template](../../src/templates/profile.json.template), 계획서 §3.2
> **Related**: [용어집(P4 예정)](../20-user-guide/08-glossary.md)

이 문서는 claude-kit 을 처음 이해할 때 알아야 하는 7가지 핵심 개념을 설명합니다. 다른 문서를 읽기 전 이 개념들을 먼저 익히는 것을 권장합니다.

## 1. Domain (도메인)

**기능 단위 묶음**. 하나의 도메인은 서로 응집된 커맨드·에이전트·스킬·훅·규칙의 꾸러미입니다.

| 도메인 | 역할 | 주요 산출 |
|--------|------|----------|
| `core` | 항상 포함. 공통 가드레일 | hooks, rules, skills (session-wrap, continuous-learning) |
| `dev` | 요구사항이 있는 상태에서 바로 구현 | `/dev-feature`, `/dev-run`, dev-architect, TDD guard |
| `plan` | 아이디어 → PRD → 개발 브리지 | `/plan-idea`, `/plan-prd`, plan-prd-writer |
| `copy` | 레퍼런스 대비 UI 충실도 관리 | `/copy-visual-review`, copy-evidence-reminder |
| `kit` | kit 자체의 메타 관리 | `/kit-create`, `/kit-validate`, kit-maintainer (저장소 한정) |

활성 도메인은 `profile.json` 의 `domains` 배열로 선택합니다. 기본값은 `["core", "dev"]`.

## 2. Target (타깃)

**설치 대상 에이전트 플랫폼**. 같은 소스 (`src/claude/`) 에서 여러 타깃 아티팩트가 생성됩니다.

| Target | 출력 위치 | 컨텍스트 파일 |
|--------|----------|--------------|
| `claude` (기본) | `.claude/` | `CLAUDE.md` |
| `codex` | `plugins/claude-kit/` | `AGENTS.md` |

`profile.json` 의 `targets` 배열로 선택. 생략 시 `["claude"]`.

## 3. Component Types (컴포넌트 타입)

| 타입 | 무엇 | 파일 형식 | 트리거 |
|------|------|----------|-------|
| **Command** | 사용자가 입력하는 슬래시 명령 | `*.md` | `/command-name` 입력 |
| **Agent** | 특화된 서브 에이전트 | `*.md` (frontmatter) | 메인이 Agent tool 로 호출 |
| **Skill** | 컨텍스트 자동 로드되는 가이드 | `SKILL.md` | 대화 맥락 매칭 시 자동 |
| **Hook** | 도구 호출 시점에 실행되는 JS | `*.js` | `PreToolUse`, `PostToolUse`, `Stop` 등 |
| **Rule** | 모든 세션에 로드되는 상시 규칙 | `*.md` | 세션 시작 시 |

전체 카탈로그는 [레퍼런스](../30-reference/) 참조.

## 4. Pairing (페어링)

**Claude 자산 ↔ Codex 자산 매칭 상태**. 듀얼 타깃일 때 같은 identity 를 가진 자산이 두 타깃에 각각 존재하는지, 어느 쪽에만 있는지 추적합니다.

| Status | 의미 |
|--------|------|
| `paired` | 양쪽 모두 존재, 동기화됨 |
| `claude-only` | Claude 에만 존재 (아직 Codex 포팅 전) |
| `codex-only` | Codex 에만 존재 |
| `skip` | 고의적 미포팅 (Codex 미지원 등) |

레지스트리: [`src/pairing-registry.json`](../../src/pairing-registry.json) + [`src/exception-registry.json`](../../src/exception-registry.json). 현 상태는 [30-reference/07-pairing-registry.md](../30-reference/07-pairing-registry.md) 에서 자동 생성.

## 5. SSOT (Single Source of Truth)

| 자산 | SSOT 위치 | `.claude/` 에 있는 같은 파일은 |
|------|----------|-------------------------------|
| core/dev/plan/copy 컴포넌트 | `src/claude/{domain}/...` | setup.js 가 복사한 **사본** (수동 수정 금지) |
| kit-* 컴포넌트 | `.claude/{...}/kit-*` | **자체가 SSOT** (`src/` 에 없음) |
| Codex 컴포넌트 | `src/codex/{domain}/...` | — |
| 규칙 (rules) | `src/claude/core/rules/*.md` | `.claude/rules/` 은 복사본 |

`.claude/` 의 사본을 직접 고치면 다음 `pnpm install` (또는 `pnpm update claude-kit`) 실행 시 `postinstall` 훅이 돌면서 덮어쓰기됩니다. 항상 SSOT 수정 후 재설치.

## 6. Guard Hooks (가드 훅)

Claude Code 가 도구를 호출하는 순간 사이에 끼어드는 **JavaScript 훅**. claude-kit 이 "규칙을 사람이 기억할 필요 없게" 만드는 핵심 메커니즘입니다.

주요 가드 예시:
- **`dev-tdd-guard.js`**: 테스트 없는 `Edit|Write` 를 `exit 2` 로 차단
- **`dev-db-guard.js`**: 위험한 DB 명령 Bash 실행 차단
- **`dev-feature-scope-guard.js`**: Feature Package 범위 밖 편집 경고
- **`copy-evidence-reminder.js`**: 시각/인터랙션 파일 수정 시 evidence 갱신 안내

전체 목록: [30-reference/04-hooks.md](../30-reference/04-hooks.md) (자동 생성).

## 7. Profile (프로필)

**설치 시 활성 범위를 정하는 JSON 파일**. 프로젝트 루트 `profile.json` 에 위치하며, `domains` 와 `targets` 를 통해 어떤 자산을 어디로 설치할지 결정합니다.

최소 예시:
```json
{
  "domains": ["core", "dev"],
  "targets": ["claude"]
}
```

자세한 필드는 [User Guide → Configuration](../20-user-guide/02-configuration.md) 참조.

---

## 다음 읽기

- [Architecture at a Glance](03-architecture-at-a-glance.md) — 위 개념들이 어떻게 물리적 디렉터리/스크립트 구조로 매핑되는지
- [Decision Log](04-decision-log.md) — 왜 도메인·타깃·SSOT 를 이렇게 갈랐는지
- [User Guide → Installation](../20-user-guide/01-installation.md) — 직접 설치해보기
