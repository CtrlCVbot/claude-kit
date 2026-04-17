# Guide Impact Audit

> conversion 기준으로 봤을 때 `docs/guide`에서 손봐야 할 문서를 정리하는 문서

## 목적

conversion 기준 문서가 굳어진 뒤 guide 반영이 필요해질 문서를 미리 분류한다.

## 판정 기준

| 상태 | 의미 |
|------|------|
| `needs-update` | conversion pilot 전에 설명 수정 필요 |
| `follow-up` | pilot 후 실제 결과 반영이 필요 |
| `aligned` | 현재 기준과 크게 충돌하지 않음 |

## 우선 수정 대상

| 문서 | 상태 | 이유 |
|------|------|------|
| `docs/guide/09-architecture.md` | `needs-update` | legacy Codex 설명과 path-copy 사고가 남아 있음 |
| `docs/guide/10-glossary.md` | `needs-update` | conversion-first vocabulary가 없음 |
| `docs/guide/00-overview.md` | `needs-update` | 1차 목표가 migration이라는 점이 약함 |
| `docs/guide/03-screening.md` | `needs-update` | conversion 관련 링크와 참조 정리 필요 |
| `docs/guide/08-dev-workflow.md` | `follow-up` | dev pilot 결과 반영 필요 |
| `docs/guide/01-planning-pipeline.md` | `follow-up` | plan pilot 결과 반영 필요 |

## 이번 세트에서 잠그는 메시지

- 1차 목표는 create-time이 아니라 existing-source conversion이다.
- `src/codex`는 installer 출력이 아니라 conversion-generated authoring source다.
- `hooks`, `subagents`, `AGENTS.md`는 Claude 직접 복사가 아니라 Codex surface 재표현 결과다.

## 결과 사용법

- 이 문서는 guide를 지금 수정하는 작업 문서가 아니다.
- pilot과 bulk conversion이 끝난 뒤 어떤 guide를 어떤 순서로 반영할지의 입력으로 사용한다.
