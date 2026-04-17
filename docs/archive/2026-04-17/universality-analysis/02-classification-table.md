# 02. 전역형 vs 프로젝트용 분류표

> 의존 문서: [01-score-table.md](01-score-table.md), [03-component-mapping.md](03-component-mapping.md)
> 범용성 스코어 기반으로 73개 파일의 권장 위치와 로딩 전략을 분류.

## 분류 기준

| 스코어 | 분류 | 위치 | 로딩 전략 |
|--------|------|------|----------|
| ★4~5 | 전역형 | ~/.claude/ | 항상 로드 |
| ★3 | 조건부 | ~/.claude/ + paths: frontmatter | 매칭 시에만 로드 |
| ★1~2 | 프로젝트용 | 프로젝트 .claude/ | 해당 프로젝트에서만 |

---

## 1. 전역형 — ~/.claude/ 유지 (★4~5)

### rules/ (9개 중 전역 9개)

| 파일 | ★ | 로딩 | 현재 | 권장 | 변경 |
|------|---|------|------|------|------|
| golden-principles.md | 5 | 항상 | ~/.claude/rules/ | 유지 | 없음 |
| verification.md | 5 | 항상 | ~/.claude/rules/ | 유지 | 없음 |
| interaction.md | 5 | 항상 | ~/.claude/rules/ | 유지 | 없음 |
| git-workflow-v2.md | 5 | 항상 | ~/.claude/rules/ | 유지 | 없음 |
| security.md | 5 | 항상 | ~/.claude/rules/ | 유지 | 없음 |
| coding-style.md | 5 | 항상 | ~/.claude/rules/ | 유지 | 없음 |
| date-calculation.md | 5 | 항상 | ~/.claude/rules/ | 유지 | 없음 |
| agents-v2.md | 5 | 항상 | ~/.claude/rules/ | 유지 | 없음 |
| testing.md | 4 | 조건부 | ~/.claude/rules/ | 유지 | paths: 이미 있음 |

### hooks/ (15개 중 전역 12개)

| 파일 | ★ | 트리거 | 현재 | 권장 | 변경 |
|------|---|--------|------|------|------|
| remote-command-guard.sh | 5 | PreToolUse(Bash) | ~/.claude/hooks/ | 유지 | 없음 |
| rate-limiter.sh | 5 | PreToolUse(mcp__*) | ~/.claude/hooks/ | 유지 | 없음 |
| mcp-usage-tracker.sh | 5 | PreToolUse(mcp__*) | ~/.claude/hooks/ | 유지 | 없음 |
| output-secret-filter.sh | 5 | PostToolUse(*) | ~/.claude/hooks/ | 유지 | 없음 |
| code-quality-reminder.sh | 5 | PostToolUse(Edit/Write) | ~/.claude/hooks/ | 유지 | 없음 |
| security-auto-trigger.sh | 5 | PostToolUse(Edit/Write) | ~/.claude/hooks/ | 유지 | 없음 |
| context-sync-suggest.sh | 4 | SessionStart | ~/.claude/hooks/ | 유지 | 없음 |
| work-tracker-prompt.sh | 4 | UserPromptSubmit | ~/.claude/hooks/ | 유지 | 없음 |
| work-tracker-tool.sh | 4 | PostToolUse | ~/.claude/hooks/ | 유지 | 없음 |
| work-tracker-stop.sh | 4 | Stop | ~/.claude/hooks/ | 유지 | 없음 |
| task-completed.sh | 4 | TaskCompleted | ~/.claude/hooks/ | 유지 | 없음 |
| session-wrap-suggest.sh | 4 | Stop | ~/.claude/hooks/ | 유지 | 없음 |

### skills/ (15개 중 전역 12개)

