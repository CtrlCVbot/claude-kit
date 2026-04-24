<!-- kit-convert generated: 2026-04-24 -->
# 아키텍처 코드 리뷰

변경된 코드의 아키텍처 규칙 준수를 검증합니다.

> 참조: `.claude/skills/layered-architecture/SKILL.md`, `.claude/skills/dev-feature-module/SKILL.md`, `.claude/skills/frontend-patterns/SKILL.md`

## 검증 항목

### 레이어 규칙 (ERROR)
1. Domain → Infrastructure 역방향 의존
2. Application → ORM/Framework 직접 의존
3. Feature → Feature 간 import

### 도메인 순수성 (ERROR/WARN)
4. Domain 코드에 외부 라이브러리 import (ERROR, zod 제외)
5. 서비스에서 도메인 로직 직접 수행 (WARN)

### 테스트 커버리지 (ERROR/WARN)
6. Domain 코드에 테스트 없음 (ERROR)
7. Happy/Edge/Error 3가지 중 2가지 미만 (WARN)

### 네이밍 (WARN)
8. 축약어 사용: repo, svc 등 (WARN)

### 프론트엔드 구조 (WARN)
9. Feature 내 상태(Context)가 외부에 노출
10. 전역 상태(Jotai atom)를 Feature 내부에 정의
11. page.tsx에 비즈니스 로직 직접 구현 — Feature 추출 필요

## 절차
1. 변경 파일 파악 (`git diff --name-only`, `.ai/.edit-log.json`)
2. 파일별 레이어 분류 (Domain/Application/Infrastructure/Presentation/Feature)
3. import 문 분석 → 레이어 규칙 위반 탐지
4. 테스트 파일 매핑 → 커버리지 분석
5. 코드 품질 체크 (네이밍, 도메인 로직 누출)
6. 프론트엔드 구조 체크 (상태 관리 범위, Feature 생성 기준)

## 출력
ARCHITECTURE REVIEW REPORT
- 파일 수, ERROR/WARN 건수, 위반 목록
- 개선 제안 (구체적 코드 위치 + 수정 방향)

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/commands/dev-review.md`
