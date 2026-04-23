# 02. Problem Analysis — guide 문서 문제점 분석

> **결론**: `codex-plugin-source-guide.md`는 claude-kit을 Codex에 배포하는 **운영 실전 경험**의 기록이다. 명시된 문제는 P0 3건, P1 4건, P2 2건으로 분해된다. 모두 "소스 → 런타임 도달" 단계에서 발생하며, claude-kit 자체에 **배포 파이프라인이 없어** 사용자가 수동으로 8단계를 반복 수행해야 하는 구조적 공백에서 비롯된다.

**입력**: `C:\Program Files (user)\build-frame\docs\claude-kit\codex-plugin-source-guide.md` (이하 `guide:NN`)

---

## 1. 문제 인벤토리

### P0 (Blocking — 배포 자체 불가능)

| ID | 문제 | 근거 | 현상 |
|----|------|------|------|
| **PB-1** | repo marketplace + personal marketplace 플러그인 리스트 노출 실패 | `guide:11`, `guide:82` | Codex 앱에서 공식 discovery 경로가 동작하지 않음 |
| **PB-2** | 실사용 경로가 **캐시 복사 수동 절차**로만 존재 | `guide:12-13`, `guide:40-53` | 8단계 명령어 조작이 매 업데이트마다 필요 |
| **PB-3** | claude-kit 내부에 **플러그인 번들 구조 부재** | 현재 프로젝트 확인 (2026-04-22): `plugins/` 디렉터리 없음 | guide가 전제하는 `plugins/claude-kit/.codex-plugin/plugin.json` 경로 자체가 없음 |

### P1 (Should Fix — 운영 품질 저하)

| ID | 문제 | 근거 | 현상 |
|----|------|------|------|
| **PB-4** | 버전 디렉터리 관리가 사람의 주의력에 의존 | `guide:47-48`, `guide:67` | 덮어쓰기 실수 시 기존 버전 손실 |
| **PB-5** | 백업 위치가 권장사항(관행)일 뿐 강제되지 않음 | `guide:46`, `guide:68` | `~/.codex/tmp/plugin-cache-backups/` 미사용 사례 가능 |
| **PB-6** | `config.toml` 엔트리 상태를 수동으로 매번 확인 | `guide:25-30`, `guide:51` | 오타·누락 시 플러그인 비활성 상태로 앱 로드 |
| **PB-7** | 앱 재시작 필요 — 자동화된 신호 없음 | `guide:52` | 사용자가 재시작 시점을 놓치면 신규 버전 반영 안됨 |

### P2 (Nice to Have — 개선 여지)

| ID | 문제 | 근거 | 현상 |
|----|------|------|------|
| **PB-8** | `turner-copy` 같은 **레거시 source namespace 흔적** | `guide:83` | 과거 `turner-copy` → 현재 `local-kit` 전환. 이행 중 혼동 여지 |
| **PB-9** | 향후 marketplace 복귀 시 마이그레이션 경로 미정의 | `guide:84` | 공식 discovery 안정화되면 캐시 모드 → marketplace 모드 전환 방법 없음 |

---

## 2. 근본 원인 분석

### 2.1 구조적 공백 (PB-3 → PB-1/PB-2의 파급)

claude-kit이 `src/claude` + `src/codex`로 이원화되어 있으나, **Codex 런타임이 실제로 읽는 경로**(`~/.codex/plugins/cache/local-kit/claude-kit/<version>`)로 연결되는 단계가 없다.

```
현재 상태:
  src/claude/  →  (kit-sync)  →  src/codex/  →  [공백]  →  Codex 런타임
                                              ↑
                                      사람이 수동 복사 8단계
```

### 2.2 운영 원칙의 암묵성 (PB-4, PB-5, PB-6)

guide §운영 원칙(62-68)에 "새 버전 디렉터리 우선", "백업 후 보관" 등이 기술되어 있으나, 이는 **휴먼 프로토콜**이다. 코드로 강제되지 않으면 실수가 누적된다.

