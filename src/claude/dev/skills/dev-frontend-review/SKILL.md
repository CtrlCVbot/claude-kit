---
name: dev-frontend-review
description: 프론트엔드 (.tsx, .ts, .js) 코드 리뷰 — 컨벤션 위반 탐지 및 수정 제안. Pending-change / File-targeted 2 모드.
---

# Frontend Code Review

프론트엔드 코드의 컨벤션 위반을 리뷰 시점에 탐지하여 PR 전 수정 제안을 생성합니다.

## 트리거

다음 상황에서 사용:
- 사용자가 프론트엔드 파일 (.tsx, .ts, .js) 리뷰 요청
- PR 직전 staged 파일 사전 점검
- 특정 파일 컨벤션 검토

## dev 도메인 자산과의 책임 구분

| 자산 | 책임 |
|------|------|
| **dev-frontend-review (이 스킬)** | 작성된 코드의 **컨벤션 위반 탐지 + 수정 제안** |
| `dev-frontend-patterns` | 신규 작성 시 **참조할 패턴 가이드** (CVA / cn / 상태 관리) |
| `dev-testing-frontend` | 컴포넌트/훅 **테스트 작성 패턴** (Vitest + Testing Library) |
| `/dev-verify-fe` (command) | 변경 파일의 **테스트 품질** 검증 |
| `dev-code-reviewer` (agent) | 도메인 무관 일반 코드 리뷰 (보안/성능/구조) |

본 스킬은 **프론트엔드 컨벤션** 영역 전담. 일반 리뷰는 `dev-code-reviewer`, 신규 작성 가이드는 `dev-frontend-patterns` 참조.

## 2 모드

1. **Pending-change 모드** — `git status` / `git diff` 에서 staged / working-tree 파일을 추출하여 PR 직전 점검
2. **File-targeted 모드** — 사용자가 명시한 파일만 점검

## 체크리스트

3 카테고리로 분리. 각 references/ 파일은 **카테고리별 SSOT**:

- **[code-quality.md](references/code-quality.md)** — 클래스명 / 스타일 / 유틸리티 (cn / Tailwind / className 순서)
- **[performance.md](references/performance.md)** — React 성능 패턴 (useMemo / React Flow)
- **[business-logic.md](references/business-logic.md)** — 비즈니스 로직 패턴 (Provider 컨텍스트 / store 사용)

각 rule 위반 시 **IsUrgent 플래그** 로 우선순위 분류.

## 워크플로우

### Step 1: 대상 파일 수집
- Pending-change: `git diff --name-only HEAD` 로 변경 .tsx / .ts / .js / .jsx 파일 추출
- File-targeted: 사용자 명시 파일 사용

### Step 2: 체크리스트 적용
각 파일에 대해 3 references/ 의 모든 rule 적용:
- 위반 라인 식별
- IsUrgent 플래그로 우선순위 분류
- Suggested Fix 코드 예시 작성

### Step 3: 출력 (Template A or B)

이슈 발견 시 (Template A):
```
# Code review
Found <N> urgent issues need to be fixed:

## 1 <brief description of bug>
FilePath: <path> line <line>
<relevant code snippet or pointer>


### Suggested fix
<brief description of suggested fix>

---
... (repeat for each urgent issue) ...

Found <M> suggestions for improvement:

## 1 <brief description of suggestion>
FilePath: <path> line <line>
<relevant code snippet or pointer>


### Suggested fix
<brief description of suggested fix>

---

... (repeat for each suggestion) ...
```

이슈 없을 때 (Template B):
```
## Code review
No issues found.
```

### Step 4: 사용자 액션 확인
- 이슈 발견 + 코드 수정 가능한 경우 → Suggested fix 적용 여부 확인 (예: "Would you like me to use the Suggested fix section to address these issues?")
- 적용 결정 시 Edit tool 로 수정 후 재검증

## 형식 규칙

- IsUrgent 플래그 우선 정렬 (urgent 먼저)
- 카테고리 순서: Code Quality → Performance → Business Logic
- 이슈 ≥10건이면 "10+ urgent issues" 또는 "10+ suggestions" 로 요약, 첫 10건만 출력
- 섹션 간 빈 줄 압축 금지 (가독성 유지)
- 이슈 없는 카테고리 섹션은 생략

## 예외사항

다음은 **이슈가 아닙니다**:

1. 리뷰 대상 파일이 0개 → "No frontend files changed" 안내 후 종료
2. 모든 rule 통과 → Template B 출력
3. references/ 의 rule 이 프로젝트 stack 미적용 (예: React Flow 미사용 시 React Flow rule 면제)
4. dev-frontend-patterns 의 Stack Defaults 와 다른 프로젝트 stack → 해당 stack 의 동등 패턴 적용

## Related Files

| File | Purpose |
|------|---------|
| `.claude/skills/dev-frontend-patterns/SKILL.md` | 신규 작성 시 참조할 패턴 가이드 |
| `.claude/skills/dev-testing-frontend/SKILL.md` | 컴포넌트/훅 테스트 작성 |
| `.claude/agents/dev-code-reviewer.md` | 도메인 무관 일반 코드 리뷰 |
| `.claude/commands/dev-verify-fe.md` | 테스트 품질 검증 커맨드 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-28 | 초안 — 전역 frontend-code-review 흡수 + claude-kit 컨벤션 적용 (IMP-AGENT-016) | Claude (메인테이너 역할) |
