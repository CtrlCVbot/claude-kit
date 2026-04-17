# Archive: 2026-04-17

> 이 디렉터리는 **2026-04-17 문서 패키지 재구축** 시점에 동결된 설계·리뷰 이력입니다.
> 원본 디렉터리 구조를 그대로 보존하며, 내부 상호 링크도 유지됩니다.

## Why archived

`docs/` 루트가 설계 이력과 사용자 가이드가 뒤섞여 **진입점이 불분명**했습니다.
재구축 계획 ([../../plan/documentation-package-plan.md](../../plan/documentation-package-plan.md)) 에 따라
역사/설계 문서는 이 아카이브로 분리하고, 현행 문서는 `docs/` 루트의 5계층 구조로 재작성됩니다.

## 디렉터리 인벤토리

| 항목 | 성격 | 비고 |
|------|------|------|
| [agent-design/](agent-design/) | 에이전트 아키텍처 초안 | 현행은 `docs/10-features/02-dev-domain.md` (예정) 로 흡수 |
| [claude-agent-integration/](claude-agent-integration/) | Claude 에이전트 통합 설계 이력 (가장 방대: 572K) | 설계 결정만 `00-overview/04-decision-log.md` (예정) 로 요약 이관 |
| [claude-code/](claude-code/) | Claude Code 관련 노트 (`agent-architecture.md` 포함) | 참조용 |
| [claude-home-inventory.md](claude-home-inventory.md) | `~/.claude` 홈 디렉터리 인벤토리 스냅샷 | 일회성 스냅샷 |
| [codex-compatibility/](codex-compatibility/) | Codex 호환성 설계 이력 (다세대 `_archive/` 포함) | 2단계 중첩 아카이브 유지 (§아래 주의) |
| [codex-sync/](codex-sync/) | Codex sync Phase 1–5 리뷰 + 최종 sync-report | 현행은 `10-features/04-multi-target.md` (예정) 로 요약 이관 |
| [global-rules-review/](global-rules-review/) | 글로벌 rules 리뷰 | 참조용 |
| [meta-tooling/](meta-tooling/) | 메타 툴링 (scaffolding, validation, conversion) 설계/로드맵 | 현행은 `30-reference/`, `40-contributing/` 로 흡수 |
| [notion-intake-screening/](notion-intake-screening/) | Notion intake/screening 통합 설계 | 미완 이니셔티브, 재개 시 참조 |
| [review/](review/) | dev-architecture-gate 리뷰 | 리뷰 프로세스 이력 |
| [reviews/](reviews/) | 기타 리뷰 아카이브 | 리뷰 프로세스 이력 |
| [team-orchestration/](team-orchestration/) | 팀 오케스트레이션 옵션 비교 및 추천안 | 운영 모델 결정 근거 |
| [universality-analysis/](universality-analysis/) | claude-kit 범용성 분석 | 설계 배경 |

## 현행 문서로의 매핑 (예정)

재구축 완료 후 다음과 같이 매핑됩니다. **아직 현행 문서는 작성 전** (P2~P4 진행 중).

| 아카이브 영역 | 현행 대체 위치 (예정) |
|--------------|---------------------|
| `agent-design/`, `claude-agent-integration/` | `docs/00-overview/04-decision-log.md`, `docs/10-features/02-dev-domain.md` |
| `codex-compatibility/`, `codex-sync/` | `docs/10-features/04-multi-target.md`, `docs/20-user-guide/06-codex-dual-use.md` |
| `meta-tooling/` | `docs/30-reference/`, `docs/40-contributing/02-adding-a-component.md` |
| `team-orchestration/`, `universality-analysis/` | `docs/00-overview/` 내 요약 |
| `notion-intake-screening/` | 아카이브 유지 (이니셔티브 미완) |
| `review/`, `reviews/`, `global-rules-review/` | 아카이브 유지 (프로세스 이력) |

## 주의사항

### 2단계 중첩 아카이브

`codex-compatibility/_archive/` 하위는 **이번 재구축 이전부터 이미 archive 로 분류된** 문서들입니다. 평탄화(flatten) 하지 않고 원본 그대로 유지합니다. 내부 링크 안정성을 위한 결정입니다.

### 재활성화 절차

아카이브 문서에서 정보를 현행 문서로 끌어올려야 하는 경우:

1. 해당 문서를 읽고 **현행 반영이 필요한 핵심 사실**을 추려냅니다.
2. 현행 문서(`docs/00-overview/`, `docs/10-features/` 등)에 **요약·재작성** 하여 반영합니다 (복붙 금지).
3. 현행 문서 하단 "Sources" 섹션에 아카이브 링크 (`docs/archive/2026-04-17/...`) 를 명시합니다.
4. 아카이브 원본은 **그대로 보존** — 삭제하지 않습니다.

### 내부 링크 정책

- 아카이브 내부 상호 링크는 원본 경로 기준으로 동작합니다 (디렉터리 구조 보존).
- 외부(`.claude/`, `src/`, 루트 파일)에서 이 아카이브를 참조하는 링크는 **Phase 2 (P2)** 에서 일괄 rewrite 됩니다.

## 메타

| 항목 | 값 |
|------|-----|
| 아카이브 생성일 | 2026-04-17 |
| 재구축 브랜치 | `docs/package-restructure` |
| 계획서 | [../../plan/documentation-package-plan.md](../../plan/documentation-package-plan.md) |
| 대상 건수 | 13 디렉터리 + 1 단일 파일 |
