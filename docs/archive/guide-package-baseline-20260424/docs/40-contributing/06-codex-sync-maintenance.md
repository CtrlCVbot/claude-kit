# Codex Sync Maintenance

> **Status**: Draft (P5, 2026-04-24)
> **Source**: [../../scripts/setup.js](../../scripts/setup.js), [../../scripts/docs-generate.js](../../scripts/docs-generate.js), [../../src/pairing-registry.json](../../src/pairing-registry.json), [../../src/exception-registry.json](../../src/exception-registry.json), [../../src/claude/_meta/codex-portability.json](../../src/claude/_meta/codex-portability.json)
> **Related**: [05-quality-gates.md](05-quality-gates.md), [../10-features/04-multi-target.md](../10-features/04-multi-target.md), [../20-user-guide/06-codex-dual-use.md](../20-user-guide/06-codex-dual-use.md), [../plan/codex-sync-docs-alignment-20260424/README.md](../plan/codex-sync-docs-alignment-20260424/README.md)

이 문서는 `claude-kit` 저장소 maintainers를 위한 Codex sync 운영 가이드입니다. 설치 프로젝트 사용자가 보는 runtime 결과가 아니라, source parity와 generated output 관리 원칙을 정리합니다.

## 1. 이 문서가 다루는 것

포함:

- `src/claude/**`, `src/codex/**`, `.claude/**` 사이의 유지보수 규칙
- `scripts/setup.js` 기준 output routing
- pairing, exception, portability metadata의 역할 분리
- reference 문서와 maintainer-only toolchain의 audience 경계

비포함:

- 설치 프로젝트 사용법
- 일반적인 Claude/Codex 사용법
- product feature 설명

설치 프로젝트 사용자는 [../20-user-guide/06-codex-dual-use.md](../20-user-guide/06-codex-dual-use.md)를 먼저 봅니다.

## 2. Source of truth 매트릭스

| 영역 | 현재 SSOT | 설명 |
|---|---|---|
| Codex command/agent/skill source | `src/codex/**` | `setup.js`가 Codex용 command, agent, skill을 여기서 읽는다 |
| Claude source | `src/claude/**` | Claude runtime surface의 authoring source |
| hook portability 전략 | `src/claude/_meta/codex-portability.json` | strategy, official surface, evidence, fallback target |
| 예외 승인/사유 | `src/exception-registry.json` | exemption, fallback 사유, doc constraint |
| pairing 상태 | `src/pairing-registry.json` | `paired`, `codex-skip`, `unpaired`와 drift/transition 메타데이터 |
| generated runtime output | `plugins/claude-kit/**`, `.agents/**`, `.codex/**`, `AGENTS.md` | 결과물이다. primary edit target이 아니다 |

원칙:

1. static 문서보다 `setup.js`가 우선입니다.
2. generated output은 검증 대상이지 primary fix path가 아닙니다.
3. hook은 command/agent/skill과 같은 규칙으로 다루지 않습니다.

## 3. Output routing 핵심

### 3.1 Codex direct-use와 plugin output

현재 `setup.js`는 Codex에 대해 두 종류의 결과를 냅니다.

| 출력 | source |
|---|---|
| `plugins/claude-kit/commands/*.md` | `src/codex/{domain}/commands/**` |
| `plugins/claude-kit/agents/*.md` | `src/codex/{domain}/agents/**` |
| `plugins/claude-kit/skills/*/SKILL.md` | `src/codex/{domain}/skills/**` |
| `.codex/agents/*.toml` | `src/codex/{domain}/agents/**` |
| `.agents/skills/*/SKILL.md` | `src/codex/{domain}/skills/**` |
| `AGENTS.md` managed section | template + Claude rules/guidance fallback |

현재 direct-use surface는 command를 만들지 않습니다. command는 plugin surface가 기본입니다.

### 3.2 Hook은 별도 규칙

hook은 `codex-portability.json`과 `codex-hook-compat.js`를 함께 봐야 합니다.

- `paired-direct`: `src/codex/**` 우선
- `paired-fallback`: `src/claude/**` artifact/fallback 허용
- `paired-review`, `blocked`: 문서/검증에서 별도 취급

즉, hook은 `src/codex/**`만 보면 충분하지 않습니다.

### 3.3 Rules는 `AGENTS.md`로 전달

Codex에는 `.claude/rules/*.md`의 1:1 대응 파일이 없습니다. 핵심 guidance는 `AGENTS.md` managed section으로 전달됩니다.

따라서:

- `src/codex/rules/**`를 새로 만들지 않습니다.
- `src/codex/kit/**`나 `src/claude/kit/**`도 새 source tree로 만들지 않습니다.

