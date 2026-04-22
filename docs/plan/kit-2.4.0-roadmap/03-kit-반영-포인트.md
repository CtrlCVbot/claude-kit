# 03. claude-kit 반영 포인트 — 변경 목록

> **한 문장 요약**: 신규 커맨드 `/plan-epic` 과 `/plan-epic-adopt` 2건 도입 + 기존 커맨드에 선택적 `--epic=...` 파라미터 추가 + 관련 rule/skill 3건 추가. **신규 에이전트 0건**.
>
> **비유**: 주방에 **새 도구 2개 (큰 그릇 + 라벨러)** 를 추가하되, 기존 식칼/도마/냄비는 그대로 사용한다. 요리사가 원하면 큰 그릇에 여러 재료를 묶어 관리하고, 원하지 않으면 기존대로.

---

## 1. 변경 요약표

| 축 | 신규/변경 | 개수 | Over-engineering 가드 |
|---|:---:|:---:|---|
| command | 신규 | 2 | /plan-epic, /plan-epic-adopt (Opt-in) |
| command | 변경 | 1 | /plan-idea 에 `--epic` 파라미터 (optional) |
| skill | 신규 | 1 | plan-epic-workflow |
| skill | 참조 수정 | 3 | plan-archive-workflow, plan-pipeline, plan-idea-management |
| rule | 신규 | 1 | plan-epic-hierarchy.md |
| rule | 변경 | 1 | plan-idea-management (epic 파라미터 언급) |
| agent | 신규 | **0** | 기존 에이전트 (plan-idea-collector 등) 프롬프트만 확장 |
| hook | 신규 | 1 | plan-epic-integrity.js (Opt-in) |
| 문서 템플릿 | 신규 | 3 | Epic Brief, Children Features, Epic Binding |

---

## 2. 신규 커맨드 2건

### 2-1. `/plan-epic`

**목적**: Epic 생성, 조회, 상태 전이

**Usage**:
```bash
/plan-epic                                       # 대화형 입력
/plan-epic "OPTIC Landing 제품 라인"              # 직접 생성 (draft 상태)
/plan-epic list                                  # Epic 목록 조회
/plan-epic show EPIC-20260422-001                # Epic 상세 조회
/plan-epic advance EPIC-20260422-001 --to=active # 상태 전이
/plan-epic archive EPIC-20260422-001             # archived 로 이동 (모든 자식 Feature archived 후)
```

**구현 위치**: `src/claude/plan/commands/plan-epic.md`

**Workflow**:
1. 생성: `plan-epic-workflow` skill 호출 → Epic Brief / Children Features / Roadmap 템플릿 작성 → `.plans/epics/00-draft/EPIC-.../` 생성 → `.plans/epics/index.md` 인덱스 갱신
2. 조회: index.md 읽기 + 필터링
3. 상태 전이: 디렉터리 `git mv` (draft → planning → active → completed → archived) + index.md 갱신

### 2-2. `/plan-epic-adopt`

**목적**: 기존 Feature (IDEA / Feature Package) 를 Epic 에 소급 연결

**Usage**:
```bash
/plan-epic-adopt EPIC-20260422-001 IDEA-20260422-001    # IDEA 연결
/plan-epic-adopt EPIC-20260422-001 dash-preview-phase4  # Feature slug 로 연결
/plan-epic-adopt EPIC-20260422-099 dash-preview --archived  # archived Feature 소급 연결
```

**구현 위치**: `src/claude/plan/commands/plan-epic-adopt.md`

**Workflow** (02-마이그레이션-규칙 §2 시나리오 B/C):
1. `.plans/features/active/{slug}/00-context/08-epic-binding.md` 생성 (active 의 경우)
2. Epic 의 `01-children-features.md` 에 행 추가
3. `.plans/ideas/backlog.md` 또는 `.plans/archive/index.md` 의 epic 컬럼 채움
4. `.plans/epics/index.md` 의 children 수 업데이트

---

## 3. 기존 커맨드 변경 1건

### 3-1. `/plan-idea` — `--epic` 파라미터 추가 (optional)

**Before**:
```bash
/plan-idea "검색 기능 개선"
```

**After**:
```bash
/plan-idea "검색 기능 개선"                                    # 기존 동작 (epic 없음)
/plan-idea "검색 기능 개선" --epic=EPIC-20260422-001           # 신규: Epic 에 자동 연결
```

**구현 변경**:
- `src/claude/plan/commands/plan-idea.md` — Usage 섹션에 `--epic` 파라미터 추가
- `plan-idea-collector` 에이전트 프롬프트: `--epic` 전달 시 IDEA 파일 프론트매터에 `epic: EPIC-...` 추가 + Epic 의 `01-children-features.md` 에 "pending IDEA 등록" 행 추가
- `backlog.md` 작성 시 epic 컬럼 채움

