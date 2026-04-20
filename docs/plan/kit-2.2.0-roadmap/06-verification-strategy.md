---
제목: Verification Strategy — 회귀 시나리오 + 지표 테이블
작성일: 2026-04-20
대상: 2.2.0 / 2.3.0 / 2.4.0+ 릴리스별 Exit Criteria
상태: draft
---

# 06 Verification Strategy

> **결론**: 본 로드맵의 성공 여부는 **dash-preview-phase3 복제 시나리오**에서 측정한다. 3도메인(plan+copy+dev) 동시 활성 Feature를 1세션 완주했을 때 **현재 → 2.2.0 → 2.3.0 → 2.4.0+** 지표 감소/개선을 확인한다. 각 IMP-KIT 항목에는 **최소 1개 단위 테스트**가 필수다.

---

## 1. 회귀 시나리오 정의

### 1.1 기준 세션 (dash-preview-phase3)

본 세션은 claude-kit 2.1.0 평가 베이스라인이다.

- 3도메인 동시 활성 (plan + copy + dev)
- Hybrid (reference-only) 모드
- 시나리오 C (충실도 교정)
- Standard 판정
- 23건 타임라인, 5+ Human Checkpoint

### 1.2 복제 시나리오 (가칭 "test-retro-replica")

2.2.0/2.3.0 RC 빌드 시 실행하는 엔드투엔드 회귀 테스트.

- **입력**: dash-preview-phase3과 동등 복잡도의 가상 Feature
- **실행**: `/plan-idea` → `/plan-screen` → `/plan-draft` → `/plan-prd` → `/plan-review` → `/plan-wireframe` → `/plan-bridge` + `/copy-reference-refresh` 병렬 → `/dev-feature` Phase A → Phase C
- **측정**: 아래 §2 지표 테이블 전체

---

## 2. 지표 테이블

### 2.1 핵심 KPI (릴리스 Exit Criteria)

| # | 지표 | 현재 (2.1.0) | 2.2.0 목표 | 2.3.0 목표 | 2.4.0+ 목표 |
|:-:|------|:-:|:-:|:-:|:-:|
| 1 | Phase C 재위임 | 1회 | **0회** | 0회 | 0회 |
| 2 | 프레임워크 drift | 1회 | **0회** | 0회 | 0회 |
| 3 | Read 캐시 에러 | 1회 | **< 1%** | 0 | 0 |
| 4 | Hybrid 수동 지시 | 1회 | **0회** | 0회 | 0회 |
| 5 | 수동 Edit 건수 | 22+ | **< 15** | < 10 | < 5 |
| 6 | Human Checkpoint 수 | 5+ | < 5 | **< 3** | < 3 |
| 7 | `/plan-review` 수동 호출 | 1회 | 1회 | **0회** | 0회 |
| 8 | 재복제 감지 건수 | 측정 안 됨 | 1회 미만 | **0건** | 0건 |
| 9 | 에이전트 호출 텔레메트리 커버리지 | 없음 | 기본 | 기본 | **전체 세션** |
| 10 | trust-only 위반 | 측정 안 됨 | 기본 | 감지 | **0건** |

**볼드** = 해당 릴리스의 **신규 달성 목표**

### 2.2 세부 지표

| 지표 | 측정 방법 |
|------|----------|
| 재위임 발생 | 세션 로그에서 "재위임" 키워드 + 에이전트 전환 카운트 |
| 드리프트 | description의 키워드와 실제 출력 키의 교집합 비율 |
| 캐시 에러 | "File has not been read yet" 에러 발생 횟수 |
| 수동 지시 | Feature별 routing-metadata 자동 감지 성공률 |
| 수동 Edit | 에이전트 경유가 아닌 직접 Edit 카운트 |
| Checkpoint | `Human Checkpoint` 키워드 발생 횟수 |

---

## 3. 단위 테스트 커버리지

### 3.1 P0 6건 — 필수 테스트 파일

