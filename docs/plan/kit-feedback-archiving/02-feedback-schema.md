---
제목: Feedback Schema — JSON Schema + 필드 명세
작성일: 2026-04-20
대상: 메인테이너, 훅 구현자, 분석 도구 제작자
상태: draft
---

# 02 Feedback Schema

> **결론**: 모든 피드백 엔트리는 **단일 JSON Schema**를 준수한다. 핵심은 `runtime` 필드(Codex/Claude 구분) + `command` + `issues_observed` + `agent_capability_gaps`. 스키마는 **SchemaVersion 1.0** 에서 시작하며 IMP-KIT-014 (stage-manifest 스키마 버전 관리)와 동일한 버전 관리 원칙을 따른다.

---

## 1. Top-level 구조

```json
{
  "schema_version": "1.0",
  "entry_id": "20260420-143022-plan-draft-dash-preview-phase3",
  "runtime": "claude",
  "command": "/plan-draft",
  "domain": "plan",
  "session": { ... },
  "context": { ... },
  "usage": { ... },
  "issues_observed": [ ... ],
  "agent_capability_gaps": [ ... ],
  "suggestions": [ ... ],
  "metadata": { ... }
}
```

---

## 2. 필드별 명세

### 2.1 최상위 필드

| 필드 | 타입 | 필수 | 설명 |
|------|------|:-:|------|
| `schema_version` | string | ✅ | "1.0" (현재). 스키마 변경 시 증분 |
| `entry_id` | string | ✅ | 고유 ID: `{YYYYMMDD-HHmmss}-{command-suffix}-{slug}` |
| `runtime` | enum | ✅ | `"claude"` \| `"codex"` \| `"other"` |
| `command` | string | ✅ | `/plan-draft` 등 실행된 커맨드 |
| `domain` | enum | ✅ | `"plan"` \| `"copy"` \| `"dev"` \| `"core"` |

### 2.2 session 객체

```json
{
  "session": {
    "session_id": "abc123...",
    "started_at": "2026-04-20T14:25:00+09:00",
    "ended_at": "2026-04-20T14:30:22+09:00",
    "duration_seconds": 322,
    "user": "anonymous|git-user-name (config-controlled)"
  }
}
```

| 필드 | 타입 | 필수 | 비고 |
|------|------|:-:|------|
| `session_id` | string | ✅ | Claude Code `$CLAUDE_SESSION_ID` |
| `started_at` | ISO 8601 | ✅ | 타임존 포함 |
| `ended_at` | ISO 8601 | ✅ | 커맨드 종료 시각 |
| `duration_seconds` | number | ✅ | 정수 초 |
| `user` | string | - | 기본 anonymous, 옵션으로 git user |

### 2.3 context 객체

```json
{
  "context": {
    "project_root": "/path/to/project",
    "feature_slug": "dash-preview-phase3",
    "scenario": "C",
    "feature_type": "hybrid",
    "cwd_relative": ".",
    "git_branch": "main",
    "git_sha_short": "fb1b805"
  }
}
```

| 필드 | 필수 | 설명 |
|------|:-:|------|
| `project_root` | ✅ | 절대 경로 (로그용. 프라이버시 옵션 있음) |
| `feature_slug` | - | 현재 Feature (routing-metadata에서 추출) |
| `scenario` | - | A/B/C (copy 도메인 활성 시) |
| `feature_type` | - | copy/dev/hybrid |
| `cwd_relative` | ✅ | 프로젝트 루트 기준 상대 경로 |
| `git_branch` | - | 현재 브랜치 |
| `git_sha_short` | - | HEAD 커밋 단축 해시 |

### 2.4 usage 객체

```json
{
  "usage": {
    "agents_invoked": [
      { "name": "plan-draft-writer", "calls": 1, "status": "success" },
      { "name": "plan-reviewer", "calls": 1, "status": "success" }
    ],
    "skills_loaded": ["plan-draft", "plan-screening-workflow"],
    "tools_used": {
      "Read": 12,
      "Edit": 3,
      "Write": 1,
      "Bash": 0,
      "Grep": 4,
      "Glob": 2
    },
    "manual_edits_count": 2,
    "human_checkpoints": 1,
    "reruns": 0,
    "parallel_executions": 0
  }
}
```

