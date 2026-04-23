# AGENTS.md runtime link cleanup plan

> 상태: 계획 초안
> 작성일: 2026-04-23
> 범위: 설치 대상 프로젝트에 생성되는 `AGENTS.md`의 내부 source 경로 노출과 내용 품질 개선
> 반영 피드백: repo-local Codex sync review findings 1~4를 이 계획의 경계 조건으로 반영

## 1. 목표

타 프로젝트에 `claude-kit`을 설치했을 때 생성되는 `AGENTS.md`가 설치 대상 프로젝트 기준으로 이해 가능하고 실행 가능한 문서가 되도록 개선한다.

현재 문제의 대표 예시는 아래와 같다.

- 설치 대상 프로젝트: `C:\Program Files (user)\mologado\apps\landing`
- 생성 문서: `C:\Program Files (user)\mologado\apps\landing\AGENTS.md`
- 잘못된 사용자-facing 링크: `src/claude/core/rules/coding-style.md`

이 경로는 설치 대상 프로젝트의 파일이 아니라 `claude-kit` 저장소 내부 authoring source 경로다. 따라서 설치 프로젝트의 `AGENTS.md`에서 상대 링크처럼 노출되면 사용자가 존재하지 않는 파일을 열게 된다.

## 2. 문제 원인

문제의 원인은 `source asset path`와 `consumer runtime path`가 분리되지 않은 데 있다. 현재 `src/templates/AGENTS.md.template`는 `src/claude/core/rules/*.md` 같은 `claude-kit` 저장소 내부 authoring source 경로를 본문에 직접 포함한다. `scripts/setup.js`는 이 템플릿을 설치 대상 프로젝트 루트의 `AGENTS.md`로 렌더링할 뿐, source 경로를 설치 프로젝트 기준 경로로 변환하거나 제거하지 않는다.

따라서 설치 대상 프로젝트에는 존재하지 않는 `src/claude/**` 링크가 runtime guidance 문서에 남는다. 이 문제는 generated output인 `AGENTS.md`를 직접 수정해서 해결하면 안 되며, upstream template 또는 emitter 정책에서 해결해야 한다.

이번 계획은 `src/codex/kit/**` domain을 추가하거나 `.claude/commands/kit-*` maintenance toolchain을 소비자 프로젝트에 설치하는 방식으로 해결하지 않는다. 문제의 1차 원인은 `AGENTS.md.template`의 consumer-facing 문장에 authoring source 경로가 섞인 것이므로, v1 해결 범위도 template/runtime 문서 경계 정리에 둔다.

## 3. 현재 생성 흐름 분석

`scripts/setup.js` 기준 실제 생성 흐름은 아래와 같다.

1. Codex target이 active이면 `emitCodex(projectRoot, activeDomains)`가 실행된다.
2. `AGENTS.md`가 없을 때만 `src/templates/AGENTS.md.template`을 읽는다.
3. `substituteVars(template, vars)`로 `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}`, `{{DATE}}`만 치환한다.
4. 결과를 설치 대상 프로젝트 루트의 `AGENTS.md`에 쓴다.
5. 이미 `AGENTS.md`가 있으면 보존한다.

중요한 결론:

- generated output인 설치 대상 프로젝트의 `AGENTS.md`를 직접 수정하는 방식은 올바른 fix path가 아니다.
- upstream 수정 대상은 `src/templates/AGENTS.md.template`이 1순위다.
- 링크 정책이나 runtime guide 복사 정책을 도입한다면 `scripts/setup.js`가 2순위 수정 대상이다.
- `src/codex/kit/**`를 만들거나 `kit`을 active domain에 추가하는 것은 이번 문제의 fix path가 아니다.
- command/skill/agent direct-use output은 현재 strict `src/codex/**` source 정책을 따라야 하며, `AGENTS.md` 개선이 `src/claude/**` fallback 재도입 명분이 되면 안 된다.

## 4. 실제 생성물 리뷰

임시 프로젝트에 `targets=["codex"]`, `domains=["core","dev"]`로 설치해 생성된 `AGENTS.md`를 확인했다. 같은 문제는 사용자가 제시한 `apps/landing/AGENTS.md`에서도 재현된다.

### 확인된 문제

