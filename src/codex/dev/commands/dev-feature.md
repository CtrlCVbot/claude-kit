<!-- kit-convert generated: 2026-04-17 -->
<!-- REVIEW NEEDED: complex command -->
# dev-feature — Codex Entry Flow

## Overview

승인된 PRD를 Feature Overview와 Feature Package로 전환한다. 이때 모든 경로, 레이어, 공유 정책은 아키텍처 SSOT와 기능 바인딩을 기준으로 고정한다.

> 참조: `.claude/skills/dev-feature-plan/SKILL.md`

## Invocation

```bash
dev-feature {slug}
dev-feature .plans/prd/10-approved/{slug}-prd.md
```

## Invocation (Preconditions)

- 승인된 PRD가 존재한다.
- `.plans/project/00-dev-architecture.md`가 존재하고 승인 상태다.
- `.plans/features/active/{slug}/00-context/06-architecture-binding.md`가 존재한다.
- Feature 유형 확인: `07-routing-metadata.md`가 있으면 Feature 유형(copy/dev)을 읽는다.
  - Feature 유형이 `copy`이면 copy 도메인 경로(갭 분석, evidence 관리)가 선행되었는지 확인한다.
  - copy Feature에서 넘어온 경우 bridge context에 시나리오/유형 메타데이터가 포함되어야 한다.

위 조건이 충족되지 않으면 `dev-architecture {slug}`를 먼저 실행한다.

## Workflow

### Phase A: Context Build

1. PRD, 브리지 문서, 프로젝트 구조 SSOT, 기능 구조 바인딩을 함께 읽는다.
2. Lite 또는 Standard 범위를 결정한다.
3. 아래 컨텍스트 문서를 생성하거나 갱신한다.
   - `00-context/00-index.md`
   - `00-context/01-prd-freeze.md`
   - `00-context/02-decision-log.md`
4. `02-package/00-overview.md`를 작성한다.
5. Overview에는 아래 구조 계약을 반드시 포함한다.
   - `Structure Mode`
   - `Allowed Target Paths`
   - `Layer Mapping`
   - `Stack Contract`
   - `Shared-vs-Local Rule`
6. PRD와 Overview 사이의 일관성과 구조 정합성을 점검한다.

### Phase B: Human Review

7. PRD 요약, 구조 계약, 미결정 사항을 사용자에게 보여주고 확인을 받는다.
8. 확인 전에는 Feature Package를 완성하지 않는다.

### Phase C: Feature Package

9. 승인된 Overview를 기준으로 Feature Package 문서를 생성한다.
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
10. Overview와 Package 사이의 REQ, TASK, TC 추적 관계를 채운다.
11. `dev-run {feature-root}`에 필요한 경로 계약이 문서에 모두 있는지 확인한다.

## Rules

- Phase A와 Phase B에서는 문서만 다루고 코드는 만들지 않는다.
- `apps/{app}/features/{feature}` 같은 고정 구조를 가정하지 않는다.
- 경로, 패키지, 레이어 명칭은 반드시 구조 SSOT와 기능 바인딩을 따른다.
- 구조 바인딩 밖에 코드를 생성해야 하는 상황이면 먼저 바인딩을 갱신한다.
- `01-requirements.md`가 요구사항 정의의 SSOT다.

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/dev/commands/dev-feature.md
