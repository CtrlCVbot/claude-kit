# P5~P6: 디자인 (`/plan-wireframe` + `/plan-stitch`)

승인된 PRD를 ASCII 와이어프레임으로 설계한 뒤, Google Stitch로 실제 UI 디자인을 생성하는 단계다.
P5는 AI가 자동으로 화면 구조를 설계하고, P6는 AI-Human 협업으로 시각 디자인을 완성한다.
두 단계 모두 `/plan-review`와 PCC 검증을 통해 산출물 일관성을 보장한다.

---

## P5: 와이어프레임 (`/plan-wireframe`)

### 사용법

```
/plan-wireframe .plans/prd/10-approved/prd-2026-03-23-broker-export/
```

옵션:
- `--screen={name}` -- 특정 화면만 생성

전제 조건: PRD가 `10-approved/`에 존재하고 Status가 `approved`여야 한다.

### 6개 산출물

```
.plans/wireframes/{slug}/
├── 00-screen-list.md           <- 화면 목록 + 설명
├── 01-navigation-map.md        <- Mermaid: 화면 간 이동 관계
├── 02-wireframes/              <- 화면별 ASCII 와이어프레임
│   ├── screen-01-{name}.md
│   └── ...
├── 03-user-flows.md            <- Mermaid: 사용자 흐름 시퀀스
├── 04-state-diagrams.md        <- Mermaid: 상태 전이 다이어그램
└── 05-interaction-notes.md     <- 인터랙션 주석/상세 설명
```

| # | 파일 | 내용 |
|---|------|------|
| 1 | `00-screen-list.md` | 화면 ID, 경로, 유형, 관련 FR 매핑 테이블 |
| 2 | `01-navigation-map.md` | Mermaid graph -- 화면 간 이동 관계 |
| 3 | `02-wireframes/` | 화면별 ASCII 레이아웃 + Interaction Notes |
| 4 | `03-user-flows.md` | Mermaid sequence -- Happy Path + Edge Case |
| 5 | `04-state-diagrams.md` | Mermaid stateDiagram -- 상태 전이 |
| 6 | `05-interaction-notes.md` | 모든 사용자 액션과 시스템 반응 기술 |

### 워크플로우

```
/plan-wireframe {approved-prd-path}
       |
       v
+---------------------------------------+
|  plan-wireframe-designer (opus)       |
|                                       |
|  1. PRD 분석 -- 화면/흐름 추출       |
|  2. Screen List 작성                  |
|  3. Navigation Map 생성 (Mermaid)     |
|  4. 각 화면 ASCII Wireframe 생성      |
|  5. User Flow 다이어그램 (Mermaid)    |
|  6. State Diagram 생성 (Mermaid)      |
|  7. Interaction Annotations 작성      |
+---------------------------------------+
       |
       v
  /plan-review --type=wireframe (자동 트리거)
       |
       v
  .plans/wireframes/{slug}/
```

### plan-wireframe-designer 에이전트

| 항목 | 값 |
|------|-----|
| **모델** | opus |
| **역할** | PRD 분석 -> 화면 구조 설계 -> 와이어프레임 생성 |
| **읽기** | `.plans/prd/10-approved/`, `.plans/wireframes/` |
| **쓰기** | `.plans/wireframes/{slug}/` |
| **제한** | 코드 수정 금지, 와이어프레임 문서만 생성/수정 |

핵심 지시:
1. PRD의 FR/US를 분석하여 필요한 화면 목록 도출
2. ASCII 와이어프레임은 실제 레이아웃 반영
3. Navigation Map은 모든 화면 간 이동을 Mermaid로 표현
4. User Flow는 Happy Path + 주요 Edge Case 포함
5. 상태 전이가 있는 경우 State Diagram 필수 생성
6. 작성 완료 시 자동으로 `/plan-review --type=wireframe` 트리거

---

## P6: Stitch 디자인 통합 (`/plan-stitch`)

### 사용법

```
/plan-stitch .plans/prd/10-approved/prd-2026-03-23-broker-export/ .plans/wireframes/broker-export/
```

옵션:
- `--screen={id}` -- 특정 화면만 처리 (예: `--screen=SCR-01`)

