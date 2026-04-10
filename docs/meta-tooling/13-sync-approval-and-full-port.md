# kit-sync 승인 게이트 + Codex 완전 이식 계획

> kit-sync 에이전트 워크플로우에 승인 단계를 추가하고, codex-skip 8개 항목의 대안을 설계한다.

---

## Part 1: kit-sync 승인 게이트

### 현재 워크플로우 (승인 없음)

```
1. /kit-analyze → 미전환 자산 파악
2. 규모 판단 (0/1/2-10/10+)
3. /kit-convert 실행           ← 바로 실행됨
4. C8 --fix (참조 수정)
5. 갭 리포트 생성
6. exception-registry 등록
7. /kit-audit C7+C8 검증
```

### 개선 워크플로우 (승인 게이트 추가)

```
1. /kit-analyze → 미전환 자산 파악
2. 규모 판단 (0/1/2-10/10+)

   ┌─────────────────────────────────────────┐
   │  2.5 승인 게이트 (NEW)                    │
   │                                          │
   │  a. 동기화 리포트 파일 생성               │
   │     → .plans/codex-sync/sync-report-{날짜}.md │
   │                                          │
   │  b. 사용자에게 리포트 제시                 │
   │     → AskUserQuestion으로 승인 요청        │
   │                                          │
   │  c. 사용자 선택:                          │
   │     - "승인" → Step 3으로 진행             │
   │     - "수정" → 리포트 편집 후 재제시       │
   │     - "거부" → 중단 + 사유 기록           │
   └─────────────────────────────────────────┘

3. /kit-convert 실행 (승인된 범위만)
4. C8 --fix (참조 수정)
5. 갭 리포트 생성
6. exception-registry 등록
7. /kit-audit C7+C8 검증
```

### 동기화 리포트 형식

**파일 위치**: `.plans/codex-sync/sync-report-{YYYY-MM-DD}.md`

```markdown
# Codex 동기화 리포트

> 생성: {날짜} | 상태: 승인 대기

## 요약

| 항목 | 건수 |
|------|------|
| 전환 대상 (auto) | N개 |
| 전환 대상 (review) | M개 |
| 건너뛰기 (codex-skip) | K개 |
| 면제 (exception) | L개 |

## 전환 대상

### auto (구조 변환만)

| # | Identity | Type | Domain | Target Path |
|---|----------|------|--------|-------------|
| 1 | dev-tdd-workflow | skill | dev | src/codex/dev/skills/dev-tdd-workflow/ |
| 2 | dev-architect | agent | dev | src/codex/dev/agents/dev-architect.md |
| ... | | | | |

### review (변환 후 수동 검토 필요)

| # | Identity | Type | Domain | 사유 |
|---|----------|------|--------|------|
| 1 | plan-prd-writer | agent | plan | write-capable (tools에 Write 포함) |
| 2 | dev-feature | command | dev | complex (frontmatter + 5 phases) |
| ... | | | | |

## 건너뛰기

| Identity | 사유 |
|----------|------|
| session-wrap-suggest | EX-001: Claude runtime 의존 |
| output-secret-filter | EX-002: CLAUDE_REMOTE_SESSION 의존 |
| coding-style ~ verification | EX-003~008: claude-origin shared |

## 사용자 수정 영역

아래 표에서 제외할 항목에 `[x]`를 표시하세요:

- [ ] dev-architect (auto → 제외하려면 체크)
- [ ] plan-prd-writer (review → 제외하려면 체크)
- [ ] ...

## 승인

- [ ] 위 전환 계획을 승인합니다
```

### 사용자 승인 메커니즘

| 트리거 조건 | 승인 방식 |
|------------|----------|
| 미전환 1-10개 | AskUserQuestion으로 "N개 전환 진행?" 확인 |
| 미전환 10+개 | 리포트 파일 생성 → 사용자 편집 → 재로드 후 승인 확인 |
| `--dry-run` | 리포트만 생성, 승인 요청 안 함 |

### kit-sync-agent 수정 사항

**Investigation_Protocol**에 Step 2.5 삽입:

