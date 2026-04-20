---
제목: Codex vs Claude — 듀얼 타깃 대응 전략
작성일: 2026-04-20
대상: 메인테이너, 듀얼 타깃 구현자
상태: draft
---

# 05 Codex vs Claude — Dual Target Strategy

> **결론**: **Codex는 hooks runtime이 없으므로 자동 수집 불가**. 대신 **fallback artifact** 패턴으로 대응 — 커맨드 내부에서 suggest 출력 + 사용자가 `/codex-feedback-collect`를 수동 실행. Claude는 Stop 훅으로 **완전 자동화**. 동일 피드백 데이터 스키마로 양 환경 결과를 통합 분석 가능.

---

## 1. 핵심 제약 비교

| 항목 | Claude | Codex |
|------|:-:|:-:|
| Stop/SubagentStop 훅 | ✅ 네이티브 지원 | ❌ 없음 |
| settings.json hooks | ✅ 지원 | ❌ 구조 다름 |
| 환경변수 주입 (`$CLAUDE_*`) | ✅ | 일부만 (`$CODEX_*`) |
| 세션 transcript 접근 | ✅ | 제한적 |
| Skill 시스템 | ✅ | ⚠️ Codex instruction으로 변환 |

**결론**: Claude 기준 설계 후 Codex는 **fallback으로 대응**.

---

## 2. Claude 전략 (표준)

### 2.1 Stop 훅 등록

`settings.json`에 matcher 패턴으로 Stop 훅 등록 (03-trigger-points.md §2.1 참조).

### 2.2 자동 실행 플로우

```
/plan-draft 종료
  ↓ Claude harness 자동 감지
feedback-collector.js 실행 (runtime=claude 자동 태깅)
  ↓
.claude/feedback-archive/claude/plan/... 저장
```

**사용자 개입**: 없음.

---

## 3. Codex 전략 (fallback artifact)

### 3.1 개념

Codex에는 자동 훅이 없으므로:

1. 각 대상 커맨드의 **출력 마지막에 suggest 라인 삽입** — 일종의 명시적 알림
2. 사용자가 `/codex-feedback-collect` 커맨드를 실행하면 수집 시작
3. 수집기는 **최근 실행된 커맨드**의 컨텍스트를 파싱

### 3.2 커맨드 출력 변경 예시

기존 `/plan-draft` 출력:
```
Draft 완료: .plans/features/drafts/dash-preview-phase3/first-pass.md
```

신규 (Codex 환경):
```
Draft 완료: .plans/features/drafts/dash-preview-phase3/first-pass.md

[Feedback ready] 실행: /codex-feedback-collect plan-draft dash-preview-phase3
```

### 3.3 `/codex-feedback-collect` 커맨드 (신규)

**위치**: `src/codex/core/commands/codex-feedback-collect.md`

```markdown
# /codex-feedback-collect

Codex 환경에서 직전 커맨드의 피드백을 수집해 아카이브한다.

## Usage
```bash
/codex-feedback-collect {command} [slug]
```

## Workflow
1. Codex 세션 로그에서 {command} 실행 구간 파싱
2. feedback-entry JSON 생성 (runtime: "codex")
3. .claude/feedback-archive/codex/{domain}/... 저장
4. index.md 업데이트
```

### 3.4 반자동 플로우

```
/plan-draft 종료
  ↓
출력에 [Feedback ready] suggest 표시
  ↓
사용자: /codex-feedback-collect plan-draft dash-preview-phase3
  ↓
feedback-collector (codex 분기) 실행
  ↓
.claude/feedback-archive/codex/plan/... 저장
```

**사용자 개입**: 1회 수동 트리거. 권장 `/session-wrap` 시 자동 suggest.

---

## 4. 스키마 차이

### 4.1 공통 (스키마 v1.0)

양 환경이 동일한 스키마 사용. 02-feedback-schema.md 참조.

### 4.2 runtime별 필드 채움 차이

| 필드 | Claude | Codex |
|------|:-:|:-:|
| `session.session_id` | `$CLAUDE_SESSION_ID` | `$CODEX_SESSION_ID` 또는 타임스탬프 |
| `usage.agents_invoked` | transcript 자동 파싱 | 커맨드 출력 파싱 (정확도↓) |
| `usage.tools_used` | 정확한 카운트 | **추정값** (transcript 제한) |
| `issues_observed` | 키워드 감지 | 키워드 감지 (동등) |
| `metadata.collection_method` | "heuristic" | "heuristic" |
| `metadata.warnings` | 드물게 | **자주 포함** ("partial data", "limited access") |

