# 12. Followups — 별도 세션 권장 작업

> **본 codex 재정리 이후 권장되는 후속 작업 목록.** 우선순위 + 예상 난이도 + 세션 설계 힌트.

## 우선순위 분류

| 우선순위 | 설명 | 항목 수 |
|---|------|:---:|
| **P1 High** | 기능 동작에 영향을 주거나 설계 모순 해결 | 3 |
| **P2 Medium** | 품질 개선 + known issue 해결 | 3 |
| **P3 Low** | 안전망 정리 + 문서 개선 | 3 |

## P1 High — 기능 영향 + 설계 모순

### F1-1. REVIEW NEEDED 29개 수동 검토

**배경**: Phase 2 재생성된 파일 중 29개에 `<!-- REVIEW NEEDED: ... -->` marker 가 붙어 있다. Codex runtime 에서 실제 동작하는지 확인 필요.

**세션 설계**:
- 입력: [07 REVIEW NEEDED Catalog](07-review-needed-catalog.md)
- 범위: 29 파일 × 항목별 PASS/FAIL/DEFER 판정
- 권장 접근:
  1. dev 도메인 write-capable 5개 (익숙한 에이전트라 빠른 PASS 가능)
  2. plan 도메인 write-capable 8개
  3. copy 도메인 16개 (scenario 분기 로직 실험 필요)

**예상 소요**: 큰 세션 (여러 에이전트 실제 호출 + 결과 비교)

**산출물**:
- 각 파일의 판정 결과
- FAIL 항목 → exception-registry 추가 등록
- PASS 항목 → marker 제거 + pairing-registry 갱신
- DEFER 항목 → 추가 조사 이슈 생성

### F1-2. EX-009 설계 결정

**배경**: security-no-hardcoded-secrets 의 exception strategy (paired-direct) 와 pairing status (codex-skip) 모순. Phase 3 C7 FAIL 1건 근거.

**결정 필요**:
- 옵션 A: Codex rules 파일 실제 생성 + pairing `paired` 전환
- 옵션 B: exception strategy 를 paired-fallback 으로 변경 + AGENTS.md.template 에 섹션 추가
- 옵션 C: 현 상태 유지 (임시방편)

**세션 설계**:
- Codex rules 공식 포맷 조사 (exec/approval policy 문법)
- 옵션 A 택하면: regex 기반 pre-commit 자동 감지 구현 포함
- 옵션 B 택하면: F2-1 (AGENTS.md.template 섹션 추가) 에 합류

**예상 소요**: 중간 세션 (조사 + 설계 + 구현)

### F1-3. Dev Commands Dead Reference 5건 수정

**배경**: [10 Known Issues](10-known-issues.md) Issue 8-12. `> 참조:` 블록이 존재하지 않는 skill 경로를 가리킴.

**세션 설계**:
- 수정 대상: `src/claude/dev/commands/` 5개 파일
- 각 파일의 참조 경로에 `dev-` 접두사 추가
- 수정 후 `/kit-sync --resync --domain dev --type command` 으로 codex 반영

**수정 항목**:
```
dev-refactor.md:     refactoring → dev-refactoring
dev-review.md:       layered-architecture → dev-layered-architecture
                     frontend-patterns → dev-frontend-patterns
dev-test-verify.md:  tdd-workflow → dev-tdd-workflow
dev-verify-fe.md:    testing-frontend → dev-testing-frontend
```

**예상 소요**: 짧은 세션 (단순 텍스트 치환 + resync)

## P2 Medium — 품질 개선

### F2-1. AGENTS.md.template 에 Rule Fallback 섹션 추가

**배경**: EX-003 ~ EX-008 의 paired-fallback (agents-guidance) 6건이 실제 artifact 미작성. [10 Known Issues](10-known-issues.md) Issue 2-7.

**세션 설계**:
- `src/templates/AGENTS.md.template` 에 6개 h3 섹션 추가:
  - `### coding-style`, `### date-calculation`, `### golden-principles`, `### interaction`, `### security`, `### verification`
- 각 섹션은 해당 Claude rule 파일의 핵심 원칙 압축 (5-10 라인)
- EX-009 옵션 B 선택 시 `### security-no-hardcoded-secrets` 도 포함 → 총 7개

**주의**: AGENTS.md 는 프로젝트 초기화 시 Codex runtime 에 주입되므로 크기 관리 필요 (컨텍스트 낭비 방지).

**예상 소요**: 중간 세션 (6~7 섹션 요약 + template 편집)

### F2-2. Codex Runtime 실제 검증 프레임워크

**배경**: REVIEW NEEDED 29개의 판정 기준이 수동 추측에 의존. 체계적 검증 프레임워크 필요.

