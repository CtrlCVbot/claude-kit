# Route Gap Review Results: user-guide-website

> **Review date**: 2026-05-27
> **Review stage**: `R2` route gap review
> **Source plan**: `.plans/features/active/user-guide-website/04-review/02-route-gap-review-pipeline.md`
> **Mode**: review-first, code-fix-second

## 1. Executive Summary

Route smoke 기준으로는 현재 Next.js 문서 사이트가 정상이다. `pnpm docs:build`는 통과했고, production server 기준으로 검토 대상 21개 route가 모두 HTTP 200으로 응답했다.

다만 archive로 바로 넘기기 전 보정하면 좋은 문서 정확도 gap이 있다. 핵심 gap은 Codex runtime asset 설명이 실제 `src/codex/plan/skills` 이름과 일부 다르거나 `후보`처럼 표현되어, 사용자가 구현 상태를 혼동할 수 있다는 점이다.

권장 결론은 **archive 전에 F1 focused fix를 1회 진행**하는 것이다. 보정 범위는 `src/lib/docs/planning-pages.ts`와 필요 시 `src/app/planning/page.tsx`에 한정한다.

## 2. Evidence

| Evidence | Result | Notes |
| --- | --- | --- |
| Git hygiene | PASS | review 시작 시 작업트리 clean |
| `pnpm docs:build` | PASS | 24 static routes generated |
| Route smoke | PASS | 검토 대상 21개 route 모두 HTTP 200 |
| Protected path diff | PASS | `src/claude`, `src/codex`, `scripts/setup.js` 변경 없음 |
| Vercel deployment | PASS | 최신 push 기준 deployment completed 확인 |

## 3. Route Smoke Matrix

| Route | Status | Finding |
| --- | --- | --- |
| `/` | PASS | 진입, planning/examples/reference 연결 확인 |
| `/planning` | PASS-WITH-NOTE | command 상세는 전체를 보여주지만, `Pipeline map`은 P1~P7까지만 강조 |
| `/planning/lifecycle` | PASS | idea/epic/feature lifecycle 설명 확인 |
| `/planning/reference` | PASS | 전체 planning command matrix 확인 |
| `/planning/plan-idea` | PASS-WITH-GAP | Codex skill path 이름 불일치 |
| `/planning/plan-screen` | PASS-WITH-GAP | Codex skill 이름 표현 불일치 |
| `/planning/plan-epic` | PASS | Epic 단계 별도 설명 확인 |
| `/planning/plan-draft` | PASS-WITH-GAP | Codex asset이 실제 구현보다 추상적으로 표현됨 |
| `/planning/plan-prd` | PASS-WITH-GAP | Codex skill 이름 표현 불일치 |
| `/planning/plan-wireframe` | PASS-WITH-GAP | Codex skill 이름 표현 불일치 |
| `/planning/plan-design` | PASS-WITH-GAP | 실제 `claude-design-workflow` 존재에도 후보처럼 표현됨 |
| `/planning/plan-stitch` | PASS | 선택적 Stitch checkpoint 설명 확인 |
| `/planning/plan-bridge` | PASS-WITH-NOTE | Codex bridge 설명은 충분하나 source naming은 후속 정밀화 가능 |
| `/planning/plan-review` | PASS | 리뷰/PCC/피드백 루프 설명 확인 |
| `/planning/plan-revise` | PASS | `plan-revise-workflow` 명시 확인 |
| `/planning/plan-improve` | PASS-WITH-NOTE | 개선 요청 routing 개념은 있으나 실제 skill/source 명시는 후속 보강 가능 |
| `/planning/plan-archive` | PASS | archive 조건과 workflow 설명 확인 |
| `/examples/website-build-pipeline` | PASS | 웹사이트 전환 pipeline 예시 확인 |
| `/examples/website-build-epic` | PASS | Epic/Feature 분해 예시 확인 |
| `/examples/website-build-artifacts` | PASS | `.plans`와 `docs/plans` 산출물 위치 예시 확인 |
| `/examples/website-build-commands` | PASS | 최소 프롬프트 예시 확인 |

