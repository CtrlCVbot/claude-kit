<!-- kit-convert generated: 2026-04-16 -->
<!-- REVIEW NEEDED: complex command -->
# dev-commit-push-pr — Codex Entry Flow

## Overview

검증 완료 후 커밋 & PR & 머지 + MCP 알림 (v6). 빌드/테스트 검증, 보안 스캔, 커밋, Push, PR 생성, 머지, MCP 알림 발송을 통합 처리한다.

## Invocation

```
dev-commit-push-pr [커밋 메시지] [--merge|--squash|--rebase] [--draft] [--no-verify] [--no-checklist] [--skip-security] [--notify]
```

## Parameters

| 인자 | 설명 |
|------|------|
| `[메시지]` | 커밋 메시지 (없으면 자동 생성) |
| `--merge` | PR 생성 + merge commit으로 머지 |
| `--squash` | PR 생성 + squash merge |
| `--rebase` | PR 생성 + rebase merge |
| `--draft` | Draft PR 생성 (머지 안 함) |
| `--no-verify` | 빌드/테스트 스킵 |
| `--no-checklist` | 머지 후 웹 체크리스트 생성 스킵 |
| `--skip-security` | 보안 사전 검증 스킵 |
| `--notify` | 머지 후 MCP 알림 발송 (v6 신규) |

## Workflow

### 0단계: Context 수집

```bash
git status --short
git branch --show-current
git rev-parse --abbrev-ref origin/HEAD 2>/dev/null | sed 's/origin\///' || echo "main"
git log --oneline -3
git diff --staged --stat 2>/dev/null || git diff --stat
git remote get-url origin 2>/dev/null
gh --version 2>/dev/null | head -1 || echo "not installed"
```

---

### 1단계: 인자 파싱

**$ARGUMENTS에서 옵션 추출:**
- `--merge` → 머지 모드: merge commit
- `--squash` → 머지 모드: squash merge
- `--rebase` → 머지 모드: rebase merge
- `--draft` → Draft PR (머지 옵션과 함께 사용 불가)
- `--no-verify` → 빌드/테스트 스킵
- `--no-checklist` → 머지 후 웹 체크리스트 생성 스킵
- `--skip-security` → 보안 사전 검증 스킵
- `--notify` → 머지 후 MCP 알림 발송 (v6 신규)
- 나머지 → 커밋 메시지

**`--draft`와 머지 옵션 동시 사용 시:**
```
--draft와 머지 옵션(--merge/--squash/--rebase)은 함께 사용할 수 없습니다.

Draft PR은 머지하지 않고 리뷰용으로 생성됩니다.
```
→ 중단

---

### 2단계: 사전 체크

**변경사항 없으면:**
```
커밋할 변경사항이 없습니다.

현재 상태:
- 브랜치: [브랜치명]
- 마지막 커밋: [커밋 메시지]
```
→ 중단

**main/master 브랜치면:**
```
main 브랜치에서 직접 커밋하려고 합니다.

권장: 브랜치 생성 후 작업
  git checkout -b feature/[기능명]

옵션:
1. "브랜치 생성" - 새 브랜치 만들고 진행
2. "계속" - main에 직접 커밋 (PR 생략)
3. "취소" - 작업 중단
```

---

### 3단계: 빌드/테스트 검증

**`--no-verify` 있으면 스킵.**

프로젝트 타입별 검증:

| 파일 | 타입 | 검증 명령 |
|------|------|----------|
| package.json | Node.js | `npm run build && npm test` |
| pyproject.toml / setup.py | Python | `python -m pytest` |
| go.mod | Go | `go build ./... && go test ./...` |
| Cargo.toml | Rust | `cargo build && cargo test` |
| Makefile | Make | `make test` |

**실패 시:**
```
검증 실패

[에러 메시지]

해결 후 다시 시도하거나:
  dev-commit-push-pr --no-verify
```
→ 중단

---

### 3.5단계: Merge Gate (자동 품질 관문)

커밋 전 아래 4개 조건을 **AND**로 검증한다. 하나라도 FAIL이면 커밋을 중단한다.

| 검증 항목 | 명령어 | FAIL 조건 | --no-verify 시 |
|-----------|--------|-----------|---------------|
| 빌드 | `npm run build` | exit code ≠ 0 | 스킵 가능 |
| 테스트 | `npm test` | exit code ≠ 0 | 스킵 가능 |
| 린트 | `npm run lint` | exit code ≠ 0 | 스킵 가능 |
| 보안 스캔 | security-reviewer agent | CRITICAL 발견 | **스킵 불가** |

