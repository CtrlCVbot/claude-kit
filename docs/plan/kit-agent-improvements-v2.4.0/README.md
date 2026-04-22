# claude-kit v2.4.0 에이전트 개선 계획 (Agent Prompt Expansion)

> **상태**: 계획 초안 (2026-04-22)
> **범위**: v2.4.0 Hierarchical Plan Structure 도입에 맞춘 **기존 에이전트 프롬프트 확장**
> **핵심 제약**: 에이전트 **신설 0건** (v2.4.0 로드맵 §9 Over-engineering 가드 준수)
> **상위 로드맵**: [`../kit-2.4.0-roadmap/README.md`](../kit-2.4.0-roadmap/README.md)
> **직전 시리즈**: [`../../archive/kit-agent-improvements-v2.3.1/`](../../archive/kit-agent-improvements-v2.3.1/) (IMP-AGENT-001~009 shipped)

---

## 0. 한 문장 요약

v2.4.0 Hierarchical Plan Structure(Epic/Feature/Task 3단 계층) 도입에 맞춰 **5개 기존 에이전트의 프롬프트를 Epic 컨텍스트 인식 가능하게 확장**한다. 에이전트 신설 0건, 하위 호환 100%, Opt-in 원칙 준수.

**비유**: 주방 요리사들에게 "새 메뉴판(Epic)이 도입되면 그 메뉴를 참고해서 음식을 만들되, 기존 메뉴판이 없으면 지금처럼 진행한다"고 가이드를 추가하는 작업. 요리사를 새로 고용(에이전트 신설)하지 않는다.

---

## 1. 현황 요약

### 1-1. v2.4.0 로드맵의 에이전트 관련 항목 (§3-10, §03 §10)

- **신규 에이전트**: **0건** (Over-engineering 가드 명시)
- **프롬프트 확장 대상**: 5개 에이전트 (v2.4.0 로드맵 §03 §10 표)
- **Out-of-scope (v2.5.0 이후)**: `plan-epic-writer` 등 신설 에이전트

### 1-2. 현재 21개 에이전트 카탈로그

| 도메인 | 에이전트 수 | 목록 |
|---|:---:|---|
| copy | 5 | copy-fidelity, copy-implementer, copy-interaction-fidelity, copy-qa-reviewer, copy-reference-baseline |
| dev | 7 | dev-architect, dev-code-reviewer, dev-database-reviewer, dev-doc-updater, dev-implementer, dev-security-reviewer, dev-verify-agent |
| plan | 9 | plan-bridge-writer, plan-design-writer, plan-draft-writer, plan-idea-collector, plan-idea-screener, plan-prd-writer, plan-reviewer, plan-stitch-integrator, plan-wireframe-designer |

### 1-3. v2.3.1 IMP-AGENT 이력 (직전 시리즈, shipped 2026-04-22)

| IMP | 내용 | 효과 |
|---|---|---|
| IMP-AGENT-001 | edit-coordinates v1.1 (`binding_updates` 필드) | architecture-binding 동기화 계약 승격 |
| IMP-AGENT-002 | 리뷰 출력 표준화 | code/security/database reviewer 출력 포맷 통일 |
| IMP-AGENT-003 | archive guard 프롬프트 | archive 원본 불변 보호 |
| IMP-AGENT-004 | Spike 워크플로우 (plan-bridge-writer + dev-architect Spike 모드) | Spike Day-End Go/No-Go |
| IMP-AGENT-005 | `dev-implementer` 신설 | `/dev-run` 기본 디스패치 |
| IMP-AGENT-006 | `copy-implementer` 신설 | VF/IF gap 소비 |
| IMP-AGENT-007 | 도메인 간 핸드오프 | plan→dev→copy 크로스 링크 |
| IMP-AGENT-008 | frontmatter 확장 | team_owner, release_stage, schema_version |
| IMP-AGENT-009 | 에이전트 텔레메트리 (스키마+커맨드+룰) | 훅 구현은 별도 세션 |

### 1-4. 계층 도입으로 에이전트 측면에서 변화하는 맥락

| 축 | 현재 (v2.3.x) | v2.4.0 도입 후 |
|---|---|---|
| IDEA 프론트매터 | `epic` 필드 없음 | optional `epic: EPIC-{...}` |
| PRD 메타 | Epic 링크 없음 | optional `**Epic**: EPIC-{...}` |
| Bridge 문서 | Feature 단일 컨텍스트 | Epic 컨텍스트 + 자매 Feature 링크 |
| PRD 리뷰 기준 | Feature 내부 일관성만 | Epic 자매 Feature와의 모순 검증 추가 |
| 아키텍처 일관성 | Feature 내부만 | Epic 범위 Cross-Feature 일관성 |

