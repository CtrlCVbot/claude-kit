# 타입별 변환 규칙

> Claude authoring source → Codex authoring source 변환 규칙

## Skill 변환 (auto)

```
1. src/claude/{domain}/skills/{identity}/SKILL.md 읽기
2. 내용 그대로 src/codex/{domain}/skills/{identity}/SKILL.md에 복사
3. "Codex 참고 사항" 섹션이 없으면 추가:
   ## Codex 참고 사항
   - 이 파일은 authoring source이다.
   - Claude sibling: src/claude/{domain}/skills/{identity}/SKILL.md
4. references/ 디렉토리가 있으면 함께 복사
5. pairing-registry에 paired 등록
```

## Agent 변환 (auto/review)

```
1. src/claude/{domain}/agents/{identity}.md 읽기
2. YAML frontmatter에서 name, description, tools 추출
3. <Agent_Prompt> XML에서 섹션별 내용 추출 (agent-section-mapping.md 참조):
   <Role>              → ## Role
   <Success_Criteria>  → ## Capabilities (병합)
   <Constraints>       → ## Constraints
   <Output_Format>     → ## Output Format
   <Failure_Modes_To_Avoid> → ## Failure Modes
   (나머지 XML 섹션은 관련 헤딩에 병합 또는 추가 섹션)
4. YAML frontmatter 제거 (name, tools, model, memory, color)
5. description → 제목 아래 배치
6. </Agent_Prompt> 뒤 비-XML 내용은 추가 섹션으로 보존
7. "Codex 참고 사항" 섹션 추가 (authoring source 명시)
8. tools에 Write/Edit 포함 시 파일 상단에 <!-- REVIEW NEEDED: write-capable agent --> 마커
9. src/codex/{domain}/agents/{identity}.md에 쓰기
10. pairing-registry에 paired 등록
```

## Command 변환 (auto/review)

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
5. 슬래시 커맨드 자기 참조 /{identity} → {identity} (본문 내)
6. "Codex 참고 사항" 섹션 추가
7. frontmatter + 3개 이상 Phase 시 <!-- REVIEW NEEDED: complex command --> 마커
8. src/codex/{domain}/commands/{identity}.md에 쓰기
9. pairing-registry에 paired 등록
```

## Hook 변환 (auto/skip)

```
1. skip-registry 확인. 등록된 identity면 건너뛰기 (pairing-registry에 codex-skip)
2. src/claude/{domain}/hooks/{identity}.js 읽기
3. JS 내용 그대로 복사
4. JSDoc에 Codex 등록 포맷 주석 추가 (없는 경우):
   * Codex 등록 포맷:
   *   .codex/hooks.json: { type: "command", command: "./hooks/{identity}.js" }
   *
   * Codex hooks 현황 (2026-04 기준):
   *   - hooks는 experimental 기능
   *   - PreToolUse/PostToolUse matcher: Bash만 실질 매칭
   *   - Windows: 현재 비활성화
5. 대상 hooks 디렉토리에 package.json 존재 확인, 없으면 생성
6. src/codex/{domain}/hooks/{identity}.js에 쓰기
7. pairing-registry에 paired 등록
```

## Rule 처리 (skip)

```
1. 변환 파일 생성하지 않음
2. 로그: [skip] {identity}: claude-origin shared (AGENTS.md guidance)
3. pairing-registry에 codex-skip + reason: "claude-origin shared guidance" 등록
```

## 공통 규칙

- 변환 파일 상단에 `<!-- kit-convert generated: {ISO날짜} -->` 추적 주석
- review 난이도 파일에 `<!-- REVIEW NEEDED: {사유} -->` 마커
- 기존 Codex 파일 존재 시 --force 없이 덮어쓰지 않음
- 변환 후 git add 하지 않음 (사용자 커밋)
