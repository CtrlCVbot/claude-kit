# T-BKLG-03 — TASK 힌트 역방향 동기 경로

**제안**: P-10 (BKLG)
**원본 피드백**: I-15 (Low), N-15
**우선순위**: 🟢 P3 Low
**릴리스**: Backlog
**선행**: 없음
**후행**: 없음

## 활성화 조건

- Step 9 `/dev-feature` + `/dev-run` 실사용 경험 축적 (현재 미검증)
- TASK 기획 vs 실제 차이 발생 빈도 확인 필요

## 목적

Bridge 단계에서 제시한 TASK 힌트(PR 분할·예상 소요)가 실제 Step 9 구현 시 변경될 때, Feature Package `04-implementation-hints.md` 로 역기록. 기획 문서 stale 방지 + 회고 품질 향상.

## 수행 내용

1. `04-implementation-hints.md` 구조 확장:

   ```markdown
   ## 5-A. 기획 단계 TASK 힌트 (bridge-writer 작성)

   | 예상 TASK ID | PR | 범위 | 예상 소요 |
   |--------------|-----|------|---------|
   | T-THEME-01 | PR-1 | ... | 1 인·일 |
   | T-THEME-02 | PR-1 | ... | 0.5 인·일 |
   | ... | ... | ... | ... |

   ## 5-B. 실제 구현 TASK (`/dev-feature` 또는 `/dev-run` 역기록)

   | 실제 TASK ID | PR | 범위 | 실제 소요 | 기획 대비 차이 |
   |--------------|-----|------|---------|-------------|
   | T-THEME-01 | PR-1 | ... | 0.5 인·일 | ▼ 0.5 |
   | T-THEME-02a | PR-1 | ... (쪼갬) | 0.5 인·일 | 분할 |
   | T-THEME-02b | PR-2 | ... | 0.3 인·일 | 분할 |

   ## 5-C. 기획 ↔ 실제 괴리 분석 (archive 시)

   - 계획 대비 -20% 단축 (원인: next-themes 의 ThemeProvider wrapper 로 T-THEME-02/03 통합)
   - 추가 발견 이슈: ...
   ```

2. `/dev-feature` 확장:
   - Feature Package 활성화 시 실제 TASK 구조 생성
   - `04-implementation-hints.md` §5-B 섹션에 역기록
   - §5-A (기획) 는 **보존** (비교 가능)

3. `/dev-run` 확장:
   - TASK 완료 시 `actual_hours` 기록
   - §5-B 업데이트

4. `/plan-archive` 확장:
   - archive 시 §5-C 괴리 분석 자동 생성
   - 기획 대비 실제 차이를 정량 요약

5. 에이전트 책임:
   - `dev-implementer` (또는 `/dev-feature` 호출 에이전트) 가 §5-B 갱신 담당
   - `agent-file-ownership.md` (T-RACE-01) 매트릭스에 추가

## AC

- [ ] `04-implementation-hints.md` 구조에 §5-A/§5-B/§5-C 섹션 정의
- [ ] `/dev-feature` 실행 시 §5-B 역기록 작동
- [ ] `/dev-run` 완료 시 `actual_hours` 기록
- [ ] `/plan-archive` 시 §5-C 괴리 분석 자동 생성
- [ ] 기존 §5-A 기획 데이터 보존
- [ ] dev 도메인 에이전트가 §5-B 갱신 담당 확인

## 파일

- 수정: `src/claude/plan/skills/plan-epic-workflow/templates/` (04-implementation-hints 템플릿)
- 수정: `src/claude/dev/commands/dev-feature.md` (역기록 로직)
- 수정: `src/claude/dev/commands/dev-run.md` (actual_hours 기록)
- 수정: `src/claude/plan/commands/plan-archive.md` (§5-C 생성)
- 수정: `src/claude/core/rules/agent-file-ownership.md` (dev-implementer 에 해당 파일 갱신 권한 추가)

## 롤백

역기록 로직 제거 → 기존 기획 단계 정보만 보존.

## 향후 과제

- 괴리 분석 데이터를 claude-kit 전체 로드맵 (미래 Epic 견적) 에 피드백
- 에이전트 텔레메트리(agent-telemetry.md) 와 연계하여 메타 분석

## 보존 원칙

- **P-05 Bridge 5 파일 패키지**: §5-A 기획 데이터는 역기록 후에도 유지.
- **P-13 TeamCreate 구상**: 다자 dev-implementer 동시 기록 시 race 방지 → agent-file-ownership 에 명시.
