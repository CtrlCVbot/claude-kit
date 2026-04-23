# Source parity 구현 로드맵

> **Status**: Draft plan (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23

이 로드맵은 `claude-kit` 저장소에서 source parity를 먼저 맞추고, 그 다음 설치 output을 확장하는 순서입니다. repo-local output을 손으로 만드는 우회 작업도, 설치된 소비자 프로젝트 안에서 sync를 실행하는 작업도 아닙니다. `src/claude` ↔ `src/codex` 매칭과 emitter 개선이 중심입니다.

## P0. Source inventory baseline

목표: source asset 기준으로 현재 상태를 고정합니다.

작업:

- `src/claude/**`와 `src/codex/**` asset inventory 생성
- `.claude/**` runtime output은 보조 증거로만 기록
- `src/pairing-registry.json`, `src/exception-registry.json`, `src/claude/_meta/codex-portability.json` 로드
- `scripts/setup.js` 현재 emitter 동작 기록

검증:

- asset type별 count report
- generated output 직접 edit 없음

## P1. Source parity contract 확정

목표: asset type별 매칭 계약을 확정합니다.

작업:

- commands → Codex skills/commands 기준 확정
- skills → Codex skills direct 기준 확정
- agents → Codex agent source와 `.toml` output 기준 확정
- rules → AGENTS template/docs fallback 기준 확정
- hooks → direct/fallback/review 기준 확정
- agent-memory → skill references/docs 기준 확정
- kit maintenance toolchain 경계 확정: `.claude/agents/kit-sync-agent.md`, `.claude/skills/kit-converter/**`, `.claude/skills/kit-scaffolding/**`, `.claude/skills/kit-validation/**`, `.claude/commands/kit-*.md`는 repo-maintenance 도구이며 `src/codex/kit/**` target이 아님
- command transition state 확정: `command-primary`, `skill-primary`, `dual-output`, `command-wrapper`, `deprecated-command`

검증:

- [08-source-parity-contract.md](08-source-parity-contract.md)와 registry 상태가 충돌하지 않음

## P1.5. Maintenance toolchain alignment와 registry migration

목표: 기존 `.claude` kit maintenance toolchain이 새 source parity 계약과 같은 언어를 쓰도록 먼저 맞춥니다. 이 단계는 toolchain 자체를 Codex product asset으로 변환하지 않습니다.

작업:

- `.claude/skills/kit-converter/SKILL.md`의 command mapping을 command-only에서 command/skill target selection으로 변경하는 계획 확정
- `.claude/commands/kit-convert.md`, `.claude/commands/kit-create.md`, `.claude/commands/kit-validate.md`의 command target 정책 갱신 범위 확정
- `.claude/skills/kit-validation/references/schema-pairing-registry.md`를 `pairing-registry-v2` migration 대상으로 정의
- 기존 `command, paired` entries를 `transitionState: command-primary`, `primaryCodex: command`, `codexSkill: null`로 마이그레이션하는 규칙 확정
- `metadata-drift`, `generated-mismatch`, `content-drift`는 registry `status`가 아니라 `driftStatus` 또는 analyze report status로 분리
- `.claude/commands/kit-*`와 `.claude/agents/kit-sync-agent.md`는 migration 대상 product command/agent에서 제외
- `src/codex/kit/**` 생성 금지

검증:

- 기존 paired command가 missing/drift로 오판되지 않음
- command를 skill로 승격해도 기존 command path가 보존되거나 wrapper로 명시됨
- audit/report 스크립트가 v2 field를 unknown field로 실패 처리하지 않음
- `src/codex/kit/**` 생성 후보가 report에 나오지 않음

## P2. `kit-analyze` 재정의 구현

목표: `kit-analyze`를 source parity analyzer로 확장합니다.

작업:

- generated output 대신 source inventory를 기준으로 분석
- missing/drift/generated-mismatch 상태 추가
- metadata-drift 상태 추가
- command transition state 컬럼 추가
- `registryStatus`와 `analysisStatus`를 분리
- portability manifest와 hook compat 결과 통합
- installation output impact 컬럼 추가

검증:

- `kit-analyze --include-paired --verbose`가 source drift를 표시
- rules는 rules policy candidate와 AGENTS fallback을 분리 표시
- hooks는 direct source와 runtime activation을 분리 표시
- existing paired command는 기본 `command-primary`로 표시
- maintenance toolchain이 미정렬이면 `needs-alignment`로 표시하고 product source 생성을 막음

## P3. `kit-sync` 재정의 구현

목표: analyze 결과를 바탕으로 `src/codex/**`와 source templates를 갱신합니다.

작업:

- missing Codex source 생성
- drift Codex source 갱신
- rules fallback template/docs 갱신
- hooks direct/fallback/review 처리
- registries 갱신
- portability metadata drift 갱신
- command-to-skill migration은 `dual-output` 상태를 먼저 거침
- approval gate 유지
- maintenance toolchain alignment가 완료되지 않은 command는 자동 변환하지 않음
- kit maintenance commands는 product command/skill 변환 대상에서 제외

검증:

- generated output 직접 수정 없음
- `node scripts/setup.js --dry-run`
- `node scripts/codex-hook-compat.js`

## P4. `kit-sync-agent` orchestration 변경

목표: agent가 이 저장소의 source parity pipeline을 orchestration하게 합니다.

작업:

- agent prompt에서 plugin output 수정 경로 제거
- source-of-truth 확인을 필수 step으로 승격
- missing/drift/review 승인 흐름 추가
- installation output impact report 추가

검증:

- dry-run 요청에서 source edit 없이 report만 생성
- resync 요청에서 paired source drift만 대상으로 삼음
- generated output edit를 권장하지 않음
- 소비자 프로젝트에서 실행할 sync agent 설치를 권장하지 않음

## P5. Installation output contract 구현

목표: 소비자 프로젝트 설치 시 Codex target active 상태라면 direct-use output을 생성합니다.

작업:

- `scripts/setup.js`에서 Codex skills를 `.agents/skills/**`로 생성
- Codex agents를 `.codex/agents/**`로 생성
- Codex agent TOML 생성 스키마 구현
- direct-use output managed marker와 conflict report 구현
- `AGENTS.md`는 template source에서 생성/보존
- plugin output은 기존대로 유지하되 source를 `src/codex/**` 기준으로 정렬
- hooks는 v1에서 `.codex/hooks.json` 자동 활성화보다 fallback docs 우선

검증:

- `node scripts/setup.js --dry-run`
- fresh install fixture에서 `.agents/skills`, `.codex/agents`, `AGENTS.md`, plugin output 확인
- update install에서 사용자 파일 보존 확인
- fixture에 `kit-sync-agent`나 `kit-*` commands가 설치되지 않는지 확인

## P6. End-to-end parity verification

목표: source parity와 install output을 함께 검증합니다.

작업:

- `kit-analyze` report와 실제 source tree 비교
- `kit-sync --dry-run` 결과와 registry 비교
- setup dry-run과 output contract 비교
- 문서 링크/템플릿 drift 확인

검증:

- commands/skills/agents/rules/hooks/agent-memory 모두 target strategy 보유
- missing 또는 drift 항목 0개 또는 승인된 exception 보유

## Definition of Done

| 기준 | 완료 조건 |
|------|-----------|
| source parity | 모든 `src/claude` asset이 Codex target/fallback/blocked 중 하나로 분류 |
| analyze | source 기준 missing/drift/generated-mismatch 출력 |
| sync | `src/codex`, templates, registries만 primary edit |
| agent | 이 저장소 maintenance orchestration으로 역할 재정의 |
| install | plugin output과 direct-use output 동시 계약 |
| verification | hook compat, setup dry-run, registry audit 정의 |

## 주요 리스크

| 리스크 | 심각도 | 대응 |
|------|------|------|
| 현재 emitter가 `SRC_CLAUDE`를 읽음 | high | P5에서 `src/codex` source 기준으로 emitter 재정렬 |
| hooks runtime parity 불확실 | high | source parity와 runtime activation 분리 |
| `AGENTS.md` 직접 수정 유혹 | medium | template-first 정책 |
| command→skill 중복 | medium | `kit-analyze`가 target type 중복 탐지 |
| plugin output과 direct-use output drift | medium | installation output contract 검증 |
| kit maintenance toolchain이 product asset처럼 배포됨 | high | `src/codex/kit/**` 금지와 설치 output exclusion 검증 |
