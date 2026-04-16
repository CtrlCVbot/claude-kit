<!-- kit-convert generated: 2026-04-16 -->
<!-- REVIEW NEEDED: complex command -->
# dev-security-review — Codex Entry Flow

## Overview

CWE 기반 보안 검토 + STRIDE 위협 모델링 (v6 - effort:max 강제). 모든 분석은 최대 깊이로 수행되며, shallow scan은 허용하지 않는다.

## Invocation

```
dev-security-review [파일/디렉토리] [--auto] [--quick] [--cwe] [--stride] [--deps] [--report markdown|json]
```

## Parameters

- `[경로]`: 특정 파일 또는 디렉토리 지정
- `--auto`: git diff 기반 변경 파일만 스캔 (민감 패턴 감지 시 자동 트리거)
- `--quick`: 변경 파일 대상 빠른 스캔 (CWE 상위 10개만)
- `--cwe`: CWE Top 25 전체 매핑 상세 분석
- `--stride`: STRIDE 위협 모델링 추가 실행
- `--deps`: 의존성 취약점 검사
- `--report [형식]`: markdown 또는 json 리포트 파일 생성

## Workflow

### 0단계: effort:max 강제

```
⚠️ Security Review는 항상 effort:max로 실행됩니다.
이는 보안 품질을 위해 타협할 수 없는 설정입니다.
모든 분석은 최대 깊이로 수행되며, 축약하지 않습니다.
```

---

### 1단계: 스캔 대상 식별

**스캔 범위 결정:**

```bash
# --auto: git diff 변경 파일만
git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx|py|go|rs|java)$'
git diff --name-only | grep -E '\.(ts|tsx|js|jsx|py|go|rs|java)$'

# --quick: 변경 파일 빠른 스캔
git diff --name-only HEAD~1 | grep -E '\.(ts|tsx|js|jsx|py|go|rs|java)$'

# 기본 (플래그 없음): 전체 소스 파일
find src/ lib/ app/ -type f -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx'
```

**Auto-trigger 패턴:**

| 패턴 | 위험 수준 |
|------|-----------|
| `auth` | Critical |
| `payment` | Critical |
| `session` | High |
| `token` | High |
| `password` | Critical |
| `secret` | Critical |
| `crypto` | High |
| `jwt` | High |
| `admin` | High |
| `upload` | Medium |
| `download` | Medium |
| `redirect` | Medium |

---

### 2단계: CWE Top 25 매핑

모든 소스 파일에 대해 CWE Top 25 기반 패턴 매칭을 수행한다.

주요 CWE 검사:
- CWE-79: XSS (innerHTML, dangerouslySetInnerHTML)
- CWE-89: SQL Injection (문자열 보간 SQL)
- CWE-78: OS Command Injection (exec, spawn)
- CWE-22: Path Traversal (../  in user paths)
- CWE-352: CSRF (POST without CSRF token)
- CWE-287: Improper Authentication
- CWE-862: Missing Authorization
- CWE-798: Hardcoded Credentials
- CWE-200: Sensitive Info Exposure
- CWE-502: Unsafe Deserialization
- CWE-20: Improper Input Validation
- CWE-269: Improper Privilege Management
- CWE-434: Unrestricted Upload
- CWE-918: SSRF
- CWE-611: XXE
- CWE-327: Broken Crypto Algorithm

---

### 3단계: STRIDE 위협 모델링 (--stride)

`--stride` 플래그가 있을 때 실행한다.

| STRIDE | Category | 검토 항목 |
|--------|----------|----------|
| S | Spoofing | 인증 토큰 위조, 세션 하이재킹 |
| T | Tampering | 입력값 검증 부재, SQL Injection |
| R | Repudiation | 감사 로그 부재 |
| I | Info Disclosure | 에러 스택트레이스 노출, 민감 데이터 로깅 |
| D | Denial of Service | Rate limiting 미적용, 무제한 파일 업로드 |
| E | Elevation of Privilege | 수평/수직 권한 상승, IDOR |

---

### 4단계: 보안 Fixable 자동 수정

자동 수정 가능한 취약점은 사용자 승인 후 즉시 적용한다.

| CWE | 취약 패턴 | 자동 수정 | 신뢰도 |
|-----|-----------|-----------|--------|
| CWE-89 | String concat SQL | Parameterized query | High |
| CWE-798 | Hardcoded secret literal | process.env.VAR_NAME | High |
| CWE-79 | innerHTML = userInput | textContent = userInput | High |
| CWE-200 | console.log(secret) | 라인 제거 또는 마스킹 | High |
| CWE-327 | md5(, sha1( | crypto.createHash('sha256') | Med |

---

### 5단계: 의존성 취약점 (--deps)

프로젝트 루트에서 패키지 매니저를 자동 감지하여 취약점을 검사한다.

- Node.js: `npm audit --json`
- Python: `pip-audit --format json`
- Rust: `cargo audit --json`
- Go: `govulncheck ./...`

---

### 6단계: 출력

```
════════════════════════════════════════════════════════════════
  Security Review v6 (effort: max, CWE Top 25)
════════════════════════════════════════════════════════════════

스캔 대상: N개 파일 | 모드: [auto|quick|full]
분석 깊이: effort:max | CWE 매핑: [10|25]개
STRIDE: [실행됨|미실행] | 의존성: [실행됨|미실행]

발견된 이슈: N개
  Critical: X개 | High: Y개 | Medium: Z개 | Low: W개
```

**커밋 권고:**
- Critical 이슈: BLOCKED (커밋 전 반드시 수정)
- High 이슈: 수정 강력 권장
- Medium 이슈: 검토 후 수정 권장
- Low 이슈: 선택적 수정

`--report markdown|json` 시 해당 형식으로 리포트 파일 저장.

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/dev/commands/dev-security-review.md
