# 개발 검증

Feature Package 요건 대비 구현 완전성을 검증합니다.

> 참조: `.plan/guide/dev-feature-guide/dev-verification-check.md`

## 입력
- Feature Package 경로 (필수): 인자 또는 대화에서 지정
- 예: `/dev-verify .plans/features/active/payment-subscription-flow`

## 워크플로우
1. Feature Package 전체 로드 (requirements, tasks, test-cases)
2. 구현 코드 탐색 (`08-dev-tasks.md`의 파일 경로)
3. DVC 6개 항목 검증 실행 (병렬)
4. Back-Propagation 필요 여부 판단
5. 검증 리포트 생성

## DVC (Development Verification Check) 항목
| # | 항목 | Severity |
|---|------|----------|
| DVC-01 | REQ Coverage — 모든 REQ가 구현에 반영 | FLAG |
| DVC-02 | TC Implementation — 모든 TC가 테스트로 작성 | FLAG |
| DVC-03 | TASK Completion — 모든 TASK가 done 상태 | ERROR |
| DVC-04 | Pattern Compliance — Vertical Slice 패턴 준수 | WARN |
| DVC-05 | Edge Case Discovery — 개발 중 발견된 Edge Case 반영 | WARN |
| DVC-06 | Scope Alignment — 구현 범위가 Feature Package 범위와 일치 | FLAG |

## 출력
```
DEVELOPMENT VERIFICATION REPORT
- DVC-01~06 결과 (PASS/FLAG/ERROR)
- 커버리지 요약 (REQ N/M, TC N/M, TASK N/M)
- Back-Propagation 제안 (있을 경우)
```

## 규칙
- 모든 TASK가 done 상태가 아니면 ERROR (개발 미완료)
- DVC 결과는 `03-dev-notes/dev-verification-report.md`에 저장
- FLAG/WARN 항목은 수정 후 재검증 권장
- 전체 PASS 시 `/dev-test-verify` → `/dev-commit` 진행 안내