```
2.5) 동기화 리포트 생성
   a. .plans/codex-sync/ 디렉토리 생성 (없으면)
   b. sync-report-{날짜}.md 작성 (위 형식)
   c. 규모에 따라 승인 요청:
      - 1-10개: AskUserQuestion("N개 전환을 진행할까요?")
      - 10+개: "리포트를 확인하고 수정한 후 승인해주세요"
   d. 승인 시 → Step 3 진행
   e. 거부 시 → 리포트에 "상태: 거부 ({사유})" 기록 후 중단
```

### /kit-sync 커맨드 수정 사항

**새 파라미터**:

| 플래그 | 설명 |
|--------|------|
| `--auto-approve` | 승인 게이트 건너뛰기 (CI 환경용) |

기본 동작은 항상 승인을 요청한다. `--auto-approve`는 자동화 파이프라인에서만 사용.

---

## Part 2: Codex 완전 이식 — Skip 항목 대안 분석

### EX-001: session-wrap-suggest (Hook) → **partial-port + codex-native**

**현재 상태**: Claude Stop 이벤트 + tmpdir 마커 의존. Codex에서 재현 불가.

**해결 방안**:

| 접근 | 설명 | 실현 가능성 |
|------|------|-----------|
| A. PostToolUse 전환 | Stop 대신 PostToolUse에서 호출 수 카운트, 30회 초과 시 제안 | 중 (Bash 매처만 실질 동작) |
| B. Codex 스킬 전환 | 훅이 아닌 스킬로 변환. 사용자가 명시적으로 호출 | 상 |
| C. 상태 파일 전환 | tmpdir 대신 `.codex/state/session-tracker.json`에 상태 저장 | 상 |

**권장**: B + C 조합
- `src/codex/core/skills/session-wrap-suggest/SKILL.md` 생성
- 스킬이 `.codex/state/` 디렉토리에 세션 상태 기록
- Stop 이벤트 대신 사용자가 세션 마무리 시 호출하거나, PostToolUse 훅이 카운트 체크

**exception-registry 변경**: `EX-001` status → `partial-ported` (완전 제거 아님)

---

### EX-002: output-secret-filter (Hook) → **full-port** ✅

**현재 상태**: `CLAUDE_REMOTE_SESSION` 환경변수 + `~/.claude/` 경로 의존.

**해결 방안**: 2줄 수정으로 완전 이식 가능.

```javascript
// Before (Claude-specific):
if (!process.env.CLAUDE_REMOTE_SESSION) process.exit(0);
const logPath = path.join(os.homedir(), '.claude', 'security.log');

// After (Codex-compatible):
if (!process.env.CODEX_WORKSPACE && !process.env.CLAUDE_REMOTE_SESSION) process.exit(0);
const logPath = path.join(process.cwd(), '.codex', 'logs', 'security.log');
```

핵심 로직(14개 비밀 패턴 정규식)은 100% 재사용.

**exception-registry 변경**: `EX-002` → **삭제** (완전 이식)

---

### EX-003~008: Rules 6개 → **codex-native-replacement**

Rules는 Codex `.rules` exec-policy 파일로 직접 변환하지 않는다 (09-phase4-feedback-review.md §4.4 확정). 대신 3-tier 전략:

#### Tier 1: AGENTS.md Guidance (6개 전체)

모든 rule 내용을 `src/templates/AGENTS.md.template`의 "핵심 규칙" 섹션에 반영. 이미 부분적으로 포함되어 있으나, 각 rule의 핵심 원칙을 더 상세하게.

**해당**: coding-style, date-calculation, golden-principles, interaction, security, verification 전부

#### Tier 2: .codex/rules/ Exec-Policy (선택적, 3개)

기계적으로 강제 가능한 원칙만 exec-policy로 추출:

| Rule 원본 | Exec-Policy | 내용 |
|----------|-------------|------|
| golden-principles #1 | `immutability.rules` | "함수에서 입력 객체를 변이하지 않는다" |
| golden-principles #5 | `file-size.rules` | "파일 800줄, 함수 50줄, 중첩 4단계 초과 금지" |
| security #1 | `no-hardcoded-secrets.rules` | "API 키, 비밀번호, 토큰을 코드에 하드코딩하지 않는다" |

