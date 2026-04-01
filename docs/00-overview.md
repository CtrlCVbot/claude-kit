# claude-kit 시스템 개요

## 한눈에 보기

claude-kit은 AI-First 기획+개발 파이프라인이다. 아이디어 발굴부터 RICE 스크리닝, 기획, PRD 작성, 개발 핸드오프까지 하나의 파이프라인으로 자동화한다. `pnpm add -D claude-kit` 한 줄로 ~86개 AI 거버넌스 컴포넌트가 설치되며, `/plan-idea`로 아이디어를 등록하면 `/dev-feature`로 개발이 시작될 때까지 모든 단계가 커맨드 기반으로 연결된다.

---

## 전체 워크플로우

```
Phase P (기획 파이프라인):

  P1           P2            P3           P4          P5             P6           P7
  /plan-idea → /plan-screen → /plan-draft → /plan-prd → /plan-wireframe → /plan-stitch → /plan-bridge
  아이디어     RICE 스크리닝   Lite/Std     PRD 작성    와이어프레임     Stitch 디자인   개발 핸드오프
  등록         + 승인 게이트   판정                                                     ↓
                                                                                       ↓
Phase A~E (개발 워크플로우):                                                             ↓
                                                                                       ↓
  /dev-feature → Human Review → Package Gen → /dev-run → /dev-verify → /dev-commit
  Feature        사람 확인       코드 생성      TDD 구현    품질 검증      커밋
  Package 생성   + 승인          Rules 적용     자동 루프    9종 검증
```

| 단계 | 커맨드 | 설명 |
|------|--------|------|
| P1 | `/plan-idea` | 자연어 아이디어를 `00-inbox/IDEA-{YYYYMMDD}-{NNN}.md`로 구조화 등록 |
| P2 | `/plan-screen` | RICE 5축 평가 + Go/Hold/Kill 제안 + 사용자 승인 게이트 |
| P3 | `/plan-draft` | 승인된 아이디어의 1차 기능 기획, Lite/Standard 판정 |
| P4 | `/plan-prd` | Standard 아이디어에 대해 10개 섹션 PRD 상세 작성 |
| P5 | `/plan-wireframe` | ASCII/Mermaid 기반 와이어프레임 생성 |
| P6 | `/plan-stitch` | Google Stitch 디자인 (사용자 협업) |
| P7 | `/plan-bridge` | PRD를 `.plans/prd/10-approved/`에 배치, 개발 핸드오프 |
| A | `/dev-feature` | 승인된 PRD로 Feature Package 생성 |
| D | `/dev-run` | TDD 기반 자동 구현 루프 |
| E | `/dev-verify` | 테스트 + 빌드 + 9종 일관성 검증 |

---

## 도메인 구조

claude-kit은 3개 도메인으로 분리된다. 소스는 도메인별로 나뉘고, 설치 결과는 `.claude/` 아래 flat 구조로 배치된다.

- **core** -- 공유 규칙, 공통 hooks/skills/templates. 접두사 없음 (항상 설치)
- **dev** -- 개발 전용 에이전트, 커맨드, 스킬, 훅. `dev-` 접두사
- **plan** -- 기획 전용 에이전트, 커맨드, 스킬, 훅, 템플릿. `plan-` 접두사 (선택 설치)

```
src/
├── core/   ← 공유: rules, hooks, skills, templates
├── dev/    ← 개발: dev-architect, dev-feature, dev-tdd-workflow ...
└── plan/   ← 기획: plan-idea, plan-screen, plan-prd-writer ...
```

**컴포넌트 유형 4가지**:

| 유형 | 위치 | 역할 |
|------|------|------|
| Agent | `.claude/agents/` | 전문 역할 수행 (opus 모델, Task tool 스폰) |
| Command | `.claude/commands/` | 사용자 진입점 (`/plan-idea`, `/dev-feature`) |
| Skill | `.claude/skills/` | 컨텍스트 매칭으로 자동 활성화되는 워크플로우 |
| Hook | `.claude/hooks/` | 자동 실행 가드레일 (blocking/logging) |

---

## 퀵스타트: 첫 아이디어부터 개발까지

### Step 1. 아이디어 등록

