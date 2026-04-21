# Checkpoint 정책 (Codex)

> **결론**: 본 정책은 Codex runtime의 **Human Checkpoint** 처리 기준. Claude peer: `src/claude/core/rules/checkpoint-policy.md` (동일 원칙).

**스펙 근거**: `docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md`
**유틸 구현**: `src/codex/core/checkpoint/auto-proceed.js`
**화이트리스트 SSOT**: `src/codex/core/_constants/critical-checkpoints.json`

---

## 1. Checkpoint 타입

| type | 설명 | Critical? |
|------|------|:---:|
| `destructive` | 파일 이동·삭제, 데이터 손실 가능성 | ✅ |
| `external-api-call` | 외부 시스템 호출 | ✅ |
| `breaking-change` | Breaking Change 배포 직전 | ✅ |
| `initial-approval-gate` | 최초 승인 게이트 | ✅ |
| `review-approval` | 리뷰 승인 | ❌ |
| `scope-confirmation` | 범위·경로 확인 | ❌ |
| `checkpoint-generic` | 기타 범용 | ❌ |

---

## 2. autoProceedOnPass 플래그

### 2.1 설정 위치

- **글로벌**: `~/.codex/settings.json`의 `"autoProceedOnPass": true|false` (기본 `false`)
- **커맨드 플래그**: `--auto-proceed-on-pass`
- **환경 변수**: `CODEX_AUTO_PROCEED=true`

### 2.2 우선순위

커맨드 플래그 > 환경 변수 > 글로벌 설정 > 기본값(false)

---

## 3. 결정 플로우

Claude peer와 동일:

```
Checkpoint 도달
  ├─ [Critical 매칭] → halt
  ├─ [플래그 false] → halt
  ├─ [플래그 true + PASS] → proceed
  └─ [기타] → halt
```

순수 함수 구현: `src/codex/core/checkpoint/auto-proceed.js`의 `decideCheckpoint()`.

---

## 4. 로그

`~/.codex/logs/checkpoints.jsonl` (IMP-KIT-024 통합 시점 표준화).

---

## 5. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (IMP-KIT-016 구현, Codex sibling) | Claude (메인테이너 역할) |
