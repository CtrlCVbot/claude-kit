# 문서 작성과 롤아웃 계획

> 새 비교·추천 문서 세트를 어떻게 작성하고, 그 결과를 이후 구현 설계로 어떻게 연결할지 정리한 문서.

---

## 1. 문서 작성 순서

이번 문서 세트는 아래 순서로 작성하는 것이 가장 안전하다.

1. 요구사항과 성공 기준 고정
2. `rule` 용어를 instruction vs exec-policy로 분리
3. 현재 상태와 Codex 갭 분석 정리
4. subagent analysis 반영
5. 옵션 A/B/C 비교 문서 작성
6. 추천안 고정
7. source/installer 개선 제안 정리
8. 후속 구현 문서로 넘길 체크리스트 정리

이 순서를 지키는 이유는, rules 의미 분리와 subagent 축을 먼저 고정하지 않으면 `agent` 대응 전략과 `rule` 대응 전략이 다시 모호해지기 쉽기 때문이다.

---

## 2. 작성 시 공통 규칙

- 모든 옵션 문서는 같은 평가표를 사용한다.
- Codex 공식 문서 링크를 기준 근거로 둔다.
- `.claude` 직접 재사용, `agents/commands` direct copy, plugin 내부 `hooks.json` runtime 전제를 사실처럼 쓰지 않는다.
- Claude agent markdown 복사를 Codex subagent 지원과 동일시하지 않는다.
- `src/core/rules/*.md`를 Codex `.rules`와 동일시하지 않는다.
- instruction rule과 exec-policy rule을 항상 분리해서 쓴다.
- subagents는 명시적 trigger가 있을 때만 쓰는 workflow로 설명한다.
- 추천안 문서는 자산 종류별 기본 전략이 결정된 상태여야 한다.

---

## 3. 문서 검토 체크리스트

문서 작성 후 아래를 확인한다.

- `00-overview.md`만 읽어도 문제 정의와 공식 Codex surface를 이해할 수 있는가
- `02-current-state-gap-analysis.md`가 현재 코드의 실제 문제를 빠짐없이 다루는가
- `03`~`05` 옵션 문서가 같은 평가 축으로 비교되는가
- `05`가 추천안을 분명하게 고정하는가
- `06`이 `scripts/setup.js`, `scripts/codex-hook-compat.js`, `src/templates/*`를 개선 후보로 명시하는가
- subagents가 plugin 일부가 아니라 별도 config surface로 설명되는가
- exec-policy rules가 `AGENTS.md` instruction과 별도 보안 layer로 설명되는가
- `prefix_rule`, `allow/prompt/forbidden`, `codex execpolicy check`, `requirements.toml [rules]`가 빠지지 않았는가

---

## 4. 후속 구현 설계로 넘길 결정 사항

이 문서 세트가 완성되면, 후속 구현 단계에서는 아래를 바로 설계 대상으로 삼을 수 있어야 한다.

- capability metadata의 위치와 최소 필드
- instruction rule과 exec-policy rule의 분리 방식
- subagent suitability 판정 규칙
- Codex companion asset의 허용 구조
- `scripts/setup.js`의 classifier/transformer 구조
- `.codex/agents/*.toml`와 `.codex/config.toml [agents]` 처리 전략
- `.codex/rules/*.rules`와 `requirements.toml [rules]`를 어떻게 설계 범위에 포함할지
- Codex plugin/marketplace/template 재정의
- compatibility report 포맷

즉 다음 단계는 "전략 토론"이 아니라 "설계와 구현"이어야 한다.

---

## 5. 권장 롤아웃 순서

문서 완성 후 실제 구현 준비는 아래 순서가 적절하다.

1. target surface 표에 `.codex/rules/*.rules`와 `requirements.toml [rules]` 추가
2. `src/core/rules/*.md`를 instruction rule로 재정의
3. agent-like 자산 suitability 분류
4. option A/B/C 비교표를 두 종류의 rules 기준으로 갱신
5. hybrid 추천안에 rules 분리 원칙과 subagent 규칙 고정
6. source/installer 개선 제안 연결

이 순서를 따르면 skill, instruction rule, exec-policy rule, hook, agent, command를 같은 기준선에서 다시 정렬할 수 있다.

---

## 6. 이번 단계의 종료 조건

이번 단계는 아래가 만족되면 끝난다.

- `docs/codex-compatibility/`에 비교·추천 문서 세트 8개가 존재한다.
- 추천안이 하이브리드로 명시된다.
- subagents가 1급 Codex target surface로 반영된다.
- 공식 Codex `Rules`가 exec-policy surface로 반영된다.
- `src/core/rules/*.md`가 instruction asset이라는 점이 분명해진다.
- 후속 구현자가 다시 옵션을 고르지 않아도 될 정도로 문서가 결정 완료 상태다.
