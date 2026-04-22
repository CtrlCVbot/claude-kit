# v2.3.0 Roadmap 중복 회피 분석 — 2026-04-22

> **결론**: v2.3.0 P1 11건 중 **에이전트 관련 8건이 이미 shipped**. Phase 2.2(에이전트 메모리/권한)에서 screener/wireframe/architect/doc-updater 개선이 완료되었으므로, kit-agent-improvements는 **중복을 피하고 IMP-KIT-024(텔레메트리 stub) + 카탈로그 관찰 기반 공백 5건**에 집중한다.

**참조 경로**: `docs/plan/kit-2.3.0-roadmap/`
**조사 시점**: 2026-04-22
**목적**: 신규 패키지(v2.3.1 타깃) 범위 확정 + 중복 방지

---

## 1. v2.3.0 로드맵 에이전트 관련 IMP (8건, 전부 shipped)

| ID | 제목 | Phase | 상태 | 관련 에이전트 |
|---|---|:---:|:---:|---|
| IMP-KIT-007 | `/plan-review` 자동 후속 트리거 | 2.1 | shipped | plan-review (훅) |
| IMP-KIT-008 | plan-idea-screener 재판정 메모리 기록 | 2.2 | shipped | plan-idea-screener |
| IMP-KIT-009 | plan-idea-screener 파일 이동 권한 확장 | 2.2 | shipped | plan-idea-screener |
| IMP-KIT-010 | plan-wireframe-designer 체크리스트 확장 | 2.2 | shipped | plan-wireframe-designer |
| IMP-KIT-011 | dev-architect ↔ doc-updater 스키마 거버넌스 | 2.2 | shipped | dev-architect, dev-doc-updater |
| IMP-KIT-013 | Dev 착수 Gate Draft 조기 플래그 | 2.3 | shipped | plan-draft-writer |
| IMP-KIT-015 | TASK ID 네이밍 표준화 | 2.3 | shipped | (훅 통합) |
| IMP-KIT-016 | Human Checkpoint 자동 진행 플래그 | 2.1 | shipped | 전역 |

**비중**: P1 11건 중 8건(73%) 완료. RICE 합계의 75%가 에이전트 관련.

---

## 2. v2.3.1 잠재 중복 영역 분석

### 직접 중복 위험 (High)

| 신규 IMP 후보 | 중복 대상 | 판정 |
|---|---|---|
| plan-idea-screener 추가 개선 | KIT-008, KIT-009 | ❌ **제외** — 이미 Phase 2.2에서 포괄적 개선 |
| plan-wireframe-designer 추가 개선 | KIT-010 | ❌ **제외** — 체크리스트 이미 확장됨 |
| dev-architect/doc-updater 계약 | KIT-011 | ⚠️ **확장만** — v1.1 minor bump 형태로 (IMP-AGENT-001) |
| plan-draft-writer Gate | KIT-013 | ❌ **제외** — Gate 체크리스트 이미 주입 |

### 간접 중복 위험 (Medium)

| 신규 IMP 후보 | 관련 기존 IMP | 판정 |
|---|---|---|
| dev-code-reviewer 출력 표준화 | — (로드맵 미포함) | ✅ **신규** — IMP-AGENT-002로 진행 |
| plan-bridge-writer 역할 확장 | — (로드맵 미포함) | ✅ **신규** — IMP-AGENT-003, 004 |

### 중복 없음 (Low)

| 신규 IMP 후보 | 판정 |
|---|---|
| dev 구현 에이전트 신설 | ✅ **완전 신규** — 카탈로그 공백 #1 |
| copy 구현 에이전트 신설 | ✅ **완전 신규** — 카탈로그 공백 #2 |
| cross-domain 핸드오프 표준화 | ✅ **완전 신규** — 카탈로그 공백 #3 |
| frontmatter 확장 | ✅ **완전 신규** — 카탈로그 공백 #4 |
| 에이전트 텔레메트리 | ⚠️ **IMP-KIT-024 stub 본체화** — 공백 #5 |

---

## 3. IMP-KIT-024(텔레메트리 stub) 승격 판단

**현재 상태**: v2.3.0 로드맵에서 "stub"으로 등록, Phase 3(2.3.0 이후) 예고.

**승격 근거**:
- kit-feedback-archiving Phase 3 (최근 완료) 이 에이전트 호출 로깅 기반 마련
- 텔레메트리 없이는 IMP-AGENT-001~008 효과 측정 불가
- v2.3.1 타깃 릴리스의 **최우선 IMP 중 하나**로 승격

