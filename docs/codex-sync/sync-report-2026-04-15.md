# Codex 동기화 리포트

> 생성: 2026-04-15 | 상태: **승인 대기** | 실행자: /kit-analyze
>
> 이 리포트는 `docs/meta-tooling/13-sync-approval-and-full-port.md` Part 1 승인 게이트 워크플로우에 따라 생성되었다.
>
> 편집 메모: 이 문서는 2026-04-15 시점 판단을 보존하는 히스토리컬 스냅샷이다. 이후 공식 Codex 문서 재검토를 통해 `Stop` hook 존재, Codex `Rules`의 실제 의미, Hooks의 `experimental` 상태와 Windows 및 `Bash` 범위 제약에 대한 해석이 보정되었다. 최신 해석과 설계 제안은 `docs/codex-sync/00-overview.md`부터 이어지는 문서 세트를 우선한다. 다만 이 리포트의 집계 수치와 당시 판단 로그는 소급 수정하지 않는다.

---

## 요약

| 항목 | 건수 | 비율 |
|------|------|------|
| 전체 컴포넌트 | 83 | 100% |
| 이미 처리됨 (paired) | 1 | 1% |
| 전환 대상 (auto) | 60 | 72% |
| 전환 대상 (review) | 15 | 18% |
| 건너뛰기 (exception) | 7 | 9% |

**실제 전환 대상**: 75개 (60 auto + 15 review)
**건너뛰기**: 7개 (session-wrap-suggest + 6 rules)
**이미 처리**: 1개 (output-secret-filter)

---

## 타입별 집계

| 타입 | 전체 | Auto | Review | Skip | Paired |
|------|:----:|:----:|:------:|:----:|:------:|
| skill | 25 | 25 | 0 | 0 | 0 |
| agent | 12 | 3 | 9 | 0 | 0 |
| command | 31 | 25 | 6 | 0 | 0 |
| hook | 9 | 7 | 0 | 1 | 1 |
| rule | 6 | 0 | 0 | 6 | 0 |
| **합계** | **83** | **60** | **15** | **7** | **1** |

---

## 전환 대상 (Auto, 60개)

구조 변환만으로 충분. `--dry-run` 없이 바로 실행 가능.

### core (2 skills)

| Identity | Type | Domain |
|----------|------|--------|
| continuous-learning | skill | core |
| session-wrap | skill | core |

### dev (40개: 15 skills + 2 agents + 20 commands + 3 hooks)

#### Skills (15)

dev-architecture-decision, dev-domain-modeling, dev-feature-module, dev-feature-plan, dev-frontend-patterns, dev-layered-architecture, dev-observability, dev-refactoring, dev-security-pipeline, dev-tdd-workflow, dev-testing-backend, dev-testing-e2e, dev-testing-frontend, dev-verification-engine, dev-workflow

#### Agents (2, Read-Only)

| Identity | Model | 사유 |
|----------|-------|------|
| dev-architect | opus | tools에 Read/Grep/Glob만 |
| dev-code-reviewer | opus | tools에 Read/Grep/Glob만 |

#### Commands (20, 단순)

dev-architecture, dev-build-fix, dev-commit-push-pr, dev-commit, dev-continue, dev-feature, dev-refactor, dev-review, dev-run, dev-security-review, dev-sync, dev-test-verify, dev-verify-all, dev-verify-fe, dev-verify (+ 5 기타)

#### Hooks (3)

| Identity | Event | 사유 |
|----------|-------|------|
| dev-db-guard | PreToolUse | Codex hooks 호환 (Bash 매처) |
| dev-feature-scope-guard | PreToolUse | Codex hooks 호환 |
| dev-tdd-guard | PreToolUse | Codex hooks 호환 |

### plan (18개: 8 skills + 1 agent + 9 commands)

#### Skills (8)

plan-archive-workflow, plan-idea-management, plan-pipeline, plan-prd-authoring, plan-review-criteria, plan-screening-workflow, plan-stitch-workflow, plan-wireframe-design

#### Agents (1, Read-Only)

| Identity | Model | 사유 |
|----------|-------|------|
| plan-reviewer | opus | tools에 Read/Grep/Glob만 |

#### Commands (9, 단순)

plan-archive, plan-bridge, plan-draft, plan-idea, plan-improve, plan-prd, plan-review, plan-screen, plan-stitch, plan-wireframe

### core hooks (3)

| Identity | Event | 사유 |
|----------|-------|------|
| code-quality-reminder | PostToolUse | 플랫폼 독립적 |
| edit-tracker | PostToolUse | 플랫폼 독립적 |
| security-auto-trigger | PreToolUse | 플랫폼 독립적 |

---

## 전환 대상 (Review, 15개)

변환 후 수동 검토 필요. `REVIEW NEEDED` 마커가 자동 삽입됨.

### Write-capable Agents (9)

| Identity | Type | Domain | 사유 |
|----------|------|--------|------|
| dev-database-reviewer | agent | dev | tools에 Write/Edit 포함 |
| dev-doc-updater | agent | dev | tools에 Write/Edit 포함 |
| dev-security-reviewer | agent | dev | tools에 Write/Edit 포함 |
| dev-verify-agent | agent | dev | tools에 Write/Edit 포함 |
| plan-idea-collector | agent | plan | tools에 Write/Edit 포함 |
| plan-idea-screener | agent | plan | tools에 Write/Edit 포함 |
| plan-prd-writer | agent | plan | tools에 Write/Edit 포함 |
| plan-stitch-integrator | agent | plan | tools에 Write/Edit 포함 |
| plan-wireframe-designer | agent | plan | tools에 Write/Edit 포함 |

