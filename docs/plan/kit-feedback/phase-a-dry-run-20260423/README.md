# claude-kit v2.4.0 피드백 — Phase A Dry-Run (2026-04-23)

> **범위**: EPIC-20260422-001 (dash-preview Phase 4) Phase A 기획 단계 Step 1~8 실제 실행.
> **목적**: claude-kit v2.4.0 Hierarchical Plan Structure (Epic/Feature/Task 3 단 계층) 파이프라인의 실제 사용 경험 기반 개선 피드백 수집.
> **작성일**: 2026-04-23
> **작성자**: 메인 Claude 세션 (landing 프로젝트, 실제 1 day 운영 경험 기준)

---

## 1. Executive Summary

본 피드백은 **실제 프로덕션 기획 작업 1 일** (Phase A 기획 Step 1~8) 에 걸쳐 claude-kit v2.4.0 의 plan 도메인 파이프라인을 **처음부터 끝까지 실행한 결과** 를 정리한다. 목적은 v2.4.0 정식 출시 전 (2026-06-23 예정) 개선 우선순위 도출.

### 1-1. 핵심 결론 3 문장

1. **Epic/Feature 계층 (v2.4.0 핵심 기능) 은 Opt-in 원칙 하에 실제로 동작하며**, 10 이슈를 5 Feature 로 그룹화하고 Phase A/B/C 로 실행 순서를 명시하는 사용성은 **독립 Feature flat 구조 대비 명확한 이점** 을 제공한다.
2. **하지만 Epic 디렉터리 전이 (`draft → planning → active`) 시 13 파일 이상의 경로 링크 갱신이 수동 부담** 으로 발생하며, 이는 v2.4.0 의 가장 큰 실사용 마찰점이다. 자동 링크 재작성 도구 부재.
3. **에이전트 간 협업에서 Epic 공통 파일 (`01-children-features.md`) 편집 race + Read 캐시 invalidation 문제** 가 반복적으로 발생하며, 현재는 "메인 세션이 Epic 파일 전담" 이라는 암묵적 규칙으로 우회 중이다. 이는 자동화 여지가 큰 지점.

### 1-2. 총평 (Numeric)

| 지표 | 값 | 비고 |
|------|-----|------|
| 실행 커맨드 수 | 7 종 × 여러 회 | `/plan-epic`, `/plan-idea`, `/plan-screen`, `/plan-draft`, `/plan-prd`, `/plan-bridge`, `/plan-epic advance` |
| 호출한 에이전트 수 | 6 종 | `plan-idea-collector` × 2 / `plan-idea-screener` × 2 / `plan-draft-writer` × 2 / `plan-prd-writer` × 1 / `plan-reviewer` × 1 / `plan-bridge-writer` × 2 |
| 생성된 파일 수 | 25 + | Epic 3 (brief/children/index) · IDEA 2 · backlog 1 · Draft 5 (01-draft × 2 + 07-routing-metadata × 2 + 02-prd × 1) · Feature Package 10 (00-context/01-04 + 08-epic-binding × 2) · kit-feedback (본 문서 포함 6) |
| 메인 세션 Edit 수 | 약 50 건 | Children 9 + brief 5 + index 7 + IDEA 14 + backlog 10 + binding 6 |
| 메인 세션 Read 수 | 약 15 건 | 캐시 재인증 포함 |
| Bash 명령 수 | 6 건 | mkdir · mv (Epic 이동) × 2 · sed (경로 일괄 치환) × 2 · git ls-files 1 |
| 체크포인트 승인 수 | 5 건 | F5 Screening Go · F1 Screening Go · F5 Draft · F1 Draft · F1 PRD (PCC PASS) |
| 실제 1 일 처리량 | Epic 1 + Feature 2 (F5 Lite + F1 Standard) 기획 완료 | 구현 (Step 9) 제외 |

### 1-3. 3 대 강점