**게이트 실패 시 출력 형식:**
```
┌─────────────┬────────┬──────────────────┐
│ 검증 항목    │ 결과   │ 상세              │
├─────────────┼────────┼──────────────────┤
│ 빌드        │ PASS   │                   │
│ 테스트      │ FAIL   │ 2 tests failed    │
│ 린트        │ PASS   │                   │
│ 보안 스캔   │ PASS   │                   │
└─────────────┴────────┴──────────────────┘
❌ Merge Gate FAIL: 테스트 실패. 커밋을 중단합니다.
```

**규칙:**
- `--no-verify` 플래그가 있으면 빌드/테스트/린트는 스킵 가능
- 보안 스캔에서 CRITICAL이 발견되면 `--no-verify`여도 **반드시 차단**
- 모든 검증이 PASS면 다음 단계(4단계)로 진행

---

### 4단계: 보안 검증

> **머지 옵션이 있을 때만 실행.** PR만 생성하는 경우 스킵.
> `--skip-security` 있으면 스킵 (경고 출력 후).

**`--skip-security` 사용 시:**
```
보안 검증을 건너뜁니다 (--skip-security)
   머지 후 반드시 수동 보안 검토를 수행하세요.
```
→ 5단계로 진행

**보안 검증 실행:**

**4-1. 변경 파일 수집:**
```bash
git diff --cached --name-only 2>/dev/null || git diff --name-only
```

**4-2. 보안 민감 파일 자동 감지:**

다음 패턴에 해당하는 파일이 변경 목록에 있으면 보안 검증 **강제 실행** (--skip-security 무시):

| 패턴 | 영역 |
|------|------|
| `auth/*`, `**/auth/**` | 인증 |
| `payment/*`, `**/payment/**` | 결제 |
| `session/*`, `**/session/**` | 세션 |
| `*secret*`, `*token*`, `*password*` | 시크릿 |
| `middleware*`, `**/middleware/**` | 미들웨어 |
| `.env*`, `*credentials*` | 환경변수/자격증명 |
| `**/api/admin/**` | 관리자 API |

**4-3. 보안 스캔 항목:**

| 검사 항목 | 패턴 | 심각도 |
|-----------|------|--------|
| 하드코딩된 시크릿 | `sk-`, `pk_`, `AKIA`, `ghp_`, `password\s*=\s*["']` | CRITICAL |
| SQL 인젝션 | 문자열 보간 SQL, `${}` in query | CRITICAL |
| XSS 취약점 | `dangerouslySetInnerHTML`, `innerHTML =` | HIGH |
| 민감 데이터 로깅 | `console.log.*password`, `console.log.*token` | HIGH |
| 하드코딩 URL | `http://localhost` in production code | MEDIUM |
| 취약한 의존성 | `package.json` 변경 시 known vulnerabilities | MEDIUM |
| 인증 우회 | `auth.*skip`, `verify.*false`, `bypass` | HIGH |
| CORS 설정 | `Access-Control-Allow-Origin: *` | MEDIUM |

**4-4. 결과 처리:**

**CRITICAL 발견 시 → 머지 차단:**
```
보안 검증 실패 - 머지 차단
─────────────────────────────────

CRITICAL 이슈 발견:

  [파일:라인] [CWE-XXX] [설명]

수정 제안:
  [구체적 수정 방법]

수정 후 다시 시도:
  dev-commit-push-pr [원래 옵션들]
─────────────────────────────────
```
→ 중단

**HIGH/MEDIUM만 발견 시 → 경고 후 진행:**
→ 5단계로 진행

---

### 5단계: 스테이징 & 커밋

```bash
git add -A
```

**커밋 메시지 결정:**
1. `$ARGUMENTS`에 메시지 있으면 → 그대로 사용
2. 없으면 → 변경 내용 분석해서 Conventional Commits 형식으로 생성

**Conventional Commits:**
| Type | 용도 |
|------|------|
| feat | 새 기능 |
| fix | 버그 수정 |
| refactor | 리팩토링 |
| docs | 문서 |
| test | 테스트 |
| chore | 기타 |
| style | 포맷팅 |
| perf | 성능 개선 |

**커밋 메타데이터 (v6):**
커밋 메시지 본문에 보안 스캔 결과 포함 (선택적):
```
[type]: [description]

security-scan: [pass|warn|skipped]
```

```bash
git commit -m "[메시지]"
```

---

### 6단계: Push

```bash
git push
```

**원격 브랜치 없으면:**
```bash
git push --set-upstream origin [브랜치명]
```

---

### 7단계: PR 생성

**gh CLI 없으면:** PR 생성 안내 출력 후 종료.

**main/master 브랜치면:** `main 브랜치에 직접 Push 완료 (PR 생략)` → 종료.

**기존 PR 확인:**
```bash
gh pr view --json number,url,state 2>/dev/null
```

있으면 → 7-1단계로 (기존 PR 처리)
없으면 → 7-2단계로 (새 PR 생성)

