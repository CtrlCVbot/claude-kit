# Source Map and Evidence

## 로컬 소스 맵

| 파일 | 역할 | 이번 분석에서 확인한 사실 |
|---|---|---|
| `profile.json` | 설치 프로파일 | 현재 `domains: ["core","dev"]`, `targets: ["claude"]` |
| `scripts/setup.js` | emitter SSOT | `resolveActiveDomains`, `resolveTargets`, `buildSettingsTemplate`, `buildCodexAgentToml`가 실제 생성 동작을 결정 |
| `scripts/merge-settings.js` | settings 병합 | 기존 env/settings override를 보존 |
| `.claude/settings.json` | 현재 프로젝트 runtime settings | hooks/env는 생성되지만 `model`은 없음 |
| `src/templates/profile.json.template` | install profile template | 기본 `targets: ["claude"]` |
| `src/templates/settings.json.template` | 참조 템플릿 | 실제 settings 생성은 `setup.js` 동적 로직 |
| `src/claude/**/agents/*.md` | Claude source agents | 21개 모두 `model: opus` |
| `src/codex/**/agents/*.md` | Codex source agents | 19개가 `model` frontmatter 없음 |
| `src/pairing-registry.json` | Claude/Codex pairing 메타데이터 | 존재 parity 중심, metadata parity는 없음 |
| `src/exception-registry.json` | intentional gap 메타데이터 | 모델 관련 active exception 없음 |
| `.codex/agents/kit-codex-sync-reviewer.toml` | 수동 Codex agent 예시 | `model`, `model_reasoning_effort` 사용 가능성 확인 |
| `docs/30-reference/02-agents.md` | Claude agents reference | 현재 문서는 Claude 모델만 잘 드러내고 Codex 변환 손실은 보이지 않음 |
| `docs/30-reference/06-settings.md` | settings reference | `.claude/settings.json`이 profile 기반 동적 생성임을 설명 |

## 공식 근거

| 출처 | 링크 | 핵심 근거 |
|---|---|---|
| Claude Code settings | [code.claude.com/docs/en/settings](https://code.claude.com/docs/en/settings) | settings scope와 precedence, project/local/user/managed 구조 |
| Claude Code model config | [code.claude.com/docs/en/model-config](https://code.claude.com/docs/en/model-config) | `/model`, `ANTHROPIC_MODEL`, settings `model`, `availableModels`, pinning env |
| Claude Code subagents | [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents) | subagent `model`, resolution order, `effort`, `memory`, tools |
| Advisor tool | [platform.claude.com/docs/ko/agents-and-tools/tool-use/advisor-tool](https://platform.claude.com/docs/ko/agents-and-tools/tool-use/advisor-tool) | executor/advisor 역할, beta header, compatibility, response structure |

## 보조 참고

| 출처 | 링크 | 사용 방식 |
|---|---|---|
| External strategy article | [chatgptguide.ai/claude-advisor-strategy](https://chatgptguide.ai/claude-advisor-strategy/) | 공식 규칙이 아닌 운영 해석 보조 |

## 이번 세션에서 실행한 확인

| 명령/행동 | 결과 |
|---|---|
| `node scripts/setup.js --dry-run` | `active targets: claude`, `Codex target inactive` 확인 |
| Claude agent frontmatter 스캔 | 21개 모두 `model: opus` 확인 |
| Codex agent frontmatter 스캔 | 19개 `model` 누락 확인 |
| `.codex/agents/kit-codex-sync-reviewer.toml` 확인 | 수동 TOML은 `model`과 `model_reasoning_effort` 사용 |

## 근거 해석 규칙

1. emitter behavior는 docs보다 우선한다.
2. generated runtime은 source-of-truth가 아니다.
3. Codex 모델 지원 여부는 현재 repo의 수동 TOML과 host runtime inference를 근거로 판단했고, 외부 공식 Codex 문서로 완전 검증하지는 않았다.
4. Advisor tool은 Anthropic API 공식 기능으로 확정했다.

## 남은 불확실성

| 항목 | 상태 |
|---|---|
| Codex direct-use TOML의 `model` 필드가 모든 환경에서 동일하게 해석되는지 | 미검증 |
| Claude Code 런타임에서 `CLAUDE_CODE_SUBAGENT_MODEL`를 실제 운영에서 어떻게 쓰는지 | 공식 문서 존재, repo 적용 없음 |
| Advisor tool을 Claude Code layer에서 바로 노출하는 공식 지원 여부 | 현재 확보 근거 없음 |

