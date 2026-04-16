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

## Hybrid Feature 처리

dev Feature이지만 레퍼런스 캡처가 필요한 경우 reference-only 모드를 사용한다.

- `/copy-reference-refresh`만 실행 (evidence 캡처만 수행)
- 갭 분석, visual/interaction review 건너뜀
- 캡처된 evidence는 dev 구현 시 시각적 참조로만 사용

## 금지 사항

| 규칙 | 금지 예시 | 허용 예시 |
|------|----------|----------|
| 자동 Phase 전진 금지 | `/copy-visual-review` 완료 후 자동 `/copy-verify` 실행 | 결과 보고 후 사용자 지시 대기 |
| 순서 위반 금지 | manifest 미존재 상태에서 `/copy-visual-review` 실행 | `/copy-reference-refresh` 완료 후 실행 |
| 커맨드 병합 금지 | `/copy-visual-review` 중 코드 수정 | 분석만 수행, 수정은 Implement 단계에서 |
