# 기획 파이프라인 (P1~P7)

아이디어 발굴부터 개발 핸드오프까지의 End-to-End 기획 파이프라인.
7단계 파이프라인 + /plan-review 리뷰 루프 + PCC 일관성 검증 5종으로
기획 산출물의 품질과 일관성을 보장한다.

---

## 파이프라인 아키텍처

```
  P1             P2               P3             P4
/plan-idea --> /plan-screen --> /plan-draft --> /plan-prd
                   |                               |
              [승인 게이트]                    /plan-review
              approved만                     (자동 트리거)
              P3 진입 가능                         |
                                                   v
  P7             P6               P5
/plan-bridge <-- /plan-stitch <-- /plan-wireframe
     |                               |
     |                          /plan-review
     v                          (자동 트리거)
Phase A~E
(개발 워크플로우)
     |
     v  (개발 완료 후, 선택)
  P8 /plan-archive ──→ archive/{slug}/ARCHIVE-{KEY}.md
                            |
                            v  (개선요청 시)
                       /plan-improve ──→ P3/P5/P7/Dev 선택적 재진입


  ┌─────────────────────────────────────────────┐
  │  /plan-review 리뷰 루프                       │
  │  - P4, P5 완료 시 자동 트리거                   │
  │  - 어떤 단계에서든 수동 호출 가능                 │
  │  - PASS / WARN / FAIL (최대 3회 반복)          │
  │                                               │
  │  PCC 일관성 검증 (5종)                         │
  │  - 단계 간 산출물 일관성 자동 체크               │
  └─────────────────────────────────────────────┘
```

**핵심 게이트**: P2(/plan-screen) 완료 후 사용자의 **명시적 승인**이 있어야만
P3(/plan-draft) 이후 단계로 진입할 수 있다. 이 승인 게이트가 전체 파이프라인의
품질 관문 역할을 한다.

---

## 단계별 요약

| # | 단계 | 커맨드 | 에이전트 | 입력 | 산출물 | 체크포인트 |
|---|------|--------|----------|------|--------|-----------|
| P1 | 아이디어 수집 | `/plan-idea` | plan-idea-collector (sonnet) | Free text / 파일 경로 / "list" | `.plans/ideas/00-inbox/IDEA-{YYYYMMDD}-{NNN}.md` + `backlog.md` 인덱스 | - |
| P2 | RICE 스크리닝 | `/plan-screen` | plan-idea-screener (sonnet) | IDEA ID (00-inbox/) | `.plans/ideas/10-screening/SCREENING-{YYYYMMDD}-{NNN}.md` + `screening-matrix.md` | 점수 확인 + **승인 게이트** |
| P3 | 1차 기능 기획 | `/plan-draft` | - (routing) | Approved IDEA ID | `.plans/features/drafts/{slug}/first-pass.md` | Scope 확인 |
| P4 | PRD 상세 작성 | `/plan-prd` | plan-prd-writer (opus) | First-pass 문서 경로 | `.plans/prd/00-draft/` -> `10-approved/` | 승인/수정/반려 |
| P5 | 와이어프레임 | `/plan-wireframe` | plan-wireframe-designer (opus) | Approved PRD 경로 | `.plans/wireframes/{slug}/` | - (auto-review) |
| P6 | Stitch 디자인 | `/plan-stitch` | plan-stitch-integrator (sonnet) | PRD + Wireframe 경로 | `.plans/stitch/{slug}/` | Stitch 실행 (수동) |
| P7 | 기획->개발 핸드오프 | `/plan-bridge` | - (routing) | PRD + Wireframe + Stitch | Bridge context 파일들 | - |
| P8 | 아카이브 (선택) | `/plan-archive` | - | 완료된 기능 slug | `.plans/archive/{slug}/ARCHIVE-{KEY}.md` | - |

### P2 승인 게이트 상세

P2 `/plan-screen` 완료 시 아이디어 상태 흐름:

```
collected (P1) --> screened (에이전트 평가 완료)
                       |
                  [사용자 결정]
                   /    |     \
            approved  on-hold  rejected
            (20-approved/)   (90-archive/)
```

- **approved**: `20-approved/`로 이동, P3 진입 가능
- **on-hold**: `90-archive/`로 이동, 추후 재검토
- **rejected**: `90-archive/`로 이동, 종료
- `--auto-approve` 옵션: Go 제안(70+) 아이디어를 자동 승인 (배치 작업용)

