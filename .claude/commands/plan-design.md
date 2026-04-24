# /plan-design

PRD + Wireframe을 통합하여 Claude Design용 **2단계 프롬프트**(wireframe → high fidelity)를 생성하고, 결과 URL을 등록한다. Hybrid dev Feature 또는 시각 자산이 필요한 copy Feature에서 사용.

> 에이전트: `plan-design-writer` (IMP-KIT-027로 신설)
> 전제: `/plan-wireframe` **필수 선행** (wireframe 없이 호출 시 거부)
> 택일: `/plan-stitch`와 **wireframe 후속 단계 택일** (순차 실행 시 `--force-sequential`)

## Usage

```bash
/plan-design {slug}                                      # 기본: wireframe + high fidelity 프롬프트 2개 순차 생성
/plan-design {slug} --fidelity wireframe                 # 1단계(wireframe)만 생성
/plan-design {slug} --fidelity high                      # 2단계(high fidelity)만 생성
/plan-design {slug} --register <url>                     # 결과 URL 등록
/plan-design {slug} --ignore-mismatch                    # SCR-ID ↔ Wireframe 매핑 불일치 무시 (경고만)
/plan-design {slug} --force-sequential --sequential-reason "이유"  # stitch 선택 후에도 순차 실행
```

## Flags

- `--fidelity wireframe|high` — 프롬프트 생성 범위 제한. 생략 시 **둘 다 생성** (기본).
- `--register <url>` — claude.ai/design 결과 URL 등록. URL 검증 규칙: scheme은 **정확히 `https`** + hostname은 **정확히 `claude.ai`** (서브도메인 불허, userinfo spoofing 차단). 경로는 `/design/*` 권장. 검증 통과 시 `manifest.md` 생성/갱신.
- `--force-sequential` — routing-metadata의 `post_wireframe_path`가 이미 `stitch`인 경우에도 진행 (배타 원칙 우회).
- `--sequential-reason "..."` — `--force-sequential`과 함께 필수 (감사 추적).
- `--ignore-mismatch` — PRD의 SCR-ID가 wireframe 화면에 매핑되지 않는 경우 경고만 출력하고 진행. 기본(미지정 시)은 **거부**.

## Required Inputs

- routing-metadata: `.plans/features/active/{slug}/00-context/07-routing-metadata.md` (`category`는 **Standard 필수**, Lite는 거부)
- 승인된 PRD: `.plans/prd/10-approved/{slug}-prd.md` (first-pass 단독은 거부 — wireframe 기반 프롬프트는 승인된 PRD를 요구)
- **Wireframe** (IMP-KIT-027 필수 선행): `.plans/wireframes/{slug}/`

## Workflow

1. **입력 검증**:
   - routing-metadata 존재 + **`category: Standard` 필수** (Lite는 거부 + `/dev-feature` 또는 `/copy-reference-refresh` 직행 안내)
   - **승인된 PRD** 존재 확인 (`.plans/prd/10-approved/{slug}-prd.md`). 없으면 `/plan-prd` 완료 + 승인 필요 안내 + 중단
   - **wireframe 디렉터리 존재 필수**. 미존재 시 `/plan-wireframe {slug}` 선행 안내 + 중단
2. **배타 게이트 확인** (IMP-KIT-027 §2.6):
   - routing-metadata의 `post_wireframe_path` 값 확인
   - `null` | `design` | `design+stitch` | `stitch+design`: 정상 진행
   - `stitch`: 경고 + `--force-sequential` 플래그 필요
   - `skipped`: 경고 + 사용자 재확인
3. **에이전트 스폰**: `plan-design-writer` 에이전트를 Task tool로 호출
   - 에이전트가 수행:
     - PRD + Wireframe 통합 로드 (IMP-KIT-027 v2.1 요구사항)
     - 컨텍스트 추출 (SCR-ID, 컴포넌트, 반응형, decision-log, viewport 판정)
     - SCR-ID ↔ wireframe 화면 매핑 테이블 구성
     - `--fidelity` 플래그에 따라 2개 또는 1개 프롬프트 템플릿 렌더링:
       - `prompt-01-wireframe.md`: Claude Design wireframe 모드용
       - `prompt-02-highfidelity.md`: Claude Design high fidelity 모드용 (wireframe 산출물 기준 유지)
     - `.plans/design/{slug}/` 디렉터리 생성 + 프롬프트 파일 저장
     - `--register` 플래그 시 manifest.md 생성/갱신 (URL 도메인 검증 포함)
     - routing-metadata의 `post_wireframe_path` 갱신 (design / design+stitch / stitch+design)
4. **stdout 2단계 안내**:
   ```
   [1단계] prompt-01-wireframe.md → claude.ai/design에 붙여넣기 → Wireframe 모드 실행
   [2단계] 만족 시 prompt-02-highfidelity.md → 동일 세션에서 이어서 → High Fidelity 모드 전환
   최종 URL은 `/plan-design {slug} --register <url>`로 등록하세요.
   ```
5. **Human Checkpoint**: 생성된 프롬프트 파일 경로 + 사용자 실행 가이드 확인

## Output

- `.plans/design/{slug}/prompt-01-wireframe.md` (--fidelity high 지정 시 생략)
- `.plans/design/{slug}/prompt-02-highfidelity.md` (--fidelity wireframe 지정 시 생략)
- `.plans/design/{slug}/manifest.md` (--register 호출 시)
- routing-metadata.post_wireframe_path 갱신

## Rules

- wireframe 선행 필수 (wireframe 없이 호출 시 거부)
- PRD + Wireframe 불일치(예: PRD의 SCR-ID가 wireframe에 없음) 감지 시 경고 + 대상 목록 보고. `--ignore-mismatch` 플래그로 우회 가능
- `--register` 시 claude.ai 도메인 외 URL 거부 (PDF/PPTX 로컬 경로는 허용 예정 — IMP-KIT-027 §3.3 IMPROVE)
- 프롬프트 템플릿은 `src/claude/plan/_templates/design-prompt-{wireframe,highfidelity}.template.md` SSOT
- routing-metadata 갱신은 자의적 변경 금지. post_wireframe_path 필드만 수정.

## 연계

- IMP-KIT-003 (plan-draft-writer): Hybrid 자동 감지 → routing-metadata 생성 시점 + `post_wireframe_path: null` 초기값 기록
- IMP-KIT-004 (plan-bridge-writer): Hybrid dev 경로에서 **시각 자산 프롬프트 생성**용으로 본 커맨드 호출 안내
- IMP-KIT-006 (Hybrid 모드): `/copy-reference-refresh --reference-only`는 **evidence 캡처**만 담당 — 본 커맨드는 **Claude Design용 프롬프트 생성**으로 역할 분리
- 본 커맨드 완료 후: `/plan-bridge {slug}`로 개발 핸드오프
