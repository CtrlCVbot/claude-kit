# IMP-AGENT-008 — 에이전트 frontmatter 확장

> **결론**: 현재 19개 에이전트가 공유하는 frontmatter 필드 세트(`name/description/tools/model/memory/color`)는 **생명주기·의존성·소유권 표현 불가**. 텔레메트리(IMP-AGENT-009)와 거버넌스(Breaking Change 추적)를 위해 **3개 필드를 추가**한다.

**축**: Tool Gaps
**우선순위**: P2
**공수**: M
**Breaking Change**: **yes** (BC-2.3.1-04, 19개 에이전트 일괄 갱신)
**타깃 릴리스**: v2.3.1
**근거**: `analysis/agent-catalog-snapshot.md` 공백 #4
**관련 에이전트**: 전체 19개

---

## 1. 문제 (카탈로그 기반)

현재 frontmatter:
```yaml
name: ...
description: ...
tools: [...]
model: opus
memory: project
color: ...
```

**한계**:
- **team_owner 부재**: 에이전트 변경 시 누구에게 PR 리뷰 요청할지 불명
- **dependencies 부재**: 에이전트 간 호출 체인이 프롬프트 본문에만 있어 자동 분석 불가
- **release_stage 부재**: beta/stable 구분 없어 Breaking Change 파급 범위 판단 어려움
- **schema_version 부재**: frontmatter 자체의 버전 관리 불가 → 미래 확장 시 호환성 문제

## 2. 해결책

### 2.1 신규 필드 3개 + schema_version 1개

```yaml
name: dev-architect
description: ...
tools: [Read, Grep, Glob]
model: opus
memory: project
color: blue

# 신규 필드 (v1.1)
schema_version: '1.1'
team_owner: core            # enum: core, dev, plan, copy, community
release_stage: stable       # enum: experimental, beta, stable, deprecated
dependencies:
  calls: []                 # 이 에이전트가 호출하는 다른 에이전트 (빈 배열 허용)
  called_by: []             # 이 에이전트를 호출하는 커맨드/스킬/에이전트
```

### 2.2 frontmatter 스키마

`src/claude/core/_schemas/agent-frontmatter.schema.json` 신설:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["name", "description", "tools", "model", "memory", "color", "schema_version", "team_owner", "release_stage"],
  "properties": {
    "schema_version": { "const": "1.1" },
    "team_owner": { "enum": ["core", "dev", "plan", "copy", "community"] },
    "release_stage": { "enum": ["experimental", "beta", "stable", "deprecated"] },
    "dependencies": {
      "type": "object",
      "properties": {
        "calls": { "type": "array", "items": { "type": "string" } },
        "called_by": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

### 2.3 초기 채움 전략

| 필드 | 초기값 채움 방법 |
|---|---|
| team_owner | 도메인 경로 기반 자동 추론 (dev/plan/copy) |
| release_stage | 현재 19개 전부 `stable` |
| dependencies.calls | 프롬프트 본문 grep → `Agent` 호출 대상 추출 |
| dependencies.called_by | 커맨드·스킬·다른 에이전트에서 해당 에이전트 이름 grep |

**자동화 스크립트**: `scripts/migrate-agent-frontmatter-v1.1.js` 제공. 수동 검토 후 적용.

---

## 3. Breaking Change 마이그레이션 (BC-2.3.1-04)

| 단계 | 내용 |
|---|---|
| 1 | 스키마 + 자동화 스크립트 배포 (v2.3.1) |
| 2 | 19개 에이전트 일괄 갱신 (단일 PR, 프롬프트 본문 변화 없음) |
| 3 | `agent-frontmatter-guard.js` 훅 도입 (optional v2.3.1, enforced v2.4.0) |
| 4 | 외부 컨트리뷰터용 마이그레이션 가이드 배포 |

**자동 검증**: 훅이 Edit|Write 시점에 frontmatter validation 수행. 실패 시 경고(v2.3.1) 또는 차단(v2.4.0+).

---

## 4. 텔레메트리 연계 (IMP-AGENT-009)

- `team_owner`: 에이전트 실패 시 소유 팀에 자동 알림
- `release_stage`: experimental 에이전트의 사용 빈도 추적 → stable 승격 기준
- `dependencies`: 호출 그래프 시각화

---

## 5. 구현 범위

**신규 파일**:
- `src/claude/core/_schemas/agent-frontmatter.schema.json`
- `src/claude/core/hooks/agent-frontmatter-guard.js` (optional v2.3.1)
- `scripts/migrate-agent-frontmatter-v1.1.js` — 19개 일괄 갱신 스크립트
- `.claude/rules/agent-frontmatter.md` — SSOT

**수정 파일**:
- 19개 에이전트 frontmatter 각각 3~4필드 추가

**테스트**:
- 19개 에이전트 모두 validation 통과
- 자동 채움 스크립트 재실행 시 idempotent
- dependencies 순환 참조 감지 (A → B → A)

---

## 6. ROI

- **정방향**: 에이전트 거버넌스 기반 확립 → 이후 IMP 설계 비용 감소
- **측정**: IMP-AGENT-009 텔레메트리 활성화 시 소유 팀별 집계 가능
- **비용**: 스키마 1건 + 스크립트 1건 + frontmatter 19건 수정

---

## 7. 수락 기준

- [ ] agent-frontmatter.schema.json v1.1 ajv validation 통과
- [ ] 19개 에이전트 모두 필드 3~4개 추가
- [ ] 자동화 스크립트 실행 후 수동 검토 완료
- [ ] dependencies.calls 와 called_by가 상호 일치 (A calls B ↔ B called_by A)
- [ ] release_stage 전부 `stable` (신규 에이전트 IMP-AGENT-005/006은 `beta` 시작)

---

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — 카탈로그 공백 #4 해소 |
