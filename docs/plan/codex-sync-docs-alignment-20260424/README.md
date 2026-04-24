# Codex Sync 문서 정리 및 `kit-sync-agent` 정합성 점검 계획

> **상태**: 계획 초안 (2026-04-24)
> **범위**: `docs/archive/repo-local-codex-kit-sync/` 기반 active docs 재정리 + `.claude` maintenance toolchain 정합성 점검
> **이번 단계 산출물**: 계획 문서만 작성. active docs, `.claude`, `scripts/`는 아직 수정하지 않음

## 빠른 이동

- 실행형 로드맵: [01-executable-roadmap.md](01-executable-roadmap.md)
- 기준 계획: 현재 문서

## 0. 요약

| 항목 | 결론 |
|---|---|
| source of truth | archive 문서보다 현재 구현인 [`scripts/setup.js`](../../../scripts/setup.js), [`src/pairing-registry.json`](../../../src/pairing-registry.json), [`src/exception-registry.json`](../../../src/exception-registry.json), `.claude` maintenance toolchain을 우선한다 |
| archive 승격 방식 | `repo-local-codex-kit-sync` 패키지 전체를 active docs로 올리지 않고, 핵심 계약만 재구성해서 반영한다 |
| 우선 정리 대상 | [`../../README.md`](../../README.md), [`../../10-features/04-multi-target.md`](../../10-features/04-multi-target.md), [`../../20-user-guide/06-codex-dual-use.md`](../../20-user-guide/06-codex-dual-use.md), 신규 maintainer 가이드 |
| reference 처리 | [`../../30-reference/01-commands.md`](../../30-reference/01-commands.md), [`../../30-reference/02-agents.md`](../../30-reference/02-agents.md), [`../../30-reference/07-pairing-registry.md`](../../30-reference/07-pairing-registry.md) 는 generator 기반으로 유지하고 재생성/검증한다 |
| `kit-sync-agent` 판정 | **부분 반영**. `setup.js`, `kit-convert`, `kit-create`, `kit-validate`는 archive 방향을 많이 흡수했지만, `kit-sync-agent` 본문과 `kit-analyze`/`kit-sync` 설명은 아직 source parity 계약을 완전하게 반영하지 못했다 |
| 추천 구현 방향 | 사용자용 듀얼 사용 가이드와 maintainer용 codex sync 가이드를 분리하고, `docs/README.md`에서 둘을 명시적으로 연결한다 |

## 1. 목표

이 계획의 목표는 세 가지다.

1. [`../../archive/repo-local-codex-kit-sync/`](../../archive/repo-local-codex-kit-sync/) 문서에서 지금도 유효한 codex sync 설계 원칙을 추려 active docs에 반영한다.
2. 현재 [`../../README.md`](../../README.md) 기준 문서 진입점에서 codex sync 관련 문서를 어디에 배치하고 어떻게 링크할지 정한다.
3. `.claude` 아래의 `kit-sync-agent`와 관련 maintenance toolchain이 archive 설계 의도에 맞게 개선되었는지 판단하고, 남은 정렬 작업을 후속 계획으로 남긴다.

## 2. 가정과 경계

### 2.1 가정

- archive 문서는 설계 이력과 의사결정 근거다. 현재 동작 보장은 하지 않는다.
- 현재 실제 동작은 [`scripts/setup.js`](../../../scripts/setup.js)가 결정한다.
- `pairing-registry-v2`는 이미 적용된 상태로 본다. 이번 계획은 재도입이 아니라 문서/리포트/생성기 정합성 정리다.

### 2.2 명시적 경계

- `kit-sync`는 설치된 소비자 프로젝트에서 실행하는 runtime 기능이 아니라 이 저장소의 maintenance pipeline으로 다룬다.
- `src/codex/kit/**` 또는 `src/claude/kit/**`는 만들지 않는다.
- `plugins/claude-kit/**`, generated `AGENTS.md`, `.agents/plugins/marketplace.json`은 primary edit target으로 보지 않는다.
- reference 문서가 auto-generated인 경우 수기 편집 대신 generator 흐름을 우선 검토한다.