| 구분 | 내용 | 영향 |
|---|---|---|
| 내부 source 링크 노출 | `src/claude/core/rules/*.md`가 `전체 가이드` 링크로 노출된다. | 설치 대상 프로젝트에서는 링크가 깨진다. |
| maintainer note 노출 | HTML 주석에 `codex-sync Phase 2`, `medium merge artifact`, `codex-portability.json` 같은 내부 유지보수 문맥이 남아 있다. | consumer 문서에 maintainer 용어가 섞인다. |
| Codex fallback source 경로 노출 | `Codex fallback: src/claude/core/skills/agent-completion-cache-invalidate/SKILL.md`가 사용자-facing 본문에 나온다. | 현재 direct-use strict `src/codex` 정책과도 혼동된다. |
| 프로젝트 구조 단정 | `apps/`, `packages/` 구조가 모든 설치 프로젝트에 맞는 것처럼 보인다. | 단일 앱, Next.js app router, monorepo가 아닌 repo에서 부정확하다. |
| Claude/Codex runtime 혼합 | `plugins/claude-kit/skills/` 자동 로드 설명이 설치 방식과 현재 direct-use `.agents/skills/**` 출력과 섞인다. | 어떤 runtime이 무엇을 읽는지 초보자가 헷갈린다. |
| 과도한 장문 규칙 | 핵심 규칙 6개가 긴 본문으로 포함되어 첫 화면에서 우선순위가 흐려진다. | 빠른 참조 문서로 쓰기 어렵다. |
| 인코딩/문자 깨짐 가능성 | 현재 환경 출력에서 한글이 mojibake처럼 보이는 구간이 확인된다. | 파일 인코딩 자체와 console 표시 문제를 분리 검증해야 한다. |
| 공식 rules 개념 혼동 | Claude rule 문서를 Codex `.rules`나 존재하지 않는 guidance docs로 단순 대응할 수 있다. | Codex 공식 `.rules`는 일반 안내 문서가 아니라 command approval policy 계층이라 잘못 생성될 수 있다. |

## 5. 링크 개선 옵션 비교

| 옵션 | 설명 | 장점 | 단점 | 판단 |
|---|---|---|---|---|
| A. inline-only | `AGENTS.md`에는 요약만 남기고 `src/claude/**` 링크를 제거한다. | 가장 안전하고 구현이 작다. 깨진 링크가 사라진다. | 세부 규칙 원문으로 이동할 경로가 없다. | v1 추천 |
| B. runtime docs 복사 | 설치 시 `docs/claude-kit/rules/*.md` 같은 consumer-visible 문서를 복사하고 거기로 링크한다. | 상세 문서를 설치 프로젝트에서 열 수 있다. | 사용자 프로젝트에 문서 파일이 늘고 update/merge 정책이 필요하다. | v2 후보 |
| C. package docs URL | GitHub 또는 공식 문서 URL로 링크한다. | 설치 프로젝트에 파일을 늘리지 않는다. | 오프라인/버전 고정성이 약하다. | 보조 후보 |
| D. maintainer source label | `src/claude/**`를 링크가 아니라 “maintainer source”로만 표시한다. | 내부 추적성은 남는다. | 초보자용 runtime 문서에는 여전히 노이즈다. | 비추천 |

v1에서는 옵션 A만 확정한다. `docs/codex-guidance/rules/*.md`처럼 실제 생성되지 않는 target을 새 routing index로 두지 않고, Codex `.rules` 파일도 자동 생성하지 않는다. runtime-visible docs가 필요하면 먼저 설치 대상 프로젝트에 실제로 복사되는 경로와 merge/overwrite 정책을 별도 계약으로 확정해야 한다.

## 6. 추천안

v1은 `inline-only + runtime boundary 정리`로 간다.

1. `src/templates/AGENTS.md.template`에서 `src/claude/**`, `src/codex/**` 경로를 사용자-facing 링크로 노출하지 않는다.
2. `전체 가이드:` 링크는 제거하고, 각 규칙 아래에 “이 요약이 설치 프로젝트에서 적용되는 기준”이라는 문장으로 바꾼다.
3. maintainer-only HTML 주석은 제거하거나 `src/templates/AGENTS.md.template` 내부 관리 문서로 이동한다.
4. `plugins/claude-kit/skills/` 설명은 현재 설치 출력에 맞게 분리한다.
5. 프로젝트 구조 안내는 “예시”로 낮추고, 실제 구조는 현재 프로젝트를 우선 탐색하라는 지침으로 바꾼다.
6. Claude Code 전용 hooks/rules 설명과 Codex direct-use skills/agents 설명을 한 문단에서 섞지 않는다.
7. `src/codex/kit/**`나 `src/claude/kit/**`를 만들지 않는다. `kit-sync`는 `claude-kit` 저장소의 maintenance pipeline이지 설치 프로젝트 runtime 기능이 아니다.
8. `.claude/skills/kit-converter/**`와 `.claude/commands/kit-*`의 command-to-skill 전환 계약은 별도 source parity 작업으로 다루고, `AGENTS.md` 링크 cleanup의 구현 선행 조건으로 삼지 않는다.
9. `pairing-registry-v2`는 이미 적용된 상태로 보고, 이 계획에서는 registry migration을 새로 설계하지 않는다. 필요하면 source-link lint나 report가 v2 필드를 혼동하지 않는지 검증만 추가한다.

