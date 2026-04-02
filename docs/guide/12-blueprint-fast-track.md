# 블루프린트 Fast-Track: 기존 설계 자산의 파이프라인 정규화

기획이 이미 상당히 완료된 외부 설계 자산(블루프린트)을 claude-kit 파이프라인에 안전하게 태우는 방법을 설명한다. 핵심은 블루프린트를 source spec으로 유지하면서, 기존 파이프라인 계약(approved PRD, Bridge, `/dev-feature`)을 그대로 활용하는 것이다.

---

## 왜 필요한가

claude-kit 파이프라인은 P1(아이디어 등록)부터 시작하는 정규 흐름을 전제로 설계되어 있다. 그러나 현실에서는 이미 충분히 분석된 설계 문서가 존재하는 경우가 있다. 역설계 문서, 외부 기획 자산, 레거시 시스템 분석 등이 대표적이다.

이런 문서를 P1부터 다시 태우면 이미 가진 분석을 버리는 낭비가 생기고, 그대로 PRD로 간주하면 실행 계약(review, Bridge, 경로)을 우회하는 위험이 생긴다.

Fast-Track은 이 두 극단 사이의 **공식 중간 경로**다.

---

## 불변 계약 (4가지)

블루프린트가 어떤 경로로 들어오든, 아래 4가지 계약은 절대 깨지지 않는다.

| # | 계약 | 의미 |
|---|------|------|
| 1 | **Blueprint = source spec** | 블루프린트 원본은 수정하지 않는다. 참조만 한다. |
| 2 | **Approved PRD = execution SSOT** | 개발의 공식 입력은 블루프린트가 아니라 승인된 PRD다. |
| 3 | **Bridge output path == /dev-feature input path** | `/plan-bridge` 출력 경로와 `/dev-feature` 입력 경로는 정확히 일치해야 한다. |
| 4 | **Lite/Standard 판정은 claude-kit 기준이 최종 우선** | 블루프린트의 기존 판정은 참고만 한다. |

---

## Entry Assessment: 어디로 들어갈 것인가

블루프린트를 파이프라인에 태울 때 **가장 먼저** 해야 할 일은 "어떤 경로로 정규화할 것인가"를 판단하는 것이다. 이 판단을 Entry Assessment라고 부른다.

```
블루프린트 도착
     |
     v
[Entry Assessment]
     |
     ├── 승인 trace + backlog 재평가 필요?  ──→  /plan-idea (P1) 정규 진입
     |
     ├── feature intent 충분, execution SSOT 아님?  ──→  /plan-draft (P3) Fast-Track
     |
     ├── PRD 10섹션 거의 복원 가능?  ──→  PRD 정규화 (P4) 직접 진입
     |
     └── raw blueprint → /dev-feature 직접?  ──→  불가 (금지)
```

### 판정 기준

| 조건 | 진입점 | 설명 |
|------|--------|------|
| 아이디어 수준 메모, 승인/우선순위 검증 필요 | P1 `/plan-idea` | RICE 스크리닝부터 정규 수행 |
| feature 분해/분석 완료, PRD는 미작성 | **P3 `/plan-draft`** | Fast-Track 대상 (대부분의 블루프린트) |
| PRD 10섹션을 거의 충족, review/approved만 필요 | P4 `/plan-prd` | PRD 직접 정규화 |
| raw blueprint를 /dev-feature에 직접 입력 | **불가** | 계약 2 위반 |

### Entry Decision Record

판정 결과는 반드시 기록으로 남긴다. 같은 프로젝트 안에서 진입 기준이 흔들리는 것을 방지하기 위해서다.

```markdown
# Entry Decision: {slug}

- **블루프린트**: {블루프린트 경로}
- **판정 진입점**: P3 /plan-draft (Fast-Track)
- **판정 근거**: feature 분해 8개 완료, PRD 10섹션 중 ~50% 커버, execution SSOT 아님
- **판정일**: {YYYY-MM-DD}
```

---

## Fast-Track 실행 흐름 (P3 진입)

Entry Assessment에서 P3이 선택된 경우의 상세 절차다.

