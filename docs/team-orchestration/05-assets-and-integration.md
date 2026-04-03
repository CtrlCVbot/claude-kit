# 자산 매핑 + 통합 계획

> claude-kit 현재 자산과 Team Orchestration의 접점을 정의하고, 미존재 runtime asset을 proposal backlog로 관리한다.

---

## 현재 자산 Truth

claude-kit 현재 repo 기준:

| 카테고리 | core | dev | plan | 합계 |
|---------|:----:|:---:|:----:|:----:|
| Agents | 0 | 6 | 6 | **12** |
| Commands | 0 | 20 | 10 | **30** |
| Skills | 2 | 13 | 8 | **23** |
| Hooks | 5 | 2 | 1 | 8 |
| Rules | 6 | 0 | 0 | 6 |

> `dev-frontend-reviewer`는 현재 설치 자산에 존재하지 않는다. 과거 설계 흔적으로만 취급한다.

---

## 기존 에이전트 → 오케스트레이션 역할 매핑

### Plan 도메인 에이전트 (6개)

| 에이전트 | 모델 | 오케스트레이션 역할 | 호출 시점 |
|---------|------|-------------------|----------|
| `plan-idea-collector` | sonnet | Feature Agent P1 | `/plan-idea` |
| `plan-idea-screener` | sonnet | Feature Agent P2 | `/plan-screen` |
| `plan-prd-writer` | opus | Feature Agent P4 | `/plan-prd` |
| `plan-wireframe-designer` | opus | Feature Agent P5 | `/plan-wireframe` |
| `plan-stitch-integrator` | sonnet | Feature Agent P6 | `/plan-stitch` |
| `plan-reviewer` | opus | Feature Agent P4.5, P5.5 | `/plan-review` |

### Dev 도메인 에이전트 (6개)

| 에이전트 | 모델 | 오케스트레이션 역할 | 호출 시점 |
|---------|------|-------------------|----------|
| `dev-architect` | sonnet | 아키텍처 분석 | Feature 개발 시작 전 |
| `dev-code-reviewer` | opus | 코드 품질 리뷰 | 구현 완료 후 |
| `dev-database-reviewer` | opus | DB 스키마/쿼리 리뷰 | DB 변경 시 (conditional) |
| `dev-doc-updater` | sonnet | 문서 동기화 | 코드 리뷰 통과 후 |
| `dev-security-reviewer` | opus | OWASP 보안 분석 | 코드 리뷰와 병렬 |
| `dev-verify-agent` | sonnet | 검증 파이프라인 | 모든 리뷰 통과 후 |

---

## 기존 스킬 → 파이프라인 단계 매핑

| 단계 | 커맨드 | 스킬 | 변경 필요 |
|------|--------|------|:---------:|
| P1 | `/plan-idea` | `plan-idea-management` | 없음 |
| P2 | `/plan-screen` | `plan-screening-workflow` | 없음 |
| P3 | `/plan-draft` | `plan-pipeline` | 없음 |
| P4 | `/plan-prd` | `plan-prd-authoring` | 없음 |
| P4/P5 Review | `/plan-review` | `plan-review-criteria` | 없음 |
| P5 | `/plan-wireframe` | `plan-wireframe-design` | 없음 |
| P6 | `/plan-stitch` | `plan-stitch-workflow` | 없음 |
| P8 | `/plan-archive` | `plan-archive-workflow` | 없음 |
| A | `/dev-feature` | `dev-feature-plan` | 없음 |
| D | `/dev-run` | `dev-workflow` | 없음 |
| E | `/dev-verify` | `dev-verification-engine` | 없음 |

**결론: 기존 에이전트/스킬 수정 ZERO.**

---

## 기존 파일 수정 영향

| 카테고리 | 수정 필요 | 근거 |
|----------|:---------:|------|
| 기존 에이전트 (12개) | 없음 | Task tool로 기존 인터페이스 그대로 호출 |
| 기존 커맨드 (30개) | 없음 | 커맨드는 에이전트의 진입점, 호출 방식 동일 |
| 기존 스킬 (23개) | 없음 | 에이전트 내부에서 자동 활성화 |
| 기존 훅 (8개) | 없음 | 오케스트레이션 맥락에서도 동일 동작 |
| `stage-manifest.json` | 읽기/쓰기 | Team Lead가 orchestration 필드 확장 (스키마 하위 호환) |

---

## Proposal Backlog: 신규 Runtime Asset

현재 repo에 아래 오케스트레이션 전용 runtime asset은 **존재하지 않는다**. 구현 시 추가가 필요한 proposal backlog다.

| 자산 | 위치 (제안) | 역할 | 도메인 |
|------|-----------|------|--------|
| `team-lead.md` | `src/core/agents/` | Feature Orchestration 총괄 | core |
| `team-orchestrate/SKILL.md` | `src/core/skills/` | `/team-orchestrate` 커맨드 진입점 — 기존 `/orchestrate` 스킬의 claude-kit 내장 버전 | core |
| `feature-dependency-graph.yaml` | `src/core/templates/` | 의존성 그래프 템플릿 | core |
| `team-orchestrate-hook.js` | `src/core/hooks/` | (선택) 진행 상황 자동 기록 | core |

core 도메인에 배치하여 plan/dev 모두 조율 가능. 의존성 방향 유지: `plan → core ← dev`, Team Lead는 Task tool (subagent)로 간접 호출.

---

## 오케스트레이션 개념 → claude-kit SSOT 매핑

| Team Orchestration 개념 | claude-kit SSOT | 정렬 원칙 |
|-------------------------|----------------|-----------|
| feature registry 입력 | Fast-Track + planning normalization 결과 | raw blueprint 대체 금지 |
| entryPoint | `Entry Assessment` 결과 | `P1`, `P3-fast-track`, `P4-normalized`만 허용 |
| executionPath | approved PRD / bridge path | `.plans/prd/10-approved/...` 기준 |
| review gate | `plan-review`, `reviewPassed` | review 미통과 상태 진행 완화 금지 |
| Human Review | `dev-feature` / `08-dev-workflow.md` | Phase B 명칭 고정 |
| DVC verification | `dev-verify` | DVC 6항목 의미 고정 |
| orchestration state | `stage-manifest` 확장 | Team Lead single-writer |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [guide/09-architecture.md](../guide/09-architecture.md) | 컴포넌트 카탈로그 (12/30/23) |
| [07-rollout-roadmap.md](./07-rollout-roadmap.md) | 신규 자산 구현 순서 |
