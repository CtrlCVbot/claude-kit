# Decision Log

> **Status**: Draft (P4, 2026-04-17) — 축약본. 원문은 아카이브 참조.
> **Source**: [../archive/2026-04-17/codex-compatibility/](../archive/2026-04-17/codex-compatibility/), [../archive/2026-04-17/meta-tooling/](../archive/2026-04-17/meta-tooling/), [../archive/2026-04-17/codex-sync/](../archive/2026-04-17/codex-sync/), [../archive/2026-04-17/team-orchestration/](../archive/2026-04-17/team-orchestration/)
> **Related**: [03-architecture-at-a-glance.md](03-architecture-at-a-glance.md)

claude-kit 의 현재 구조를 이해하기 위해 알아둘 **주요 설계 결정 8가지** 를 축약했습니다. 원본 분석·토론·대안 비교는 각 항목의 아카이브 링크에서 볼 수 있습니다.

## D1. 도메인 분리 (core / dev / plan / copy)

**결정**: 공통 가드는 `core`, 구현 파이프라인은 `dev`, 기획 파이프라인은 `plan`, UI 충실도는 `copy` 로 **옵트인 가능한 도메인** 분리.

**근거**: 모든 프로젝트가 기획 파이프라인이 필요하지는 않다. 항상 강제하면 도구가 무겁다고 느껴져 거부감 발생. 옵트인으로 "필요한 사람만" 쓰게 함.

**대안 비교**: 단일 도메인 번들 vs 훨씬 세분화된 컴포넌트 단위 설치. 도메인 단위가 응집도/결합도 균형점.

**아카이브**: [universality-analysis/](../archive/2026-04-17/universality-analysis/)

## D2. 멀티 타깃 (Claude + Codex)

**결정**: 같은 소스에서 Claude Code 와 Codex CLI 양쪽 아티팩트를 생성. 단일 SSOT, 타깃별 렌더링.

**근거**: 조직이 Codex 를 함께 도입하는 경우 자산을 두 번 관리하지 않아야 한다. 내용 일치는 pairing-registry 로 강제 추적.

**대안 비교**:
- (기각) 별도 리포 두 개 유지 — drift 필연
- (기각) Codex 만 지원 — 생태계 제약
- (채택) 하나의 리포, 타깃별 디렉터리 (`src/claude/`, `src/codex/`)

**아카이브**: [codex-compatibility/](../archive/2026-04-17/codex-compatibility/) (수많은 반복 설계 포함)

## D3. SSOT 는 src/, 런타임은 .claude/ (사본)

**결정**: 에이전트가 실행하는 `.claude/` 는 **복사본**. 원본은 `src/claude/` 에 존재. 재설치 시 `.claude/` 는 덮어쓰기됨.

**근거**:
- `.claude/` 를 직접 편집하면 재설치/업데이트 시 사라짐 — 사용자 혼란
- SSOT 를 `src/` 에 두면 버전 관리·테스트·생성 로직이 한 곳
- Codex 타깃도 동일 원리로 `plugins/claude-kit/` 이 사본

**예외**: `kit-*` 자산 (kit 자체를 관리하는 컴포넌트) 은 `.claude/` 자체가 SSOT. kit 메타는 런타임에 있어야 의미 있으므로 역방향.

## D4. Pairing Registry — Claude↔Codex 드리프트 방지

**결정**: 모든 자산에 `identity`, `type`, `domain`, `status` 를 가진 레지스트리 엔트리 존재. CI/audit 로 일관성 검증.

**근거**: 멀티 타깃에서 가장 흔한 실패는 "한쪽만 업데이트". 레지스트리가 "의도적" (skip) 과 "빠뜨림" 을 구분.

**관련 도구**: `scripts/audit-pairing.js`, `scripts/audit-drift.js`, `/kit-audit`, `/kit-sync`.

**아카이브**: [codex-sync/](../archive/2026-04-17/codex-sync/) §Phase 1~5

## D5. Hook 기반 자동 가드 — "기억 금지"

**결정**: TDD, DB 안전성, 범위 가드 등 규칙은 **hook 으로 런타임 강제**. 문서만으로 규칙을 두지 않음.

