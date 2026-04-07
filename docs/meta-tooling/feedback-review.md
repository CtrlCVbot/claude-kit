# Meta Tooling Plan - 피드백 리뷰

> 6개 설계 문서에 대한 비판적 리뷰 결과
> **반영 상태**: 전체 반영 완료 (2026-04-07)

## 전체 평가

설계의 구조적 방향은 적절하나, **실제 코드와의 괴리 3건(HIGH)**, **미흡한 명세 5건(MEDIUM)**, **과잉 설계 2건**이 발견됨. ~~Phase 1 착수 전 수정이 필요한 항목이 있음.~~ 모든 항목 반영 완료.

---

## HIGH: 착수 전 반드시 수정

### H1. substituteVars() 변수 불일치

**문제**: 01-scaffolding-templates.md가 제안하는 변수(`{{DOMAIN}}`, `{{NAME}}`, `{{FULL_NAME}}` 등 8개)는 `scripts/setup.js:substituteVars()`가 실제 지원하는 변수(`PROJECT_NAME`, `PROJECT_DESCRIPTION`, `PACKAGE_MANAGER`, `DATE`, `VERSION`)와 **완전히 다름**.

**원인**: setup.js의 substituteVars()는 npm 설치 시 사용자 프로젝트를 위한 것이고, 메타 툴의 변수 치환은 별도 시스템임. 문서에서 "setup.js:substituteVars() 패턴 준수"라고 명시한 것이 오해를 유발.

**수정안**:
- 메타 툴의 변수 치환은 setup.js와 **별개의 시스템**임을 명시
- kit-scaffolding SKILL.md 안에 자체 치환 로직을 정의
- `{{VAR}}` 문법은 동일하되, 변수 목록과 치환 알고리즘은 독립적
- 이스케이프 규칙 추가: JSON 배열(`{{TOOLS}}`), 따옴표 포함 문자열 처리

### H2. 에이전트 Read-Only 검증 기준 모호

**문제**: 03-validation-schemas.md의 Read-Only 일관성 검증이 "읽기 전용" 텍스트 매칭에 의존하나, 실제 에이전트마다 표현이 다름.

**실제 패턴**:
- `dev-architect.md`: "Write 또는 Edit 도구를 절대 사용하지 않음"
- `dev-code-reviewer.md`: "수정 구현(executor)...은 담당하지 않습니다"
- 두 표현 모두 read-only 의도이지만 텍스트가 상이

**수정안**:
- 3단계 검증으로 분리:
  1. **Hard (FAIL)**: `tools` 배열에 Write/Edit 포함 여부
  2. **Medium (WARN)**: Constraints에 수정 금지 관련 언급 존재 여부
  3. **Soft (info)**: Role에 "읽기 전용" 명시 여부
- tools 기반 검증(Hard)만 FAIL 기준으로 사용

### H3. 에이전트 아키타입 3종 미분류

**문제**: template-agent.md가 Read-Only / Write 2종만 구분하나, 실제는 3종.

**실제 아키타입**:
| 아키타입 | tools | 용도 | 예시 |
|----------|-------|------|------|
| Read-Only | Read, Grep, Glob | 분석/검토 | dev-architect, dev-code-reviewer |
| Write | Read, Write, Edit, Grep, Glob, Bash | 생성/수정 | dev-doc-updater |
| Monitor | Read, Grep, Glob, Bash | 관찰/보고 | (추후 추가 가능) |

**수정안**:
- template-agent.md에 아키타입 선택 플로우 추가
- `/kit-create agent` 옵션: `--readonly` (기본), `--write`, `--monitor`
- 각 아키타입별 tools 기본값, Constraints 기본 문구, color 기본값 정의

---

## MEDIUM: Phase별 착수 전 수정 권장

### M1. Hook 이벤트 Stop 유형 누락

**문제**: template-hook에 PreToolUse, PostToolUse만 있고 Stop 이벤트 훅 템플릿이 없음. 실제로 `session-wrap-suggest.js`가 Stop 이벤트를 사용.

**수정안**: `template-hook-stop.md` 추가 (Phase 2 전)

### M2. 스킬 references/ 패턴 미흡

**문제**: 01-scaffolding-templates.md에서 references/ 디렉토리를 언급하지만 3가지 실제 패턴을 구분하지 않음.

**실제 패턴 3종**:
1. **서브에이전트 프롬프트**: `session-wrap/references/prompt-*.md` (병렬 에이전트용)
2. **출력 스키마**: `session-wrap/references/output-schema.md` (구조화 응답)
3. **외부 바인딩**: 스킬 본문에서 `.plans/` 경로 참조 (dev-feature-plan)

**수정안**: template-skill.md의 "변형: 고급 스킬" 섹션에 3종 패턴 상세 추가

### M3. Claude vs Codex 훅 포맷 미구분

**문제**: 04-agent-and-hook.md의 settings.json 등록 예시가 Claude 포맷만 보여줌. 실제로 Claude(문자열 기반)와 Codex(객체 기반)는 완전히 다른 포맷.

**실제 차이**:
```javascript
// Claude: 문자열
{ matcher: 'Edit|Write', hooks: ['node .claude/hooks/edit-tracker.js'] }

// Codex: 객체
{ matcher: 'Edit|Write', hooks: [{ type: 'command', command: './hooks/edit-tracker.js' }] }
```

