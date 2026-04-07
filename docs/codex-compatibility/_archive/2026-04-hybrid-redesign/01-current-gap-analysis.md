# Current Gap Analysis

> 현재 `claude-kit` 설치 구조에서 Codex 지원이 어디까지 자동화되어 있고, 어디서 드리프트가 발생하는지 정리한 문서.

---

## 1. 현재 설치 흐름

지금의 설치기는 대략 아래 흐름으로 동작한다.

```text
profile.json 읽기
  -> domains/targets 계산
  -> Claude emitter 실행
  -> Codex emitter 실행
  -> metadata 기록
```

Codex emitter는 이미 별도 경로를 가진다.

- `plugins/claude-kit/agents`
- `plugins/claude-kit/commands`
- `plugins/claude-kit/skills`
- `plugins/claude-kit/hooks`
- `plugins/claude-kit/hooks.json`
- `plugins/claude-kit/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`
- `AGENTS.md`

즉, 멀티타깃 지원 자체는 존재한다. 문제는 자산이 추가될 때 그 처리 방식이 선언적으로 따라오지 않는다는 점이다.

---

## 2. 드리프트 포인트

### 2.1 setup.js 하드코딩

현재 `scripts/setup.js`는 다음 계약을 직접 알고 있다.

- 어떤 category를 Claude에 복사할지
- 어떤 category를 Codex에 복사할지
- hook를 어느 matcher에 매핑할지
- 어떤 파일을 metadata에 generated output으로 남길지

이 방식은 v1에서는 빠르지만, 새 hook 또는 새 자산 유형이 들어올 때마다 설치기 코드를 직접 수정해야 한다.

### 2.2 hook 호환성 리스트 분리

`scripts/codex-hook-compat.js`는 Codex에서 제외할 hook를 filename 기준으로 관리한다.

문제는 아래와 같다.

- 판단 근거가 자산 옆에 붙어 있지 않다.
- 새 hook를 추가해도 metadata가 아닌 중앙 리스트를 수정해야 한다.
- hook가 왜 제외됐는지 asset author가 아니라 installer가 알고 있다.

### 2.3 rules의 간접 지원

rules는 Claude에서는 `.claude/rules/`로 복사되지만, Codex에서는 별도 디렉터리 대신 `AGENTS.md`의 요약 문구로 흡수된다.

이 방식의 위험:

- 어떤 rule이 Codex에 반영됐는지 추적이 약하다.
- 새 rule 추가 시 `AGENTS.md.template`을 같이 수정하지 않으면 parity가 깨질 수 있다.
- rule과 template 사이의 연결이 선언적으로 표현되지 않는다.

### 2.4 parity 검증 부재

현재는 repo 차원에서 아래를 강제하지 않는다.

- 모든 installable asset에 Codex 처리 정책이 존재하는지
- hook metadata와 `hooks.json` 생성 규칙이 일치하는지
- rule metadata와 `AGENTS.md` 반영 계약이 일치하는지

이 때문에 설치기는 동작해도, 새 자산이 들어온 뒤 Codex 쪽이 조용히 누락될 수 있다.

---

## 3. 자산 유형별 현상

| 유형 | 현재 상태 | 갭 |
|------|-----------|----|
| agent | path copy로 비교적 안정적 | Codex 지원 선언이 파일 옆에 없음 |
| command | path copy로 비교적 안정적 | 새 유형 분화 시 중앙 로직 수정 필요 |
| skill | path copy로 비교적 안정적 | skill 내부 참조의 타깃 선언이 없음 |
| hook | partial support | 호환성 기준이 중앙 파일에만 있음 |
| rule | partial support | `AGENTS.md` 요약과 자산이 분리됨 |
| template | target-specific | template 계약이 metadata catalog에 포함되지 않음 |

---

## 4. 대표 사례

### Case A. 새 hook 추가

현재 필요한 일:

1. `src/{domain}/hooks/new-hook.js` 추가
2. 필요하면 `buildHooksConfig()` 수정
3. Codex에서 지원/제외 여부를 `codex-hook-compat.js`에 반영
4. 필요하면 `buildCodexHooksJson()` 매핑 수정
5. README/architecture 문서 갱신

문제는 “새 hook 하나”를 위해 지식이 세 군데 이상 흩어진다는 점이다.

### Case B. 새 rule 추가

현재 필요한 일:

1. `src/core/rules/new-rule.md` 추가
2. Claude는 자동 복사됨
3. Codex는 `AGENTS.md.template` 또는 관련 요약문을 수동 반영해야 함

즉, rule은 자산이 추가돼도 Codex 반영이 자동이 아니다.

### Case C. 새 skill 추가

skill은 path copy로 설치되지만, “Codex에서 지원되는 skill인지”와 “내부 경로 참조를 어떻게 다룰지”는 선언되지 않는다. v1에서는 괜찮지만, 미래의 변환 규칙을 붙이기 어렵다.

---

## 5. 정리

현재 구조는 "Codex 설치가 가능하다"는 목표에는 충분하다. 하지만 "새 자산이 들어와도 Codex 처리 방식을 강제한다"는 목표에는 아직 부족하다.

필요한 변화는 세 가지다.

1. asset author가 바로 옆에서 Codex 처리 정책을 선언하게 만들기
2. installer가 그 선언을 읽어 catalog와 emitter로 분리되기
3. repo 검증에서 누락과 불일치를 실패 처리하기

이후 문서는 이 세 축을 각각 해결하는 옵션과 최종 권장안을 다룬다.
