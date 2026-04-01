# 개발 워크플로우 (Phase A~E)

기획 산출물(PRD + Bridge Context)을 실제 코드로 구현하는 5단계 자동화 프로세스다. `/dev-feature`로 시작하여 Feature Package 생성, TDD 기반 코드 생성, 품질 게이트 검증, 커밋까지 일관된 파이프라인으로 실행한다.

---

## Phase A~E 흐름

```
Phase P (기획)                    Phase A~E (개발)
/plan-bridge                      /dev-feature
    |                                 |
    v                                 v
PRD (10-approved/)  ─────>  A: Feature Package 생성
                                      |
                                      v
                               B: Human Review (승인/수정)
                                      |
                                      v
                               C: Package 생성 (11개 문서)
                                      |
                                      v
                               D: Dev Run (TDD Loop)
                                      |
                                      v
                               E: Verify + Commit
```

```
A(Feature Package) --> B(Review) --> C(Package Gen) --> D(Dev Run) --> E(Verify+Commit)
    |                    |              |                  |              |
  /dev-feature       사람 승인      자동 생성         /dev-run      /dev-verify
  PRD 분석           Overview       11개 문서          TDD Loop     /dev-commit
  Overview 생성      리뷰/수정      DPC 검증           Quality Gate  DVC 검증
```

---

## Phase A: Feature Package 생성

`/dev-feature <prd-path>` 커맨드로 실행한다. PRD를 분석하여 Feature Overview를 자동 생성하는 단계다.

### 실행 흐름

```
A1: PRD 분석
A2: Lite/Standard 판정
A3: Slug + Feature Key 생성
A4: Overview 생성 (Section 1~10)
A4.5: PDC 검증 (PRD <-> Overview 일관성)
A5: Promote (Key 확정 + PRD Freeze + Decision Log)
A6: Overview Section 6~7 생성
A6.5: AIR 검증 (Phase A 산출물 무결성)
```

### 산출물 구조

```
.plans/features/active/{slug}/
  00-context/
    00-index.md
    01-prd-freeze.md          <-- PRD 스냅샷 (변경 불가)
    02-decision-log.md        <-- DEC 기록
    03-bridge-wireframe.md    <-- Phase P7 Bridge
    04-bridge-stitch.md       <-- Phase P7 Bridge
    05-bridge-context.md      <-- Phase P7 Bridge
```

### Lite vs Standard 판정 기준

상태머신, 외부 연동, 멱등성, API 3+, DB 2+, 고위험 조건 중 하나라도 해당하면 Standard다. 해당 없으면 Lite로 간소화된 패키지를 생성한다.

---

## Phase B: 코드 리뷰

사람이 Feature Overview를 리뷰하고 승인/수정을 결정하는 단계다.

### 리뷰 체크포인트

- Section 7(미결정 항목)에 미결정이 남아 있으면 Phase C 진행 불가
- 수정 요청 시 A6으로 돌아가 Overview를 갱신
- 승인 시 Phase C가 자동 시작

---

## Phase C: Package 생성

Feature Overview에서 개발용 Package(최대 11개 문서)를 자동 생성한다.

### Vertical Slice 핵심 요약

첫 기능 구현 시 모든 레이어를 관통하여 아키텍처 전체가 동작하는 것을 조기에 검증한다.

```
Step 1: Core Foundation    <-- Domain Model + Ports (순수 TypeScript)
Step 2: DB Package         <-- Repository 구현 + Migration
Step 3: UI Package         <-- Design System + Composites
Step 4: Auth Foundation    <-- Token + Middleware
Step 5: Feature Module     <-- Page + Actions + Repository 조합
```

### Package 문서 구성

```
02-package/
  00-overview.md            <-- Feature 개요
  01-requirements.md        <-- SSOT (요구사항 단일 원천)
  02-ui-spec.md             <-- UI 사양
  03-state-spec.md          <-- 상태 관리
  04-api-spec.md            <-- API 엔드포인트
  05-db-migration-spec.md   <-- 스키마 변경
  06-domain-logic.md        <-- 도메인 처리 순서
  07-error-handling.md      <-- 에러 처리
  08-dev-tasks.md           <-- TASK 목록 + 의존성
  09-test-cases.md          <-- TC 목록
  10-integration-spec.md    <-- 통합 사양
```

