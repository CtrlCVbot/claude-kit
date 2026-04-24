# Multi-Target (Claude + Codex)

> **Status**: Draft (P5, 2026-04-24)
> **Source**: [../../scripts/setup.js](../../scripts/setup.js), [../../src/pairing-registry.json](../../src/pairing-registry.json), [../../src/exception-registry.json](../../src/exception-registry.json), [../../src/claude/_meta/codex-portability.json](../../src/claude/_meta/codex-portability.json)
> **Related**: [../20-user-guide/06-codex-dual-use.md](../20-user-guide/06-codex-dual-use.md), [../30-reference/07-pairing-registry.md](../30-reference/07-pairing-registry.md), [../40-contributing/06-codex-sync-maintenance.md](../40-contributing/06-codex-sync-maintenance.md)

claude-kit은 Claude와 Codex에 "같은 파일을 그대로 복사"하는 구조가 아닙니다. 실제 설치는 `scripts/setup.js`가 target별 source, fallback, managed output 규칙을 해석해 각각의 runtime surface를 생성하는 방식입니다.

## 1. 설치 결과 요약

| 구분 | Claude 런타임 | Codex 런타임 |
|---|---|---|
| 컨텍스트 문서 | `CLAUDE.md` | `AGENTS.md` |
| 커맨드 | `.claude/commands/*.md` | `plugins/claude-kit/commands/*.md` |
| 에이전트 | `.claude/agents/*.md` | `plugins/claude-kit/agents/*.md` + `.codex/agents/*.toml` |
| 스킬 | `.claude/skills/*/SKILL.md` | `plugins/claude-kit/skills/*/SKILL.md` + `.agents/skills/*/SKILL.md` |
| 훅 | `.claude/hooks/*.js` + `.claude/settings.json` | `plugins/claude-kit/hooks/*.js` + `plugins/claude-kit/hooks.json` |
| 규칙 전달 | `.claude/rules/*.md` | `AGENTS.md` managed section으로 흡수 |
| 플러그인 메타데이터 | 해당 없음 | `plugins/claude-kit/.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json` |

중요:

- Codex는 `plugins/claude-kit/`만 생성하는 것이 아니라 direct-use surface도 함께 생성합니다.
- 현재 direct-use surface는 skill과 agent 중심입니다. command는 여전히 plugin surface가 기본입니다.
- `AGENTS.md`는 fresh install에서는 생성되고, update install에서는 managed section merge 방식으로 갱신됩니다.

## 2. Source routing

Codex 쪽 source routing은 자산 타입마다 다릅니다.

| 자산 | Codex에서 실제로 보는 주 source | 비고 |
|---|---|---|
| command | `src/codex/{domain}/commands/**` | 기본 fallback 없음 |
| agent | `src/codex/{domain}/agents/**` | plugin output + `.codex/agents/*.toml` 동시 생성 |
| skill | `src/codex/{domain}/skills/**` | plugin output + `.agents/skills/**` 동시 생성 |
| hook | `src/codex/**` 우선 또는 `src/claude/**` fallback | `codex-portability.json`과 `codex-hook-compat.js` 기준 |
| rule/guidance | `src/claude/core/rules/**` + template | Codex에는 별도 rules 파일이 없고 `AGENTS.md`로 전달 |

핵심 원칙:

- command, agent, skill의 Codex source는 현재 `src/codex/**`를 기준으로 봐야 합니다.
- hook은 예외입니다. `paired-direct`는 `src/codex/**`를 우선하고, `paired-fallback`은 `src/claude/**` artifact/fallback을 허용합니다.
- rule은 `src/codex/rules/**`로 1:1 복제하지 않습니다. Codex의 공식 instruction surface는 `AGENTS.md`입니다.

## 3. Pairing registry vocabulary

현재 `pairing-registry-v2` 기준 status는 아래 3개가 중심입니다.

| Status | 의미 |
|---|---|
| `paired` | Claude와 Codex 경로가 모두 정렬된 상태 |
| `codex-skip` | Codex로 1:1 포팅하지 않기로 승인된 상태 |
| `unpaired` | 아직 Codex source가 준비되지 않은 상태 |

추가 필드는 단순 상태보다 더 구체적인 운영 힌트를 줍니다.

| 필드 | 의미 |
|---|---|
| `primaryCodex` | Codex 쪽 공식 표면이 hook, skill, agent 등 무엇인지 |
| `transitionState` | 변환 중간 상태나 이행 상태 |
| `driftStatus` | paired 자산 간 내용 드리프트 여부 |

따라서 예전 문서에 있던 `claude-only`, `codex-only`, `skip` 같은 vocabulary는 현재 active 기준이 아닙니다.

## 4. Hook portability와 exception의 역할 분리

Codex hook 설명은 두 파일을 같이 봐야 정확합니다.

| 파일 | 역할 |
|---|---|
| [`src/claude/_meta/codex-portability.json`](../../src/claude/_meta/codex-portability.json) | strategy, official surface, evidence, fallback target의 SSOT |
| [`src/exception-registry.json`](../../src/exception-registry.json) | 예외 승인, fallback 사유, 문서 제약 기록 |

현재 portability strategy vocabulary:

- `paired-direct`
- `paired-fallback`
- `paired-review`
- `blocked`

예시:

- `output-secret-filter`는 `paired-direct`
- `session-wrap-suggest`는 `paired-fallback`

즉, hook 설명은 단순히 "Codex 지원/미지원"으로 끝나지 않고, 어떤 공식 surface를 쓰는지와 어떤 fallback을 허용하는지까지 함께 기록해야 합니다.

## 5. Runtime guidance boundary

`AGENTS.md`는 설치 프로젝트에서 Codex가 읽는 runtime guidance입니다. 이 문서에는 maintainer용 source path나 내부 sync metadata를 노출하지 않는 것이 원칙입니다.

반대로 아래 항목은 소비자 runtime 기능이 아니라 maintainer toolchain입니다.

- `.claude/commands/kit-*`
- `.claude/agents/kit-*`
- `.claude/skills/kit-*`

이 항목들은 `claude-kit` 저장소 내부에서 source parity를 유지하기 위한 도구이므로, 사용자 가이드보다는 [../40-contributing/06-codex-sync-maintenance.md](../40-contributing/06-codex-sync-maintenance.md) 기준으로 읽어야 합니다.

## 6. 검증 포인트

멀티타깃 문서를 바꾸거나 Codex sync를 손볼 때는 아래 검증이 기본입니다.

```powershell
node scripts/setup.js --dry-run
node scripts/codex-hook-compat.js
node scripts/audit-pairing.js
node scripts/docs-generate.js --check
```

추가로 maintainer 레벨 검증에서는 fresh install fixture와 existing `AGENTS.md` update fixture를 분리해서 보는 편이 안전합니다.

## 다음 읽기

- [../20-user-guide/06-codex-dual-use.md](../20-user-guide/06-codex-dual-use.md) — 설치 프로젝트에서 실제로 어떻게 쓰는지
- [../30-reference/07-pairing-registry.md](../30-reference/07-pairing-registry.md) — 현재 pairing 상태 스냅샷
- [../40-contributing/06-codex-sync-maintenance.md](../40-contributing/06-codex-sync-maintenance.md) — maintainer용 source parity 가이드
