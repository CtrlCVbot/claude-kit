# IMP-AGENT-009 — 에이전트 호출 텔레메트리 본체

> **결론**: v2.3.0 로드맵 IMP-KIT-024(stub)를 **본체 구현 단계로 승격**한다. 19개 에이전트의 호출 빈도·실패율·성공 메트릭을 수집하는 파이프라인을 도입해 IMP-AGENT-001~008 효과 측정 기반을 마련한다.

**축**: Pipeline Completeness
**우선순위**: **P0** (IMP-KIT-024 stub 승격)
**공수**: L
**Breaking Change**: no (신규 로그 파이프라인, 기존 동작 비침습)
**타깃 릴리스**: v2.3.1
**기반**: IMP-KIT-024 (v2.3.0 stub), kit-feedback-archiving Phase 3 (shipped)
**관련 에이전트**: 전체 19개

---

## 1. 문제 (근거)

- IMP-KIT-024는 v2.3.0 로드맵에서 **"stub"** 상태로 등록. 필드 정의만 있고 실제 수집 파이프라인 부재
- kit-feedback-archiving Phase 3(2026-04-22 완료)에서 **SubagentStop aggregator + copy-collector + plan-collector + dev-collector** 인프라 확보
- 본 패키지의 IMP-AGENT-001~008 도입 효과를 측정하려면 **호출 빈도·성공률·실패 패턴** 추적 필수

## 2. 해결책

### 2.1 이벤트 스키마

`src/claude/core/_schemas/agent-telemetry.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["event_type", "agent_name", "timestamp", "session_id"],
  "properties": {
    "event_type": { "enum": ["invoked", "completed", "failed", "timeout"] },
    "agent_name": "string",
    "timestamp": "string (ISO 8601)",
    "session_id": "string",
    "duration_ms": "integer",
    "input_bytes": "integer",
    "output_bytes": "integer",
    "error_class": "string",
    "caller": {
      "type": "object",
      "properties": {
        "type": { "enum": ["command", "skill", "agent", "user"] },
        "name": "string"
      }
    },
    "metadata": "object"
  }
}
```

### 2.2 수집 파이프라인

```
에이전트 호출 → SubagentStart hook → invoked 이벤트
            ↓
       [에이전트 실행]
            ↓
     SubagentStop hook → completed / failed / timeout 이벤트
            ↓
     ~/.claude/logs/agent-telemetry.jsonl
            ↓ (비동기 rollup)
     ~/.claude/logs/agent-telemetry-daily-{YYYYMMDD}.json
```

### 2.3 kit-feedback-archiving 연계

Phase 3 aggregator(`agent-completion-aggregator.js`)를 확장:
- 기존: copy/plan/dev collector 결과 집계
- 추가: agent-telemetry 이벤트 emit
- 로그 위치: `~/.claude/logs/agent-telemetry.jsonl` (기존 `checkpoints.jsonl` 와 병렬)

### 2.4 리포트 커맨드

`/agent-report` 커맨드 신설:

```markdown
## Usage
/agent-report [--period 7d] [--team dev|plan|copy|all] [--format table|json]

## Output
| Agent                 | Invocations | Success% | Avg Duration | P95 |
|-----------------------|:-----------:|:--------:|:------------:|:---:|
| plan-idea-screener    |          42 |    100% |          8.2s | 12s |
| dev-architect         |          31 |     97% |         11.5s | 18s |
| ...
```

### 2.5 IMP-AGENT-008 연계

frontmatter `team_owner` 기반 집계:
- 팀별 실패율 > 5% 시 소유 팀에 알림
- `release_stage: experimental` 에이전트 3회 이상 성공 시 beta 승격 제안
- `dependencies` 순환 참조 실시간 탐지

---

## 3. IMP-KIT-024와의 관계

| 항목 | IMP-KIT-024 (v2.3.0 stub) | IMP-AGENT-009 (v2.3.1 본체) |
|---|---|---|
| 범위 | 필드 정의만 | 수집 + 집계 + 리포트 |
| 구현 상태 | stub (미구현) | 실 파이프라인 |
| 의존성 | — | kit-feedback-archiving Phase 3 |
| 타깃 | 2.3.0 준비 | 2.3.1 배포 |

**parent-child**: IMP-KIT-024 parent, IMP-AGENT-009 child (승격).

---

## 4. 개인정보·보안

- 로그에는 **에이전트 이름·메타데이터만** 포함. 실 호출 프롬프트·출력 **저장 금지**
- `metadata` 필드는 에이전트가 자유롭게 구조화 정보 추가 가능하되, **PII 마스킹 책임**은 에이전트 측
- 로그 위치 `~/.claude/logs/` — 사용자 로컬 전용. 원격 전송 없음

## 5. 구현 범위

**신규 파일**:
- `src/claude/core/_schemas/agent-telemetry.schema.json`
- `src/claude/core/hooks/agent-telemetry-emit.js` — SubagentStart/Stop 훅
- `src/claude/core/commands/agent-report.md` — 리포트 커맨드
- `.claude/rules/agent-telemetry.md` — SSOT

**수정 파일**:
- `src/claude/core/hooks/agent-completion-aggregator.js` — 텔레메트리 이벤트 emit 추가
- `docs/plan/kit-2.3.0-roadmap/` — IMP-KIT-024 상태 "stub → child of IMP-AGENT-009" 갱신

**테스트**:
- 19개 에이전트 모두 invoked/completed 이벤트 발생
- 실패 케이스(에이전트 예외) 시 failed 이벤트 + error_class 기록
- 리포트 커맨드 7일 기간 집계 동작
- 로그 rollup idempotent

---

## 6. ROI

- **정방향**: IMP-AGENT-001~008 효과 측정 가능. v2.4.0 로드맵 근거 제공
- **측정**: 7일 수집 후 에이전트별 호출 100회 이상 샘플 확보
- **비용**: 스키마 1건 + 훅 확장 + 리포트 커맨드 1건. kit-feedback-archiving 인프라 재사용으로 신규 인프라 부담 최소화

---

## 7. 수락 기준

- [ ] agent-telemetry.schema.json v1 ajv validation 통과
- [ ] SubagentStart/Stop 훅에서 이벤트 emit
- [ ] 19개 에이전트 모두 이벤트 생성 확인
- [ ] `/agent-report --period 7d` 커맨드 동작
- [ ] IMP-KIT-024 status 갱신
- [ ] 개인정보·보안 원칙 준수 (프롬프트·출력 미저장)

---

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — IMP-KIT-024 stub 본체 승격 |