| 스킬 | ★ | 트리거 조건 | 현재 | 권장 | 변경 |
|------|---|-----------|------|------|------|
| team-orchestrator/ | 5 | Agent Teams 요청 | ~/.claude/skills/ | 유지 | 없음 |
| build-system/ | 5 | 빌드 감지/실행 | ~/.claude/skills/ | 유지 | 없음 |
| using-superpowers/ | 5 | 세션 시작 | ~/.claude/skills/ | 유지 | 없음 |
| continuous-learning-v2/ | 5 | 세션 관찰 자동 | ~/.claude/skills/ | 유지 | 없음 |
| session-wrap/ | 5 | /session-wrap | ~/.claude/skills/ | 유지 | 없음 |
| verification-engine/ | 5 | 검증 루프 | ~/.claude/skills/ | 유지 | 없음 |
| strategic-compact/ | 5 | 컨텍스트 구간 전환 | ~/.claude/skills/ | 유지 | 없음 |
| eval-harness/ | 4 | /eval | ~/.claude/skills/ | 유지 | 없음 |
| skill-factory/ | 4 | 반복 패턴 감지 | ~/.claude/skills/ | 유지 | 없음 |
| manage-skills/ | 4 | 스킬 관리 요청 | ~/.claude/skills/ | 유지 | 없음 |
| verify-implementation/ | 4 | 구현 검증 요청 | ~/.claude/skills/ | 유지 | 없음 |
| cc-dev-agent/ | 4 | CC 프로젝트 워크플로우 | ~/.claude/skills/ | 유지 | 없음 |

### commands/ (32개 중 전역 28개)

| 커맨드 | ★ | 카테고리 | 현재 | 권장 | 변경 |
|--------|---|---------|------|------|------|
| plan.md | 5 | 핵심 워크플로우 | ~/.claude/commands/ | 유지 | 없음 |
| auto.md | 4 | 핵심 워크플로우 | ~/.claude/commands/ | 유지 | 없음 |
| commit-push-pr.md | 5 | 핵심 워크플로우 | ~/.claude/commands/ | 유지 | 없음 |
| quick-commit.md | 5 | 핵심 워크플로우 | ~/.claude/commands/ | 유지 | 없음 |
| verify-loop.md | 4 | 핵심 워크플로우 | ~/.claude/commands/ | 유지 | 없음 |
| handoff-verify.md | 5 | 핵심 워크플로우 | ~/.claude/commands/ | 유지 | 없음 |
| tdd.md | 4 | 핵심 워크플로우 | ~/.claude/commands/ | 유지 | 없음 |
| code-review.md | 5 | 코드 품질 | ~/.claude/commands/ | 유지 | 없음 |
| refactor-clean.md | 5 | 코드 품질 | ~/.claude/commands/ | 유지 | 없음 |
| explore.md | 5 | 탐색/동기화 | ~/.claude/commands/ | 유지 | 없음 |
| sync.md | 5 | 탐색/동기화 | ~/.claude/commands/ | 유지 | 없음 |
| sync-docs.md | 5 | 탐색/동기화 | ~/.claude/commands/ | 유지 | 없음 |
| pull.md | 5 | 탐색/동기화 | ~/.claude/commands/ | 유지 | 없음 |
| update-docs.md | 5 | 문서/코드맵 | ~/.claude/commands/ | 유지 | 없음 |
| update-codemaps.md | 5 | 문서/코드맵 | ~/.claude/commands/ | 유지 | 없음 |
| worktree-start.md | 5 | 병렬 개발 | ~/.claude/commands/ | 유지 | 없음 |
| worktree-cleanup.md | 5 | 병렬 개발 | ~/.claude/commands/ | 유지 | 없음 |
| checkpoint.md | 5 | 프로젝트 관리 | ~/.claude/commands/ | 유지 | 없음 |
| learn.md | 5 | 프로젝트 관리 | ~/.claude/commands/ | 유지 | 없음 |
| init-project.md | 4 | 프로젝트 관리 | ~/.claude/commands/ | 유지 | 없음 |
| next-task.md | 4 | 프로젝트 관리 | ~/.claude/commands/ | 유지 | 없음 |
| orchestrate.md | 4 | 프로젝트 관리 | ~/.claude/commands/ | 유지 | 없음 |
| agent-router.md | 4 | 프로젝트 관리 | ~/.claude/commands/ | 유지 | 없음 |
| suggest-automation.md | 4 | 프로젝트 관리 | ~/.claude/commands/ | 유지 | 없음 |
| guide.md | 4 | 기타 | ~/.claude/commands/ | 유지 | 없음 |
| eval.md | 4 | 기타 | ~/.claude/commands/ | 유지 | 없음 |
| web-checklist.md | 4 | 기타 | ~/.claude/commands/ | 유지 | 없음 |
| show-setup.md | 4 | 기타 | ~/.claude/commands/ | 유지 | 없음 |

