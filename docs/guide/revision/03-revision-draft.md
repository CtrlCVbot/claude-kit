# claude-kit Guide 수정안 초안

> 목적
> - 다음 수정 라운드에서 원문에 바로 옮길 수 있도록, 남아 있는 핵심 교체 문구를 복붙 가능한 형태로 정리
> - 이번 초안은 "현재 guide에서 아직 남아 있는 mismatch"만 다룬다

> 기본 가정
> - 상태 추적 파일명은 아직 최종 SSOT가 확정되지 않았다.
> - 따라서 아래 초안 중 상태 파일명 관련 문구는 `stage-manifest.json`을 임시 기준으로 쓰되, 실제 반영 직전 SSOT 결정과 함께 한 번 더 정렬한다.

---

## 1. 먼저 고정할 교체 기준

- `Inventory = 12 agents / 30 commands / 24 skills`
- `Phase B = Human Review`
- `/dev-verify = DVC 6항목`
- `총 9종 검증`은 파이프라인 전체 설명에서만 사용한다
- `P8 archive/improve`는 `/plan-archive + /plan-improve` 기준으로 설명한다
- `reviewPassed`는 더 이상 guide-only 개념이 아니므로, 설명을 축소하지 않는다

---

## 2. 문서별 교체 문안

### 2.1 `00-overview.md`

#### 수정 포인트 A. Phase E 설명을 `/dev-verify` 기준으로 교체

**교체 문구 초안**

```text
| E | `/dev-verify` | 테스트 + 빌드 + DVC 6항목 검증 |
```

#### 수정 포인트 B. 검증 체계 문구 분리

**교체 문구 초안**

```text
기획 5종(PCC) + 개발 4종(PDC/AIR/DPC/DVC) = 총 9종 검증이 파이프라인 전체에 걸쳐 실행된다.

단, `/dev-verify`는 이 중 Dev Phase의 DVC 6항목 검증을 담당한다.
즉, "총 9종 검증"은 end-to-end 파이프라인 설명이고, "`/dev-verify`"는 개발 단계 검증 커맨드다.
```

#### 수정 포인트 C. 퀵스타트에 P8 추가

**추가 문구 초안**

```text
### Step 6. 완료 기능 아카이브

예시 명령:
/plan-archive realtime-filter

개발이 끝난 기능의 산출물을 `.plans/archive/{slug}/ARCHIVE-{KEY}.md`로 묶고,
원본은 `sources/`로 이동한다.

### Step 7. 개선요청 재진입

예시 명령:
/plan-improve realtime-filter "모바일 필터 UX 개선"

ARCHIVE 번들을 기준으로 영향도를 분석하고, Dev only 또는 P3/P5/P7 재진입을 추천한다.
```

#### 수정 포인트 D. 문서 안내를 현행 guide 링크로 교체

**교체 문구 초안**

```text
| # | 문서 | 설명 |
|---|------|------|
| 1 | [01-planning-pipeline](01-planning-pipeline.md) | P1~P8 전체 기획 파이프라인 |
| 2 | [02-idea-management](02-idea-management.md) | 아이디어 수집/백로그 관리 |
| 3 | [03-screening](03-screening.md) | RICE 스크리닝 + 승인 게이트 |
| 4 | [04-feature-planning](04-feature-planning.md) | Lite/Standard, PRD 10섹션 |
| 5 | [05-design](05-design.md) | 와이어프레임/스티치 |
| 6 | [06-dev-handoff](06-dev-handoff.md) | P7 브릿지 |
| 7 | [07-review-pcc](07-review-pcc.md) | 리뷰 루프 + PCC |
| 8 | [08-dev-workflow](08-dev-workflow.md) | Phase A~E 개발 워크플로우 |
| 9 | [09-architecture](09-architecture.md) | 컴포넌트 카탈로그 + 상태 구조 |
| 10 | [10-glossary](10-glossary.md) | 용어집 + 커맨드 레퍼런스 |
| 11 | [11-archive-improve](11-archive-improve.md) | P8 아카이브 + 개선요청 |
| 12 | [12-blueprint-fast-track](12-blueprint-fast-track.md) | 기존 블루프린트의 Fast-Track 정규화 |
```

### 2.2 `01-planning-pipeline.md`

#### 수정 포인트 A. 상세 문서 링크 교체

**교체 문구 초안**

```text
| 문서 | 설명 |
|------|------|
| `02-idea-management.md` | P1: `/plan-idea` 아이디어 수집 상세 |
| `03-screening.md` | P2: `/plan-screen` RICE 스크리닝 + 승인 게이트 상세 |
| `04-feature-planning.md` | P3~P4: `/plan-draft`, `/plan-prd` 상세 |
| `05-design.md` | P5~P6: `/plan-wireframe`, `/plan-stitch` 상세 |
| `06-dev-handoff.md` | P7: `/plan-bridge` 기획→개발 핸드오프 상세 |
| `11-archive-improve.md` | P8: `/plan-archive`, `/plan-improve` 상세 |
| `12-blueprint-fast-track.md` | 기존 블루프린트의 P3 Fast-Track 정규화 |
```

#### 수정 포인트 B. 상태 추적 문구 보강

**추가 문구 초안**

```text
P8가 도입된 이후 파이프라인 상태 추적은 active 단계뿐 아니라 archived 단계까지 포함해야 한다.
상태 추적 문서의 공식 파일명은 guide/source alignment 결정에 따라 최종 확정하되,
guide 전반에서는 하나의 SSOT 이름만 사용해야 한다.
```

### 2.3 `02-idea-management.md`

#### 수정 포인트 A. 하단 related links 교체

