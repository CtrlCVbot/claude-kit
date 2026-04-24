## 하드코딩된 비밀값 금지

API key, token, password, private key, webhook secret 같은 비밀값은 source file, fixture, example, generated output에 직접 넣지 않습니다.

- 비밀값은 환경 변수나 secret manager에서 읽습니다.
- 예제 코드는 placeholder만 사용합니다.
- 커밋 이력에 비밀값이 들어갔다면 삭제만 하지 말고 교체·폐기까지 고려합니다.

> 관련 규칙과 예시는 `.claude/rules/security.md`의 `Mandatory Security Checks` 및 `Secret Management` 참조.
