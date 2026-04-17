# P7: 기획->개발 핸드오프 (`/plan-bridge`)

기획 산출물(PRD + Wireframe + Stitch)을 개발 워크플로우가 소비할 수 있는 Bridge Context로 변환하는 단계다. Bridge가 완료되면 `/dev-feature`를 추가 설정 없이 바로 실행할 수 있다.

---

## 사용법

```bash
# 경로 직접 지정
/plan-bridge .plans/prd/10-approved/prd-2026-03-23-broker-export/ \
  .plans/wireframes/broker-export/ \
  .plans/stitch/broker-export/

# slug만 지정 (경로 자동 추론)
/plan-bridge --slug=broker-export
```

---

## Bridge Context 3개 파일

Bridge는 `.plans/features/active/{slug}/00-context/`에 3개 파일을 생성한다.

| 파일 | 내용 | 개발 활용 시점 |
|------|------|--------------|
| `03-bridge-wireframe.md` | 화면 목록, Screen ID, Navigation Map(Mermaid), 주요 인터랙션 | Phase A~E UI Spec 작성 시 화면 구조 참조 |
| `04-bridge-stitch.md` | 디자인 시스템(색상 체계), 컴포넌트 패턴, HTML 파일 경로 | Phase D UI 컴포넌트 구현 시 디자인 참조 |
| `05-bridge-context.md` | P1~P7 전체 기획 요약, 산출물 경로, 다음 단계 안내 | Phase A 시작 시 전체 기획 맥락 파악 |

```
.plans/features/active/{slug}/
└── 00-context/
    ├── 00-index.md              ← Phase A에서 생성
    ├── 01-prd-freeze.md         ← Phase A에서 생성
    ├── 02-decision-log.md       ← Phase A에서 생성
    ├── 03-bridge-wireframe.md   ← Bridge 생성
    ├── 04-bridge-stitch.md      ← Bridge 생성
    └── 05-bridge-context.md     ← Bridge 생성
```

---

## PRD 경로 매칭 규칙

Bridge 출력 경로와 `/dev-feature` 입력 경로가 **정확히 일치**한다. 이것이 기획->개발 연결의 핵심 계약이다.

```
/plan-bridge output:  .plans/prd/10-approved/prd-{date}-{slug}/
/dev-feature input:   .plans/prd/10-approved/prd-{date}-{slug}/
```

경로 불일치 시 `/dev-feature`가 PRD를 찾지 못하므로, 이 계약은 반드시 유지되어야 한다.

---

## Pre-Check

Bridge 실행 전 `stage-manifest.json`에서 3개 선행 조건을 검증한다.

| 검증 항목 | 조건 |
|----------|------|
| PRD | `prd.reviewPassed === true` |
| Wireframe | `wireframe.reviewPassed === true` |
| Stitch | `stitch.validated === true` |

하나라도 `false`면 Bridge 실행이 차단된다. `/plan-review`를 먼저 통과시켜야 한다.

---

## 개발 진입

Bridge 완료 후 개발 워크플로우를 시작한다.

```bash
/dev-feature .plans/prd/10-approved/prd-2026-03-23-broker-export/
```

실행 흐름:
- **Phase A**: PRD 분석 + Feature Overview 생성 (Bridge Context 참조)
- **Phase B**: Human Review
- **Phase C**: Feature Package 생성
- **Phase D**: TDD 자동 구현
- **Phase E**: 검증 + 커밋

Bridge Context 파일(`03~05`)은 Phase A~E에서 읽기 전용으로 참조된다.

---

## 전체 검증 체계 연결

기획부터 개발까지 총 9개 검증 포인트가 일관성을 보장한다.

### Planning 검증 (PCC 5종)

| ID | 검증 | 시점 |
|----|------|------|
| PCC-01 | Idea <-> Screen | `/plan-screen` 후 |
| PCC-02 | Screen <-> Feature | `/plan-draft` 후 |
| PCC-03 | Feature <-> PRD | `/plan-prd` 후 |
| PCC-04 | PRD <-> Wireframe | `/plan-wireframe` 후 |
| PCC-05 | Wireframe <-> Stitch | `/plan-stitch` 후 |

### Development 검증 (4종)

| ID | 검증 | 시점 |
|----|------|------|
| PDC | PRD <-> Overview | Phase A4.5 |
| AIR | Phase A 무결성 | Phase A6.5 |
| DPC | Overview <-> Package | Phase C1.5 |
| DVC | Package <-> 구현 | Phase E |

심각도 체계는 전체 통일: ERROR(차단) > FLAG(경고) > WARN(기록) > PASS(통과).

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [01-planning-pipeline.md](./01-planning-pipeline.md) | Phase P 전체 구조 |
| [08-dev-workflow.md](./08-dev-workflow.md) | 개발 워크플로우 Phase A~E |
| [12-blueprint-fast-track.md](./12-blueprint-fast-track.md) | 기존 설계 자산의 P3 정규화 진입 — Fast-Track 경로의 Bridge 처리 |
