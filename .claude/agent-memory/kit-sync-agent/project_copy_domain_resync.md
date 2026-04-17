---
name: copy-domain-resync-2026-04-17
description: copy 도메인 도입으로 인한 11개 paired 자산 content drift 재변환 완료 기록
type: project
---

2026-04-17, copy 도메인 신규 추가로 인해 기존 plan/dev 도메인 11개 자산에 copy 관련 키워드가 누락된 채 Codex에 남아 있었음. --resync --force 모드로 전체 재변환 완료.

**Why:** copy 도메인(시나리오 A/B/C, Feature 유형 copy/dev, routing-metadata, PCC-06, copy-reference-refresh, copy Feature 면제 패턴 등)이 Claude 소스에 추가됐으나 Codex 사이드에는 반영되지 않음.

**How to apply:** 향후 copy 도메인 변경(copy 커맨드 추가, 시나리오 정의 변경, PCC 번호 변경 등) 발생 시, plan-draft/plan-prd/plan-review/plan-bridge/dev-feature/dev-run/plan-prd-writer/plan-reviewer/plan-idea-collector/plan-pipeline/dev-tdd-guard 11개 자산을 다시 drift 검사 대상으로 포함할 것.

재변환된 자산 목록 (contentHash 기준):
- plan-draft: de6dd741
- plan-bridge: f98aaa89
- plan-prd: 1f8b66d3
- plan-review: 7d36fd31
- dev-feature: 1dc13cce
- dev-run: a3540365
- plan-prd-writer: 9d881adf
- plan-reviewer: b44b5b88
- plan-idea-collector: 45ba543c
- plan-pipeline: dc7908a8
- dev-tdd-guard: 5fb44fdb
