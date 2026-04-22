# Agent Catalog Snapshot — 2026-04-22

> **결론**: claude-kit v2.2.1 기준 총 **19개 에이전트** (dev 6 / plan 9 / copy 4). write-capable 13개, read-only 6개. frontmatter 표준 100% 준수. 도메인별 역할 분포에서 구조적 공백 5건 식별.

**조사 시점**: 2026-04-22
**조사 대상**: `src/claude/{dev,plan,copy}/agents/*.md`
**목적**: kit-agent-improvements 패키지 IMP 설계를 위한 현황 기준선

---

## 1. 도메인별 분포

| 도메인 | 에이전트 수 | write-capable | read-only |
|---|:---:|:---:|:---:|
| dev | 6 | 4 | 2 |
| plan | 9 | 8 | 1 |
| copy | 4 | 1 | 3 |
| **합계** | **19** | **13** | **6** |

---

## 2. dev 도메인 (6개)

| 파일 | 이름 | tools | write? | 역할 |
|---|---|---|:---:|---|
| `dev-architect.md` | dev-architect | Read, Grep, Glob | no | 설계·진단. file:line 참조 필수. Edit 금지 |
| `dev-code-reviewer.md` | dev-code-reviewer | Read, Grep, Glob, Bash | no | 스펙 준수 + 품질 2단계 리뷰. CRITICAL/HIGH/MEDIUM/LOW 등급 |
| `dev-database-reviewer.md` | dev-database-reviewer | Read, Write, Edit, Bash, Grep, Glob | yes | 스키마·쿼리·RLS 리뷰 및 마이그레이션 작성 |
| `dev-security-reviewer.md` | dev-security-reviewer | Read, Write, Edit, Bash, Grep, Glob | yes | OWASP Top 10 + 시크릿 스캔 + fix 작성 |
| `dev-verify-agent.md` | dev-verify-agent | Read, Write, Edit, Bash, Grep, Glob | yes | 타입→린트→빌드→테스트 순차 검증. 자동 수정 3회 한도 |
| `dev-doc-updater.md` | dev-doc-updater | Read, Write, Edit, Bash, Grep, Glob | yes | 코드맵·문서 자동 갱신. edit-coordinates 스키마 소비 |

**관찰**: 리뷰·검증 4개 + 구현 전용 0개 + 문서 1개 + 설계 1개. **구현 에이전트가 `dev-verify-agent` 하나뿐** (수정 3회 한도 자동 복구 역할에 한정). 새 기능 구현은 메인 세션이 직접 담당.

---

## 3. plan 도메인 (9개)

| 파일 | 이름 | tools | write? | 역할 |
|---|---|---|:---:|---|
| `plan-idea-collector.md` | plan-idea-collector | Read, Grep, Glob, Write, Edit, Bash | yes | IDEA-YYYYMMDD-NNN 파일 등록 + backlog.md 관리 |
| `plan-idea-screener.md` | plan-idea-screener | Read, Grep, Glob, Write, Edit, Bash | yes | RICE/5axis 스코어링 + Go/Hold/Kill 제안 + 파일 이동 |
| `plan-draft-writer.md` | plan-draft-writer | Read, Grep, Glob, Write, Edit | yes | Lite/Standard + 시나리오 A/B/C + copy/dev 3중 판정 |
| `plan-prd-writer.md` | plan-prd-writer | Read, Grep, Glob, Write, Edit | yes | 10섹션 PRD 작성. REQ-ID 채번 |
| `plan-reviewer.md` | plan-reviewer | Read, Grep, Glob | no | PCC 5종 + 4축 품질 평가. PASS/WARN/FAIL |
| `plan-wireframe-designer.md` | plan-wireframe-designer | Read, Grep, Glob, Write, Edit | yes | ASCII + Mermaid 와이어프레임 생성 |
| `plan-design-writer.md` | plan-design-writer | Read, Grep, Glob, Write, Edit | yes | Claude Design 2단계 프롬프트 자동 생성 |
| `plan-stitch-integrator.md` | plan-stitch-integrator | Read, Grep, Glob, Write, Edit | yes | PRD + Wireframe + Stitch 통합. REQ→TASK 매핑 |
| `plan-bridge-writer.md` | plan-bridge-writer | Read, Grep, Glob, Write, Edit | yes | 기획→개발 브리지 4종 문서 생성 + 경로 안내 |

**관찰**: 파이프라인 전 구간 커버 (수집→스크리닝→기획→PRD→와이어프레임→설계→통합→브리지→리뷰). plan 도메인이 **claude-kit 전체 에이전트의 47%**를 차지.

---

## 4. copy 도메인 (4개)

