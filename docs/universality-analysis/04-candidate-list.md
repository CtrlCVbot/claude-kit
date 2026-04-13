# 04. 최종 적용 후보 목록

> 의존 문서: [02-classification-table.md](02-classification-table.md), [03-component-mapping.md](03-component-mapping.md)
> 신규 40개 + 보완 5개 = 45개 후보를 Tier별로 분류.
> 중복 27개는 이미 claude-kit에 존재하므로 제외.

## 선별 기준
- ★4~5 + 신규 + 난이도 LOW → Tier 1 (즉시 적용)
- ★4~5 + 신규 + 난이도 MED → Tier 2 (수정 후 적용)
- ★3 또는 난이도 HIGH → Tier 3 (향후 검토)
- ★1~2 또는 Forge 전용 → 제외

## Tier 1: 즉시 적용 (~18개)

| # | 파일 | 유형 | ★ | 도메인 | 대상 경로 | 난이도 | 비고 |
|---|------|------|---|--------|----------|--------|------|
| 1 | remote-command-guard | hook | 5 | core | core/hooks/ | LOW | .sh→.js 변환 |
| 2 | rate-limiter | hook | 5 | core | core/hooks/ | LOW | .sh→.js 변환 |
| 3 | mcp-usage-tracker | hook | 5 | core | core/hooks/ | LOW | .sh→.js 변환 |
| 4 | git-workflow-v2 | rule | 5 | core | core/rules/ | LOW | 복사만 |
| 5 | agents-v2 | rule | 5 | core | core/rules/ | LOW | 복사만 |
| 6 | pull.md | cmd | 5 | dev | dev/commands/ | LOW | dev- 접두사 추가 |
| 7 | update-docs.md | cmd | 5 | dev | dev/commands/ | LOW | dev- 접두사 추가 |
| 8 | update-codemaps.md | cmd | 5 | dev | dev/commands/ | LOW | dev- 접두사 추가 |
| 9 | worktree-start.md | cmd | 5 | dev | dev/commands/ | LOW | dev- 접두사 추가 |
| 10 | worktree-cleanup.md | cmd | 5 | dev | dev/commands/ | LOW | dev- 접두사 추가 |
| 11 | team-orchestrator | skill | 5 | core | core/skills/ | LOW | 디렉토리 복사 |
| 12 | build-system | skill | 5 | core | core/skills/ | LOW | 디렉토리 복사 |
| 13 | using-superpowers | skill | 5 | core | core/skills/ | LOW | 디렉토리 복사 |
| 14 | strategic-compact | skill | 5 | core | core/skills/ | LOW | 디렉토리 복사 |
| 15 | quick-commit (보완) | cmd | 5 | dev | dev/commands/ | LOW | dev-commit 변형 추가 |
| 16 | verify-loop (보완) | cmd | 4 | dev | dev/commands/ | LOW | 재시도 로직 병합 |
| 17 | tdd.md (보완) | cmd | 4 | dev | dev/commands/ | LOW | 단위 TDD 모드 |
| 18 | testing.md | rule | 4 | core | core/rules/ | LOW | paths: 포함 복사 |

## Tier 2: 수정 후 적용 (~15개)

| # | 파일 | 유형 | ★ | 도메인 | 대상 경로 | 난이도 | 필요 변경 |
|---|------|------|---|--------|----------|--------|----------|
| 1 | work-tracker-prompt | hook | 4 | core | core/hooks/ | MED | .sh→.js + buffer.jsonl 경로 표준화 |
| 2 | work-tracker-tool | hook | 4 | core | core/hooks/ | MED | .sh→.js + 포맷 통일 |
| 3 | work-tracker-stop | hook | 4 | core | core/hooks/ | MED | .sh→.js |
| 4 | context-sync-suggest | hook | 4 | core | core/hooks/ | MED | .sh→.js |
| 5 | task-completed | hook | 4 | core | core/hooks/ | MED | .sh→.js |
| 6 | orchestrate.md | cmd | 4 | dev | dev/commands/ | MED | Agent Teams API 참조 표준화 |
| 7 | init-project.md | cmd | 4 | dev | dev/commands/ | MED | 언어별 템플릿 정리 |
| 8 | next-task.md | cmd | 4 | dev | dev/commands/ | MED | 작업 큐 패턴 표준화 |
| 9 | agent-router.md | cmd | 4 | dev | dev/commands/ | MED | 34개 에이전트 목록 프로젝트 분리 |
| 10 | guide.md | cmd | 4 | dev | dev/commands/ | MED | 프로젝트 독립적 가이드로 재작성 |
| 11 | suggest-automation.md | cmd | 4 | dev | dev/commands/ | MED | 자동화 패턴 일반화 |
| 12 | eval-harness | skill | 4 | dev | dev/skills/ | MED | EDD 프레임워크 표준화 |
| 13 | skill-factory | skill | 4 | core | core/skills/ | MED | 스킬 생성 파이프라인 정리 |
| 14 | auto.md (보완) | cmd | 4 | dev | dev/commands/ | MED | dev-run과 파이프라인 통합 |
| 15 | security-review (보완) | cmd | 3 | dev | dev/commands/ | MED | CWE+STRIDE 패턴 kit에 병합 |

## Tier 3: 향후 검토 (~8개)

| # | 파일 | 유형 | ★ | 이유 | 비고 |
|---|------|------|---|------|------|
| 1 | manage-skills | skill | 4 | claude-kit 구조에 맞게 재설계 필요 | 스킬 자동 관리 |
| 2 | verify-implementation | skill | 4 | dev-verification-engine과 역할 정리 | 메타 검증 |
| 3 | cc-dev-agent | skill | 4 | 전체 dev 워크플로우 의존 | CC 개발 최적화 |
| 4 | eval.md | cmd | 4 | eval-harness 스킬과 동시 적용 | EDD 커맨드 |
| 5 | web-checklist.md | cmd | 4 | 웹 프로젝트 한정 유용 | 배포 후 체크 |
| 6 | show-setup.md | cmd | 4 | Forge 구조 참조 정리 필요 | 설치 상태 표시 |
| 7 | prompts-chat | skill | 3 | prompts.chat MCP 종속 | 조건부 로드 |
| 8 | expensive-mcp-warning | hook | 3 | 특정 MCP 종속 패턴 일반화 필요 | 비용 경고 |

## 제외 (5개)

| # | 파일 | 유형 | ★ | 제외 이유 |
|---|------|------|---|----------|
| 1 | forge-update-check.sh | hook | 2 | Forge 전용, 범용 아님 |
| 2 | db-guard.sh | hook | 2 | Supabase MCP 종속, kit에 범용 버전 존재 |
| 3 | cc-chips/ | 프로젝트 | 3 | 별도 repo 보유, 독립 프로젝트 |
| 4 | settings.json | 설정 | 4 | 범용 템플릿으로 분리 제안 (문서화만) |

> ※ forge-update.md는 Forge 설치 파일이므로 분석 범위에서 제외.

## 도메인별 분포

| 도메인 | Tier 1 | Tier 2 | Tier 3 | 합계 |
|--------|--------|--------|--------|------|
| core | 10 | 7 | 0 | 17 |
| dev | 8 | 8 | 8 | 24 |
| **합계** | **18** | **15** | **8** | **41+5** |

Tier 1(18) + Tier 2(15) + Tier 3(8) + 제외(4) = **45개** (신규 40 + 보완 5)

> 보완 5개는 Tier 1에 3개, Tier 2에 2개 포함.
