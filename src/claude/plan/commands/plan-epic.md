# /plan-epic

Epic 생성, 조회, 상태 전이. claude-kit v2.4.0 Hierarchical Plan Structure 에서 Feature 상위 계층(Epic)을 관리한다. **Opt-in** — Epic 없이도 기존 flat 플로우 완전 호환.

## Usage

```
/plan-epic                                          # 대화형 생성 (Epic 제목/목적/범위 입력)
/plan-epic "OPTIC Landing 제품 라인"                 # 직접 생성 (draft 상태)
/plan-epic list                                     # Epic 목록 조회 (모든 상태)
/plan-epic list --status=active                     # 상태 필터
/plan-epic show EPIC-20260422-001                   # Epic 상세 조회
/plan-epic advance EPIC-20260422-001 --to=planning  # 상태 전이 (draft → planning)
/plan-epic advance EPIC-20260422-001 --to=active    # planning → active
/plan-epic archive EPIC-20260422-001                # completed → archived
```

## Flags

- `--status={draft|planning|active|completed|archived}` — list 필터 또는 advance 목표 상태
- `--to={state}` — advance 서브커맨드의 목표 상태 (draft 에서 순방향만 허용)
- `--force` — 게이트 위반 시 강제 전이 (경고 출력, 기본 금지)

## Workflow

### 생성 (`/plan-epic [제목]`)

1. **Activation 기준 검증**: `plan-epic-hierarchy.md` §2 의 3 기준 중 하나 이상 충족 여부 확인
   - 미충족 시 **생성 거부 + 독립 Feature 권장 메시지** 출력
2. **ID 채번**: `EPIC-{YYYYMMDD}-{NNN}` (당일 순번 3자리)
3. **디렉터리 생성**: `.plans/epics/00-draft/EPIC-.../`
4. **Epic Brief 작성**: `plan-epic-workflow` skill 의 `templates/epic-brief.md` 를 복사 → `00-epic-brief.md` 생성 후 대화형으로 §1 목적/§2 성공 지표/§3 범위 입력
5. **Children Features 초안 (선택)**: 자식 Feature 가 이미 결정되어 있으면 `templates/children-features.md` 기반으로 `01-children-features.md` 생성
6. **인덱스 등록**: `.plans/epics/index.md` 에 행 추가 (없으면 파일 신설)
7. **출력**: Epic 디렉터리 경로 + 다음 단계 안내 (`/plan-idea --epic=EPIC-...` 또는 `/plan-epic-adopt`)

### 조회 (`/plan-epic list` / `show`)

- **list**: `.plans/epics/index.md` 읽기 → `--status` 필터링 → 포맷 테이블 출력
- **show**: `index.md` 에서 Epic 경로 확인 → `00-epic-brief.md` + `01-children-features.md` 요약 출력 + 자식 Feature 진행률 집계

### 상태 전이 (`/plan-epic advance {ID} --to={state}`)

1. **게이트 검증**: `plan-epic-workflow` skill 의 §게이트 표 확인
   - `draft → planning`: `00-epic-brief.md` + `01-children-features.md` 존재 + 자식 IDEA 최소 1건
   - `planning → active`: 자식 Feature 중 최소 1건 `approved` 이상
   - `active → completed`: 모든 자식 Feature `archived`
   - `completed → archived`: 인덱스 갱신 준비
2. **파일 이동**: `git mv .plans/epics/{current_status}/EPIC-.../ .plans/epics/{new_status}/EPIC-.../`
3. **인덱스 갱신**: `index.md` 의 상태 컬럼 업데이트
4. **자식 Feature binding 갱신 (선택)**: 각 Feature 의 `08-epic-binding.md` 의 Epic 상태 라인 업데이트
5. **게이트 위반 시**: `--force` 없으면 **HARD FAIL** + 미충족 조건 명시

### 아카이브 (`/plan-epic archive {ID}`)

`active → completed → archived` 2단 전이를 한 번에 수행. 내부적으로 `advance --to=completed` 후 `advance --to=archived` 순차 실행. 모든 자식 Feature 가 `archived` 상태가 아니면 거부.

## 게이트 (사용자 승인 필요)

Epic 생성/전이 시 다음 시점에서 **사용자 명시적 승인** 필요 (autoProceedOnPass 대상):

- 생성: Activation 기준 검증 통과 후, Epic Brief 템플릿 채움 단계 전
- 전이: 게이트 조건 충족 후, `git mv` 수행 전

## Output

- **생성**: `.plans/epics/00-draft/EPIC-{YYYYMMDD}-{NNN}/` + `00-epic-brief.md` + `01-children-features.md` (선택) + `index.md` 행 추가
- **조회**: stdout 포맷 테이블 / 상세 요약
- **전이**: 디렉터리 이동 + `index.md` 갱신 + 자식 binding 갱신 (선택)
- **아카이브**: `90-archive/` 이동 + 최종 인덱스 갱신

## 다음 단계 안내

- 생성 후: `/plan-idea "{제목}" --epic=EPIC-{ID}` — 자식 IDEA 자동 연결
- 소급 연결 (Phase 3): `/plan-epic-adopt EPIC-{ID} {IDEA-ID | feature-slug}`
- Epic 조회: `/plan-epic show EPIC-{ID}`

## 제약 (Anti-patterns)

- **Feature 2개 미만**: 생성 거부 (Over-engineering 가드)
- **Epic 간 parent-child**: 본 커맨드에서 지원 안 함 (4단 계층 금지)
- **한 Feature 가 여러 Epic 에 primary 연결**: 거부 (1:1 원칙)
- **강제 상태 전이 (`--force`)**: 게이트 위반 + 사용자 승인 + 경고 로그 필수

## 관련 자산

- **Rule**: [`plan-epic-hierarchy.md`](../rules/plan-epic-hierarchy.md) — SSOT
- **Skill**: [`plan-epic-workflow`](../skills/plan-epic-workflow/SKILL.md) — 라이프사이클 정의
- **Hook**: [`plan-epic-integrity.js`](../hooks/plan-epic-integrity.js) — binding cross-reference (Phase 2 disable 기본)
- **Command**: `/plan-idea --epic={ID}` — 자식 IDEA 자동 연결
- **Command (Phase 3)**: `/plan-epic-adopt` — 기존 Feature 소급 연결
