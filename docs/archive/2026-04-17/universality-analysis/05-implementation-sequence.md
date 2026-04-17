# 05. 구현 순서 계획

> 의존 문서: [04-candidate-list.md](04-candidate-list.md)
> 각 후보의 상세 설명: [05a-component-detail.md](05a-component-detail.md)
> Tier 1~2 후보를 claude-kit에 적용하는 단계별 실행 계획.

## 전체 로드맵

| Phase | 범위 | 예상 후보 수 | 핵심 작업 |
|-------|------|-------------|----------|
| 1 | Core 인프라 | ~10개 | 훅(.sh→.js) + 규칙 |
| 2 | Dev 워크플로우 | ~12개 | 커맨드 + 스킬 |
| 3 | 메타 도구 | ~6개 | 오케스트레이션, 자동화 |
| 4 | 정리 | — | 중복 제거, 템플릿 분리 |

## Phase 1: Core 인프라

### 1A. hooks → core/hooks/ (.sh → .js 변환)

대상 (7개):
1. remote-command-guard.sh → core-remote-command-guard.js
2. rate-limiter.sh → core-rate-limiter.js
3. mcp-usage-tracker.sh → core-mcp-usage-tracker.js
4. context-sync-suggest.sh → core-context-sync-suggest.js
5. work-tracker-prompt.sh → core-work-tracker-prompt.js
6. work-tracker-tool.sh → core-work-tracker-tool.js
7. work-tracker-stop.sh → core-work-tracker-stop.js

변환 패턴:
- Bash의 `python3 -c` JSON 파싱 → Node.js `process.stdin` JSON 파싱
- 환경변수 접근: `$VAR` → `process.env.VAR`
- 파일 I/O: bash 리다이렉션 → `fs.appendFileSync`
- 종료 코드: `exit 0` → `process.exit(0)`
- 참조 템플릿: src/claude/core/hooks/code-quality-reminder.js

검증:
- 각 훅이 올바른 트리거(PreToolUse/PostToolUse/Stop)에서 실행 확인
- exit 0 보장 (훅은 절대 차단하지 않음)
- JSON stdin 파싱 정상 동작 확인

### 1B. rules → core/rules/

대상 (3개):
1. git-workflow-v2.md → core/rules/git-workflow.md
2. agents-v2.md → core/rules/agent-orchestration.md
3. testing.md → core/rules/testing.md (paths: frontmatter 유지)

작업:
- 파일 복사 + 이름 표준화 (v2 접미사 제거)
- pairing-registry.json 업데이트

### 1C. skills → core/skills/

대상 (4개):
1. team-orchestrator/ → core/skills/team-orchestrator/
2. build-system/ → core/skills/build-system/
3. using-superpowers/ → core/skills/using-superpowers/
4. strategic-compact/ → core/skills/strategic-compact/

## Phase 2: Dev 워크플로우

### 2A. commands → dev/commands/

대상 (10개 + 보완 3개):
- 신규: dev-pull, dev-update-docs, dev-update-codemaps, dev-worktree-start, dev-worktree-cleanup, dev-orchestrate, dev-init-project, dev-next-task, dev-agent-router, dev-guide
- 보완: dev-quick-commit, dev-verify-loop (기존에 병합), dev-tdd (기존에 병합)

변환 패턴 (커맨드 포맷 통일):
- 파일명: `{name}.md` → `dev-{name}.md` (dev- 접두사)
- frontmatter 추가 (없는 경우):
  ```yaml
  ---
  description: "커맨드 한 줄 설명"
  allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
  ---
  ```
- 한국어 설명 첫 줄 유지, 참조 경로를 claude-kit 구조로 변경
- 참조 템플릿: `src/claude/dev/commands/dev-explore.md`

검증:
- `/dev-{name}` 으로 호출 가능 확인
- frontmatter 파싱 정상 동작 확인
- 기존 커맨드와 이름 충돌 없음 확인 (`grep -r "dev-{name}" src/claude/`)

### 2B. skills → dev/skills/

대상 (3개):
1. eval-harness/ → dev/skills/dev-eval-harness/
2. skill-factory/ → core/skills/skill-factory/
3. suggest-automation/ → dev/commands/ (커맨드로 유지)

변환 패턴 (스킬 포맷 통일):
- 디렉토리명: `{name}/` → `dev-{name}/` (dev 도메인) 또는 원본 유지 (core 도메인)
- SKILL.md frontmatter 필수 필드 확인:
  ```yaml
  ---
  description: "스킬 한 줄 설명"
  trigger: "활성화 조건"
  tools: [사용 도구 목록]
  ---
  ```
- references/ 서브디렉토리가 있으면 함께 복사
- 참조 템플릿: `src/claude/dev/skills/dev-verification-engine/SKILL.md`

## Phase 3: 메타 도구

대상 (Tier 2 잔여 + Tier 3 일부):
- task-completed.sh → core/hooks/
- manage-skills → core/skills/ (재설계 후)
- auto.md → dev-run에 병합
- security-review → dev-security-review에 CWE+STRIDE 병합

변환 패턴 (보완 병합):
- 기존 claude-kit 파일을 기준으로, 사용자 파일의 차별 로직만 추출
- diff 기반: `diff user-file kit-file` → 추가된 섹션만 병합
- 병합 후 양쪽 테스트 시나리오 모두 동작 확인
- 참조: auto.md의 "원스톱 파이프라인"을 dev-run.md의 기존 실행 흐름에 추가 모드로 통합

검증:
- 병합 후 기존 `/dev-run` 동작이 깨지지 않음 확인
- 새 모드 (`--auto` 플래그 등) 동작 확인
- 보완 5개 각각에 대해 before/after 비교

## Phase 4: 정리

### 4A. ~/.claude/ 중복 제거
- 중복 27개 중 claude-kit 설치 시 자동 배포되는 파일은 ~/.claude/에서 제거
- 단, claude-kit 미설치 환경을 위한 폴백 유지 여부 결정

### 4B. settings.json 분리
```json
// 전역 템플릿 (claude-kit 배포)
{
  "permissions": { "allow": ["..."], "deny": ["..."] },
  "hooks": { "..." : "..." }
}

// 개인 설정 (사용자 유지)
{
  "cleanupPeriodDays": 14,
  "effortLevel": "high",
  "statusLine": { "..." : "..." },
  "enabledPlugins": { "..." : "..." }
}
```

### 4C. 토큰 절감 검증
- Phase 완료 시마다 `wc -l` 카운트
- 목표: 조건부 로드 적용 시 비코드 작업에서 69% 토큰 절감

## 검증 기준

| 항목 | 검증 방법 |
|------|----------|
| 훅 실행 | 각 트리거 이벤트에서 동작 확인 |
| 규칙 로딩 | 세션 시작 시 컨텍스트에 포함 확인 |
| 스킬 호출 | /skill-name으로 활성화 확인 |
| 커맨드 호출 | /command-name으로 실행 확인 |
| 중복 없음 | grep으로 동일 파일명 검색 |
| pairing-registry | 새 컴포넌트 등록 확인 |

## 위험 및 대응

| 위험 | 대응 |
|------|------|
| .sh→.js 변환 시 로직 손실 | 원본 보존, 단위 테스트로 동작 비교 |
| 이름 충돌 | dev- 접두사로 네임스페이스 분리 |
| 의존성 순환 | Phase 순서 준수 (core → dev → meta) |
| 기존 사용자 환경 깨짐 | claude-kit 미설치 시 ~/.claude/ 폴백 유지 |
