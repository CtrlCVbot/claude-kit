## core 도메인

- **에이전트 텔레메트리 (v2.3.1, IMP-AGENT-009)**: `~/.claude/logs/agent-telemetry.jsonl` 에 호출·완료·실패 이벤트 기록. 로컬 전용, 외부 전송 없음. 스키마: `agent-telemetry.schema.json` v1.
- **텔레메트리 조회 커맨드**: `/agent-report [--period 7d|30d|all] [--team dev|plan|copy] [--format json]` — 에이전트별 성공률·소요시간·실패 패턴 집계.
- **피드백 아카이빙 (v2.3.1, Phase 3 완료)**: `kit-feedback-archiving` 인프라 — index / stats / rollup. 자동화된 장기 보관 경로.
- **주요 룰 (SSOT)**
  - `golden-principles.md` — 13 핵심 원칙 (TDD, 불변성, 보안, HARD-GATE, 증거 기반, Document Non-Duplication 등)
  - `verification.md` — 완료 전 검증 (Iron Law, Agent Edit Race 포함)
  - `agent-telemetry.md` (v2.3.1) — 텔레메트리 스키마 + 수집 파이프라인
  - `edit-coordinates-governance.md` v1.1 (IMP-KIT-011) — architecture-binding 동기화 계약
  - `task-id-naming.md` (IMP-KIT-015) — 4 패턴 (`T-{AREA}-{NN}` / `TASK-{SLUG}-{NN}` / `LEGACY-{AREA}-{NN}` / `SPIKE-{AREA}-{NN}`)
  - `checkpoint-policy.md` (IMP-KIT-016) — Human Checkpoint 정책, `autoProceedOnPass` 플래그
  - `spike-workflow-agents.md` (IMP-AGENT-004) — Spike 모드 에이전트 협력 계약
- **개인정보 보호**: 텔레메트리는 에이전트 프롬프트·출력 원문 저장 금지. 이름·타임스탬프·크기 지표·에러 클래스만 저장.
