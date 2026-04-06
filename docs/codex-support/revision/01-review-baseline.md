# Codex Support Review Baseline

> 목적: `docs/codex-support` 문서 세트가 약속한 Codex 지원 범위와 현재 구현 상태를 같은 기준으로 비교하기 위한 리뷰 기준선을 고정한다.

---

## 1. 리뷰 대상

이번 리뷰는 "Claude -> Codex 지원이 설계 문서대로 구현되었는가"를 확인하는 검증 문서다. 새 설계를 제안하지 않고, 이미 반영된 구현을 계약 문서와 비교해 `match`, `partial`, `mismatch`, `follow-up`으로 판정한다.

리뷰 범위:

- 설치기: [`scripts/setup.js`](../../../scripts/setup.js)
- Codex hook 호환 판정: [`scripts/codex-hook-compat.js`](../../../scripts/codex-hook-compat.js)
- 템플릿: [`src/templates/AGENTS.md.template`](../../../src/templates/AGENTS.md.template), [`src/templates/plugin.json.template`](../../../src/templates/plugin.json.template), [`src/templates/marketplace-entry.json.template`](../../../src/templates/marketplace-entry.json.template), [`src/templates/profile.json.template`](../../../src/templates/profile.json.template)
- 계약 문서: [`implementation-plan.md`](../implementation-plan.md), [`00-codex-quickstart.md`](../00-codex-quickstart.md), [`01-asset-mapping-reference.md`](../01-asset-mapping-reference.md)
- 사용자/가이드 반영: [`README.md`](../../../README.md), [`docs/guide/00-overview.md`](../../guide/00-overview.md), [`docs/guide/09-architecture.md`](../../guide/09-architecture.md), [`docs/guide/10-glossary.md`](../../guide/10-glossary.md)

---

## 2. 진실 원천 우선순위

| 우선순위 | 원천 | 이유 |
|---|---|---|
| 1 | 실제 구현 코드 | 설치 결과를 최종적으로 결정하는 것은 코드다 |
| 2 | 설치기가 생성한 실제 산출물 | 구현이 실제로 어떤 파일을 만들고 어떤 내용을 쓰는지 확인할 수 있다 |
| 3 | `docs/codex-support` 문서 | Codex 지원 계약과 범위를 정의한다 |
| 4 | `README` 및 `docs/guide` | 외부 사용자/내부 사용자에게 노출되는 설명이다 |

판정 규칙:

- `match`: 문서와 구현이 동일하게 동작한다.
- `partial`: 방향은 맞지만 범위, 품질, 설명이 축소되었거나 일부만 구현되었다.
- `mismatch`: 문서가 약속한 동작이 구현되지 않았거나 구현이 문서를 어긴다.
- `follow-up`: v1 계약 바깥이지만 후속 검토가 필요한 항목이다.

---

## 3. 판정 축

이번 리뷰는 아래 축으로 고정한다.

| 축 | 확인 질문 |
|---|---|
| `targets` | `profile.json.targets`가 Claude/Codex를 정확히 분기하는가 |
| 출력 구조 | `plugins/claude-kit/`, `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, `AGENTS.md`가 계약대로 생성되는가 |
| Hook 변환 | 호환 훅만 `hooks.json`에 들어가고 실제 실행 가능한 경로를 가리키는가 |
| 메타데이터 | `.claude-kit-meta.json`의 `targets`, `outputs`, `skippedForCodex`가 정확한가 |
| Claude 하위호환 | Codex 추가로 기존 `.claude/` 설치가 깨지지 않는가 |
| 자산 매핑 | `skills/commands/agents/hooks/rules/mcp`의 지원 수준이 문서 선언과 일치하는가 |
| 문서 정합성 | `implementation-plan`, quickstart, asset mapping, README, guide가 구현 상태와 맞는가 |

---

## 4. 이번 리뷰에서 확인한 smoke test

문서 판정을 추상 비교로 끝내지 않기 위해 로컬 임시 프로젝트에서 아래 시나리오를 확인했다.

| 시나리오 | 확인 결과 |
|---|---|
| `claude only` | `.claude/`, `CLAUDE.md`, `.claude/settings.json` 생성 확인 |
| `codex only` | `plugins/claude-kit/`, `AGENTS.md`, `hooks.json`, `marketplace.json`, metadata 생성 확인 |
| `claude + codex` | 두 타깃이 동시에 생성되고 경로 충돌 없음 확인 |
| `update install` | 기존 `CLAUDE.md`, `AGENTS.md` 보존, marketplace 엔트리 병합 확인 |
| Windows BOM `profile.json` | BOM 포함 UTF-8 JSON에서 `targets` 파싱 실패 재현 |

---

## 5. 리뷰 관찰 요약

현재 구현은 "Codex용 설치 골격"까지는 도달했다.

- repo-local plugin 구조 생성: 확인
- `AGENTS.md` 생성: 확인
- `plugin.json`, `marketplace.json`, `hooks.json` 생성: 확인
- `skippedForCodex` 기록: 확인
- Claude 하위호환: 현재 범위에서는 문제 없음

다만 "Codex에서 실제로 바로 사용 가능한 수준"까지는 아직 부분 구현이다.

- Codex hook 런타임 경로
- Codex로 복사된 문서형 자산 내부의 Claude 고정 참조
- rules 간접 지원 약속
- Codex-only metadata 정확성
- Windows BOM `profile.json` 호환성

이후 문서는 위 관찰을 세부 finding, 계약 매트릭스, 리스크, backlog로 나눠 정리한다.
