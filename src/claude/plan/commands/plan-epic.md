# /plan-epic

Epic 생성, 조회, 상태 전이. claude-kit v2.4.0 Hierarchical Plan Structure 에서 Feature 상위 계층(Epic)을 관리한다. **Opt-in** — Epic 없이도 기존 flat 플로우 완전 호환.

## Usage

```
/plan-epic                                          # 대화형 생성 (Epic 제목/목적/범위 입력)
/plan-epic "OPTIC Landing 제품 라인"                 # 직접 생성 (draft 상태)
/plan-epic list                                     # Epic 목록 조회 (모든 상태)
/plan-epic list --status=active                     # 상태 필터
/plan-epic show EPIC-20260422-001                   # Epic 상세 조회
/plan-epic show EPIC-... --verbose                  # 상세 출력 (+ 성공 지표 + 의존성 매트릭스, T-SHOW-01)
/plan-epic advance EPIC-20260422-001 --to=planning  # 상태 전이 (draft → planning)
/plan-epic advance EPIC-20260422-001 --to=active    # planning → active
/plan-epic archive EPIC-20260422-001                # completed → archived
/plan-epic phase generate --phase=B --features=F2,F4 # Phase 로드맵 자동 생성 (T-TMPL-01)
/plan-epic phase generate --phase=C --features=F3 --overwrite  # 기존 Phase 덮어쓰기 (명시적 동의)
```

## Flags

- `--status={draft|planning|active|completed|archived}` — list 필터 또는 advance 목표 상태
- `--to={state}` — advance 서브커맨드의 목표 상태 (draft 에서 순방향만 허용)
- `--force` — 게이트 위반 시 강제 전이 (T-EPMV-03: Critical checkpoint 경고 + 사용자 Y 필수 + `~/.claude/logs/checkpoints.jsonl` 로그 기록)
- `--dry-run` — 파일 변경 없이 "이렇게 실행될 것" 요약 출력 (T-EPMV-01 후속 Step 에서 구현)

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

### 조회 (`/plan-epic list` / `show`, T-SHOW-01 확장)

> **T-SHOW-01 (v2.5.0)**: Phase A 드라이런에서 `show` 가 0 회 사용된 피드백 반영. 집약 출력으로 **매번 사용 가능한 상태 대시보드** 수준 제공.

#### `list` 서브커맨드

- `.plans/epics/index.md` 읽기 → `--status` 필터링 → 포맷 테이블 출력
- **`--status=active` 확장**: 각 Epic 의 Phase 진행률 요약 포함 (Step X/Y 형식)
- 기본 컬럼: ID / 제목 / 상태 / 기간 / 자식 Feature 수 / 다음 Checkpoint

#### `show` 서브커맨드 (집약 출력)

기본 출력 5 블록:

```
# Epic: {제목}
- ID: {EPIC-ID}
- 상태: {state}
- 기간: {start} ~ {end} (M-Epic-1: ... / M-Epic-2: ... / M-Epic-3: ...)
- Phase 진행률: A (기획 완료, {X}/{Y}) / B ({state}) / C ({state})

## 자식 Feature ({count})

| ID | 제목 | Phase | Lane | 상태 | TASK 진행 |
|----|------|:---:|:---:|:---:|:---:|
| F1 | ... | A | Standard | approved | 0/8 |
| F2 | ... | B | Standard | pending | — |

## 다음 Checkpoint

- Phase A Step 9 `/dev-feature` 진입 (사용자 지시 대기)

## 주요 링크

- Epic Brief: .plans/epics/.../00-epic-brief.md
- Children Features: .plans/epics/.../01-children-features.md
- Active Features: .plans/features/active/{f1,f5}-.../
```

**집약 로직 상세**:

| 값 | 데이터 출처 |
|----|-----------|
| Epic 상태 | `.plans/epics/index.md` 해당 행 |
| Phase 진행률 | `01-children-features.md §4` Step 카운트 + 현재 Step 감지 |
| Feature 상태 | IDEA frontmatter `상태:` (SSOT, `plan-state-sync.js` 사용) |
| TASK 진행 | `.plans/features/active/{slug}/dev-tasks.md` 진행률 집계 (있으면) |
| 다음 Checkpoint | §4 로드맵에서 현재 완료 Step 다음 Step 추출 |

**`--verbose` 플래그**: 기본 출력 + Epic Brief §2 성공 지표 + §2 의존성 매트릭스 요약 추가.

**Feature 상태 표시 규칙** (T-FSTATE-02 매핑):

- `pending`: IDEA inbox/screened (Feature 작업 전)
- `approved`: IDEA approved (구현 대기)
- `active`: `/dev-feature` 호출 후 구현 진행 중
- `archived`: IDEA archived

### 상태 전이 (`/plan-epic advance {ID} --to={state}`)

내부 단계는 **1 커맨드 트랜잭션** 으로 수행 (T-EPMV-02 + T-EPMV-03 통합).

1. **현재 상태 조회**: `.plans/epics/index.md` 에서 Epic 행의 상태 컬럼 읽기
2. **전이 허용 여부 검증**: `draft → planning → active → completed → archived` 순방향만 허용 (역방향 차단)
3. **게이트 자동 검증** (T-EPMV-03): `plan-epic-hierarchy.md §4-2` 참조
   - `draft → planning`: `00-epic-brief.md` + `01-children-features.md` 존재 + 자식 IDEA(`Epic: EPIC-{ID}` frontmatter) ≥ 1
   - `planning → active`: 자식 Feature 중 IDEA 상태 `approved` ≥ 1
   - `active → completed`: 모든 자식 Feature IDEA 상태 `archived`
   - `completed → archived`: 인덱스 갱신 준비
   - **미충족 시**: HARD FAIL + 구체 사유 + `--force` 안내 (Critical checkpoint 경고 + 로그 기록)
