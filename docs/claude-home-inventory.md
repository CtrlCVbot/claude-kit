# ~/.claude 디렉토리 구성 인벤토리

> 작성일: 2026-04-10
> 대상 경로: `C:\Users\user\.claude\`

---

## 요약

### 출처별 분류

| 출처 | 수량 | 용량 | 설명 |
|------|------|------|------|
| ✍️ **직접 작성** | 63개 | ~1.2MB | 사용자가 직접 코드/문서를 작성 |
| 🔧 **Claude Forge 설치** | 12개 | ~116K | claude-forge 패키지에서 설치 |
| 🛒 **마켓플레이스 설치** | 9개 | ~480K | 커뮤니티 스킬/커맨드 설치 |
| ⚙️ **자동 생성** | 수백 개 | ~2.5MB+ | Claude Code가 세션 중 자동 관리 |

### 비율

```
직접 작성  ████████████████████████████████████░░░░░░░░░░░░  75% (63개)
Forge     ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  14% (12개)
마켓플레이스 █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  11% (9개)
```

---

## 1. ✍️ 직접 작성 (63개)

> 판별 근거: 한국어 주석/설명, 외부 소스 표시 없음, 커스텀 구현.

### 1.1 rules/ — 전역 응답 지침 (9개)

매 세션 시작 시 자동 로드되어 Claude의 행동을 규정하는 규칙.

| 파일 | 용량 | 역할 |
|------|------|------|
| `golden-principles.md` | 4.5K | 12가지 핵심 원칙 (SSOT 허브) |
| `verification.md` | 4.4K | 완료 전 검증 강제 |
| `interaction.md` | 2.7K | 가정 명시, 비유 설명, 결론 우선 |
| `git-workflow-v2.md` | 1.6K | 커밋 포맷, PR, 기능 구현 워크플로우 |
| `security.md` | 1.5K | 보안 체크리스트, 시크릿 관리 |
| `coding-style.md` | 1.3K | 코드 품질 체크리스트, 에러 처리 |
| `date-calculation.md` | 1.2K | 날짜 계산 시 시스템 도구 필수 |
| `agents-v2.md` | 980B | 에이전트 오케스트레이션 원칙 |
| `testing.md` | 947B | TDD, 80% 커버리지 필수 |

### 1.2 hooks/ — 자동화 훅 (15개)

세션 생명주기의 특정 시점에 자동 실행되는 셸 스크립트. 전부 한국어 주석, 커스텀 구현.

| 파일 | 트리거 | 역할 |
|------|--------|------|
| `remote-command-guard.sh` | PreToolUse(Bash) | 위험한 Bash 명령 차단 |
| `rate-limiter.sh` | PreToolUse(mcp__*) | 원격 세션에서 MCP 호출 속도 제한 |
| `mcp-usage-tracker.sh` | PreToolUse(mcp__*) | MCP 도구 호출 로그 기록 |
| `output-secret-filter.sh` | PostToolUse(*) | 도구 출력에서 시크릿 감지/마스킹 |
| `code-quality-reminder.sh` | PostToolUse(Edit/Write) | 편집 후 코드 품질 알림 |
| `security-auto-trigger.sh` | PostToolUse(Edit/Write) | 보안 관련 파일 변경 감지 |
| `context-sync-suggest.sh` | SessionStart | 마지막 세션 이후 /sync 제안 |
| `forge-update-check.sh` | SessionStart | Claude Forge 업데이트 확인 |
| `work-tracker-prompt.sh` | UserPromptSubmit | 프롬프트 이벤트 기록 |
| `work-tracker-tool.sh` | PostToolUse | 도구 사용 이벤트 기록 |
| `work-tracker-stop.sh` | Stop | 세션 종료 이벤트 기록 |
| `task-completed.sh` | TaskCompleted | 작업 완료 로그 |
| `session-wrap-suggest.sh` | Stop | 유의미한 진행 후 /session-wrap 제안 |
| `db-guard.sh` | PreToolUse(Bash) | 위험한 SQL 명령 차단 |
| `expensive-mcp-warning.sh` | PreToolUse | 비용 높은 MCP 호출 경고 |

### 1.3 skills/ — 재사용 스킬 모듈 (15개)

복잡한 워크플로우를 캡슐화한 스킬. SKILL.md + 참조 문서 + 스크립트. 한국어 frontmatter 기반.

| 스킬 | 역할 |
|------|------|
| `using-superpowers/` | 스킬 탐색/활성화 부트스트랩 |
| `verification-engine/` | 서브에이전트 기반 fresh-context 검증 루프 |
| `team-orchestrator/` | 에이전트 팀 오케스트레이션 엔진 |
| `session-wrap/` | 세션 종료 시 4개 병렬 에이전트로 정리 |
| `continuous-learning-v2/` | 세션 관찰 → 본능 생성 → 스킬 진화 |
| `security-pipeline/` | CWE Top 25 + STRIDE 보안 검증 |
| `eval-harness/` | 평가 주도 개발(EDD) 프레임워크 |
| `cc-dev-agent/` | Claude Code 개발 워크플로우 최적화 |
| `frontend-code-review/` | 프론트엔드 코드 리뷰 (.tsx/.ts/.js) |
| `build-system/` | 프로젝트 빌드 시스템 자동 감지/실행 |
| `prompts-chat/` | 스킬/프롬프트 탐색 및 검색 통합 |
| `strategic-compact/` | 논리적 구간에서 수동 컨텍스트 압축 제안 |
| `skill-factory/` | 반복 패턴을 스킬로 변환 |
| `manage-skills/` | 세션 변경 분석, 누락 검증 스킬 탐지 |
| `verify-implementation/` | 구현 검증 |

### 1.4 commands/ — 슬래시 커맨드 (32개)

`/커맨드명`으로 호출하는 실행 가능한 명령. 한국어 설명 기반.

#### 핵심 워크플로우
| 커맨드 | 역할 |
|--------|------|
| `plan.md` | AI 구현 계획 수립 → 사용자 승인 후 코딩 |
| `auto.md` | 원스톱 자동 워크플로우 (계획→구현→PR) |
| `tdd.md` | 테스트 우선 개발 (단위 작업당) |
| `commit-push-pr.md` | 커밋/푸시/PR 통합 |
| `quick-commit.md` | 간단한 수정용 빠른 커밋 |
| `verify-loop.md` | 검증 루프 |
| `handoff-verify.md` | 핸드오프 + 자동 검증 통합 |

#### 코드 품질
| 커맨드 | 역할 |
|--------|------|
| `code-review.md` | 보안+품질 검사 |
| `security-review.md` | 보안 리뷰 |
| `refactor-clean.md` | 데드 코드 제거 (테스트 검증 포함) |
| `test-coverage.md` | 테스트 커버리지 분석 |
| `build-fix.md` | TypeScript/빌드 에러 점진적 수정 |
| `e2e.md` | E2E 테스트 생성/실행 |

#### 탐색/동기화
| 커맨드 | 역할 |
|--------|------|
| `explore.md` | 반복 정제 코드베이스 탐색 |
| `sync.md` | Git pull + 문서 동기화 |
| `sync-docs.md` | CLAUDE.md + rules/ 문서 동기화 |
| `pull.md` | `git pull origin main` 빠른 실행 |

#### 프로젝트 관리
| 커맨드 | 역할 |
|--------|------|
| `init-project.md` | 프로젝트 초기화 |
| `checkpoint.md` | 작업 상태 저장/복원 |
| `next-task.md` | 다음 작업 추천 |
| `learn.md` | 교훈 기록 + 자동화 제안 |
| `suggest-automation.md` | 반복 패턴 분석 → 자동화 기회 제안 |
| `orchestrate.md` | 에이전트 팀 병렬 오케스트레이션 |
| `agent-router.md` | 34개 도메인 전문 에이전트 자동 라우팅 |

#### 기타
| 커맨드 | 역할 |
|--------|------|
| `eval.md` | 평가 주도 개발 워크플로우 |
| `show-setup.md` | Forge 설치 상태 표시 |
| `update-codemaps.md` | 코드맵 업데이트 |
| `update-docs.md` | 문서 업데이트 |
| `web-checklist.md` | 웹 테스트 체크리스트 |
| `worktree-cleanup.md` | PR 후 Git Worktree 정리 |
| `worktree-start.md` | 병렬 개발용 Worktree 시작 |

### 1.5 cc-chips/ — 커스텀 상태줄 UI (1개 프로젝트)

직접 만든 상태줄 UI 시스템. (github.com/roger-me/CC-CHIPS)

| 파일 | 역할 |
|------|------|
| `engine.sh` | 상태줄 렌더링 엔진 (Powerline 스타일, Nerd Font 아이콘) |
| `themes/claude.sh` | Claude 테마 |
| `themes/cool.sh` | Cool 테마 |
| `themes/cyber.sh` | Cyber 테마 |
| `themes/retro.sh` | Retro 테마 |

### 1.6 settings.json — 전역 설정 (1개)

| 설정 | 값 | 설명 |
|------|-----|------|
| `cleanupPeriodDays` | 14 | 세션 정리 주기 |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | "1" | 에이전트 팀 활성화 |
| `ENABLE_TOOL_SEARCH` | "auto:5" | 도구 자동 검색 (5개 결과) |
| `permissions.allow` | 41개 패턴 | 자동 승인 도구 목록 |
| `permissions.deny` | 57개 패턴 | 차단 도구 목록 |
| `effortLevel` | "high" | 응답 노력 수준 |
| `enabledPlugins` | codex@openai-codex | 활성화된 플러그인 |
| `statusLine` | cc-chips engine.sh | 커스텀 상태줄 엔진 |

---

## 2. 🔧 Claude Forge 설치 (12개)

> 판별 근거: 모든 파일에 `# Part of Claude Forge — github.com/sangrokjung/claude-forge` 표시.

