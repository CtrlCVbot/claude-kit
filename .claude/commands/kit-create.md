---
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
description: claude-kit 컴포넌트를 표준 패턴으로 스캐폴딩합니다.
argument-hint: <type> <domain> <name> [--target claude|codex|both] [--skip-codex "reason"] [--pre|--post|--stop] [--simple|--complex] [--readonly|--write|--monitor]
---

# /kit-create

새 claude-kit 컴포넌트를 표준 패턴에 맞게 생성한다.

> 참조: `.claude/skills/kit-scaffolding/SKILL.md`

## Usage

```bash
/kit-create <type> <domain> <name> [options]
```

## 파라미터

| 인자 | 설명 | 필수 | 허용 값 |
|------|------|------|---------|
| `type` | 컴포넌트 타입 | O | `skill`, `agent`, `command`, `hook`, `rule` |
| `domain` | 대상 도메인 | O* | `core`, `dev`, `plan`, `copy` |
| `name` | 이름 (kebab-case) | O | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |

*`rule` 타입은 항상 `core` 도메인이므로 생략 가능

### 타입별 옵션

| 옵션 | 대상 | 설명 | 기본값 |
|------|------|------|--------|
| `--readonly` | agent | 읽기 전용 아키타입 | 기본값 |
| `--write` | agent | 쓰기 아키타입 | |
| `--monitor` | agent | 모니터링 아키타입 | |
| `--simple` | command | 간단 커맨드 (frontmatter 없음) | |
| `--complex` | command | 복합 커맨드 (frontmatter 포함) | 기본값 |
| `--pre` | hook | PreToolUse (차단 가능) | 기본값 |
| `--post` | hook | PostToolUse (로깅) | |
| `--stop` | hook | Stop (세션 종료) | |
| `--target` | 전체 | 타깃 플랫폼 (`claude`/`codex`/`both`) | 타입별 기본값 |
| `--skip-codex` | agent, command | Codex sibling 생략 + 사유 | |

### 타깃 기본값

| 타입 | 기본 --target | 근거 |
|------|--------------|------|
| agent | `both` | required codex sibling |
| command | `both` | 기본 `command-primary`, skill 전환은 명시적 `dual-output` 후속 단계 |
| skill | `claude` | optional codex sibling |
| hook | `claude` | optional codex sibling |
| rule | `claude` | claude-origin (AGENTS.md.template inline merge로 Codex와 sharing, paired-fallback) |

### target 정책 매트릭스

| 타입 | `--target claude` | `--target codex` | `--target both` | `--skip-codex` |
|------|-------------------|-------------------|-----------------|----------------|
| agent | WARN (required sibling) | 허용 | 기본값 | 허용 (reason 필수) |
| command | WARN (transitionState 필요) | 허용 | 기본값 | 허용 (reason 필수) |
| skill | 기본값 | 허용 | 허용 | 불필요 (optional) |
| hook | 기본값 | 허용 | 허용 | 불필요 (optional) |
| rule | 기본값 | **거부** (discrete Codex sibling 없음 — `AGENTS.md.template` inline merge로 sharing) | **거부** | 불필요 |

## Workflow

### Phase 1: 파싱 + 검증

1. 인자에서 `type`, `domain`, `name`을 추출한다.
2. `type`이 5개 허용 값(`skill`, `agent`, `command`, `hook`, `rule`) 중 하나인지 확인한다.
3. `domain`이 4개 허용 값(`core`, `dev`, `plan`, `copy`) 중 하나인지 확인한다. `rule`은 `core` 고정이다. `kit`은 domain이 아니다.
4. `name`이 kebab-case 정규식을 통과하는지 확인한다.
5. `full_name` = `{domain}-{name}`으로 조합한다. (`rule`은 `name`만 사용, 도메인 접두사 없음)

### Phase 2: 경로 충돌 확인

6. 생성 경로를 결정한다:

| 타입 | 경로 |
|------|------|
| skill | `src/claude/{domain}/skills/{full_name}/SKILL.md` |
| agent | `src/claude/{domain}/agents/{full_name}.md` |
| command | `src/claude/{domain}/commands/{full_name}.md` |
| hook | `src/claude/{domain}/hooks/{full_name}.js` |
| rule | `src/claude/core/rules/{name}.md` |

**Codex 경로** (`--target codex` 또는 `both` 시):

| 타입 | Codex 경로 |
|------|-----------|
| skill | `src/codex/{domain}/skills/{full_name}/SKILL.md` |
| agent | `src/codex/{domain}/agents/{full_name}.md` |
| command | `src/codex/{domain}/commands/{full_name}.md` |
| hook | `src/codex/{domain}/hooks/{full_name}.js` |
| rule | (Codex 대상 아님) |

