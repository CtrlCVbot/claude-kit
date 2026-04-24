<!-- kit-convert generated: 2026-04-24 -->
# Epic/Feature/Task 계층 규칙

> **결론**: claude-kit v2.4.0 Hierarchical Plan Structure. Epic(대) / Feature(중) / Task(소) 3단 parent-child 계층. **Opt-in** 도입으로 기존 flat 구조와 100% 호환. Over-engineering 방지를 위해 Epic 생성 기준과 금지 사항을 명시.

**스펙**: `docs/plan/kit-2.4.0-roadmap/01-계층-설계.md` + `docs/plan/kit-2.4.0-roadmap/03-kit-반영-포인트.md`
**관련 skill**: `src/claude/plan/skills/plan-epic-workflow/SKILL.md`
**관련 command**: `src/claude/plan/commands/plan-epic.md`
**관련 hook**: `src/claude/plan/hooks/plan-epic-integrity.js` (Phase 2 disable 기본)

---

## 1. 계층 정의

| 계층 | 이름 | 단위 기간 | ID 규칙 | 파일 경로 |
|:---:|---|:---:|---|---|
| 대 | **Epic** | 1~3개월 | `EPIC-{YYYYMMDD}-{NNN}` | `.plans/epics/{status}/EPIC-.../` |
| 중 | **Feature** | 1~4주 | `IDEA-{YYYYMMDD}-{NNN}` + `{slug}` | `.plans/features/active/{slug}/` (기존 유지) |
| 소 | **Task** | 0.5~2일 | `T-{AREA}-{NN}` (기존) | `dev-tasks.md` (기존 유지) |

- **Feature** = 기존 IDEA 단계 + Feature Package 단계 통합 용어 (변경 없음)
- **Task** 규칙은 `task-id-naming.md` (IMP-KIT-015) 와 호환

---

## 2. Epic 생성 기준 (3 중 하나 이상 충족)

1. **3개 이상 Feature 가 같은 제품 Theme**
   - 예: OPTIC Landing 제품 라인 (OLP + DASH + DASH3 + Phase 4)
2. **여러 Feature 에 걸친 cross-cutting 요구사항**
   - 예: "접근성 WCAG AA 준수" 가 여러 Feature 에 동시 적용
3. **Feature 간 명시적 순서·의존성 관리 필요**
   - 예: "Feature A/B 병렬 → C 순차 → D 단독" 실행 플랜

**위 3가지 중 하나도 해당하지 않으면 Epic 을 생성하지 않는다** (독립 Feature 로 유지).

---

## 3. Opt-in 원칙

- 모든 Feature 가 Epic 에 속할 필요 **없음**
- Epic 이 없는 Feature 는 **기존 flat 구조** 와 완전히 동일 동작
- `--epic=EPIC-...` 파라미터는 **optional** (지정하지 않으면 독립 Feature)
- 기존 사용자 경험 (`/plan-idea`, `/plan-screen`, `/plan-draft` 등) 100% 하위 호환

---

## 4. 상태 머신

```
draft → planning → active → completed → archived
```

| 상태 | 진입 조건 | 디렉터리 |
|:---:|---|---|
| draft | Epic 제목만 결정 | `.plans/epics/00-draft/` |
| planning | Epic Brief + Children Features 작성 완료 + 자식 IDEA 최소 1건 등록 | `.plans/epics/10-planning/` |
| active | 자식 Feature 중 최소 1건 구현 시작 | `.plans/epics/20-active/` |
| completed | 모든 자식 Feature completed (archive 직전) | `.plans/epics/30-completed/` |
| archived | 번들화 + 인덱스 등록 완료 | `.plans/epics/90-archive/` |

### 4-1. 파일 이동 방법 (git mv vs mv)

> **T-EPMV-02 — N-09 대응**. `/plan-epic advance` 실행 시 Epic 디렉터리 이동의 tracked/untracked 분기.

#### 기본: `git mv`

Epic 파일이 git tracked 상태이면 `git mv` 사용 (이력 보존).

```bash
git mv .plans/epics/{prev-state}/EPIC-{ID}/ .plans/epics/{new-state}/EPIC-{ID}/
```

#### Fallback: 일반 `mv`

`git mv` 실패 시 (`fatal: source directory is empty` 등) 일반 `mv` 로 이동.