## 4. Gap Board

| ID | Severity | Confidence | Area | Gap | Recommended Action |
| --- | --- | --- | --- | --- | --- |
| `R2-GAP-01` | MEDIUM | confirmed | Codex runtime asset naming | 일부 planning 상세 페이지의 Codex asset 이름이 실제 `src/codex/plan/skills`와 다르다. | `src/lib/docs/planning-pages.ts`의 Codex assets를 실제 source 이름으로 정렬한다. |
| `R2-GAP-02` | LOW | likely | `/planning` navigation | `/planning`의 `Pipeline map`은 P1~P7만 강조하고 R1/R2/I1/A1은 command grid에만 있다. | 핵심 실행 흐름과 review/archive 흐름을 구분해 표시하거나 문구를 명확히 한다. |
| `R2-GAP-03` | LOW | likely | Codex implementation state wording | 이미 source가 있는 항목도 `후보`로 표현되어 구현 상태가 덜 명확하다. | 실제 구현됨 / optional / future 후보를 구분한다. |

## 5. `R2-GAP-01` Detail

| Route | Current wording | Current source reality | Suggested wording |
| --- | --- | --- | --- |
| `/planning/plan-idea` | `src/codex/plan/skills/plan-idea-workflow` | `src/codex/plan/skills/plan-idea-management/SKILL.md` | `src/codex/plan/skills/plan-idea-management/SKILL.md` |
| `/planning/plan-screen` | `plan-screen workflow skill` | `src/codex/plan/skills/plan-screening-workflow/SKILL.md` | `plan-screening-workflow skill` |
| `/planning/plan-prd` | `plan-prd workflow skill` | `src/codex/plan/skills/plan-prd-authoring/SKILL.md` | `plan-prd-authoring skill` |
| `/planning/plan-wireframe` | `plan-wireframe workflow skill` | `src/codex/plan/skills/plan-wireframe-design/SKILL.md` | `plan-wireframe-design skill` |
| `/planning/plan-design` | `design workflow skill 후보` | `src/codex/plan/skills/claude-design-workflow/SKILL.md` | `claude-design-workflow skill` |
| `/planning/plan-stitch` | `stitch workflow skill 후보` | `src/codex/plan/skills/plan-stitch-workflow/SKILL.md` | `plan-stitch-workflow skill` |
| `/planning/plan-archive` | `archive workflow skill 후보` | `src/codex/plan/skills/plan-archive-workflow/SKILL.md` | `plan-archive-workflow skill` |

## 6. Recommended F1 Focused Fix

F1 보정은 아래 범위만 포함한다.

| File | Action |
| --- | --- |
| `src/lib/docs/planning-pages.ts` | Codex asset names를 실제 source 이름으로 정렬하고, 구현됨/후보 표현을 구분한다. |
| `src/app/planning/page.tsx` | 필요 시 `Pipeline map` 문구를 `core execution flow`와 `review/archive support flow`로 분리한다. |
| `.plans/features/active/user-guide-website/04-review/03-route-gap-review-results.md` | 보정 후 `Resolved` 섹션을 추가한다. |

제외 범위:

- `.claude/**`
- `.agents/**`
- `plugins/claude-kit/**`
- `src/claude/**`
- `src/codex/**`
- `scripts/setup.js`

## 7. Archive Gate

현재 archive gate 판정은 **HOLD**다.

| Gate | Status | Reason |
| --- | --- | --- |
| Route availability | PASS | 모든 route가 HTTP 200 |
| Critical/high gap | PASS | high 이상 gap 없음 |
| Medium content gap | HOLD | Codex asset naming 정확도 보정 권장 |
| Verification evidence | PASS | build와 route smoke 통과 |
| Archive readiness | HOLD | F1 보정 후 재검증 권장 |

## 8. Next Command

```text
F1 focused fix를 진행해주세요.
기준 문서는 `.plans/features/active/user-guide-website/04-review/03-route-gap-review-results.md`이고,
보정 범위는 `src/lib/docs/planning-pages.ts`와 필요 시 `src/app/planning/page.tsx`로 제한해주세요.
```
