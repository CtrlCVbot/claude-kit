# Codex Sibling Design Catalog

> `src/claude` 자산별로 `src/codex` sibling이 어떻게 설계되어야 하는지 정리하는 문서

## 단계 위치

- 실행 단계: `3단계-b`
- 선행 조건: `10`
- 후속 문서: `12`, `13`

## 목적

`src/codex/{core,dev,plan}` 아래에 어떤 자산을 만들고, 어떤 자산은 만들지 않으며, 어떤 자산은 shared guidance로 처리할지 결정 완료 상태로 정리한다.

## 설계 대상

- `src/claude/core`
- `src/claude/dev`
- `src/claude/plan`

## sibling 판정 종류

- `required`: target-separated authoring 완료 상태를 위해 최종적으로 반드시 필요한 Codex sibling
- `optional`: 유효한 Codex sibling이지만 초기 parity 범위에 반드시 포함되지는 않는 항목
- `shared-guidance`
- `skip`
- 구현 우선순위는 이 판정과 별도로 `14`에서 관리한다.

## 기본 설계 원칙

- `agent`와 `command`는 기능 identity 기준으로 Codex sibling 여부를 결정한다.
- `skill`은 가능한 한 Codex skill sibling을 둔다.
- `hook`은 Codex runtime 제약을 통과하는 항목만 sibling을 둔다.
- `core/rules`는 기본적으로 `shared-guidance`로 본다.
- sibling은 복사본이 아니라 Codex-native authoring source다.

## 문서에 반드시 포함할 항목

- Claude source path
- 기능 identity
- Codex target surface
- Codex sibling path
- required / optional / shared-guidance / skip 판정
- companion Codex assets 또는 shared consumer
- write-capable subagent인 경우 write boundary contract
- skip 시 이유

## 실행 체크리스트

1. `10`의 target surface 판정을 입력으로 받는다.
2. 각 기능별 `src/codex` sibling path 또는 shared target을 적는다.
3. `required`와 `optional`은 구현 우선순위가 아니라 최종 지원 책임을 뜻하도록 적는다.
4. 구현 우선순위는 `14`에서 별도로 관리한다.
5. `shared-guidance`는 실제로 어떤 문서나 surface에서 소비되는지 적는다.
6. `skip`은 메타 툴에서 추적 가능한 이유를 남긴다.

## 산출물

### path 규칙

- `subagent` sibling: `src/codex/{domain}/agents/{identity}.toml`
- write-capable `subagent` contract: `src/codex/{domain}/agents/{identity}.contract.json`
- `skill` sibling: `src/codex/{domain}/skills/{identity}/SKILL.md`
- `hook` code sibling: `src/codex/{domain}/hooks/{identity}.js`
- `hook` config companion: `src/codex/{domain}/hooks/{identity}.hook.json` -> emits `.codex/hooks.json`
- `shared-guidance`: 별도 sibling을 두지 않고 `AGENTS.md` 생성 입력으로 소비
- Claude `command`의 Codex sibling도 별도 `commands/`가 아니라 위 `skills/` 경로 규칙을 따른다.

### write-capable subagent contract

- 적용 대상: `dev-database-reviewer`, `dev-doc-updater`, `plan-idea-collector`, `plan-idea-screener`, `plan-prd-writer`, `plan-stitch-integrator`, `plan-wireframe-designer`
- companion contract는 runtime artifact가 아니라 tooling validation과 scaffold 생성을 위한 authoring source다.
- 최소 포함 필드:
  - `allowed_write_targets`
  - `deliverable_shape`
  - `parent_entrypoints`
  - `completion_check`
  - `fallback_mode`
- read-only reviewer 계열 subagent는 이 contract를 필수로 요구하지 않는다.

| Claude source path | 기능 identity | primary Codex sibling path | target surface | 판정 | companion / shared consumer | 이유 |
|------|------|---------------------------|----------------|------|-----------------------------|------|

### agents

