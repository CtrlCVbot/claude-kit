# Dev Architecture Gate

## 목적

기획 산출물이 준비되었더라도 개발 구조가 확정되지 않았다면 바로 `/dev-feature`로 넘어가지 않는다.
먼저 `/dev-architecture`로 프로젝트 구조, 레이어 매핑, 프레임워크/라이브러리 기본 계약을 확정한 뒤 개발 파이프라인으로 진입한다.

## 왜 필요한가

- 지금 저장소는 `hexagonal + monorepo + typescript`를 강한 기본값처럼 설명하지만, 실제로는 “구조 미정일 때 어떻게 고르는가”가 정의되어 있지 않다.
- `dev-feature-module`은 feature 폴더 중심 구조를 설명하고, `08-dev-workflow`는 route-scoped를 기본으로 설명해 서로 충돌한다.
- 이 상태에서는 feature package가 생성돼도 실제 프로젝트 구조에 맞는 구현 경로를 안정적으로 고정할 수 없다.

## 진입 규칙

다음 중 하나라도 참이면 `/dev-architecture`를 먼저 수행한다.

1. `.plans/project/00-dev-architecture.md`가 없다
2. 구조 모드가 승인되지 않았다
3. 기존 구조와 문서화된 구조가 드리프트 상태다
4. 새 feature가 아직 `06-architecture-binding.md`를 갖고 있지 않다

## 출력 SSOT

### 1. 프로젝트 구조 SSOT

경로: `.plans/project/00-dev-architecture.md`

필수 항목:

- Status: `detected`, `recommended`, `approved`
- Language / Runtime / Framework
- Workspace topology: monorepo 또는 single-app
- Structure mode: `route-scoped`, `feature-scoped`, `hybrid`, `type-based`
- Layer style: `hexagonal`, `clean`, 또는 혼합 규칙
- Detection evidence
- Layer mapping
- Shared-vs-local extraction rules
- Test and verification contract

### 2. 기능별 구조 바인딩

경로: `.plans/features/active/{slug}/00-context/06-architecture-binding.md`

필수 항목:

- Feature slug
- Source architecture profile 경로
- Selected structure mode
- Allowed target paths
- Recommended test paths
- Shared package touch points
- Verification notes

## 구조 결정 우선순위

1. 이미 존재하는 코드 구조를 감지해서 채택
2. 감지 결과가 약하면 현재 스택과 PRD 성격을 기준으로 추천
3. 추천안이 있더라도 승인 전에는 `approved`로 승격하지 않음

## 구조 모드 정의

### route-scoped

- 라우트 경계가 feature 경계다
- 예: `app/(main)/orders`, `app/(main)/orders/components`, `app/(main)/orders/lib`
- v1 기본 추천

### feature-scoped

- `apps/{app}/features/{feature}` 또는 `src/features/{feature}` 중심
- page/route는 feature를 조합하는 진입점으로 얇게 유지

### hybrid

- 단순 페이지는 route-scoped
- 복잡한 도메인 기능은 feature-scoped
- 실제 프로젝트에서 두 패턴이 공존할 때 사용

### type-based

- `components/`, `hooks/`, `lib/` 같은 타입별 전역 폴더 중심
- 작은 MVP나 초기 프로젝트에만 허용

## TypeScript 우선 기본 추천

기존 구조가 감지되지 않을 때 v1 기본 추천은 다음과 같다.

- Language: TypeScript
- Workspace: monorepo
- Framework: Next.js App Router
- Structure mode: route-scoped
- Layer style: hexagonal
- Shared packages: `packages/core`, `packages/db`, `packages/ui`
- Test runner: vitest

## `/plan-bridge`와의 관계

- bridge는 planning 산출물을 dev로 넘기는 역할만 한다
- 구조 SSOT가 없으면 bridge는 `/dev-feature` 대신 `/dev-architecture`를 다음 단계로 안내한다
- 구조 SSOT가 승인되면 그때 `/dev-feature`를 열어 준다

## `/dev-feature`와의 관계

- `/dev-feature`는 시작 전에 architecture profile을 읽는다
- feature binding이 없으면 먼저 binding을 생성하거나 `/dev-architecture --slug={slug}`로 돌아간다
- 패키지 문서에는 구조 요약이 아니라 실제 target path와 layer mapping이 들어간다

## 훅 규칙

`dev-feature-scope-guard.js`는 다음을 차단한다.

1. 구조 SSOT 없이 앱/패키지 코드 수정 시작
2. feature binding 없이 feature 관련 코드 수정 시작
3. binding의 허용 경로 밖 코드 수정

## 승인 흐름

1. 구조 감지 또는 추천
2. `.plans/project/00-dev-architecture.md` 작성
3. 사용자 확인
4. `approved`로 승격
5. feature별 `06-architecture-binding.md` 생성
6. `/dev-feature` 진입

## 병합 메모

이 초안은 리뷰 패키지용이다.
본편 반영 시 `docs/guide/13-dev-architecture-gate.md`로 이동하고, 관련 guide 문서의 링크와 용어를 함께 정리한다.