**세션 설계**:
- Codex 공식 문서 기반 capability matrix 작성:
  - subagent tools 권한 모델
  - slash command 파싱 규칙
  - skill 디렉토리 인식
  - hooks PreToolUse / PostToolUse / Stop 이벤트 매칭
- 자동화된 validate 스크립트 작성 (Codex runtime 에서 각 자산 호출 시도)
- 결과를 pairing-registry 에 `codexValidated` 필드로 기록

**예상 소요**: 큰 세션 (프레임워크 설계 + 구현)

### F2-3. `/plan-epic` 커맨드 Codex 전환 검토

**배경**: v2.4.0 신규 커맨드 `src/claude/plan/commands/plan-epic.md` 는 존재하지만 pairing-registry 에 entry 없음. Codex 쪽 대응 필요 여부 미결.

**세션 설계**:
- plan-epic 의 종속성 분석 (`src/claude/plan/skills/plan-epic-workflow/` 등)
- Codex 전환 필요성 판단
- 필요 시 pairing-registry entry 추가 + 변환 실행

**예상 소요**: 짧은 세션

## P3 Low — 정리 + 문서

### F3-1. Backup 안전망 정리

**배경**: 2~4주 후 본 재정리 작업이 안정적임이 확인되면 backup 자산 삭제 가능.

**실행 명령** (Phase 4 완료 후 시점에 적합):

```bash
git branch -D backup/codex-before-resync-20260424
rm /c/Users/user/.claude/plans/docs-restructure-stash-*.patch
rm /c/Users/user/.claude/plans/docs-restructure-stash-*.tar
rm /c/Users/user/.claude/plans/docs-restructure-stash-*-README.md
```

**트리거 조건**:
- Phase 2 재생성 결과에 추가 이슈 없음
- 사용자 docs 재구성 작업이 main 에 merge 완료
- 최소 2주 경과

### F3-2. `content drift` 자동 감지 루틴

**배경**: 이번 작업에서 `lastSyncedAt` / `contentHash` baseline 을 리셋했다. 이후 Claude source 수정 시 drift 를 자동 감지하는 정기 루틴 필요.

**세션 설계**:
- `/kit-audit --content` 를 주기적 (예: 주 1회) 실행하는 CI 작업 또는 agent
- drift 감지 시 알림 + `/kit-sync --resync --name {identity}` 제안
- 결과 보고서 자동 생성 (이 리포트와 유사 형식)

**예상 소요**: 중간 세션

### F3-3. 본 리포트 패키지 자동 생성 도구

**배경**: 2026-04-24 리포트는 수동으로 작성되었다. 유사 작업 발생 시 자동 리포트 생성 도구가 있으면 편리.

**세션 설계**:
- `scripts/generate-resync-report.js` 작성
- 입력: pairing-registry + exception-registry + portability + 변환 타임스탬프
- 출력: 15파일 리포트 패키지 (docs/reports/codex-resync-YYYYMMDD/)
- 템플릿 기반 접근

**예상 소요**: 큰 세션

## 완료 체크리스트

```
P1 High
[ ] F1-1 REVIEW NEEDED 29개 수동 검토
[ ] F1-2 EX-009 설계 결정 + 실행
[ ] F1-3 Dev Commands Dead Reference 5건 수정

P2 Medium
[ ] F2-1 AGENTS.md.template 에 Rule Fallback 섹션 추가
[ ] F2-2 Codex Runtime 실제 검증 프레임워크
[ ] F2-3 /plan-epic 커맨드 Codex 전환 검토

P3 Low
[ ] F3-1 Backup 안전망 정리
[ ] F3-2 Content drift 자동 감지 루틴
[ ] F3-3 본 리포트 자동 생성 도구
```

## 의사결정 흐름

```
F1-1 REVIEW → F1-2 EX-009 → F2-1 AGENTS.md → F3-1 정리
      ↓          ↓              ↓
    F2-2 검증 프레임워크 (F1-1 / F1-2 과 병렬 가능)
      ↓
    F3-2 drift 감지 → F3-3 리포트 자동화
```

F1 3건은 순서 무관하게 병렬 진행 가능. F2-1 은 F1-2 결정에 영향받음. F3 은 전부 완료 후.

## 참조

- [07 REVIEW NEEDED Catalog](07-review-needed-catalog.md) — F1-1 의 입력
- [08 Exception Handling](08-exception-handling.md) — F1-2 배경
- [10 Known Issues](10-known-issues.md) — F1-3, F2-1 배경
- [11 Rollback & Recovery](11-rollback-and-recovery.md) — F3-1 안전망 정리 조건
