# 현재 source asset과 runtime output 분석

> **Status**: Draft plan (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23

이 분석의 기준은 runtime `.claude/**`가 아니라 source asset입니다. `.claude/**`, `plugins/claude-kit/**`, `AGENTS.md`는 설치 결과 또는 generated output일 수 있으므로, source parity 판단은 `src/claude/**`, `src/codex/**`, `src/templates/**`, registries, scripts를 먼저 봅니다.

## 1. source asset 현황

현재 source asset 수량은 다음과 같습니다.

| Target | Domain | agents | commands | skills | hooks | rules |
|------|------|------:|------:|------:|------:|------:|
| Claude | copy | 5 | 7 | 5 | 5 | 5 |
| Claude | core | 0 | 1 | 4 | 10 | 8 |
| Claude | dev | 7 | 21 | 15 | 3 | 1 |
| Claude | plan | 9 | 12 | 10 | 4 | 1 |
| Codex | copy | 4 | 7 | 5 | 0 | 0 |
| Codex | core | 0 | 0 | 2 | 7 | 2 |
| Codex | dev | 6 | 21 | 15 | 3 | 1 |
| Codex | plan | 9 | 11 | 9 | 3 | 0 |

이 표만 보면 `src/codex/**`가 이미 존재하지만, 모든 asset type이 같은 방식으로 매칭되는 것은 아닙니다. rules는 대부분 `src/templates/AGENTS.md.template` fallback으로 보존되고, hooks는 `src/claude/_meta/codex-portability.json`와 `scripts/codex-hook-compat.js`가 판단합니다.

## 2. 현재 emitter 사실

`scripts/setup.js` 기준 현재 Codex emitter는 다음처럼 동작합니다.

| 항목 | 현재 동작 | 문제 |
|------|-----------|------|
| Codex plugin root | `plugins/claude-kit/` 생성 | plugin output 중심 |
| Codex component dirs | `agents`, `commands`, `skills` | `hooks`, `rules`는 별도 처리 |
| agents/commands/skills source | 현재 `SRC_CLAUDE`에서 복사 | `src/codex/**` source parity와 충돌 가능 |
| hooks source | `filterCodexHooks()` 후 `SRC_CODEX` 우선, 없으면 `SRC_CLAUDE` fallback | hook별 전략은 별도 manifest 필요 |
| `AGENTS.md` | 없으면 `src/templates/AGENTS.md.template`로 생성, 있으면 보존 | template가 source이며 output 직접 수정은 금지 |
| marketplace/plugin manifest | `.agents/plugins/marketplace.json`, `.codex-plugin/plugin.json` 생성 | generated output |

따라서 후속 구현의 첫 번째 과제는 emitter가 `src/codex/**` source를 신뢰하도록 바꾸는 것입니다. 단, 현재 동작과 목표 동작을 문서에서 분리해야 합니다.

## 3. source-of-truth 파일

| 목적 | Source-of-truth |
|------|-----------------|
| Claude authoring source | `src/claude/**` |
| Codex parity source | `src/codex/**` |
| kit sync maintenance toolchain | `.claude/agents/kit-sync-agent.md`, `.claude/skills/kit-converter/**`, `.claude/skills/kit-scaffolding/**`, `.claude/skills/kit-validation/**`, `.claude/commands/kit-*.md` |
| AGENTS output source | `src/templates/AGENTS.md.template` |
| pairing 상태 | `src/pairing-registry.json` |
| skip/exception 상태 | `src/exception-registry.json` |
| hook portability 전략 | `src/claude/_meta/codex-portability.json`, `scripts/codex-hook-compat.js` |
| emitter behavior | `scripts/setup.js` |

`kit-analyze`, `kit-sync`, `kit-sync-agent`는 이 파일들을 먼저 읽어야 합니다. 문서나 generated output만 보고 판단하면 안 됩니다.

## 4. kit sync maintenance toolchain

`kit-sync` 자체는 일반 product asset이 아니라 이 저장소에서 `src/claude/**` 기반 기능을 `src/codex/**`와 설치 output으로 맞추기 위한 maintenance 도구입니다. 현재 이 도구의 Claude Code 구현은 `.claude/` 아래에 존재합니다.

| Maintenance asset | 역할 | 계획상 의미 |
|------|------|------|
| `.claude/agents/kit-sync-agent.md` | 미전환/드리프트 자산을 분석하고 전환 command 조합을 실행 | repo-maintenance orchestration의 기존 Claude agent |
| `.claude/skills/kit-converter/SKILL.md` | `src/claude/**` → `src/codex/**` 타입별 변환 규칙 | `kit-sync`가 실제 변환 규칙으로 참고 |
| `.claude/skills/kit-scaffolding/SKILL.md` | Claude/Codex 컴포넌트 템플릿 생성 | 신규 source asset 생성 규칙 |
| `.claude/skills/kit-validation/SKILL.md` | Claude/Codex/registry 스키마 검증 | 변환 후 표준 준수 검증 |
| `.claude/commands/kit-*.md` | `kit-analyze`, `kit-sync`, `kit-convert`, `kit-audit` entrypoint | pipeline 동작 정의의 현재 입력 |

이 예외는 중요합니다. `.claude/**` 전체를 source-of-truth로 승격한다는 뜻이 아니며, 위 kit toolchain 자체를 `src/codex/kit/**`로 포팅한다는 뜻도 아닙니다. 일반 기능 자산은 여전히 `src/claude/**`와 `src/codex/**` source parity가 기준이고, kit toolchain은 이 저장소에서 그 parity를 관리하는 도구로만 남깁니다.

## 5. runtime `.claude/**`는 보조 증거

현재 runtime `.claude/**`에는 commands 28개, rules 11개, hooks 12개, agent-memory 3개가 있습니다. 이들은 사용자가 실제로 체감하는 Claude Code 표면이지만, Codex source parity의 source-of-truth는 아닙니다.

runtime output은 다음 용도로만 사용합니다.

- 설치 결과 검증
- 사용자가 체감하는 command/rule/hook inventory 확인
- source와 runtime 사이 누락 확인

## 6. 발견된 불일치와 리스크

| 리스크 | 근거 | 계획 반영 |
|------|------|------|
| emitter가 `SRC_CLAUDE`를 읽음 | `scripts/setup.js` Codex asset copy | [09-installation-output-contract.md](09-installation-output-contract.md)에 목표 emitter 계약 정의 |
| `AGENTS.md`는 generated output | template가 source | [03-rules-index-strategy.md](03-rules-index-strategy.md)에 template-first 정책 |
| hooks는 direct parity가 불안정 | Codex hooks experimental, Windows disabled | [04-hooks-migration-strategy.md](04-hooks-migration-strategy.md)에 direct/fallback/review 분류 |
| runtime hook reference 누락 가능 | `.claude/settings.json`은 `plan-doc-guard.js` 참조, runtime `.claude/hooks` 목록에는 누락 가능 | roadmap에 reference integrity 검증 포함 |
| `src/codex/kit/**` 오해 가능 | kit toolchain은 product asset이 아니라 maintenance 도구 | source parity contract에서 no `kit` domain 원칙 명시 |
