# Option A: 이중 작성

> Claude 기능을 만들 때 Codex 대응 자산도 같은 시점에 별도로 작성하는 방안.

---

## 1. 핵심 아이디어

이 옵션은 Claude-first `src`를 유지하되, Codex에서 동일 기능이 필요하면 별도의 Codex authoring 자산도 함께 만든다.

예시 방향:

- Claude source: `src/dev/commands/dev-feature.md`
- Codex source: 별도 Codex tree 또는 Codex companion asset
- custom subagent가 필요하면 `.codex/agents/<name>.toml`과 companion instructions를 함께 authoring
- exec-policy가 필요하면 `.codex/rules/default.rules` 같은 `.rules` 자산을 별도 authoring

이 방식의 핵심은 "설치 시 변환"보다 "source 단계에서 Codex 전용 구현을 같이 갖는다"는 점이다.

---

## 2. 장점

- Codex 공식 가이드에 가장 정직하게 맞출 수 있다.
- `command`와 `agent`처럼 Claude 전용 개념이 강한 자산도 Codex UX에 맞게 다시 설계 가능하다.
- 설치기가 복잡한 변환 로직을 덜 가져도 된다.
- Codex 전용 skill, `AGENTS.md` guidance, hook config, custom subagent TOML, exec-policy `.rules`를 source 단계에서 명시적으로 설계할 수 있다.
- subagent role, trigger, output shape를 authoring 시점에 분명히 잠글 수 있다.
- 보안/승인 정책도 prose guidance와 별도로 명시할 수 있다.

---

## 3. 단점

- 새 기능을 만들 때 Claude와 Codex 자산을 둘 다 유지해야 한다.
- 기능이 많아질수록 중복과 드리프트 위험이 커진다.
- 사람이 Codex용 대체 자산을 매번 같이 설계해야 하므로 작성자 부담이 높다.
- `skill`처럼 그대로 재사용 가능한 자산까지 이중 작성으로 끌어들일 가능성이 있다.
- custom agent TOML과 parent workflow 지침을 함께 유지해야 해 운영 부담이 늘어난다.
- instruction rule과 exec-policy rule이 비슷한 의도를 담을 때 두 벌의 정책을 따로 유지할 위험이 있다.

---

## 4. 자산 종류별 적용 모습

| 자산 | 이 옵션에서의 기본 처리 |
|------|------|
| `skill` | Claude skill과 Codex skill을 별도 작성 가능 |
| `instruction rule` | Codex용 `AGENTS.md` 요약 블록 또는 guidance block을 별도 source로 둘 수 있음 |
| `exec-policy rule` | `.codex/rules/*.rules` 또는 admin policy를 별도 source로 둘 수 있음 |
| `hook` | Codex용 `.codex/hooks.json` 대응 자산을 별도 작성 |
| `command` | Codex skill 또는 entrypoint를 별도 작성 |
| `agent` | Codex skill, custom subagent TOML, companion instructions를 별도 작성 |

---

## 5. rules 관점

이 옵션은 두 종류의 rules를 가장 명시적으로 분리하기 쉽다.

- `src/core/rules/*.md` 같은 instruction rule은 계속 prose guidance로 유지한다.
- Codex exec-policy가 필요할 때만 별도 `.rules` 파일을 작성한다.
- 장점은 의미 혼동이 적다는 점이다.
- 단점은 팀이 instruction rule과 exec-policy rule을 둘 다 authoring해야 할 수 있다는 점이다.

즉 이 옵션은 rules 의미 분리에는 강하지만, 작성자 부담이 큰 편이다.

---

## 6. 평가표

| 평가 축 | 평가 | 메모 |
|------|------|------|
| Codex 공식 가이드 적합성 | 높음 | Codex-native 저작이 가능 |
| 기존 `src` 자산 재사용성 | 낮음 | 같은 기능을 두 벌 유지하기 쉬움 |
| 자산 중복/드리프트 위험 | 높음 | Claude/Codex가 쉽게 어긋남 |
| 설치기 복잡도 | 중간 | 변환은 줄지만 asset selection은 필요 |
| 작성자 부담 | 높음 | 새 기능마다 두 타깃을 같이 고려 |
| Codex 사용자 경험 | 높음 | Codex 전용 UX 설계 가능 |
| 향후 유지보수성 | 중간 이하 | 규모가 커질수록 부담 증가 |
| subagent 적합성 | 높음 | subagent role을 source 단계에서 설계 가능 |
| 병렬/충돌 위험 | 중간 | 잘못 설계하면 write-heavy subagent가 늘어남 |
| 설정 복잡도 | 높음 | TOML, sandbox, reasoning 설정 유지 부담 존재 |
| 승인 정책 적합성 | 높음 | `.rules`를 별도 보안 레이어로 설계 가능 |

---

## 7. 언제 적합한가

이 옵션은 아래 상황에만 기본안 후보가 된다.

- Codex UX가 Claude와 많이 달라야 하는 핵심 기능이 많을 때
- 설치 변환보다 명시적 Codex 구현이 훨씬 안전할 때
- 유지보수 인력이 충분해 이중 authoring을 감당할 수 있을 때
- custom subagent를 productized asset처럼 명시적으로 관리해야 할 때
- 보안/승인 정책을 prose guidance와 완전히 별개로 강하게 관리해야 할 때

현재 `claude-kit`처럼 자산 수가 이미 많고, 재사용 가능한 skill 자산도 적지 않은 구조에서는 기본안으로 채택하기엔 비용이 크다.