4. **파일 이동** (T-EPMV-02): tracked 여부 자동 감지 후 `git mv` / `mv` 분기
   ```bash
   if git ls-files "$SRC_DIR" 2>/dev/null | grep -q .; then
     git mv "$SRC_DIR" "$DST_DIR" || mv "$SRC_DIR" "$DST_DIR"
   else
     mv "$SRC_DIR" "$DST_DIR"
   fi
   ```
5. **링크 재작성** (T-EPMV-01 구현 완료): `src/claude/plan/scripts/epic-advance-rewrite.js` 의 `rewriteEpicLinks({ rootDir, epicId, prevState, newState, dryRun })` 호출 → 모든 `.plans/**/*.md` 의 `/prev-state/EPIC-{ID}/` → `/new-state/EPIC-{ID}/` 치환. 반환값 `{ changedFiles, totalReplacements, dryRun }` 을 보고에 포함. `--dry-run` 플래그 지원.
6. **인덱스 갱신**: `index.md` 의 상태 컬럼 업데이트
7. **자식 Feature binding 갱신 (선택)**: 각 Feature 의 `08-epic-binding.md §1` Epic 상태 라인 업데이트
8. **변경 보고**: 사용된 이동 방법 (`git mv` vs `mv`) + 게이트 검증 결과 + 변경 파일 수 출력

### 아카이브 (`/plan-epic archive {ID}`)

`active → completed → archived` 2단 전이를 한 번에 수행. 내부적으로 `advance --to=completed` 후 `advance --to=archived` 순차 실행. 모든 자식 Feature 가 `archived` 상태가 아니면 거부.

### Phase 로드맵 생성 (`/plan-epic phase generate ...`, T-TMPL-01)

> **T-TMPL-01 (v2.5.0)**: Phase A 9 단계 하드코딩 대체. Phase B/C 도 30 초 내 생성. 템플릿: [`plan-epic-workflow/templates/phase-roadmap.md`](../skills/plan-epic-workflow/templates/phase-roadmap.md).

1. **파라미터 파싱**:
   - `--phase={A|B|C|D|...}` — 생성 대상 Phase 식별자 (필수)
   - `--features=F{N},F{M},...` — 해당 Phase 의 Feature 목록 (필수, 쉼표 구분)
   - `--overwrite` — 기존 동일 Phase 섹션 덮어쓰기 허용 (선택)
2. **Epic 검증**:
   - 현재 cwd 또는 `--epic=EPIC-{ID}` 로 Epic 디렉터리 탐색
   - `00-epic-brief.md` + `01-children-features.md` 존재 필수
3. **Feature 메타 추출**: `01-children-features.md §1` 에서 F{N} → IDEA ID / 제목 / Lane / RICE / 범위 / 상태 확보
4. **변수 치환**: `templates/phase-roadmap.md` 의 변수 필드 12 종 치환
   - `{PHASE}` / `{EPIC_ID}` / `{FEATURES_LIST}` — 필수 (누락 시 HARD FAIL)
   - 날짜 필드 (`{START}`, `{END}`) — Epic Brief §4 M-Epic 값 기반 자동 계산
   - 배열 필드 (`{FEATURE[N]_*}`) — `--features` 파라미터 순서대로 0-indexed 전개
5. **§4 안전 병합**:
   - 기존 `01-children-features.md §4` 에 `### Phase {PHASE}` 헤더 **없으면** append
   - **있으면** HARD FAIL + `--overwrite` 요구 메시지
   - `--overwrite` 시 백업 (`01-children-features.prev-{YYYYMMDD-HHmmss}.md`) 후 덮어쓰기
6. **Write + 보고**: 변경 파일 경로 + 백업 경로(있으면) + 다음 단계 안내 (`/plan-epic advance` or Phase 실행)

**검증 명령** (예시):

```bash
/plan-epic phase generate --phase=B --features=F2,F4
# → Feature 메타 추출 → 변수 치환 → §4 append → 보고
# 출력: .plans/epics/20-active/EPIC-.../01-children-features.md (§4 Phase B append)
```

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

- **Rule**: [`plan-epic-hierarchy.md`](../rules/plan-epic-hierarchy.md) — SSOT (§4-1 파일 이동 방법, §4-2 상태 전이 게이트 조건, §5 IDEA/Feature 상태)
- **Rule**: [`agent-file-ownership.md`](../../core/rules/agent-file-ownership.md) — Epic 파일 편집 권한 (T-RACE-01)
- **Skill**: [`plan-epic-workflow`](../skills/plan-epic-workflow/SKILL.md) — 라이프사이클 정의
- **Hook**: [`plan-epic-integrity.js`](../hooks/plan-epic-integrity.js) — binding cross-reference (Phase 2 disable 기본)
- **Command**: `/plan-idea --epic={ID}` — 자식 IDEA 자동 연결
- **Command (Phase 3)**: `/plan-epic-adopt` — 기존 Feature 소급 연결

## 관련 피드백 TASK

- **T-EPMV-01** (P0 Critical, v2.4.1 Step 3): **구현 완료** — `src/claude/plan/scripts/epic-advance-rewrite.js` + 13 테스트 PASS
- **T-EPMV-02** (P0 Critical, v2.4.1 Step 2): **본 커맨드 반영** — git mv/mv fallback 자동 분기
- **T-EPMV-03** (P0 Critical, v2.4.1 Step 2): **본 커맨드 반영** — advance 게이트 자동 검증
