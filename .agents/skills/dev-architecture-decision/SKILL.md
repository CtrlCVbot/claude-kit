---
name: dev-architecture-decision
description: 개발 구조를 감지하거나 추천하는 규칙. `/dev-architecture`, `/plan-bridge`, `/dev-feature`에서 구조 SSOT와 feature binding을 만들 때 참조.
---
<!-- kit:managed source=src/codex/dev/skills/dev-architecture-decision/SKILL.md hash=32ecbf549daf00d1e56e1754ad4f2d5ff6ac2b3631fa171fa23ecaf7c57eef97 -->

# Dev Architecture Decision

개발 구조는 “좋아 보이는 패턴”을 고르는 작업이 아니라, 현재 리포의 증거를 읽고 가장 일관된 구조를 고정하는 작업이다.

## 목표

- 이미 존재하는 구조를 우선 채택한다
- 구조가 없을 때만 기본 추천을 사용한다
- feature package가 실제 경로를 따를 수 있도록 binding을 만든다

## 입력

- `profile.json`
- `package.json`
- `pnpm-workspace.yaml`, `turbo.json` 등 workspace 파일
- `apps/`, `packages/`, `app/`, `src/`, `features/`
- 기존 테스트 디렉터리 패턴
- PRD 및 bridge context

## 결정 우선순위

1. 기존 코드 구조
2. 현재 프로젝트의 stack/runtime 제약
3. feature의 복잡도
4. 팀의 기본 추천

## 구조 모드 판별 규칙

### route-scoped

다음 증거가 강하면 route-scoped다.

- `app/**/page.tsx` 또는 route group 중심
- route 안에 `components/`, `hooks/`, `lib/`가 같이 존재
- page/route 단위로 UI와 액션이 묶여 있음

### feature-scoped

다음 증거가 강하면 feature-scoped다.

- `features/{name}` 구조가 반복
- route/page는 얇고 feature module을 조합
- feature 내부에 presentation/application/infrastructure 성격의 파일이 모여 있음

### hybrid

다음이 함께 있으면 hybrid다.

- 단순 route-local 구현과 복잡한 feature-local 구현이 동시에 존재
- 공통 규칙은 있으나 모든 기능이 같은 구조를 따르지 않음

### type-based

다음 증거가 강하면 type-based다.

- 전역 `components/`, `hooks/`, `lib/`가 중심
- feature 또는 route 단위 지역화가 약함
- 작은 MVP 또는 초반 구조

## TypeScript 우선 기본 추천

기존 구조 증거가 약하면 다음을 추천한다.

- workspace topology: `monorepo`
- structure mode: `route-scoped`
- layer style: `hexagonal`
- framework: `Next.js App Router`
- test runner: `Vitest`

## Layer Mapping 규칙

레이어 매핑은 구조 모드와 별개로 적는다.

| Layer | 설명 |
|------|------|
| Domain | 순수 비즈니스 규칙 |
| Application | use case, command/query, orchestration |
| Ports | interface 계약 |
| Infrastructure | persistence, external IO, framework adapters |
| Presentation | route, component, action entry |

## Feature Binding 규칙

binding은 요약 문서가 아니라 실제 구현 경로 계약이다.

반드시 적어야 할 것:

- allowed target paths
- recommended test paths
- shared package touch points
- layer mapping notes

## 금지 규칙

- 기존 구조가 있는데 새 구조를 덮어쓰는 추천
- `monorepo`, `hexagonal`, `clean architecture`를 하나의 축처럼 설명
- feature binding 없이 `/dev-run` 또는 `/dev-verify`로 넘어가기

## 출력 형식

### Architecture Profile

- status
- detection summary
- workspace topology
- structure mode
- layer style
- stack contract
- layer mapping
- verification contract

### Architecture Binding

- feature slug
- source profile
- selected structure mode
- allowed target paths
- recommended test paths
- verification notes

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/skills/dev-architecture-decision/SKILL.md`
