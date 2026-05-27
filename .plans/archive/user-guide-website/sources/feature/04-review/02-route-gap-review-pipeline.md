# Route Gap Review Pipeline: user-guide-website

> **Purpose**: 최종 archive 전에 현재 Next.js 문서 사이트 구현을 route 단위로 다시 점검하고, 필요한 보정만 별도 커밋으로 분리한 뒤 archive readiness로 넘긴다.
> **Primary inputs**: `02-package/08-dev-tasks.md`, `02-package/09-test-cases.md`, `02-package/10-release-checklist.md`, `03-dev-notes/dev-output-summary.md`, `09-archive/01-archive-readiness.md`
> **Recommended mode**: review-first, code-fix-second, archive-last

## 1. 권장 결론

바로 archive로 가지 말고 아래 순서로 진행한다.

1. `R2` route gap review를 먼저 실행한다.
2. gap이 없으면 `A1` archive readiness를 최종 승인 대상으로 올린다.
3. gap이 있으면 최소 범위 코드 보정 커밋을 별도로 만든 뒤 `R2`를 재검증한다.
4. `R2`가 통과한 뒤에만 `09-archive/01-archive-readiness.md` 기준으로 archive를 실행한다.

이 순서를 추천하는 이유는 현재 기능이 이미 배포 가능 상태로 확인됐더라도, archive는 active planning package를 닫는 단계라서 route별 문서 품질과 실제 화면 범위를 한 번 더 고정해야 하기 때문이다.

## 2. 실행 단계

| Step | 이름 | 목적 | 결과 |
| --- | --- | --- | --- |
| `G0` | Workspace hygiene | review 전에 현재 작업트리와 generated output 상태를 분리한다. | review 대상과 제외 대상을 확정한다. |
| `R2` | Route gap review | `08-dev-tasks.md` 기준으로 route별 구현 gap을 확인한다. | gap board 또는 PASS 판정 |
| `F1` | Focused fix | 필요한 경우 docs site 코드만 최소 보정한다. | 별도 코드 보정 커밋 |
| `V1` | Verification refresh | 보정 후 build/test/docs check를 다시 실행한다. | archive 전 최신 evidence |
| `A1` | Archive approval | `01-archive-readiness.md` 기준으로 archive 가능 여부를 확정한다. | archive 실행 승인 |
| `A2` | Archive execution | active 산출물을 archive package로 이동한다. | `.plans/archive/user-guide-website/**` |

## 3. G0 Workspace Hygiene

### 목표

현재 작업트리에 남아 있는 변경이 route review나 docs site 보정과 섞이지 않게 한다.

### 확인 항목

| 확인 | 명령 | 판정 |
| --- | --- | --- |
| Git 상태 | `git status --short --branch` | source/docs site 변경과 generated output 변경을 분리한다. |
| docs site source 변경 | `git diff --name-only -- src/app src/components src/lib package.json next.config.mjs tsconfig.json` | route review 대상이다. |
| generated output 변경 | `git diff --name-only -- .claude .agents plugins AGENTS.md CLAUDE.md .claude-kit-meta.json` | 별도 커밋 또는 보류 대상으로 둔다. |

### 권장 판정

현재 남은 `.claude`, `.agents`, `plugins` 계열 변경은 docs site route gap review와 직접 관계가 낮다. 따라서 `R2/F1` 커밋에는 포함하지 않는다.

## 4. R2 Route Gap Review

### 기준 문서

`02-package/08-dev-tasks.md`를 기준으로 `TASK-UGW-001`부터 `TASK-UGW-006`까지 route와 산출물을 다시 매핑한다.

