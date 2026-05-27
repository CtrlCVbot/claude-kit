# Domain Logic: user-guide-website

## Domain Concepts

| 개념 | 의미 |
| --- | --- |
| Docs route | Next.js 문서 사이트의 사용자-facing page |
| Planning command page | 하나의 `claude-kit` planning command를 설명하는 route |
| Runtime comparison | Claude/Codex별 설명을 tab 또는 matrix로 보여주는 영역 |
| Pipeline evidence | 작업이 파이프라인을 따랐음을 보여주는 prompt, artifact, verification, review 기록 |

## 규칙

| 규칙 | 요구사항 |
| --- | --- |
| Content source rule | Planning page는 `docs/user-guide-html/**`와 `.plans/**`에 추적 가능해야 한다. |
| Runtime rule | Codex가 Claude slash command를 직접 지원한다고 암시하지 않는다. |
| Pipeline rule | 산출물이 없으면 해당 단계를 실행했다고 주장하지 않는다. |
| Safety rule | 웹사이트 작업으로 protected core path를 수정하지 않는다. |