```
[Entry Assessment: P3 선택됨]
     |
     v
1. 프로젝트 레벨 선결 사항 해결 (멀티 피처 시)
     |
     v
2. 승인 껍데기 산출물 생성 (imported IDEA + screening record)
     |
     v
3. /plan-draft 정상 실행 → Lite/Standard 판정
     |
     v
4. Standard → /plan-prd (PRD 10섹션 정규화, 매핑 가이드 기반)
   Lite    → Lite plan 파생
     |
     v
5. /plan-review → reviewPassed 기록
     |
     v
6. /plan-bridge → /dev-feature (기존 계약 그대로)
```

### Step 1: 프로젝트 레벨 선결 사항

멀티 피처 프로젝트(예: 8개 feature 동시 정규화)에서는 공통 결정을 **한 번에** 해결한다. 피처별로 반복하면 SSOT 위반이다.

| 항목 | 예시 |
|------|------|
| 앱/라우트 위치 | `apps/ds-studio` 신규 vs 기존 앱 확장 |
| 컴포넌트 소유권 | PresetPicker → F5, LockButton → F3 |
| 공유 패키지 전략 | `@/registry/config` 위치, 설치 방법 |
| Lite/Standard 사전 판정 | claude-kit 6개 트리거로 사전 검증 |

기록 위치: 블루프린트 보충 문서 또는 별도 decision log. 블루프린트 원본은 수정하지 않는다.

### Step 2: 승인 껍데기 산출물

P1/P2를 완전히 건너뛰지 않으면서 Fast-Track을 운영하기 위한 최소 산출물이다.

**imported IDEA**: `.plans/ideas/20-approved/IDEA-{YYYYMMDD}-{NNN}.md`

```markdown
### IDEA-{YYYYMMDD}-{NNN}: {feature 제목}
- **카테고리**: feature
- **태그**: blueprint-import, {프로젝트명}
- **상태**: approved
- **등록일**: {YYYY-MM-DD}
- **진입 방식**: blueprint-fast-track

#### 설명
{블루프린트 feature plan의 1-3줄 요약}

#### 기대 효과
{블루프린트에서 파생}

#### 블루프린트 출처
- **원본 경로**: {.plans/blueprints/{project}/features/{slug}/plan.md}
- **Entry Decision**: {판정 기록 경로}
```

**imported screening record**: `.plans/ideas/20-approved/SCREENING-{YYYYMMDD}-{NNN}.md`

```markdown
### SCREENING-{YYYYMMDD}-{NNN}
- **IDEA**: IDEA-{YYYYMMDD}-{NNN}
- **방식**: blueprint-fast-track (RICE 스크리닝 대체)
- **근거**: Entry Assessment에서 P3 진입 판정
- **판정**: Go (blueprint-sourced)
- **카테고리**: {Lite|Standard}
```

이 산출물이 있으면 `/plan-draft`의 전제조건(`20-approved/` 폴더에 존재 + `approved` 상태)을 정상적으로 충족한다.

### Step 3: /plan-draft 실행

기존 커맨드를 그대로 사용한다.

```bash
/plan-draft IDEA-{YYYYMMDD}-{NNN}
```

블루프린트의 feature plan을 참조하여 first-pass 또는 Lite plan을 파생한다. Lite/Standard 판정은 claude-kit 6개 트리거 기준으로 수행한다.

### Step 4: PRD 10섹션 정규화 (Standard인 경우)

블루프린트에서 PRD로의 매핑 가이드다.

| PRD 섹션 | 블루프린트 소스 | 작업 |
|----------|---------------|------|
| 1. Background | master-plan 개요 + feature plan 비유 | 축약 정리 |
| 2. Goals | feature-breakdown 스코프 | 측정 가능한 지표 추가 |
| 3. Non-Goals | feature plan의 "하지 않는 것" 수집 | 명시적 목록 통합 |
| 4. User Stories | **새로 작성** | 역할-행동-가치 + 수용 기준 |
| 5. Functional Requirements | feature plan 구현 섹션 | REQ-ID 부여 + Must/Should 분류 |
| 6. Non-Functional Requirements | **새로 작성** | 성능, 접근성, 번들 사이즈 목표 |
| 7. Out of Scope | Non-Goals + 피처 간 경계 | 혼동 가능 항목 명시 |
| 8. Dependencies & Risks | feature plan 의존성/리스크 | 통합 매트릭스 |
| 9. Success Metrics | **새로 작성** | 현재값 → 목표값 + 측정 방법 |
| 10. Open Questions | review-feedback + revision-checklist | 결정권자 + 기한 추가 |

