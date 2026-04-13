# 10. 추가 제안사항

> 01~09 개별 파일 분석에서 도출된 구조적 개선 제안을 종합한다.
> 이 문서의 제안은 Phase 2(구조 개편) 이후 검토 대상이다.

---

## 1. 신규 파일 제안 (3건)

### A. `mcp-preferences.md` (선택적 규칙)

**출처**: interaction.md에서 분리 대상인 "context7 MCP Usage" 및 "Web Fetching" 섹션

**문제**: interaction.md의 핵심은 "가정 명시", "유추 설명", "결론 우선", "불확실성 인정"이다. MCP 도구 선호도는 상호작용 원칙이 아니라 도구 설정에 해당하며, 해당 MCP 서버가 없는 환경에서는 무의미한 규칙이 된다.

**제안 내용 개요**:

```markdown
---
# 조건부 적용: 해당 MCP 서버가 구성된 경우에만 적용
---

# MCP 도구 선호도

> 이 규칙은 해당 MCP 서버가 settings.json에 구성된 경우에만 적용된다.
> MCP 서버가 없는 환경에서는 이 파일을 무시한다.

## 문서 조회 (context7)
- 라이브러리/프레임워크 사용 전 context7 MCP로 최신 문서 확인
- 예외: 동일 세션에서 이미 조회함, 기본 언어 문법, 프로젝트 내부 코드

## 웹 콘텐츠 가져오기
- 우선순위: jina-reader > fetch MCP > (직접 fetch 금지)
- 근거: 세션 프리즈 방지, 토큰 효율
```

**기대 효과**:
- interaction.md에서 ~35줄(~220 토큰) 제거
- MCP 미구성 환경에서 불필요한 규칙 로딩 방지
- 관심사 분리: 상호작용 원칙 vs 도구 설정

---

### B. `language-patterns.md` (선택적 규칙)

**출처**: coding-style.md, security.md, golden-principles.md에 흩어진 언어별 코드 예시

**문제**: 전역 규칙의 코드 예시가 JavaScript/TypeScript에 편중되어 있다. Python, Go 프로젝트에서는 `zod`, `process.env`, spread operator 예시가 적용 불가하다. 원칙은 범용이지만 예시가 특정 언어에 종속되어 있다.

**제안 구조**:

```markdown
---
paths:
  - "**/*.js"
  - "**/*.ts"
  - "**/*.jsx"
  - "**/*.tsx"
  - "**/*.py"
  - "**/*.go"
---

# 언어별 패턴 가이드

## 불변성 (Immutability)

### JavaScript/TypeScript
- spread operator: `{ ...obj, key: value }`

### Python
- dataclass(frozen=True), NamedTuple

### Go
- 값 복사 후 수정, 새 struct 반환

## 에러 처리

### JavaScript/TypeScript
- try/catch + Error 클래스

### Python
- try/except + 커스텀 Exception

### Go
- error 반환 값, errors.Wrap

## 입력 검증

### JavaScript/TypeScript
- zod 스키마

### Python
- pydantic BaseModel

### Go
- validator 태그, 커스텀 검증 함수
```

**기대 효과**:
- coding-style.md에서 코드 블록 4개(~30줄, ~200 토큰) 제거 가능
- 언어별 paths: frontmatter로 관련 프로젝트에만 로딩
- 비코드 작업 시 불필요한 코드 예시 토큰 절약

---

### C. `agent-catalog-template.md` (프로젝트 레벨 템플릿)

**출처**: agents-v2.md의 34개 에이전트 카탈로그

**문제**: 전역 규칙에 34개 에이전트 목록이 있으면 모든 프로젝트에서 로딩된다. 에이전트 구성은 프로젝트마다 다를 수 있고, 전역에서 특정 에이전트를 강제하면 유연성이 떨어진다.

**제안**: 전역 규칙이 아닌 **프로젝트별 `.claude/rules/`**에 배치할 템플릿 제공

```markdown
# Agent Catalog (프로젝트 템플릿)

> 이 파일을 프로젝트의 .claude/rules/agent-catalog.md로 복사하여 사용한다.

## 라우팅 테이블

| 도메인 | 에이전트 | 설명 |
|--------|---------|------|
| 코드 리뷰 | (프로젝트에 맞게 설정) | |
| 테스트 | (프로젝트에 맞게 설정) | |
| 보안 | (프로젝트에 맞게 설정) | |
| ... | ... | ... |

## 사용 규칙
- /agent-router 스킬이 이 테이블을 참조하여 자동 라우팅
- 단순 질문은 라우팅하지 않고 직접 답변
```

