# Guide Alignment Audit

> `docs/guide` 문서군을 실제 저장소 구조와 Codex 전환 기준에 맞춰 점검하는 문서

## 단계 위치

- 실행 단계: `2단계`
- 선행 조건: `08` baseline 확정
- 후속 문서: `10`, `14`

## 목적

Claude → Codex 전환 설계를 구현하기 전에, 기존 guide 문서 중 어떤 설명이 현재 구조와 맞고 어떤 설명이 수정이 필요한지 정리한다.

## 검토 대상

### 구조 / 용어 핵심

- [00-overview.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\00-overview.md)
- [09-architecture.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\09-architecture.md)
- [10-glossary.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\10-glossary.md)

### dev 기능 해석

- [08-dev-workflow.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\08-dev-workflow.md)

### plan 기능 해석

- [01-planning-pipeline.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\01-planning-pipeline.md)
- [02-idea-management.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\02-idea-management.md)
- [03-screening.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\03-screening.md)
- [04-feature-planning.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\04-feature-planning.md)
- [05-design.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\05-design.md)
- [06-dev-handoff.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\06-dev-handoff.md)
- [07-review-pcc.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\07-review-pcc.md)
- [11-archive-improve.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\11-archive-improve.md)
- [12-blueprint-fast-track.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\12-blueprint-fast-track.md)

## audit 기준

각 문서는 아래 중 하나로 판정한다.

- `aligned`: 현재 구조와 설명이 맞다
- `needs-update`: Codex 전환 기준과 충돌한다
- `follow-up`: 지금은 맞지만 후속 구현 후 반영이 필요하다

## 실행 순서

### 1차 검토

- `00-overview`
- `09-architecture`
- `10-glossary`

이 단계에서는 구조 설명, 용어, 설치 모델, Codex 표기가 현재 SSOT와 맞는지 먼저 본다.

### 2차 검토

- `08-dev-workflow`

이 단계에서는 dev 도메인 command/skill/agent의 의미가 baseline 카탈로그와 맞는지 확인한다.

### 3차 검토

- `01~07`
- `11`
- `12`

이 단계에서는 plan 흐름에서 각 기능이 어떤 identity로 소비되는지 확인하고, guide 표현이 target-separated authoring과 충돌하는지 본다.

## 우선 확인할 충돌 포인트

- `src/claude` 자산을 그대로 Codex runtime path로 복사하는 설명
- `plugins/claude-kit/agents` 또는 `plugins/claude-kit/commands`를 Codex native surface처럼 설명한 부분
- old hook runtime 설명
- old AGENTS.md / rules 설명
- Claude 기능을 `agents`로만 축소해서 설명한 부분

## 산출물

이 문서의 목적은 문장 수정이 아니라, 어떤 guide 문서를 어떤 메시지로 바꿔야 하는지 목록을 확정하는 것이다.

문서별 산출물은 최소 아래를 포함한다.

| 문서 | 판정 | 현재 설명 | 문제 이유 | 목표 설명 | 반영 시점 | 비고 / 위치 |
|------|------|-----------|-----------|-----------|-----------|-------------|
| guide path | `aligned` / `needs-update` / `follow-up` | 현재 guide가 말하는 핵심 문장 | 왜 현재 SSOT와 어긋나는지 | 어떤 메시지로 바꿔야 하는지 | 즉시 / 구현 후 | 가능하면 절, 표, 문단 위치 |

`aligned` 판정이라도 아래 중 하나는 남긴다.

- 유지 근거
- 확인한 기준 문서
- 후속 구현 시 다시 볼 조건

## audit 결과

### 판정 요약

- `needs-update`: 4개 (`00`, `03`, `09`, `10`)
- `follow-up`: 2개 (`01`, `08`)
- `aligned`: 7개

