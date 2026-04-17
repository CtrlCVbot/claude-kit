# Scope and Decisions

- 문서 ID: CAI-01
- 목적: `claude-kit`의 `copy` 도메인 범위, 비범위, 확정된 설계 결정(시나리오, WBS, Feature 유형)을 고정한다.
- 선행 문서: [README.md](./README.md)
- 후행 문서: [02-target-architecture.md](./02-target-architecture.md), [03-workflow-and-pipeline.md](./03-workflow-and-pipeline.md)
- 설계 근거: CAI-11(WBS), CAI-13(파이프라인 순서 분석)

---

## 1. 범위와 비범위

### 1.1 범위

| 영역 | 설명 |
|------|------|
| copy 도메인 컴포넌트 | agents, commands, hooks, rules, skills (`src/claude/copy/` 하위) |
| 파이프라인 통합 | 기존 plan/copy/dev 파이프라인에 copy 도메인이 합류하는 순서와 게이트 |
| WBS 체계 | Epic/Feature/Story/Task 4계층 분류와 병렬 실행 규칙 |
| 시나리오 분류 | A(백지), B(부분), C(충실도 교정)별 파이프라인 순서 |
| Feature 유형 분류 | copy / dev 2분류와 판정 기준 |
| evidence 관리 | screenshot, state capture, manifest, QA report의 contract |
| registry 통합 | exception-registry, pairing-registry, codex-portability 반영 |

### 1.2 기존 컴포넌트 수정 범위

copy 도메인 도입은 신규 컴포넌트 생성뿐 아니라 **기존 plan/dev 도메인 컴포넌트의 수정**도 필요하다.

| 기존 컴포넌트 | 수정 이유 | 영향 |
|-------------|---------|------|
| `/plan-draft` (plan) | 시나리오(A/B/C) + Feature 유형(copy/dev) + Lite/Standard 판정 로직 추가 | 파이프라인 분기의 핵심 판정 시점 |
| `/plan-prd` (plan) | 시나리오 C에서 2회 호출(범위 PRD + 상세 PRD) 패턴 인식 | 시나리오 C Standard 경로 |
| `/plan-bridge` (plan) | bridge context에 시나리오/Feature 유형 메타데이터 포함 | copy/dev 경로 결정 |
| `/plan-idea` (plan) | Epic 수준 WBS 태깅 지원 | WBS 계층 생성 시점 |
| `/plan-screen` (plan) | RICE 스크리닝에 충실도 해석 추가 + WBS 분류 | 스크리닝 시 규모 판정 |
| `/plan-review` (plan) | PCC에 copy 시나리오 C 정합성 검증 추가 | 갭 데이터 ↔ PRD 일치 확인 |
| `plan-idea-collector` (plan 에이전트) | 시나리오 태깅 인식 | idea 등록 시 시나리오 정보 |
| `plan-prd-writer` (plan 에이전트) | 2-pass PRD 모드 인식 | 시나리오 C 범위/상세 분리 |
| `plan-reviewer` (plan 에이전트) | copy 시나리오 PCC 확장 | 갭 ↔ PRD 정합성 |
| `/dev-feature` (dev) | Feature 유형 체크 (bridge context 기반) | copy Feature는 copy 도메인 우선 |
| `/dev-run` (dev) | Story ID(S-*) 입력 수용 + 시나리오 인식 | copy 도메인에서 넘어온 실행 단위 |
| `dev-verify-agent` (dev 에이전트) | Feature 유형 인식 (copy Feature QA vs dev Feature QA) | copy QA 건너뛰기 판단 |
| `dev-tdd-guard.js` (dev 훅) | copy Feature에서 완화 가능 (시각적 작업은 TDD 패턴 다름) | 훅 충돌 방지 |
| `plan-doc-guard.js` (plan 훅) | copy 훅과의 우선순위 정의 | 이벤트 충돌 방지 |
| `verification.md` (core 룰) | 시나리오별 검증 기준 참조 추가 | A/B vs C 증거 요구사항 차이 |

