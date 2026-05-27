# Feature Idea Brief: docs-shell

- **Epic**: `EPIC-20260527-001`
- **권장 시작점**: `/plan-draft`
- **idea/screen**: full

## 문제

현재 HTML 가이드는 페이지별 문서가 있지만 Next.js 웹사이트로 전환하기 위한 공통 shell, navigation, layout, toc 구조가 없다.

## 사용자 가치

사용자는 홈, planning index, command 상세 페이지로 자연스럽게 이동할 수 있고, maintainer는 이후 문서를 일관된 구조로 추가할 수 있다.

## 범위

포함: `src/app` 기본 route, docs layout, sidebar, toc, 기본 스타일, route metadata.

제외: planning content 전체 migration, Vercel 배포, protected path 변경.

## 리스크

`src/` 아래 구현이 `src/claude`나 `src/codex`와 섞이지 않도록 경로 검증이 필요하다.

