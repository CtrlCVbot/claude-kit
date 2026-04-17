# 05a. 후보 컴포넌트 상세

> 의존 문서: [05-implementation-sequence.md](05-implementation-sequence.md)
> 33개 후보(+보완 1개)의 기능 설명, 현재 동작, claude-kit 적용 후 변화를 상세 기술.

---

## Phase 1A: Hooks → core/hooks/ (7개)

### 1. remote-command-guard

| 항목 | 내용 |
|------|------|
| 기능 | 원격 세션에서 위험한 Bash 명령 차단. 7개 카테고리: 파괴적 삭제(rm -rf), 환경변수/시크릿 유출(env, printenv), 경로 탐색(/etc/passwd), 외부 통신(curl, wget, nc), 권한 변경(chmod 777), 프로세스 종료(kill -9), 명령 인젝션(eval, exec) |
| 트리거 | PreToolUse(Bash), exit 0=허용 / exit 2=차단 |
| 현재 상태 | `~/.claude/hooks/remote-command-guard.sh` -- Bash 스크립트, `OPENCLAW_SESSION_ID` 환경변수로 원격 세션 감지, 로컬 세션은 건너뜀 |
| 적용 후 | `core/hooks/core-remote-command-guard.js` -- process.stdin JSON 파싱, process.env 기반 원격 감지, fs 없이 순수 입력 검증 |
| kit 중복 | 없음 (신규) |
| 의존성 | 없음 (standalone) |

### 2. rate-limiter

| 항목 | 내용 |
|------|------|
| 기능 | 원격 세션에서 도구 호출 속도 제한. 슬라이딩 윈도우: 30회/분, 500회/시, 5000회/일 |
| 트리거 | PreToolUse(모든 도구), exit 0=허용 / exit 2=차단 |
| 현재 상태 | `~/.claude/hooks/rate-limiter.sh` -- `~/.openclaw/sessions/rate-limits.json`에 호출 카운트 저장, `~/.claude/security.log`에 로깅 |
| 적용 후 | `core/hooks/core-rate-limiter.js` -- JSON 카운터를 `os.tmpdir()` 기반으로 표준화, 로그 경로 설정 가능하도록 env var 추가 |
| kit 중복 | 없음 (신규) |
| 의존성 | 없음 (standalone) |

### 3. mcp-usage-tracker

| 항목 | 내용 |
|------|------|
| 기능 | 모든 MCP 도구 호출을 `~/.claude/mcp-usage.log`에 타임스탬프와 함께 기록. 관찰성(observability) 확보 |
| 트리거 | PreToolUse(mcp__*), exit 0 (차단 안 함) |
| 현재 상태 | `~/.claude/hooks/mcp-usage-tracker.sh` -- python3로 stdin JSON 파싱 후 로그 파일에 append |
| 적용 후 | `core/hooks/core-mcp-usage-tracker.js` -- fs.appendFileSync 사용, python3 의존성 제거 |
| kit 중복 | 없음 (신규) |
| 의존성 | python3 (현재) -> 제거 예정 (Node.js 변환) |

### 4. context-sync-suggest

| 항목 | 내용 |
|------|------|
| 기능 | 마지막 세션 종료 후 24시간 이상 경과 시 `/sync` 커맨드 실행을 제안 |
| 트리거 | SessionStart, exit 0 (정보성) |
| 현재 상태 | `~/.claude/hooks/context-sync-suggest.sh` -- python3로 세션 메타데이터의 타임스탬프 비교 |
| 적용 후 | `core/hooks/core-context-sync-suggest.js` -- Date 비교로 변환, 경과 시간 임계값 환경변수 설정 가능 |
| kit 중복 | 없음 (신규) |
| 의존성 | python3 (현재) -> 제거 예정 |

### 5. work-tracker-prompt