7. 해당 경로에 이미 파일/디렉토리가 존재하면 중단하고 안내한다. `--target both`인 경우 양쪽 모두 확인.

### Phase 3: 템플릿 로드 + 변수 치환

8. `.claude/skills/kit-scaffolding/references/`에서 타입에 맞는 템플릿을 로드한다:

| 타입 + 옵션 | 템플릿 |
|-------------|--------|
| skill | `template-skill.md` |
| agent | `template-agent.md` |
| command --simple | `template-command-simple.md` |
| command --complex | `template-command-complex.md` |
| hook --pre | `template-hook-pre.md` |
| hook --post | `template-hook-post.md` |
| hook --stop | `template-hook-stop.md` |
| rule | `template-rule.md` |

**Codex 템플릿** (`--target codex` 또는 `both`에서 Codex 측에 사용):

| 타입 | Codex 템플릿 |
|------|-------------|
| skill | `template-codex-skill.md` |
| agent | `template-codex-agent.md` |
| command | `template-codex-command.md` |
| hook | `template-codex-hook.md` |

9. 변수를 치환한다:
   - `{{DOMAIN}}` = domain
   - `{{NAME}}` = name
   - `{{FULL_NAME}}` = full_name
   - `{{DESCRIPTION}}` = 사용자에게 AskUserQuestion으로 입력받거나, 기본값 "TODO: 설명 추가"
   - agent인 경우: 아키타입에 따라 `{{TOOLS}}`, `{{MODEL}}`, `{{COLOR}}`, `{{CONSTRAINTS}}` 설정

| 아키타입 | TOOLS | MODEL | COLOR | CONSTRAINTS |
|----------|-------|-------|-------|-------------|
| --readonly | `["Read", "Grep", "Glob"]` | `opus` | `blue` | "Write/Edit 도구를 절대 사용하지 않음. 읽기 전용 분석 에이전트." |
| --write | `["Read", "Write", "Edit", "Grep", "Glob", "Bash"]` | `sonnet` | `green` | "안전한 항목만 자동 수정. 판단 필요 항목은 보고." |
| --monitor | `["Read", "Grep", "Glob", "Bash"]` | `sonnet` | `yellow` | "파일을 수정하지 않음. 관찰 결과만 보고." |

### Phase 4: 파일 생성

10. 대상 경로에 파일을 생성한다.
    - skill: 디렉토리 + SKILL.md
    - hook: JS 파일 + 같은 디렉토리에 `package.json`(`{"type": "commonjs"}`) 존재 확인

### Phase 5: 후속 안내

11. 생성 결과를 출력한다:

```
[kit-create] 컴포넌트 생성 완료

  타입:   {type}
  도메인: {domain}
  이름:   {full_name}
  경로:   {path}

  다음 단계:
  1. 파일의 TODO 섹션을 채우세요
  2. /kit-validate {full_name} 로 검증하세요 (Phase 2 이후)
```

12. hook인 경우 추가 안내:
    - "scripts/setup.js:buildHooksConfig()에 등록이 필요합니다"

### Phase 6: 페어링 레지스트리 갱신

13. `src/pairing-registry.json`을 읽는다 (없으면 빈 구조 생성).
14. 새 엔트리를 추가한다:

| 조건 | status | claude | codex |
|------|--------|--------|-------|
| `--target both` | `paired` | Claude 경로 | Codex 경로 |
| `--target claude` (agent/command) | 경고 출력 | Claude 경로 | null |
| `--skip-codex "사유"` | `codex-skip` | Claude 경로 | null |
| `--target codex` | `codex-native-only` | null | Codex 경로 |

15. 레지스트리를 저장한다.

command entry를 추가할 때는 `pairing-registry-v2` 필드를 함께 기록한다.

| 필드 | 기본값 |
|------|--------|
| `primaryCodex` | `command` |
| `transitionState` | `command-primary` |
| `codexSkill` | `null` |
| `driftStatus` | `null` |

## Rules

- kebab-case가 아닌 이름은 거부한다.
- 이미 존재하는 경로에 덮어쓰지 않는다.
- rule 타입은 항상 `src/claude/core/rules/`에 생성하며 도메인 접두사를 붙이지 않는다.
- 템플릿의 TODO 마커는 사용자가 직접 채울 부분이므로 치환하지 않는다.
- 생성 후 git add는 하지 않는다 (사용자가 직접 커밋).
- agent/command를 `--target claude`로만 생성하면 "required codex sibling" 경고를 표시한다.
- rule 타입은 `--target codex`를 거부한다 (discrete Codex sibling 없음 — `AGENTS.md.template` inline merge로 sharing).
- hook `--stop`과 `--target codex` 조합 시 Codex Stop 지원 상태를 경고한다 (experimental).
- `kit` domain과 `src/codex/kit/**`는 생성하지 않는다.
