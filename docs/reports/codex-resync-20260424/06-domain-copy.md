# 06. Domain: copy (26 entries)

> **copy 도메인은 fidelity (시각적·상호작용 충실도) 검증 파이프라인.** 3개 시나리오(Greenfield / Partial / Fidelity Correction)에 맞춰 레퍼런스 스크린샷과 현재 구현을 비교한다.

## 요약

| 항목 | 값 |
|------|---|
| pairing entries | 26 (paired 16 + codex-skip 5 + unpaired 5) |
| codex 물리 파일 수 | 16 + `.gitkeep` 1 = **17 파일** |
| REVIEW NEEDED marker | **16 파일** (paired-review 15 + 중복 1 = 16) |
| 관련 exception | EX-010, EX-011, EX-012, EX-013, EX-014 (5건 — 전부 copy hooks) |
| 특징 | 4개 도메인 중 **가장 많은 REVIEW + 가장 많은 skip/unpaired** |

## 타입별 집계

| 타입 | paired | skip | unpaired | 소계 |
|------|:---:|:---:|:---:|:---:|
| agent | 4 | 0 | 0 | 4 |
| command | 7 | 0 | 0 | 7 |
| hook | 0 | 5 | 0 | 5 |
| rule | 0 | 0 | 5 | 5 |
| skill | 5 | 0 | 0 | 5 |
| **합계** | **16** | **5** | **5** | **26** |

**주목**: copy 도메인은 hook / rule 이 **Codex 에서 전혀 변환되지 않는다** (전량 skip 또는 unpaired). Claude 에만 존재하고 Codex 쪽은 runtime 검증 후 도입 예정.

## Agents (4 paired, 전원 paired-review)

| Identity | Status | Hash | REVIEW | 비고 |
|----------|:---:|---|:---:|------|
| [copy-fidelity](../../../src/codex/copy/agents/copy-fidelity.md) | ✓ | `c8c5d6b3` | 🔷 pr | Visual fidelity 갭 분석 |
| [copy-interaction-fidelity](../../../src/codex/copy/agents/copy-interaction-fidelity.md) | ✓ | `6b92304f` | 🔷 pr | Interaction fidelity 갭 분석 |
| [copy-qa-reviewer](../../../src/codex/copy/agents/copy-qa-reviewer.md) | ✓ | `4af71c65` | 🔷 pr | 최종 QA 리뷰 |
| [copy-reference-baseline](../../../src/codex/copy/agents/copy-reference-baseline.md) | ✓ | `2541ca3d` | 🔶🔷 **wc + pr** | evidence 수집 (write-capable) — **REVIEW NEEDED 중복 marker** |

🔷 pr = paired-review strategy (Codex runtime 검증 필요)
🔶 wc = write-capable agent

## Commands (7 paired, 전원 paired-review)

| Identity | Hash | REVIEW | 비고 |
|----------|---|:---:|------|
| [copy-reference-refresh](../../../src/codex/copy/commands/copy-reference-refresh.md) | `d82dcd37` | 🔷 pr | evidence 캡처 갱신 |
| [copy-visual-review](../../../src/codex/copy/commands/copy-visual-review.md) | `bd82ff59` | 🔷 pr | Visual fidelity 리뷰 |
| [copy-interaction-review](../../../src/codex/copy/commands/copy-interaction-review.md) | `a2dd95ad` | 🔷 pr | Interaction fidelity 리뷰 |
| [copy-gap-board](../../../src/codex/copy/commands/copy-gap-board.md) | `bc91c86b` | 🔷 pr | 갭 통합 + priority 배정 |
| [copy-plan-unit](../../../src/codex/copy/commands/copy-plan-unit.md) | `c28d9181` | 🔷 pr | Execution Unit 계획 |
| [copy-verify](../../../src/codex/copy/commands/copy-verify.md) | `6c270b46` | 🔷 pr | 통합 검증 |
| [copy-closeout](../../../src/codex/copy/commands/copy-closeout.md) | `98f8dd7e` | 🔷 pr | 결과 확정 |

## Skills (5 paired, 전원 paired-review)

