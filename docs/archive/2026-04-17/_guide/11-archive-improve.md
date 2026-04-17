# P8: 아카이브 & 개선요청 (`/plan-archive`, `/plan-improve`)

기획 파이프라인(P1~P7) + 개발(A~E) 완료 후, 산출물을 하나로 묶어 아카이빙하고
개선요청 시 빠르게 분석/반영하는 단계다. P8은 선택 단계이며, 기능 개발이 완료된 뒤
언제든 실행할 수 있다.

---

## 왜 필요한가

기능 하나가 파이프라인을 완주하면 산출물이 5개 이상의 디렉토리에 분산된다.
기능이 쌓일수록 완료/진행중 구분이 불가능하고, 개선요청 시 관련 문서를
모아보기 어렵다.

아카이브 시스템은 이 문제를 해결한다:
- **단일 번들**: 모든 산출물을 `ARCHIVE-{KEY}.md` 하나에 인라인 → `Read` 1회로 전체 컨텍스트 로드
- **원본 이동**: `archive/{slug}/sources/`로 원본 보관 → active 디렉토리 정리
- **개선 루프**: 아카이브 번들을 기반으로 영향도 분석 → 파이프라인 선택적 재진입

---

## 전체 흐름

```
  P7 /plan-bridge
       │
       ▼
  Phase A~E (개발)
       │
       ▼ 개발 완료
  ┌────────────────────────────────────────────────┐
  │  P8 /plan-archive {slug}                        │
  │                                                  │
  │  1. 완료 검증 (파이프라인 이력 테이블)              │
  │  2. 소스 파일 수집 (슬러그 기반)                    │
  │  3. 원본 → archive/{slug}/sources/ 이동            │
  │  4. ARCHIVE-{KEY}.md 번들 생성                     │
  │  5. 인덱스 갱신 (index.md, backlog.md 등)          │
  │  6. active 디렉토리 정리                            │
  └────────────────────┬───────────────────────────┘
                       │
                       ▼
  ┌────────────────────────────────────────────────┐
  │  archive/{slug}/                                │
  │  ├── ARCHIVE-{KEY}.md   (통합 번들)              │
  │  ├── sources/           (원본 파일)              │
  │  └── improvements/      (개선요청)               │
  └────────────────────┬───────────────────────────┘
                       │ 개선요청 발생
                       ▼
  ┌────────────────────────────────────────────────┐
  │  /plan-improve {slug} "제목"                     │
  │                                                  │
  │  1. ARCHIVE 번들 로드 (전체 컨텍스트)               │
  │  2. 영향도 분석 + 재진입 지점 추천                   │
  │  3. 사용자 승인                                    │
  │  4. 경량(Dev) 또는 재기획(P3/P5/P7) 분기            │
  └────────────────────────────────────────────────┘
```

---

## 아카이브 워크플로우 (`/plan-archive`)

### 사용법

```bash
/plan-archive {slug}                    # 기능 아카이빙 실행
/plan-archive list                      # 아카이브된 기능 목록
/plan-archive show {slug}               # 아카이브 번들 요약 표시
/plan-archive status                    # 아카이빙 가능한 기능 목록
/plan-archive {slug} --feature F{N}     # 멀티 피처 중 개별 서브 피처 아카이브
```

### 실행 흐름 (8단계)

| # | 단계 | 설명 |
|---|------|------|
| 1 | 완료 검증 | IDEA 파일의 파이프라인 이력에서 모든 단계 `done` 확인 |
| 2 | 소스 수집 | 슬러그로 관련 파일 탐색 (ideas, features, wireframes, prd, stitch, bridge) |
| 3 | 디렉토리 생성 | `archive/{slug}/`, `sources/`, `improvements/` |
| 4 | 원본 이동 | 원본 파일을 `sources/`로 이동 (git 트래킹 시 `git mv`) |
| 5 | 번들 생성 | `ARCHIVE-{KEY}.md` — sources/ 내 파일을 인라인 |
| 6 | 인덱스 갱신 | `archive/index.md` + `backlog.md` + `screening-matrix.md` 경로 변경 |
| 7 | 정리 | 비어진 원본 디렉토리 삭제 |
| 8 | 확인 | 변경 요약 표시 |

**완료 검증 기준:**

| 기능 유형 | 필수 완료 단계 |
|----------|---------------|
| Lite | P1, P2, P3, P5, P7 + Dev |
| Standard | P1~P7 + Dev |

### 폴더 구조

```
.plans/archive/
├── index.md                          ← 전체 아카이브 인덱스
└── {slug}/
    ├── ARCHIVE-{KEY}.md             ← 통합 번들 (Read 1회로 전체 파악)
    ├── sources/                     ← 원본 파일 보관
    │   ├── IDEA-{NNN}.md
    │   ├── {slug}.md
    │   ├── feature-plan-{lite|standard}.md
    │   ├── wireframes/
    │   └── bridge/
    └── improvements/                ← 개선요청 문서
        └── IMP-{KEY}-{NNN}.md
```

### 번들 포맷 (`ARCHIVE-{KEY}.md`)

| 섹션 | 원본 | Lite | Standard |
|------|------|:----:|:--------:|
| 메타데이터 | - | O | O |
| 원본 파일 매니페스트 | - | O | O |
| 1. 아이디어 & 스크리닝 | `IDEA-{NNN}.md` | O | O |
| 2. 피처 오버뷰 | `{slug}.md` | O | O |
| 3. 피처 플랜 | `feature-plan-*.md` | O | O |
| 4. PRD | `prd/` | - | O |
| 5. 와이어프레임 | `wireframes/` | O | O |
| 6. 스티치 | `stitch/` | - | O |
| 7. 브릿지 | `bridge/` | O | O |
| 8. 개선 이력 | - | O | O |
| 9. 교훈 | session-wrap | O | O |

