# Plan Pipeline

> **Status**: Draft (P4, 2026-04-17)
> **Source**: `src/claude/plan/commands/`, [../10-features/03-plan-domain.md](../10-features/03-plan-domain.md)
> **Related**: [04-daily-workflow.md](04-daily-workflow.md)

`plan` 도메인으로 **아이디어에서 개발 핸드오프까지** 진행하는 흐름입니다. `profile.json` 에 `"plan"` 포함 필요.

## 파이프라인 한눈에

```
아이디어
  ↓ /plan-idea
인박스 (.plans/ideas/00-inbox/)
  ↓ /plan-screen (+ 사용자 승인 게이트)
스크리닝 통과
  ↓ /plan-draft
1차 기획 (Lite | Standard 판정)
  ↓ /plan-prd (Standard 만)
상세 PRD
  ↓ /plan-wireframe   (와이어프레임 = 구조 확정)
와이어프레임 산출물
  ↓ [택일]  ┌─ /plan-design  (Claude Design: 2단계 프롬프트 → 고충실도 시안)
           └─ /plan-stitch  (Stitch HTML 기반 통합)
           ※ 미실행 시 /plan-bridge 진입 시 Checkpoint에서 skip 선언
디자인 산출물
  ↓ /plan-bridge
dev 도메인 → /dev-feature
  ↓ ... 구현 ...
  ↓ /plan-archive
아카이브 + /plan-improve 회고
```

## 1. 아이디어 수집 — `/plan-idea`

```
/plan-idea 로그인 실패 시 rate limiting 추가
```

생성물: `.plans/ideas/00-inbox/IDEA-YYYY-MM-DD-{slug}.md`

자유 서술로 아이디어를 모으는 인박스 단계입니다. 구조화·우선순위는 나중.

## 2. 스크리닝 — `/plan-screen <IDEA-ID>`

```
/plan-screen IDEA-2026-04-17-rate-limiting
```

`plan-idea-screener` 서브에이전트가 **RICE** (Reach·Impact·Confidence·Effort) 프레임으로 점수를 매기고 판단을 제시합니다.

### 승인 게이트 ★

여기가 가장 중요한 지점입니다. **사용자의 명시적 승인 없이는 `/plan-draft` 이후로 넘어갈 수 없습니다**. `plan-doc-guard.js` 훅이 이를 강제합니다.

승인 후 인박스에서 `.plans/ideas/10-screened/` 로 이동.

## 3. 1차 기획 — `/plan-draft <IDEA-ID>`

```
/plan-draft IDEA-2026-04-17-rate-limiting
```

Lite 또는 Standard 중 하나로 판정:

| 유형 | 기준 | 다음 |
|------|------|------|
| **Lite** | 파일 1-2개, API/DB 변경 없음 | 바로 dev 핸드오프 |
| **Standard** | 3+ 파일, 아키텍처 영향 | `/plan-prd` 로 상세화 |

## 4. 상세 PRD — `/plan-prd <draft-path>` (Standard 만)

```
/plan-prd .plans/ideas/10-screened/IDEA-xxx.md
```

`plan-prd-writer` 서브에이전트가 PRD 를 작성합니다. 포함 내용:
- 배경·목표·비목표
- 성공 기준 (수용 테스트)
- 기술 설계 개요
- 영향받는 컴포넌트
- 리스크·대안
- 참고

생성물: `.plans/prd/{slug}.md`

## 5. 와이어프레임 → 시각 완성 (택일)

UI 비중이 있는 Feature는 아래 3-step 을 거칩니다. 백엔드 전용이면 전체를 건너뛰고 `/plan-bridge` Checkpoint 에서 `skipped` 를 선언합니다.

### 5a. 구조 확정 — `/plan-wireframe`

```
/plan-wireframe
```

`plan-wireframe-designer` 가 `screens.md` / `components.md` / `navigation.md` / `decision-log.md` 4 종을 `.plans/wireframes/{slug}/` 에 생성합니다. 이 단계는 **design / stitch 의 선행 필수**.