**수정안**: 메타 툴은 `.claude/` 전용이므로 Claude 포맷만 지원한다고 명시. Codex 호환이 필요하면 Phase 4로 분리.

### M4. 커맨드 frontmatter 필요 기준 불명확

**문제**: 02-commands-spec.md에서 "간단 커맨드는 frontmatter 없음"이라 했으나, 실제로 간단 커맨드도 `allowed-tools`를 위해 frontmatter를 가질 수 있음.

**수정안**: 판단 기준 추가:
- frontmatter 필수: 도구 제한이 필요하거나, 다중 옵션 파싱이 필요한 경우
- frontmatter 불필요: 단순 절차만 기술하는 경우

### M5. 도메인 병합 시 덮어쓰기 동작 미문서화

**문제**: setup.js의 `emitClaude()`가 도메인을 순차 복사할 때 **후순위 도메인이 선순위를 덮어쓰는** 동작이 문서화되지 않음.

**수정안**: 00-overview.md에 "도메인 충돌 시 후순위 우선" 경고 추가. 메타 툴은 `.claude/`에 직접 배치되므로 이 이슈의 영향은 제한적이지만, 인지는 필요.

---

## LOW: 개선 권장 (비차단)

### L1. kit-audit C5/C6 카테고리 과잉

**문제**: setup.js 정합성(C5)과 문서 정확성(C6)은 구현 난이도 대비 가치가 낮음. setup.js 파싱은 취약하고, README 카운트 검증은 단순 작업.

**수정안**: C5/C6를 Phase 3에서 "선택적 보고"로 격하. 핵심 4개(구조, 네이밍, 필드, 교차참조)만 필수.

### L2. kebab-case 검증 엣지케이스

**문제**: `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` 정규식의 엣지케이스 미문서화.

**추가 필요**:
- `2fa-auth` (숫자 시작) -> 무효
- `my--feature` (이중 대시) -> 무효
- `a` (단일 문자) -> 유효

### L3. description 필드 길이 가이드라인

**문제**: 스키마에서 "비어있지 않음"만 검증. 실제 에이전트 description은 10-50자 범위.

**수정안**: "1줄, 50자 이내, 현재형 동사 시작" 권장 추가

### L4. Codex 훅 필터링 미문서화

**문제**: `codex-hook-compat.js`가 2개 훅(`output-secret-filter.js`, `session-wrap-suggest.js`)을 Codex에서 제외하는 로직이 문서에 없음.

**수정안**: 메타 툴은 `.claude/` 전용이므로 직접적 영향 없음. 참고 사항으로만 기록.

---

## 수정 반영 현황

| 순위 | 항목 | 문서 | 상태 |
|------|------|------|------|
| 1 | H1: 변수 치환 시스템 분리 | 01-scaffolding-templates.md | 반영 완료 |
| 2 | H2: Read-Only 검증 3단계 | 03-validation-schemas.md | 반영 완료 |
| 3 | H3: 에이전트 아키타입 3종 | 01-scaffolding-templates.md | 반영 완료 |
| 4 | M1: Stop 훅 템플릿 추가 | 01-scaffolding-templates.md | 반영 완료 |
| 5 | M2: references/ 3종 패턴 | 01-scaffolding-templates.md | 반영 완료 |
| 6 | M3: Claude 전용 명시 | 04-agent-and-hook.md | 반영 완료 |
| 7 | M4: frontmatter 판단 기준 | 02-commands-spec.md | 반영 완료 |
| 8 | M5: 도메인 덮어쓰기 경고 | 00-overview.md | 반영 완료 |
| 9 | L1: audit C5/C6 선택적 격하 | 02-commands-spec.md, 05-roadmap | 반영 완료 |
| 10 | L2: kebab-case 엣지케이스 | 01-scaffolding-templates.md | 반영 완료 |
| 11 | L3: description 길이 가이드 | 03-validation-schemas.md | 반영 완료 |

**Phase 1 착수 조건**: 충족 (H1, H3, M2, M4 반영 완료)
**Phase 2 착수 조건**: 충족 (H2, M1, M3 반영 완료)

---

## Codex 통합 반영 (2026-04-07)

06-codex-integration-analysis.md의 제안 사항을 기존 5개 문서(00-05)에 직접 통합 완료. 06 파일은 삭제됨.

### 통합된 주요 변경

| 문서 | 변경 내용 |
|------|----------|
| 00-overview | 소스 구조를 `src/claude/` + `src/codex/`로 변경, Phase 0/4 추가, 템플릿 12개/스키마 9개 |
| 01-scaffolding | 모든 경로 `src/claude/`, `{{TARGET}}` 변수, Codex 템플릿 4종 추가 |
| 02-commands | `--target`/`--skip-codex` 플래그, 타깃 기본 동작 테이블, 페어링 워크플로우, C7 감사 |
| 03-validation | 모든 경로 `src/claude/`, Codex 스키마 4종, 페어링 일관성 검증 섹션 |
| 04-agent-hook | 네이밍 가드 `src/(claude\|codex)/` 듀얼 경로, 모든 예시 경로 갱신 |
| 05-roadmap | Phase 0(마이그레이션) + Phase 4(Codex) 추가, MVCI 5개 항목, 의존성 그래프 5-Phase |