- **발생 조건**: `.plans/` 가 아직 커밋 전이거나 `.gitignore` 에 포함된 경우
- **대응**: `git ls-files` 로 tracked 여부 확인 후 자동 분기
- **주의**: 일반 `mv` 는 git 이력 추적 단절 — 이후 커밋 시 delete+add 로 인식

#### 자동 분기 로직 (`/plan-epic advance` 내부)

```bash
# tracked 여부 확인
if git ls-files "$SRC_DIR" 2>/dev/null | grep -q .; then
  git mv "$SRC_DIR" "$DST_DIR" || mv "$SRC_DIR" "$DST_DIR"   # git mv 실패 시 2차 fallback
else
  mv "$SRC_DIR" "$DST_DIR"
fi
```

advance 보고는 사용된 이동 방법을 명시 (예: `이동 방법: mv (tracked 전)` 또는 `git mv (이력 보존)`).

### 4-2. 상태 전이 게이트 조건 (자동 검증)

> **T-EPMV-03 — N-07 대응**. `/plan-epic advance` 가 자동 검증하는 게이트 조건. 미충족 시 HARD FAIL + `--force` 옵션 안내.

| 전이 | 게이트 조건 | 검증 명령 |
|------|-----------|---------|
| `draft → planning` | `00-epic-brief.md` + `01-children-features.md` 존재 + 자식 IDEA frontmatter `Epic: EPIC-{ID}` 파일 ≥ 1 | `grep -l "Epic: EPIC-{ID}" .plans/ideas/**/IDEA-*.md \| wc -l ≥ 1` |
| `planning → active` | 자식 Feature 중 IDEA frontmatter `상태: approved` 인 파일 ≥ 1 | `grep -l "상태: approved" .plans/ideas/**/IDEA-*.md (+ Epic 연결 조건) \| wc -l ≥ 1` |
| `active → completed` | 모든 자식 Feature 가 archived 상태 (IDEA frontmatter `상태: archived`) | 자식 목록 전체 check |
| `completed → archived` | 인덱스 갱신 + archive 디렉터리 생성 준비 | 내부 절차 |

#### 미충족 시 에러 메시지 포맷

```
ERROR: 게이트 미충족 — {전이 방향}
조건: {구체 조건}
현재: {관측된 값}
SUGGEST: {권장 다음 커맨드}
USE --force TO OVERRIDE (Critical checkpoint 로그 기록)
```

#### `--force` 사용 시

- Critical checkpoint 타입 (`critical-checkpoints.json` 참조) → `autoProceedOnPass` 무관 항상 사용자 경고 표시
- 사용자 명시 Y 입력 후에만 진행
- 로그: `~/.claude/logs/checkpoints.jsonl` 에 `{type: "critical-force", gate_condition: "..."}` 기록

---

## 5. IDEA 상태 vs Feature 상태 (SSOT)

> **T-FSTATE-02 — N-13 대응**. "상태" 라는 용어가 IDEA 레벨(4 종)과 Feature 레벨(4 종) 두 차원에 존재. 혼동 방지를 위해 본 섹션을 SSOT 로 지정한다. §4 의 **Epic 상태**(5 종) 와는 독립된 차원이다.

### 5-1. IDEA 상태 (IDEA frontmatter — SSOT)

| 상태 | 의미 | Trigger |
|:---:|---|---|
| `inbox` | 등록만, 아직 평가 전 | `/plan-idea` (plan-idea-collector) |
| `screened` | 스크리닝 완료, 사용자 판정 대기 | `/plan-screen` (plan-idea-screener) |
| `approved` | 사용자 Go 승인, Feature 로 진행 | Critical checkpoint 사용자 Y 입력 |
| `archived` | 완료 후 아카이브 | `/plan-archive {slug}` |

**SSOT 위치**: IDEA 파일 frontmatter 의 `상태:` (또는 `status:`) 필드.

### 5-2. Feature 상태 (Feature Package 레벨 — 파생, 자동 동기)

| 상태 | 의미 | Trigger |
|:---:|---|---|
| `pending` | IDEA 등록 ~ 스크리닝 단계 | IDEA 상태 inbox/screened 시 자동 |
| `approved` | IDEA approved 와 1:1 동기 | IDEA approved 전이와 동기 (plan-state-sync.js, T-FSTATE-01) |
| `active` | 구현 진행 중 (TASK 생성 후) | `/dev-feature {path}` 호출 |
| `archived` | 구현 완료 + 아카이브 | IDEA archived 전이와 동기 |