| 항목 | 내용 |
|------|------|
| 기능 | 사용자 프롬프트 제출 이벤트를 `~/.claude/work-log/buffer.jsonl`에 기록. 세션 텔레메트리 수집 |
| 트리거 | UserPromptSubmit, exit 0 (차단 안 함) |
| 현재 상태 | `~/.claude/hooks/work-tracker-prompt.sh` -- python3 JSON 파싱, timestamp/session_id/hostname/prompt_type 기록 |
| 적용 후 | `core/hooks/core-work-tracker-prompt.js` -- buffer.jsonl 경로를 `WORK_LOG_DIR` 환경변수로 표준화 |
| kit 중복 | 없음 (신규). work-tracker 3종은 하나의 텔레메트리 스위트 |
| 의존성 | python3 (현재) -> 제거 예정, buffer.jsonl 공유 |

### 6. work-tracker-tool

| 항목 | 내용 |
|------|------|
| 기능 | 도구 실행 이벤트를 buffer.jsonl에 기록. 도구명, 파라미터, 실행 시간, exit 코드 포함 |
| 트리거 | PostToolUse, exit 0 |
| 현재 상태 | `~/.claude/hooks/work-tracker-tool.sh` -- 추적 대상 도구 서브셋만 필터링하여 기록 |
| 적용 후 | `core/hooks/core-work-tracker-tool.js` -- work-tracker-prompt와 동일한 포맷/경로 표준 적용 |
| kit 중복 | 없음 (신규) |
| 의존성 | python3 (현재) -> 제거 예정, buffer.jsonl 공유 |

### 7. work-tracker-stop

| 항목 | 내용 |
|------|------|
| 기능 | 세션 종료 시 최종 통계(총 도구 호출 수, 세션 시간) 기록 + 원격 동기화 트리거 |
| 트리거 | Stop, exit 0 |
| 현재 상태 | `~/.claude/hooks/work-tracker-stop.sh` -- buffer.jsonl에 종료 이벤트 기록 후 `work-tracker-sync.sh` 호출 |
| 적용 후 | `core/hooks/core-work-tracker-stop.js` -- 동기화 부분은 선택적(sync 스크립트 존재 시에만 호출) |
| kit 중복 | 없음 (신규) |
| 의존성 | python3, work-tracker-sync.sh (현재) -> Node.js 변환, sync는 선택적 |

---

## Phase 1B: Rules → core/rules/ (3개)

### 8. git-workflow-v2

| 항목 | 내용 |
|------|------|
| 기능 | Git 워크플로우 표준: Conventional Commits 포맷 (feat/fix/refactor 등), PR 생성 5단계, 기능 구현 4단계 (계획->TDD->리뷰->커밋), GitHub 조직 관리 |
| 트리거 | 세션 시작 시 자동 로드 (rules/) |
| 현재 상태 | `~/.claude/rules/git-workflow-v2.md` -- 한국어, golden-principles #3/#9 참조, 에이전트 비종속 |
| 적용 후 | `core/rules/git-workflow.md` -- v2 접미사 제거, pairing-registry.json에 등록 |
| kit 중복 | 없음 (core/rules/에 Git 규칙 부재) |
| 의존성 | golden-principles.md (크로스 참조) |

### 9. agents-v2

| 항목 | 내용 |
|------|------|
| 기능 | 에이전트 오케스트레이션 원칙: 병렬 실행 우선, 서브에이전트 vs 팀 비교표, 선택 기준, 에이전트 메모리 경로, 프로젝트별 정의 가이드 |
| 트리거 | 세션 시작 시 자동 로드 |
| 현재 상태 | `~/.claude/rules/agents-v2.md` -- 한국어, 조직 전용 콘텐츠 제거 완료 (이전 세션에서 개선됨) |
| 적용 후 | `core/rules/agent-orchestration.md` -- v2 접미사 제거, 파일명 역할 명확화 |
| kit 중복 | 없음 |
| 의존성 | 없음 (self-contained) |

### 10. testing

