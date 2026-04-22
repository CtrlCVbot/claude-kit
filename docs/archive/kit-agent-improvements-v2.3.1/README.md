# Kit Agent Improvements — v2.3.1

> **대상**: claude-kit v2.2.1 → v2.3.1
> **관점**: 19개 에이전트 카탈로그 스냅샷 + `20260422-pipeline-kit-improvements` 12건 재해석 기반 **에이전트 중심 개선 계획**
> **작성일**: 2026-04-22
> **관련 패키지** (중복 회피):
> - `.claude/docs/kit-improvements/20260422-pipeline-kit-improvements/` — IMP-KIT-027~038 원본 (본 패키지 Track 1 근원)
> - `docs/archive/kit-2.3.0-roadmap/` — P1 에이전트 관련 8건 이미 shipped
> - `docs/plan/kit-feedback-archiving/` — Phase 3 shipped, IMP-AGENT-009 인프라 재사용

---

## 0. 결론

본 패키지는 **IMP-AGENT-001~009 총 9건**을 제안한다. 원본 `20260422-pipeline-kit-improvements`가 "훅·커맨드·룰 관점"이었다면, 본 패키지는 **"에이전트 프롬프트·계약·체인 관점"**으로 동일한 문제를 재해석하거나(Track 1), 현 카탈로그의 구조적 공백을 해소한다(Track 2).

- **Track 1** (4건, 기존 IMP 재해석): IMP-AGENT-001~004
- **Track 2** (5건, 카탈로그 기반 신규): IMP-AGENT-005~009

**에이전트 신설 금지 원칙 완화**: 원본 decision-log의 원칙을 유지하되, dev/copy 도메인의 구현 주체 부재를 해소하기 위해 2건(005, 006)만 예외 허용 (decision-log §3).

---

## 1. 우선순위 분포

| 우선순위 | 건수 | ID |
|---|:---:|---|
| **P0 (블로커, v2.3.1 필수)** | **4** | IMP-AGENT-001, 003, 004, 009 |
| **P1 (중요, v2.3.1 내)** | **4** | IMP-AGENT-002, 005, 006, 007 |
| **P2 (개선, v2.4.0+)** | **1** | IMP-AGENT-008 |

**비교**: 원본 패키지 P0 비중 25% → 본 패키지 44%. 에이전트 관점에서 **임팩트 큰 IMP에 집중**되었음.

---

## 2. 5축 분류

### 2-0. Pipeline Completeness (파이프라인 공백)

| ID | 제목 | 우선 | Track |
|---|---|:---:|:---:|
| **IMP-AGENT-004** | Spike 워크플로우 에이전트 협력 계약 | **P0** | 1 |
| **IMP-AGENT-005** | dev-implementer 에이전트 신설 | P1 | 2 |
| **IMP-AGENT-006** | copy-implementer 에이전트 신설 | P1 | 2 |
| **IMP-AGENT-009** | 에이전트 호출 텔레메트리 본체 | **P0** | 2 |

### 2-1. Process Gaps (기획↔개발 핸드오프)

| ID | 제목 | 우선 | Track |
|---|---|:---:|:---:|
| **IMP-AGENT-001** | architecture-binding 동기화 계약 | **P0** | 1 |
| IMP-AGENT-002 | dev-code-reviewer 출력 표준화 | P1 | 1 |
| IMP-AGENT-007 | cross-domain 핸드오프 표준화 | P1 | 2 |

### 2-2. Tool Gaps (훅/커맨드/에이전트 보호)

| ID | 제목 | 우선 | Track |
|---|---|:---:|:---:|
| **IMP-AGENT-003** | plan-bridge-writer 아카이브 전 체크리스트 | **P0** | 1 |
| IMP-AGENT-008 | 에이전트 frontmatter 확장 | P2 | 2 |

---

## 3. Track별 요약

### Track 1 — 기존 IMP 에이전트 관점 재해석 (4건)

| ID | 기반 | 제목 | 핵심 변화 |
|---|---|---|---|
| IMP-AGENT-001 | IMP-KIT-027 | binding 동기화 계약 | 훅(사후) → 스키마 v1.1(사전) |
| IMP-AGENT-002 | IMP-KIT-028 + 035 | review-output 표준화 | 2개 IMP를 1개 계약으로 병합 |
| IMP-AGENT-003 | IMP-KIT-030 | 아카이브 전 체크리스트 | `/plan-archive` 가드 → plan-bridge-writer shift-left |
| IMP-AGENT-004 | IMP-KIT-038 + 036 | Spike 에이전트 협력 | 신설 없이 plan-bridge-writer + dev-architect 역할 확장 |

### Track 2 — 카탈로그 기반 신규 (5건)

| ID | 공백 근거 | 제목 | 핵심 변화 |
|---|---|---|---|
| IMP-AGENT-005 | dev 구현 주체 부재 | dev-implementer 신설 | TDD Red-Green 루프 자율 실행 |
| IMP-AGENT-006 | copy 구현 주체 부재 | copy-implementer 신설 | VF/IF 갭 소비 + Execution Unit 구현 |
| IMP-AGENT-007 | 핸드오프 문서화 부재 | handoff-contract 스키마 | 묵시적 해석 → 명시적 계약 |
| IMP-AGENT-008 | frontmatter 확장성 제한 | team_owner/release_stage/dependencies | 19개 에이전트 일괄 갱신 (BC-2.3.1-04) |
| IMP-AGENT-009 | 텔레메트리 부재 | IMP-KIT-024 stub 본체 승격 | kit-feedback-archiving 인프라 재사용 |

