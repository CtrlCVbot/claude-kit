---
제목: Phase 2.1 담당자 배정표 — 프로세스 자동화 (1~4주)
작성일: 2026-04-21
배정일: 2026-04-21 (Claude Code 임시 대행)
대상: 개발 리드, Phase 2.1 담당자
관련 계획: [08-next-steps §3.1](../08-next-steps-execution-plan.md#31-phase-21--프로세스-자동화-1~4주)
상태: assigned (임시 대행 — 사용자가 실제 담당 지정 시 갱신)
---

# Phase 2.1 Assignment

> **결론**: Phase 2.1은 IMP-KIT-007 → 016 → 017 **순차 실행**. 주 담당자 1~2명 + Codex sibling 담당 1명. 착수 전 각 담당자가 해당 스펙의 §3 TDD 단계를 리뷰하고 본 문서 "착수 체크리스트" §3에 기입.

---

## 1. 배정 대상

| ID | 제목 | 공수 | 주 담당 | Codex sibling | PR 소유자 |
|----|------|:---:|:-------:|:-------------:|:--------:|
| **IMP-KIT-007** | `/plan-review` 자동 후속 트리거 | S | Claude Code (임시) | Claude Code (임시) | Claude Code (임시) |
| **IMP-KIT-016** | Checkpoint 자동 진행 플래그 | M | Claude Code (임시) | Claude Code (임시) | Claude Code (임시) |
| **IMP-KIT-017** | 재복제 금지 Skill 강제 | S | Claude Code (임시) | Claude Code (임시) | Claude Code (임시) |

### 배정 옵션

- **옵션 A: 단일 담당자** — 1명이 3건 순차 실행 (4주 풀타임) ⭐ **현재 선택** (Claude가 3건 순차 수행)
- **옵션 B: 2인 분담** — 007/017 담당자 + 016 담당자
- **옵션 C: 3인 분담** — 각 1건씩, 016 담당자가 리드

**현재 상태**: 옵션 A (Claude 단일 대행). 실제 사람 담당자로 전환 시 옵션 B 추천 — 007/017이 훅 인프라 공통, 016은 Critical 화이트리스트 설계 독립.

---

## 2. 주간 목표

| 주차 | 담당자 활동 | 산출물 |
|:---:|------------|--------|
| 1주 | IMP-KIT-007 RED/GREEN | PR #1 (Stop 훅 matcher) |
| 2주 | IMP-KIT-007 IMPROVE + 016 RED/GREEN | PR #2 (auto-proceed 플래그) |
| 3주 | IMP-KIT-016 IMPROVE + 017 RED/GREEN | PR #3 (재복제 금지 원칙) |
| 4주 | IMP-KIT-017 IMPROVE + Phase 2.1 통합 테스트 | 통합 PR + Phase 2.1 Exit 검증 |

---

## 3. 착수 체크리스트 (담당자 기입)

각 담당자는 착수 전 아래 항목을 확인하고 체크.

### IMP-KIT-007 담당 (Claude Code — 임시)

- [ ] [IMP-KIT-007 스펙](../03-p1-detailed-specs/IMP-KIT-007-plan-review-auto-trigger.md) §1~§8 정독 완료 — 구현 착수 시점에 수행
- [ ] Stop 훅 인프라([scripts/setup.js](../../../../scripts/setup.js) `buildHooksConfig`) 기존 구조 이해
- [ ] kit-feedback-archiving Phase 3 착수 조건 인지 (본 작업이 전제)
- [ ] Codex v1 hook 호환성 분류(`src/claude/_meta/codex-portability.json`) 확인 완료

### IMP-KIT-016 담당 (Claude Code — 임시)

- [ ] [IMP-KIT-016 스펙](../03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md) §1~§8 정독 완료 — 구현 착수 시점
- [ ] 기존 Checkpoint 호출 지점 약 8~12곳 탐색 완료
- [ ] Critical 화이트리스트 초안 작성 (4건 이상)
- [ ] 피드백 아카이빙 훅 체인 비차단 보증 설계 리뷰

### IMP-KIT-017 담당 (Claude Code — 임시)

- [ ] [IMP-KIT-017 스펙](../03-p1-detailed-specs/IMP-KIT-017-no-duplication-skill.md) §1~§8 정독 완료 — 구현 착수 시점
- [ ] 기존 에이전트 프롬프트 30+건 위치 파악 완료
- [ ] 유사도 임계값 초안(80%) 수용 여부 검토
- [ ] `golden-principles.md` #13 추가 위치 검토

### Codex sibling 담당 (Claude Code — 임시)

- [ ] 3건 모두의 `src/codex/` 대응 경로 확인 — 구현 착수 시점
- [ ] `scripts/audit-pairing.js`로 현재 drift 0 확인
- [ ] Codex v1 hook runtime 제약 확인 (특히 IMP-KIT-007 Stop 훅)

> **주의**: 위 체크리스트는 **실제 Phase 2.1 구현 착수 시점**에 Claude가 순차 수행. 현재는 2단계(인프라 준비) 완료 상태로, 사용자 지시가 있을 때 Phase 2.1 실구현이 시작된다.

---

## 4. 의사소통 채널

| 주제 | 채널 | 주기 |
|------|------|------|
| 일일 진행 공유 | __________ | 매일 |
| 주간 회고 | [weekly-retro-template.md](weekly-retro-template.md) 복제 | 금요일 |
| 블로커 긴급 논의 | __________ | 실시간 |
| PR 리뷰어 | 최소 1명 (다른 Phase 2.1 담당자 권장) | PR마다 |

---

## 5. Exit 조건 (Phase 2.1 → 2.2 진행 기준)

모두 달성 시 Phase 2.2 착수:

- [ ] IMP-KIT-007 단위 테스트 통과 (최소 3건)
- [ ] IMP-KIT-016 단위 테스트 통과 (최소 3건)
- [ ] IMP-KIT-017 단위 테스트 통과 (최소 3건)
- [ ] 회귀 지표: `/plan-review` 수동 호출 0회
- [ ] 회귀 지표: Human Checkpoint 수 < 3회
- [ ] 회귀 지표: 재복제 감지 0건
- [ ] Codex sibling drift 0 (audit-pairing 통과)
- [ ] 3건 모두 Phase 2.1 최종 PR 머지 완료
- [ ] kit-feedback-archiving Phase 3 진입 조건 충족 확인

---

## 6. 리스크 로그 (담당자가 발견 시 기입)

| 일시 | 발견자 | 리스크 | 영향 | 대응 | 상태 |
|------|--------|--------|:---:|------|:---:|
| | | | | | |

---

## 7. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 템플릿 초안 작성 (배정 대기) | Claude (메인테이너 역할) |
| 2026-04-21 | Claude Code 임시 대행 기입 (사용자 지시 "2단계는 다 클로드가 대신 수행") | Claude Code |
