---
제목: Trigger Points — 커맨드별 훅 지점 카탈로그
작성일: 2026-04-20
대상: 메인테이너, 훅 스크립트 구현자
상태: draft
---

# 03 Trigger Points

> **결론**: 3도메인 총 **23개 주요 커맨드**에 훅을 건다. matcher는 `^/(plan-|copy-|dev-feature|dev-verify|dev-architecture|dev-commit)` 패턴으로 필터링. 각 커맨드의 **수집 중점 필드**가 도메인별로 다르므로, 훅 스크립트가 커맨드 타입에 따라 수집 전략을 분기한다.

---

## 1. 대상 커맨드 카탈로그

### 1.1 plan 도메인 (9개)

| 커맨드 | 수집 중점 | 위치 |
|--------|----------|------|
| `/plan-idea` | IDEA 등록 시 태깅 일관성 | `src/claude/plan/commands/plan-idea.md` |
| `/plan-screen` | 프레임워크 선택, 재판정 건수 | `src/claude/plan/commands/plan-screen.md` |
| `/plan-draft` | Lite/Standard 판정, 수동 개입 건수 | `src/claude/plan/commands/plan-draft.md` |
| `/plan-prd` | REQ ID 네이밍, MEDIUM/LOW 이슈 | `src/claude/plan/commands/plan-prd.md` |
| `/plan-review` | severity 분포, 자동 트리거 여부 | `src/claude/plan/commands/plan-review.md` |
| `/plan-wireframe` | 재호출 횟수, viewport 커버리지 | `src/claude/plan/commands/plan-wireframe.md` |
| `/plan-stitch` | (옵션) 스티치 실행 빈도 | `src/claude/plan/commands/plan-stitch.md` |
| `/plan-bridge` | bridge 문서 생성 PCC 상태, 병렬 실행 | `src/claude/plan/commands/plan-bridge.md` |
| `/plan-archive` | 아카이빙 완료도, 미완 항목 | `src/claude/plan/commands/plan-archive.md` |

**제외**: `plan-improve` (메타 커맨드, 피드백 대상 아님)

### 1.2 copy 도메인 (7개)

| 커맨드 | 수집 중점 | 비고 |
|--------|----------|------|
| `/copy-reference-refresh` | evidence manifest 상태, `--reference-only` 사용 여부 | Hybrid 모드 감지 |
| `/copy-visual-review` | fidelity 갭 분포 (P0/P1/P2) | |
| `/copy-interaction-review` | 상호작용 갭, missing evidence | |
| `/copy-gap-board` | 통합된 gap 건수, priority 분포 | |
| `/copy-plan-unit` | Execution Unit 생성 건수 | |
| `/copy-verify` | 검증 PASS/FAIL | |
| `/copy-closeout` | 최종 gap 해결률 | |

### 1.3 dev 도메인 (7개 — 선별)

| 커맨드 | 수집 중점 | 비고 |
|--------|----------|------|
| `/dev-architecture` | 구조 SSOT 신규/업데이트 건수 | |
| `/dev-feature` | Phase A/B/C 완료, 재위임 건수 | **핵심** |
| `/dev-verify` | DVC 검증 결과 | |
| `/dev-verify-all` | 백엔드/프론트 검증 통합 | |
| `/dev-verify-fe` | 프론트 특화 검증 | |
| `/dev-commit` | 커밋 원자성, 메시지 품질 | |
| `/dev-commit-push-pr` | PR 본문 품질, 체크리스트 충족 | |

**제외** (유틸리티/관리 커맨드): `dev-build-fix`, `dev-checkpoint`, `dev-continue`, `dev-explore`, `dev-handoff-verify`, `dev-learn`, `dev-plan`, `dev-refactor`, `dev-review`, `dev-run`, `dev-security-review`, `dev-sync-docs`, `dev-sync`, `dev-test-verify`

**제외 근거**: 피드백 수집 가치 대비 노이즈가 크거나, 다른 커맨드의 서브 루틴이거나, 1회성 관리 용도.

---

## 2. 매처(matcher) 패턴

### 2.1 Claude Code settings.json

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "^/(plan-(idea|screen|draft|prd|review|wireframe|stitch|bridge|archive)|copy-(reference-refresh|visual-review|interaction-review|gap-board|plan-unit|verify|closeout)|dev-(architecture|feature|verify|verify-all|verify-fe|commit|commit-push-pr))($|\\s)",
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

### 2.2 matcher 설계 원칙

1. **화이트리스트 방식**: 추가 커맨드는 명시적으로 포함
2. **안커($)**: 커맨드 뒤 공백 또는 문자열 끝 보장 (`/plan-prd-draft` 같은 오탐 방지)
3. **도메인별 그룹**: 가독성 + 향후 확장 용이성

---

## 3. 도메인별 수집 전략

### 3.1 plan 수집 전략

공통 필드 외에 **plan 특화** 추가:

```json
{
  "plan_specific": {
    "idea_id": "IDEA-20260420-001",
    "screening_framework": "rice",
    "screening_score": 72,
    "draft_category": "Standard",
    "scenario": "C",
    "feature_type": "hybrid",
    "prd_req_count": 74,
    "review_severity_distribution": { "medium": 2, "low": 3 }
  }
}
```