---

## 2. 개선 후보 목록 (IMP 번호 채번)

v2.3.1 시리즈(IMP-AGENT-001~009)를 이어 **IMP-AGENT-010 ~ IMP-AGENT-014**로 채번한다.

### 2-1. v2.4.0 편입 후보 (5건)

#### IMP-AGENT-010 — plan-idea-collector Epic 인식 확장 (P0)

**문제**: `/plan-idea --epic=EPIC-...` 파라미터 도입 시 에이전트가 Epic 을 인식하고 IDEA 파일 프론트매터에 `epic:` 필드를 추가해야 하지만, 현재 프롬프트에는 Epic 개념 부재.

**제안 해결책**:
- 프롬프트에 "Epic 파라미터 처리" 섹션 추가
- `--epic` 전달 시 IDEA 프론트매터에 `epic: EPIC-...` 자동 삽입
- Epic 의 `01-children-features.md` 에 "pending IDEA 등록" 행 자동 추가
- backlog.md epic 컬럼 자동 채움

**우선순위**: **P0** — `/plan-idea --epic` 파라미터의 필수 전제
**편입**: v2.4.0 **beta 단계 (Phase 2)** — `/plan-epic` 커맨드 구현과 동시 진행
**프롬프트 확장 규모**: 소 (~30줄, Epic 처리 단락 추가)

---

#### IMP-AGENT-011 — plan-prd-writer Epic 컨텍스트 참조 (P0)

**문제**: Epic 이 있는 Feature 의 PRD 는 Epic 의 성공 지표·범위를 인용해야 자매 Feature 와 일관된 요구사항을 작성할 수 있지만, 현재 프롬프트는 Feature 단독 관점.

**제안 해결책**:
- 프롬프트 Investigation_Protocol 에 "Epic binding 확인" 추가
- Epic Brief §2 성공 지표를 PRD "Non-Functional Requirements" 섹션에 인용
- Epic Brief §3 Out-of-scope 를 PRD "제외 범위" 에 반영
- Epic 없을 시 기존 동작 100% 유지 (Opt-in)

**우선순위**: **P0** — PRD 품질 저하 방지 (Epic 도입의 핵심 이득)
**편입**: v2.4.0 **beta 단계 (Phase 2)**
**프롬프트 확장 규모**: 소 (~40줄, Epic 컨텍스트 로드 단락)

---

#### IMP-AGENT-012 — plan-bridge-writer Epic 링크 포함 (P1)

**문제**: Bridge 문서가 dev 도메인에 전달하는 정보에 Epic 링크·자매 Feature 정보가 없어, dev-architect 가 Epic 범위 아키텍처 일관성을 검증하기 어려움.

**제안 해결책**:
- Bridge 4종 문서 중 `00-bridge-overview.md` 에 "Epic 컨텍스트" 섹션 추가 (Epic 존재 시)
- Epic 의 `01-children-features.md` 의존성 매트릭스 링크 삽입
- 자매 Feature 의 PRD 경로 명시 (dev-architect 가 참조 가능하게)

**우선순위**: **P1** — Epic 인식 개선 필수지만, bridge 가 없는 Epic 도 동작 가능
**편입**: v2.4.0 **정식 단계 (Phase 3 초입 또는 beta 말미)**
**프롬프트 확장 규모**: 소 (~20줄)

---

#### IMP-AGENT-013 — plan-reviewer Epic 자매 Feature 일관성 검증 (P1)

**문제**: PRD 리뷰가 Feature 내부 일관성만 검증하고, Epic 자매 Feature 와의 모순 (예: F2 의 API 스펙이 F3 의 가정과 충돌) 을 탐지하지 않음.

**제안 해결책**:
- PCC (Plan Consistency Check) 항목 추가: "Epic 자매 Feature PRD 와의 모순 없음"
- Epic 존재 시 `01-children-features.md` 읽어 자매 Feature PRD 스캔
- cross-feature 용어 사용 (같은 도메인 엔티티 명명 차이 등) 감지
- Epic 없을 시 기존 PCC 동작 유지