전제 조건:
- PRD가 `10-approved/`에 존재
- 와이어프레임이 `/plan-review`를 통과 (`stage-manifest.json` 확인)

### Human-Assisted 4단계 워크플로우

AI가 전부 자동 처리하는 P5와 달리, P6는 사람이 Google Stitch를 직접 실행해야 한다.

```
+----------------------------+     +----------------------------+
|  Step 1: AI                |     |  Step 2: Human             |
|  Stitch 프롬프트 생성      | --> |  Google Stitch에서 실행    |
|  (PRD + Wireframe 분석)    |     |  HTML 결과 복사            |
+----------------------------+     +----------------------------+
                                              |
                                              v
+----------------------------+     +----------------------------+
|  Step 4: AI                |     |  Step 3: Human             |
|  검증 + 정리 + 문서화      | <-- |  HTML을 AI에게 전달        |
|  (HTML/CSS 검증, 디자인 노트)|    |  (붙여넣기 또는 파일 경로) |
+----------------------------+     +----------------------------+
```

**Step 1 -- AI가 Stitch 프롬프트 생성**: PRD + Wireframe 분석하여 화면별 프롬프트(레이아웃, 스타일, 인터랙션 상세 기술) 생성

**Step 2 -- Human이 Stitch 실행**: 프롬프트를 stitch.withgoogle.com에 입력, 생성된 HTML 복사

**Step 3 -- Human이 HTML 제공**: 클립보드 붙여넣기 또는 파일 경로로 AI에게 전달

**Step 4 -- AI가 검증/정리/문서화**:
- HTML5 구조, 반응형, 접근성 검증
- 불필요한 외부 의존성 제거, 스타일 일관성 정리
- 색상 체계, 컴포넌트 패턴, 와이어프레임 대비 변경사항 문서화

### 산출물

```
.plans/stitch/{slug}/
├── 00-stitch-prompts.md        <- 화면별 Stitch 프롬프트
├── html/                        <- 정리된 HTML 파일
│   ├── scr-01-{name}.html
│   └── ...
├── 01-design-notes.md          <- 디자인 결정사항 (색상, 컴포넌트 패턴, 변경사항)
└── 02-validation-report.md     <- HTML/CSS 검증 리포트
```

### plan-stitch-integrator 에이전트

| 항목 | 값 |
|------|-----|
| **모델** | sonnet |
| **역할** | Stitch 프롬프트 생성 + HTML 검증/정리 + 디자인 문서화 |
| **읽기** | `.plans/prd/10-approved/`, `.plans/wireframes/`, `.plans/stitch/` |
| **쓰기** | `.plans/stitch/{slug}/` |
| **제한** | 코드 수정 금지, `.plans/stitch/` 외 파일 변경 금지 |

---

## PCC 검증

### PCC-04: PRD <-> Wireframe 일관성

| # | 검증 항목 | 심각도 |
|---|----------|--------|
| 1 | PRD의 모든 FR에 대응하는 Screen 존재 | ERROR |
| 2 | Screen List의 모든 화면에 ASCII 와이어프레임 존재 | ERROR |
| 3 | PRD의 User Stories 흐름이 Navigation Map에 반영 | FLAG |
| 4 | PRD의 상태 전이가 State Diagram에 반영 | WARN |

### PCC-05: Wireframe <-> Stitch 일관성

| # | 검증 항목 | 심각도 |
|---|----------|--------|
| 1 | 와이어프레임의 모든 화면에 대응하는 Stitch HTML 존재 | ERROR |
| 2 | 와이어프레임의 주요 레이아웃 구조가 Stitch 디자인에 반영 | FLAG |
| 3 | 변경사항이 design-notes.md에 문서화 | WARN |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [01-planning-pipeline.md](./01-planning-pipeline.md) | 파이프라인 전체 구조 (P1~P7) |
| [P4: PRD 상세 작성](./v6-claude/phase-2-planning/04-plan-prd.md) | 이전 단계 -- 승인된 PRD 입력 |
| [P7: Bridge 핸드오프](./v6-claude/phase-2-planning/07-plan-bridge.md) | 다음 단계 -- 개발 핸드오프 |
| [리뷰 + PCC](./v6-claude/phase-2-planning/08-plan-review.md) | PCC-04, PCC-05 검증 상세 |
