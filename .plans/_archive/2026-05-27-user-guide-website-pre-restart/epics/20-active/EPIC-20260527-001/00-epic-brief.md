# EPIC-20260527-001: claude-kit 사용자 가이드 문서 웹사이트화

- **상태**: active
- **Parent idea**: `IDEA-20260527-001`
- **시작일**: 2026-05-27
- **목표 배포**: Vercel Preview 우선
- **핵심 제약**: `claude-kit` core 기능 비회귀

## 목표

`docs/user-guide-html`의 기존 사용자 가이드와 이번 전환 과정을 Next.js 기반 문서 웹사이트로 제공한다.

웹사이트는 `claude-kit`의 핵심 기능이 아니라 docs surface다. 따라서 기획, 개발, 검증, 배포 예시는 자세히 보여주되 `src/claude`, `src/codex`, installer, runtime output 같은 핵심 자산은 건드리지 않는다.

## 성공 기준

| 영역 | 성공 기준 |
| --- | --- |
| 문서 탐색 | 홈, planning index, command 상세, lifecycle, reference, example route가 연결된다. |
| 콘텐츠 보존 | 기존 HTML 가이드의 핵심 정보가 Next.js 문서 구조에 누락 없이 반영된다. |
| 예시화 | 이 웹사이트 전환 과정 자체가 `claude-kit` pipeline 예시로 문서화된다. |
| 안전성 | protected path 변경이 없고, 변경 범위가 docs website surface에 갇힌다. |
| 검증 | local build, route/link smoke, protected path diff 확인을 통과한다. |

## 범위

포함 범위는 Next.js 문서 shell, planning content migration, Claude/Codex runtime 탭과 matrix, pipeline example pages, Preview 검증 준비, 후속 guide sync다.

제외 범위는 Production 배포, 인증/CMS, installer 변경, `src/claude`/`src/codex` 기능 변경, `.claude`/`.agents` runtime output 수정이다.

## 주요 리스크

| 리스크 | 대응 |
| --- | --- |
| 웹사이트 구현이 package publish 범위와 섞임 | package config 영향과 `files` 정책을 별도 검토한다. |
| HTML 대비 정보 누락 | route coverage와 HTML parity checklist를 만든다. |
| 예시 페이지가 실제 작업과 불일치 | `execution-log.md`에 단계별 실제 진행 로그를 남긴다. |
| 의존성 추가로 기존 테스트 영향 | 의존성 변경 커밋을 분리하고 `pnpm test`와 build를 실행한다. |

## 마일스톤

| Wave | 목표 | 완료 조건 |
| --- | --- | --- |
| Wave 1 | Planning artifacts | idea, screening, epic, feature brief, execution log 생성 |
| Wave 2 | Docs shell | Next.js shell과 기본 route 구성 |
| Wave 3 | Content migration | planning 문서 상세 route와 탭형 UI 구성 |
| Wave 4 | Example docs | pipeline 실행 예시와 산출물 흐름 페이지 추가 |
| Wave 5 | Safety validation | build/link/protected path 검증과 후속 문서 반영 |

