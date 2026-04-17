# 기능 계약

> Codex 호환을 위해 source asset이 어떤 runtime surface로 매핑되어야 하는지 정의하는 계약 문서.

---

## 1. 자산 계약

`claude-kit`의 Codex 호환은 installable asset 단위로 설명하되, 결과는 항상 Codex runtime surface 기준으로 표현해야 한다. 여기서 source asset은 `agent`, `command`, `skill`, `hook`, `rule`, `template`를 뜻한다.

모든 asset은 아래 질문에 답할 수 있어야 한다.

- 이 자산은 어떤 종류인가
- 어느 domain에 속하는가
- Codex에서 직접 사용 가능한가, 변환이 필요한가, 아니면 skip되는가
- 최종적으로 어떤 runtime surface에 반영되는가
- 부분 지원 또는 미지원이라면 이유는 무엇인가

---

## 2. sidecar metadata 계약

문서 기준 필수 필드는 아래로 고정한다.

| 필드 | 의미 |
|------|------|
| `kind` | 자산 종류 |
| `domain` | `core`, `dev`, `plan` 소속 |
| `targets` | 설치 대상 목록 |
| `codex.emitMode` | Codex의 어떤 surface로 반영할지 |
| `codex.supportLevel` | `full`, `partial`, `none` |
| `codex.skipReason` | 부분 지원 또는 미지원 시 이유 |
| `hooks.phase` | hook 이벤트 구간 |
| `hooks.matcher` | hook matcher |
| `docs.summary` | 사람 중심 전달용 짧은 설명 |

이 필드는 "어디로 복사할까"보다 "어떤 surface를 생성할까"를 설명하기 위해 존재한다.

---

## 3. source kind -> Codex target surface

| source kind | 기본 Codex 처리 | target surface |
|------|------|------|
| `skill` | 직접 지원 | plugin-bundled skill |
| `rule` | 변환 | `AGENTS.md` summary |
| `hook` | 조건부 변환 | `.codex/hooks.json` + 실행 스크립트 참조 |
| `template` | 생성 | plugin, report, context 산출물 |
| `agent` | 변환 또는 `skip` | `skill` 또는 `AGENTS.md` |
| `command` | 변환 또는 `skip` | `skill` 또는 별도 문서화된 entry |

여기서 중요한 기준은 아래와 같다.

- `skill`만 Codex에서 직접 사용 가능한 기본 호환 단위다.
- `agent`와 `command`는 기본값이 `path copy`가 아니다.
- `hook`는 plugin 내부 선언만으로 충분하지 않으며, 런타임 hook config로 변환되어야 한다.
- `rule`은 standalone file copy가 아니라 instruction surface로 요약된다.

---

## 4. `codex.emitMode` 문서 계약

문서상 `codex.emitMode`는 surface 기준으로 아래 용어를 사용한다.

| 값 | 의미 |
|------|------|
| `plugin-skill` | skill을 plugin bundle 안에 배치해 직접 사용 가능하게 함 |
| `agents-md` | 규칙 또는 지침을 `AGENTS.md`에 반영 |
| `codex-hook-config` | hook 자산을 `.codex/hooks.json`과 실행 경로로 변환 |
| `generate` | plugin/report/context 산출물을 생성 |
| `skip` | Codex 대상 설치에서 제외 |

기존 `copy`, `copy-dir`, `hook-json` 같은 표현은 deprecated로 본다. 문서에서는 더 이상 기본 용어로 쓰지 않는다.

또한 `custom slash command`는 현재 Codex 호환 목표가 아니다. `command` 자산은 slash command가 아니라 변환 후보 또는 `skip` 후보로 설명한다.

---

## 5. compatibility report 계약

Codex 호환은 설치 결과를 보고할 수 있어야 한다. 따라서 compatibility report는 아래를 기록하는 계약으로 설명한다.

- 어떤 자산이 어떤 surface로 emitted됐는지
- 어떤 자산이 transform 없이 direct-use 가능한지
- 어떤 자산이 skipped됐는지
- skip 또는 partial 지원의 이유가 무엇인지
- 현재 정책이 `warn`인지 `strict`인지

이 보고는 단순 로그가 아니라, 저장소 품질 게이트와 소비자 설치 UX를 연결하는 운영 계약이다.

---

## 6. 문서에서 유지할 메시지

- 모든 installable asset은 Codex 처리 방식을 설명해야 한다.
- Codex 미지원은 숨기지 않고 reason과 함께 기록한다.
- `skill` 외의 자산은 direct copy보다 transform 여부를 먼저 판단한다.
- `warn`은 소비자 설치 UX, `strict`는 저장소 품질 게이트용이다.
