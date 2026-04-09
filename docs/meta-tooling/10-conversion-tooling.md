# src/claude → src/codex 변환 메타 툴링

> 기존 89개 Claude 자산을 Codex 형식으로 변환하기 위한 분석/변환/검증 도구 명세

## 1. 개요

### 배경

`/kit-create --target both`는 **신규** 듀얼 타깃 컴포넌트를 생성한다. 그러나 `src/claude/`에 이미 존재하는 89개 자산을 `src/codex/` 대응 자산으로 **변환**하는 도구가 없다. `src/codex/`는 비어 있고, `src/pairing-registry.json`의 entries도 비어 있다.

### 목표

3개 메타 툴을 추가하여 변환 파이프라인을 구축한다:

```
/kit-analyze → 전환 준비 분석 (읽기 전용)
     ↓
/kit-convert → 배치 변환 실행 (파일 생성 + 레지스트리 갱신)
     ↓
/kit-validate --target codex → 변환 결과 검증
/kit-audit --category C7    → 페어링 일관성 감사
```

### 기존 도구와의 관계

| 도구 | 역할 | 신규/기존 |
|------|------|----------|
| `/kit-create` | **신규** 컴포넌트 스캐폴딩 | 기존 (Phase 1) |
| `/kit-analyze` | 기존 자산 변환 준비 분석 | **신규** |
| `/kit-convert` | 기존 자산 배치 변환 | **신규** |
| `kit-converter` | 변환 엔진 스킬 | **신규** |
| `/kit-validate` | 변환 결과 스키마 검증 | 기존 (Phase 2, `--target codex`) |
| `/kit-audit` | 페어링 일관성 감사 | 기존 (Phase 3, C7) |

---

## 2. 자산 인벤토리 + 변환 분류

### 전체 현황 (89개)

| 타입 | 수량 | Codex 매핑 | 변환 난이도 |
|------|------|-----------|-----------|
| agent | 12 | required codex sibling | HIGH (XML→헤딩) |
| command | 31 | required codex sibling | HIGH (슬래시→Entry Flow) |
| skill | 25 | optional codex sibling | LOW (복사+추가) |
| hook | 9 | optional (7호환/2skip) | LOW (JS복사+주석) |
| rule | 6 | claude-origin shared | N/A (변환 없음) |

### 변환 분류 기준

| 분류 | 기준 | 대상 |
|------|------|------|
| **auto** | 구조 변환만으로 충분 | 스킬 전체(25), 읽기 전용 에이전트(6), 호환 훅(7), 단순 커맨드(~15) |
| **review** | 변환 후 수동 검토 필요 | 쓰기 에이전트(6), 복합 커맨드(~16) |
| **skip** | 변환 대상 아님 | 룰 전체(6), 비호환 훅 2개 |

### 비호환 훅 (codex-skip)

| 훅 | 사유 |
|----|------|
| `output-secret-filter` | `CLAUDE_REMOTE_SESSION` 환경변수 의존 |
| `session-wrap-suggest` | Claude Stop 이벤트 + tmpdir 마커 의존 |

---

## 3. /kit-analyze 커맨드 명세

**파일**: `.claude/commands/kit-analyze.md`

### Frontmatter

```yaml
---
allowed-tools: Read, Grep, Glob
description: Claude 자산의 Codex 전환 준비 상태를 분석합니다.
argument-hint: '[--domain <domain>] [--type <type>] [--verbose]'
---
```

### 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--domain` | 도메인 필터 (`core`, `dev`, `plan`) | 전체 |
| `--type` | 타입 필터 (`skill`, `agent`, `command`, `hook`, `rule`) | 전체 |
| `--verbose` | 컴포넌트별 상세 출력 | 꺼짐 |

### Workflow

#### Phase 1: 인벤토리 구축

1. `src/claude/{core,dev,plan}/`을 스캔하여 전체 컴포넌트를 수집한다.
2. `src/codex/{core,dev,plan}/`을 스캔하여 이미 변환된 자산을 확인한다.
3. `src/pairing-registry.json`을 읽어 기존 페어링 상태를 확인한다.

#### Phase 2: 컴포넌트별 분석

4. 각 Claude 컴포넌트에 대해 다음을 결정한다:
   - `identity`: full_name (예: `dev-architect`)
   - `type`: skill / agent / command / hook / rule
   - `domain`: core / dev / plan
   - `codexMapping`: 대응 Codex 타입 (agent→agent, command→command, skill→skill, hook→hook, rule→shared)
   - `difficulty`: auto / review / skip

