# Why Analysis (5W1H)

## 1. `profile.json`

- Who: 설치를 수행하는 maintainer와 팀
- What: `domains`, `targets`, `stack`을 선언하는 설치 프로파일
- When: `pnpm install`, `pnpm update claude-kit`, `node scripts/setup.js`
- Where: `profile.json`
- Why: 어떤 자산을 설치하고 어떤 타깃에 배포할지를 한 파일에서 제어하기 위해
- How: `scripts/setup.js::resolveActiveDomains()`와 `resolveTargets()`가 읽어 emitter 경로를 결정한다

모델 관점 이유:
`profile.json`은 모델명을 직접 갖지 않지만, 어떤 agent 집합이 런타임에 존재할지를 정하므로 간접적인 모델 구성 스위치다.

## 2. Claude agent frontmatter `model`

- Who: agent author, maintainer
- What: 개별 Claude 에이전트가 사용할 모델
- When: agent 설계 및 유지보수 시
- Where: `src/claude/**/agents/*.md`
- Why: 에이전트 성격별로 모델을 고정하거나 상향하기 위해
- How: frontmatter `model: opus` 형태로 선언되고, docs generator가 이를 `docs/30-reference/02-agents.md`에 노출한다

모델 관점 이유:
현재 정책은 사실상 "모든 주요 에이전트를 Opus로 고정"하는 선택이다. 복잡한 planning/review 품질을 우선한 것으로 해석할 수 있다.

## 3. `.claude/settings.json`

- Who: `setup.js`, 사용자, 팀
- What: Claude Code가 런타임에 읽는 프로젝트 설정
- When: 설치 후 실행 시점
- Where: `.claude/settings.json`
- Why: permissions, hooks, env를 팀 공통으로 보급하기 위해
- How: `buildSettingsTemplate()`가 생성하고 `merge-settings.js`가 기존 값과 병합한다

모델 관점 이유:
공식 Claude Code는 여기서 `model`과 `availableModels`를 제어할 수 있지만, claude-kit는 현재 그 기능을 기본 관리 대상으로 채택하지 않았다.  
즉, 모델 정책은 저장소 기본값보다는 사용자 override에 더 많이 열려 있다.

## 4. `merge-settings.js`

- Who: emitter 로직
- What: 기존 settings와 template settings 병합
- When: reinstall / update
- Where: `scripts/merge-settings.js`
- Why: kit 관리 키는 갱신하면서 사용자 커스텀은 보존하기 위해
- How: permissions union, hooks dedupe append, env existing override

모델 관점 이유:
사용자가 수동으로 넣은 `model`, `ANTHROPIC_MODEL`, pinning env가 남을 수 있다.  
장점은 유연성, 단점은 저장소 정책과 실제 런타임의 괴리다.

## 5. `src/codex/**/agents/*.md`

- Who: Codex-facing source author 또는 Claude→Codex conversion pipeline
- What: Codex target용 agent authoring source
- When: Codex parity 구축 시
- Where: `src/codex/copy|dev|plan/agents/*.md`
- Why: Codex target에서 별도 SSOT를 갖기 위해
- How: pairing-registry와 setup.js emitter가 이 경로를 Codex source로 간주한다

모델 관점 이유:
현재 이 레이어는 agent 존재 parity는 갖췄지만 모델 메타데이터 parity는 잃고 있다. "paired but semantically thinned" 상태다.

## 6. `buildCodexAgentToml()`

- Who: emitter
- What: Codex direct-use TOML 생성기
- When: Codex target emission 시
- Where: `scripts/setup.js`
- Why: `src/codex/**/agents/*.md`를 `.codex/agents/*.toml`로 투영하기 위해
- How: markdown에서 `name`, `description`, `developer_instructions`를 추출해 TOML 생성

모델 관점 이유:
현재 함수는 `model`을 읽지도, 쓰지도 않는다.  
그 결과 Codex 쪽 모델 정책은 source asset에서 runtime으로 전달되지 않는다.

## 7. `pairing-registry`

- Who: maintainer toolchain, audit/sync workflow
- What: Claude/Codex 자산 관계 메타데이터
- When: 신규 자산 추가, 동기화, audit
- Where: `src/pairing-registry.json`
- Why: 어떤 자산이 paired / unpaired / skipped인지 추적하기 위해
- How: identity, domain, type, source path, status 등을 기록

모델 관점 이유:
현재 registry는 "존재 관계"를 관리하지만 "모델 parity"는 검증하지 않는다.  
즉, paired status가 있어도 실제 모델 정책은 다를 수 있다.

## 8. `exception-registry`

- Who: maintainer
- What: intentional gap, skip, portability 예외
- When: Codex portability나 rules/hook 차이를 승인할 때
- Where: `src/exception-registry.json`
- Why: "왜 안 맞는지"를 남기기 위해
- How: strategy, officialSurface, fallbackTarget 등으로 예외를 문서화

모델 관점 이유:
현재 모델 메타데이터 손실에 대한 active exception이 없다.  
즉, 이 차이는 "승인된 예외"라기보다 "아직 다뤄지지 않은 공백"일 가능성이 크다.

## 9. Anthropic `Advisor tool`

- Who: Anthropic API를 호출하는 애플리케이션 개발자
- What: 빠른 executor가 고지능 advisor에게 전략 지침을 요청하는 server tool
- When: 긴 agentic workload에서 대부분은 기계적이지만 중요한 전략 교정이 필요할 때
- Where: `/v1/messages` 요청 내부의 `tools` 배열
- Why: quality/cost/latency 균형을 맞추기 위해
- How: executor가 `server_tool_use`를 emit하면 서버가 advisor 추론을 실행하고 `advisor_tool_result`를 반환

모델 관점 이유:
이 기능은 "agent 정의 파일에 모델 하나 적는 문제"가 아니라, "한 요청 안에서 2개 모델을 역할 분리로 운용하는 오케스트레이션 문제"다.

## 10. 왜 지금 이 분석이 필요한가

- Who: claude-kit maintainer, power user, dual-target 운영자
- What: 모델 정책/전파/관측 문제 분석
- When: Claude/Codex 멀티타깃, Advisor 전략 검토, 성능/비용 최적화 요구가 생긴 지금
- Where: source asset, emitter, runtime, policy 전 층
- Why: 지금 구조는 모델 선택이 분산돼 있고 Codex parity가 약하며 Advisor 도입 기준도 없다
- How: source-of-truth 확인 → 공식 문서 benchmark → gap 분석 → 개선안/마이그레이션 도출

