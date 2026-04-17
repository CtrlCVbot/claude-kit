# Troubleshooting

> **Status**: Draft (P4, 2026-04-17) — 자주 막히는 사례 모음. 확장 예정.
> **Source**: 수기 작성 (설치·운영 경험 기반)
> **Related**: [01-installation.md](01-installation.md), [06-codex-dual-use.md](06-codex-dual-use.md)

자주 발생하는 문제와 대응법입니다. 여기서 해결되지 않으면 [계획서 §문제 보고](../plan/documentation-package-plan.md) 또는 이슈 트래커를 참조하세요.

## 설치·환경

### Q. `postinstall` 이 실패합니다

**증상**: `pnpm add` 후 에러 메시지 + `.claude/` 미생성

**원인 체크**:
1. Node 버전: `node -v` 가 v20+ 인가?
2. 권한: 프로젝트 루트에 쓰기 권한이 있는가?
3. `profile.json` 형식 오류: `cat profile.json | jq .` (유효한 JSON 확인)

**해결**:
```bash
pnpm claude-kit:setup   # setup.js 수동 실행
```
출력 로그에서 실패 지점 확인.

### Q. `.claude/` 는 있는데 커맨드가 등록 안 됨

**원인**: Claude Code 세션을 설치 전에 열었고, 이후 자산이 로드되지 않은 상태

**해결**: Claude Code 재시작. 또는 `/reload` 같은 재로드 커맨드.

### Q. 업데이트 후 커스텀이 사라짐

**원인**: `.claude/settings.json` 에 직접 쓴 커스텀 설정이 병합 대상이 아님

**해결**:
- 개인 커스텀은 `.claude/settings.local.json` 으로 이동
- 프로젝트 커스텀은 `.claude/settings.json` 에 kit 관리 키 밖 영역에 배치

## TDD 가드

### Q. TDD 가드가 편집을 계속 막습니다

**증상**:
```
❌ [dev-tdd-guard] 테스트 없는 편집 차단
```

**원인**: 편집 대상에 매칭되는 테스트 파일이 없음

**해결 (올바른 순서)**:
1. 테스트 파일 먼저 작성 (`foo.test.ts` 등)
2. 실행해서 실패 확인 (Red)
3. 구현 파일 편집 (Green)

**면제 예외 추가**: `src/claude/dev/hooks/dev-tdd-guard.js` 의 `TS_EXEMPT_PATTERNS` 에 패턴 추가 (주의 깊게 — 우회는 장기적으로 품질 저하).

### Q. 테스트는 있는데도 차단됨

**원인**: 테스트 파일 네이밍 패턴 불일치

**확인**: `foo.ts` 에 대한 유효 테스트 파일명
- `foo.test.ts`, `foo.spec.ts`
- `__tests__/foo.ts`
- 언어별로 Java: `FooTest.java`, Python: `test_foo.py`

가드 소스의 정규식 참조: [../../src/claude/dev/hooks/dev-tdd-guard.js](../../src/claude/dev/hooks/dev-tdd-guard.js).

## Feature Scope 가드

### Q. `[dev-feature-scope-guard]` 경고가 뜨는데 정상 편집 같은데요

**증상**: Feature Package 밖 파일 편집 경고

**판단**:
- 정말 필요한 변경이면 **경고만 무시** (차단 아님)
- 범위가 넓어지면 Feature Package 의 TASK 목록에 추가하는 것이 낫다

## Plan 파이프라인

### Q. `/plan-draft` 가 "승인 필요" 로 차단됨

**원인**: `/plan-screen` 결과에 대한 사용자 승인 없음

**해결**:
1. `/plan-screen <IDEA-ID>` 출력 확인
2. 승인 의사를 명시 ("이 아이디어로 진행합시다" 등)
3. `/plan-draft <IDEA-ID>` 재시도

승인 게이트는 건너뛸 수 없습니다 ([04-decision-log.md D1](../00-overview/04-decision-log.md)).

### Q. plan-doc-guard 가 이상하게 자주 막힘

**확인**: `.plans/features/active/<slug>/` 구조가 올바른지 검증. 수동으로 디렉터리를 만들었다면 guard 가 기대하는 포맷과 다를 수 있습니다. `/plan-bridge` 를 통해 생성된 구조를 사용하세요.

## Codex 듀얼 사용

### Q. Codex 에서 커맨드가 안 보여요

**확인**:
```bash
ls plugins/claude-kit/commands/
cat .agents/plugins/marketplace.json
```

- `commands/` 에 `.md` 파일이 있는가?
- `marketplace.json` 에 `claude-kit` 엔트리가 있는가?

없으면 `profile.json` 의 `targets` 에 `"codex"` 포함 후 `pnpm install` 재실행.

### Q. Codex 의 subagent 가 작동 안 함

**확인**: `~/.codex/config.toml` 에 `collab = true`

### Q. pairing drift 경고

**증상**: `/kit-audit` 또는 `audit-pairing.js` 실패

**해결**:
```bash
node scripts/audit-pairing.js --json | jq .
```

원인별:
- `claude-only` 가 많음 → `/kit-sync` 로 Codex 포팅
- `skip` 사유 누락 → `src/exception-registry.json` 에 `reason` 추가
- 실제 파일 누락 → registry 수정 or 파일 복구

## 일반

### Q. 세션이 너무 길어져서 느립니다

