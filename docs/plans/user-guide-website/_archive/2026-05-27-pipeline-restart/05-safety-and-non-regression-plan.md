# Safety And Non-Regression Plan

## 목적

Next.js 문서 사이트 작업이 기존 `claude-kit` 기능을 깨뜨리지 않도록 보호 경계와 검증 절차를 정의한다.

이 문서에서 말하는 비회귀(non-regression)는 "웹사이트를 추가해도 기존 command, agent, skill, hook, rule, installer, Claude/Codex 자산 동작이 악화되지 않는다"는 뜻이다.

## 최상위 원칙

| 원칙 | 설명 |
| --- | --- |
| Core first | `claude-kit` 기능이 웹사이트보다 우선 |
| Docs as surface | 웹사이트는 설명 표면이지 runtime source가 아님 |
| No implicit emitter changes | 웹사이트 작업 중 설치기나 emitter를 암묵 수정하지 않음 |
| Preserve HTML | 기존 `docs/user-guide-html`은 전환 완료 전까지 보존 |
| Separate workstream | 웹사이트 변경과 toolkit source 변경을 한 커밋에 섞지 않음 |

## 보호 대상

| 경로 | 보호 이유 | 기본 정책 |
| --- | --- | --- |
| `src/claude/**` | Claude authoring source | 수정 금지 |
| `src/codex/**` | Codex authoring source | 수정 금지 |
| `src/templates/**` | installer/template source | 수정 금지 |
| `scripts/setup.js` | 설치 핵심 흐름 | 수정 금지 |
| `src/pairing-registry.json` | Claude/Codex pairing source | 수정 금지 |
| `src/exception-registry.json` | 예외 정책 source | 수정 금지 |
| `.claude/**` | local Claude runtime/config | 수정 금지 |
| `.agents/**` | local Codex skills/runtime output | 수정 금지 |
| `.codex/**` | local Codex config/runtime output | 수정 금지 |
| `plugins/claude-kit/**` | plugin generated output | 수정 금지 |
| `AGENTS.md` managed section | installed runtime guidance | 수정 금지 |

## 허용 후보

| 경로 | 조건 |
| --- | --- |
| `docs/plans/user-guide-website/**` | 이번 계획 패키지 |
| `docs/user-guide-html/**` | 기존 HTML reference 보강 또는 예시 페이지 추가 |
| `src/app/**` | Next.js 구현 착수 승인 후 |
| `src/components/docs/**` | Next.js 구현 착수 승인 후 |
| `src/lib/docs/**` | Next.js 구현 착수 승인 후 |
| package config | Next.js 구현 착수 승인 후, install 영향 검토 필수 |
| Vercel config | 배포 단계 승인 후 |

## 변경 전 체크

| 체크 | 방법 | 실패 시 조치 |
| --- | --- | --- |
| Dirty tree 확인 | `git status --short` | unrelated 변경과 분리 |
| protected path 확인 | diff 대상 경로 확인 | 작업 중단 후 범위 재조정 |
| package manager 확인 | lockfile/script 확인 | 임의로 도구 변경 금지 |
| HTML 기준 확인 | `docs/user-guide-html` 페이지 목록 확인 | 누락 route 보강 |

## Commit 규칙

웹사이트 작업은 문서, planning 산출물, Next.js 구현, 배포 검증이 섞이기 쉽다. 따라서 커밋은 workstream별로 나누고, 기존 dirty tree의 무관한 변경을 함께 stage하지 않는다.

### 기본 규칙

| 규칙 | 설명 |
| --- | --- |
| 논리 단위 1개 | 한 커밋에는 하나의 목적만 담는다. |
| 관련 경로만 stage | `git add .` 대신 작업 경로를 명시한다. |
| generated/source 분리 | `.plans` 산출물, docs 계획, Next.js source를 한 커밋에 섞지 않는다. |
| core 보호 | `src/claude`, `src/codex`, `scripts/setup.js` 변경이 섞이면 커밋을 멈춘다. |
| 검증 후 커밋 | 문서 링크, build, protected path diff 등 해당 커밋 범위에 맞는 검증을 먼저 실행한다. |
| Conventional Commits | `docs:`, `feat:`, `fix:`, `chore:` 등 접두사를 사용하고 본문은 한글로 작성한다. |

