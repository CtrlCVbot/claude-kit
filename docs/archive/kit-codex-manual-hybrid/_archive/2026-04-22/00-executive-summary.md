# 00 Executive Summary

> 대상 독자: 의사결정자, 메인테이너
> 읽기 시간: 5분
> 문서 기준일: 2026-04-21

## 핵심 결론

`claude-kit`의 Codex 지원 구조는 `Claude 자산 전체 복제형 plugin`에서 `shared manual 중심 + Codex native runtime 최소 유지` 구조로 전환하는 것이 타당하다.

이번 설계 패키지는 `manual-only`를 목표 구조로 보지 않는다. 대신 `manual-first hybrid`를 목표 구조로 채택한다.

- 공통 규칙, 파이프라인 설명, workflow 선택 기준은 `shared manual`로 통합한다.
- Codex가 실제로 필요로 하는 실행 surface는 `AGENTS.md`, `skills`, `.codex/agents/*.toml`, 제한된 compatible hooks만 유지한다.
- `.claude/`는 Claude runtime 산출물로 유지하되, Codex가 이를 직접 runtime source처럼 읽는 구조는 목표에서 제외한다.

## 왜 바꾸는가

현재 구조는 빠르게 동작하는 장점이 있지만 유지보수 비용이 높다.

- `src/claude`와 `src/codex`에 설명 자산이 병렬로 존재한다.
- `scripts/setup.js`가 Codex용 `agents`, `commands`, `skills`를 별도 복제한다.
- runtime 차이보다 표현 차이만 있는 파일도 Codex 전용 자산으로 남아 있다.
- Codex 공식 surface가 바뀌면 현재 커스텀 구조가 먼저 깨질 가능성이 있다.

## 왜 `manual-only`는 아닌가

플러그인 안에 전체 매뉴얼만 넣고 Codex가 `.claude/agents/*.md`, `.claude/commands/*.md`, `.claude/hooks/*.js`를 그대로 읽게 만드는 접근은 공식 Codex surface와 맞지 않는다.

- Codex custom agents의 공식 surface는 `.codex/agents/*.toml`이다.
- Codex는 `AGENTS.md`와 `skills`를 주요 instruction/behavior 진입점으로 사용한다.
- hooks는 존재하지만 현재 공식 문서 기준으로 보장 범위가 제한적이다.
- 따라서 문서만으로 대체 가능한 부분과 native runtime으로 남겨야 하는 부분을 분리해야 한다.

## 추천안

### 권장 아키텍처

1. `shared manual`을 단일 SSOT로 둔다.
2. Claude와 Codex는 같은 `shared manual`을 참조하되, 각자의 runtime surface는 따로 유지한다.
3. Codex plugin은 `skills` 중심으로 재정리한다.
4. Codex custom agents가 정말 필요한 경우에만 `.codex/agents/*.toml`을 사용한다.
5. hooks는 `문서로 충분한가`와 `runtime enforcement가 필요한가`를 구분해 최소 subset만 유지한다.

### Canonical shared-manual path

`src/shared/manuals/`를 canonical path로 고정한다.

이 경로를 선택하는 이유는 다음과 같다.

- 현재 generator, template, setup 흐름이 이미 `src/` 중심으로 구성되어 있다.
- runtime output과 authoring source를 분리하기 쉽다.
- `docs/`는 설명 문서에는 적합하지만 generator 입력 소스로 쓰기에는 책임 경계가 모호하다.
- 별도 package 분리는 장기 옵션일 수 있으나 지금 단계에서는 구조 복잡도를 먼저 올린다.

## 기대 효과

- 설명 자산 중복 감소
- plugin 구조와 공식 Codex surface 정렬
- Claude/Codex 책임 경계 명확화
- 이후 Codex 문서 변화에 대한 추적성과 대응성 향상

## Phase 0 acceptance criteria

Phase 0 설계 승인은 아래 세 항목이 함께 고정되어야 한다.

1. `manual-only`가 아니라 `manual-first hybrid`를 채택했다는 결정
2. official Codex documentation snapshot 날짜와 확인 대상 URL 묶음
3. `src/codex` duplication을 A/B/C로 분류하는 rubric

## 이번 패키지의 범위

이번 문서 패키지는 구현 문서가 아니라 설계 문서다.

- 공식 Codex surface와 제약 정리
- 현재 `claude-kit` 구조 감사
- 목표 아키텍처 정의
- 단계별 마이그레이션 계획
- 검증 질문, 리스크, 완료 조건 정의

구현 PR과 실제 제거 작업은 후속 단계로 분리한다.
