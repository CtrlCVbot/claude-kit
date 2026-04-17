# Codex Sync Documentation Set

> 기준 문서: [sync-report-2026-04-15.md](./sync-report-2026-04-15.md)

## 0. 문서 상태

| 항목 | 상태 |
|---|---|
| 문서 역할 | Codex 전환 설계/분석 문서 |
| 현재 반영 범위 | `docs/codex-sync` 문서 세트에만 반영 |
| 아직 미반영 | `.claude`, `scripts`, `src`의 실제 변환 로직과 registry |
| 다음 단계 | 문서 리뷰/승인 후 구현 반영 여부 결정 |

## 1. 배경

`claude-kit`는 Claude authoring source를 기준으로 Codex sibling을 생성하는 흐름을 이미 갖고 있지만, 현재 `/kit-sync`와 `/kit-convert`는 `hook`, `rule` 계열을 충분히 포팅하지 못한다.

특히 2026-04-15 기준 sync report에서는 다음 문제가 드러난다.

- `rule` 6개가 구조적으로 skip된다.
- 일부 `hook`은 Claude runtime 의존성 때문에 skip된다.
- 예외 레지스트리와 skip 기준 사이에 stale 상태가 존재한다.

이 문서 세트는 위 문제를 "왜 skip되는가" 수준이 아니라, "어떻게 skip 없이 최대한 남길 것인가" 관점에서 정리한다. 다만 Codex 공식 기능의 존재 여부와 repo 차원의 fallback 설계를 섞어서 설명하지 않도록, 공식 문서 기준을 별도로 고정한다.

## 2. 목표

- `skip`을 기본 경로가 아니라 마지막 예외 상태로 낮춘다.
- Codex 공식 surface가 의미상 1:1 대응되지 않더라도 `AGENTS.md`, Skills, commands, wrappers 같은 repo 차원의 migration fallback을 사용한다.
- 완전 자동 변환이 어려운 항목도 `review-needed` 초안이나 placeholder를 남긴다.
- `/kit-sync`의 상태 모델과 산출물 규칙을 문서 기준으로 재정의한다.

## 3. 비목표

- 이번 문서 세트는 실제 코드 패치를 포함하지 않는다.
- Codex runtime의 undocumented behavior를 확정 사실처럼 정의하지 않는다.
- Claude와 Codex의 runtime parity를 100% 보장한다고 주장하지 않는다.
- repo 차원의 fallback을 Codex 공식 migration recipe처럼 표현하지 않는다.

## 4. 공식 재검토 기준

이 문서 세트는 아래 공식 문서만 근거로 사용한다.

