# Glossary

> **Status**: Draft (P4, 2026-04-17) — 알파벳순 용어 사전
> **Source**: 수기 정리 + [../00-overview/02-core-concepts.md](../00-overview/02-core-concepts.md)
> **Related**: [../00-overview/02-core-concepts.md](../00-overview/02-core-concepts.md) (개념 설명 중심)

용어 빠른 조회용 사전. 개념 배경이 필요하면 [Core Concepts](../00-overview/02-core-concepts.md) 참조.

## A

**Agent (에이전트)** — 특화된 역할을 가진 서브 에이전트. 메인 세션이 Agent tool 로 호출. `.claude/agents/*.md` 파일, frontmatter 로 정의. 예: `dev-architect`, `plan-prd-writer`.

**AGENTS.md** — Codex 타깃의 런타임 컨텍스트 파일. `CLAUDE.md` 의 Codex 쌍둥이.

**Archive (아카이브)** — `docs/archive/YYYY-MM-DD/` 에 동결된 설계·리뷰 이력. 내용은 그대로, 링크만 유지.

## B

**Blocking hook** — `exit 2` 로 도구 호출을 차단하는 hook. 예: `dev-tdd-guard`. 반대말: Reminder hook.

**Bridge (브리지)** — plan 도메인의 `/plan-bridge` 로 만든 핸드오프 산출물. dev 도메인이 이를 `/dev-feature` 입력으로 사용.

## C

**Claude Code** — Anthropic 의 AI 코딩 에이전트 CLI/IDE 통합. claude-kit 의 주 타깃.

**Claude-only** — pairing status 중 하나. Claude 에만 자산이 존재하고 Codex 에는 아직 없음.

**Codex** — OpenAI 의 AI 코딩 에이전트 CLI. claude-kit 의 이차 타깃.

**Command (커맨드)** — 슬래시 명령. `/dev-feature`, `/plan-prd` 등. `.claude/commands/*.md` 로 정의.

**Core domain (core 도메인)** — 항상 설치되는 공통 가드레일 도메인. opt-out 불가.

**copy domain (copy 도메인)** — UI 충실도 관리 도메인. opt-in.

## D

**Decision Log** — 주요 설계 결정 축약 문서. `docs/00-overview/04-decision-log.md`.

**dev domain (dev 도메인)** — 구현 파이프라인 도메인. 기본 활성.

**Domain (도메인)** — 응집된 커맨드·에이전트·스킬·훅·규칙의 꾸러미. `profile.json` 의 `domains` 배열로 선택.

**Drift (드리프트)** — pairing 된 자산 간 내용 불일치. `audit-drift.js` 로 탐지.

## E

**Evidence (증거)** — copy 도메인에서 쓰는 시각 자료 (스크린샷 등). evidence manifest 로 추적.

**Exception registry** — skip 사유를 기록하는 `src/exception-registry.json`. "의도적 미포팅" 을 추적.

## F

**Feature Package** — `/dev-feature` 가 생성하는 `.plans/features/active/<slug>/` 디렉터리. TASK 목록과 구조 계약 포함.

## G

**Golden Principles** — core 도메인 rule 중 하나. 12가지 핵심 원칙 (`src/claude/core/rules/golden-principles.md`).

**Governance Guards** — hook 기반 자동 가드 메커니즘의 총칭.

## H

**HARD-GATE** — Golden Principle #9. 새 기능/아키텍처 변경/API·DB 변경 시 설계 승인 전 코딩 금지.

**Hook (훅)** — 도구 호출 시점에 실행되는 JS. `PreToolUse`/`PostToolUse`/`Stop` 등 이벤트에 연결. `.claude/hooks/*.js`.

## I

**Identity (자산 식별자)** — pairing registry 에서 같은 자산을 Claude·Codex 양쪽에 매핑하는 키. 예: `output-secret-filter`.

## K

**kit domain (kit 도메인)** — claude-kit 자체의 메타 관리 자산. `kit-*` 컴포넌트. `.claude/` 가 SSOT (역방향).

