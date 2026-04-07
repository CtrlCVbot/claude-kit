# 프론트엔드 테스트 품질 검증

변경된 프론트엔드 코드의 테스트 품질을 검증합니다.

> 참조: `.claude/skills/testing-frontend/SKILL.md`, `.claude/skills/frontend-patterns/SKILL.md`

## 검증 항목
1. **컴포넌트 렌더링** -- 테스트 존재 여부
2. **사용자 인터랙션** -- userEvent 테스트
3. **에러 상태** -- 에러 렌더링 테스트
4. **Server Action** -- mock 적정성
5. **접근성** -- 기본 Accessibility 검증
6. **패턴 준수** -- CVA/cn() 사용, 상태 관리 범위 준수

## 절차
1. 변경 파일 파악 (`.tsx`, `.ts` in `apps/**/features/`, `apps/**/components/`)
2. 관련 테스트 매핑 (co-located `*.test.tsx`, `__tests__/`)
3. 체크리스트 기반 품질 분석
4. 패턴 준수 체크 (CVA, 상태 범위, Provider)
5. maturity.json signals 업데이트

## 출력
FRONTEND TEST QUALITY REPORT
- 분석 컴포넌트 수, 통과/개선 필요/규칙 위반