| 파일 | 이름 | tools | write? | 역할 |
|---|---|---|:---:|---|
| `copy-reference-baseline.md` | copy-reference-baseline | Read, Glob, Grep, Bash, Write | yes | evidence/ 캡처 매니페스트 + 페어링 매트릭스 |
| `copy-fidelity.md` | copy-fidelity | Read, Glob, Grep, Bash | no | Visual gap 분석. VF-* ID (P0/P1/P2) |
| `copy-interaction-fidelity.md` | copy-interaction-fidelity | Read, Glob, Grep, Bash | no | Interaction gap 분석. IF-* ID |
| `copy-qa-reviewer.md` | copy-qa-reviewer | Read, Glob, Grep, Bash | no | 6 카테고리 QA 게이트 (build/variant/screenshot/interactive/document/acceptance) |

**관찰**: 4개 중 **3개가 read-only**. copy 도메인에 **구현 주체 에이전트가 사실상 부재** (reference-baseline은 evidence 관리 한정). 갭 분석 → 직접 구현은 메인 세션 또는 dev 에이전트가 담당하는 비대칭 구조.

---

## 5. frontmatter 표준

19개 에이전트 전부 동일 필드 세트 준수:

```yaml
name: {kebab-case}
description: {한국어 설명}
tools: [list]
model: opus
memory: project
color: {semantic}
```

**관찰**:
- `model: opus` 100% 통일 — 도메인별 차등화 없음
- `memory: project` 100% 통일 — 세션별·역할별 차등화 없음
- 팀 소유권(`team_owner`), 의존성(`dependencies`), 릴리스 단계(`release_stage`) 등 확장 필드 부재 → IMP-AGENT-008 근거

---

## 6. tools 일관성 패턴

| 패턴 | 구성 | 대상 | 비고 |
|---|---|---|---|
| Read-only 기본 | `Read, Grep, Glob` | dev-architect, plan-reviewer | 순수 분석 |
| Read-only + Bash | `Read, Grep, Glob, Bash` | dev-code-reviewer, copy-* (3개) | 빌드/FS 조회 포함 |
| Write-capable 기본 | `Read, Grep, Glob, Write, Edit` | plan-* 창작 에이전트 (6개) | 문서 생성 중심 |
| Full | `Read, Grep, Glob, Write, Edit, Bash` | dev-* write 에이전트 (4개), plan-idea-*, copy-reference-baseline | SQL·스크립트 포함 |

**이상 없음**. 역할에 맞는 권한 부여.

---

## 7. 에이전트 간 의존 체인

### plan 파이프라인 (순차)
```
idea-collector → idea-screener → draft-writer → prd-writer
                                                    ↓
                                    wireframe-designer → stitch-integrator
                                                              ↓
                                                        bridge-writer
```

### copy 파이프라인 (순차 + 분기)
```
copy-reference-baseline → copy-fidelity ↘
                        → copy-interaction-fidelity → copy-qa-reviewer
```

### dev 파이프라인 (병렬/선택)
```
dev-architect ↘
              → dev-verify-agent
dev-code-reviewer ↗
dev-database-reviewer ↗
dev-security-reviewer ↗
dev-doc-updater (독립)
```

### cross-domain (불명확)
```
bridge-writer → [???] → dev-feature 또는 copy-reference-refresh
```

**관찰**: **cross-domain 핸드오프가 문서화되지 않음**. bridge-writer 출력물을 dev/copy 도메인이 어떻게 소비하는지 명시 부재 → IMP-AGENT-007 근거.

---

## 8. 구조적 공백 5건 (IMP 후보)

| # | 공백 | 영향 | 대응 IMP |
|---|---|---|---|
| 1 | dev 도메인 구현 에이전트 부족 (verify 하나뿐) | 새 기능 구현 시 메인 세션 부담 가중 | IMP-AGENT-005 |
| 2 | copy 도메인 구현 에이전트 부재 (4개 중 3개 read-only) | 갭 분석 후 구현 주체 모호 | IMP-AGENT-006 |
| 3 | cross-domain 핸드오프 문서화 부재 | bridge → dev/copy 경로 추적 불가 | IMP-AGENT-007 |
| 4 | frontmatter 확장성 제한 (team/dep/release 표현 불가) | 에이전트 생명주기 관리 어려움 | IMP-AGENT-008 |
| 5 | 에이전트 호출 텔레메트리 부재 (IMP-KIT-024 stub) | 사용 빈도·실패율·개선 기회 불투명 | IMP-AGENT-009 |

---

## 9. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — v2.2.1 기준 19개 에이전트 카탈로그. 공백 5건 식별 |
