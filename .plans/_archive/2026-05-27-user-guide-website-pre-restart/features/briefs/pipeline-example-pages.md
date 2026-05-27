# Feature Idea Brief: pipeline-example-pages

- **Epic**: `EPIC-20260527-001`
- **권장 시작점**: `/plan-draft`
- **idea/screen**: full

## 문제

사용자는 명령 목록만 봐서는 실제 프로젝트가 `claude-kit` pipeline으로 어떻게 끝까지 진행되는지 감을 잡기 어렵다.

## 사용자 가치

이번 웹사이트 전환 작업 자체를 예시로 보여주면, idea부터 implementation, review, commit까지 이어지는 실제 흐름을 따라 할 수 있다.

## 범위

포함: pipeline overview, Epic 분해, 산출물 위치, 실행 프롬프트 예시, 진행 로그 요약 route.

제외: 모든 내부 로그의 전문 공개, Production 배포 로그.

## 리스크

예시가 실제 작업과 다르면 신뢰도가 떨어지므로 `docs/plans/user-guide-website/execution-log.md`와 동기화해야 한다.

