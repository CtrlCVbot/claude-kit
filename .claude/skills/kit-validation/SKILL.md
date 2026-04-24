---
name: kit-validation
description: |
  claude-kit 컴포넌트 검증 엔진. 12개 스키마(Claude 5 + Codex 4 + Registry 3)로 skill, agent, command,
  hook, rule의 표준 준수 여부를 검증한다. /kit-validate와 /kit-audit가 이 스킬을 참조한다.
---

# kit-validation

컴포넌트가 표준 패턴을 준수하는지 스키마 기반으로 검증한다.

## 스키마 목록 (12종: Claude 5 + Codex 4 + Registry 3)

### Claude 스키마

| # | 스키마 | 대상 | 핵심 검증 |
|---|--------|------|-----------|
| 1 | schema-skill.md | `src/claude/{domain}/skills/` | frontmatter, 디렉토리명 일치, 워크플로우 |
| 2 | schema-agent.md | `src/claude/{domain}/agents/` | 6 YAML 필드, Agent_Prompt XML 10섹션, Read-Only 일관성 |
| 3 | schema-command.md | `src/claude/{domain}/commands/` | 간단/복합 판별, 제목 패턴, Phase 구조 |
| 4 | schema-hook.md | `src/claude/{domain}/hooks/` | shebang, JSDoc, 이벤트별 exit 코드, fail-open |
| 5 | schema-rule.md | `src/claude/core/rules/` | frontmatter 없음, 도메인 접두사 없음, Why/How |

### Codex 스키마

| # | 스키마 | 대상 | 핵심 검증 |
|---|--------|------|-----------|
| 6 | schema-codex-skill.md | `src/codex/{domain}/skills/` | frontmatter, Codex 참고 사항 |
| 7 | schema-codex-agent.md | `src/codex/{domain}/agents/` | 헤딩 기반 섹션, Agent_Prompt XML 없음 |
| 8 | schema-codex-command.md | `src/codex/{domain}/commands/` | Entry Flow, 슬래시 커맨드 없음 |
| 9 | schema-codex-hook.md | `src/codex/{domain}/hooks/` | Codex hooks 제약, 등록 주석 |

### Registry 스키마

| # | 스키마 | 대상 | 핵심 검증 |
|---|--------|------|-----------|
| 10 | schema-exception-registry.md | `src/exception-registry.json` | $schema, entries, 필수 필드, id 형식, status enum (active/resolved/expired/revoked), Phase 1 SSOT 필드 (strategy/officialSurface/evidenceLevel/docConstraints/fallbackTarget), 조건부 무결성 (paired-direct sibling 존재, paired-fallback fallbackTarget 필수, hooks platform 제약), Phase 2 artifact 무결성 (paired-fallback resolved + agents_md → AGENTS.md.template h3 존재 검증), Phase 3 hook fallback artifact 무결성 (paired-fallback resolved + skill fallbackTarget → src/claude/{domain}/skills/{component}/SKILL.md 존재 검증), policy-review-pending INFO |
| 11 | schema-codex-portability.md | `src/claude/_meta/codex-portability.json` | $schema=codex-portability-v1, vocabulary 4 enum 일치, 15 entries 필드 (identity/type/strategy/officialSurface/evidenceLevel/fallbackTarget), exception-registry cross-check, codexSource 파일 존재 (paired-direct), Phase 5 신규 (codex-sync cross-phase review CC5) |
| 12 | schema-pairing-registry.md | `src/pairing-registry.json` | $schema=pairing-registry-v1/v2, entries type/status/domain enum, v2 transitionState/primaryCodex/driftStatus 검증, paired sibling 파일 존재, codex-skip reason 필수, codex-native-only claude=null, codex-sync vocabulary mapping cross-check |

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

## 공통 검증 (모든 컴포넌트 타입)

### TODO 잔존 검사 (T-TMPL-12, M6)

**수준**: WARN

**조건**: 파일 본문에 `TODO:` 또는 `TODO(...)` 패턴이 **3 개 이상** 존재하면 warning 발행.

**근거**: kit-scaffolding 으로 생성된 컴포넌트가 실제 구현 없이 TODO placeholder 상태로 커밋되는 것을 방지 (M6 이슈 — `docs/plan/templates-improvement-20260423/01-current-state.md §4.3`).

**예외**:
- 주석 내 `// TODO:` 향후 개선 계획은 허용 — 수는 2 개 이하 유지 권장
- 룰 문서의 `TODO(작성 전 삭제)` 같은 **의도된 안내 라벨**은 허용 (2 개 이하)

**수정 방법**: scaffolding 직후 각 TODO 를 실제 내용으로 치환. 모든 섹션 작성 완료 후 커밋.

**적용 대상**: 5 Claude 스키마 (skill/agent/command/hook/rule) 전체 + 4 Codex 스키마 전체.

**관련 룰**: [`template-governance.md §6`](../../../../src/claude/core/rules/template-governance.md) Non-Duplication

## 참조

- 커맨드: `.claude/commands/kit-validate.md`
- 설계 문서: `docs/archive/2026-04-17/meta-tooling/03-validation-schemas.md`
