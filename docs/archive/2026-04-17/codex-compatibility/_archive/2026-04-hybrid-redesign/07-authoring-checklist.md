# Authoring Checklist

> 앞으로 `src/`에 새 자산을 추가할 때 Codex 처리 방식이 빠지지 않도록 하기 위한 작성 체크리스트.

---

## 1. 새 자산 추가 전 원칙

- installable asset은 metadata 없이는 완료로 보지 않는다.
- “Codex도 지원한다”가 기본값이 아니라, “Codex에서 어떻게 처리할지 선언한다”가 기본값이다.
- partial 또는 미지원은 허용되지만, 반드시 이유가 필요하다.

---

## 2. 파일 배치 규칙

| 자산 형태 | 필요한 파일 |
|-----------|-------------|
| agent/command/hook/rule/template 파일 | 본문 파일 + `<name>.asset.json` |
| skill 디렉터리 | `SKILL.md` + `asset.json` |

예시:

```text
src/core/rules/security.md
src/core/rules/security.asset.json

src/dev/skills/dev-workflow/
  SKILL.md
  asset.json
```

---

## 3. metadata 필수 체크

모든 자산:

- `kind`가 맞는가
- `domain`이 맞는가
- `targets`가 선언됐는가
- `codex.emitMode`가 선언됐는가
- `codex.supportLevel`이 선언됐는가
- `docs.summary`가 한 줄로 적혔는가

Codex partial/none 자산:

- `codex.skipReason`이 채워졌는가

hook 자산:

- `hooks.phase`가 있는가
- `hooks.matcher`가 있는가

rule 자산:

- Codex 반영 방식이 `agents-summary`인지 `none`인지 명시했는가

---

## 4. review 체크리스트

- 이 자산은 Codex에서도 path copy만으로 충분한가
- copied asset 내부의 Claude 전용 참조가 위험하지 않은가
- hook라면 실제 Codex `hooks.json`으로 표현 가능한가
- rule이라면 `AGENTS.md` 요약에 어떤 문장을 추가해야 하는가
- target이 `codex`인데 installer 변경이 필요한가

---

## 5. parity 검증 체크리스트

- metadata 없는 installable asset이 없는가
- `targets`와 emitter 동작이 일치하는가
- Codex skipped asset은 모두 reason이 있는가
- generated output 충돌이 없는가
- README/architecture가 새 계약과 모순되지 않는가

---

## 6. 금지 패턴

- setup.js에만 새 예외를 추가하고 metadata는 생략하기
- hook 호환성 이유를 중앙 코드에만 적고 asset에는 남기지 않기
- rule을 추가하고 Codex 반영 방식은 템플릿에 암묵적으로 의존하기
- consumer install이 깨질까 봐 skip을 숨기기

---

## 7. 최소 완료 조건

새 자산이 아래를 만족하면 “Codex 처리 방식까지 포함해 완료”로 본다.

1. 본문 파일이 존재한다.
2. sidecar metadata가 존재한다.
3. Codex 처리 방식 또는 skip reason이 선언된다.
4. parity 검증을 통과한다.
5. 필요한 경우 문서 링크나 요약이 갱신된다.
