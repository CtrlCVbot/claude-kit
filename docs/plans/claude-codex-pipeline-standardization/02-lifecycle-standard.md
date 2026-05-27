# Lifecycle Standard

> 상태: 제안
> 목적: 파일 생성부터 승인, 변경 반영, 이동, 아카이빙까지의 공통 규칙 고정

## 표준 원칙

| 원칙 | 규칙 |
| --- | --- |
| 한 상태는 한 위치 | 같은 의미의 상태를 여러 폴더 이름으로 표현하지 않는다 |
| 날짜와 파일명은 표준 패턴 사용 | 날짜 확인, ID, slug, 백업 suffix는 [05-date-file-naming-rules.md](05-date-file-naming-rules.md)를 따른다 |
| 승인 전/후 분리 | draft와 approved output은 물리 경로로 분리한다 |
| 변경 이력 보존 | 승인된 산출물은 덮어쓰기보다 revise 또는 improve 흐름으로 처리한다 |
| generated output 직접 수정 금지 | `.claude/**`, `.agents/**`, `.codex/**`, `plugins/**`는 검증 대상으로 본다 |
| 사용자 승인 필요 단계 고정 | approval, closeout, archive, destructive move는 사용자 승인 또는 명시적 gate가 필요하다 |
| 상태 기록과 파일 이동 동시 처리 | 파일을 이동하면 index 또는 manifest도 함께 갱신한다 |

## Epic lifecycle

Epic은 Feature보다 상위에 있는 선택적 계층이다. 3개 이상 Feature가 같은 제품 Theme를 공유하거나, 여러 Feature에 걸친 cross-cutting 요구사항이 있을 때만 사용한다.

| 단계 | 상태 | 표준 위치 | 다음 이동 |
| --- | --- | --- | --- |
| Epic draft | `draft` | `.plans/epics/00-draft/EPIC-{YYYYMMDD}-{NNN}/` | brief와 children 초안 작성 |
| Epic planning | `planning` | `.plans/epics/10-planning/EPIC-{YYYYMMDD}-{NNN}/` | child IDEA 최소 1개 연결 |
| Epic active | `active` | `.plans/epics/20-active/EPIC-{YYYYMMDD}-{NNN}/` | child Feature 구현 진행 |
| Epic completed | `completed` | `.plans/epics/30-completed/EPIC-{YYYYMMDD}-{NNN}/` | 모든 child Feature 완료 |
| Epic archived | `archived` | `.plans/epics/90-archive/EPIC-{YYYYMMDD}-{NNN}/` | archive bundle과 index 갱신 |

Epic은 기본 Feature lifecycle을 대체하지 않는다. Epic에 속한 각 child Feature는 아래 Plan artifact lifecycle을 그대로 따른다.

## Plan artifact lifecycle

소비자 프로젝트의 `.plans/**` Feature 산출물은 아래 lifecycle을 표준으로 둔다.

| 단계 | 상태 | 표준 위치 | 다음 이동 |
| --- | --- | --- | --- |
| Intake | `inbox` | `.plans/ideas/00-inbox/IDEA-{YYYYMMDD}-{NNN}.md` | screening 시작 시 `10-screening` |
| Screening | `screened` | `.plans/ideas/10-screening/` | 승인 시 `20-approved`, 보류 시 `30-on-hold` |
| Approved idea | `approved` | `.plans/ideas/20-approved/` | `plan-draft` 진입 |
| On hold | `on-hold` | `.plans/ideas/30-on-hold/` | 재검토 시 `10-screening` |
| Feature draft | `draft` | `.plans/features/drafts/{slug}/first-pass.md` | PRD 작성 또는 Lite active |
| Active feature | `active` | `.plans/features/active/{slug}/` | PRD, wireframe, stitch, bridge, dev |
| PRD draft | `draft` | `.plans/prd/00-draft/{slug}-prd.md` | 승인 시 `10-approved` |
| Approved PRD | `approved` | `.plans/prd/10-approved/{slug}-prd.md` | wireframe, stitch, bridge |
| Completed | `done` | active package 내부 | archive 후보 |
| Archived | `archived` | `.plans/archive/{slug}/` | improve 요청만 허용 |

## Epic과 Feature 연결 표준

| 연결 방식 | 표준 |
| --- | --- |
| 새 IDEA 연결 | `/plan-idea "{title}" --epic=EPIC-{YYYYMMDD}-{NNN}` |
| 기존 Feature 연결 | `.plans/features/active/{slug}/00-context/08-epic-binding.md` 작성 |
| Epic 쪽 child 목록 | `.plans/epics/{status}/EPIC-.../01-children-features.md` |
| Epic index | `.plans/epics/index.md` |
| 상태 동기화 | IDEA frontmatter를 SSOT로 보고 backlog, children features, binding 문서에 반영 |

Epic 생성은 opt-in이다. Feature 2개 이하이거나 단일 기능 개선이면 Epic을 만들지 않고 기존 Feature pipeline을 유지한다.

## IDEA 이동 표준

현재 실행 가능한 기준은 `src/codex/plan/_constants/idea-folders.json`과 `plan-idea-move-guard.js`에 맞춘다.

| 이동 | 허용 여부 | 메모 |
| --- | --- | --- |
| `00-inbox -> 10-screening` | 허용 | screening 시작 |
| `10-screening -> 20-approved` | 허용 | 승인 |
| `10-screening -> 30-on-hold` | 허용 | 보류 |
| `30-on-hold -> 10-screening` | 허용 | 재검토 |
| `10-screening -> 90-archive` | 보류 | `plan-screen.md`에는 있지만 guard/constants에는 없음 |
| `.plans/ideas/** -> 외부 경로` | 금지 | archive workflow 같은 명시 단계 제외 |