### 1.3 비범위

| 비범위 | 이유 |
|--------|------|
| 특정 프로젝트 구현 (Turner 등) | copy 도메인은 package-level capability. 프로젝트 사례는 [appendix/legacy-turner-mapping.md](./appendix/legacy-turner-mapping.md)에 격리 |
| setup.js 코드 자체 | setup.js 변경 사항은 [05-implementation-plan.md](./05-implementation-plan.md)에서 구현 단위로 다룸 |
| Codex 포팅 (Phase 2+) | 초기에는 Claude target만. Codex 호환성은 registry에 전략만 등록 |
| Playwright screenshot 수집 구현 | evidence runner contract만 정의. 실제 runner는 프로젝트 레벨 |
| plan/dev 도메인 대체 | plan은 기획, dev는 구현을 계속 담당. copy는 evidence/gap/QA 전담 |

---

## 2. 시나리오 분류 (A/B/C)

카피 작업의 시나리오에 따라 파이프라인 순서가 달라진다. (CAI-11 SS2.5)

### 2.1 시나리오 정의

| 시나리오 | 상황 | 갭 분석 역할 | PRD 순서 | copy 워크플로우 역할 |
|---------|------|-----------|---------|-------------------|
| **A: 백지 카피** | 원본은 있지만 구현이 아예 없음. 처음부터 만드는 것 | 무의미 (비교할 현재가 없음) | **PRD 먼저** (원본 기반 스펙) | 검증 도구: 레퍼런스 캡처만, 갭 분석은 QA 시점 |
| **B: 부분 카피** | 기존 프로젝트에 원본의 특정 부분만 가져오는 것 | 해당 없음 (새 부분이라 시도한 적 없음) | **PRD 먼저** (원본 기반 스펙) | 검증 도구: 레퍼런스 캡처만, 갭 분석은 QA 시점 |
| **C: 충실도 교정** | 이미 카피를 시도했는데 원본과 다른 부분 수정 | **핵심** (현재 vs 원본 차이) | **갭 분석 후** 상세 PRD | 기획+검증 도구: 갭 분석이 PRD 입력 |

### 2.2 시나리오 판정 의사결정 트리

```
Feature 진입
  |
  +-- 해당 Feature의 구현이 이미 존재하는가?
  |    |
  |    +-- YES --> 원본과 비교할 수 있는가?
  |    |    |
  |    |    +-- YES --> 시나리오 C (충실도 교정)
  |    |    |           --> 갭 분석 --> 상세 PRD --> 구현
  |    |    |
  |    |    +-- NO (구현은 있지만 해당 영역 미구현)
  |    |         --> 시나리오 B (부분 카피)
  |    |             --> 레퍼런스 캡처 --> PRD --> 구현 --> QA 비교
  |    |
  |    +-- NO (구현 자체가 없음)
  |         --> 시나리오 A (백지 카피)
  |             --> 레퍼런스 캡처 --> PRD --> 구현 --> QA 비교
```

### 2.3 시나리오별 copy 커맨드 사용 범위

| 커맨드 | A: 백지 카피 | B: 부분 카피 | C: 충실도 교정 |
|--------|:-----------:|:-----------:|:------------:|
| `/copy-reference-refresh` | 사용 (원본 캡처) | 사용 (원본 캡처) | 사용 (원본+현재 캡처) |
| `/copy-visual-review` | QA 시점에서만 | QA 시점에서만 | **PRD 전에 사용** |
| `/copy-interaction-review` | QA 시점에서만 | QA 시점에서만 | **PRD 전에 사용** |
| `/copy-gap-board` | QA 시점에서만 | QA 시점에서만 | **PRD 전에 사용** |
| `/copy-plan-unit` | 사용 안 함 | 사용 안 함 | 사용 |
| `/copy-verify` | 사용 (QA 검증) | 사용 (QA 검증) | 사용 (QA 검증) |
| `/copy-closeout` | 사용 | 사용 | 사용 |