### 3.2 copy 수집 전략

```json
{
  "copy_specific": {
    "variant": "kr",
    "scope": ["hero", "cta"],
    "viewport": ["desktop", "mobile"],
    "evidence_status": { "valid": 8, "stale": 0, "missing": 0 },
    "gap_summary": { "P0": 0, "P1": 4, "P2": 3 },
    "reference_only_mode": false
  }
}
```

### 3.3 dev 수집 전략

```json
{
  "dev_specific": {
    "phase": "C",
    "agents_chain": ["dev-architect", "dev-doc-updater"],
    "files_modified_count": 7,
    "test_results": { "passed": 34, "failed": 0, "coverage_percent": 87 },
    "tdd_violations": 0,
    "build_status": "success"
  }
}
```

---

## 4. 수집 타이밍

### 4.1 Stop 이벤트 (기본)

커맨드가 자연 종료(성공/실패 모두)되는 시점. 가장 안정적이고 표준적 트리거.

### 4.2 SubagentStop 이벤트 (보조)

주요 서브에이전트(plan-draft-writer 등) 완료 시 별도 수집:

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "matcher": "(plan-draft-writer|plan-bridge-writer|dev-architect|dev-doc-updater|plan-wireframe-designer|plan-idea-screener|plan-prd-writer|plan-reviewer|copy-reference-baseline)",
        "hooks": [{ "type": "command", "command": "node ...collector.js --mode subagent" }]
      }
    ]
  }
}
```

**주의**: SubagentStop은 Stop보다 자주 발생 → 별도 파일이 아닌 **세션 내 누적** 후 Stop 시점에 통합.

### 4.3 UserPromptSubmit (선택, Phase 4 검토)

사용자 입력 시 Human Checkpoint 태그 부여 검토. 프라이버시 이슈로 기본 비활성화.

---

## 5. matcher 예외 처리

| 시나리오 | 처리 |
|----------|------|
| 커맨드 이름이 변경됨 (예: `/plan-prd` → `/plan-prd-v2`) | matcher 업데이트 — 본 문서 개정 |
| 새 도메인 추가 (예: `/test-*`) | matcher 그룹 추가 |
| 커맨드가 여러 하위 명령을 가짐 (예: `/plan-archive list`) | matcher 안커($) 뒤 `\s` 허용으로 커버 |
| 커맨드가 실패로 중단 | Stop 훅은 여전히 발동 — `status: "error"` 기록 |

---

## 6. 훅 구현 템플릿

### 6.1 feedback-collector.js 골격

```javascript
#!/usr/bin/env node
const fs = require('fs/promises')
const path = require('path')

async function main() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR
  const sessionId = process.env.CLAUDE_SESSION_ID
  const command = process.env.CLAUDE_COMMAND
  const runtime = process.env.CLAUDE_RUNTIME || detectRuntime()

  if (!projectDir || !command) return  // fail-open

  const archiveDir = path.join(projectDir, '.claude/feedback-archive', runtime, extractDomain(command))
  await fs.mkdir(archiveDir, { recursive: true })

  const entry = buildEntry({ sessionId, command, runtime })

  const entryPath = path.join(archiveDir, `${entry.entry_id}.json`)
  await fs.writeFile(entryPath, JSON.stringify(entry, null, 2))

  await updateIndex(projectDir, entry)
}

main().catch(err => {
  console.error('[feedback-collector] error:', err.message)
  process.exit(0)  // fail-open: never block session
})
```

### 6.2 중요 규칙

- **fail-open**: 훅 실패 시 exit 0으로 세션 보호
- **3초 제한**: 장시간 작업 분리 (fire-and-forget)
- **상대 경로 기록**: 절대 경로는 redaction 후 저장

---

## 7. 테스트 시나리오

### 7.1 단위 테스트 (P0 커맨드별)

각 대상 커맨드에 대해:

- 커맨드 정상 종료 → 엔트리 생성 확인
- 커맨드 실패 종료 → `status: "error"` 기록 확인
- matcher 불일치 커맨드 → 훅 미발동 확인

### 7.2 회귀 시나리오

`dash-preview-phase3` 복제 세션 1회 실행 시:
- **23개 대상 커맨드 중 실제 사용된 것**의 entry가 모두 생성되었는지 확인
- 이슈 수 (issues_observed) ≥ 원본 회고 이슈 수

---

## 8. 향후 확장

| 확장 | 시점 | 설명 |
|------|:-:|------|
| `/plan-feedback-add` (수동 추가) | Phase 4 | 훅이 놓친 이슈 수동 기입 |
| LLM 심층 분석 훅 | Phase 3.2 | `--deep-analysis` 옵션 |
| 월 단위 롤업 자동 생성 | Phase 4 | 누적 데이터 요약 |
| 외부 도구 export | Phase 5+ | Linear/Jira 연동 |

---

## 9. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 (23개 커맨드 카탈로그) | claude-kit roadmap author |
