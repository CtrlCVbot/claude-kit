---
제목: 08 Next Steps Execution Plan — 2.3.0 5단계 실행 계획
작성일: 2026-04-21
대상: 전 담당자 (결정권자 · 메인테이너 · 기여자 · 릴리스 책임자)
이해관계자 승인일: 2026-04-21
상태: reviewed
---

# 08 Next Steps Execution Plan

> **결론**: 본 2.3.0 로드맵 패키지가 완성된 시점(2026-04-21)부터 2.3.0 릴리스까지의 **5단계 실행 계획**. 각 단계의 담당·산출물·기간·진입/출구 조건을 명시한다. 기본 가정: 이해관계자 리뷰 승인이 2주 내, Phase 2.1 착수가 4주 내 시작.

---

## 전체 타임라인

```
2026-04-21 (오늘)
  │
  ├─ [1] 리뷰 & 승인         ← 1~2주
  │
  ├─ [2] 인프라 준비         ← 리뷰 후 1~2주
  │
  ├─ [3] Phase 2.1 실행      ← 1~4주 (누적 ~8주)
  ├─ [3] Phase 2.2 실행      ← 5~8주 (누적 ~12주)
  ├─ [3] Phase 2.3 실행      ← 9~12주 (누적 ~16주)
  │
  ├─ [4] Exit Criteria 검증  ← 1~2주
  │
  └─ [5] 릴리스 & 후속       ← 릴리스 +1개월
         2.3.0 ship (~2026-08-21 목표)
```

기간 합산: **~4개월** (리뷰 2주 + 준비 2주 + 구현 12주 + 검증 2주).

---

## 1단계 — 리뷰 & 승인 (1~2주)

### 1.1 목적

본 패키지 16개 문서의 **draft → reviewed** 상태 승격.

### 1.2 참여자 및 역할