| Claude source path | 기능 identity | primary Codex sibling path | target surface | 판정 | companion / shared consumer | 이유 |
|------|------|---------------------------|----------------|------|-----------------------------|------|
| `src/claude/dev/agents/dev-architect.md` | `dev-architect` | `src/codex/dev/agents/dev-architect.toml` | `subagent` | `required` | `dev-architecture`, `dev-plan`, `dev-feature` | read-only architecture specialist이며 Codex subagent와 가장 잘 맞는다. |
| `src/claude/dev/agents/dev-code-reviewer.md` | `dev-code-reviewer` | `src/codex/dev/agents/dev-code-reviewer.toml` | `subagent` | `required` | `dev-review`, `dev-commit-push-pr` | severity 기반 코드 리뷰 워커로 독립 역할이 분명하다. |
| `src/claude/dev/agents/dev-database-reviewer.md` | `dev-database-reviewer` | `src/codex/dev/agents/dev-database-reviewer.toml` | `subagent` | `optional` | `dev-review`, `dev-security-review`, `src/codex/dev/agents/dev-database-reviewer.contract.json` | 도메인 특화 reviewer라 초기 parity 필수 범위는 아니지만, 도입 시에는 write boundary contract가 반드시 필요하다. |
| `src/claude/dev/agents/dev-doc-updater.md` | `dev-doc-updater` | `src/codex/dev/agents/dev-doc-updater.toml` | `subagent` | `optional` | `dev-sync-docs`, `dev-sync`, `src/codex/dev/agents/dev-doc-updater.contract.json` | 문서/코드맵 갱신 워커이며, 허용 write target과 산출물 계약을 함께 잠가야 한다. |
| `src/claude/dev/agents/dev-security-reviewer.md` | `dev-security-reviewer` | `src/codex/dev/agents/dev-security-reviewer.toml` | `subagent` | `required` | `dev-security-review`, `dev-review` | 보안 리뷰는 Codex에서도 명확한 specialist 역할이 필요하다. |
| `src/claude/dev/agents/dev-verify-agent.md` | `dev-verify-agent` | `src/codex/dev/agents/dev-verify-agent.toml` | `subagent` | `required` | `dev-handoff-verify`, `dev-verify` | fresh-context verification worker이며 Codex subagent와 직접 대응된다. |
| `src/claude/plan/agents/plan-idea-collector.md` | `plan-idea-collector` | `src/codex/plan/agents/plan-idea-collector.toml` | `subagent` | `required` | `plan-idea`, `src/codex/plan/agents/plan-idea-collector.contract.json` | 입력을 구조화된 idea artifact로 바꾸는 bounded worker이며, artifact path와 completion check를 contract로 고정해야 한다. |
| `src/claude/plan/agents/plan-idea-screener.md` | `plan-idea-screener` | `src/codex/plan/agents/plan-idea-screener.toml` | `subagent` | `required` | `plan-screen`, `src/codex/plan/agents/plan-idea-screener.contract.json` | screening artifact 생성과 상태 제안이 핵심이므로, 허용 write 범위와 산출물 shape를 함께 정의해야 한다. |
| `src/claude/plan/agents/plan-prd-writer.md` | `plan-prd-writer` | `src/codex/plan/agents/plan-prd-writer.toml` | `subagent` | `required` | `plan-prd`, `src/codex/plan/agents/plan-prd-writer.contract.json` | PRD authoring 전문 워커로 적합하지만, 장문 작성 범위와 deliverable contract를 명시해야 한다. |
| `src/claude/plan/agents/plan-reviewer.md` | `plan-reviewer` | `src/codex/plan/agents/plan-reviewer.toml` | `subagent` | `required` | `plan-review` | read-only planning reviewer이며 구조화된 PASS/WARN/FAIL 산출물이 있다. |
| `src/claude/plan/agents/plan-stitch-integrator.md` | `plan-stitch-integrator` | `src/codex/plan/agents/plan-stitch-integrator.toml` | `subagent` | `required` | `plan-stitch`, `src/codex/plan/agents/plan-stitch-integrator.contract.json` | planning artifacts 통합 워커이므로, 허용 merge 범위와 completion check를 contract로 고정해야 한다. |
| `src/claude/plan/agents/plan-wireframe-designer.md` | `plan-wireframe-designer` | `src/codex/plan/agents/plan-wireframe-designer.toml` | `subagent` | `required` | `plan-wireframe`, `src/codex/plan/agents/plan-wireframe-designer.contract.json` | wireframe authoring worker이므로, 출력 형식과 허용 write target을 companion contract로 잠가야 한다. |

