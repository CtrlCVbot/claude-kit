# Executive Summary

## 작업 목적

이 패키지는 `claude-kit` 저장소에서 "AI 모델 구성을 어디서, 어떻게, 왜 바꿀 수 있는가"를 분석하고, Anthropic 공식 `Advisor tool`과 `Claude Code`의 공식 모델 구성 방식을 현재 파이프라인과 비교해 개선안을 제시한다.

## 핵심 결론

| 항목 | 결론 | 근거 |
|---|---|---|
| 현재 기본 런타임 타깃 | 현재 프로젝트는 `claude`만 활성화되어 있고 `codex`는 비활성 상태다. | `profile.json`, `node scripts/setup.js --dry-run` |
| Claude 쪽 모델 SSOT | 실질적인 모델 선택은 `src/claude/**/agents/*.md`의 frontmatter `model`과 사용자가 추가하는 `.claude/settings.json` / `.claude/settings.local.json` / env 조합에서 결정된다. | `src/claude/**/agents/*.md`, `scripts/setup.js`, `merge-settings.js`, Claude Code docs |
| 현재 Claude 모델 분포 | 저장소의 Claude 에이전트 21개가 모두 `model: opus`를 사용한다. | `src/claude/**/agents/*.md`, `docs/30-reference/02-agents.md` |
| settings 계층의 현재 한계 | `setup.js`가 생성하는 `.claude/settings.json`에는 `model` 필드도, `ANTHROPIC_MODEL` / `ANTHROPIC_DEFAULT_*` pinning env도 기본 포함되지 않는다. | `scripts/setup.js`, `.claude/settings.json`, `src/templates/settings.json.template` |
| Codex 모델 동기화 상태 | `src/codex/**/agents/*.md` 20개 중 19개는 `model:` frontmatter가 없고, `buildCodexAgentToml()`도 `model` / `model_reasoning_effort`를 출력하지 않아 모델 정보가 전파되지 않는다. | `src/codex/**/agents/*.md`, `scripts/setup.js` |
| Codex 런타임의 잠재 지원 | 수동 관리되는 `.codex/agents/kit-codex-sync-reviewer.toml`은 `model`과 `model_reasoning_effort`를 실제로 사용한다. 즉, Codex 표면이 모델 필드를 전혀 못 쓰는 것은 아니다. | `.codex/agents/kit-codex-sync-reviewer.toml` |
| Advisor tool 적용성 | Anthropic `Advisor tool`은 API-level beta 기능이며, 현재 `claude-kit`가 직접 생성하는 `Claude Code` / `Codex` 자산만으로는 바로 켤 수 없다. 다만 "executor + advisor" 전략은 파이프라인 정책으로 차용 가능하다. | Advisor tool docs, Claude Code docs, current repo structure |

## 가장 중요한 문제 5개

| 우선순위 | 문제 | 영향 |
|---|---|---|
| P1 | Claude 에이전트 모델 정책이 `frontmatter`에 분산 고정되어 있고 중앙 정책 파일이 없다. | 변경 비용 증가, drift 위험 |
| P1 | Codex 변환 경로가 모델 메타데이터를 대부분 잃는다. | Claude↔Codex 모델 parity 붕괴 |
| P1 | `buildCodexAgentToml()`가 `model`과 `effort`를 emit하지 않는다. | Codex direct-use agent의 성능/비용 정책 손실 |
| P2 | `.claude/settings.json` 생성 단계가 `model`, `availableModels`, alias pinning env를 기본 관리하지 않는다. | 팀 단위 모델 정책 부재 |
| P2 | `pairing-registry`는 자산 존재 parity는 관리하지만 모델 의미 parity는 검증하지 않는다. | "paired"여도 실제 행동은 다를 수 있음 |

## 즉시 적용 가능한 개선안 Top 5