v2에서 상세 규칙 원문이 필요하면 `docs/claude-kit/rules/*.md` 또는 `.claude-kit/rules/*.md` 같은 runtime-visible docs 복사 정책을 별도 설계한다.

## 7. 제안하는 AGENTS.md 구조

`AGENTS.md.template`는 아래 구조로 재정리한다.

1. 프로젝트 식별
   - `# {{PROJECT_NAME}}`
   - `{{PROJECT_DESCRIPTION}}`
2. 이 문서의 역할
   - “이 파일은 설치된 프로젝트에서 Codex가 먼저 읽는 runtime guidance다.”
   - “claude-kit 내부 source 경로가 아니라 현재 프로젝트 기준으로 판단한다.”
3. 핵심 운영 원칙
   - 검증 증거 우선
   - 보안 기본선
   - 작은 변경
   - 현재 프로젝트 구조 우선
4. 작업 절차
   - 탐색
   - 계획
   - 구현
   - 검증
   - 보고
5. Codex direct-use 자산
   - `.agents/skills/**`는 repo-local skills
   - `.codex/agents/*.toml`은 Codex custom agents
   - generated 위치와 직접 수정 주의사항
6. Claude Code와의 관계
   - Claude Code hooks/rules는 Claude runtime 쪽 개념
   - Codex에서는 `AGENTS.md`, skills, custom agents로 의도를 보존
7. Codex rules 경계
   - Codex `.rules`는 일반 문서 링크가 아니라 command approval policy 후보로만 다룬다.
   - v1 fresh install은 `.codex/rules`, `~/.codex/rules`, Team Config `rules/*.rules`를 생성하지 않는다.
8. 유지보수 경계
   - `kit-sync`와 `kit-*` 도구는 이 저장소의 maintenance toolchain이며 소비자 프로젝트에 설치되는 Codex 기능이 아니다.
   - `src/codex/kit/**` domain을 만들지 않는다.
9. 날짜
   - `Today's date is {{DATE}}.`

## 8. 수정 대상 파일 목록

| 파일 | 변경 목적 |
|---|---|
| `src/templates/AGENTS.md.template` | 깨진 source 링크 제거, runtime 문서 구조 개선 |
| `scripts/setup.js` | 필요 시 `AGENTS.md` 생성 전 링크 lint 또는 warning 추가. direct-use/plugin source fallback 정책은 변경하지 않음 |
| `scripts/docs-generate.js` | reference docs가 template 설명을 생성한다면 링크 정책 반영 |
| `docs/30-reference/*` | AGENTS.md 출력 정책 변경을 공개 reference에 반영 |

이번 범위에서 직접 만들거나 수정하지 않는 항목:

| 파일/경로 | 제외 이유 |
|---|---|
| `src/codex/kit/**` | 생성 금지. AGENTS 링크 문제 해결 경로가 아님 |
| `src/claude/kit/**` | 생성 금지. kit toolchain은 현재 `.claude/**` maintenance asset으로 유지 |
| `.claude/skills/kit-converter/**` | command-to-skill 전환 계약은 별도 source parity 작업 |
| `.claude/commands/kit-*.md` | 소비자 프로젝트 runtime AGENTS.md cleanup과 직접 무관 |
| `src/pairing-registry.json` | v2 migration은 이미 적용됨. 이번 계획은 registry 변경이 아니라 template/link cleanup 중심 |
| `.codex/rules`, `~/.codex/rules`, Team Config `rules/*.rules` | v1 자동 생성 금지 |

## 9. 생성 또는 변경될 산출물 목록

| 산출물 | 정책 |
|---|---|
| 설치 대상 `AGENTS.md` | generated runtime output. 직접 patch 금지, template에서 생성 |
| `docs/claude-kit/rules/*.md` 또는 `.claude-kit/rules/*.md` | v1에서는 생성하지 않음. v2 runtime docs 옵션으로 검토 |
| `docs/codex-guidance/rules/*.md` | v1에서는 생성하지 않음. 존재하지 않는 링크 target으로 사용하지 않음 |
| `CLAUDE.md` | 이번 범위에서는 직접 변경하지 않음. 단, 역할 중복 리뷰 대상 |
| `.agents/skills/**` | 이번 범위에서는 링크 문제의 주 수정 대상 아님 |
| `.codex/agents/**` | 이번 범위에서는 링크 문제의 주 수정 대상 아님 |

