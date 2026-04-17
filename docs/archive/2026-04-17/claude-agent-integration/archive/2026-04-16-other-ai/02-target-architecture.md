# Target Architecture

- 문서 ID: CAI-02
- 목적: `copy` 도메인의 목표 source 구조, generated output, setup/template/registry 영향을 정의한다.
- 선행 문서: [01-scope-and-decisions.md](./01-scope-and-decisions.md)

## 1. 현재 구조

현재 저장소는 `core`, `dev`, `plan` 도메인을 가진다. `copy` 도메인은 아직 없다.

```text
src/
  claude/
    _meta/
    core/
    dev/
    plan/
  exception-registry.json
  pairing-registry.json
scripts/
  setup.js
  generate-quickstart-doc.js
  codex-hook-compat.js
```

## 2. 목표 구조

`copy` 도메인을 추가하면 source 구조는 아래처럼 확장한다.

```text
src/
  claude/
    copy/
      agents/
      commands/
      hooks/
        package.json
      rules/
      skills/
        copy-command-workflow/
          SKILL.md
        copy-evidence-management/
          SKILL.md
        copy-qa-workflow/
          SKILL.md
```

| source 영역 | 목적 | generated output |
| --- | --- | --- |
| `src/claude/copy/agents/` | copy-specific subagent prompts | `.claude/agents/copy-*.md` |
| `src/claude/copy/commands/` | `/copy-*` command definitions | `.claude/commands/copy-*.md` |
| `src/claude/copy/hooks/` | copy reminder/blocking hooks | `.claude/hooks/copy-*.js` |
| `src/claude/copy/rules/` | copy domain rules | `.claude/rules/copy-*.md` |
| `src/claude/copy/skills/` | reusable workflow guides | `.claude/skills/copy-*` |

`.claude/*` 경로는 사용자 프로젝트에 설치되는 generated output이다. source 문서는 `.claude/*`를 직접 수정 대상으로 두지 않는다.

## 3. setup 영향

`scripts/setup.js`는 active domains를 읽고 domain별 components를 target output으로 emit한다. `copy` 도메인 도입 시 아래 항목을 검토한다.

| 항목 | 필요 작업 |
| --- | --- |
| domain discovery | `src/claude/copy`가 existing domain traversal에 자연스럽게 포함되는지 확인 |
| active domains | `profile.json`의 `domains`에 `"copy"`가 있을 때만 emit |
| Claude target | `.claude/agents`, `.claude/commands`, `.claude/hooks`, `.claude/rules`, `.claude/skills` 출력 확인 |
| Codex target | plugin output에서 copy agents/commands/skills/rules 처리 방식 확인 |
| hooks config | `buildHooksConfig`에 copy hook 연결 정책 추가 여부 결정 |
| quickstart | active domains에 `copy`가 있을 때 안내 문구 포함 |

## 4. template 영향

| 템플릿 | 반영 방향 |
| --- | --- |
| `src/templates/profile.json.template` | 기본값은 `["core", "dev"]` 유지. 예시로 `copy` opt-in 추가 가능 |
| `src/templates/CLAUDE.md.template` | copy 도메인 활성 시 source/deploy와 gate 안내 추가 |
| `src/templates/AGENTS.md.template` | Codex target에서 copy 도메인 fallback 지침 추가 |
| `src/templates/CLAUDE-KIT-QUICKSTART.md.template` | `copy` domain 사용 시 quick start 섹션 추가 |
| `src/templates/settings.json.template` | copy hooks를 기본 연결할지 여부는 A4 단계에서 결정 |

## 5. registry 영향

| 파일 | 반영 방향 |
| --- | --- |
| `src/pairing-registry.json` | copy agents/commands/rules/skills의 Claude-Codex pairing 상태 등록 |
| `src/exception-registry.json` | copy hooks의 Codex 호환성 예외 또는 검증 필요 항목 등록 |
| `src/claude/_meta/codex-portability.json` | copy component별 strategy, official surface, fallback target 정의 |

초기 전략은 아래를 권장한다.

| component | Codex 전략 | 이유 |
| --- | --- | --- |
| agents | `paired-review` | prompt는 이식 가능하지만 output quality 검증 필요 |
| commands | `paired-review` | command semantics는 이식 가능하지만 Codex UI/CLI 차이 확인 필요 |
| rules | `paired-direct` | text rule은 AGENTS 또는 plugin docs로 흡수 가능 |
| skills | `paired-direct` | skill 문서는 path copy 가능성이 높음 |
| hooks | `paired-review` 또는 `blocked` | hook event model과 Windows 동작 검증 필요 |

## 6. generated output 정책

| 원칙 | 설명 |
| --- | --- |
| source authoritative | 개발자는 `src/claude/copy/*`를 수정한다. |
| output reproducible | `.claude/*`와 plugin output은 `pnpm claude-kit:setup`으로 재생성 가능해야 한다. |
| no generated links in source docs | source 문서에서 아직 생성되지 않은 `.claude/*` 파일을 Markdown 링크로 걸지 않는다. |
| verification after setup | generated output 검증은 구현 후 [06-readiness-and-verification.md](./06-readiness-and-verification.md) 기준으로 수행한다. |

## 7. 아키텍처 acceptance criteria

| 기준 | 완료 조건 |
| --- | --- |
| source 구조 | `src/claude/copy/{agents,commands,hooks,rules,skills}` 존재 |
| hooks package | `src/claude/copy/hooks/package.json`에 CommonJS 설정 존재 |
| opt-in | `profile.json`에 `"copy"`가 있을 때만 copy output 생성 |
| no broken links | 문서가 존재하지 않는 generated output을 링크하지 않음 |
| registry | copy component가 registry/portability 정책에 반영됨 |
