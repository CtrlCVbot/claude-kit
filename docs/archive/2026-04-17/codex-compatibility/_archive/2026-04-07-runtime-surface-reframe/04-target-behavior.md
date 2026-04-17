# 타깃 동작

> Codex가 실제로 읽는 runtime surface와, 각 source asset이 그 surface로 어떻게 반영되는지를 설명하는 문서.

---

## 1. 기본 관점

Codex 호환은 단순한 경로 복사가 아니다. 이 문서에서는 source asset이 아래 runtime surface로 어떻게 재표현되는지를 설명한다.

- `plugins/claude-kit/`
- `.agents/plugins/marketplace.json`
- `AGENTS.md`
- `.codex/hooks.json`
- `.claude-kit-meta.json`

핵심은 `plugins/claude-kit/`가 모든 항목의 보편적인 실행 루트가 아니라, plugin package root라는 점이다.

---

## 2. Codex runtime surface

| surface | 의미 |
|------|------|
| `plugins/claude-kit/` | repo-local plugin package root |
| `.agents/plugins/marketplace.json` | Codex가 플러그인을 등록할 수 있게 하는 registration surface |
| `AGENTS.md` | rule과 운영 지침을 전달하는 instruction surface |
| `.codex/hooks.json` | hook 실행을 위한 runtime config |
| `.claude-kit-meta.json` | compatibility report를 포함하는 설치 결과 메타데이터 |

이 문서에서는 `plugins/claude-kit/hooks.json`을 런타임 위치처럼 설명하지 않는다. hooks의 공식 런타임 기준은 `.codex/hooks.json`이다.

---

## 3. plugin packaging

`plugins/claude-kit/`는 Codex용 repo-local plugin package root다. 여기에는 plugin manifest와 번들된 skill 자산, 그리고 필요한 생성 산출물이 포함될 수 있다.

다만 이 경로는 아래 의미로만 사용한다.

- plugin package를 구성하는 파일들의 배치 위치
- plugin-bundled skill의 source bundle 위치
- compatibility report와 생성물의 연관 루트

이 경로를 아래처럼 설명하면 안 된다.

- `agents`가 Codex에서 바로 실행되는 네이티브 위치
- `commands`가 slash command로 바로 노출되는 위치
- `hooks.json`의 공식 런타임 탐색 위치

---

## 4. runtime config

### `AGENTS.md`

`AGENTS.md`는 Codex의 instruction surface다. `rule` 자산은 이 문서에 summary 형태로 반영된다. 즉 rules는 standalone file copy가 아니라 운영 문맥으로 변환된다.

### `.codex/hooks.json`

Codex hook의 공식 런타임 기준 위치는 `.codex/hooks.json`이다. hook 자산은 plugin 내부 선언만으로 충분하지 않으며, phase와 matcher를 가진 runtime config로 변환되어야 한다.

2026년 4월 7일 기준 공식 Codex 문서에서 hooks는 experimental이며 Windows 지원이 비활성화 상태다. 따라서 hook 호환은 설계 대상이지만, 모든 환경에서 기본 활성화된다고 설명하지 않는다.

### `.claude-kit-meta.json`

이 문서는 emitted/skipped/warnings를 남기는 compatibility report의 기반 메타데이터다. Codex 미지원이나 조건부 지원은 이 보고에 reason과 함께 남겨야 한다.

---

## 5. transformed assets

| source asset | Codex 처리 | 설명 |
|------|------|------|
| `skill` | 지원 | plugin-bundled skill로 배치해 직접 사용 가능한 기본 호환 단위로 설명 |
| `rule` | 변환 | `AGENTS.md` summary로 반영 |
| `hook` | 조건부 지원 | `.codex/hooks.json`과 실행 경로로 변환 |
| `template` | 내부 생성물 | plugin/report/context 산출물을 생성 |
| `agent` | 변환 필요 | `skill` 또는 `AGENTS.md` 기반 표현으로 바꾸거나 `skip` |
| `command` | 변환 필요 | `skill` 기반 entry로 바꾸거나 `skip` |

이 표는 Codex 호환의 핵심 기준을 고정한다.

- `skill`만 direct-use 가능 단위다.
- `rule`과 `hook`는 각각 다른 runtime surface로 변환된다.
- `agent`와 `command`는 direct copy 대상이 아니다.

---

## 6. unsupported / native gap

현재 문서에서 명시적으로 드러내야 하는 native gap은 아래와 같다.

- Codex plugin 구조는 `agent`와 `command`를 Claude와 동일한 방식으로 직접 실행한다고 가정하지 않는다.
- custom slash command는 현재 Codex 호환 목표가 아니다.
- hooks는 공식적으로 `.codex/hooks.json` 기준이며, Windows에서는 제한이 있다.

따라서 Codex target behavior의 핵심은 "Claude 구조를 Codex 경로에 맞춰 복사"가 아니라, "공식 Codex runtime surface로 안전하게 재매핑"하는 것이다.

---

## 7. dual-target 설명 원칙

문서에서는 dual-target을 아래처럼 설명한다.

- 입력 자산은 공유된다.
- Claude와 Codex는 같은 catalog를 읽는다.
- 차이는 경로 자체보다 runtime surface와 transform 방식에 있다.

이 원칙 때문에 parity 검증도 "완전히 같은 출력"이 아니라 "설명 가능한 surface 차이만 허용"으로 설명되어야 한다.
