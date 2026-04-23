# T-RACE-01 — `agent-file-ownership.md` 룰 신설

**제안**: P-3 (RACE)
**원본 피드백**: I-03 (High), N-02
**우선순위**: 🟠 P1 High
**릴리스**: v2.4.1
**선행**: 없음
**후행**: 모든 write-capable 에이전트 프롬프트 갱신 (후속)

## 목적

병렬 에이전트 호출 시 Epic 공통 파일(`01-children-features.md`) 편집 race 차단. 각 파일 유형별 소유 에이전트 매트릭스를 SSOT 로 확립.

## 수행 내용

1. `src/claude/core/rules/agent-file-ownership.md` 신규 룰 작성:

   ```markdown
   # Agent File Ownership Matrix

   > **결론**: 병렬 에이전트 호출 시 파일 편집 race 방지. 파일 유형별 "1 차 작성 / 후속 갱신 / 메인 전담" 3 구분 SSOT.

   **관련 룰**: verification.md (Agent Edit Race 섹션)

   ---

   ## 1. 매트릭스

   | 파일 유형 | 1 차 작성 | 후속 갱신 | 메인 전담 (race 위험) |
   |-----------|---------|----------|---------------------|
   | `.plans/ideas/00-inbox/IDEA-*.md` | plan-idea-collector | plan-idea-screener / plan-draft-writer / plan-prd-writer / plan-bridge-writer | — |
   | `.plans/ideas/backlog.md` | plan-idea-collector | plan-idea-screener, **plan-state-sync.js (hook)** | — |
   | `.plans/epics/*/EPIC-*/00-epic-brief.md` | 메인 (`/plan-epic`) | plan-idea-collector (§7 자식 IDEA 링크만) | 메인 (§3 범위, §4 표 등) |
   | `.plans/epics/*/EPIC-*/01-children-features.md` | 메인 (`/plan-epic`) | plan-idea-collector (F{N} IDEA 필드), **plan-state-sync.js (F{N} 상태 필드)** | **메인 전담** (§1 전체 구조, §2 매트릭스 등) |
   | `.plans/epics/*/EPIC-*/index.md` | 메인 (`/plan-epic`) | 메인 (advance 시) | — |
   | `.plans/drafts/{slug}/01-draft.md` | plan-draft-writer | — | — |
   | `.plans/drafts/{slug}/07-routing-metadata.md` | plan-draft-writer | — | — |
   | `.plans/drafts/{slug}/02-prd.md` | plan-prd-writer | — | — |
   | `.plans/features/active/{slug}/00-context/01-product-context.md` | plan-bridge-writer | — | — |
   | `.plans/features/active/{slug}/00-context/02-scope-boundaries.md` | plan-bridge-writer | — | — |
   | `.plans/features/active/{slug}/00-context/03-design-decisions.md` | plan-bridge-writer | — | — |
   | `.plans/features/active/{slug}/00-context/04-implementation-hints.md` | plan-bridge-writer | `/dev-feature` (T-BKLG-03 활성화 시 역기록) | — |
   | `.plans/features/active/{slug}/00-context/08-epic-binding.md` | plan-bridge-writer | **plan-state-sync.js (§7 상태 표)** | 메인 (§1 Epic 상태 라인) |

   ## 2. 소유권 해석

   ### 2-1. 1 차 작성
   해당 파일 유형을 **처음 생성** 하는 주체. 한 파일당 1 주체.

   ### 2-2. 후속 갱신
   1 차 작성 후 **부분 수정** 하는 주체. 수정 범위는 각 에이전트 프롬프트에 명시된 필드로 제한.

   ### 2-3. 메인 전담 (race 위험)
   병렬 에이전트 호출 시 race 위험이 있는 파일은 **메인 세션만 편집**. 서브 에이전트에게 "편집 금지" 명시.

   ## 3. 시행 방법

   ### 3-1. 에이전트 프롬프트 주입
   각 에이전트 프롬프트 상단에 본 룰 참조 링크 + 해당 에이전트의 소유 파일 목록.

   예(plan-bridge-writer):
   ```
   <File_Ownership>
   참조: src/claude/core/rules/agent-file-ownership.md

   1 차 작성 권한: `.plans/features/active/{slug}/00-context/*.md` (5 파일)
   후속 갱신 권한: 없음 (IDEA/Epic 파일 편집 금지)
   메인 전담 파일: `.plans/epics/.../01-children-features.md` (편집 시 에러)
   </File_Ownership>
   ```

   ### 3-2. verification.md 섹션 추가
   "Agent File Ownership" 섹션 신설 — 본 매트릭스 요약 + 위반 감지 패턴.

   ## 4. 변경 이력

   | 날짜 | 내용 |
   |------|------|
   | 2026-04-23 | 초안 — T-RACE-01 (IMP-AGENT-004 확장) |
   ```

2. `src/claude/core/rules/verification.md` Agent Edit Race 섹션에 "Agent File Ownership" 서브섹션 추가 (위 매트릭스 링크 + 요약)

## AC

- [ ] `agent-file-ownership.md` 존재 (≥100 줄)
- [ ] 파일 유형 ≥ 13 행 매트릭스 포함
- [ ] "1 차 작성 / 후속 갱신 / 메인 전담" 3 구분 명시
- [ ] `verification.md` 에 참조 링크 추가
- [ ] 시행 방법 §3 (에이전트 프롬프트 주입 + verification.md 섹션) 명시

## 파일

- 신규: `src/claude/core/rules/agent-file-ownership.md`
- 수정: `src/claude/core/rules/verification.md` (Agent File Ownership 섹션)

## 후속 작업 (별도 TASK 아님, 본 TASK 범위 밖)

각 에이전트 프롬프트에 `<File_Ownership>` 블록 주입은 별도 세션 권장 (에이전트 9~10 개 × 단순 섹션 추가). 본 TASK 는 **SSOT 룰 문서 신설** 에 집중.

## 롤백

`agent-file-ownership.md` 파일 삭제 + `verification.md` revert. 기존 암묵적 규칙(프롬프트별 개별 지시)로 복귀.

## 보존 원칙

- **P-07 Read-only 에이전트 분리**: 매트릭스의 "1 차 작성" 컬럼이 read-only 에이전트는 공백 → 원칙 강화.
- **P-14 IMP-AGENT-010 Epic 자동 바인딩**: plan-idea-collector 의 후속 갱신 권한 명시로 규칙 일치.
