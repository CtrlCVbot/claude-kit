# 03. kit-sync 파이프라인 영향 분석

> **결론**: 기획은 `kit-sync` 파이프라인을 명시적으로 언급하지 않지만, **shared-manual-first hybrid** 전환은 파이프라인 전반의 재설계를 강제한다. 기존 6-phase 오케스트레이션은 유지하되, **Phase 1.5 (shared-manifest 소스 인식)** 단계를 신설하고, `kit-convert`의 변환 룰을 "shared 우선, native 잔존"으로 재정렬한다. 3개 레지스트리 스키마는 backward-compat 유지를 위해 2.3.x에서 필드 추가만 수행하고, 2.4.0+에서 제거한다.

**대상**: `/kit-sync`, `/kit-convert`, `/kit-analyze`, `/kit-validate`, `/kit-audit`, `/kit-create`, `/kit-list`, `kit-sync-agent`, `kit-maintainer`, `scripts/setup.js`, 3개 registry

---

## 1. 현행 파이프라인 요약 (Baseline)

```
User: /kit-sync [opts]
  └─ kit-sync-agent
      ├─ Phase 1: /kit-analyze (inventory + drift)
      ├─ Phase 2: 규모 판단
      │    ├─ 0 unpaired → Phase 6
      │    ├─ 1 unpaired → /kit-convert --name
      │    ├─ 2-10      → /kit-convert --domain
      │    └─ >10       → Approval Gate (2.5)
      ├─ Phase 2.5: 승인 대기 (report 생성)
      ├─ Phase 3: /kit-convert 실행
      ├─ Phase 4: /kit-audit C8 --fix (cross-ref)
      ├─ Phase 5: registry 업데이트
      └─ Phase 6: /kit-audit C7+C8 최종 검증
```

**SSOT**: `src/pairing-registry.json`, `src/exception-registry.json`, `src/claude/_meta/codex-portability.json`

## 2. hybrid 전환이 파이프라인에 미치는 영향 (요약표)

| 컴포넌트 | 현재 역할 | 전환 후 역할 | 영향 강도 |
|----------|---------|-------------|----------|
| `/kit-sync` (command) | 동기화 오케스트레이션 진입점 | 동일 + shared manifest 우선 플래그 | 🟡 MEDIUM |
| `kit-sync-agent` | 6-phase 실행 | **7-phase** (Phase 1.5 신설) | 🔴 HIGH |
| `/kit-convert` | Claude→Codex 타입별 변환 | shared 우선 → native fallback | 🔴 HIGH |
| `/kit-analyze` | 4-tier 전략 분류 | **5-tier** (shared-direct 추가) | 🔴 HIGH |
| `/kit-validate` | 12 스키마 | **13+ 스키마** (schema-shared-manifest 신규) | 🟡 MEDIUM |
| `/kit-audit` | C1~C10 카테고리 | **C11 (shared-integrity) 신규** | 🟡 MEDIUM |
| `/kit-create` | 12 템플릿 스캐폴드 | shared 매뉴얼 참조 포함 | 🟢 LOW |
| `/kit-list` | 자산 인벤토리 | `--target shared` 필터 추가 | 🟢 LOW |
| `kit-maintainer` | 벌크 감사/수정 | shared 매니페스트 정합 수정 포함 | 🟡 MEDIUM |
| `scripts/setup.js` | buildHooksConfig + emitter | shared manifest 우선 emitter | 🔴 HIGH |
| `kit-converter` skill | 타입별 변환 규칙 | **shared-aware 규칙 확장** | 🔴 HIGH |
| `kit-scaffolding` skill | 템플릿 + 변수 치환 | shared 참조 변수 추가 | 🟢 LOW |
| `kit-validation` skill | 스키마 검증 로직 | shared manifest 스키마 추가 | 🟡 MEDIUM |
| `pairing-registry.json` | 페어링 SSOT | 유지 + `sourceType: claude\|shared` 필드 | 🟡 MEDIUM |
| `exception-registry.json` | 4-tier strategy | 축소 (정책 → shared 매뉴얼) | 🔴 HIGH |
| `codex-portability.json` | 컴포넌트 manifest | 유지 + `hookPolicy: keep\|delete\|hold` | 🟡 MEDIUM |

범례: 🔴 HIGH (코드/스펙 전면 재작성) / 🟡 MEDIUM (필드·플래그 추가) / 🟢 LOW (옵션 추가)

## 3. 신설/변경 단계 상세

### 3.1 Phase 1.5 (신설) — Shared Manifest Awareness

**신규 단계의 책임**:
1. `src/shared/manifests/{workflows,agents,hooks}.json` 존재 여부 확인
2. 로드 + 스키마 검증(`schema-shared-manifest.md`)
3. 현재 작업 스코프와 매니페스트의 교집합 계산
4. 매니페스트에 등록된 자산은 "shared-direct" 전략으로 플래그

