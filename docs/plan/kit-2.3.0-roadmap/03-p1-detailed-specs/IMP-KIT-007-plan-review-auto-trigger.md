---
ID: IMP-KIT-007
제목: `/plan-review` 자동 후속 트리거
우선순위: P1
영향 도메인: plan, core
RICE: R4 × I3 × C4 ÷ E2 = 24
공수: S (1~2일)
Phase: 2.1
원본 타임라인: #10 (dash-preview-phase3 회고)
선행 의존: 없음
이해관계자 승인일: 2026-04-21
상태: reviewed
---

# IMP-KIT-007 — `/plan-review` 자동 후속 트리거

> **결론**: `/plan-prd`·`/plan-draft`·`/plan-wireframe` 완료 후 `/plan-review`를 Stop 훅으로 자동 실행. kit-feedback-archiving Phase 3의 **메인 이벤트 소스**이기도 하지만, 본 스펙은 **트리거 부분만** 다룬다 ([04-feedback-archiving-integration §1](../04-feedback-archiving-integration.md#1-역할-분담-producerconsumer)).

---

## 1. 문제 정의

리뷰 단계가 **사용자 수동 호출 의존**. 누락 시 리뷰 없이 다음 단계 진행되어 품질 저하 리스크.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-007 라인 111~124](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md)

### 현재 상태 (2.2.0 완료 시점)

`src/claude/plan/commands/plan-review.md` 커맨드는 존재하지만, 선행 커맨드와 자동 체이닝 없음. 사용자가 기억해야 함.

---

## 2. 제안 해결안

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: Stop 훅 + autoReview 설정** ⭐ | matcher로 3개 커맨드 감지, `/plan-review` 자동 호출 | 기존 훅 인프라 재사용, kit-feedback-archiving과 체인 가능 | 사용자가 off 원할 시 설정 필요 |
| B: 각 커맨드 내부 호출 | 각 커맨드 끝에서 직접 호출 | 단순 | 재사용성 낮음, 훅 인프라 활용 불가 |
| C: 별도 워크플로우 커맨드 | `/plan-flow`처럼 통합 | 명시적 | 기존 3개 커맨드 의미 약화 |

**선택: A** — kit-feedback-archiving과 훅 체인 공유 가능한 구조.

### 훅 설정

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "^/plan-(prd|draft|wireframe)$",
        "hooks": [
          { "type": "command", "command": "node .../plan-review-trigger.js" }
        ]
      }
    ]
  }
}
```

### autoReview 설정

`settings.json` 또는 `.claude/settings.local.json`의 `autoReview: true|false` (기본 `true`). 사용자가 off 시 훅 스킵.

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED

`tests/claude/plan/hooks/plan-review-trigger.test.ts`:

```typescript
it('/plan-prd 종료 → /plan-review 자동 실행', async () => {
  await runCommand('/plan-prd feat-x')
  expect(await getLastCommand()).toBe('/plan-review feat-x')
})
it('autoReview: false 시 호출 없음', async () => { /* off 분기 */ })
it('기타 커맨드(/plan-idea 등)는 트리거 안 함', async () => { /* matcher 검증 */ })
```

### 3.2 GREEN

1. `src/claude/plan/hooks/plan-review-trigger.js` (신규) — matcher 매칭 시 `/plan-review` 호출
2. `scripts/setup.js` — `buildHooksConfig`에 Stop matcher 추가
3. `src/claude/core/rules/settings-reference.md` — `autoReview` 설정 문서화

### 3.3 IMPROVE

- kit-feedback-archiving Phase 3 훅 체인 주입 지점 표식 (`// chain-point: feedback-collector`)

---

## 4. 영향 파일

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/plan/hooks/plan-review-trigger.js` | 트리거 스크립트 |
| `tests/claude/plan/hooks/plan-review-trigger.test.ts` | 회귀 테스트 |

### 수정

| 파일 | 변경 |
|------|------|
| `scripts/setup.js` | `buildHooksConfig` Stop matcher 확장 |
| `src/templates/AGENTS.md.template` | autoReview 언급 추가 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 |
|------|------|
| `src/codex/plan/hooks/plan-review-trigger.js` | 동등 스크립트 (Codex v1 hook 호환 확인: `_meta/codex-portability.json`) |

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] 3개 커맨드 각각 `/plan-review` 자동 트리거
- [ ] autoReview: false 시 호출 없음
- [ ] matcher 외 커맨드는 무영향

### 5.2 회귀 시나리오

- [ ] `/plan-review` 수동 호출 **0회** (지표 #7)
- [ ] 훅 발동 성공률 ≥ 99%

### 5.3 후방 호환

- [ ] 기존 `/plan-review` 수동 호출도 정상 동작
- [ ] 훅 부재 시나리오(초기 프로젝트)에서도 동작

---

## 6. 롤백 시나리오

1. `scripts/setup.js`에서 Stop matcher 제거
2. `.claude/settings.local.json`의 `autoReview: false` 수동 설정 안내

---

## 7. 연관 백로그

- **IMP-KIT-016** (P1): Checkpoint 자동 진행 — 본 훅이 Checkpoint 대기에서 막히지 않도록 연동
- **IMP-KIT-017** (P1): 재복제 금지 — 자동 트리거 시 리뷰 내용의 재복제 방지
- **kit-feedback-archiving Phase 3**: 본 훅이 feedback-collector의 **메인 이벤트 소스** ([04-feedback-archiving-integration §1](../04-feedback-archiving-integration.md))

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 미니 스펙 초안 (리뷰 MEDIUM §3.2.1 해소) | claude-kit roadmap author |