| 문서 | 사용 목적 |
|---|---|
| [Hooks](https://developers.openai.com/codex/hooks) | hook event, matcher, tool 범위, 플랫폼 제약 확인 |
| [Rules](https://developers.openai.com/codex/rules) | Codex `Rules`의 실제 의미가 exec/approval policy인지 확인 |
| [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md) | guidance-style rule을 담을 공식 instruction surface 확인 |
| [Skills](https://developers.openai.com/codex/skills) | 재사용 가능한 fallback surface 확인 |
| [Subagents](https://developers.openai.com/codex/subagents) | agent 관련 공식 개념 확인 시 보조 근거 |
| [CLI features](https://developers.openai.com/codex/cli/features) | commands, slash commands 등 주변 surface 확인 시 보조 근거 |

## 5. 공식 제약 요약

| 항목 | 공식 기준 요약 |
|---|---|
| Hooks | 공식 기능이지만 `experimental`이다. |
| Hooks on Windows | 2026-04-15 기준 Windows 지원이 임시 비활성화되어 있다. |
| `PreToolUse` / `PostToolUse` | 현재 공식 문서상 `Bash` 범위가 핵심 제약이다. |
| Rules | Codex `Rules`는 존재하지만, 일반 guidance rule이 아니라 sandbox 밖 명령 실행 정책 제어에 가깝다. |
| `AGENTS.md` | 공식 instruction surface이며, root부터 현재 디렉터리까지 계층적으로 읽힌다. |
| Skills | 공식 surface이며, 재사용 가능한 지침과 워크플로우를 담는 용도로 적합하다. |

## 6. 현재 기준선

| 항목 | 기준선 |
|---|---|
| 기준 보고서 | `docs/codex-sync/sync-report-2026-04-15.md` |
| 핵심 이슈 | `hook`, `rule` 계열의 과도한 skip |
| 주요 원인 | 공식 surface와 Claude 의미 모델의 차이, runtime 의존성, 보수적인 skip 정책, stale registry |
| 즉시 보정 필요 | `output-secret-filter`의 resolved 상태와 stale skip 기준 불일치 |

## 7. 핵심 용어

| 용어 | 의미 |
|---|---|
| `direct` | 공식 문서상 허용된 Codex surface와 제약 범위 안에서 직접 매핑 가능한 변환 |
| `fallback` | 직접 매핑은 어렵지만 repo 차원의 migration artifact로 의도를 유지하는 변환 |
| `review-needed` | 사람이 후속 검토해야 하지만 초안 또는 placeholder는 자동 생성된 상태 |
| `blocked` | artifact 생성조차 안전하게 할 수 없어 예외로 남겨야 하는 상태 |
| `artifact-first` | runtime parity가 부족해도, 의도와 후속 작업 힌트를 담은 산출물을 우선 남기는 원칙 |

## 8. 문서 맵

| 문서 | 역할 |
|---|---|
| [01-skipless-conversion-strategy.md](./01-skipless-conversion-strategy.md) | 설계 원칙, 상태 모델, 공식 근거 기준 분류 |
| [02-hook-rule-porting-matrix.md](./02-hook-rule-porting-matrix.md) | `hook`, `rule` 치환 규칙과 실제 사례 |
| [03-sync-pipeline-design.md](./03-sync-pipeline-design.md) | `/kit-sync`, `/kit-analyze`, `/kit-convert` 확장 설계 |
| [04-rollout-validation-plan.md](./04-rollout-validation-plan.md) | 단계별 rollout, 검증, rollback 계획 |

## 9. 권장 읽기 순서

1. 현재 문제와 공식 기준을 먼저 이해하려면 [01-skipless-conversion-strategy.md](./01-skipless-conversion-strategy.md)
2. `hook`, `rule`을 어떤 Codex surface 또는 fallback으로 옮길지 보려면 [02-hook-rule-porting-matrix.md](./02-hook-rule-porting-matrix.md)
3. 툴과 레지스트리를 어떻게 바꿀지 보려면 [03-sync-pipeline-design.md](./03-sync-pipeline-design.md)
4. 실제 실행 순서와 검증 계획을 보려면 [04-rollout-validation-plan.md](./04-rollout-validation-plan.md)

## 10. 문서 개선 포인트

- 공식 capability와 repo fallback을 한 문단 안에서 섞어 쓰지 않는다.
- "존재하는 기능"과 "지금 이 repo에서 곧바로 쓸 수 있는 기능"을 구분한다.
- 현재 구현과 제안 구현의 차이를 별도 표나 섹션으로 드러낸다.
- 문서 승인 전에는 `.claude`, `scripts`, `src` 변경을 전제로 쓰지 않는다.
- `sync-report-2026-04-15.md`는 스냅샷이고, 해석 보정은 이 문서 세트가 담당한다.

## 11. 이 문서 세트의 판단 기준

- 삭제보다 대체 표현을 우선한다.
- `skip`보다 `fallback`을 우선한다.
- 공식 capability와 repo fallback을 같은 수준의 근거처럼 쓰지 않는다.
- runtime parity와 artifact parity를 분리해서 기록한다.
- stale registry 상태는 단순 문서 오차가 아니라 sync 품질 문제로 본다.
