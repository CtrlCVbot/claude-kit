<!-- kit-convert generated: 2026-04-17 -->
# plan-draft — Codex Entry Flow

## Overview

스크리닝 통과한 아이디어 기반 Feature Overview 1차 생성. Lite/Standard 판정 + 시나리오(A/B/C) + Feature 유형(copy/dev)을 동시 판정하여 파이프라인 경로가 결정됩니다.

## Invocation

```
plan-draft IDEA-042                # 특정 아이디어의 1차 기능 기획 생성
```

## Workflow

1. **입력 확인**: IDEA-{YYYYMMDD}-{NNN}의 승인 상태 확인 (`20-approved/` 폴더에 존재 + `approved` 상태 필수. `screened` 상태는 불가)
2. **1차 기획 작성**:
   - 유저 스토리, 러프 요구사항, 실현 가능성 평가 작성
   - 기존 아키텍처, 기술 스택과의 정합성 분석
3. **3중 판정** (Lite/Standard + 시나리오 + Feature 유형):
   - **Lite/Standard** (6개 트리거 기준): Lite=소규모, Standard=상세 기획 필요
   - **시나리오** (copy 도메인 활성 시):
     - A(백지): 원본은 있지만 구현이 없음 → PRD 먼저
     - B(부분): 기존 프로젝트에 원본 일부를 가져옴 → PRD 먼저
     - C(충실도 교정): 이미 카피 시도, 원본과 차이 수정 → 갭 분석 먼저
   - **Feature 유형**: copy(원본 대응 시각/인터랙션 차이 닫기) / dev(원본 대응 없음 또는 비시각적)
   - 판정 결과를 `07-routing-metadata.md`에 기록
4. **경로 분기**:
   - Lite → `.plans/features/active/{slug}.md` (파이프라인 종료 가능)
   - Standard → `.plans/features/drafts/{slug}/first-pass.md` (P4 PRD로 진행)
   - copy Feature + 시나리오 C → 범위 PRD 후 `copy-reference-refresh` → 갭 분석
   - copy Feature + 시나리오 A/B → PRD 후 `copy-reference-refresh` (원본 캡처만)
   - dev Feature → 기존 dev 경로 직행
5. **PCC-02 검증**: 승인된 아이디어에 기획이 존재하는지 확인
6. **Human Checkpoint**: Scope 확인

## Blueprint Fast-Track 진입

블루프린트 기반 imported IDEA (태그: `blueprint-import`)의 경우:

- `20-approved/` 폴더에 승인 껍데기 산출물(imported IDEA + imported screening record)이 존재하면 정상 진입
- 블루프린트 feature plan을 source spec으로 참조하여 first-pass 또는 Lite plan을 파생
- Lite/Standard 판정은 claude-kit 6개 트리거 기준으로 수행 (블루프린트의 기존 판정은 참고만)
- stage-manifest.json에 `entryPoint: "P3-blueprint-fast-track"`, `blueprintSource: "{경로}"` 기록
- P1/P2 단계는 `status: "skipped", reason: "blueprint-fast-track"`으로 기록
- 상세: `docs/guide/12-blueprint-fast-track.md` 참조

**불변 계약**: Blueprint = source spec, Approved PRD = execution SSOT. 블루프린트를 직접 `dev-feature` 입력으로 사용하는 것은 불가하다.

## Output

- Lite: `.plans/features/active/{slug}.md`
- Standard: `.plans/features/drafts/{slug}/first-pass.md`
- Routing Metadata: `.plans/features/active/{slug}/00-context/07-routing-metadata.md` (시나리오, Feature 유형, 규모)
- 다음 단계 안내:
  - dev Feature: Lite → `dev-feature`, Standard → `plan-prd`
  - copy Feature + 시나리오 A/B: Standard → `plan-prd` → 구현 후 QA에서 copy 검증
  - copy Feature + 시나리오 C: Standard → `plan-prd`(범위 PRD) → `copy-reference-refresh` → 갭 분석

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/plan/commands/plan-draft.md
