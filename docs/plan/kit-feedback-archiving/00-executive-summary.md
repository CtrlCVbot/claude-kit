---
제목: Executive Summary — Pipeline Feedback Archiving System
작성일: 2026-04-20
대상: 이해관계자 (결정권자)
읽기 소요: 5분
상태: draft
---

# 00 Executive Summary

> **결론**: 파이프라인이 끝날 때마다 **훅 스크립트**가 "claude-kit의 어떤 에이전트/커맨드/Skill이 이번 단계에서 개선이 필요했는가"를 **JSON으로 자동 수집**해 `.claude/feedback-archive/`에 쌓는다. **Codex/Claude 환경 태그**로 구분 추적. 결과는 **지속 개선용 근거 자원**이 된다. 본 시스템은 Phase 3~5에서 구현되며, Phase 2는 설계만 담는다.

---

## 1. 왜 필요한가?

### 1.1 현재 문제

dash-preview-phase3 세션 회고로 **14개 즉각 관찰 + 12개 확장 = 총 26개 개선점**을 수집했다. 그러나 이 과정은:

- **1세션당 1회 수동 회고** 필요 (고비용)
- 회고 에이전트가 놓친 **사건은 손실**
- **Codex/Claude 환경별 차이**가 동일 회고에 섞여 분리 추적 어려움
- 다음 Feature에서 **동일 패턴 재발** 시 데이터가 축적되지 않음

### 1.2 본 시스템의 해결

- **자동 수집**: 파이프라인 단계 종료 시 훅이 JSON 생성 → 사용자 개입 없음
- **손실 방지**: 각 단계별 수집으로 **사건 누락 최소화**
- **환경 분리**: `runtime: "claude" | "codex"` 태그로 차이 추적
- **축적**: 프로젝트 내 `.claude/feedback-archive/` → Git 커밋으로 영구 보존

---

## 2. 시스템 개요

```
┌─────────────────┐      ┌──────────────────────┐      ┌──────────────────┐
│ /plan-* 종료     │──▶  │ feedback-collector   │──▶  │ .claude/         │
│ /copy-* 종료     │      │ hook script          │      │ feedback-archive/│
│ /dev-* 종료      │      │ (runtime 감지 포함) │      │ {env}/{domain}/ │
└─────────────────┘      └──────────────────────┘      └──────────────────┘
                                   │
                                   ▼
                         ┌──────────────────────┐
                         │ feedback-entry.json  │
                         │  - runtime           │
                         │  - command           │
                         │  - agents_used       │
                         │  - issues_observed   │
                         │  - suggestions       │
                         └──────────────────────┘
```

상세: [01-architecture.md](01-architecture.md)

---

## 3. 트리거 범위 (총 약 23개 커맨드)

| 도메인 | 수 | 대상 커맨드 (예시) |
|--------|:-:|-------------------|
| plan | 9 | idea, screen, draft, prd, review, wireframe, stitch, bridge, archive |
| copy | 7 | reference-refresh, visual-review, interaction-review, gap-board, plan-unit, verify, closeout |
| dev | 7 (주요) | architecture, feature, verify, verify-all, verify-fe, commit, commit-push-pr |

상세: [03-trigger-points.md](03-trigger-points.md)

---

## 4. 저장 구조 요약

```
.claude/feedback-archive/
├── index.md                    ← 전체 인덱스 (자동 갱신)
├── claude/                     ← Claude 환경 피드백
│   ├── plan/
│   ├── copy/
│   └── dev/
└── codex/                      ← Codex 환경 피드백
    ├── plan/
    ├── copy/
    └── dev/
```

파일 네이밍: `{YYYYMMDD-HHmmss}-{command}-{slug}.json`

상세: [04-archive-layout.md](04-archive-layout.md)

---

## 5. 듀얼 타깃 제약

Codex harness는 **hooks runtime이 부재** — Claude와 동등 자동 수집 불가.

| 환경 | 수집 방식 | 사용자 개입 |
|------|----------|------------|
| Claude | 훅 스크립트 자동 (Stop hook) | 없음 |
| Codex | fallback artifact — 커맨드 내부에서 suggest 출력 → 사용자가 `/codex-feedback-collect` 실행 | 1회 수동 트리거 |

상세: [05-codex-vs-claude.md](05-codex-vs-claude.md)

---

## 6. 로드맵 연계 (핵심 4건)

| ID | 우선순위 | 연계 |
|----|:-:|------|
| IMP-KIT-007 | P1 | `/plan-review` 자동 후속 = 본 시스템의 **메인 트리거** |
| IMP-KIT-016 | P1 | Checkpoint 자동 진행 = 아카이빙 비차단 |
| IMP-KIT-017 | P1 | 재복제 금지 = 피드백 SSOT |
| IMP-KIT-024 | P2 | 텔레메트리 = 피드백 데이터 수집 기반 |

상세: [06-integration-with-roadmap.md](06-integration-with-roadmap.md)

---

## 7. 예상 효과

| 지표 | 현재 (수동 회고) | 시스템 도입 후 |
|------|:-:|:-:|
| 피드백 수집 빈도 | 1회/세션 | **단계당 1회 (10~20회/세션)** |
| 수집 누락률 | 높음 (체감) | **< 5%** |
| Codex/Claude 분리 추적 | 불가 | **가능** |
| 축적 데이터량 (3개월) | ~5건 | **~300건+ 예상** |
| 2.3.0/2.4.0 백로그 근거 품질 | 체감 기반 | **데이터 기반** |

---

## 8. 의사결정 요청

이해관계자에게 아래 3건 승인이 필요하다:

1. **트리거 범위 확장 승인** — 3도메인 전역 (plan+copy+dev)
2. **저장 위치 승인** — `.claude/feedback-archive/` 프로젝트 내
3. **Codex fallback 전략 승인** — 완전 자동화 대신 1회 수동 트리거 수용

---

## 9. 리스크 요약

| 리스크 | 영향 | 완화 |
|--------|:-:|------|
| 훅 스크립트가 세션 속도 저하 | 중 | 비동기 파일 쓰기, 크기 제한 (< 10KB/entry) |
| 피드백 품질 (훅이 에이전트보다 얕음) | 중 | Phase 3.2에서 **LLM 요약 훅** 옵션 추가 검토 |
| Codex fallback 수동 누락 | 저 | `/codex-feedback-collect`를 세션 종료 시 자동 suggest |
| 아카이브 폭발적 증가 | 저 | 월 단위 롤업 + 요약 자동 생성 |

---

## 10. 다음 단계

1. 본 Executive Summary 리뷰
2. 상세 설계 문서(01~06) 정독
3. Phase 3 구현 착수 여부 결정 (2.2.0 릴리스 후 권장)

---

## 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
