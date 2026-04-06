# Codex Support Review Summary And Backlog

---

## Overall verdict

현재 Codex 지원은 `부분 일치 (partial)` 판정이다.

좋은 점:

- `profile.json.targets` 도입 자체는 구현되었다.
- repo-local plugin 구조, `AGENTS.md`, manifest, marketplace, skip metadata는 생성된다.
- Claude-only / dual-target 설치와 update 보존 정책은 현재 확인 범위에서 안정적이다.

남은 핵심 차이:

- hook runtime은 아직 실사용 가능한 상태로 보기 어렵다.
- `skills/commands/agents`는 "복사"되지만 "Codex 맞춤형으로 정규화"되지는 않았다.
- rules partial support는 구현보다 문서가 더 앞서 있다.
- Codex-only metadata 정확성이 부족하다.

---

## Immediate fixes

### 1. 즉시 수정 필요

- Codex plugin에 hook runtime `scripts/`를 실제로 설치하거나, `hooks.json` 생성 자체를 보수적으로 줄인다.
- `profile.json` 파싱을 BOM-safe 하게 바꿔 Windows 환경에서 `targets`가 무시되지 않게 한다.
- Codex-only metadata에서 `components.hooks`와 관련 집계를 정확히 기록한다.

### 2. 문서 보정 필요

- `skills/commands/agents` 지원 수준을 현재 구현에 맞게 `partial` 또는 "path copy only"로 낮춘다.
- quickstart/tree 예시에서 실제 emitter가 만들지 않는 `assets/`는 정리한다.
- rules 설명은 실제 구현 수준에 맞게 수정하거나, `AGENTS.md`에 최소한의 rule summary를 추가한다.

---

## Recommended backlog

### v1.x follow-up

- `.claude/...`, `~/.claude/...`, `CLAUDE.md` 참조를 Codex용으로 치환하는 normalization 추가
- rules 핵심 내용의 `AGENTS.md` 흡수 또는 Codex용 rule surface 설계
- Codex plugin smoke test를 앱 수준까지 자동화

### v2 candidates

- `hooks parity`
- `global codex install`
- `mcp migration`
- command/skill/agent 본문을 타깃별로 변환하는 richer emitter

---

## Suggested decision

현재 구현은 "Codex 설치 지원을 시작한 상태"로 보기는 충분하지만, 문서 표현은 한 단계 낮추는 편이 안전하다.

- 설치 scaffold: 공개 가능
- Codex usable v1: 보정 후 공개 권장
- hooks / rules / content parity: 후속 이행 필요

즉, 다음 단계는 "새 설계 문서 추가"가 아니라 "문서 표현을 현실에 맞추고, 가장 위험한 runtime gaps를 먼저 닫는 것"이다.
