<!-- kit-convert generated: 2026-04-24 -->
# Checkpoint 정책

> **결론**: 본 정책은 claude-kit 전반의 **Human Checkpoint** 처리 기준. `autoProceedOnPass: true` 플래그가 활성이고 리뷰 결과가 PASS이면 Checkpoint 자동 통과. 단 Critical 화이트리스트 타입은 플래그 무시하고 항상 정지. (IMP-KIT-016)

**스펙 근거**: `docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md`
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

## 8. 수정 요청 표준 응답 (T-REVP-01, v2.5.0)

> **T-REVP-01 (Phase A 피드백 Step 5, v2.5.0)**: Checkpoint 시 "Y/수정/N" 3 옵션 중 **"수정"** 선택의 세부 전달 형식을 표준화. 에이전트 재호출 시 이전 산출물 + 사용자 수정 지시를 구조화된 prompt 로 전달하여 컨텍스트 손실 방지.

### 8-1. Checkpoint 응답 3 옵션

Checkpoint 도달 시 에이전트 보고 말미에 고정 형식 응답 패턴을 포함한다:

> **승인 요청** (Checkpoint type: `{type}`):
> - **Y** = 현재 결과 승인 → 다음 단계 진입
> - **수정** = 세부 수정 요청 (예: "§A scope 재작성", "판정 Lite → Standard")
> - **N** = 전면 거부 (재작업 불가 이유 명시)

### 8-2. "수정" 선택 시 재호출 프로토콜

사용자가 "수정" + 자연어 지시 입력 시 메인 세션이 해당 에이전트를 재호출한다:

```json
{
  "prev_artifact": "{이전 산출 파일 절대 경로}",
  "user_modification_request": "{사용자 자연어 지시 원문}",
  "preserved_sections": ["§1", "§2"],
  "revise_sections": ["§3", "§4"]
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `prev_artifact` | string | 이전 산출 파일 경로 (필수) |
| `user_modification_request` | string | 사용자 원문 (필수) |
| `preserved_sections` | string[] | 변경 금지 섹션 (자동 감지 or 사용자 명시) |
| `revise_sections` | string[] | 수정 대상 섹션 (자동 감지 or 사용자 명시) |

### 8-3. 재호출 에이전트 지침

에이전트는 재호출 시 다음 순서를 준수한다:

1. **이전 산출물 Read** → 전체 컨텍스트 이해
2. **사용자 수정 지시 파싱** → 수정 범위 결정
3. **`preserved_sections` 유지** + **`revise_sections` 만 변경**
4. **변경 이력에 "수정 요청 반영" 기록** (기존 산출물의 변경 이력 섹션에 row 추가)
5. Agent Edit Race 주의 — 메인 Read 재호출 대상 명시 (writer-output-format.md §1-5)

### 8-4. 자동 파싱 규칙

`preserved_sections` / `revise_sections` 가 사용자 명시 없으면 에이전트가 자연어에서 자동 추론한다:

- 예: "A 섹션 scope 재작성" → `revise_sections: ["§A scope"]`, `preserved_sections: [rest]`
- 예: "§5 결정 포인트 3 번 근거 확장" → `revise_sections: ["§5-3"]`, `preserved_sections: ["§1..§5-2, §5-4..§N"]`
- 모호하면 사용자에게 재확인 (추측하지 않는다)

### 8-5. `/plan-revise` 커맨드 (선택적)

사용자가 직접 수정 요청을 트리거하는 커맨드:

```
/plan-revise {artifact-path} "수정 지시"
```

내부 로직:
1. artifact-path 에서 에이전트 유형 자동 추론
   - `.plans/ideas/00-inbox/IDEA-*.md` → plan-idea-collector
   - `.plans/drafts/{slug}/01-draft.md` → plan-draft-writer
   - `.plans/drafts/{slug}/02-prd.md` → plan-prd-writer
   - `.plans/features/active/{slug}/00-context/*.md` → plan-bridge-writer
2. §8-2 프로토콜로 해당 에이전트 재호출
3. 재호출 결과 보고 + Agent Edit Race 섹션 명시

상세: [`/plan-revise` 커맨드 문서](../../plan/commands/plan-revise.md).

### 8-6. writer 계 에이전트 연동

모든 writer 계 에이전트 (plan-idea-collector, plan-draft-writer, plan-prd-writer, plan-bridge-writer, ...) 의 `<Output_Format>` 블록은 §2-4 (writer-output-format.md) 수정 요청 응답 패턴을 포함한다. 본 §8 은 해당 패턴의 SSOT.

---

## 9. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (IMP-KIT-016 구현) | Claude (메인테이너 역할) |
| 2026-04-23 | §8 수정 요청 표준 응답 추가 (T-REVP-01, Phase A 피드백 Step 5 v2.5.0). `/plan-revise` 커맨드 정의, writer 계 에이전트 연동. | Claude (메인테이너 역할) |

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/core/rules/checkpoint-policy.md`
