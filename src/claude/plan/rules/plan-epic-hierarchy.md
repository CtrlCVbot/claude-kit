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

---

## 5. 금지 사항 (설계 원칙)

| 금지 | 사유 |
|---|---|
| Epic 간 parent-child 관계 (4단 계층) | 복잡도 기하급수 증가. 설계상 영구 금지 |
| 한 Feature 를 여러 Epic 에 primary 연결 | 1:1 원칙. 필요 시 primary 1건 + 참조(soft link) 다수 |
| Feature 2개 미만으로 Epic 생성 | Over-engineering. §2 의 3 기준 중 하나도 충족 못 함 |
| 강제 마이그레이션 (기존 archive 재구성) | 원본 불변성 + Opt-in 원칙 위반 |
| Epic Brief 없이 `/plan-epic advance` | draft → planning 진입 게이트 미충족 |

---

## 6. 권장 사항

- **제품 라인 관리**: landing 의 OLP/DASH/DASH3 묶음 같은 제품 시리즈 → Epic 사용
- **Cross-cutting 요구사항**: 접근성·국제화·성능 예산 등 여러 Feature 에 걸친 Theme → Epic 사용
- **소규모 bug fix / 라벨 변경**: 독립 Feature 로 유지, Epic 없음
- **탐색적·실험적 Feature**: 초기엔 독립, 다수 후속 Feature 가 생기면 소급 Epic 생성 (`/plan-epic-adopt`)

---

## 7. Children Feature 실행 순서

Epic 의 `01-children-features.md` 는 다음 구조를 포함:

- **Feature 목록**: 각 Feature 의 IDEA ID + Lane + RICE + 범위 + 상태
- **의존성 매트릭스**: 각 Feature 쌍의 순차/병렬/충돌 관계 (`✓` 독립 / `→` 순차 / `X` 충돌)
- **실행 Phase**: Phase A/B/C 로 묶인 병렬·순차 그룹
- **진행 대시보드**: 각 Feature 의 상태/TASK 진행/테스트/번들/리뷰 현재값

상세 양식: `plan-epic-workflow/templates/children-features.md`.

---

## 8. Epic ↔ Feature Binding

Feature 가 Epic 에 속하면 다음 두 곳에 명시:

1. **Feature 쪽**: `.plans/features/active/{slug}/00-context/08-epic-binding.md` 신규 파일
2. **Epic 쪽**: `.plans/epics/{status}/EPIC-.../01-children-features.md` 의 Feature 목록 행

두 파일이 **cross-reference** 되어야 한다. 불일치 발생 시 `plan-epic-integrity.js` hook 이 경고 (Phase 2 disable 기본, Phase 3 enable).

---

## 9. 인덱스 스키마 확장

### 9-1. `.plans/ideas/backlog.md`

Epic 컬럼 추가 (null 허용):

```markdown
| ID | 제목 | 카테고리 | 상태 | 등록일 | 위치 | 파일 | Epic |
```

- Epic 없음: `—` 또는 빈 셀
- Epic 있음: `[EPIC-{YYYYMMDD}-{NNN}](../epics/{status}/EPIC-.../00-epic-brief.md)`

### 9-2. `.plans/archive/index.md`

Epic 컬럼 추가 (null 허용). 기존 archived Feature 는 null 유지, `/plan-epic-adopt` 로 소급 연결 가능 (Phase 3).

### 9-3. `.plans/epics/index.md` (신규)

```markdown
| ID | 제목 | 상태 | 기간 | 자식 Feature 수 | 파일 |
```

---

## 10. 관련 규칙

- `task-id-naming.md` (IMP-KIT-015) — Task ID 네이밍
- `edit-coordinates-governance.md` (IMP-KIT-011) — architecture-binding 동기화
- `verification.md` — Agent Edit Race (Read Cache) 주의

---

## 11. 변경 이력

| 날짜 | 내용 | 작성자 |
|---|---|---|
| 2026-04-22 | 초안 — claude-kit v2.4.0 Phase 2 Step 1 (P2-C) Epic 계층 SSOT | Claude (메인테이너 역할) |
