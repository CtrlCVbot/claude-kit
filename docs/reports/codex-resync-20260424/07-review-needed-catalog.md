# 07. REVIEW NEEDED Catalog

> **재생성된 Codex 파일 29개에 `<!-- REVIEW NEEDED: ... -->` marker 가 삽입되어 있다.** 이 문서는 각 marker 파일의 검토 포인트와 판정 기준을 안내한다.

## 전체 Marker 분포

| Marker 종류 | 개수 | 의미 |
|------------|:---:|------|
| write-capable agent | 13 | `tools:` 에 `Write|Edit|Bash` 보유 → Codex 권한 모델 재확인 필요 |
| paired-review strategy | 15 | `codex-portability.json` 에서 `paired-review` → Codex runtime 실제 동작 검증 필요 |
| **둘 다 (중복 marker)** | 1 | `copy-reference-baseline` (write-capable + paired-review) |
| **고유 파일 합계** | **29** | |

## 어떻게 검토하나 (공통 가이드)

각 marker 파일을 검토할 때:

1. **파일 상단 marker 확인** — 어떤 종류의 REVIEW 인지 파악
2. **Claude 원본 대비 diff** — `diff src/claude/<path> src/codex/<path>` 로 변환 결과 확인
3. **Codex runtime 동작 가설** — 해당 기능이 Codex 에서 의도대로 동작하는가?
   - agent: `tools:` 필드의 권한이 Codex 에서 동일하게 해석되는가?
   - command: slash command 파싱이 동일한가?
   - skill: 디렉토리 기반 skill 을 Codex 가 인식하는가?
4. **실제 테스트** — 가능하면 Codex 환경에서 직접 호출하여 결과 확인
5. **판정** — PASS / FAIL / DEFER
   - PASS: marker 제거 + `kit-convert generated:` marker 만 남김
   - FAIL: exception-registry 에 등록 + pairing-registry status 변경
   - DEFER: 추가 정보 필요 → 별도 이슈 추적

## Part A. Write-capable Agent 13개

이 에이전트들은 `tools:` 필드에 `Write` 또는 `Edit` (및 `Bash`) 를 포함한다. Codex runtime 이 동일한 권한 모델을 지원하는지 확인 필요.

### dev 도메인 (5)

| # | 파일 | 확인할 것 |
|:---:|------|----------|
| 1 | [dev-database-reviewer.md](../../../src/codex/dev/agents/dev-database-reviewer.md) | DB 마이그레이션 파일 작성 권한. 특히 `src/migrations/` 경로 제한 |
| 2 | [dev-doc-updater.md](../../../src/codex/dev/agents/dev-doc-updater.md) | docs / CODEMAPS / README 편집 범위 |
| 3 | [dev-implementer.md](../../../src/codex/dev/agents/dev-implementer.md) | `/dev-run` 기본 디스패치. 소스 파일 전범위 편집 가능 |
| 4 | [dev-security-reviewer.md](../../../src/codex/dev/agents/dev-security-reviewer.md) | 보안 fix 작성. 민감한 코드 경로 편집 |
| 5 | [dev-verify-agent.md](../../../src/codex/dev/agents/dev-verify-agent.md) | 검증 루프 (라운드당 ≤10 파일) |

### plan 도메인 (8)

| # | 파일 | 확인할 것 |
|:---:|------|----------|
| 6 | [plan-bridge-writer.md](../../../src/codex/plan/agents/plan-bridge-writer.md) | Feature Package 00-context / dev-tasks.md 생성 |
| 7 | [plan-design-writer.md](../../../src/codex/plan/agents/plan-design-writer.md) | Claude Design 2단계 프롬프트 작성 |
| 8 | [plan-draft-writer.md](../../../src/codex/plan/agents/plan-draft-writer.md) | 1차 기능 기획 drafts / {slug}/01-draft.md 생성 |
| 9 | [plan-idea-collector.md](../../../src/codex/plan/agents/plan-idea-collector.md) | IDEA 파일 생성 + backlog 갱신 |
| 10 | [plan-idea-screener.md](../../../src/codex/plan/agents/plan-idea-screener.md) | SCREENING 파일 생성 |
| 11 | [plan-prd-writer.md](../../../src/codex/plan/agents/plan-prd-writer.md) | drafts / {slug}/02-prd.md 생성 |
| 12 | [plan-stitch-integrator.md](../../../src/codex/plan/agents/plan-stitch-integrator.md) | Stitch 시안 통합 Feature Package 작성 |
| 13 | [plan-wireframe-designer.md](../../../src/codex/plan/agents/plan-wireframe-designer.md) | 와이어프레임 파일 생성 |

**Part A 공통 검토 포인트**:
- Codex subagent spec 의 `tools` 필드 의미가 Claude Code 와 동일한가?
- `Bash` 도구는 Codex 에서 sandbox 제약이 있는가?
- 에이전트가 수정 대상 파일 경로를 정확히 준수하는지 (File Ownership Matrix 와 비교)

## Part B. Paired-review Strategy 15개 (copy 도메인)

copy 도메인의 모든 paired 자산 (16개 중 15개, 중복 1개 제외) 은 paired-review. Codex runtime 검증이 필요한 이유는:
- copy 도메인이 2026-04 최근 도입된 기능이며
- 시나리오 A/B/C 분기 로직과 evidence 관리 시스템이 Codex 에 아직 적용 안 됨

### Agents (3, + baseline 1 = 총 4)