### 기타

| 항목 | ★ | 분류 | 권장 |
|------|---|------|------|
| settings.json | 4 | 전역 | 유지 (개인 설정은 분리 권장) |

---

## 2. 조건부 — paths: frontmatter 활용 (★3)

| 파일 | ★ | 유형 | 조건 (paths:) | 매칭 대상 |
|------|---|------|-------------|----------|
| expensive-mcp-warning.sh | 3 | hook | MCP 서버 연결 시 | mcp__* 도구 호출 |
| prompts-chat/ | 3 | skill | prompts.chat MCP 연결 시 | MCP 설정 |
| security-pipeline/ | 3 | skill | **/*.ts, **/*.js, **/package.json | Node.js 프로젝트 |
| frontend-code-review/ | 3 | skill | **/*.tsx, **/*.jsx | React 프로젝트 |
| security-review.md | 3 | cmd | **/package.json, **/requirements.txt | 웹 프로젝트 |
| build-fix.md | 3 | cmd | **/*.ts, **/tsconfig.json | TypeScript 프로젝트 |
| e2e.md | 3 | cmd | **/playwright.config.* | Playwright 프로젝트 |
| test-coverage.md | 3 | cmd | **/package.json, **/jest.config.* | JS/TS 프로젝트 |
| cc-chips/ | 3 | 프로젝트 | -- | CC-CHIPS 프로젝트에서만 |

---

## 3. 프로젝트용 — 프로젝트 .claude/로 이동 (★1~2)

| 파일 | ★ | 유형 | 이유 | 권장 위치 |
|------|---|------|------|----------|
| forge-update-check.sh | 2 | hook | Forge 설치 프로젝트 전용 | Forge 프로젝트 .claude/hooks/ |
| db-guard.sh | 2 | hook | Supabase MCP 종속 | Supabase 프로젝트 .claude/hooks/ |

> ※ forge-update.md는 Forge 설치 파일이므로 분석 범위(73개)에서 제외.

---

## 4. 요약

| 분류 | 수량 | 비율 |
|------|------|------|
| 전역형 (★4~5) | 62 | 85% |
| 조건부 (★3) | 9 | 12% |
| 프로젝트용 (★1~2) | 2 | 3% |
| **합계** | **73** | **100%** |

### 전역형 내역

| 유형 | 전역 수량 | 전체 수량 | 비율 |
|------|----------|----------|------|
| rules | 9 | 9 | 100% |
| hooks | 12 | 15 | 80% |
| skills | 12 | 15 | 80% |
| commands | 28 | 32 | 88% |
| 기타 (settings.json) | -- | 1 | -- |

### 조건부 내역

| 유형 | 조건부 수량 | 주요 조건 패턴 |
|------|-----------|--------------|
| hook | 1 | MCP 연결 |
| skill | 2 | 프레임워크 의존 (Node.js, React) |
| cmd | 4 | 프레임워크/도구 의존 (TS, Playwright, Jest) |
| 프로젝트 | 1 | CC-CHIPS 전용 |
| MCP skill | 1 | prompts.chat MCP 연결 |

### 프로젝트용 내역

| 유형 | 프로젝트용 수량 | 종속 대상 |
|------|---------------|----------|
| hook | 2 | Forge, Supabase |
