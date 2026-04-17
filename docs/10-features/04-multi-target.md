# Multi-Target (Claude + Codex)

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../../README.md](../../README.md) §타겟, [../../src/pairing-registry.json](../../src/pairing-registry.json), [../../src/exception-registry.json](../../src/exception-registry.json), [../30-reference/07-pairing-registry.md](../30-reference/07-pairing-registry.md)
> **Related**: [../00-overview/02-core-concepts.md](../00-overview/02-core-concepts.md) §4 Pairing

claude-kit 의 자산은 Claude Code 와 Codex CLI **양쪽에 같은 소스에서 배포** 됩니다. 이 문서는 두 타깃의 차이와 pairing·skip 정책을 설명합니다.

## 1. 두 타깃의 구조적 차이

| 항목 | Claude Code | Codex |
|------|-------------|-------|
| 설치 루트 | `.claude/` | `plugins/claude-kit/` |
| 컨텍스트 파일 | `CLAUDE.md` | `AGENTS.md` |
| 커맨드 | `.claude/commands/*.md` | `plugins/claude-kit/commands/*.md` |
| 에이전트 | `.claude/agents/*.md` | `plugins/claude-kit/agents/*.md` |
| 스킬 | `.claude/skills/*/SKILL.md` | `plugins/claude-kit/skills/*/SKILL.md` |
| 훅 | `.claude/hooks/*.js` + `settings.json` | `plugins/claude-kit/hooks/*.js` + `hooks.json` |
| 규칙 | `.claude/rules/*.md` | **`AGENTS.md` 에 흡수** (별도 파일 없음) |
| MCP | `.claude/mcp.json` | **v1 제외** |

## 2. 소스 배치

| 자산 | Claude 전용 SSOT | Codex 전용 SSOT | 공유 |
|------|----------------|---------------|------|
| 도메인 컴포넌트 | `src/claude/{domain}/...` | `src/codex/{domain}/...` | — |
| 템플릿 | `src/templates/` (양쪽 공용) | 동일 | — |
| Pairing 레지스트리 | [`src/pairing-registry.json`](../../src/pairing-registry.json) | (양쪽 공용) | ✅ |
| Exception 레지스트리 | [`src/exception-registry.json`](../../src/exception-registry.json) | (양쪽 공용) | ✅ |

설치 시 `setup.js` 가 활성 `targets` 를 보고 각각 복사합니다.

## 3. Pairing (페어링)

**같은 identity 를 가진 자산이 양 타깃에 대응되는 상태**. `src/pairing-registry.json` 의 `entries[]` 로 추적합니다.

### 3.1 Status 종류

| Status | 의미 | 예시 |
|--------|------|------|
| `paired` | 양쪽 모두 존재, 내용 동기화됨 | `continuous-learning` 스킬 |
| `claude-only` | Claude 에만 존재 (아직 Codex 포팅 전) | 새로 추가된 자산 |
| `codex-only` | Codex 에만 존재 | 드묾 |
| `skip` | 고의적 미포팅 | Codex 미지원 훅 등 |

### 3.2 Entry 구조

```json
{
  "identity": "output-secret-filter",
  "type": "hook",
  "domain": "core",
  "status": "paired",
  "reason": null,
  "claude": "src/claude/core/hooks/output-secret-filter.js",
  "codex": "src/codex/core/hooks/output-secret-filter.js",
  "createdAt": "2026-04-10T00:00:00.000Z"
}
```

전체 상태 스냅샷: [30-reference/07-pairing-registry.md](../30-reference/07-pairing-registry.md) (자동 생성).

## 4. Skip 정책 — 왜 어떤 자산은 포팅 안 하는가

`src/exception-registry.json` 에 사유가 명시됩니다.

| 카테고리 | 예 | 사유 |
|---------|---|------|
| Codex runtime 미지원 | `session-wrap-suggest.js` | Claude session state 의존성 |
| 매처 호환 문제 | 일부 `Edit\|Write` 매처 훅 | Codex v1 에서 제한적 |
| 설계 철학 차이 | MCP 자산 | v1 에서 제외 (인증·transport 설계 필요) |

skip 된 자산도 **pairing-registry 에는 `skip` 상태로 기록** 됩니다 — "빼먹은 것"이 아니라 "의도적 제외" 임을 추적 가능.

## 5. Hook 호환성

Codex 는 Claude 와 hook 매처 문법이 다릅니다. claude-kit 은 이를 `src/claude/_meta/codex-portability.json` 로 분류합니다.

| 분류 | 의미 | 예시 |
|------|------|------|
| Full | Codex 에서도 동일 동작 | `output-secret-filter` |
| Partial | 매처 제한 등 부분 지원 | `dev-tdd-guard` (특정 매처만) |
| Skip | Codex 미지원 | `session-wrap-suggest` |

검증 스크립트: [`scripts/codex-hook-compat.js`](../../scripts/codex-hook-compat.js).

## 6. 규칙 전달 — rules → AGENTS.md

Claude 에서 `.claude/rules/*.md` 는 각자 독립 파일로 로드됩니다. Codex 에는 **별도 파일이 없고** , 대신 핵심 규칙이 `AGENTS.md` 안에 흡수됩니다.

`setup.js` 가 Codex 타깃에서 할 때:
```
src/claude/core/rules/*.md
  ↓ (요약 발췌)
AGENTS.md 의 "## 운영 규칙" 섹션
```

이로 인해 Codex 에서는 규칙이 약간 축약된 형태로 전달됩니다. 전체 규칙을 따르려면 `src/claude/core/rules/` 를 직접 참조.

## 7. 커맨드 쓰는 법 차이

| 환경 | 커맨드 호출 |
|------|-----------|
| Claude Code | `/dev-feature`, `/plan-prd` 등 슬래시 입력 |
| Codex | `/plugin:claude-kit:dev-feature` 형태 (네임스페이스 포함) |

그러나 `AGENTS.md` 에서는 편의상 슬래시 형태만 언급되고, Codex 가 네임스페이스를 자동 매핑합니다.

## 8. 듀얼 설치 체크리스트

```json
// profile.json
{
  "domains": ["core", "dev"],
  "targets": ["claude", "codex"]
}
```

설치 후 확인:
- [ ] `.claude/` 와 `plugins/claude-kit/` 둘 다 생성
- [ ] `CLAUDE.md` 와 `AGENTS.md` 둘 다 존재
- [ ] `.agents/plugins/marketplace.json` 에 plugin 등록
- [ ] `plugins/claude-kit/hooks.json` 에 Codex 호환 훅만 나열
- [ ] `scripts/audit-pairing.js` 실행 시 drift 0

## 9. 운영 도구

| 도구 | 용도 |
|------|------|
| [`scripts/audit-pairing.js`](../../scripts/audit-pairing.js) | pairing-registry 와 실제 파일 일치 검증 |
| [`scripts/audit-drift.js`](../../scripts/audit-drift.js) | 페어링된 자산 간 내용 drift 탐지 |
| [`scripts/codex-hook-compat.js`](../../scripts/codex-hook-compat.js) | hook 호환성 분류 |
| [`/kit-audit`](../../.claude/commands/kit-audit.md) | 전수 감사 (cross-check 포함) |
| [`/kit-sync`](../../.claude/commands/kit-sync.md) | Claude → Codex 동기화 |

## 다음 읽기

- [../30-reference/07-pairing-registry.md](../30-reference/07-pairing-registry.md) — 현 pairing 상태 자동 스냅샷
- [../20-user-guide/06-codex-dual-use.md](../20-user-guide/06-codex-dual-use.md) — 실제 듀얼 사용 (P4 예정)
