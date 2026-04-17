# Recommended Hybrid Model

> `claude-kit`에 가장 적합한 Codex 호환 구조는 Option A, B, C를 역할별로 분리해 결합하는 하이브리드 모델이다.

---

## 1. 권장 구조

| 층 | 채택 옵션 | 역할 |
|----|-----------|------|
| Authoring | Option A | asset author가 타깃 지원과 emit 계약을 선언 |
| Installer core | Option B | catalog 기반 normalize/validate/emit 구조 |
| Quality gate | Option C | warn/strict 정책과 parity report |

이 조합이 좋은 이유는 각 옵션이 해결하는 문제가 겹치지 않기 때문이다.

- Option A는 “누가 책임을 지는가”를 해결한다.
- Option B는 “설치기가 어떻게 구조화되는가”를 해결한다.
- Option C는 “회귀를 어떻게 막는가”를 해결한다.

---

## 2. 제안 계약

### Asset author

- 새 자산을 추가할 때 sidecar metadata를 함께 작성한다.
- Codex에서 partial 또는 none이면 이유를 함께 적는다.
- hook와 rule은 추가 필수 필드를 채운다.

### Installer

- manifest를 읽어 catalog를 만들고 validate한다.
- target adapter는 catalog만 읽고 출력한다.
- report를 metadata 파일에 남긴다.

### CI / Review

- metadata 누락과 codex 선언 불일치를 실패 처리한다.
- `warn`은 소비자 설치 UX를 유지하고, `strict`는 저장소 건강을 보장한다.

---

## 3. 추천 메타데이터 기본값

| 자산 유형 | 기본 targets | Codex 기본 처리 |
|-----------|--------------|-----------------|
| agent | `["claude", "codex"]` | `copy` |
| command | `["claude", "codex"]` | `copy` |
| skill | `["claude", "codex"]` | `copy-dir` |
| hook | 명시 필수 | `hook-json` 또는 `none` |
| rule | 명시 필수 | `agents-summary` 또는 `none` |
| template | 명시 필수 | `generate` |

핵심은 “hook, rule, template는 절대 암묵 처리하지 않는다”는 원칙이다.

---

## 4. 왜 이 모델이 적합한가

현재 `claude-kit`는 이미 멀티타깃 emitter를 가지고 있다. 따라서 완전히 새로운 시스템이 필요한 것은 아니다. 필요한 것은 아래 두 가지를 명시적으로 만드는 일이다.

- 자산별 Codex 처리 계약
- 그 계약을 검증하는 저장소 품질 게이트

하이브리드 모델은 현재 구조를 폐기하지 않으면서도, 다음 릴리스부터 새 자산 추가가 자동으로 규율을 따르게 만든다.

---

## 5. 기대 효과

- 새 기능이 들어와도 Codex 처리 방식이 빠지지 않는다.
- README, architecture, installer의 계약을 같은 metadata에서 설명할 수 있다.
- 향후 rules 자동 요약, copied asset 내부 참조 변환, MCP 지원 같은 v2 작업도 같은 구조 위에서 확장할 수 있다.

---

## 6. 비권장 대안

- setup.js 하드코딩만 계속 늘리기
- hook 예외 리스트만 확장하기
- 문서만 보강하고 검증은 추가하지 않기

이 세 가지는 모두 단기 대응은 가능하지만, 새 자산이 늘어날수록 drift cost가 커진다.