**우선순위**: **P1** — 기능 정합성을 위한 실질적 가치. v2.4.0 정식 시점 필요
**편입**: v2.4.0 **정식 단계 (Phase 3)**
**프롬프트 확장 규모**: 중 (~60줄, 새 PCC 체크 항목 + Epic 컨텍스트 로드)

---

#### IMP-AGENT-014 — dev-architect Epic 범위 아키텍처 일관성 (P1)

**문제**: dev-architect 의 architecture-binding 설계가 Feature 단독 관점이며, Epic 자매 Feature 의 binding 과 충돌할 때 탐지 수단 없음 (예: F2 가 `apps/landing/lib/mock-data.ts` 를 재설계하고 F3 이 같은 파일을 사용).

**제안 해결책**:
- Investigation_Protocol 에 "Epic 자매 Feature architecture-binding 확인" 추가
- Epic 존재 시 자매 Feature 의 `00-context/03-architecture-binding.md` 스캔
- 충돌 감지 시 edit-coordinates 출력의 `binding_updates` 에 "Epic 자매 Feature 에 영향" FLAG 추가 (IMP-AGENT-001 연계)
- 충돌 없으면 기존 동작 유지

**우선순위**: **P1** — Epic 의 "Feature 간 아키텍처 일관성" 이득 실현. 단 F2/F3 독립 병렬 가능한 경우가 많아 P0 는 아님
**편입**: v2.4.0 **정식 단계 (Phase 3)**
**프롬프트 확장 규모**: 중 (~50줄, Epic 컨텍스트 + edit-coordinates 확장)

---

### 2-2. v2.5.0 이후 후보 (3건, 현 단계 스코어링만)

#### IMP-AGENT-015 후보 — plan-epic-writer 신설 (P2, v2.5.0)

**상태**: v2.4.0 out-of-scope 명시 (로드맵 §4). Phase 2 beta 운영 결과 관찰 후 v2.5.0 편입 검토.
**조건**: Epic Brief 작성을 기존 에이전트 (plan-idea-collector 확장) 로 충당 가능하면 영구 보류.

---

#### IMP-AGENT-016 후보 — Epic 레벨 decision-log 자동 기록 에이전트 (P2, v2.5.0)

**상태**: IMP-KIT-028 (Milestone review decision-log) 과 연계. Epic 범위 결정을 자동으로 `04-decision-log.md` 에 기록하는 에이전트. 현재는 기존 plan-reviewer 가 수동 기록으로 충당.

---

#### IMP-AGENT-017 후보 — 에이전트 텔레메트리 emit 훅 구현 (P2)

**상태**: IMP-AGENT-009 (v2.3.1) 의 훅 구현 부분. v2.4.0 범위 외 (텔레메트리 훅은 에이전트 확장이 아니라 인프라). **v2.3.2 patch** 또는 **v2.4.0 정식 후속 세션**에서 TDD 기반 구현. 본 계획의 스코프 아님.

---

## 3. P0 / P1 / P2 분류표

| IMP | 우선순위 | v2.4.0 편입 | 프롬프트 확장 규모 | 에이전트 | 사유 |
|---|:---:|:---:|:---:|---|---|
| IMP-AGENT-010 | **P0** | beta (Phase 2) | 소 | plan-idea-collector | `/plan-idea --epic` 전제 |
| IMP-AGENT-011 | **P0** | beta (Phase 2) | 소 | plan-prd-writer | Epic 도입 핵심 이득 |
| IMP-AGENT-012 | P1 | 정식 (Phase 3) | 소 | plan-bridge-writer | Bridge에 Epic 링크 |
| IMP-AGENT-013 | P1 | 정식 (Phase 3) | 중 | plan-reviewer | 자매 Feature 일관성 검증 |
| IMP-AGENT-014 | P1 | 정식 (Phase 3) | 중 | dev-architect | Epic 범위 아키텍처 일관성 |
| IMP-AGENT-015 | P2 | v2.5.0 | (신설) | plan-epic-writer (가칭) | 에이전트 신설 금지 원칙 유지 |
| IMP-AGENT-016 | P2 | v2.5.0 | — | 미정 | IMP-KIT-028 연계 |
| IMP-AGENT-017 | P2 | v2.3.2 patch | — | (훅, 에이전트 외) | 별도 인프라 세션 |

---

## 4. 실행 계획 (Phase 매핑)

