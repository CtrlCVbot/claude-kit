---
ID: IMP-KIT-016
제목: Human Checkpoint 자동 진행 플래그
우선순위: P1
영향 도메인: core
RICE: R5 × I3 × C3 ÷ E2 = 22.5
공수: M (3일)
Phase: 2.1
원본 타임라인: #8, #21 외 다수 (dash-preview-phase3 회고)
선행 의존: IMP-KIT-007 (본 로드맵 Phase 2.1 선행 — 훅 체인 비차단 전제)
이해관계자 승인일: 2026-04-21
구현 완료일: 2026-04-21 (Claude Code 대행, 커밋 예정)
상태: shipped
---

# IMP-KIT-016 — Human Checkpoint 자동 진행 플래그

> **결론**: `--auto-proceed-on-pass` 플래그 도입으로 리뷰 PASS한 Checkpoint는 자동 진행. Critical Checkpoint는 화이트리스트로 보호. 세션당 Human Checkpoint 누적 피로를 3회 이하로 감소시키는 것이 목표.

---

## 1. 문제 정의

매 단계마다 **확인 요청이 누적**되어 사용자 피로도 증가. dash-preview-phase3 회고에서 세션당 5+회 Checkpoint 발생.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-016 라인 238~247](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md)

### 현재 상태 (2.2.0 완료 시점)

모든 Human Checkpoint는 정지 기본값. `/plan-*`, `/dev-*`, `/copy-*` 커맨드 전반에서 빈번.

---

## 2. 제안 해결안

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: `--auto-proceed-on-pass` 플래그 + Critical 화이트리스트** ⭐ | 리뷰 PASS 시 자동 진행, 화이트리스트 Checkpoint는 항상 정지 | 안전·빠름 균형, 사용자 제어 유지 | 화이트리스트 관리 필요 |
| B: 전역 자동 진행 옵션 | 세션 단위 `autoProceed: true` | 단순 | 중요 결정도 건너뜀, 위험 |
| C: 요약 보고만 | Checkpoint 대신 요약만 출력 | 빠름 | 승인 의미 상실 |

**선택: A** — 안전성·효율성 균형.

### Critical Checkpoint 화이트리스트

다음은 **항상 정지** (플래그 무관):

- 파일 이동·삭제 직전 (`destructive`)
- 외부 API 호출 (`/plan-bridge` 중 Codex sibling 동기화 등)
- Breaking Change 배포 직전
- 사용자 최초 승인 게이트 (`/plan-screen` 승인 분기)

화이트리스트는 `src/claude/core/_constants/critical-checkpoints.json`으로 관리.

### 아키텍처

```
Checkpoint 도달
  ├─ [Critical 화이트리스트 매칭] → 항상 정지
  ├─ [auto-proceed=true + 리뷰 PASS] → 자동 진행 + 로그 기록
  └─ [기타] → 정지 (기존 동작)
```

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED

`tests/claude/core/checkpoint/auto-proceed.test.ts`:

```typescript
it('--auto-proceed-on-pass + 리뷰 PASS 시 자동 진행', async () => {
  const result = await runWithCheckpoint({ autoProceedOnPass: true, reviewResult: 'PASS' })
  expect(result.userPromptCount).toBe(0)
})
it('Critical 화이트리스트 매칭 시 플래그 무시', async () => { /* destructive 사례 */ })
it('리뷰 FAIL 시 자동 진행하지 않음', async () => { /* 안전성 */ })
```

### 3.2 GREEN

1. `src/claude/core/_constants/critical-checkpoints.json` (신규) — 화이트리스트
2. `src/claude/core/checkpoint/auto-proceed.js` (신규) — 플래그 처리 로직
3. 기존 Checkpoint 호출 지점(약 8~12곳)에 `auto-proceed` 참조 삽입
4. `src/claude/core/rules/checkpoint-policy.md` (신규) — 정책 문서

### 3.3 IMPROVE

- Checkpoint 호출을 공통 유틸 함수로 추상화 (`checkpoint(type, data)`)
- 화이트리스트 업데이트 시 영향 지점 자동 탐지 스크립트

---

## 4. 영향 파일

### 수정

| 파일 | 변경 |
|------|------|
| 기존 Checkpoint 호출 커맨드·에이전트 (~10건) | `auto-proceed` 참조 삽입 |
| `scripts/setup.js` | 플래그 기본값 설정 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/core/_constants/critical-checkpoints.json` | 화이트리스트 |
| `src/claude/core/checkpoint/auto-proceed.js` | 처리 로직 |
| `src/claude/core/rules/checkpoint-policy.md` | 정책 문서 |
| `tests/claude/core/checkpoint/auto-proceed.test.ts` | 회귀 테스트 |

### 듀얼 타깃 (Codex)

동등 파일 `src/codex/core/**` 3건.

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] 플래그 on + PASS → 자동 진행
- [ ] Critical 화이트리스트 매칭 → 정지 유지
- [ ] FAIL/UNKNOWN 리뷰 → 정지 유지
- [ ] 플래그 off → 모든 Checkpoint 정지 (기존 동작)

### 5.2 회귀 시나리오

- [ ] 세션당 Human Checkpoint 수 **< 3회** (지표 #6 개선)
- [ ] 피드백 아카이빙 훅 체인 비차단 확인 ([04 §3.1](../04-feedback-archiving-integration.md#31-imp-kit-016--checkpoint-자동-진행-플래그))

### 5.3 후방 호환

- [ ] 플래그 미지정 시 기존 동작 유지
- [ ] Critical 화이트리스트 최소 4건 포함

---

## 6. 롤백 시나리오

1. 플래그 opt-in으로 전환 (`autoProceedOnPass` 기본 false)
2. 화이트리스트·정책 문서는 유지 (가이드라인 활용)

---

## 7. 연관 백로그

- **IMP-KIT-007** (P1, 선행): 자동 트리거 훅 체인의 비차단 전제
- **IMP-KIT-017** (P1): 재복제 금지 — 자동 진행 시 복제 감지 여전히 작동
- **kit-feedback-archiving**: auto-proceed 상태가 엔트리 메타데이터에 기록 ([04 §3.1](../04-feedback-archiving-integration.md))

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 미니 스펙 초안 (리뷰 MEDIUM §3.2.1 해소) | claude-kit roadmap author |
