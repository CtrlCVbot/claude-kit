# AGENTS.md runtime link cleanup plan

> 상태: revised draft
> 작성일: 2026-04-24
> 범위: `src/templates/AGENTS.md.template`, `src/templates/agents-md/*`, `scripts/setup.js`, `docs/guide/codex/*`
> 목적: `AGENTS.md.template`가 "비어 보이는" 현상과 `pnpm rebuild claude-kit` 후 Codex 출력이 갱신되지 않는 현상을 현재 코드 기준으로 다시 설명하고, 개선 계획을 현실에 맞게 수정한다.

## 1. 왜 계획을 수정하는가

이전 계획은 `AGENTS.md.template` 본문 자체가 Codex runtime guidance의 primary source라고 전제한 부분이 있었다. 하지만 현재 구현은 그렇지 않다.

- `src/templates/AGENTS.md.template`는 wrapper 역할만 한다.
- 실제 managed 본문은 `src/templates/agents-md/*` 블록을 `scripts/agents-md-renderer.js`가 조합해서 만든다.
- `scripts/setup.js`는 `targets`에 `codex`가 있을 때만 `emitCodex()`를 실행한다.
- `targets`에 `codex`가 빠진 consumer profile에서는 `emitCodex()`가 아예 실행되지 않는다.

즉, 지금 보이는 증상은 "템플릿이 비어 있어서 rebuild가 실패한 것"이 아니라 아래 두 문제가 겹친 결과에 가깝다.

1. wrapper-only template 구조가 처음 보면 너무 비어 보인다.
2. consumer profile이 `targets:["claude"]` 상태면 `pnpm rebuild claude-kit`를 해도 `AGENTS.md`와 Codex surface가 갱신되지 않는다.

## 2. 현재 구조 요약

### 2.1 source map

| 역할 | 현재 source |
|---|---|
| AGENTS wrapper | `src/templates/AGENTS.md.template` |
| AGENTS managed blocks | `src/templates/agents-md/00-preamble.md`, `10-runtime-principles.md`, `80-codex-runtime.md`, `90-currentdate.md` |
| block renderer | `scripts/agents-md-renderer.js` |
| existing AGENTS merge 정책 | `scripts/agents-md-merger.js` |
| Codex output routing 최종 기준 | `scripts/setup.js` |
| Codex runtime guide 설명 | `docs/guide/codex/01-codex-dual-use.md`, `02-runtime-surfaces.md` |
| maintainer SSOT / generated boundary 설명 | `docs/guide/sync/01-source-of-truth.md`, `03-generated-output-boundaries.md` |

### 2.2 실제 동작

현재 `scripts/setup.js`는 다음 순서로 움직인다.

1. `profile.json`에서 `targets`를 읽는다.
2. `targets`에 `codex`가 있을 때만 `emitCodex()`를 실행한다.
3. `emitCodex()` 안에서 `renderAgentsManagedSection()`으로 `agents-md/*` 블록을 합친다.
4. `AGENTS.md`가 없으면 `AGENTS.md.template` wrapper에 `{{KIT_MANAGED_SECTION}}`을 주입해서 생성한다.
5. `AGENTS.md`가 이미 있으면 managed 영역만 merge한다.

따라서 `AGENTS.md.template`를 단독으로 읽고 "내용이 비어 있다"고 판단하면 현재 emitter 구조를 절반만 본 셈이다.

## 3. 재현 결과

### 3.1 claude-only fixture에서의 dry-run

`targets:["claude"]` fixture에서 `node scripts/setup.js --dry-run` 결과:

- active domains: `core, dev`
- active targets: `claude`
- 메시지: `Codex target inactive`

이 상태에서는 `emitCodex()` 자체가 호출되지 않으므로 아래 출력은 갱신되지 않는다.

- `AGENTS.md`
- `.agents/skills/**`
- `.codex/agents/*.toml`
- `plugins/claude-kit/**`

### 3.2 temp fixture에서의 Codex 생성 확인

temp fixture에 아래 설정으로 실행했을 때는 `AGENTS.md`가 정상 생성됐다.

- `package.json`: minimal package
- `profile.json`: `{"domains":["core","dev"],"targets":["codex"]}`
- 실행: `node C:\Program Files (user)\mologado\claude-kit\scripts\setup.js`

결과:

- `AGENTS.md: created`
- `direct-use generated: 30, conflicts: 0`
- 생성된 `AGENTS.md`에는 wrapper가 아니라 `agents-md/*`에서 조립된 managed 본문이 들어갔다.

이 검증으로 확인된 점은 다음과 같다.

1. Codex AGENTS 생성 경로 자체는 현재 코드상 살아 있다.
2. Codex output이 안 보이는 대표 원인은 target 비활성이다.
3. 문제의 초점은 "비어 있는 템플릿 채우기"보다 "구조 가시성"과 "target diagnostics"에 있다.

## 4. 수정된 진단

### 4.1 확정된 진단

- `AGENTS.md.template`는 primary content SSOT가 아니라 wrapper template이다.
- Codex runtime guidance의 실질 본문 SSOT는 `src/templates/agents-md/*`다.
- emitted output routing의 최종 기준은 `scripts/setup.js`다.
- consumer profile에서 `pnpm rebuild claude-kit`가 Codex 결과물을 안 건드리는 것은 버그라기보다 current profile behavior일 수 있다.

### 4.2 이번 계획에서 고쳐야 하는 문제

- source 구조가 처음 보는 사람에게 너무 덜 드러난다.
- `rebuild` 실행 결과가 "왜 Codex를 안 건드렸는지" 충분히 설명하지 않는다.
- `docs/guide/codex/*`는 runtime surface는 설명하지만, wrapper/block/emitter authoring map은 직접적으로 연결해 주지 않는다.

