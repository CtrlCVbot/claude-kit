# Codex 설치 지원 v1 구현계획

> 목적: `claude-kit`를 Claude 전용 설치기에서 Claude + Codex 멀티타깃 설치기로 확장하기 위한 v1 구현 명세를 고정한다.
>
> 이 문서는 아이디어 제안서가 아니라 구현 전에 읽고 바로 작업에 들어갈 수 있는 명세 문서다.

---

## 1. 목표와 비목표

### 1.1 목표

- `claude-kit`를 Claude 전용 설치기에서 Claude + Codex 멀티타깃 설치기로 확장한다.
- 기존 Claude 설치 흐름은 유지한 채 Codex용 설치 타깃을 추가한다.
- Codex v1은 repo-local plugin 설치를 기본으로 지원한다.
- 설치기 구조를 재편하여 이후 추가 타깃이 들어와도 emitter 단위로 확장 가능하게 만든다.

### 1.2 비목표

- Claude와 Codex의 런타임 동작을 완전히 동일하게 재현하지 않는다.
- 전역 `~/.codex` 홈 설치 자동화는 v1 범위에 포함하지 않는다.
- 모든 Claude 전용 hook과 세션 기능을 Codex로 이식하지 않는다.
- `mcp-servers.json`을 Codex에 직접 이식하는 작업은 v1 필수 범위에 포함하지 않는다.

### 1.3 v1 성공 기준

- `targets=["codex"]`로 설치할 때 Codex plugin 구조가 정상 생성된다.
- `targets=["claude","codex"]`로 설치할 때 두 타깃이 동시에 생성되고 서로를 덮어쓰지 않는다.
- 기존 Claude 사용자는 설정 변경 없이 그대로 동작한다.
- Codex에서 지원하지 않는 자산은 설치 실패가 아니라 명시적 skip으로 기록된다.

---

## 2. 현재 구조 진단

## 2.1 설치 진입점

현재 설치 진입점은 [`scripts/setup.js`](../../scripts/setup.js)다.

이 스크립트는 현재 다음 전제를 고정하고 있다.

- 출력 루트는 `.claude/`다.
- 프로젝트 컨텍스트 문서는 `CLAUDE.md`다.
- 설정 파일은 `.claude/settings.json`이다.
- 메타데이터는 `.claude-kit-meta.json`에 기록된다.
- 설치 대상 컴포넌트는 `agents`, `commands`, `skills`, `hooks`, `rules` 5종이다.

즉 현재 설치기는 "Claude 자산을 `.claude/`로 플래트닝 복사하는 설치기"로 설계되어 있다.

## 2.2 현재 문서/템플릿 전제

다음 파일들이 Claude 전용 사용 흐름을 전제한다.

- [`README.md`](../../README.md)
- [`src/templates/CLAUDE.md.template`](../../src/templates/CLAUDE.md.template)
- [`src/templates/settings.json.template`](../../src/templates/settings.json.template)
- [`src/templates/profile.json.template`](../../src/templates/profile.json.template)

현재 문서와 템플릿은 모두 아래와 같은 계약을 중심으로 설명한다.

- 사용자는 프로젝트 루트에 `CLAUDE.md`를 가진다.
- 설치 결과는 `.claude/` 아래에 배치된다.
- settings 병합 대상은 `.claude/settings.json`이다.

## 2.3 Codex 지원에 대한 현재 제약

소스 전반에는 Claude 전용 참조가 다수 존재한다.

주요 유형은 다음과 같다.

- `.claude/...` 상대 경로 참조
- `~/.claude/...` 홈 경로 참조
- `CLAUDE.md` 파일명 전제
- `CLAUDE_SESSION_ID`, `CLAUDE_REMOTE_SESSION` 등 Claude 전용 환경변수
- Claude remote session 전용 보안/로그 처리

따라서 Codex 지원은 단순 경로 치환이 아니라 "타깃별 설치 출력 + 타깃별 자산 해석" 문제로 봐야 한다.

---

## 3. Codex 목표 구조

## 3.1 설치 단위

Codex v1의 설치 단위는 repo-local plugin이다.

v1에서 생성할 출력 구조는 아래와 같이 고정한다.

```text
{project}/
├─ AGENTS.md
├─ .agents/
│  └─ plugins/
│     └─ marketplace.json
└─ plugins/
   └─ claude-kit/
      ├─ .codex-plugin/
      │  └─ plugin.json
      ├─ agents/
      ├─ commands/
      ├─ skills/
      ├─ hooks.json
      └─ assets/              # v1에서는 필요 시 최소 자산만 생성
```

