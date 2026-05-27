# HTML Guide Inventory

## 목적

현재 `docs/user-guide-html/`에 있는 HTML 문서를 Next.js 문서 사이트로 옮기기 전에, 입력 산출물의 범위와 역할을 고정한다.

이 문서는 구현 목록이 아니라 migration 기준표다. 어떤 페이지가 있고, 어떤 정보 구조를 보존해야 하며, 어떤 UI 패턴을 컴포넌트로 분리할지 결정하기 위한 자료다.

## 파일 현황

| 영역 | 파일 수 | 설명 |
| --- | ---: | --- |
| 루트 HTML/CSS/계획 메모 | 4 | 홈, 스타일, 기존 구현 계획 메모 |
| planning 상세 HTML | 16 | 파이프라인 index, lifecycle, reference, 개별 command 페이지 |
| 전체 확인 대상 | 20 | Next.js migration 입력으로 보존 |

## 루트 파일

| 파일 | 역할 | Next.js 전환 후보 |
| --- | --- | --- |
| `docs/user-guide-html/index.html` | 전체 가이드 홈 | `/` 또는 `/docs` |
| `docs/user-guide-html/styles.css` | 현재 디자인 토큰과 컴포넌트 스타일 | `src/app/globals.css`, docs CSS module, design tokens |
| `docs/user-guide-html/implementation-plan.md` | 기존 HTML 구현 계획 | planning package 참고 자료 |
| `docs/user-guide-html/planning-detail-expansion-plan.md` | planning 상세 확장 계획 | planning package 참고 자료 |

## Planning 페이지

| 파일 | 현재 역할 | Next.js route 후보 |
| --- | --- | --- |
| `planning/index.html` | 기획 파이프라인 허브 | `/planning` |
| `planning/lifecycle.html` | 산출물 lifecycle | `/planning/lifecycle` |
| `planning/reference.html` | command/function reference | `/planning/reference` |
| `planning/plan-idea.html` | `/plan-idea` 상세 | `/planning/plan-idea` |
| `planning/plan-screen.html` | `/plan-screen` 상세 | `/planning/plan-screen` |
| `planning/plan-epic.html` | `/plan-epic` 상세 | `/planning/plan-epic` |
| `planning/plan-draft.html` | `/plan-draft` 상세 | `/planning/plan-draft` |
| `planning/plan-prd.html` | `/plan-prd` 상세 | `/planning/plan-prd` |
| `planning/plan-wireframe.html` | `/plan-wireframe` 상세 | `/planning/plan-wireframe` |
| `planning/plan-design.html` | `/plan-design` 상세 | `/planning/plan-design` |
| `planning/plan-stitch.html` | `/plan-stitch` 상세 | `/planning/plan-stitch` |
| `planning/plan-bridge.html` | `/plan-bridge` 상세 | `/planning/plan-bridge` |
| `planning/plan-review.html` | `/plan-review` 상세 | `/planning/plan-review` |
| `planning/plan-revise.html` | `/plan-revise` 상세 | `/planning/plan-revise` |
| `planning/plan-improve.html` | `/plan-improve` 상세 | `/planning/plan-improve` |
| `planning/plan-archive.html` | `/plan-archive` 상세 | `/planning/plan-archive` |

## 보존해야 할 정보 구조

| 구조 | 설명 | 전환 방식 |
| --- | --- | --- |
| 좌측 navigation | 파이프라인 전체 이동 | shared docs sidebar component |
| 본문 heading | Claude Code docs 스타일의 상세 설명 | route별 content section |
| Claude/Codex 탭 | 타깃별 기능 차이 설명 | interactive tab component |
| 산출물 위치 | `.plans`, docs, source 위치 설명 | path card 또는 table component |
| 프로세스 단계 | 생성, 변경, 이동, 검증 흐름 | timeline/step component |
| rules/hooks/skills/subagents 표 | 실행 시 참조되는 기능 목록 | capability matrix component |

## 컴포넌트 후보

| 컴포넌트 | 용도 |
| --- | --- |
| `DocsShell` | 전체 layout, sidebar, mobile navigation |
| `DocsSidebar` | section별 페이지 목록 |
| `DocsToc` | 현재 페이지 heading navigation |
| `RuntimeTabs` | Claude/Codex 탭 전환 |
| `PipelineMap` | 전체 기획 파이프라인 시각화 |
| `CapabilityMatrix` | command별 agents/skills/hooks/rules 정리 |
| `ArtifactFlow` | 산출물 생성, 이동, 변경 흐름 |
| `PathCard` | 파일/폴더 위치 설명 |
| `CommandExample` | 실행 예시와 기대 결과 |
| `SafetyNotice` | 경고, 비범위, 보호 대상 표시 |

## Migration 주의점

| 주의점 | 영향 | 대응 |
| --- | --- | --- |
| HTML이 이미 사용자 확인 대상 | 삭제하면 확인 흐름이 끊김 | 구현 완료 전까지 보존 |
| static path 기준 링크 | Next.js route와 다름 | route map을 별도로 둠 |
| 탭 UI 상태 | 단순 HTML에서 React state로 변경 | 접근성 있는 tab component로 전환 |
| 긴 표와 상세 설명 | 모바일에서 깨질 수 있음 | responsive table/card 패턴 사용 |
| 현재 디자인 호감도 | 전면 재디자인 시 사용성 저하 | 색상/톤은 유지하고 정보 구조를 개선 |

## 1차 결론

현재 HTML 가이드는 폐기 대상이 아니라 Next.js 문서 사이트의 기준 reference다. 1차 구현은 디자인을 다시 만드는 일이 아니라, 이미 검증된 정보 구조를 route, component, content model로 안전하게 옮기는 작업이다.

