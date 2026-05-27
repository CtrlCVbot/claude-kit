# Children Features: EPIC-20260527-001

## Feature 맵

| ID | Feature | 목적 | 선행 조건 | 처리 방식 |
| --- | --- | --- | --- | --- |
| F1 | `docs-shell` | 레이아웃, 네비게이션, 공통 docs shell | 없음 | 상위 package 안에서 full planning |
| F2 | `planning-content-migration` | planning 페이지와 command 상세 페이지 전환 | F1 | 상위 package 안에서 full planning |
| F3 | `runtime-tabs-and-matrices` | Claude/Codex 탭과 비교 표 | F1, F2 | interaction requirement로 포함 |
| F4 | `pipeline-example-pages` | 이번 웹사이트 작업을 pipeline example로 설명 | F1, F2 | content requirement로 포함 |
| F5 | `vercel-preview-safety` | build와 preview 안전성 | F1-F4 | verification/release checklist로 포함 |
| F6 | `guide-sync` | `docs/guide`, `docs/meta-tooling`, README 후속 동기화 | F1-F5 | handoff로 분리 |

## 의존성 매트릭스

| Feature | F1 | F2 | F3 | F4 | F5 | F6 |
| --- | --- | --- | --- | --- | --- | --- |
| F1 `docs-shell` | - | before | before | before | before | before |
| F2 `planning-content-migration` | after | - | before | before | before | before |
| F3 `runtime-tabs-and-matrices` | after | after | - | parallel | before | before |
| F4 `pipeline-example-pages` | after | after | parallel | - | before | before |
| F5 `vercel-preview-safety` | after | after | after | after | - | before |
| F6 `guide-sync` | after | after | after | after | after | - |

## Feature idea brief

### F1 `docs-shell`

- **문제**: 정적 HTML 페이지는 장기 확장과 탐색이 어렵다.
- **사용자 가치**: 안정적인 landing, sidebar, page layout을 제공한다.
- **범위**: Next.js app shell, navigation model, 기본 styling.
- **리스크**: 문서가 아니라 marketing landing page처럼 보일 수 있다.

### F2 `planning-content-migration`

- **문제**: planning 페이지가 있지만 웹사이트식 깊은 탐색 구조가 부족하다.
- **사용자 가치**: 각 command의 입력, 산출물, 위치를 자세히 볼 수 있다.
- **범위**: planning index와 command detail pages.
- **리스크**: 전환 중 콘텐츠 누락 가능성.

### F3 `runtime-tabs-and-matrices`

- **문제**: Claude와 Codex 동작이 혼동될 수 있다.
- **사용자 가치**: runtime 차이를 탭과 표로 명확히 확인한다.
- **범위**: tab component, capability matrix, 비교 표.
- **리스크**: 탭이 중요한 제약을 숨길 수 있다.

### F4 `pipeline-example-pages`

- **문제**: 사용자는 command 설명뿐 아니라 실제 실행 예시가 필요하다.
- **사용자 가치**: 웹사이트 구현 과정 자체를 재사용 가능한 예시로 본다.
- **범위**: example pages와 pipeline artifact 설명.
- **리스크**: 실행 로그가 약하면 예시 페이지가 오해를 만든다.

### F5 `vercel-preview-safety`

- **문제**: Next.js 추가가 package/build 전제에 영향을 줄 수 있다.
- **사용자 가치**: preview 중심으로 안전하게 검증한다.
- **범위**: build, route smoke, protected path diff, preview handoff.
- **리스크**: production 배포를 너무 일찍 진행할 수 있다.

### F6 `guide-sync`

- **문제**: 웹사이트가 생긴 뒤 기존 guide 문서와 드리프트가 생길 수 있다.
- **사용자 가치**: 후속 동기화 대상이 명확해진다.
- **범위**: handoff 목록만 작성.
- **리스크**: 관련 없는 문서까지 scope creep이 생길 수 있다.
