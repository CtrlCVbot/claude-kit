# claude-kit Quick Start

설치 직후 `claude-kit`를 바로 써보려는 사용자를 위한 기준 문서다. 이 문서는 “어떤 파이프라인을 언제 선택하는가”와 “지금 바로 해볼 첫 액션”을 가장 짧은 경로로 안내한다.

---

## 5분 온보딩

1. 프로젝트 루트의 `CLAUDE-KIT-QUICKSTART.md`를 열어 이번 설치 결과를 확인한다.
2. 현재 작업이 아이디어 단계인지, 이미 요구사항/PRD가 있는지 결정한다.
3. 아이디어 단계면 `plan` 파이프라인을, 구현 단계면 `dev` 워크플로우를 선택한다.
4. 타겟이 Claude인지 Codex인지에 따라 생성된 runtime 경로를 확인한다.
5. 첫 커맨드를 실행한 뒤 상세 규칙은 관련 가이드로 내려간다.

---

## 어떤 흐름이 맞는가

| 현재 상황 | 추천 도메인 | 시작 커맨드 | 다음 문서 |
|-----------|-------------|-------------|-----------|
| 아이디어를 수집하고 우선순위를 정해야 함 | `core + dev + plan` | `/plan-idea` | [01-planning-pipeline.md](./01-planning-pipeline.md) |
| 승인 전 아이디어를 RICE로 걸러야 함 | `core + dev + plan` | `/plan-screen` | [03-screening.md](./03-screening.md) |
| PRD와 브리지를 만들어 개발로 넘겨야 함 | `core + dev + plan` | `/plan-draft` 또는 `/plan-prd` | [06-dev-handoff.md](./06-dev-handoff.md) |
| 이미 요구사항/PRD가 있어 바로 구현하면 됨 | `core + dev` | `/dev-feature` | [08-dev-workflow.md](./08-dev-workflow.md) |
| 출력 구조와 타겟 차이를 먼저 확인해야 함 | 현재 구성 유지 | 문서 확인 우선 | [09-architecture.md](./09-architecture.md) |

`core`는 별도 흐름을 시작하는 도메인이 아니라, `dev`와 `plan`을 안정화하는 공통 기반으로 이해하면 된다.

---

## 설치 직후 확인할 것

| 확인 항목 | Claude | Codex |
|-----------|--------|-------|
| runtime 경로 | `.claude/` | `plugins/claude-kit/` |
| 컨텍스트 문서 | `CLAUDE.md` | `AGENTS.md` |
| plugin/registry | 해당 없음 | `.agents/plugins/marketplace.json` |
| hooks 결과물 | `.claude/hooks/`, `.claude/settings.json` | `plugins/claude-kit/hooks/`, `plugins/claude-kit/hooks.json` |

프로젝트 루트 `CLAUDE-KIT-QUICKSTART.md`는 설치 상태 요약 문서이고, 현재 문서는 상세 Quick Start SSOT다.

---

## 첫 실행 예시

### A. 아이디어에서 시작할 때 (`plan` 활성화)

```text
/plan-idea "검색 결과에 실시간 필터링 기능 추가"
/plan-screen IDEA-20260325-001
/plan-draft IDEA-20260325-001
/plan-prd .plans/features/drafts/realtime-filter/first-pass.md
/plan-bridge realtime-filter
```

이 흐름은 아이디어 수집, 스크리닝, 기획, PRD, 개발 핸드오프까지 이어진다. 와이어프레임과 Stitch가 필요하면 중간에 `/plan-wireframe`, `/plan-stitch`를 넣는다.

### B. 구현에서 바로 시작할 때 (`dev` 기본 흐름)

```text
/dev-feature .plans/prd/10-approved/prd-2026-03-25-realtime-filter/
/dev-run .plans/features/active/realtime-filter/02-package/
/dev-verify .plans/features/active/realtime-filter/02-package/
```

이 흐름은 이미 승인된 요구사항이나 PRD가 있을 때 적합하다. `plan`을 쓰지 않아도 되지만, 요구사항 구조화가 필요하면 먼저 `plan`을 활성화하는 편이 안전하다.

### C. `plan`이 아직 비활성화된 경우

`profile.json`에 `plan`을 추가하고 다시 설치한다.

```json
{
  "domains": ["core", "dev", "plan"],
  "targets": ["claude"]
}
```

---

## Claude / Codex 차이 요약

| 구분 | 공통점 | 차이 |
|------|--------|------|
| 파이프라인 개념 | 같은 `core/dev/plan` 흐름을 공유 | 설치 결과 경로와 runtime artifact가 다름 |
| 커맨드 진입점 | `/plan-*`, `/dev-*` 커맨드는 동일 | 실행 환경에서 읽는 컨텍스트 문서가 다름 |
| 공통 가드레일 | rules, hooks, skills의 목적은 동일 | Codex는 일부 hook/rule이 `hooks.json`, `AGENTS.md` 방식으로 반영 |
| 상세 문서 | `docs/guide/*`를 공통 기준으로 사용 | 실제 생성 파일은 타겟별 구조를 따름 |

핵심은 문서는 공통으로 읽되, 설치 결과와 runtime surface만 타겟별로 다르게 받아들이는 것이다.

---

## 상세 문서로 내려가기

| 문서 | 언제 읽는가 |
|------|-------------|
| [00-overview.md](./00-overview.md) | 문서 지도를 먼저 보고 싶을 때 |
| [01-planning-pipeline.md](./01-planning-pipeline.md) | `plan` 전체 구조를 이해할 때 |
| [08-dev-workflow.md](./08-dev-workflow.md) | `dev` 구현/검증 흐름을 볼 때 |
| [09-architecture.md](./09-architecture.md) | 출력 구조와 타겟 차이를 확인할 때 |
| [10-glossary.md](./10-glossary.md) | 용어와 커맨드 정의가 필요할 때 |

---

## 운영 원칙

- 설치 직후 진입점은 항상 루트 `CLAUDE-KIT-QUICKSTART.md`다.
- Quick Start의 기준 문서는 이 `13-quick-start.md`다.
- `README.md`는 설치와 선택, `00-overview.md`는 문서 지도, 이 문서는 실제 시작 절차를 담당한다.
