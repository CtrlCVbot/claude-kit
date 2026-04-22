# claude-kit v2.4.0 Roadmap — Hierarchical Plan Structure

> **🟢 릴리스 확정**: **v2.4.0** (2026-04-22)
> **범위**: Hierarchical Plan Structure (Epic / Feature / Task 3단 계층 Opt-in 도입) **단독**
> **직전 버전**: v2.3.0 ([`../kit-2.3.0-roadmap/`](../kit-2.3.0-roadmap/))
> **확정 근거**: dash-preview-phase3 완주 (6일 / 41 TASK / 622+916 tests) + 사용자 피드백 10 이슈 → 4 Lane IDEA 운영 경험

---

## 0. 한 문장 요약

claude-kit 의 IDEA·Feature·TASK 를 현재의 **flat 3 단계**에서 **parent-child 로 연결된 3 계층 (Epic / Feature / Task)** 으로 승격해, 대규모 사용자 피드백이나 복잡한 제품 테마를 한 번에 묶어 관리·병렬 실행할 수 있게 한다. **Opt-in** 방식으로 기존 사용자 100% 하위 호환.

**비유**: 지금은 책상 위에 포스트잇 수십 장이 섞여 있는 상태. 본 릴리스는 포스트잇들을 **바인더 세 권(Epic/Feature/Task)** 으로 나누고, 각 포스트잇에 **"어느 바인더의 몇 페이지" 라벨** 을 붙이는 작업이다.

---

## 1. 패키지 구성 (7 파일)

```
claude-kit/docs/plan/kit-2.4.0-roadmap/
├── README.md                           # 이 문서 (통합 릴리스 노트 + 패키지 목차)
├── 00-현황-분석.md                     # 왜 계층이 필요한가? (근거 수집)
├── 01-계층-설계.md                     # Epic/Feature/Task 3단 정의 (핵심)
├── 02-마이그레이션-규칙.md             # 기존 flat → hierarchy 전환 가이드
├── 03-kit-반영-포인트.md               # skill/command/rule 변경 목록
├── 04-로드맵.md                        # Phase 1 PoC → 2 부분 → 3 전면
└── 05-PoC-dash-preview-phase4.md       # PoC 예시 (실 적용 시뮬레이션)
```

### 읽는 순서

| 독자 | 순서 |
|---|---|
| 🎯 빠르게 핵심만 (10분) | README → 01-계층-설계 |
| 📚 의사결정용 검토 (30분) | README → 00 → 01 → 04 → 05 |
| 🔧 구현자용 전체 (1~2시간) | 순서대로 전부 |

---

## 2. 용어 매핑 (현재 vs v2.4.0 제안)

| 계층 | 현재 (v2.3.x) | v2.4.0 제안 | 단위 기간 | 주요 산출물 |
|:---:|---|---|:---:|---|
| 대 | ❌ 없음 | **Epic** (신설, Opt-in) | 1~3개월 | Epic Brief + 자식 Feature 목록 |
| 중 | `IDEA-{N}` + `features/active/{slug}/` | **Feature** (기존 IDEA + Package 통합 용어) | 1~4주 | PRD + Wireframe + dev-tasks |
| 소 | `T-{AREA}-{NN}` | **Task** (변경 없음) | 0.5~2일 | 1 커밋 단위 |

---

## 3. v2.4.0 포함 범위 (In-scope)

### 3-1. 신규 디렉터리
- `.plans/epics/` (5 상태 하위: 00-draft / 10-planning / 20-active / 30-completed / 90-archive)

### 3-2. 신규 커맨드 (2건)
- `/plan-epic` — Epic 생성·조회·상태 전이
- `/plan-epic-adopt` — 기존 Feature 소급 연결 (active / archived 시나리오)

### 3-3. 확장 커맨드 (1건)
- `/plan-idea` — `--epic=EPIC-...` 파라미터 추가 (optional, 하위 호환)

### 3-4. 신규 skill (1건)
- `plan-epic-workflow` — Epic 라이프사이클 + 상태 머신 + 템플릿

### 3-5. 신규 rule (1건)
- `plan-epic-hierarchy.md` — 3단 계층 규칙 + Opt-in 원칙 + 금지 사항

