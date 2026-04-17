# Option C: 하이브리드 추천안

> Claude-first source를 유지하되, Codex에서 직접 쓸 수 있는 것은 재사용하고, 나머지는 변환 또는 제한적 Codex 전용 구현으로 처리하는 추천안.

---

## 1. 추천안 요약

이 문서 세트의 최종 추천안은 하이브리드다.

- 기본 authoring 모델은 Claude-first `src`
- 기본 Codex 대응 모델은 install-time adapter
- 단, adapter만으로 UX가 망가지는 자산은 Codex 전용 companion asset 허용
- `agent` 자산은 subagent suitability 평가를 먼저 수행
- `src/core/rules/*.md`는 instruction rule로 보고 `AGENTS.md`로 반영
- 공식 exec-policy rules는 필요 시에만 별도 Codex-native asset로 도입

즉 "전부 이중 작성"도 아니고, "전부 설치 변환"도 아니다.

---

## 2. 자산 분류 계약

추천안에서는 모든 자산을 아래 다섯 분류 중 하나로 본다.

| 분류 | 의미 |
|------|------|
| `portable` | Codex에서도 거의 그대로 재사용 가능 |
| `transformable` | 설치 시 Codex 형식으로 변환 가능 |
| `subagent-candidate` | custom subagent로 가는 것이 자연스러운 agent-like 자산 |
| `codex-native` | Codex 전용 자산을 별도로 두는 편이 더 적절 |
| `claude-only` | Codex에서는 명시적으로 skip |

이 분류는 source 단계에서 선언되어야 하고, installer는 그 선언을 소비해야 한다.

---

## 3. 자산 종류별 기본 전략

| 자산 | 기본 전략 | 기본 분류 |
|------|------|------|
| `skill` | 가능한 한 직접 재사용 또는 plugin-bundled skill로 노출 | `portable` |
| `instruction rule` | `AGENTS.md` 지침으로 변환 | `transformable` |
| `exec-policy rule` | 필요 시 `.codex/rules/*.rules` 또는 admin policy companion asset로 도입 | `codex-native` |
| `hook` | `.codex/hooks.json` 기준으로 변환 가능할 때만 지원 | `transformable` 또는 `claude-only` |
| `command` | user entrypoint라면 skill 또는 documented entrypoint 우선 | `transformable` 또는 `codex-native` |
| `agent` | 우선 subagent suitability 평가, 적합하면 custom subagent, 아니면 skill/`AGENTS.md`/skip | `subagent-candidate`, `transformable`, `codex-native`, `claude-only` |
| `template` | plugin, registration, report, instruction, subagent config, optional rules example 산출물 생성 | `transformable` |

결정 규칙은 아래 순서를 따른다.

1. Codex skill로 자연스럽게 쓰일 수 있으면 `portable`
2. `src/core/rules/*.md`처럼 작업 지침이면 `instruction rule`로 보고 `AGENTS.md`로 보낸다
3. narrow + opinionated + read-heavy + explicit deliverable이면 `subagent-candidate`
4. 공식 Codex surface로 안정적으로 바꿀 수 있으면 `transformable`
5. 승인 정책이 필요하면 explicit `exec-policy rule`을 `codex-native`로 다룬다
6. 변환이 UX를 망치면 `codex-native`
7. 공식 Codex surface에 맞출 수 없으면 `claude-only`

---

## 4. rules 분리 원칙

추천안에서 rules는 아래처럼 고정한다.

- `src/core/rules/*.md`는 instruction rule이다.
- instruction rule은 Codex에서 `AGENTS.md` summary 또는 project instruction guidance로 반영한다.
- 공식 Codex `Rules`는 별도 보안 정책 기능으로 취급한다.
- exec-policy가 필요하면 전용 source 또는 companion asset로 도입한다.
- markdown instruction rule을 `.rules`로 1:1 컴파일하지 않는다.

이 원칙은 문서와 구현 모두에서 유지해야 한다.

---

## 5. `agent` 자산의 기본 규칙

추천안에서 `agent`는 아래 세 부류로 나눠 고정한다.

### `subagent-first`

reviewer, architect, analyzer 계열이다.

- 역할 범위가 좁다.
- 명시적 분석/검토 산출물이 있다.
- read-heavy 작업에 강하다.
- parent workflow가 결과를 요약 받아 쓰기 쉽다.

### `skill-first`

user entrypoint와 step-by-step workflow 계열이다.

- 사용자가 직접 부르는 흐름이 중요하다.
- 대화형 안내나 단계별 실행이 핵심이다.
- subagent보다 skill 또는 documented entrypoint가 더 자연스럽다.

### `not-subagent-first`

병렬 write 충돌이 큰 orchestration 계열이다.

- broad orchestration을 수행한다.
- shared writes가 많다.
- multi-step stateful workflow 비중이 높다.
- subagent는 내부 delegation 패턴으로만 쓰고, 기본 노출 surface로는 두지 않는다.

---

## 6. 실제 저장소 자산에 대한 예시 판단

