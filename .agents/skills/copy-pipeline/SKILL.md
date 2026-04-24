<!-- kit:managed source=src/codex/copy/skills/copy-pipeline/SKILL.md hash=65f803f3713839d97f0cdb45bda238740b463fd198ab4375457ab268e678e11f -->
<!-- kit-convert generated: 2026-04-24 -->
---
name: copy-pipeline
description: 전체 copy 충실도 파이프라인 워크플로우 가이드
---

# Copy Fidelity Pipeline

원본 디자인과 구현물 사이의 시각적/인터랙션 충실도를 체계적으로 검증하는 파이프라인이다.

## 시나리오 라우팅

파이프라인 진입 시, 입력 조건에 따라 세 가지 시나리오로 분기한다.

### 의사결정 트리

```
입력 조건 확인
├── A: 디자인 + 구현 모두 존재 → 풀 파이프라인
├── B: 디자인만 존재 (구현 미완) → Evidence 수집 후 대기
└── C: 구현만 존재 (디자인 부재) → Reference Baseline 생성
```

- **시나리오 A**: Evidence 수집 → Gap 분석 → QA 검증 → Closeout
- **시나리오 B**: Evidence 수집 → Manifest 생성 → dev 도메인 구현 완료 대기
- **시나리오 C**: Reference Baseline 캡처 → 디자인 도착 시 시나리오 A 전환

## 시나리오별 커맨드 시퀀스

### 시나리오 A (풀 파이프라인)

1. `/copy-evidence` — 디자인/구현 evidence 수집
2. `/copy-gap` — VF/IF 갭 분석 수행
3. `/copy-qa` — 9단계 QA 검증
4. `/copy-closeout` — 완료 처리 및 아카이브

### 시나리오 B (디자인만 존재)

1. `/copy-evidence` — 디자인 evidence만 수집
2. dev 도메인 구현 완료 알림 대기
3. 시나리오 A 1단계부터 재실행

### 시나리오 C (구현만 존재)

1. `/copy-baseline` — Reference Baseline 캡처
2. 디자인 전달 대기
3. 시나리오 A 전환

## Feature 타입 라우팅

Feature 유형에 따라 copy/dev 도메인 책임이 나뉜다.

| Feature 유형 | 주관 도메인 | 보조 도메인 |
|---|---|---|
| UI 중심 | copy | dev (구현) |
| 로직 중심 | dev | copy (시각 검증) |
| 풀스택 | dev + copy 병렬 | 상호 검증 |

## 도메인 통합

- **plan 도메인**: PRD에서 Feature slug, acceptance criteria 수신
- **dev 도메인**: 구현 완료 시 evidence 갱신 트리거, gap fix 요청 전달
- **copy 도메인**: QA 결과를 plan 도메인의 phase gate에 보고

## 참조

- Evidence 관리: `copy-evidence-management` 스킬
- Gap 분석: `copy-gap-analysis` 스킬
- QA 검증: `copy-qa-workflow` 스킬
- Closeout: `copy-closeout-workflow` 스킬

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/copy/skills/copy-pipeline/SKILL.md`
