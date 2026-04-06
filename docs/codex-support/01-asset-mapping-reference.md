# Asset Mapping Reference

> claude-kit 소스 자산이 Claude/Codex 타겟별로 어떻게 변환되는지 정의한다.

---

## 자산별 변환 규칙

| 자산 유형 | Claude 출력 | Codex 출력 | 지원 수준 | 변환 유형 |
|---------|------------|-----------|:--------:|----------|
| `skills` | `.claude/skills/` | `plugins/claude-kit/skills/` | Full (path copy) | 경로 변환 |
| `commands` | `.claude/commands/` | `plugins/claude-kit/commands/` | Full (path copy) | 경로 변환 |
| `agents` | `.claude/agents/` | `plugins/claude-kit/agents/` | Full (path copy) | 경로 변환 |

> **"Full (path copy)"의 의미**: 파일은 그대로 복사된다. 자산 내부의 `.claude/` 경로 참조는 v1에서 자동 변환하지 않는다. 내부 참조 정규화는 v2 범위.
| `hooks` | `.claude/hooks/*.js` | `plugins/claude-kit/hooks.json` | Partial | 구조 변환 (JS → JSON 선언) |
| `rules` | `.claude/rules/*.md` | `AGENTS.md` 참조 | Partial | 내용 흡수 |
| `templates` | `CLAUDE.md`, `.claude/settings.json` | `AGENTS.md`, `plugin.json`, `marketplace.json` | Target-specific | 타겟별 생성 |
| `mcp` | `.claude/settings.json` 내 참조 | -- | Excluded | v1 제외 |

---

## 경로 변환 규칙

### `.claude/...` 참조

자산 본문에 `.claude/...` 참조가 있을 때 우선순위:

1. **plugin 내부 상대 경로**로 치환 (예: `.claude/skills/foo/` → `skills/foo/`)
2. **프로젝트 루트 기준** `plugins/claude-kit/...`로 치환
3. v1에서 안전하게 치환할 수 없으면 **skip** 또는 수동 검토 대상으로 분류

> 단순 문자열 치환으로 끝내지 않는다. 같은 `.claude/...` 참조라도 문서 설명, 실행 경로, 런타임 저장 위치의 의미가 다를 수 있다.

### `CLAUDE.md` 참조

Codex 타겟에서는 `CLAUDE.md` → `AGENTS.md`로 치환.

치환 대상:
- 문서 안내 텍스트
- 프로젝트 컨텍스트 참조
- 파일 탐색 패턴
- 허용 예외 목록

### `~/.claude/...` 참조

v1에서 자동 이식하지 않는다.

- Codex에서 직접 대응 경로가 없으면 skip
- 홈 디렉토리 기반 런타임 저장은 v1 범위 제외
- 필요 시 문서에 "Codex 미지원"으로 명시

---

## Hook 변환 상세

### 변환 형식

Claude의 개별 JS 파일(`hooks/*.js`)이 Codex에서는 단일 `hooks.json` 선언으로 변환된다.

```
Claude:                              Codex:
.claude/hooks/                       plugins/claude-kit/hooks.json
  ├── edit-tracker.js                {
  ├── code-quality-reminder.js         "hooks": [
  └── security-auto-trigger.js           { "name": "edit-tracker", ... },
                                         { "name": "code-quality-reminder", ... },
                                         { "name": "security-auto-trigger", ... }
                                       ]
                                     }
```

### 지원/제외 기준

| 기준 | 결과 | 이유 |
|------|:----:|------|
| Codex `hooks.json` 형식으로 변환 가능 | **지원** | 구조 대응이 명확 |
| Claude 전용 환경변수 의존 (`CLAUDE_SESSION_ID` 등) | **제외** | Codex에서 동일 env 보장 안 됨 |
| `~/.claude` 런타임 저장 의존 | **제외** | repo-local 모델과 충돌 |
| remote session 전용 | **제외** | Claude 전용 실행 맥락 |

### v1 우선 검토 Hook

| Hook | v1 판정 | 이유 |
|------|:-------:|------|
| `edit-tracker.js` | 지원 검토 | 파일 편집 이력 기록, 범용적 |
| `code-quality-reminder.js` | 지원 검토 | 품질 체크 리마인더, 범용적 |
| `security-auto-trigger.js` | 지원 검토 | 보안 민감 파일 감지, 범용적 |
| `output-secret-filter.js` | **제외** | `CLAUDE_REMOTE_SESSION` + `~/.claude` 의존 |
| `session-wrap-suggest.js` | **제외** | Claude Stop 이벤트 전용 |
| `dev-tdd-guard.js` | 지원 검토 | TDD 강제, 이벤트 모델 호환성 검토 필요 |
| `dev-db-guard.js` | 지원 검토 | SQL 위험 명령 차단, 이벤트 모델 호환성 검토 필요 |
| `plan-doc-guard.js` | 지원 검토 | 기획 중 소스 수정 차단, 이벤트 모델 호환성 검토 필요 |

---

## `.claude-kit-meta.json` 확장

Codex 지원 시 메타데이터에 추가되는 필드:

```json
{
  "version": "2.0.0",
  "domains": ["core", "dev"],
  "targets": ["claude", "codex"],
  "outputs": {
    "claude": {
      "root": ".claude",
      "generated": ["CLAUDE.md", ".claude/settings.json"]
    },
    "codex": {
      "root": "plugins/claude-kit",
      "generated": [
        "AGENTS.md",
        "plugins/claude-kit/.codex-plugin/plugin.json",
        ".agents/plugins/marketplace.json",
        "plugins/claude-kit/hooks.json"
      ]
    }
  },
  "skippedForCodex": [
    {
      "component": "output-secret-filter.js",
      "reason": "depends on CLAUDE_REMOTE_SESSION and ~/.claude runtime"
    },
    {
      "component": "session-wrap-suggest.js",
      "reason": "depends on Claude Stop event (no Codex equivalent)"
    }
  ]
}
```

### skip 기록 원칙

- v1에서 이식하지 못한 자산은 숨기지 않고 `skippedForCodex`에 기록
- 각 항목에 `component`(자산명)와 `reason`(제외 사유) 포함
- 이 메타데이터는 v2 범위 정의와 회귀 분석에 활용

---

## 설치기 3-Stage 아키텍처

```
source assets (src/{domain}/{category})
  → normalization (도메인 계산 + 타겟 계산 + skip 판정)
  → target emitter (Claude emitter | Codex emitter)
```

| Stage | 역할 |
|-------|------|
| **Source** | `src/core/`, `src/dev/`, `src/plan/` + `templates/` 수집 |
| **Normalization** | 활성 domains/targets 계산, 자산별 변환 필요 여부 판정, skip 사유 기록 |
| **Claude Emitter** | `.claude/` 폴더 구조 출력 (기존 동작 유지) |
| **Codex Emitter** | `plugins/claude-kit/` 플러그인 구조 출력 (신규) |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [implementation-plan.md](./implementation-plan.md) | v1 구현 설계 명세 (§5 자산 매핑 규칙 원본) |
| [00-codex-quickstart.md](./00-codex-quickstart.md) | 사용자 가이드 |
| [guide/09-architecture.md](../guide/09-architecture.md) | 컴포넌트 카탈로그 (자산 인벤토리 SSOT) |
