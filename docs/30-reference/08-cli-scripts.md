# CLI Scripts

> **Status**: Draft (P4, 2026-04-17) — 수기 인덱스. 각 스크립트 상단 JSDoc 이 상세 SSOT.
> **Source**: `scripts/*.js` 헤더 주석
> **Related**: [../../package.json](../../package.json) `scripts` 섹션, [06-settings.md](06-settings.md)

`scripts/` 아래의 Node.js 유틸리티 인덱스입니다. 각 스크립트의 권위적 설명은 **파일 상단 JSDoc** 에 있습니다 — 이 문서는 탐색용 요약입니다.

## 1. 설치·빌드

| 스크립트 | 호출 | 역할 |
|---------|------|------|
| [`setup.js`](../../scripts/setup.js) | `postinstall` (자동) | claude-kit 전체 설치 엔트리. `profile.json` 기반 자산 복사 + 컨텍스트 갱신 |
| [`claude-md-renderer.js`](../../scripts/claude-md-renderer.js) | `setup.js` 내부 | `CLAUDE.md` 의 kit-managed 섹션을 도메인 블록 조합으로 렌더링 |
| [`claude-md-merger.js`](../../scripts/claude-md-merger.js) | `setup.js` 내부 | 기존 `CLAUDE.md` 에 kit-managed 블록 병합 (마커 기반) |
| [`merge-settings.js`](../../scripts/merge-settings.js) | `setup.js` 내부 | 템플릿 `settings.json` 을 사용자 `.claude/settings.json` 에 병합 (커스텀 보존) |
| [`quickstart-renderer.js`](../../scripts/quickstart-renderer.js) | `setup.js` 내부 | 설치본 `CLAUDE-KIT-QUICKSTART.md` 를 도메인/타깃 조합으로 조립 |

## 2. 문서 생성

| 스크립트 | npm script | 역할 |
|---------|-----------|------|
| [`docs-generate.js`](../../scripts/docs-generate.js) | `generate:docs`, `check:docs` | `docs/30-reference/*.md` 자동 생성 (commands, agents, skills, hooks, rules, pairing) |
| [`generate-sync-report.js`](../../scripts/generate-sync-report.js) | 수동 | codex-sync 상태 보고서 (markdown) 생성 — portability/exception/pairing 기준 |

### --check 모드 규약

`docs-generate.js --check` 는 **현재 파일과 생성 결과가 다르면 exit 1**. CI 파이프라인에서 drift 감지용.

```bash
pnpm check:docs
```

## 3. 감사·검증

| 스크립트 | 용도 |
|---------|------|
| [`audit-pairing.js`](../../scripts/audit-pairing.js) | C7 pairing 일관성 검증. `pairing-registry.json` ↔ 실제 파일. silent failure 감지 |
| [`audit-drift.js`](../../scripts/audit-drift.js) | C10 codex-sync artifact drift. 원본 source ↔ fallback artifact 차이 탐지 |
| [`codex-hook-compat.js`](../../scripts/codex-hook-compat.js) | Hook 의 Codex 호환성 분류 (Full / Partial / Skip) + portability strategy 판정 |

## 4. 일회성·마이그레이션

| 스크립트 | 용도 |
|---------|------|
| [`update-pairing-registry-75.js`](../../scripts/update-pairing-registry-75.js) | 2026-04 kit-sync 75 full execution 시 임시 사용. **재실행 금지** |

일회성 스크립트는 목적을 다하면 별도 커밋으로 제거 or `scripts/_archive/` 로 이동 권장 (현재는 보존 중).

## 5. 호출 관계도

```
postinstall
  └── setup.js
      ├── merge-settings.js
      ├── claude-md-renderer.js
      │   └── (templates/claude-md/ 블록 조합)
      ├── claude-md-merger.js
      ├── (Codex 타깃) codex-hook-compat.js
      └── quickstart-renderer.js  (CLAUDE-KIT-QUICKSTART.md 생성)
```

## 6. package.json 스크립트 연결

```json
{
  "scripts": {
    "postinstall":   "node scripts/setup.js",
    "generate:docs": "node scripts/docs-generate.js",
    "check:docs":    "node scripts/docs-generate.js --check"
  }
}
```

`audit-*`, `codex-hook-compat`, `generate-sync-report` 등은 **npm script 로 노출되지 않은 직접 호출 유틸** 입니다 — 필요 시 `node scripts/<name>.js` 로 실행.

## 7. 새 스크립트 추가 시 규약

1. 파일 상단에 JSDoc 주석으로 **용도·사용법·소스 참조** 명시
2. 일회성이면 파일명에 날짜나 phase 포함 (예: `update-pairing-registry-75.js`)
3. 반복 실행 가능한 생성기면 `--check` 모드 제공
4. `package.json` 에 npm script 로 노출할 가치가 있는지 판단
5. 본 문서에 항목 추가 (이 문서는 수기 인덱스)

## 8. 변경 이력 주의

- **2026-04-17**: `generate-quickstart-doc.js` 제거 (저장소 variant 생성 기능 종료). 설치본 `CLAUDE-KIT-QUICKSTART.md` 하나로 단일화. `quickstart-renderer.js` 는 `setup.js` 가 직접 호출.

## 다음 읽기

- [06-settings.md](06-settings.md) — `setup.js` 가 생성하는 settings 구조
- [../10-features/04-multi-target.md](../10-features/04-multi-target.md) — audit/codex-compat 스크립트의 배경
- [../40-contributing/05-quality-gates.md](../40-contributing/05-quality-gates.md) — CI 통합 관점
