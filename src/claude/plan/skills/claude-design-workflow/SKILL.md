---
name: claude-design-workflow
description: >
  Claude Design (https://claude.ai/design) 통합 워크플로우 가이드. PRD + Wireframe 통합 기반 2단계 프롬프트(wireframe → high fidelity) 생성, SCR-ID 강제 주입 규칙, fidelity 모드 선택 기준, 디자인 시스템 연동, 익스포트 포맷별 활용. Use when: /plan-design 실행, Claude Design 프롬프트 작성, wireframe 후속 시각 자산 생성, claude.ai/design 언급 시.
---

## Overview

Anthropic이 2026-04-17 출시한 Claude Design을 claude-kit plan 파이프라인에 통합하는 워크플로우. **PRD(요구사항) + Wireframe(구조)** 을 통합하여 Claude Design 프롬프트 2개를 순차 생성하고, 사용자가 claude.ai/design에서 수동 실행 후 결과 URL을 등록한다.

**스코프 제한**: Claude Design은 브라우저 GUI 전용이므로 **API/CLI 자동 호출 불가**. 본 스킬의 자동화 범위는 "프롬프트 생성 + 결과 등록"까지. 실제 디자인 생성은 사용자가 claude.ai/design에서 수동 수행.

## Prerequisites

- Feature가 wireframe 단계 완료 상태 (`.plans/wireframes/{slug}/` 존재)
- PRD 승인본 또는 first-pass 문서 존재
- routing-metadata에 feature_type/category 필드 채움 (plan-draft-writer 선행)
- (사용자) Claude Pro/Max/Team/Enterprise 구독 (Claude Design 유료 기능)

## 2단계 프롬프트 워크플로우

### 1단계: Wireframe 프롬프트

**목적**: Claude Design의 wireframe 모드로 **rough 시안** 확인. 레이아웃/컴포넌트 배치/네비게이션 중심. 브랜드 세부는 최소화.

**템플릿**: `_templates/design-prompt-wireframe.template.md`

**포함 지시**:
- "Wireframe 모드로 실행"
- 화면별 ASCII 레이아웃 (wireframe 기반)
- 컴포넌트 계층
- 네비게이션 흐름
- 반응형 요구사항 (desktop/tablet/mobile 3개 viewport)
- 저포화 색상 / 텍스트 플레이스홀더 허용

### 2단계: High Fidelity 프롬프트

**목적**: wireframe 단계 만족 후 동일 세션에서 **High Fidelity 모드**로 전환하여 고품질 최종 디자인 생성.

**템플릿**: `_templates/design-prompt-highfidelity.template.md`

**포함 지시**:
- "High Fidelity 모드로 전환" + wireframe 결과 기준 유지
- 브랜드 컬러 / 타이포그래피 / 이미지
- 마이크로인터랙션
- viewport별 breakpoint 상세 (desktop 1280+, tablet 768-1279, mobile 0-767 등)
- 디자인 시스템 연동 (존재 시)

## 프롬프트 생성 규칙

### PRD + Wireframe 통합 로드

두 입력 모두 필수. 하나라도 없으면 `/plan-design` 거부 + 선행 커맨드 안내.

```
PRD 추출:
- SCR-ID 목록 (User Stories, UX Requirements)
- REQ-{feat}-001~nnn
- 반응형/접근성/브랜드 요구사항
- Success Metrics

Wireframe 추출:
- screens/*.md (각 화면 ASCII 레이아웃)
- components/*.md (컴포넌트 계층)
- navigation.md (화면 간 이동)
- decision-log.md (의사결정 근거)
- viewport별 판정 (desktop/tablet/mobile)
```

### SCR-ID ↔ Wireframe 매핑 강제

- wireframe-designer가 기록한 `SCR-001 ↔ screens/home.md` 형식 연결 추출
- 매칭 누락 시 경고 + 대상 SCR-ID/screen 목록 보고
- `--ignore-mismatch` 플래그 명시 시 경고만 출력하고 진행
- **목표**: Claude Design 결과물의 SCR-ID 커버리지 100%

### Fidelity 모드 선택 기준

| 조건 | 권장 플래그 |
|------|:-:|
| 기본 (Claude Design 첫 사용) | 둘 다 생성 (생략) |
| 간단한 Feature, 시각 자산 최소 | `--fidelity wireframe` (1단계만) |
| 이미 wireframe 시안 확보, 고품질만 | `--fidelity high` (2단계만) |
| 반복 개선 (wireframe → 조정 → high fidelity) | 둘 다 생성 |

## 디자인 시스템 연동

프로젝트에 디자인 시스템이 있는 경우 (Figma library, 디자인 토큰 등):

- 프롬프트에 "디자인 시스템 {이름}을 참조하여 컴포넌트 일관성 유지" 지시 포함
- Claude Design이 코드베이스/디자인 파일을 읽을 수 있는 경우 연동 링크 기입
- Feature 범위 안의 새 컴포넌트는 기존 시스템 확장 방식으로 제안 요청

## 익스포트 포맷 선택

Claude Design 결과를 어떤 포맷으로 내보낼지:

| 포맷 | 용도 |
|------|------|
| **URL** (claude.ai/design 링크) | 공유/리뷰용. `--register`로 등록 |
| **PDF** | 고정 시연/발표용 |
| **PPTX** | 팀 미팅/투자 제안 |
| **Canva** | 후속 편집/브랜드 조정 |

`--register` 시 URL 외 로컬 파일 경로 지원은 IMP-KIT-027 §3.3 IMPROVE (2.2.1+ 예정).

## 배타 게이트 / 순차 실행

`/plan-design`은 `/plan-stitch`와 **wireframe 후속 단계 택일** (기본). 순차 실행이 필요한 경우:

```bash
# stitch 선택 후 design 추가 실행
/plan-design {slug} --force-sequential --sequential-reason "시각 자산 후 통합 검증"
```

routing-metadata의 `post_wireframe_path` 필드가 갱신되어 추적 가능.

## bridge 진입 시 Checkpoint

design/stitch 어느 것도 실행하지 않은 상태에서 `/plan-bridge` 호출 시, plan-bridge-writer가 사용자에게 확인 Checkpoint:

```
⚠️ wireframe 후속 단계(design/stitch)가 선택되지 않았습니다.
1) /plan-design {slug} 실행
2) /plan-stitch {slug} 실행
3) 건너뛰기 (간단 Feature)
```

사용자 선택에 따라 routing-metadata의 `post_wireframe_path: skipped` + `skip_reason` 기록.

## 사용자 워크플로우 요약

```
1. /plan-prd {slug}                       # PRD 완성
2. /plan-wireframe {slug}                 # Wireframe 필수 선행
3. /plan-design {slug}                    # 2단계 프롬프트 생성
4. (사용자) claude.ai/design에서 수동 실행
   - 1단계: prompt-01-wireframe.md 붙여넣기 → Wireframe 모드
   - 2단계: prompt-02-highfidelity.md 이어서 → High Fidelity 모드
5. /plan-design {slug} --register <url>   # 결과 등록
6. /plan-bridge {slug}                    # 개발 핸드오프
```

## 관련 파일

- 커맨드: `src/claude/plan/commands/plan-design.md`
- 에이전트: `src/claude/plan/agents/plan-design-writer.md`
- 템플릿: `src/claude/plan/_templates/design-prompt-{wireframe,highfidelity}.template.md`
- 매니페스트: `src/claude/plan/_templates/design-manifest.template.md`
- 스키마: `src/claude/plan/_schemas/routing-metadata.schema.json`
- 스펙: `docs/plan/kit-2.2.0-roadmap/03-p0-detailed-specs/IMP-KIT-027-plan-design-integration.md`
