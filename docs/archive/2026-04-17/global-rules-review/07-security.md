# 07. security.md 비교 문서

> 원본: `_archive/2026-04-10-originals/security.md`
> 변경 강도: **LOW-MEDIUM**

---

## 현재 내용 요약

보안 가이드라인 파일로 4개 섹션으로 구성:

1. **Mandatory Security Checks** -- 커밋 전 8항목 체크리스트 (줄 3-14)
2. **Secret Management** -- TypeScript 코드 예시 (줄 16-27)
3. **Security Response Protocol** -- 보안 이슈 대응 5단계 (줄 29-36)
4. **Remote Session Security** -- 원격 세션 보안 5항목 (줄 38-47)

총 47줄, 약 300 토큰.

---

## 발견된 문제

| # | 위치 | 문제 유형 | 설명 |
|---|------|-----------|------|
| 1 | Secret Management | 언어 종속 | TypeScript 코드 블록 + `process.env.OPENAI_API_KEY` -- Node.js 전용 |
| 2 | Security Response Protocol | 조직 종속 | `Use **security-reviewer** agent` -- 특정 에이전트 이름 하드코딩 |

---

## 제안 변경 사항

### 변경 1: Secret Management -- 다중 언어 패턴

| 항목 | 내용 |
|------|------|
| **Before** | ````typescript` / `// NEVER: Hardcoded secrets` / `const apiKey = "sk-proj-xxxxx"` / `// ALWAYS: Environment variables` / `const apiKey = process.env.OPENAI_API_KEY` / `if (!apiKey) {` / `  throw new Error('OPENAI_API_KEY not configured')` / `}` / ` ``` `` |
| **After** | `시크릿을 코드에 직접 작성하지 않는다.` / `환경변수 (process.env, os.environ, System.getenv 등)를 사용한다.` / `미설정 시 즉시 에러를 발생시킨다.` / ` ` / ````text` / `# NEVER` / `api_key = "sk-proj-xxxxx"` / ` ` / `# ALWAYS` / `api_key = ENV["API_KEY"]  # 언어별 환경변수 접근 방식 사용` / `if not api_key: raise Error("API_KEY not configured")` / ` ``` `` |
| **사유** | TypeScript 전용 코드 -> 언어 무관 의사코드 + 다중 언어 환경변수 힌트로 전환 |

### 변경 2: Security Response Protocol -- 에이전트 참조 범용화

| 항목 | 내용 |
|------|------|
| **Before** | `If security issue found:` / `1. STOP immediately` / `2. Use **security-reviewer** agent` / `3. Fix CRITICAL issues before continuing` / `4. Rotate any exposed secrets` / `5. Review entire codebase for similar issues` |
| **After** | `If security issue found:` / `1. STOP immediately` / `2. 보안 리뷰 수행 (프로젝트에 보안 리뷰 에이전트가 있으면 활용)` / `3. Fix CRITICAL issues before continuing` / `4. Rotate any exposed secrets` / `5. Review entire codebase for similar issues` |
| **사유** | 특정 에이전트 이름 제거 -> 범용 행위 기술 + 선택적 에이전트 활용 메모 |

### 유지 항목

| 섹션 | 사유 |
|------|------|
| Mandatory Security Checks | 완전 범용. 언어/프레임워크 무관 8항목 체크리스트 |
| Remote Session Security | 완전 범용. Claude Code 원격 세션 보안 수칙 |
| Security Response Protocol (구조) | 5단계 절차 자체는 범용. 에이전트 참조만 수정 |

---

## 변경 후 내용 요약

4개 섹션 구조 유지. Secret Management에서 TypeScript 전용 코드 블록을 언어 무관 의사코드와 다중 언어 환경변수 힌트로 교체. Security Response Protocol에서 특정 에이전트 이름을 범용 표현으로 전환. Mandatory Security Checks와 Remote Session Security는 변경 없이 원문 유지.

---

## 토큰 영향

| 항목 | Before | After | 변동 |
|------|:------:|:-----:|:----:|
| 추정 토큰 | ~300 | ~310 | **+3%** |
| 변경 줄 수 | - | ~10줄 | - |

토큰이 소폭 증가하나 이는 다중 언어 힌트 추가에 의한 것. 파일 크기가 원래 작으므로 절대량 영향은 미미. **범용성 개선이 주목적**이며, 보안 규칙의 본질은 온전히 보존.
