# Architecture at a Glance

> **Status**: Draft (P4, 2026-04-17)
> **Source**: 저장소 구조, [../../scripts/setup.js](../../scripts/setup.js), [../../package.json](../../package.json)
> **Related**: [02-core-concepts.md](02-core-concepts.md), [04-decision-log.md](04-decision-log.md)

이 문서는 claude-kit 의 **리포 레이아웃 + 설치 흐름 + 핵심 스크립트** 를 한눈에 보여줍니다. 구체 사용법은 [User Guide](../20-user-guide/)를, 세부 레퍼런스는 [Reference](../30-reference/)를 참조하세요.

## 1. 리포 레이아웃

```
claude-kit/
├── src/
│   ├── claude/                        ← Claude 타깃 SSOT
│   │   ├── core/    (rules, hooks, skills)
│   │   ├── dev/     (commands, agents, skills, hooks)
│   │   ├── plan/    (commands, agents, skills, hooks)
│   │   └── copy/    (commands, agents, skills, hooks, rules)
│   ├── codex/                         ← Codex 타깃 SSOT (미러링)
│   │   ├── core/, dev/, plan/
│   ├── templates/                     ← 양 타깃 공용 템플릿
│   │   ├── profile.json.template
│   │   ├── settings.json.template
│   │   ├── CLAUDE.md.template
│   │   ├── AGENTS.md.template
│   │   ├── CLAUDE-KIT-QUICKSTART.md.template
│   │   └── quickstart/blocks/         ← Quick Start 블록
│   ├── pairing-registry.json          ← Claude↔Codex 매핑 SSOT
│   └── exception-registry.json        ← skip 사유 SSOT
│
├── scripts/                           ← 빌드·검증 유틸 (Node.js)
│   ├── setup.js                       ← postinstall 엔트리 + QUICKSTART.md 생성
│   ├── docs-generate.js               ← reference 문서 자동 생성
│   ├── audit-pairing.js               ← pairing 일관성 검증
│   ├── audit-drift.js                 ← artifact drift 검증
│   ├── codex-hook-compat.js           ← Codex 훅 호환 분류
│   ├── claude-md-renderer.js          ← CLAUDE.md 렌더링
│   ├── claude-md-merger.js            ← CLAUDE.md 병합
│   ├── merge-settings.js              ← settings.json 병합
│   └── generate-sync-report.js        ← sync 상태 보고서
│
├── docs/
│   ├── 00-overview/                   ← 정체성·개념
│   ├── 10-features/                   ← 기능 카탈로그
│   ├── 20-user-guide/                 ← 사용자 가이드
│   ├── 30-reference/                  ← 레퍼런스 (일부 자동 생성)
│   ├── 40-contributing/               ← 기여자 가이드
│   ├── archive/2026-04-17/            ← 이전 설계 이력
│   └── plan/                          ← 재구축 계획서
│
├── README.md                          ← 패키지 개요 + 설치
├── CLAUDE.md                          ← 저장소의 Claude 런타임 컨텍스트
├── profile.json                       ← 저장소의 활성 도메인/타깃
└── package.json                       ← npm 메타 + scripts
```

## 2. 설치 흐름

```
  pnpm add -D github:CtrlCVbot/claude-kit
       │
       ▼
  node scripts/setup.js   (postinstall)
       │
       ├─ 1. profile.json 파싱
       │     └─ activeDomains, activeTargets 결정
       │
       ├─ 2. 자산 복사 (타깃별 병렬)
       │     ├─ claude: src/claude/{domain}/ → .claude/
       │     └─ codex:  src/codex/{domain}/  → plugins/claude-kit/
       │
       ├─ 3. 컨텍스트 파일 생성·병합
       │     ├─ claude-md-renderer → claude-md-merger → CLAUDE.md
       │     └─ (동일 로직) → AGENTS.md
       │
       ├─ 4. settings.json 생성·병합
       │     └─ merge-settings (kit-managed vs user-custom)
       │
       ├─ 5. Quick Start 생성
       │     └─ quickstart-renderer → CLAUDE-KIT-QUICKSTART.md
       │
       └─ 6. 메타 기록
             └─ .claude-kit-meta.json
```

세부 단계 수는 활성 타깃 개수와 도메인에 따라 변동합니다. 자세한 동작: [20-user-guide/01-installation.md](../20-user-guide/01-installation.md).

## 3. 세 개의 레지스트리

claude-kit 은 자산 메타를 세 개의 JSON 파일로 추적합니다.

| 레지스트리 | 역할 | 갱신 주체 |
|----------|------|---------|
| [`src/pairing-registry.json`](../../src/pairing-registry.json) | Claude↔Codex 자산 pairing 상태 | `/kit-create`, `/kit-sync`, `/kit-audit` |
| [`src/exception-registry.json`](../../src/exception-registry.json) | skip 사유 (Codex 미포팅 자산) | 수기 + `/kit-audit` 검증 |
| [`.claude-kit-meta.json`](../../.claude-kit-meta.json) (프로젝트) | 설치 메타 (version, domains, targets, timestamp) | `setup.js` postinstall |

## 4. 런타임 — Claude Code 가 읽는 것

Claude Code 세션이 시작되면:

1. `CLAUDE.md` 컨텍스트 로드
2. `.claude/rules/*.md` 전부 로드 (상시 규칙)
3. `.claude/commands/*.md` 슬래시 커맨드로 등록
4. `.claude/agents/*.md` Agent tool 대상으로 등록
5. `.claude/skills/*/SKILL.md` 매칭 조건에 따라 자동 로드
6. `.claude/hooks/*.js` 를 `settings.json` 의 이벤트에 연결

이 중 `rules` 는 매 턴마다 컨텍스트에 들어가므로 **비용** 을 유발합니다. 그래서 rules 를 소수·핵심으로 유지하고 구체 정보는 skills/commands 로 분리하는 것이 설계 원칙입니다 ([04-decision-log.md](04-decision-log.md) 참조).

## 5. 문서 - 코드 경계

| 영역 | 수정 시 주의 |
|------|-------------|
| `src/claude/` | SSOT — 여기가 기준. `.claude/` 는 사본 |
| `src/codex/` | Codex 타깃 SSOT |
| `scripts/` | 빌드 로직 — 변경 시 `setup.js` 흐름 영향 범위 확인 |
| `docs/30-reference/` | **자동 생성** — 수기 편집 금지 (01~05, 07) |
| `docs/archive/2026-04-17/` | 읽기 전용. 변경하지 말 것 |
| 그 외 `docs/` | 수기 편집 가능 |

## 다음 읽기

- [04-decision-log.md](04-decision-log.md) — 이 구조를 왜 이렇게 갔는지
- [../20-user-guide/01-installation.md](../20-user-guide/01-installation.md) — 직접 설치
- [../30-reference/08-cli-scripts.md](../30-reference/08-cli-scripts.md) — 스크립트 전체 인덱스
