<!-- kit-convert generated: 2026-04-20 -->
<!-- REVIEW NEEDED: complex command -->
# plan-design — Codex Entry Flow

PRD + Wireframe을 통합하여 Claude Design용 2단계 프롬프트(wireframe → high fidelity)를 생성하고, 결과 URL을 등록한다. Hybrid dev Feature 또는 시각 자산이 필요한 copy Feature에서 사용.

> 에이전트: `plan-design-writer` (IMP-KIT-027로 신설)
> 전제: `plan-wireframe` **필수 선행**
> 택일: `plan-stitch`와 wireframe 후속 단계 택일 (순차 실행 시 `--force-sequential`)

## Overview

Claude Design (2026-04-17 출시, https://claude.ai/design) 통합 경로를 제공한다. PRD(요구사항)와 Wireframe(구조)을 통합하여 Claude Design의 두 모드(Wireframe/High Fidelity)에 최적화된 프롬프트를 순차 생성한다.

## Invocation

```bash
plan-design {slug}
plan-design {slug} --fidelity wireframe
plan-design {slug} --fidelity high
plan-design {slug} --register <url>
plan-design {slug} --ignore-mismatch
plan-design {slug} --force-sequential --sequential-reason "이유"
```

## Flags

- `--fidelity wireframe|high` — 프롬프트 생성 범위 제한. 생략 시 둘 다 생성 (기본).
- `--register <url>` — claude.ai/design 결과 URL 등록. 검증: scheme **정확히 `https`** + hostname **정확히 `claude.ai`** (서브도메인 불허, userinfo 차단). 경로는 `/design/*` 권장.
- `--force-sequential` — routing-metadata의 `post_wireframe_path`가 이미 `stitch`인 경우에도 진행.
- `--sequential-reason "..."` — `--force-sequential`과 함께 필수.
- `--ignore-mismatch` — SCR-ID ↔ Wireframe 매핑 불일치 시 경고만 출력하고 진행. 기본은 거부.

## Required Inputs

- routing-metadata: `.plans/features/active/{slug}/00-context/07-routing-metadata.md` (`category: Standard` 필수, Lite는 거부)
- **승인된 PRD**: `.plans/prd/10-approved/{slug}-prd.md` (first-pass 단독은 거부)
- **Wireframe** (IMP-KIT-027 필수 선행): `.plans/wireframes/{slug}/`

## Workflow

1. **입력 검증**:
   - routing-metadata 존재 + `category: Standard` 필수 (Lite는 거부 + `dev-feature`/`copy-reference-refresh` 직행 안내)
   - 승인된 PRD 존재 확인 (first-pass는 거부)
   - **wireframe 디렉터리 존재 필수**. 미존재 시 `plan-wireframe {slug}` 선행 안내 + 중단
2. **배타 게이트 확인** (IMP-KIT-027 §2.6):
   - routing-metadata의 `post_wireframe_path` 값 확인
   - `null` | `design` | `design+stitch` | `stitch+design`: 정상 진행
   - `stitch`: 경고 + `--force-sequential` 플래그 필요
   - `skipped`: 경고 + 사용자 재확인
3. **에이전트 스폰**: `plan-design-writer` 에이전트 호출
   - 에이전트가 수행:
     - PRD + Wireframe 통합 로드
     - 컨텍스트 추출 (SCR-ID, 컴포넌트, 반응형, decision-log, viewport 판정)
     - SCR-ID ↔ wireframe 화면 매핑 테이블 구성
     - `--fidelity` 플래그에 따라 2개 또는 1개 프롬프트 템플릿 렌더링
     - `.plans/design/{slug}/` 디렉터리 생성 + 프롬프트 파일 저장
     - `--register` 플래그 시 manifest.md 생성/갱신
     - routing-metadata의 `post_wireframe_path` 갱신
4. **stdout 2단계 안내** 출력
5. **Human Checkpoint**: 생성된 프롬프트 파일 경로 + 사용자 실행 가이드 확인

## Output

- `.plans/design/{slug}/prompt-01-wireframe.md` (--fidelity high 지정 시 생략)
- `.plans/design/{slug}/prompt-02-highfidelity.md` (--fidelity wireframe 지정 시 생략)
- `.plans/design/{slug}/manifest.md` (--register 호출 시)
- routing-metadata.post_wireframe_path 갱신

## Rules

- wireframe 선행 필수
- PRD + Wireframe 불일치 감지 시 경고 (`--ignore-mismatch` 플래그 우회 가능)
- `--register` 시 claude.ai 도메인 외 URL 거부
- 프롬프트 템플릿은 `src/codex/plan/_templates/design-prompt-{wireframe,highfidelity}.template.md` SSOT
- routing-metadata 갱신은 post_wireframe_path 필드만

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/plan/commands/plan-design.md
