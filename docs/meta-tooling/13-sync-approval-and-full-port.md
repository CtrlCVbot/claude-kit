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
   │     → docs/codex-sync/sync-report-{날짜}.md │
   │                                          │
   │  b. 리포트 내용을 콘솔에 출력             │
   │     → "리포트를 확인하세요: {경로}"        │
   │     → 에이전트가 중단하고 사용자 입력 대기 │
   │                                          │
   │  c. 사용자가 다음 메시지로 응답:          │
   │     - "승인" / "진행" → Step 3으로 진행    │
   │     - "수정했음" → 리포트 재로드 후 진행   │
   │     - "거부" / "중단" → 사유 기록 후 종료  │
   └─────────────────────────────────────────┘
   
   * 메커니즘: AskUserQuestion이 아닌 **대화 기반 승인**.
     kit-sync-agent는 tools에 AskUserQuestion이 없으므로,
     리포트를 Write로 생성한 뒤 사용자의 다음 메시지를 기다린다.
     사용자가 "승인"이라고 응답하면 진행, "거부"면 중단.

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
2.5) 동기화 리포트 생성 + 승인 대기
   a. docs/codex-sync/ 디렉토리 생성 (없으면)
   b. sync-report-{날짜}.md 작성 (위 형식)
   c. 콘솔에 리포트 요약 출력 + 파일 경로 안내
   d. "리포트를 확인한 후 '승인' 또는 '거부'로 응답해주세요" 메시지 출력
   e. 에이전트 턴 종료 → 사용자 응답 대기
   f. 사용자가 "승인" → 리포트 재로드(Read) → Step 3 진행
   g. 사용자가 "수정했음" → 리포트 재로드(Read) → 수정 반영 후 Step 3 진행
   h. 사용자가 "거부" → 리포트에 "상태: 거부" 기록 → 중단
```

**승인 메커니즘**: 에이전트가 턴을 끝내고 사용자의 다음 메시지를 기다리는 **대화 기반 승인**. AskUserQuestion 도구 없이도 작동한다. 사용자가 리포트 파일을 직접 편집한 후 "수정했음"이라 응답하면, 에이전트가 Read로 재로드하여 수정 사항을 반영한다.

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

**권장**: B (Codex 스킬 전환)
- `src/codex/core/skills/session-wrap-suggest/SKILL.md` 생성
- Stop 이벤트 대신 사용자가 세션 마무리 시 명시적으로 호출
- 호출 수 카운트는 스킬 내부에서 git log 커밋 수 등으로 대체 (세션 통계 파일 의존 제거)

**PostToolUse 대체 불가 사유**: Codex PostToolUse 매처는 현재 Bash만 실질 동작. 모든 도구에 대한 호출 수 집계 불가. 또한 `~/.claude/.session-stats.json` 세션 통계 파일이 Codex에 존재하지 않아, 원본의 `total_calls` 기반 로직 재현 불가.

**`.codex/state/` 대신**: Codex 공식 상태 디렉토리 규격이 문서화되지 않았으므로, 프로젝트 로컬 파일(`.codex/session-state.json`)을 사용하되 **Codex 공식 규격 확정 후 경로 변경** 가능성을 주석으로 남긴다.

**exception-registry 변경**: `EX-001` status 유지 (`active`), reason 갱신:
"Codex 스킬로 부분 전환. Stop 이벤트 + 세션 통계 의존 → 명시적 호출 방식. 원본과 기능 동등성 불완전."

---

### EX-002: output-secret-filter (Hook) → **conditional-port**

**현재 상태**: `CLAUDE_REMOTE_SESSION` 환경변수 + `~/.claude/` 경로 의존.

**핵심 로직**: 14개 비밀 패턴 정규식 — 100% 플랫폼 독립적, 재사용 가능.

**포팅에 필요한 변경** (3줄+ 수정):

```javascript
// 1. 환경변수 조건 변경 (1줄)
// Before: if (!process.env.CLAUDE_REMOTE_SESSION) process.exit(0);
// After:
const isRemote = process.env.CLAUDE_REMOTE_SESSION || process.env.CODEX_SANDBOX;
if (!isRemote) process.exit(0);

// 2. 로그 경로 변경 (2줄)
// Before: const logDir = path.join(os.homedir(), '.claude');
// After:
const logDir = process.env.CODEX_SANDBOX
  ? path.join(process.cwd(), '.codex', 'logs')
  : path.join(os.homedir(), '.claude');