### Phase 1 — PoC (2026-04-23 ~ 24, v2.4.0-alpha)
- **에이전트 변경 0건** — dash-preview Phase 4 Epic PoC 는 문서만으로 수행
- 관찰: Epic 문서 작성 부담 vs Epic 없는 에이전트 동작의 차이 기록

### Phase 2 — 부분 도입 (2026-05-12 ~ 06-06, v2.4.0-beta)

**P0 2건 구현**:

| 순서 | IMP | 작업 내용 | 예상 소요 |
|:---:|---|---|:---:|
| 1 | IMP-AGENT-010 | plan-idea-collector 프롬프트 확장 | 0.5일 |
| 2 | IMP-AGENT-011 | plan-prd-writer 프롬프트 확장 | 0.5일 |
| 3 | 통합 검증 | `/plan-idea --epic` → `/plan-prd` 체인 E2E | 0.5일 |

**총 1.5일** (beta 기간 내 여유 충분)

**TDD 필요 여부**:
- 에이전트 프롬프트 확장은 코드가 아니므로 unit test 불필요
- E2E 검증: 실제 Epic 생성 → `/plan-idea --epic` → `/plan-prd` 실행 → 결과 문서에 Epic 참조 존재 여부 grep

### Phase 3 — 전면 도입 (2026-06-09 ~ 06-20, v2.4.0 정식)

**P1 3건 구현**:

| 순서 | IMP | 작업 내용 | 예상 소요 |
|:---:|---|---|:---:|
| 1 | IMP-AGENT-012 | plan-bridge-writer Epic 링크 | 0.5일 |
| 2 | IMP-AGENT-013 | plan-reviewer PCC 확장 | 1일 |
| 3 | IMP-AGENT-014 | dev-architect Epic 범위 일관성 | 1일 |
| 4 | 통합 검증 | Epic 3 자매 Feature 시나리오로 E2E | 1일 |

**총 3.5일**

### Phase 4 — 릴리스 후 관찰 (2026-07 이후)
- 5개 확장 에이전트의 실제 사용 사례 수집
- IMP-AGENT-009 telemetry 훅 구현 후 Epic 인식 에이전트 호출 빈도·실패율 모니터링
- v2.5.0 편입 후보 (IMP-AGENT-015 plan-epic-writer) 재평가

---

## 5. 제약 준수 체크리스트

| # | 제약 | 준수 여부 | 증거 |
|---|---|:---:|---|
| 1 | 에이전트 신설 0건 | ✅ | 5건 모두 기존 에이전트 프롬프트 확장만 |
| 2 | 하위 호환 100% | ✅ | Epic 없을 시 모든 에이전트 기존 동작 유지 (Opt-in) |
| 3 | v2.4.0 로드맵 §03 §10 표와 일치 | ✅ | plan-idea-collector(소) / plan-prd-writer(소) / plan-bridge-writer(소) / plan-reviewer(중) / dev-architect(중) |
| 4 | Phase 2/3 타임라인 준수 | ✅ | Phase 2 1.5일, Phase 3 3.5일 — 로드맵 여유 내 |
| 5 | Over-engineering 가드 | ✅ | P2 후보 3건은 v2.5.0 이후 연기, 본 계획 범위 아님 |
| 6 | 계획 단계만 수행 (구현 금지) | ✅ | 본 문서는 계획 제출, 승인 후 구현 착수 |
| 7 | golden-principles #9 HARD-GATE | ✅ | 구현 전 사용자 승인 대기 |

---

## 6. 리스크 + 완화

| 리스크 | 확률 | 영향 | 완화 |
|---|:---:|:---:|---|
| Epic 컨텍스트 로딩 실패 시 에이전트 동작 불안정 | 중 | 고 | Epic 파일 부재 시 빈 컨텍스트로 fallback, 기존 동작 유지 |
| 프롬프트 확장 규모가 "중" 2건 (plan-reviewer, dev-architect) 에서 복잡도 증가 | 중 | 중 | 각 에이전트 프롬프트 섹션 분리 (Feature-only / Epic-aware 2모드), If-Then 구조 |
| IMP-AGENT-001 edit-coordinates v1.1 과의 cross-reference 누락 | 낮 | 중 | IMP-AGENT-014 설계 시 binding_updates 필드 사용 명시 |
| PCC 자매 Feature 스캔 시 성능 저하 (Epic children 수 多) | 낮 | 저 | 상한 10개 children 까지만 cross-reference, 초과 시 샘플링 |
| v2.4.0 로드맵 자체가 확정 후 변경 시 본 계획 불일치 | 낮 | 고 | 로드맵 §3-10 고정 (에이전트 신설 0건) 이 해제되지 않는 한 안전 |

