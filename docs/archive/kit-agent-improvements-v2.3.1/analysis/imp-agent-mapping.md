# IMP-KIT-027~038 에이전트 관점 매핑 — 2026-04-22

> **결론**: `20260422-pipeline-kit-improvements` 패키지의 **12건 IMP 중 direct 에이전트 개선은 0건**, indirect 7건, none 5건. 원본 패키지가 선언한 "에이전트 신설 금지" 원칙은 유지하되, **indirect 7건을 에이전트 관점에서 재해석**하면 프롬프트·계약·체크리스트 개선으로 승격 가능.

**원본 패키지**: `.claude/docs/kit-improvements/20260422-pipeline-kit-improvements/`
**조사 시점**: 2026-04-22
**목적**: 신규 패키지(kit-agent-improvements) Track 1 설계 근거

---

## 1. 12건 IMP 에이전트 관련성 분류표

| ID | 제목 | 우선 | 관련성 | 관련 에이전트 | 재해석 가능성 |
|---|---|:---:|:---:|---|---|
| IMP-KIT-027 | architecture-binding §2 자동 동기화 가드 | P0 | **indirect** | dev-architect, dev-doc-updater | ✅ **Track 1 편입**: 스키마 계약으로 승격 |
| IMP-KIT-028 | Milestone review 사이클 decision-log 자동 기록 | P1 | **indirect** | dev-code-reviewer | ✅ **Track 1 편입**: 출력 포맷 표준화 (IMP-KIT-035와 병합) |
| IMP-KIT-029 | 커밋 메시지 TASK ID 라벨 자동 검증 훅 | P1 | indirect | — (훅만) | ⚠️ 훅 레벨. 에이전트 재해석 약함 → **보류** |
| IMP-KIT-030 | /plan-archive embedded git repo 자동 제외 가드 | P0 | **indirect** | plan-bridge-writer (암묵적) | ✅ **Track 1 편입**: 아카이브 전 체크리스트 추가 |
| IMP-KIT-031 | DVC-02 TC naming drift 자동 정정 | P1 | indirect | — (dev-verify 규칙) | ⚠️ 규칙 레벨. 에이전트 재해석 약함 → **보류** |
| IMP-KIT-032 | Feature flag default promotion 전용 커맨드 | P1 | none | — | ❌ 커맨드 레벨 |
| IMP-KIT-033 | LEGACY env toggle 테스트 격리 패턴 skill화 | P1 | none | — | ❌ 스킬 문서 |
| IMP-KIT-034 | 접근성 2-단 fallback skill | P1 | none | — | ❌ 스킬 문서 |
| IMP-KIT-035 | Milestone review Top 3 수술적 처리 rule | P1 | **indirect** | dev-code-reviewer | ✅ **Track 1 편입** (KIT-028과 병합) |
| IMP-KIT-036 | Spike 1일 예산 hard cap | P1 | indirect | — | ⚠️ IMP-KIT-038의 child로 흡수 → **IMP-AGENT-004에 통합** |
| IMP-KIT-037 | Feature flag opt-out decision template | P2 | none | — | ❌ 템플릿 문서 |
| IMP-KIT-038 | Spike 워크플로우 공식 skill + command | P0 | **indirect** | plan-bridge-writer, dev-architect | ✅ **Track 1 편입**: 에이전트 협력 계약 명시 |

**요약**: direct 0 / indirect 7 / none 5 → **Track 1 대상 4건** (027, 028+035 병합, 030, 038)

---

## 2. Track 1 편입 IMP 상세

### IMP-AGENT-001 ← IMP-KIT-027

**원본 초점**: architecture-binding §2(`feature-module.yaml`의 관련 파일 섹션) 갱신 누락 가드 (훅 레벨).

**에이전트 관점 재해석**:
- dev-architect가 `edit-coordinates` JSON을 출력할 때 binding §2 변경분을 **반드시 포함**하도록 프롬프트 확장
- dev-doc-updater가 binding §2 업데이트를 **스키마 validation 대상**으로 소비
- 두 에이전트 간 **계약을 `edit-coordinates.schema.json` v1.1로 승격** (minor bump, 하위호환)

**ROI**: 훅은 사후 감지지만, 에이전트 계약은 **사전 방지**. IMP-KIT-011 거버넌스 연장선.

### IMP-AGENT-002 ← IMP-KIT-028 + IMP-KIT-035 병합

**원본 초점**:
- KIT-028: Milestone review 후 decision-log 자동 기록
- KIT-035: Milestone review Top 3 수술적 처리 rule

