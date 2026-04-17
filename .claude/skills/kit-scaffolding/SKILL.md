---
name: kit-scaffolding
description: |
  claude-kit 컴포넌트 스캐폴딩 엔진. 12개 템플릿(Claude 8 + Codex 4)으로 듀얼 타깃
  컴포넌트를 표준 패턴에 맞게 생성한다. /kit-create 커맨드가 이 스킬을 참조한다.
---

# kit-scaffolding

`/kit-create` 커맨드의 핵심 엔진. 템플릿을 로드하고 변수를 치환하여 새 컴포넌트를 생성한다.

## 변수 치환 시스템

> 이 치환 시스템은 `scripts/setup.js:substituteVars()`와 별개이다. `{{VAR}}` 문법만 동일.

### 변수 목록

| 변수 | 설명 | 예시 |
|------|------|------|
| `{{DOMAIN}}` | 도메인 | `dev` |
| `{{NAME}}` | 이름 (kebab-case) | `cache-manager` |
| `{{FULL_NAME}}` | 도메인-이름 | `dev-cache-manager` |
| `{{DESCRIPTION}}` | 한줄 설명 | `캐시 관리 워크플로우` |
| `{{MODEL}}` | 모델 | `opus`, `sonnet`, `haiku` |
| `{{TOOLS}}` | 도구 배열 (JSON) | `["Read", "Grep", "Glob"]` |
| `{{COLOR}}` | 에이전트 색상 | `blue`, `green`, `yellow` |
| `{{MATCHER}}` | 훅 매처 | `Edit\|Write` |
| `{{ALLOWED_TOOLS}}` | 커맨드 도구 | `Read, Grep, Glob` |
| `{{CONSTRAINTS}}` | 에이전트 제약 | 아키타입별 기본 문구 |

### 치환 순서

1. 사용자 입력 + 아키타입 기본값에서 변수 값 수집
2. 치환: `DOMAIN` → `NAME` → `FULL_NAME` → 나머지 (FULL_NAME이 NAME을 포함하므로)
3. 치환 후 YAML/JSON 구문 확인

## 템플릿 목록 (12종: Claude 8 + Codex 4)

### Claude 템플릿

| # | 템플릿 | 대상 타입 | 생성 경로 |
|---|--------|----------|-----------|
| 1 | template-skill.md | skill | `src/claude/{domain}/skills/{full_name}/SKILL.md` |
| 2 | template-agent.md | agent | `src/claude/{domain}/agents/{full_name}.md` |
| 3 | template-command-simple.md | command (--simple) | `src/claude/{domain}/commands/{full_name}.md` |
| 4 | template-command-complex.md | command (--complex) | `src/claude/{domain}/commands/{full_name}.md` |
| 5 | template-hook-pre.md | hook (--pre) | `src/claude/{domain}/hooks/{full_name}.js` |
| 6 | template-hook-post.md | hook (--post) | `src/claude/{domain}/hooks/{full_name}.js` |
| 7 | template-hook-stop.md | hook (--stop) | `src/claude/{domain}/hooks/{full_name}.js` |
| 8 | template-rule.md | rule | `src/claude/core/rules/{name}.md` |

### Codex 템플릿

| # | 템플릿 | 대상 타입 | 생성 경로 |
|---|--------|----------|-----------|
| 9 | template-codex-skill.md | skill | `src/codex/{domain}/skills/{full_name}/SKILL.md` |
| 10 | template-codex-agent.md | agent | `src/codex/{domain}/agents/{full_name}.md` |
| 11 | template-codex-command.md | command | `src/codex/{domain}/commands/{full_name}.md` |
| 12 | template-codex-hook.md | hook | `src/codex/{domain}/hooks/{full_name}.js` |

## 에이전트 아키타입 (3종)

| 아키타입 | --flag | tools 기본값 | color | Constraints 기본 문구 |
|----------|--------|-------------|-------|----------------------|
| Read-Only | `--readonly` | `["Read", "Grep", "Glob"]` | `blue` | "Write/Edit 도구를 절대 사용하지 않음. 읽기 전용 분석 에이전트." |
| Write | `--write` | `["Read", "Write", "Edit", "Grep", "Glob", "Bash"]` | `green` | "안전한 항목만 자동 수정. 판단 필요 항목은 보고." |
| Monitor | `--monitor` | `["Read", "Grep", "Glob", "Bash"]` | `yellow` | "파일을 수정하지 않음. 관찰 결과만 보고." |

## 워크플로우

1. `/kit-create`가 `type`, `domain`, `name`, 옵션 파싱
2. 타입에 맞는 `references/template-{type}.md` 로드
3. 아키타입 기본값 적용 (agent인 경우)
4. 변수 매핑 테이블 구성
5. `{{VAR}}` 패턴을 실제 값으로 치환
6. 대상 경로에 파일/디렉토리 생성
7. 훅인 경우 `package.json` 동반 파일 확인
8. 생성 결과 출력 + 후속 작업 안내

## 참조

- 커맨드: `.claude/commands/kit-create.md`
- 설계 문서: `docs/archive/2026-04-17/meta-tooling/01-scaffolding-templates.md`
