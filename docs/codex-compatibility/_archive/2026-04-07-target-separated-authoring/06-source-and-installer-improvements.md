# 소스와 설치기 개선 제안

> 추천안인 하이브리드를 실제로 구현하려면 `src` 자산과 설치기에서 무엇을 바꿔야 하는지 제안하는 문서.

---

## 1. source 자산 개선 제안

### 1.1 자산 capability metadata 도입

모든 installable asset에는 Codex 대응 분류를 설명하는 metadata가 필요하다.

권장 역할:

- 이 자산은 `portable`, `transformable`, `subagent-candidate`, `codex-native`, `claude-only` 중 무엇인가
- 이 자산은 `instruction rule`인지, `exec-policy rule`인지, `skill`인지, `agent`인지
- Codex target surface는 무엇인가
- Codex 전용 companion asset이 필요한가
- skip 사유가 있는가
- hook이라면 phase/matcher가 무엇인가
- agent-like 자산이라면 subagent suitability가 어떠한가

목표는 installer가 filename 추측이 아니라 자산 선언을 읽게 만드는 것이다.

### 1.2 `src/core/rules`의 의미 분리

현재 `src/core/rules/*.md`는 파일 경로 이름과 달리 exec-policy가 아니라 작업 지침이다. 문서와 구현은 이를 아래처럼 분리해 다뤄야 한다.

- `src/core/rules/*.md`는 `instruction-rule` capability로 분류
- Codex 기본 반영 surface는 `AGENTS.md`
- `.codex/rules/*.rules`는 이 경로에서 자동 생성하지 않음

즉 경로명 `rules`는 유지하더라도, 의미는 instruction asset으로 고정해야 한다.

### 1.3 별도 exec-policy asset 클래스 제안

향후 Codex용 승인 정책이 필요하면 별도 자산 클래스를 도입하는 것이 좋다.

예시 이름:

- `exec-policy`
- `approval-rule`
- `codex-rule`

이 자산 클래스는 아래를 만족해야 한다.

- prose guidance가 아니라 실행 승인 정책만 다룸
- `.codex/rules/*.rules` 또는 admin `requirements.toml [rules]`를 목표 surface로 가짐
- `prefix_rule`, `decision`, `justification`, optional `match/not_match`를 명시할 수 있음

이 클래스를 도입하기 전까지는 instruction rule과 exec-policy rule을 같은 source에서 뽑지 않는다.

### 1.4 `subagent_candidate` 문서 속성 추가

`agent` 자산에는 최소한 아래 질문에 답하는 문서 속성이 있어야 한다.

- 역할이 narrow and opinionated한가
- explicit trigger가 있는가
- deliverable shape가 분명한가
- read-heavy인가, bounded-write인가
- parent workflow가 summary를 받아 소비할 수 있는가

이 속성은 "subagent로 갈 수 있다"를 선언하는 것이지, 곧바로 subagent로 emit한다는 뜻은 아니다.

### 1.5 Claude 전용 문법 줄이기

특히 `agent`와 `command`는 source 본문에 Claude 전용 문법이 깊게 섞여 있다. 이 자산들은 아래 방향으로 개선하는 것이 좋다.

- `.claude/...` 경로를 본문에 직접 적기보다 추상화된 설명으로 바꾸기
- 재사용 가능한 instruction 블록은 skill/references 쪽으로 분리하기
- Codex에서도 의미가 살아야 하는 핵심 workflow는 skill 또는 subagent candidate 구조로 재구성하기

### 1.6 Codex companion asset 허용

모든 자산을 Codex 전용으로 만들지는 않되, 아래 경우는 Codex companion asset을 허용한다.

- Claude command를 Codex skill로 다시 설계해야 할 때
- Claude agent를 Codex custom subagent나 skill로 바꿔야 할 때
- exec-policy가 필요해 `.rules`를 별도 관리해야 할 때
- source 변환보다 명시적 Codex 구현이 더 안전할 때

