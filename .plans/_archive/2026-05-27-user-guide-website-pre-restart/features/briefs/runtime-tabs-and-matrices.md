# Feature Idea Brief: runtime-tabs-and-matrices

- **Epic**: `EPIC-20260527-001`
- **권장 시작점**: `/plan-prd`
- **idea/screen**: lightweight

## 문제

기획 페이지에서 Claude와 Codex가 어떤 agent, skill, hook, rule을 사용하는지 텍스트만으로는 비교하기 어렵다.

## 사용자 가치

사용자는 Claude/Codex 탭을 전환하면서 각 runtime의 기능 차이와 공통 산출물 흐름을 이해할 수 있다.

## 범위

포함: `RuntimeTabs`, capability matrix, artifact flow, 접근성 있는 tab UI.

제외: Codex 기능 source 변경, 실제 agent/skill 구현 변경.

## 리스크

Codex 기능 설명이 현재 source와 어긋날 수 있으므로 `src/codex`와 `.agents/skills` 참조를 별도 검증해야 한다.

