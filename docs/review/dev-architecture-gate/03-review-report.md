# Review Report: dev-architecture-gate

> 하네스 엔지니어링 적합성과 구조 호환성 리뷰 결과를 한 문서로 정리한다.

---

## 총괄 요약

### 리뷰 범위

| 구분 | 대상 | 수량 |
|------|------|:----:|
| 실행 자산 | 명령, 스킬, 훅 | 3 |
| SSOT 문서 | Architecture Profile, Architecture Binding | 2 |
| 가이드 | 13-dev-architecture-gate.md | 1 |
| 패치 | 기존 가이드 수정안 | 5 |
| **합계** | | **11** |

### 핵심 결론

**하네스 적합성**: 제안된 모든 실행 자산은 claude-kit 하네스 규약을 충실히 따른다. 프론트매터/JSDoc, 네이밍, 설치 경로, 훅 이벤트 패턴 모두 기존 자산과 일치.

**구조 호환성**: 현재 구조에 추가하는 데 문제 없음. 기존 스킬과 보완 관계, 훅 실행 순서 논리적, 워크플로우 하위 호환.

### 제안-현실 갭

제안서는 3개 실행 자산을 "신규"로 기술했으나 이미 구현 완료:

| 자산 | 경로 | 구현 상태 |
|------|------|----------|
| 명령 | `src/claude/dev/commands/dev-architecture.md` | 119줄, frontmatter 포함 |
| 스킬 | `src/claude/dev/skills/dev-architecture-decision/SKILL.md` | 125줄, 4축 결정 매트릭스 |
| 훅 | `src/claude/dev/hooks/dev-feature-scope-guard.js` | 183줄, setup.js 양쪽 등록 |

---

## 하네스 엔지니어링 적합성

### 평가 축 (7개)

| # | 축 | 왜 중요한가 |
|---|---|---|
| 1 | 컴포넌트 유형 정확성 | 명령=진입점, 스킬=규칙, 훅=자동 가드. 역할 오배정 시 하네스가 올바르게 로드하지 못함 |
| 2 | 네이밍 컨벤션 | 플래트닝 설치가 이름에 의존. `dev-` 접두사 + kebab-case + 올바른 확장자 필수 |
| 3 | 프론트매터/헤더 프로토콜 | 하네스가 기계적으로 읽는 계약. 명령: description+argument-hint, 훅: JSDoc |
| 4 | 설치 경로 매핑 | Claude(`.claude/`) + Codex(`plugins/claude-kit/`) 양쪽 설치 보장 |
| 5 | 훅 이벤트 패턴 | PreToolUse + Edit\|Write + stdin JSON + exit 0/2. 기존 BLOCKING 훅과 동일 패턴 |
| 6 | 선행조건 체인 | plan-bridge → dev-architecture → dev-feature 선형 체인. 순환 시 교착 |
| 7 | 도메인 경계 | `src/claude/dev/` 소속. plan-bridge만 교차 도메인 접점 (기존 예외 패턴) |

### 컴포넌트별 판정

| 컴포넌트 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 판정 |
|----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:----:|
| A. `dev-architecture.md` (명령) | P | P | P | P | -- | P | P | **Pass** |
| B. `dev-architecture-decision/SKILL.md` (스킬) | P | P | P | P | -- | P | P | **Pass** |
| C. `dev-feature-scope-guard.js` (훅) | P | P | P | P | P | P | P | **Pass** |
| D. SSOT 문서 템플릿 | P | P | P | P | -- | -- | -- | **Pass** |
| E. `13-dev-architecture-gate.md` (가이드) | P | P | -- | -- | -- | -- | -- | **Pass** |
| F. 패치 문서 | -- | -- | -- | -- | -- | -- | -- | **Conditional** |

> P = Pass, -- = N/A

### 훅 패턴 상세 비교

`dev-feature-scope-guard.js`와 기존 `dev-tdd-guard.js` 비교:

| 항목 | 일치 |
|------|:----:|
| shebang (`#!/usr/bin/env node`) | O |
| JSDoc (Hook/Event/Action) | O |
| stdin JSON 파싱 | O |
| tool_name 필터 (Edit, Write) | O |
| file_path 추출 | O |
| 면제 패턴 (정규식 배열) | O |
| 차단 출력 (stderr + 구분선) | O |
| exit code (0/2) | O |
| catch 처리 (exit 0) | O |