#### Phase 3: 난이도 휴리스틱

5. 타입별 분류 규칙:
   - **agent**: YAML frontmatter의 `tools` 배열에 `Write`/`Edit` 포함 → `review`, 아니면 `auto`
   - **command**: frontmatter 존재 + 3개 이상 Phase/Step 섹션 → `review`, 아니면 `auto`
   - **skill**: 항상 `auto`
   - **hook**: `skip-registry.md`에 등록된 identity → `skip`, 아니면 `auto`
   - **rule**: 항상 `skip`

#### Phase 4: 리포트 출력

6. 요약 + 상세 리포트를 출력한다:

```
[kit-analyze] Codex 전환 준비 분석

  === 요약 ===
  전체: 89 컴포넌트
  auto-convert:        ~53 (60%)
  convert-with-review: ~22 (25%)
  skip:                ~14 (15%)

  === 타입별 ===
  | 타입    | 전체 | Auto | Review | Skip |
  |---------|------|------|--------|------|
  | skill   | 25   | 25   | 0      | 0    |
  | agent   | 12   | 6    | 6      | 0    |
  | command | 31   | ~15  | ~16    | 0    |
  | hook    | 9    | 7    | 0      | 2    |
  | rule    | 6    | 0    | 0      | 6    |

  === 상세 (--verbose) ===
  | Identity            | Type    | Domain | Difficulty | Codex 존재 | 비고          |
  |---------------------|---------|--------|------------|-----------|---------------|
  | dev-architect       | agent   | dev    | auto       | No        | read-only     |
  | plan-prd-writer     | agent   | plan   | review     | No        | write-capable |
  | dev-tdd-workflow    | skill   | dev    | auto       | No        |               |
  | session-wrap-suggest| hook    | core   | skip       | No        | Claude-runtime|
  | golden-principles   | rule    | core   | skip       | N/A       | AGENTS.md     |
```

### Rules

- 읽기 전용. 파일을 수정하지 않는다.
- `_archive/` 디렉토리는 스캔에서 제외한다.

---

## 4. /kit-convert 커맨드 명세

**파일**: `.claude/commands/kit-convert.md`

### Frontmatter

```yaml
---
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
description: Claude 자산을 Codex 형식으로 전환합니다.
argument-hint: '[--name <name>] [--type <type>] [--domain <domain>] [--all] [--dry-run] [--force]'
---
```

### 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--name <name>` | 단일 컴포넌트 변환 | - |
| `--type <type>` | 타입별 전체 변환 | - |
| `--domain <domain>` | 도메인별 전체 변환 | - |
| `--all` | 변환 가능한 전체 | - |
| `--dry-run` | 미리보기 (파일 생성 안 함) | 꺼짐 |
| `--force` | 기존 Codex 파일 덮어쓰기 | 꺼짐 |

`--name`, `--type`, `--domain`, `--all` 중 하나만 지정. `--type rule`은 거부.

### Workflow

#### Phase 1: 범위 결정 + 검증

1. 인자를 파싱하여 변환 대상 목록을 결정한다.
2. 각 대상의 난이도를 분류한다 (auto / review / skip).
3. `skip` 항목은 필터링하고 로그로 기록한다.
4. `--force` 없이 기존 Codex 파일이 있으면 충돌 목록을 출력하고 중단한다.

#### Phase 2: 미리보기 (--dry-run)

5. `--dry-run`이면 변환 계획만 출력한다:

```
[kit-convert --dry-run] 변환 계획

  변환 대상: 5개
  건너뛰기: 2개 (codex-skip)

  | Identity        | Type    | Source                                   | Target                                   | Difficulty |
  |-----------------|---------|------------------------------------------|------------------------------------------|------------|
  | dev-architect   | agent   | src/claude/dev/agents/dev-architect.md   | src/codex/dev/agents/dev-architect.md    | auto       |
  | dev-feature     | command | src/claude/dev/commands/dev-feature.md   | src/codex/dev/commands/dev-feature.md    | review     |
```

6. `--dry-run`이면 여기서 종료.

#### Phase 3: 변환 실행

7. 타입별 변환 규칙을 적용한다 (kit-converter 스킬 참조):

##### Skill 변환 (auto)

