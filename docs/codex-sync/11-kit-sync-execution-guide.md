# kit-sync 실행 가이드

> 75개 Claude 컴포넌트를 Codex sibling으로 전환하는 실행 가이드.
> 새 세션에서 이 파일 경로만 알려주면 바로 실행 가능.

---

## 원샷 실행 (전체 한 번에)

새 세션에 다음 한 줄만 입력:

```
docs/codex-sync/11-kit-sync-execution-guide.md 의 "원샷 실행" 섹션대로 75개 전체 동기화 진행해줘
```

### 실행 지침

1. **사전 검증** 실행 후, 문제 없으면 중단 없이 전체 진행한다.
2. **타입별로 `/kit-sync`를 순서대로 호출**한다: skill → agent → command → hook
3. 각 타입 전환 후 `/kit-validate --type {타입} --target codex`로 검증한다. FAIL 시 해당 파일만 보정하고 계속 진행.
4. **review 필요 항목** (`<!-- REVIEW NEEDED -->` 마커)은 전환 후 한꺼번에 검토한다 (중간에 멈추지 않음).
5. **전체 완료 후** audit + sync-report를 한 번에 실행한다.
6. **커밋은 2개만**: (1) 전체 전환 commit + (2) review 보정 + report commit.

### 원샷 실행 순서

```bash
# ━━━ 1. 사전 검증 ━━━
node scripts/audit-pairing.js && node scripts/audit-drift.js

# ━━━ 2. 전체 전환 (순서: skill → agent → command → hook) ━━━
/kit-sync --type skill
/kit-sync --type agent      # RO 3개 auto + Write 9개 review
/kit-sync --type command    # 단순 25개 auto + 복합 6개 review
/kit-sync --type hook       # 호환 7개 (exception 2개 자동 스킵)

# ━━━ 3. 일괄 검증 ━━━
/kit-validate --type skill --target codex
/kit-validate --type agent --target codex
/kit-validate --type command --target codex
/kit-validate --type hook --target codex

# ━━━ 4. 전체 전환 커밋 ━━━
git add src/codex/ src/pairing-registry.json
git commit -m "feat(kit-sync): 75개 Claude 컴포넌트 Codex sibling 일괄 전환"

# ━━━ 5. Review 항목 검토 ━━━
# <!-- REVIEW NEEDED --> 마커가 있는 파일 찾기
grep -rl "REVIEW NEEDED" src/codex/

# 각 파일 검토 후 마커 제거 → 보정 사항 반영

# ━━━ 6. 최종 audit + report ━━━
node scripts/audit-pairing.js
node scripts/audit-drift.js
node scripts/generate-sync-report.js > docs/codex-sync/sync-report-post-conversion.md

# ━━━ 7. 최종 커밋 ━━━
git add src/codex/ src/pairing-registry.json docs/codex-sync/sync-report-post-conversion.md
git commit -m "docs(kit-sync): review 보정 + 전환 완료 sync-report"
```

### 기대 결과

```
pairing-registry entries: 76 (1 기존 + 75 신규)
src/codex/ 파일: ~78개
audit-pairing: 0 FAIL, 0 WARN
audit-drift: 0 FAIL
```

---

## 단계별 실행 (안전하게 하나씩)

> 위 원샷이 불안하면 이 섹션을 따라 step별로 진행.

### 빠른 시작 (단계별)

```bash
# 1. 현재 상태 확인 (30초)
node scripts/audit-pairing.js && node scripts/audit-drift.js

# 2. 파일럿 1개 실행 (변환 품질 확인)
/kit-sync --dry-run --name dev-architect
/kit-sync --name dev-architect

# 3. 파일럿 검증
/kit-validate dev-architect --target codex

# 4. OK면 일괄 전환 시작
/kit-sync --type skill
/kit-sync --type command
/kit-sync --type hook
/kit-sync --type agent

# 5. 최종 확인
node scripts/audit-pairing.js
node scripts/generate-sync-report.js
```

---

## 전환 대상

| 타입 | 개수 | 난이도 | 변환 규칙 |
|------|------|--------|----------|
| skill | 25 | auto | 내용 복사 + "Codex 참고 사항" 섹션 추가 |
| agent (RO) | 3 | auto | XML Agent_Prompt → heading-based 변환 |
| agent (Write) | 9 | review | 위 + `<!-- REVIEW NEEDED -->` 마커 |
| command (단순) | 25 | auto | 슬래시 → Entry Flow 변환 |
| command (복합) | 6 | review | 위 + `<!-- REVIEW NEEDED -->` 마커 |
| hook | 7 | auto | JS 복사 + Codex 등록 주석 |
| **합계** | **75** | | |

