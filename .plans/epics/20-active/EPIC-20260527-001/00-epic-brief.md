# EPIC-20260527-001: `claude-kit` 사용자 가이드 웹사이트

- **상태**: active
- **상위 아이디어**: `IDEA-20260527-001`
- **생성일**: 2026-05-27
- **프롬프트 출처**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#3-p25-plan-epic`

## 목표

기존 `docs/user-guide-html/**` 가이드를 Next.js 문서 웹사이트로 제공하고, 그 구현 과정을 `claude-kit` 파이프라인 예시로 문서화한다.

## Epic이 필요한 이유

| 기준 | 해당 여부 |
| --- | --- |
| 3개 이상 Feature | 6개 child feature가 필요하다. |
| 공통 요구사항 | protected path guard, build safety, content parity, accessibility가 여러 Feature에 걸친다. |
| 명시적 순서 | shell -> content -> example -> build safety -> handoff 순서가 필요하다. |

## 범위

| 포함 | 제외 |
| --- | --- |
| Next.js docs routes | production Vercel 배포 |
| planning command 상세 페이지 | 핵심 command/agent/skill 동작 변경 |
| 파이프라인 예시 페이지 | installer 변경 |
| build/link/protected-path 검증 | `src/claude`, `src/codex` runtime 변경 |

## 성공 기준

| 기준 | 목표 |
| --- | --- |
| 주요 route | Home, planning, command details, lifecycle, reference, examples |
| 파이프라인 추적성 | 모든 단계에 file-backed artifact 존재 |
| Build | `pnpm docs:build` 통과 |
| 비회귀 | protected path 변경 없음 |

## 주요 리스크

| 리스크 | 대응 |
| --- | --- |
| 파이프라인 문서가 형식적으로만 남음 | 단계별 skill, prompt, artifact, verification, review를 강제한다. |
| 웹사이트 작업이 core runtime을 침범 | protected path review와 diff check를 수행한다. |
| HTML 콘텐츠 누락 | HTML inventory와 route/source mapping으로 확인한다. |
| Next.js build가 package 소비자에게 영향 | docs 전용 script로 분리하고 postinstall 동작은 바꾸지 않는다. |