### DPC 검증

Phase C1.5에서 Overview와 Package 간 일관성을 자동 검증한다 (6개 항목 병렬).

---

## Phase D: 개발 실행

`/dev-run <package-path>` 커맨드로 실행한다. Feature Package의 TASK를 순서대로 TDD Loop으로 구현하는 단계다.

### Dev Automation Loop

```
+-----------------------------------------------------------+
|                    Dev Automation Loop                      |
|                                                            |
|  Task Resolver --> Code Generator --> Quality Gate --> DONE |
|       ^                                    |               |
|       +------------ FAIL -----------------+               |
|                                                            |
|  반복: 모든 TASK 완료까지                                    |
+-----------------------------------------------------------+
```

### D1: Task Resolution

- `08-dev-tasks.md`에서 의존성 그래프 파싱
- `pending` 상태이고 의존 TASK가 모두 `done`인 TASK 선택
- 관련 REQ, TC, DEC, Spec 컨텍스트 수집

### D2: TDD 워크플로우 (Red -> Green -> Improve)

```
Step 1 (Red):     테스트 파일 생성 --> 실행 --> 실패 확인
Step 2 (Green):   구현 파일 생성 --> 실행 --> 최소 통과
Step 3 (Improve): 리팩토링 --> 실행 --> 테스트 유지 확인
```

카테고리별 생성 규칙:

| 카테고리 | 대상 | 테스트 패턴 |
|---------|------|-----------|
| Core | Entity, VO, Command/Query Handler | Factory 생성, 상태 전이, Port mock |
| DB | Schema, Repository, Migration | CRUD 통합 테스트 (실제 DB) |
| UI | Primitive, Composite | render + screen.getBy* |
| Feature | Server Action, Page, Component | Mock Repository, userEvent |

### D3: Quality Gate

5개 게이트를 순차 통과해야 한다:

```
Gate 1: 테스트 통과      (vitest run)
Gate 2: TDD Guard 통과   (dev-tdd-guard.js)
Gate 3: 타입 체크         (turbo typecheck)
Gate 4: 린트 통과         (turbo lint)
Gate 5: 매핑 검증         (REQ <-> TC 구현 확인)
```

같은 게이트에서 3회 연속 실패 시 TASK가 `blocked` 처리되고 수동 개입을 요청한다.

### TASK 상태 전이

```
pending --> in_progress --> done
                |
                v (Quality Gate 3회 실패)
             blocked (수동 개입 필요)
```

---

## Phase E: 검증 + 커밋

### `/dev-verify` 검증

DVC(Development Verification Check) 6개 항목을 검증한다:

| ID | 검증 항목 | 심각도 |
|----|----------|-------|
| DVC-01 | REQ Coverage | FLAG |
| DVC-02 | TC Implementation | FLAG |
| DVC-03 | TASK Completion | ERROR |
| DVC-04 | Pattern Compliance | WARN |
| DVC-05 | Edge Case Discovery | WARN |
| DVC-06 | Scope Alignment | FLAG |

### `/dev-commit` 커밋

DVC 검증 통과 후 커밋을 생성한다. `/dev-commit-push-pr`로 Push + PR 생성까지 일괄 실행할 수 있다.

### 세션 중단 시

`/dev-continue`로 재개한다. `08-dev-tasks.md`의 TASK 상태를 읽어 마지막 `done` 이후부터 자동 재개한다.

---

## 개발 자동화

### Hooks

| Hook | 역할 |
|------|------|
| `dev-tdd-guard.js` | 구현 파일 편집 시 테스트 파일 존재를 강제 |
| `dev-feature-scope-guard` | Feature Package 범위 밖 코드 수정 차단 |
| `edit-tracker.js` | 파일 변경 이력 추적 |

