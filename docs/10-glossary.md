# 용어집 + 커맨드 레퍼런스

> claude-kit v2.0 전체 용어, 커맨드, 검증 코드를 한 곳에서 확인하는 빠른 참조 문서.

---

## 용어 정의

| 용어 | 설명 |
|------|------|
| RICE | Reach x Impact x Confidence / Effort. 아이디어 우선순위 스코어링 (0-100점 가중 합산) |
| PCC | Planning Consistency Check. 기획 단계별 일관성 검증 (PCC-01~05) |
| PDC | PRD-Document Consistency. PRD와 Feature Overview 일치 검증 |
| AIR | Artifact Integrity Review. Phase A 산출물 무결성 검토 |
| DPC | Document-Package Consistency. Overview와 Feature Package 일치 검증 |
| DVC | Document-Verification Consistency. Package와 구현 코드 일치 검증 |
| PRD | Product Requirements Document. 10개 섹션으로 구성된 요구사항 정의서 |
| Lite / Standard | 기능 규모 판정. Lite는 단일 파일 기획으로 종료, Standard는 전체 파이프라인 수행 |
| Go / Hold / Kill | 스크리닝 판정. Go(70+점)=실행, Hold(40-69)=보류, Kill(<40)=폐기 |
| screened | 스크리닝 완료 상태. 사용자 승인 전 단계 |
| approved | 사용자 명시적 승인 완료. `/plan-draft` 진행 가능 |
| on-hold | 보류 상태. 90-archive로 이동, 조건 충족 시 재평가 가능 |
| rejected | 반려 상태. 90-archive로 이동 |
| archived | 아카이브 완료 상태. `archive/{slug}/`로 이동, 산출물 번들화 |
| ARCHIVE-{KEY}.md | 완료된 기능의 통합 번들. 전체 산출물을 인라인하여 Read 1회로 컨텍스트 로드 |
| IMP-{KEY}-{NNN} | 개선요청 문서 ID. 아카이브 기능별 순번 채번 |
| Archive Fallback | 파일 탐색 시 active 경로 → archive/*/sources/ 순서로 조회하는 패턴 |
| Feature Overview | Phase A에서 생성하는 기능 개요 문서 (Section 1~10) |
| Feature Package | Phase C에서 생성하는 구현 작업 명세서 (최대 11개 문서) |
| Bridge Context | Phase P7에서 생성하는 Planning에서 Dev 전환 문서 |
| Feature Key | 3~8자 영문 대문자 식별자 (예: `BSEE`). Promote 후 변경 금지 |
| Promote | Feature Key 확정 + PRD Freeze + Decision Log 생성 |
| Stage Manifest | `.plans/stage-manifest.json`. feature별 기획 단계 상태 추적 |
| SSOT | Single Source of Truth. 하나의 정보는 하나의 문서에서만 정의 |
| Quality Gate | Phase D TASK별 통과 기준 5개. 3회 연속 실패 시 blocked |
| 플래트닝 | `src/{domain}/{category}/`에서 `.claude/{category}/`로 빌드하는 과정 |
| IDEA-{YYYYMMDD}-{NNN} | 아이디어 ID 형식. 날짜 + 일별 순번 채번 |

---

## 커맨드 퀵 레퍼런스

### Planning 커맨드 (Phase P)

| 커맨드 | 용도 | Stage | 예시 |
|--------|------|-------|------|
| `/plan-idea` | 아이디어 수집 | P1 | `/plan-idea "운송 실시간 추적 기능"` |
| `/plan-screen` | RICE 스크리닝 | P2 | `/plan-screen IDEA-20260325-001` |
| `/plan-draft` | 1차 기능 기획 (Lite/Standard 판정) | P3 | `/plan-draft IDEA-20260325-001` |
| `/plan-prd` | PRD 상세 작성 (10개 섹션) | P4 | `/plan-prd .plans/features/drafts/tracking/first-pass.md` |
| `/plan-wireframe` | ASCII + Mermaid 와이어프레임 | P5 | `/plan-wireframe .plans/prd/00-draft/tracking-prd.md` |
| `/plan-stitch` | Stitch 디자인 통합 | P6 | `/plan-stitch .plans/wireframes/tracking/` |
| `/plan-bridge` | 기획에서 개발 핸드오프 | P7 | `/plan-bridge tracking` |
| `/plan-archive` | 완료 기능 아카이빙 + 번들 생성 | P8 | `/plan-archive optic-landing-page` |
| `/plan-improve` | 아카이브 개선요청 등록/분석/실행 | - | `/plan-improve optic-landing-page "모바일 개선"` |
| `/plan-review` | 반복 리뷰 + PCC 검증 | any | `/plan-review <path> --type=prd` |

### Dev 커맨드 (Phase A~E)

| 커맨드 | 용도 | Phase | 예시 |
|--------|------|-------|------|
| `/dev-feature` | PRD에서 Overview+Package 생성 | A~C | `/dev-feature .plans/prd/10-approved/prd-...-tracking/` |
| `/dev-run` | TASK별 TDD 자동 구현 | D | `/dev-run .plans/features/active/tracking` |
| `/dev-verify` | 개발 완전성 검증 (DVC 6항목) | E | `/dev-verify .plans/features/active/tracking` |
| `/dev-test-verify` | 테스트 품질 + 커버리지 검증 | E | `/dev-test-verify` |
| `/dev-commit` | Conventional Commit 생성 | E | `/dev-commit` |
| `/dev-commit-push-pr` | 커밋 + Push + PR 생성 | E | `/dev-commit-push-pr` |
| `/dev-continue` | 중단된 Dev Loop 재개 | D | `/dev-continue` |
| `/dev-review` | 아키텍처 코드 리뷰 | D/E | `/dev-review` |
| `/dev-refactor` | 구조적 리팩토링 | D | `/dev-refactor` |
| `/dev-security-review` | 보안 취약점 검토 | D/E | `/dev-security-review` |
| `/dev-learn` | 도메인 지식 추출 | any | `/dev-learn` |

---

## 검증 코드 요약

### Planning 검증 (PCC)

| 코드 | 이름 | 시점 | 검증 대상 | 항목수 |
|------|------|------|----------|:------:|
| PCC-01 | Planning Consistency Check #1 | P2 후 | Idea와 Screening 일치 | 3 |
| PCC-02 | Planning Consistency Check #2 | P3 후 | Screening과 Feature 일치 | 3 |
| PCC-03 | Planning Consistency Check #3 | P4 후 | Feature와 PRD 일치 | 5 |
| PCC-04 | Planning Consistency Check #4 | P5 후 | PRD와 Wireframe 일치 | 4 |
| PCC-05 | Planning Consistency Check #5 | P6 후 | Wireframe과 Stitch 일치 | 3 |

### Dev 검증 (PDC / AIR / DPC / DVC)

| 코드 | 이름 | 시점 | 검증 대상 | 항목수 |
|------|------|------|----------|:------:|
| PDC | PRD-Document Consistency | A4.5 | PRD와 Feature Overview 일치 | 5 |
| AIR | Artifact Integrity Review | A6.5 | Phase A 산출물 무결성 | 4 |
| DPC | Document-Package Consistency | C1.5 | Overview와 Feature Package 일치 | 6 |
| DVC | Document-Verification Consistency | Phase E | Package와 구현 코드 일치 | 6 |

### 심각도 체계

| 등급 | 의미 | 행동 |
|------|------|------|
| ERROR | 필수 항목 누락/불일치 | 차단 -- 수정 필수 |
| FLAG | 주요 불일치 (수동 확인 필요) | 경고 -- 사람 확인 후 진행 |
| WARN | 경미한 불일치 | 기록 -- 진행 가능 |
| PASS | 일치 확인됨 | 통과 |

---

## 상태 전환 맵

```
new → screening → screened → approved → (P3~P7) → dev
                           → on-hold  → (90-archive)
                           → rejected → (90-archive)
```

- `new`: 아이디어 등록 직후 (`00-inbox/`)
- `screening`: 스크리닝 진행 중 (`10-screening/`)
- `screened`: 스크리닝 완료, 사용자 승인 대기 (`10-screening/`)
- `approved`: 사용자 승인 완료 (`20-approved/`) -- `/plan-draft` 진행 가능
- `on-hold`: 보류 (`90-archive/`) -- 조건 충족 시 재평가
- `rejected`: 반려 (`90-archive/`)

---

## 폴더 구조 요약

```
.plans/
├── ideas/
│   ├── 00-inbox/              ← 신규 아이디어 (new)
│   ├── 10-screening/          ← 스크리닝 중/완료 대기
│   ├── 20-approved/           ← 사용자 승인 완료
│   ├── 90-archive/            ← 반려/보류
│   ├── backlog.md             ← 전체 인덱스
│   └── screening-matrix.md    ← 스크리닝 인덱스
├── features/
│   ├── drafts/{slug}/         ← P3 1차 기획
│   └── active/{slug}/         ← Phase A~E 활성 feature
│       ├── 00-context/        ← Bridge Context
│       ├── 02-package/        ← Feature Package (11개 문서)
│       └── 03-dev-notes/      ← 개발 노트 + DVC 리포트
├── prd/
│   ├── 00-draft/              ← PRD 초안
│   └── 10-approved/           ← PRD 승인본
├── wireframes/{slug}/         ← 와이어프레임
├── stitch/{slug}/             ← Stitch HTML
├── reviews/{slug}/            ← 리뷰 결과
└── stage-manifest.json        ← 단계별 상태 추적
```

---

## Phase 정의

| Phase | 이름 | 설명 |
|-------|------|------|
| P | Planning | 기획 파이프라인 7단계 (P1 Idea에서 P7 Bridge) |
| A | Artifact | Feature Overview 생성 + PDC/AIR 검증 |
| B | Blueprint | Human Review -- Overview 승인/수정/거부 |
| C | Code | Feature Package 생성 + DPC 검증 |
| D | Delivery | TDD 기반 구현 + Quality Gate |
| E | Evaluate | DVC 검증 + 테스트 품질 확인 + 커밋 |
