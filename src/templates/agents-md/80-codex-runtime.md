## Codex direct-use 자산

이 프로젝트에 `claude-kit` Codex target이 설치되어 있으면 다음 runtime 자산이 있을 수 있습니다.

- `.agents/skills/**`: Codex repo-local skills입니다. 작업 맥락에 맞는 skill이 있으면 해당 지침을 우선 확인합니다.
- `.codex/agents/*.toml`: Codex custom agents입니다. 역할이 분명한 작업을 위임하거나 검토할 때 사용될 수 있습니다.
- `plugins/claude-kit/**`: plugin packaging output입니다. 일반적으로 generated output으로 보고 source of truth로 삼지 않습니다.
- `.agents/plugins/marketplace.json`: plugin discovery metadata입니다. 수동 수정 대상이 아니라 설치/생성 흐름의 결과로 봅니다.

Codex-facing skill, agent, command를 고칠 때는 설치된 output을 먼저 편집하지 말고, 이 프로젝트가 사용하는 실제 source와 emitter 정책을 확인합니다.

## Claude Code와 Codex 경계

Claude Code의 commands, hooks, rules, memory 개념이 Codex 기능과 항상 1:1로 대응하지는 않습니다. Codex에서는 주로 `AGENTS.md`, repo-local skills, custom agents, plugin output으로 의도를 보존합니다.

Codex rules policy 파일은 일반 안내 문서가 아니라 command approval policy 계층입니다. fresh install에서는 rules policy 파일을 자동 생성하지 않습니다. 일반 행동 지침은 이 `AGENTS.md`와 설치된 skills/custom agents로 안내합니다.

`kit-sync`와 `kit-*` 도구는 `claude-kit` 저장소를 유지보수하기 위한 pipeline입니다. 소비자 프로젝트에서 실행하는 runtime 기능으로 가정하지 않습니다.

## Generated Output 주의

다음 파일이나 폴더는 설치 과정에서 생성되거나 갱신될 수 있습니다.

- `AGENTS.md`
- `.agents/skills/**`
- `.codex/agents/*.toml`
- `plugins/claude-kit/**`
- `.agents/plugins/marketplace.json`

문제를 발견하면 generated output을 직접 고치기보다 template, source asset, setup emitter 중 실제 source of truth를 먼저 찾습니다. 기존 사용자 파일을 덮어써야 할 가능성이 있으면 멈추고 보존/merge 정책을 확인합니다.
