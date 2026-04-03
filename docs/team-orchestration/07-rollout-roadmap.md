# 도입 로드맵

> 문서 정렬, 런타임 구현, 파일럿 연결의 도입 순서를 정의한다.

---

## 이번 라운드 범위

| 단계 | 내용 | 상태 |
|------|------|:----:|
| **문서 정렬** | team-orchestration 문서를 canonical 구조로 재편 | 진행 중 |
| **계약 고정** | 8개 불변 계약 + guide 정합성 잠금 | 완료 |
| **파일럿 분리** | ds-customizer 콘텐츠를 appendix로 분리 | 진행 중 |

## 다음 라운드 범위

| 단계 | 내용 | 전제 조건 |
|------|------|----------|
| **Impl Phase 1: 순차 실행** | `team-lead.md` + `team-orchestrate/SKILL.md` 순차 모드 | 문서 정렬 완료 |
| **Impl Phase 2: 병렬 실행** | Wave 스케줄링 + `--parallel-limit` | Phase 1 검증 |
| **Impl Phase 3: 게이트 + 복구** | 승인 게이트 + 자동 재시도 + resume | Phase 2 검증 |

---

## Impl Phase 1: 순차 실행

Team Lead가 Feature Agent에게 P1~E 파이프라인 실행을 위임하되, 1개 Feature씩 순차 처리한다.

**구현 범위**:
- `src/core/agents/team-lead.md` (신규)
- `src/core/skills/team-orchestrate/SKILL.md` (신규, 순차 모드)
- `src/core/templates/feature-dependency-graph.yaml` (신규)
- DAG 파싱 + 위상 정렬
- `stage-manifest.json` orchestration 필드 확장

**검증**: 2-Feature 순차 파이프라인 E2E 테스트

---

## Impl Phase 2: 병렬 실행

DAG 기반 Wave spawn으로 독립 Feature를 병렬 실행한다.

**구현 범위**:
- `--parallel-limit` 옵션
- Wave 스케줄링 (의존성 해소 시 다음 Feature spawn)
- 병렬 subagent 관리
- `stage-manifest.json` 동시성 관리 (Team Lead single-writer)

**검증**: 4-Feature 병렬 파이프라인 (Wave 0~1) 테스트

---

## Impl Phase 3: 승인 게이트 + 에러 복구

사용자 승인 게이트와 단계 실패 시 자동 복구 메커니즘을 추가한다.

**구현 범위**:
- P2/Phase B 승인 게이트
- 단계 실패 자동 재시도 (최대 2회)
- 실패 시 일시 중지
- `--start-from` 재개 옵션
- `src/core/hooks/team-orchestrate-hook.js` (선택)

**검증**: 의도적 실패 주입 테스트 (P4 리뷰 실패 → 재시도 → 성공)

---

## `/team-orchestrate` 커맨드 인터페이스 (Proposal)

> 이 커맨드는 현재 구현되어 있지 않다. 기존 `/orchestrate` 스킬(`~/.claude/skills/team-orchestrator/`)의 기능을 claude-kit 패키지에 내장하는 것이 목표다. Impl Phase 1에서 구현 예정.

```bash
# 기본 실행 (순차)
/team-orchestrate --graph .plans/{project}/dependency-graph.yaml

# 병렬 실행
/team-orchestrate --graph .plans/{project}/dependency-graph.yaml --parallel-limit 4

# Dry run (실행 계획만 출력)
/team-orchestrate --graph .plans/{project}/dependency-graph.yaml --dry-run

# 특정 Feature만 실행
/team-orchestrate --graph .plans/{project}/dependency-graph.yaml --feature tenant-config
```

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `--graph <path>` | (필수) | dependency-graph.yaml 경로 |
| `--parallel-limit <n>` | `1` | 동시 실행 Feature 수 |
| `--auto-approve-rice` | `false` | P2 RICE 승인 자동 통과 |
| `--skip-stitch` | `false` | P6 Stitch 건너뛰기 |
| `--dry-run` | `false` | 실행 없이 Wave 계획만 출력 |
| `--start-from <stage>` | `P1` | 특정 단계부터 재개 |
| `--feature <id>` | (전체) | 특정 Feature만 실행 |

---

## 테스트 전략

| 레벨 | 대상 | 시나리오 | 검증 기준 |
|------|------|----------|----------|
| Unit | DAG 스케줄러 | 위상 정렬, Wave 생성, 순환 감지 | 의존성 순서 보장 |
| Integration | 2-Feature 순차 | feature-a → feature-b (의존) | feature-a 완료 후 feature-b 시작 |
| E2E | ds-customizer 8-Feature | 전체 dependency-graph, parallel-limit=4 | 96단계 완료, Wave 순서 |

---

## 성공 지표

| 지표 | 목표값 |
|------|--------|
| 자동 실행 단계 수 | 96단계 (8 Feature x 12 steps) |
| 병렬 실행 (Wave 1) | 4 Feature 동시 진행 |
| 사용자 개입 횟수 | 16회 (P2 x 8 + Phase B x 8) |
| 기존 컴포넌트 수정 | 0개 |
| 신규 파일 수 | 3~4개 |

---

## 리스크 및 완화

| 리스크 | 완화 방안 |
|--------|----------|
| Context window 초과 | Feature별 독립 subagent, 결과만 수집 |
| manifest 동시 쓰기 충돌 | Team Lead single-writer |
| 승인 게이트 대기 | `--auto-approve-rice`, batch 승인 |
| 단계 실패 전파 | 실패 Feature만 일시 중지, 독립 Feature 계속 진행 |

---

## Historical Note: orchestration-state.json

초기 설계에서 `orchestration-state.json`을 별도 SSOT로 제안했으나, `stage-manifest.json` 확장으로 통일하기로 결정했다. 초기 설계의 스키마는 `archive/v1/01-architecture.md`에 보존되어 있다.

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [05-assets-and-integration.md](./05-assets-and-integration.md) | 신규 자산 Proposal Backlog |
| [06-ds-customizer-pilot.md](./06-ds-customizer-pilot.md) | 첫 파일럿 프로젝트 |
