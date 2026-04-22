---
name: agent-report
description: 에이전트 호출 텔레메트리 리포트. ~/.claude/logs/agent-telemetry.jsonl을 집계하여 에이전트별 호출 빈도·성공률·응답 시간을 표 형태로 출력한다. IMP-AGENT-009.
domain: core
---

# /agent-report

에이전트 호출 텔레메트리 집계 리포트 커맨드.

## Usage

```
/agent-report [--period 7d|30d|all] [--team dev|plan|copy|all] [--format table|json]
```

### Parameters

| 인자 | 기본값 | 설명 |
|------|--------|------|
| `--period` | `7d` | 집계 기간. `7d`(7일), `30d`(30일), `all`(전체) |
| `--team` | `all` | 팀 필터. 에이전트 frontmatter의 `team_owner` 필드 기반 (IMP-AGENT-008) |
| `--format` | `table` | 출력 형식. `table`(마크다운 표) 또는 `json` |

## 실행 절차

1. **로그 파일 로드**: `~/.claude/logs/agent-telemetry.jsonl` 읽기
   - 파일 미존재 시 "텔레메트리 데이터 없음 — IMP-AGENT-009 훅 미구현 상태이거나 첫 호출 대기 중" 안내 후 종료
2. **기간 필터**: `--period` 값으로 `timestamp` 범위 제한
3. **팀 필터**: `--team all` 아니면 `agent_metadata.team_owner` 일치 이벤트만 유지
4. **invocation_id 기준 매칭**: invoked ↔ completed/failed/timeout 쌍 구성
   - 매칭 실패한 invoked (세션 비정상 종료): `event_type: invoked` + duration `null` 상태로 기록
5. **에이전트별 집계**:
   - Invocations: 총 invoked 이벤트 수
   - Success%: completed 이벤트 수 ÷ (invoked 수) × 100
   - Failed: failed + timeout 이벤트 수
   - Avg Duration: completed duration_ms 평균
   - P95 Duration: completed duration_ms 95 percentile
6. **출력**: `--format` 지정 형식으로 표시

## 출력 예시 (table)

```
## Agent Telemetry Report
Period: 2026-04-15 ~ 2026-04-22 (7d)
Filter: team=all

| Agent                    | Team | Stage | Invocations | Success% | Failed | Avg Duration | P95   |
|--------------------------|:----:|:-----:|:-----------:|:--------:|:------:|:------------:|:-----:|
| plan-idea-screener       | plan | stable|          42 |    100%  |      0 |         8.2s |  12s  |
| dev-architect            |  dev | stable|          31 |     97%  |      1 |        11.5s |  18s  |
| plan-bridge-writer       | plan | stable|          18 |    100%  |      0 |         6.8s |  10s  |
| dev-code-reviewer        |  dev | stable|          15 |     93%  |      1 |         9.0s |  14s  |
| ...                      |      |       |             |          |        |              |       |

### 관찰
- **고빈도 에이전트** (> 20 invocations): plan-idea-screener, dev-architect
- **경고**: plan-wireframe-designer 실패율 10% 이상 (5회 중 1회 실패)
- **experimental 에이전트 승격 후보**: (없음)
```

## 출력 예시 (json)

```json
{
  "period": { "start": "2026-04-15", "end": "2026-04-22", "label": "7d" },
  "filter": { "team": "all" },
  "agents": [
    {
      "name": "plan-idea-screener",
      "team_owner": "plan",
      "release_stage": "stable",
      "invocations": 42,
      "success_rate": 1.0,
      "failed": 0,
      "avg_duration_ms": 8234,
      "p95_duration_ms": 12104
    }
  ],
  "warnings": [
    {
      "agent_name": "plan-wireframe-designer",
      "severity": "warn",
      "message": "Failure rate 20% (1/5) exceeds 5% threshold"
    }
  ]
}
```

## 개인정보·보안 원칙

- **프롬프트·출력 내용 미저장**: 크기(`input_bytes`, `output_bytes`)만 기록
- **원격 전송 없음**: 로그는 `~/.claude/logs/` 로컬 전용
- **PII 마스킹**: `metadata` 필드의 PII 마스킹 책임은 이벤트 emit 에이전트 측

## 관련

- 스키마: `src/claude/core/_schemas/agent-telemetry.schema.json`
- 룰: `.claude/rules/agent-telemetry.md`
- 훅 (미구현, 별도 세션): `src/claude/core/hooks/agent-telemetry-emit.js`
- 기반 인프라: kit-feedback-archiving Phase 3 (shipped)
- 스펙: `docs/plan/kit-agent-improvements/IMP-AGENT-009-agent-telemetry.md`