### 2.1 agents/ — 전문 서브에이전트 (11개)

| 파일 | 도구 권한 | 역할 |
|------|----------|------|
| `planner.md` | Read, Grep, Glob | 기능/리팩토링 계획 수립 |
| `architect.md` | Read, Grep, Glob | 시스템 설계, 확장성 결정 |
| `tdd-guide.md` | Read, Write, Edit, Bash, Grep | TDD 강제 (80%+ 커버리지) |
| `code-reviewer.md` | Read, Grep, Glob, Bash | 코드 품질/보안/유지보수 리뷰 |
| `security-reviewer.md` | Read, Write, Edit, Bash, Grep, Glob | OWASP Top 10 취약점 탐지 |
| `build-error-resolver.md` | Read, Write, Edit, Bash, Grep, Glob | 빌드/TypeScript 에러 수정 |
| `database-reviewer.md` | Read, Write, Edit, Bash, Grep, Glob | PostgreSQL/Supabase 쿼리 최적화 |
| `e2e-runner.md` | Read, Write, Edit, Bash, Grep, Glob | E2E 테스트 실행 |
| `refactor-cleaner.md` | Read, Write, Edit, Bash, Grep, Glob | 데드 코드 정리 (knip, depcheck) |
| `doc-updater.md` | Read, Write, Edit, Bash, Grep, Glob | 문서/코드맵 업데이트 |
| `verify-agent.md` | Read, Write, Edit, Bash, Grep, Glob | 빌드/린트/테스트 파이프라인 검증 |

