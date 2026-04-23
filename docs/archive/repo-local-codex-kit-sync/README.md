# Source parity 기반 Codex Kit Sync 계획 패키지

> **Status**: Archived draft plan (`docs/archive`, moved from `docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **범위**: 구현 전 계획 문서. 실제 source, emitter, generated output은 변경하지 않는다.

이 패키지는 현재 archive에 있으므로 최신 구현 상태와 active plan을 함께 대조해야 합니다. 특히 `pairing-registry-v2`와 strict `src/codex` direct-use/plugin emitter는 이미 구현된 상태로 취급합니다.

이 패키지의 목적은 단순히 plugin을 우회해 repo-local Codex skill을 만드는 것이 아닙니다. 목적은 `claude-kit` 저장소 안에서 Claude Code 에이전트 기능을 기준으로 만든 source asset을 Codex agent/skill 기능에도 맞게 동기화하고, 설치 시 그 Codex 산출물이 소비자 프로젝트에 반영되도록 emitter 계약을 정리하는 것입니다.

중요한 경계가 있습니다. `kit-sync` 자체를 설치된 프로젝트 안에서 실행하게 만드는 것이 목표가 아닙니다. `src/codex/kit/**` domain을 새로 만들 계획도 없습니다. `kit-sync`는 이 저장소의 유지보수/릴리스 준비 파이프라인이고, 소비자 프로젝트에는 설치 결과물인 `.agents/skills/**`, `.codex/agents/**`, `AGENTS.md`, plugin output만 반영됩니다.

## 핵심 결론

| 주제 | 현재 상태 | 목표 상태 |
|------|-----------|-----------|
| source parity | `src/codex/**`가 존재하지만 emitter가 일부 `SRC_CLAUDE`를 읽음 | asset type별 `src/claude` ↔ `src/codex` 계약을 명시하고 drift를 검출 |
| `kit-analyze` | 전환 준비 분석 중심 | source asset 기준 parity, missing, drift, fallback, blocked 판정 |
| `kit-sync` | 저장소 유지보수용 동기화 | `kit-analyze` 결과를 바탕으로 이 저장소의 `src/codex/**`, templates, registries를 생성/갱신 |
| `kit-sync-agent` | Claude Code 기반 maintenance agent | 소비자 프로젝트에 설치하지 않는 repo-maintenance orchestration agent |
| 설치 output | Codex plugin output 중심 | plugin output + Codex direct-use output 분리 |
| `AGENTS.md` | generated runtime output | `src/templates/AGENTS.md.template`가 source, output은 보존/생성 대상 |
| kit toolchain | `.claude`에 Claude Code agent/skills/commands로 존재 | 이 저장소 maintenance toolchain으로 사용, `src/codex/kit/**`로 전환하지 않음 |

## maintenance toolchain

`kit-sync` 관련 기능은 이미 `.claude` 아래에 구현되어 있습니다.

- `.claude/agents/kit-sync-agent.md`
- `.claude/skills/kit-converter/**`
- `.claude/skills/kit-scaffolding/**`
- `.claude/skills/kit-validation/**`
- `.claude/commands/kit-*.md`

이 자산들은 설치 대상 product asset이 아니라 이 저장소를 관리하는 maintenance toolchain입니다. 계획은 이 기능을 참고해 `src/claude/**` 기반 기능을 `src/codex/**`와 설치 output으로 맞추는 것이며, 이 toolchain 자체를 Codex agent/skill로 포팅해 소비자 프로젝트에 설치하지 않습니다.

Review findings 반영 계획과 실제 수정/생성 파일 영향 목록은 [10-review-findings-resolution.md](10-review-findings-resolution.md)에 모아 둡니다.

## 읽는 순서

1. [01-current-claude-assets-audit.md](01-current-claude-assets-audit.md)
2. [02-codex-target-architecture.md](02-codex-target-architecture.md)
3. [03-rules-index-strategy.md](03-rules-index-strategy.md)
4. [04-hooks-migration-strategy.md](04-hooks-migration-strategy.md)
5. [05-commands-to-skills-strategy.md](05-commands-to-skills-strategy.md)
6. [06-kit-sync-agent-redesign.md](06-kit-sync-agent-redesign.md)
7. [07-implementation-roadmap.md](07-implementation-roadmap.md)
8. [08-source-parity-contract.md](08-source-parity-contract.md)
9. [09-installation-output-contract.md](09-installation-output-contract.md)
10. [10-review-findings-resolution.md](10-review-findings-resolution.md)

## 공식 근거

- OpenAI Codex: [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Agent Skills](https://developers.openai.com/codex/skills), [Subagents](https://developers.openai.com/codex/subagents), [Slash commands](https://developers.openai.com/codex/cli/slash-commands), [Rules](https://developers.openai.com/codex/rules), [Hooks](https://developers.openai.com/codex/hooks), [Memories](https://developers.openai.com/codex/memories)
- Claude Code: [Commands](https://code.claude.com/docs/en/commands), [Skills](https://code.claude.com/docs/en/skills), [Memory / rules](https://code.claude.com/docs/en/memory), [Hooks](https://code.claude.com/docs/en/hooks), [Subagents](https://code.claude.com/docs/en/sub-agents)