Feature 상태는 **Feature Package** 레벨의 상태이며, `01-children-features.md` §1 F{N} 의 `**상태**` 필드와 `08-epic-binding.md` §7 에 반영.

### 5-3. 교차 관계 (상태 매핑)

| IDEA 상태 | Feature 상태 | 전이 시점 |
|-----------|------------|---------|
| inbox | pending | IDEA 등록 시 |
| screened | pending (변화 없음) | 스크리닝 완료 시 (Feature 관점 미변경) |
| approved | approved (1:1 동기) | 사용자 Go 승인 시 |
| (approved) | **active** | `/dev-feature` 호출 시 (IDEA 는 approved 유지) |
| archived | archived | `/plan-archive` 시 |

Feature `active` 상태는 IDEA `approved` 하위 단계 — IDEA 가 여러 Feature 로 분해되는 경우는 **없음** (1:1 원칙).

### 5-4. 상태 전이 다이어그램

```
IDEA:     inbox → screened → approved ──────────────→ archived
                                ↓ (1:1 자동 동기)
Feature:  pending → pending → approved
                                ↓ (/dev-feature 호출)
                              active
                                ↓ (/plan-archive)
                              archived
```

### 5-5. 상태 동기 주체 (SSOT 원칙)

- **IDEA frontmatter** 가 **Single Source of Truth**
- `plan-state-sync.js` hook (T-FSTATE-01, **구현 완료**) 이 3 곳 자동 갱신:
  - `.plans/ideas/backlog.md` 행의 상태 컬럼
  - `.plans/epics/*/EPIC-*/01-children-features.md` §1 F{N} 의 `**상태**` 필드
  - `.plans/features/active/{slug}/00-context/08-epic-binding.md` §7 상태 동기 표
- `/dev-feature` 호출 시 Feature 상태만 `approved → active` 전이 (IDEA 상태는 그대로 `approved`)

**구현 위치**:

- Core 순수 함수: `src/claude/plan/hooks/_plan-state-sync-core.js` (parseFrontmatter / updateBacklogRow / updateChildrenFeatureState / appendBindingSyncRow / decideStateSync)
- Hook entrypoint: `src/claude/plan/hooks/plan-state-sync.js` (PostToolUse Edit|Write 매처, lockfile + 순차 쓰기 + 실패 시 롤백)
- Trigger 경로: `.plans/ideas/**/IDEA-*.md` 매칭 (Unix/Windows 경로 모두 지원)
- 비활성화: 환경변수 `CLAUDE_DISABLE_PLAN_STATE_SYNC=1`
- 로그: `~/.claude/logs/state-sync.jsonl` (synced / skipped / lock-failed / error 이벤트)
- 테스트: 49 건 (core 32 + hook 12 + integration 5) — TDD 완주

### 5-6. 에이전트 책임

| 에이전트 | 권한 |
|---------|------|
| `plan-idea-collector` | IDEA `inbox` 상태로 생성 |
| `plan-idea-screener` | `inbox → screened` 전이 |
| (메인 세션) | `screened → approved` (사용자 Critical checkpoint Y 입력 후) |
| `plan-state-sync.js` | IDEA 상태 변경 감지 → 3 곳 자동 동기 |
| `/dev-feature` | Feature 상태 `approved → active` (IDEA 상태 불변) |
| `/plan-archive` | IDEA `approved → archived` + Feature `active → archived` |

---

## 6. 금지 사항 (설계 원칙)

| 금지 | 사유 |
|---|---|
| Epic 간 parent-child 관계 (4단 계층) | 복잡도 기하급수 증가. 설계상 영구 금지 |
| 한 Feature 를 여러 Epic 에 primary 연결 | 1:1 원칙. 필요 시 primary 1건 + 참조(soft link) 다수 |
| Feature 2개 미만으로 Epic 생성 | Over-engineering. §2 의 3 기준 중 하나도 충족 못 함 |
| 강제 마이그레이션 (기존 archive 재구성) | 원본 불변성 + Opt-in 원칙 위반 |
| Epic Brief 없이 `/plan-epic advance` | draft → planning 진입 게이트 미충족 |

---

## 7. 권장 사항

