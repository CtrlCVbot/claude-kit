# Feature Idea Brief: planning-content-migration

- **Epic**: `EPIC-20260527-001`
- **권장 시작점**: `/plan-draft`
- **idea/screen**: full

## 문제

`docs/user-guide-html/planning/*.html`의 상세 정보가 정적 HTML에 묶여 있어 Next.js route와 component로 재사용하기 어렵다.

## 사용자 가치

사용자는 `/plan-idea`, `/plan-epic`, `/plan-prd` 같은 각 명령의 목적, 사용 기능, 산출물, 이동 규칙을 한 페이지에서 확인할 수 있다.

## 범위

포함: planning index, lifecycle, reference, `plan-*` 상세 페이지의 content data 전환.

제외: 원본 HTML 삭제, command source 변경, installer 변경.

## 리스크

콘텐츠 누락 가능성이 높으므로 HTML parity checklist와 route coverage table이 필요하다.

