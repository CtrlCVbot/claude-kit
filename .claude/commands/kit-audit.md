---
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git:*)
description: claude-kit 전체 컴포넌트의 일관성을 전수 감사합니다.
argument-hint: '[--category <cat>] [--fix] [--verbose]'
---

# /kit-audit

전체 컴포넌트를 대상으로 구조, 네이밍, 필드, 교차 참조 등 6개 카테고리 감사를 수행한다.

> 참조: `.claude/skills/kit-validation/SKILL.md`

## Usage

```bash
/kit-audit                    # 전체 감사
/kit-audit --category <cat>   # 카테고리별 (C1~C9)
/kit-audit --fix              # 자동 수정 가능 항목 처리
/kit-audit --verbose          # 상세 출력
```

## 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--category` | 감사 카테고리 필터 (`C1`~`C9`) | 전체 |
| `--fix` | 자동 수정 가능 항목 처리 | 꺼짐 |
| `--verbose` | 상세 출력 | 꺼짐 |
| `--exceptions` | 활성 예외 목록 출력 | 꺼짐 |
| `--no-exceptions` | 예외 무시, 모든 위반 보고 | 꺼짐 |

## 감사 카테고리

### C1: 구조 규약 (필수)

- 디렉토리 구조가 `src/claude/{domain}/{category}/` 패턴 준수
- 스킬은 디렉토리 기반 (`SKILL.md`), 나머지는 파일 기반
- 훅 디렉토리에 `package.json` 존재

### C2: 네이밍 규약 (필수)

- 모든 이름이 kebab-case (`/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`)
- 도메인 접두사 일관성 (`{domain}-*`)
- 룰은 도메인 접두사 없음
- 파일 확장자: skills/agents/commands는 `.md`, hooks는 `.js`

### C3: 필드 완전성 (필수)

- `/kit-validate`와 동일한 검증을 전수 적용
- 필수 필드 누락, 형식 오류 탐지
- 에이전트 Read-Only 일관성 검증

### C4: 교차 참조 (필수)

- 커맨드가 참조하는 스킬이 실제 존재하는지
- 스킬이 참조하는 훅이 실제 존재하는지
- 에이전트가 참조하는 도구가 유효 도구 목록에 포함되는지

### C5: setup.js 정합성 (선택)

- `scripts/setup.js`의 `buildHooksConfig()`에 모든 훅이 등록되어 있는지
- 새 컴포넌트가 복사 대상에 포함되는지

### C6: 문서 정확성 (필수, codex-sync cross-phase review 후 mandatory 승격)

> codex-sync cross-phase review (10-cross-phase-review.md CC4) 결과 mandatory로 승격됨. cross-phase에서 컴포넌트 카운트 변동이 있을 때 자동 detection 필요.

- README.md의 컴포넌트 카운트가 실제와 일치하는지 (FAIL: 카운트 불일치)
- `docs/guide/09-architecture.md`의 컴포넌트 목록이 최신인지 (WARN: 누락된 컴포넌트)
- `src/templates/AGENTS.md.template`의 `## 핵심 규칙` h3 섹션 6개 존재 (FAIL: codex-sync Phase 2 rule fallback artifact 무결성)
  - 즉시 실행 가능 검증: `grep -c "^### " src/templates/AGENTS.md.template` → 6 미만 시 FAIL

### C7: 페어링 일관성 (필수, codex-sync Phase 4 cross-check 포함)

