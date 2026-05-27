# 구현 로드맵

## 목적

이 문서는 `docs/user-guide-html/**`을 Next.js 문서 사이트로 전환하는 작업을 `claude-kit` 파이프라인 기준으로 실행하기 위한 로드맵이다.

기존 Next.js 구현은 현재 증거로 활용하되, 정식 진행 기준은 `.plans` 산출물이다.

## 보호 경계

| 경계 | 규칙 |
| --- | --- |
| `src/claude/**` | 웹사이트 작업으로 수정하지 않는다. |
| `src/codex/**` | 웹사이트 작업으로 수정하지 않는다. |
| `src/templates/**` | 별도 template 작업이 아니면 수정하지 않는다. |
| `scripts/setup.js` | installer 동작은 이번 범위가 아니다. |
| `.claude/**`, `.agents/**`, `.codex/**` | runtime/tooling surface로 보고 수정하지 않는다. |

## 단계별 로드맵

| 단계 | 사용 스킬 | 활성 산출물 | 통과 기준 |
| --- | --- | --- | --- |
| P1 | `plan-idea-management` | `.plans/ideas/20-approved/IDEA-20260527-001.md` | 아이디어에 docs surface 범위와 core 보호 조건이 들어간다. |
| P2 | `plan-screening-workflow` | `.plans/ideas/10-screening/SCREENING-20260527-001.md` | Go 판정과 비회귀 제어가 기록된다. |
| P2.5 | `plan-epic-workflow` | `.plans/epics/20-active/EPIC-20260527-001/**` | child feature와 의존 관계가 명확하다. |
| P3 | `plan-pipeline` draft 단계 | `.plans/features/active/user-guide-website/01-draft/01-feature-draft.md` | PRD로 확장 가능한 범위가 정리된다. |
| P4 | `plan-prd-authoring` | `.plans/prd/10-approved/user-guide-website-prd.md` | 10개 PRD 섹션과 `REQ-ID`가 존재한다. |
| P5 | `plan-wireframe-design` | `.plans/wireframes/user-guide-website/**` | `SCR-ID`가 `REQ-ID`에 연결된다. |
| P5.5 | `claude-design-workflow` | `.plans/features/active/user-guide-website/00-context/03-design-checkpoint.md` | 외부 디자인 도구 사용 여부와 UI 기준이 기록된다. |
| P6 | `plan-stitch-workflow` | `.plans/stitch/user-guide-website/**` | 요구사항-화면 매핑과 Stitch 판단이 남는다. |
| P7 | bridge 계약 | `.plans/bridge/user-guide-website/**` | `dev-feature-plan`이 요구하는 bridge 문서가 존재한다. |
| D1 | `dev-feature-plan` | `.plans/features/active/user-guide-website/02-package/**` | 기능 패키지 `00-overview`부터 `10-release-checklist`까지 생성된다. |
| D2 | `dev-workflow` | `.plans/features/active/user-guide-website/03-dev-notes/dev-output-summary.md` | 구현 증거가 `TASK/REQ/TC`에 매핑된다. |
| R1 | `plan-review-criteria` | `.plans/features/active/user-guide-website/04-review/**` | high/critical 이슈가 남지 않는다. |
| A1 | `plan-archive-workflow` | `.plans/features/active/user-guide-website/09-archive/01-archive-readiness.md` | 최종 archive 가능 여부가 정리된다. |

## Feature 분해

| Feature | 목적 | 이번 재시작에서의 처리 |
| --- | --- | --- |
| `docs-shell` | Next.js 레이아웃, 네비게이션, 공통 shell | `REQ-UGW-001`, `TASK-UGW-001` |
| `planning-content-migration` | planning 페이지와 command 상세 페이지 전환 | `REQ-UGW-002`, `TASK-UGW-002` |
| `runtime-tabs-and-matrices` | Claude/Codex 탭과 비교 표 | `REQ-UGW-003`, `TASK-UGW-003` |
| `pipeline-example-pages` | 이번 실행 과정을 예시 페이지로 설명 | `REQ-UGW-004`, `TASK-UGW-004` |
| `vercel-preview-safety` | 빌드와 Preview 안전성 | `REQ-UGW-005`, `TASK-UGW-005` |
| `guide-sync` | 후속 문서 동기화 대상 정리 | `REQ-UGW-006`, `TASK-UGW-006` |

## 실행 순서

1. 기존 planning 산출물을 archive에 보존한다.
2. `.plans` 기준으로 P1~A1 산출물을 다시 만든다.
3. `docs/plans/user-guide-website` 문서를 새 산출물 기준으로 재정렬한다.
4. 현재 구현을 Feature Package의 `TASK/REQ/TC`에 매핑한다.
5. `pnpm test`, `pnpm docs:build`, protected path diff를 실행한다.
6. 최종 archive 여부는 사용자 승인 후 결정한다.

## 완료 기준

| 기준 | 필요한 증거 |
| --- | --- |
| 실제 파이프라인 실행 | `execution-log.md`에 단계별 스킬, 프롬프트, 산출물, 검증, 리뷰가 있다. |
| 기능 패키지 완성 | `02-package/00~10` 문서가 존재한다. |
| 구현 추적 가능 | `dev-output-summary.md`가 route/component/data를 `TASK/REQ/TC`에 매핑한다. |
| core 보호 | protected path diff가 비어 있다. |
| 다음 작업 가능 | `07-handoff.md`에 후속 작업이 정리되어 있다. |