모든 항목에서 기존 BLOCKING 훅 패턴을 정확히 따른다.

### F. 패치 Conditional 사유

`patch-09-architecture.md`에서 카탈로그 수치 불일치를 해소해야 한다. 본 통합 문서의 `02-patch-proposals.md`에 수치 갱신 내용을 반영 완료.

---

## 구조 호환성

### 차원별 판정

| # | 차원 | 판정 | 핵심 근거 |
|---|------|:----:|----------|
| 1 | 기능 중복 | **Pass** | 세 스킬이 결정→규칙→배치 단계로 보완 |
| 2 | 순환 의존 | **Pass** | 명령→스킬 단방향. 훅은 파일시스템만 읽음 |
| 3 | 훅 충돌 | **Pass** | scope-guard → tdd-guard 순서가 논리적 |
| 4 | setup.js 호환 | **Pass** | Claude L475 + Codex L627 양쪽 등록 |
| 5 | 워크플로우 통합 | **Pass** | SSOT 있는 프로젝트는 확인만 추가 |
| 6 | 카탈로그 정합성 | **Conditional** | 09-architecture.md 수치 갱신 필요 |
| 7 | 네이밍 충돌 | **Pass** | `dev-architecture`(명령) vs `dev-architect`(에이전트): 유형/이름 다름 |
| 8 | `.plans/` 경로 충돌 | **Pass** | 신규 경로. 기존 산출물과 겹치지 않음 |

### 주요 분석

#### 기능 중복 (차원 1)

세 스킬은 서로 다른 단계를 담당한다:

| 단계 | 스킬 | 역할 |
|------|------|------|
| 선택 | `dev-architecture-decision` | 4개 구조 모드 중 하나를 결정 |
| 규칙 | `dev-layered-architecture` | 선택된 레이어 스타일을 코드 경계로 번역 |
| 배치 | `dev-feature-module` | 구조 모드 안에서 실제 파일 위치 안내 |

#### 훅 실행 순서 (차원 3)

setup.js L474-477 등록 순서:

| 순서 | 훅 | 역할 |
|:----:|---|------|
| 1 | `dev-feature-scope-guard.js` | 구조 SSOT/바인딩 검사 |
| 2 | `dev-tdd-guard.js` | 테스트 파일 존재 검사 |
| 3 | `dev-db-guard.js` | SQL 위험 명령 검사 |

scope-guard가 차단하면 tdd-guard는 미도달. 이는 의도된 동작: 구조가 없는 상태에서 테스트 존재 검사는 의미 없음.

#### 워크플로우 하위 호환 (차원 5)

| 상황 | 동작 | 영향 |
|------|------|------|
| SSOT 있는 프로젝트 | 확인 단계만 추가 | 기존 워크플로우 유지 |
| SSOT 없는 신규 프로젝트 | 구조 추천 → 승인 | 새 단계 추가 |
| SSOT 없는 기존 프로젝트 | 훅이 차단, `/dev-architecture` 안내 | 한 번 실행 필요 |

---

## 권고사항

### 즉시 (병합 전) — 반영 완료

| # | 항목 | 상태 |
|---|------|:----:|
| 1 | `01-change-map.md` "이미 구현됨" 갱신 | 반영됨 |
| 2 | 병합 체크리스트 간소화 (실행 자산 생성 생략) | 반영됨 |
| 3 | `patch-09` 카탈로그 수치 + 훅 테이블 갱신 | 반영됨 |

### 단기 (병합 후)

| # | 항목 |
|---|------|
| 4 | `09-architecture.md` 본편의 수치를 실제 소스와 일치시키는 일괄 갱신 |
| 5 | `01-change-map.md`에 나열된 8개 기존 자산 수정이 실제 코드에 반영되었는지 확인 |

### 선택 (후속 개선)

| # | 항목 |
|---|------|
| 6 | 소스 디렉토리를 스캔하여 카탈로그를 자동 생성하는 스크립트 고려 |
| 7 | SSOT 없는 기존 프로젝트가 scope-guard에 처음 마주쳤을 때를 위한 마이그레이션 가이드 |
