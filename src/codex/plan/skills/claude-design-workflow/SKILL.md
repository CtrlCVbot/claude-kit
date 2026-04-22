---
name: claude-design-workflow
description: >
  Claude Design 통합 워크플로우 가이드. PRD + Wireframe 통합 기반 2단계 프롬프트(wireframe → high fidelity) 생성, SCR-ID 강제 주입 규칙, fidelity 모드 선택 기준, 디자인 시스템 연동. Use when: plan-design 실행, Claude Design 프롬프트 작성, wireframe 후속 시각 자산 생성.
---

## Overview

Anthropic이 2026-04-17 출시한 Claude Design을 claude-kit plan 파이프라인에 통합하는 워크플로우 (Codex 대응본). PRD(요구사항) + Wireframe(구조)을 통합하여 Claude Design 프롬프트 2개를 순차 생성하고, 사용자가 claude.ai/design에서 수동 실행 후 결과 URL을 등록한다.

**스코프 제한**: Claude Design은 브라우저 GUI 전용 → API/CLI 자동 호출 불가. 자동화 범위는 "프롬프트 생성 + 결과 등록".

Claude sibling: `src/claude/plan/skills/claude-design-workflow/SKILL.md` (전체 가이드 참조).

## Prerequisites

- wireframe 단계 완료 (`.plans/wireframes/{slug}/`)
- PRD 승인본 또는 first-pass
- routing-metadata (plan-draft-writer 선행)
- (사용자) Claude Pro/Max/Team/Enterprise 구독

## 2단계 프롬프트

### 1단계 Wireframe

목적: rough 시안. 레이아웃/컴포넌트/네비게이션 중심. 브랜드 최소.
템플릿: `_templates/design-prompt-wireframe.template.md`

### 2단계 High Fidelity

목적: wireframe 결과 기준 유지 + 브랜드/타이포/마이크로인터랙션 완성.
템플릿: `_templates/design-prompt-highfidelity.template.md`

## 프롬프트 생성 규칙 요약

- PRD + Wireframe 둘 다 필수 (하나라도 없으면 거부)
- SCR-ID ↔ Wireframe 매핑 강제 (누락 시 경고, `--ignore-mismatch`로 우회)
- fidelity 플래그: 생략=둘 다 / wireframe / high

## 사용자 워크플로우

```
1. plan-prd {slug}
2. plan-wireframe {slug}       # 필수 선행
3. plan-design {slug}          # 2단계 프롬프트 생성
4. (수동) claude.ai/design 실행 (1단계 → 2단계)
5. plan-design {slug} --register <url>
6. plan-bridge {slug}
```

## 관련 파일

- 커맨드: `src/codex/plan/commands/plan-design.md`
- 에이전트: `src/codex/plan/agents/plan-design-writer.md`
- 템플릿: `src/codex/plan/_templates/design-prompt-{wireframe,highfidelity}.template.md`
- 매니페스트: `src/codex/plan/_templates/design-manifest.template.md`
- 스키마: `src/codex/plan/_schemas/routing-metadata.schema.json`
- 스펙: `docs/archive/kit-2.2.0-roadmap/03-p0-detailed-specs/IMP-KIT-027-plan-design-integration.md`
- Claude sibling: `src/claude/plan/skills/claude-design-workflow/SKILL.md`