## 5. 비범위

이번 계획은 아래를 하지 않는다.

- generated `AGENTS.md`를 직접 수정하는 방안
- `src/codex/kit/**` 같은 새 domain 추가
- pairing registry 구조 자체 변경
- 이 repo의 기본 `targets`를 곧바로 `["claude", "codex"]`로 바꾸는 결정

추천 기본값은 현재처럼 `claude` opt-in 유지다. 대신 "Codex를 보려면 target을 명시적으로 켜야 한다"는 진단과 가이드를 강화한다.

## 6. 수정된 개선 계획

### Phase A. 구조 가시성 교정

목표: `AGENTS.md.template`가 왜 짧은지, 실제 source가 어디인지 한 번에 이해되게 만든다.

1. `docs/guide/codex/02-runtime-surfaces.md` 또는 `docs/guide/sync/01-source-of-truth.md`에 `AGENTS.md` authoring map을 추가한다.
2. map에는 반드시 아래 네 축을 함께 적는다.
   - wrapper: `src/templates/AGENTS.md.template`
   - content blocks: `src/templates/agents-md/*`
   - renderer / merger: `scripts/agents-md-renderer.js`, `scripts/agents-md-merger.js`
   - output routing: `scripts/setup.js`
3. `docs/guide/codex/*`는 user-facing runtime 설명, `docs/guide/sync/*`는 maintainer-facing source/emitter 설명으로 역할을 더 선명하게 나눈다.

추천안:
`docs/guide/sync/*`에 authoring pipeline을 넣고, `docs/guide/codex/*`에서는 runtime surface까지만 유지한다.

trade-off:
Codex guide를 과하게 maintainer 문서로 오염시키지 않으면서도 source map은 남길 수 있다.

### Phase B. rebuild 진단성 강화

목표: `pnpm rebuild claude-kit` 후 "왜 아무 일도 안 보였는지"를 로그와 문서에서 즉시 알 수 있게 만든다.

1. `scripts/setup.js`의 non-dry-run 출력에도 target inactive 경고를 명시적으로 추가한다.
2. 메시지는 최소 아래 의미를 포함해야 한다.
   - current active targets
   - Codex inactive 여부
   - 그래서 `AGENTS.md` / `.agents/**` / `.codex/**` / `plugins/claude-kit/**`가 갱신되지 않았다는 점
3. `docs/guide/shared/04-troubleshooting.md` 또는 `docs/guide/codex/01-codex-dual-use.md`에 "rebuild 했는데 Codex output이 안 생김" 항목을 추가한다.
4. 설명에는 `profile.json`의 `targets` 확인과 temp fixture 검증 경로를 함께 둔다.

추천안:
`setup.js` 로그 + troubleshooting 문서 두 곳에 동시에 반영한다.

trade-off:
코드만 고치면 과거 맥락이 남지 않고, 문서만 고치면 실행 피드백이 약하다. 둘을 같이 가는 편이 가장 실용적이다.

### Phase C. 검증 경로 정식화

목표: maintainer가 package repo 안에서 헷갈리지 않고 Codex 출력을 검증하게 만든다.

1. "repo root rebuild"와 "consumer fixture verification"을 분리해서 문서화한다.
2. Codex output 검증 기본 경로를 temp fixture 방식으로 적는다.
3. 최소 검증 세트는 아래로 고정한다.
   - `node scripts/setup.js --dry-run`
   - temp fixture + `targets:["codex"]` 생성 검증
   - 필요 시 `pnpm test`
4. `AGENTS.md.template`가 짧다는 이유만으로 잘못된 source로 판단하지 않도록 checklist에 authoring map 확인 단계를 넣는다.

## 7. 실행 순서

1. `docs/guide/sync`에 `AGENTS.md` authoring pipeline 설명 추가
2. `docs/guide/codex` 또는 shared troubleshooting에 rebuild symptom 문서화
3. `scripts/setup.js`에 codex inactive 로그 보강
4. temp fixture 기반 검증 절차를 문서와 self-checklist에 반영
5. 마지막으로 `node scripts/setup.js --dry-run`과 fixture 생성으로 재검증

## 8. 검증 방법

| 검증 | 기대 결과 |
|---|---|
| `node scripts/setup.js --dry-run` | active targets와 Codex inactive 여부가 분명히 보인다 |
| temp fixture with `targets:["codex"]` | `AGENTS.md`가 생성되고 managed section이 block 조합 결과로 채워진다 |
| generated output 확인 | `AGENTS.md.template` wrapper만이 아니라 `agents-md/*` 내용이 반영된다 |
| 문서 self-review | runtime guide 문서와 maintainer source map 문서의 audience 경계가 섞이지 않는다 |

## 9. 리스크

| 리스크 | 영향 | 대응 |
|---|---|---|
| Codex inactive 설명 없이 profile 기본값만 바꾸는 대응 | opt-in 원칙 훼손 | 기본값은 유지하고 진단만 강화 |
| Codex guide에 maintainer 내용 과다 유입 | 사용자 가이드 혼탁 | authoring map은 `sync` 축 중심으로 배치 |
| wrapper template에 내부 설명을 과도하게 넣는 대응 | generated output까지 불필요하게 길어짐 | 구조 설명은 우선 docs에 두고 template 본문은 최소 유지 |

## 10. 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초기 AGENTS runtime link cleanup 초안 작성 | Claude |
| 2026-04-24 | 현재 코드 기준으로 계획 전면 수정. `AGENTS.md.template` wrapper-only 구조, `agents-md/*` block SSOT, claude-only fixture에서의 Codex 미생성 재현, temp fixture 생성 검증 결과를 반영 | Codex |