### 5b. 시각 완성 — `/plan-design` 또는 `/plan-stitch` **(둘 중 택일)**

| 커맨드 | 산출물 | 언제 선택 |
|-------|--------|---------|
| `/plan-design` | `.plans/design/{slug}/prompt-01-wireframe.md` + `prompt-02-highfidelity.md` + `manifest.md` | Claude Design(claude.ai/design) 으로 시각 완성도를 끌어올리고 싶을 때 (권장) |
| `/plan-stitch` | `.plans/stitch/{slug}/` 통합 컨텍스트 | 기존 Stitch HTML 결과를 그대로 통합할 때 |

두 커맨드는 `routing-metadata.md` 의 `post_wireframe_path` 필드로 **상호 배제** 됩니다. design 실행 후 stitch 를 추가하려면 `/plan-stitch --force-sequential --sequential-reason "<사유>"` 가 필요합니다 (`design+stitch` 또는 `stitch+design` 기록).

### 5c. 시각 완성 생략 — `/plan-bridge` Checkpoint

design / stitch 를 모두 생략할 수 있으나, 이 경우 `/plan-bridge` 진입 시 Checkpoint 가 **[1] design 실행 / [2] stitch 실행 / [3] skip** 을 사용자에게 묻습니다. `[3] skip` 선택 시 `post_wireframe_path: skipped` + `skip_reason` 이 기록되어 감사 추적이 남습니다.

## 6. 개발 핸드오프 — `/plan-bridge <slug>`

```
/plan-bridge rate-limiting
```

plan 도메인에서 만든 문서를 **`/dev-feature` 입력 형태로 변환** 합니다.

- Feature Overview 작성
- 구조 SSOT 연결 (dev-architecture 결과)
- TASK 후보 분할

이후는 dev 도메인 ([04-daily-workflow.md](04-daily-workflow.md)).

## 7. 완료 후 — `/plan-archive` + `/plan-improve`

기능이 머지되면:

```
/plan-archive rate-limiting
```

`.plans/features/active/` → `.plans/archive/` 이동. 관련 산출물 번들.

```
/plan-improve
```

회고·개선 제안. 반복 패턴이 있으면 새 스킬/커맨드 제안.

## 8. 리뷰 — `/plan-review`

파이프라인 어느 단계에서든 호출 가능:

```
/plan-review .plans/prd/{slug}.md
```

`plan-reviewer` 서브에이전트가 문서 품질·누락 섹션·명확성을 점검합니다.

## 9. 주요 게이트 요약

| 단계 | 게이트 |
|------|--------|
| Screen → Draft | **사용자 명시적 승인 필수** |
| Draft → PRD | Lite/Standard 판정 결과 |
| PRD → Wireframe | wireframe 은 design/stitch 의 선행 필수 (Standard 기준) |
| Wireframe → [Design \| Stitch] | **둘 중 택일** — `post_wireframe_path` 에 `design` / `stitch` / `design+stitch` / `stitch+design` / `skipped` 기록 |
| Design/Stitch 생략 → Bridge | `/plan-bridge` Checkpoint 에서 [1/2/3] 선택 — skip 시 `skip_reason` 필수 |
| PRD → Bridge | plan-review 통과 권장 |
| Bridge → dev-feature | Feature Overview 필수 |

## 10. 예상 시간

| 단계 | 평균 |
|------|------|
| Idea | 1-2분 |
| Screen | 3-5분 |
| Draft | 5-10분 |
| PRD | 10-20분 |
| Wireframe | 10-20분 |
| Design (Claude Design 세션 포함) | 5-15분 |
| Stitch | 10-20분 |
| Bridge | 5-10분 |

실제 구현 (dev 도메인) 은 기능 규모에 따라.

## 다음 단계

- [04-daily-workflow.md](04-daily-workflow.md) — 브리지 이후의 구현 흐름
- [../10-features/03-plan-domain.md](../10-features/03-plan-domain.md) — plan 도메인 기능 레벨
- [07-troubleshooting.md](07-troubleshooting.md) — 게이트에 막혔을 때
