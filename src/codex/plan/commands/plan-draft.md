<!-- kit-convert generated: 2026-04-16 -->
# plan-draft — Codex Entry Flow

## Overview

스크리닝 통과한 아이디어 기반 Feature Overview 1차 생성. Lite/Standard 판정에 따라 파이프라인 경로가 결정됩니다.

## Invocation

```
plan-draft IDEA-042                # 특정 아이디어의 1차 기능 기획 생성
```

## Workflow

1. **입력 확인**: IDEA-{YYYYMMDD}-{NNN}의 승인 상태 확인 (`20-approved/` 폴더에 존재 + `approved` 상태 필수. `screened` 상태는 불가)
2. **1차 기획 작성**:
   - 유저 스토리, 러프 요구사항, 실현 가능성 평가 작성
   - 기존 아키텍처, 기술 스택과의 정합성 분석
3. **Lite/Standard 판정** (6개 트리거 기준):
   - Lite: 단일 파일로 기획 완료 가능한 소규모 기능
   - Standard: PRD, 와이어프레임 등 상세 기획이 필요한 기능
4. **경로 분기**:
   - Lite → `.plans/features/active/{slug}.md` (파이프라인 종료 가능)
   - Standard → `.plans/features/drafts/{slug}/first-pass.md` (P4 PRD로 진행)
5. **PCC-02 검증**: 승인된 아이디어에 기획이 존재하는지 확인
6. **Human Checkpoint**: Scope 확인

## Blueprint Fast-Track 진입

블루프린트 기반 imported IDEA (태그: `blueprint-import`)의 경우:

- `20-approved/` 폴더에 승인 껍데기 산출물(imported IDEA + imported screening record)이 존재하면 정상 진입
- 블루프린트 feature plan을 source spec으로 참조하여 first-pass 또는 Lite plan을 파생
- Lite/Standard 판정은 claude-kit 6개 트리거 기준으로 수행 (블루프린트의 기존 판정은 참고만)
- stage-manifest.json에 `entryPoint: "P3-blueprint-fast-track"`, `blueprintSource: "{경로}"` 기록
- P1/P2 단계는 `status: "skipped", reason: "blueprint-fast-track"`으로 기록

**불변 계약**: Blueprint = source spec, Approved PRD = execution SSOT. 블루프린트를 직접 `dev-feature` 입력으로 사용하는 것은 불가하다.

## Output

- Lite: `.plans/features/active/{slug}.md`
- Standard: `.plans/features/drafts/{slug}/first-pass.md`
- 다음 단계 안내: Lite는 `dev-feature`, Standard는 `plan-prd`

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/plan/commands/plan-draft.md