## 3.2 Codex plugin 구성 원칙

- plugin 이름은 `claude-kit`로 고정한다.
- 자산은 plugin 내부에서 `skills`, `commands`, `agents`, `hooks.json` 기준으로 배치한다.
- 프로젝트 컨텍스트 문서는 `AGENTS.md`를 기준으로 삼는다.
- plugin 설치 정보는 `.agents/plugins/marketplace.json`에 등록한다.
- plugin manifest는 `plugins/claude-kit/.codex-plugin/plugin.json`에 생성한다.

## 3.3 v1에서 생성할 관리 파일

### `AGENTS.md`

- `CLAUDE.md`와 동일 역할의 Codex 프로젝트 컨텍스트 문서
- fresh install에서만 생성하고 기존 파일이 있으면 보존

### `plugins/claude-kit/.codex-plugin/plugin.json`

- plugin manifest
- `skills`, `hooks`, 필요 시 `commands`, `agents`를 선언 가능한 구조로 생성

### `.agents/plugins/marketplace.json`

- repo-local plugin 노출용 marketplace 파일
- 이미 존재하면 병합
- 같은 plugin entry가 있으면 중복 생성 금지

### `plugins/claude-kit/hooks.json`

- Codex 형식으로 옮길 수 있는 hook만 기록
- Claude 전용 hook은 제외하거나 skip 처리

---

## 4. 설치기 리팩터링 계획

## 4.1 목표 구조

`setup.js`는 v1에서 아래 3단 구조로 리팩터링한다.

```text
source assets
-> normalization
-> target emitter
```

### source assets

- `src/{domain}/{category}` 기준 원본 자산 수집
- `templates/`
- `mcp-servers.json`

### normalization

- 활성 `domains` 계산
- 활성 `targets` 계산
- 컴포넌트 메타데이터 수집
- 자산별 변환 필요 여부 판정
- skip 사유 계산

### target emitter

- `claude emitter`
- `codex emitter`

## 4.2 emitter 분리 원칙

### `claude emitter`

- 현재 동작을 최대한 유지한다.
- 출력 위치는 `.claude/`
- 컨텍스트 문서는 `CLAUDE.md`
- 설정 파일은 `.claude/settings.json`

### `codex emitter`

- 신규 구현 대상
- 출력 위치는 `plugins/claude-kit/` + `.agents/plugins/marketplace.json`
- 컨텍스트 문서는 `AGENTS.md`
- Codex plugin manifest와 hook 설정을 생성한다.

## 4.3 `profile.json` 변경 계획

기존 `profile.json`의 `domains`는 유지하고 `targets`를 추가한다.

### v1 인터페이스

```json
{
  "domains": ["core", "dev"],
  "targets": ["claude"]
}
```

### 규칙

- `targets`가 없으면 기본값은 `["claude"]`
- 허용 값은 `claude`, `codex`
- `domains`와 `targets`는 독립 축으로 처리
- `core`는 현재처럼 항상 강제 포함

## 4.4 `.claude-kit-meta.json` 확장 계획

기존 메타데이터에 아래 필드를 추가한다.

- `targets`
- `outputs`
- `skippedForCodex`

