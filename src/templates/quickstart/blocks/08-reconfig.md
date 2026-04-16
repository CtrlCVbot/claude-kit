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

패키지 기준 공식 갱신 경로는 `pnpm update claude-kit` 이후 `postinstall`로 실행되는 `scripts/setup.js`다. `kit-sync`는 이 저장소의 공식 로컬 npm script가 아니므로, 별도 wrapper나 글로벌 alias를 쓰더라도 최종 설치 상태는 `CLAUDE-KIT-QUICKSTART.md`와 `.claude-kit-meta.json`으로 확인한다.

업데이트 시 기존 `AGENTS.md`는 보존된다. Codex 타겟이 활성화되어 있는데 `AGENTS.md`가 없으면 템플릿으로 복구한다.
