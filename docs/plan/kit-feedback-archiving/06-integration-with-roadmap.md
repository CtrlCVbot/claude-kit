---
제목: Integration with kit-2.2.0-roadmap — 구현 순서 + 의존
작성일: 2026-04-20
대상: 메인테이너, 릴리스 책임자
상태: draft
---

# 06 Integration with kit-2.2.0-roadmap

> **결론**: 본 시스템은 kit-2.2.0-roadmap의 **IMP-KIT-007 + 016 + 017 + 024** 네 건과 **통합 구현**된다. **구현 순서는 Phase 3 (Claude 훅) → Phase 4 (Codex fallback) → Phase 5 (검증/릴리스)**. 2.2.0 릴리스 안정화 후 2.3.0 주요 트랙으로 진행한다.

---

## 1. 로드맵 연계 매트릭스

| IMP-KIT ID | 우선순위 | 원래 범위 | 본 시스템 연계 역할 |
|-----------|:-:|----------|-------------------|
| **IMP-KIT-007** | P1 | `/plan-review` 자동 후속 트리거 | **메인 트리거 지점** — Stop 훅과 통합 |
| **IMP-KIT-016** | P1 | Checkpoint 자동 진행 플래그 | 아카이빙이 Checkpoint를 차단하지 않음을 보증 |
| **IMP-KIT-017** | P1 | 재복제 금지 Skill 강제 | 피드백 엔트리에 **SSOT 원칙 적용** — 원본 복제 금지 |
| **IMP-KIT-024** | P2 | 에이전트 호출 텔레메트리 | 피드백 `usage.agents_invoked` 필드의 **데이터 소스** |

---

## 2. 구현 순서 (Phase 3 ~ Phase 5)

### Phase 3 — Claude 훅 기본 구현 (4~6주)

**전제**: claude-kit 2.2.0 릴리스 완료.

```
3.1 기본 인프라 (1~2주)
    ├─ src/claude/core/hooks/feedback-collector.js (메인 스크립트)
    ├─ src/claude/core/_schemas/feedback-entry.schema.json
    └─ scripts/setup.js에 settings.json 훅 자동 등록
    
3.2 도메인별 수집 전략 (2~3주)
    ├─ plan 특화 필드 수집 로직
    ├─ copy 특화 필드 수집 로직
    └─ dev 특화 필드 수집 로직
    
3.3 index.md / stats.json 자동 생성 (1주)
```

**통합 대상**: IMP-KIT-007 (트리거 부분)

### Phase 4 — Codex fallback + 롤업 (4~6주)

```
4.1 Codex fallback artifact (2주)
    ├─ src/codex/core/commands/codex-feedback-collect.md
    ├─ src/codex/core/rules/feedback-archiving.md
    └─ 대상 커맨드 출력에 suggest 라인 추가 (23개 커맨드)
    
4.2 월 단위 롤업 자동화 (1~2주)
    ├─ scripts/feedback-rollup.js
    └─ _rollups/{YYYY-MM}.md 생성 로직
    
4.3 추가 옵션 (1~2주)
    ├─ --deep-analysis (LLM 요약)
    ├─ /plan-feedback-add (수동 추가)
    └─ redaction 정책 강화
```

**통합 대상**: IMP-KIT-016, IMP-KIT-017 (부분)

### Phase 5 — 검증 + 릴리스 (2~3주)

```
5.1 회귀 시나리오 (1주)
    ├─ dash-preview-phase3 복제 세션 1회 실행
    └─ 23개 대상 커맨드 × 2 runtime 엔트리 생성 확인
    
5.2 텔레메트리 데이터 분석 (1주)
    ├─ IMP-KIT-024 구현과 통합
    └─ 예상 지표 달성 여부 측정
    
5.3 2.3.0 릴리스 (1주)
    ├─ 릴리스 노트 작성
    └─ 마이그레이션 가이드 배포
```

**통합 대상**: IMP-KIT-024 (완전)

---

## 3. IMP-KIT별 상세 통합

### 3.1 IMP-KIT-007 (P1) — `/plan-review` 자동 후속 트리거

**원래 계획**: `/plan-prd`, `/plan-draft`, `/plan-wireframe` 종료 시 `/plan-review` 자동 실행.

**본 시스템 연계**:

