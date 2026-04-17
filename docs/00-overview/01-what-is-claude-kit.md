# What is claude-kit

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../../README.md](../../README.md), [../../package.json](../../package.json), [../../CLAUDE.md](../../CLAUDE.md)

## 한 줄 정의

**claude-kit 은 AI 코딩 에이전트 (Claude Code, Codex) 를 위한 거버넌스·워크플로우 인프라 패키지** 입니다. 설치만 하면 TDD 강제, Hexagonal + Clean Architecture, Rich Domain Model 가드레일, 그리고 기획·구현·리뷰의 전체 파이프라인이 프로젝트에 탑재됩니다.

## 비유

식당을 열 때 "주방·메뉴·위생 규칙·서빙 동선"을 처음부터 설계하는 대신, **검증된 프랜차이즈 키트**를 사 오는 것에 가깝습니다. 키트에는 레시피(커맨드), 요리사 역할(에이전트), 조리 루틴(스킬), 위생 센서(훅), 매장 규칙(rules) 이 들어 있습니다.

## 해결하는 문제

| Pain | claude-kit 의 답 |
|------|----------------|
| 에이전트가 테스트 없이 코드를 뱉어냄 | `dev-tdd-guard.js` 훅이 테스트 없는 편집을 차단 |
| 아키텍처 스타일이 프로젝트마다 제각각 | Hexagonal + Clean Architecture 를 기본값으로 강제 |
| "다음 단계가 뭐였지" 를 매번 상기 | 도메인별 슬래시 커맨드 (`/dev-feature`, `/plan-prd`, `/copy-verify` 등) 로 파이프라인화 |
| Claude 에서만 쓰던 자산을 Codex 에서도 재사용 | `targets: ["claude", "codex"]` 듀얼 설치 + pairing-registry 로 매핑 |
| 기획·구현 사이 단절 | `plan/` 도메인 (아이디어 → PRD → 브리지) + `dev/` 도메인 (PRD → Feature Package → TDD 구현) |
| 세션 종료 시 노하우 증발 | `session-wrap`, `continuous-learning` 스킬이 후속 작업·학습 포인트 자동 추출 |

## 핵심 가치

1. **규칙은 자동으로 작동한다** — 훅(hook) 이 도구 호출을 가로채서 실시간 차단/안내. 사람이 기억할 필요 없음
2. **도메인은 옵트인** — `profile.json` 에서 `core`, `dev`, `plan`, `copy` 등 필요한 것만 선택
3. **멀티 타깃** — 하나의 소스로 Claude Code 와 Codex 양쪽 설치. 자산 paring 추적
4. **증거 기반 완료** — `verification.md` 규칙으로 "실행 증거 없이 완료 주장 금지" 를 강제

## 무엇이 아닌가

- **새로운 에이전트 프레임워크가 아닙니다**. Claude Code 와 Codex CLI 위에 얹히는 **규칙·자산 번들**입니다
- **단독 CLI 도구가 아닙니다**. 설치 시 프로젝트의 `.claude/`, `CLAUDE.md` 등에 편입되어 동작합니다
- **UI 가 없습니다**. 모든 상호작용은 에이전트 CLI 의 슬래시 커맨드와 자동 훅을 통해 일어납니다

## Claude Code vs Codex

| 측면 | Claude Code | Codex |
|------|-------------|-------|
| 설치 경로 | `.claude/` | `plugins/claude-kit/` |
| 런타임 컨텍스트 | `CLAUDE.md` | `AGENTS.md` |
| 훅 지원 범위 | Full | Partial (매처 한정) |
| 규칙 전달 방식 | `.claude/rules/*.md` 파일 | `AGENTS.md` 내 흡수 |
| MCP | 지원 | v1 제외 |

자산 pairing 과 skip 정책은 [Multi-Target 문서](../10-features/04-multi-target.md) 및 [Pairing Registry 레퍼런스](../30-reference/07-pairing-registry.md) 참조.

## 다음 단계

- 설치하고 싶다면: [User Guide → Installation](../20-user-guide/01-installation.md)
- 개념 용어가 궁금하다면: [Core Concepts](02-core-concepts.md)
- 전체 아키텍처가 궁금하다면: [Architecture at a Glance](03-architecture-at-a-glance.md)
- 왜 이 구조를 골랐는지: [Decision Log](04-decision-log.md)