**하위 호환성**: 기존 사용자 (`--epic` 미지정) 100% 동일 동작.

---

## 4. 신규 skill 1건

### 4-1. `plan-epic-workflow`

**위치**: `src/claude/plan/skills/plan-epic-workflow/SKILL.md`

**구성**:
```markdown
# plan-epic-workflow

제품 목표·Theme·cross-cutting 요구사항을 여러 Feature 로 묶어 관리하는 Epic 라이프사이클.

## When to Activate
- 3개 이상 Feature 가 같은 Theme
- 여러 Feature 에 걸친 cross-cutting 요구사항
- Feature 간 명시적 순서/의존성 관리 필요
→ 위 3가지 중 하나 만족 시에만 Epic 생성 (Over-engineering 가드)

## Epic 상태 머신
draft → planning → active → completed → archived

## 필수 산출물
- 00-epic-brief.md (목표/범위/성공 지표)
- 01-children-features.md (자식 Feature + 의존성 매트릭스)
- 02-roadmap.md (분기별 로드맵)
- 03-metrics.md (누적 지표 대시보드)
- 04-decision-log.md (Epic 레벨 결정)

## Gate
- draft → planning: Epic Brief 작성 완료
- planning → active: 자식 Feature 중 최소 1건 IDEA 등록
- active → completed: 모든 자식 Feature completed (archive 직전)
- completed → archived: `/plan-epic archive` 커맨드

## Anti-patterns
- Feature 2개 미만인데 Epic 생성 (복잡도만 증가)
- Epic 간 parent-child 관계 설정 (본 설계에서 금지, 소프트 링크만 허용)
- 매 Feature 마다 Epic 생성 (Opt-in 원칙 위반)
```

---

## 5. 기존 skill 참조 수정 3건

### 5-1. `plan-archive-workflow`

**추가 단계**: Feature archive 시 Epic 영향 반영
- 해당 Feature 가 Epic 에 속하면:
  - Epic 의 `01-children-features.md` 의 행 상태를 "archived" 로 변경
  - Epic 의 모든 자식이 archived 면 Epic 상태를 `completed` 로 전환 권장 (사용자 승인)

### 5-2. `plan-pipeline`

**문서 갱신**: 파이프라인 시작점 확장
```
[Opt-in] /plan-epic → Epic Brief
   ↓
P1 /plan-idea [--epic=EPIC-...]
   ↓
P2 /plan-screen → ... → P7 /plan-bridge → Dev → /plan-archive
```

### 5-3. `plan-idea-management`

**문서 갱신**: IDEA 파일 프론트매터에 `epic` 필드 (optional) 허용. `backlog.md` epic 컬럼 채움 규칙.

---

## 6. 신규 rule 1건

### 6-1. `plan-epic-hierarchy.md`

**위치**: `.claude/rules/plan-epic-hierarchy.md`

**내용**:
```markdown
# Epic/Feature/Task 계층 규칙

## 1. 계층 정의
- 대 (Epic): 제품 목표, 1~3개월
- 중 (Feature): 배포 단위, 1~4주 (기존 IDEA + Feature Package)
- 소 (Task): 커밋 단위, 0.5~2일 (변경 없음)

## 2. Epic 생성 기준 (3 중 하나)
- 3개 이상 Feature 가 같은 Theme
- 여러 Feature 에 걸친 cross-cutting 요구사항
- Feature 간 명시적 순서/의존성

## 3. Opt-in 원칙
- 모든 Feature 가 Epic 에 속할 필요 없음
- Epic 이 없는 Feature 는 기존 flat 구조와 동일 동작
- `--epic=EPIC-...` 파라미터는 optional

## 4. 금지 사항
- Epic 간 parent-child 관계 (4단 계층 금지)
- 한 Feature 를 여러 Epic 에 primary 연결 (1:1 원칙)
- Feature 2개 미만으로 Epic 생성 (over-engineering)
- 강제 마이그레이션 (기존 archive 재구성)

## 5. 권장 사항
- 제품 라인 관리 (landing 의 OLP/DASH/DASH3 묶음 등) 에 Epic 사용
- cross-cutting (접근성, i18n) 요구사항을 Epic 으로
- 독립 Feature (소규모 bug fix, 라벨 변경) 는 Epic 없이
```

---

## 7. 기존 rule 변경 1건

### 7-1. `plan-idea-management`