### 인덱스 갱신 규칙

| 인덱스 | 변경 내용 |
|--------|----------|
| `archive/index.md` | 새 행 추가 (Key, Slug, Title, Category, Score, Pipeline, Archived, Code, Impr.) |
| `backlog.md` | 상태 → `archived`, 파일 링크 → archive 번들 경로 |
| `screening-matrix.md` | 판정 → `Go (archived)`, 파일 링크 → archive 번들 경로 |
| IDEA 파일 (sources/ 내) | 파이프라인 이력에 Archive 행 추가 |

### 멀티 피처 프로젝트

`00-master-plan.md`가 존재하면 멀티 피처 프로젝트로 판단한다.

- 서브 피처 완료 시: `ARCHIVE-{KEY}-F{N}.md` 개별 아카이브
- 전체 완료 시: `ARCHIVE-{KEY}.md` 프로젝트 레벨 아카이브 (마스터플랜 + 서브 참조)

---

## 개선요청 워크플로우 (`/plan-improve`)

### 사용법

```bash
/plan-improve {slug} "개선 제목"                  # 개선요청 등록
/plan-improve {slug} list                          # 개선요청 목록
/plan-improve {slug} analyze IMP-{KEY}-{NNN}       # 영향도 분석
/plan-improve {slug} execute IMP-{KEY}-{NNN}       # 승인된 개선요청 실행
```

### IMP 문서 (`IMP-{KEY}-{NNN}.md`)

개선요청 문서는 `archive/{slug}/improvements/` 아래에 생성된다.
문서 구조:

| 섹션 | 내용 |
|------|------|
| 헤더 | Target, Category, Priority, Status, Filed |
| 컨텍스트 | 왜 필요한가 |
| 스코프 | 변경 내용, 영향도 매트릭스, 영향받는 ARCHIVE 섹션 |
| 파이프라인 재진입 | 추천 재진입 지점, 거쳐야 할 단계, 예상 작업량 |
| 해결 | 완료일, 커밋, 요약 (완료 시 작성) |

### IMP 상태 머신

```
draft ──→ analyzing ──→ approved ──→ in-progress ──→ done
  │                        │
  │                        └──→ rejected
  └──→ (삭제)
```

| 상태 | 전환 조건 |
|------|----------|
| `draft` | `/plan-improve {slug} "제목"` 실행 시 |
| `analyzing` | `/plan-improve analyze` 실행 시 |
| `approved` | 사용자가 분석 결과 확인 후 승인 |
| `in-progress` | `/plan-improve execute` 실행 시 |
| `done` | 코드 변경 + 검증 완료 시 |
| `rejected` | 사용자 반려 시 |

### 영향도 분석 매트릭스

| 영역 | 영향도 | 판단 기준 |
|------|--------|----------|
| UI/레이아웃 | high/medium/low/none | 화면 구조, 컴포넌트 변경 여부 |
| 데이터/상태 | high/medium/low/none | 데이터 모델, 상태 관리 변경 여부 |
| API/통신 | high/medium/low/none | API 엔드포인트 변경 여부 |
| 퍼포먼스 | high/medium/low/none | 성능 관련 변경 여부 |
| 접근성 | high/medium/low/none | 접근성 관련 변경 여부 |

### 파이프라인 재진입 규칙

영향도 분석 결과에 따라 파이프라인 재진입 지점을 결정한다.

| 변경 유형 | 재진입 지점 | 거치는 단계 |
|-----------|------------|-------------|
| 카피/텍스트만 | Dev only | Dev |
| 스타일/레이아웃 미세 조정 | P7 | P7 → Dev |
| 새 UI 섹션/컴포넌트 | P5 | P5 → P7 → Dev |
| 기능 스코프 확장 | P3 | P3 → P5 → P7 → Dev |
| 근본적 재설계 | P1 | 전체 파이프라인 (새 IDEA) |

---

## 검증 체크리스트

### 아카이빙 검증

- [ ] 파이프라인 이력에서 모든 필수 단계 `done` 확인
- [ ] `archive/{slug}/sources/`에 원본 파일 이동 완료
- [ ] `ARCHIVE-{KEY}.md` 번들 생성 + 모든 섹션 인라인
- [ ] `archive/index.md` 행 추가
- [ ] `backlog.md` 상태 `archived` + 경로 변경
- [ ] `screening-matrix.md` 경로 갱신
- [ ] active 디렉토리에서 해당 슬러그 파일 제거
- [ ] 번들 `Read` 1회로 전체 컨텍스트 로드 가능

### 개선요청 검증

- [ ] `IMP-{KEY}-{NNN}.md` 생성 확인
- [ ] 영향도 매트릭스 출력
- [ ] 재진입 지점 추천 출력
- [ ] IMP 상태 전환 정상 작동
- [ ] ARCHIVE 번들 "개선 이력" 섹션 업데이트

---

## 관련 문서

- [기획 파이프라인 (P1~P7)](01-planning-pipeline.md) -- 아카이브 전 단계
- [P7: 개발 핸드오프](06-dev-handoff.md) -- P8 직전 단계
- [개발 워크플로우 (A~E)](08-dev-workflow.md) -- 아카이브 전 개발 단계
- [리뷰 & PCC 검증](07-review-pcc.md) -- 품질 검증 체계
- [용어집](10-glossary.md) -- archive, IMP 관련 용어
- [Blueprint Fast-Track](12-blueprint-fast-track.md) -- Fast-Track 피처의 아카이빙 시 블루프린트 원본 참조 보존
