# Feature Improvement Proposals

## 적용 원칙

- `Phase 1`은 `1A(report)`와 `1B(check)`로 분리한다.
- `Phase 3` 구현은 `codex-model-runtime` Spike가 `PASS`일 때만 진행한다.
- 현재 repo 안에서 `Advisor tool` 관련 작업은 `ADR/spec/documentation`까지만 포함한다.
- Anthropic `Advisor tool` direct integration은 별도 runtime wrapper project 범위로 본다.
- 구현 패키지로 승격할 때는 `.claude/rules/task-id-naming.md` 기준 `TASK-*`, `SPIKE-*`, `T-*` 규약을 따른다.
- `buildCodexAgentToml()` 출력 스키마 변경은 `Breaking Change` 후보로 취급한다.

## 1. Phase 1A `model configuration diagnostic report` command

- 목적: 현재 effective model과 그 출처를 레이어별로 보여준다.
- 입력: `profile.json`, `.claude/settings.json`, `.claude/settings.local.json`, env, agent frontmatter, pairing metadata
- 출력: 표 형식 보고서
- 구현 위치: 공용 script 우선, 필요 시 command 연결
- 상태: ready
- 우선순위: P1
- 왜 필요한가: 지금은 "무슨 모델이 실제로 적용됐는지"를 한 번에 볼 수 없다.

## 2. Phase 1B `model drift detector`

- 목적: source asset과 emitted runtime 사이의 모델 불일치를 찾는다.
- 입력: `src/claude/**/agents/*.md`, `src/codex/**/agents/*.md`, `.codex/agents/*.toml`, `.claude/settings.json`
- 출력: drift 목록 + severity
- 구현 위치: `scripts/model-drift-check.js`
- 상태: ready after 1A
- 우선순위: P1
- 왜 필요한가: `paired`만으로는 모델 parity를 알 수 없다.

## 3. Phase 1B `settings/profile/agent frontmatter consistency checker`

- 목적: 설치 프로파일, 런타임 settings, 개별 agent frontmatter가 충돌하는지 검사한다.
- 입력: `profile.json`, `.claude/settings*.json`, `src/claude/**/agents/*.md`
- 출력: consistency 결과
- 구현 위치: script + optional preflight command
- 상태: ready after 1A
- 우선순위: P1
- 왜 필요한가: `merge-settings.js`가 기존 env/model을 보존하므로 hidden override가 생기기 쉽다.

## 4. 중앙 `model-policy` + `domain별 recommended model policy`

- 목적: `core/dev/plan/copy`별 권장 모델, effort, inheritance 규칙을 선언한다.
- 입력: 중앙 정책 파일
- 출력: 진단 기준, 문서 표, emitter 입력값
- 구현 위치: `src/model-policy.json` 또는 `src/_meta/model-policy.json`
- 상태: needs-schema-decision
- 우선순위: P1
- 왜 필요한가: 현재는 모든 Claude agent가 사실상 `opus` 고정이고, 이유가 코드에 드러나지 않는다.

## 5. `metadata parity audit`

- 목적: 자산 존재 parity와 모델 의미 parity를 구분해 추적한다.
- 입력: `src/pairing-registry.json`, `src/exception-registry.json`, source/emitted metadata
- 출력: metadata parity 결과, intentional gap 구분
- 구현 위치: `scripts/kit-audit` 확장 또는 별도 script
- 상태: ready after 1B
- 우선순위: P1
- 왜 필요한가: 현재 `paired` 상태만으로는 모델 parity까지 확인되지 않는다.

## 6. `codex model emission parity repair`

- 목적: `buildCodexAgentToml()`가 `model` / `model_reasoning_effort`를 emit하고, Codex source metadata 손실을 줄인다.
- 입력: 중앙 정책 또는 source agent metadata
- 출력: `.codex/agents/*.toml` 모델 정책 보존
- 구현 위치: `scripts/setup.js`, Codex conversion pipeline
- 상태: gated by Spike
- 우선순위: P1
- 왜 필요한가: Codex direct-use agent 쪽에서 현재 모델 정보가 대부분 유실된다.
- 주의사항: `codex-model-runtime` Spike `PASS` 전에는 착수하지 않는다.
- 변경 분류: `Breaking Change` 후보

## 7. `subagent model inheritance visualizer`