**이미 처리된 항목** (전환 대상에서 제외됨):
- `output-secret-filter` hook (EX-002, 이미 src/codex/에 paired)
- `session-wrap-suggest` hook (EX-001, skill fallback artifact 생성 완료)
- 6개 rules (EX-003~008, AGENTS.md.template에 inline merge 완료)
- `security-no-hardcoded-secrets` (EX-009, Codex Rules direct 후보 — active)

---

## 단계별 실행

### Step 0: 사전 확인

```bash
# audit 스크립트 실행
node scripts/audit-pairing.js     # → PASS 확인
node scripts/audit-drift.js       # → 0 FAIL 확인

# 현재 paired 상태
node -e "const d=JSON.parse(require('fs').readFileSync('src/pairing-registry.json','utf8'));console.log('현재 paired:', d.entries.length, '개');"
# → 현재 paired: 1 개
```

### Step 1: 파일럿 — dev-architect

전환 품질을 확인하는 첫 번째 테스트.

```bash
/kit-sync --dry-run --name dev-architect    # 미리보기
```

dry-run 결과를 확인한 후:

```bash
/kit-sync --name dev-architect              # 실행
/kit-validate dev-architect --target codex  # 검증
```

**확인 사항**:
- [ ] `src/codex/dev/agents/dev-architect.md` 생성됐는가
- [ ] XML `<Agent_Prompt>` → `## Role`, `## Capabilities` 등 heading 변환 정상
- [ ] "Codex 참고 사항" 섹션 추가됐는가
- [ ] `pairing-registry.json`에 `dev-architect` entry 추가됐는가
- [ ] `<!-- REVIEW NEEDED -->` 마커 없음 (RO agent이므로)

✅ 모두 OK → Step 2로.
❌ 문제 있음 → `.claude/skills/kit-converter/references/conversion-rules.md` 보정 후 재시도.

### Step 2: Skills 일괄 (25개)

```bash
/kit-sync --type skill
```

**변환 규칙** (`conversion-rules.md` § Skill 변환):
1. `src/claude/{domain}/skills/{id}/SKILL.md` 읽기
2. 내용 그대로 `src/codex/{domain}/skills/{id}/SKILL.md`에 복사
3. "Codex 참고 사항" 섹션 추가
4. `references/` 디렉토리 있으면 함께 복사
5. `pairing-registry`에 paired 등록

**일괄 검증**:

```bash
/kit-validate --type skill --target codex
```

### Step 3: RO Agents (2개 추가)

```bash
/kit-sync --name dev-code-reviewer
/kit-sync --name plan-reviewer
```

(dev-architect는 Step 1에서 완료)

### Step 4: 단순 Commands (25개)

```bash
/kit-sync --type command    # review 6개는 자동으로 마커 삽입
```

**변환 규칙** (`conversion-rules.md` § Command 변환):
1. YAML frontmatter 제거
2. `# /{id}` → `# {id} — Codex Entry Flow`
3. 섹션 매핑 (Usage → Invocation, Parameters, Workflow, Output)
4. 슬래시 자기 참조 제거 (`/{id}` → `{id}`)
5. "Codex 참고 사항" 섹션 추가
6. 복합(3+ Phase) → `<!-- REVIEW NEEDED: complex command -->` 마커

### Step 5: Hooks (7개)

```bash
/kit-sync --type hook
```

**주의**: `output-secret-filter`(이미 paired) + `session-wrap-suggest`(paired-fallback)는 자동 스킵.

**변환 규칙** (`conversion-rules.md` § Hook 변환):
1. exception-registry → strategy=paired-fallback이면 스킵
2. HOOK_PORTABILITY → compatible=false면 스킵
3. JS 복사 + Codex 등록 주석 추가
4. hooks 디렉토리에 package.json 확인

### Step 6: Review 항목 (15개)

자동 전환 후 `<!-- REVIEW NEEDED -->` 마커가 삽입된 파일을 수동 검토합니다.

**도메인별 실행**:

```bash
/kit-sync --domain dev     # Write agents + complex commands
/kit-sync --domain plan    # Write agents
```

**Review 체크리스트** (각 파일에 대해):

- [ ] Write/Edit 도구 권한이 Codex subagent 모델에 적합한가
- [ ] 복합 Phase 구조가 Codex Entry Flow로 자연스럽게 변환됐는가
- [ ] Claude 전용 도구 참조(`Bash(git:*)` 등)가 Codex 호환 표현으로 변환됐는가
- [ ] `<!-- REVIEW NEEDED -->` 마커의 사유를 확인하고 해결했는가

검토 완료 후 마커 제거:

```bash
# 수동으로 각 파일에서 <!-- REVIEW NEEDED: ... --> 라인 삭제
# 그 후 commit
```

### Step 7: 최종 검증