---

## 4. 기존 IMP와의 관계 (중복 확인)

| 기존 IMP | 본 패키지 | 관계 | 설명 |
|---|---|:---:|---|
| IMP-KIT-011 (edit-coordinates v1) | IMP-AGENT-001 | parent-child | v1.1로 minor bump, 하위호환 |
| IMP-KIT-024 (텔레메트리 stub) | IMP-AGENT-009 | stub → 본체 | v2.3.0 stub을 v2.3.1 본체로 승격 |
| IMP-KIT-027 | IMP-AGENT-001 | 재해석 | 훅은 유지, 스키마 계약 추가 |
| IMP-KIT-028 | IMP-AGENT-002 | 흡수 | review-output 스키마로 통합 |
| IMP-KIT-030 | IMP-AGENT-003 | shift-left | 아카이브 가드 → 브리지 체크리스트 |
| IMP-KIT-035 | IMP-AGENT-002 | 흡수 | Top 3 rule이 스키마 필드로 |
| IMP-KIT-036 | IMP-AGENT-004 | 통합 | Budget 감시는 skill 레벨로 귀속 |
| IMP-KIT-038 | IMP-AGENT-004 | 재해석 | skill+command는 038 유지, 에이전트 협력 부분만 재해석 |
| IMP-KIT-029, 031 | — | 보류 | 훅·규칙 레벨로 에이전트 재해석 약함 |
| IMP-KIT-032, 033, 034, 037 | — | 제외 | 에이전트 무관 |

**v2.3.0 로드맵 shipped 8건과 중복 없음** (상세: `analysis/gap-analysis.md`).

---

## 5. Breaking Change 요약

| BC ID | IMP | 영향 | 마이그레이션 |
|---|---|---|---|
| BC-2.3.1-01 | IMP-AGENT-002 | review-output 스키마 신규 | 기존 소비자 없어 영향 제한적 |
| BC-2.3.1-02 | IMP-AGENT-005 | dev-implementer 신설 | 기존 호출자 없음. `/dev-run --inline` 하위호환 플래그 제공 |
| BC-2.3.1-03 | IMP-AGENT-006 | copy-implementer 신설 | 기존 호출자 없음 |
| BC-2.3.1-04 | IMP-AGENT-008 | frontmatter 확장 | 자동 스크립트 + 훅 경고(v2.3.1) → 차단(v2.4.0) 2단계 |

**공통 원칙**: 전부 **옵트인 방식**. 기존 동작 중단 없음.

---

## 6. 구조

```
docs/archive/kit-agent-improvements-v2.3.1/
├── README.md                                    # 본 문서
├── decision-log.md                              # 작성 중 내린 11개 결정
├── analysis/
│   ├── agent-catalog-snapshot.md                # 19개 에이전트 현황 + 공백 5건
│   ├── imp-agent-mapping.md                     # 12건 IMP → 에이전트 관련성 분류
│   └── gap-analysis.md                          # v2.3.0 로드맵 중복 회피
├── # Track 1: 기존 IMP 재해석 (4건)
├── IMP-AGENT-001-binding-sync-contract.md
├── IMP-AGENT-002-review-output-standardization.md
├── IMP-AGENT-003-archive-guard-prompt.md
├── IMP-AGENT-004-spike-workflow-agents.md
├── # Track 2: 카탈로그 기반 신규 (5건)
├── IMP-AGENT-005-dev-implementation-agent.md
├── IMP-AGENT-006-copy-implementation-agent.md
├── IMP-AGENT-007-cross-domain-handoff.md
├── IMP-AGENT-008-frontmatter-extension.md
└── IMP-AGENT-009-agent-telemetry.md
```

---

## 7. 작성 원칙 (참조 패키지 §5 계승)

- **증거 기반**: Track 1은 dash-preview-phase3 커밋·파일·DVC 결과 인용, Track 2는 카탈로그 스냅샷 근거
- **중복 회피**: v2.3.0 로드맵 shipped 8건과의 관계를 `analysis/gap-analysis.md`에 명시
- **Over-engineering 금지**: 각 IMP 150~400 단어. 에이전트 신설은 IMP-AGENT-005/006에 한정 (decision-log §3 완화 조건 명시)
- **재사용성 우선**: 본 패키지는 claude-kit 전체에 적용되는 에이전트 거버넌스. 프로젝트-특정 이슈는 배제

---

## 8. 다음 단계 (검토 → 구현)

1. **본 패키지 사용자 검토** ← 현재 단계
2. 승인 후 v2.3.1 로드맵 편입 (`docs/plan/kit-2.3.1-roadmap/` 생성 또는 본 패키지 승격)
3. IMP별 P0 → P1 → P2 순으로 구현 PR 생성
4. 각 IMP 구현 후 IMP-AGENT-009 텔레메트리로 효과 측정
5. v2.4.0 로드맵 설계 시 본 패키지 측정 결과 반영

**HARD-GATE**: 사용자 승인 전 본 패키지 어떤 IMP도 구현 착수 금지.

---

## 9. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — IMP-AGENT-001~009 총 9건. Track 2개, 5축 분류, BC 4건 정의 |