| TASK | 검토 범위 | 주요 route/source |
| --- | --- | --- |
| `TASK-UGW-001` | 홈/문서 shell | `/`, `src/app/page.tsx`, `src/components/docs/DocsShell.tsx` |
| `TASK-UGW-002` | planning route 전체 | `/planning`, `/planning/[slug]`, `src/lib/docs/planning-pages.ts` |
| `TASK-UGW-003` | Claude/Codex 탭 UX | `src/components/docs/RuntimeTabs.tsx`, planning 상세 페이지 |
| `TASK-UGW-004` | 실행 예시 페이지 | `/examples/[slug]`, `src/lib/docs/examples.ts` |
| `TASK-UGW-005` | build/deploy 설정 | `package.json`, `next.config.mjs`, lockfile |
| `TASK-UGW-006` | pipeline 기록/문서 | `docs/plans/user-guide-website/**`, `.plans/**` |

### route별 검토 목록

| Route | 검토 질문 | 기대 판정 |
| --- | --- | --- |
| `/` | 전체 가이드 진입, planning/examples 연결이 명확한가? | PASS 또는 copy gap |
| `/planning` | 전체 파이프라인 맵과 command 목록이 누락 없이 보이는가? | PASS 또는 navigation gap |
| `/planning/lifecycle` | 산출물 이동, 상태 전환, archive 흐름이 설명되는가? | PASS 또는 lifecycle gap |
| `/planning/reference` | command/agent/skill/rule/hook reference가 사용자가 찾기 쉬운가? | PASS 또는 reference gap |
| `/planning/plan-idea` | subagent/skill/hook/rule, 산출물 위치, Claude/Codex 탭이 충분한가? | PASS 또는 detail gap |
| `/planning/plan-screen` | screening 기준과 이동 규칙이 충분한가? | PASS 또는 scoring gap |
| `/planning/plan-epic` | epic이 누락 없이 별도 단계로 설명되는가? | PASS 또는 epic gap |
| `/planning/plan-draft` | epic 이후 feature draft 흐름이 자연스러운가? | PASS 또는 flow gap |
| `/planning/plan-prd` | PRD 작성 기준과 산출물 위치가 분명한가? | PASS 또는 content gap |
| `/planning/plan-wireframe` | wireframe 산출물과 디자인 전 단계 관계가 분명한가? | PASS 또는 design gap |
| `/planning/plan-design` | `plan-design`이 기본 디자인 경로이고 `plan-stitch`가 선택/보조임이 분명한가? | PASS 또는 branch gap |
| `/planning/plan-stitch` | Stitch는 선택적 Google Stitch 통합 경로로 설명되는가? | PASS 또는 optionality gap |
| `/planning/plan-bridge` | 개발 handoff 산출물과 dev package 연결이 분명한가? | PASS 또는 handoff gap |
| `/planning/plan-review` | 리뷰/PCC/피드백 반영 루프가 설명되는가? | PASS 또는 review gap |
| `/planning/plan-revise` | revise와 improve, archive 이후 개선 요청의 차이가 분명한가? | PASS 또는 lifecycle gap |
| `/planning/plan-improve` | archive 이후 개선 요청 처리 흐름이 설명되는가? | PASS 또는 improvement gap |
| `/planning/plan-archive` | archive 조건, source 이동, bundle 생성 기준이 설명되는가? | PASS 또는 archive gap |
| `/examples/website-build-pipeline` | 이번 웹사이트 전환 과정을 예시로 이해할 수 있는가? | PASS 또는 example gap |
| `/examples/website-build-epic` | epic과 feature 분해 예시가 충분한가? | PASS 또는 example gap |
| `/examples/website-build-artifacts` | 산출물 위치 예시가 실제 `.plans` 구조와 맞는가? | PASS 또는 artifact gap |
| `/examples/website-build-commands` | 실행 프롬프트 예시가 지나치게 복잡하지 않은가? | PASS 또는 prompt gap |

### 출력 형식

`R2` 결과는 이 문서 아래 또는 새 파일 `04-review/03-route-gap-review-results.md`에 기록한다.

권장 표:

| Route | Status | Gap | Severity | Action | Owner |
| --- | --- | --- | --- | --- | --- |
| `/planning/plan-epic` | PASS | 없음 | low | none | docs |

