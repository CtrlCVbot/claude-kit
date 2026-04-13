# Claude Codex Diff Matrix

> Claude 기능과 Codex 기능의 차이, 변환 난이도, 수동 보정 필요 영역을 정리하는 문서

## 단계 위치

- 실행 단계: `3단계-c`
- 선행 조건: `10`, `11`
- 후속 문서: `13`, `15`

## 목적

같은 identity라도 Claude와 Codex는 runtime surface와 안전 계약이 다르다.  
이 문서는 conversion tooling이 어디까지 자동화할 수 있고, 어디서 사람이 개입해야 하는지 분명히 한다.

## kind별 차이

| kind | Claude 형태 | Codex 형태 | 주요 차이 | 난이도 |
|------|-------------|------------|-----------|--------|
| `agent` | markdown subagent prompt | `.toml` custom subagent | trigger, model, sandbox, instruction 구조 차이 | `medium` |
| `command` | markdown command entry | `SKILL.md` | slash-like entry를 skill UX로 재표현해야 함 | `medium` |
| `skill` | `SKILL.md` | `SKILL.md` | 구조는 비슷하나 Codex phrasing/entry 정렬 필요 | `low` |
| `hook` | JS 중심 + Claude settings 등록 | `JS + .hook.json` | runtime config source 분리 필요 | `medium` |
| `instruction-rule` | markdown guidance | `AGENTS.md` synthesis | file copy가 아니라 문서 합성 | `low` |

## 자동화 가능한 부분

- path 생성
- 기본 템플릿 주입
- identity/도메인 유지
- hook companion 생성
- write-capable subagent contract 스캐폴딩

## 수동 보정이 필요한 부분

- write-heavy subagent의 write boundary 조정
- command를 Codex skill UX로 바꿀 때 wording 정리
- long-form agent를 Codex subagent instruction으로 압축
- unsupported hook의 `codex-skip` 확정
- `AGENTS.md` synthesis 품질 검토

## 수동 보정 우선순위

| 우선순위 | 항목 |
|----------|------|
| 높음 | write-capable `agent` |
| 높음 | unsupported/ambiguous `hook` |
| 중간 | workflow-heavy `command` |
| 낮음 | structural `skill` |
| 낮음 | `instruction-rule` synthesis |

## 구현자가 기억할 원칙

- conversion은 1:1 copy가 아니라 Codex surface 재표현이다.
- 자동 생성된 `src/codex` source는 초안일 수 있다.
- `needs manual review`가 붙은 항목은 validate 통과만으로 완료로 보지 않는다.

## 완료 기준

- 어떤 kind가 얼마나 자동화 가능한지 설명된다.
- pilot에서 사람이 먼저 봐야 할 고위험 자산이 분명해진다.
- `13`에서 tooling 책임을 나눌 수 있을 정도로 차이점이 정리된다.
