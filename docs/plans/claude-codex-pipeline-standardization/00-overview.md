# Overview

> 상태: 계획 초안
> 범위: docs-only

## 문제 정의

현재 `claude-kit`은 Claude Code와 Codex를 모두 지원한다. 하지만 파이프라인을 실제 프로젝트에 적용할 때 다음 흐름이 AI별, 프로젝트별로 달라질 수 있다.

| 문제 영역 | 현재 증상 | 사용자 영향 |
| --- | --- | --- |
| 파일 생성 위치 | `.plans/**`, `.claude/**`, `.agents/**`, `.codex/**`, `plugins/**`가 역할별로 섞여 보인다 | 어디를 수정해야 하는지 혼란 |
| 날짜와 파일명 | `YYYYMMDD`, `YYYY-MM-DD`, `{slug}`, `{KEY}`, `{NNN}`가 artifact별로 흩어져 있다 | 같은 산출물도 AI마다 다른 이름으로 생성될 수 있음 |
| 승인 전/후 이동 | `00-inbox`, `10-screening`, `20-approved`, `30-on-hold`, `90-archive` vocabulary가 일부 불일치 | 승인 상태와 실제 위치가 어긋날 수 있음 |
| Epic 계층 누락 | 여러 Feature를 묶는 `plan-epic` 흐름이 P1~P8 설명에서 빠질 수 있다 | 상위 목표, Phase, child Feature 관계가 pipeline 밖으로 밀림 |
| 변경 반영 | review, revise, improve, archive가 단계별로 존재하지만 공통 lifecycle 문서가 부족하다 | 변경 요청이 draft 수정인지 새 개선요청인지 판단하기 어려움 |
| Claude/Codex 경계 | Codex direct-use, plugin output, AGENTS fallback, hook portability가 동시에 존재한다 | generated output을 source처럼 수정할 위험 |
| 검증 기준 | dry-run, hook compat, registry audit, docs check가 목적별로 흩어져 있다 | 완료 판정이 AI마다 달라질 수 있음 |

## 목표

Claude Code와 Codex가 같은 `claude-kit` 파이프라인을 사용하더라도 다음 규칙이 고정되도록 한다.

| 목표 | 설명 |
| --- | --- |
| 파일 생성 규칙 고정 | 어떤 단계에서 어떤 경로에 파일이 생기는지 정한다 |
| 날짜/파일명 규칙 고정 | 날짜 확인 방식, 표기 형식, ID와 slug 채번 방식을 정한다 |
| 승인 lifecycle 고정 | 초안, 검토, 승인, 보류, 반려, 완료, 아카이브 상태를 분리한다 |
| Epic/Feature/Task 계층 고정 | Epic을 opt-in 상위 계층으로 두고 Feature pipeline과 연결한다 |
| 변경 반영 규칙 고정 | 수정 요청, 개선 요청, 재진입, dev-only 변경을 구분한다 |
| AI별 책임 분리 | Claude Code 전용 자산과 Codex 전용 자산을 명확히 나눈다 |
| source/generated 구분 | authoring source와 generated output을 헷갈리지 않게 한다 |
| 검증 기준 통합 | 문서, registry, emitter, generated output 확인 명령을 연결한다 |

## 범위

이번 문서 패키지는 다음을 다룬다.

| 포함 | 설명 |
| --- | --- |
| 현재 구조 파악 | `AGENTS.md`, `.claude/**`, `.agents/**`, `.codex/**`, `plugins/**`, `src/**`, `scripts/**`, `docs/**` 확인 |
| lifecycle 표준안 | 생성, 초안, 검토, 승인, 변경, 완료, 아카이브 단계 정의 |
| 날짜/파일명 표준안 | 날짜 계산, timezone, 파일명 패턴, ID 순번 규칙 정의 |
| cross-AI 규칙 | Claude Code와 Codex가 공통으로 따라야 할 규칙 정리 |
| 마이그레이션 계획 | 현재 불일치를 단계적으로 정리하는 계획 작성 |
| 리스크 | 경로 불일치, generated output 직접 수정, hook portability 차이 정리 |

## 이번 작업에서 하지 않는 것

| 제외 | 이유 |
| --- | --- |
| `src/**` 수정 | 이번 단계는 계획 수립이다 |
| `scripts/setup.js` 수정 | emitter 변경은 별도 구현 작업으로 분리한다 |
| `.claude/**`, `.agents/**`, `.codex/**`, `plugins/**` 수정 | generated/runtime output은 primary fix path가 아니다 |
| 실제 `.plans/**` fixture 생성 | 소비자 프로젝트 검증은 다음 단계에서 별도 fixture로 진행한다 |
| 커밋 생성 | 사용자가 별도로 요청하지 않았다 |

## 용어

| 용어 | 뜻 |
| --- | --- |
| source of truth | 실제 기준이 되는 원본 파일이다. 여기서는 주로 `src/**`, `src/templates/**`, registry 파일이다 |
| generated output | source를 바탕으로 생성된 결과물이다. 직접 고치면 다음 생성 때 덮일 수 있다 |
| lifecycle | 산출물이 생성되어 승인, 변경, 완료, 아카이브되는 전체 흐름이다 |
| direct-use | Codex가 plugin 설치 없이 직접 읽을 수 있게 생성되는 `.agents/skills/**`, `.codex/agents/*.toml` 같은 자산이다 |
| plugin output | Codex plugin으로 노출하기 위해 `plugins/claude-kit/**`에 생성되는 자산이다 |
| portability | Claude 자산을 Codex에서도 같은 의미로 쓸 수 있는지에 대한 호환성이다 |

## 근거 파일

| 파일 | 확인한 내용 |
| --- | --- |
| `profile.json` | active domains는 `core`, `dev`, `plan`, `copy`, active targets는 `claude`, `codex` |
| `scripts/setup.js` | source assets를 읽어 Claude output과 Codex output을 생성 |
| `.claude-kit-meta.json` | 현재 설치 버전, generated output 목록, direct-use manifest |
| `src/pairing-registry.json` | Claude/Codex 자산 pairing 상태 |
| `src/exception-registry.json` | Codex conversion 예외와 승인된 fallback 전략 |
| `src/codex/plan/commands/*.md` | `.plans/**` 단계별 생성/승인/이동 규칙 |
| `src/codex/copy/commands/*.md` | evidence, gap, verify, closeout 흐름 |