| 항목 | 설명 | 범위 |
|---|---|---|
| 1 | `model configuration diagnostic report` 커맨드를 추가해 현재 유효 모델을 층별로 보여준다. | quick win |
| 2 | `settings/profile/agent frontmatter consistency checker`를 추가한다. | quick win |
| 3 | 중앙 `model-policy`의 경로/스키마를 먼저 결정하고 초안을 만든다. | quick win |
| 4 | `pairing-registry` 검사에 "metadata parity" 항목을 추가한다. | medium |
| 5 | `codex-model-runtime` Spike를 정의해 `Phase 3` 착수 여부를 먼저 판정한다. | medium |

## 구조 변경이 큰 개선안 Top 5

| 항목 | 설명 | 예상 난이도 |
|---|---|---|
| 1 | Advisor-ready execution policy 도입 | 높음 |
| 2 | executor/advisor pairing policy + escalation trigger spec | 높음 |
| 3 | Codex/Claude 공통 모델 정책 SSOT 도입 | 높음 |
| 4 | domain별 recommended model policy 자동 emit | 중간~높음 |
| 5 | cost/latency observability dashboard spec 구현 | 높음 |

## 리뷰 반영 후 실행 조정

| 항목 | 조정 내용 |
|---|---|
| Phase 1 분리 | `Phase 1A = diagnostic report`, `Phase 1B = drift detector + consistency checker`로 나눈다. |
| Phase 3 gate | `buildCodexAgentToml()` 확장 전 `codex-model-runtime` Spike를 `P0 gate`로 둔다. |
| Phase 4A 범위 | Anthropic `Advisor tool` direct integration은 현재 repo 범위 밖으로 본다. |
| Phase 4B 범위 | 현재 repo 안에서는 `ADR/spec` 수준의 orchestration policy만 다룬다. |
| 변경 분류 | Codex TOML emission 변경은 `Breaking Change` 후보로 취급한다. |
| 실행 패키징 | 구현 승격 시 `.claude/rules/task-id-naming.md` 기준 `TASK-*` / `SPIKE-*` / `T-*` 규약을 따른다. |

## Claude 전용 / Codex 공통 / 공통 abstraction 불가

| 분류 | 항목 |
|---|---|
| Claude 전용 | Anthropic API `Advisor tool`, `.claude/settings.json`의 `model` / `availableModels` / `ANTHROPIC_DEFAULT_*` pinning |
| Codex 공통 가능 | 중앙 모델 정책 파일, drift detector, consistency checker, domain별 recommended model policy, 모델 진단 리포트 |
| 공통 abstraction 불가 또는 보류 | Advisor tool의 server-side `server_tool_use` / `advisor_tool_result` 프로토콜 자체 |

## 다음 턴에서 바로 구현 가능한 backlog

1. `scripts/model-config-report.js` 추가 (`Phase 1A`, ready)
2. `scripts/model-drift-check.js` 추가 (`Phase 1B`, ready)
3. `model-policy` 경로/스키마 결정 (`src/model-policy.json` vs `src/_meta/model-policy.json`)
4. `/plan-spike codex-model-runtime` 정의 및 실행 (`Phase 3 P0 gate`)
5. `buildCodexAgentToml()`에 `model`, `model_reasoning_effort` 지원 (`Spike PASS 후`)

## 검증 실험 제안

| 실험 | 분류 | 우선순위 | 선행조건 | 목적 |
|---|---|---|---|---|
| Codex direct-use TOML에 `model`을 추가했을 때 런타임이 실제 반영하는지 확인 | blocker | P0 | 없음 | `Phase 3` 착수 여부 결정 |
| Claude-only 환경에서 `settings.model`과 frontmatter `model` 충돌 시 실제 우선순위 수집 | parallel | P1 | 없음 | Claude precedence 검증 |
| `pairing-registry`에 메타데이터 parity를 추가했을 때 유지보수 부담 측정 | parallel | P1 | 없음 | parity audit 비용 확인 |
| domain별 권장 모델을 강제하지 않고 "진단 + 경고"만 했을 때 팀 수용성 측정 | parallel | P2 | `Phase 1A` | warning-only 정책 수용성 확인 |
| `haiku executor + opus advisor`, `sonnet executor + opus advisor` 벤치마크 | out-of-scope | P3 | 별도 runtime wrapper project | Anthropic `Advisor tool` 패턴 검증 |