### commands

| Claude source path | 기능 identity | primary Codex sibling path | target surface | 판정 | companion / shared consumer | 이유 |
|------|------|---------------------------|----------------|------|-----------------------------|------|
| `src/claude/dev/commands/dev-architecture.md` | `dev-architecture` | `src/codex/dev/skills/dev-architecture/SKILL.md` | `skill` | `required` | `dev-architect` | 사용자 진입점 성격의 architecture workflow다. |
| `src/claude/dev/commands/dev-build-fix.md` | `dev-build-fix` | `src/codex/dev/skills/dev-build-fix/SKILL.md` | `skill` | `optional` | none | utility remediation workflow지만 초기 parity를 위해 반드시 필요한 진입점은 아니다. |
| `src/claude/dev/commands/dev-checkpoint.md` | `dev-checkpoint` | `src/codex/dev/skills/dev-checkpoint/SKILL.md` | `skill` | `optional` | none | 운영 편의 기능이며 없어도 핵심 conversion flow는 유지된다. |
| `src/claude/dev/commands/dev-commit-push-pr.md` | `dev-commit-push-pr` | `src/codex/dev/skills/dev-commit-push-pr/SKILL.md` | `skill` | `optional` | `dev-code-reviewer`, `dev-security-reviewer` | built-in git/PR 기능과 일부 겹치므로 Codex parity의 필수 entry로 보지는 않는다. |
| `src/claude/dev/commands/dev-commit.md` | `dev-commit` | `src/codex/dev/skills/dev-commit/SKILL.md` | `skill` | `optional` | none | commit convention workflow는 유용하지만 필수 진입점은 아니다. |
| `src/claude/dev/commands/dev-continue.md` | `dev-continue` | `src/codex/dev/skills/dev-continue/SKILL.md` | `skill` | `optional` | none | resume utility이며 없어도 핵심 Codex delivery path는 성립한다. |
| `src/claude/dev/commands/dev-explore.md` | `dev-explore` | `src/codex/dev/skills/dev-explore/SKILL.md` | `skill` | `optional` | `dev-architect` | 탐색 workflow는 유용하지만 핵심 delivery path는 아니다. |
| `src/claude/dev/commands/dev-feature.md` | `dev-feature` | `src/codex/dev/skills/dev-feature/SKILL.md` | `skill` | `required` | `dev-architect`, dev skill set | dev pipeline 진입점이라 Codex에서도 필수다. |
| `src/claude/dev/commands/dev-handoff-verify.md` | `dev-handoff-verify` | `src/codex/dev/skills/dev-handoff-verify/SKILL.md` | `skill` | `required` | `dev-verify-agent` | verification subagent orchestration entry다. |
| `src/claude/dev/commands/dev-learn.md` | `dev-learn` | `src/codex/dev/skills/dev-learn/SKILL.md` | `skill` | `optional` | `continuous-learning` | 학습/자동화 제안은 보조 기능으로 본다. |
| `src/claude/dev/commands/dev-plan.md` | `dev-plan` | `src/codex/dev/skills/dev-plan/SKILL.md` | `skill` | `required` | `dev-architect` | 구현 전 계획 수립 진입점으로 중요하다. |
| `src/claude/dev/commands/dev-refactor.md` | `dev-refactor` | `src/codex/dev/skills/dev-refactor/SKILL.md` | `skill` | `optional` | `dev-code-reviewer` | 구조 개선 utility이며 초기 parity에서 반드시 요구되는 entry는 아니다. |
| `src/claude/dev/commands/dev-review.md` | `dev-review` | `src/codex/dev/skills/dev-review/SKILL.md` | `skill` | `required` | `dev-code-reviewer`, `dev-architect` | 아키텍처/품질 리뷰 entry로 중요하다. |
| `src/claude/dev/commands/dev-run.md` | `dev-run` | `src/codex/dev/skills/dev-run/SKILL.md` | `skill` | `required` | `dev-verification-engine`, dev skill set | 구현 루프의 핵심 entry다. |
| `src/claude/dev/commands/dev-security-review.md` | `dev-security-review` | `src/codex/dev/skills/dev-security-review/SKILL.md` | `skill` | `required` | `dev-security-reviewer` | 보안 검토 entry는 Codex에서도 필요하다. |
| `src/claude/dev/commands/dev-sync-docs.md` | `dev-sync-docs` | `src/codex/dev/skills/dev-sync-docs/SKILL.md` | `skill` | `optional` | `dev-doc-updater` | docs sync는 보조 maintenance workflow다. |
| `src/claude/dev/commands/dev-sync.md` | `dev-sync` | `src/codex/dev/skills/dev-sync/SKILL.md` | `skill` | `optional` | `dev-doc-updater` | pull+docs sync 운영 유틸리티다. |
| `src/claude/dev/commands/dev-test-verify.md` | `dev-test-verify` | `src/codex/dev/skills/dev-test-verify/SKILL.md` | `skill` | `optional` | `dev-verification-engine` | 세부 검증 utility이며 기본 verify parity의 필수 entry는 아니다. |
| `src/claude/dev/commands/dev-verify-all.md` | `dev-verify-all` | `src/codex/dev/skills/dev-verify-all/SKILL.md` | `skill` | `optional` | `dev-verification-engine` | aggregate verify utility다. |
| `src/claude/dev/commands/dev-verify-fe.md` | `dev-verify-fe` | `src/codex/dev/skills/dev-verify-fe/SKILL.md` | `skill` | `optional` | `dev-verification-engine` | frontend-specific verify utility다. |
| `src/claude/dev/commands/dev-verify.md` | `dev-verify` | `src/codex/dev/skills/dev-verify/SKILL.md` | `skill` | `required` | `dev-verify-agent` | 핵심 verify entry이므로 필수다. |
| `src/claude/plan/commands/plan-archive.md` | `plan-archive` | `src/codex/plan/skills/plan-archive/SKILL.md` | `skill` | `optional` | `plan-archive-workflow` | post-delivery workflow이며 초기 planning parity의 필수 entry는 아니다. |
| `src/claude/plan/commands/plan-bridge.md` | `plan-bridge` | `src/codex/plan/skills/plan-bridge/SKILL.md` | `skill` | `required` | plan skill set | planning에서 dev로 넘어가는 핵심 entry다. |
| `src/claude/plan/commands/plan-draft.md` | `plan-draft` | `src/codex/plan/skills/plan-draft/SKILL.md` | `skill` | `required` | plan skill set | P3 진입점이므로 필수다. |
| `src/claude/plan/commands/plan-idea.md` | `plan-idea` | `src/codex/plan/skills/plan-idea/SKILL.md` | `skill` | `required` | `plan-idea-collector` | planning pipeline 시작점이다. |
| `src/claude/plan/commands/plan-improve.md` | `plan-improve` | `src/codex/plan/skills/plan-improve/SKILL.md` | `skill` | `optional` | `plan-archive-workflow` | archive 이후 운영 기능이며 초기 parity에서 반드시 요구되지는 않는다. |
| `src/claude/plan/commands/plan-prd.md` | `plan-prd` | `src/codex/plan/skills/plan-prd/SKILL.md` | `skill` | `required` | `plan-prd-writer` | PRD 작성 핵심 entry다. |
| `src/claude/plan/commands/plan-review.md` | `plan-review` | `src/codex/plan/skills/plan-review/SKILL.md` | `skill` | `required` | `plan-reviewer` | planning review entry로 중요하다. |
| `src/claude/plan/commands/plan-screen.md` | `plan-screen` | `src/codex/plan/skills/plan-screen/SKILL.md` | `skill` | `required` | `plan-idea-screener` | screening 게이트 entry이므로 필수다. |
| `src/claude/plan/commands/plan-stitch.md` | `plan-stitch` | `src/codex/plan/skills/plan-stitch/SKILL.md` | `skill` | `required` | `plan-stitch-integrator` | stitch 통합 entry다. |
| `src/claude/plan/commands/plan-wireframe.md` | `plan-wireframe` | `src/codex/plan/skills/plan-wireframe/SKILL.md` | `skill` | `required` | `plan-wireframe-designer` | wireframe 설계 entry다. |