이 companion은 예외적 구조여야 하며, metadata에서 연결 관계가 드러나야 한다.

### 1.7 subagent suitability checklist

subagent 후보는 아래 체크리스트를 만족할수록 우선순위가 높다.

- 역할이 좁고 opinionated하다
- 명시적 trigger가 있다
- 산출물이 요약 또는 bounded deliverable 형태다
- read-heavy이거나 write 범위가 강하게 제한된다
- main workflow가 결과를 통합하기 쉽다

---

## 2. 설치기 개선 제안

### 2.1 `scripts/setup.js` 역할 재정의

현재 설치기는 사실상 `copy + template fill`에 가깝다. 추천안에서는 아래 흐름으로 재정의하는 것이 좋다.

```text
discover -> classify -> transform -> emit
```

- `discover`: source asset과 metadata 수집
- `classify`: 자산을 `portable`, `transformable`, `subagent-candidate`, `codex-native`, `claude-only`로 분류
- `transform`: Codex surface로 바꾸거나 companion asset 선택
- `emit`: plugin, registration, `AGENTS.md`, `.codex/hooks.json`, `.codex/agents/*.toml`, optional `.codex/rules/*.rules`, report 생성

### 2.2 `classify` 단계에서 rules와 subagent를 분리 판별

추천안에서는 `classify` 단계가 아래를 판단해야 한다.

- 이 자산이 instruction rule인가, exec-policy rule인가
- 이 agent-like 자산이 custom subagent 후보인가
- skill로 재표현하는 편이 나은가
- `AGENTS.md` guidance로만 남겨야 하는가
- Codex에서는 skip해야 하는가

즉 `agent` 분류는 더 이상 단순 category copy가 아니고, `rule` 분류도 더 이상 단일 category가 아니다.

### 2.3 `emit` 단계에 rules와 subagent surface 분리

Codex emitter는 아래 작업을 다룰 수 있어야 한다.

- `instruction rule`은 `AGENTS.md` summary로 emit
- `exec-policy rule`은 별도 자산이 있을 때만 `.codex/rules/*.rules` emit
- `.codex/agents/*.toml` 생성
- custom subagent용 companion asset 선택
- `.codex/config.toml [agents]` 병합 또는 안내 전략 처리

문서 기준으로는 subagents와 exec-policy rules 모두 plugin의 일부가 아니라 별도 config surface로 다뤄야 한다.

### 2.4 `scripts/codex-hook-compat.js` 개선

현재 hooks는 filename 예외 리스트 기반이다. 추천안에서는 아래 방향으로 바꾸는 것이 좋다.

- hook 자산별 선언 기반 판단
- runtime surface가 `.codex/hooks.json`이라는 사실을 코드에 반영
- platform limitation을 문서와 같은 용어로 처리
- skip reason을 자산 단위로 남기기

### 2.5 exec-policy 검증 흐름 제안

향후 `.rules` 자산이 생긴다면 설치기나 검증 단계는 아래를 고려해야 한다.

- `prefix_rule` 문법 검증
- `allow / prompt / forbidden` 값 검증
- 규칙 충돌 시 most restrictive wins 설명
- shell wrapper와 compound command 처리 이해
- `codex execpolicy check`를 통한 규칙 검증

중요한 점은 이 흐름을 `src/core/rules/*.md`와 섞지 않는 것이다.

### 2.6 compatibility report 강화

`.claude-kit-meta.json`은 계속 유지하되, Codex 쪽에는 아래가 남아야 한다.

- emitted asset
- chosen Codex surface
- skipped asset
- skip reason
- transform 결과
- subagent candidate가 어떤 이유로 subagent/skill/skip으로 갔는지
- instruction rule이 `AGENTS.md`로 갔는지, exec-policy rule이 `.rules`로 갔는지

즉 단순 카운트가 아니라 "무엇을 어떻게 바꿨는가"가 보이는 보고가 필요하다.

---

## 3. template 개선 제안