**교체 문구 초안**

```text
| 문서 | 설명 |
|------|------|
| [01-planning-pipeline](01-planning-pipeline.md) | 파이프라인 전체 아키텍처 |
| [03-screening](03-screening.md) | P2: RICE 스크리닝 |
| [10-glossary](10-glossary.md) | 용어집 |
```

### 2.4 `05-design.md`

#### 수정 포인트 A. 하단 관련 문서 링크 교체

**교체 문구 초안**

```text
| 문서 | 설명 |
|------|------|
| [04-feature-planning](04-feature-planning.md) | 이전 단계: 승인된 PRD 입력 |
| [06-dev-handoff](06-dev-handoff.md) | 다음 단계: 개발 핸드오프 |
| [07-review-pcc](07-review-pcc.md) | PCC-04, PCC-05 검증 상세 |
```

### 2.5 `06-dev-handoff.md`

#### 수정 포인트 A. 하단 related links 교체

**교체 문구 초안**

```text
| 문서 | 설명 |
|------|------|
| [07-review-pcc](07-review-pcc.md) | review gate + PCC 검증 흐름 |
| [08-dev-workflow](08-dev-workflow.md) | Phase A~E 개발 워크플로우 |
| [12-blueprint-fast-track](12-blueprint-fast-track.md) | Blueprint Fast-Track의 Bridge 처리 |
```

### 2.6 `08-dev-workflow.md`

#### 수정 포인트 A. `Phase B` 제목 통일

**교체 문구 초안**

```text
## Phase B: Human Review

사람이 Feature Overview를 리뷰하고 승인/수정을 결정하는 단계다.
```

#### 수정 포인트 B. Phase E 설명을 DVC 6항목 기준으로 명확화

**추가 문구 초안**

```text
`/dev-verify`는 Phase E의 DVC 6항목 검증을 수행한다.
여기서 말하는 DVC는 Feature Package와 구현 코드의 일치 여부를 확인하는 개발 단계 검증이다.
전체 파이프라인 관점의 "총 9종 검증"과는 범위가 다르다.
```

#### 수정 포인트 C. 개발 완료 이후 P8 연결 문장 추가

**추가 문구 초안**

```text
개발이 완료된 기능은 필요 시 Phase P8(`/plan-archive`)로 넘어가 산출물을 번들화할 수 있다.
이후 개선요청은 `/plan-improve`로 다시 Dev 또는 기획 단계에 재진입한다.
```

### 2.7 `09-architecture.md`

#### 수정 포인트 A. inventory 집계 교체

**교체 문구 초안**

```text
### 도메인별 컴포넌트 수

| 카테고리 | core | dev | plan | 합계 |
|---------|:----:|:---:|:----:|:----:|
| Agents | 0 | 6 | 6 | 12 |
| Commands | 0 | 20 | 10 | 30 |
| Skills | 2 | 14 | 8 | 24 |
```

#### 수정 포인트 B. stale 항목 정리 안내

**교체 문구 초안**

```text
주의:
- 현재 설치 자산 기준으로 `dev-frontend-reviewer` agent는 존재하지 않는다.
- frontend 검증은 `/dev-verify-fe` command 중심으로 설명한다.
- 현재 설치 자산 기준으로 `dev-tenant-isolation` skill은 존재하지 않는다.
```

#### 수정 포인트 C. plan inventory 교체

**교체 문구 초안**

```text
#### Plan 도메인 Commands (10)

/plan-archive
/plan-bridge
/plan-draft
/plan-idea
/plan-improve
/plan-prd
/plan-review
/plan-screen
/plan-stitch
/plan-wireframe

#### Plan 도메인 Skills (8)

plan-archive-workflow
plan-idea-management
plan-pipeline
plan-prd-authoring
plan-review-criteria
plan-screening-workflow
plan-stitch-workflow
plan-wireframe-design
```

#### 수정 포인트 D. 상태 추적 섹션 문구 정리

**추가 문구 초안**

```text
상태 추적 문서의 공식 파일명은 guide/source alignment에서 최종 확정한다.
다만 어떤 이름을 쓰더라도, active 단계뿐 아니라 archived 단계와 improvement lineage까지 표현할 수 있어야 한다.
```

### 2.8 `10-glossary.md`

#### 수정 포인트 A. phase 정의 표 B 행 정리

**교체 문구 초안**

```text
| B | Human Review | Overview 승인/수정/거부 |
```

#### 수정 포인트 B. `/dev-verify` 구분 설명 보강

**추가 문구 초안**

```text
참고:
- `/dev-verify`는 Phase E의 DVC 6항목 검증을 실행한다.
- "총 9종 검증"은 PCC 5종 + PDC/AIR/DPC/DVC를 합친 파이프라인 전체 관점의 표현이다.
```

### 2.9 `12-blueprint-fast-track.md`

#### 수정 포인트 A. 상태 추적 용어 동기화 메모

**추가 문구 초안**

```text
주의:
이 문서의 `stage-manifest`, `entryPoint`, `sourceRef` 표기는 현재 guide 기준 운영 규칙이다.
상태 추적 문서의 공식 파일명은 guide/source alignment 결정 후 guide 전체에서 동일한 명칭으로 일괄 정리한다.
```

---

## 3. 메모

- 이번 초안은 "이미 해결된 문제"를 다시 고치라고 요구하지 않는다.
- 특히 `reviewPassed`는 guide와 `plan-review` command에 모두 반영되어 있으므로, 더 이상 축소하거나 제거하는 방향으로 쓰지 않는다.
- 가장 먼저 닫아야 할 실제 blocker는 상태 추적 파일명 SSOT다.
