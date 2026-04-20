---
제목: Architecture — 데이터 흐름 및 컴포넌트
작성일: 2026-04-20
대상 독자: 메인테이너, 훅 구현자
상태: draft
---

# 01 Architecture

> **결론**: 본 시스템은 **3개 컴포넌트** (트리거 훅 · 수집기 · 저장소)로 구성된다. 훅은 Claude Code의 `Stop` 이벤트에 바인딩되어 세션 종료 시마다 수집기를 호출하고, 수집기는 세션 컨텍스트에서 피드백을 추출해 JSON으로 아카이빙한다. **전체 동작은 비동기**이며 세션 진행을 차단하지 않는다.

---

## 1. 시스템 아키텍처

### 1.1 고수준 다이어그램

```
┌──────────────────────────────────────────────────────────────────┐
│                       Claude Code Session                        │
│                                                                  │
│   User ──▶ /plan-draft ──▶ plan-draft-writer ──▶ [output]        │
│                    │                                             │
│                    ▼  (command terminates)                       │
│   ┌──────────────────────────────┐                              │
│   │  Stop Hook (settings.json)   │                              │
│   │  matcher: "/plan-|/copy-|    │                              │
│   │          /dev-feature|...."  │                              │
│   └──────────────┬───────────────┘                              │
│                  │ invokes                                       │
│                  ▼                                               │
│   ┌──────────────────────────────┐                              │
│   │ feedback-collector.js        │                              │
│   │  - read session transcript   │                              │
│   │  - parse agents/tools used   │                              │
│   │  - detect runtime            │                              │
│   │  - extract issues/suggests   │                              │
│   └──────────────┬───────────────┘                              │
│                  │ writes                                        │
│                  ▼                                               │
│   ┌──────────────────────────────┐                              │
│   │ .claude/feedback-archive/    │                              │
│   │  {runtime}/{domain}/         │                              │
│   │  {YYYYMMDD-HHmmss}-*.json    │                              │
│   │  index.md (auto-updated)     │                              │
│   └──────────────────────────────┘                              │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 컴포넌트 책임

| 컴포넌트 | 책임 | 위치 |
|----------|------|------|
| **Stop 훅 등록** | Claude Code settings.json에서 matcher 지정 | 프로젝트 또는 `~/.claude/settings.json` |
| **feedback-collector** | 세션 데이터 추출 → JSON 생성 | `src/claude/core/hooks/feedback-collector.js` |
| **저장소** | `.claude/feedback-archive/` 아래 구조화 저장 | 프로젝트 내 |
| **index 생성기** | 새 엔트리 등록 시 인덱스 갱신 | feedback-collector의 서브루틴 |

---

## 2. 데이터 흐름 (세션 단위)

### 2.1 정상 시나리오 (Claude)

```
1. 사용자: /plan-draft IDEA-20260420-001
       ↓
2. plan-draft-writer 에이전트 호출 → 결과 반환
       ↓
3. 커맨드 완료 (Stop 이벤트 발생)
       ↓
4. Claude Code harness: matcher 확인 (/plan- 매칭) ✓
       ↓
5. feedback-collector.js 실행
    │
    ├─ sessionId, cwd, command 식별
    ├─ 세션 로그/transcript 파싱
    ├─ 사용된 에이전트/Skill/Tool 추출
    ├─ 발견된 이슈/suggestion 추출 (휴리스틱 + 패턴)
    ├─ runtime: "claude" 태그 부여
    └─ feedback-entry.json 생성
       ↓
6. .claude/feedback-archive/claude/plan/20260420-143022-plan-draft-IDEA-....json 저장
       ↓
7. index.md 업데이트
       ↓
8. 세션 계속 진행 (사용자는 차단되지 않음)
```

### 2.2 Codex 시나리오 (fallback)

```
1. 사용자: /plan-draft IDEA-20260420-001 (Codex CLI)
       ↓
2. 에이전트 실행 → 결과 반환
       ↓
3. 커맨드 내부 suggest-output:
   "[Feedback ready] /codex-feedback-collect plan-draft"
       ↓
4. 사용자가 /codex-feedback-collect 실행
       ↓
5. feedback-collector.js (codex 분기)
    ├─ runtime: "codex" 태그
    └─ entry 생성
       ↓
6. .claude/feedback-archive/codex/plan/... 저장
```

상세 fallback: [05-codex-vs-claude.md](05-codex-vs-claude.md)

---

## 3. 훅 통합 방법

### 3.1 Claude Code settings.json 예시

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "(/plan-|/copy-|/dev-feature|/dev-verify|/dev-architecture|/dev-commit)",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PROJECT_DIR}/node_modules/claude-kit/src/claude/core/hooks/feedback-collector.js"
          }
        ]
      }
    ]
  }
}
```

