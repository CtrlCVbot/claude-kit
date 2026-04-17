# Quality Gates

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../../scripts/audit-drift.js](../../scripts/audit-drift.js), [../../scripts/audit-pairing.js](../../scripts/audit-pairing.js), [../../scripts/codex-hook-compat.js](../../scripts/codex-hook-compat.js), [../../package.json](../../package.json)
> **Related**: [02-adding-a-component.md](02-adding-a-component.md), [04-release-checklist.md](04-release-checklist.md)

claude-kit 에서 품질 드리프트를 방지하는 **자동 게이트** 들을 설명합니다. 모두 Node 스크립트로 구현되어 CI 또는 수동 호출로 돌릴 수 있습니다.

## 1. 게이트 카테고리

| 카테고리 | 검증 대상 | 도구 |
|---------|----------|------|
| **Doc Drift** | 자동 생성 문서 vs 소스 일치 | `check:quickstart`, `check:docs` |
| **Pairing** | Claude↔Codex 자산 매핑 일관성 | `audit-pairing.js` |
| **Artifact Drift** | 원본 source vs fallback 동기화 | `audit-drift.js` |
| **Codex Compatibility** | Hook 의 Codex 호환성 분류 | `codex-hook-compat.js` |
| **Component Standards** | 자산 표준 준수 | `/kit-validate`, `/kit-audit` |

## 2. Doc Drift 게이트

### 2.1 `check:quickstart`

```bash
pnpm check:quickstart
# = node scripts/generate-quickstart-doc.js --check
```

`docs/guide/13-quick-start.md` 가 현재 소스 (`src/templates/quickstart/blocks/`, `profile.json`) 와 일치하는지 검증. 다르면 `exit 1`.

재동기화:
```bash
pnpm generate:quickstart
```

### 2.2 `check:docs`

```bash
pnpm check:docs
# = node scripts/docs-generate.js --check
```

`docs/30-reference/*.md` 6개 (01-commands, 02-agents, 03-skills, 04-hooks, 05-rules, 07-pairing-registry) 가 현재 `src/claude/` + `.claude/` 상태와 일치하는지 검증.

재동기화:
```bash
pnpm generate:docs
```

**권장**: CI 에서 두 게이트 모두 실행. drift 가 발견되면 PR 머지 차단.

## 3. Pairing 게이트

### 3.1 `audit-pairing.js`

```bash
node scripts/audit-pairing.js
node scripts/audit-pairing.js --json | jq .   # JSON 출력
```

검증 항목 (C7 Cross-check):
- `pairing-registry.json` entry 와 실제 파일 일치
- `claude-only` / `codex-only` / `skip` 사유 명시
- silent failure 감지 (entry 없는 파일, 파일 없는 entry)

출력 예:
```
✓ 42 entries verified
✗ 1 drift: skill `foo` declared but file missing
✗ 1 silent: command `bar-dev.md` exists but no pairing entry
```

실패 시 대응:
- **entry 누락**: `/kit-create` 로 재등록 또는 수기 추가
- **파일 누락**: 파일 복원 또는 entry 제거
- **skip 사유 공란**: `exception-registry.json` 에 reason 기입

## 4. Artifact Drift 게이트

### 4.1 `audit-drift.js`

```bash
node scripts/audit-drift.js
```

페어링된 Claude↔Codex 자산 간 **내용 drift** 를 감지. 예: Claude `dev-tdd-guard.js` 가 업데이트됐는데 Codex 쪽은 구버전인 경우.

검증 기준:
- mtime (최근 수정 시각)
- 해시 (가능한 경우)

출력 예:
```
✓ 40 paired assets synchronized
✗ 2 drift detected:
  - hooks/output-secret-filter.js: Claude updated 2d ago, Codex 30d ago
  - skills/continuous-learning/SKILL.md: content differs (diff available)
```

대응: `/kit-sync` 로 동기화 또는 수동 정렬.

## 5. Codex Compatibility

### 5.1 `codex-hook-compat.js`

```bash
node scripts/codex-hook-compat.js
```

각 hook 의 Codex 호환성을 분류:

| 분류 | 의미 |
|------|------|
| Full | Codex 에서도 정상 동작 |
| Partial | 매처 제한 등 부분 지원 |
| Skip | Codex 미지원, fallback artifact 필요 |

출력은 `plugins/claude-kit/hooks.json` 생성에 사용됩니다. 직접 CI 게이트로 쓰기보다는 **설치 시 자동 필터링** 용도.

## 6. Component Standards

### 6.1 `/kit-validate`

Claude Code 세션에서 호출:

```
/kit-validate
```

`kit-validation` 스킬이 12개 스키마로 각 자산 검증:
- Claude 5: skill, agent, command, hook, rule
- Codex 4: skill, agent, command, hook
- Registry 3: pairing, exception, codex-portability

결과는 위반 목록 + 수정 제안.

### 6.2 `/kit-audit`

전수 감사:

```
/kit-audit
```

`kit-maintainer` 에이전트가 포괄 실행:
- `/kit-validate` 전체
- `audit-pairing.js`
- `audit-drift.js`
- 통합 리포트 생성

주기적 실행 권장 (주 1회 또는 릴리스 전).

## 7. CI 통합 예시

`.github/workflows/quality.yml` (예시):

```yaml
name: Quality Gates
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: pnpm install
      - run: pnpm check:quickstart
      - run: pnpm check:docs
      - run: node scripts/audit-pairing.js
      - run: node scripts/audit-drift.js
```

현재 저장소에는 이 워크플로우가 포함되지 않을 수 있습니다 — 추가는 별도 기여 이슈.

## 8. 게이트 우회 시

**원칙**: 게이트 우회하지 않습니다. 실패는 root cause 해결.

예외 상황:
- 일시적 인프라 이슈 (GitHub 장애 등): 수동 verify 후 관리자 머지
- False positive 확인: script 자체 버그로 이슈 등록

`--no-verify`, `--force` 류는 **금지**. claude-kit 자체가 "규칙을 사람이 기억하지 않게" 만드는 도구이므로 우회는 철학에 반합니다.

## 9. 로컬 pre-commit 훅

선택적으로 저장소 개발자 환경에 설치:

```bash
# .git/hooks/pre-commit
#!/bin/bash
pnpm check:quickstart && pnpm check:docs || exit 1
```

매 커밋마다 drift 자동 차단.

## 10. 신규 게이트 추가 절차

1. 스크립트 작성 (`scripts/audit-{new}.js`)
2. `--check` 모드 지원 (CI 호환)
3. `package.json` 에 npm script 추가 (`check:{new}`)
4. 본 문서에 항목 추가
5. CI 워크플로우에 포함

## 다음 단계

- [04-release-checklist.md](04-release-checklist.md) — 릴리스 전 게이트 실행 순서
- [02-adding-a-component.md](02-adding-a-component.md) — 자산 추가 시 게이트 체험