**kit-managed section** — `CLAUDE.md`/`AGENTS.md` 안의 `<!-- kit:managed:start -->` ~ `<!-- kit:managed:end -->` 블록. 재설치 시 교체됨.

## L

**Lite feature** — `/plan-draft` 판정 중 하나. 파일 1-2개·API/DB 변경 없는 소규모. 바로 브리지.

**Local settings** — `.claude/settings.local.json`. 개인 환경 오버라이드, 커밋하지 않음.

## M

**Marker (마커)** — `<!-- kit:managed -->` 류의 주석 표식. 렌더러·머저가 영역 구분에 사용.

**MCP** — Model Context Protocol. Claude 는 지원, Codex v1 은 제외.

**Multi-target** — Claude + Codex 양 타깃 동시 지원. `profile.json` 의 `targets` 배열.

## P

**Pairing** — Claude 자산 ↔ Codex 자산 매칭 상태. `src/pairing-registry.json` 에 기록.

**plan domain (plan 도메인)** — 기획 파이프라인 도메인. opt-in.

**PRD** — Product Requirements Document. `/plan-prd` 로 생성.

**Profile (프로필)** — `profile.json`. 설치 시 활성 도메인·타깃·스택을 정의.

## Q

**Quick Start** — 설치 직후 루트에 생성되는 `CLAUDE-KIT-QUICKSTART.md` 온보딩 문서.

## R

**Reminder hook** — `exit 0` 으로 안내만 하고 차단하지 않는 hook. 반대말: Blocking hook.

**RICE** — Reach × Impact × Confidence / Effort. `/plan-screen` 의 스크리닝 프레임.

**Rule (규칙)** — `.claude/rules/*.md`. 세션 시작 시 상시 컨텍스트로 로드되는 원칙 문서.

## S

**Scaffold (스캐폴드)** — 초기 구조 생성. P2 에서 placeholder 30개를 만든 것.

**Session-wrap** — 세션 종료 시 정리·후속 작업 제안 스킬.

**Skill (스킬)** — 컨텍스트 자동 로드되는 가이드. `SKILL.md` 파일.

**Skip** — pairing status 중 하나. 의도적으로 Codex 에 포팅하지 않음. 사유는 `exception-registry.json`.

**Slash command** — `/` 로 시작하는 커맨드.

**SSOT** — Single Source of Truth. claude-kit 에서는 주로 `src/claude/` 또는 `src/codex/`.

**Standard feature** — `/plan-draft` 판정 중 하나. 3+ 파일·아키텍처 영향. `/plan-prd` 필수.

## T

**Target (타깃)** — 설치 대상 에이전트 플랫폼. `claude`, `codex` 중 선택.

**TASK** — Feature Package 의 작업 단위. `T-FE-01`, `T-BE-01` 등의 ID.

**TDD guard** — `dev-tdd-guard.js`. 테스트 없는 편집 차단 hook.

**Toolchain** — `src/claude/_meta/`, `scripts/` 일대. 빌드·검증 유틸.

## V

**Variant** — copy 도메인의 사이트 버전 식별자 (`kr`, `jp` 등). `SITE_VARIANT` 환경 변수.

**Verification** — 완료 주장 전 증거 수집 절차. `verification.md` 규칙.

## 약어

| 약어 | 풀이 |
|------|------|
| DVC | Document-Verification Consistency |
| HARD-GATE | Golden Principle #9 의 설계 승인 강제 |
| PRD | Product Requirements Document |
| RICE | Reach·Impact·Confidence·Effort |
| SSOT | Single Source of Truth |
| STRIDE | Spoofing·Tampering·Repudiation·Information disclosure·Denial of service·Elevation of privilege |
| TDD | Test-Driven Development |

## 다음

- [../00-overview/02-core-concepts.md](../00-overview/02-core-concepts.md) — 개념 배경
- [../30-reference/](../30-reference/) — 실제 컴포넌트 카탈로그