### 2.2 commands/ — Forge 커맨드 (1개)

| 커맨드 | 역할 |
|--------|------|
| `forge-update.md` | Claude Forge 자체 업데이트 |

---

## 3. 🛒 마켓플레이스 설치 (9개)

> 판별 근거: 영문 전용, 외부 작성자 표시 (Orchestra Research, steipete 등), 커뮤니티 스킬 구조.

### 3.1 commands/ 서브디렉토리 (8개)

| 커맨드 | 출처 | 역할 |
|--------|------|------|
| `debugging-strategies/` | 마켓플레이스 | 체계적 디버깅 기법 |
| `dependency-upgrade/` | 마켓플레이스 | 메이저 의존성 업그레이드 관리 |
| `evaluating-code-models/` | Orchestra Research | BigCode 평가 하네스 (HumanEval, MBPP) |
| `evaluating-llms-harness/` | Orchestra Research | LLM 60+ 벤치마크 평가 |
| `extract-errors/` | 마켓플레이스 | React 에러 메시지 추출 |
| `security-compliance/` | 마켓플레이스 | SOC2/ISO27001/GDPR 보안 컴플라이언스 |
| `stride-analysis-patterns/` | 마켓플레이스 | STRIDE 위협 모델링 |
| `summarize/` | steipete | URL/팟캐스트/파일 요약 |

