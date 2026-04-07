---
allowed-tools: Read, Grep, Glob
description: claude-kit 컴포넌트의 표준 준수 여부를 검증합니다.
argument-hint: '[component] [--type <type>] [--domain <domain>] [--target claude|codex] [--verbose]'
---

# /kit-validate

컴포넌트가 스키마에 정의된 표준 패턴을 준수하는지 검증한다.

> 참조: `.claude/skills/kit-validation/SKILL.md`

## Usage

```bash
/kit-validate                          # 전체 검증
/kit-validate <component-name>         # 특정 컴포넌트
/kit-validate --type <type>            # 타입별 검증
/kit-validate --domain <domain>        # 도메인별 검증
```

## 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `component-name` | 검증할 컴포넌트 이름 | 전체 |
| `--type` | 타입 필터 (`skill`, `agent`, `command`, `hook`, `rule`) | 전체 |
| `--domain` | 도메인 필터 (`core`, `dev`, `plan`) | 전체 |
| `--verbose` | 상세 출력 | 꺼짐 |
| `--target` | 타깃 플랫폼 (`claude` / `codex`) | `claude` |

주의: /kit-validate는 authoring source만 검증한다. `.codex/agents/*.toml` 등 runtime artifact는 대상 아님.

## Workflow

### Phase 1: 대상 식별

1. `--target`에 따라 스캔 대상을 결정한다:
   - `--target claude` (기본): `src/claude/` 스캔, `schema-{type}.md` 사용
   - `--target codex`: `src/codex/` 스캔, `schema-codex-{type}.md` 사용
2. `--type`이나 `--domain`으로 필터링한다.
3. 각 컴포넌트의 타입을 경로 기반으로 판별한다:
   - `src/claude/{domain}/skills/{name}/SKILL.md` → skill
   - `src/claude/{domain}/agents/{name}.md` → agent
   - `src/claude/{domain}/commands/{name}.md` → command
   - `src/claude/{domain}/hooks/{name}.js` → hook
   - `src/claude/core/rules/{name}.md` → rule

### Phase 2: 스키마 로드 + 검증

4. 타입에 맞는 `.claude/skills/kit-validation/references/schema-{type}.md`를 참조한다.
5. 스키마의 각 검증 항목을 순서대로 적용한다:

#### skill 검증
- [ ] SKILL.md 파일 존재
- [ ] YAML frontmatter에 `name`, `description` 존재
- [ ] `name` 값이 디렉토리 이름과 일치
- [ ] 도메인 접두사 올바름 (`{domain}-*`)
- [ ] 필수 섹션 존재 (개요, 워크플로우)

#### agent 검증
- [ ] 6개 YAML frontmatter 필드 (`name`, `description`, `tools`, `model`, `memory`, `color`)
- [ ] `<Agent_Prompt>` XML 태그 존재
- [ ] 필수 XML 섹션: `Role`, `Constraints`, `Output_Format` 등
- [ ] Read-Only 일관성 (tools ↔ Constraints)
- [ ] `tools` 배열 형식 유효

#### command 검증
- [ ] 파일명이 도메인 접두사 포함
- [ ] 제목 존재 (`# /...`)
- [ ] Workflow/Phase 섹션 존재

#### hook 검증
- [ ] shebang (`#!/usr/bin/env node`) 존재
- [ ] JSDoc 헤더 (Hook, Event, Action) 존재
- [ ] stdin 파싱 코드 존재
- [ ] 이벤트별 exit 코드 준수
- [ ] fail-open 패턴 (catch에서 exit(0))
- [ ] 동일 디렉토리에 `package.json` 존재

#### rule 검증
- [ ] YAML frontmatter 없음
- [ ] 파일명에 도메인 접두사 없음
- [ ] Why/How 원칙 구조 존재

### Phase 3: 결과 출력

6. 각 컴포넌트별 PASS/WARN/FAIL을 출력한다:

```
[kit-validate] 검증 결과

  dev-architect (agent)
    [PASS] YAML frontmatter 완전
    [PASS] Agent_Prompt XML 존재
    [PASS] 필수 섹션 존재 (Role, Constraints, Output_Format)
    [PASS] Read-Only tools 일관성
    [WARN] Failure_Modes 섹션 누락 (권장)

  dev-tdd-guard (hook)
    [PASS] shebang 존재
    [PASS] JSDoc 헤더
    [PASS] stdin 파싱
    [PASS] exit(2) 차단
    [PASS] fail-open 패턴

  총계: N 컴포넌트 / X PASS / Y WARN / Z FAIL
```

## Rules

- 검증은 읽기 전용이다. 파일을 수정하지 않는다.
- FAIL 항목이 있으면 총계에 "FAIL" 표시를 강조한다.
- `--verbose` 시 PASS 항목도 모두 출력한다. 기본은 WARN + FAIL만.