| Identity | Hash | REVIEW | 비고 |
|----------|---|:---:|------|
| [copy-pipeline](../../../src/codex/copy/skills/copy-pipeline/SKILL.md) | `165989fe` | 🔷 pr | copy 전체 파이프라인 오케스트레이션 |
| [copy-evidence-management](../../../src/codex/copy/skills/copy-evidence-management/SKILL.md) | `8a679a11` | 🔷 pr | evidence 관리 (manifest + 네이밍) |
| [copy-gap-analysis](../../../src/codex/copy/skills/copy-gap-analysis/SKILL.md) | `1731c161` | 🔷 pr | 갭 분석 |
| [copy-qa-workflow](../../../src/codex/copy/skills/copy-qa-workflow/SKILL.md) | `b5ec47a4` | 🔷 pr | QA 워크플로우 |
| [copy-closeout-workflow](../../../src/codex/copy/skills/copy-closeout-workflow/SKILL.md) | `58c78e5c` | 🔷 pr | closeout 워크플로우 |

## Hooks (5 codex-skip — **Codex 파일 생성 안 함**)

| Identity | Status | Exception | 사유 |
|----------|:---:|:---:|------|
| copy-evidence-reminder | ⊘ skip | EX-010 | evidence 상태 리마인더 (Codex surface 미검증) |
| copy-doc-drift-check | ⊘ skip | EX-011 | 문서 drift 검사 (동상) |
| copy-scope-guard | ⊘ skip | EX-012 | 작업 범위 가드 |
| copy-variant-env-guard | ⊘ skip | EX-013 | variant/host 환경변수 가드 |
| copy-gate-stop | ⊘ skip | EX-014 | gate 정지 hook |

**codex-skip 이유**: Claude 전용 hook API 기능 (특히 Stop event 의 복잡한 상태 의존) 을 Codex runtime 에서 1:1 재현하기 어려워 Phase 보류. 각 exception 은 resolved 또는 active 상태로 [08 Exception Handling](08-exception-handling.md) 에서 상세 설명.

## Rules (5 unpaired — **Claude 전용**)

| Identity | Status | 비고 |
|----------|:---:|------|
| copy-fidelity-rule | — unpaired | fidelity 평가 기준 |
| copy-evidence-rule | — unpaired | evidence 관리 표준 |
| copy-gates-rule | — unpaired | gate 정의 (P0/P1/P2) |
| copy-commands-rule | — unpaired | 커맨드 실행 원칙 (scenarios A/B/C) |
| copy-variant-rule | — unpaired | variant/host map 표준 |

**unpaired 이유**: 위 rules 는 Claude `src/claude/copy/rules/` 에 존재하지만 Codex 로 아직 변환되지 않음. Codex Rules 는 exec / approval policy 형식이라 Claude guidance-style rule 과 매핑이 복잡. AGENTS.md inline merge 도 아직 미적용. 설계적 결정 대기 상태.

## 변환 시 주의사항

- **paired-review 16건 전량**: copy 도메인의 paired 자산은 **100%** paired-review strategy. Codex runtime 에서 실제 동작 검증 전에는 사용 자제 권장.
- **copy-reference-baseline**: 유일한 write-capable + paired-review 이중 marker 파일. evidence 파일을 생성하므로 (실제 PNG 등을 WriteFile) Codex 환경에서 파일 write 권한이 필요.
- **scenarios A/B/C 분기**: copy 파이프라인은 시나리오에 따라 실행 커맨드 순서가 완전히 다르다 (plan 의 커맨드 순서 SSOT 참조). Codex runtime 에서도 동일 분기 로직이 유효한지 확인.
- **copy-skip hooks**: 5개 모두 EX-010~014 로 exception-registry 등록. active 상태 (EX-009 과 마찬가지로 설계 미결). Codex 공식 hooks 안정화 시점에 재검토 필요.

## Claude 원본과의 비교

paired 16 entries 는 1:1 대응:

```
Claude:  src/claude/copy/{type}/{name}{.md|.js}
Codex:   src/codex/copy/{type}/{name}{.md|.js}
```

skip 5 hooks 와 unpaired 5 rules 는 **Claude 만 존재**:
- hooks: `src/claude/copy/hooks/*.js` (5개)
- rules: `src/claude/copy/rules/*.md` (5개)

두 그룹 모두 Codex 쪽은 빈 상태. 향후 전환 시 exception-registry 와 pairing-registry 갱신 필요.

## 참조

- [07 REVIEW NEEDED Catalog](07-review-needed-catalog.md) — copy 도메인 16개 marker 파일 상세 검토 가이드
- [08 Exception Handling](08-exception-handling.md) — EX-010~014 상세
- [12 Followups](12-followups.md) — copy hooks / rules Codex 전환 후속 결정
