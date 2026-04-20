<!-- kit-convert generated: 2026-04-20 -->
# plan-draft — Codex Entry Flow

## Overview

스크리닝 통과한 아이디어 기반 Feature Overview 1차 생성. Lite/Standard 판정 + 시나리오(A/B/C) + Feature 유형(copy/dev)을 동시 판정하여 파이프라인 경로가 결정됩니다.

> 에이전트: `plan-draft-writer` (IMP-KIT-003으로 신설)

## Invocation

```
plan-draft IDEA-042                # 특정 아이디어의 1차 기능 기획 생성
```

## Workflow

1. **입력 검증**: IDEA-{YYYYMMDD}-{NNN}의 위치/상태 확인
   - `20-approved/` 폴더에 존재 + `approved` 상태 필수
   - `screened`/`on-hold`/`rejected` 상태는 거부 (적절한 커맨드 안내)
2. **에이전트 스폰**: `plan-draft-writer` 에이전트를 호출
   - 입력: IDEA ID + 커맨드 컨텍스트 (프로젝트 활성 도메인)
   - 에이전트가 수행:
     - IDEA + 관련 SCREENING 파일 로드
     - Blueprint Fast-Track 분기 (태그 `blueprint-import` 있으면)
     - 프로젝트 컨텍스트 수집 (AGENTS.md/CLAUDE.md, 아키텍처)
     - 1차 기획 초안 작성 (유저 스토리, 러프 요구사항, 실현 가능성)
     - **3중 판정**: Lite/Standard + 시나리오 + Feature 유형 (각각 명시적 근거)
     - Hybrid 감지 (dev Feature + 레퍼런스 시그널)
     - 파일 생성:
       - Lite → `.plans/features/active/{slug}.md`
       - Standard → `.plans/features/drafts/{slug}/first-pass.md`
       - `.plans/features/active/{slug}/00-context/07-routing-metadata.md`
     - PCC-02 자기 검증
3. **경로 분기** (에이전트 출력 기반 — Lite/Standard × copy/dev × Hybrid 조합 완전 커버):
   - Lite + dev + hybrid=false → `dev-feature` (파이프라인 간결)
   - Lite + dev + hybrid=true → `copy-reference-refresh --reference-only` 직행 (IMP-KIT-006 연계)
   - Lite + copy (시나리오 A/B/C) → `copy-reference-refresh` (시나리오별 분기)
   - Standard + dev + hybrid=false → `plan-prd`
   - Standard + dev + hybrid=true → `plan-prd` → `copy-reference-refresh --reference-only`
   - Standard + copy + 시나리오 A/B → `plan-prd` → `copy-reference-refresh` (원본 캡처만)
   - Standard + copy + 시나리오 C → 범위 PRD 후 `copy-reference-refresh` → 갭 분석

   > **주의**: `--reference-only` 플래그는 IMP-KIT-006 구현 완료 시점부터 활성. 그 이전에는 draft-writer가 Hybrid를 감지하되 사용자에게 "수동 레퍼런스 캡처가 필요하다"고 안내.

4. **Human Checkpoint** (Scope 확인):
   - 3중 판정 결과와 추천 경로를 사용자에게 제시
   - 사용자가 경로를 변경하거나 Hybrid 감지를 오버라이드할 수 있음
   - **오버라이드 기록**: 변경 발생 시 routing-metadata.md에 `override: {field, from, to, reason}` 필드 추가 (자동). 감사 추적 + 재실행 시 원 판정과 구분 가능.
   - 승인 시 다음 커맨드로 진행 안내

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