- `src/pairing-registry.json` 존재 여부
- 레지스트리에 있는 자산이 파일시스템에 실제 존재하는지 (FAIL)
- 파일시스템의 agent/command가 레지스트리에 등록되어 있는지 (WARN)
- `codex-skip` 상태인데 reason이 비어있는 항목 (FAIL)
- `paired` 상태인데 한쪽 파일만 존재하는 항목 (FAIL)
- **exception-registry ↔ pairing-registry cross-check** (codex-sync Phase 4, [03-sync-pipeline-design.md §7.1](../../docs/codex-sync/03-sync-pipeline-design.md#71-vocabulary-mapping-exception-registry--pairing-registry) vocabulary mapping):
  - exception `strategy=paired-direct` + `status=resolved` → pairing entry 존재 + `status=paired` (FAIL: 모순)
  - exception `strategy=paired-direct` + pairing `status=codex-skip` (FAIL: strategy/status 모순)
  - exception `strategy=blocked` + pairing `status=paired` (FAIL: blocked인데 sibling 존재)
  - exception `strategy=paired-fallback` + `fallbackTarget=skill` → fallback artifact (`src/claude/{domain}/skills/{component}/SKILL.md`) 존재 (WARN: artifact 무결성)
  - exception `strategy=paired-fallback` + `fallbackTarget=agents-guidance` → `src/templates/AGENTS.md.template` `### {component}` h3 존재 (WARN: artifact 무결성)

#### 즉시 실행 가능 검증 명령 (codex-sync cross-phase review CC3 — silent failure 감지)

C7이 cross-phase 피드백에서 식별한 silent failure 시나리오를 다음 명령으로 즉시 감지:

- **S2 감지** (AGENTS.md.template 섹션 삭제): 이미 C6에 포함됨 (`grep -c "^### " src/templates/AGENTS.md.template` → 6 미만 시 FAIL)
- **S3 감지** (skill fallback artifact 삭제, 예: EX-001):
  ```bash
  # paired-fallback + fallbackTarget=skill entry 추출 후 각 SKILL.md 존재 확인
  node -e "
    const d = JSON.parse(require('fs').readFileSync('src/exception-registry.json','utf8'));
    const fs = require('fs');
    let fail = 0;
    for (const e of d.entries) {
      if (e.strategy==='paired-fallback' && e.fallbackTarget==='skill' && e.status==='resolved') {
        const artifactPath = 'src/claude/' + (e.domain || 'core') + '/skills/' + e.component + '/SKILL.md';
        if (!fs.existsSync(artifactPath)) { console.log('FAIL:', e.id, 'missing artifact', artifactPath); fail++; }
      }
    }
    console.log(fail===0 ? 'PASS: all skill fallback artifacts exist' : 'FAIL: ' + fail + ' missing');
  "
  ```
- **S4 감지** (pairing-registry enum value 오류): `.claude/skills/kit-validation/references/schema-pairing-registry.md` 참조 (codex-sync cross-phase review CC5, Phase 5+ 신규)

### C10: codex-sync artifact drift detection (권장, codex-sync Phase 4+5)

> codex-sync Phase 2 피드백 N2 + Phase 3 후속 의무 + Phase 5 content drift 확장. 원본 source와 fallback artifact 간 drift를 보고.

- **rule fallback drift**: `src/claude/core/rules/{name}.md` 변경 시 `src/templates/AGENTS.md.template ### {name}` 섹션 갱신 누락 감지 (INFO)
  - 검사: 두 파일의 git log 비교 → 원본 변경 후 template 미갱신 commit 식별
- **hook fallback drift**: `src/claude/{domain}/hooks/{name}.js` 변경 시 fallback skill (`src/claude/{domain}/skills/{name}/SKILL.md`) 의도 정합성 (INFO)
  - 예: EX-001 session-wrap-suggest hook의 threshold 변경 시 skill의 trigger 조건 재확인 권장
- **paired-direct sibling drift** (시간 기반): `claudeSource`와 `codexSource`가 모두 존재하는 항목의 수정일 차이 > 7일 (INFO)
  - 예: EX-002 output-secret-filter의 Claude/Codex 버전 분기 일관성
- **paired-content-drift** (내용 기반, `--content` 플래그): Claude source에 존재하는 도메인 키워드(`copy`, `scenario`, `Feature 유형` 등)가 Codex source에 없는 비대칭 감지 (WARN)
  - 검사: `node scripts/audit-drift.js --content` 실행
  - 해결: `/kit-sync --resync --name {identity}` 또는 `/kit-convert --name {identity} --force`
  - 예: copy 도메인 도입으로 수정된 plan-draft, dev-feature 등 기존 컴포넌트의 Claude↔Codex 내용 불일치
- **rule-content-drift** (내용 기반, `--content` 플래그): Rule source에 존재하는 도메인 키워드가 AGENTS.md.template 섹션에 없는 비대칭 감지 (INFO)
  - 검사: `node scripts/audit-drift.js --content` 실행

### C8: 교차 참조 무결성 (필수)

3가지 참조 패턴을 파싱하여 대상 존재 여부를 검증한다. 상세: 11-consistency-tooling.md §3.

- `> 참조:` 블록 인용 경로가 실제 존재하는지 (FAIL: 죽은 참조)
- 도메인 접두사 누락 감지 (WARN: --fix로 자동 수정 가능)
- Codex sibling 참조 유효성 (WARN)
- 고아 컴포넌트 탐지 (INFO)

### C9: 설계-구현 갭 (선택)

설계 문서 vs 실제 구현을 비교하여 미반영 항목을 탐지한다. 상세: 11-consistency-tooling.md §4.

- G1: pairing-registry에서 미등록 agent/command (WARN)
- G2: src/claude/ 자산 중 src/codex/ 대응 없는 required sibling (WARN)
- G3: docs/meta-tooling/ 명세에 정의됐지만 .claude/에 없는 도구 (WARN)
- G5: 컴포넌트 카운트 불일치 (INFO)

## Workflow

### Phase 1: 인벤토리 구축

1. `src/claude/` 전체를 스캔하여 컴포넌트 인벤토리를 구축한다.
2. 각 컴포넌트의 타입, 도메인, 이름, 경로를 기록한다.

### Phase 2: 카테고리별 감사

3. 선택된 카테고리(기본: C1~C4, C6, C7, C8 필수 — C6는 codex-sync cross-phase review 후 mandatory 승격)에 대해 순서대로 검증한다.
4. src/exception-registry.json을 로드하여, 매칭되는 active 예외는 `[EXEMPT]`로 표시한다. 나머지를 PASS / WARN / FAIL로 분류한다.

### Phase 3: 자동 수정 (--fix)

5. `--fix` 옵션이 있으면 안전한 항목만 자동 수정한다:

| 항목 | 자동 수정 내용 |
|------|---------------|
| package.json 누락 | `{"type": "commonjs"}` 생성 |
| README 카운트 불일치 | 실제 카운트로 갱신 |
| frontmatter name 불일치 | 디렉토리/파일명과 동기화 |

6. 자동 수정 후 해당 항목을 재검증한다.

### Phase 4: 결과 출력

7. 카테고리별 결과를 출력한다:

```
[kit-audit] 전수 감사 결과

  C1: 구조 규약
    [PASS] 모든 컴포넌트가 올바른 디렉토리 구조

  C2: 네이밍 규약
    [PASS] 전체 kebab-case 준수

  C3: 필드 완전성
    [PASS] N/N 컴포넌트 필수 필드 충족

  C4: 교차 참조
    [PASS] 모든 참조가 유효

  총계: N 카테고리 / X PASS / Y WARN / Z FAIL
  자동 수정 가능: N건 (--fix로 실행)
```

## Rules

- C1~C4, C6, C7, C8는 필수 감사 카테고리이다. 항상 실행된다 (C6는 codex-sync cross-phase review 후 mandatory 승격).
- C10은 권장 감사 카테고리이다. 기본 실행에서 포함되며, content drift 감지에는 `--content` 플래그가 추가로 필요하다.
- C5, C9는 `--category C5` 또는 해당 카테고리 코드로 명시적 요청 시에만 실행된다.
- `--fix`는 안전한 항목만 수정한다. 판단이 필요한 항목은 보고만 한다.
- `_archive/` 디렉토리는 감사 대상에서 제외한다.
