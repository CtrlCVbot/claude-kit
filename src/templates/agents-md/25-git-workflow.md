## Git 워크플로우 (요약)

커밋 메시지는 Conventional Commits 형식을 사용합니다. 접두사(`<type>:`)는 `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci` 중 하나를 영문으로 쓰고, 설명과 본문은 한글로 작성합니다.

원자적 커밋 원칙상 한 커밋은 하나의 논리적 변경만 포함합니다. 기능 1개와 해당 테스트, 버그 수정과 회귀 테스트, 단일 범위 리팩토링은 함께 묶을 수 있지만, 무관한 포매팅 정리나 여러 버그 수정을 한 커밋에 섞지 않습니다.

커밋 전에는 프로젝트 루트에서 `git config --local user.name`과 `git config --local user.email`을 확인합니다. 로컬 설정이 있으면 그대로 사용하고, 사용자 확인 없이 `git config --global` 값을 바꾸거나 로컬에 덮어쓰지 않습니다.

커밋 메시지에는 기본적으로 `Co-Authored-By: Claude ...` 서명을 넣지 않습니다. 사용자가 명시적으로 유지 요청했거나 팀 정책상 AI 기여 추적이 필요한 경우에만 유지합니다.

PR을 만들 때는 최신 커밋만 보지 말고 전체 커밋 이력과 `git diff [base-branch]...HEAD`를 확인한 뒤, 변경 요약·테스트 계획·TODO를 함께 작성합니다.

> 상세 규칙은 `.claude/rules/git-workflow-v2.md` 참조.
