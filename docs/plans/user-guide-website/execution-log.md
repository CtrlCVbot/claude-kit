# 실행 로그: user-guide-website 파이프라인 재시작

> 실행일: 2026-05-27

## 로그 형식

각 단계는 다음 흐름으로 기록한다.

`프롬프트 -> 실행 내용 -> 산출물 -> 검증 -> 리뷰`

## 단계별 로그

| 단계 | 스킬 | 프롬프트 위치 | 실행 내용 | 산출물 | 리뷰 |
| --- | --- | --- | --- | --- | --- |
| 준비 | `prompts-chat` + pipeline skills | 사용자 재시작 요청 | 기존 planning docs를 archive하고 재시작 준비 | `.plans/_archive/**`, `docs/plans/**/_archive/**` | 기존 문서 보존 완료 |
| P1 | `plan-idea-management` | `06-pipeline-prompt-runbook.md#1` | 상위 아이디어 등록 | `.plans/ideas/20-approved/IDEA-20260527-001.md`, `backlog.md` | core 보호 조건 포함 |
| P2 | `plan-screening-workflow` | `06-pipeline-prompt-runbook.md#2` | RICE 기준 가치/리스크 평가 | `.plans/ideas/10-screening/SCREENING-20260527-001.md`, `screening-matrix.md` | Go, protected path guard 기록 |
| P2.5 | `plan-epic-workflow` | `06-pipeline-prompt-runbook.md#3` | Epic과 child feature map 작성 | `.plans/epics/20-active/EPIC-20260527-001/**` | Epic 활성화 기준 충족 |
| P3 | `plan-pipeline` draft 단계 | `06-pipeline-prompt-runbook.md#4` | 1차 기능 초안 작성 | `.plans/features/active/user-guide-website/01-draft/01-feature-draft.md` | Standard pipeline 선택 |
| P4 | `plan-prd-authoring` | `06-pipeline-prompt-runbook.md#5` | 10개 섹션 승인 PRD 작성 | `.plans/prd/10-approved/user-guide-website-prd.md` | `REQ-ID` 생성 |
| P5 | `plan-wireframe-design` | `06-pipeline-prompt-runbook.md#6` | 화면, 내비게이션, 컴포넌트 설계 | `.plans/wireframes/user-guide-website/**` | `SCR-ID`가 `REQ-ID`에 매핑됨 |
| P5.5 | `claude-design-workflow` | `06-pipeline-prompt-runbook.md#7` | 디자인 checkpoint 기록 | `00-context/03-design-checkpoint.md` | 외부 Claude Design 실행 불필요 |
| P6 | `plan-stitch-workflow` | `06-pipeline-prompt-runbook.md#8` | review-only Stitch mapping 기록 | `.plans/stitch/user-guide-website/**` | 누락된 `REQ/SCR` 없음 |
| P7 | bridge 계약 | `06-pipeline-prompt-runbook.md#9` | 개발 bridge 문서 작성 | `.plans/bridge/user-guide-website/**` | `dev-feature-plan` 진입 가능 |
| D1 | `dev-feature-plan` | `06-pipeline-prompt-runbook.md#10` | architecture SSOT, binding, 기능 패키지 작성 | `.plans/project/00-dev-architecture.md`, `00-context/**`, `02-package/**` | 필수 package 문서 존재 |
| D2 | `dev-workflow` | `06-pipeline-prompt-runbook.md#11` | 현재 구현을 `TASK/REQ/TC` 증거에 매핑 | `03-dev-notes/dev-output-summary.md` | 검증 갱신 완료 |
| R1 | `plan-review-criteria` | `06-pipeline-prompt-runbook.md#12` | self-review와 PCC 점검 수행 | `04-review/01-self-review.md` | high/critical 이슈 없음 |
| A1 | `plan-archive-workflow` | `06-pipeline-prompt-runbook.md#13` | archive dry-run/readiness 기록 | `09-archive/01-archive-readiness.md` | 최종 archive는 사용자 승인 후 진행 |

## 검증 결과

| 검증 | 결과 | 근거 |
| --- | --- | --- |
| `pnpm test` | PASS | 34 test files, 423 tests passed |
| `pnpm docs:build` | PASS | Next.js build 성공, 24 static routes generated |
| Protected path diff | PASS | `src/claude`, `src/codex`, `src/templates`, `scripts/setup.js`, `.claude`, `.agents`, `.codex` 변경 없음 |

## 프롬프트 보존 방식

프롬프트 원문은 `06-pipeline-prompt-runbook.md`에 보존한다. 이 실행 로그는 runbook을 프롬프트 SSOT로 참조하고, 각 프롬프트의 실행 결과만 단계별로 기록한다.