### 3-6. 기존 skill / rule 참조 수정 (3건)
- `plan-archive-workflow` — Feature archive 시 Epic 영향 반영
- `plan-pipeline` — 파이프라인 다이어그램에 Epic 단계 추가
- `plan-idea-management` — epic 파라미터 언급

### 3-7. 신규 hook (1건, disable 기본)
- `plan-epic-integrity.js` — Epic ↔ Feature binding cross-reference

### 3-8. 문서 템플릿 (3건)
- `epic-brief.md`
- `children-features.md`
- `epic-binding.md`

### 3-9. 스키마 확장 (2건)
- `.plans/ideas/backlog.md` — `Epic` 컬럼 추가 (null 허용)
- `.plans/archive/index.md` — `Epic` 컬럼 추가 (null 허용)

### 3-10. 에이전트 신설
**0건** (기존 에이전트 프롬프트 확장만, Over-engineering 가드 유지)

---

## 4. v2.4.0 포함하지 않음 (Out-of-scope, 차기 버전)

| 항목 | 대상 버전 |
|---|---|
| Pipeline Kit Improvements (IMP-KIT-027~038) — mologado 로컬 개선 제안 | 미분류 (차기 v2.5.0 또는 별도 릴리스 예비) |
| 기존 archive (OLP/DASH/DASH3) 전면 Epic 재구성 | v2.5.0 이후 (2.4 는 Opt-in 신규만) |
| Epic 간 parent-child (4단 계층) | **설계상 금지** |
| 에이전트 신설 (plan-epic-writer 등) | v2.5.0 이후 |

---

## 5. 릴리스 내부 구조 (3 Phase)

```
v2.4.0-alpha (2026-04-23~24, Phase 1 PoC)
  └─ dash-preview Phase 4 Epic 문서만 작성 (kit 변경 0)
     (05-PoC-dash-preview-phase4.md 참조)

v2.4.0-beta (2026-05, Phase 2 부분 도입)
  ├─ /plan-epic + plan-epic-workflow skill 구현
  ├─ /plan-idea --epic 파라미터
  ├─ backlog.md / archive/index.md 스키마 확장
  └─ plan-epic-integrity.js hook (disable 기본)

v2.4.0 정식 (2026-06-23 목표)
  ├─ plan-epic-hierarchy.md rule 추가
  ├─ CLAUDE.md / plan-pipeline.md 문서 업데이트
  └─ /plan-epic-adopt 커맨드 (또는 v2.5.0 이관)
```

---

## 6. 성공 지표 (Release Gate)

### v2.4.0 정식 릴리스 전 충족해야 할 조건

| # | 지표 | 목표 |
|---|---|---|
| 1 | Hierarchical PoC (dash-preview Phase 4) 완료 + 관찰 기록 | 긍정 판정 |
| 2 | `/plan-epic` + `plan-epic-workflow` skill 실 사용 1회 이상 | 실증 |
| 3 | 기존 커맨드 (`/plan-idea` 등) 100% 하위 호환 | 회귀 0건 |
| 4 | `.plans/epics/` 디렉터리 + Epic Brief 템플릿 최소 1건 검증 | 문서 완성도 |
| 5 | claude-kit CLAUDE.md / plan-pipeline.md 문서 업데이트 완료 | 리뷰 통과 |

---

## 7. 하위 호환 보장

### 기존 사용자 경험 (v2.4.0 에서도 동일)

| 기존 사용법 | v2.4.0 동작 |
|---|---|
| `/plan-idea "새 기능"` | 완전 동일 (Epic 없이 등록) |
| `/plan-screen` / `/plan-draft` / `/plan-prd` / `/plan-wireframe` | 완전 동일 |
| `/plan-bridge` / `/plan-archive` | 완전 동일 |
| `/dev-feature` / `/dev-run` / `/dev-verify` / `/dev-commit` | 완전 동일 |
| 기존 `.plans/ideas/` / `features/` / `archive/` 구조 | 변경 없음 |

### 신규 Opt-in 기능 (사용자 요청 시에만)

| 신규 기능 | 활용 조건 |
|---|---|
| `/plan-epic` | 제품 Theme / Cross-cutting 요구사항 관리 필요 시 |
| `--epic=EPIC-...` 파라미터 | 위 Epic 에 IDEA/Feature 연결 시 |
| `/plan-epic-adopt` | archived/active Feature 소급 연결 시 |