| 예시 자산 | 권장 판단 | 이유 |
|------|------|------|
| `src/dev/skills/dev-workflow` | `portable` | 이미 skill 구조에 가깝다 |
| `src/core/rules/verification.md` | `transformable` | instruction rule이며 `AGENTS.md` guidance로 요약 가능 |
| `src/core/hooks/edit-tracker.js` | `transformable` | Codex hook surface에 맞추면 일부 대응 가능 |
| `src/dev/agents/dev-architect.md` | `subagent-candidate` | architect/analyzer 역할, read-heavy deliverable 적합 |
| `src/dev/agents/dev-code-reviewer.md` | `subagent-candidate` | review 결과 요약형 산출물에 적합 |
| `src/dev/agents/dev-database-reviewer.md` | `subagent-candidate` | narrow reviewer 역할에 가깝다 |
| `src/dev/agents/dev-security-reviewer.md` | `subagent-candidate` | bounded security review 업무에 적합 |
| `src/plan/agents/plan-reviewer.md` | `subagent-candidate` | plan review 결과 요약형에 적합 |
| `src/plan/agents/plan-prd-writer.md` | `codex-native` 또는 `transformable` | bounded-write 정책 없이는 subagent 기본안 아님 |
| `src/dev/agents/dev-doc-updater.md` | `codex-native` 또는 `transformable` | write 범위가 명확하지 않으면 subagent 기본안 아님 |
| `src/plan/agents/plan-wireframe-designer.md` | `codex-native` 또는 `transformable` | 산출물 작성 비중이 높아 조건부 후보 |
| `src/dev/commands/dev-feature.md` | `codex-native` 우선 | user entrypoint이자 orchestration 흐름이라 skill 우선 설계 |
| `src/plan/commands/plan-idea.md` | `codex-native` 우선 | Codex entry flow를 별도 설계하는 편이 자연스러움 |

현재 저장소에는 실제 exec-policy rule asset이 없으므로, `.codex/rules/*.rules` 대응은 후속 companion/native track으로만 설계한다.

---

## 7. subagent 설정 사실

추천안 문서에서는 공식 subagent 설정 사실도 함께 고정한다.

- custom subagent 파일의 핵심 필드는 `name`, `description`, `developer_instructions`다.
- `nickname_candidates`, `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, `skills.config`는 선택 설정이다.
- 선택 설정을 생략하면 parent session에서 상속될 수 있다.
- `[agents]` 전역 설정에는 `max_threads`, `max_depth`, timeout 관련 값이 있다.
- 공식 기본 설명 기준으로 `max_threads` 기본값은 `6`, `max_depth` 기본값은 `1`이다.

이 사실 때문에 subagents는 plugin의 일부가 아니라 별도 config surface로 취급해야 한다.

---

## 8. 비교표

| 평가 축 | Option A 이중 작성 | Option B 설치 변환 | Option C 하이브리드 |
|------|------|------|------|
| Codex 공식 가이드 적합성 | 높음 | 중간 | 높음 |
| 기존 `src` 자산 재사용성 | 낮음 | 높음 | 높음 |
| 자산 중복/드리프트 위험 | 높음 | 중간 | 낮음-중간 |
| 설치기 복잡도 | 중간 | 높음 | 중간 |
| 작성자 부담 | 높음 | 낮음 | 중간 |
| Codex 사용자 경험 | 높음 | 중간 | 높음 |
| 향후 유지보수성 | 중간 이하 | 중간 | 높음 |
| subagent 적합성 | 높음 | 중간 | 높음 |
| 병렬/충돌 위험 | 중간 | 중간-높음 | 중간 |
| 설정 복잡도 | 높음 | 높음 | 중간 |
| 승인 정책 적합성 | 높음 | 낮음-중간 | 높음 |

추천 이유는 단순하다.

- `skill`, instruction rule, 일부 `hook`은 재사용/변환이 가능하다.
- `agent`는 subagent suitability 평가가 핵심이다.
- `command`는 user entrypoint이므로 skill 우선이 자연스럽다.
- exec-policy rules는 installer 자동 추론 대상이 아니라 별도 Codex-native 정책 자산으로 두는 편이 안전하다.
- 따라서 한쪽 극단보다, 자산별로 분류하는 하이브리드가 가장 현실적이다.

---

## 9. 최종 권장안

이 문서 세트는 아래를 최종 권장안으로 고정한다.

- `src` 전체를 Claude/Codex 이중 구현으로 복제하지 않는다.
- `src`는 Claude-first SSOT로 유지한다.
- 설치기는 Codex 공식 surface 기준의 adapter를 갖는다.
- 필요한 경우에만 Codex 전용 companion asset을 허용한다.
- `agent`는 먼저 subagent suitability를 평가한다.
- `src/core/rules/*.md`는 계속 `AGENTS.md` summary 또는 project guidance로 반영한다.
- 공식 Codex `Rules`는 별도 보안 정책 기능으로 취급한다.
- `.codex/rules/*.rules`는 separate companion/native track으로만 도입한다.
- Codex 대응 불가 자산은 `claude-only`로 명시하고 skip reason을 남긴다.
