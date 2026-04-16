<!-- kit-convert generated: 2026-04-16 -->
<!-- REVIEW NEEDED: complex command -->
# dev-handoff-verify — Codex Entry Flow

## Overview

핸드오프 + 자동 검증 통합 (v6). v5의 `/handoff` + `/clear` + `/dev-test-verify`를 **하나의 커맨드**로 통합.
핵심 변경: `/clear` 불필요 — Task 도구로 생성한 **서브에이전트가 fresh context**를 자동으로 제공한다.

## Invocation

```
dev-handoff-verify [--once] [--loop N] [--security] [--coverage] [--extract] [--skip-handoff]
```

## Parameters

| 플래그 | 기본값 | 설명 |
|--------|--------|------|
| `--once` | false | 단발 검증 (루프 없음) |
| `--loop N` | 5 | 최대 재시도 횟수 |
| `--security` | false | 보안 리뷰 포함 |
| `--coverage` | false | 테스트 커버리지 분석 모드 |
| `--extract` | false | 에러 추출 모드 |
| `--skip-handoff` | false | handoff.md 생성 건너뛰기 (이미 있을 때) |
| `--effort` | high | 검증 깊이: low / medium / high / max |
| `--only` | all | 특정 단계만: build / test / lint / type |

플래그를 제외한 나머지 텍스트 = 의도 설명(intent).

### effort별 동작 차이

| effort | 코드 리뷰 범위 | thinking 수준 | 자동 수정 범위 | 보안 검토 |
|--------|---------------|--------------|---------------|-----------|
| low | 변경 파일만 빠른 스캔 | 기본 | import/lint만 | 건너뜀 |
| medium | 변경 파일 + 직접 의존성 | think hard | Fixable 전체 | 패턴 매칭만 |
| high | 변경 파일 + 의존성 그래프 | think harder | Fixable 전체 + 리팩토링 제안 | 주요 패턴 검사 |
| max | 전체 프로젝트 영향 분석 | ultrathink | Fixable 전체 + 아키텍처 검토 | security-reviewer 에이전트 |

## Workflow

### 0단계: 인자 파싱

$ARGUMENTS에서 플래그를 파싱한다.

---

### 1단계: 환경 수집

다음을 병렬로 수집한다:

1. `git status --short` — 변경 파일 목록
2. `git diff --name-only` — 스테이징 전 변경사항
3. `git log --oneline -10` — 최근 커밋
4. `.claude/handoff.md` 읽기 (존재 시)
5. 프로젝트 문서 읽기 (존재 시): `CLAUDE.md`, `spec.md`, `prompt_plan.md`
6. 프로젝트 타입 감지 (package.json, go.mod, Cargo.toml, pyproject.toml, Makefile)

**패키지 매니저 감지 순서:**
1. `pnpm-lock.yaml` → pnpm
2. `yarn.lock` → yarn
3. `bun.lockb` → bun
4. 기본값 → npm

git 레포가 아니면 → "git init 필요" 안내 후 중단.
변경사항 없으면 → "변경사항 없음" 안내 후 중단.

---

### 2단계: Handoff 문서 자동 생성

> `--skip-handoff` 플래그가 있으면 이 단계를 건너뛴다.
> `.claude/handoff.md`가 이미 있으면 → 기존 내용에 누적 추가 (append).

`.claude/handoff.md`에 완료한 작업, 변경 파일 요약, 테스트 필요 사항, 알려진 이슈, 주의사항, 검증 권장 설정을 작성한다.

---

### 3단계: 의도 병합

handoff.md의 검증 권장 설정과 CLI 플래그를 병합한다.
**CLI 플래그가 우선.** handoff.md는 CLI에서 명시하지 않은 항목만 적용.

---

### 4단계: 서브에이전트 검증 실행 (핵심)

> Task 도구로 `verify-agent` 서브에이전트를 생성하여 **fresh context에서 검증**한다.

**모드 분기:**
- `--extract` → 에러 추출 모드 (루프 없음)
- `--coverage` → 커버리지 모드 (루프 없음)
- `--security` → security-reviewer 에이전트 호출 포함
- `--once` → 단발 검증 (1회)
- 기본 → 검증 루프 (최대 N회)

**서브에이전트가 실행하는 검증 파이프라인:**

**A. 코드 리뷰 (effort 기반 adaptive thinking)**

리뷰 체크리스트:
- [ ] 변경된 코드가 의도와 일치하는가
- [ ] 뮤테이션 없이 불변성 패턴 사용
- [ ] 에러 핸들링 존재
- [ ] 하드코딩된 비밀값 없음
- [ ] console.log 없음
- [ ] 함수 50줄 이하
- [ ] 파일 800줄 이하
- [ ] 입력값 검증 (사용자 입력 경로)

**B. 자동 검증 실행**

프로젝트 타입별 검증 커맨드 실행. `--only` 플래그가 있으면 해당 단계만 실행.

**C. 결과 표시**

각 검증 단계별 상태: PASS / FAIL / SKIP / WARN

**D. 실패 시 자동 수정 (루프 모드)**

Fixable 에러 (import missing, lint format, unused imports 등)는 자동 수정 시도.
Non-Fixable 에러 (로직 오류, 아키텍처 문제, 테스트 실패 등)는 보고만 한다.

---

### 5단계: 결과 수신 및 처리

통과 시 handoff.md를 정리하고 완료 출력을 표시한다.

```
════════════════════════════════════════════════════════════════
  Handoff-Verify Complete (v6)
  attempt [N]/[max] | effort: [level]
════════════════════════════════════════════════════════════════

검증 결과:
  TypeCheck   PASS
  Lint        PASS
  Build       PASS
  Test        PASS (42 passed, 0 failed)

다음 단계:
  1. dev-commit-push-pr --merge --notify
  2. dev-sync (커밋 후 문서 동기화 권장)
════════════════════════════════════════════════════════════════
```

Max Retry 실패 시 반복 실패 에러와 자동 수정 시도 이력을 보고한다.

## 주의사항

- effort가 max일 때 ultrathink를 사용하므로 토큰 소비가 크다.
- --security는 effort와 무관하게 security-reviewer 에이전트를 호출한다.
- --extract와 --coverage는 루프하지 않는다 (분석 전용 모드).
- 서브에이전트는 Sonnet 모델로 실행되어 비용 효율적이다.
- v5의 /handoff, /dev-test-verify는 이 커맨드로 대체된다.

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/dev/commands/dev-handoff-verify.md