### Complex Commands (6)

| Identity | Type | Domain | 사유 |
|----------|------|--------|------|
| dev-checkpoint | command | dev | frontmatter + 8 phases |
| dev-explore | command | dev | frontmatter + 8 phases |
| dev-handoff-verify | command | dev | frontmatter + 6 phases |
| dev-learn | command | dev | frontmatter + 6 phases |
| dev-plan | command | dev | frontmatter + 4 phases |
| dev-sync-docs | command | dev | frontmatter + 10 phases |

---

## 건너뛰기 (Skip, 7개)

`src/exception-registry.json`에 active 상태로 등록됨. 변환 대상 제외.

| Identity | Type | Exception | 사유 |
|----------|------|-----------|------|
| session-wrap-suggest | hook | EX-001 active | Claude Stop 이벤트 + `~/.claude/.session-stats.json` 의존. Codex runtime에서 재현 불가. 스킬 전환은 13-sync §Part 2 보류 |
| coding-style | rule | EX-003 active | claude-origin shared guidance. AGENTS.md 소비 |
| date-calculation | rule | EX-004 active | claude-origin shared guidance |
| golden-principles | rule | EX-005 active | claude-origin shared guidance |
| interaction | rule | EX-006 active | claude-origin shared guidance |
| security | rule | EX-007 active | claude-origin shared guidance |
| verification | rule | EX-008 active | claude-origin shared guidance |

---

## 이미 처리됨 (Paired, 1개)

| Identity | Type | Claude | Codex | Status |
|----------|------|--------|-------|--------|
| output-secret-filter | hook | src/claude/core/hooks/output-secret-filter.js | src/codex/core/hooks/output-secret-filter.js | paired (EX-002 resolved) |

---

## 사용자 수정 영역

전환에서 **제외할 항목**에 `[x]` 체크하세요. 체크된 항목은 이번 sync에서 건너뜁니다.

### Auto 항목 (60개) — 기본 전환

- [ ] (체크하면 제외) core skills (2): continuous-learning, session-wrap
- [ ] (체크하면 제외) dev skills (15)
- [ ] (체크하면 제외) dev agents RO (2): dev-architect, dev-code-reviewer
- [ ] (체크하면 제외) dev commands 단순 (20)
- [ ] (체크하면 제외) dev hooks (3): dev-db-guard, dev-feature-scope-guard, dev-tdd-guard
- [ ] (체크하면 제외) plan skills (8)
- [ ] (체크하면 제외) plan agents RO (1): plan-reviewer
- [ ] (체크하면 제외) plan commands 단순 (9)
- [ ] (체크하면 제외) core hooks (3): code-quality-reminder, edit-tracker, security-auto-trigger

### Review 항목 (15개) — 수동 검토 필요

- [ ] (체크하면 제외) Write-capable agents (9)
- [ ] (체크하면 제외) Complex commands (6)

---

## 권장 실행 순서

파일럿 → skills → 단순 items → review items 순서로 점진 전환.

```bash
# 1단계: 파일럿 (auto agent 1개로 변환 품질 검증)
/kit-sync --dry-run --name dev-architect
/kit-sync --name dev-architect
/kit-validate dev-architect --target codex

# 2단계: skills 일괄 (25개, 모두 auto)
/kit-sync --type skill

# 3단계: Read-Only agents (3개)
/kit-sync --name dev-code-reviewer
/kit-sync --name plan-reviewer

# 4단계: 단순 commands (25개)
/kit-sync --type command  # review 6개는 별도 진행

# 5단계: hooks (7개, 호환 훅만)
/kit-sync --type hook

# 6단계: Review 항목 (15개, 수동 검토 후 커밋)
/kit-sync --domain dev  # write agents + complex commands
/kit-sync --domain plan

# 7단계: 최종 검증
/kit-audit --category C7  # 페어링 일관성
/kit-audit --category C8  # 교차 참조
/kit-list --target both --pairing
```

---

## 승인 방법

이 리포트를 검토한 후 다음 메시지로 응답하세요:

- **"승인"** 또는 **"진행"** → 위 계획대로 배치 전환 실행
- **"수정했음"** → 위 체크박스를 편집한 후 재제시
- **"거부"** 또는 **"중단"** → sync 중단 + 리포트에 사유 기록

> **주의**: 전체 75개 전환은 시간이 소요됩니다. 도메인별로 분할 실행(단계별 `/kit-sync --domain {domain}`)을 권장합니다.

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| 스캔 범위 | `src/claude/{core,dev,plan}/` |
| 제외 | `_archive/`, 이미 paired 항목 |
| Exception registry 로드 | 8개 엔트리 (1 resolved + 7 active) |
| Pairing registry 로드 | 1개 엔트리 (paired) |
| 난이도 판정 기준 | agent tools 배열, command frontmatter+phases, hook skip-registry, rule 전체 skip |
