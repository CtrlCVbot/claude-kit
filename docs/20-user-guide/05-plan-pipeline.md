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
  ↓ /plan-wireframe /plan-stitch  (선택)
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

## 5. (선택) 디자인

```
/plan-wireframe   — 와이어프레임
/plan-stitch      — 시안 통합
```

UI 가 큰 비중을 차지하면 사용. 백엔드 전용이면 건너뜀.

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
| PRD → Bridge | plan-review 통과 권장 |
| Bridge → dev-feature | Feature Overview 필수 |

## 10. 예상 시간

| 단계 | 평균 |
|------|------|
| Idea | 1-2분 |
| Screen | 3-5분 |
| Draft | 5-10분 |
| PRD | 10-20분 |
| Bridge | 5-10분 |

실제 구현 (dev 도메인) 은 기능 규모에 따라.

## 다음 단계

- [04-daily-workflow.md](04-daily-workflow.md) — 브리지 이후의 구현 흐름
- [../10-features/03-plan-domain.md](../10-features/03-plan-domain.md) — plan 도메인 기능 레벨
- [07-troubleshooting.md](07-troubleshooting.md) — 게이트에 막혔을 때