### 2.4 copy 워크플로우 역할 요약

- **시나리오 A/B**: copy 워크플로우가 **검증 도구**로 작동. 기획 시에는 `/copy-reference-refresh`만 사용(원본 캡처). 구현 후 QA에서 `/copy-visual-review` + `/copy-interaction-review`로 비교 검증.
- **시나리오 C**: copy 워크플로우가 **기획 도구 + 검증 도구** 이중 역할. 갭 분석(`/copy-visual-review`, `/copy-gap-board`)이 PRD의 입력 데이터를 생성하고, 구현 후 QA에서 갭이 닫혔는지 재검증.

---

## 3. Feature 유형 (copy/dev)

모든 Feature가 copy 워크플로우를 필요로 하지는 않는다. (CAI-13 SS2)

### 3.1 유형 정의

| 유형 | 정의 | 예시 | 적용 워크플로우 |
|------|------|------|---------------|
| **Copy Feature** | 원본 대응 요소가 있고, 시각적/인터랙션 차이를 닫는 작업 | Header hover, Hero CTA, Section spacing | plan > **copy** > dev |
| **Dev Feature** | 원본 대응이 없거나 비시각적 변경 | API 통합, 새 페이지, 성능 최적화, 접근성 개선 | plan > **dev** 직행 |

### 3.2 Hybrid Feature 처리

Hybrid Feature(새 기능이지만 원본의 시각적 패턴을 따라야 하는 것)는 독립 유형으로 두지 않는다. Copy Feature의 경량 변형으로 흡수한다.

- Hybrid에 해당하는 경우: `/copy-reference-refresh`(참조용 캡처)만 수행 후 dev 경로 진행
- 갭 분석, 갭 보드는 불필요

#### Hybrid Feature 처리 (Copy Feature `reference-only` 모드)

Hybrid Feature는 독립 유형이 아니라 **Copy Feature의 `reference-only` 플래그**로 처리한다:
1. `/copy-reference-refresh` 실행 (원본 캡처만, 현재 캡처 불필요)
2. `/copy-visual-review`, `/copy-gap-board` **건너뜀** (갭 분석 불필요)
3. 바로 `/dev-feature` → `/dev-run` (dev 경로)
4. QA에서 `/copy-verify` (원본 스타일 준수 확인)

routing metadata에 `Feature Type: copy`, `Reference Only: true`로 기록.

### 3.3 판정 기준 의사결정 트리

```
Feature 진입
  |
  +-- 원본(reference)에 대응하는 요소가 있는가?
  |    |
  |    +-- YES + 시각적/인터랙션 차이를 닫아야 하는가?
  |    |    |
  |    |    +-- YES --> Copy Feature
  |    |    |           --> copy 경로: /copy-reference-refresh --> gap 분석 --> /dev-run
  |    |    |
  |    |    +-- NO (구조만 참조, 차이 닫기 아님)
  |    |         --> Copy Feature (경량: 참조 캡처 + dev 경로)
  |    |
  |    +-- NO (원본에 없는 요소)
  |         --> Dev Feature
  |             --> dev 직행: /plan-prd --> /plan-bridge --> /dev-feature --> /dev-run
  |
  +-- 판정 불가
       --> 범위 PRD에서 유형 지정 + 사용자 확인
```

### 3.4 판정 시점

`/plan-draft`에서 Lite/Standard 판정과 **동시에** Feature 유형을 태깅한다. (CAI-13 SS2.6~2.7)

```
/plan-draft 출력 예시:
  E-01: 홈페이지 카피 (Standard Epic)
    F-HEADER:      type=copy     | P0 | 서브 PRD + copy 경로
    F-HERO:        type=copy     | P0 | 서브 PRD + copy 경로
    F-NEWS:        type=copy     | P1 | Lite + copy 경로
    F-ANALYTICS:   type=dev      | P1 | dev 경로 직행
    F-A11Y:        type=dev      | P2 | dev 경로 직행
```