### skills

| Claude source path | 기능 identity | primary Codex sibling path | target surface | 판정 | companion / shared consumer | 이유 |
|------|------|---------------------------|----------------|------|-----------------------------|------|
| `src/claude/core/skills/continuous-learning/SKILL.md` | `continuous-learning` | `src/codex/core/skills/continuous-learning/SKILL.md` | `skill` | `optional` | learning/audit tooling | 메타 학습 성격이 강하며 초기 Codex parity의 필수 범위는 아니다. |
| `src/claude/core/skills/session-wrap/SKILL.md` | `session-wrap` | `src/codex/core/skills/session-wrap/SKILL.md` | `skill` | `required` | end-of-session workflows | session 종료 정리는 Codex에서도 직접 가치가 있다. |
| `src/claude/dev/skills/dev-architecture-decision/SKILL.md` | `dev-architecture-decision` | `src/codex/dev/skills/dev-architecture-decision/SKILL.md` | `skill` | `required` | `dev-architecture` | 구조 SSOT와 binding을 지지하는 핵심 skill이다. |
| `src/claude/dev/skills/dev-domain-modeling/SKILL.md` | `dev-domain-modeling` | `src/codex/dev/skills/dev-domain-modeling/SKILL.md` | `skill` | `optional` | domain-heavy projects | 전문 modeling guidance이며 없어도 기본 dev parity는 유지된다. |
| `src/claude/dev/skills/dev-feature-module/SKILL.md` | `dev-feature-module` | `src/codex/dev/skills/dev-feature-module/SKILL.md` | `skill` | `required` | `dev-feature`, `dev-run` | feature 구조 계약의 핵심이다. |
| `src/claude/dev/skills/dev-feature-plan/SKILL.md` | `dev-feature-plan` | `src/codex/dev/skills/dev-feature-plan/SKILL.md` | `skill` | `required` | `dev-feature` | PRD -> Feature Overview 변환을 지지한다. |
| `src/claude/dev/skills/dev-frontend-patterns/SKILL.md` | `dev-frontend-patterns` | `src/codex/dev/skills/dev-frontend-patterns/SKILL.md` | `skill` | `optional` | frontend tasks | 도메인 특화 guidance다. |
| `src/claude/dev/skills/dev-layered-architecture/SKILL.md` | `dev-layered-architecture` | `src/codex/dev/skills/dev-layered-architecture/SKILL.md` | `skill` | `required` | `dev-review`, `dev-architecture` | 구조 규칙 SSOT 성격이 강하다. |
| `src/claude/dev/skills/dev-observability/SKILL.md` | `dev-observability` | `src/codex/dev/skills/dev-observability/SKILL.md` | `skill` | `optional` | observability tasks | 범용성은 있지만 기본 dev parity를 구성하는 필수 skill은 아니다. |
| `src/claude/dev/skills/dev-refactoring/SKILL.md` | `dev-refactoring` | `src/codex/dev/skills/dev-refactoring/SKILL.md` | `skill` | `optional` | `dev-refactor` | refactoring support skill이다. |
| `src/claude/dev/skills/dev-security-pipeline/SKILL.md` | `dev-security-pipeline` | `src/codex/dev/skills/dev-security-pipeline/SKILL.md` | `skill` | `required` | `dev-security-review` | 보안 검증 흐름의 핵심 skill이다. |
| `src/claude/dev/skills/dev-tdd-workflow/SKILL.md` | `dev-tdd-workflow` | `src/codex/dev/skills/dev-tdd-workflow/SKILL.md` | `skill` | `required` | `dev-run` | 구현 루프의 핵심이다. |
| `src/claude/dev/skills/dev-testing-backend/SKILL.md` | `dev-testing-backend` | `src/codex/dev/skills/dev-testing-backend/SKILL.md` | `skill` | `optional` | backend verification | 전문 testing guidance다. |
| `src/claude/dev/skills/dev-testing-e2e/SKILL.md` | `dev-testing-e2e` | `src/codex/dev/skills/dev-testing-e2e/SKILL.md` | `skill` | `optional` | e2e verification | 전문 testing guidance다. |
| `src/claude/dev/skills/dev-testing-frontend/SKILL.md` | `dev-testing-frontend` | `src/codex/dev/skills/dev-testing-frontend/SKILL.md` | `skill` | `optional` | frontend verification | 전문 testing guidance다. |
| `src/claude/dev/skills/dev-verification-engine/SKILL.md` | `dev-verification-engine` | `src/codex/dev/skills/dev-verification-engine/SKILL.md` | `skill` | `required` | `dev-verify`, `dev-handoff-verify` | 검증 workflow의 중심 skill이다. |
| `src/claude/dev/skills/dev-workflow/SKILL.md` | `dev-workflow` | `src/codex/dev/skills/dev-workflow/SKILL.md` | `skill` | `required` | `dev-run` | 구현 workflow의 핵심 skill이다. |
| `src/claude/plan/skills/plan-archive-workflow/SKILL.md` | `plan-archive-workflow` | `src/codex/plan/skills/plan-archive-workflow/SKILL.md` | `skill` | `optional` | `plan-archive`, `plan-improve` | P8 운영 흐름이며 core planning parity의 필수 범위는 아니다. |
| `src/claude/plan/skills/plan-idea-management/SKILL.md` | `plan-idea-management` | `src/codex/plan/skills/plan-idea-management/SKILL.md` | `skill` | `required` | `plan-idea` | planning pipeline 시작단의 핵심 skill이다. |
| `src/claude/plan/skills/plan-pipeline/SKILL.md` | `plan-pipeline` | `src/codex/plan/skills/plan-pipeline/SKILL.md` | `skill` | `required` | multiple plan commands | planning 전체 orchestration 기준이다. |
| `src/claude/plan/skills/plan-prd-authoring/SKILL.md` | `plan-prd-authoring` | `src/codex/plan/skills/plan-prd-authoring/SKILL.md` | `skill` | `required` | `plan-prd` | PRD 작성 기준 문서다. |
| `src/claude/plan/skills/plan-review-criteria/SKILL.md` | `plan-review-criteria` | `src/codex/plan/skills/plan-review-criteria/SKILL.md` | `skill` | `required` | `plan-review` | PCC/review 기준의 핵심 skill이다. |
| `src/claude/plan/skills/plan-screening-workflow/SKILL.md` | `plan-screening-workflow` | `src/codex/plan/skills/plan-screening-workflow/SKILL.md` | `skill` | `required` | `plan-screen` | screening 기준과 흐름을 담는다. |
| `src/claude/plan/skills/plan-stitch-workflow/SKILL.md` | `plan-stitch-workflow` | `src/codex/plan/skills/plan-stitch-workflow/SKILL.md` | `skill` | `required` | `plan-stitch` | stitch 통합 흐름을 담는다. |
| `src/claude/plan/skills/plan-wireframe-design/SKILL.md` | `plan-wireframe-design` | `src/codex/plan/skills/plan-wireframe-design/SKILL.md` | `skill` | `required` | `plan-wireframe` | wireframe 설계 기준 skill이다. |

