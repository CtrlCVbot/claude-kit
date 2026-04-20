---
제목: Archive Layout — 저장 구조 + 네이밍 + 인덱스 전략
작성일: 2026-04-20
대상: 메인테이너, 훅 구현자, 데이터 소비자(분석가)
상태: draft
---

# 04 Archive Layout

> **결론**: 아카이브는 `.claude/feedback-archive/` 아래 **runtime → domain → command** 3계층으로 구성. 파일명은 **타임스탬프 + 커맨드 + slug** 조합. **index.md** 파일이 전체 탐색 허브 역할. 월 단위 롤업 폴더로 장기 저장량 관리.

---

## 1. 전체 디렉토리 구조

```
.claude/
└── feedback-archive/
    ├── index.md                      ← 최상위 인덱스 (자동 갱신)
    ├── stats.json                    ← 집계 지표 (자동 갱신)
    ├── schema/
    │   └── feedback-entry.schema.json  ← 참조용 스키마 복사본
    │
    ├── claude/                       ← runtime: claude
    │   ├── plan/
    │   │   ├── 20260417-143022-plan-draft-dash-preview-phase3.json
    │   │   ├── 20260417-152015-plan-prd-dash-preview-phase3.json
    │   │   └── ...
    │   ├── copy/
    │   │   └── 20260417-161200-copy-reference-refresh-dash-preview-phase3.json
    │   └── dev/
    │       └── 20260417-180330-dev-feature-dash-preview-phase3.json
    │
    ├── codex/                        ← runtime: codex
    │   ├── plan/
    │   ├── copy/
    │   └── dev/
    │
    └── _rollups/                     ← 월 단위 롤업 (자동 생성)
        ├── 2026-04.md                  ← 4월 요약
        ├── 2026-04-claude-issues.json  ← Claude 환경 이슈 요약
        └── 2026-04-codex-issues.json   ← Codex 환경 이슈 요약
```

### 1.1 계층 의미

| 계층 | 역할 |
|------|------|
| `feedback-archive/` | 아카이브 루트 |
| `{runtime}/` | 환경 구분 (claude/codex/other) |
| `{domain}/` | 도메인 구분 (plan/copy/dev/core) |
| `{entry}.json` | 개별 엔트리 |
| `_rollups/` | 월 단위 집계 (읽기 전용) |

---

## 2. 파일 네이밍 규칙

### 2.1 엔트리 JSON

```
{YYYYMMDD}-{HHmmss}-{command-suffix}-{slug}.json
```

**예시**:
- `20260420-143022-plan-draft-dash-preview-phase3.json`
- `20260420-143515-dev-feature-dash-preview-phase3.json`

### 2.2 필드별 규칙

| 필드 | 형식 | 예시 |
|------|------|------|
| 날짜 | YYYYMMDD | 20260420 |
| 시각 | HHmmss (UTC+09:00 local) | 143022 |
| command-suffix | `/plan-draft` → `plan-draft` | plan-draft |
| slug | Feature slug 또는 `unknown` | dash-preview-phase3 |

### 2.3 특수 케이스

| 상황 | 네이밍 |
|------|--------|
| Feature slug 없음 | `unknown` |
| slug에 특수문자 | kebab-case 정규화 |
| 같은 초에 중복 | 뒤에 `-2`, `-3` 접미사 (훅이 자동 부여) |

---

## 3. index.md 구조

`.claude/feedback-archive/index.md`:

```markdown
# Feedback Archive Index

> 자동 생성 — 직접 편집 금지. 변경은 훅/스크립트 재실행.

Last updated: 2026-04-20 14:30:22

## 통계

- 총 엔트리: 42건
- Claude: 34건 / Codex: 8건
- P0 이슈: 5건 / P1: 18건 / P2: 22건

## 최근 10건

| 시각 | runtime | domain | command | slug | P0 | 링크 |
|------|---------|--------|---------|------|:-:|------|
| 2026-04-20 14:30 | claude | plan | /plan-draft | dash-preview-phase3 | 0 | [link](./claude/plan/20260420-143022-...json) |
| ... |

## IMP-KIT 관련 집계

| IMP-KIT ID | 참조 건수 | 최근 발생 |
|-----------|:-:|-----------|
| IMP-KIT-001 | 3 | 2026-04-20 |
| IMP-KIT-002 | 1 | 2026-04-17 |
| ... |

## 월별 요약

- [2026-04 롤업](_rollups/2026-04.md) — 42건, P0 5건
- [2026-03 롤업](_rollups/2026-03.md) — 28건, P0 2건
```

### 3.1 index 갱신 시점

- 각 엔트리 생성 시 증분 업데이트 (훅 내장)
- 매월 1일 자동 롤업 생성 + index 재정리

---

## 4. stats.json 구조