**해결**:
1. `/dev-checkpoint` 로 상태 저장
2. 새 세션 열기
3. `/dev-continue` 로 재개

[Golden Principle #8 Context 50% Rule](../../src/claude/core/rules/golden-principles.md) 도 참조.

### Q. WebFetch 가 금지돼 있어요

**맞습니다**. `.claude/rules/interaction.md` 에 WebFetch 금지 명시 — 세션 hang 리스크 때문. 대체:
- `mcp__jina-reader__*` (우선)
- `mcp__fetch__fetch` (fallback)

### Q. 훅을 잠깐 끄고 싶어요

**권장하지 않음**. 훅은 규칙을 강제하는 메커니즘입니다. 일시 비활성이 필요하면:

```json
// .claude/settings.local.json (개인 환경 한정)
{
  "hooks": { /* 오버라이드 */ }
}
```

운영 환경에서 훅 끄는 것은 엄격히 금지. 이유가 있다면 hook 로직 자체를 개선하세요.

## 복구 절차

모든 게 꼬였을 때 초기화:

```bash
rm -rf .claude/ plugins/claude-kit/ .claude-kit-meta.json
rm CLAUDE.md AGENTS.md CLAUDE-KIT-QUICKSTART.md
pnpm install   # 재설치
```

**주의**: `CLAUDE.md` 를 지우면 사용자가 추가한 내용도 사라집니다. 먼저 백업.

## Copy 도메인 (`copy` 활성 시)

### Q. `copy-evidence-reminder` 경고가 계속 뜹니다

**원인**: 시각·인터랙션 파일을 수정했는데 evidence manifest 가 갱신 안 됨

**해결**:
1. `.plans/features/active/<slug>/evidence/manifest.json` 확인
2. `/copy-reference-refresh` 로 evidence 재캡처
3. manifest 에 `captured_at` 갱신

### Q. `copy-variant-env-guard` 가 막습니다

**원인**: `SITE_VARIANT` 또는 `SITE_VARIANT_HOST_MAP` 이 변경됐는데 QA 확인 안 됨

**해결**: 해당 variant 의 최신 QA 결과를 evidence 로 첨부. 또는 일시적으로 개인 환경 (`.env`) 에서 재검증.

### Q. P0 이슈가 열린 채 Phase 완료가 안 됩니다

**의도된 동작**. P0 이슈는 [copy-gates 규칙](../../src/claude/copy/rules/copy-gates.md) 상 Phase 경계를 넘길 수 없습니다. 해결 후 진행.

## Agent Teams

### Q. 팀 스폰 후 teammate 가 idle 상태로 유지

**원인**: idle 은 정상 상태 (다음 메시지 대기 중). 에러 아님

**해결**: 작업을 지시하면 재가동. idle 이라고 자동 삭제하지 말 것.

### Q. 팀 메시지가 누락된 것 같음

**확인**: `SendMessage` 로 보낸 메시지는 자동 전달됨. 구조화된 JSON 상태 메시지 (`{"type":"idle",...}`) 는 **보내지 말 것** — 시스템이 자동 처리.

## 토큰·성능

### Q. 세션이 점점 느려집니다

**원인**: context 사용량이 50% 넘으면 응답 품질 저하 가능 ([Golden Principle #8](../../src/claude/core/rules/golden-principles.md))

**해결**:
1. `/dev-checkpoint` 로 상태 저장
2. 새 세션 시작
3. `/dev-continue` 로 재개

### Q. rules 가 너무 많아 보입니다

rules 는 매 턴 로드됩니다. 6개 core rules 가 현재 표준. 8개 이상이면 분할·병합 고려.

## 설치·업데이트

### Q. `pnpm update claude-kit` 후 커스텀 훅이 사라짐

**원인**: `.claude/hooks/` 는 `setup.js` 가 매번 재생성. 사용자 커스텀은 보존 안 됨

**해결**:
- 커스텀 훅은 `src/` 에 포팅 후 PR 로 upstream
- 임시 커스텀은 `.claude/hooks/_user/` 같이 별도 디렉터리 + `settings.local.json` 에 등록

### Q. `plugins/claude-kit/hooks.json` 의 매처가 이상해요

**원인**: Codex v1 매처 문법이 Claude 와 다름. 일부 매처가 변환 누락

**해결**: `node scripts/codex-hook-compat.js` 로 분류 확인 후 SSOT 수정.

## Kit 메타

### Q. `/kit-validate` 가 "스키마 불일치" 경고

**원인**: 새로 추가한 자산의 frontmatter 가 스키마 기준에 미달

**해결**:
1. `.claude/skills/kit-validation/references/schema-{type}.md` 에서 필수 필드 확인
2. 자산의 frontmatter 수정
3. 재검증

### Q. pairing-registry 가 수동으로 이상해졌습니다

**복구**:
```bash
node scripts/audit-pairing.js --json > /tmp/audit.json
# audit 결과 분석 후 수동 정정 or /kit-audit 자동 제안 사용
```

## 다음 단계

- 이 목록에 없는 문제는 이슈로 제보해주세요
- [06-codex-dual-use.md](06-codex-dual-use.md) — Codex 특정 이슈
- [08-glossary.md](08-glossary.md) — 용어 혼동 시
- [../40-contributing/05-quality-gates.md](../40-contributing/05-quality-gates.md) — CI 관점 트러블슈팅
