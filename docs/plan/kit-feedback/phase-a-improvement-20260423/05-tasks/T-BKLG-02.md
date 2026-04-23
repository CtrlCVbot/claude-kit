# T-BKLG-02 — dry-run 모드 도입

**제안**: P-10 (BKLG)
**원본 피드백**: I-16 (Low), N-16
**우선순위**: 🟢 P3 Low
**릴리스**: Backlog
**선행**: 없음
**후행**: 없음

## 활성화 조건

- 신규 사용자 온보딩 수요 발생
- 복잡 Epic 실험 필요성 증가 (현재는 실파일 생성 후 롤백)

## 목적

주요 커맨드에 `--dry-run` 플래그 추가. 실제 파일 생성 없이 "이렇게 생성될 것" 요약 출력. 신규 사용자 learning curve 완만 + 실험 비용 감소.

## 수행 내용

1. 주요 커맨드 대상:
   - `/plan-epic` — Epic 생성 시뮬레이션
   - `/plan-idea` — IDEA 등록 시뮬레이션
   - `/plan-epic advance` — 상태 전이 시뮬레이션 (T-EPMV-01 에 이미 일부 구현)
   - `/plan-epic-phase generate` — Phase 로드맵 생성 시뮬레이션 (T-TMPL-01 확장)

2. 각 커맨드 `--dry-run` 동작:

   ```bash
   $ /plan-epic "TestEpic" --dry-run

   # [DRY-RUN] Epic 생성 시뮬레이션

   Activation 기준 검증:
   - 3+ Feature 동일 Theme: ❓ (자식 Feature 목록 필요)
   - cross-cutting 요구: ❓
   - 명시 의존성: ❓

   생성될 파일:
   - .plans/epics/00-draft/EPIC-20260423-003/00-epic-brief.md (~100 줄)
   - .plans/epics/00-draft/EPIC-20260423-003/01-children-features.md (~140 줄, Phase A 로드맵 포함)
   - .plans/epics/index.md (1 행 추가)

   제안 다음 단계:
   - /plan-idea "..." --epic=EPIC-20260423-003 로 자식 IDEA 등록
   - Epic advance planning 게이트: 자식 IDEA ≥ 1
   ```

3. 공통 규칙:
   - 실제 파일 생성·변경 **없음**
   - 변경 예상 목록만 출력
   - 다음 단계 안내 포함
   - dry-run 모드 표시 명확 (`[DRY-RUN]` 접두사)

4. 에이전트 호출:
   - dry-run 모드에서도 에이전트 호출 가능 (보고만, 파일 작성 skip)
   - 에이전트 프롬프트에 `dry_run: true` 컨텍스트 주입 → 에이전트가 Write/Edit skip

## AC

- [ ] `--dry-run` 플래그 ≥ 4 커맨드 지원
- [ ] 실제 파일 생성·변경 없음 확인
- [ ] 변경 예상 목록 명확 출력
- [ ] `[DRY-RUN]` 접두사 표시
- [ ] 다음 단계 안내 포함
- [ ] 에이전트 호출 시 Write/Edit skip

## 파일

- 수정: `src/claude/plan/commands/plan-epic.md` (--dry-run 플래그 추가)
- 수정: `src/claude/plan/commands/plan-idea.md`
- 수정: 에이전트 프롬프트 (dry_run 컨텍스트 처리)

## 롤백

`--dry-run` 플래그 처리 제거 → 실제 실행만 지원하는 기존 동작으로 복귀.

## 향후 과제

- `/plan-screen --dry-run`, `/plan-draft --dry-run` 등 파이프라인 전체 커맨드로 확장 가능