**에이전트 관점 재해석**:
- 두 IMP 모두 **dev-code-reviewer 출력 포맷**과 직결
- 병합하여 `dev-code-reviewer` **출력 템플릿 SSOT**로 일원화
- 출력 스키마: `{top3: [...], decision_log_entries: [...], severity: ...}`
- 소비자: decision-log 훅(KIT-028) + rule 문서(KIT-035) + (장기) 텔레메트리(IMP-AGENT-009)

**ROI**: 2개 IMP를 1개 계약으로 통합 → 재사용성·일관성 상승.

### IMP-AGENT-003 ← IMP-KIT-030

**원본 초점**: `/plan-archive` 시 embedded git repo 자동 제외 (커맨드·스킬 레벨).

**에이전트 관점 재해석**:
- plan-bridge-writer가 "다음 경로 안내" 시 **archive 대상 검증 체크리스트**를 자동 주입
- 체크리스트: embedded repo, 빌드 산출물, node_modules, 대용량 바이너리 4종
- dev-feature-scope-guard 훅과의 역할 분리 명시

**ROI**: 아카이브 시점 실수 방지를 **기획→개발 경계 단계로 이동** (shift-left).

### IMP-AGENT-004 ← IMP-KIT-038 + IMP-KIT-036 통합

**원본 초점**:
- KIT-038: Spike 워크플로우 공식 skill + command 도입 (P0)
- KIT-036: Spike 1일 예산 hard cap (KIT-038의 child)

**에이전트 관점 재해석**:
- KIT-038은 "에이전트 신설 금지" 원칙으로 **plan-bridge-writer + dev-architect 협력**으로 설계됨
- 두 에이전트의 **협력 계약을 명시적으로 문서화** 필요:
  - plan-bridge-writer: Spike 진입 조건 판정 + spike-notes.md 템플릿 생성
  - dev-architect: Spike 1일 후 Go/No-Go 판정 보조 (vertical slice 분석)
- 예산 cap(KIT-036)은 spike-notes.md 템플릿의 `## Budget` 섹션으로 흡수

**ROI**: 신설 없이 기존 에이전트 역할 확장 → decision-log §5 "에이전트 신설 금지" 준수.

---

## 3. 보류·제외 IMP

### 보류 (에이전트 재해석 약함, 2건)

| ID | 이유 |
|---|---|
| IMP-KIT-029 | 훅 레벨(커밋 메시지 검증)만 존재. 에이전트 출력물과 간접 연결이지만 계약으로 승격 시 **over-engineering** |
| IMP-KIT-031 | `dev-verify` 내부 정규식 수정. 에이전트 프롬프트 변화 없음 |

**처리**: 원본 패키지에서 그대로 구현. kit-agent-improvements 참조 표에만 기록.

### 제외 (none, 5건)

| ID | 성격 |
|---|---|
| IMP-KIT-032 | 커맨드 신설 (플래그 승격) |
| IMP-KIT-033 | 스킬 문서 (LEGACY 격리 패턴) |
| IMP-KIT-034 | 스킬 문서 (접근성 fallback) |
| IMP-KIT-036 | IMP-AGENT-004로 흡수됨 |
| IMP-KIT-037 | 의사결정 템플릿 |

---

## 4. 기존 26건과의 관계 (중복 회피)

| 기존 IMP | 본 매핑과의 관계 | 처리 |
|---|---|---|
| IMP-KIT-011 (edit-coordinates v1) | IMP-AGENT-001이 v1.1로 확장 | parent-child. 011의 거버넌스 룰 준수 |
| IMP-KIT-018 (Spike 결정 분기) | IMP-AGENT-004에 IMP-KIT-038을 통해 간접 연결 | 중복 없음 (038이 018 흡수) |
| IMP-KIT-022 (TASK/REQ 레지스트리) | IMP-AGENT-004의 에이전트 협력에 레지스트리 참조 가능 | 완성 시 선택적 연계 |
| IMP-KIT-024 (에이전트 텔레메트리 stub) | IMP-AGENT-009가 본체 구현 | stub → 본체 승격 |

---

## 5. Track 1 범위 확정

| IMP | 기반 | 우선순위 | 예상 공수 |
|---|---|:---:|:---:|
| IMP-AGENT-001 | IMP-KIT-027 | P0 | M |
| IMP-AGENT-002 | IMP-KIT-028 + 035 | P1 | M |
| IMP-AGENT-003 | IMP-KIT-030 | P0 | S |
| IMP-AGENT-004 | IMP-KIT-038 + 036 | P0 | M |

**P0 3건 / P1 1건**. 원본 패키지의 P0 비중(3/12=25%)보다 높음 → 에이전트 관점에서 **임팩트 큰 IMP만 재해석**했음을 반영.

---

## 6. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — 12건 IMP 에이전트 관점 분류. Track 1 4건 확정 |