**역할 분담**:
- v2.3.0 IMP-KIT-024: 텔레메트리 필드 정의(stub)
- **v2.3.1 IMP-AGENT-009**: 실 수집·집계·리포트 파이프라인 구현
- kit-feedback-archiving Phase 4: 텔레메트리 로그 장기 보관(선택)

---

## 4. 기존 패키지와의 관계

### `.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/`
- 원본 IMP-KIT-001~026 확정 패키지
- kit-agent-improvements와 **이중 중복 회피** 필요:
  - v2.3.0 로드맵으로 흡수된 IMP(001~026 중 shipped) → 기피
  - 아직 shipped 안 된 IMP(012, 014, 017, 019~026) → 본 패키지 범위 밖

### `.claude/docs/kit-improvements/20260422-pipeline-kit-improvements/`
- 원본 IMP-KIT-027~038 패키지 (본 패키지 Track 1 근원)
- 매핑은 `imp-agent-mapping.md` 참조

### `docs/plan/kit-feedback-archiving/`
- Phase 3 shipped. 본 패키지 IMP-AGENT-009와 **연계 설계** 필요:
  - 텔레메트리 이벤트 → feedback-archiving 엔트리 자동 생성 여부
  - 메타데이터 공유 스키마

### `docs/plan/kit-codex-manual-hybrid/`
- Codex 타깃 병행 처리 패키지
- 본 패키지 IMP는 현재 **Claude 타깃만**. Codex 병행은 v2.4.0 이후 별도 판단

---

## 5. 5축 분류 (본 패키지 Track 2 기준)

카탈로그 관찰 기반 공백 5건을 v2.3.1 5축 분류로 재배치:

| ID | 공백 | 5축 | 우선순위 |
|---|---|:---:|:---:|
| IMP-AGENT-005 | dev 구현 에이전트 부족 | **Pipeline Completeness** | P1 |
| IMP-AGENT-006 | copy 구현 에이전트 부재 | **Pipeline Completeness** | P1 |
| IMP-AGENT-007 | cross-domain 핸드오프 문서화 부재 | **Process Gaps** | P1 |
| IMP-AGENT-008 | frontmatter 확장성 | **Tool Gaps** | P2 |
| IMP-AGENT-009 | 에이전트 텔레메트리 | **Pipeline Completeness** | **P0** (KIT-024 승격) |

---

## 6. 범위 확정 (v2.3.1)

| Track | IMP 수 | P0 | P1 | P2 |
|---|:---:|:---:|:---:|:---:|
| Track 1 (기존 IMP 재해석) | 4 | 3 | 1 | 0 |
| Track 2 (카탈로그 기반 신규) | 5 | 1 | 3 | 1 |
| **합계** | **9** | **4** | **4** | **1** |

**비교**: 원본 `20260422-pipeline-kit-improvements` (P0 3 / P1 8 / P2 1) 대비 **P0 비중 증가 (25% → 44%)**. 에이전트 관점 재해석이 임팩트 큰 IMP에 집중되었음을 확인.

---

## 7. Breaking Change 사전 평가

| IMP | BC 여부 | 마이그레이션 비용 |
|---|:---:|---|
| IMP-AGENT-001 (edit-coordinates v1.1) | **no** (minor, 하위호환) | 기존 소비자 영향 없음 |
| IMP-AGENT-002 (dev-code-reviewer 출력 스키마) | **yes** (BC-2.3.1-01) | decision-log 훅 + rule 문서 갱신 필요 |
| IMP-AGENT-003 (bridge-writer 체크리스트) | no | 프롬프트 추가 |
| IMP-AGENT-004 (spike 협력 계약) | no | 신규 skill |
| IMP-AGENT-005 (dev-implementer 신설) | **yes** (BC-2.3.1-02) | 신규 에이전트, 기존 호출자 없음이라 영향 제한적 |
| IMP-AGENT-006 (copy-implementer 신설) | **yes** (BC-2.3.1-03) | 동상 |
| IMP-AGENT-007 (cross-domain 핸드오프 룰) | no | 신규 룰 문서 |
| IMP-AGENT-008 (frontmatter 확장) | **yes** (BC-2.3.1-04) | 19개 에이전트 frontmatter 일괄 갱신, 스키마 validation 도입 |
| IMP-AGENT-009 (텔레메트리 본체) | no (KIT-024 stub 소비) | — |

**BC 4건**: 01(스키마), 02/03(신규 에이전트), 04(frontmatter). v2.3.1 패치 릴리스에서 허용 가능 수준 (기존 동작 중단 없음, 옵트인 방식).

---

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — v2.3.0 로드맵 중복 분석. v2.3.1 9건 IMP 범위 확정 |
