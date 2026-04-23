# Codex source-to-output 목표 아키텍처

> **Status**: Draft plan (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23

목표 아키텍처는 "repo-local output을 직접 작성"하거나 "설치된 프로젝트 안에서 sync를 실행"하는 것이 아닙니다. `claude-kit` 저장소에서 `src/claude/**`와 `src/codex/**` source parity를 만들고, package 설치 시 emitter가 이를 소비자 프로젝트의 Codex output으로 변환하는 구조입니다.

## 1. 목표 흐름

```text
src/claude/**            src/codex/**
   │                         │
   │ kit-analyze             │
   ├── parity/missing/drift ─┤
   │                         │
   │ kit-sync                │
   └── conversion/fallback ─▶│
                             │
src/templates/** + registries + scripts
                             │
                         scripts/setup.js
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
Codex direct-use output                   Codex plugin output
.agents/skills/**                         plugins/claude-kit/**
.codex/agents/**                          .agents/plugins/marketplace.json
.codex/hooks.json candidate               plugin.json/hooks.json
AGENTS.md
```

`kit-analyze`와 `kit-sync` 자체는 기존 `.claude` maintenance toolchain을 참고합니다. 즉, `.claude/agents/kit-sync-agent.md`, `.claude/skills/kit-converter/**`, `.claude/skills/kit-scaffolding/**`, `.claude/skills/kit-validation/**`, `.claude/commands/kit-*.md`가 이 저장소의 구현 근거입니다. 이 toolchain은 소비자 프로젝트 설치 output이 아니며 `src/codex/kit/**` target도 만들지 않습니다.

## 2. 현재 상태와 목표 상태

| 레이어 | 현재 상태 | 목표 상태 |
|------|-----------|-----------|
| source parity | `src/codex/**`가 있으나 emitter와 일부 불일치 | `src/codex/**`가 Codex target source로 신뢰됨 |
| analyze | 준비 상태/4-tier 리포트 | source parity + drift + installation impact 리포트 |
| sync | repo-maintenance agent가 전환/수정 | 이 저장소의 `src/codex/**`, templates, registries를 갱신 |
| install | plugin output 중심 | direct-use output + plugin output 동시 생성 |
| runtime output | generated | generated 유지, 직접 source 취급 금지 |

## 3. direct-use output과 plugin output 분리

| Output | 경로 | 목적 | Source |
|------|------|------|------|
| Codex skills | `.agents/skills/**` | 설치된 소비자 프로젝트에서 `$skill` 호출 | `src/codex/**/skills/**` |
| Codex agents | `.codex/agents/*.toml` | 설치된 소비자 프로젝트에서 custom agent 사용 | `src/codex/**/agents/**` 또는 agent emitter |
| Codex hooks config | `.codex/hooks.json` 후보 | 설치 output 후보, v1에서는 fallback-first | `src/codex/**/hooks/**` + portability |
| Project guidance | `AGENTS.md` | Codex project instructions | `src/templates/AGENTS.md.template` |
| Plugin output | `plugins/claude-kit/**` | 배포/marketplace package | `src/codex/**` 또는 packaged source |
| Marketplace | `.agents/plugins/marketplace.json` | plugin discovery | template/merge script |

direct-use output은 "설치된 소비자 프로젝트에서 바로 쓰는 표면"이고, plugin output은 "배포 단위"입니다. 둘은 같은 source에서 파생되어야 하지만, 서로를 source로 삼으면 안 됩니다. 단, `kit-sync` maintenance toolchain 자체는 direct-use output에 포함하지 않습니다.

## 4. asset type별 target source

| Claude source | Codex source 목표 | 설치 direct-use output |
|------|------|------|
| `src/claude/**/commands/*.md` | `src/codex/**/skills/*/SKILL.md` 또는 `src/codex/**/commands/*.md` | `.agents/skills/**` 우선 |
| `src/claude/**/skills/**/SKILL.md` | `src/codex/**/skills/**/SKILL.md` | `.agents/skills/**` |
| `src/claude/**/agents/*.md` | `src/codex/**/agents/*.md` 또는 `.toml` emit source | `.codex/agents/*.toml` |
| `src/claude/**/rules/*.md` | template/index/docs fallback | `AGENTS.md` + guidance docs |
| `src/claude/**/hooks/*.js` | `src/codex/**/hooks/*.js` 또는 fallback artifact | `.codex/hooks.json` candidate, skill checks |
| `.claude/agent-memory/**` | checked-in references/docs | skill references/docs |

## 5. `AGENTS.md` 설계 원칙

`AGENTS.md`는 source가 아니라 output입니다. 따라서 direct-use Codex 설치에서 `AGENTS.md`를 강화하려면 `src/templates/AGENTS.md.template` 또는 template 생성 로직을 수정해야 합니다.

목표:

- `AGENTS.md`에는 rule 본문 전체가 아니라 routing index와 사용 조건을 둡니다.
- 상세 rule은 source docs 또는 generated guidance docs로 둡니다.
- Codex가 필요한 상황에만 skill/reference/docs를 읽게 합니다.

## 6. 설치 시 목표 동작

Codex target이 active이면 `scripts/setup.js` 또는 후속 emitter는 다음을 생성해야 합니다.

1. `.agents/skills/**`
2. `.codex/agents/**`
3. `AGENTS.md`
4. `.codex/hooks.json` 후보 또는 hook fallback docs
5. 기존 plugin output인 `plugins/claude-kit/**`
6. `.agents/plugins/marketplace.json`

v1 구현에서는 1, 2, 3을 우선합니다. hooks direct-use는 Codex 공식 hooks 제약 때문에 fallback-first로 둡니다.

## 7. output 보존 원칙

direct-use output은 사용자가 프로젝트에서 직접 편집할 가능성이 있습니다. 따라서 emitter는 `.agents/skills/**`와 `.codex/agents/**`를 생성할 때 managed marker와 source hash를 기록하고, 사용자 수정이 감지되면 덮어쓰지 않고 conflict report를 출력해야 합니다.

## 8. 명시적 non-goal

- `src/codex/kit/**` domain을 만들지 않습니다.
- `.claude/commands/kit-*`, `.claude/agents/kit-sync-agent.md`, `.claude/skills/kit-*`를 소비자 프로젝트의 Codex skill/agent로 설치하지 않습니다.
- 설치된 프로젝트 안에서 `kit-sync`를 실행해 다시 source parity를 맞추는 흐름을 만들지 않습니다.
