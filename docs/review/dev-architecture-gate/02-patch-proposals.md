# Patch Proposals

> 본편 가이드(`docs/guide/`)에 반영할 수정안을 가이드별로 정리한다.

---

## docs/guide/00-overview.md

### 추가할 내용

- planning과 dev 사이에 `/dev-architecture`를 명시적으로 끼운다
- "기획 산출물이 있어도 개발 구조가 미정이면 바로 `/dev-feature`로 가지 않는다"는 원칙을 넣는다
- TypeScript 우선 기본 추천이 "기본값"일 뿐 "항상 자동 채택"은 아니라는 문장을 넣는다

### 교체할 메시지

- 기존 단선형 흐름: `/plan-bridge -> /dev-feature`
- 변경 후 흐름: `/plan-bridge -> /dev-architecture -> /dev-feature`
- 단, 구조 SSOT가 이미 승인된 경우 `/dev-architecture`는 확인 단계로 축약 가능

### 본편 반영 포인트

- overview 다이어그램 갱신
- 새로운 SSOT 파일 두 개 추가:
  - `.plans/project/00-dev-architecture.md`
  - `.plans/features/active/{slug}/00-context/06-architecture-binding.md`

---

## docs/guide/06-dev-handoff.md

### 바뀌는 핵심

- bridge는 더 이상 무조건 `/dev-feature`를 다음 단계로 안내하지 않는다
- 구조 SSOT가 없으면 `/dev-architecture`를 다음 단계로 제시한다

### 추가할 섹션: Architecture Pre-Check

bridge 실행 전 또는 bridge 완료 직후 다음을 확인한다:

- `.plans/project/00-dev-architecture.md` 존재 여부
- status가 `approved`인지
- 대상 feature에 `06-architecture-binding.md`가 있는지 또는 생성 가능한지

### Next Step Branching

| 조건 | 다음 단계 |
|------|----------|
| profile 없음 | `/dev-architecture --slug={slug}` |
| profile 있음 + binding 없음 | `/dev-architecture --slug={slug}` |
| profile 있음 + binding 있음 | `/dev-feature ...` |

### 문구 수정 포인트

- "Bridge 완료 후 바로 `/dev-feature` 실행" → "구조 게이트 통과 후 `/dev-feature` 실행"
- bridge context 문서 목록에 `06-architecture-binding.md`를 참조 문서로 추가

---

## docs/guide/08-dev-workflow.md

### 해결하려는 충돌

- 현재 문서는 `route-scoped`를 기본으로 설명한다
- 다른 자산은 `apps/{app}/features/{feature}` 구조를 정답처럼 설명한다
- 본편에서는 "고정 구조"가 아니라 "architecture profile + feature binding 기반 실행"으로 정리해야 한다

### 추가할 섹션: Architecture Inputs

Phase A~E 시작 전에 다음 두 문서를 읽는다:

- `.plans/project/00-dev-architecture.md`
- `.plans/features/active/{slug}/00-context/06-architecture-binding.md`

### Structure Modes

문서 본문에서 4개 모드를 모두 정의하되, 기본 추천만 route-scoped로 둔다:

- route-scoped
- feature-scoped
- hybrid
- type-based

### Path Resolution Rule

다음 네 가지는 하드코딩하지 않고 binding에서 읽는다:

- test path
- implementation path
- shared package path
- verification scope

### 바꿔야 할 서술

- route-scoped를 "항상 기본 구조"라고 단정하는 문장 → "기존 구조가 없을 때의 v1 추천"
- feature module 경로 예시 → "모드별 예시"로 재배치

---

## docs/guide/09-architecture.md

### 추가할 내용

- 프로젝트 구조 SSOT와 feature binding 문서 정의
- 구조 모드 4종 정의
- "workspace topology"와 "layer style"를 분리해서 설명
- `monorepo`, `hexagonal`, `clean architecture`가 같은 차원의 선택지가 아니라는 정리

### 층위 분리표

| 축 | 선택지 | 예시 |
|----|--------|------|
| Workspace topology | monorepo / single-app | `apps/`, `packages/` 여부 |
| Structure mode | route / feature / hybrid / type | route-local or feature-local |
| Layer style | hexagonal / clean / layered | domain, application, infra 매핑 |
| Stack contract | TS, Next.js, Vitest 등 | 실행 도구와 라이브러리 |

### 카탈로그 수치 갱신 (리뷰 반영)

현재 `09-architecture.md`의 도메인별 컴포넌트 수 테이블이 실제 소스와 불일치한다. 본편 반영 시 아래 값으로 갱신한다:

| 카테고리 | core | dev (현재→갱신) | plan | 합계 (현재→갱신) |
|---------|:----:|:---------------:|:----:|:----------------:|
| Agents | 0 | 6 | 6 | 12 |
| Commands | 0 | 20→**21+** | 10 | 30→**31+** |
| Skills | 2 | 13→**14+** | 8 | 23→**24+** |
| Hooks | 5 | 2→**3** | 1 | 8→**9** |
| Rules | 6 | 0 | 0 | 6 |
| **소계** | **13** | 41→**44+** | **25** | 79→**82+** |

### 훅 테이블 행 추가

기존 훅 테이블(L353-362)에 아래 행을 추가한다:

| 훅 | 도메인 | 이벤트 | 매처 | 동작 | 설명 |
|----|--------|--------|------|------|------|
| dev-feature-scope-guard.js | dev | PreToolUse | Edit\|Write | **BLOCKING** | 구조 SSOT/바인딩 없는 코드 수정 차단 |

---

## docs/guide/10-glossary.md

### 추가할 용어

| 용어 | 설명 |
|------|------|
| Dev Architecture Profile | `.plans/project/00-dev-architecture.md`. 프로젝트 개발 구조의 SSOT |
| Architecture Binding | `.plans/features/active/{slug}/00-context/06-architecture-binding.md`. feature별 구조 바인딩 |
| Structure Mode | route-scoped, feature-scoped, hybrid, type-based 중 하나 |
| Workspace Topology | monorepo 또는 single-app 같은 저장소 배치 축 |
| Layer Style | hexagonal, clean, layered 같은 레이어 규칙 축 |
| Architecture Pre-Check | `/plan-bridge`와 `/dev-feature` 진입 전 구조 SSOT 확인 단계 |
| Scope Guard | binding 경로 밖 코드 수정을 차단하는 훅 |

### 수정할 용어

| 용어 | 기존 | 변경 |
|------|------|------|
| Feature Module | feature 폴더 구조 자체를 의미하는 뉘앙스 | structure mode 중 하나에서 쓰이는 feature-local 구현 패턴 |
| Route-scoped | 기본 구조 | 기존 구조가 없을 때의 기본 추천 |
