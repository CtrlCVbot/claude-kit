# P4 `/plan-prd`: User Guide Website PRD

- **Feature**: `user-guide-website`
- **Status**: complete
- **Owner**: docs website workstream

## 1. 문제 정의

정적 HTML 가이드는 이미 존재하지만 페이지가 늘어날수록 navigation, route, reusable UI, 검증, 배포 흐름을 유지하기 어렵다. 또한 사용자가 `claude-kit` 파이프라인을 실제 프로젝트에 어떻게 적용하는지 보기 어렵다.

## 2. 목표

Next.js 기반 문서 웹사이트를 만들어 `claude-kit`의 기획/개발 파이프라인을 실제 사용 가이드처럼 제공한다. 동시에 이 웹사이트 구현 과정을 예시 문서로 남긴다.

## 3. 비목표

- `src/claude`, `src/codex` 기능 변경
- installer 또는 setup emitter 변경
- Production 배포
- 인증, CMS, 검색 인덱싱
- 기존 HTML reference 삭제

## 4. 사용자

| 사용자 | 니즈 |
| --- | --- |
| `claude-kit` 신규 사용자 | 어떤 명령을 어떤 순서로 쓰는지 알고 싶다. |
| maintainer | 문서와 구현이 어떤 산출물로 이어지는지 확인하고 싶다. |
| Claude/Codex 병행 사용자 | 두 runtime의 기능 차이와 사용 자산을 구분하고 싶다. |

## 5. 기능 요구사항

| ID | 요구사항 | Acceptance Criteria |
| --- | --- | --- |
| FR-01 | 문서 홈 제공 | `/` route가 렌더링되고 빠른 시작, 원칙, 주요 링크를 제공한다. |
| FR-02 | planning index 제공 | `/planning` route가 P1~A1 흐름과 command 상세 링크를 제공한다. |
| FR-03 | command 상세 제공 | `/planning/[slug]`가 `/plan-epic` 포함 모든 planning command를 제공한다. |
| FR-04 | Claude/Codex 탭 제공 | command 상세에서 target별 runtime 설명을 탭으로 볼 수 있다. |
| FR-05 | lifecycle/reference 제공 | `/planning/lifecycle`, `/planning/reference` route가 존재한다. |
| FR-06 | 실행 예시 제공 | `/examples/[slug]` route가 이번 웹사이트 작업을 예시로 설명한다. |
| FR-07 | 실행 로그 연결 | `execution-log.md`가 실제 진행 기록과 검증 evidence를 남긴다. |

## 6. 비기능 요구사항

| ID | 요구사항 | Acceptance Criteria |
| --- | --- | --- |
| NFR-01 | 비회귀 | protected path 변경이 없어야 한다. |
| NFR-02 | 빌드 가능성 | `pnpm docs:build`가 통과해야 한다. |
| NFR-03 | 기존 테스트 보존 | `pnpm test`가 통과해야 한다. |
| NFR-04 | route smoke | 주요 route가 HTTP 200으로 응답해야 한다. |
| NFR-05 | 접근성 기본 | 탭은 button/role/aria 속성을 사용해야 한다. |
| NFR-06 | 보존성 | `docs/user-guide-html`은 삭제하지 않는다. |

## 7. Content parity 요구사항

1차 구현은 route와 구조를 우선한다. 다만 최종 품질 기준에서는 기존 HTML의 다음 상세 섹션을 command 상세에 반영해야 한다.

- 실행 예시
- Claude/Codex asset table
- Runtime Flow
- Output Lifecycle
- Rules and Guards
- Failure Modes
- Next Step

## 8. 리스크

| 리스크 | 수준 | 대응 |
| --- | --- | --- |
| Next.js build가 기존 toolkit source를 lint 대상으로 잡음 | high | docs build에서 lint를 분리하고 별도 lint 정책을 후속으로 둔다. |
| HTML 상세 내용 누락 | medium | content parity 작업을 후속 Feature로 분리한다. |
| package publish 범위 혼선 | medium | `files` 정책과 docs site 포함 여부를 후속 검토한다. |

## 9. 완료 기준

- Next.js route shell이 구현된다.
- planning command 상세가 모두 접근 가능하다.
- `/plan-epic`이 빠지지 않는다.
- 실행 로그와 검증 evidence가 기록된다.
- protected path 변경이 없다.