## 3. 기준 문서와 핵심 인사이트

| 기준 문서 | 핵심 인사이트 | active docs 반영 방향 |
|---|---|---|
| [`../../archive/repo-local-codex-kit-sync/README.md`](../../archive/repo-local-codex-kit-sync/README.md) | codex sync는 repo-local maintenance pipeline이며 소비자 프로젝트 runtime 기능이 아니다 | docs 진입점과 maintainer 가이드에 경계 명시 |
| [`../../archive/repo-local-codex-kit-sync/06-kit-sync-agent-redesign.md`](../../archive/repo-local-codex-kit-sync/06-kit-sync-agent-redesign.md) | `kit-sync-agent`의 목적은 plugin output 수정이 아니라 source parity orchestration이다 | maintainer 가이드와 `.claude` 정렬 체크리스트로 흡수 |
| [`../../archive/repo-local-codex-kit-sync/08-source-parity-contract.md`](../../archive/repo-local-codex-kit-sync/08-source-parity-contract.md) | generated output은 parity source가 아니며, `kit-*` toolchain은 product parity asset이 아니다 | maintainer 가이드의 핵심 계약 섹션으로 승격 |
| [`../../archive/repo-local-codex-kit-sync/09-installation-output-contract.md`](../../archive/repo-local-codex-kit-sync/09-installation-output-contract.md) | Codex output은 plugin output과 direct-use output을 분리해 설명해야 한다 | feature/user guide 문서 수정 근거로 사용 |
| [`../../archive/repo-local-codex-kit-sync/10-review-findings-resolution.md`](../../archive/repo-local-codex-kit-sync/10-review-findings-resolution.md) | `src/codex/kit/**` 금지, maintenance alignment 선행, registry/status 혼동 금지 | acceptance criteria와 검증 표로 반영 |
| [`../../../scripts/setup.js`](../../../scripts/setup.js) | 실제 emitter는 `src/codex/**` 기준으로 plugin output과 direct-use output을 함께 만든다 | active docs의 최우선 사실 근거 |
| [`../../../src/pairing-registry.json`](../../../src/pairing-registry.json) | `paired`, `codex-skip`, `unpaired`, `transitionState`, `primaryCodex`, `driftStatus`가 이미 사용 중이다 | status 설명과 reference 문서 갱신 기준 |
| [`../../../.claude/commands/kit-convert.md`](../../../.claude/commands/kit-convert.md), [`../../../.claude/commands/kit-create.md`](../../../.claude/commands/kit-create.md), [`../../../.claude/commands/kit-validate.md`](../../../.claude/commands/kit-validate.md) | maintenance boundary, `pairing-registry-v2`, `command-primary`, `dual-output`, `src/codex/kit/**` 금지 등이 반영돼 있다 | `kit-sync-agent` 정렬 여부 판단의 비교 기준 |

## 4. 현재 문서 구조 갭 분석

