# 교차 분석 및 추가 개선점

- 문서 ID: CAI-07
- 기준일: 2026-04-16
- 목적: 완성된 문서 패키지(01~06)와 실제 구현된 파이프라인(plan/dev/core)을 교차 분석하여, 정합성 갭과 추가 아이디어를 정리한다.

---

## 1. 실제 파이프라인 vs 문서 가정 — 주요 발견

### 1.1 Lite/Standard 판정이 매개변수가 아닌 문서 경로로 전달됨

**실제 구현**: `/plan-draft`가 Lite/Standard를 판정하지만, 결과를 **명시적 매개변수로 전달하지 않는다**. 대신 문서 저장 경로로 구분:
- Lite → `.plans/features/active/{slug}.md` (단일 파일)
- Standard → `.plans/features/drafts/{slug}/first-pass.md` (디렉토리)

**문서 가정** (01 §6, 03 §1): `/plan-draft`가 태깅 출력을 생성한다고 가정 (`type=copy|dev`, `scenario=A|B|C`, `scale=Lite|Standard`).

**갭**: 문서가 가정하는 명시적 태깅은 현재 구현에 없다. 시나리오/Feature 유형도 경로 기반으로 전달해야 하거나, `/plan-draft`에 태깅 로직을 추가해야 한다.

**개선 제안**:
- **옵션 A**: `/plan-draft` 출력에 메타데이터 블록 추가 (문서 내 YAML frontmatter)
- **옵션 B**: `.plans/features/active/{slug}/00-context/07-routing-metadata.md` 파일 생성 (시나리오, Feature 유형, Lite/Standard를 기록)
- **권장**: **옵션 B** — 기존 `/plan-draft` 로직을 최소한으로 수정하면서, 새 파일로 메타데이터를 명시적으로 관리

### 1.2 `/plan-bridge`가 Feature 유형 메타데이터를 전달하지 않음

**실제 구현**: `/plan-bridge`는 구조적 전제 조건(architecture SSOT, architecture binding)만 검증하고, Feature 유형이나 시나리오 정보를 bridge context에 포함하지 않는다.

**문서 가정** (04 §1.5.1): bridge context에 `Feature Type: copy|dev`, `Scenario: A|B|C`, `Copy Skip: true/false` 포함.

**개선 제안**: `/plan-bridge`의 bridge context 생성 시 `07-routing-metadata.md`를 읽어 bridge context에 포함하도록 수정. 또는 bridge context template(`05-bridge-context.md`)에 routing 섹션 추가.

### 1.3 Architecture Binding이 copy 도메인에도 적용되어야 함

**실제 구현**: `dev-feature-scope-guard.js`가 `06-architecture-binding.md`의 허용 경로를 체크하여 범위 외 편집을 차단한다.

**문서 가정**: copy 도메인 문서에서 architecture binding에 대한 언급이 없다.

**개선 제안**: copy Feature도 구현 단계에서 `/dev-run`을 사용하므로, architecture binding을 동일하게 적용해야 한다. 04-component-specs.md에 "copy Feature의 `/dev-run` 실행 시 architecture binding 준수 필수" 명시.

### 1.4 `plan-doc-guard.js`가 코드 편집을 차단함

**실제 구현**: `plan-doc-guard.js`는 planning 단계에서 `src/`, `packages/`, `apps/` 등의 코드 파일 편집을 **하드 블로킹**한다. `.plans/` 디렉토리 내 `.md` 파일만 허용.

**문서 가정**: copy 도메인의 기획 시 갭 분석(시나리오 C) 동안 코드 편집이 필요하지 않다고 가정.

**잠재적 문제**: copy 도메인의 기획 단계에서 스크린샷 캡처 스크립트 실행이나 증거 파일 생성이 필요할 수 있음. 이 경우 `plan-doc-guard.js`와 충돌 가능.

**개선 제안**: copy 도메인의 기획 단계에서는 `.plans/evidence/` 경로의 파일만 생성하도록 제한하고, `plan-doc-guard.js`가 이 경로를 허용하도록 예외 추가. 또는 copy 기획 단계와 plan 기획 단계를 구분하는 플래그 도입.

### 1.5 Blueprint Fast-Track과 copy 도메인의 관계 미정의