| # | 파일 | 확인할 것 |
|:---:|------|----------|
| 1 | [copy-fidelity.md](../../../src/codex/copy/agents/copy-fidelity.md) | Visual gap 분석 | 
| 2 | [copy-interaction-fidelity.md](../../../src/codex/copy/agents/copy-interaction-fidelity.md) | Interaction gap 분석 |
| 3 | [copy-qa-reviewer.md](../../../src/codex/copy/agents/copy-qa-reviewer.md) | 최종 QA 리뷰 |
| 4 | **[copy-reference-baseline.md](../../../src/codex/copy/agents/copy-reference-baseline.md)** | **중복 marker** — write-capable + paired-review. evidence 수집 (PNG 파일 write 권한 필요). |

### Commands (7)

| # | 파일 | 확인할 것 |
|:---:|------|----------|
| 5 | [copy-reference-refresh.md](../../../src/codex/copy/commands/copy-reference-refresh.md) | evidence 캡처 재실행 |
| 6 | [copy-visual-review.md](../../../src/codex/copy/commands/copy-visual-review.md) | visual fidelity 검증 |
| 7 | [copy-interaction-review.md](../../../src/codex/copy/commands/copy-interaction-review.md) | interaction fidelity 검증 |
| 8 | [copy-gap-board.md](../../../src/codex/copy/commands/copy-gap-board.md) | 갭 통합 보드 생성 |
| 9 | [copy-plan-unit.md](../../../src/codex/copy/commands/copy-plan-unit.md) | Execution Unit 계획 |
| 10 | [copy-verify.md](../../../src/codex/copy/commands/copy-verify.md) | 통합 검증 |
| 11 | [copy-closeout.md](../../../src/codex/copy/commands/copy-closeout.md) | 결과 확정 |

### Skills (5)

| # | 파일 | 확인할 것 |
|:---:|------|----------|
| 12 | [copy-pipeline/SKILL.md](../../../src/codex/copy/skills/copy-pipeline/SKILL.md) | 전체 파이프라인 오케스트레이션 |
| 13 | [copy-evidence-management/SKILL.md](../../../src/codex/copy/skills/copy-evidence-management/SKILL.md) | evidence manifest + 파일 네이밍 |
| 14 | [copy-gap-analysis/SKILL.md](../../../src/codex/copy/skills/copy-gap-analysis/SKILL.md) | 갭 분석 |
| 15 | [copy-qa-workflow/SKILL.md](../../../src/codex/copy/skills/copy-qa-workflow/SKILL.md) | QA 워크플로우 |
| 16 | [copy-closeout-workflow/SKILL.md](../../../src/codex/copy/skills/copy-closeout-workflow/SKILL.md) | closeout 워크플로우 |

**Part B 공통 검토 포인트**:
- scenario A/B/C 분기가 Codex runtime 에서 동일하게 동작하는가?
- evidence 파일 (PNG, manifest.json) 의 경로 규칙이 Codex 에도 유효한가?
- `SITE_VARIANT`, `SITE_VARIANT_HOST_MAP` 환경변수 의존성이 Codex 환경에서 어떻게 처리되는가?
- commands 간 순서 강제 (`/copy-reference-refresh` → `/copy-visual-review` 등) 가 Codex runtime 에서 보장되는가?

## Part C. 중복 marker (1)

**`copy-reference-baseline.md`**: write-capable + paired-review 두 marker 가 모두 붙은 유일한 파일.

- write-capable 이유: `tools:` 에 `Write` 포함. PNG / manifest.json 등 evidence 파일 생성
- paired-review 이유: copy 도메인 전체가 paired-review strategy

검토 시 **Part A 공통 + Part B 공통** 양쪽 기준을 모두 적용.

## 추천 검토 순서

### 우선순위 1 (dev 도메인 write-capable 5개)

`src/claude/dev/agents/*` 는 이미 Claude Code 에서 안정 동작 중인 에이전트. Codex 에서도 동등 동작 가능성이 높아 빠른 PASS 판정 가능.

### 우선순위 2 (plan 도메인 write-capable 8개)

plan 도메인은 IDEA → PRD → Feature Package 파이프라인 핵심. Codex runtime 에서 `.plans/` 디렉토리 구조가 유효한지 확인 후 PASS.

### 우선순위 3 (copy 도메인 16개)

copy 도메인은 최근 도입 + Codex runtime 검증 경험 부족. 가장 많은 검토 시간 필요. scenario 분기와 evidence 시스템이 Codex 에서 어떻게 재현되는지 실험 필요.

## 예상 결과 분포 (추정)

실제 검토 후 대략적 분포 예상:

| 판정 | 추정 파일 수 | 근거 |
|------|:---:|------|
| PASS | ~20 | dev / plan 도메인 write-capable 에이전트는 claude-kit 내 안정 자산 |
| DEFER | ~7 | copy 파이프라인 일부는 scenario 분기 로직 확인 후 판단 가능 |
| FAIL | ~2 | write 경로가 Codex sandbox 에서 금지될 가능성이 있는 에이전트 |

실제 판정은 수동 검토 세션에서 결정. 이 섹션은 어디까지나 예비 힌트.

## 참조

- [02 Conversion Overview](02-conversion-overview.md) — Marker 시스템 설명
- [08 Exception Handling](08-exception-handling.md) — FAIL 판정 시 exception-registry 등록 방법
- [12 Followups](12-followups.md) — Codex runtime 검증 세션 설계