### 예시 스키마

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
    }
  ]
}
```

---

## 5. 자산 매핑 규칙

## 5.1 컴포넌트별 처리 원칙

| 자산 유형 | Claude 출력 | Codex 출력 | v1 처리 원칙 |
|------|------|------|------|
| `skills` | `.claude/skills/` | `plugins/claude-kit/skills/` | 기본 지원 |
| `commands` | `.claude/commands/` | `plugins/claude-kit/commands/` | 기본 지원 |
| `agents` | `.claude/agents/` | `plugins/claude-kit/agents/` | 기본 지원 |
| `hooks` | `.claude/hooks/` | `plugins/claude-kit/hooks.json` + 필요 시 보조 스크립트 | 부분 지원 |
| `rules` | `.claude/rules/` | 직접 배치 안 함, `AGENTS.md` 또는 plugin 문서에서 참조 | 부분 지원 |
| `templates` | `CLAUDE.md`, `.claude/settings.json`, `profile.json` | `AGENTS.md`, plugin manifest, marketplace | 타깃별 생성 |
| `mcp` | `.claude/settings.json` 또는 별도 참조 | v1 필수 아님 | 제외 |

## 5.2 경로 변환 규칙

### `.claude/...` 참조

자산 본문에 `.claude/...` 참조가 있으면 아래 우선순위로 변환한다.

1. Codex plugin 내부 상대 경로로 치환
2. 프로젝트 루트 기준 `plugins/claude-kit/...`로 치환
3. v1에서 안전하게 치환할 수 없으면 skip 또는 수동 검토 대상으로 분류

### `CLAUDE.md` 참조

Codex 타깃에서는 `CLAUDE.md`를 `AGENTS.md`로 치환한다.

치환 대상 예시는 아래와 같다.

- 문서 안내
- 프로젝트 컨텍스트 참조
- 파일 탐색 패턴
- 허용 예외 목록

### `~/.claude/...` 참조

`~/.claude/...` 참조는 v1에서 자동 이식하지 않는다.

처리 원칙은 아래와 같다.

- Codex에서 직접 대응 경로가 없으면 skip
- 홈 디렉토리 기반 런타임 저장은 v1 범위 제외
- 필요 시 문서에 "Codex 미지원"으로 명시

## 5.3 hook 변환 규칙

Codex v1에서는 hook을 전부 복사하지 않는다.

| hook 유형 | v1 처리 |
|------|------|
| Codex `hooks.json` 형식으로 옮길 수 있는 단순 hook | 지원 |
| Claude 전용 환경변수에 의존하는 hook | 제외 |
| `~/.claude` 런타임 저장에 의존하는 hook | 제외 |
| remote session 전용 hook | 제외 |

### v1에서 우선 검토할 hook

- `edit-tracker.js`
- `code-quality-reminder.js`
- `security-auto-trigger.js`

### v1에서 제외할 가능성이 높은 hook

- `output-secret-filter.js`
- `session-wrap-suggest.js`

위 제외 판단은 실제 Codex hook 형식과 런타임 의존성 검토 후 확정하되, v1 문서 기준으로는 "지원 보장 아님"으로 잠근다.

---

## 6. v1 지원 범위와 제외 범위

## 6.1 지원 범위

v1에서 지원하는 항목은 아래와 같다.

- Codex target 선택 및 설치
- repo-local plugin 구조 생성
- plugin manifest 생성
- marketplace 등록 또는 병합
- `AGENTS.md` 생성
- 기본 `skills`, `commands`, `agents` 배치
- Codex로 이식 가능한 최소 hook 연결
- Codex 제외 자산 목록 메타데이터 기록

## 6.2 부분 지원

아래 항목은 v1에서 부분 지원으로 본다.

- hook
- rule 자산 연결
- 문서 내부 경로 치환
- 자산 본문 중 Claude 전용 표현의 자동 변환

부분 지원의 의미는 "Codex 설치기를 깨지 않는 범위에서만 자동 이식"이다.

## 6.3 제외 범위

아래 항목은 v1에서 명시적으로 제외한다.

- `~/.claude` 홈 디렉토리 의존
- `CLAUDE_SESSION_ID`
- `CLAUDE_REMOTE_SESSION`
- Claude remote session 전용 동작
- Anthropic 전용 MCP 또는 설정 흐름
- Codex 전역 홈 설치 자동화
- Claude와 Codex 간 동일한 settings semantics 보장

---

## 7. 검증 계획

## 7.1 검증 시나리오

### 시나리오 A: `claude only`

- `targets=["claude"]`
- 기존 설치 결과가 유지되는지 확인

### 시나리오 B: `codex only`

- `targets=["codex"]`
- Codex plugin 구조가 완전 생성되는지 확인

### 시나리오 C: `claude + codex`

- `targets=["claude","codex"]`
- `.claude/`와 Codex plugin이 동시에 생성되고 서로 덮어쓰지 않는지 확인

### 시나리오 D: `update install`

- 기존 `CLAUDE.md`, `AGENTS.md`, marketplace 파일이 있을 때 병합/보존 규칙이 유지되는지 확인

## 7.2 검증 항목

| 검증 항목 | 확인 내용 |
|------|------|
| 생성 파일 트리 | 예상된 출력 경로가 모두 생성되는지 |
| 기존 파일 보존 | `CLAUDE.md`, `AGENTS.md`가 불필요하게 덮어써지지 않는지 |
| marketplace 중복 방지 | 같은 plugin entry가 중복 생성되지 않는지 |
| hook 경로 유효성 | Codex hook 설정이 실제 파일 경로를 가리키는지 |
| skip 기록 | 제외된 자산이 메타데이터에 기록되는지 |
| Claude 회귀 없음 | 기존 `.claude` 설치 흐름이 깨지지 않는지 |

## 7.3 수동 검증

자동 스모크 외에 아래 수동 검증 1회를 포함한다.

- Codex에서 plugin이 노출되는지 확인
- Codex에서 command/skill이 탐색 가능한지 확인
- 지원 대상 hook 1개 이상이 실제로 동작하는지 확인

---

## 8. 구현 순서

1. 이 문서를 승인한다.
2. `setup.js`를 멀티타깃 설치 구조로 리팩터링한다.
3. Codex용 템플릿과 manifest 생성 로직을 추가한다.
4. Codex emitter를 구현한다.
5. 스모크 검증을 수행한다.
6. 구현 완료 후 `README.md`와 `docs/guide` 설치 설명을 갱신한다.

## 8.1 세부 작업 순서

### Step 1. 데이터 모델 확장

- `profile.json`의 `targets` 처리 추가
- `.claude-kit-meta.json` 확장

### Step 2. 설치기 구조 분리

- 도메인 해석 로직 유지
- 타깃 해석 로직 추가
- emitter 인터페이스 도입

### Step 3. Codex 출력기 구현

- plugin root 생성
- plugin manifest 생성
- marketplace 생성 또는 병합
- `AGENTS.md` 생성
- 자산 복사 및 필요한 경로 치환

### Step 4. hook/skip 처리

- Codex 호환 hook만 출력
- 제외 항목은 skip 목록에 기록

### Step 5. 검증 및 문서 업데이트

- 4개 시나리오 테스트
- 구현 후 README/guide 업데이트

---

## 9. 후속 문서 반영 범위

이 문서 단계에서는 구현 명세만 작성한다.

아래 문서는 구현 완료 후에만 반영한다.

- [`README.md`](../../README.md)
- `docs/guide`의 설치 관련 문서
- 필요 시 `docs/guide/09-architecture.md`

즉 지금 단계에서는 가이드 문서를 먼저 바꾸지 않는다.

---

## 10. Locked Decisions

- Codex v1 기본 설치 위치는 전역 `~/.codex`가 아니라 프로젝트 로컬 plugin 구조다.
- 기존 Claude 사용자는 설정 변경 없이 그대로 동작해야 한다.
- `profile.json`의 새 인터페이스는 `domains` 유지 + `targets` 추가로 끝낸다.
- `.claude-kit-meta.json`에는 `targets`, 생성 결과, Codex 제외 자산 목록을 추가한다.
- `mcp-servers.json`의 Codex 직접 이식은 v1 필수 범위에서 제외한다.

---

## 11. Test Cases

### Case 1. Codex 단독 설치

- 신규 프로젝트에 `targets=["codex"]`만 있을 때 Codex plugin 구조가 완전 생성된다.

### Case 2. 듀얼 타깃 설치

- `targets=["claude","codex"]`일 때 `.claude/`와 Codex plugin이 동시에 생성되고 서로 덮어쓰지 않는다.

### Case 3. 업데이트 설치

- 기존 `CLAUDE.md`와 `AGENTS.md`는 보존되고 관리 파일만 병합 또는 갱신된다.

### Case 4. skip 처리

- Codex에서 제외된 자산은 설치 실패가 아니라 보고 가능한 skip으로 기록된다.

---

## 12. Assumptions

- Codex의 설치 단위는 plugin이다.
- plugin 안에 `skills`, `commands`, `agents`, `hooks.json`을 함께 둘 수 있다는 현재 구조를 기준으로 한다.
- 구현 명세 문서는 리뷰자가 "무엇을 만들지"와 "무엇을 아직 안 만들지"를 바로 판단할 수 있어야 한다.
- 이 문서가 승인되면 그 다음 단계에서 실제 소스 수정 계획과 구현에 들어간다.

---

## 13. References

### 저장소 내부 근거

- [`scripts/setup.js`](../../scripts/setup.js)
- [`README.md`](../../README.md)
- [`src/templates/CLAUDE.md.template`](../../src/templates/CLAUDE.md.template)
- [`src/templates/settings.json.template`](../../src/templates/settings.json.template)
- [`src/templates/profile.json.template`](../../src/templates/profile.json.template)

### 로컬 Codex 참조 근거

- `C:/Users/user/.codex/skills/.system/plugin-creator/references/plugin-json-spec.md`
- `C:/Users/user/.codex/.tmp/plugins/plugins/figma/hooks.json`
- `C:/Users/user/.codex/.tmp/plugins/plugins/figma/.codex-plugin/plugin.json`

### 외부 참고

- [Using Codex with your ChatGPT plan - Plugins](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan.pdf)