| 항목 | 내용 |
|------|------|
| 기능 | 테스트 요구사항: 80% 최소 커버리지, 3종 테스트 필수(단위/통합/E2E), TDD 워크플로우 참조, 실패 트러블슈팅 가이드 |
| 트리거 | paths: frontmatter (`**/*.test.*`, `**/*.spec.*`, `**/tests/**` 등)에 매칭되는 파일 편집 시 |
| 현재 상태 | `~/.claude/rules/testing.md` -- 한국어, golden-principles #3 + verification.md 참조 |
| 적용 후 | `core/rules/testing.md` -- paths: frontmatter 유지, 조건부 로드 |
| kit 중복 | 없음 (core/rules/에 테스트 규칙 부재) |
| 의존성 | golden-principles.md, verification.md (크로스 참조) |

---

## Phase 1C: Skills → core/skills/ (4개)

### 11. team-orchestrator

| 항목 | 내용 |
|------|------|
| 기능 | Agent Teams 오케스트레이션 엔진. 팀 구성(최대 4명), 작업 분배(5~6개/팀원), 파일 소유권 분리(덮어쓰기 방지), 의존성 관리(addBlockedBy), 결과 집계, 에러 복구(5분 타임아웃, 파일 충돌 감지) |
| 트리거 | `/orchestrate` 커맨드에서 호출, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 필수 |
| 현재 상태 | `~/.claude/skills/team-orchestrator/SKILL.md` v1.1.0 -- TeamCreate/TaskCreate/TaskUpdate/SendMessage 도구 사용 |
| 적용 후 | `core/skills/team-orchestrator/` -- 디렉토리 복사, core 도메인 (모든 프로젝트에서 팀 오케스트레이션 가능) |
| kit 중복 | 없음 (신규) |
| 의존성 | Agent Teams 실험 기능 활성화 필수 |

### 12. build-system

| 항목 | 내용 |
|------|------|
| 기능 | 10개 빌드 도구 자동 감지+실행: npm(package-lock.json), yarn(yarn.lock), pnpm(pnpm-lock.yaml), Poetry(pyproject.toml), pip(requirements.txt), Cargo(Cargo.toml), Go(go.mod), Gradle(build.gradle), Maven(pom.xml), Make(Makefile). --cmd/--filter 플래그 지원 |
| 트리거 | 빌드/테스트 실행 요청 시 |
| 현재 상태 | `~/.claude/skills/build-system/SKILL.md` v1.0.0 -- Bash 도구로 감지+실행 |
| 적용 후 | `core/skills/build-system/` -- core 도메인, 모든 프로젝트에서 빌드 시스템 자동 감지 |
| kit 중복 | 없음 (신규) |
| 의존성 | 없음 (감지 대상 도구가 설치 안 되면 건너뜀) |

### 13. using-superpowers

| 항목 | 내용 |
|------|------|
| 기능 | 스킬 사용 부트스트랩. 1% 확률이라도 관련 스킬이 있으면 반드시 Skill 도구를 호출하도록 강제. 합리화 방지 ("간단한 질문", "먼저 탐색" 등 8가지 금지 생각 패턴). 스킬 우선순위: 프로세스 -> 에이전트 라우팅 -> 구현 |
| 트리거 | 모든 대화 시작 시 자동 활성화 |
| 현재 상태 | `~/.claude/skills/using-superpowers/SKILL.md` -- 메타 스킬, Skill 도구 의존 |
| 적용 후 | `core/skills/using-superpowers/` -- core 도메인, 모든 세션에서 스킬 발견 가이드 |
| kit 중복 | 없음 (신규) |
| 의존성 | Skill 도구 |

### 14. strategic-compact

