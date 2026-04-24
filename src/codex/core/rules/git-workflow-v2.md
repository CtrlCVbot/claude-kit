# Git 워크플로우

## 커밋 메시지 형식

```
<type>: <설명>

<선택적 본문>
```

타입: feat, fix, refactor, docs, test, chore, perf, ci

**언어 규칙**: 접두사(`<type>:`)는 영문 유지. 설명과 본문은 **한글**로 작성한다.

```
# 좋은 예
feat: 사용자 프로필 편집 기능 추가
fix: 로그인 시 토큰 만료 오류 수정
docs: 설치 가이드에 Windows 환경 섹션 추가

# 나쁜 예 (설명이 영문)
feat: add user profile edit feature
```

## 원자적 커밋 원칙

한 커밋은 **하나의 논리적 변경**만 포함한다. 여러 변경을 묶으면 리뷰/되돌리기/블레임이 어려워진다.

허용:
- 기능 1개 + 해당 테스트
- 버그 수정 + 회귀 테스트
- 단일 범위 리팩토링

금지:
- 기능 추가 + 무관한 포매팅 정리
- 여러 버그 수정 한 커밋
- TDD 루프 전체를 한 커밋으로

예외: 초기 스캐폴딩처럼 쪼개기가 오히려 비용이 큰 경우 허용.

## 커밋 사용자 계정

커밋 전 로컬 Git 계정 설정 여부를 확인한다. **로컬 설정이 있으면 그대로 사용**하고, `--global` 설정으로 덮어쓰지 않는다.

```bash
# 로컬 설정 확인 (프로젝트 루트에서)
git config --local user.name
git config --local user.email
```

우선순위:
1. **로컬 설정 존재** → 로컬 계정으로 커밋 (그대로 진행)
2. **로컬 설정 없음** → 전역 계정 사용
3. **전역도 없음** → 사용자에게 설정 요청 (임의로 설정 금지)

금지:
- `git config --global` 값을 로컬에 일괄 적용
- 사용자 확인 없이 `user.name`/`user.email` 변경
- 프로젝트별 계정 분리 의도를 무시하는 "편의상" 덮어쓰기

## 서명 규칙

Claude Code가 자동 추가하는 `Co-Authored-By: Claude ...` 서명은 **기본 제거**한다.

유지 조건:
- 사용자가 명시적으로 유지 요청한 프로젝트
- AI 기여 추적이 필요한 오픈소스/팀 정책

기본값: 커밋 메시지에서 `Co-Authored-By: Claude ...` 라인 제거. HEREDOC 커밋 메시지 작성 시 해당 라인을 포함하지 않는다.

## 풀 리퀘스트 워크플로우

PR 생성 시:
1. 전체 커밋 이력 분석 (최신 커밋만이 아닌)
2. `git diff [base-branch]...HEAD`로 모든 변경 확인
3. 포괄적인 PR 요약 작성
4. 테스트 계획 및 TODO 포함
5. 새 브랜치면 `-u` 플래그로 푸시

## 기능 구현 워크플로우

1. **계획 우선**
   - 구현 계획 수립 ([핵심 원칙 #9](golden-principles.md#9-hard-gate-no-coding-without-design) 참조)
   - 의존성과 위험 식별
   - 단계별 분할

2. **TDD 접근**
   - RED → GREEN → IMPROVE 사이클 ([핵심 원칙 #3](golden-principles.md#3-test-first-tdd) 참조)
   - 80% 이상 커버리지 확인

3. **코드 리뷰**
   - 코드 작성 직후 리뷰 수행
   - CRITICAL, HIGH 이슈 해결
   - MEDIUM 이슈도 가능하면 수정

4. **커밋 & 푸시**
   - 상세한 커밋 메시지
   - Conventional Commits 형식 준수

참고: 프로젝트에 구성된 에이전트가 있으면 계획, TDD, 리뷰 단계에서 활용한다.

## GitHub 조직 관리

### 새 저장소

```bash
# 기존 로컬 프로젝트에서
cd ~/my-new-project
git init && git add . && git commit -m "init: system files"
gh repo create your-org/my-new-project --private --source=. --push

# 빈 저장소 먼저 생성
gh repo create your-org/my-new-project --private --clone
```

### 전체 클론 (새 머신)

```bash
gh repo list your-org --limit 50 --json sshUrl -q '.[].sshUrl' | xargs -n1 git clone
```