### 3.5 Routing Metadata 전달 방식

실제 구현에서 Lite/Standard는 문서 경로로 암묵적 전달된다:
- Lite → `.plans/features/active/{slug}.md` (단일 파일)
- Standard → `.plans/features/drafts/{slug}/first-pass.md` (디렉토리)

시나리오와 Feature 유형은 현재 암묵적 전달이 없으므로, **명시적 routing metadata 파일**을 생성한다:

| 항목 | 저장 위치 | 생성 시점 |
|------|---------|---------|
| 시나리오 (A/B/C) | `.plans/features/active/{slug}/00-context/07-routing-metadata.md` | `/plan-draft` |
| Feature 유형 (copy/dev) | 동일 파일 | `/plan-draft` |
| Lite/Standard | 동일 파일 (경로 기반과 이중 기록) | `/plan-draft` |

```markdown
<!-- 07-routing-metadata.md 예시 -->
## Routing Metadata
- Epic: E-01
- Feature: F-HEADER-01
- Feature Type: copy
- Scenario: C
- Scale: Standard
- Copy Skip: false
```

이 파일은 `/plan-bridge`가 bridge context에 포함하고, 이후 모든 copy/dev 커맨드가 참조한다.

---

## 4. WBS 계층 (Epic/Feature/Story/Task)

대규모 기획을 체계적으로 분해하여 기존 plan/copy/dev 파이프라인에 매핑하는 분류 기준. (CAI-11 SS2)

### 4.1 계층 정의

| 계층 | 코드 | 정의 | 규모 기준 | 생성 커맨드 |
|------|------|------|----------|-----------|
| **Epic** (대) | `E-{NN}` | 프로젝트 수준 목표. 복수 Phase를 포괄 | 10+ 파일, 5+ 뷰포트, 전체 섹션 | `/plan-idea` |
| **Feature** (중) | `F-{AREA}-{NN}` | 기능 영역 단위. 독립 PRD 또는 마스터 PRD의 섹션 | 3~10 파일, 2~3 뷰포트, 단일 섹션/컴포넌트 | `/plan-draft` > `/plan-prd` |
| **Story** (소) | `S-{AREA}-{NN}` | 단일 갭 또는 개선 항목. Gap Row 1개 | 1~3 파일, 1~2 뷰포트 | `/copy-gap-board` > `/copy-plan-unit` |
| **Task** (마이크로) | `T-{AREA}-{NN}` | 원자적 구현 단위. 1 커밋 = 1 태스크 | 단일 파일, 단일 속성 변경 | `/dev-run` 내부 |

### 4.2 WBS 적용 범위

WBS 4계층은 **copy 도메인에만 적용되는 것이 아니라 전체 파이프라인에 적용**된다.

| 계층 | plan 도메인 | copy 도메인 | dev 도메인 |
|------|-----------|-----------|-----------|
| **Epic** | `/plan-idea` → `/plan-screen`에서 생성 | (해당 없음) | (해당 없음) |
| **Feature** | `/plan-draft` → `/plan-prd`에서 생성 | copy Feature만 copy 경로 | dev Feature는 dev 경로 |
| **Story** | (해당 없음) | `/copy-gap-board`에서 Gap Row로 생성 | `/dev-feature`에서 task breakdown으로 생성 |
| **Task** | (해당 없음) | (해당 없음) | `/dev-run` 내부에서 TDD 사이클로 실행 |

**핵심**: Epic과 Feature는 plan 도메인이 관리하는 **공통 계층**이다. Story부터 경로가 갈린다 — copy Feature의 Story는 갭 보드에서, dev Feature의 Story는 Feature의 task breakdown에서 생성된다.

