# Risk and Migration Plan

## 리스크 분류 테이블

| 리스크 | Impact | Reach | Recovery | Total | Confidence | Action |
|---|---:|---:|---:|---:|---|---|
| Codex emitter가 새 `model` 필드를 반영하면서 비용이 예상보다 상승 | 3 | 2 | 1 | 6 | likely | needs-verification |
| 기존 사용자 `.claude/settings.json`의 hidden override가 중앙 정책과 충돌 | 2 | 2 | 1 | 5 | confirmed | auto-fixed 후보 아님, 진단 필요 |
| `availableModels`/pinning 정책이 팀 워크플로를 갑자기 제한 | 2 | 2 | 1 | 5 | likely | queued |
| Advisor-style 정책을 실제 Advisor tool과 혼동해 잘못 배포 | 3 | 1 | 1 | 5 | likely | needs-verification |
| generated output 직접 수정 후 재설치로 유실 | 1 | 2 | 0 | 3 | confirmed | auto-fixed 아님, 문서화 |
| pairing-registry에 metadata parity를 추가하면서 유지보수 비용 증가 | 1 | 2 | 1 | 4 | likely | queued |
| `buildCodexAgentToml()` 출력 스키마 변경이 기존 Codex workflow와 충돌 | 2 | 1 | 2 | 5 | likely | needs-verification |

## 실행 게이트와 패키징 규칙

| 항목 | 규칙 |
|---|---|
| Phase 1 planning 문서 | `TASK-*` 규약 사용 |
| Codex 런타임 검증 | `SPIKE-*` 규약 사용 |
| 실제 구현 task | `T-*` 규약 사용 |
| Phase 3 착수 조건 | `codex-model-runtime` Spike가 `PASS`여야 함 |
| Phase 3 변경 분류 | `BC-*` 후보로 보고 migration note를 남김 |
| Phase 4A direct integration | 현재 repo 범위 밖 |
| Phase 4B orchestration policy | 현재 repo 안에서는 ADR/spec만 허용 |

## Migration 단계

### Phase 0. Audit baseline

- 동작 변경 없음
- 현재 effective model, active target, source/emitted gap을 수집
- `Phase 1A`의 baseline 데이터를 만든다.

목표:
이후 변경의 기준선이 되는 관측 데이터를 먼저 확보한다.

### Phase 1A. Diagnostic visibility

- `model configuration diagnostic report`
- layer별 effective model 출력
- 현재 target/override/source-of-truth 가시화

목표:
현 상태를 깨지 않고 "무슨 일이 벌어지는지" 먼저 보이게 한다.

### Phase 1B. Non-breaking checks

- `model drift detector`
- `settings/profile/frontmatter consistency checker`
- metadata parity 기본 점검

목표:
정책을 강제하기 전에 non-breaking 검사를 붙여 숨은 충돌을 드러낸다.

### Phase 2. Source policy introduction

- 중앙 `model-policy` 파일 도입
- domain별 recommended model 선언
- docs generation과 diagnostic 기준선 반영

목표:
분산된 암묵적 모델 정책을 명시적 정책으로 승격한다.

### Phase 3 Gate. Codex runtime validation spike

- `codex-model-runtime` Spike 수행
- Codex direct-use가 `model` / `model_reasoning_effort`를 실제 반영하는지 확인
- 결과를 `PASS / HOLD / FAIL`로 기록

목표:
`Phase 4` 구현 가치가 실제로 있는지 먼저 검증한다.

### Phase 4. Emitter parity repair

- `buildCodexAgentToml()`에 `model`, `model_reasoning_effort` 추가
- Codex source metadata 정규화
- pairing metadata parity audit 도입

목표:
Claude↔Codex 모델 메타데이터 parity를 회복한다.

주의:
이 단계는 `Breaking Change` 후보이며, `Phase 3 Gate`가 `PASS`일 때만 진행한다.

### Phase 5. Orchestration ADR only

- advisor-ready orchestration policy
- executor/advisor pairing policy
- escalation trigger spec
- cost/latency observability 기준 정리

목표:
현재 repo에서는 direct Anthropic `Advisor tool` integration이 아니라 문서화된 orchestration policy와 실험 계획만 남긴다.

## 남은 리스크

1. Codex runtime의 `model` TOML 필드 해석 범위를 공식 외부 문서로 별도 확인하지 못했다.
2. 현재 workspace는 `targets: ["claude"]`라 Codex emitted runtime을 실제로 생성해 검증하지 않았다.
3. Advisor tool은 Anthropic API-level 기능이므로, Claude Code/Codex 쪽에서 동일 semantics가 유지된다고 단정할 수 없다.
4. ROI와 비용 절감 수치는 아직 baseline report 없이 확정할 수 없다.

## 실험으로 먼저 검증해야 할 가설

| 가설 | 분류 | 우선순위 | 선행조건 | 검증 방법 | 목적 |
|---|---|---|---|---|---|
| Codex direct-use가 TOML의 `model` 필드를 실제 반영한다 | blocker | P0 | 없음 | `SPIKE-* codex-model-runtime` | `Phase 4` 착수 여부 결정 |
| Claude-only 환경에서 `settings.model`과 frontmatter `model` 충돌 시 실제 precedence가 공식 문서와 일치한다 | parallel | P1 | 없음 | `Phase 1A` report + 샘플 충돌 설정 | precedence 검증 |
| `paired` + metadata parity audit 조합이 유지보수 부담을 감당 가능한 수준으로 유지한다 | parallel | P1 | `Phase 1B` | audit 결과 비교 | parity audit 비용 확인 |
| 중앙 정책 파일이 frontmatter 직접 편집보다 유지보수성이 높다 | parallel | P2 | `Phase 2` | drift/수정 포인트 비교 | 정책 SSOT 효과 검증 |
| `availableModels`는 강제보다 진단/권장 모드가 팀 수용성이 높다 | parallel | P2 | `Phase 1A` | warning-only 운영 + 팀 피드백 | 수용성 검증 |
| `haiku executor + opus advisor` 조합이 대표 워크로드에서 유효하다 | out-of-scope | P3 | 별도 runtime wrapper project | Anthropic API benchmark | advisor pattern 검증 |

## 바로 착수 가능한 backlog

| 항목 | 상태 | 선행조건 | 권장 패키지 유형 | 비고 |
|---|---|---|---|---|
| `scripts/model-config-report.js` | ready | 없음 | `TASK-*` | `Phase 1A` |
| `scripts/model-drift-check.js` | ready after 1A | `Phase 1A` baseline | `TASK-*` | `Phase 1B` |
| `settings/profile/frontmatter consistency checker` | ready after 1A | `Phase 1A` baseline | `TASK-*` | `Phase 1B` |
| `model-policy` 경로/스키마 결정 | needs-schema-decision | 없음 | `TASK-*` | `src/model-policy.json` vs `src/_meta/model-policy.json` |
| `codex-model-runtime` Spike | needs-planning | 없음 | `SPIKE-*` | `Phase 3 Gate` |
| `buildCodexAgentToml()` emission 확장 | needs-spike-pass | `Phase 3 Gate PASS` | `T-*` + `BC-*` note | `Phase 4` |
| metadata parity audit | ready after 1B | `Phase 1B` | `TASK-*` | `pairing-registry` 확장 포함 |
