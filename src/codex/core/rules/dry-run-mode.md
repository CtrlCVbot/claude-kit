<!-- kit-convert generated: 2026-04-23 -->
<!-- Claude sibling: src/claude/core/rules/dry-run-mode.md -->
# Dry-Run 모드 공통 규칙 (T-BKLG-02, Backlog)

> **결론**: claude-kit 주요 커맨드의 `--dry-run` 플래그 표준. 실제 파일 생성·변경 없이 "이렇게 실행될 것" 요약 출력. 신규 사용자 learning curve 완만 + 실험 비용 감소. T-BKLG-02 (Backlog, v2.6.0+ 승격 대기).

**스펙**: `docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-BKLG-02.md`
**활성화 조건**: 신규 사용자 온보딩 수요 발생 + 복잡 Epic 실험 필요성 증가. 현재 **부분 구현** (플래그 정의만).

---

## 1. 지원 대상 커맨드 (우선순위)

| 커맨드 | 우선순위 | 구현 상태 |
|--------|:--------:|:---------:|
| `/plan-epic` (create/advance/archive) | 1순위 | 문서 정의 완료, 로직 v2.6.0+ |
| `/plan-idea` | 1순위 | 문서 정의 완료, 로직 v2.6.0+ |
| `/plan-epic phase generate` (T-TMPL-01) | 2순위 | 문서 정의 대기 |
| `/plan-screen` | 3순위 | 향후 확장 |
| `/plan-draft` | 3순위 | 향후 확장 |
| `/plan-prd` | 3순위 | 향후 확장 |

---

## 2. 공통 출력 형식

모든 `--dry-run` 실행 결과는 다음 4 블록을 포함한다:

```
[DRY-RUN] {커맨드명} 시뮬레이션

## 검증 결과
- {검증 항목 1}: {PASS/FAIL/UNKNOWN}
- {검증 항목 2}: ...

## 생성될 파일 ({파일 수})
- {절대 경로 1} (~{예상 라인 수} 줄, 주요 섹션: {§N})
- {절대 경로 2} (~{예상 라인 수} 줄)

## 변경될 파일 ({파일 수})
- {절대 경로} (예: `.plans/ideas/backlog.md` — 1 행 추가)

## 제안 다음 단계
- {다음 커맨드 1}
- {다음 커맨드 2}
- (선행 조건 있으면 명시)
```

---

## 3. 공통 규칙

### 3-1. 파일 변경 금지

- **절대 금지**: 파일 생성·수정·삭제·이동
- 에이전트 호출 시 `dry_run: true` 컨텍스트 주입
- 에이전트가 Write/Edit 시도 → 에이전트 프롬프트에서 skip 로직 필수

### 3-2. 검증 로직 실행 허용

- 읽기 전용 검증은 **허용** (Activation 기준, 상태 전이 게이트 등)
- 검증 결과는 출력에 포함

### 3-3. 다음 단계 안내 필수

- dry-run 결과만 보고 실제 실행 또는 재설계 판단 가능하도록 제안 포함
- 선행 조건 (다른 커맨드 선행 필요 시) 명시

### 3-4. `[DRY-RUN]` 접두사 필수

- 출력 첫 줄에 명확히 표시
- 실수로 실제 실행한 출력과 혼동 방지

### 3-5. 로그 기록

- `~/.claude/logs/dry-run.jsonl` 에 시뮬레이션 기록 (선택적)
- 형식: `{ timestamp, command, args, predicted_files, predicted_actions }`

---

## 4. 에이전트 통합

### 4-1. writer 계 에이전트

writer 계 에이전트 (plan-idea-collector, plan-draft-writer, plan-prd-writer 등) 는 `dry_run: true` 컨텍스트 수신 시 다음 동작:

1. **일반 로직 실행** — Investigation_Protocol 수행
2. **Write/Edit 대신 Dry-Run 출력 생성**
3. **파일 생성·수정 skip**
4. **메인 세션에 예상 결과 반환** (Output_Format §1-1 "생성/수정 파일" 을 "**생성될** 파일" 로 변경)

### 4-2. read-only 에이전트

read-only 에이전트 (plan-reviewer, dev-architect 등) 는 dry-run 과 무관. 항상 기본 동작.

