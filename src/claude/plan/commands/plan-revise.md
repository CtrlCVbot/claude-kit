# /plan-revise

이전 plan 산출물에 수정 요청을 반영한다. Checkpoint "수정" 선택 시의 표준 응답 프로토콜(`checkpoint-policy.md §8`) 을 커맨드로 패키지화한 것. **T-REVP-01 (Phase A 피드백 Step 5, v2.5.0)**.

## Usage

```
/plan-revise {artifact-path} "수정 지시"
```

- `{artifact-path}` — 수정 대상 이전 산출물 절대/상대 경로 (필수)
- `"수정 지시"` — 자연어 수정 요청 (필수)

### 예시

```
# 1차 기획 수정
/plan-revise .plans/features/drafts/hero-refresh/01-draft.md "Lite → Standard 판정 변경 이유 명시"

# PRD 수정
/plan-revise .plans/prd/10-approved/hero-refresh-prd.md "§6 결정 포인트 3 번 근거 확장"

# 아이디어 수정
/plan-revise .plans/ideas/00-inbox/IDEA-20260423-007.md "카테고리 feature → improvement"

# Bridge 문서 수정
/plan-revise .plans/features/active/hero-refresh/00-context/02-scope-boundaries.md "기술 정정 SSOT 위치 재배치"
```

## Workflow

1. **경로 유효성 검증**:
   - 파일 존재 여부 확인 (없으면 HARD FAIL + "경로 확인" 안내)
   - 수정 권한 확인 (archive 내 파일이면 거부 — 원본 불변 원칙)
2. **에이전트 유형 자동 추론** (경로 패턴 기반):
   - `.plans/ideas/(00-inbox|10-screening|20-approved)/IDEA-*.md` → `plan-idea-collector`
   - `.plans/ideas/.../SCREENING-*.md` → `plan-idea-screener`
   - `.plans/features/drafts/{slug}/01-draft.md` → `plan-draft-writer`
   - `.plans/features/drafts/{slug}/first-pass.md` → `plan-draft-writer`
   - `.plans/prd/10-approved/{slug}-prd.md` → `plan-prd-writer`
   - `.plans/features/active/{slug}/00-context/*.md` → `plan-bridge-writer`
   - `.plans/wireframes/{slug}/*.md` → `plan-wireframe-designer`
   - `.plans/stitch/{slug}/*.md` → `plan-stitch-integrator`
   - `.plans/design/{slug}/*.md` → `plan-design-writer`
   - 매칭 실패 시 사용자에게 에이전트 명시 요청
3. **구조화 prompt 생성** (`checkpoint-policy.md §8-2` 스키마):
   ```json
   {
     "prev_artifact": "{절대 경로}",
     "user_modification_request": "{사용자 원문}",
     "preserved_sections": [],
     "revise_sections": []
   }
   ```
   - `preserved_sections`/`revise_sections` 는 자동 추론 (§8-4 규칙) 또는 빈 배열
4. **해당 에이전트 재호출** (Task tool):
   - §8-3 지침 준수 (이전 산출물 Read → 수정 범위 결정 → preserved 유지 → 변경 이력 기록)
5. **결과 보고**:
   - 수정된 파일 경로
   - 변경된 섹션 목록 (revised) + 보존된 섹션 목록 (preserved)
   - Agent Edit Race 주의 (메인 Read 재호출 대상)

## Constraints

- **archive 파일 수정 금지**: `.plans/archive/**/*.md` 는 거부 (원본 불변성).
- **새 파일 생성 금지**: 본 커맨드는 기존 산출물 수정 전용. 새 파일이 필요하면 원본 커맨드(`/plan-idea`, `/plan-draft` 등) 사용.
- **Critical checkpoint 우회 금지**: `plan-epic advance`, `plan-archive` 등 Critical 타입 Checkpoint 는 본 커맨드로 재시도 불가. `--force` 플래그로만 override.
- **Epic 전용 파일 편집 금지**: `.plans/epics/*/EPIC-*/01-children-features.md` 는 메인 전담. 본 커맨드로 수정 불가 (T-RACE-01 agent-file-ownership).

## Output

```
# /plan-revise 완료

## 수정 파일
- {절대 경로}

## 변경된 섹션 (revised)
- §{N}: {요약}

## 보존된 섹션 (preserved)
- §{N}, §{M}: 변경 없음

## 변경 이력 기록
- {파일}의 변경 이력 섹션에 "수정 요청 반영" row 추가

## 다음 단계
- 재검증: `/plan-review {slug}` (필요 시)
- 또는 다음 파이프라인 단계
```

## 관련 자산

- **Rule**: [`checkpoint-policy.md §8`](../../core/rules/checkpoint-policy.md) — 수정 요청 표준 응답 SSOT (T-REVP-01)
- **Rule**: [`writer-output-format.md §2-4`](../../core/rules/writer-output-format.md) — writer 계 에이전트 응답 패턴
- **Rule**: [`agent-file-ownership.md`](../../core/rules/agent-file-ownership.md) — 파일 소유권 매트릭스 (T-RACE-01)
- **Agents (재호출 대상)**: plan-idea-collector / plan-idea-screener / plan-draft-writer / plan-prd-writer / plan-bridge-writer / plan-wireframe-designer / plan-stitch-integrator / plan-design-writer

## 관련 피드백 TASK

- **T-REVP-01** (P2 Medium, v2.5.0): 본 커맨드가 T-REVP-01 의 "선택적 구현" 파트.
- **T-BRDG-02** (v2.5.0): writer 계 `<Output_Format>` 블록에 응답 패턴 이미 주입됨.