| 문서 | 현재 역할 | 현재 상태 | 갭 | 계획 |
|---|---|---|---|---|
| [`../../README.md`](../../README.md) | docs 전체 진입점 | 섹션 중심 안내는 있으나 codex sync 진입점이 드러나지 않음 | codex sync 관련 문서를 어디서 읽어야 하는지 한눈에 안 보임 | quick links 또는 별도 "Codex sync / dual-use" 묶음 추가 |
| [`../../10-features/04-multi-target.md`](../../10-features/04-multi-target.md) | Claude/Codex 멀티타깃 설명 | codex path와 status 설명이 초기 설계 기준에 머무는 부분이 있음 | direct-use output, strict `src/codex` 정책, 최신 status vocabulary 반영이 부족 | 핵심 feature 설명 문서로 업데이트 |
| [`../../20-user-guide/06-codex-dual-use.md`](../../20-user-guide/06-codex-dual-use.md) | 사용자용 듀얼 사용 가이드 | direct-use output, maintainer boundary 설명이 이미 일부 반영됨 | feature 문서와 용어/링크 정렬 필요 | 가벼운 수정 + maintainer 가이드 링크 추가 |
| [`../../30-reference/01-commands.md`](../../30-reference/01-commands.md) | command reference | `kit-*` command 존재는 보임 | 의미 설명보다는 카탈로그 성격이라 개념 문서 역할은 어려움 | 그대로 유지, README와 maintainer 가이드에서 링크 |
| [`../../30-reference/02-agents.md`](../../30-reference/02-agents.md) | agent reference | `kit-sync-agent` 노출은 됨 | 역할 경계와 현재 정렬 수준을 설명하지 않음 | 그대로 유지, 설명은 maintainer 가이드에서 보강 |
| [`../../30-reference/07-pairing-registry.md`](../../30-reference/07-pairing-registry.md) | registry snapshot | generator 산출물이라 구조상 맞지만 재생성/검증 필요 | 최신 registry 상태와 생성일 표기가 stale할 가능성 | generator 재실행, 필요 시 generator 날짜/설명 로직 검토 |
| active docs 전체 | 사용자/유지보수 문서 혼합 | codex 관련 정보가 여러 문서에 분산 | "사용자용"과 "유지보수용" 독서 흐름이 분리되지 않음 | 신규 maintainer 가이드로 허브를 만든다 |

## 5. `kit-sync-agent` 및 maintenance toolchain 정합성 판단

### 5.1 판정 요약

| 대상 | 판정 | 근거 |
|---|---|---|
| [`../../../scripts/setup.js`](../../../scripts/setup.js) | **정렬됨** | direct-use output(`.agents/skills/**`, `.codex/agents/*.toml`)과 plugin output을 함께 생성하고, direct Codex surfaces를 `src/codex` 기준으로 처리한다 |
| [`../../../.claude/commands/kit-convert.md`](../../../.claude/commands/kit-convert.md) | **대체로 정렬됨** | `pairing-registry-v2`, `transitionState`, maintenance boundary, `src/codex/kit/**` 금지를 반영한다 |
| [`../../../.claude/commands/kit-create.md`](../../../.claude/commands/kit-create.md) | **대체로 정렬됨** | `command-primary` 기본값, `transitionState`, `kit` domain 비활성 경계를 반영한다 |
| [`../../../.claude/commands/kit-validate.md`](../../../.claude/commands/kit-validate.md) | **대체로 정렬됨** | maintenance toolchain 제외, v2 필드 검증을 포함한다 |
| [`../../../.claude/commands/kit-analyze.md`](../../../.claude/commands/kit-analyze.md) | **부분 반영** | 4-tier와 drift 개념은 들어왔지만 여전히 "전환 준비 상태(auto/review/skip)" framing이 강하고, maintenance alignment 및 install output impact가 핵심 출력으로 승격되진 않았다 |
| [`../../../.claude/commands/kit-sync.md`](../../../.claude/commands/kit-sync.md) | **부분 반영** | `kit-sync-agent` 호출 흐름은 설명하지만 source parity pipeline, emitter dry-run, generated output non-primary edit 원칙이 전면화되진 않았다 |
| [`../../../.claude/agents/kit-sync-agent.md`](../../../.claude/agents/kit-sync-agent.md) | **부분 반영** | 4-tier/evidence/resync/reporting은 반영됐지만, archive가 요구한 "actual emitter wins", "generated output은 primary edit target 아님", "maintenance alignment gate", "`scripts/setup.js --dry-run` 검증"이 prompt 중심 규칙으로는 약하다 |
| [`../../../.claude/agent-memory/kit-sync-agent/MEMORY.md`](../../../.claude/agent-memory/kit-sync-agent/MEMORY.md) | **미흡** | copy-domain conversion/resync 기록만 있고 `repo-local-codex-kit-sync` 설계 의사결정 메모는 없다 |

### 5.2 결론

`kit-sync-agent` 계열은 **전혀 개선되지 않은 상태는 아니지만, archive 설계가 요구한 최종 상태까지는 아직 도달하지 못했다**고 본다. 특히 아래 항목은 문서화와 prompt 정렬 후속 작업이 필요하다.