**기대 효과**:
- agents-v2.md에서 카탈로그 섹션(~15줄, ~200 토큰) 제거
- 프로젝트별 에이전트 구성 자유도 확보
- 전역 규칙의 조직 종속성 완전 제거

---

## 2. 구조 재편 아이디어

### paths: frontmatter 확대 적용

현재 `paths:` frontmatter를 사용하는 파일은 **testing.md 1개뿐**이다. 이를 다른 파일에도 적용하면 비관련 작업 시 불필요한 로딩을 줄일 수 있다.

| 파일 | 현재 | 제안 paths: 패턴 | 기대 절감 |
|------|------|-------------------|-----------|
| testing.md | paths: 있음 | (유지) | -- |
| security.md | paths: 없음 | `**/*.env*`, `**/auth/**`, `**/middleware/**` | ~120 토큰 |
| coding-style.md | paths: 없음 | `**/*.{js,ts,jsx,tsx,py,go,rs}` | ~250 토큰 |
| git-workflow-v2.md | paths: 없음 | `.github/**`, `**/.gitignore` | ~200 토큰 |

**주의**: paths: frontmatter는 해당 패턴의 파일을 편집할 때만 규칙이 로딩된다. 코드를 작성하지 않는 대화에서 coding-style.md가 불필요하게 로딩되는 것을 방지한다.

### 항상 로드 vs 조건부 로드 분류

| 분류 | 파일 | 근거 |
|------|------|------|
| **항상 로드** | golden-principles.md | 모든 작업의 기본 원칙 |
| | verification.md | 모든 완료 주장에 적용 |
| | interaction.md (핵심만) | 모든 대화에 적용 |
| **조건부 로드** | testing.md | 테스트 파일 편집 시 |
| | security.md | 보안 관련 파일 편집 시 |
| | coding-style.md | 코드 파일 편집 시 |
| | git-workflow-v2.md | Git 작업 시 |
| | date-calculation.md | 날짜 계산 요청 시 |
| | mcp-preferences.md | MCP 구성 환경에서만 |

**핵심 원리**: 항상 로드 파일은 3개 이하로 제한하여 기본 토큰 소모를 최소화한다.

---

## 3. 컨텍스트 윈도우 최적화

### 현재 상태

| 항목 | 값 |
|------|:--:|
| 전역 규칙 파일 수 | 9개 |
| 항상 로드 | 9개 전부 (testing.md 제외) |
| 세션당 토큰 소모 | ~4,800 토큰 |

### Phase 2 완료 후 (개별 파일 개선)

| 항목 | 값 | 변화 |
|------|:--:|:----:|
| 전역 규칙 파일 수 | 9개 | -- |
| 중복 제거 절감 | ~1,200 토큰 | |
| 조직 종속 제거 | ~800 토큰 | |
| **세션당 토큰 소모** | **~2,800 토큰** | **42% 절감** |

### paths: frontmatter 확대 적용 후 (비코드 작업 시)

| 항목 | 값 | 변화 |
|------|:--:|:----:|
| 항상 로드 파일 | 3개 (golden-principles, verification, interaction 핵심) |
| 조건부 로드 파일 | 6~7개 (paths: 매칭 시에만) |
| **비코드 작업 토큰** | **~1,500 토큰** | **69% 절감** |

### 최적화 우선순위 권장

| 순위 | 작업 | 예상 절감 | 난이도 |
|:----:|------|:---------:|:------:|
| 1 | Phase 2: 개별 파일 SSOT 중복 제거 + 조직 종속 제거 | 42% | LOW |
| 2 | paths: frontmatter를 coding-style.md, security.md에 추가 | 추가 15% | LOW |
| 3 | interaction.md에서 MCP 섹션을 mcp-preferences.md로 분리 | 추가 5% | LOW |
| 4 | language-patterns.md 분리 (coding-style.md 코드 블록 이동) | 추가 4% | MEDIUM |
| 5 | agent-catalog-template.md를 프로젝트 레벨로 이동 | 추가 4% | MEDIUM |

**권장**: 1번(Phase 2)이 가장 큰 절감을 가져오므로 우선 완료한다. 2~3번은 Phase 2와 병행 가능하며, 4~5번은 Phase 3에서 검토한다.