| 항목 | 내용 |
|------|------|
| 기능 | 논리적 작업 구간 전환 시 `/compact` 제안. 50회 도구 호출 임계값(COMPACT_THRESHOLD 환경변수), 이후 25회마다 반복 제안. 계획 후/디버깅 후 압축 권장, 구현 중 압축 비권장 |
| 트리거 | PreToolUse(Edit/Write) |
| 현재 상태 | `~/.claude/skills/strategic-compact/SKILL.md` v1.0.0 -- settings.json에 훅 설정 필요 |
| 적용 후 | `core/skills/strategic-compact/` -- core 도메인, 훅 설정 자동 포함 |
| kit 중복 | 없음 (신규) |
| 의존성 | settings.json 훅 설정 |

---

## Phase 2A: Commands → dev/commands/ -- 신규 (10개)

### 15. pull

| 항목 | 내용 |
|------|------|
| 기능 | `git pull origin main` 빠른 실행. 미커밋 변경 사항 사전 확인 |
| 트리거 | `/pull` 커맨드 |
| 현재 상태 | `~/.claude/commands/pull.md` -- Bash(git:*) 도구 사용 |
| 적용 후 | `dev/commands/dev-pull.md` -- dev- 접두사, frontmatter 통일 |
| kit 중복 | 없음 (신규) |
| 의존성 | Git 저장소 |

### 16. update-docs

| 항목 | 내용 |
|------|------|
| 기능 | package.json scripts + .env.example을 읽어 docs/CONTRIB.md + docs/RUNBOOK.md 자동 생성. 개발 워크플로우, 환경 설정, 배포 절차 문서화 |
| 트리거 | `/update-docs` 커맨드 |
| 현재 상태 | `~/.claude/commands/update-docs.md` -- 소스 파일에서 문서 생성 |
| 적용 후 | `dev/commands/dev-update-docs.md` -- dev- 접두사 |
| kit 중복 | 없음 (신규). kit의 dev-doc-updater 에이전트와는 역할 분리 (에이전트=범용 문서, 커맨드=CONTRIB/RUNBOOK 특화) |
| 의존성 | package.json, .env.example |

### 17. update-codemaps

| 항목 | 내용 |
|------|------|
| 기능 | import/export 의존성 스캔 -> architecture.md, backend.md, frontend.md, data.md 생성. diff 30%+ 시 사용자 승인 요청. freshness 타임스탬프 + .reports/codemap-diff.txt 저장 |
| 트리거 | `/update-codemaps` 커맨드 |
| 현재 상태 | `~/.claude/commands/update-codemaps.md` |
| 적용 후 | `dev/commands/dev-update-codemaps.md` -- dev- 접두사 |
| kit 중복 | 없음 (신규) |
| 의존성 | 코드베이스 구조 |

### 18. worktree-start

| 항목 | 내용 |
|------|------|
| 기능 | Git Worktree 생성으로 병렬 개발 지원. `--type feature|bugfix|refactor` 플래그로 도메인별 템플릿 적용 |
| 트리거 | `/worktree-start [브랜치명] [--type ...]` |
| 현재 상태 | `~/.claude/commands/worktree-start.md` v6 -- Bash(git:*), Read, Grep |
| 적용 후 | `dev/commands/dev-worktree-start.md` -- dev- 접두사 |
| kit 중복 | 없음 (신규) |
| 의존성 | Git 저장소 |

### 19. worktree-cleanup

| 항목 | 내용 |
|------|------|
| 기능 | PR 완료 후 Git Worktree 정리. 브랜치명 인자 (기본값=현재 worktree) |
| 트리거 | `/worktree-cleanup [브랜치명]` |
| 현재 상태 | `~/.claude/commands/worktree-cleanup.md` v6 |
| 적용 후 | `dev/commands/dev-worktree-cleanup.md` -- dev- 접두사 |
| kit 중복 | 없음 (신규) |
| 의존성 | Git 저장소, worktree 존재 |

### 20. orchestrate

