# Commands 명세

> 4개 kit-* 커맨드의 상세 명세

## 1. /kit-create -- 통합 스캐폴딩 커맨드

**파일**: `.claude/commands/kit-create.md`

### Usage

```bash
/kit-create <type> <domain> <name> [options]
```

### 파라미터

| 인자 | 설명 | 필수 | 예시 |
|------|------|------|------|
| `type` | 컴포넌트 타입 | O | `skill`, `agent`, `command`, `hook`, `rule` |
| `domain` | 대상 도메인 | O* | `core`, `dev`, `plan` |
| `name` | 컴포넌트 이름 (kebab-case) | O | `cache-manager` |
| `--pre` | PreToolUse 훅 (hook 전용) | - | |
| `--post` | PostToolUse 훅 (hook 전용) | - | |
| `--simple` | 간단 커맨드 (command 전용) | - | |
| `--complex` | 복합 커맨드 (command 전용, 기본값) | - | |
| `--stop` | Stop 이벤트 훅 (hook 전용) | - | |
| `--readonly` | 읽기 전용 에이전트 (agent 전용) | - | |
| `--target` | 타깃 플랫폼 (`claude`/`codex`/`both`) | - | 타입별 기본값 |
| `--skip-codex` | Codex sibling 생략 + 사유 | - | `"사유 문자열"` |

*`rule` 타입은 항상 `core` 도메인이므로 `domain` 생략 가능

### 타깃 기본 동작 (codex-compatibility/04-asset-mapping-rules 기반)

| 타입 | 기본 --target | 근거 |
|------|--------------|------|
| agent | `both` | required codex sibling |
| command | `both` | required codex sibling |
| skill | `claude` | optional codex sibling |
| hook | `claude` | optional codex sibling |
| rule | `claude` | claude-origin shared |

### 옵션 선택 가이드

**command**: simple vs complex
| 조건 | --simple | --complex (기본) |
|------|----------|-----------------|
| 도구 제한이 필요한가? | X | O (`allowed-tools` frontmatter) |
| 다중 옵션/플래그 파싱이 있는가? | X | O (파라미터 테이블) |
| 단순 절차만 기술하면 충분한가? | O | X |

> 간단 커맨드도 `allowed-tools`만 필요하면 최소 frontmatter를 가질 수 있다. 이 경우 `--simple` 후 수동 추가.

**hook**: --pre vs --post vs --stop
| 이벤트 | 용도 | 차단 가능 |
|--------|------|----------|
| `--pre` (기본) | 도구 실행 전 규칙 강제 | O (exit 2) |
| `--post` | 도구 실행 후 로깅/추적 | X |
| `--stop` | 세션 종료 시 정리/제안 | X |

**agent**: --readonly vs --write vs --monitor
| 아키타입 | 파일 수정 | Bash 실행 |
|----------|----------|----------|
| `--readonly` (기본) | X | X |
| `--write` | O | O |
| `--monitor` | X | O |

### 사용 예시

```bash
# 스킬 생성
/kit-create skill dev cache-manager

# 읽기 전용 에이전트 생성
/kit-create agent plan feasibility-checker --readonly

# 간단 커맨드 생성
/kit-create command dev lint-fix --simple

# 복합 커맨드 생성
/kit-create command dev batch-test --complex

# PreToolUse 훅 생성
/kit-create hook dev import-guard --pre

# PostToolUse 훅 생성
/kit-create hook core metric-logger --post

# 룰 생성 (domain 생략)
/kit-create rule error-handling

# 에이전트: Claude + Codex 양쪽 생성 (기본)
/kit-create agent dev arch-checker

# 에이전트: Codex 생략 + 사유
/kit-create agent dev arch-checker --skip-codex "Codex subagent 포맷 미확정"

# 스킬: Codex용으로도 생성
/kit-create skill dev cache-manager --target both
```

### 워크플로우