| IMP-KIT ID | 테스트 파일 | 최소 테스트 수 |
|-----------|------------|:-:|
| 001 | `tests/claude/dev/commands/dev-feature.phase-c-chaining.test.ts` | 3 |
| 002 | `tests/claude/plan/commands/plan-screen.framework.test.ts` | 4 |
| 003 | `tests/claude/plan/agents/plan-draft-writer.test.ts` | 5 |
| 004 | `tests/claude/plan/agents/plan-bridge-writer.test.ts` | 6 |
| 005 | `tests/claude/core/hooks/agent-cache-invalidate.test.ts` | 3 |
| 006 | `tests/claude/copy/commands/copy-reference-refresh.hybrid.test.ts` | 6 |

**P0 총 테스트 수 최소**: 27개

### 3.2 Codex 듀얼 타깃

Codex 쪽은 동등 테스트 명세를 `tests/codex/`에 복제. 총 테스트 수 **약 54개** (Claude 27 + Codex 27).

### 3.3 P1/P2 테스트 요구

각 P1 항목에 최소 1개 단위 테스트 (기본 요구). 상세 명세는 2.3.0 계획 시 별도 문서.

---

## 4. 자동화 시나리오 (E2E)

### 4.1 CI 파이프라인 통합

```yaml
# .github/workflows/retro-replica.yml (예시)
name: Retro Replica E2E

on: [pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm test:unit         # P0 27개 + P1 각 1개
      - run: pnpm test:retro-replica # dash-preview-phase3 복제 시나리오
      - run: pnpm test:metrics      # §2.1 지표 테이블 검증
```

### 4.2 metric 검증 스크립트

`scripts/verify-metrics.js` (신설 제안):

- 세션 로그 파싱
- §2.1 지표 10종 추출
- 릴리스 목표와 비교
- PASS/FAIL 판정

---

## 5. Red-Green 검증 (rules/verification.md 준수)

각 P0 항목의 단위 테스트는 **Red-Green 사이클** 강제:

```
1. Write test       → Run → PASS (테스트 자체 작동)
2. Revert fix       → Run → FAIL (테스트가 버그를 잡음)
3. Restore fix      → Run → PASS (수정이 버그 해결)
```

특히 **회귀 테스트 성격의 IMP-KIT-001, 005**는 3단계 모두 검증 의무.

---

## 6. 성공/실패 판정 규칙

### 6.1 PASS 조건 (릴리스 가능)

- 해당 릴리스의 핵심 KPI 모두 **볼드 목표값 달성**
- P0/P1 단위 테스트 100% 통과
- 회귀 시나리오 1회 이상 성공

### 6.2 FAIL 조건 (릴리스 불가)

다음 중 하나라도 해당:

- 핵심 KPI 중 **1개라도 목표 미달성**
- 단위 테스트 실패 **1건 이상**
- 회귀 시나리오에서 **안티패턴 재발생**

### 6.3 회색지대 (조건부 릴리스)

- KPI 1~2건이 목표에 근접 (10% 이내)하나 미달 → **메인테이너 판단**
- 원인이 환경 특수성이면 조건부 허용, 단 hotfix 계획 필수

---

## 7. 측정 도구 권고

### 7.1 세션 텔레메트리 (IMP-KIT-024 선행 필요)

- 에이전트 호출 수
- 재위임 카운트
- Checkpoint 발생 수
- 수동 Edit 수

### 7.2 로그 파서

`scripts/parse-session.js`: 세션 로그에서 §2.2 세부 지표 추출.

### 7.3 CI 아티팩트

Retro replica 실행 결과를 CI 아티팩트로 저장 → PR 리뷰 시 지표 비교.

---

## 8. 검증 비용 추정

| 항목 | 1회 비용 |
|------|:-:|
| P0 27개 단위 테스트 | ~10분 |
| P1 각 1개 (11건) | ~5분 |
| Retro replica E2E | ~30~60분 |
| Metric 검증 스크립트 | ~1분 |
| **합계** | **~46~76분/PR** |

병렬 실행으로 **30분 내** 단축 가능.

---

## 9. 듀얼 타깃 검증

Codex 대응 변경이 있는 모든 P0 항목은 **Codex 측 회귀 시나리오 동등 실행** 필수.

- Codex harness 제약(hooks runtime 없음 등)을 감안한 **fallback artifact 검증**
- 예: IMP-KIT-005의 캐시 무효화 훅 → Codex에서는 rules 기반 수동 체크로 fallback

---

## 10. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 — 지표 테이블 + Red-Green 검증 포함 | claude-kit roadmap author |