- 목적: main session model, `CLAUDE_CODE_SUBAGENT_MODEL`, invocation override, frontmatter model의 우선순위를 시각화한다.
- 입력: Claude settings/env/frontmatter
- 출력: precedence tree
- 구현 위치: docs + diagnostic report
- 상태: phase 2+
- 우선순위: P2
- 왜 필요한가: 공식 우선순위는 있지만 저장소 사용자에게 보이지 않는다.

## 8. `advisor-ready orchestration policy`

- 목적: 어떤 에이전트/도메인이 advisor-style escalation 후보인지 정의한다.
- 입력: domain policy, task complexity signal
- 출력: escalation 허용 여부와 문서화된 정책
- 구현 위치: docs/ADR 우선
- 상태: ADR/spec only
- 우선순위: P2
- 왜 필요한가: Advisor는 모든 작업에 붙이는 기능이 아니라 조건부 전략 패턴이기 때문이다.

## 9. `executor/advisor pairing policy`

- 목적: executor/advisor 조합, 허용 모델 쌍, 금지 조합을 정의한다.
- 입력: 공식 Anthropic compatibility 표 + 내부 workload 분류
- 출력: pairing matrix
- 구현 위치: docs/ADR 또는 policy appendix
- 상태: ADR/spec only
- 우선순위: P2
- 왜 필요한가: 공식 Advisor tool도 유효한 모델 쌍을 요구한다.

## 10. `advisor escalation trigger spec`

- 목적: 언제 advisor-style escalation을 일으킬지 명시한다.
- 후보 트리거:
  - 테스트 2회 이상 실패
  - architecture decision 필요
  - planning contradiction 탐지
  - file scope 안에서 해결되지 않는 구조 충돌
- 구현 위치: docs/ADR → 향후 별도 runtime integration
- 상태: ADR/spec only
- 우선순위: P2
- 왜 필요한가: "좋을 것 같으면 호출"은 운영 규칙이 아니다.

## 11. `advisor cost/latency observability dashboard spec`

- 목적: executor/advisor 호출 수, 평균 지연, 품질 이득, 비용 증가를 관측한다.
- 입력: 향후 runtime telemetry
- 출력: dashboard spec
- 구현 위치: docs/spec
- 상태: future / separate runtime context
- 우선순위: P3
- 왜 필요한가: 공식 문서도 workload별 평가를 권장한다.

## 우선순위 매트릭스

| 기능 | 가치 | 난이도 | 상태 | 권장 순서 |
|---|---|---|---|---|
| Phase 1A diagnostic report | 높음 | 낮음 | ready | 1 |
| Phase 1B drift detector | 높음 | 낮음 | ready after 1A | 2 |
| Phase 1B consistency checker | 높음 | 낮음 | ready after 1A | 3 |
| 중앙 model-policy + domain policy | 높음 | 중간 | needs-schema-decision | 4 |
| metadata parity audit | 높음 | 중간 | ready after 1B | 5 |
| codex model emission parity repair | 높음 | 중간 | gated by Spike | 6 |
| subagent model inheritance visualizer | 중간 | 중간 | phase 2+ | 7 |
| advisor-ready orchestration policy | 중간 | 중간 | ADR/spec only | 8 |
| executor/advisor pairing policy | 중간 | 중간 | ADR/spec only | 9 |
| advisor escalation trigger spec | 중간 | 중간 | ADR/spec only | 10 |
| advisor cost/latency dashboard spec | 중간 | 높음 | future | 11 |

## 실행 순서와 gate

1. `Phase 1A diagnostic report`를 먼저 ship해서 현 상태를 가시화한다.
2. `Phase 1B`의 drift detector와 consistency checker로 non-breaking 검사를 붙인다.
3. 중앙 `model-policy`의 경로와 스키마를 확정한다.
4. `SPIKE-*` 패키지로 `codex-model-runtime` 검증을 먼저 수행한다.
5. Spike가 `PASS`일 때만 `codex model emission parity repair`에 착수한다.
6. Advisor 관련 작업은 현재 repo 안에서는 `ADR/spec`로만 남긴다.

## 구현 패키징 메모

| 항목 | 권장 규칙 |
|---|---|
| planning 문서/기획 패키지 | `TASK-*` |
| spike 검증 패키지 | `SPIKE-*` |
| 실제 dev 구현 task | `T-*` |
| Phase 3 emitter 변경 | `BC-*` 후보로 분류 |