```
1. src/claude/{domain}/skills/{identity}/SKILL.md 읽기
2. 내용 그대로 src/codex/{domain}/skills/{identity}/SKILL.md에 복사
3. "Codex 참고 사항" 섹션이 없으면 추가:
   ## Codex 참고 사항
   - 이 파일은 authoring source이다.
   - Claude sibling: src/claude/{domain}/skills/{identity}/SKILL.md
4. references/ 디렉토리가 있으면 함께 복사
```

##### Agent 변환 (auto/review)

```
1. src/claude/{domain}/agents/{identity}.md 읽기
2. YAML frontmatter에서 name, description, tools 추출
3. <Agent_Prompt> XML에서 섹션별 내용 추출:
   <Role>              → ## Role
   <Success_Criteria>  → ## Capabilities (병합)
   <Constraints>       → ## Constraints
   <Output_Format>     → ## Output Format
   <Failure_Modes_To_Avoid> → ## Failure Modes
   (나머지 XML 섹션은 관련 헤딩에 병합 또는 추가 섹션)
4. </Agent_Prompt> 뒤 비-XML 내용은 추가 섹션으로 보존
5. "Codex 참고 사항" 섹션 추가 (authoring source 명시)
6. tools에 Write/Edit 포함 시 파일 상단에 <!-- REVIEW NEEDED --> 마커
7. src/codex/{domain}/agents/{identity}.md에 쓰기
```

##### Command 변환 (auto/review)

```
1. src/claude/{domain}/commands/{identity}.md 읽기
2. Claude YAML frontmatter (allowed-tools, argument-hint) 제거
3. 제목 변환: # /{identity} → # {identity} — Codex Entry Flow
4. 섹션 매핑:
   첫 문단/설명     → ## Overview
   Usage/Preconditions → ## Invocation
   파라미터 테이블    → ## Parameters
   Phase/Workflow 섹션 → ## Workflow (번호 구조 유지)
   출력 포맷         → ## Output
   Rules 섹션        → 유지
5. "Codex 참고 사항" 섹션 추가
6. src/codex/{domain}/commands/{identity}.md에 쓰기
```

##### Hook 변환 (auto/skip)

```
1. skip-registry 확인. 등록된 identity면 건너뛰기
2. src/claude/{domain}/hooks/{identity}.js 읽기
3. JS 내용 그대로 복사
4. JSDoc에 Codex 등록 포맷 주석 추가:
   * Codex 등록 포맷:
   *   .codex/hooks.json: { type: "command", command: "./hooks/{identity}.js" }
   *
   * Codex hooks 현황 (2026-04 기준):
   *   - hooks는 experimental 기능
   *   - PreToolUse/PostToolUse matcher: Bash만 실질 매칭
   *   - Windows: 현재 비활성화
5. package.json 존재 확인, 없으면 생성
6. src/codex/{domain}/hooks/{identity}.js에 쓰기
```

##### Rule 처리 (skip)

```
로그: [skip] {identity}: claude-origin shared (AGENTS.md guidance)
pairing-registry에 codex-skip + reason 기록
```

#### Phase 4: 페어링 레지스트리 갱신

8. 변환된 각 컴포넌트를 `src/pairing-registry.json`에 기록:
   - 변환 성공 → `status: "paired"`, claude + codex 경로
   - 건너뛰기 → `status: "codex-skip"`, reason 포함
9. 기존 엔트리가 있으면 업데이트 (덮어쓰기).

#### Phase 5: 결과 출력

10. 변환 결과를 출력한다:

```
[kit-convert] 변환 완료

  변환: 5개
  건너뛰기: 2개 (codex-skip)
  실패: 0개

  | Identity        | Type    | Status  | Target                                  | Review? |
  |-----------------|---------|---------|----------------------------------------|---------|
  | dev-architect   | agent   | paired  | src/codex/dev/agents/dev-architect.md  | No      |
  | plan-prd-writer | agent   | paired  | src/codex/plan/agents/plan-prd-writer.md | YES   |
  | dev-tdd-workflow| skill   | paired  | src/codex/dev/skills/dev-tdd-workflow/ | No      |

  다음 단계:
  1. "YES" 표시 파일을 수동 검토하세요
  2. /kit-validate --target codex 로 스키마 검증
  3. /kit-audit --category C7 으로 페어링 일관성 확인
```

### Rules