```
1. 인자 파싱 + 유효성 검증
   ├─ type: 5개 허용 값 확인
   ├─ domain: 3개 허용 값 확인 (rule은 core 고정)
   ├─ name: kebab-case 검증
   ├─ --target: 타입별 기본값 결정 (agent/command → both, 나머지 → claude)
   └─ options: 타입별 유효 옵션 확인

2. 경로 충돌 확인
   └─ src/claude/ (및 --target both/codex 시 src/codex/) 경로 확인

3. 템플릿 로드
   ├─ Claude: kit-scaffolding/references/template-{type}.md
   └─ Codex:  kit-scaffolding/references/template-codex-{type}.md (Phase 4)

4. 변수 매핑
   ├─ {{DOMAIN}} = domain
   ├─ {{NAME}} = name
   ├─ {{FULL_NAME}} = {domain}-{name}
   ├─ {{TARGET}} = claude / codex
   ├─ {{DESCRIPTION}} = 사용자 입력 또는 기본값
   └─ 타입별 추가 변수 (MODEL, TOOLS, COLOR 등)

5. 파일 생성 (타깃별)
   ├─ Claude (--target claude 또는 both):
   │   ├─ skill: src/claude/{domain}/skills/{full_name}/SKILL.md
   │   ├─ agent: src/claude/{domain}/agents/{full_name}.md
   │   ├─ command: src/claude/{domain}/commands/{full_name}.md
   │   ├─ hook: src/claude/{domain}/hooks/{full_name}.js + package.json
   │   └─ rule: src/claude/core/rules/{name}.md
   └─ Codex (--target codex 또는 both, Phase 4):
       ├─ skill: src/codex/{domain}/skills/{full_name}/SKILL.md
       ├─ agent: src/codex/{domain}/agents/{full_name}.md
       ├─ command: src/codex/{domain}/commands/{full_name}.md
       └─ hook: src/codex/{domain}/hooks/{full_name}.js

6. 페어링 레지스트리 갱신 (Phase 4)
   ├─ --target both → status: "paired"
   ├─ --skip-codex → status: "codex-skip", reason 기록
   ├─ --target codex → status: "codex-native-only"
   └─ --target claude (agent/command) → 경고: "required codex sibling"

7. 후속 안내
   ├─ hook: "scripts/setup.js:buildHooksConfig()에 등록 필요" 알림
   ├─ agent (--target both): "Codex sibling의 TODO 섹션을 채우세요" 알림
   └─ 공통: "다음 단계" 안내
```

### 생성 결과 출력 포맷

```
[kit-create] 컴포넌트 생성 완료

  타입:   skill
  도메인: dev
  이름:   dev-cache-manager
  경로:   src/claude/dev/skills/dev-cache-manager/SKILL.md

  다음 단계:
  1. SKILL.md의 TODO 섹션을 채우세요
  2. /kit-validate dev-cache-manager 로 검증하세요
```

### Frontmatter

```yaml
---
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
description: claude-kit 컴포넌트를 표준 패턴으로 스캐폴딩합니다.
argument-hint: <type> <domain> <name> [--pre|--post] [--simple|--complex] [--readonly]
---
```

---

## 2. /kit-validate -- 컴포넌트 검증 커맨드

**파일**: `.claude/commands/kit-validate.md`

### Usage

```bash
/kit-validate                          # 전체 검증
/kit-validate <component-name>         # 특정 컴포넌트
/kit-validate --type <type>            # 타입별 검증
/kit-validate --domain <domain>        # 도메인별 검증
```

### 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `component-name` | 검증할 컴포넌트 이름 | 전체 |
| `--type` | 타입 필터 | 전체 |
| `--domain` | 도메인 필터 | 전체 |
| `--fix` | 자동 수정 가능 항목 처리 | 꺼짐 |
| `--verbose` | 상세 출력 | 꺼짐 |

### 사용 예시

```bash
# 전체 검증
/kit-validate

# 특정 컴포넌트
/kit-validate dev-architect

# 에이전트만
/kit-validate --type agent

# plan 도메인만
/kit-validate --domain plan

# 자동 수정 포함
/kit-validate --fix
```

### 검증 항목

#### Skills 검증
- [ ] `SKILL.md` 파일 존재
- [ ] YAML frontmatter에 `name`, `description` 존재
- [ ] `name` 값이 디렉토리 이름과 일치
- [ ] 도메인 접두사가 올바름 (`{domain}-*`)
- [ ] 필수 섹션 존재 (개요, 워크플로우)

#### Agents 검증
- [ ] 6개 YAML frontmatter 필드 존재 (`name`, `description`, `tools`, `model`, `memory`, `color`)
- [ ] `<Agent_Prompt>` XML 태그 존재
- [ ] 필수 XML 섹션: `Role`, `Constraints`, `Output_Format`
- [ ] read-only 에이전트의 `tools` 배열에 `Write`/`Edit` 미포함
- [ ] `tools` 배열 형식 유효