**의의**:
- 기존 Phase 1(인벤토리)과 Phase 3(변환) 사이의 공백을 메움
- `src/codex` 대상 여부를 **shared 매뉴얼이 결정** (= 아키텍처 원칙 반영)

**출력**: `5-tier strategy breakdown` (shared-direct / paired-direct / paired-fallback / review / blocked)

### 3.2 /kit-convert — shared-first 변환 규칙

**현재**: Claude 소스 → Codex sibling 1:1 변환

**전환 후**:

```
for each asset in scope:
    if asset in shared-manifests:
        emit shared reference block (link + frontmatter minimal)
        skip native codex sibling generation
    else:
        apply legacy type-specific conversion (paired-direct/fallback)
```

**영향 파일**:
- `src/claude/core/skills/kit-converter/SKILL.md`
- `src/claude/core/skills/kit-converter/references/conversion-rules.md`
- `src/claude/core/skills/kit-converter/references/shared-reference-rules.md` (🆕)

**BC 경계**: 기존 `paired-direct` 자산은 2.3.x까지 현행 유지, 2.4.0에서 shared-first 강제.

### 3.3 /kit-analyze — 5-tier 분류

| 전략 | 의미 | 출처 |
|------|------|------|
| **shared-direct** (🆕) | `src/shared/manifests/` 등록됨 | manifest 조회 |
| paired-direct | Codex sibling 직접 존재 | pairing-registry |
| paired-fallback | AGENTS.md/skill artifact 등 대체 | exception-registry |
| review | Write/Edit 도구 포함 등 수동 검토 | 자동 탐지 |
| blocked | 제약으로 변환 불가 | exception-registry |

**영향 파일**: `src/claude/core/commands/kit-analyze.md`

### 3.4 /kit-validate — schema-shared-manifest 신규

**신규 스키마**: `src/claude/core/skills/kit-validation/references/schema-shared-manifest.md`

검증 항목:
- `$schema` 필드 존재
- `version` SemVer 형식
- `entries[]`의 각 항목: `id`, `type`, `sourceFile`, `targetSurfaces[]`
- `targetSurfaces[]` 원소는 `claude` 또는 `codex`만 허용
- 참조하는 `sourceFile` 실제 존재

**영향 파일**:
- `src/claude/core/commands/kit-validate.md` (타겟에 `shared` 추가)
- `src/claude/core/skills/kit-validation/SKILL.md`

### 3.5 /kit-audit — C11 (shared-integrity) 신규

C11 검증:
- 모든 shared manifest 엔트리의 `sourceFile`이 `src/shared/manuals/` 하위에 존재
- Claude/Codex runtime에서 shared 자산을 역참조하는 링크가 유효
- 중복 등록(같은 id 2회 이상) 없음

**자동 수정**: 깨진 링크 리스트 출력 (자동 수정은 하지 않음 — 구조적 수정은 휴먼 판단 필요)

### 3.6 scripts/setup.js — shared-first emitter

**현재**: `buildHooksConfig()` 중심 + agents/commands/skills 복사

**전환 후 구조**:
```
1. Load shared/manifests/*.json
2. For Claude runtime:
   - Emit .claude/ (includes shared reference links)
3. For Codex runtime:
   - Emit AGENTS.md (shared manual inlined/linked)
   - Emit .codex/agents/*.toml (from shared/manifests/agents.json)
   - Emit skills/ (shared references)
   - Emit hooks (filtered by hookPolicy=keep)
4. Post-emit: /kit-audit C11 자동 실행
```

**단계적 도입**:
- v2.3.x: 기존 emitter 유지 + shared manifest **있을 경우만** 활용 (opt-in)
- v2.4.0+: shared manifest **필수**, 없으면 build 실패

## 4. 레지스트리 영향 상세

### 4.1 pairing-registry.json

**필드 추가 (backward-compat)**:
```json
{
  "identity": "dev-architect",
  "type": "agent",
  "domain": "dev",
  "status": "paired",
  "sourceType": "claude",     // 🆕 claude | shared
  "sharedRef": null,          // 🆕 shared manifest 참조 ID (sourceType=shared 시)
  "claude": "...",
  "codex": "...",
  "createdAt": "...",
  "lastSyncedAt": "...",
  "contentHash": "..."
}
```

**마이그레이션**: 기존 엔트리는 `sourceType=claude`로 기본값 채움 (자동). `sharedRef`는 null.

### 4.2 exception-registry.json

**축소 원칙**: 정책(왜 이런 strategy를 택했나)은 shared 매뉴얼로 이관, 인스턴스 데이터(어떤 컴포넌트가 어떤 strategy인지)만 유지.

**이관 대상 필드**:
- `docConstraints` → `src/shared/manuals/hook-behavior.md` 등으로 이관
- `officialSurface` 설명문 → 매뉴얼 참조 링크로 대체