// 3. 로그 디렉토리 생성 보장 (추가)
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
```

**전제 조건 (포팅 전 확인 필수)**:
- [ ] Codex 원격 환경 환경변수 확인 (`CODEX_SANDBOX` 또는 대체 변수)
- [ ] Codex PostToolUse 훅의 stdin JSON 스키마에 `tool_result`, `tool_name`, `session_id` 필드 포함 여부
- [ ] PostToolUse `*` 매처가 Codex에서 실제 동작하는지 테스트 (공식 문서: Bash만 실질 매칭)

> **주의**: `*` 매처 미동작 시, 비밀 필터링이 Bash 출력에만 적용됨. 이 경우 Codex-native 대안(Codex Rules 또는 pre-commit 훅)을 검토해야 함.

**exception-registry 변경**: `EX-002` status → `resolved` (삭제 아님, 감사 추적 보존)

---

### EX-003~008: Rules 6개 → **codex-native-replacement**

Rules는 Codex `.rules` exec-policy 파일로 직접 변환하지 않는다 (09-phase4-feedback-review.md §4.4 확정). 대신 3-tier 전략:

#### Tier 1: AGENTS.md Guidance (6개 전체)

모든 rule 내용을 `src/templates/AGENTS.md.template`의 "핵심 규칙" 섹션에 반영. 이미 부분적으로 포함되어 있으나, 각 rule의 핵심 원칙을 더 상세하게.

**해당**: coding-style, date-calculation, golden-principles, interaction, security, verification 전부

#### Tier 2: .codex/rules/ Exec-Policy (선택적, 3개 후보)

> **주의**: 09-phase4-feedback-review.md §4.4는 "src/core/rules/*.md는 Codex `.rules`로 자동 변환하지 않는다"고 명시. Tier 2는 자동 변환이 아닌 **수동 설계** — 원칙 내용을 Codex exec-policy 문법으로 새로 작성하는 것.
>
> **전제 조건**: Codex `.rules` 파일의 공식 문법 확인 필요. `.codex/rules/*.rules` 또는 `requirements.toml [rules]` 형식이 확정되지 않으면 이 Tier는 보류.

기계적으로 강제 가능한 원칙 후보:

| Rule 원본 | Exec-Policy 후보 | 내용 | 전제 |
|----------|-----------------|------|------|
| golden-principles #1 | `immutability.rules` | "함수에서 입력 객체를 변이하지 않는다" | Codex .rules 문법 확정 후 |
| golden-principles #5 | `file-size.rules` | "파일 800줄, 함수 50줄, 중첩 4단계 초과 금지" | Codex .rules 문법 확정 후 |
| security #1 | `no-hardcoded-secrets.rules` | "API 키, 비밀번호, 토큰을 코드에 하드코딩하지 않는다" | Codex .rules 문법 확정 후 |

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
| 1 | AGENTS.md 보강 | 6개 rule 핵심 원칙을 AGENTS.md.template에 상세 반영 (Part 6 참조) | 45분 |

### 단기 실행 (effort: 중간)

| # | 항목 | 작업 | 예상 시간 | 전제 조건 |
|---|------|------|----------|----------|
| 2 | EX-002 conditional-port | output-secret-filter.js 3줄+ 수정 → 환경변수/매처 테스트 | 1시간 | Codex 환경변수 확인 |
| 3 | EX-001 스킬 전환 | session-wrap-suggest → Codex 스킬 (git log 기반) | 2시간 | Codex 스킬 로드 확인 |

### 보류 (전제 조건 미충족)

| # | 항목 | 작업 | 전제 조건 |
|---|------|------|----------|
| 4 | Exec-policy 3개 | immutability/file-size/no-hardcoded-secrets .rules 생성 | **Codex .rules 공식 문법 확정** |

### 승인 게이트 구현

| # | 항목 | 작업 | 예상 시간 |
|---|------|------|----------|
| 5 | kit-sync-agent 수정 | Investigation_Protocol Step 2.5 삽입 | 30분 |
| 6 | kit-sync 커맨드 수정 | --auto-approve 파라미터 추가 | 10분 |
| 7 | .plans/codex-sync/ 구조 | 디렉토리 + 리포트 템플릿 | 10분 |

### 이식 후 예상 상태

| 항목 | Before | After |
|------|--------|-------|
| codex-skip 훅 | 2개 | 1 resolved(EX-002) + 1 active(EX-001, 스킬 전환) |
| codex-skip 룰 | 6개 | 6개 (AGENTS.md 전환, exception active 유지) |
| exception-registry | 8 active | 1 resolved + 7 active(reason 갱신) |
| AGENTS.md | 1줄 요약 | 핵심 원칙 2-3줄 확장 |
| Codex exec-policy | 0개 | 0개 (Codex .rules 문법 확정 후 최대 3개) |

---

## Part 4: exception-registry 갱신 계획

> **원칙**: 엔트리는 삭제하지 않는다. `status` 필드로 상태를 관리하여 감사 추적을 보존한다.

### EX-002 (conditional-port 후)

```json
{
  "id": "EX-002",
  "component": "output-secret-filter",
  "status": "resolved",
  "reason": "Codex 호환 버전 생성 완료. 전제 조건(Codex 환경변수 + PostToolUse 매처) 충족 확인 후 resolved로 전환",
  "detail": "CLAUDE_REMOTE_SESSION → CODEX_SANDBOX 조건 분기. ~/.claude/ → .codex/logs/ 경로 변경"
}
```

### EX-001 (스킬 전환 후)

```json
{
  "id": "EX-001",
  "component": "session-wrap-suggest",
  "status": "active",
  "reason": "Codex 스킬로 부분 전환. Stop 이벤트 + 세션 통계 의존 → 명시적 호출 방식. 원본과 기능 동등성 불완전",
  "detail": "Claude Stop 이벤트 → Codex 스킬 전환. 세션 통계(~/.claude/.session-stats.json) 대체 불가"
}
```

### EX-003~008 (AGENTS.md 전환 후)

```json
{
  "id": "EX-003",
  "component": "coding-style",
  "status": "active",
  "reason": "AGENTS.md guidance로 전환 완료. 개별 src/codex/ 변환 파일은 불필요 (shared guidance 원칙 유지). Tier 2 exec-policy는 Codex .rules 문법 확정 후 추가 검토"
}
```

`EX-004~008`도 동일 패턴으로 reason만 갱신. status는 `active` 유지 (src/codex/ 파일이 생성되지 않으므로).

---

## Part 5: 롤백 + 런타임 테스트

### 롤백 전략

| 시나리오 | 롤백 방법 |
|----------|----------|
| EX-002 포팅 후 Codex에서 훅 미작동 | `src/codex/core/hooks/output-secret-filter.js` 삭제 + EX-002 status를 `active`로 복원 |
| EX-001 스킬 전환 후 기대 동작 불일치 | `src/codex/core/skills/session-wrap-suggest/` 삭제 + EX-001 reason 복원 |
| Tier 2 exec-policy 문법 오류 | `.codex/rules/*.rules` 삭제 (AGENTS.md guidance는 유지) |

**핵심 원칙**: 포팅 실패 시 Claude 원본(`src/claude/`)은 **절대 수정하지 않음**. Codex 측 파일만 추가/삭제하므로 롤백은 항상 안전.

### 런타임 테스트 계획

| # | 대상 | 테스트 | 확인 사항 |
|---|------|--------|----------|
| 1 | EX-002 (훅) | Codex 프로젝트에서 `CODEX_SANDBOX=1`로 훅 실행 | stdin JSON에 `tool_result` 포함 여부, 로그 파일 생성 여부 |
| 2 | EX-002 (매처) | PostToolUse `*` 매처로 비-Bash 도구 출력 필터링 | `*` 매처 동작 여부 (미동작 시 Bash-only 필터로 축소) |
| 3 | EX-001 (스킬) | `/session-wrap-suggest` 스킬 호출 | git log 기반 카운트 대체가 유효한지 |
| 4 | Tier 2 (.rules) | `.codex/rules/immutability.rules` 배치 후 Codex 실행 | 규칙 위반 코드에 대한 경고/차단 동작 |

> 런타임 테스트는 Codex CLI가 설치된 환경에서만 가능. 현재 프로젝트에 Codex CLI가 없으면 테스트 단계는 **보류**하고, 포팅 파일만 생성한다.

---

## Part 6: AGENTS.md.template 반영 상세

현재 `src/templates/AGENTS.md.template`의 "핵심 규칙" 섹션(lines 13-19)은 1줄 요약만 포함:

```markdown
## 핵심 규칙
- **verification**: 증거 없는 완료 선언 금지 (Iron Law)
- **security**: 커밋 전 보안 체크리스트 8항목
...
```

### 보강 방안

각 rule의 핵심 원칙 2-3줄을 추가하여 Codex가 실질적으로 참조할 수 있는 수준으로 확장:

```markdown
## 핵심 규칙

### verification
증거 없는 완료 선언 금지 (Iron Law). 테스트 통과 결과, 빌드 성공 출력, 요구사항 체크리스트를 반드시 포함.
"should work", "probably fine" 같은 추측 표현은 완료 근거로 인정하지 않음.

### security
커밋 전 보안 체크리스트 8항목: 비밀 하드코딩 금지, 입력 검증, SQL 인젝션 방지, XSS/CSRF, 인증/권한, 레이트 리밋, 에러 메시지 필터링.
비밀은 반드시 환경변수로. 미설정 시 즉시 throw.

### golden-principles
불변성(spread), TDD(Red-Green-Refactor), 결론 우선, 파일 800줄/함수 50줄 제한, 시스템 경계에서 검증, 증거 기반 완료.

### coding-style
불변 패턴 필수, 파일 200-400줄 권장(800 상한), 에러 try-catch 필수, 입력 zod 검증.

### interaction
가정 명시 후 코딩, 유추로 설명 후 기술 상세, 결론 우선 + 근거 후행. 불확실하면 인정.

### date-calculation
날짜 계산 절대 수동 금지. date 커맨드 또는 python3 datetime 사용 필수.
```

### 수정 위치

`src/templates/AGENTS.md.template`의 `## 핵심 규칙` ~ `## Skills` 사이를 위 내용으로 교체.

---

## 참조 문서

| 문서 | 관련 |
|------|------|
| 11-consistency-tooling.md §2 | kit-sync 에이전트 설계 |
| 10-conversion-tooling.md §5 | kit-converter skip-registry |
| 09-phase4-feedback-review.md §4.3-4.4 | Codex hooks/rules 공식 가이드 정렬 |
| scripts/codex-hook-compat.js | 훅 호환성 필터 로직 |