**실제 구현**: Blueprint Fast-Track은 P3(`/plan-draft`)에서 진입하여 `blueprint-import` 태그로 외부 기획 문서를 가져온다. blueprint = source spec (읽기 전용), approved PRD = execution SSOT.

**문서 가정**: copy 도메인 문서에 Blueprint Fast-Track에 대한 언급이 없다.

**개선 제안**: copy Feature도 Blueprint Fast-Track으로 진입 가능한 시나리오를 정의. 예: 외부 디자인 시스템에서 가져온 컴포넌트를 copy하는 경우, blueprint로 가져와서 copy 시나리오 A/B로 처리.

---

## 2. 문서 내부 정합성 — 발견된 갭

### 2.1 Hybrid Feature 구현 경로 미완

**문서 상태**: 01 §3.2에서 Hybrid를 "Copy Feature의 경량 변형"이라 정의했지만, 03/04에서 Hybrid의 구체적 커맨드 경로가 없다.

**개선 제안**: Hybrid를 독립 유형으로 두지 않고, **Copy Feature + `reference-only` 플래그**로 처리:
- `/copy-reference-refresh` 실행 (원본 캡처만)
- `/copy-visual-review`, `/copy-gap-board` 건너뜀
- 바로 `/dev-feature` → `/dev-run`
- QA에서 `/copy-verify` (원본 스타일 준수 확인)

### 2.2 Evidence Manifest의 저장 위치 미확정

**문서 상태**: 04 §2.3에서 Evidence Manifest 스키마를 정의했지만, 실제 저장 위치가 불명확.

**개선 제안**: `.plans/features/active/{slug}/evidence/manifest.json` — Feature별 증거 매니페스트. `/copy-reference-refresh`가 생성하고 `/copy-verify`가 검증.

### 2.3 시나리오 A/B의 QA 시점 copy 분석 트리거 미정의

**문서 상태**: 03 §3.1/3.2에서 A/B 시나리오는 QA 시점에서 copy 분석을 수행한다고 했지만, 구체적으로 "누가, 언제 `/copy-visual-review`를 호출하는지" 정의되지 않음.

**개선 제안**: `/dev-run` 완료 후 자동으로 `/copy-verify`를 호출하는 워크플로우를 정의. `/copy-verify` 내부에서 시나리오 A/B의 경우 `/copy-visual-review` + `/copy-interaction-review`를 실행하도록 체이닝.

---

## 3. 추가 아이디어

### 3.1 Stage Manifest 활용

**실제 구현**: 각 Feature는 `.plans/stage-manifest.json`에 파이프라인 진행 상태를 기록한다.

**아이디어**: copy 도메인도 stage manifest에 copy 특화 단계를 기록:
```json
{
  "copyScenario": "C",
  "featureType": "copy",
  "copyStages": {
    "referenceRefresh": "completed",
    "visualReview": "completed",
    "interactionReview": "completed",
    "gapBoard": "completed",
    "planUnit": "in-progress",
    "verify": "pending",
    "closeout": "pending"
  }
}
```

이렇게 하면 copy 도메인의 진행 상태를 추적하고, 이전 세션에서 중단된 지점에서 재개할 수 있다.

### 3.2 `/plan-improve`와 copy 도메인의 연결

**실제 구현**: `/plan-improve`는 archive된 Feature에 대한 개선 요청을 처리한다.

**아이디어**: copy Feature가 archive된 후 원본이 변경되면(예: 리브랜딩), `/plan-improve`를 통해 시나리오 C(충실도 교정)로 재진입할 수 있다. 이 흐름을 명시적으로 문서화하면 copy 도메인의 라이프사이클이 완성된다:
```
최초 구현 (시나리오 A/B) → archive → 원본 변경 감지 → /plan-improve
  → 시나리오 C (충실도 교정)로 재진입 → 갭 분석 → 수정 → archive
```

### 3.3 Evidence 경로를 Architecture Binding에 추가

**아이디어**: copy Feature의 `06-architecture-binding.md`에 evidence 경로도 포함:
```markdown
## Allowed Evidence Paths
- `.plans/features/active/{slug}/evidence/`
- `.plans/features/active/{slug}/screenshots/`
```

이렇게 하면 `dev-feature-scope-guard.js`가 evidence 파일 생성도 허용하면서, 범위 외 편집은 차단한다.

### 3.4 PCC(Planning Consistency Check)의 copy 확장

