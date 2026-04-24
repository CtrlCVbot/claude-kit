# Pipeline Improvement Proposals

## 기준 프레임

이번 제안은 `source asset -> emitter -> generated runtime` 흐름을 기준으로 정리한다.

## 1. Source Asset 개선

| 제안 | 이유 | 구현 위치 | 우선순위 |
|---|---|---|---|
| 중앙 `model-policy` SSOT 추가 | frontmatter 분산 고정 해소 | `src/model-policy.json` 또는 `src/_meta/model-policy.json` | P1 |
| domain별 recommended model 정의 | `dev`, `plan`, `copy`의 성격 차이를 모델 정책으로 드러냄 | 위 정책 파일 | P1 |
| Claude/Codex 공통 agent metadata schema 정의 | Codex 변환본의 메타데이터 손실 방지 | `src/claude/core/_schemas` 인근 | P1 |
| Advisor readiness metadata 추가 | 어느 agent가 advisor-style escalation 후보인지 표시 | agent frontmatter 또는 정책 파일 | P2 |

### 권장 SSOT 예시

```json
{
  "defaults": {
    "claude": { "model": "sonnet", "effort": "medium" },
    "codex": { "model": "gpt-5.4", "reasoning_effort": "medium" }
  },
  "domains": {
    "dev": { "recommendedModel": "opus", "advisorCandidate": true },
    "plan": { "recommendedModel": "opus", "advisorCandidate": true },
    "copy": { "recommendedModel": "opus", "advisorCandidate": false }
  },
  "agents": {
    "dev-implementer": {
      "executorPreferred": "sonnet",
      "advisorPreferred": "opus",
      "escalationPolicy": "test-failures-or-architecture-conflict"
    }
  }
}
```

## 2. Emitter 개선

| 제안 | 이유 | 구현 위치 | 우선순위 |
|---|---|---|---|
| `buildSettingsTemplate()`가 optional `model` / `availableModels` emit 지원 | 팀 단위 기본 모델 정책 노출 | `scripts/setup.js` | P1 |
| `ANTHROPIC_DEFAULT_*` pinning env emit 지원 | 운영 안정성 확보 | `scripts/setup.js` | P2 |
| `buildCodexAgentToml()`가 `model` / `model_reasoning_effort` 지원 | Codex direct-use parity 회복. 단 `codex-model-runtime` Spike `PASS` 후 착수 | `scripts/setup.js` | P1 (gate) |
| Codex conversion에서 model frontmatter 보존/주입 | `src/codex/**/agents/*.md`의 정보 손실 방지 | conversion pipeline | P1 |
| metadata parity audit 추가 | paired인데도 모델이 어긋나는 문제 감지 | `scripts/kit-audit` 또는 새 스크립트 | P1 |

## 3. Generated Runtime 개선

| 제안 | 이유 | 구현 위치 | 우선순위 |
|---|---|---|---|
| `.claude/settings.json`에 model policy 주석 또는 managed marker 메타 추가 | 현재 유효 모델의 출처를 설명 | generated settings | P2 |
| `.codex/agents/*.toml`에 모델 필드 반영 | Codex agent 실행 정책 보존 | generated TOML | P1 |
| 진단 보고서 산출물 생성 | 실제 배포 상태를 한눈에 확인 | `reports/` 또는 CLI stdout | P1 |

## 4. Observability 개선

| 제안 | 이유 | 구현 위치 | 우선순위 |
|---|---|---|---|
| model-config diagnostic report | 현재 effective model을 레이어별로 보여줌 | 새 command/script | P1 |
| model drift detector | source vs emitted vs runtime 차이 감지 | 새 command/script | P1 |
| advisor cost/latency spec | 실험 설계와 향후 운영 관측 기반 마련 | docs/spec | P2 |

## 5. Governance 개선

| 제안 | 이유 | 구현 위치 | 우선순위 |
|---|---|---|---|
| `pairing-registry`에 metadata parity 필드 추가 | 존재 parity와 의미 parity 구분 | `src/pairing-registry.json` schema | P1 |
| `exception-registry`에 model-gap 예외 유형 추가 | 의도적 차이와 미처리 차이 구분 | `src/exception-registry.json` schema | P2 |
| `docs/30-reference/02-agents.md`와 Codex 표면을 분리 서술 | 현재 docs는 Claude 모델만 보여줌 | docs generation | P2 |

## 6. Quick Win / Mid-term / Long-term

| 구분 | 항목 |
|---|---|
| quick win | `Phase 1A` diagnostic report, blocker/parallel experiment map, `Phase 1B` consistency checker 초안 |
| mid-term | drift detector, metadata parity audit, 중앙 `model-policy` SSOT, availableModels/pinning emit |
| long-term | `Phase 3` gated Codex emission, advisor-ready ADR, executor/advisor pairing, cost/latency dashboard |

## 7. 추천 구현 순서

1. `Phase 1A`: `model configuration diagnostic report` 추가
2. blocker/parallel 실험 관계를 문서화하고 `codex-model-runtime` Spike를 정의
3. `Phase 1B`: drift detector와 consistency checker 추가
4. 중앙 `model-policy` 경로/스키마 결정
5. `buildCodexAgentToml()` 확장과 Codex source metadata 정규화 (`Spike PASS` 후)
6. advisor-style orchestration policy를 ADR/spec로 문서화

## 8. Gate와 변경 분류

| 항목 | 내용 |
|---|---|
| Phase 3 gate | `codex-model-runtime` Spike가 `PASS`여야 emitter parity 수정에 착수한다. |
| Breaking Change 후보 | `buildCodexAgentToml()` 출력 스키마 변경은 `BC-*` 분류 후보로 본다. |
| 실행 패키징 | planning 문서는 `TASK-*`, spike는 `SPIKE-*`, 실제 dev 구현 task는 `T-*` 규약을 따른다. |