**의도**: 수치화 가능한 모든 사용 지표. `manual_edits_count`, `human_checkpoints`는 verification-strategy 지표와 직접 매핑.

### 2.5 issues_observed 배열 (핵심)

```json
{
  "issues_observed": [
    {
      "id": "issue-001",
      "type": "permission_mismatch|framework_drift|cache_error|...",
      "severity": "P0|P1|P2",
      "description": "dev-architect가 Edit 권한 없어 편집 좌표만 반환",
      "evidence": {
        "log_excerpt": "Tool 'Edit' not available for agent 'dev-architect'",
        "file_ref": "src/claude/dev/agents/dev-architect.md:9"
      },
      "related_imp_kit_id": "IMP-KIT-001"
    }
  ]
}
```

### 2.5.1 type 열거형

| type | 의미 | 예시 anti-pattern |
|------|------|------------------|
| `permission_mismatch` | 에이전트 권한 부족/초과 | #7 재위임 루프 |
| `framework_drift` | description과 실제 동작 불일치 | #4 silent drift |
| `cache_error` | Read 캐시 인증 실패 | #1 Read 미인증 |
| `missing_agent` | Skill-only 수동화 | #3 Skill-only |
| `undefined_mode` | 정의되지 않은 모드 사용 | Hybrid 수동 지시 |
| `checkpoint_imbalance` | Checkpoint 과다/부족 | #8 불균형 |
| `duplication` | 재복제 금지 원칙 위반 | #5 재복제 |
| `trust_only` | 에이전트 결과 trust-only | #3 (anti-pattern) |
| `truncation_ignored` | grep truncation 방치 | #2 |
| `other` | 그 외 |

### 2.5.2 severity

- **P0**: 블로커 — 파이프라인 진행 불가
- **P1**: 중요 — 수동 수습 가능하나 비효율
- **P2**: 개선 — 품질/관찰성 이슈

### 2.6 agent_capability_gaps 배열

```json
{
  "agent_capability_gaps": [
    {
      "agent": "dev-architect",
      "gap_type": "tool_permission|memory|schema|role_clarity",
      "observed_behavior": "16개 편집 좌표만 반환, Edit 불가",
      "expected_behavior": "편집 좌표 → 자동 체이닝 → dev-doc-updater가 편집",
      "suggested_improvement_ref": "IMP-KIT-001"
    }
  ]
}
```

**의도**: 에이전트별 역량 부족 지점을 **정형화하여 추적**. 누적 시 IMP-KIT 업데이트 근거.

### 2.7 suggestions 배열

```json
{
  "suggestions": [
    {
      "text": "dev-architect Output_Format에 JSON 편집 좌표 섹션 추가",
      "affects": ["src/claude/dev/agents/dev-architect.md"],
      "estimated_effort": "S|M|L",
      "confidence": "high|medium|low",
      "related_imp_kit_id": "IMP-KIT-001"
    }
  ]
}
```

### 2.8 metadata 객체

```json
{
  "metadata": {
    "collector_version": "1.0.0",
    "collection_method": "heuristic|llm|manual",
    "deep_analysis_used": false,
    "redactions_applied": ["secret", "user_home_path"],
    "warnings": []
  }
}
```

---

## 3. 완전한 예시 (dash-preview-phase3 #22 — 재위임 이슈)

