<!-- kit-convert generated: 2026-04-24 -->
# 구조적 리팩토링

코드 구조를 안전하게 개선합니다.

> 참조: `.claude/skills/dev-refactoring/SKILL.md`

## 절차
1. 리팩토링 대상 식별 (코드 냄새 분석)
2. 테스트 커버리지 확인 (안전망, >= 80% 권장)
3. 단계별 리팩토링 (테스트 통과 유지)
   - 각 단계마다 vitest 실행으로 통과 확인
4. `/dev-test-verify` 실행으로 결과 검증

## 코드 냄새 체크리스트
- 긴 함수 (> 30줄)
- 거대 클래스 (> 200줄)
- Feature Envy (다른 객체 데이터 과다 참조)
- 산탄총 수술 (하나의 변경 → 다수 파일 수정)
- 중복 코드

## 규칙
- 테스트 통과 상태 유지 필수
- 기능 변경 금지 (구조만 개선)
- 커버리지 부족 시 테스트 보강 우선

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/commands/dev-refactor.md`