**유지 필드**: `id`, `component`, `strategy`, `status`, `evidenceLevel`, `fallbackTarget`, `exceptionId`

**시점**: 2.3.x에서 중복 허용 (정책이 매뉴얼 + registry 양쪽에 기록), 2.4.0에서 registry의 정책 필드 제거.

### 4.3 codex-portability.json

**필드 추가**:
```json
{
  "identity": "dev-tdd-guard",
  "type": "hook",
  "hookPolicy": "keep",     // 🆕 keep | delete | hold
  "strategy": "paired-direct",
  "officialSurface": "hooks",
  "evidenceLevel": "confirmed",
  "windowsSupport": false,  // 🆕 명시화
  "...": "..."
}
```

**Phase 5 마무리 기준**: 모든 17개 훅이 `hookPolicy` 값을 가져야 함. Phase 5 완료 전까지 `hold`가 기본값.

## 5. 훅 정리 정책 (keep / delete / hold)

| 분류 | 기준 | 대상 (예시) |
|------|------|----------|
| **keep** | Bash PreToolUse/PostToolUse 공식 보장 범위 내 | `dev-tdd-guard`, `dev-db-guard`, `kit-naming-guard` |
| **delete** | Codex 보장 범위 밖 + Claude-only 의미 | `session-wrap-suggest` (skill fallback 유지) |
| **hold** | 판단 보류 (Phase 5 재평가) | `edit-tracker`, `code-quality-reminder` 등 informational 7개 |

**게이트**: Phase 5 종료 시점에 `hold` 잔존 개수 0이어야 Phase 6 진입 가능.

## 6. 파이프라인 호환성·회귀 테스트 계획

### 6.1 회귀 시나리오 (총 6건)

| # | 시나리오 | 명령 | 기대 결과 |
|---|---------|------|---------|
| RT-1 | shared 없는 상태 /kit-sync | `/kit-sync --dry-run` | 현행 동작(6-phase) 그대로 |
| RT-2 | shared 있는 상태 /kit-sync | `/kit-sync --dry-run` | Phase 1.5 실행 + 5-tier 출력 |
| RT-3 | /kit-convert shared-direct 자산 | `/kit-convert --name X` (X ∈ shared) | native sibling 미생성, shared 참조만 출력 |
| RT-4 | /kit-analyze 드리프트 with shared | `/kit-analyze --include-paired` | shared 자산은 드리프트 스캔 제외 |
| RT-5 | /kit-validate --target shared | 신규 명령 | schema-shared-manifest 통과 |
| RT-6 | /kit-audit C11 | 신규 | shared 무결성 PASS |

### 6.2 드리프트 재정의

**현재 드리프트 키워드**: `copy`, `scenario`, `Feature`, `routing-metadata` 등

**shared 전환 후 추가 키워드**:
- shared 매뉴얼 변경 시 Claude/Codex 참조 링크 무결성
- `src/shared/manifests/` 변경 시 관련 자산의 lastSyncedAt 업데이트

## 7. 다운스트림 영향 (mologado 등)

- **v2.3.x**: `pairing-registry`/`exception-registry`/`codex-portability` 스키마 **추가만**. 기존 다운스트림 `setup.js` postinstall은 영향 없음.
- **v2.4.0**: 정책 필드 제거 + shared manifest 필수화 → 다운스트림 `CLAUDE.md`에 shared 참조 섹션 추가 필요. **Breaking Change 공지**.

상세 마이그레이션 가이드는 `04-migration-plan.md` §4 참조.

## 8. 결론 (shared 전환 시 파이프라인 변경 요약)

1. **Phase 1.5 신설** — shared manifest 인지 → 자산 전략 결정의 진입점 이동
2. **5-tier 전략 체계** — shared-direct 신규 추가, 나머지 4-tier는 기존 유지
3. **변환 규칙 역전** — shared 우선 / native fallback (기존은 항상 native sibling)
4. **검증 확장** — schema-shared-manifest + /kit-audit C11 + `/kit-validate --target shared`
5. **레지스트리 점진 축소** — 정책은 매뉴얼로, 인스턴스 데이터만 레지스트리
6. **emitter 재구성** — setup.js가 shared manifest를 1차 입력으로 소비
7. **훅 재분류** — keep/delete/hold 정책을 codex-portability.json에 명시

## 9. 연결 문서

- 전체 Overview → `01-overview.md`
- 기획 vs 현행 비교 → `02-gap-analysis.md`
- 전환 단계·BC → `04-migration-plan.md`
- 실행 TASK → `05-tasks/T-HYBRID-07` (kit-sync 7-phase), `T-HYBRID-08` (kit-convert shared), `T-HYBRID-09` (kit-analyze 5-tier), `T-HYBRID-14` (kit-validate schema), `T-HYBRID-15` (setup.js 재구성)
