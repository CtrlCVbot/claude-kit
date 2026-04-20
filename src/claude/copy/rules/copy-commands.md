# Copy Command Usage Principles

> copy 도메인 커맨드의 실행 순서와 사용 원칙. 커맨드는 도구이며, 실행 순서는 시나리오가 결정한다.

## 시나리오별 커맨드 순서

### 시나리오 A/B (Greenfield / Partial)

신규 구현 또는 부분 완성 시나리오. 갭 분석 없이 레퍼런스 기반으로 구현한다.

```
/copy-reference-refresh        ← evidence 수집
    ↓
(구현)                         ← 코드 작성
    ↓
/copy-visual-review            ← visual fidelity 검증
    ↓
/copy-interaction-review       ← interaction fidelity 검증
    ↓
/copy-verify                   ← 통합 검증
    ↓
/copy-closeout                 ← 결과 확정
```

### 시나리오 C (Fidelity Correction)

기존 구현의 충실도를 보정하는 시나리오. 갭 분석이 선행된다.

```
/copy-reference-refresh        ← evidence 수집 (live + current)
    ↓
/copy-visual-review            ← visual 갭 식별
/copy-interaction-review       ← interaction 갭 식별
    ↓
/copy-gap-board                ← 갭 통합, priority 배정
    ↓
/copy-plan-unit                ← Execution Unit 계획 수립
    ↓
(구현)                         ← 코드 작성
    ↓
/copy-verify                   ← 통합 검증
    ↓
/copy-closeout                 ← 결과 확정
```

## Feature 타입 라우팅

| Feature 타입 | copy 커맨드 사용 | 비고 |
|-------------|-----------------|------|
| copy Feature | 필수 | 전체 copy 파이프라인 적용 |
| dev Feature | 건너뜀 | dev 도메인 워크플로우만 사용 |
| Hybrid Feature | reference-only 모드 | 아래 참조 |

## Hybrid Feature 처리 (IMP-KIT-006 공식 정의)

dev Feature이지만 레퍼런스 캡처가 필요한 경우 **reference-only 모드**로 경량 실행한다.

### 진입 조건

Hybrid 모드는 아래 둘 중 하나로 진입한다:

1. **자동 감지** (routing-metadata 기반):
   - `plan-draft-writer`가 IDEA/SCREENING에서 결정론적 시그널(`reference-needed: true`, `hybrid-candidate: true`) 또는 휴리스틱 키워드("레퍼런스 캡처 필요", "기존 사이트 참조", "디자인 기반", "시각 참조")를 감지
   - `07-routing-metadata.md`에 `hybrid: true` 기록
   - `/copy-reference-refresh` 호출 시 `hybrid: true`를 읽어 자동 reference-only 모드

2. **명시적 플래그**:
   - `/copy-reference-refresh --reference-only --scope {...} --viewport {...}`

### 수행 작업

Hybrid 모드에서 다음만 수행:
- evidence 캡처 (레퍼런스 소스만)
- `evidence/manifest.json` 생성 (`mode: "reference-only"` 필드 포함)
- 누락 레퍼런스 보고

### 건너뛰는 단계

- 갭 분석 (`/copy-gap-board`)
- visual/interaction review (`/copy-visual-review`, `/copy-interaction-review`)
- plan-unit (`/copy-plan-unit`)
- verify/closeout (`/copy-verify`, `/copy-closeout`)

### 사용처

캡처된 evidence는 **dev 구현 시 시각적 참조**로만 사용된다:
- 개발자가 화면 레이아웃/색상/간격 등을 확인
- dev Feature의 UI 구현에 디자인 기준 제공
- copy 도메인 풀 파이프라인 진입은 하지 않음

### 모드 전환 규칙

- reference-only 모드 진입 후 사용자가 갭 분석을 추가 요청 시: **모드 전환 경고** + 일반 모드 재실행 권장
- routing-metadata의 `hybrid: false`인데 `--reference-only` 플래그 명시 시: 사용자 의도 재확인

### 연계 구현

- `plan-draft-writer` (IMP-KIT-003): Hybrid 자동 감지 + routing-metadata 기록
- `plan-bridge-writer` (IMP-KIT-004): Hybrid dev Feature 경로 분기에서 `/copy-reference-refresh --reference-only` 안내
- `copy-reference-baseline` 에이전트: mode 필드 기반 페어링 매트릭스 생략 분기

## 금지 사항

| 규칙 | 금지 예시 | 허용 예시 |
|------|----------|----------|
| 자동 Phase 전진 금지 | `/copy-visual-review` 완료 후 자동 `/copy-verify` 실행 | 결과 보고 후 사용자 지시 대기 |
| 순서 위반 금지 | manifest 미존재 상태에서 `/copy-visual-review` 실행 | `/copy-reference-refresh` 완료 후 실행 |
| 커맨드 병합 금지 | `/copy-visual-review` 중 코드 수정 | 분석만 수행, 수정은 Implement 단계에서 |