---

## 8. 타임라인 (가정)

| 시점 | 마일스톤 |
|---|---|
| 2026-04-22 | v2.4.0 **확정** (본 릴리스 계획) |
| 2026-04-23 ~ 04-24 | **alpha1** — Hierarchical PoC (dash-preview Phase 4 Epic) |
| 2026-04-28 ~ 05-09 | **alpha2** — Epic 문서 완성도 검증 |
| 2026-05-12 ~ 06-06 | **beta** — `/plan-epic` + skill + 스키마 확장 |
| 2026-06-09 ~ 06-20 | 안정화 + 실 사용 검증 (최소 2주) |
| 2026-06-23 | **v2.4.0 정식 릴리스** |
| 2026-07 이후 | v2.4.x patch (버그 수정) |

---

## 9. 핵심 제약 (over-engineering 가드)

- ✅ 기존 에이전트 활용, **신설 0건 목표**
- ✅ 기존 IDEA / Feature Package / TASK 구조와 **완전 호환** (마이그레이션 없이도 동작)
- ✅ Epic 은 **Opt-in** (모든 Feature 가 Epic 에 속할 필요 없음)
- ✅ PoC 성공 전 kit 전면 변경 금지
- ✅ Epic 간 parent-child (4단 계층) 금지

---

## 10. 리스크 + 완화

| 리스크 | 확률 | 영향 | 완화 |
|---|:---:|:---:|---|
| PoC 문서 부담 과다 | 중 | 중 | Phase 1 에서 템플릿 최소화, 필수 섹션 3개로 제한 |
| Phase 2 커맨드 사용자 경험 열위 | 중 | 고 | Opt-in 원칙 강제, 기존 사용자 회귀 테스트 |
| hook 오탐 (false positive) | 중 | 저 | Phase 3 전까지 disable 기본 |
| 소급 연결 시 archive 훼손 | 낮 | 고 | 원본 불변성 원칙 엄격 적용 |
| Epic 간 parent-child 요청 (4단 확장) | 중 | 중 | 설계상 금지 명시, 차기 별도 IMP |

---

## 11. 관련 문서

### claude-kit 내부 (버전 로드맵)
- 직전: [`../kit-2.2.0-roadmap/`](../kit-2.2.0-roadmap/) (v2.2.0)
- 직전: [`../kit-2.3.0-roadmap/`](../kit-2.3.0-roadmap/) (v2.3.0, 현재 최신)
- 연관 IMP 집합: [`../kit-agent-improvements-v2.3.1/`](../kit-agent-improvements-v2.3.1/) (IMP-AGENT-* 시리즈)

### 다운스트림 프로젝트 (mologado) 에서 반영될 문서
- `mologado/CLAUDE.md` — "v2.4.0 로드맵" 섹션 (본 패키지 경로 참조)
- (beta 시점) 다운스트림의 `.plans/epics/` 디렉터리 초기화

---

## 12. 파이프라인 Quality 개선은 별도 (mologado 로컬)

dash-preview-phase3 운영에서 발견된 12건의 파이프라인 Quality 개선 (IMP-KIT-027~038) 은 **mologado 다운스트림 프로젝트 로컬 패키지** 로만 관리되며 **v2.4.0 범위에 포함되지 않는다**:

- 위치: `mologado/.claude/docs/kit-improvements/20260422-pipeline-kit-improvements/` (로컬 전용)
- 상태: **미분류** (향후 v2.5.0 또는 별도 릴리스로 재할당 예정, claude-kit 레포 편입 여부 미결)

---

## 13. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — 7 파일 패키지 구성. Epic/Feature/Task 3단 정의 + PoC dash-preview Phase 4 + 3 Phase 로드맵 |
| 2026-04-22 | **v2.4.0 확정** — 통합 릴리스 노트 작성 |
| 2026-04-22 | **claude-kit 레포로 이관** — 원본 `mologado/.claude/docs/kit-improvements/20260422-hierarchical-plan-structure/` → 현재 `claude-kit/docs/plan/kit-2.4.0-roadmap/`. 범위를 Hierarchical 단독으로 축소 (pipeline-kit-improvements 는 mologado 로컬 패키지로 복귀, v2.4.0 미포함) |