- source parity 중심 설명으로 용어를 재정렬할 것
- generated output 수정이 primary fix path가 아니라는 점을 agent/command 설명에 명시할 것
- `scripts/setup.js --dry-run`과 `scripts/codex-hook-compat.js`를 verification 기본 세트로 끌어올릴 것
- maintenance toolchain 자체를 product asset으로 오해하지 않도록 `.claude` prompt/memory를 보강할 것

## 6. active docs 재구성 추천안

### 6.1 추천 문서 세트

| 구분 | 파일 | 처리 | 목적 |
|---|---|---|---|
| 진입점 | [`../../README.md`](../../README.md) | 수정 | codex sync / dual-use / pairing reference 진입점 제공 |
| feature 설명 | [`../../10-features/04-multi-target.md`](../../10-features/04-multi-target.md) | 수정 | 현재 emitter 기준 멀티타깃 구조와 output 설명 정렬 |
| 사용자 가이드 | [`../../20-user-guide/06-codex-dual-use.md`](../../20-user-guide/06-codex-dual-use.md) | 수정 | 소비자 프로젝트 관점에서 무엇을 하고 무엇을 하지 않는지 정리 |
| maintainer 가이드 | `docs/40-contributing/06-codex-sync-maintenance.md` | 신규 | source parity, maintenance boundary, verification, `kit-sync-agent` 역할 허브 |
| reference | [`../../30-reference/01-commands.md`](../../30-reference/01-commands.md), [`../../30-reference/02-agents.md`](../../30-reference/02-agents.md), [`../../30-reference/07-pairing-registry.md`](../../30-reference/07-pairing-registry.md) | 재생성 | product domains 중심 reference 최신화, `kit` domain은 maintainer-only boundary를 명시적으로 분리 또는 라벨링 |

참고:

- 현재 `scripts/docs-generate.js`는 `.claude/commands/kit-*`, `.claude/agents/kit-*`, `.claude/skills/kit-*`를 `kit` domain으로 계속 노출한다.
- 따라서 audience 분리는 신규 maintainer 가이드만으로 끝내지 않고, U4에서 `kit` domain 노출 방식을 같이 정리해야 한다.
- 추천안은 `kit` domain을 maintainer-only 부록 또는 별도 reference로 분리하는 것이다.
- 분리가 당장 어렵다면 최소한 `01-commands.md`와 `02-agents.md`에서 `kit` 항목에 `maintainer-only` 라벨과 maintainer 가이드 링크를 붙인다.

### 6.2 archive 승격 원칙

archive 문서를 active docs로 그대로 복사하지 않고 아래처럼 "요약 승격"한다.

| archive 문서 | 승격 방식 |
|---|---|
| `06-kit-sync-agent-redesign.md` | 신규 maintainer 가이드의 역할/경계/검증 섹션으로 흡수 |
| `08-source-parity-contract.md` | maintainer 가이드의 핵심 계약 표로 흡수 |
| `09-installation-output-contract.md` | `04-multi-target.md`와 `06-codex-dual-use.md`의 output 설명 근거로 흡수 |
| `10-review-findings-resolution.md` | acceptance criteria와 검증 체크리스트로 흡수 |
| `07-implementation-roadmap.md` | 이번 실행 단계 표의 골격으로 재사용 |

## 7. 실행 단계