- **제품 라인 관리**: landing 의 OLP/DASH/DASH3 묶음 같은 제품 시리즈 → Epic 사용
- **Cross-cutting 요구사항**: 접근성·국제화·성능 예산 등 여러 Feature 에 걸친 Theme → Epic 사용
- **소규모 bug fix / 라벨 변경**: 독립 Feature 로 유지, Epic 없음
- **탐색적·실험적 Feature**: 초기엔 독립, 다수 후속 Feature 가 생기면 소급 Epic 생성 (`/plan-epic-adopt`)

---

## 8. Children Feature 실행 순서

Epic 의 `01-children-features.md` 는 다음 구조를 포함:

- **Feature 목록**: 각 Feature 의 IDEA ID + Lane + RICE + 범위 + 상태
- **의존성 매트릭스**: 각 Feature 쌍의 순차/병렬/충돌 관계 (`✓` 독립 / `→` 순차 / `X` 충돌)
- **실행 Phase**: Phase A/B/C 로 묶인 병렬·순차 그룹
- **진행 대시보드**: 각 Feature 의 상태/TASK 진행/테스트/번들/리뷰 현재값

상세 양식: `plan-epic-workflow/templates/children-features.md`.

---

## 9. Epic ↔ Feature Binding

Feature 가 Epic 에 속하면 다음 두 곳에 명시:

1. **Feature 쪽**: `.plans/features/active/{slug}/00-context/08-epic-binding.md` 신규 파일
2. **Epic 쪽**: `.plans/epics/{status}/EPIC-.../01-children-features.md` 의 Feature 목록 행

두 파일이 **cross-reference** 되어야 한다. 불일치 발생 시 `plan-epic-integrity.js` hook 이 경고 (Phase 2 disable 기본, Phase 3 enable).

---

## 10. 인덱스 스키마 확장

### 10-1. `.plans/ideas/backlog.md`

Epic 컬럼 추가 (null 허용):

```markdown
| ID | 제목 | 카테고리 | 상태 | 등록일 | 위치 | 파일 | Epic |
```

- Epic 없음: `—` 또는 빈 셀
- Epic 있음: `[EPIC-{YYYYMMDD}-{NNN}](../epics/{status}/EPIC-.../00-epic-brief.md)`

### 10-2. `.plans/archive/index.md`

Epic 컬럼 추가 (null 허용). 기존 archived Feature 는 null 유지, `/plan-epic-adopt` 로 소급 연결 가능 (Phase 3).

### 10-3. `.plans/epics/index.md` (신규)

```markdown
| ID | 제목 | 상태 | 기간 | 자식 Feature 수 | 파일 |
```

---

## 11. 관련 규칙

- `task-id-naming.md` (IMP-KIT-015) — Task ID 네이밍
- `edit-coordinates-governance.md` (IMP-KIT-011) — architecture-binding 동기화
- `verification.md` — Agent Edit Race (Read Cache) 주의
- `agent-file-ownership.md` (T-RACE-01) — 파일 소유권 매트릭스
- `rice-lane-weighted-adjustment.md` (T-RICE-01) — RICE Lane 가중 조정 SSOT
- `plan-state-sync.js` hook (T-FSTATE-01, 구현 예정) — IDEA/Feature 상태 자동 동기

---

## 12. 변경 이력

| 날짜 | 내용 | 작성자 |
|---|---|---|
| 2026-04-22 | 초안 — claude-kit v2.4.0 Phase 2 Step 1 (P2-C) Epic 계층 SSOT | Claude (메인테이너 역할) |
| 2026-04-23 | §5 IDEA 상태 vs Feature 상태 (SSOT) 신설 — T-FSTATE-02 (N-13 대응). 기존 §5~§11 을 §6~§12 로 재번호. §11 관련 규칙에 agent-file-ownership, rice-lane-weighted-adjustment, plan-state-sync.js 추가. | Claude (메인테이너 역할) |
| 2026-04-23 | §4-1 파일 이동 방법 (git mv vs mv, T-EPMV-02) + §4-2 상태 전이 게이트 조건 (T-EPMV-03) 신설. `/plan-epic advance` 내부 트랜잭션 단계 정의. | Claude (메인테이너 역할) |
| 2026-04-23 | §5-5 `plan-state-sync.js` hook 구현 완료 표기 (T-FSTATE-01). Core 함수 경로·Trigger 경로·비활성화·로그·테스트 수(49) 명시. | Claude (메인테이너 역할) |

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/plan/rules/plan-epic-hierarchy.md`
