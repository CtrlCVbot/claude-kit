---
제목: Source Retrospective Link — dash-preview-phase3 회고 참조
작성일: 2026-04-20
원본 회고 위치: `C:/Program Files (user)/mologado/.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/`
원본 작성일: 2026-04-17
상태: draft
---

# 01 Source Retrospective Link

> **결론**: 본 로드맵은 **2026-04-17** 작성된 회고 문서 5건(총 60KB)의 분석 결과를 2.2.0 실행 계획으로 전환한 문서다. 원본은 mologado 프로젝트의 상위 `.claude/docs/kit-improvements/` 폴더에 있다. **SSOT 원칙**에 따라 본 문서는 원본을 **참조**하며 내용을 복제하지 않는다.

---

## 1. 원본 문서 5건

| # | 파일명 | 용도 | 크기 |
|:-:|--------|------|:-:|
| 00 | `00-session-retrospective.md` | 세션 타임라인 23건 + 결정 포인트 5개 | 11KB |
| 01 | `01-agent-capability-matrix.md` | 8개 에이전트 5축 평가 + 권한 매트릭스 | 11KB |
| 02 | `02-improvement-backlog.md` | 26건 개선 항목 (P0/P1/P2) | 16KB |
| 03 | `03-implementation-plan.md` | 3 Phase 로드맵 초안 | 9KB |
| 04 | `04-anti-patterns.md` | 8개 안티패턴 + 체크리스트 | 13KB |

### 상대 경로 (mologado 프로젝트 기준)

```
mologado/
└── .claude/
    └── docs/
        └── kit-improvements/
            └── 20260417-dash-preview-phase3-retrospective/
                ├── 00-session-retrospective.md
                ├── 01-agent-capability-matrix.md
                ├── 02-improvement-backlog.md
                ├── 03-implementation-plan.md
                └── 04-anti-patterns.md
```

### claude-kit 프로젝트 기준 상대 경로

```
claude-kit/docs/plan/kit-2.2.0-roadmap/ → ../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/
```

---

## 2. 핵심 사건 요약 (원본 00-session-retrospective §2 인용)

본 세션 23건 타임라인 중 **claude-kit에 영향을 주는 이슈 8건**을 선별:

| 이슈 번호 | 타임라인 | 내용 | 대응 백로그 |
|:-:|:-:|------|-------------|
| #5 | #5 | plan-idea-screener 프레임워크 drift (RICE → 5축) | IMP-KIT-002 |
| #7 | #7 | `/plan-draft` Skill only, 에이전트 부재 | IMP-KIT-003 |
| #8 | #8 | Hybrid (reference-only) 매번 수동 지시 | IMP-KIT-006 |
| #9 | #10 | `/plan-review` 자동 후속 트리거 부재 | IMP-KIT-007 |
| #11 | — | Hybrid 공식 정의 부재 | IMP-KIT-006 |
| #16 | #16 | Read 캐시 인증 실패 ("File has not been read yet") | IMP-KIT-005 |
| #22 | #22 | dev-architect Edit 권한 없음 → 편집 좌표만 반환 | IMP-KIT-001 |
| #23 | #23 | Phase C 재위임 (dev-architect → dev-doc-updater) | IMP-KIT-001 |

---

## 3. 8개 에이전트 평가 요약 (원본 01-agent-capability-matrix §2 인용)

| 에이전트 | 강점 | 약점 | 개선 방향 |
|----------|------|------|-----------|
| plan-idea-collector | 표준화 양호 | Hold→Go 맥락 못 다룸 | 유래 메타 강화 |
| plan-idea-screener | 점수 세밀 | **프레임워크 drift** | 파라미터화 (P0) |
| plan-prd-writer | 안정적 | REQ ID 네이밍 혼선 | 레지스트리 추가 (P2) |
| plan-reviewer | 체크리스트 구조적 | **자동 트리거 부재** | 훅 도입 (P1) |
| plan-wireframe-designer | **최우수** | 3회 재호출 | 체크리스트 확장 (P1) |
| copy-reference-baseline | 병렬 실행 가능 | **Hybrid 정의 부재** | 모드 정식화 (P0) |
| dev-architect | 분석 능력 탁월 | **Edit 권한 부재** | 체이닝 도입 (P0) |
| dev-doc-updater | 편집 정확 | 단독 호출 판단 약 | 스키마 표준화 (P1) |

---

## 4. 안티패턴 8종 빠른 매핑 (원본 04-anti-patterns §안티패턴 요약)

| # | 안티패턴 | 우선순위 | 대응 백로그 |
|:-:|----------|:-:|-------------|
| 1 | Read 캐시 미인증 → Edit 실패 반복 | P0 | IMP-KIT-005 |
| 2 | grep truncation 방치 | P2 | IMP-KIT-020 |
| 3 | 에이전트 결과 trust-only | P2 | IMP-KIT-021 |
| 4 | 프레임워크 silent drift | P0 | IMP-KIT-002 |
| 5 | 재복제 금지 복수 해석 | P1 | IMP-KIT-017 |
| 6 | Spike 의사결정 자동/수동 모호 | P2 | IMP-KIT-018 |
| 7 | 재위임 루프 (권한 부족 → 재시도) | P0/P1 | IMP-KIT-001, 011 |
| 8 | Human Checkpoint 과다/부족 불균형 | P1 | IMP-KIT-013, 016 |

---

## 5. 세션 결과 지표 (원본 00-session-retrospective §6 인용)

| 지표 | 본 세션 값 |
|------|:-:|
| 최종 Feature Package 파일 수 | 18건 |
| 에이전트 유효 호출 횟수 | 12회 (중복 3회 포함) |
| 수동 개입 (직접 Edit) | 22건+ |
| Human Checkpoint 발생 수 | 5+ |
| 실패→복구 건수 | 2건 |
| 병렬 실행 성공 | 1건 (bridge + copy-reference-refresh) |

---

## 6. 원본 대비 본 로드맵의 차별화

| 원본 회고 | 본 로드맵 |
|-----------|----------|
| 26건 백로그 평면 나열 | **P0 6건 중량 스펙 + P1/P2 요약** 구조 |
| 3 Phase 로드맵 초안 | **의존 그래프 + 공수 합산 + 리스크** 추가 |
| 안티패턴 체크리스트 | 체크리스트를 P0 스펙 내 **TDD 테스트 케이스**로 변환 |
| 릴리스 메모 초안 | **2.2.0 릴리스 노트** 전용 문서 분리 |
| — | **회귀 시나리오** (dash-preview-phase3 복제 테스트) 명시 |

---

## 7. 원본 참조 규칙

본 로드맵 내 모든 P0 상세 스펙은 아래 원칙을 따른다:

1. **원본 인용 금지**: 회고 문서 텍스트를 복제하지 않는다. 경로 + 섹션 번호로 참조한다.
2. **갱신 단방향**: 원본 회고는 불변(immutable) 기록으로 취급. 수정은 본 로드맵에만 반영.
3. **근거 추적 가능성**: 각 IMP-KIT 번호에 원본 타임라인 번호(#N) 반드시 링크.

---

## 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 — 원본 5문서 매핑 | claude-kit roadmap author |