**추가 섹션**: "Epic 연결 (Optional)"
- `--epic=EPIC-...` 파라미터 사용법
- IDEA 파일 프론트매터의 `epic:` 필드
- `backlog.md` 의 epic 컬럼 규칙
- Epic 과 무관한 기존 사용자 영향 0 명시

---

## 8. 신규 hook 1건 (Opt-in)

### 8-1. `plan-epic-integrity.js`

**위치**: `.claude/hooks/plan-epic-integrity.js`
**Event**: PreCommit 또는 PostToolUse (Edit/Write 후)

**동작**:
```js
// 1. Epic 파일 수정 시: 자식 Feature binding 존재 여부 체크
// 2. Feature 의 08-epic-binding.md 수정 시: Epic 의 children 목록과 cross-reference
// 3. 불일치 발견 시 경고 (BLOCK 아님, FLAG):
//    - Feature A 는 Epic X 에 바인딩 but Epic X 의 children 에 없음
//    - Epic Y 는 Feature B 를 children 에 but Feature B 는 binding 없음
// 4. backlog.md / archive/index.md epic 컬럼도 교차 검증
```

**가드**: Opt-in (`.claude/settings.json` 에서 비활성화 가능). 기본 disable → PoC 성공 후 활성화.

---

## 9. 신규 문서 템플릿 3건

### 9-1. Epic Brief (`templates/epic-brief.md`)
`01-계층-설계.md §3` 참조.

### 9-2. Children Features (`templates/children-features.md`)
`01-계층-설계.md §4` 참조.

### 9-3. Epic Binding (`templates/epic-binding.md`)
`02-마이그레이션-규칙.md §4` 참조.

**위치**: `src/claude/plan/skills/plan-epic-workflow/templates/`

---

## 10. 에이전트 신설 금지 — 기존 에이전트 활용

### 10-1. Epic 관련 작업을 수행할 기존 에이전트

| 에이전트 | Epic 관련 활용 | 프롬프트 확장 필요 |
|---|---|:---:|
| `plan-idea-collector` | IDEA 생성 시 `--epic` 파라미터 처리, binding 레퍼런스 삽입 | 소 |
| `plan-prd-writer` | PRD 작성 시 Epic 컨텍스트 참조 (Epic Brief §2 성공 지표 인용) | 소 |
| `plan-bridge-writer` | Bridge 에 Epic 링크 포함 | 소 |
| `plan-reviewer` | Epic 레벨 일관성 검증 (자매 Feature PRD 와 모순 없는지) | 중 |
| `dev-architect` | Feature 간 아키텍처 일관성 (Epic 범위) 점검 | 중 |

→ **어느 에이전트도 신설 불필요**. 기존 에이전트의 프롬프트에 "Epic 컨텍스트가 주어지면 ..." 단락만 추가.

---

## 11. 변경 영향 요약표 (누적)

| 항목 | 변경 수 |
|---|:---:|
| 신규 파일 (커맨드/스킬/룰/훅/템플릿) | 9 |
| 수정 파일 (기존 커맨드/스킬/룰) | 5 |
| 신규 에이전트 | **0** |
| 신규 디렉터리 | 1 (`.plans/epics/`) |
| 스키마 확장 (epic 컬럼) | 2 (backlog.md, archive/index.md) |
| 기존 Feature 필수 변경 | **0** (Opt-in) |

---

## 12. 기존 IMP-KIT 과의 관계

| IMP-KIT | 본 설계와의 관계 | 상태 |
|---|---|:---:|
| IMP-KIT-022 REQ/TASK ID 레지스트리 | Epic 도입 시 레지스트리 스키마에 epic_id 포함 → 설계 단순화 | 🟢 동반 진행 권장 |
| IMP-KIT-023 decision-log 템플릿화 | Epic decision-log 별도 분리 → 템플릿 2종 (Feature / Epic) | 🟢 연계 |
| IMP-KIT-028 Milestone review 자동 기록 | Feature 의 Milestone 은 본 설계에서도 유지 → 기존 제안과 독립 | 🟢 독립 |
| IMP-KIT-036 / IMP-KIT-038 Spike 워크플로우 | Spike 는 Feature 의 child Task 로 유지 → 계층 도입에 영향 없음 | 🟢 독립 |

---

## 13. 다음 읽을 문서

- **`04-로드맵.md`** — Phase 1 (PoC) / Phase 2 (부분 도입) / Phase 3 (전면) 단계별 실행 계획
- **`05-PoC-dash-preview-phase4.md`** — 실제 적용 시뮬레이션

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — 변경 목록 요약 + 신규 커맨드 2 / 변경 커맨드 1 / 신규 skill 1 / 신규 rule 1 / 신규 hook 1 / 신규 템플릿 3 + 에이전트 신설 금지 원칙 |
