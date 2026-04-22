# 에이전트 텔레메트리

> **결론**: IMP-AGENT-009. claude-kit 19개 에이전트의 호출·완료·실패 이벤트를 `~/.claude/logs/agent-telemetry.jsonl`에 기록하여 IMP-AGENT-001~008 효과 측정 기반을 마련한다. IMP-KIT-024(stub) 본체 구현. kit-feedback-archiving Phase 3 인프라 재사용.

**스키마**: `src/claude/core/_schemas/agent-telemetry.schema.json` (v1)
**커맨드**: `src/claude/core/commands/agent-report.md`
**훅** (미구현, 별도 세션 권장): `src/claude/core/hooks/agent-telemetry-emit.js`
**스펙**: `docs/archive/kit-agent-improvements-v2.3.1/IMP-AGENT-009-agent-telemetry.md`

---

## 1. 이벤트 타입

| 타입 | 시점 | 필수 필드 |
|------|------|-----------|
| `invoked` | 에이전트 호출 시작 | invocation_id, caller |
| `completed` | 정상 완료 | invocation_id, duration_ms |
| `failed` | 예외 발생 | invocation_id, duration_ms, error_class |
| `timeout` | 시간 초과 | invocation_id, duration_ms |

---

## 2. 로그 위치·형식

- 파일: `~/.claude/logs/agent-telemetry.jsonl`
- 형식: 한 이벤트 = 한 줄 JSON (JSONL)
- append-only. 로그 로테이션은 별도 (30일 이상은 daily rollup 파일로 이동)
- daily rollup: `~/.claude/logs/agent-telemetry-daily-{YYYYMMDD}.json`

---

## 3. 수집 파이프라인

```
에이전트 호출 → SubagentStart hook (미래 구현)
            → invoked 이벤트 emit
            ↓
       [에이전트 실행]
            ↓
     SubagentStop hook (기존 agent-completion-aggregator.js 확장)
            → completed / failed / timeout 이벤트 emit
            ↓
     ~/.claude/logs/agent-telemetry.jsonl
            ↓ (비동기 daily rollup)
     ~/.claude/logs/agent-telemetry-daily-{YYYYMMDD}.json
```

**현재 상태** (2026-04-22):
- ✅ 스키마 v1 정의
- ✅ `/agent-report` 리포트 커맨드
- ✅ 본 SSOT 룰
- ⏳ emit 훅 JS 구현 (별도 세션 권장, TDD 필요)
- ⏳ 기존 `agent-completion-aggregator.js` 확장 (TDD 필요)
- ⏳ daily rollup 스크립트

---

## 4. 개인정보·보안 원칙

### 4.1 저장 금지 항목
- 에이전트 프롬프트 전문
- 에이전트 출력 전문
- 사용자 입력 원문

### 4.2 저장 허용 항목
- 에이전트 이름 (`agent_name`)
- 호출 주체 분류 + 이름 (`caller`)
- 타임스탬프 (`timestamp`)
- 크기 지표 (`input_bytes`, `output_bytes`)
- 성공·실패·소요시간 (`duration_ms`, `error_class`)
- 에이전트 frontmatter snapshot (`agent_metadata`, IMP-AGENT-008 필드)

### 4.3 원격 전송 금지
- 로그는 `~/.claude/logs/` 로컬 전용
- 외부 API 전송 없음
- 사용자가 명시적으로 `/agent-report --format json`을 실행하지 않는 한 데이터 노출 없음

### 4.4 metadata 필드의 PII
- `metadata` 필드는 에이전트별 자유 구조
- PII (이메일·토큰·경로 등) **마스킹 책임은 이벤트 emit 에이전트 측**
- 본 룰은 권장 마스킹 패턴을 별도 제공하지 않음 (에이전트별 컨텍스트 의존)

---

## 5. IMP-AGENT-008(frontmatter 확장)과의 연계

`agent_metadata` 필드는 IMP-AGENT-008 구현 시 의미 있는 값을 갖는다:
- `team_owner`: 팀별 집계·알림
- `release_stage`: experimental → beta 승격 후보 식별
- `schema_version`: frontmatter 스키마 버전 추적

IMP-AGENT-008 미구현 상태에서는 `agent_metadata` 필드가 누락(optional) 또는 빈 객체. 리포트는 해당 필드 없이도 동작.

---

## 6. IMP-KIT-024와의 관계

| 항목 | IMP-KIT-024 (v2.3.0 stub) | IMP-AGENT-009 (v2.3.1 본체) |
|------|---------------------------|-----------------------------|
| 범위 | 필드 정의만 | 수집 + 집계 + 리포트 |
| 상태 | stub (v2.3.0 shipped) | 스키마 + 커맨드 + 룰 (v2.3.1 shipped) |
| 훅 | 미구현 | 미구현 (별도 세션) |

**v2.3.0 로드맵의 IMP-KIT-024 status 업데이트 필요**: stub → "deprecated (superseded by IMP-AGENT-009)". 본 적용은 kit-2.3.0-roadmap README 갱신 시점에 반영.

---

## 7. 리포트 커맨드 사용

사용자는 `/agent-report` 커맨드로 언제든 집계 결과를 조회:

```
/agent-report --period 7d              # 지난 7일
/agent-report --period 30d --team dev  # 지난 30일 dev 팀만
/agent-report --period all --format json  # 전체 기간 JSON
```

상세: `src/claude/core/commands/agent-report.md`.

---

## 8. 향후 확장

| 항목 | 타임라인 |
|------|----------|
| emit 훅 JS 구현 | v2.3.1 후속 세션 (TDD 필요) |
| daily rollup 스크립트 | v2.3.1 후속 세션 |
| kit-feedback-archiving Phase 4 연계 (장기 보관) | v2.4.0 |
| 알림 자동화 (실패율 임계 초과 시 팀 알림) | v2.4.0 |
| 텔레메트리 → decision-log 자동 링크 | v2.4.0 |

---

## 9. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-22 | 초안 — IMP-AGENT-009 스키마·커맨드·룰 SSOT (훅 구현은 후속) | Claude (메인테이너 역할) |