## 10. 마이그레이션/호환성 고려사항

- 기존 설치 프로젝트의 `AGENTS.md`는 현재 `scripts/setup.js`가 보존한다. 따라서 template 수정만으로는 이미 생성된 파일이 자동 갱신되지 않는다.
- 안전한 update 전략은 아래 중 하나로 별도 결정해야 한다.
- `--refresh-agents-md` 같은 명시 옵션을 둔다.
- managed marker가 있는 경우에만 갱신한다.
- 기존 파일은 보존하고 `AGENTS.md.generated` 또는 conflict report를 만든다.
- 이번 링크 cleanup v1은 fresh install 품질을 먼저 개선하고, 기존 프로젝트 마이그레이션은 후속 작업으로 분리한다.

## 11. 검증 방법

| 검증 | 기대 결과 |
|---|---|
| 임시 프로젝트 fresh install | `AGENTS.md`가 생성된다. |
| source 경로 grep | `AGENTS.md`에 사용자-facing `src/claude/**`, `src/codex/**` 링크가 없다. |
| nonexistent guidance grep | `AGENTS.md`에 `docs/codex-guidance/**` 링크가 없다. |
| runtime path grep | `.agents/skills/**`, `.codex/agents/**` 설명은 실제 설치 경로와 일치한다. |
| generated output review | `codex-sync Phase`, `medium merge artifact`, `codex-portability.json` 같은 maintainer 용어가 없다. |
| no kit domain check | `src/codex/kit/**` 또는 `src/claude/kit/**` 생성 후보가 없다. |
| no rules output check | `.codex/rules`, `~/.codex/rules`, Team Config `rules/*.rules` 자동 생성 후보가 없다. |
| `node scripts/setup.js --dry-run` | Codex target에서 AGENTS preview가 실패하지 않는다. |
| `pnpm test` | template/emitter 변경 후 JS 테스트가 통과한다. |

권장 검증 명령 예시:

```powershell
node scripts/setup.js --dry-run
node scripts/codex-hook-compat.js
pnpm test
```

임시 설치 검증 예시:

```powershell
$temp = Join-Path $env:TEMP ("agents-md-fixture-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $temp | Out-Null
'{"domains":["core","dev"],"targets":["codex"]}' | Set-Content -Path (Join-Path $temp "profile.json") -Encoding UTF8
'{"name":"agents-md-fixture","version":"0.0.0"}' | Set-Content -Path (Join-Path $temp "package.json") -Encoding UTF8
Push-Location $temp
node "C:\Program Files (user)\mologado\claude-kit\scripts\setup.js"
Select-String -Path AGENTS.md -Pattern "src/claude|src/codex|docs/codex-guidance|codex-sync Phase|medium merge artifact|codex-portability.json"
Pop-Location
```

## 12. Acceptance criteria

- fresh install로 생성된 `AGENTS.md`에는 `src/claude/**` 또는 `src/codex/**`가 사용자-facing 링크로 나오지 않는다.
- `AGENTS.md`는 설치 대상 프로젝트 기준의 runtime guidance로 읽힌다.
- maintainer-only sync metadata가 consumer 문서에 노출되지 않는다.
- Claude Code 전용 개념과 Codex 전용 개념의 경계가 문서상 분리된다.
- `src/codex/kit/**`나 `src/claude/kit/**`를 추가하지 않는다.
- Codex `.rules` output은 v1에서 생성하지 않는다.
- `pairing-registry-v2`는 새 migration 대상으로 되돌리지 않고, 필요한 경우 lint/report 안정화 대상으로만 다룬다.
- 기존 사용자 파일 보존 정책은 유지한다.

## 13. 후속 구현 순서

1. `src/templates/AGENTS.md.template`를 runtime-first 구조로 재작성한다.
2. `scripts/setup.js --dry-run`에 AGENTS source-link lint를 추가할지 결정한다.
3. 임시 프로젝트 fresh install로 생성 파일을 검토한다.
4. `docs/30-reference`에 AGENTS.md 출력 정책을 반영한다.
5. 기존 설치 프로젝트 마이그레이션 옵션을 별도 계획으로 분리한다.