---

## 7. 성공 지표 (Release Gate)

| # | 지표 | 목표 | 측정 방법 |
|---|---|---|---|
| 1 | P0 2건 구현 완료 (beta 시점) | IMP-AGENT-010/011 완료 | 에이전트 파일 diff 검토 |
| 2 | `/plan-idea --epic` → Epic 자동 참조 | 실제 Epic 생성 후 IDEA 프론트매터 `epic:` 필드 주입 | grep + 수동 리뷰 |
| 3 | Epic-aware PRD 생성 | Epic Brief §2 성공 지표가 PRD NFR 섹션에 인용 | 실 사례 3건 이상 |
| 4 | P1 3건 구현 완료 (정식 시점) | IMP-AGENT-012/013/014 완료 | 에이전트 파일 diff 검토 |
| 5 | Epic 없는 기존 Feature 회귀 0 | 100% 하위 호환 | 기존 archive Feature PRD 재생성 테스트 |
| 6 | Epic 자매 Feature 모순 탐지 사례 | plan-reviewer 가 최소 1건 FLAG 보고 | 실 사례 또는 인공 테스트 |

---

## 8. 결정 사항 (2026-04-22 사용자 승인)

| # | 항목 | 결정 | 근거 |
|---|---|---|---|
| D1 | IMP 번호 체계 | **`IMP-AGENT-010 ~ 014`** (v2.3.1 시리즈 이어받기) | 일관성 + grep/검색 편의 |
| D2 | P0 2건 (IMP-AGENT-010/011) 착수 시점 | **Phase 2 beta 진입 시점(2026-04-28~) 동시 진행** | `/plan-epic` 커맨드 미존재 상태에서 에이전트가 Epic 참조 불가. 커맨드·스킬과 세트 필수 |
| D3 | IMP-AGENT-017 (telemetry emit 훅) 진행 경로 | **별도 세션** (v2.3.2 patch 또는 v2.4.0 후속) | JS + TDD 필요, 본 계획(프롬프트 확장)과 성격 상이. 스코프 분리 |

**본 계획 확정 범위**: IMP-AGENT-010 / 011 / 012 / 013 / 014 (5건)

---

## 9. 승인 시 다음 단계

사용자 승인 시 다음 작업 순서:

1. **Phase 2 진입 시점 (2026-05-12 전후)**: P0 2건 (IMP-AGENT-010/011) 세부 스펙 문서 작성
   - 각 IMP 파일 개별 생성: `IMP-AGENT-010-plan-idea-collector-epic.md`, `IMP-AGENT-011-plan-prd-writer-epic.md`
   - 프롬프트 확장 before/after diff 제시
2. **Phase 2 구현**: 에이전트 파일 수정 + E2E 검증
3. **Phase 3 진입 시점 (2026-06-09 전후)**: P1 3건 세부 스펙 + 구현
4. **v2.4.0 정식 릴리스 (2026-06-23)** 에 5건 통합

**본 계획 승인 전에는 에이전트 파일 수정 착수 금지** (HARD-GATE 준수).

---

## 10. 관련 자료

- [v2.4.0 Roadmap README](../kit-2.4.0-roadmap/README.md)
- [v2.4.0 §03 kit-반영-포인트](../kit-2.4.0-roadmap/03-kit-반영-포인트.md) — 에이전트 확장 표 §10
- [v2.3.1 IMP-AGENT 시리즈](../../archive/kit-agent-improvements-v2.3.1/) — 네이밍 + 구조 선례
- [edit-coordinates 거버넌스](../../../.claude/rules/edit-coordinates-governance.md) — IMP-AGENT-014 연계
- [agent-telemetry 룰](../../../.claude/rules/agent-telemetry.md) — IMP-AGENT-017 연계

---

## 11. 변경 이력

| 날짜 | 내용 | 작성자 |
|---|---|---|
| 2026-04-22 | 초안 — 5건 P0/P1 IMP + 3건 P2 연기 + Phase 2/3 매핑 + 제약 준수 체크 | Claude (메인테이너 역할) |
| 2026-04-22 | 미결 질문 3건 결정 (§8 D1-D3) — IMP 번호 체계 010~014 / P0 Phase 2 동시 진행 / IMP-AGENT-017 별도 세션 | Claude (메인테이너 역할, 사용자 승인) |