## 4. Metadata 역할 분리

| 파일 | 질문 |
|---|---|
| `pairing-registry.json` | 지금 이 자산이 paired인지, skip인지, unpaired인지 |
| `exception-registry.json` | 왜 skip/fallback/review가 허용됐는지 |
| `codex-portability.json` | 어떤 공식 surface와 evidence를 기준으로 portability를 설명하는지 |

문서와 toolchain은 이 셋을 혼용하지 않고 분리해서 설명하는 편이 안전합니다.

## 5. Reference와 audience 경계

현재 `docs-generate.js`는 shared `30-reference`에서 `kit` domain을 제외하고, maintainer 전용 generated surface인 [07-kit-maintenance-reference.md](07-kit-maintenance-reference.md)에 `.claude/commands/kit-*`, `.claude/agents/kit-*`, `.claude/skills/kit-*`를 모아 둡니다.

이때의 원칙은 아래와 같습니다.

1. `kit` domain은 shared runtime reference에 섞이지 않도록 별도 maintainer reference surface로 분리합니다.
2. 사용자/runtime reference는 `30-reference/01-05`, `07` 중심으로 읽습니다.
3. `06-settings.md`, `08-cli-scripts.md`는 현재 수기 유지 문서이므로 `check:docs` 통과만으로 최신성이 보장되지 않습니다.

실무적으로는 다음 두 가지를 같이 관리해야 합니다.

- generated reference: `01-05`, `07`
- generated maintainer reference: `07-kit-maintenance-reference.md`
- manual reference: `06-settings.md`, `08-cli-scripts.md`

## 6. 권장 유지보수 순서

1. `setup.js`와 metadata를 읽어 source-of-truth를 다시 고정합니다.
2. active docs를 사용자용과 maintainer용으로 나눠 정리합니다.
3. `docs-generate.js`와 generated reference를 재생성합니다.
4. `06-settings.md`, `08-cli-scripts.md`를 수동 리뷰합니다.
5. 필요하면 `.claude/agents/kit-sync-agent.md`, `.claude/commands/kit-analyze.md`, `.claude/commands/kit-sync.md`를 보정합니다.

## 7. 기본 검증 세트

```powershell
node scripts/setup.js --dry-run
node scripts/codex-hook-compat.js
node scripts/audit-pairing.js
node scripts/docs-generate.js --check
```

추가 수동 검증:

- `docs/30-reference/06-settings.md`
- `docs/30-reference/08-cli-scripts.md`
- `07-kit-maintenance-reference.md`의 generated 내용

fixture 검증도 권장합니다.

```powershell
$fixtureFresh = Join-Path $env:TEMP 'claude-kit-codex-sync-fresh'
$fixtureUpdate = Join-Path $env:TEMP 'claude-kit-codex-sync-update'

$env:INIT_CWD = $fixtureFresh
node scripts/setup.js

$env:INIT_CWD = $fixtureUpdate
node scripts/setup.js

Remove-Item Env:INIT_CWD
```

fresh install과 existing `AGENTS.md` update를 분리해서 보는 이유는 managed section merge 경로를 실제로 확인하기 위해서입니다.

## 8. `kit-sync-agent`의 역할

`kit-sync-agent`와 `kit-*` commands는 설치 프로젝트의 runtime feature가 아니라 이 저장소의 maintenance workflow입니다.

현재 기대 역할:

- Claude/Codex source parity 분석
- portability/exception/pairing metadata 해석
- 필요한 경우 Codex source 보강과 reference drift 점검

현재 한계:

- archive 설계 의도를 100% 완전히 흡수한 상태라고 단정하면 안 됩니다.
- active docs, generator, toolchain 문구는 계속 함께 맞춰야 합니다.

## 9. 금지 사항

- generated output을 primary fix path로 직접 고치기
- archive 문서를 active docs로 통째로 복사하기
- `src/codex/kit/**` 또는 `src/claude/kit/**` 새 tree 만들기
- `check:docs`만 통과했다고 manual reference까지 최신이라고 가정하기
- `kit` domain을 사용자용 reference로 무라벨 노출하기

## 다음 읽기

- [05-quality-gates.md](05-quality-gates.md) — 문서/metadata 검증 게이트
- [07-kit-maintenance-reference.md](07-kit-maintenance-reference.md) — generated maintainer-only `kit-*` reference
- [../10-features/04-multi-target.md](../10-features/04-multi-target.md) — target 구조 설명
- [../plan/codex-sync-docs-alignment-20260424/01-executable-roadmap.md](../plan/codex-sync-docs-alignment-20260424/01-executable-roadmap.md) — 실행형 로드맵