| 단계 | 목표 | 산출물 | 검증 |
|---|---|---|---|
| P0 | 사실 기준 고정 | `setup.js`, registries, hook portability metadata, `.claude` toolchain, archive 핵심 문서 대조표 | active docs보다 구현 우선 원칙 확인 |
| P1 | active docs IA 확정 | 수정/신규 문서 목록, 각 문서의 audience 정의 | 중복 문서 없이 사용자용/maintainer용 흐름 분리 |
| P2 | active docs 초안 작성 | `docs/README.md`, `04-multi-target.md`, `06-codex-dual-use.md`, 신규 maintainer guide | 링크 흐름과 용어 일관성 리뷰 |
| P3 | reference/생성기 정리 | `docs-generate.js` 재실행, `kit` domain audience 경계 정리, 필요 시 날짜/표현 로직 보정 | generated set 체크 + `06-settings.md`/`08-cli-scripts.md` 수동 리뷰 또는 generator 확장 |
| P4 | maintenance toolchain 설명 정렬 | 필요 시 `.claude/agents/kit-sync-agent.md`, `kit-analyze.md`, `kit-sync.md`, agent-memory 보강 | archive 설계 대비 누락 규칙 해소 여부 확인 |
| P5 | 최종 검증 | docs 링크, stale 용어, dry-run 결과, generator drift, fresh/update fixture 확인 | 아래 §8 검증 기준 통과 |

## 8. 검증 방법

| 검증 항목 | 방법 | 기대 결과 |
|---|---|---|
| emitter 정합성 | `node scripts/setup.js --dry-run` | active docs의 output 설명과 dry-run preview가 모순되지 않음 |
| hook portability 정합성 | `src/claude/_meta/codex-portability.json`과 `node scripts/codex-hook-compat.js`를 함께 대조 | hook direct/fallback/review 설명이 현재 metadata와 충돌하지 않음 |
| reference 최신성 | `node scripts/docs-generate.js --check` + `06-settings.md`/`08-cli-scripts.md` 수동 리뷰 또는 generator 확장 | generated set과 비생성 reference 모두 drift 0 |
| reference audience 경계 | `30-reference`에서 `kit` domain 노출 방식 검토 | maintainer-only 항목이 사용자용 흐름에 무라벨로 섞이지 않음 |
| stale 용어 검사 | active docs에서 `claude-only`, `codex-only`, legacy `skip` status 문맥 grep | 최신 registry/status vocabulary에 맞게 정리됨 |
| 경계 검사 | active docs와 `.claude` 설명에서 "소비자 프로젝트 안에서 `kit-sync` 실행" 권장 표현 grep | maintainer-only boundary가 유지됨 |
| 생성 경로 검사 | `src/codex/kit/**`, `src/claude/kit/**` 생성/유도 표현 grep | 생성 금지 원칙 유지 |
| AGENTS runtime guidance | `AGENTS.md` 또는 template 관련 문서 검토 | source path/maintainer metadata를 runtime guidance로 오해시키지 않음 |
| install/update fixture | temp fixture에서 fresh install 1회, 기존 `AGENTS.md` update 1회 확인 | managed section merge가 사용자 작성 영역을 깨뜨리지 않음 |

## 9. 리스크와 보류 사항

| ID | 리스크 | Impact | Reach | Recovery | Total | Confidence | Action |
|---|---|---:|---:|---:|---:|---|---|
| R1 | `04-multi-target.md`가 실제 emitter보다 오래된 개념을 계속 설명하면 사용자와 maintainers 모두 잘못된 mental model을 갖게 된다 | 3 | 2 | 1 | 6 | likely | queued |
| R2 | 소비자용 문서와 maintainer용 문서가 섞이면 설치 프로젝트에서 `kit-sync`를 실행해도 된다고 오해할 수 있다 | 3 | 2 | 2 | 7 | likely | queued |
| R3 | `kit-sync-agent` prompt가 실제 구현보다 앞선 계약을 문서로만 약속하면 유지보수자가 에이전트 capability를 과신할 수 있다 | 2 | 2 | 1 | 5 | likely | needs-verification |
| R4 | `30-reference`를 재생성해도 `06-settings.md`와 `08-cli-scripts.md`가 수동 리뷰 범위에 남아 있으면 reference drift가 숨어 있을 수 있다 | 2 | 2 | 1 | 5 | likely | queued |
| R5 | archive 패키지를 통째로 active docs처럼 노출하면 source-of-truth가 복제되어 다시 drift가 생긴다 | 2 | 2 | 1 | 5 | likely | queued |
| R6 | `kit` domain이 공용 reference에 무라벨로 남아 있으면 audience 분리 목표가 문서 구조에서 무력화된다 | 3 | 2 | 1 | 6 | likely | queued |
| R7 | `setup.js --dry-run`만으로 최종 검증을 끝내면 `AGENTS.md` merge/update 경로 회귀를 놓칠 수 있다 | 3 | 1 | 2 | 6 | likely | needs-verification |

