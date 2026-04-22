# IMP-AGENT-005 — dev-implementer 에이전트 신설

> **결론**: dev 도메인의 **구현 주체 에이전트 부재**를 해소한다. 현재 dev-verify-agent(검증·자동수정 3회 한도)만 존재하고 기능 구현은 메인 세션이 직접 담당하는 비대칭 구조다. TDD Red-Green 루프를 자율 실행할 수 있는 `dev-implementer`를 신설한다.

**축**: Pipeline Completeness
**우선순위**: P1
**공수**: L
**Breaking Change**: **yes** (BC-2.3.1-02, 신규 에이전트 — 기존 호출자 없어 영향 제한적)
**타깃 릴리스**: v2.3.1
**근거**: `analysis/agent-catalog-snapshot.md` 공백 #1
**관련 에이전트**: `dev-implementer` (신설), `dev-verify-agent`, `dev-code-reviewer`

---

## 1. 문제 (카탈로그 기반)

dev 도메인 6개 에이전트 분포:

| 역할 | 에이전트 수 | 에이전트 |
|---|:---:|---|
| 설계 | 1 | dev-architect |
| 리뷰 | 3 | dev-code-reviewer, dev-database-reviewer, dev-security-reviewer |
| 검증·자동수정 | 1 | dev-verify-agent (3회 한도) |
| 문서 | 1 | dev-doc-updater |
| **구현** | **0** | **부재** |

**결과**: `/dev-run` 커맨드의 TDD Red-Green 루프가 **메인 세션 직접 구현**에 의존. 메인 컨텍스트 포화 위험 + 병렬 TASK 처리 불가.

## 2. "신설 금지" 원칙 완화 근거

원본 `20260422-pipeline-kit-improvements` decision-log §5는 "재사용 2회 이상 관찰 후 신설" 원칙 채택. 본 IMP는 완화 조건 충족:

1. **기존 에이전트로 대체 불가**: 6개 에이전트 중 write-capable 4개(verify/doc/db/security)는 모두 **특수 목적** 전용. 범용 구현자 부재
2. **재사용 관찰 이미 충분**: `/dev-run` 루프가 T-01~T-99 TASK마다 구현 단계 반복 → 실질 재사용 N회
3. **ROI 명확**: 메인 세션 컨텍스트 부담 완화 + 병렬 TASK 처리 가능

## 3. 에이전트 명세

### 3.1 frontmatter

```yaml
name: dev-implementer
description: Feature Package TASK의 TDD Red-Green 루프를 자율 실행하는 구현 에이전트. /dev-run 커맨드가 TASK별로 호출.
tools: [Read, Grep, Glob, Write, Edit, Bash]
model: opus
memory: project
color: green
```

### 3.2 핵심 역할

```markdown
## Responsibilities

1. **TASK 컨텍스트 파악**: feature-overview.md, feature-package의 해당 TASK 섹션, 관련 REQ-ID 확인
2. **Red (실패 테스트 작성)**: 테스트 파일 생성 + 실행 → 실패 확인
3. **Green (최소 구현)**: 테스트 통과하는 최소 코드 작성
4. **Refactor**: 코드 품질 개선 (중복 제거, 네이밍, 가독성)
5. **TASK 완료 보고**: 생성·수정 파일 목록 + 테스트 결과 반환

## Constraints

- TDD 가드(`dev-tdd-guard.js`) 차단 규칙 준수 — 테스트 없는 Edit/Write 금지
- 영향 범위: Feature Package 소유 경로만 (dev-feature-scope-guard.js 준수)
- **설계 판단 금지** — 의문 시 dev-architect 호출 요청 (호출은 메인 세션이 수행)
- **리뷰 금지** — 완료 후 dev-code-reviewer 호출은 메인 세션 담당
- **DB 스키마 변경 금지** — dev-database-reviewer 담당 영역
```

### 3.3 체인 관계

```
사용자 /dev-run → 메인 세션 → [TASK 분할]
                              ↓
                         dev-implementer (TASK 1)  ─┐
                         dev-implementer (TASK 2)  │ 병렬 가능
                         dev-implementer (TASK 3)  ─┘
                              ↓
                         dev-verify-agent (통합 검증)
                              ↓
                         dev-code-reviewer (리뷰)
```

**주의**: 병렬 실행은 TASK 간 파일 충돌 없음이 사전 확인된 경우에만. 기본은 순차.

---

## 4. `/dev-run` 커맨드 변경

### 현재 (v2.3.0)

```
/dev-run {package} → 메인 세션이 TASK별로 직접 구현 + verify 호출
```

### 변경 후 (v2.3.1)

```
/dev-run {package} → TASK별로 dev-implementer 호출 → 완료 후 dev-verify-agent
```

**하위호환**: `--inline` 플래그 제공 시 기존 동작(메인 세션 직접 구현) 유지. 기본값은 에이전트 위임.

---

## 5. Read 캐시 재인증 고려

dev-implementer는 write-capable이므로 **메인 세션에서 같은 파일 이어서 Edit 시 Read 재호출 필요** (`verification.md` "Agent Edit Race" 룰 준수).

frontmatter에 명시:
```yaml
notes: write-capable. 메인 세션은 후속 Edit 전 Read 재호출 필수 (verification.md 참조)
```

---

## 6. 구현 범위

**신규 파일**:
- `src/claude/dev/agents/dev-implementer.md`
- `src/claude/dev/_schemas/implementer-output.schema.json` (TASK 완료 보고 포맷)
- `.claude/rules/dev-implementation-agent.md` — 체인 관계 SSOT

**수정 파일**:
- `src/claude/dev/commands/dev-run.md` — 에이전트 위임 로직 + `--inline` 플래그
- `.claude/rules/verification.md` — write-capable 에이전트 목록에 추가

**테스트**:
- TASK 1개 구현 시 TDD 가드 통과 확인
- `--inline` 플래그로 구 동작 호환성 확인
- 메인 세션이 에이전트 완료 후 Edit 시 Read 재호출 경고 확인

---

## 7. ROI

- **정방향**: 메인 세션 컨텍스트 부담 -30% 추정 (TASK 구현 로직이 에이전트로 이관)
- **부가**: 병렬 TASK 처리 옵션 확보
- **비용**: 에이전트 신설 1건 + `/dev-run` 플래그 1개 + SSOT 룰 1건
- **측정**: IMP-AGENT-009 텔레메트리로 호출 빈도·성공률 추적

---

## 8. 수락 기준

- [ ] dev-implementer.md frontmatter + 본문 작성 (200~400 단어)
- [ ] TDD 가드 + Feature scope 가드 준수 명시
- [ ] `/dev-run` 커맨드에 에이전트 위임 + `--inline` 플래그
- [ ] verification.md write-capable 목록 업데이트
- [ ] Read 캐시 재인증 룰 참조

---

## 9. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — 카탈로그 공백 #1 해소, 신설 금지 원칙 완화 |
