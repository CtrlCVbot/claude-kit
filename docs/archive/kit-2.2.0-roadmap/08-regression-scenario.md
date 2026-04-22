---
제목: Regression Scenario — 2.2.0 회귀 검증 시나리오 + 실행 가이드
작성일: 2026-04-20
대상: 2.2.0 릴리스 RC 빌드 검증
전제: P0 6건 모두 구현 완료 (10커밋, 466665d ~ 742b176)
상태: ready-to-execute (사용자 실행 필요)
---

# 08 Regression Scenario — 2.2.0

> **결론**: dash-preview-phase3 세션 회고를 기반으로 **3도메인 동시 활성(plan+copy+dev) Feature를 1세션 내 완주**하는 회귀 시나리오. 2.2.0 P0 6건의 효과를 원본 세션 대비 **10종 KPI**로 측정한다. 본 문서는 사용자가 직접 실행 가능한 체크리스트 + 지표 측정 방법을 제공한다.

---

## 1. 회귀 시나리오 개요

### 1.1 기준 세션

- 원본: `dash-preview-phase3` (2026-04-17 완주)
- 회고 위치: `.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/`
- 원본 세션 지표 (10종 KPI 베이스라인):

| # | 지표 | 원본 (2.1.0) |
|:-:|------|:-:|
| 1 | Phase C 재위임 | 1회 |
| 2 | 프레임워크 drift | 1회 |
| 3 | Read 캐시 에러 | 1회 |
| 4 | Hybrid 수동 지시 | 1회 |
| 5 | 수동 Edit 건수 | 22+ |
| 6 | Human Checkpoint 수 | 5+ |
| 7 | `/plan-review` 수동 호출 | 1회 |
| 8 | 재복제 감지 건수 | 측정 안 됨 |
| 9 | 에이전트 호출 텔레메트리 커버리지 | 없음 |
| 10 | trust-only 위반 | 측정 안 됨 |

### 1.2 복제 시나리오 요건

새 Feature(이하 "test-retro-replica")는 원본과 **동등 복잡도**여야 함:

- **3도메인 동시 활성**: plan + copy + dev
- **시나리오 C** (충실도 교정) 또는 **Hybrid** (reference-only)
- **Standard 판정** (6개 트리거 중 ≥1건)
- **예상 파이프라인 길이**: `/plan-idea` ~ `/dev-feature` Phase C까지 10+ 커맨드

---

## 2. V1 — 회귀 시나리오 설계 (본 문서)

### 2.1 대상 Feature 선정 기준

아래 중 하나를 선택:

| 옵션 | 설명 | 장단점 |
|------|------|------|
| A. 기존 Feature 복제 | dash-preview-phase3 유사 복잡도의 실제 Feature를 새 slug로 복제 실행 | 현실적 데이터, 복제 비용 |
| B. 가상 Feature 생성 | 테스트 전용 IDEA를 만들어 파이프라인 돌림 | 통제 가능, 대표성 낮음 |
| C. 실제 새 Feature 사용 | 2.2.0 릴리스 직후 다음 Feature를 회귀 검증 용도로 활용 | 실사용 부담 최소화 |

**권장**: 옵션 C (실 사용 Feature에서 자연스럽게 수집)

### 2.2 실행 환경 준비

- [ ] `pnpm claude-kit:setup` 재실행으로 2.2.0 변경 사항이 `.claude/`에 동기화되었는지 확인
- [ ] `.claude/settings.json`에 `SubagentStop` 훅 등록 확인 (IMP-KIT-005)
- [ ] 프로젝트 CLAUDE.md에 `idea-screening framework` 기본값 설정 (IMP-KIT-002 선택)
- [ ] 활성 도메인에 copy 포함 (시나리오 A/B/C 판정을 위해 — 비활성이면 Hybrid 경로만 검증 가능)

---

## 3. V2 — 수동 회귀 실행 체크리스트

### 3.1 파이프라인 커맨드 순서 (기대 흐름)

