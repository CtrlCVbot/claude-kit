---
allowed-tools: Read, Grep, Glob
description: claude-kit의 모든 컴포넌트를 도메인/타입별로 조회합니다.
argument-hint: '[--domain <domain>] [--type <type>] [--target claude|codex|both] [--pairing] [--verbose]'
---

# /kit-list

`src/claude/` (및 `src/codex/`) 소스 트리를 스캔하여 전체 컴포넌트 현황을 출력한다.

## Usage

```bash
/kit-list                       # 전체 요약
/kit-list --domain <domain>     # 도메인별
/kit-list --type <type>         # 타입별
/kit-list --verbose             # 설명 포함
```

## 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--domain` | 도메인 필터 (`core`, `dev`, `plan`) | 전체 |
| `--type` | 타입 필터 (`skill`, `agent`, `command`, `hook`, `rule`) | 전체 |
| `--verbose` | description 포함 출력 | 꺼짐 |
| `--target` | 타깃 필터 (`claude`/`codex`/`both`) | `both` |
| `--pairing` | 페어링 상태 표시 | 꺼짐 |

## Workflow

### Phase 1: 스캔

1. `src/claude/` 하위를 스캔한다:
   - `src/claude/{domain}/skills/` → `SKILL.md`가 있는 디렉토리
   - `src/claude/{domain}/agents/` → `*.md` 파일
   - `src/claude/{domain}/commands/` → `*.md` 파일
   - `src/claude/{domain}/hooks/` → `*.js` 파일 (`package.json` 제외)
   - `src/claude/core/rules/` → `*.md` 파일
2. `src/codex/`도 스캔하되, 비어있으면 생략한다.

### Phase 2: 메타데이터 추출

3. 각 컴포넌트에서 메타데이터를 추출한다:
   - skills: `name`, `description` (YAML frontmatter)
   - agents: `name`, `description`, `model`, `tools` (YAML frontmatter)
   - commands: `description` (frontmatter 또는 첫 문단)
   - hooks: Event, Action (JSDoc 헤더)
   - rules: 제목 (첫 번째 `#` 헤딩)

### Phase 3: 출력

4. 도메인별, 타입별로 그룹핑하여 출력한다.

## 출력 포맷 (기본)

```
[kit-list] claude-kit 컴포넌트 현황

  core (N)
    rules (6):    coding-style, date-calculation, golden-principles,
                  interaction, security, verification
    hooks (5):    code-quality-reminder, edit-tracker, output-secret-filter,
                  security-auto-trigger, session-wrap-suggest
    skills (2):   continuous-learning, session-wrap

  dev (N)
    skills (15):  dev-architecture-decision, dev-domain-modeling, ...
    agents (6):   dev-architect [opus,RO], dev-code-reviewer [opus,RO], ...
    commands (N): dev-architecture, dev-build-fix, ...
    hooks (3):    dev-db-guard [Pre,BLOCK], dev-feature-scope-guard [Pre,BLOCK],
                  dev-tdd-guard [Pre,BLOCK]

  plan (N)
    skills (8):   plan-archive-workflow, plan-idea-management, ...
    agents (6):   plan-idea-collector [sonnet], plan-prd-writer [opus], ...
    commands (N): plan-archive, plan-bridge, ...
    hooks (1):    plan-doc-guard [Pre,BLOCK]

  총계: N 컴포넌트
```

## 출력 포맷 (--verbose)

```
  dev agents (6):
    dev-architect        [opus, RO] 시스템 설계, 확장성, 기술적 의사결정 전문가
    dev-code-reviewer    [opus, RO] 코드 품질, 네이밍, 패턴 일관성 검토
    ...
```

에이전트는 `[model, RO/WR]` 주석을, 훅은 `[Pre/Post/Stop, BLOCK/log]` 주석을 표시한다.

## Rules

- 스캔은 읽기 전용이다. 파일을 수정하지 않는다.
- `_archive/`, `node_modules/`, `.git/` 디렉토리는 제외한다.
- `package.json`은 hook 카운트에서 제외한다.