```json
{
  "schema_version": "1.0",
  "entry_id": "20260417-153045-dev-feature-dash-preview-phase3",
  "runtime": "claude",
  "command": "/dev-feature",
  "domain": "dev",
  "session": {
    "session_id": "sess-abc123",
    "started_at": "2026-04-17T15:20:00+09:00",
    "ended_at": "2026-04-17T15:30:45+09:00",
    "duration_seconds": 645,
    "user": "anonymous"
  },
  "context": {
    "project_root": "/Users/.../mologado",
    "feature_slug": "dash-preview-phase3",
    "scenario": "C",
    "feature_type": "hybrid",
    "cwd_relative": ".",
    "git_branch": "main",
    "git_sha_short": "fb1b805"
  },
  "usage": {
    "agents_invoked": [
      { "name": "dev-architect", "calls": 1, "status": "incomplete" },
      { "name": "dev-doc-updater", "calls": 1, "status": "success" }
    ],
    "skills_loaded": ["dev-architecture-decision"],
    "tools_used": { "Read": 24, "Edit": 7, "Write": 0, "Bash": 2, "Grep": 11, "Glob": 5 },
    "manual_edits_count": 0,
    "human_checkpoints": 1,
    "reruns": 1,
    "parallel_executions": 0
  },
  "issues_observed": [
    {
      "id": "issue-001",
      "type": "permission_mismatch",
      "severity": "P0",
      "description": "dev-architect가 Edit 권한 없어 편집 좌표만 반환, dev-doc-updater에 재위임 필요",
      "evidence": {
        "log_excerpt": "Tool 'Edit' is not available for agent 'dev-architect'. Returning coordinates...",
        "file_ref": "src/claude/dev/agents/dev-architect.md:9"
      },
      "related_imp_kit_id": "IMP-KIT-001"
    }
  ],
  "agent_capability_gaps": [
    {
      "agent": "dev-architect",
      "gap_type": "tool_permission",
      "observed_behavior": "16개 편집 좌표 반환 후 분석 중단",
      "expected_behavior": "Phase C 자동 체이닝 → dev-doc-updater로 전달",
      "suggested_improvement_ref": "IMP-KIT-001"
    }
  ],
  "suggestions": [
    {
      "text": "dev-feature 커맨드가 Phase별 에이전트 자동 라우팅 (A→architect, C→doc-updater)",
      "affects": ["src/claude/dev/commands/dev-feature.md"],
      "estimated_effort": "M",
      "confidence": "high",
      "related_imp_kit_id": "IMP-KIT-001"
    }
  ],
  "metadata": {
    "collector_version": "1.0.0",
    "collection_method": "heuristic",
    "deep_analysis_used": false,
    "redactions_applied": ["user_home_path"],
    "warnings": []
  }
}
```

---

## 4. JSON Schema 파일 (구현 시 배치)

**위치**: `src/claude/core/_schemas/feedback-entry.schema.json` (신규)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Feedback Entry",
  "type": "object",
  "required": ["schema_version", "entry_id", "runtime", "command", "domain", "session", "usage"],
  "properties": {
    "schema_version": { "type": "string", "pattern": "^\\d+\\.\\d+$" },
    "entry_id": { "type": "string", "pattern": "^\\d{8}-\\d{6}-.+$" },
    "runtime": { "enum": ["claude", "codex", "other"] },
    "command": { "type": "string", "pattern": "^/.+" },
    "domain": { "enum": ["plan", "copy", "dev", "core"] }
  }
}
```

(전체 스키마는 구현 시 완성)

---

## 5. 버전 관리 정책

- `schema_version`은 **Major.Minor**.
- Minor 증분: 선택 필드 추가 (후방 호환)
- Major 증분: 필드 삭제 또는 타입 변경 (회귀 검증 필수)
- 스키마 변경 시 **마이그레이션 스크립트** 작성 원칙 (IMP-KIT-014와 동일 패턴)

---

## 6. 쿼리 예시 (아카이브 활용)

### 6.1 특정 IMP-KIT 관련 엔트리만

```bash
jq 'select(.issues_observed[]?.related_imp_kit_id == "IMP-KIT-001")' .claude/feedback-archive/**/*.json
```

### 6.2 Codex에서만 발생한 P0 이슈

```bash
jq 'select(.runtime == "codex" and (.issues_observed[]? | .severity == "P0"))' .claude/feedback-archive/codex/**/*.json
```

### 6.3 월별 재위임 빈도

```bash
jq -s 'group_by(.entry_id | .[0:6]) | map({month: .[0].entry_id[0:6], reruns: (map(.usage.reruns) | add)})' .claude/feedback-archive/**/*.json
```

---

## 7. 보안 필드 처리 (redaction)

수집 시 아래 패턴 자동 redaction:

| 패턴 | 치환 |
|------|------|
| `sk-[a-zA-Z0-9]{10,}` (API key) | `[REDACTED:API_KEY]` |
| `/Users/[^/]+` (macOS 홈) | `[REDACTED:USER_HOME]` |
| `/home/[^/]+` (Linux 홈) | `[REDACTED:USER_HOME]` |
| `C:\\Users\\[^\\]+` (Windows 홈) | `[REDACTED:USER_HOME]` |
| 이메일 주소 | `[REDACTED:EMAIL]` (옵션 제어) |

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 (schema v1.0) | claude-kit roadmap author |
