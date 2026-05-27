# Date and File Naming Rules

> 상태: 제안
> 목적: Claude Code와 Codex가 같은 날짜 기준, 파일명, ID 채번 규칙을 사용하게 한다
> 확인 기준일: 2026-05-26

## 핵심 원칙

| ID | 규칙 | 설명 |
| --- | --- | --- |
| D1 | 날짜는 머릿속으로 계산하지 않는다 | `Get-Date`, `date`, Python `datetime` 같은 runtime 도구로 확인한다 |
| D2 | 파일명용 날짜와 metadata 날짜를 분리한다 | ID와 파일명은 `YYYYMMDD`, 문서 metadata는 `YYYY-MM-DD`를 기본으로 쓴다 |
| D3 | timezone은 명시적으로 고정한다 | 기본은 사용자/프로젝트 timezone이며, 이 작업 기준은 `Asia/Seoul`이다 |
| D4 | 파일명은 artifact type별 표준 패턴을 따른다 | AI가 임의로 새 prefix나 suffix를 만들지 않는다 |
| D5 | `{NNN}`은 3자리 zero-padding을 기본으로 한다 | 예: `001`, `002`, `003` |
| D6 | 승인 상태는 파일명보다 위치와 metadata가 표현한다 | 승인됐다는 이유만으로 파일명에 `approved`를 임의로 붙이지 않는다 |
| D7 | 한 번 승인된 slug는 임의로 바꾸지 않는다 | rename은 migration task와 index 갱신을 동반한다 |

## 날짜 표기 표준

| 용도 | 형식 | 예시 | 비고 |
| --- | --- | --- | --- |
| artifact ID 날짜 | `YYYYMMDD` | `20260526` | `IDEA`, `SCREENING`, `EPIC` ID에 사용 |
| 문서 metadata 날짜 | `YYYY-MM-DD` | `2026-05-26` | frontmatter, 작성일, 승인일에 사용 |
| 세밀한 백업 suffix | `YYYYMMDD-HHmmss` | `20260526-104233` | 충돌 가능성이 있는 백업/rename에 사용 |
| 사람이 읽는 절대 날짜 | `YYYY-MM-DD` 또는 한국어 날짜 | `2026-05-26` | 상대 날짜만 단독 사용하지 않는다 |
| machine timestamp | ISO 8601 | `2026-05-26T10:42:33+09:00` | manifest, log, JSON에 적합 |

### 날짜 우선순위

| 우선순위 | 기준 | 규칙 |
| --- | --- | --- |
| 1 | runtime/system date | 현재 세션에서 명령으로 확인한 날짜를 우선한다 |
| 2 | language runtime | 날짜 계산이나 D-day 계산은 Python/JS 등으로 검증한다 |
| 3 | project template date | `AGENTS.md` 같은 template에 박힌 날짜는 stale 가능성을 점검한다 |
| 4 | 사용자 문장 속 상대 날짜 | `오늘`, `내일`, `어제`는 절대 날짜로 다시 확인한다 |

현재 확인값은 `Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'` 기준 `2026-05-26 10:43:33 +09:00`이다. 반면 현재 `AGENTS.md` managed block에는 `Today's date is 2026-04-24`가 남아 있어 stale guidance로 보인다. 표준안에서는 runtime/system date가 우선이다.

## 파일명/ID 매트릭스

| 산출물 | 위치 | 파일명 또는 ID | 채번 기준 |
| --- | --- | --- | --- |
| Idea | `.plans/ideas/00-inbox/` | `IDEA-{YYYYMMDD}-{NNN}.md` | 당일 Idea 순번 |
| Screening | `.plans/ideas/10-screening/` | `SCREENING-{YYYYMMDD}-{NNN}.md` | 원본 Idea와 같은 `{YYYYMMDD}-{NNN}` 유지 |
| Screening rescore backup | `.plans/ideas/10-screening/` | `SCREENING-{YYYYMMDD}-{NNN}-{prev_framework}.md` | 기존 screening 파일 rename |
| Epic | `.plans/epics/00-draft/` 등 | `EPIC-{YYYYMMDD}-{NNN}/` | 당일 Epic 순번 |
| Epic child backup | Epic package 내부 | `01-children-features.prev-{YYYYMMDD-HHmmss}.md` | backup 생성 시점 |
| Feature draft | `.plans/features/drafts/{slug}/` | `first-pass.md` | `{slug}`는 lowercase kebab-case |
| Active Feature | `.plans/features/active/{slug}/` | package directory | `{slug}`는 승인 후 안정화 |
| PRD draft | `.plans/prd/00-draft/` | `{slug}-prd.md` | Feature slug 기반 |
| PRD approved | `.plans/prd/10-approved/` | `{slug}-prd.md` | 위치로 승인 상태 표현 |
| PRD variant | `.plans/prd/**/` | `{slug}-scope-prd.md`, `{slug}-detail-prd.md` | scope/detail 구분이 필요할 때만 사용 |
| Wireframe | `.plans/wireframes/{slug}/` | package files | Feature slug 기반 |
| Stitch | `.plans/stitch/{slug}/` | package files | Feature slug 기반 |
| Claude Design prompt | `.plans/design/{slug}/` | `prompt-01-wireframe.md`, `prompt-02-highfidelity.md`, `manifest.md` | 순서 prefix 유지 |
| Archive bundle | `.plans/archive/{slug}/` | `ARCHIVE-{KEY}.md` | archive key 기반 |
| Improvement request | `.plans/archive/{slug}/improvements/` | `IMP-{KEY}-{NNN}.md` | archive key별 개선요청 순번 |
| Evidence manifest | `.plans/features/active/{slug}/evidence/` | `manifest.json` | 고정 파일명 |
| Stage manifest | stage package 내부 | `stage-manifest.json` | 고정 파일명 |

