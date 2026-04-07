---
name: kit-validation
description: |
  claude-kit 컴포넌트 검증 엔진. 5개 Claude 스키마로 skill, agent, command, hook, rule의
  표준 준수 여부를 검증한다. /kit-validate와 /kit-audit가 이 스킬을 참조한다.
---

# kit-validation

컴포넌트가 표준 패턴을 준수하는지 스키마 기반으로 검증한다.

## 스키마 목록 (5종)

| # | 스키마 | 대상 | 핵심 검증 |
|---|--------|------|-----------|
| 1 | schema-skill.md | `src/claude/{domain}/skills/` | frontmatter, 디렉토리명 일치, 워크플로우 |
| 2 | schema-agent.md | `src/claude/{domain}/agents/` | 6 YAML 필드, Agent_Prompt XML 10섹션, Read-Only 일관성 |
| 3 | schema-command.md | `src/claude/{domain}/commands/` | 간단/복합 판별, 제목 패턴, Phase 구조 |
| 4 | schema-hook.md | `src/claude/{domain}/hooks/` | shebang, JSDoc, 이벤트별 exit 코드, fail-open |
| 5 | schema-rule.md | `src/claude/core/rules/` | frontmatter 없음, 도메인 접두사 없음, Why/How |

## 검증 수준

| 수준 | 의미 | 동작 |
|------|------|------|
| **FAIL** | 필수 요소 누락/위반 | 반드시 수정 필요 |
| **WARN** | 권장 요소 누락 | 권장되지만 선택적 |
| **PASS** | 기준 충족 | 정상 |

## 워크플로우

1. 검증 대상 컴포넌트 식별 (이름 또는 --type/--domain 필터)
2. 타입 판별 (경로 기반: skills/ → skill, agents/ → agent 등)
3. 해당 `references/schema-{type}.md` 로드
4. 스키마의 각 검증 항목을 순서대로 적용
5. 결과를 PASS / WARN / FAIL로 분류
6. 요약 리포트 생성

## 컴포넌트 타입 판별

| 경로 패턴 | 타입 |
|-----------|------|
| `src/claude/{domain}/skills/{name}/SKILL.md` | skill |
| `src/claude/{domain}/agents/{name}.md` | agent |
| `src/claude/{domain}/commands/{name}.md` | command |
| `src/claude/{domain}/hooks/{name}.js` | hook |
| `src/claude/core/rules/{name}.md` | rule |

## 참조

- 커맨드: `.claude/commands/kit-validate.md`
- 설계 문서: `docs/meta-tooling/03-validation-schemas.md`
