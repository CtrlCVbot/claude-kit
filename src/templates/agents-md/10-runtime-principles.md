## 핵심 원칙 (요약)

증거 없이 완료 주장 금지. 작은 변경 범위 유지. 현재 프로젝트 구조 우선. 보안 기본선 준수. 무엇을 바꿨고 무엇을 검증했는지 명확히 보고.

> 상세 원칙·반례·자기 합리화 방지 표는 `.claude/rules/golden-principles.md` 참조.

## 작업 절차

1. 탐색: 관련 파일, 설정, package scripts, 기존 규칙을 먼저 확인합니다.
2. 계획: 변경 범위가 넓거나 리스크가 있으면 목표, 범위, 검증 방법을 짧게 정리합니다.
3. 구현: source file을 수정하고 generated output은 primary fix path로 삼지 않습니다.
4. 검증: 변경 성격에 맞는 가장 작은 검증부터 실행하고, 실패하면 원인과 다음 조치를 분리합니다.
5. 보고: 실행한 검증 결과와 남은 리스크를 숨기지 않습니다.

## 검증 기준 (요약)

이번 세션에서 실행한 명령과 출력 없이는 완료를 주장할 수 없습니다. 테스트·빌드·lint·타입 체크의 exit code 또는 출력이 증거입니다. "probably", "seems", "should work" 같은 추측 표현으로 완료를 주장하지 않습니다.

> Gate Function, Red-Green 루프, Agent Edit Race 상세는 `.claude/rules/verification.md` 참조.

## 코드 품질 기준 (요약)

TDD 순서 우선 (실패 테스트 확인 → 구현 → 리팩터링). 불필요한 mutation 대신 명시적 새 값 생성. 함수·파일은 읽기 쉬운 단위 유지. 외부 입력은 경계에서 검증. 임시 debug·실험 코드는 최종 변경에 남기지 않습니다.

> Code Quality Checklist 전체 항목과 예시는 `.claude/rules/coding-style.md` 참조.

## 보안 기준 (요약)

비밀값은 환경 변수 사용 (하드코딩 금지). 사용자 입력·query parameter·request body·file path는 경계에서 검증. SQL injection / XSS / CSRF / 권한 우회 / rate limit 누락을 점검. 에러 메시지에 내부 경로나 stack trace 노출 금지.

> Mandatory Security Checks 전체 + Secret Management 패턴은 `.claude/rules/security.md` 참조.
