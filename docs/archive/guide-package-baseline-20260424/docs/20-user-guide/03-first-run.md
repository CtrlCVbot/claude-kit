# First Run

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../../src/templates/CLAUDE-KIT-QUICKSTART.md.template](../../src/templates/CLAUDE-KIT-QUICKSTART.md.template), `src/templates/quickstart/blocks/`
> **Related**: [01-installation.md](01-installation.md), [04-daily-workflow.md](04-daily-workflow.md)

claude-kit 설치 직후 **10분 안에** 환경이 정상 작동하는지 확인하고, 첫 커맨드를 체험하는 가이드입니다.

## 1. 설치 확인 (2분)

```bash
ls CLAUDE-KIT-QUICKSTART.md CLAUDE.md .claude-kit-meta.json
cat .claude-kit-meta.json | head -20
```

예상 출력:
- `CLAUDE-KIT-QUICKSTART.md`: 설치 직후 읽을 온보딩 문서
- `CLAUDE.md`: Claude 런타임 컨텍스트
- `.claude-kit-meta.json`: `version`, `domains`, `targets`, `installedAt`

하나라도 없으면: [01-installation.md §트러블슈팅](01-installation.md) 참조.

## 2. Quick Start 읽기 (3분)

```bash
cat CLAUDE-KIT-QUICKSTART.md
```

이 문서는 **설치된 도메인/타깃 조합에 맞춰 동적 렌더링** 됩니다. `core + dev` 만 설치했다면 dev 파이프라인 소개만, `plan` 포함이면 plan 섹션이 추가됩니다.

Quick Start 에 나온 순서대로 진행하면 이 문서와 대부분 겹치니, 다음 단계로 넘어가도 됩니다.

## 3. Claude Code 세션 열기 (1분)

프로젝트 디렉터리에서:

```bash
claude code
```

(또는 IDE 에서 Claude Code 플러그인 실행)

세션 시작 시 **자동으로 로드되는 것**:
- `CLAUDE.md` 전체
- `.claude/rules/*.md` 전부
- `.claude/commands/*` 슬래시 커맨드 등록
- `.claude/skills/*/SKILL.md` 매칭 시 자동 활성

## 4. 첫 커맨드 시도 (3분)

### 4.1 탐색: `/dev-explore`

```
/dev-explore 이 프로젝트의 주요 entry point 는 어디인가요?
```

`src/`, `apps/`, `packages/` 등을 자동 스캔해 진입점을 요약합니다. 여러 번 정제되는 루프 커맨드입니다.

### 4.2 계획: `/dev-plan`

```
/dev-plan 로그인 기능을 추가하고 싶어요
```

AI 가 구현 계획을 작성해 제시합니다. 사용자가 승인해야 실제 구현 단계로 넘어갑니다 ([Golden Principle #9 HARD-GATE](../../src/claude/core/rules/golden-principles.md)).

### 4.3 TDD 가드 체험 (`dev` 도메인 활성 시)

의도적으로 테스트 없이 구현 시도:

```
src/foo.ts 를 만들어주세요: export const add = (a, b) => a + b
```

→ `dev-tdd-guard` 가 `exit 2` 로 차단하며 메시지 출력:
```
❌ [dev-tdd-guard] 테스트 없는 편집 차단
   src/foo.ts 에 대응되는 테스트 없음
```

이것이 정상 동작입니다. 테스트 먼저 쓰면 통과합니다.

## 5. `/plan-idea` 체험 (`plan` 도메인 활성 시)

```
/plan-idea 사용자 로그인 실패 시 rate limit 이 필요해 보여요
```

`.plans/ideas/00-inbox/` 에 아이디어 문서가 생성됩니다. 이후 `/plan-screen` 으로 RICE 스크리닝.

## 6. 확인 체크리스트

- [ ] `/dev-explore` 가 파일 구조 요약을 반환함
- [ ] `/dev-plan` 이 계획을 제시하고 승인을 기다림
- [ ] TDD 가드가 테스트 없는 편집을 차단함 (dev 도메인)
- [ ] `/plan-idea` 가 아이디어 문서를 생성함 (plan 도메인)
- [ ] Codex CLI 에서도 같은 커맨드가 동작함 (codex 타깃)

전부 체크되면 [04-daily-workflow.md](04-daily-workflow.md) 로 넘어가세요.

## 7. 예상 못한 동작?

- 슬래시 커맨드가 등록되지 않음 → `.claude/commands/` 내용 확인, 세션 재시작
- hook 이 안 돌아감 → `.claude/settings.json` 의 `hooks` 섹션 확인
- Codex 에서만 안 됨 → `plugins/claude-kit/hooks.json` 확인

자세한 증상별 대응: [07-troubleshooting.md](07-troubleshooting.md).

## 다음 단계

- [04-daily-workflow.md](04-daily-workflow.md) — 매일 쓰는 흐름
- [05-plan-pipeline.md](05-plan-pipeline.md) — 기획 도메인 사용 (`plan` 활성 시)
- [06-codex-dual-use.md](06-codex-dual-use.md) — Codex 와 병행