#### Tier 3: 변환 불필요 (3개)

순수 가이드라인으로, exec-policy로 변환할 수 없는 원칙:

| Rule | 사유 |
|------|------|
| interaction | 커뮤니케이션 패턴 (결론 우선, 유추 설명) — 기계 강제 불가 |
| date-calculation | 도구 사용 가이드 — AGENTS.md에서 충분 |
| verification | 프로세스 원칙 (증거 기반 완료) — 워크플로우 가이드 |

**exception-registry 변경**:
- EX-003~008: status 유지 (`active`), reason을 "AGENTS.md + selective .rules/ 전환 완료"로 갱신
- Codex 파일이 `src/codex/`가 아닌 `src/templates/AGENTS.md.template` + `src/codex/core/rules/`에 생성되므로 pairing-registry에는 등록하지 않음

---

## Part 3: 이식 로드맵

### 즉시 실행 (effort: 낮음)

| # | 항목 | 작업 | 예상 시간 |
|---|------|------|----------|
| 1 | EX-002 full-port | output-secret-filter.js 2줄 수정 → src/codex/core/hooks/ 배치 | 10분 |
| 2 | AGENTS.md 보강 | 6개 rule 핵심 원칙을 AGENTS.md.template에 상세 반영 | 30분 |

### 단기 실행 (effort: 중간)

| # | 항목 | 작업 | 예상 시간 |
|---|------|------|----------|
| 3 | EX-001 partial-port | session-wrap-suggest → Codex 스킬 전환 (상태 파일 기반) | 1시간 |
| 4 | Exec-policy 3개 | immutability/file-size/no-hardcoded-secrets .rules 생성 | 30분 |

### 승인 게이트 구현

| # | 항목 | 작업 | 예상 시간 |
|---|------|------|----------|
| 5 | kit-sync-agent 수정 | Investigation_Protocol Step 2.5 삽입 | 30분 |
| 6 | kit-sync 커맨드 수정 | --auto-approve 파라미터 추가 | 10분 |
| 7 | .plans/codex-sync/ 구조 | 디렉토리 + 리포트 템플릿 | 10분 |

### 이식 후 예상 상태

| 항목 | Before | After |
|------|--------|-------|
| codex-skip 훅 | 2개 | 0개 (1 full-port + 1 partial-port) |
| codex-skip 룰 | 6개 | 6개 (AGENTS.md 전환, exception 유지) |
| exception-registry | 8 active | 1 삭제(EX-002) + 1 partial(EX-001) + 6 갱신(reason 변경) |
| Codex exec-policy | 0개 | 3개 (.rules 파일) |

---

## Part 4: exception-registry 갱신 계획

### EX-002 삭제 (full-port 후)

```json
// 삭제 또는 status: "resolved"
{
  "id": "EX-002",
  "status": "resolved",
  "reason": "Codex 호환 버전 생성 완료 (src/codex/core/hooks/output-secret-filter.js)"
}
```

### EX-001 갱신 (partial-port 후)

```json
{
  "id": "EX-001",
  "status": "active",
  "reason": "Codex 스킬로 부분 전환 (src/codex/core/skills/session-wrap-suggest/). Stop 이벤트 대체 불가, 수동 호출 방식",
  "detail": "Claude Stop 이벤트 → Codex 스킬 전환. tmpdir → .codex/state/ 전환"
}
```

### EX-003~008 갱신 (AGENTS.md + .rules 전환 후)

```json
{
  "id": "EX-003",
  "reason": "AGENTS.md guidance + immutability.rules exec-policy 전환 완료. 개별 src/codex/ 변환 파일은 불필요 (shared guidance 원칙 유지)"
}
```

---

## 참조 문서

| 문서 | 관련 |
|------|------|
| 11-consistency-tooling.md §2 | kit-sync 에이전트 설계 |
| 10-conversion-tooling.md §5 | kit-converter skip-registry |
| 09-phase4-feedback-review.md §4.3-4.4 | Codex hooks/rules 공식 가이드 정렬 |
| scripts/codex-hook-compat.js | 훅 호환성 필터 로직 |