#### Dev Feature의 Story 생성

Dev Feature는 Gap board가 아닌 `/dev-feature`의 task breakdown에서 Story를 생성한다:
- `/dev-feature`가 Feature를 작업 항목(REQ-*)으로 분해
- 각 REQ-*가 Story(S-{AREA}-{NN}) 수준에 대응
- Story 내부의 각 커밋이 Task(T-{AREA}-{NN})

### 4.3 계층 간 관계

```
Epic (대)
 +-- Feature (중) ---- 독립 PRD 또는 마스터 PRD 섹션
 |    +-- Story (소) -- Gap Row (VF-*/IF-*) 1개
 |    |    +-- Task (마이크로) -- 구현 1 커밋
 |    |    +-- Task (마이크로) -- 검증 1 커밋
 |    +-- Story (소)
 +-- Feature (중)
```

### 4.4 분류 판정 의사결정 트리

```
아이디어 진입
  |
  +-- 영향 범위 >= 5 뷰포트 + 전체 섹션?
  |    YES --> Epic (대)
  |    NO
  |    |
  +-- 영향 범위 >= 2 뷰포트 + 단일 영역?
  |    YES --> Feature (중)
  |    NO
  |    |
  +-- 단일 Gap Row로 표현 가능?
  |    YES --> Story (소)
  |    NO
  |    |
  +-- 단일 파일/속성 변경?
       YES --> Task (마이크로)
```

### 4.5 커맨드 매핑

| 계층 | 생성 커맨드 | 승인 게이트 | 병렬 가능 |
|------|-----------|-----------|----------|
| Epic (대) | `/plan-idea` > `/plan-screen` | 스크리닝 승인 | - |
| Feature (중) | `/plan-draft` > `/plan-prd` (마스터/서브) | PRD 승인 | 서브 PRD 간 병렬 |
| Story (소) | `/copy-gap-board` > `/copy-plan-unit` | P0 = 사용자 승인 | Feature 내 Story 간 병렬 |
| Task (마이크로) | `/dev-run` 내부 | 자동 (TDD 가드) | Story 내 Task 순차 |

---

## 5. 시나리오 C 2단계 PRD

시나리오 C(충실도 교정)에서는 PRD를 2단계로 나눈다. (CAI-13 SS1.4)

### 5.1 구조

```
Phase 1 -- 범위 PRD (Scope PRD):
  /plan-prd (1차): "어디를 분석할 것인지"만 정의
    - 대상 영역 목록 (Header, Hero, Sections 등)
    - 뷰포트 범위 (1440, 1024, 768, 390)
    - 분석 우선순위 (P0/P1/P2 예상)
    - 공유 제약 (글로벌 CSS, 브레이크포인트)
  --> 범위 PRD 승인

Phase 2 -- 갭 분석:
  범위 PRD 기반 --> /copy-reference-refresh --> /copy-visual-review
    --> /copy-interaction-review --> /copy-gap-board

Phase 3 -- 상세 PRD (Detail PRD):
  갭 데이터 기반 --> /plan-prd (2차): "어떻게 닫을 것인지" 정의
    - 각 갭의 수용 기준 (acceptance criteria)
    - wireframe 작성 (/plan-wireframe)
    - /plan-bridge --> /dev-run
```

### 5.2 근거

- 범위 PRD가 없으면 갭 분석의 대상이 불명확 ("모든 것을 분석"하면 불필요한 작업 발생)
- 갭 데이터 없이 상세 PRD를 쓰면 추측 기반이 됨
- `/plan-prd` 커맨드 자체를 수정하지 않고 2번 호출하는 것이므로 기존 인터페이스 유지

---

## 6. Lite/Standard 판정

`/plan-draft`에서 시나리오(A/B/C)와 함께 규모를 판정한다. (CAI-11 SS5.1~5.2)

### 6.1 판정 기준