**근거**:
- 문서에 "테스트 먼저 쓰세요" 라고 아무리 써도 에이전트는 잊음
- hook 은 `exit 2` 로 도구 호출 자체를 차단 — 탈출구 없음
- 규칙 → 문서 → hook 3층 구조로 일관성 보장

**절충**: 과도한 차단은 생산성 저하. `REMINDER (exit 0)` 카테고리로 유연성 확보. 자세한 분류: [10-features/05-governance-guards.md](../10-features/05-governance-guards.md).

## D6. 설치본 Quick Start 와 저장소 Guide 분리

**결정**: `CLAUDE-KIT-QUICKSTART.md` 는 **설치 직후 프로젝트 루트에 생성되는 self-contained 온보딩 문서**. 저장소 내 `docs/guide/*` 는 별도 존재하던 상세 reference.

**근거**: 설치자는 "지금 뭘 해야 하지?" 를 찾고 싶지 저장소 문서를 탐색하고 싶지 않음. 1분 안에 첫 커맨드 실행 가능해야 함.

**렌더링**: `src/templates/quickstart/blocks/*.md` 를 도메인/타깃 조합에 따라 `quickstart-renderer.js` 가 조립.

**후기 (2026-04-17 P6)**: `docs/guide/*` 는 `docs/archive/2026-04-17/_guide/` 로 이동됐고, 저장소 variant `13-quick-start.md` 를 생성하던 `scripts/generate-quickstart-doc.js` 도 함께 제거. 설치본 `CLAUDE-KIT-QUICKSTART.md` 는 `setup.js` → `quickstart-renderer.js` 경로로 그대로 생성됨.

## D7. Rules 는 소수·핵심 (토큰 비용 고려)

**결정**: `.claude/rules/*.md` 는 **모든 턴 컨텍스트에 들어감**. 그래서 수를 제한하고, 구체 작업 흐름은 skills/commands 로 분리.

**근거**:
- 각 세션마다 rules 전부 토큰 소모
- rule 이 20개 넘어가면 모델 attention 분산
- "하나의 rule = 하나의 불변 원칙" 으로 묶기

**현재 core rules**: 6개 (golden-principles, coding-style, security, verification, date-calculation, interaction). 8개 이상 확장은 병합·분할 검토 필요.

## D8. 재구축 계획 — 문서 패키지 전면 개편 (2026-04-17)

**결정**: 기존 `docs/` 를 설계 이력/사용자 문서 혼재 상태에서, **5계층 구조 (00-overview / 10-features / 20-user-guide / 30-reference / 40-contributing)** 로 재구축. 기존은 `docs/archive/2026-04-17/` 로 동결.

**근거**:
- 신규 진입자가 "무엇부터 읽어야 하는지" 를 판단 불가
- 설계 반복(archive 내 여러 세대) 이 현행 문서와 섞여 혼란
- 자동 생성 가능한 reference 는 generator 로 품질 고정

**계획서**: [../plan/documentation-package-plan.md](../plan/documentation-package-plan.md)

## 결정 변경 절차

설계 결정을 변경할 때:

1. 현행 결정에 반하는 증거 수집 (성능 측정, 사용자 피드백, 드리프트 통계 등)
2. `docs/archive/YYYY-MM-DD/` 아래에 **현행 설계 + 변경 제안** 을 동결 저장
3. 현행 문서 갱신
4. `04-decision-log.md` (본 문서) 에 새 항목 추가 또는 기존 항목 수정
5. 영향받는 스크립트·컴포넌트 마이그레이션

변경 자체도 "왜 바꿨는지" 를 이력으로 남기는 것이 원칙입니다 ([아카이브](../archive/2026-04-17/) 참조 — 실제로 이 저장소는 codex-compatibility 만 해도 4세대 이상의 설계 이력을 보존).

## 다음 읽기

- [../10-features/](../10-features/) — 각 결정이 실제 어떻게 구현되는지
- [../40-contributing/](../40-contributing/) — 결정에 따른 기여 절차 (P4 예정)
