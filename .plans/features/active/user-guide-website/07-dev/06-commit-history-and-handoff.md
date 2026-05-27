# D2 Commit History And Handoff

- **Feature**: `user-guide-website`
- **Purpose**: 구현 관련 커밋과 후속 handoff를 정리한다.
- **Status**: complete

## 관련 커밋

| Commit | 유형 | 내용 |
| --- | --- | --- |
| `310036a` | docs | 사용자 가이드 웹사이트 계획 정리 |
| `536d717` | docs | 사용자 가이드 HTML 문서 추가 |
| `6f4f4ba` | docs | 사용자 가이드 웹사이트 실행 계획 추가 |
| `f26d6a2` | feat | 사용자 가이드 Next.js 문서 사이트 추가 |
| `835e42c` | docs | 사용자 가이드 사이트 검증 로그 추가 |
| `7deab8f` | docs | 사용자 가이드 파이프라인 산출물 복구 |

## 구현 커밋 상세

### `f26d6a2 feat: 사용자 가이드 Next.js 문서 사이트 추가`

| 변경 영역 | 내용 |
| --- | --- |
| Config | Next.js, React, TypeScript 의존성과 docs scripts 추가 |
| App routes | home, planning, command detail, lifecycle, reference, examples |
| Components | docs shell, header, grid, runtime tabs, command page template |
| Data | planning command data, examples, navigation |
| Style | warm docs theme global CSS |

### `835e42c docs: 사용자 가이드 사이트 검증 로그 추가`

| 변경 영역 | 내용 |
| --- | --- |
| Verification evidence | lockfile, test, build, route smoke, protected path 결과 기록 |
| Route smoke list | 21개 route 확인 목록 기록 |

### `7deab8f docs: 사용자 가이드 파이프라인 산출물 복구`

| 변경 영역 | 내용 |
| --- | --- |
| Pipeline recovery | P3~A1 checkpoint까지 `.plans` 산출물 복구 |
| Review | plan/dev review와 archive readiness 추가 |

## Handoff 상태

| 항목 | 상태 | 다음 담당 |
| --- | --- | --- |
| 1차 Next.js shell | 완료 | content parity 작업자 |
| Planning command summary data | 완료 | content parity 작업자 |
| 기존 HTML 상세 반영 | 남음 | content migration 작업자 |
| Vercel Preview evidence | 남음 | preview safety 작업자 |
| guide/meta docs sync | 남음 | guide sync 작업자 |

## 후속 작업 권장 순서

1. `planning-content-migration` Feature를 열어 기존 HTML 상세 내용을 command data model에 반영한다.
2. `vercel-preview-safety` Feature를 열어 Preview deployment 또는 preview-ready checklist를 만든다.
3. `guide-sync` Feature에서 기존 Markdown 문서와 새 웹사이트 안내를 정렬한다.
4. 남은 gap이 닫히면 `/plan-archive EPIC-20260527-001`을 실행한다.