| 항목 | 내용 |
|------|------|
| 기능 | Agent Teams 기반 병렬 오케스트레이션. `--type feature|bugfix|refactor|review`, `--parallel N`, `--dry-run` 플래그. team-orchestrator 스킬을 내부 호출 |
| 트리거 | `/orchestrate [--type ...] [--parallel N] [--dry-run]` |
| 현재 상태 | `~/.claude/commands/orchestrate.md` v6 -- TeamCreate, TaskCreate, SendMessage 등 사용 |
| 적용 후 | `dev/commands/dev-orchestrate.md` -- Agent Teams API 참조 표준화 |
| kit 중복 | 없음 (신규). team-orchestrator 스킬과 쌍으로 이동 |
| 의존성 | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, team-orchestrator 스킬 |

### 21. init-project

| 항목 | 내용 |
|------|------|
| 기능 | 프로젝트 초기화: CLAUDE.md, spec.md, prompt_plan.md 인터랙티브 생성. `--type next|vite|go|python|rust`로 프로젝트 유형 지정 |
| 트리거 | `/init-project [프로젝트명] [--type ...]` |
| 현재 상태 | `~/.claude/commands/init-project.md` v6 -- package.json/go.mod/Cargo.toml 등으로 유형 감지 |
| 적용 후 | `dev/commands/dev-init-project.md` -- 언어별 템플릿 정리, dev- 접두사 |
| kit 중복 | 없음 (신규) |
| 의존성 | 없음 |

### 22. next-task

| 항목 | 내용 |
|------|------|
| 기능 | Git 상태(브랜치, 최근 커밋, 스테이지 파일) + 문서(prompt_plan.md, spec.md) 분석 -> 다음 작업 추천 |
| 트리거 | `/next-task [--from-plan]` |
| 현재 상태 | `~/.claude/commands/next-task.md` v6 -- Read, Grep, Glob |
| 적용 후 | `dev/commands/dev-next-task.md` -- 작업 큐 패턴 표준화 |
| kit 중복 | 없음 (신규) |
| 의존성 | Git 저장소, prompt_plan.md (선택적) |

### 23. agent-router

| 항목 | 내용 |
|------|------|
| 기능 | 34개 도메인 전문 에이전트 자동 라우팅 (법률, 재무, 특허, SEO, 마케팅, 코드리뷰, 아키텍처 등). 재귀 호출 방지, 사용자 오버라이드 존중 |
| 트리거 | 자동 호출 (서브에이전트 컨텍스트에서는 건너뜀) |
| 현재 상태 | `~/.claude/commands/agent-router.md` -- Agent 도구로 전문 에이전트 생성 |
| 적용 후 | `dev/commands/dev-agent-router.md` -- 34개 에이전트 목록은 프로젝트 레벨로 분리, 라우팅 로직만 kit에 포함 |
| kit 중복 | 없음 (신규) |
| 의존성 | Agent 도구, 에이전트 정의 파일 |

### 24. guide

| 항목 | 내용 |
|------|------|
| 기능 | 첫 사용자 인터랙티브 가이드 (~3분). 환경 진단(프로젝트 폴더, CLAUDE.md, Git 초기화, 온보딩 마커 파일) |
| 트리거 | `/guide` 커맨드 |
| 현재 상태 | `~/.claude/commands/guide.md` -- Read, Glob, Grep, Bash(git:*) |
| 적용 후 | `dev/commands/dev-guide.md` -- 프로젝트 독립적 가이드로 재작성 |
| kit 중복 | 없음 (신규) |
| 의존성 | 없음 |

---

## Phase 2A: Commands → dev/commands/ -- 보완 (3개)

### 25. quick-commit

| 항목 | 내용 |
|------|------|
| 기능 | 간편 커밋. 커밋 메시지를 필수 인자로 받아 확인 최소화된 빠른 커밋 |
| 트리거 | `/quick-commit "커밋 메시지"` |
| 현재 상태 | `~/.claude/commands/quick-commit.md` v6 -- Bash(git:*), Read, Grep |
| 적용 후 | `dev/commands/dev-quick-commit.md` -- dev-commit.md의 간편 모드로 추가하거나 별도 커맨드 |
| kit 중복 | **보완**: kit의 `dev/commands/dev-commit.md` -- 사용자 버전은 확인 단계 최소화가 차별점 |
| 의존성 | Git 저장소 |