## 10. 최종 권장안

추천안은 아래와 같다.

1. `repo-local-codex-kit-sync` 전체를 active docs로 승격하지 않는다.
2. 사용자용 흐름은 `README -> 10-features/04-multi-target -> 20-user-guide/06-codex-dual-use`로 정리한다.
3. 유지보수용 흐름은 신규 `40-contributing/06-codex-sync-maintenance.md`를 허브로 두고, archive 06/08/09/10의 핵심 계약만 요약 승격한다.
4. `kit-sync-agent` 개선 여부는 "부분 반영"으로 기록하고, `.claude` prompt/command/memory 정렬을 후속 구현 트랙으로 분리한다.
5. reference 문서는 수기 수정 대신 generator 검증/재생성을 포함한 작업으로 처리하되, 현재 `--check` 대상이 아닌 `06-settings.md`와 `08-cli-scripts.md`는 수동 리뷰 또는 generator 확장으로 함께 묶는다.
6. `kit` domain은 공용 reference에 그대로 방치하지 말고 maintainer-only로 분리하거나 최소 라벨링한다.
7. 최종 검증에는 `--dry-run` 외에 fresh install fixture와 existing `AGENTS.md` update fixture를 포함한다.

## 11. 후속 구현 시 체크리스트

- [ ] `docs/README.md`에 codex sync quick links 추가
- [ ] `10-features/04-multi-target.md`를 현재 `setup.js` 기준으로 수정
- [ ] `20-user-guide/06-codex-dual-use.md`의 용어와 링크 정렬
- [ ] `40-contributing/06-codex-sync-maintenance.md` 신규 작성
- [ ] `30-reference` 생성기 재실행 및 drift 확인
- [ ] `06-settings.md`와 `08-cli-scripts.md`를 수동 리뷰하거나 generator 검증 범위에 편입
- [ ] `kit` domain reference를 maintainer-only로 분리 또는 라벨링
- [ ] 필요 시 `.claude/agents/kit-sync-agent.md`, `kit-analyze.md`, `kit-sync.md`, agent-memory 정렬
- [ ] `src/claude/_meta/codex-portability.json` 기준 hook portability 설명 재확인
- [ ] temp fixture에서 fresh install / existing `AGENTS.md` update 검증
- [ ] `src/codex/kit/**` 생성 금지와 maintainer-only boundary 최종 재확인

## 12. 참고 경로

- archive 설계 패키지: [`../../archive/repo-local-codex-kit-sync/`](../../archive/repo-local-codex-kit-sync/)
- source parity 계약: [`../../archive/repo-local-codex-kit-sync/08-source-parity-contract.md`](../../archive/repo-local-codex-kit-sync/08-source-parity-contract.md)
- installation output 계약: [`../../archive/repo-local-codex-kit-sync/09-installation-output-contract.md`](../../archive/repo-local-codex-kit-sync/09-installation-output-contract.md)
- review findings 해소 계획: [`../../archive/repo-local-codex-kit-sync/10-review-findings-resolution.md`](../../archive/repo-local-codex-kit-sync/10-review-findings-resolution.md)
- actual emitter: [`../../../scripts/setup.js`](../../../scripts/setup.js)
- registry: [`../../../src/pairing-registry.json`](../../../src/pairing-registry.json), [`../../../src/exception-registry.json`](../../../src/exception-registry.json)
- maintainer toolchain: [`../../../.claude/agents/kit-sync-agent.md`](../../../.claude/agents/kit-sync-agent.md), [`../../../.claude/commands/kit-analyze.md`](../../../.claude/commands/kit-analyze.md), [`../../../.claude/commands/kit-sync.md`](../../../.claude/commands/kit-sync.md), [`../../../.claude/commands/kit-convert.md`](../../../.claude/commands/kit-convert.md)