| 역할 | 담당 문서 | 시간 |
|------|----------|------|
| **이해관계자** (결정권자) | [00-executive-summary](00-executive-summary.md), [02-p1-execution-plan §2](02-p1-execution-plan.md#2-rice-재정렬표-ssot), [07-boundary-and-contradictions](07-boundary-and-contradictions.md) | 2~3시간 |
| **메인테이너** (개발 리드) | [03-p1-detailed-specs/](03-p1-detailed-specs/) 8건 + [02-p1-execution-plan](02-p1-execution-plan.md) + [04-feedback-archiving-integration](04-feedback-archiving-integration.md) + [05-verification-2.3.0](05-verification-2.3.0.md) | 1~2일 |
| **기여자 대표** | 담당 예정 IMP-KIT 스펙 1~2건 | 2시간/건 |
| **Codex runtime 담당자** | 각 스펙 §4 듀얼 타깃 섹션 + [05 §5](05-verification-2.3.0.md#5-codex-듀얼-타깃-검증) | 2~3시간 |

### 1.3 의사결정 3건 (이해관계자 승인)

| # | 결정 사항 | 근거 문서 |
|:-:|----------|----------|
| D1 | **P1 11건 RICE 재정렬표 승인** | [02 §2](02-p1-execution-plan.md#2-rice-재정렬표-ssot) |
| D2 | **피드백 아카이빙 수집 로직 2.3.0+ 이월 승인** | [04 §5](04-feedback-archiving-integration.md#5-230-포함-범위-vs-이월-범위) |
| D3 | **Breaking Changes 3건 수용 승인** (TASK ID · stage-manifest · edit-coordinates) | [06 §Breaking Changes](06-release-notes-2.3.0-skeleton.md#breaking-changes) |

### 1.4 산출물

- 리뷰 코멘트 기록: `_reviews/{date}-{reviewer-role}.md`
- 승인 결과: 각 문서 frontmatter `상태: draft` → `reviewed`
- 이슈 반영 필요 시: 해당 문서 Edit + `변경 이력` 업데이트

### 1.5 출구 조건

- [ ] D1, D2, D3 모두 승인
- [ ] 메인테이너가 8건 스펙의 실현 가능성 확인
- [ ] 발견된 P0 블로커 이슈 0건 (P1 이하 이슈는 2단계 중 보완 가능)

### 1.6 리스크

| 리스크 | 완화 |
|--------|------|
| D2 이월 반대 의견 (feedback archiving 전체 2.3.0에 포함 요구) | [04 §1](04-feedback-archiving-integration.md#1-역할-분담-producerconsumer) Producer/Consumer 경계 논증으로 대응 |
| Breaking Changes 3건 중 일부 거부 (예: TASK ID 마이그레이션 부담) | 경고 수준 도입 → 점진 차단 하향 전략 제시 |
| 상세 스펙 내 선택지 A/B/C 재논의 | 선택지 트레이드오프 표 근거로 조기 합의 유도 |

---

## 2단계 — 인프라 준비 (1~2주)

### 2.1 목적

Phase 2.1 착수 전 필수 인프라 확보.

### 2.2 작업 항목

| # | 작업 | 담당 | 이유 |
|:-:|------|------|------|
| T1 | **테스트 러너 도입** (Vitest 권장) | DevEx | P1 41건 테스트 실행 필요, 현재 러너 부재 ([CHANGELOG §테스트 인프라 알림](../../../CHANGELOG.md)) |
| T2 | **Phase 2.1 담당자 배정** | 개발 리드 | 3건 순차 실행 (007→016→017) |
| T3 | **Phase 2.2/2.3 담당 Pool 확보** | 개발 리드 | 8건 병렬/순차 혼합 |
| T4 | **Codex sibling 담당자 지정** | 듀얼 타깃 책임자 | 11건 전체 동기화 |
| T5 | **주간 회고 템플릿 작성** | 프로젝트 리드 | Exit Criteria 추적 |
| T6 | **CI 검증 슬롯 확보** | DevOps | [05 §2 측정 스크립트](05-verification-2.3.0.md#2-230-신규-4지표-측정법-본-문서-ssot) 4종 실행 환경 |

### 2.3 산출물

- `package.json` devDependency: `vitest` 또는 `jest`
- `scripts/test.js` 또는 `pnpm test` 스크립트 동작 확인
- `docs/archive/kit-2.3.0-roadmap/_assignments/2026-XX-phase-2.1.md` — 담당자 배정표
- `.github/workflows/verify-2.3.0.yml` — CI 슬롯

### 2.4 출구 조건

- [ ] `pnpm test` 명령이 빈 테스트라도 exit 0 반환
- [ ] Phase 2.1 담당자 확정 (≥ 1명)
- [ ] Codex sibling 담당자 확정 (≥ 1명)

### 2.5 리스크

| 리스크 | 완화 |
|--------|------|
| 테스트 러너 선정 지연 | Vitest 기본값, 별도 평가 없이 도입 |
| Phase 2.1 담당자 부재 | 메인테이너가 겸임 또는 일정 지연 수용 |

---

## 3단계 — P1 11건 구현 (3개월)

### 3.1 Phase 2.1 — 프로세스 자동화 (1~4주)

**실행 순서**: IMP-KIT-007 → 016 → 017 (순차)

**왜 순차?** 007의 훅 인프라가 016/017의 호출 지점.

| 주차 | 작업 | 중간 산출물 |
|:---:|------|------------|
| 1주 | IMP-KIT-007 RED/GREEN | Stop 훅 matcher + `/plan-review` 자동 실행 |
| 2주 | IMP-KIT-007 IMPROVE + 016 RED/GREEN | `--auto-proceed-on-pass` 플래그 |
| 3주 | IMP-KIT-016 IMPROVE + 017 RED/GREEN | 재복제 금지 Skill 제약 |
| 4주 | IMP-KIT-017 IMPROVE + Phase 2.1 통합 테스트 | dash-preview-phase3 부분 복제 |

**Phase 2.1 Exit 조건**:
- [ ] `/plan-review` 수동 호출 0회 (지표 #7)
- [ ] Human Checkpoint 수 < 3회 (지표 #6 개선)
- [ ] 재복제 감지 0건 (지표 #8)
- [ ] kit-feedback-archiving Phase 3 진입 조건 충족

### 3.2 Phase 2.2 — 에이전트 메모리/권한 보완 (5~8주)

**실행 순서**: 009 / 008 / 010 (병렬) → 011

| 주차 | 작업 |
|:---:|------|
| 5~6주 | IMP-KIT-009 + 008 + 010 병렬 (개별 담당) |
| 7주 | 세 항목 통합 테스트 + IMP-KIT-011 RED |
| 8주 | IMP-KIT-011 GREEN/IMPROVE + Phase 2.2 회귀 |

**Phase 2.2 Exit 조건**:
- [ ] 파일 이동 수동 개입 0회 (IMP-KIT-009)
- [ ] 재판정 메모리 엔트리 100% (IMP-KIT-008)
- [ ] Wireframe 재호출 ≤ 1회/세션 (IMP-KIT-010)
- [ ] edit-coordinates ajv 검증 성공률 ≥ 95% (IMP-KIT-011)

### 3.3 Phase 2.3 — 경계·네이밍 정리 (9~12주)

**실행 순서**: 015 → 013 → 012 → 014 (순차, 015 규칙이 013 입력)

| 주차 | 작업 |
|:---:|------|
| 9주 | IMP-KIT-015 전체 |
| 10주 | IMP-KIT-013 전체 (015 규칙 활용) |
| 11주 | IMP-KIT-012 전체 |
| 12주 | IMP-KIT-014 전체 + Phase 2.3 회귀 |

**Phase 2.3 Exit 조건**:
- [ ] TASK ID 일관성 100% (IMP-KIT-015)
- [ ] Phase B Checkpoint 질문 수 감소 (IMP-KIT-013)
- [ ] 중복 섹션 수정 건수 감소 (IMP-KIT-012)
- [ ] stage-manifest 스키마 변경 후 소비자 실패 0 (IMP-KIT-014)

### 3.4 공통 작업 패턴

모든 IMP-KIT는 다음 흐름:

```
1. RED   — tests/claude/{domain}/... 에 실패 테스트 작성
2. 메인테이너 확인 (PR 리뷰 또는 로컬 공유)
3. GREEN — 최소 구현
4. 단위 테스트 통과 확인
5. IMPROVE — 리팩토링
6. Codex sibling 동기화 (src/codex/ 미러 편집)
7. PR 생성 → 코드 리뷰 → merge
```

### 3.5 주간 회고

매주 금요일 (또는 Phase 전환 시점):

- Exit Criteria 대비 달성률
- 누적 단위 테스트 통과 수 (목표 41건)
- 발견된 리스크 또는 이월 후보
- Codex sibling drift 여부

---

## 4단계 — Exit Criteria 검증 (1~2주)

### 4.1 검증 항목 ([02 §8](02-p1-execution-plan.md#8-exit-criteria-230-릴리스-가능-조건))

| # | 항목 | 측정 |
|:-:|------|------|
| 1 | P1 11건 단위 테스트 | `pnpm test` 0 실패 |
| 2 | 회귀 시나리오 통과 | [05 §4](05-verification-2.3.0.md#4-회귀-시나리오-확장-dash-preview-phase3-복제) |
| 3 | 신규 4지표 달성 | `scripts/verify-*.js` 4종 |
| 4 | Codex 듀얼 타깃 drift 0 | `scripts/audit-pairing.js` |
| 5 | 2.2.0 지표 #1~#6 유지 | 회귀 측정 |

### 4.2 산출물

- `.claude/regression-2.3.0/{YYYY-MM-DD}/session.log`
- `.claude/regression-2.3.0/{YYYY-MM-DD}/metrics.json`
- Exit Criteria 검증 리포트 (릴리스 노트 첨부용)

### 4.3 출구 조건

- [ ] 5개 항목 모두 통과
- [ ] 실패 항목은 2.3.1 이월 확정 (항목별 사유 기록)

---

## 5단계 — 릴리스 & 후속 (1~2주 + 지속)

### 5.1 릴리스 작업

| 순서 | 작업 | 담당 |
|:---:|------|------|
| 1 | [06-release-notes-skeleton](06-release-notes-2.3.0-skeleton.md) → 정식 릴리스 노트 승격 (`[TBD]` → 실제 값) | 릴리스 책임자 |
| 2 | `CHANGELOG.md` `[Unreleased]` → `[2.3.0] - YYYY-MM-DD` | 릴리스 책임자 |
| 3 | 마이그레이션 가이드 공지 (BC-2.3.0-01/02/03) | 커뮤니케이션 |
| 4 | GitHub Release 생성 + 태그 `v2.3.0` | DevOps |
| 5 | `package.json` version 2.2.1 → 2.3.0 | DevOps |
| 6 | 본 로드맵 패키지 frontmatter 상태 `reviewed` → `shipped` | 메인테이너 |

### 5.2 후속 작업 (릴리스 +1개월)

| 작업 | 시점 | 근거 |
|------|------|------|
| kit-feedback-archiving Phase 3 착수 | 릴리스 +1개월 내 | [04 §2](04-feedback-archiving-integration.md#2-phase-3-진입-조건-본-로드맵이-제공) |
| 2.3.1 이월 항목 확정 + 스프린트 계획 | 릴리스 +1주 | [02 §10](02-p1-execution-plan.md#10-이월-조건) |
| P2 9건 (2.4.0 로드맵 시작) | 릴리스 +1개월 | 별도 패키지 |
| dash-preview-phase3 회고 2차 갱신 | 릴리스 후 | 원본 회고에 "2.3.0 달성 항목" 표기 |

### 5.3 릴리스 메트릭 기록

[06 §릴리스 메트릭 템플릿](06-release-notes-2.3.0-skeleton.md#릴리스-메트릭-템플릿) 채우기.

---

## 의존 관계 요약

```
[1] 리뷰 ──→ [2] 인프라 ──→ [3] Phase 2.1 ──→ Phase 2.2 ──→ Phase 2.3
                              │
                              └─ kit-feedback-archiving Phase 3 진입 조건 충족
                                                    │
                                                    ↓ (릴리스 후 착수)

[3] Phase 2.3 ──→ [4] Exit 검증 ──→ [5] 릴리스
                                         │
                                         ├─ kit-feedback-archiving Phase 3~5
                                         └─ 2.4.0 P2 백로그
```

---

## 병목 및 주의

| 항목 | 이유 | 대응 |
|------|------|------|
| **테스트 러너 부재** | 현재 리포지토리에 러너 없음 | 2단계 T1으로 우선 도입 |
| **TASK ID 마이그레이션** | 레거시 Feature 호환성 이슈 예상 | IMP-KIT-015 후방 호환 경고 수준 시작 |
| **Codex duality** | 매 IMP-KIT마다 sibling 동기화 비용 | 담당자 조기 확보, drift는 매주 모니터링 |
| **4개월 기간 이탈** | 범위 과다 | Exit Criteria 미충족 항목 2.3.1 이월 수용 |

---

## 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (5단계 상세 계획) | claude-kit roadmap author |
