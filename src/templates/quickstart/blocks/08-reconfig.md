## `plan` 활성화 방법

현재 설치에 `plan`이 없다면 `profile.json`을 아래처럼 바꾼 뒤, 의존성 설치를 다시 실행해 `postinstall`을 재실행한다.

```json
{{RECONFIG_PROFILE_JSON}}
```

예시 명령:

```bash
pnpm install
```

다른 패키지 매니저를 쓰는 프로젝트라면 현재 사용 중인 설치 명령을 다시 실행하면 된다.
