# Checkpoint 정책

> **결론**: 본 정책은 claude-kit 전반의 **Human Checkpoint** 처리 기준. `autoProceedOnPass: true` 플래그가 활성이고 리뷰 결과가 PASS이면 Checkpoint 자동 통과. 단 Critical 화이트리스트 타입은 플래그 무시하고 항상 정지. (IMP-KIT-016)

**스펙 근거**: `docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md`
**유틸 구현**: `src/claude/core/checkpoint/auto-proceed.js`
**화이트리스트 SSOT**: `src/claude/core/_constants/critical-checkpoints.json`

---

## 1. Checkpoint 타입

커맨드·에이전트가 Human Checkpoint를 호출할 때 `type` 필드를 지정해야 한다. 타입 목록:

| type | 설명 | Critical? |
|------|------|:---:|
| `destructive` | 파일 이동·삭제, 데이터 손실 가능성 | ✅ |
| `external-api-call` | 외부 시스템에 영향을 주는 호출 | ✅ |
| `breaking-change` | Breaking Change 배포 직전 | ✅ |
| `initial-approval-gate` | 최초 승인 게이트 | ✅ |
| `review-approval` | 리뷰 승인 (PRD, Wireframe 등) | ❌ |
| `scope-confirmation` | 범위·경로 확인 (plan-draft 등) | ❌ |
| `checkpoint-generic` | 기타 범용 확인 | ❌ |

Critical 표기는 `critical-checkpoints.json`의 `whitelist` 배열과 일치.

---

## 2. autoProceedOnPass 플래그

### 2.1 설정 위치

- **글로벌**: `~/.claude/settings.json`의 `"autoProceedOnPass": true|false` (기본 `false`)
- **커맨드 플래그**: `--auto-proceed-on-pass` (override)
- **세션 환경 변수**: `CLAUDE_AUTO_PROCEED=true`

### 2.2 적용 우선순위

커맨드 플래그 > 환경 변수 > 글로벌 설정 > 기본값(false)

---

## 3. 결정 플로우

```
Checkpoint 도달
  ├─ [type이 Critical 화이트리스트 매칭] → 항상 halt (플래그 무관)
  ├─ [autoProceedOnPass=false] → halt (기존 동작)
  ├─ [autoProceedOnPass=true + reviewResult=PASS] → proceed (자동 통과 + 로그)
  └─ [기타 (FAIL/UNKNOWN/미지정)] → halt (안전)
```

순수 함수 구현: `src/claude/core/checkpoint/auto-proceed.js`의 `decideCheckpoint()`.

---

## 4. 로그 요구사항

`autoProceedOnPass`로 자동 진행한 Checkpoint는 다음 필드와 함께 기록해야 한다:

```json
{
  "checkpoint_id": "...",
  "type": "review-approval",
  "review_result": "PASS",
  "auto_proceeded": true,
  "timestamp": "2026-04-21T10:00:00Z"
}
```

로그 위치: `~/.claude/logs/checkpoints.jsonl` (IMP-KIT-024 텔레메트리 통합 시점에 표준화).

---

## 5. 커맨드·에이전트 준수 원칙

claude-kit의 모든 커맨드·에이전트는 Human Checkpoint 호출 시 본 정책을 참조한다. 개별 파일 수정 없이 **정책 문서 1건**이 SSOT 역할.

- **신규 커맨드**: type 필드 명시 + 본 정책 링크
- **기존 커맨드**: 암묵적으로 본 정책을 따른다고 간주 (Phase 2.1 마무리 통합 시 명시적 참조 추가 가능)

---

## 6. 피드백 아카이빙 연계 (IMP-KIT-007 체인)

자동 진행된 Checkpoint 정보는 kit-feedback-archiving Phase 3 구현 시 엔트리 metadata에 포함된다:

```json
{ "usage": { "checkpoints_auto_proceeded": 2, "checkpoints_user_confirmed": 1 } }
```

상세: `docs/plan/kit-feedback-archiving/06-integration-with-roadmap.md` §3.2.

---

## 7. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (IMP-KIT-016 구현) | Claude (메인테이너 역할) |