### 반려 상태 권장안

`rejected`는 현재 표준 경로가 확정되지 않았다. 다음 중 하나를 선택해야 한다.

| 선택지 | 장점 | 단점 | 추천 |
| --- | --- | --- | --- |
| A. `30-on-hold` 안에 `status: rejected` 기록 | 현재 guard와 즉시 맞음 | 보류와 반려가 한 폴더에 섞임 | 임시 운영 가능 |
| B. `90-archive`를 constants와 guard에 추가 | `plan-screen.md`와 맞음 | 구현 변경 필요 | 장기 표준 후보 |
| C. rejected도 `.plans/archive/`로 보냄 | 완료된 이력 보존이 명확 | archive workflow와 screening reject가 섞임 | 명확한 정책 필요 |

권장은 B다. 다만 이번 작업은 docs-only이므로 실제 변경은 [04-migration-plan.md](04-migration-plan.md)의 P4 이후로 둔다.

## PRD 승인 표준

| 단계 | 위치 | 규칙 |
| --- | --- | --- |
| draft 생성 | `.plans/prd/00-draft/{slug}-prd.md` | 생성 직후에는 승인된 source로 쓰지 않는다 |
| review | `plan-review {path} --type=prd` | PASS/WARN/FAIL을 기록한다 |
| 승인 | `.plans/prd/10-approved/{slug}-prd.md` | 사용자 승인 후 이동한다 |
| 수정 | `plan-prd {slug} --revise` 또는 `plan-revise` | 승인 전이면 draft 수정, 승인 후면 변경 이력 기록 |
| 반려 | draft에 사유 기록 | approved로 이동하지 않는다 |

## Review 표준

`plan-review`는 READ-ONLY 성격의 검토 단계로 둔다. PASS가 나면 `stage-manifest.json`에 `reviewPassed: true`를 기록하는 흐름을 표준으로 삼는다.

| 판정 | 의미 | 다음 액션 |
| --- | --- | --- |
| PASS | 다음 단계 진행 가능 | manifest에 `reviewPassed: true` 기록 |
| WARN | 진행 가능하지만 위험 존재 | 위험과 후속 조치 기록 후 진행 여부 결정 |
| FAIL | 다음 단계 진행 불가 | 수정 후 재리뷰 |

## Change request 표준

변경 요청은 발생 시점에 따라 다르게 처리한다.

| 발생 시점 | 처리 방식 | 표준 위치 |
| --- | --- | --- |
| 승인 전 | 기존 draft를 수정하고 review 재실행 | draft 위치 |
| 승인 직후 | approved 산출물에 변경 이력 추가 후 revise | approved 위치와 review log |
| dev handoff 후 | bridge 또는 dev feature package 변경으로 처리 | `.plans/features/active/{slug}/00-context/**` |
| archive 후 | `plan-improve`로 IMP 문서 생성 | `.plans/archive/{slug}/improvements/` |

## Copy pipeline lifecycle

copy domain은 evidence와 gap row가 중심이다.

| 단계 | 상태 | 표준 위치 |
| --- | --- | --- |
| Reference capture | `reference-ready` | `.plans/features/active/{slug}/evidence/manifest.json` |
| Visual review | `visual-reviewed` | Visual Gap Board |
| Interaction review | `interaction-reviewed` | Interaction Gap Board |
| Gap board | `prioritized` | Prioritized Gap Board |
| Plan unit | `planned` | execution unit plan |
| Verify | `verified` | QA Result Report |
| Closeout | `closed` | Closeout Memo와 stage manifest |

`copy-closeout`는 사용자 승인 없이 closeout 상태를 기록하지 않는다고 명시되어 있으므로, 이 원칙은 모든 closeout/approval 단계의 공통 규칙으로 둔다.

## Claude-kit authoring asset lifecycle

`claude-kit` 자체 자산은 소비자 프로젝트의 `.plans/**`와 다른 lifecycle을 쓴다.

| 단계 | 표준 위치 | 규칙 |
| --- | --- | --- |
| source 생성 | `src/claude/**` 또는 `src/codex/**` | target별 source에 작성 |
| pairing 기록 | `src/pairing-registry.json` | paired, codex-skip, unpaired, transitionState 기록 |
| 예외 기록 | `src/exception-registry.json` | fallback, review, skip 사유 기록 |
| emitter 확인 | `scripts/setup.js --dry-run` | 실제 output 경로와 충돌 확인 |
| generated output 확인 | `.claude/**`, `.agents/**`, `.codex/**`, `plugins/**` | 직접 수정하지 않고 결과만 검증 |
| release readiness | test/docs check | `pnpm test`, `node scripts/codex-hook-compat.js`, `node scripts/docs-generate.js --check` |

## Stage manifest 표준

`stage-manifest.json` 계열 상태는 다음 vocabulary를 우선 사용한다.

| 상태 | 뜻 |
| --- | --- |
| `pending` | 아직 시작 전 |
| `in-progress` | 진행 중 |
| `done` | 완료 |
| `skipped` | 명시적 사유로 건너뜀 |
| `blocked` | 진행 불가 |

이 값은 `src/codex/core/_schemas/stage-manifest.schema.json`에 맞춘다.