## 5. F1 Focused Fix

### 실행 조건

아래 중 하나라도 있으면 `F1` 보정을 진행한다.

- route가 404 또는 빈 페이지로 보인다.
- `plan-epic`, `plan-design`, `plan-stitch` 같은 핵심 분기 설명이 빠져 있다.
- Claude/Codex 탭이 실제 탭 UX가 아니거나 내용이 혼동된다.
- `.plans` 산출물 위치와 화면 설명이 서로 다르다.
- 실행 프롬프트 예시가 사용하기 어려울 정도로 복잡하다.

### 커밋 경계

보정 커밋은 docs site source만 포함한다.

포함 가능:

- `src/app/**`
- `src/components/docs/**`
- `src/lib/docs/**`
- `docs/user-guide-html/**`가 필요할 경우 legacy reference 보정
- `.plans/features/active/user-guide-website/04-review/**` review evidence

제외:

- `.claude/**`
- `.agents/**`
- `plugins/claude-kit/**`
- `.claude-kit-meta.json`
- source converter 또는 installer 변경

권장 커밋 메시지:

```text
fix: 사용자 가이드 route gap 보정
```

## 6. V1 Verification Refresh

`F1` 보정이 있든 없든 archive 전에는 최신 evidence를 다시 남긴다.

| 검증 | 목적 | 완료 기준 |
| --- | --- | --- |
| `pnpm docs:build` | Next.js production build 확인 | 24개 static route 생성 |
| `pnpm test` | 기존 claude-kit 기능 회귀 확인 | 전체 테스트 통과 |
| `pnpm check:docs` | generated reference docs drift 확인 | up to date |
| protected path diff | claude-kit runtime source 오염 방지 | 의도치 않은 `src/claude`, `src/codex`, `scripts/setup.js` 변경 없음 |
| browser spot check | 주요 route 화면 확인 | `/`, `/planning`, `/planning/plan-epic`, `/examples/website-build-pipeline` 정상 |

## 7. A1 Archive Approval

`09-archive/01-archive-readiness.md`의 `Final archive move`를 `pending`에서 `approved`로 바꾸는 조건은 아래다.

| 조건 | 기준 |
| --- | --- |
| Route gap review | 모든 high/critical gap 없음 |
| 보정 커밋 | 필요한 경우 별도 커밋 완료 |
| 검증 | `V1` evidence 최신화 |
| 배포 | Vercel 또는 local production build 정상 |
| 사용자 승인 | archive 실행 요청 또는 승인 확인 |

## 8. A2 Archive Execution

archive는 최종 승인 후에만 실행한다.

실행 기준:

- `plan-archive-workflow`를 따른다.
- active 산출물은 `.plans/archive/user-guide-website/sources/**`로 이동한다.
- archive bundle과 index를 생성/갱신한다.
- active package를 정리한다.

권장 커밋 메시지:

```text
docs: 사용자 가이드 웹사이트 기획 산출물 아카이브
```

## 9. Stop Conditions

아래 상황에서는 archive로 넘어가지 않는다.

- route gap review에서 high 이상 이슈가 남아 있다.
- `pnpm docs:build`가 실패한다.
- docs site 보정 커밋에 `.claude`, `.agents`, `plugins` generated output이 섞여 있다.
- archive 대상 source 파일 목록이 `01-archive-readiness.md`와 다르다.
- 사용자 최종 승인이 없다.

## 10. Recommended Next Command

다음 실행은 아래처럼 시작한다.

```text
R2 route gap review를 진행해주세요.
기준 문서는 `.plans/features/active/user-guide-website/04-review/02-route-gap-review-pipeline.md`이고,
결과는 `04-review/03-route-gap-review-results.md`로 남겨주세요.
gap이 있으면 바로 수정하지 말고 gap board를 먼저 보여주세요.
```