- 같은 Stop 훅 패턴 사용 — matcher 확장만 필요
- 훅이 먼저 feedback-collector 실행 후, 연쇄적으로 plan-review 호출
- settings.json 예시:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "^/plan-(prd|draft|wireframe)$",
        "hooks": [
          { "type": "command", "command": "node .../feedback-collector.js" },
          { "type": "command", "command": "node .../auto-trigger-plan-review.js" }
        ]
      }
    ]
  }
}
```

**구현 순서**: Phase 3.1 (기본 인프라)와 동시. 훅 등록 로직이 동일하므로 일괄 구현.

### 3.2 IMP-KIT-016 (P1) — Checkpoint 자동 진행 플래그

**원래 계획**: `--auto-proceed-on-pass` 플래그로 Informational Checkpoint 스킵.

**본 시스템 연계**:

- 아카이빙이 Checkpoint를 차단하지 않음 (비차단 보증 — 01-architecture §6)
- auto-proceed 플래그는 **별도 구현**이나, 아카이브 엔트리에 **checkpoint 스킵 여부 기록**

**관련 필드**:
```json
{ "usage": { "checkpoints_auto_skipped": 2, "checkpoints_user_confirmed": 1 } }
```

**구현 순서**: IMP-KIT-016 완료 후 본 시스템의 수집 필드 확장 (Phase 3.2 종반).

### 3.3 IMP-KIT-017 (P1) — 재복제 금지 Skill 강제

**원래 계획**: 에이전트 프롬프트에 "기존 문서는 경로 인용, 복제 금지" 문장 추가.

**본 시스템 연계**:

- 피드백 엔트리도 **원본 회고 참조 금지** — 본 패키지의 README.md와 동일 원칙
- `entry_id`는 고유, 동일 세션에서 같은 커맨드 여러 번 실행 시에도 독립 엔트리 (덮어쓰기 금지)
- 관련 필드: `metadata.references = ["../some-other-entry.json"]`로 교차 참조

**구현 순서**: 본 시스템 구현 규약 수준에서 처음부터 준수. 별도 구현 없음.

### 3.4 IMP-KIT-024 (P2) — 에이전트 호출 텔레메트리

**원래 계획**: 세션당 에이전트별 호출 수 집계, `/session-wrap`이 참조.

**본 시스템 연계**:

- `usage.agents_invoked`가 **직접 데이터 소스** 역할
- 세션 종료 시 stats.json + `/session-wrap`이 이를 읽어 리포트 생성
- 본 시스템 구현이 사실상 IMP-KIT-024의 **데이터 수집 부분**을 먼저 구현하는 셈

**구현 순서**: Phase 3.1 기본 수집 구현 시 자연스럽게 포함. IMP-KIT-024는 본 시스템 릴리스와 함께 해결된 것으로 간주.

---

## 4. 2.3.0 릴리스 범위 갱신

본 시스템 도입에 따라 kit-2.2.0-roadmap의 **04-p1-backlog-summary.md** 내 2.3.0 계획이 수정된다:

### 4.1 기존 Phase 2.1 (원래)

```
IMP-KIT-007 → IMP-KIT-016 → IMP-KIT-017
```

### 4.2 갱신된 Phase 2.1 (본 시스템 통합)

```
Phase 2.1 = [Pipeline Feedback Archiving System]
  ├─ 본 설계 기반 훅 구현 (= IMP-KIT-007의 트리거 부분)
  ├─ Checkpoint 수집 필드 추가 (= IMP-KIT-016 수집 대상)
  ├─ 피드백 SSOT 원칙 (= IMP-KIT-017 일부 실현)
  └─ usage 필드 수집 (= IMP-KIT-024 데이터 수집 부분)
```

### 4.3 로드맵 갱신 영향

본 시스템 완료 시:

- IMP-KIT-007: **완료**
- IMP-KIT-016: 수집 필드만 완료, 자동 플래그 로직은 별도 과제 (2.3.0 후반)
- IMP-KIT-017: 본 시스템 내 적용 + 에이전트 프롬프트 수정 별도 필요 (2.3.0)
- IMP-KIT-024: **완료** (2.2.0+1 수준)

---

## 5. 릴리스 전략

### 5.1 단계적 도입

| 버전 | 상태 |
|------|------|
| 2.2.0 | 본 시스템 없음, Phase 1 로드맵만 |
| 2.3.0-alpha | Phase 3.1 완료 — Claude 훅 기본 동작 |
| 2.3.0-beta | Phase 3 완료 — 도메인별 수집 전략 |
| 2.3.0 | Phase 4 완료 — Codex fallback + 롤업 |
| 2.3.1 | Phase 5 검증 피드백 반영 |

### 5.2 opt-out 옵션

초기 도입 시 사용자 부담 감소를 위해 `feedback-disabled: true` 설정으로 전체 비활성화 가능. 기본값은 **활성화**.

### 5.3 마이그레이션 가이드

2.2.0 → 2.3.0 업그레이드 시:

1. `pnpm claude-kit:setup` 재실행 — settings.json 자동 주입
2. `.claude/feedback-archive/` 디렉토리 자동 생성
3. 기존 프로젝트 수동 개입 없음

---

## 6. 성공 지표 (본 시스템)

| 지표 | Phase 3 목표 | Phase 5 목표 |
|------|:-:|:-:|
| 훅 발동 성공률 | > 95% | **> 99%** |
| 엔트리 수집 평균 시간 | < 2초 | < 1초 |
| 월 평균 엔트리 수 | — | **> 50건** |
| Codex fallback 수동 트리거 누락률 | < 30% | **< 10%** |
| IMP-KIT 연계 엔트리 비율 | > 50% | **> 70%** |

---

## 7. 2.4.0+로 이월되는 항목

본 시스템 범위 외, 향후 검토:

- LLM 심층 분석 (`--deep-analysis`)
- 외부 도구 export (Linear/Jira 연동)
- 피드백 기반 **자동 IMP-KIT 업데이트** 제안
- 팀 단위 aggregation (선택적 중앙 서버 연동)

---

## 8. 리스크 및 완화

| 리스크 | 영향 | 완화 |
|--------|:-:|------|
| 훅 구현이 Phase 1 (2.2.0) 지연시킴 | 중 | Phase 2 설계만 선행, 구현은 2.2.0 후 |
| Codex fallback의 사용자 수용성 낮음 | 중 | `/session-wrap`에 자동 suggest 통합 |
| IMP-KIT-007 기대 성능이 본 시스템과 달라짐 | 저 | 두 기능을 별도 측정 가능하도록 지표 분리 |
| stats.json 스펙 버전 관리 부재 | 저 | IMP-KIT-014 (stage-manifest 스키마 버전 관리)와 동일 패턴 적용 |

---

## 9. Phase 3 착수 체크리스트

본 설계 패키지를 기반으로 Phase 3 착수 시:

- [ ] 본 패키지 8개 문서 리뷰 완료
- [ ] kit-2.2.0-roadmap 2.2.0 릴리스 완료
- [ ] IMP-KIT-014 (스키마 버전 관리) 원칙 수립 완료
- [ ] 훅 스크립트 담당자 배정
- [ ] 테스트 시나리오 정의 (dash-preview-phase3 복제)

---

## 10. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