```
[Idea 단계]
1. /plan-idea "{IDEA 제목}"
   → backlog.md에 등록 확인

[Screen 단계]
2. /plan-screen {IDEA-ID} --framework rice
   → IMP-KIT-002 효과 확인: framework: rice 명시 출력
   → silent drift 감지: 출력에 "5축" 단어 등장 시 FAIL
3. Human Checkpoint — Go 판정 승인

[Draft 단계]
4. /plan-draft {IDEA-ID}
   → IMP-KIT-003 효과 확인: plan-draft-writer 에이전트 스폰됨
   → 3중 판정 결과 (category, scenario, feature_type, hybrid) 명시
   → routing-metadata.md 생성 확인

[PRD 단계 — Standard인 경우]
5. /plan-prd {draft-path}
6. /plan-review
   → 수동 호출로 카운트 기록 (IMP-KIT-007 2.3.0 예정)

[Wireframe 단계 — 필요 시]
7. /plan-wireframe
   → 재호출 횟수 기록 (IMP-KIT-010 2.3.0 목표)

[Bridge + Copy 병렬 실행]
8. /plan-bridge {slug}  &  /copy-reference-refresh --scope {..} --viewport {..}
   → IMP-KIT-004 효과 확인: plan-bridge-writer 에이전트 스폰됨
   → 4개 브리지 문서 생성, copy evidence와 병렬 실행 충돌 없음
   → Hybrid 감지 시 --reference-only 자동 안내 확인 (IMP-KIT-006)

[Dev 단계]
9. /dev-feature {slug}
   → Phase A: dev-architect 호출 (분석)
   → Phase B: Human Checkpoint
   → Phase C: IMP-KIT-001 효과 확인
      → architect가 편집 좌표 JSON 출력
      → dev-doc-updater로 자동 체이닝
      → 재위임 0회
```

### 3.2 관찰 기록 템플릿

세션 실행 중 다음 항목을 **실시간 기록**:

```
## 회귀 실행 기록 — {YYYY-MM-DD}

### Feature 정보
- slug: {slug}
- category: Lite | Standard
- scenario: A | B | C | N/A
- feature_type: copy | dev
- hybrid: true | false

### 파이프라인 실행 로그
| 단계 | 커맨드 | 시간 | 에이전트 | 이슈 |
|------|--------|------|----------|------|
| 1 | /plan-idea | HH:mm | plan-idea-collector | OK |
| 2 | /plan-screen --framework rice | HH:mm | plan-idea-screener | 프레임워크 = rice 확인 |
| ... |

### KPI 실측값
| # | 지표 | 원본 (2.1.0) | 이번 세션 (2.2.0) | 목표 달성? |
|:-:|------|:-:|:-:|:-:|
| 1 | Phase C 재위임 | 1회 | {값} | ≥ 0회 |
| 2 | 프레임워크 drift | 1회 | {값} | 0회 |
| 3 | Read 캐시 에러 | 1회 | {값} | < 1% |
| 4 | Hybrid 수동 지시 | 1회 | {값} | 0회 |
| 5 | 수동 Edit 건수 | 22+ | {값} | < 15 |
| 6 | Human Checkpoint 수 | 5+ | {값} | < 5 |
| 7 | /plan-review 수동 호출 | 1회 | {값} | (2.3.0 목표) |
| 8 | 재복제 감지 건수 | — | {값} | (2.3.0 목표) |
| 9 | 에이전트 호출 텔레메트리 | 없음 | {값} | (2.4.0+ 목표) |
| 10 | trust-only 위반 | — | {값} | (2.4.0+ 목표) |

### 발견된 이슈
- [ ] 이슈 #1: ...
- [ ] 이슈 #2: ...

### 저장 위치
- 본 기록: `.claude/docs/kit-improvements/{YYYYMMDD}-retro-replica-{slug}/`
```

---

## 4. V3 — 지표 수집 + 비교

### 4.1 측정 자동화 수준 (현재)

| 지표 | 측정 방법 | 자동화 |
|------|----------|:-:|
| 1 | 세션 로그에서 "재위임" / "권한 없음" 키워드 검색 | 반자동 (grep) |
| 2 | 출력 첫 줄의 `framework:` vs 사용자 요청 비교 | 수동 |
| 3 | `File has not been read yet` 에러 발생 횟수 | 반자동 (grep) |
| 4 | routing-metadata.hybrid 자동 감지 vs 수동 지시 카운트 | 수동 |
| 5 | Edit 도구 호출 중 에이전트 경유 vs 메인 직접 | 수동 (편집 로그 분석) |
| 6 | `Human Checkpoint` / "확인해주세요" 키워드 카운트 | 반자동 (grep) |
| 7 | `/plan-review` 수동 호출 여부 | 수동 |
| 8 | 재복제 감지 — 동일 내용 여러 문서에 복사 여부 | 수동 |
| 9 | 에이전트 호출 횟수 집계 | 수동 (2.3.0 텔레메트리 전) |
| 10 | VCS diff 기반 검증 vs 에이전트 보고만 신뢰 | 수동 |

