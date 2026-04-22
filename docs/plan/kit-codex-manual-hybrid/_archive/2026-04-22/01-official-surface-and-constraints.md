# 01 Official Surface And Constraints

> 목적: 공식 Codex 문서를 기준으로 무엇이 plugin surface이고, 무엇이 별도 runtime surface인지 경계를 고정한다.

## 1. Official doc snapshot

Snapshot date: `2026-04-21`

| Surface | Official document | URL | Design implication |
|---|---|---|---|
| Plugins | Plugins overview | [developers.openai.com/codex/plugins](https://developers.openai.com/codex/plugins) | plugin은 skill/app/MCP 묶음 중심으로 해석 |
| Plugin build | Build plugins | [developers.openai.com/codex/plugins/build](https://developers.openai.com/codex/plugins/build) | `.codex-plugin/plugin.json` 기준 구조 확인 |
| Project instructions | AGENTS.md guide | [developers.openai.com/codex/guides/agents-md](https://developers.openai.com/codex/guides/agents-md) | 운영 매뉴얼은 `AGENTS.md`와 그 참조 문서로 전달 |
| Skills | Agent Skills | [developers.openai.com/codex/skills](https://developers.openai.com/codex/skills) | workflow 진입점은 skill 중심으로 설계 |
| Custom agents | Subagents | [developers.openai.com/codex/subagents](https://developers.openai.com/codex/subagents) | custom agent는 `.codex/agents/*.toml` surface로 취급 |
| Hooks | Hooks | [developers.openai.com/codex/hooks](https://developers.openai.com/codex/hooks) | hook은 존재하지만 보장 범위를 과장하지 말아야 함 |
| Commands | App commands | [developers.openai.com/codex/app/commands](https://developers.openai.com/codex/app/commands) | 기존 slash command UX는 skill/router로 재해석 필요 |

이 snapshot은 설계 승인 기준점이다. 구현 시작 전과 배포 직전에 같은 URL 묶음을 다시 확인해야 한다.

## 2. Official Codex surface 요약

### 2.1 Plugins

공식 문서 기준 plugin은 다음 요소를 포함하는 패키지다.

- `skills`
- optional `apps`
- optional `MCP servers`
- presentation assets

따라서 plugin을 `Claude runtime 전체 복제 컨테이너`처럼 해석하는 것은 공식 surface와 거리가 있다.

### 2.2 AGENTS.md

Codex는 `AGENTS.md`를 프로젝트 instruction source로 사용한다.

- 글로벌 위치와 repo 루트 위치가 있다.
- 하위 경로 override가 가능하다.
- 어떤 workflow를 언제 선택하는지, 어떤 문서를 먼저 읽어야 하는지 같은 운영 매뉴얼은 `AGENTS.md`가 자연스러운 진입점이다.

즉, `shared manual`의 라우팅 정보는 `AGENTS.md`에서 소개하고, 상세 설명은 분리 문서로 연결하는 방식이 공식 surface와 잘 맞는다.

### 2.3 Skills

Codex skill은 repo/user/admin/system 위치에서 discovery된다.

- repo-scoped workflow는 direct skill folder와 잘 맞는다.
- plugin 배포는 skill 묶음을 제공하는 방식과 잘 맞는다.

따라서 `/dev-*`, `/plan-*`, `/copy-*` 흐름을 plugin command 복제로 유지하기보다 `router skill + workflow skill + reference skill`로 재구성하는 편이 자연스럽다.

### 2.4 Custom agents

Codex custom agent의 공식 surface는 `.codex/agents/*.toml` 또는 user-scoped agents다.

- 필수 필드: `name`, `description`, `developer_instructions`
- 선택 필드: `model`, `sandbox_mode`, `skills.config` 등

따라서 `.claude/agents/*.md`를 Codex가 직접 runtime asset처럼 읽게 만드는 설계는 공식 surface에 기대지 못한다.

### 2.5 Hooks

Codex hook은 존재하지만 현재 공식 문서 기준으로 보장 범위가 제한적이다.

- 특정 event에서 동작한다.
- shell/Bash 계열 중심 제약이 문서화되어 있다.
- 모든 non-shell tool call을 Claude처럼 동일하게 강제한다고 가정하면 안 된다.

즉, hook은 `최소 enforcement`에만 사용하고, 나머지 행동 규칙은 `shared manual`, `AGENTS.md`, `skills`로 설명해야 한다.

### 2.6 Commands

공식 Codex 문서에는 앱/CLI 명령 체계가 존재하지만, 현재 `claude-kit`가 제공하는 `/dev-*`, `/plan-*`, `/copy-*`를 그대로 plugin runtime command처럼 이식하는 구조는 공식 surface와 일치하지 않는다.

따라서 기존 명령어 경험은 다음 방식으로 이관하는 것이 안전하다.

- `AGENTS.md`에서 새 진입 규칙 설명
- router skill에서 legacy 의도 해석
- 필요 시 alias 문구를 shared manual에 명시

## 3. 설계 제약

이 패키지가 지켜야 할 제약은 아래와 같다.

1. Codex가 `.claude/`를 공식 runtime discovery source처럼 전제하지 않는다.
2. Codex custom agents는 `.codex/agents/*.toml` 기준으로만 설명한다.
3. hooks는 문서화된 보장 범위를 넘겨 과장하지 않는다.
4. plugin은 `skills` 중심 구조를 기본으로 본다.
5. 기존 사용자 언어는 제거보다 alias와 router로 완충한다.

## 4. Re-check policy

공식 문서는 변할 수 있으므로 아래 시점에 재확인한다.

- Phase 0 승인 직전
- 실제 구현 시작 직전
- 첫 migration PR 리뷰 직전
- 사용자 공개 전

재확인 대상은 최소한 이 문서의 snapshot 표에 포함된 URL 전부다.