### 4-3. 서브커맨드 dry-run 전파

`/plan-epic advance --dry-run` 등 advance 서브커맨드는 상위 로직의 dry-run 을 전파. T-EPMV-01 의 `rewriteEpicLinks({ dryRun: true })` 이미 구현되어 있음 (v2.4.1 Step 3).

---

## 5. 예시 출력

### `/plan-epic "TestEpic" --dry-run`

```
[DRY-RUN] /plan-epic 생성 시뮬레이션

## 검증 결과
- Activation 기준 1 (3+ Feature 동일 Theme): UNKNOWN (자식 Feature 목록 필요)
- Activation 기준 2 (cross-cutting 요구): UNKNOWN
- Activation 기준 3 (명시 의존성): UNKNOWN
- (기준 중 하나 이상 충족 필요)

## 생성될 파일 (3)
- .plans/epics/00-draft/EPIC-20260423-003/00-epic-brief.md (~100 줄)
- .plans/epics/00-draft/EPIC-20260423-003/01-children-features.md (~140 줄, Phase A 로드맵 포함)
- .plans/epics/index.md (신규 또는 1 행 추가)

## 변경될 파일 (0)
- 없음

## 제안 다음 단계
- /plan-idea "..." --epic=EPIC-20260423-003 로 자식 IDEA 등록
- Epic advance planning 게이트 (자식 IDEA ≥ 1 필요, T-EPMV-03)
- 본 Epic 이 정말 필요한지 Activation 기준 재검토
```

### `/plan-epic advance EPIC-... --to=planning --dry-run`

T-EPMV-01 이미 구현 (`epic-advance-rewrite.js` `{ dryRun: true }`):

```
[DRY-RUN] /plan-epic advance 시뮬레이션

## 검증 결과
- 게이트 조건 (draft → planning): PASS (00-epic-brief + 01-children + IDEA ≥ 1)
- tracked 상태: PASS (`git ls-files` ≥ 1)

## 변경될 파일 (5)
- .plans/epics/00-draft/EPIC-... → .plans/epics/10-planning/EPIC-... (이동)
- epic-advance-rewrite 예상: 3 파일에 4 개 링크 치환
  - .plans/ideas/20-approved/IDEA-20260423-001.md (1 치환)
  - .plans/features/active/hero/00-context/08-epic-binding.md (2 치환)
  - .plans/epics/index.md (1 치환, 상태 컬럼)

## 제안 다음 단계
- --dry-run 제거 후 실제 전이 실행
- (actual) /plan-epic advance EPIC-... --to=planning
```

---

## 6. 구현 체크리스트 (v2.6.0 승격 시)

- [ ] `/plan-epic` 3 서브커맨드 (create/advance/archive) `--dry-run` 플래그 추가
- [ ] `/plan-idea` `--dry-run` 플래그 추가
- [ ] `/plan-epic phase generate --dry-run` 추가
- [ ] 에이전트 프롬프트에 `dry_run` 컨텍스트 처리 로직 주입 (writer 계 8 에이전트)
- [ ] 테스트: dry-run 실행 시 파일 변경 없음 확인
- [ ] 테스트: 검증 결과 + 예상 파일 목록 출력 확인
- [ ] 문서: 각 커맨드 문서에 `--dry-run` 플래그 + 예시 출력 추가

---

## 7. 하위 호환성

- 기존 커맨드는 `--dry-run` 없이 호출 시 기존 동작 100% 유지
- 플래그는 opt-in
- 에이전트는 컨텍스트에 `dry_run` 키가 없으면 기존 동작

---

## 8. 관련 자산

- **TASK**: `docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-BKLG-02.md`
- **이미 구현**: `src/claude/plan/scripts/epic-advance-rewrite.js` `rewriteEpicLinks({ dryRun })` (T-EPMV-01, v2.4.1)
- **향후 확장**: `/plan-screen`, `/plan-draft`, `/plan-prd` 등 파이프라인 전체

---

## 9. 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — T-BKLG-02 (Phase A 피드백 Step 6, Backlog) 공통 규칙 SSOT | Claude (메인테이너 역할) |