### 3.2 skills/ (1개)

| 스킬 | 출처 | 역할 |
|------|------|------|
| `cache-components/` | 마켓플레이스 | Next.js 캐시 컴포넌트/PPR 가이드 |

---

## 4. ⚙️ 자동 생성 데이터 (Claude Code 관리)

세션 중 자동으로 생성/관리. 직접 편집 불필요.

| 디렉토리/파일 | 용량 | 설명 |
|-------------|------|------|
| `sessions/` | 가변 | 세션 대화 데이터 |
| `session-env/` | 가변 | 세션별 환경 스냅샷 (100+ UUID 디렉토리) |
| `projects/` | 가변 | 프로젝트별 세션 데이터 + 메모리 |
| `plans/` | 가변 | 계획 모드 파일 (세션별 생성) |
| `homunculus/observations.jsonl` | 1.4MB | 세션 관찰 로그 (도구 완료 이벤트) |
| `work-log/buffer.jsonl` | 1.1MB | 작업 활동 추적 (4,500+ 이벤트) |
| `work-log/.sessions/` | 가변 | 세션별 작업 로그 스냅샷 |
| `todos/` | ~1K | 작업 상태 스냅샷 (JSON) |
| `ide/` | ~1.4K | IDE 연결 잠금 파일 (Cursor) |
| `cache/` | 가변 | 캐시 파일 |
| `backups/` | 가변 | 자동 백업 |
| `file-history/` | 가변 | 파일 변경 이력 |
| `debug/` | 가변 | 디버그 로그 |
| `shell-snapshots/` | 가변 | 셸 상태 스냅샷 |
| `downloads/` | 가변 | 다운로드 파일 |
| `.credentials.json` | — | 인증 자격 증명 |
| `.update.lock` | — | 업데이트 잠금 |
| `history.jsonl` | — | 명령 이력 |
| `mcp-usage.log` | — | MCP 사용 로그 |

---

## 5. 플러그인 (별도 관리)

| 항목 | 출처 | 역할 |
|------|------|------|
| `plugins/blocklist.json` | ✍️ 직접 설정 | 차단 플러그인 목록 |
| `plugins/installed_plugins.json` | ⚙️ 자동 | 설치 플러그인 기록: `codex@openai-codex` v1.0.2 |
| `plugins/cache/openai-codex/` | ⚙️ 자동 | Codex 플러그인 캐시 |
| `plugins/marketplaces/openai-codex/` | ⚙️ 자동 | 마켓플레이스 미러 |

---

## 6. 전체 수량 요약

| 구분 | ✍️ 직접 | 🔧 Forge | 🛒 마켓 | 합계 |
|------|---------|---------|---------|------|
| rules/ | 9 | — | — | 9 |
| hooks/ | 15 | — | — | 15 |
| agents/ | — | 11 | — | 11 |
| skills/ | 15 | — | 1 | 16 |
| commands/ (루트) | 32 | 1 | — | 33 |
| commands/ (서브디렉토리) | — | — | 8 | 8 |
| cc-chips/ | 1 | — | — | 1 |
| settings.json | 1 | — | — | 1 |
| **합계** | **73** | **12** | **9** | **94** |