- `--force` 없이 기존 파일 덮어쓰지 않는다.
- `--dry-run` 시 파일 생성 안 함.
- 변환 파일 상단에 `<!-- kit-convert generated: {날짜} -->` 추적 주석.
- `review` 난이도 파일에 `<!-- REVIEW NEEDED: {사유} -->` 마커.
- 변환 후 git add 하지 않는다.

---

## 5. kit-converter 스킬 명세

**위치**: `.claude/skills/kit-converter/`

### SKILL.md

```yaml
---
name: kit-converter
description: |
  Claude 자산을 Codex 형식으로 전환하는 변환 엔진. /kit-convert 커맨드가 이 스킬을
  참조하여 타입별 변환 규칙과 템플릿 매핑을 적용한다.
---
```

### 변환 결정 매트릭스

| Claude 타입 | Codex 결과 | Codex 경로 | 상태 |
|-------------|-----------|-----------|------|
| agent | heading-based .md | `src/codex/{domain}/agents/{identity}.md` | required |
| command | Entry Flow .md | `src/codex/{domain}/commands/{identity}.md` | required |
| skill | portable .md | `src/codex/{domain}/skills/{identity}/SKILL.md` | optional |
| hook | .js + 등록 주석 | `src/codex/{domain}/hooks/{identity}.js` | optional |
| rule | N/A | None | codex-skip |

### 템플릿 매핑

| 변환 타입 | 참조 템플릿 | 검증 스키마 |
|----------|-----------|-----------|
| agent | `template-codex-agent.md` | `schema-codex-agent.md` |
| command | `template-codex-command.md` | `schema-codex-command.md` |
| skill | `template-codex-skill.md` | `schema-codex-skill.md` |
| hook | `template-codex-hook.md` | `schema-codex-hook.md` |

### references/conversion-rules.md

타입별 상세 변환 규칙:
- Skill: 내용 복사 + "Codex 참고 사항" 섹션 추가 + references/ 복사
- Agent: YAML 제거 + XML→헤딩 변환 + authoring source 명시 + 쓰기 에이전트 REVIEW 마커
- Command: frontmatter 제거 + 제목 변환 + 섹션 재매핑 + Entry Flow
- Hook: JS 복사 + Codex 등록 주석 추가 + package.json 확인

### references/agent-section-mapping.md

Claude XML 10섹션 → Codex 헤딩 매핑:

| Claude XML | Codex 헤딩 | 처리 |
|-----------|-----------|------|
| `<Role>` | `## Role` | 직접 이전, XML 태그 제거 |
| `<Why_This_Matters>` | Role에 병합 또는 생략 | 암묵적 |
| `<Success_Criteria>` | `## Capabilities` 에 병합 | |
| `<Constraints>` | `## Constraints` | 직접 이전 |
| `<Investigation_Protocol>` | Capabilities에 병합 | 방법론 |
| `<Tool_Usage>` | Capabilities에 병합 | 도구 사용 |
| `<Execution_Policy>` | Constraints에 병합 | 실행 경계 |
| `<Output_Format>` | `## Output Format` | 직접 이전 |
| `<Failure_Modes_To_Avoid>` | `## Failure Modes` | 직접 이전 |
| `<Final_Checklist>` | Output Format에 병합 또는 생략 | 중복 |

### references/skip-registry.md

| Identity | 타입 | 사유 |
|----------|------|------|
| output-secret-filter | hook | CLAUDE_REMOTE_SESSION 환경변수 의존 |
| session-wrap-suggest | hook | Claude Stop 이벤트 + tmpdir 마커 의존 |
| coding-style | rule | claude-origin shared guidance |
| date-calculation | rule | claude-origin shared guidance |
| golden-principles | rule | claude-origin shared guidance |
| interaction | rule | claude-origin shared guidance |
| security | rule | claude-origin shared guidance |
| verification | rule | claude-origin shared guidance |

---

## 6. 파일럿 워크플로우

5개 대표 자산으로 변환 도구를 검증한다:

| # | 명령 | 대상 | 검증 항목 |
|---|------|------|----------|
| 1 | `/kit-analyze --verbose` | 전체 | 분류 정확도 (auto/review/skip) |
| 2 | `/kit-convert --name dev-architect --dry-run` | 읽기 전용 에이전트 | 미리보기 정확도 |
| 3 | `/kit-convert --name dev-architect` | 에이전트 | XML→헤딩 변환 품질 |
| 4 | `/kit-validate dev-architect --target codex` | 에이전트 | schema-codex-agent 준수 |
| 5 | `/kit-convert --name dev-feature` | 복합 커맨드 | 슬래시→Entry Flow 변환 |
| 6 | `/kit-convert --name dev-tdd-guard` | 호환 훅 | JS 복사 + 등록 주석 |
| 7 | `/kit-convert --name session-wrap-suggest` | 비호환 훅 | skip 동작 확인 |
| 8 | `/kit-audit --category C7` | 전체 | 페어링 레지스트리 일관성 |

파일럿 후: 생성된 파일 검토 → 변환 규칙 조정 → 배치 변환 진행.

---

## 7. 배치 변환 순서

도메인 의존성(core←dev, core←plan) 순서로 변환:

```bash
# 1단계: core (2 skills, 3 hooks convert, 2 hooks skip, 6 rules skip)
/kit-convert --domain core

# 2단계: dev (15 skills, 6 agents, 21 commands, 3 hooks)
/kit-convert --domain dev

# 3단계: plan (8 skills, 6 agents, 10 commands, 1 hook)
/kit-convert --domain plan
```

### 예상 결과

| 도메인 | 변환 | 건너뛰기 | 합계 |
|--------|------|---------|------|
| core | 5 | 8 | 13 |
| dev | 45 | 0 | 45 |
| plan | 25 | 0 | 25 |
| **합계** | **75** | **8** | **83** |

---

## 8. 검증 계획

배치 변환 완료 후 기존 도구로 검증:

| # | 도구 | 검증 |
|---|------|------|
| 1 | `/kit-validate --target codex` | 변환된 파일이 Codex 스키마 준수 |
| 2 | `/kit-audit --category C7` | 모든 agent/command가 paired 또는 codex-skip |
| 3 | `/kit-list --target both --pairing` | Claude/Codex 카운트 + 페어링 상태 |
| 4 | 수동 검토 | `<!-- REVIEW NEEDED -->` 마커 파일 확인 |

### 기대 최종 상태

```
src/claude/ → 89개 (변경 없음)
src/codex/  → 75개 (변환 완료)
pairing-registry.json → 83개 엔트리 (75 paired + 8 codex-skip)
```

---

## 9. 구현 순서

| Layer | 작업 | 파일 수 | 의존성 |
|-------|------|---------|--------|
| 0 | kit-converter 스킬 (SKILL.md + 3 references) | 4 | 없음 |
| 1 | /kit-analyze 커맨드 | 1 | kit-converter |
| 2 | /kit-convert 커맨드 | 1 | kit-converter |

**총 신규 파일**: 6개

```
.claude/
  commands/
    kit-analyze.md                    # 전환 준비 분석
    kit-convert.md                    # 배치 변환
  skills/
    kit-converter/
      SKILL.md                        # 변환 엔진
      references/
        conversion-rules.md           # 타입별 변환 규칙
        agent-section-mapping.md      # XML→헤딩 매핑
        skip-registry.md              # codex-skip 대상
```

---

## 10. Quick Start

### 3단계로 시작하기

```bash
# 1. 전환 준비 상태 확인
/kit-analyze

# 2. 파일럿 1개 변환 (미리보기)
/kit-convert --name dev-architect --dry-run

# 3. 실제 변환 + 검증
/kit-convert --name dev-architect
/kit-validate dev-architect --target codex
```

### 단일 변환 예시: `/kit-convert --name dev-architect`

**입력** (Claude 소스):

```
src/claude/dev/agents/dev-architect.md
```

```markdown
---
name: dev-architect
description: 시스템 설계, 확장성, 기술적 의사결정을 위한 아키텍처 전문가.
tools: ["Read", "Grep", "Glob"]
model: opus
memory: project
color: blue
---

<Agent_Prompt>
  <Role>
    당신은 아키텍트(Oracle)입니다. 코드를 분석하고...
    요구사항 수집(analyst)...은 담당하지 않습니다.
  </Role>

  <Constraints>
    - Write 또는 Edit 도구를 절대 사용하지 않음. 읽기 전용 분석 에이전트.
    ...
  </Constraints>

  <Output_Format>
    ## 요약
    [2-3문장]
    ## 분석
    ...
  </Output_Format>

  <Failure_Modes_To_Avoid>
    - 탁상 분석: 코드를 먼저 읽지 않고 조언 제공.
    ...
  </Failure_Modes_To_Avoid>
</Agent_Prompt>

## 아키텍처 원칙
...
```

