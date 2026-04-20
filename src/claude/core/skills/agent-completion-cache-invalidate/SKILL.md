---
name: agent-completion-cache-invalidate
description: 서브에이전트 완료 후 메인 세션이 같은 파일을 Edit할 때 "File has not been read yet" 에러를 방지하는 Read 캐시 재인증 가이드. Codex runtime이 SubagentStop 훅을 지원하지 않는 환경에서 동일 의도를 보존하는 runtime-independent skill. 관련: IMP-KIT-005.
---

# Agent Completion Cache Invalidate (Fallback Skill)

본 스킬은 **Claude Code의 `agent-completion-cache-invalidate` SubagentStop 훅의 Codex fallback artifact**다. Codex는 SubagentStop 훅을 지원하지 않을 수 있으므로, 동일 의도를 사용자/에이전트가 직접 준수하도록 가이드한다.

## 문제

서브에이전트(Task tool)가 파일을 수정한 직후, 메인 세션의 **Read 캐시는 변경 전 내용**을 가리킨다. 메인이 Edit를 시도하면:

```
Error: File has not been read yet in this session. Read it first before writing to it.
```

## 해결

에이전트 완료 직후 같은 파일을 편집하기 전에 **Read를 재호출**하여 캐시를 재인증한다.

## 체크리스트

에이전트 위임(`Task` tool) 직후:

- [ ] **에이전트 타입 확인**: read-only(아래 표)면 skip
- [ ] **수정 파일 확인**: 에이전트의 VCS diff로 변경된 파일 목록 파악
- [ ] **메인이 이어서 Edit할 파일인지 확인**
- [ ] Edit 대상이라면 **Read 재호출 → Edit** 순서 유지

## Read-only 에이전트 (Read 재호출 불필요)

| 에이전트 | 도메인 | 비고 |
|----------|--------|------|
| `dev-architect` | dev | 분석 전용, Edit 도구 미보유 |
| `dev-code-reviewer` | dev | 리뷰 전용 |
| `dev-security-reviewer` | dev | 보안 리뷰 |
| `dev-database-reviewer` | dev | DB 리뷰 |
| `dev-verify-agent` | dev | 검증 실행 (읽기만) |
| `plan-reviewer` | plan | PCC 검증 |
| `Explore` | 범용 | 탐색 전용 |
| `Plan` | 범용 | 계획 설계 |

이들이 실행된 후에는 Read 재호출이 불필요하다.

## Write-capable 에이전트 (Read 재호출 권장)

| 에이전트 | 도메인 | 비고 |
|----------|--------|------|
| `dev-doc-updater` | dev | 문서 업데이트, Edit/Write 보유 |
| `plan-idea-collector` | plan | IDEA 파일 생성/수정 |
| `plan-idea-screener` | plan | SCREENING 파일 생성 |
| `plan-prd-writer` | plan | PRD 문서 작성 |
| `plan-wireframe-designer` | plan | 와이어프레임 파일 작성 |
| `plan-draft-writer` | plan | Draft 문서 작성 (2.2.0+) |
| `plan-bridge-writer` | plan | Bridge 문서 작성 (2.2.0+) |
| `copy-reference-baseline` | copy | evidence/ 파일 생성 |
| `general-purpose` | 범용 | 전범위 Edit 가능 |

이들 완료 직후에는 **해당 파일 Read 재호출 후 Edit** 순서를 준수한다.

## 적용 패턴

### GOOD

```
User: /plan-wireframe my-feature

  → Task(subagent_type=plan-wireframe-designer, ...)
    → 결과: screens.md, components.md 수정 완료
  
  → Read(screens.md)      # ✅ 캐시 재인증
  → Edit(screens.md, ...)  # ✅ 정상 동작
```

### BAD

```
User: /plan-wireframe my-feature

  → Task(subagent_type=plan-wireframe-designer, ...)
    → 결과: screens.md, components.md 수정 완료
  
  → Edit(screens.md, ...)  # ❌ "File has not been read yet"
```

## Claude vs Codex 동작 차이

| 환경 | 알림 방식 |
|------|----------|
| Claude Code | `agent-completion-cache-invalidate.js` 훅이 자동 systemMessage 출력 |
| Codex | 본 Skill 내용을 에이전트가 참조하여 수동 준수 |

## 관련 문서

- 규칙: `src/claude/core/rules/verification.md` ("Agent Edit Race (Read Cache)" 섹션)
- 규칙: `src/claude/core/rules/interaction.md` ("Agent Delegation & Read Cache" 섹션)
- 훅 스크립트: `src/claude/core/hooks/agent-completion-cache-invalidate.js`
- 백로그: `docs/plan/kit-2.2.0-roadmap/03-p0-detailed-specs/IMP-KIT-005-read-cache-retry.md`

## 변경 이력

| 일시 | 변경 |
|------|------|
| 2026-04-20 | 초안 작성 — IMP-KIT-005 구현의 일환으로 Codex fallback artifact 생성 |
