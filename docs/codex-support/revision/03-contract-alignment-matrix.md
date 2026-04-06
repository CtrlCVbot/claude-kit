# Codex Support Contract Alignment Matrix

> 상태 기준: `match`, `partial`, `mismatch`

| 영역 | 문서상 기대 동작 | 구현 근거 | 상태 | 메모 |
|---|---|---|---|---|
| `profile.json.targets` 기본값 | `targets` 생략 시 `["claude"]` | [`scripts/setup.js`](../../../scripts/setup.js), [`src/templates/profile.json.template`](../../../src/templates/profile.json.template) | match | 기존 Claude 흐름 유지 확인 |
| `profile.json.targets` Codex 분기 | `["codex"]`, `["claude","codex"]` 지원 | [`scripts/setup.js`](../../../scripts/setup.js) | partial | 일반 JSON은 동작하지만 BOM 포함 UTF-8 JSON에서 파싱 실패 |
| repo-local plugin 구조 | `plugins/claude-kit/` 아래 plugin 구조 생성 | [`scripts/setup.js`](../../../scripts/setup.js) | match | `agents`, `commands`, `skills`, `.codex-plugin`, `hooks.json` 생성 확인 |
| `AGENTS.md` 생성 | Codex fresh install 시 `AGENTS.md` 생성 | [`scripts/setup.js`](../../../scripts/setup.js), [`src/templates/AGENTS.md.template`](../../../src/templates/AGENTS.md.template) | match | fresh install에서 생성 확인 |
| `AGENTS.md` 보존 | update install 시 기존 `AGENTS.md` 덮어쓰지 않음 | [`scripts/setup.js`](../../../scripts/setup.js) | match | update smoke test에서 보존 확인 |
| `plugin.json` 생성 | `plugins/claude-kit/.codex-plugin/plugin.json` 생성 | [`scripts/setup.js`](../../../scripts/setup.js), [`src/templates/plugin.json.template`](../../../src/templates/plugin.json.template) | match | manifest 생성 확인 |
| `marketplace.json` 병합 | `.agents/plugins/marketplace.json` 생성 또는 병합 | [`scripts/setup.js`](../../../scripts/setup.js), [`src/templates/marketplace-entry.json.template`](../../../src/templates/marketplace-entry.json.template) | match | 기존 엔트리 보존 + `claude-kit` 업데이트 확인 |
| hooks partial support | 호환 가능한 훅만 `hooks.json`으로 이식 | [`scripts/codex-hook-compat.js`](../../../scripts/codex-hook-compat.js), [`scripts/setup.js`](../../../scripts/setup.js) | partial | filter/skip 자체는 동작하지만 실행 스크립트 설치가 빠져 있음 |
| `skippedForCodex` 기록 | 제외된 훅의 사유를 metadata에 남김 | [`scripts/codex-hook-compat.js`](../../../scripts/codex-hook-compat.js), [`scripts/setup.js`](../../../scripts/setup.js) | match | 두 개의 excluded hook이 기록됨 |
| `skills/commands/agents` support | Codex에서 기본 지원 / full support | [`scripts/setup.js`](../../../scripts/setup.js), source 자산 본문 | partial | 자산은 복사되지만 내부 내용은 Claude 경로와 `CLAUDE.md`를 그대로 참조 |
| rules indirect support | `AGENTS.md` 또는 plugin 문서에서 rules를 간접 지원 | [`src/templates/AGENTS.md.template`](../../../src/templates/AGENTS.md.template) | mismatch | rules surface가 구현에 없음 |
| `mcp` 제외 | v1 범위에서 제외 | [`implementation-plan.md`](../implementation-plan.md), [`01-asset-mapping-reference.md`](../01-asset-mapping-reference.md), 구현 코드 | match | Codex emitter에 MCP 이식 로직 없음 |
| Codex metadata shape | `targets`, `outputs.codex`, `skippedForCodex` 기록 | [`scripts/setup.js`](../../../scripts/setup.js) | match | 필드 자체는 생성됨 |
| Codex metadata accuracy | Codex hook 수와 출력 결과가 metadata에 정확히 반영 | [`scripts/setup.js`](../../../scripts/setup.js) | mismatch | Codex-only 설치에서 `components.hooks = 0` |
| Claude 하위호환 | Codex 추가로 기존 `.claude/` 흐름이 깨지지 않음 | [`scripts/setup.js`](../../../scripts/setup.js), smoke test | match | Claude-only, dual-target 둘 다 정상 생성 |
| README 반영 | `targets`, Codex 설치, metadata 설명 반영 | [`README.md`](../../../README.md) | partial | 주요 흐름은 반영됐지만 구현 품질보다 낙관적인 설명이 있음 |
| guide 반영 | overview/architecture/glossary가 Codex 개념 반영 | [`docs/guide/00-overview.md`](../../guide/00-overview.md), [`docs/guide/09-architecture.md`](../../guide/09-architecture.md), [`docs/guide/10-glossary.md`](../../guide/10-glossary.md) | partial | 구조 설명은 맞지만 runtime gaps까지는 반영되지 않음 |
| quickstart output tree | 문서 예시 트리와 실제 Codex 산출물이 일치 | [`00-codex-quickstart.md`](../00-codex-quickstart.md), smoke test | partial | 핵심 파일은 일치하나 `assets/` 예시는 현재 emitter와 다름 |

---

## Matrix verdict

전체 판정은 `partial`이다.

- 설치 골격과 Claude 하위호환은 구현됨
- metadata와 skip 기록도 큰 방향은 맞음
- 하지만 hook runtime, rules surface, copied asset 내부 참조는 아직 문서 계약과 완전히 맞지 않는다

즉 "설치 가능"은 달성했지만, "문서가 설명하는 Codex usable v1"은 아직 보정이 필요하다.