### 26. verify-loop

| 항목 | 내용 |
|------|------|
| 기능 | 자동 재검증 루프: 최대 3회 재시도(--max-retries N), 실패 시 자동 수정 시도. --only build\|test\|lint으로 범위 제한 가능 |
| 트리거 | `/verify-loop [의도 설명] [--max-retries N] [--only ...]` |
| 현재 상태 | `~/.claude/commands/verify-loop.md` -- npm/npx/python/go/cargo/make 다중 언어 지원 |
| 적용 후 | dev-verify-all.md에 재시도 로직 병합 또는 `dev/commands/dev-verify-loop.md` 별도 |
| kit 중복 | **보완**: kit의 `dev/commands/dev-verify-all.md` -- 사용자 버전은 자동 재시도+자동 수정이 차별점 |
| 의존성 | 프로젝트 빌드/테스트 도구 |

### 27. tdd

| 항목 | 내용 |
|------|------|
| 기능 | tdd-guide 에이전트 호출 TDD 워크플로우: 인터페이스 스캐폴딩 -> 실패 테스트(RED) -> 최소 구현(GREEN) -> 리팩토링 -> 80%+ 커버리지 확인 |
| 트리거 | `/tdd` 커맨드 |
| 현재 상태 | `~/.claude/commands/tdd.md` -- Agent 위임, 3+ 파일 예상 시 `/plan` 먼저 실행 권장 |
| 적용 후 | dev-test-verify.md에 단위 TDD 모드 추가 또는 `dev/commands/dev-tdd.md` 별도 |
| kit 중복 | **보완**: kit의 `dev/commands/dev-test-verify.md` -- 사용자 버전은 tdd-guide 에이전트 활용이 차별점 |
| 의존성 | tdd-guide 에이전트 |

---

## Phase 2B: Skills + Command (3개)

### 28. eval-harness

| 항목 | 내용 |
|------|------|
| 기능 | 평가 주도 개발(EDD) 프레임워크. "AI 개발의 단위 테스트"로서 구현 전 기대 동작 정의, 지속적 평가 실행, 회귀 추적, pass@k 메트릭으로 신뢰성 측정 |
| 트리거 | `/eval` 커맨드에서 호출 |
| 현재 상태 | `~/.claude/skills/eval-harness/SKILL.md` -- Read, Write, Edit, Bash, Grep, Glob |
| 적용 후 | `dev/skills/dev-eval-harness/` -- EDD 프레임워크 표준화, dev 도메인 |
| kit 중복 | 없음 (신규) |
| 의존성 | 파일 시스템 (테스트/평가 관리) |

### 29. skill-factory

| 항목 | 내용 |
|------|------|
| 기능 | 세션 작업 패턴 분석 -> 재사용 가능한 스킬 자동 생성. 세션 분석 -> 중복 검사 -> 스킬 생성 파이프라인. --dry-run, --no-team, --scope global\|project 지원 |
| 트리거 | `/skill-factory` 또는 "스킬 만들어", "make this a skill" 등 키워드 |
| 현재 상태 | `~/.claude/skills/skill-factory/SKILL.md` -- Python 3.8+, bash, git 의존, Agent Teams 선택적 |
| 적용 후 | `core/skills/skill-factory/` -- 스킬 생성 파이프라인 정리, core 도메인 |
| kit 중복 | 없음 (신규). manage-skills(drift 감지)와 역할 분리: skill-factory=생성, manage-skills=유지보수 |
| 의존성 | Python 3.8+, bash, git |

### 30. suggest-automation (command)