1. **Epic Activation 기준 (3 중 하나 이상)** 이 Over-engineering 가드로 효과적 — Phase 3 archive 후 10 이슈를 5 Feature 로 그룹화하며 "Epic 이 정말 필요한가?" 자문하는 프레임 제공
2. **3 중 판정 (Lane/시나리오/Feature 유형)** 이 Draft 단계에서 Lite vs Standard 분기를 명확히 — Lite 는 PRD 생략, Standard 는 PRD 필수 자동 결정
3. **plan-reviewer PCC 5 종** 검증이 PRD 품질 보장 효과 탁월 — 본 세션에서 5/5 PASS 달성하며 거짓 통과 방지 체감

### 1-4. 3 대 개선 우선순위 (Critical → Low)

| # | 개선 영역 | 우선순위 | 구현 난이도 | 예상 효과 |
|:-:|----------|:---:|:---:|:---:|
| 1 | **Epic 전이 자동 링크 갱신 도구** | 🔴 Critical | Medium | Epic advance 수동 부담 90% 감소 |
| 2 | **Feature 상태 SSOT + 자동 동기화 hook** | 🟠 High | Medium | IDEA/backlog/Children/binding 4 곳 동기 자동화 |
| 3 | **에이전트 Epic 파일 편집 race 방지 규정** | 🟠 High | Low | 병렬 실행 시 충돌 제거 |
| 4 | **RICE Lite/Standard Lane 가중 조정 규칙 SSOT** | 🟡 Medium | Low | 판정 기준 투명화 |
| 5 | **Bridge 5 파일 중복 정보 축소** (golden #13 Non-Duplication) | 🟡 Medium | Low | SSOT 관리 부담 감소 |
| 6 | **plan-epic advance 게이트 자동 검증** | 🟡 Medium | Low | 게이트 미충족 조기 차단 |
| 7 | **Phase 로드맵 템플릿화** (Phase B/C 재사용) | 🟢 Low | High | 로드맵 중복 작성 제거 |
| 8 | **dry-run 모드** (학습·시뮬레이션) | 🟢 Low | Medium | 신규 사용자 learning curve |

---

## 2. 문서 맵 (Package Contents)

본 피드백 패키지는 **5 문서** 로 구성:

| 파일 | 내용 | 대상 독자 |
|------|------|----------|
| [`README.md`](./README.md) (본 문서) | Executive Summary + 문서 맵 | 모든 이해관계자 (3분 읽기) |
| [`01-pipeline-overview.md`](./01-pipeline-overview.md) | Phase A Step 1~8 실제 실행 기록 (재현 가능) | kit 메인테이너 + 후속 사용자 |
| [`02-positive-findings.md`](./02-positive-findings.md) | 좋았던 점 18 건 — **유지해야 할 특성** | kit 설계 결정자 |
| [`03-pain-points.md`](./03-pain-points.md) | 겪은 불편 18 건 — **제거·개선 대상** | kit 메인테이너 (구현 포인트) |
| [`04-improvement-proposals.md`](./04-improvement-proposals.md) | 구체 개선 제안 18 건 — **로드맵 반영 후보** | kit 로드맵 담당자 (v2.4.1+, v2.5.0) |
| [`05-command-agent-matrix.md`](./05-command-agent-matrix.md) | 커맨드 7 종 + 에이전트 6 종 상세 피드백 표 | 에이전트 개별 개선 담당자 |

### 2-1. 독자별 권장 읽기 순서

- **빠른 파악**: README (§1 Executive Summary) → 02 positive 요약 → 04 improvement 상위 3 건
- **완전 이해**: README → 01 pipeline-overview (실제 실행 맥락) → 02 → 03 → 04 → 05
- **구현 우선순위 도출**: README §1-4 → 04 improvement-proposals → 03 pain-points (근거)
- **개별 에이전트 개선**: 05 command-agent-matrix 의 해당 row → 03 pain-points 의 관련 항목

---

## 3. 맥락 (Context)

### 3-1. 프로젝트 컨텍스트

- **프로젝트**: `@mologado/landing` (monorepo 내 1 앱, Next.js 15 + Tailwind 4)
- **Epic 대상**: EPIC-20260422-001 "dash-preview Phase 4 — Phase 3 피드백 반영"
- **이전 Epic / Feature**: dash-preview-phase3 (2026-04-22 archived, 6 일간 41 TASK, 622 + 916 tests)
- **파이프라인 버전**: claude-kit v2.4.0-beta.1
- **활성 도메인**: core, dev, plan, copy

### 3-2. 세션 컨텍스트

- **세션 기간**: 2026-04-22 (Epic 생성) + 2026-04-23 (Step 1~8 기획)
- **컨텍스트 압축**: Phase A Step 5 근처에서 `/compact` 1 회 실행
- **주요 중단점**: 사용자가 Phase A 시작 전 "기간 단위 세션 분리" 결정 (Phase B/C 는 별도 세션)

### 3-3. 피드백 수집 원칙

- **증거 기반**: 모든 관찰은 실제 실행 파일·라인·에러 메시지 근거 (추측 배제)
- **재현 가능성**: 01-pipeline-overview.md 의 Step 기록 기반 재현 가능
- **균형**: 긍정 (02) 과 부정 (03) 둘 다 동등 비중으로 수집
- **액션 지향**: 모든 pain-point 는 04 improvement-proposals 에 1:N 매핑

---

## 4. 제한 사항 (Caveats)

본 피드백은 다음 제약을 인지하고 읽어야 한다:

1. **단일 프로젝트 경험**: landing 앱 한 곳 기준. 다른 프로젝트 (워크스페이스 다수 앱, 비-Next.js, 비-Tailwind) 에서는 다른 마찰점 존재 가능.
2. **Step 9 (구현) 제외**: `/dev-feature` + `/dev-run` 실제 구현 단계는 아직 미수행. 이 지점의 피드백은 부재.
3. **copy 도메인 미적용**: F1/F5 둘 다 dev Feature 로 판정되어 copy 파이프라인 (`/copy-reference-refresh`, `/copy-visual-review` 등) 경험 없음.
4. **Phase B/C 미수행**: Epic §3 Phase B (F2 + F4) 와 Phase C (F3) 는 별도 세션에서 수행 예정. Phase 간 전환 경험은 부재.
5. **Spike 모드 미가동**: IMP-AGENT-004 Spike 모드 (SPIKE-THEME-01 등) 는 가능성만 PRD R1 에 언급되었고 실제 활성화 안 됨. Spike workflow 피드백 부재.
6. **팀 협업 경험 없음**: 본 세션은 단일 사용자 + 메인 세션 + 서브 에이전트 구조. `TeamCreate` 를 활용한 다자 dev-implementer 동시 실행 (Step 9) 경험 없음.

---

## 5. 관련 자산 링크

### 5-1. 본 Epic 산출물 (재현 자료)

- Epic: [`.plans/epics/20-active/EPIC-20260422-001/`](../../epics/20-active/EPIC-20260422-001/)
- IDEAs: [`.plans/ideas/00-inbox/IDEA-20260423-001.md`](../../ideas/00-inbox/IDEA-20260423-001.md) · [`IDEA-20260423-002.md`](../../ideas/00-inbox/IDEA-20260423-002.md)
- Drafts: [`.plans/drafts/f5-ui-residue-cleanup/`](../../drafts/f5-ui-residue-cleanup/) · [`.plans/drafts/f1-landing-light-theme/`](../../drafts/f1-landing-light-theme/)
- Feature Packages: [`.plans/features/active/f5-ui-residue-cleanup/`](../../features/active/f5-ui-residue-cleanup/) · [`.plans/features/active/f1-landing-light-theme/`](../../features/active/f1-landing-light-theme/)

### 5-2. 관련 kit 문서 (개선 대상 SSOT)

- 룰: [`plan-epic-hierarchy.md`](../../../.claude/rules/plan-epic-hierarchy.md), [`verification.md`](../../../.claude/rules/verification.md), [`checkpoint-policy.md`](../../../.claude/rules/checkpoint-policy.md), [`edit-coordinates-governance.md`](../../../.claude/rules/edit-coordinates-governance.md)
- Skill: [`plan-epic-workflow/`](../../../.claude/skills/plan-epic-workflow/)
- Command: `/plan-epic`, `/plan-idea`, `/plan-screen`, `/plan-draft`, `/plan-prd`, `/plan-bridge`, `/plan-epic advance`
- Hook: `plan-epic-integrity.js` (Phase 2 disable 기본)

---

## 6. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | 초안 — Phase A Step 1~8 실행 직후 작성 (5 문서 패키지) |