**요약**: 5개(1,2,5,7,8)는 블루프린트에서 파생. 3개(4,6,9)는 새로 작성. 2개(3,10)는 산재 내용 수집/통합.

### Step 5: review + reviewPassed 기록

PRD 완성 후 `/plan-review`를 실행한다. PASS 판정 시 stage-manifest.json에 `reviewPassed: true`를 기록한다.

### Step 6: Bridge → Dev (기존 계약)

정규화된 PRD가 `.plans/prd/10-approved/`에 배치되면, 이후는 기존 파이프라인 그대로다.

```bash
/plan-bridge {slug}
/dev-feature {slug}
```

---

## 기술적 배경: 프롬프트 기반 아키텍처

claude-kit의 커맨드(`plan-draft.md`, `plan-bridge.md`, `dev-feature.md` 등)는 **마크다운 프롬프트**다. 컴파일된 바이너리가 아니라 AI가 읽고 따르는 지시문이다.

이것이 Fast-Track 운영에 주는 의미:

| 특성 | 의미 |
|------|------|
| "하드코딩된 경로"는 프롬프트에 적힌 규칙 | 런타임 제약이 아니라 지시 규칙이므로, 예외 규칙 추가로 확장 가능 |
| 프롬프트 수정 = 기능 변경 | 별도 빌드/배포 없이 .md 파일 수정만으로 동작 변경 |
| AI가 문맥을 이해하고 따름 | 승인 껍데기 산출물이 정상 형식이면 커맨드가 정상 동작 |

따라서 Fast-Track은 **새로운 기능 개발이 아니라, 기존 프롬프트 규칙 안에서 문서/운영 규칙을 보강하는 것**으로 대부분 해결된다. 프롬프트 자체를 수정해야 하는 경우는 `reviewPassed 상태 영속화` 정도에 한정된다.

이 특성 덕분에:

- 승인 껍데기 산출물(imported IDEA/screening)이 올바른 형식이면 `/plan-draft`가 정상 인식
- PRD를 `.plans/prd/10-approved/`에 배치하면 `/plan-bridge`와 `/dev-feature`가 정상 동작
- 새로운 `--from-blueprint` 같은 플래그 없이도 운영 가능 (문서 규칙으로 충분)
- 반복 사용이 확인되면 그때 프롬프트를 확장하여 반자동화

---

## stage-manifest 기록

Fast-Track으로 진입한 피처의 stage-manifest.json 기록 방식이다.

```json
{
  "ds-url-state": {
    "currentStage": "P3",
    "entryPoint": "P3-blueprint-fast-track",
    "blueprintSource": ".plans/blueprints/ds-customizer/features/f1-url-state/plan.md",
    "stages": {
      "P1": { "status": "skipped", "reason": "blueprint-fast-track" },
      "P2": { "status": "skipped", "reason": "blueprint-fast-track" },
      "P3": { "status": "in-progress" }
    }
  }
}
```

`entryPoint`와 `blueprintSource` 필드로 이 피처가 어떤 블루프린트에서 파생되었는지 추적할 수 있다.

---

## sourceRef 전파 규칙

블루프린트에서 파생된 모든 산출물에 원본 참조를 남긴다.

| 산출물 | sourceRef 위치 |
|--------|---------------|
| imported IDEA | `#### 블루프린트 출처` 섹션 |
| first-pass / Lite plan | 헤더에 `> Blueprint Source: {경로}` |
| PRD | Section 1 (Background)에 원본 참조 |
| Bridge context | `05-bridge-context.md`에 블루프린트 경로 기록 |
| Archive 번들 | 메타데이터 테이블에 `Blueprint Source` 행 |

이 규칙으로 archive → PRD → first-pass → imported IDEA → 블루프린트 원본까지 역추적이 가능하다.

---

## 파일럿 실행 가이드

