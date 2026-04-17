---
name: copy-domain-codex-conversion-2026-04-17
description: copy 도메인 16개 신규 자산 Codex 전환 완료 기록 (2026-04-17)
type: project
---

2026-04-17, copy 도메인 26개 unpaired 자산 중 16개를 Codex로 전환 완료. 5개 hooks(EX-010~014)는 면제, 5개 rules는 paired-fallback(AGENTS.md.template 병합 별도 태스크).

**Why:** copy 도메인이 feat/copy-domain 브랜치에서 신규 도입됨. pairing-registry에 copy 자산 26개가 unpaired로 등록되어 있었고 사용자 승인 후 16개 전환을 실행함.

**How to apply:** 향후 copy 도메인 자산 변경(커맨드 추가, 에이전트 수정, 스킬 변경) 발생 시, 대응하는 src/codex/copy/ 경로 파일을 함께 갱신할 것. copy-reference-baseline은 write-capable agent로 REVIEW NEEDED 마커 존재.

전환된 자산 목록 (contentHash 기준):
- copy-pipeline (skill): 165989fe
- copy-evidence-management (skill): 8a679a11
- copy-gap-analysis (skill): 1731c161
- copy-qa-workflow (skill): b5ec47a4
- copy-closeout-workflow (skill): 58c78e5c
- copy-fidelity (agent, RO): d16e5f07
- copy-interaction-fidelity (agent, RO): bd072bb5
- copy-qa-reviewer (agent, RO): b8c55413
- copy-reference-baseline (agent, WR, REVIEW NEEDED): e80e49e5
- copy-reference-refresh (command): b63b3511
- copy-visual-review (command): 46a40f01
- copy-interaction-review (command): 3d65c426
- copy-gap-board (command): c6dbdc86
- copy-plan-unit (command): c28d9181
- copy-verify (command): 6c270b46
- copy-closeout (command): 98f8dd7e

잔여 unpaired (10개):
- hooks(5): copy-evidence-reminder, copy-doc-drift-check, copy-scope-guard, copy-variant-env-guard, copy-gate-stop (EX-010~014, 면제)
- rules(5): copy-fidelity-rule, copy-evidence-rule, copy-gates-rule, copy-commands-rule, copy-variant-rule (paired-fallback, AGENTS.md.template 병합 태스크)