### 2.3 상태 관측 부재 (PB-6, PB-7)

- `config.toml` 엔트리 상태
- 캐시 디렉터리의 `plugin.json` 버전
- 활성화된 source namespace

이 세 가지가 명령 하나로 조회되지 않으면, 사용자는 문제 발생 시 **어느 단계에서 실패했는지** 진단하기 어렵다.

### 2.4 공식 discovery 불안정 (PB-1, PB-9)

이는 **claude-kit 범위 밖**의 업스트림 문제. claude-kit은 "캐시 모드를 현재 권장 경로로 지정"하되, **marketplace 복귀 가능성을 설계에 반영**해야 한다 (guide §84).

---

## 3. 문제-현행 기능 영향 예비 매핑

(상세 영향은 `03-feature-impact.md`에서 다룸)

| 문제 | 영향 기능 | 현행 대응 | 공백 |
|------|---------|---------|------|
| PB-1/PB-2 | `/kit-sync`, `/kit-convert` | `src/codex/` 생성까지 | 런타임 캐시로의 배포 단계 없음 |
| PB-3 | 프로젝트 구조 전반 | `src/claude/`, `src/codex/` | `plugins/claude-kit/` 번들 구조 없음 |
| PB-4/PB-5 | `scripts/setup.js` | Claude `.claude/` 설치만 | 버전 디렉터리·백업 로직 없음 |
| PB-6 | `/kit-audit` | C1~C11(제안 중) | `config.toml` 검증 카테고리 없음 |
| PB-7 | (없음) | — | 재시작 안내/자동화 수단 없음 |
| PB-8 | (경고 수준) | — | 레거시 source namespace 마이그레이션 문서 없음 |
| PB-9 | (미래 설계) | — | 전환 시나리오 미정의 |

---

## 4. 우선순위 게이트

### Phase-1 게이트 (본 패키지 진입 조건)

- PB-1, PB-2, PB-3 문제 인정 + claude-kit 스코프 내 해결 가능 항목 분리
- PB-9 업스트림 변동 모니터링 트리거 정의

### Phase-2 게이트 (구현 착수 조건)

- `.codex-plugin/plugin.json` 공식 스키마 snapshot 확보
- 크로스 플랫폼 경로 해석 방안 결정 (`os.homedir()` + `CODEX_HOME` 오버라이드)

### Phase-3 게이트 (배포 커맨드 릴리스 조건)

- PB-4/PB-5/PB-6 **자동화 성공** (`/kit-audit C12` PASS)
- guide §롤백 방법 시나리오 3건 테스트 통과

---

## 5. 해석상 모호성 (추가 조사 필요)

| 항목 | 모호 지점 | 조치 |
|------|---------|------|
| `.codex-plugin/plugin.json` 스키마 필드 집합 | `guide:44`에서 `name`, `version`, `interface.category`만 언급. 다른 필드 존재 여부 미확인 | Codex 공식 문서 확인 or 실제 설치된 플러그인 샘플 참조 |
| `hooks.json` 포맷 | `guide:59`에 언급되나 스키마는 claude-kit `scripts/codex-hook-compat.js`가 생성하는 포맷과 일치 여부 미확인 | `build-frame/plugins/claude-kit/hooks.json` 샘플 대조 |
| 버전 디렉터리 네이밍 규칙 | SemVer? ISO 타임스탬프? `guide:34-36` 예시는 `2.3.0` | SemVer 채택, prerelease 규칙 추가 필요 시 제안 |
| 캐시 백업 보존 주기 | `guide:68` "즉시 삭제하지 말고 백업 후 보관" — 기간 미명시 | 기본 90일, 환경변수 오버라이드 제안 |

---

## 6. 다음 단계 연결

- 현행 기능 영향 상세 → `03-feature-impact.md`
- 구체 제안(수정 vs 신규) → `04-proposal.md`
- 실행 TASK → `05-tasks/T-PLUGIN-NN.md`