### 3.1 `src/templates/plugin.json.template`

plugin manifest는 Codex 공식 plugin 구조에 맞춰 다시 검토해야 한다.

- plugin이 가리키는 bundled skill 중심으로 재정의
- 문서화되지 않은 hook runtime 책임을 plugin manifest에 싣지 않기
- subagent config는 plugin manifest가 아니라 별도 surface로 다루기
- exec-policy rules도 plugin manifest가 아니라 별도 surface로 다루기
- Codex 공식 plugin surface와 맞지 않는 필드는 제거 또는 보류 검토

### 3.2 `src/templates/marketplace-entry.json.template`

repo marketplace template은 공식 예시 구조에 맞는 방향으로 다시 설계하는 것이 좋다.

검토 포인트:

- `plugins[]` 배열 구조
- `source` 블록
- `policy` 블록
- `category`

### 3.3 `src/templates/AGENTS.md.template`

`AGENTS.md`는 "plugin 안의 무언가를 설명하는 문서"가 아니라, 프로젝트 instruction surface로 다시 정의해야 한다.

중점은 아래다.

- repository-level working agreements
- instruction rule summary
- Codex에서 기대하는 사용 흐름
- 언제 subagents를 명시적으로 요청할지에 대한 운영 원칙
- skill이 있는 경우 그 존재를 안내하되, 자동 실행 surface처럼 과장하지 않기

### 3.4 optional `.rules` example/template

문서상으로는 별도 `default.rules` 예시/template를 미래 확장 후보로 제안할 수 있다.

핵심 목적:

- exec-policy rule 형식 예시 제공
- `prefix_rule`, `decision`, `justification`, `match/not_match` 예시 제공
- instruction prose와 승인 정책을 섞지 않도록 가이드 제공

이 template은 기본 구현으로 확정하지 않고, explicit exec-policy asset 도입 시에만 사용한다.

### 3.5 subagent template 제안

문서상으로는 `.codex/agents/<name>.toml` template을 별도 제안해야 한다.

핵심 필드:

- `name`
- `description`
- `developer_instructions`

선택 필드:

- `nickname_candidates`
- `model`
- `model_reasoning_effort`
- `sandbox_mode`
- `mcp_servers`
- `skills.config`

또한 `.codex/config.toml [agents]`의 `max_threads`, `max_depth`, timeout 정책도 companion guidance로 설명해야 한다.

---

## 4. 자산 종류별 개선 우선순위

| 우선순위 | 자산 | 이유 |
|------|------|------|
| 1 | `skill` | 가장 빨리 Codex direct-use 모델로 전환 가능 |
| 2 | `instruction rule` | `AGENTS.md` summary 규칙을 고정하기 쉬움 |
| 3 | `hook` | 공식 surface가 분명하지만 제한도 크므로 조기 정리 필요 |
| 4 | `agent` | subagent suitability와 custom config surface를 함께 설계해야 함 |
| 5 | `command` | user entrypoint와 내부 delegation을 분리해 재표현해야 함 |
| 6 | `exec-policy rule` | 별도 자산 클래스로 후속 도입하되, instruction rule과 섞지 않도록 설계 필요 |

---

## 5. 이 문서의 핵심 제안

- `src`는 Claude-first SSOT로 유지한다.
- Codex 대응은 자산별 capability metadata를 통해 명시한다.
- `src/core/rules/*.md`는 `instruction-rule` capability로 분류한다.
- 향후 승인 정책이 필요하면 별도 `exec-policy` asset 클래스를 도입한다.
- installer는 단순 복사기가 아니라 classifier + transformer가 된다.
- `command`와 `agent`는 path copy 대상으로 보지 않는다.
- `agent`는 먼저 subagent suitability를 평가한다.
- instruction rule은 `AGENTS.md`로만 보내고, `.rules`는 별도 explicit asset에서만 emit한다.
- Codex companion asset은 예외적으로 허용하되, 무분별한 이중 authoring은 피한다.
