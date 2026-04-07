---
description: 개발 구조를 감지하거나 추천하고, 구조 SSOT와 feature binding을 만든다.
argument-hint: [--slug <feature-slug>] [--refresh] [context]
---

# /dev-architecture

기획 산출물이 준비됐더라도 개발 구조가 확정되지 않았다면 먼저 이 명령을 실행한다.

## 목적

1. 현재 리포에 이미 존재하는 구조를 감지한다
2. 구조가 이미 있으면 그 구조를 SSOT로 고정한다
3. 구조가 없으면 추천안을 만든 뒤 승인받아 확정한다
4. feature가 있으면 해당 feature용 architecture binding도 만든다

## 필수 출력

- `.plans/project/00-dev-architecture.md`
- `.plans/features/active/{slug}/00-context/06-architecture-binding.md` (`--slug`가 있을 때)

## 구조 결정 축

다음을 같은 차원의 선택지로 섞지 않는다.

- Workspace topology: `monorepo`, `single-app`
- Structure mode: `route-scoped`, `feature-scoped`, `hybrid`, `type-based`
- Layer style: `hexagonal`, `clean`, `layered`
- Stack contract: language, framework, test runner, 주요 라이브러리

## Workflow

### 1. 현재 구조 감지

다음 증거를 먼저 읽는다.

- `profile.json`
- `package.json`, workspace 설정 파일
- `apps/`, `packages/`, `app/`, `src/`, `features/` 디렉터리
- route group, page entry, shared package, 테스트 위치

### 2. 기존 구조 우선 채택

다음 증거가 강하면 새 구조를 추천하지 말고 기존 구조를 채택한다.

- `apps/` + `packages/`가 이미 존재
- route-local 폴더 또는 feature-local 폴더 패턴이 반복
- 특정 테스트 위치가 반복
- shared package 추출 규칙이 이미 코드에 반영

### 3. 구조가 없을 때의 기본 추천

TypeScript 우선 v1 기본 추천:

- workspace topology: `monorepo`
- structure mode: `route-scoped`
- layer style: `hexagonal`
- stack contract: `TypeScript + Next.js App Router + Vitest`
- shared packages: `packages/core`, `packages/db`, `packages/ui`

### 4. 승인 규칙

- 기존 구조를 감지한 경우: `detected`로 작성하고 필요하면 바로 `approved`로 승격
- 추천 구조인 경우: 추천안 요약을 먼저 보여주고 승인받은 뒤 `approved`로 승격

### 5. Architecture Profile 작성

`.plans/project/00-dev-architecture.md`에 최소한 다음을 포함한다.

- Status
- Detection Summary
- Workspace Topology
- Structure Mode
- Layer Style
- Stack Contract
- Layer Mapping
- Shared vs Local Rules
- Verification Contract

### 6. Feature Binding 작성

`--slug`가 주어졌으면 `.plans/features/active/{slug}/00-context/06-architecture-binding.md`를 만든다.

반드시 포함할 항목:

- Feature slug
- Source architecture profile 경로
- Selected structure mode
- Allowed target paths
- Recommended test paths
- Shared package touch points
- Verification notes

## Allowed target paths 작성 규칙

binding 문서의 `Allowed target paths`에는 실제 경로를 backtick으로 적는다.

예시:

- `apps/web/app/(main)/orders`
- `apps/web/app/(main)/orders/components`
- `packages/core/orders`
- `packages/db/orders`

## Output

### 구조 미확정

- 감지 결과
- 추천 구조
- 승인 필요 여부
- 다음 단계: 승인 후 `/dev-feature`

### 구조 확정

- 생성 또는 갱신한 SSOT 파일 경로
- feature binding 경로
- 다음 단계: `/dev-feature {prd-path}`
