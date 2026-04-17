# 요구사항과 성공 기준

> 사용자가 실제로 원하는 결과와, 옵션 비교 시 고정해야 할 평가 기준을 정리한 문서.

---

## 1. 요구사항 정리

이번 주제의 본질은 "Claude 기능을 Codex에서도 쓸 수 있게 하고 싶다"는 것이다. 이를 구현 관점으로 다시 정리하면 아래와 같다.

| 번호 | 요구사항 | 의미 |
|------|------|------|
| 1 | `src`는 Claude Code 기반 자산으로 계속 작성 | Claude-first authoring은 유지 |
| 2 | Claude용 기능을 Codex에서도 사용 | 별도 패키지로 분리하지 않고 연동 |
| 3 | `.claude/*`는 Codex가 직접 못 씀 | 설치 결과물을 그대로 재사용할 수 없음 |
| 4 | 구현 시 동시 작성 또는 설치 시 변환 필요 | authoring 전략과 installer 전략이 모두 필요 |
| 5 | Codex 공식 가이드 기준으로만 판단 | 내부 편의보다 공식 surface 우선 |
| 6 | `agent` 자산은 skill, subagent, `AGENTS.md`, skip 중 하나로 설명 가능해야 함 | Codex용 agent 대응을 암묵 처리하지 않음 |
| 7 | `src/core/rules/*.md`는 instruction asset으로 다뤄야 함 | Codex 공식 `.rules`와 혼동하지 않음 |

---

## 2. 성공 기준

문서 세트는 아래 질문에 결정 완료 상태로 답해야 한다.

- 새 Claude 자산이 생겼을 때 Codex 대응 방식을 언제 결정하는가
- 어떤 자산은 그대로 재사용하고, 어떤 자산은 변환하며, 어떤 자산은 Codex 전용 구현이 필요한가
- 설치기는 무엇을 기준으로 Codex 결과물을 만들어야 하는가
- 작성자와 구현자가 같은 용어로 자산 상태를 설명할 수 있는가

성공 기준은 아래로 고정한다.

1. 새 자산이 추가되면 Codex 대응이 `portable`, `transformable`, `subagent-candidate`, `codex-native`, `claude-only` 중 하나로 설명된다.
2. 문서만 읽어도 `.claude` 결과물을 Codex가 직접 못 쓰는 이유와, Codex 공식 surface가 무엇인지 이해할 수 있다.
3. agent-like 자산이 `skill`, `subagent`, `AGENTS guidance`, `skip` 중 하나로 명시된다.
4. 어떤 문서도 `src/core/rules/*.md = Codex .rules`라고 쓰지 않는다.
5. instruction rules와 exec-policy rules의 책임이 분리된다.
6. `agent`, `hook`, `rule` 논의에서 `AGENTS.md`와 `.codex/rules/*.rules`를 혼동하지 않는다.
7. 추천안 문서가 자산 종류별 기본 전략을 결정된 상태로 제시한다.
8. 후속 구현자는 문서를 읽고 다시 전략을 고르지 않아도 된다.

---

## 3. 비범위

이번 문서 세트는 아래를 직접 구현하지 않는다.

- `scripts/setup.js` 리팩터링
- `src` 자산 포맷 변경
- Codex용 plugin/marketplace template 수정
- `.codex/agents/*.toml` 실제 생성 로직 추가
- `.codex/rules/*.rules` 실제 생성 로직 추가
- 실제 Codex 동작 검증 스크립트 추가

이번 단계는 구현이 아니라, 어떤 방향으로 구현해야 하는지 결정하는 문서를 만드는 단계다.

---

## 4. 평가 축

모든 옵션 문서는 아래 평가 축을 같은 표로 사용한다.

| 평가 축 | 질문 |
|------|------|
| Codex 공식 가이드 적합성 | 공식 Codex surface와 얼마나 잘 맞는가 |
| 기존 `src` 자산 재사용성 | 현재 Claude-first 자산을 얼마나 그대로 살릴 수 있는가 |
| 자산 중복/드리프트 위험 | Claude/Codex 자산이 서로 어긋날 위험이 큰가 |
| 설치기 복잡도 | 설치기에서 해석/변환 부담이 얼마나 큰가 |
| 작성자 부담 | 새 기능 추가 시 사람이 추가로 써야 할 것이 많은가 |
| Codex 사용자 경험 | Codex에서 실제로 자연스럽고 이해 가능한 사용 경험을 주는가 |
| 향후 유지보수성 | 기능이 늘어나도 규칙을 유지하기 쉬운가 |
| subagent 적합성 | agent-like 자산을 subagent로 옮겼을 때 역할 경계가 자연스러운가 |
| 병렬/충돌 위험 | subagent 병렬화가 write 충돌이나 orchestration 혼선을 만드는가 |
| 설정 복잡도 | `.codex/agents/*.toml`, `[agents]`, 모델/샌드박스 설정 부담이 큰가 |
| 승인 정책 적합성 | exec-policy rules를 별도 보안 레이어로 분리해 설명할 수 있는가 |

---

## 5. 판단 규칙

옵션 비교는 아래 규칙으로 읽는다.

- 공식 Codex 가이드와 어긋나는 편의성은 낮게 평가한다.
- `src` 재사용성만 높고 Codex UX가 나쁘면 추천하지 않는다.
- 모든 자산을 이중 구현하는 방식은 특별한 이유가 없으면 기본안으로 선택하지 않는다.
- `agent`와 `command`는 `skill`보다 Codex 대응이 어렵다는 전제를 둔다.
- hooks는 Codex 공식 surface와 플랫폼 제한을 함께 고려한다.
- subagents는 명시적 trigger, narrow role, bounded output, read-heavy suitability를 함께 만족할 때만 적극 추천한다.
- write-heavy 병렬 subagents는 기본안으로 두지 않는다.
- instruction rule은 `AGENTS.md`나 project guidance 층에서 다루고, exec-policy rule은 별도 승인 정책 층으로 다룬다.
- prose 기반 instruction rule을 `.rules`로 자동 변환하겠다는 옵션은 보수적으로 본다.

---

## 6. 권장 결론의 형태

이 문서 세트의 최종 산출물은 "하나의 추천안"이어야 한다. 즉 아래 세 가지를 모두 포함해야 한다.

- 어떤 옵션을 기본안으로 채택할지
- 자산 종류별 기본 전략은 무엇인지
- 그 추천안을 구현하려면 `src`와 설치기를 어떻게 개선해야 하는지