### hooks

| Claude source path | 기능 identity | primary Codex sibling path | target surface | 판정 | companion / shared consumer | 이유 |
|------|------|---------------------------|----------------|------|-----------------------------|------|
| `src/claude/core/hooks/code-quality-reminder.js` | `code-quality-reminder` | `src/codex/core/hooks/code-quality-reminder.js` | `hook` | `optional` | `src/codex/core/hooks/code-quality-reminder.hook.json` -> `.codex/hooks.json` | reminder 성격의 hook이며 기본 parity에 반드시 포함되지는 않는다. |
| `src/claude/core/hooks/edit-tracker.js` | `edit-tracker` | `src/codex/core/hooks/edit-tracker.js` | `hook` | `required` | `src/codex/core/hooks/edit-tracker.hook.json` -> `.codex/hooks.json` | 변경 추적은 메타 툴과 audit에 직접 도움이 된다. |
| `src/claude/core/hooks/output-secret-filter.js` | `output-secret-filter` | `src/codex/core/hooks/output-secret-filter.js` | `hook` | `required` | `src/codex/core/hooks/output-secret-filter.hook.json` -> `.codex/hooks.json` | 민감정보 필터는 Codex에서도 기본 parity에 포함해야 한다. |
| `src/claude/core/hooks/security-auto-trigger.js` | `security-auto-trigger` | `src/codex/core/hooks/security-auto-trigger.js` | `hook` | `required` | `src/codex/core/hooks/security-auto-trigger.hook.json` -> `.codex/hooks.json`, `dev-security-review` | 보안 민감 변경 탐지는 유지 가치가 크다. |
| `src/claude/core/hooks/session-wrap-suggest.js` | `session-wrap-suggest` | `--` | `skip` | `skip` | `session-wrap` skill | 종료 시점 제안은 explicit skill 호출로 대체한다. |
| `src/claude/dev/hooks/dev-db-guard.js` | `dev-db-guard` | `src/codex/dev/hooks/dev-db-guard.js` | `hook` | `required` | `src/codex/dev/hooks/dev-db-guard.hook.json` -> `.codex/hooks.json` | 위험한 DB 명령 차단은 guard로 유지한다. |
| `src/claude/dev/hooks/dev-feature-scope-guard.js` | `dev-feature-scope-guard` | `src/codex/dev/hooks/dev-feature-scope-guard.js` | `hook` | `optional` | `src/codex/dev/hooks/dev-feature-scope-guard.hook.json` -> `.codex/hooks.json` | 현재 Claude에서도 미등록이며 초기 parity에 반드시 포함되지는 않는다. |
| `src/claude/dev/hooks/dev-tdd-guard.js` | `dev-tdd-guard` | `src/codex/dev/hooks/dev-tdd-guard.js` | `hook` | `required` | `src/codex/dev/hooks/dev-tdd-guard.hook.json` -> `.codex/hooks.json` | 구현 전 테스트 보장 가드로 가치가 높다. |
| `src/claude/plan/hooks/plan-doc-guard.js` | `plan-doc-guard` | `src/codex/plan/hooks/plan-doc-guard.js` | `hook` | `required` | `src/codex/plan/hooks/plan-doc-guard.hook.json` -> `.codex/hooks.json` | planning 단계 소스 수정 차단 가드다. |

