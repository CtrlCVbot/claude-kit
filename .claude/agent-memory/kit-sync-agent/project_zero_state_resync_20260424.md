---
name: zero-state-resync-20260424
description: 2026-04-24 codex 자산 전면 재생성 작업. 사용자가 src/codex + .codex 전체 삭제 후 SSOT 기반 재생성을 지시. backup 브랜치에 정상 상태 보존
type: project
---

**상황**: commit `5d6f6ce`에서 src/codex/ (164 파일) + .codex/* 전면 삭제 완료. backup 브랜치 `backup/codex-before-resync-20260424` (8e352a4) 에 삭제 전 166 파일 보존.

**Why**: 사용자가 Claude SSOT 기반 전면 재생성(`--force`)을 원함. Phase 1에서 이미 삭제 수행됨. 일반 `--resync` drift-increment가 아닌 zero-state 재생성.

**How to apply**:
- conversion-rules.md 따라 165+ claude 자산을 codex 형식으로 재변환
- skip 대상: 6 codex-skip (EX-009~014) + 5 unpaired copy rules + 6 paired-fallback rules (AGENTS.md merge, no discrete file)
- fallback: session-wrap-suggest (EX-001) → skill artifact만 존재, hook 변환 안 함
- 작업 규모: 대략 108 paired 항목이 재생성 대상 (90 implicit paired-direct + 9 paired-direct w/ portability + 9 agents w/ XML transform)
- 중대 의사결정 보고 완료 (2026-04-24 세션): 단순 copy 전략 v 정밀 transform 전략 선택

**규모 현황** (2026-04-24):
- pairing-registry: 125 entries (114 paired / 6 codex-skip / 5 unpaired)
- codex-portability SSOT: 42 entries (9 paired-direct / 7 paired-fallback / 26 paired-review)
- exception-registry: 14 entries (일부 resolved, 6개 active: EX-009~014)

**금지**: git commit (메인 세션이 처리), docs/ 경로 touch (stash 상태 위태), src/exception-registry.json 편집 (read-only)
**허용 편집**: src/codex/**, .codex/**, src/pairing-registry.json