| 문서 | 판정 | 현재 설명 | 문제 이유 | 목표 설명 | 반영 시점 | 비고 / 위치 |
|------|------|-----------|-----------|-----------|-----------|-------------|
| [00-overview.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\00-overview.md) | `needs-update` | Codex를 `plugins/claude-kit/` 중심 플러그인 구조로 설명하고, Agent/Command/Skill/Hook을 Claude와 Codex에 거의 대칭으로 배치된다고 설명한다. | 현재 SSOT는 `src/claude` + `src/codex` sibling authoring과 Codex native surface(`AGENTS.md`, `.codex/agents`, `.codex/hooks.json`)를 기준으로 한다. `plugins/claude-kit/agents|commands|hooks.json` 중심 설명은 충돌한다. | 개요 문서에서는 target-separated authoring, Claude/Codex의 서로 다른 runtime surface, `core`의 공통 계층 역할만 요약하고 상세 계약은 `docs/codex-compatibility`로 넘긴다. | 즉시 | 한눈에 보기, 도메인 구조, 컴포넌트 유형 5가지 표 |
| [01-planning-pipeline.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\01-planning-pipeline.md) | `follow-up` | planning 파이프라인 자체는 설치 타겟 구조에 의존하지 않지만, 관련 문서에서 `09-architecture`를 Claude/Codex 출력 계약 SSOT로 참조한다. | 본문은 맞지만 참조 대상 문서가 크게 바뀌므로, architecture 개정 후 링크 설명을 다시 맞춰야 한다. | planning 흐름 설명은 유지하고, 관련 문서 표의 architecture 설명 문구만 최신 구조 기준으로 재정렬한다. | 구현 후 | 관련 문서 표 |
| [02-idea-management.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\02-idea-management.md) | `aligned` | 아이디어 수집/관리 흐름만 다루고 설치 구조나 Codex runtime을 전제하지 않는다. | 현재 SSOT와 직접 충돌하는 설명이 없다. | 현재 내용 유지. | 유지 | 유지 근거: 기능 워크플로우 중심 문서 |
| [03-screening.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\03-screening.md) | `needs-update` | screening workflow 자체는 유효하지만, 관련 문서 표에 현재 저장소 구조와 맞지 않는 guide 파일명과 source 링크가 남아 있다. | `02-idea-collection.md`, `04-feature-draft.md`, `01-pipeline-overview.md` 같은 이전 문서명을 참조하고, `../src/claude/...` 링크도 현재 `docs/guide` 기준 상대 경로가 깨져 있다. | screening 본문은 유지하되, 관련 문서 표를 현재 guide 파일명과 실제 source 경로 기준으로 다시 맞춘다. | 즉시 | 관련 문서 표 292~297행 주변 |
| [04-feature-planning.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\04-feature-planning.md) | `aligned` | P3 기능 기획 절차와 산출물 중심으로 설명한다. | 설치 타겟 구조와 직접 충돌하는 설명이 없다. | 현재 내용 유지. | 유지 | 유지 근거: planning 산출물 SSOT 설명 |
| [05-design.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\05-design.md) | `aligned` | wireframe/stitch 설계 흐름을 설명한다. | Codex 설치 모델과 충돌하는 전제가 없다. | 현재 내용 유지. | 유지 | 유지 근거: design 단계 문서 |
| [06-dev-handoff.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\06-dev-handoff.md) | `aligned` | planning에서 dev로 넘어가는 handoff 산출물과 흐름을 설명한다. | target-separated authoring과 직접 충돌하는 부분이 없다. | 현재 내용 유지. | 유지 | 유지 근거: handoff contract 문서 |
| [07-review-pcc.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\07-review-pcc.md) | `aligned` | 리뷰/PCC 검증 흐름과 판정 기준을 설명한다. | 설치 구조나 Codex runtime 가정이 없다. | 현재 내용 유지. | 유지 | 유지 근거: 검증 규칙 문서 |
| [08-dev-workflow.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\08-dev-workflow.md) | `follow-up` | dev workflow, hooks, guard, package 흐름은 대체로 맞지만, `dev-feature-scope-guard`를 현재 동작하는 hook처럼 읽힐 수 있게 설명한다. | baseline 기준으로는 `dev-feature-scope-guard` source는 존재하지만 현재 `.claude/settings.json`에는 미등록 상태다. workflow 설명과 실제 runtime 상태가 완전히 일치하지 않는다. | dev workflow 본문은 유지하되, hook 설명에는 “설계상 guard”와 “현재 등록 상태”를 구분하거나 architecture 반영 시점에 함께 정리한다. | 구현 후 | Hooks 섹션 219~225행 주변 |
| [09-architecture.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\09-architecture.md) | `needs-update` | `src/claude` source를 Codex `plugins/claude-kit/agents|commands|skills|hooks`로 path copy하는 모델과 `hooks.json`, `skippedForCodex` 중심의 구형 Codex 계약을 SSOT처럼 설명한다. 기능 수량도 현재 baseline과 어긋난다. | 현재 SSOT는 `src/codex`를 정식 authoring source로 두고, Codex install은 `src/codex`를 읽으며, `.codex/agents/*.toml`, `.codex/hooks.json`, `AGENTS.md`, exec-policy rule surface를 기준으로 한다. | architecture 문서는 source layout, installer ownership, target surface, shared guidance, `src/codex` sibling 개념을 기준으로 전면 재작성한다. | 즉시 | 개요, 출력 계약 표, Codex 지원 상세, 훅 호환성, 메타 예시 전반 |
| [10-glossary.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\10-glossary.md) | `needs-update` | `플래트닝`, `Codex Plugin`, `Full (path copy)`, `skippedForCodex` 등을 구형 Codex v1 용어로 정의한다. | 현재 설계는 path-copy가 아니라 sibling authoring + target-native install이고, Codex 용어도 `subagent`, `AGENTS.md`, `.codex/hooks.json`, `exec-policy rule` 중심으로 바뀌었다. | 용어집은 구형 용어를 역사적 배경으로 내리거나 제거하고, 현재 SSOT 용어를 올린다. | 즉시 | 용어 정의 표 42~47행 주변 |
| [11-archive-improve.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\11-archive-improve.md) | `aligned` | 아카이브와 개선요청 재진입 흐름을 설명한다. | 설치 타겟 구조와 직접 충돌하지 않는다. | 현재 내용 유지. | 유지 | 유지 근거: archive workflow 문서 |
| [12-blueprint-fast-track.md](C:\Program Files (user)\mologado\claude-kit\docs\guide\12-blueprint-fast-track.md) | `aligned` | blueprint fast-track 진입과 planning 정규화 흐름을 설명한다. | Claude/Codex 설치 구조를 전제하지 않는다. | 현재 내용 유지. | 유지 | 유지 근거: entry assessment 문서 |

## 완료 기준

- 실제 `docs/guide` 13개 파일이 모두 한 번씩 판정된다.
- `09-architecture`의 구식 Codex 설명이 핵심 수정 후보로 드러난다.
- 구현 전 수정할 문서와 구현 후 반영할 문서가 분리된다.
- audit 결과만 읽어도, guide 원문을 처음부터 다시 재탐색하지 않고 수정 착수 지점을 알 수 있다.

## 다음 문서

- 매핑 기준: [10-claude-to-codex-surface-mapping.md](./10-claude-to-codex-surface-mapping.md)
- guide 반영 순서: [14-conversion-workflow-and-roadmap.md](./14-conversion-workflow-and-roadmap.md)
