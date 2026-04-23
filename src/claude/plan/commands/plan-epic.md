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

### 조회 (`/plan-epic list` / `show`)

- **list**: `.plans/epics/index.md` 읽기 → `--status` 필터링 → 포맷 테이블 출력
- **show**: `index.md` 에서 Epic 경로 확인 → `00-epic-brief.md` + `01-children-features.md` 요약 출력 + 자식 Feature 진행률 집계

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