---

## 5. codex-companion runtime 활용 (선택)

기존 `src/codex/core/skills/codex-cli-runtime/SKILL.md`가 존재 — 이를 활용한 심화 옵션:

### 5.1 codex-companion 연계

```
/codex-feedback-collect --deep
  ↓ codex-companion runtime 호출
  ↓ 최근 세션 로그 전체 추출
  ↓ LLM 요약으로 issues_observed 풍부화
```

**장점**: Claude 대비 데이터 손실 최소화
**단점**: 토큰 비용 증가

---

## 6. Fallback artifact 패턴 구현 체크리스트

### 6.1 대상 커맨드별 suggest 라인 추가

| 커맨드 | suggest 라인 위치 |
|--------|------------------|
| `/plan-draft` | 출력 마지막 |
| `/plan-prd` | 출력 마지막 |
| `/plan-review` | 출력 마지막 |
| `/plan-bridge` | 출력 마지막 |
| `/dev-feature` | Phase별 종료 시 |
| `/dev-verify*` | 출력 마지막 |
| `/copy-*` | 각 리뷰 후 |

### 6.2 사용자 경험 개선

- `/session-wrap` 커맨드가 미수집 커맨드 감지 → 일괄 suggest
- 세션 종료 시 "수집 안 된 피드백 N건 있음"  알림

### 6.3 rules 문서화

- `src/codex/core/rules/feedback-archiving.md` 신설 — fallback 작동 원리 명시
- `CLAUDE.md` 또는 `AGENTS.md` (Codex)에 수집 워크플로우 공지

---

## 7. 환경 감지 로직

### 7.1 자동 감지 (훅 내부)

```javascript
function detectRuntime() {
  if (process.env.CLAUDE_SESSION_ID) return 'claude'
  if (process.env.CODEX_SESSION_ID) return 'codex'
  if (process.env.ANTHROPIC_RUNTIME === 'claude-code') return 'claude'
  return 'other'
}
```

### 7.2 수동 오버라이드

```bash
CLAUDE_RUNTIME=codex /codex-feedback-collect ...
```

### 7.3 테스트 시나리오에서

```bash
CLAUDE_RUNTIME=claude CLAUDE_SESSION_ID=test /usr/bin/node .../feedback-collector.js
```

---

## 8. 양 환경 결과 통합 분석

### 8.1 구조적 통합

아카이브 구조 자체가 환경 분리 + 통합 양립:

```
.claude/feedback-archive/
├── claude/     ← Claude only
├── codex/      ← Codex only
└── _rollups/   ← 통합 월별 요약
```

### 8.2 쿼리로 통합

```bash
# 양 환경 전체 P0 이슈
jq 'select(.issues_observed[]?.severity == "P0")' .claude/feedback-archive/**/*.json

# Codex에서만 발생하는 이슈 타입
jq 'select(.runtime == "codex")' .claude/feedback-archive/codex/**/*.json | jq -s 'map(.issues_observed[].type) | unique'
```

### 8.3 월별 rollup에서 환경 비교

`_rollups/2026-04.md`에 runtime별 차이점 섹션 자동 생성.

---

## 9. Claude→Codex 동기화 (claude-kit 관례)

claude-kit 프로젝트는 Claude↔Codex 듀얼 타깃 유지. **본 시스템 동기화 규칙**:

### 9.1 공유 파일 (양 쪽 동일)

- JSON Schema (`feedback-entry.schema.json`) — 심볼릭 링크 또는 복제
- 저장 레이아웃 규칙 (04-archive-layout.md)

### 9.2 환경별 고유 파일

- `src/claude/core/hooks/feedback-collector.js` (Claude)
- `src/codex/core/commands/codex-feedback-collect.md` (Codex)
- `src/codex/core/rules/feedback-archiving.md` (Codex)

### 9.3 동기화 검증

`kit-sync-agent` 또는 `/kit-sync` 실행 시:
- 양 쪽 스키마 일치 확인
- suggest 라인 등록 여부 확인

---

## 10. 제약 수용 선언

본 설계는 다음 제약을 **명시적으로 수용**한다:

1. Codex 환경의 수집은 **1회 수동 트리거 필요** (완전 자동화 불가)
2. Codex 환경의 데이터는 Claude 대비 **약간의 정확도 손실** 허용 (`usage.tools_used` 등)
3. Codex는 커맨드 출력 수정으로 사용자 경험을 약간 변경함 (수용)

Phase 3.2 이후 Codex harness에 hooks runtime이 추가되면 **자동 마이그레이션 가능**하도록 설계.

---

## 11. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