### Guards

기획 문서 없이 코드를 수정하려는 시도를 차단한다:

- `plan-doc-guard.js`: Phase P 실행 중 소스 코드 편집 차단
- `dev-tdd-guard.js`: 테스트 없는 구현 코드 생성 차단 (exit 2)

---

## 앱 구조 패턴

| 패턴 | 핵심 아이디어 | 적합한 프로젝트 |
|------|-------------|---------------|
| A: Feature-scoped | `features/` + Hexagonal 명칭 | 대규모 팀 (4+명), 20+ 화면 |
| B: Type-based | `components/` `hooks/` `lib/` 플랫 분류 | MVP, 5개 이하 화면 |
| C: Hybrid | 단순=B, 복잡=A 혼합 | 중규모 (6~20 화면) |
| **D: Route-scoped** | Route = Feature 경계 + flat 내부 | **기본 추천**, Next.js 네이티브 |

Pattern D가 기본이다. Route Group이 곧 Feature 경계이며, 각 Route 안에 `components/`, `hooks/`, `lib/`를 flat하게 배치한다.

### Pattern D Hexagonal 매핑

```
page.tsx --> components/ --> lib/actions.ts --> packages/core (Domain)
                                            --> packages/db  (Repository)
```

| Hexagonal 레이어 | Pattern D 위치 |
|-----------------|---------------|
| Presentation | `app/(main)/{route}/components/` + `page.tsx` |
| Infrastructure | `app/(main)/{route}/lib/actions.ts` |
| Application | `app/(main)/{route}/lib/schemas.ts` + `hooks/` |
| Domain | `packages/core/` (변경 없음) |
| Ports | `packages/core/ports/` (변경 없음) |

---

## Multi-App 아키텍처

### packages/ = 빌드 타임 라이브러리

`packages/`는 별도 서버가 아니다. 각 Next.js 앱이 필요한 패키지만 import하여 하나의 번들로 합친다. 네트워크 홉 없이 모든 호출이 동일 프로세스 내 함수 호출로 처리된다.

```
packages/core/     --+
packages/db/       --+--> import --> apps/carrier/ --> next build --> 하나의 서버
packages/ui/       --+
```

### 의존성 방향 규칙 (4가지)

| 규칙 | 설명 |
|------|------|
| Rule 1 | 앱은 `core` + 자기 도메인 + `db` + `ui`만 import |
| Rule 2 | 타 앱 도메인 import 금지 |
| Rule 3 | `{app}-domain`은 `core`에만 의존 |
| Rule 4 | `core`는 아무것에도 의존하지 않음 (순수 도메인) |

### 도메인 승격 규칙

| 사용 앱 수 | 위치 |
|-----------|------|
| 1개 앱 | `packages/{app}-domain/` 유지 |
| 2개+ 앱 | `packages/core/`로 즉시 승격 |

Route 레벨도 동일하다: 2+ Route에서 사용 시 앱 루트로 승격, 3+ Route 시 `packages/`로 추출.

---

## 검증 체계

개발 과정에서 4종의 일관성 검증이 실행된다:

```
Phase A: PDC (A4.5) --> AIR (A6.5)
Phase C: DPC (C1.5)
Phase E: DVC (전체 TASK 완료 후)
```

| 검증 | 시점 | 비교 대상 | 항목 수 |
|------|------|----------|:------:|
| PDC | Phase A4.5 | PRD <-> Overview | 5 |
| AIR | Phase A6.5 | Phase A 산출물 무결성 | 4 |
| DPC | Phase C1.5 | Overview <-> Package | 6 |
| DVC | Phase E | Package <-> 구현 코드 | 6 |

심각도: ERROR(진행 차단) > FLAG(사람 확인 권장) > WARN(경미) > PASS

---

## 관련 문서

- [06-dev-handoff.md](./06-dev-handoff.md) -- 기획에서 개발로의 핸드오프
- 09-architecture (앱 구조 + Multi-App 상세)
- [00-overview.md](./00-overview.md) -- claude-kit 전체 개요