## Task ID 표준

Task ID는 `src/claude/core/_constants/task-id-patterns.json`을 SSOT로 본다.

| 유형 | 패턴 | 예시 | 용도 |
| --- | --- | --- | --- |
| dev | `T-[A-Z]{2,6}-\d{2,3}` | `T-HERO-01` | dev Feature TASK |
| plan | `TASK-[a-z0-9-]{3,40}-\d{2,3}` | `TASK-hero-refresh-03` | plan Feature TASK |
| legacy | `LEGACY-[A-Z]{2,6}-\d{2,3}` | `LEGACY-AUTH-07` | 레거시 격리 TASK |
| spike | `SPIKE-[A-Z]{2,6}-\d{2,3}` | `SPIKE-PERF-02` | Spike 조사 TASK |

## Slug 규칙

| 항목 | 규칙 |
| --- | --- |
| 문자 | lowercase 영문, 숫자, hyphen만 사용 |
| 공백 | 허용하지 않고 hyphen으로 변환 |
| 한글 | 파일명 slug에는 사용하지 않고 문서 title에만 사용 |
| 길이 | 사람이 읽을 수 있는 3~6단어 수준 권장 |
| 변경 | 승인 후 변경 시 migration task, index, manifest 갱신 필요 |

## 충돌 처리 규칙

| 상황 | 처리 |
| --- | --- |
| 같은 `{YYYYMMDD}-{NNN}` 후보가 이미 있음 | 다음 번호로 증가 |
| 두 AI가 동시에 같은 번호를 만들 가능성 | 생성 직전 폴더 재조회 후 최종 번호 확정 |
| 이미 생성된 파일의 이름이 표준과 다름 | 임의 rename 금지, migration task로 처리 |
| approved 산출물 이름 변경 필요 | 사용자 승인, index/manifest 갱신, 이전 경로 기록 필요 |
| backup 이름 충돌 | `YYYYMMDD-HHmmss` 뒤에 `-NN` suffix 추가 |

## 명확하지 않은 부분

| ID | 모호한 지점 | 현재 확인 | 권장 결정 |
| --- | --- | --- | --- |
| A1 | `AGENTS.md` 날짜와 system date가 다름 | `AGENTS.md`에는 `2026-04-24`, system date는 `2026-05-26 +09:00` | runtime/system date 우선, template 날짜 갱신 흐름 점검 |
| A2 | Codex용 date-calculation rule source | `src/claude/core/rules/date-calculation.md`는 있으나 `src/codex/core/rules/date-calculation.md`는 확인되지 않음 | Codex는 `AGENTS.md` fallback 유지 또는 Codex source rule 추가 결정 |
| A3 | `{NNN}` 채번 단위 | Idea, Epic은 당일 순번이 명시되나 전체 공통인지 type별인지 구현 상세가 흩어져 있음 | artifact type별 당일 순번으로 고정 |
| A4 | Screening `{NNN}` 의미 | `SCREENING-{YYYYMMDD}-{NNN}`가 원본 Idea 번호를 따르는지 screening 자체 순번인지 명시가 약함 | 원본 Idea ID와 같은 `{YYYYMMDD}-{NNN}` 유지 |
| A5 | Epic Codex command surface | Claude command source는 있으나 Codex command source는 확인되지 않음 | command-primary 추가 여부 결정 |
| A6 | Epic installed skill source | `.agents/skills/plan-epic-workflow`는 있으나 `src/codex` source와 metadata 연결은 확인되지 않음 | source-backed fallback 또는 command-primary로 정렬 |
| A7 | `30-on-hold`와 `90-archive` | constants/guard와 command 문서가 다르게 보임 | rejected idea 위치를 하나로 결정 |
| A8 | 문서 패키지 위치 | 이번 산출물은 사용자 요청에 따라 `docs/plans/**`, 기존 관례는 `docs/plan/**`도 존재 | 후속 정리 시 위치 통합 결정 |
| A9 | Epic child list ownership | `plan-revise`는 Epic child list를 직접 수정하지 않도록 제한함 | owner rule을 lifecycle 표준에 반영 |
| A10 | generated docs drift | `docs-generate --check`에서 기존 reference docs drift가 확인됨 | 이번 docs-only 범위와 분리해 별도 task로 처리 |

## 표준 적용 순서

1. 현재 날짜를 runtime 도구로 확인한다.
2. artifact type을 먼저 고른다.
3. 위 매트릭스에서 위치와 이름 패턴을 고른다.
4. 기존 폴더와 index를 조회해 `{NNN}` 충돌을 확인한다.
5. 파일을 만든 뒤 index, manifest, backlog 중 해당되는 파일을 함께 갱신한다.
6. 이동이나 승인 상태 변경은 사용자 승인과 guard transition을 확인한 뒤 수행한다.
