<!-- kit-convert generated: 2026-04-16 -->
# plan-bridge — Codex Entry Flow

## Overview

기획 산출물을 개발 파이프라인으로 넘기기 전에 브리지 컨텍스트와 개발 구조 게이트 상태를 확인한다.

## Invocation

```
plan-bridge {slug}
```

## Inputs

- 승인된 PRD: `.plans/prd/10-approved/{slug}-prd.md`
- 선택 입력: `.plans/wireframes/{slug}/`, `.plans/stitch/{slug}/`

## Workflow

1. 승인된 PRD가 존재하는지 확인한다.
2. 와이어프레임, 스티치, 참고 메모가 있으면 브리지 컨텍스트로 정리한다.
3. 아래 브리지 문서를 생성하거나 갱신한다:
   - `.plans/features/active/{slug}/00-context/03-bridge-wireframe.md`
   - `.plans/features/active/{slug}/00-context/04-bridge-stitch.md`
   - `.plans/features/active/{slug}/00-context/05-bridge-context.md`
4. 프로젝트 구조 SSOT를 확인한다.
   - 필수: `.plans/project/00-dev-architecture.md`
   - 이 문서가 없거나 승인 상태가 아니면 여기서 중단하고 `dev-architecture {slug}`를 먼저 실행한다.
5. 기능 구조 바인딩을 확인한다.
   - 필수: `.plans/features/active/{slug}/00-context/06-architecture-binding.md`
   - 바인딩이 없으면 `dev-architecture {slug}`에서 감지 또는 결정을 먼저 수행한다.
6. 구조 게이트가 충족되면 `dev-feature {slug}`로 넘긴다.

## Output

- 기획 산출물을 개발 문서가 참조할 수 있는 브리지 컨텍스트로 정리
- 프로젝트 구조 SSOT와 기능 구조 바인딩 존재 여부 확인
- 다음 단계 안내: `dev-feature {slug}`

## Rules

- 이 단계에서는 코드를 만들지 않는다.
- 구조가 이미 있는 저장소라도 문서화되지 않았다면 구조 게이트를 통과한 것으로 간주하지 않는다.
- 개발 구조 판단의 단일 기준은 `.plans/project/00-dev-architecture.md`다.
- 기능별 경로 판단의 단일 기준은 `.plans/features/active/{slug}/00-context/06-architecture-binding.md`다.

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/plan/commands/plan-bridge.md