**변환 과정**:

```
1. YAML frontmatter 읽기 → tools에 Write/Edit 없음 → difficulty: auto
2. <Agent_Prompt> XML 파싱:
   <Role>              → ## Role
   <Constraints>       → ## Constraints
   <Output_Format>     → ## Output Format
   <Failure_Modes>     → ## Failure Modes
3. YAML frontmatter 제거 (name, tools, model, memory, color)
4. description → 제목 아래 배치
5. </Agent_Prompt> 뒤 "아키텍처 원칙" → 추가 섹션으로 보존
6. "Codex 참고 사항" 섹션 추가
7. pairing-registry.json 에 엔트리 추가
```

**출력** (Codex 결과):

```
src/codex/dev/agents/dev-architect.md
```

```markdown
<!-- kit-convert generated: 2026-04-09T... -->
# dev-architect

시스템 설계, 확장성, 기술적 의사결정을 위한 아키텍처 전문가.

## Role

당신은 아키텍트(Oracle)입니다. 코드를 분석하고...
요구사항 수집(analyst)...은 담당하지 않습니다.

## Capabilities

- 코드 분석, 구현 검증, 디버깅 근본 원인 파악, 아키텍처 권고

## Constraints

- Write 또는 Edit 도구를 절대 사용하지 않음. 읽기 전용 분석 에이전트.
...

## Output Format

## 요약
[2-3문장]
## 분석
...

## Failure Modes

- 탁상 분석: 코드를 먼저 읽지 않고 조언 제공.
...

## 아키텍처 원칙
...

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- 설치/emit 단계에서 `.codex/agents/*.toml`로 연결된다.
- Claude sibling: `src/claude/dev/agents/dev-architect.md`
```

**pairing-registry.json 갱신**:

```json
{
  "identity": "dev-architect",
  "type": "agent",
  "domain": "dev",
  "status": "paired",
  "reason": null,
  "claude": "src/claude/dev/agents/dev-architect.md",
  "codex": "src/codex/dev/agents/dev-architect.md",
  "createdAt": "2026-04-09T..."
}
```

**콘솔 출력**:

```
[kit-convert] 변환 완료

  변환: 1개 | 건너뛰기: 0개

  | Identity      | Type  | Status | Target                                | Review? |
  |---------------|-------|--------|---------------------------------------|---------|
  | dev-architect | agent | paired | src/codex/dev/agents/dev-architect.md | No      |

  다음 단계:
  1. /kit-validate dev-architect --target codex
```

### 배치 변환 예시: `/kit-convert --domain dev`

```
[kit-convert] dev 도메인 변환

  대상: 45개 (15 skills + 6 agents + 21 commands + 3 hooks)
  건너뛰기: 0개

  === Skills (15개, auto) ===
  [OK] dev-architecture-decision  → src/codex/dev/skills/dev-architecture-decision/SKILL.md
  [OK] dev-domain-modeling        → src/codex/dev/skills/dev-domain-modeling/SKILL.md
  [OK] dev-tdd-workflow           → src/codex/dev/skills/dev-tdd-workflow/SKILL.md
  ... (12개 더)

  === Agents (6개, 3 auto + 3 review) ===
  [OK] dev-architect              → src/codex/dev/agents/dev-architect.md
  [OK] dev-code-reviewer          → src/codex/dev/agents/dev-code-reviewer.md
  [OK] dev-database-reviewer      → src/codex/dev/agents/dev-database-reviewer.md
  [OK] dev-security-reviewer      → src/codex/dev/agents/dev-security-reviewer.md
  [OK] dev-doc-updater            → src/codex/dev/agents/dev-doc-updater.md          ← REVIEW NEEDED
  [OK] dev-verify-agent           → src/codex/dev/agents/dev-verify-agent.md

  === Commands (21개, ~10 auto + ~11 review) ===
  [OK] dev-architecture           → src/codex/dev/commands/dev-architecture.md
  [OK] dev-build-fix              → src/codex/dev/commands/dev-build-fix.md
  [OK] dev-feature                → src/codex/dev/commands/dev-feature.md             ← REVIEW NEEDED
  ... (18개 더)

  === Hooks (3개, auto) ===
  [OK] dev-db-guard               → src/codex/dev/hooks/dev-db-guard.js
  [OK] dev-feature-scope-guard    → src/codex/dev/hooks/dev-feature-scope-guard.js
  [OK] dev-tdd-guard              → src/codex/dev/hooks/dev-tdd-guard.js

  === 요약 ===
  변환: 45개 | 건너뛰기: 0개 | REVIEW NEEDED: ~12개

  pairing-registry.json: 45개 엔트리 추가 (all paired)

  다음 단계:
  1. REVIEW NEEDED 파일 12개를 수동 검토하세요
  2. /kit-validate --target codex --domain dev
  3. /kit-audit --category C7
```

---

## 11. 변환 전 확인 사항 (Pre-conversion Checklist)

### 공통 전제 조건

| # | 확인 항목 | 확인 방법 | 실패 시 |
|---|----------|----------|---------|
| 1 | Phase 0 완료 (src/claude/ 구조 존재) | `ls src/claude/` | Phase 0 먼저 실행 |
| 2 | src/codex/{core,dev,plan}/ 존재 | `ls src/codex/` | `mkdir -p src/codex/{core,dev,plan}` |
| 3 | pairing-registry.json 존재 | `cat src/pairing-registry.json` | Phase 4 T1 실행 |
| 4 | Codex 템플릿 4종 존재 | `ls .claude/skills/kit-scaffolding/references/template-codex-*` | Phase 4 Layer 1 실행 |
| 5 | Codex 스키마 4종 존재 | `ls .claude/skills/kit-validation/references/schema-codex-*` | Phase 4 Layer 2 실행 |
| 6 | kit-converter 스킬 존재 | `ls .claude/skills/kit-converter/SKILL.md` | Layer 0 구현 |

### 타입별 변환 전 점검

#### Agent 변환 전

| 점검 | 방법 | 영향 |
|------|------|------|
| tools 배열 확인 | YAML frontmatter `tools:` 읽기 | Write/Edit 포함 → `review` 난이도, REVIEW NEEDED 마커 |
| Agent_Prompt XML 존재 확인 | `<Agent_Prompt>` 태그 검색 | 없으면 변환 실패 (비표준 포맷) |
| 10개 XML 섹션 확인 | Role, Constraints, Output_Format 최소 존재 | 누락 섹션 → 빈 헤딩 생성 |

#### Command 변환 전

| 점검 | 방법 | 영향 |
|------|------|------|
| frontmatter 유무 | `---` 블록 존재 확인 | 있으면 complex → `review`, 없으면 simple → `auto` |
| Phase/Step 수 | `## Phase` 또는 `단계` 패턴 카운트 | 3개 이상 → `review` |
| 슬래시 커맨드 제목 | `# /` 패턴 확인 | 있으면 Entry Flow 제목으로 변환 |

#### Hook 변환 전

| 점검 | 방법 | 영향 |
|------|------|------|
| skip-registry 확인 | identity가 skip-registry.md에 있는지 | 등록됨 → 변환 건너뛰기 |
| Event 타입 확인 | JSDoc `* Event:` 읽기 | Stop → Codex hooks 현황 경고 추가 |
| package.json | 훅 디렉토리에 존재 여부 | 없으면 자동 생성 |

#### Skill 변환 전

| 점검 | 방법 | 영향 |
|------|------|------|
| SKILL.md 존재 | 디렉토리 내 파일 확인 | 없으면 변환 불가 |
| references/ 유무 | 서브디렉토리 확인 | 있으면 함께 복사 |

---

## 12. 개선 로드맵

현재 명세의 약점과 향후 보완 항목을 정리한다.

### 12.1 변환 실패 시 롤백

**현재**: 변환 도중 실패하면 일부 파일만 생성된 불완전 상태가 남는다.

**개선안**:
- `--dry-run`을 항상 먼저 실행하여 충돌/오류를 사전 감지
- 변환 시작 전 `src/codex/` 스냅샷 기록 (변환 대상 파일 목록)
- 실패 시 생성된 파일을 자동 삭제하는 `--rollback` 옵션
- 또는 git worktree에서 변환 실행 후 결과 확인 → merge

**우선순위**: Medium (파일럿 단계에서는 수동 롤백으로 충분)

### 12.2 부분 변환 상태 추적

**현재**: 89개 중 일부만 변환한 상태에서 "어디까지 했는지" 추적이 어렵다.

**개선안**:
- `/kit-analyze`에 `--status` 플래그: pairing-registry 기반으로 변환 진행률 표시
- 출력 예시:
  ```
  변환 진행률: 45/83 (54%)
  - core: 5/13 (38%)  ← 8 skip
  - dev:  45/45 (100%)
  - plan: 0/25 (0%)   ← 미시작
  ```

**우선순위**: High (배치 변환 시 필수)

### 12.3 변환 품질 메트릭

**현재**: 변환 성공/실패만 보고한다. 변환 품질(내용 보존율, 섹션 매핑 정확도)은 측정하지 않는다.

**개선안**:
- 에이전트 변환 후 자동 검증:
  - Claude 원본의 XML 섹션 수 vs Codex 결과의 헤딩 수 비교
  - 누락된 섹션 자동 감지 + 경고
- 커맨드 변환 후 자동 검증:
  - Claude 원본의 Phase 수 vs Codex 결과의 Workflow 단계 수 비교
  - 파라미터 테이블 보존 여부
- 리포트에 "보존율" 컬럼 추가:
  ```
  | Identity      | Sections (Claude) | Sections (Codex) | 보존율 |
  |---------------|-------------------|------------------|--------|
  | dev-architect | 10 XML            | 6 headings       | 100%   |
  | plan-prd-writer | 10 XML          | 5 headings       | 85%    |
  ```

**우선순위**: Medium (파일럿 후 도입)

### 12.4 리포트 정확성 개선

**현재**: `/kit-analyze`의 난이도 분류가 단순 휴리스틱(tools 배열, Phase 수)에 의존한다.

**개선안**:
- 에이전트: `<Investigation_Protocol>` 복잡도 (단계 수, 도구 참조 수)를 추가 가중치로 사용
- 커맨드: 본문 길이(줄 수), 교차 참조 커맨드 수, 출력 포맷 복잡도를 고려
- 훅: 실제 JS 코드 복잡도(조건 분기 수, 외부 모듈 의존)를 확인
- 리포트에 "분류 근거" 컬럼 추가:
  ```
  | Identity   | Difficulty | 근거                                    |
  |------------|------------|----------------------------------------|
  | dev-feature| review     | frontmatter + 5 phases + 200+ lines    |
  | dev-commit | auto       | no frontmatter + 2 phases + 46 lines   |
  ```

**우선순위**: Low (현재 휴리스틱으로 파일럿 충분)

### 12.5 변환 규칙 버전 관리

**현재**: 변환 규칙이 `kit-converter/references/`에 문서로만 존재한다. 규칙이 변경되면 이미 변환된 파일과 불일치가 생길 수 있다.

**개선안**:
- 변환 파일의 `<!-- kit-convert generated -->` 주석에 규칙 버전 포함:
  ```html
  <!-- kit-convert generated: 2026-04-09T... / rules-v1 -->
  ```
- 규칙 변경 시 `/kit-convert --force --all`로 전체 재변환 가능
- `/kit-audit`에 "변환 규칙 버전 일치" 검증 항목 추가 (C8 후보)

**우선순위**: Low (규칙이 안정화된 후)

### 12.6 변환 전 의존성 검증

**현재**: 단일 자산 단위로 변환하므로, 커맨드가 참조하는 스킬이 먼저 변환되었는지 확인하지 않는다.

**개선안**:
- `/kit-convert`에 `--check-deps` 옵션:
  - 커맨드가 `참조: .claude/skills/{name}` 형태로 스킬을 참조하면, 해당 스킬의 Codex sibling 존재 여부 확인
  - 없으면 WARN: "참조 스킬 {name}의 Codex sibling이 없습니다"
- 배치 변환 시 자동으로 의존성 순서 결정: skills → agents → commands → hooks

**우선순위**: Medium (배치 변환 시 유용)

### 개선 우선순위 요약

| # | 개선 | 우선순위 | 시점 |
|---|------|---------|------|
| 12.2 | 부분 변환 상태 추적 | High | 배치 변환 전 |
| 12.6 | 변환 전 의존성 검증 | Medium | 배치 변환 전 |
| 12.1 | 변환 실패 롤백 | Medium | 배치 변환 전 |
| 12.3 | 변환 품질 메트릭 | Medium | 파일럿 후 |
| 12.4 | 리포트 정확성 | Low | 파일럿 후 |
| 12.5 | 규칙 버전 관리 | Low | 규칙 안정화 후 |
