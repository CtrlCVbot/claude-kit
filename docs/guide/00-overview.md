# claude-kit 시스템 개요

## 이 문서의 역할

이 문서는 `claude-kit` 문서 세트의 진입점이다. 설치 방법이나 전체 step-by-step 튜토리얼을 전부 반복하지 않고, 지금 필요한 문서를 빠르게 찾게 하는 데 집중한다.

- 설치와 설정은 저장소 루트 [README.md](../../README.md)
- 설치 직후 시작 방법은 [13-quick-start.md](./13-quick-start.md)
- 출력 구조와 타겟 차이는 [09-architecture.md](./09-architecture.md)

---

## 어디서 시작할지

| 지금 상황 | 먼저 읽을 문서 | 이유 |
|-----------|----------------|------|
| 아직 설치 전이거나 `domains`/`targets`를 고르는 중 | [README.md](../../README.md) | 설치, 설정, 출력 경로를 먼저 이해해야 함 |
| 설치는 끝났고 어떤 파이프라인을 언제 써야 하는지 알고 싶음 | [13-quick-start.md](./13-quick-start.md) | 가장 짧은 온보딩 경로와 첫 액션을 안내 |
| 아이디어에서 PRD/브리지까지 기획 흐름이 필요함 | [01-planning-pipeline.md](./01-planning-pipeline.md) | `plan` 파이프라인 전체 구조 설명 |
| 승인된 요구사항을 바로 구현하고 싶음 | [08-dev-workflow.md](./08-dev-workflow.md) | `dev` 워크플로우 전체 구조 설명 |
| Claude/Codex 출력 차이와 설치 결과를 확인하고 싶음 | [09-architecture.md](./09-architecture.md) | 타겟별 runtime/output 계약 설명 |

---

## 전체 그림

`claude-kit`은 아이디어 단계에서 시작해 개발, 검증, 아카이브까지 이어지는 커맨드 기반 워크플로우를 제공한다.

```text
Plan pipeline (opt-in)
/plan-idea -> /plan-screen -> /plan-draft -> /plan-prd -> /plan-wireframe -> /plan-stitch -> /plan-bridge

Dev workflow (default)
/dev-feature -> /dev-run -> /dev-verify -> /dev-commit

Archive / improvement
/plan-archive -> /plan-improve
```

핵심 원칙은 다음 세 가지다.

- `core`는 항상 설치되는 공통 가드레일이다.
- `dev`는 기본 개발 흐름의 진입점이다.
- `plan`은 아이디어를 구조화하고 PRD/브리지까지 연결할 때 활성화한다.

---

## 도메인과 타겟

### 도메인

| 도메인 | 기본값 | 역할 |
|--------|--------|------|
| `core` | 항상 포함 | 공통 rules, hooks, skills, templates |
| `dev` | 기본 포함 | 구현과 검증 중심의 개발 워크플로우 |
| `plan` | opt-in | 아이디어, 스크리닝, PRD, 디자인, 브리지 |

### 타겟

| 타겟 | 기본값 | 출력 경로 | 컨텍스트 문서 |
|------|--------|----------|---------------|
| `claude` | 기본 포함 | `.claude/` | `CLAUDE.md` |
| `codex` | 선택 | `plugins/claude-kit/` | `AGENTS.md` |

설치 직후에는 프로젝트 루트에 생성되는 `CLAUDE-KIT-QUICKSTART.md`를 먼저 열고, 이후 상세 문서는 `docs/guide/*`에서 읽는 흐름을 기본으로 한다.

---

## 문서 맵

| 문서 | 역할 | 읽는 시점 |
|------|------|-----------|
| [13-quick-start.md](./13-quick-start.md) | 설치 후 첫 시작 경로, 파이프라인 선택, 첫 액션 | 가장 먼저 |
| [01-planning-pipeline.md](./01-planning-pipeline.md) | `plan` 파이프라인 전체 구조 | 기획 흐름 사용 시 |
| [08-dev-workflow.md](./08-dev-workflow.md) | `dev` 워크플로우 상세 | 구현 흐름 사용 시 |
| [09-architecture.md](./09-architecture.md) | 출력 구조, 타겟 차이, 컴포넌트 계약 | 유지보수/고급 사용자 |
| [10-glossary.md](./10-glossary.md) | 용어집과 커맨드 레퍼런스 | 용어 확인 필요 시 |
| [11-archive-improve.md](./11-archive-improve.md) | 아카이브와 개선 요청 흐름 | 완료 후 후속 작업 시 |

---

## Quick Start 이동

이전 문서에 있던 상세 step-by-step Quick Start는 [13-quick-start.md](./13-quick-start.md)로 분리했다. 이 문서는 인덱스와 안내 허브로 유지하고, 실제 시작 절차는 Quick Start 문서를 기준으로 본다.
