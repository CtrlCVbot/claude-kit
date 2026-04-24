# Domain Authoring

> **Status**: Draft (P4, 2026-04-17)
> **Source**: `src/claude/{core,dev,plan,copy}/`, [../../scripts/setup.js](../../scripts/setup.js)
> **Related**: [02-adding-a-component.md](02-adding-a-component.md), [`template-governance.md`](../../src/claude/core/rules/template-governance.md) (3 Location 관계 + 도메인 블록 추가 절차)

기존 `core/dev/plan/copy` 외에 **새 도메인** 을 claude-kit 에 추가하는 절차입니다. 단일 자산 추가는 [02-adding-a-component.md](02-adding-a-component.md).

## 1. 판단 — 정말 새 도메인이 필요한가?

새 도메인은 무거운 결정입니다. 다음 중 2개 이상 해당해야 정당화됩니다.

- [ ] 응집된 자산 묶음 (커맨드·에이전트·스킬·훅 4+ 개)
- [ ] 기존 도메인 어디에도 자연스럽게 속하지 않음
- [ ] opt-in / opt-out 전환이 의미 있음 (프로젝트별로 필요 여부가 갈림)
- [ ] 독립된 파이프라인을 형성 (진입·단계·게이트·종료)

1개 이하면 기존 도메인에 추가하는 것이 낫습니다.

## 2. 도메인 설계

### 2.1 이름 규약

- kebab-case, 소문자 단어 1개 (예: `core`, `dev`, `plan`, `copy`)
- 기존 도메인과 충돌 없음
- 프로젝트 전반에서 의미가 명확

### 2.2 역할 정의 문서

`src/claude/{new-domain}/README.md` (내부 설계 문서) 를 먼저 작성합니다. 포함 사항:
- 도메인 목적
- 파이프라인 (단계 순서)
- 핵심 게이트
- 다른 도메인과의 접점

## 3. 디렉터리 스캐폴딩

```
src/claude/{new-domain}/
  ├── commands/
  ├── agents/
  ├── skills/
  ├── hooks/
  └── rules/          ← 있을 경우만 (core, copy 참고)
```

Codex 타깃도 함께:

```
src/codex/{new-domain}/
  ├── commands/
  ├── agents/
  ├── skills/
  └── hooks/
```

## 4. 최소 자산

새 도메인이 기능하려면 **최소 1 command + 1 skill** 은 있어야 합니다. 보통은:
- 1 command: 파이프라인 진입점 (`/{domain}-start` 류)
- 1 agent: 도메인 리더 역할
- 1 skill: 도메인 사용 가이드
- 0~N hooks: 가드 필요 시

`/kit-create` 로 각각 스캐폴딩 (기존 도메인 경로 대신 새 도메인 지정).

## 5. `setup.js` 수정

`scripts/setup.js` 가 도메인별 복사 로직을 가집니다. 새 도메인이 인식되도록 수정 필요.

수정 포인트 (대략):
- `KNOWN_DOMAINS` 상수 배열에 추가
- `buildSettingsTemplate()` 의 도메인별 분기
- `buildHooksConfig()` 의 hook 매핑
- `claude-md-renderer.js` 의 도메인 블록 로더 (아래 §6)

각 함수의 세부 구현은 저장소 버전에 따라 달라집니다. `git grep "\"dev\""` 로 dev 도메인 패턴을 참조해 동일 구조로 확장.

## 6. 템플릿 추가

```
src/templates/claude-md/
  ├── 00-preamble.md
  ├── 10-dev.md
  ├── 20-plan.md
  ├── {new-number}-{new-domain}.md       ← 신규
  └── 90-currentdate.md
```

도메인별로 `CLAUDE.md` / `AGENTS.md` 에 삽입되는 블록. 번호는 순서 (00-90 사이) 를 결정.

Quickstart 블록도 마찬가지:
```
src/templates/quickstart/blocks/
  ├── 05-dev-flow.md
  ├── {new}-{new-domain}-flow.md         ← 신규
```

## 7. Registry 갱신

pairing-registry 와 exception-registry 는 entry 단위이므로 자동 갱신. 하지만 **도메인 필드** 를 새 값으로 사용하게 되므로 미리 확인하세요.

```bash
node scripts/audit-pairing.js
# 새 도메인 entry 가 올바르게 표시되는지
```

## 8. 문서 추가

도메인이 추가되면 다음 문서들이 영향받습니다.

| 문서 | 작업 |
|------|------|
| `docs/00-overview/02-core-concepts.md` §1 | 도메인 표에 행 추가 |
| `docs/10-features/{NN}-{new-domain}.md` | **신규 작성** (기능 카탈로그) |
| `docs/20-user-guide/02-configuration.md` §2 | `domains` 표 행 추가 |
| `docs/20-user-guide/` | 필요 시 파이프라인 가이드 추가 |
| `docs/30-reference/*.md` | 자동 생성으로 반영 (수기 불필요) |
| `docs/20-user-guide/08-glossary.md` | 도메인 엔트리 추가 |

## 9. 검증 파이프라인

```bash
pnpm install                              # setup.js 재실행 (QUICKSTART.md 재생성 포함)
pnpm generate:docs && pnpm check:docs     # reference 반영
node scripts/audit-pairing.js             # pairing 일관성
/kit-validate                             # 새 자산 검증
```

모두 통과 후 Claude Code 세션에서 실제 도메인 동작 확인.

## 10. PR 분할 전략

새 도메인은 대형 변경입니다. 권장 분할:

1. **Foundation PR**: 디렉터리 구조 + setup.js 수정 + 최소 자산 1-2개
2. **Assets PR**: 나머지 commands/agents/skills/hooks 추가
3. **Docs PR**: features / user-guide 가이드 작성
4. **Quality PR**: 실제 동작 테스트 + 리뷰 수렴

단일 대형 PR 도 가능하지만 리뷰 부담이 큽니다.

## 11. 삭제 시 고려

도메인 제거는 파괴적입니다. 기존 사용자의 `profile.json` 에 해당 도메인이 있으면 설치 실패. deprecation 절차:

1. 릴리스 노트에 deprecation 공지
2. `setup.js` 에 deprecation 경고 추가 (1-2 릴리스 유지)
3. 다음 major 릴리스에 제거
4. `archive/` 로 이동 (삭제 대신 아카이빙)

## 다음 단계

- [04-release-checklist.md](04-release-checklist.md) — 도메인 추가 후 릴리스
- [05-quality-gates.md](05-quality-gates.md) — CI 게이트
