# claude-kit 문서

> **Status**: 재구축 완료 (P1–P6, 2026-04-17)
>
> 31개 문서 드래프트 + reference 6개 자동 생성. 세부 검증·폴리싱은 운영 중 지속.
> 재구축 이력: [plan/documentation-package-plan.md](plan/documentation-package-plan.md)

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

## 🔗 주요 진입점

- [00-overview/01-what-is-claude-kit.md](00-overview/01-what-is-claude-kit.md) — 프로젝트 정체성
- [20-user-guide/01-installation.md](20-user-guide/01-installation.md) — 설치
- [20-user-guide/03-first-run.md](20-user-guide/03-first-run.md) — 설치 직후 10분
- [../README.md](../README.md) — 패키지 개요
- [../CHANGELOG.md](../CHANGELOG.md) — 릴리스 이력 (Keep a Changelog 형식)
- [../CLAUDE.md](../CLAUDE.md) — Claude 런타임 컨텍스트
- [archive/2026-04-17/README.md](archive/2026-04-17/README.md) — 이전 설계 이력

## ✅ 재구축 완료 (2026-04-17)

| Phase | 산출 | 상태 |
|-------|------|------|
| P0. 계획 승인 | [plan/documentation-package-plan.md](plan/documentation-package-plan.md) | ✅ 완료 |
| P1. Archive freeze | [archive/2026-04-17/](archive/2026-04-17/) | ✅ 완료 |
| P2. Scaffold | 본 문서 + 30 placeholders | ✅ 완료 |
| P3. Generator | [`scripts/docs-generate.js`](../scripts/docs-generate.js) | ✅ 완료 |
| P4. Content draft | 31개 문서 전부 드래프트 | ✅ 완료 |
| P5. Review & polish | 링크 검증, generator 보정 | ✅ 완료 |
| P6. Cutover | docs/guide → archive 이동, 루트 README 갱신 | ✅ 완료 |

## 📜 정책

- 모든 내부 링크는 **상대 경로** 사용
- 각 문서는 **400 lines 이하** 유지
- 각 문서 상단에 `Status` / `Source` / `Method` 명시
- 코드/명령어/경로는 영문 그대로, 본문은 한국어 우선

## 기여

기여 절차와 표준은 [40-contributing/](40-contributing/) 참조:
- [개발 환경](40-contributing/01-development-setup.md)
- [컴포넌트 추가](40-contributing/02-adding-a-component.md)
- [도메인 작성](40-contributing/03-domain-authoring.md)
- [릴리스 체크리스트](40-contributing/04-release-checklist.md)
- [품질 게이트](40-contributing/05-quality-gates.md)