### 권장 커밋 경계

| 순서 | 커밋 예시 | 포함 범위 | 제외 범위 |
| --- | --- | --- | --- |
| 1 | `docs: 사용자 가이드 웹사이트 계획 정리` | `docs/plans/user-guide-website/**` | `.plans`, `src/app` |
| 2 | `docs: 웹사이트 전환 기획 산출물 추가` | `.plans/**` idea/screen/epic/prd 등 | Next.js 구현 |
| 3 | `feat: 문서 사이트 기본 셸 추가` | `src/app`, `src/components/docs`, `src/lib/docs` shell | content migration 전체 |
| 4 | `feat: planning 문서 페이지 마이그레이션` | `/planning` route와 content | Vercel config |
| 5 | `feat: 파이프라인 예시 페이지 추가` | `/examples/*` route | deploy 설정 |
| 6 | `chore: Vercel preview 검증 설정 정리` | Vercel/build 관련 최소 설정 | core installer 변경 |
| 7 | `docs: 웹사이트 반영 결과 문서 동기화` | `docs/guide`, README 등 후속 반영 | 기능 구현 |

### 커밋 전 체크리스트

| 체크 | 명령/방법 |
| --- | --- |
| repo-local identity | `git config --local user.name`, `git config --local user.email` |
| 변경 범위 확인 | `git status --short`, `git diff --stat` |
| stage 대상 확인 | `git diff --name-only --cached` |
| 무관 변경 제외 | 현재 workstream 외 파일이 staged 되었는지 확인 |
| 검증 결과 기록 | 실행한 검증과 실패/보류 이유를 커밋 전 메모 |

## 변경 후 체크

| 체크 | 목적 |
| --- | --- |
| HTML link check | 기존 HTML 문서 링크가 깨지지 않았는지 확인 |
| Next.js build | 구현 후 사이트가 build되는지 확인 |
| route smoke check | 핵심 route가 렌더링되는지 확인 |
| protected path diff | core source/runtime이 변경되지 않았는지 확인 |
| Vercel preview check | 배포 환경에서 navigation과 static asset 확인 |

## Toolkit 비회귀 후보 명령

아래 명령은 구현 단계에서 실제 존재 여부와 현재 script 이름을 먼저 확인한 뒤 실행한다.

| 후보 명령 | 확인 목적 |
| --- | --- |
| `node scripts/setup.js --dry-run` | 설치 흐름 영향 확인 |
| `node scripts/audit-pairing.js` | Claude/Codex pairing 영향 확인 |
| `node scripts/audit-drift.js --content` | generated/source drift 확인 |
| project test/build script | Next.js 추가가 기존 package script를 깨지 않는지 확인 |

## 중단 조건

| 조건 | 대응 |
| --- | --- |
| `src/claude` 또는 `src/codex` 수정 필요 발생 | 웹사이트 작업 중단, 별도 승인 요청 |
| 설치기 수정 필요 발생 | 별도 installer workstream으로 분리 |
| package script 변경이 기존 postinstall에 영향 | 변경 중단, 영향 분석 문서화 |
| Vercel 배포를 위해 secret 필요 | 로컬/문서에 secret 기록 금지 |
| HTML reference 삭제 필요 | 삭제하지 말고 legacy 역할 재정의 후 승인 요청 |

## Review 기준

| 항목 | 기준 |
| --- | --- |
| 기능 영향 | toolkit source/runtime 변경 없음 |
| 문서 품질 | 사용자가 HTML에서 보던 정보가 Next.js에서도 찾기 쉬움 |
| 접근성 | 탭, navigation, heading 구조가 keyboard/screen reader에 불리하지 않음 |
| 배포 안정성 | Vercel Preview에서 build와 route 확인 |
| 운영 안정성 | 웹사이트 변경과 toolkit 기능 변경이 커밋/리뷰에서 분리됨 |

## 1차 결론

웹사이트 구현은 안전하게 할 수 있지만, 전제는 명확해야 한다. Next.js 코드는 문서 표면으로 격리하고, 기존 `claude-kit` 기능 source와 설치 흐름은 별도 승인 없이 변경하지 않는다.
