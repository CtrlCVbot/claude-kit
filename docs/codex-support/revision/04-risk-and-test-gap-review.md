# Codex Support Risk And Test Gap Review

---

## 1. Confirmed risks

### R1. Hook runtime readiness is not proven and currently looks broken

- `hooks.json`은 생성되지만 plugin 내부 `scripts/`가 설치되지 않는다.
- 이 상태라면 Codex가 hook을 읽더라도 명령 실행 단계에서 실패할 가능성이 높다.
- v1에서 hook을 "부분 지원"으로 공개하려면 최소한 end-to-end 실행 성공이 확인되어야 한다.

### R2. Copied authoring assets still behave like Claude assets

- `commands`, `skills`, `agents`가 Codex 경로로만 이동하고, 본문은 `.claude`, `~/.claude`, `CLAUDE.md`를 유지한다.
- 설치 성공과 실제 사용 가능성을 동일시하면 안 된다.
- 특히 `dev-handoff-verify`, `dev-sync`, `dev-learn`, `continuous-learning`, `session-wrap` 계열은 Codex에서 오해를 유발할 가능성이 높다.

### R3. Windows BOM profile parsing can silently route users back to Claude

- BOM 포함 `profile.json`에서 `targets=["codex"]`가 무시되고 기본 Claude 설치로 돌아간다.
- 설치 결과는 "성공"으로 출력되기 때문에 사용자가 원인 파악을 하기 어렵다.

### R4. Rules are effectively absent in Codex context

- 문서상 partial support지만, 실제 Codex surface에서는 rules를 읽게 하는 컨텍스트 장치가 없다.
- governance toolkit의 핵심 가치가 rules인 점을 감안하면, 이건 단순 문서 누락보다 의미가 크다.

---

## 2. Test coverage status

| 시나리오 | 상태 | 메모 |
|---|---|---|
| `claude only` 설치 | 확인됨 | 기본 Claude 설치 정상 |
| `codex only` 설치 | 부분 확인 | 파일 구조와 metadata는 확인, 실제 Codex app 로딩은 미확인 |
| `claude + codex` 동시 설치 | 확인됨 | 두 산출물 공존 확인 |
| `update install` 보존 정책 | 확인됨 | `CLAUDE.md`, `AGENTS.md`, marketplace merge 정상 |
| Codex hook 실제 실행 | 미확인 + 고위험 | 현재 구조상 실패 가능성이 높음 |
| Codex app에서 plugin/command/skill 로딩 | 미확인 | 실제 앱 표면 검증 필요 |
| `plan` domain + Codex | 미확인 | 이번 smoke test는 `core`, `dev` 기준 |
| rule 흡수 전략 | 미확인 | 현재는 실질 구현 부재 |

---

## 3. Release gates before calling this "v1 available"

다음 항목은 최소 릴리스 게이트로 잡는 것이 안전하다.

1. `targets=["codex"]`가 Windows BOM `profile.json`에서도 안정적으로 동작해야 한다.
2. `hooks.json`에 들어간 command 경로가 실제 존재하고 실행 가능해야 한다.
3. Codex로 복사되는 `commands/skills/agents` 중 Claude 고정 참조가 많은 자산은 `partial`로 낮추거나 치환 로직이 들어가야 한다.
4. rules를 `AGENTS.md`에 최소 요약으로라도 노출하거나, 문서상 `rules = excluded`로 내리는 결정이 필요하다.
5. metadata가 Codex hook 수를 정확하게 기록해야 한다.

---

## 4. Additional verification recommended

- 실제 Codex 앱에서 plugin 등록 후 command/skill/agent가 노출되는지 확인
- Codex app에서 `PreToolUse`, `PostToolUse` hook 이벤트가 현재 `hooks.json` 구조로 수용되는지 확인
- `targets=["codex"]`, `domains=["core","dev","plan"]` 설치 시 `plan-doc-guard.js` 포함 여부 검증
- 기존 repo에 여러 plugin이 있을 때 `marketplace.json` merge가 ordering까지 문제 없는지 확인
- `AGENTS.md`가 실제 Codex 컨텍스트 문서로 충분한지 사용자 흐름 기준 확인

---

## 5. Review stance

현재 상태는 "문서 기반 설치 골격 검증은 통과, 런타임 준비도는 미완료"로 보는 것이 가장 정확하다.

- Claude regression은 현재 확인되지 않았다.
- Codex scaffold는 존재한다.
- 하지만 Codex runtime parity나 real usability를 선언하기에는 검증 공백과 구현 격차가 남아 있다.


