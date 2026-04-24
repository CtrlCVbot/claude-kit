---
name: dev-feature-plan
description: 승인된 PRD를 구조 계약 기반 Feature Overview와 Feature Package로 전환한다. /dev-feature에서 참조한다.
user-invocable: false
---
<!-- kit:managed source=src/codex/dev/skills/dev-feature-plan/SKILL.md hash=fab9c5682040f2148d8692b8d0c7dfb4eeb1b08bc07f9ff65fb3889feac6b407 -->

# Dev Feature Plan

이 스킬은 PRD를 개발 가능한 Feature Package로 바꾸되, 먼저 프로젝트 구조 SSOT와 기능 구조 바인딩을 읽고 그 계약 안에서만 문서를 만든다.

## Required Reads

1. 승인된 PRD
2. 브리지 문서
   - `03-bridge-wireframe.md`
   - `04-bridge-stitch.md`
   - `05-bridge-context.md`
3. 프로젝트 구조 SSOT
   - `.plans/project/00-dev-architecture.md`
4. 기능 구조 바인딩
   - `.plans/features/active/{slug}/00-context/06-architecture-binding.md`

구조 SSOT나 기능 바인딩이 없으면 문서 생성을 계속하지 말고 `/dev-architecture {slug}`를 먼저 요구한다.

## Phase A: Context Build

### A1. PRD Analysis

- Scope, non-scope, edge case, 권한, API/DB 영향도를 추출한다.
- 이미 수립된 구조가 있으면 그 구조를 덮어쓰지 않는다.

### A2. Lite or Standard Decision

- Lite는 단일 화면, 단순 상태, 외부 연동 없음, 데이터 모델 영향이 작을 때만 허용한다.
- 그 외에는 Standard를 기본으로 둔다.

### A3. Promote Context

다음 문서를 생성하거나 갱신한다.

- `.plans/features/active/{slug}/00-context/00-index.md`
- `.plans/features/active/{slug}/00-context/01-prd-freeze.md`
- `.plans/features/active/{slug}/00-context/02-decision-log.md`

### A4. Feature Overview

`02-package/00-overview.md`에는 아래 계약이 반드시 있어야 한다.

- `Structure Mode`
- `Allowed Target Paths`
- `Layer Mapping`
- `Stack Contract`
- `Shared-vs-Local Rule`

이 다섯 항목은 기능 바인딩의 값을 재해석 없이 옮겨 적고, 필요한 설명만 덧붙인다.

### A5. Phase A Checks

- PRD와 Overview 사이의 누락을 찾는다.
- Overview와 구조 SSOT 사이의 충돌을 찾는다.
- 기능 바인딩 경로 밖으로 요구사항이 새어 나가지 않는지 확인한다.

## Phase B: Human Review

- 사용자에게 PRD 요약, 구조 계약, 미결정 사항만 짧게 보여준다.
- 확인 전에는 Feature Package 본문을 확정하지 않는다.
- 구조 변경이 필요한 피드백이면 먼저 구조 SSOT 또는 기능 바인딩부터 갱신한다.

## Phase C: Feature Package

다음 문서를 구조 계약에 맞춰 작성한다.

- `01-requirements.md`
- `02-ui-spec.md`
- `03-flow.md` 필요 시
- `04-api-spec.md` 필요 시
- `05-db-migration-spec.md` 필요 시
- `06-domain-logic.md`
- `07-error-handling.md` 필요 시
- `08-dev-tasks.md`
- `09-test-cases.md`
- `10-release-checklist.md`

## Package Rules

- `01-requirements.md`만 요구사항 정의의 SSOT다.
- 모든 TASK와 TC는 REQ를 참조해야 한다.
- 경로 예시는 바인딩 문서의 실제 경로를 사용한다.
- 구조가 `route-scoped`, `feature-scoped`, `hybrid`, `type-based` 중 무엇이든 바인딩이 우선이다.
- 공유 모듈이 필요하면 `Shared-vs-Local Rule`에 따라 shared로 승격할지 feature local로 유지할지 결정한다.

## Done Condition

- Overview와 Package가 모두 구조 계약을 명시한다.
- 구현 단계가 참고할 실제 target path와 test path가 문서에 있다.
- 다음 단계로 `/dev-run .plans/features/active/{slug}`를 안내할 수 있다.

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/skills/dev-feature-plan/SKILL.md`
