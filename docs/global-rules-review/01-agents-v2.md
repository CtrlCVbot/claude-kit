# agents-v2.md 비교 문서

- **변경 강도**: HIGH
- **점수**: 1 -> 4

---

## 현재 내용 요약

`agents-v2.md`는 에이전트 오케스트레이션 규칙을 정의하지만, 내용의 대부분이 특정 조직(`qjc-office`)에 종속되어 있다.

- `~/qjc-office/dotclaude/reference/` 경로 참조 3건
- 조직 전용 스킬 5개 (`/simplify`, `/batch`, `/rc`, `/ralph-loop`, `/email-action`)
- 하드코딩된 에이전트 34개 (qjc-business, qjc-operations, qjc-content 등 조직 전용 포함)
- `/agent-router` 라우팅 테이블 (조직 도메인 구조에 종속)
- 외부 참조 파일 5개 (agents-teams-ref.md, agents-config-ref.md, agent-catalog.md, agent-pipeline.md, parallel-agents-guide.md)

---

## 발견된 문제

| # | 문제 | 심각도 |
|---|------|--------|
| 1 | `~/qjc-office/` 절대 경로 3곳 -- 다른 머신/프로젝트에서 참조 불가 | CRITICAL |
| 2 | Built-in Skills 5개 전부 조직 전용 (`/email-action`, `/rc` 등) | HIGH |
| 3 | 에이전트 34개 하드코딩 -- 프로젝트마다 다른 에이전트 구성 불가 | HIGH |
| 4 | `/agent-router` 섹션이 라우팅 대상을 고정 -- 범용 원칙이 아닌 설정 | HIGH |
| 5 | 외부 참조 파일 5개가 특정 디렉터리 구조 가정 | MEDIUM |

---

## 변경 제안

### Before/After 비교

| 섹션 | Before | After | 조치 |
|------|--------|-------|------|
| 헤더 참조 (3줄) | `> 팀 운영 상세: ~/qjc-office/dotclaude/reference/agents-teams-ref.md` 외 2줄 | (삭제) | REMOVE |
| Built-in Skills 테이블 | `/simplify`, `/batch`, `/rc`, `/ralph-loop`, `/email-action` 5개 | (삭제) | REMOVE |
| 에이전트 자동 라우팅 섹션 | 34 에이전트 하드코딩 + `/agent-router` 참조 | (삭제) | REMOVE |
| Parallel Task Execution | `독립 작업은 항상 병렬 실행. 순차 실행이 필요한 경우만 예외.` | (유지) | KEEP |
| Subagents vs Agent Teams | 비교 테이블 (통신/최적 용도/토큰 비용) | (유지) + 의사결정 기준 추가 | KEEP + ADD |
| 테이블 하단 참조 | `상세: agents-teams-ref.md, agents-config-ref.md 참조.` | (삭제) | REMOVE |
| Agent Memory | `~/.claude/agent-memory/{agent-name}/`. 상세: agents-config-ref.md 참조. | `~/.claude/agent-memory/{agent-name}/` (경로만 유지, 외부 참조 삭제) | SIMPLIFY |
| Agent Pipeline / Parallel Agents | `~/qjc-office/` 경로 2개 참조 | (삭제) | REMOVE |
| (신규) 프로젝트별 에이전트 안내 | -- | `프로젝트별 에이전트는 .claude/agents/ 또는 CLAUDE.md에 정의` | ADD |
| (신규) 선택 기준 | -- | Subagent vs Team 의사결정 기준 (복잡도, 협업 필요성, 토큰 예산) | ADD |

### 구조 변경 상세

**REMOVE -- 조직 종속 콘텐츠 (전체 삭제)**

```
# Before: 헤더 참조 (3줄)
> 팀 운영 상세: ~/qjc-office/dotclaude/reference/agents-teams-ref.md
> MCP/설정 상세: ~/qjc-office/dotclaude/reference/agents-config-ref.md
> 에이전트 카탈로그: ~/qjc-office/dotclaude/reference/agent-catalog.md

# Before: Built-in Skills (테이블 전체)
| /simplify | 기능 구현 후 코드 정리 ... |
| /batch    | 동일 패턴 반복 변경 ...     |
| /rc       | 외출 시 원격 세션 접속       |
| /ralph-loop | 다중 턴 자율 반복 ...     |
| /email-action | 2-Phase 이메일 처리 ... |

# Before: 에이전트 자동 라우팅 (CRITICAL) 섹션 전체
주요 라우팅 대상 (34 에이전트): ...

# Before: Agent Pipeline / Parallel Agents
- 호출 순서: ~/qjc-office/dotclaude/reference/agent-pipeline.md
- 병렬 가이드: ~/qjc-office/dotclaude/reference/parallel-agents-guide.md
```

```
# After: 전부 삭제. 프로젝트별 에이전트는 .claude/agents/에 정의하도록 안내.
```

**ADD -- 의사결정 기준**

```
# After: Subagents vs Agent Teams 섹션 하단에 추가
## 선택 기준

- 결과만 필요 + 단일 집중 작업 → Subagent
- 중간 논의/피드백 필요 + 다단계 협업 → Agent Team
- 토큰 예산 제한 시 → Subagent 우선
```

---

## After 내용 요약

개선 후 `agents-v2.md`는 다음 범용 원칙만 포함한다:

1. **병렬 실행 원칙**: 독립 작업은 항상 병렬
2. **Subagent vs Agent Team 비교**: 통신 모델, 최적 용도, 토큰 비용 + 선택 기준
3. **Agent Memory**: 범용 경로 패턴 (`~/.claude/agent-memory/{agent-name}/`)
4. **프로젝트별 안내**: `.claude/agents/` 또는 `CLAUDE.md`에서 에이전트 정의

---

## 토큰 영향

| 항목 | Before | After | 변화 |
|------|:------:|:-----:|:----:|
| 추정 토큰 | ~750 | ~300 | **-60%** |
| 삭제 대상 | 조직 경로, 스킬 테이블, 라우팅 목록, 외부 참조 | -- | -- |
| 추가 대상 | -- | 선택 기준 (3줄), 프로젝트별 안내 (1줄) | +~30 토큰 |