| 조건 | 규모 | 문서 깊이 |
|------|------|----------|
| Feature 3개 이상 또는 P0 포함 | **Standard** | 마스터 PRD + 서브 PRD |
| Feature 3개 미만, P1/P2만 | **Lite** | PRD 생략 가능, 경량 실행 단위 |

### 6.2 시나리오 x 규모 매트릭스

| 시나리오 | 규모 | 파이프라인 경로 |
|---------|------|--------------|
| A (백지) | Lite | 레퍼런스 > PRD(경량) > 구현 > QA |
| A (백지) | Standard | 레퍼런스 > 마스터 PRD > 서브 PRD > 구현 > QA |
| B (부분) | Lite | 레퍼런스 > PRD(경량) > 구현 > QA |
| B (부분) | Standard | 레퍼런스 > 마스터 PRD > 서브 PRD > 구현 > QA |
| C (교정) | Lite | 갭 분석 > 실행 단위 > 구현 > QA |
| C (교정) | Standard | 범위 PRD > 갭 분석 > 상세 PRD > 구현 > QA |

---

## 7. 병렬 실행 규칙

(CAI-11 SS5.4)

| 규칙 | 설명 |
|------|------|
| **Feature 간 병렬** | 마스터 PRD 승인 후, 의존성 없는 Feature는 동시 진행 가능 |
| **Story 간 병렬** | 같은 Feature 내에서도 파일 충돌 없으면 병렬 가능 |
| **Task 순차** | 같은 Story 내 Task는 TDD 사이클(RED > GREEN > IMPROVE) 순차 |
| **Phase 합류 게이트** | Phase 또는 R 경계에서는 모든 병렬 작업 합류 후 사용자 승인 |
| **증거-분석 병렬** | `/copy-visual-review`와 `/copy-interaction-review`는 항상 병렬 가능 |

---

## 8. 결정 기록

| 결정 | 내용 | 근거 | 상태 |
|------|------|------|------|
| D1 | `copy`는 `claude-kit` opt-in domain으로 설계 | 기본 domain은 `core`, `dev`. `plan`도 opt-in | 채택 |
| D2 | 시나리오 3분류(A/B/C) 도입 | 파이프라인 순서가 시나리오에 따라 다름 (CAI-11, CAI-13) | 채택 |
| D3 | Feature 유형을 copy/dev 2분류로 단순화 | Hybrid는 copy 경량 변형으로 흡수 (CAI-13 SS2.8) | 채택 |
| D4 | WBS 4계층(Epic/Feature/Story/Task) 채택 | 기존 plan/copy/dev 커맨드에 자연스럽게 매핑 (CAI-11 SS2) | 채택 |
| D5 | `/plan-draft`에서 시나리오+유형+규모 동시 판정 | 가장 이른 시점에 경로 결정으로 불필요한 분석 비용 방지 | 채택 |
| D6 | 시나리오 C에서 2단계 PRD(범위+상세) | 닭과 달걀 문제 해결: 범위 PRD가 분석 방향, 갭 데이터가 상세 PRD (CAI-13 SS1.4) | 채택 |
| D7 | 신규 hooks는 reminder 우선 도입 | copy 작업의 시각 판단 특성상 early blocking의 false positive 위험이 큼 | 채택 |
| D8 | Turner 사례는 appendix로 격리 | 도메인 문서가 특정 프로젝트에 묶이면 package 재사용성 저하 | 채택 |

---

## 9. Open Questions

| 질문 | 기본 제안 | 결정 필요 시점 |
|------|----------|--------------|
| `copy`를 profile 기본 domain에 포함할지 | opt-in 유지 | A-1 구현 전 |
| screenshot runner까지 v1에 포함할지 | contract만 두고 구현은 제외 | agent/command 구현 전 |
| Codex target에서 copy hooks 배포 여부 | registry에 `paired-review` 또는 `blocked`로 등록 | registry 구현 전 |