| 항목 | 내용 |
|------|------|
| 기능 | 최근 50개 커밋(기본값) 분석 -> 반복 패턴 탐지 -> 자동화 기회 제안. git log --oneline + --name-status 데이터 수집 |
| 트리거 | `/suggest-automation [분석할 커밋 수]` |
| 현재 상태 | `~/.claude/commands/suggest-automation.md` -- Read, Grep, Glob, Bash(git:*) |
| 적용 후 | `dev/commands/dev-suggest-automation.md` -- dev- 접두사, frontmatter 통일 |
| kit 중복 | 없음 (신규) |
| 의존성 | Git 저장소 (커밋 이력 필요) |

---

## Phase 3: 메타 도구 (4개)

### 31. task-completed (hook)

| 항목 | 내용 |
|------|------|
| 기능 | 작업 완료 이벤트 로깅. JSON stdin 파싱으로 작업 ID, 완료 상태 기록. exit 0=승인, exit 2=차단(stderr 피드백) |
| 트리거 | TaskCompleted 이벤트 |
| 현재 상태 | `~/.claude/hooks/task-completed.sh` -- python3 JSON 파싱 |
| 적용 후 | `core/hooks/core-task-completed.js` -- .sh->.js 변환 |
| kit 중복 | 없음 (신규) |
| 의존성 | python3 (현재) -> 제거 예정 |

### 32. manage-skills (skill)

| 항목 | 내용 |
|------|------|
| 기능 | 세션 기반 스킬 유지보수: drift 감지 (커버리지 갭, 무효 참조, 누락 검사, 오래된 설정값). 스킬 레지스트리 분석 |
| 트리거 | 스킬 관리 요청 시 |
| 현재 상태 | `~/.claude/skills/manage-skills/SKILL.md` -- disable-model-invocation: true (Python 백엔드) |
| 적용 후 | `core/skills/manage-skills/` -- claude-kit 구조에 맞게 재설계 필요 (Tier 3) |
| kit 중복 | 없음 (신규). skill-factory(생성)와 역할 분리: manage-skills=유지보수 |
| 의존성 | 글로벌/프로젝트 스킬 레지스트리 |

### 33. auto (command 보완)

| 항목 | 내용 |
|------|------|
| 기능 | 원스톱 자동 워크플로우: 계획->구현->PR을 중단 없이 실행 (CRITICAL 보안 이슈 제외). --mode feature\|bugfix\|refactor |
| 트리거 | `/auto [작업 설명] [--mode ...]` |
| 현재 상태 | `~/.claude/commands/auto.md` -- git/npm/pnpm/go/cargo/make/python 전체 개발 환경 사용 |
| 적용 후 | kit의 `dev/commands/dev-run.md`에 `--auto` 모드로 병합. 기존 dev-run 실행 흐름에 원스톱 파이프라인 추가 |
| kit 중복 | **보완**: kit의 `dev/commands/dev-run.md` -- 사용자 버전은 계획->구현->PR 원스톱이 차별점, kit은 Feature Package 단위 실행 |
| 의존성 | 전체 개발 환경 |

### 34. security-review (command 보완)

| 항목 | 내용 |
|------|------|
| 기능 | CWE Top 25 + STRIDE 위협 모델링 통합 보안 리뷰. --auto(자동 수정), --cwe, --stride, --deps(의존성 스캔), --report markdown\|json. effort:max 강제 |
| 트리거 | `/security-review [파일/디렉토리] [--auto] [--cwe] [--stride] [--deps] [--report ...]` |
| 현재 상태 | `~/.claude/commands/security-review.md` v6 -- npm/npx/pip/cargo/grep/git 사용, Node.js 중심 |
| 적용 후 | kit의 `dev/commands/dev-security-review.md`에 CWE+STRIDE 패턴 병합. 사용자 버전의 --cwe/--stride 플래그를 kit에 추가 |
| kit 중복 | **보완**: kit의 `dev/commands/dev-security-review.md` -- 사용자 버전은 CWE+STRIDE 통합 + --deps 의존성 스캔이 차별점 |
| 의존성 | npm/npx/pip/cargo (프로젝트별) |