**실제 구현**: PCC-01~05가 PRD ↔ wireframe ↔ stitch 일관성을 검증한다.

**아이디어**: copy 시나리오 C에서 PCC-06을 추가:
- **PCC-06**: Gap Board ↔ Detail PRD 매핑 검증
  - 모든 P0 갭이 Detail PRD의 acceptance criteria에 반영되었는지
  - Detail PRD의 각 요구사항이 Gap Board의 갭 ID를 참조하는지

### 3.5 `/copy-reference-refresh`의 자동 스케줄링

**아이디어**: 원본이 자주 변경되는 프로젝트에서는 `/copy-reference-refresh`를 정기적으로 실행하여 baseline 매니페스트를 최신 상태로 유지. claude-kit의 scheduled-tasks 기능과 연계 가능:
```
매주 월요일: /copy-reference-refresh --check-stale
  → 마지막 캡처 후 N일 경과한 항목을 식별
  → stale 항목이 있으면 알림
```

### 3.6 Dev Feature의 WBS Story를 `/dev-feature` task breakdown에서 자동 태깅

**현재 상태**: `/dev-feature`는 `08-dev-tasks.md`에 TASK 목록을 생성하지만, WBS Story ID(S-*)를 부여하지 않는다.

**아이디어**: `/dev-feature`의 task breakdown 출력에 Story 그룹핑 추가:
```markdown
## Stories
- S-AUTH-01: 로그인 플로우 구현 (TASK-001~003)
- S-AUTH-02: 회원가입 폼 구현 (TASK-004~006)
```

이렇게 하면 dev Feature도 copy Feature와 동일한 WBS 추적이 가능하다.

### 3.7 시나리오 전환(A→C) 워크플로우

**아이디어**: 시나리오 A(백지 카피)로 시작했지만, 구현 중 원본과의 차이가 발견되어 시나리오 C(충실도 교정)로 전환해야 하는 경우의 워크플로우:
```
시나리오 A로 시작
  → /dev-run (구현)
    → /copy-verify (QA) — 갭 발견
      → 시나리오 C로 전환 결정 (사용자 게이트)
        → /copy-visual-review + /copy-interaction-review (갭 분석)
          → /copy-gap-board → /copy-plan-unit → /dev-run (수정)
            → /copy-verify (재검증)
```

---

## 4. 우선순위 정리

### 반드시 문서에 반영 (HIGH)

| # | 항목 | 대상 문서 |
|---|------|---------|
| 1 | Routing metadata 전달 방식 확정 (경로 기반 vs 명시적 파일) | 01, 02, 04 |
| 2 | Architecture binding의 copy 도메인 적용 | 04 |
| 3 | `plan-doc-guard.js`와 copy 기획 단계의 충돌 해결 | 04 |
| 4 | Stage manifest에 copy 단계 추가 | 03, 04 |

### 다음 반복에서 반영 (MEDIUM)

| # | 항목 | 대상 문서 |
|---|------|---------|
| 5 | Blueprint Fast-Track과 copy 시나리오 연결 | 03 |
| 6 | Hybrid Feature의 `reference-only` 경로 구체화 | 01, 03 |
| 7 | 시나리오 A/B QA 시점 copy 분석 자동 트리거 | 03, 04 |
| 8 | PCC-06 (Gap Board ↔ Detail PRD) 추가 | 04 |
| 9 | Evidence manifest 저장 위치 확정 | 04 |
| 10 | `/plan-improve` → 시나리오 C 재진입 흐름 | 03 |

### 향후 고려 (LOW)

| # | 항목 |
|---|------|
| 11 | `/copy-reference-refresh` 자동 스케줄링 |
| 12 | Dev Feature의 Story 자동 태깅 |
| 13 | 시나리오 전환(A→C) 워크플로우 |

---

## 5. 자기 검증

| 항목 | 기준 | 확인 |
|------|------|------|
| 실제 구현 vs 문서 가정 교차 분석 | 5개 주요 갭 식별 | [ ] |
| 문서 내부 정합성 갭 | 3개 갭 식별 | [ ] |
| 추가 아이디어 | 7개 제안 | [ ] |
| 우선순위 분류 | HIGH/MEDIUM/LOW 3단계 | [ ] |
| 기존 도메인 영향 식별 | plan/dev/core 모두 검토 | [ ] |