### instruction rules

| Claude source path | 기능 identity | primary Codex sibling path | target surface | 판정 | companion / shared consumer | 이유 |
|------|------|---------------------------|----------------|------|-----------------------------|------|
| `src/claude/core/rules/coding-style.md` | `coding-style` | `--` | `AGENTS.md` | `shared-guidance` | `AGENTS.md` synthesis | Claude와 Codex 모두에 필요한 공통 지침이다. |
| `src/claude/core/rules/date-calculation.md` | `date-calculation` | `--` | `AGENTS.md` | `shared-guidance` | `AGENTS.md` synthesis | 공통 작업 규칙이므로 shared guidance로 둔다. |
| `src/claude/core/rules/golden-principles.md` | `golden-principles` | `--` | `AGENTS.md` | `shared-guidance` | `AGENTS.md` synthesis | 공통 기본 원칙이다. |
| `src/claude/core/rules/interaction.md` | `interaction` | `--` | `AGENTS.md` | `shared-guidance` | `AGENTS.md` synthesis | 상호작용 규칙은 공통 guidance로 소비한다. |
| `src/claude/core/rules/security.md` | `security` | `--` | `AGENTS.md` | `shared-guidance` | `AGENTS.md` synthesis | 보안 기본 규칙은 shared guidance로 유지한다. |
| `src/claude/core/rules/verification.md` | `verification` | `--` | `AGENTS.md` | `shared-guidance` | `AGENTS.md` synthesis | evidence-based verification 규칙은 공통 guidance다. |

## 완료 기준

- `src/claude`의 모든 기능이 `required`, `optional`, `shared-guidance`, `skip` 중 하나로 결정된다.
- `src/codex`에 실제로 어떤 폴더/파일군이 필요할지 구현자가 바로 볼 수 있다.
- `13`에서 메타 툴 확장 범위를 결정할 수 있다.

## 다음 문서

- 기능 차이 비교: [12-claude-codex-diff-matrix.md](./12-claude-codex-diff-matrix.md)
