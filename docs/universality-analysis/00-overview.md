# ~/.claude 범용성 분석 프로젝트

> 작성일: 2026-04-10

## 목적
사용자가 직접 작성한 73개 파일의 범용성을 분석하여 claude-kit 적용 후보 선별 + 전역형/프로젝트용 분리 재배치 계획 수립.

## 범위
- 대상: ~/.claude/ 직접 작성 73개 (rules 9, hooks 15, skills 15, commands 32, cc-chips 1, settings.json 1)
- 제외: Claude Forge 설치 12개, 마켓플레이스 9개, 자동 생성 데이터
- 비교 대상: claude-kit src/claude/ 기존 84+ 컴포넌트

## 방법론

### 범용성 스코어 (★1~5)
5차원 가중 평균:

| 차원 | 비중 | ★5 | ★3 | ★1 |
|------|------|-----|-----|-----|
| 언어 독립성 | 25% | 프레임워크 무관 | 선택적 의존 | 특정 프레임워크 필수 |
| 프로젝트 독립성 | 25% | 모든 프로젝트 | 대부분 프로젝트 | 특정 구조 필수 |
| 외부 서비스 독립성 | 20% | 외부 서비스 없음 | 선택적 MCP | 특정 MCP 필수 |
| 재사용 범위 | 15% | 모든 개발자 | 특정 역할 | 작성자만 |
| 토큰 효율성 | 15% | 간결, 중복 없음 | 약간 중복 | 심한 중복 |

### 분류 기준
- ★4~5 → 전역형 (~/.claude/ 유지)
- ★1~2 → 프로젝트용 (프로젝트 .claude/로 이동)
- ★3 → 조건부 (paths: frontmatter 활용)

### 비교 차원
- 중복: claude-kit에 동등 기능 존재
- 신규: claude-kit에 없음 -- 포함 후보
- 보완: claude-kit 기존 컴포넌트 확장/개선

## 선행 작업
- [docs/global-rules-review/](../global-rules-review/) -- rules 9개 분석 완료
- [docs/claude-home-inventory.md](../claude-home-inventory.md) -- 73개 파일 인벤토리

## 요약 통계

| 구분 | 수량 |
|------|------|
| 중복 (claude-kit에 이미 존재) | 27개 |
| 보완 (기존 컴포넌트 확장) | 5개 |
| 신규 (claude-kit에 없음) | 41개 |

## 읽기 순서

| 번호 | 문서 | 내용 |
|------|------|------|
| 01 | [01-score-table.md](01-score-table.md) | 73개 범용성 스코어 테이블 |
| 02 | [02-classification-table.md](02-classification-table.md) | 전역형 vs 프로젝트용 분류표 |
| 03 | [03-component-mapping.md](03-component-mapping.md) | src/claude/ vs 사용자 파일 매핑 |
| 04 | [04-candidate-list.md](04-candidate-list.md) | 최종 적용 후보 목록 |
| 05 | [05-implementation-sequence.md](05-implementation-sequence.md) | 구현 순서 계획 |
