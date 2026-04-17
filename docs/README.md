# claude-kit 문서

> **Status**: 재구축 진행 중 (Phase 2 scaffold 완료, 2026-04-17)
>
> 이 디렉터리는 최종 문서 패키지의 뼈대입니다. 실제 콘텐츠는 [documentation-package-plan.md](plan/documentation-package-plan.md) Phase 4 이후 순차 작성됩니다.

## 📖 읽기 순서

처음 접하는 경우 다음 순서로 읽는 것을 권장합니다.

1. [00-overview/](00-overview/) — 프로젝트가 무엇이고, 왜 존재하는지
2. [20-user-guide/](20-user-guide/) — 설치하고 사용하는 법
3. [10-features/](10-features/) — 기능별 상세 설명
4. [30-reference/](30-reference/) — 커맨드·에이전트·스킬·훅 카탈로그
5. [40-contributing/](40-contributing/) — 기여·확장 가이드

## 🗂 디렉터리 구조

| 섹션 | 내용 | 핵심 대상 독자 |
|------|------|--------------|
| [00-overview/](00-overview/) | 정체성, 개념, 아키텍처, 설계 결정 | 모든 사용자 |
| [10-features/](10-features/) | 도메인별 기능 카탈로그 (core, dev, plan, multi-target, guards) | 기능을 깊이 이해하려는 사용자 |
| [20-user-guide/](20-user-guide/) | 설치 → 설정 → 실행 → 트러블슈팅 | 실사용자 |
| [30-reference/](30-reference/) | 전체 목록 (커맨드, 에이전트, 스킬, 훅, 규칙, 설정, pairing, 스크립트) | 레퍼런스 조회 |
| [40-contributing/](40-contributing/) | 기여자를 위한 가이드 | 기여자 |
| [archive/2026-04-17/](archive/2026-04-17/) | 재구축 이전의 설계·리뷰 이력 | 이력 참조 |
| [plan/](plan/) | 문서 재구축 계획서 | 유지보수 |

## 🔗 주요 진입점 (현행)

재구축이 완료되기 전까지는 다음 원본 문서를 우선 참조하세요.

- [../README.md](../README.md) — 패키지 개요, 설치
- [../CLAUDE.md](../CLAUDE.md) — Claude 런타임 컨텍스트
- 아카이브 진입점: [archive/2026-04-17/README.md](archive/2026-04-17/README.md)

## 🚧 재구축 상태

| Phase | 산출 | 상태 |
|-------|------|------|
| P0. 계획 승인 | [plan/documentation-package-plan.md](plan/documentation-package-plan.md) | ✅ 완료 |
| P1. Archive freeze | [archive/2026-04-17/](archive/2026-04-17/) | ✅ 완료 |
| P2. Scaffold | 본 문서 + 30 placeholders | 🔄 진행 중 |
| P3. Generator | `scripts/docs-generate.js` | ⏳ 대기 |
| P4. Content draft | 각 섹션 실제 콘텐츠 | ⏳ 대기 |
| P5. Review & polish | 링크·용어 일관성, 시범 온보딩 | ⏳ 대기 |
| P6. Cutover | 루트 README/CLAUDE.md 링크 갱신 | ⏳ 대기 |

## 📜 정책

- 모든 내부 링크는 **상대 경로** 사용
- 각 문서는 **400 lines 이하** 유지
- 각 문서 상단에 `Status` / `Source` / `Method` 명시
- 코드/명령어/경로는 영문 그대로, 본문은 한국어 우선

## 기여

문서 재구축 진행 기여 또는 제보는 [40-contributing/](40-contributing/) 참조 (Phase 4 작성 예정).