---

## 리뷰 루프

모든 기획 단계에서 `/plan-review`가 산출물 품질을 검증한다.

```
산출물 생성 --> /plan-review --> PASS --> 다음 단계
                    |
                    +-- WARN --> 경고 표시 후 진행 가능
                    |
                    +-- FAIL --> 수정 --> 재생성 --> /plan-review
                                         (최대 3회 반복)
```

| 항목 | 설명 |
|------|------|
| 자동 트리거 | P4(`/plan-prd`), P5(`/plan-wireframe`) 완료 시 자동 호출 |
| 수동 호출 | `/plan-review <path> --type={stage}` 로 어떤 단계에서든 실행 가능 |
| 반복 제한 | 최대 3회 반복 후 FAIL 상태로 에스컬레이션 |
| 심각도 | ERROR > FLAG > WARN > PASS |

---

## PCC 일관성 검증 5종

PCC(Planning Consistency Check)는 파이프라인의 **단계 간 일관성**을 검증한다.

| ID | 검증 | 시점 | 비교 대상 | 심각도 |
|----|------|------|----------|--------|
| PCC-01 | Idea <-> Screen | `/plan-screen` 후 | 모든 아이디어가 스크리닝됨 | ERROR: 누락 시 차단 |
| PCC-02 | Screen <-> Feature | `/plan-draft` 후 | 승인된 아이디어에 기획이 존재 | ERROR: 미승인 진입 차단 |
| PCC-03 | Feature <-> PRD | `/plan-prd` 후 | 기획 범위가 PRD에 반영됨 | FLAG: 범위 불일치 경고 |
| PCC-04 | PRD <-> Wireframe | `/plan-wireframe` 후 | 모든 PRD 화면에 와이어프레임 존재 | FLAG: 누락 화면 경고 |
| PCC-05 | Wireframe <-> Stitch | `/plan-stitch` 후 | 와이어프레임 레이아웃이 디자인에 반영됨 | WARN: 레이아웃 차이 기록 |

### 심각도 체계

| 심각도 | 의미 | 행동 |
|--------|------|------|
| **ERROR** | 필수 항목 누락/불일치 | 차단 -- 수정 필수 |
| **FLAG** | 주요 불일치 (수동 확인 필요) | 경고 -- 사람 확인 후 진행 |
| **WARN** | 경미한 불일치 | 기록 -- 진행 가능 |
| **PASS** | 일치 확인됨 | 통과 |

---

## 산출물 폴더 구조

```
.plans/
  ideas/
    00-inbox/           # P1: 신규 아이디어
      IDEA-{YYYYMMDD}-{NNN}.md
    10-screening/       # P2: 스크리닝 완료 (screened)
      IDEA-{YYYYMMDD}-{NNN}.md
      SCREENING-{YYYYMMDD}-{NNN}.md
    20-approved/        # P2 승인 게이트 통과 (approved)
    90-archive/         # on-hold, rejected
    backlog.md          # 전체 아이디어 인덱스
    screening-matrix.md # 스크리닝 결과 인덱스
  features/
    drafts/             # P3: 1차 기능 기획
    active/             # P3: 진행 중
  prd/
    00-draft/           # P4: PRD 초안
    10-approved/        # P4: 승인된 PRD --> Phase A~E 입력
  wireframes/           # P5: 와이어프레임
    {slug}/
  stitch/               # P6: Stitch 디자인
    {slug}/
```

---

## 상세 문서

| 문서 | 설명 |
|------|------|
| `docs/02-plan-idea.md` | P1: `/plan-idea` 아이디어 수집 상세 |
| `docs/03-plan-screen.md` | P2: `/plan-screen` RICE 스크리닝 + 승인 게이트 상세 |
| `docs/04-plan-draft.md` | P3: `/plan-draft` 1차 기능 기획 상세 |
| `docs/05-plan-prd.md` | P4: `/plan-prd` PRD 상세 작성 |
| `docs/06-plan-wireframe.md` | P5: `/plan-wireframe` 와이어프레임 상세 |
| `docs/07-plan-stitch.md` | P6: `/plan-stitch` Stitch 디자인 상세 |
| `docs/08-plan-bridge.md` | P7: `/plan-bridge` 기획->개발 핸드오프 상세 |