첫 이행 대상은 프로젝트의 **foundation feature**로 잡는 것이 적절하다. 블루프린트 상세도가 가장 높고, Standard 경로를 검증하기에 좋으며, 후속 피처에 미치는 영향이 크기 때문이다.

### 파일럿 확인 항목

1. Entry Assessment에서 P3 선택 근거가 설명 가능한가
2. 승인 껍데기 산출물만으로 `/plan-draft` 전제조건을 충족하는가
3. 블루프린트에서 PRD 10섹션 매핑이 과도한 해석 없이 가능한가
4. 정규화된 PRD 이후 기존 Bridge/dev-feature 계약이 그대로 작동하는가
5. stage-manifest에 `entryPoint`, `blueprintSource`가 기록되는가

### Fallback 조건

파일럿에서 다음 중 하나라도 발생하면, 규칙을 먼저 보강한다:

- 같은 유형의 수동 예외가 2회 이상 반복
- PRD 10섹션 중 3개 이상에서 블루프린트 소스가 전혀 매핑되지 않음
- Bridge pre-check 실패가 정규화 문제가 아니라 블루프린트 품질 문제인 경우

보강 후에도 마찰이 지속되면 해당 피처는 **P1 정규 진입(경로 A)으로 전환**한다.

---

## 개선 로드맵

이 가이드를 운영하면서 단계적으로 보강하는 항목이다.

### P0: 즉시 (파일럿 전)

이 문서 자체가 P0에 해당한다. 추가로:

| ID | 항목 | 대상 | 태그 |
|----|------|------|------|
| G0 | Entry Assessment 판정 규칙 | 이 문서에 포함 | 문서 |
| W0 | Entry Decision Record 규칙 | 이 문서에 포함 | 운영 규칙 |
| G1 | Fast-Track intake 규칙 | 이 문서에 포함 | 문서 |
| G2 | PRD 10섹션 매핑 가이드 | 이 문서에 포함 | 문서 |
| W1 | 승인 껍데기 산출물 규칙 | 이 문서에 포함 | 운영 규칙 |

### P1: F1 파일럿 이후

| ID | 항목 | 대상 파일 | 태그 |
|----|------|----------|------|
| G3 | Fast-Track handoff checklist | `06-dev-handoff.md` 섹션 추가 | 문서 |
| G4 | 개발 워크플로우 출처-무관 원칙 | `08-dev-workflow.md` 섹션 추가 | 문서 |
| W2 | 정규화 결정 로그 운영 규칙 | 운영 규칙 문서 | 운영 규칙 |
| W3 | sourceRef 전파 규칙 강화 | stage-manifest, archive metadata | 운영 규칙 |
| F06 | reviewPassed 상태 영속화 | `plan-review.md` 프롬프트 수정 | 프롬프트 수정 |

### P2: 반복 사용 확인 후

| ID | 항목 | 대상 파일 | 태그 |
|----|------|----------|------|
| C1 | `/plan-draft --import-blueprint` 반자동화 | `plan-draft.md` 확장 | 프롬프트 확장 |
| C2 | PRD Gap Analysis helper | `plan-assess-gaps.md` 신규 | 새 커맨드 |
| C3 | stage-manifest lineage 필드 정식화 | manifest 스키마 확장 | 프롬프트 확장 |

P2 항목은 당장 없어도 운영할 수 있다. 블루프린트 프로젝트가 반복될 때 투자 여부를 판단한다.

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [기획 파이프라인 (P1~P8)](01-planning-pipeline.md) | 정규 파이프라인 + P8 아카이브 |
| [P3~P4: 기능 기획](04-feature-planning.md) | `/plan-draft`, `/plan-prd` 상세 |
| [P7: 개발 핸드오프](06-dev-handoff.md) | Bridge 계약 |
| [개발 워크플로우 (A~E)](08-dev-workflow.md) | `/dev-feature` 입력 요구사항 |
| [리뷰 & PCC 검증](07-review-pcc.md) | 품질 검증 체계 |
| [아카이브 & 개선요청](11-archive-improve.md) | 완료 후 아카이빙 |
| [용어집](10-glossary.md) | Entry Assessment, Fast-Track 등 용어 |