#### Commands 검증
- [ ] 파일명이 도메인 접두사 포함 (`{domain}-*.md`)
- [ ] 제목 존재 (`# /...`)
- [ ] Workflow/Phase 섹션 존재

#### Hooks 검증
- [ ] shebang (`#!/usr/bin/env node`) 존재
- [ ] JSDoc 헤더 (Hook, Event, Action) 존재
- [ ] stdin 파싱 코드 존재
- [ ] PreToolUse 훅: exit(2) 차단 코드 존재
- [ ] PostToolUse 훅: exit(2) 미사용
- [ ] fail-open 패턴 (catch에서 exit(0))
- [ ] 동일 디렉토리에 `package.json` 존재

#### Rules 검증
- [ ] YAML frontmatter 없음
- [ ] 파일명에 도메인 접두사 없음
- [ ] Why/How 원칙 구조 존재

### 출력 포맷

```
[kit-validate] 검증 결과

  dev-architect (agent)
    [PASS] YAML frontmatter 완전
    [PASS] Agent_Prompt XML 존재
    [PASS] 필수 섹션 존재 (Role, Constraints, Output_Format)
    [PASS] read-only tools 일관성
    [WARN] Failure_Modes 섹션 누락 (권장)

  dev-tdd-guard (hook)
    [PASS] shebang 존재
    [PASS] JSDoc 헤더
    [PASS] stdin 파싱
    [PASS] exit(2) 차단
    [PASS] fail-open 패턴

  총계: 84 컴포넌트 / 78 PASS / 4 WARN / 2 FAIL
```

### Frontmatter

```yaml
---
allowed-tools: Read, Grep, Glob
description: claude-kit 컴포넌트의 표준 준수 여부를 검증합니다.
argument-hint: '[component] [--type <type>] [--domain <domain>] [--fix] [--verbose]'
---
```

---

## 3. /kit-list -- 컴포넌트 목록 조회

**파일**: `.claude/commands/kit-list.md`

### Usage

```bash
/kit-list                       # 전체 요약
/kit-list --domain <domain>     # 도메인별
/kit-list --type <type>         # 타입별
/kit-list --verbose             # 설명 포함
```

### 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--domain` | 도메인 필터 | 전체 |
| `--type` | 타입 필터 | 전체 |
| `--verbose` | description 포함 | 꺼짐 |

### 워크플로우

```
1. src/claude/ + src/codex/ 스캔
   ├─ src/{target}/{domain}/skills/ → SKILL.md가 있는 디렉토리
   ├─ src/{target}/{domain}/agents/ → *.md 파일
   ├─ src/{target}/{domain}/commands/ → *.md 파일
   ├─ src/{target}/{domain}/hooks/ → *.js 파일
   └─ src/claude/core/rules/ → *.md 파일 (rules는 claude-origin shared)

2. 메타데이터 추출
   ├─ skills: name, description (frontmatter)
   ├─ agents: name, description, model, tools (frontmatter)
   ├─ commands: description (frontmatter 또는 첫 문단)
   ├─ hooks: Event, Action (JSDoc)
   └─ rules: 제목 (첫 번째 heading)

3. 그룹핑 + 정렬 + 출력
```

### 출력 포맷 (기본)

```
[kit-list] claude-kit 컴포넌트 현황

  core (13)
    rules (6):    coding-style, date-calculation, golden-principles,
                  interaction, security, verification
    hooks (5):    code-quality-reminder, edit-tracker, output-secret-filter,
                  security-auto-trigger, session-wrap-suggest
    skills (2):   continuous-learning, session-wrap

  dev (46)
    skills (15):  dev-architecture-decision, dev-domain-modeling, ...
    agents (6):   dev-architect [opus,RO], dev-code-reviewer [opus,RO], ...
    commands (22): dev-architecture, dev-build-fix, dev-checkpoint, ...
    hooks (3):    dev-db-guard [Pre,BLOCK], dev-feature-scope-guard [Pre,BLOCK],
                  dev-tdd-guard [Pre,BLOCK]

  plan (25)
    skills (8):   plan-archive-workflow, plan-idea-management, ...
    agents (6):   plan-idea-collector [sonnet], plan-prd-writer [opus], ...
    commands (10): plan-archive, plan-bridge, plan-draft, ...
    hooks (1):    plan-doc-guard [Pre,BLOCK]

  총계: 84 컴포넌트
```

### 출력 포맷 (--verbose)

