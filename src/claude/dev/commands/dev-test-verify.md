# 테스트 품질 검증

변경된 코드의 테스트 품질을 Google Staff Engineer 수준으로 검증합니다.

> 참조: `.claude/skills/tdd-workflow/SKILL.md`

## 검증 항목
1. **핵심 비즈니스 로직** -- 금액 계산, 상태 전이, 권한, 데이터 격리
2. **Edge Case** -- 경계값 (0, null, undefined, 빈 배열)
3. **Error Case** -- 실패 시나리오, 에러 메시지/코드
4. **테스트 구조** -- Arrange-Act-Assert, 단일 검증 원칙

## 절차
1. 변경 파일 파악 (`.ai/.edit-log.json` + `git diff`)
2. 관련 테스트 매핑 + 읽기
3. 체크리스트 기반 품질 분석
4. maturity.json signals 업데이트 (domainCount, serverFileCount)

## 출력
BACKEND TEST QUALITY REPORT: 분석 파일 수, 통과/개선 필요/규칙 위반, 커버리지