#### 7-1단계: 기존 PR 처리

**머지 옵션 없으면:** `기존 PR에 Push 완료` → 종료.
**머지 옵션 있으면:** → 8단계로 (머지 실행).

#### 7-2단계: 새 PR 생성

PR 본문에 변경 사항, 커밋 목록, 변경 파일, 보안 스캔 결과, 체크리스트를 포함한다.

**Draft PR (`--draft`):**
```bash
gh pr create --draft --title "[커밋 메시지]" --body "[본문]"
```
→ Draft 완료 출력 후 종료.

---

### 8단계: 머지 (옵션 있을 때만)

**머지 옵션 없으면 이 단계 스킵 → 10단계로**

**CI 체크 대기:**
```bash
gh pr checks --watch
```

**머지 실행:**

| 옵션 | 명령어 |
|------|--------|
| `--merge` | `gh pr merge --merge --delete-branch` |
| `--squash` | `gh pr merge --squash --delete-branch` |
| `--rebase` | `gh pr merge --rebase --delete-branch` |

**머지 성공 후 로컬 정리:**
```bash
git checkout main
git pull
```

→ **9단계로 (웹 체크리스트 자동 생성)**

---

### 9단계: 웹 체크리스트 자동 생성 (머지 성공 시)

> **머지 성공 후 자동 실행.** `--no-checklist` 옵션 시 스킵.

**9-1. 변경 파일 수집:**
```bash
git log --oneline -1
git diff HEAD~1 --name-only
git diff HEAD~1 --stat
```

**9-2. 컨텍스트 로드 (있는 것만):**
- `.claude/handoff.md` → "테스트 필요 사항", "주의사항" 섹션
- `spec.md` → 기능 요구사항
- `prompt_plan.md` → 현재 Task 상세

**9-3. 변경 영역 자동 분류:**

| 카테고리 | 파일 패턴 | 테스트 영역 |
|----------|-----------|-------------|
| UI/화면 | `*.tsx`, `*.jsx`, `components/*` | 화면 표시, 반응형, 인터랙션 |
| API/서버 | `api/*`, `server/*`, `route*` | 엔드포인트, 응답 |
| 인증 | `auth/*`, `login/*`, `session/*`, `middleware*` | 로그인, 로그아웃, 권한 |
| 결제 | `payment/*`, `billing/*`, `subscription/*` | 결제 플로우, 금액 |
| 데이터 | `*.sql`, `db/*`, `migration*`, `prisma/*` | 데이터 정합성 |
| 스타일 | `*.css`, `*.scss`, `tailwind.*` | 레이아웃, 디자인 |
| 설정 | `*.config.*`, `*.env*`, `package.json` | 환경 설정, 의존성 |

---

### 9-N단계: MCP 알림 발송 (--notify, v6 신규)

> **`--notify` 플래그가 있을 때만 실행.**

**9-N-1. Gmail MCP — 배포 알림 이메일:**
이해관계자에게 변경 내용, 확인 필요 사항이 포함된 이메일 발송.

**9-N-2. Google Calendar MCP — 배포 기록:**
`[Deploy] [커밋 메시지]` 이벤트 생성 (30분).

**9-N-3. N8N MCP — 추가 알림 (선택):**
n8n 워크플로우가 설정되어 있으면 Slack/Discord 등 추가 채널에 알림 트리거.

---

### 10단계: 완료 출력

PR만 생성, PR+머지, Draft PR 등 상황별 완료 출력을 표시한다.

## 보안 검증 상세

### 강제 보안 검증 트리거

다음 파일 패턴이 변경 목록에 포함되면 `--skip-security`를 사용해도 보안 검증이 강제 실행됩니다:
`auth/*`, `payment/*`, `session/*`, `*secret*`, `*token*`, `*password*`, `middleware*`, `.env*`, `*credentials*`, `**/api/admin/**`

### CWE 매핑

| 검사 항목 | CWE | 심각도 |
|-----------|-----|--------|
| 하드코딩 시크릿 | CWE-798 | CRITICAL |
| SQL 인젝션 | CWE-89 | CRITICAL |
| XSS | CWE-79 | HIGH |
| 민감 데이터 로깅 | CWE-532 | HIGH |
| 인증 우회 | CWE-287 | HIGH |
| 잘못된 CORS | CWE-942 | MEDIUM |
| 하드코딩 URL | CWE-547 | MEDIUM |

## 에러 복구

**Push 충돌:**
```bash
git pull --rebase
git rebase --continue
git push
```

**머지 충돌:**
```bash
git fetch origin
git rebase origin/main
# 충돌 해결
git push --force-with-lease
dev-commit-push-pr --merge
```

**gh 인증 문제:**
```bash
gh auth status
gh auth login
```

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/dev/commands/dev-commit-push-pr.md