```
  dev agents (6):
    dev-architect        [opus, RO] 시스템 설계, 확장성, 기술적 의사결정 전문가
    dev-code-reviewer    [opus, RO] 코드 품질, 네이밍, 패턴 일관성 검토
    dev-database-reviewer [opus, RO] DB 스키마, 쿼리, 마이그레이션 검토
    ...
```

### Frontmatter

```yaml
---
allowed-tools: Read, Grep, Glob
description: claude-kit의 모든 컴포넌트를 도메인/타입별로 조회합니다.
argument-hint: '[--domain <domain>] [--type <type>] [--verbose]'
---
```

---

## 4. /kit-audit -- 전수 감사 커맨드

**파일**: `.claude/commands/kit-audit.md`

### Usage

```bash
/kit-audit                    # 전체 감사
/kit-audit --category <cat>   # 카테고리별
/kit-audit --fix              # 자동 수정
```

### 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--category` | 감사 카테고리 필터 | 전체 (6개) |
| `--fix` | 자동 수정 가능 항목 처리 | 꺼짐 |
| `--verbose` | 상세 출력 | 꺼짐 |

### 감사 카테고리 (4개 필수 + 2개 선택)

#### C1: 구조 규약 (필수)
- 디렉토리 구조가 `src/{domain}/{category}/` 패턴 준수
- 스킬은 디렉토리 기반 (`SKILL.md`), 나머지는 파일 기반
- 훅 디렉토리에 `package.json` 존재

#### C2: 네이밍 규약 (필수)
- 모든 이름이 kebab-case
- 도메인 접두사 일관성 (`{domain}-*`)
- 룰은 도메인 접두사 없음
- 파일 확장자: skills/agents/commands는 `.md`, hooks는 `.js`

#### C3: 필드 완전성 (필수)
- `/kit-validate`와 동일한 검증을 전수 적용
- 필수 필드 누락, 형식 오류 탐지

#### C4: 교차 참조 (필수)
- 커맨드가 참조하는 스킬이 실제 존재하는지
- 스킬이 참조하는 훅이 실제 존재하는지
- 에이전트가 참조하는 도구가 유효한지

#### C5: setup.js 정합성 (선택)
- `scripts/setup.js:buildHooksConfig()`에 모든 훅이 등록되어 있는지
- `emitClaude()`/`emitCodex()`가 모든 도메인을 처리하는지
- 새 컴포넌트가 복사 대상에 포함되는지

#### C7: 페어링 일관성 (필수, Phase 4)
- pairing-registry.json에 있는 자산이 파일시스템에 실제 존재하는지
- 파일시스템의 자산이 레지스트리에 등록되어 있는지
- agent/command에 codex-skip인데 reason 없는 항목
- paired인데 한쪽 파일만 존재하는 항목

#### C6: 문서 정확성 (선택)
- README.md의 컴포넌트 카운트가 실제와 일치하는지
- `docs/guide/09-architecture.md`의 컴포넌트 목록이 최신인지
- 변경 이력이 CHANGELOG에 반영되었는지

### 출력 포맷

```
[kit-audit] 전수 감사 결과

  C1: 구조 규약
    [PASS] 모든 컴포넌트가 올바른 디렉토리 구조
    [FAIL] src/claude/dev/hooks/ 에 package.json 누락

  C2: 네이밍 규약
    [PASS] 전체 kebab-case 준수
    [WARN] dev-feature-scope-guard.js -- 이름이 32자 초과 (권장: 30자 이하)

  C3: 필드 완전성
    [PASS] 84/84 컴포넌트 필수 필드 충족

  C4: 교차 참조
    [FAIL] dev-run.md → dev-workflow 스킬 참조 → 경로 불일치

  C5: setup.js 정합성
    [PASS] buildHooksConfig()에 9/9 훅 등록 확인

  C6: 문서 정확성
    [WARN] README.md 카운트 "79" → 실제 "84"

  총계: 6 카테고리 / 4 PASS / 1 WARN / 1 FAIL
  자동 수정 가능: 1건 (--fix로 실행)
```

### 자동 수정 가능 항목

| 항목 | 자동 수정 내용 |
|------|---------------|
| package.json 누락 | `{"type": "commonjs"}` 생성 |
| README 카운트 불일치 | 실제 카운트로 갱신 |
| frontmatter name 불일치 | 디렉토리/파일명과 동기화 |

### Frontmatter

```yaml
---
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git:*)
description: claude-kit 전체 컴포넌트의 일관성을 전수 감사합니다.
argument-hint: '[--category <cat>] [--fix] [--verbose]'
---
```
