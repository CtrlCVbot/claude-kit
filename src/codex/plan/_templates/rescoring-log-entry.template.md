<!--
IMP-KIT-008 — 재판정 로그 엔트리 템플릿
스키마: src/claude/plan/_schemas/rescoring-log-entry.schema.json
사용: agent-memory/plan-idea-screener/MEMORY.md의 "## 재판정 로그" 섹션에 아래 구조 그대로 append.
유틸: src/claude/plan/agents/plan-idea-screener-rescoring.js의 buildRescoringLogEntry() 함수가 동일 포맷 생성.
-->

### {IDEA-ID} — {YYYY-MM-DD HH:mm}

- **이전 판정**: {Hold|Kill} ({FRAMEWORK} {score}, {date})
- **신규 판정**: {Go|Hold|Kill} ({FRAMEWORK} {score}, {date})
- **프레임워크**: {RICE|5axis} → {RICE|5axis} ({동일|변경})
- **전환 사유**: {100자 이내 서술 — Reach 상향 근거, Effort 재검토 등}