```bash
# Audit
node scripts/audit-pairing.js     # C7: 0 FAIL 확인
node scripts/audit-drift.js       # C10: 0 FAIL 확인

# 자동 리포트
node scripts/generate-sync-report.js > docs/codex-sync/sync-report-post-conversion.md

# 전체 현황
/kit-list --target both --pairing

# 기대 결과
# pairing-registry entries: 76 (1 기존 + 75 신규)
# src/codex/ 파일: ~78개
```

---

## 참조 파일

| 파일 | 용도 |
|------|------|
| `.claude/skills/kit-converter/references/conversion-rules.md` | 타입별 변환 규칙 SSOT |
| `.claude/skills/kit-converter/references/agent-section-mapping.md` | Agent XML → heading 매핑 |
| `src/exception-registry.json` | 9 exception entries (8 resolved + 1 active) |
| `src/claude/_meta/codex-portability.json` | 16 entries portability manifest |
| `src/pairing-registry.json` | 페어링 결과 추적 (전환 후 76 entries 예상) |
| `scripts/audit-pairing.js` | C7 pairing 일관성 + S2/S3/S4 감지 |
| `scripts/audit-drift.js` | C10 drift detection |
| `scripts/generate-sync-report.js` | sync-report 자동 생성 |
| `docs/codex-sync/sync-report-2026-04-15.md` | 시작점 스냅샷 (히스토리컬) |

---

## 커밋 가이드

```bash
# Step 1 (파일럿)
git add src/codex/dev/agents/dev-architect.md src/pairing-registry.json
git commit -m "feat(kit-sync): 파일럿 — dev-architect Codex sibling 변환"

# Step 2 (skills)
git add src/codex/*/skills/ src/pairing-registry.json
git commit -m "feat(kit-sync): skills 25개 일괄 Codex 전환"

# Step 3 (RO agents)
git add src/codex/*/agents/ src/pairing-registry.json
git commit -m "feat(kit-sync): RO agents 2개 Codex 전환"

# Step 4 (commands)
git add src/codex/*/commands/ src/pairing-registry.json
git commit -m "feat(kit-sync): 단순 commands 25개 Codex 전환"

# Step 5 (hooks)
git add src/codex/*/hooks/ src/pairing-registry.json
git commit -m "feat(kit-sync): hooks 7개 Codex 전환"

# Step 6 (review 항목 — 도메인별)
git add src/codex/dev/ src/pairing-registry.json
git commit -m "feat(kit-sync): dev review 항목 (Write agents + complex commands) Codex 전환"

git add src/codex/plan/ src/pairing-registry.json
git commit -m "feat(kit-sync): plan review 항목 (Write agents) Codex 전환"

# Step 7 (최종 리포트)
git add docs/codex-sync/sync-report-post-conversion.md
git commit -m "docs(kit-sync): 전환 완료 sync-report 자동 생성"
```

---

## 문제 해결

### "변환 규칙이 맞지 않다"

```bash
# conversion-rules.md 확인
cat .claude/skills/kit-converter/references/conversion-rules.md

# agent 매핑 확인
cat .claude/skills/kit-converter/references/agent-section-mapping.md
```

### "pairing-registry에 등록 안 됐다"

```bash
# 수동 등록
node -e "
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('src/pairing-registry.json','utf8'));
d.entries.push({
  identity:'컴포넌트이름',type:'타입',domain:'도메인',status:'paired',
  reason:null,
  claude:'src/claude/도메인/타입/파일',
  codex:'src/codex/도메인/타입/파일',
  createdAt:new Date().toISOString()
});
fs.writeFileSync('src/pairing-registry.json',JSON.stringify(d,null,2)+'\n');
"
```

### "hook이 스킵됐다"

```bash
# HOOK_PORTABILITY 확인
node -e "console.log(require('./scripts/codex-hook-compat').isCodexCompatible('파일명.js'))"

# portability 상세
node -e "console.log(JSON.stringify(require('./scripts/codex-hook-compat').getPortability('파일명.js'),null,2))"
```

### "audit FAIL이 났다"

```bash
# 상세 보기
node scripts/audit-pairing.js --json
node scripts/audit-drift.js --json
```

---

## 전체 소요 시간 예상

| Step | 예상 시간 | 비고 |
|------|----------|------|
| Step 0 사전 확인 | 2분 | 스크립트 실행 |
| Step 1 파일럿 | 5분 | 1개 agent 전환 + 검증 |
| Step 2 Skills | 10분 | 25개 일괄 |
| Step 3 RO Agents | 3분 | 2개 |
| Step 4 Commands | 10분 | 25개 일괄 |
| Step 5 Hooks | 3분 | 7개 |
| Step 6 Review | 20분 | 15개 수동 검토 |
| Step 7 검증 | 5분 | audit + report |
| **합계** | **~60분** | |