### 3.2 claude-kit setup 자동 등록

`scripts/setup.js` (이미 존재)에 본 훅을 추가 주입. 신규 설치 시 settings.json에 자동 추가 + 기존 설정 미파괴.

### 3.3 환경변수 주입

훅 스크립트 실행 시 아래 환경변수 사용:

| 변수 | 용도 |
|------|------|
| `$CLAUDE_PROJECT_DIR` | 프로젝트 루트 |
| `$CLAUDE_SESSION_ID` | 세션 식별자 |
| `$CLAUDE_COMMAND` | 종료된 커맨드 (`/plan-draft` 등) |
| `$CLAUDE_RUNTIME` | 런타임 지시자 ("claude" | "codex") — 수동 설정 or 자동 감지 |

---

## 4. 수집 전략

### 4.1 1차 휴리스틱 (경량, 기본)

훅 스크립트가 **규칙 기반** 추출:

- 사용된 에이전트 (서브에이전트 호출 로그)
- 사용된 Tool 횟수 (Read/Edit/Write/Bash/Grep)
- 에러 패턴 (`"File has not been read yet"`, `"권한 없음"` 등 키워드)
- Human Checkpoint 발생 횟수
- 수동 Edit 건수 (에이전트 미경유)

### 4.2 2차 LLM 요약 (선택, Phase 3.2 검토)

- 메인 세션 종료 시점에 Skill 호출로 **LLM 요약** 수행
- 토큰 비용 증가 → 옵션 플래그 `--deep-analysis`로 제어

### 4.3 3차 사용자 추가 (수동)

- `/plan-feedback-add "이건 놓친 개선점"` 명령으로 기존 엔트리에 수동 추가
- Phase 4에서 구현 검토

---

## 5. 수집 차단/제외 시나리오

| 조건 | 동작 |
|------|------|
| 커맨드가 실패로 종료 (exit ≠ 0) | 실패 메타데이터만 저장, issues 비움 |
| 커맨드가 매칭되지 않음 | 훅 건너뜀 (matcher 필터링) |
| 프로젝트에 `.claude/feedback-archive/` 없음 | **자동 생성** (최초 1회) |
| 사용자 opt-out (`feedback-disabled: true` 설정) | 훅 실행 후 즉시 반환 |
| 세션 로그 접근 불가 | 메타데이터만 저장, 경고 로그 |

---

## 6. 비차단 보증

세션 진행 차단 방지를 위한 규칙:

- 훅 스크립트는 **최대 3초 이내 종료**
- 3초 초과 시 `child_process` 분리 (fire-and-forget)
- 파일 쓰기 실패 시 stderr에만 경고 — 세션은 계속
- 훅 자체 크래시가 세션에 전파되지 않음 (exit 0 보장)

---

## 7. 보안/프라이버시

| 항목 | 처리 |
|------|------|
| 사용자 비밀 (API key 등) | 수집 시 패턴 매칭으로 redaction |
| 파일 경로 | 프로젝트 루트 기준 상대 경로만 저장 (사용자 홈 경로 누출 방지) |
| 개인 식별 정보 | Git user.email 포함 금지 (훅 옵션으로 제어) |
| 외부 전송 | **없음** (로컬 파일 시스템만 사용) |

---

## 8. 확장 포인트

| 포인트 | 예시 |
|--------|------|
| 새 runtime 추가 | "cursor", "windsurf" 등 환경 추가 |
| 새 도메인 추가 | "test" 도메인 (테스트 실행 피드백) |
| 새 수집 전략 | LLM 기반 심층 분석 |
| 외부 분석 도구 연동 | 월 단위 롤업을 외부 도구로 export |

---

## 9. 의존성

### 9.1 런타임 의존

- Node.js 20+
- Claude Code 1.x (Stop 훅 지원)
- Codex CLI (Codex 환경 한정, fallback artifact 사용)

### 9.2 claude-kit 내부 의존

- 기존 훅 패턴 (`src/claude/core/hooks/` 관례)
- `scripts/setup.js`의 settings.json 주입 로직

---

## 10. 다음 문서

- 상세 JSON 구조: [02-feedback-schema.md](02-feedback-schema.md)
- 커맨드별 트리거 지점: [03-trigger-points.md](03-trigger-points.md)
- 저장 경로/네이밍: [04-archive-layout.md](04-archive-layout.md)
- 듀얼 타깃: [05-codex-vs-claude.md](05-codex-vs-claude.md)

---

## 11. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