### 4.2 PASS/FAIL 판정 규칙

**PASS 조건** (2.2.0 릴리스 가능):
- 지표 1~6 중 **목표값 미달 0건** + 지표 7~10은 현재 상태 유지(더 나빠지지 않음)
- 단위 시나리오(원본 회고 안티패턴 1, 4, 7) **재발생 0회**

**FAIL 조건** (릴리스 불가):
- 지표 1~6 중 **목표값 미달 1건 이상**
- 안티패턴 재발생 1회 이상

**회색지대**:
- 지표 5, 6 (수동 Edit, Checkpoint)은 Feature 특성에 따라 편차 있음 — 10% 이내 초과는 메인테이너 판단

### 4.3 결과 보고 형식

`.claude/docs/kit-improvements/{YYYYMMDD}-retro-replica-{slug}/KPI-report.md`:

```markdown
# 2.2.0 Regression Test Report

**실행일**: YYYY-MM-DD
**Feature**: {slug}
**판정**: PASS | FAIL | 회색지대

## 핵심 KPI 6종 (PASS/FAIL 결정적)
...

## 보조 KPI 4종 (추세 관찰)
...

## 안티패턴 재발생 여부
- 재위임 루프: 0회 / 1회+
- 프레임워크 drift: 0회 / 1회+
- Read 캐시 에러: 0회 / 1회+
- Hybrid 수동 지시: 0회 / 1회+

## 메인테이너 판단 필요 항목
...

## 릴리스 권고
- [ ] PASS — 2.2.0 릴리스 가능
- [ ] FAIL — 원인 분석 후 패치 커밋 필요
```

---

## 5. V4 연계 — 릴리스 노트 확정

V3 결과가 **PASS**면 [07-release-notes-2.2.0-draft.md](07-release-notes-2.2.0-draft.md)를 다음 순서로 확정:

1. 각 IMP-KIT의 "마이그레이션 영향" 실측 기반 갱신
2. 알려진 이슈에 회색지대 항목 기입
3. 검증 시나리오 섹션에 본 문서 링크 추가
4. `ready-to-ship` 상태로 전환

---

## 6. 실행 권고 시점

### 즉시 실행 가능 시나리오

- 2.2.0 변경 사항이 이미 `.claude/`에 동기화됨 (setup 완료 상태)
- 프로젝트에 **새 Feature 요구사항**이 있을 때 (옵션 C 권장)

### 실행 가능 후속 조치

1. 본 문서의 §3.1 파이프라인을 실행
2. §3.2 템플릿으로 실시간 기록
3. §4.3 포맷으로 리포트 작성
4. 리포트를 `.claude/docs/kit-improvements/`에 아카이빙
5. V4 단계로 전환 (릴리스 노트 확정)

---

## 7. 주의 사항

### 7.1 리포지토리 테스트 인프라 부재

현재 claude-kit 리포지토리에는 **Vitest/Jest 등 테스트 러너가 설정되지 않음**. 따라서:

- P0 각 구현 스펙의 `tests/**/*.test.ts` 파일은 **참고 명세**로만 존재
- 본 회귀 시나리오가 **사실상 유일한 검증 수단**
- 자동화된 단위 테스트는 2.3.0+에서 별도 인프라 도입 후 가능

### 7.2 Codex 환경 회귀

Codex 환경에서도 동일 시나리오를 실행 가능하되, 다음 제약 수용:

- SubagentStop 훅(IMP-KIT-005) 자동 실행 불가 → `agent-completion-cache-invalidate` Skill 수동 참조
- 관련 지표 7(plan-review 수동 호출)은 Codex에서 자동 트리거 불가 (2.3.0 파이프라인 피드백 아카이빙과 함께 해결 예정)

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 — Phase 1.3 V1 산출물 | claude-kit roadmap author |