```
/plan-idea "검색 결과에 실시간 필터링 기능 추가"
```

`00-inbox/IDEA-20260325-001.md` 파일이 생성되고 `backlog.md` 인덱스에 등록된다.

### Step 2. RICE 스크리닝 + 승인

```
/plan-screen IDEA-20260325-001
```

5축 RICE 평가 후 Go/Hold/Kill을 **제안**한다. 사용자가 **승인**하면 `20-approved/`로 이동, 상태가 `approved`로 전환된다.

### Step 3. 1차 기획 (Lite/Standard 판정)

```
/plan-draft IDEA-20260325-001
```

승인된 아이디어를 기반으로 1차 기능 기획을 생성한다. 규모에 따라 Lite(간단) 또는 Standard(PRD 필요) 판정.

### Step 4. PRD 작성 (Standard만)

```
/plan-prd .plans/features/drafts/realtime-filter/first-pass.md
```

Standard 판정된 아이디어에 대해 10개 섹션 PRD를 작성한다. `plan-prd-writer` 에이전트가 자동 생성 후 `/plan-review`가 트리거된다.

### Step 5. 개발 핸드오프 + 개발 시작

```
/plan-bridge realtime-filter
/dev-feature .plans/prd/10-approved/prd-2026-03-25-realtime-filter/
```

Bridge가 PRD를 `10-approved/`에 배치하면, `/dev-feature`가 Feature Package를 생성하고 TDD 기반 개발 루프가 시작된다.

---

## 아이디어 폴더 구조

```
.plans/ideas/
├── 00-inbox/           ← 신규 등록 (IDEA-{YYYYMMDD}-{NNN}.md)
├── 10-screening/       ← 스크리닝 진행 중 (SCREENING-{YYYYMMDD}-{NNN}.md 포함)
├── 20-approved/        ← 승인 완료 → /plan-draft 대상
├── 90-archive/         ← 보류(on-hold) 또는 반려(rejected)
├── backlog.md          ← 전체 아이디어 인덱스 (상태 + 위치 추적)
└── screening-matrix.md ← RICE 스코어 요약 테이블
```

---

## 검증 체계

기획 5종(PCC) + 개발 4종(PDC/AIR/DPC/DVC) = **총 9종 일관성 검증**이 파이프라인 전체에 걸쳐 자동 실행된다.

```
Phase P:  P1─P2─[PCC-01]─P3─[PCC-02]─P4─[PCC-03]─P5─[PCC-04]─P6─[PCC-05]─P7
Phase A~E: A─[PDC]─[AIR]──B──C─[DPC]──D──[DVC]
```

---

## 문서 안내

| # | 문서 | 설명 |
|---|------|------|
| 1 | [00-start-here](v6-claude/00-start-here.md) | 상황별 읽기 경로 안내 |
| 2 | [01-overview](v6-claude/01-overview.md) | v6 전체 구조 지도 (Phase 1~4 상세) |
| 3 | [PLAYBOOK](v6-claude/PLAYBOOK.md) | Phase별 실행 순서 + 체크리스트 |
| 4 | [profile-schema](v6-claude/profile-schema.md) | profile.json v2.0 스키마 |
| 5 | [Phase 1: 설치](v6-claude/phase-1-install/00-install-guide.md) | claude-kit v2.0 도메인 선택 설치 |
| 6 | [Phase 2: 기획](v6-claude/phase-2-planning/00-planning-pipeline-overview.md) | 7단계 기획 파이프라인 아키텍처 |
| 7 | [Phase 3: 개발](v6-claude/phase-3-dev-system/00-overview.md) | Vertical Slice + Dev Loop 설계 |
| 8 | [Phase 4: 모노레포](v6-claude/phase-4-monorepo/00-monorepo-scaffolding.md) | pnpm + Turbo 스캐폴딩 |
| 9 | [workflow-guide](v6-claude/docs/workflow-guide.md) | Phase P + Phase A~E 통합 워크플로우 상세 |
| 10 | [workflow-cheatsheet](v6-claude/docs/workflow-cheatsheet.md) | 3분 빠른 참조 치트시트 |
| 11 | [GLOSSARY](v6-claude/GLOSSARY.md) | 약어, 명령 매핑, 핵심 개념 사전 |
