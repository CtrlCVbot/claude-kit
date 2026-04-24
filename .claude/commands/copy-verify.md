---
description: build/evidence/document 검증
---

# /copy-verify

구현 결과를 build, evidence, document 관점에서 종합 검증하고 QA 리포트를 생성한다.

## Usage

```bash
/copy-verify
```

## Preconditions

- evidence manifest가 존재한다.
- 구현 코드가 빌드 가능한 상태다.

## Workflow

1. `copy-qa-reviewer` 에이전트를 스폰한다.
2. 9단계 검증을 순서대로 실행한다.
   1. **Build 검증**: 빌드 성공 여부
   2. **Variant 검증**: 디자인 variant 매핑 일치
   3. **Screenshot diff**: 기준 대비 시각 차이 측정
   4. **Interactive 검증**: 인터랙션 상태 동작 확인
   5. **Document 검증**: 문서-코드 일관성
   6. **Acceptance 검증**: 수용 기준 충족 여부
   7. **Regression 검증**: 기존 기능 영향 확인
   8. **Accessibility 검증**: 접근성 기본 점검
   9. **Performance 검증**: 렌더링 성능 기본 점검
3. QA 결과 리포트를 생성한다.

## Output

- QA Result Report (단계별 pass/fail + 상세 사유)
- Acceptance Readiness 판정 (Ready / Not Ready + 잔여 이슈 목록)

## Rules

- 시나리오 A/B: 자동으로 `/copy-visual-review` + `/copy-interaction-review`를 체이닝한다.
- 시나리오 C: 체이닝 없이 독립 실행한다 (갭 분석은 기획 시점에 완료).
- 각 단계의 pass/fail을 명확히 기록한다 — 추측 판정 금지.
- 실패 단계가 있으면 Acceptance Readiness를 Not Ready로 판정한다.
