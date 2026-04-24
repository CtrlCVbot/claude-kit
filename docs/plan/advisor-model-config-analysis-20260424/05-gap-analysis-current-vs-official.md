# Gap Analysis: Current vs Official

| 비교 항목 | claude-kit 현재 방식 | Anthropic 공식 방식 | 차이 원인 | 심각도 | 권장 액션 |
|---|---|---|---|---|---|
| Claude 기본 모델 선언 | `src/claude/**/agents/*.md`에 분산된 `model: opus` | settings `model`, `/model`, env, agent frontmatter를 모두 지원 | 저장소가 frontmatter 고정에 치우침 | medium | 중앙 모델 정책 파일 + 진단 리포트 도입 |
| Claude settings 기반 모델 제어 | 기본 생성 `.claude/settings.json`에 `model` 없음 | `settings.json`은 공식 모델 설정 표면 | emitter가 권한/훅/env 중심으로 설계됨 | medium | 선택적 `settings.model` emit 지원 |
| Alias pinning | 기본 미지원 | `ANTHROPIC_DEFAULT_*` env 공식 지원 | 운영 정책 레이어 미구축 | medium | model policy에서 pinning env 관리 |
| Model allowlist | 기본 미지원 | `availableModels` 지원 | 조직 정책 표면 미패키징 | low | enterprise/팀용 optional policy 추가 |
| Subagent model resolution | frontmatter `model`만 사실상 사용 | `CLAUDE_CODE_SUBAGENT_MODEL` → invocation → frontmatter → main model | override 실험/문서화 부재 | medium | inheritance visualizer + docs 보강 |
| Subagent effort 설정 | 일부 agent source에 `effort` 정책 거의 없음 | subagent `effort` 공식 지원 | 비용/지연/지능 튜닝 레이어 미활용 | low | domain별 effort 권장값 추가 |
| Pairing parity | 자산 존재 관계 위주 | 공식 parity 개념은 없음, 사용자가 별도 관리 | registry 목적이 존재 추적에 한정 | high | metadata parity 검사 추가 |
| Codex source agent 모델 보존 | 20개 중 19개가 `model` 없음 | 직접 대응 공식 표면 없음, 그러나 runtime은 모델 필드 수용 가능성 있음 | conversion 결과가 얇아짐 | high | Codex source 정규화 또는 model policy 외부화 |
| Codex TOML model emission | `buildCodexAgentToml()`가 `model` 미출력 | 현재 repo의 수동 TOML은 `model`, `model_reasoning_effort` 사용 | emitter 기능 공백 | high | TOML emitter 확장 |
| Runtime drift visibility | 현재는 수동 확인 | 공식 Claude Code는 settings/model picker가 명확 | claude-kit에는 진단 surface 없음 | high | `model-config-report` 커맨드 추가 |
| Advisor tool 지원 | 직접 지원 없음 | Anthropic API-level beta 기능 | 저장소 대상이 Claude Code/Codex 자산 패키징이기 때문 | medium | direct support 대신 advisor-ready policy 정의 |
| Executor/advisor 분리 정책 | 없음 | Advisor tool이 공식 제공 | 오케스트레이션 레이어 부재 | medium | pairing policy + escalation trigger spec 작성 |
| Current target state awareness | 현재 `targets: ["claude"]`라 Codex 비활성 | 공식 문서에는 없음 | 설치 프로파일 중심 구조 | low | 진단 리포트에 active/inactive target 명시 |
| Generated output 수정 안정성 | generated file 직접 수정 시 재생성 위험 | 공식과 무관 | emitter-driven repo 구조 | medium | 모든 진단 문서에 source-of-truth 우선 규칙 명시 |

## 요약

가장 큰 차이는 두 가지다.

1. Claude 쪽은 공식 기능을 쓰되 중앙 정책과 observability가 약하다.
2. Codex 쪽은 모델 메타데이터가 source → emitter → runtime으로 전달되지 못한다.

가장 시급한 것은 `Codex model parity 복구`와 `runtime diagnostics 도입`이다.  
Advisor tool은 직접 통합보다 "전략 패턴 차용"이 먼저다.