```json
{
  "generated_at": "2026-04-20T14:30:22+09:00",
  "total_entries": 42,
  "by_runtime": { "claude": 34, "codex": 8, "other": 0 },
  "by_domain": { "plan": 18, "copy": 11, "dev": 13, "core": 0 },
  "by_severity": { "P0": 5, "P1": 18, "P2": 22 },
  "by_imp_kit": {
    "IMP-KIT-001": 3,
    "IMP-KIT-002": 1,
    "IMP-KIT-005": 2,
    "IMP-KIT-006": 4
  },
  "top_issue_types": [
    { "type": "permission_mismatch", "count": 7 },
    { "type": "framework_drift", "count": 4 },
    { "type": "cache_error", "count": 3 }
  ],
  "latest_entry_ids": [
    "20260420-143022-plan-draft-dash-preview-phase3",
    "20260420-135010-dev-feature-dash-preview-phase3"
  ]
}
```

---

## 5. 월 단위 롤업

### 5.1 `_rollups/{YYYY-MM}.md` 구조

```markdown
# Feedback Rollup — 2026-04

> 월 단위 자동 생성. 편집 금지.

## 요약
- 총 42건 (Claude 34 / Codex 8)
- P0: 5건 / P1: 18건 / P2: 22건
- 평균 세션 duration: 512초

## 도메인 분포
- plan: 18건 (43%)
- copy: 11건 (26%)
- dev: 13건 (31%)

## 가장 빈번한 이슈 유형
1. permission_mismatch (7건) — IMP-KIT-001 연관
2. framework_drift (4건) — IMP-KIT-002 연관
...

## 런타임별 차이 (Codex vs Claude)
- Codex 전용 이슈 2종:
  - issue-type: cache_error (Codex hooks runtime 부재 관련)
  - ...

## IMP-KIT 실제 발생 현황
- IMP-KIT-001: 3건 발생 (우선순위 유지 근거)
- IMP-KIT-005: 2건 (해결 시 Phase 1 완료 효과 측정)

## 권고 조치
- IMP-KIT-001을 2.2.0에 최우선 투입 (실발생 3건)
- Codex hooks fallback 품질 개선 필요
```

### 5.2 `_rollups/{YYYY-MM}-{runtime}-issues.json`

```json
{
  "runtime": "claude",
  "period": "2026-04",
  "issues": [
    {
      "type": "permission_mismatch",
      "count": 6,
      "representative_entries": ["20260417-153045-...", "20260420-143022-..."]
    }
  ]
}
```

---

## 6. Git 관리

### 6.1 권장 .gitignore 설정

```gitignore
# .claude/feedback-archive/
# 프로젝트별 정책:
# A) 모두 커밋 (권장 — PR 기반 공유)
# B) _rollups만 커밋 (노이즈 감소)
# C) 전체 ignore (개인 관찰용)
```

### 6.2 민감 정보 보호

각 엔트리 저장 전 redaction 적용 (02-feedback-schema §7 참조). Git 커밋 전 추가 검증:

- `pre-commit` 훅에서 `feedback-archive/` 내 민감 패턴 재확인
- 감지 시 commit 차단

---

## 7. 용량 관리

### 7.1 예상 크기

| 항목 | 크기 (평균) |
|------|:-:|
| 개별 엔트리 JSON | 2~8 KB |
| 1세션 평균 | 3~5 엔트리 |
| 1일 (활발한 사용) | 10~20 엔트리 |
| 1개월 | 200~600 엔트리 ≈ 2~4 MB |
| 1년 | 24~48 MB |

**결론**: 용량 우려 낮음. 롤업 생성 후 개별 엔트리 압축 검토는 **년 단위** 옵션.

### 7.2 정리 전략 (옵션)

- **6개월 이후**: 개별 엔트리를 `_archived/{YYYY-MM}.tar.gz`로 압축
- **2년 이후**: 롤업만 유지하고 원본 삭제 (프로젝트 정책 결정)

---

## 8. 인덱스 갱신 로직

### 8.1 증분 업데이트 (엔트리 추가 시)

```javascript
// 의사코드
async function updateIndex(projectDir, newEntry) {
  const statsPath = path.join(archiveDir, 'stats.json')
  const stats = await readJsonSafe(statsPath) || defaultStats()

  stats.total_entries += 1
  stats.by_runtime[newEntry.runtime] += 1
  stats.by_domain[newEntry.domain] += 1
  // issues_observed 기반 severity/imp_kit 증분

  await fs.writeFile(statsPath, JSON.stringify(stats, null, 2))
  await regenerateIndexMd(archiveDir, stats)  // index.md 재생성
}
```

### 8.2 풀 재계산 (검증용)

```bash
# 수동 재계산
node src/claude/core/hooks/feedback-rebuild-index.js
```

---

## 9. 쿼리 친화적 구조

### 9.1 파일 시스템 기반 쿼리

폴더 구조가 곧 쿼리 인덱스:
- `.claude/feedback-archive/claude/dev/` → Claude + dev 필터링
- `.claude/feedback-archive/*/plan/*.json` → 양 환경 plan 모두

### 9.2 jq 기반 쿼리 예시

```bash
# P0 이슈 전체
find .claude/feedback-archive -name "*.json" | xargs jq 'select(.issues_observed[]?.severity == "P0")'

# IMP-KIT-001 관련 Codex 엔트리
jq 'select(.runtime == "codex" and .issues_observed[]?.related_imp_kit_id == "IMP-KIT-001")' .claude/feedback-archive/codex/**/*.json
```

---

## 10. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
