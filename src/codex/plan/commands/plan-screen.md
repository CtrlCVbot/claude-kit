<!-- kit-convert generated: 2026-04-20 -->
# plan-screen — Codex Entry Flow

## Overview

IDEA-{YYYYMMDD}-{NNN} 스크리닝 실행. **RICE 또는 5축 가중** 프레임워크를 명시적으로 선택하여 Go/Hold/Kill 판정을 **제안**한 뒤, 사용자 **명시적 승인**을 거쳐 상태를 전환합니다.

## Invocation

```
plan-screen IDEA-20260325-001                          # 기본 프레임워크로 스크리닝
plan-screen IDEA-20260325-001 --framework rice         # RICE 프레임워크 명시
plan-screen IDEA-20260325-001 --framework 5axis        # 5축 가중 프레임워크 명시
plan-screen IDEA-20260325-001 --rescore                # 기존 스크리닝 재평가
plan-screen --pending                                   # 미스크리닝 아이디어 일괄 스크리닝
plan-screen --pending --auto-approve                    # 일괄 스크리닝 + Go 판정 자동 승인
```

## Flags

- `--framework rice` — Intercom RICE 공식 (Reach × Impact × Confidence / Effort)
- `--framework 5axis` — 5축 가중 점수 (비즈니스/사용자/기술/전략/긴급도, 0-100)
- 생략 시: 프로젝트 AGENTS.md/CLAUDE.md의 `idea-screening framework` 기본값 사용. 기본값 미설정 시 `rice`로 폴백 + 출력에 명시적 고지.
- **잘못된 값 거부**: `--framework`에 `rice` / `5axis` 이외 값이 주어지면 즉시 실패하고 `프레임워크는 rice 또는 5axis 중 하나여야 합니다` 에러를 반환한다. 임의 폴백 금지.
- `--rescore` — 기존 스크리닝 결과 재평가 (framework 변경 가능, 아래 §Rescore 정책 참조)
- `--pending` — 미스크리닝 아이디어 일괄 처리
- `--auto-approve` — 배치 작업에서 Go 판정 자동 승인 (Go 기준은 위 §Framework 임계값 표를 사용한 프레임워크별 판정 따름)

## Rescore 정책 (--rescore + framework 변경)

`--rescore`로 framework를 이전과 다르게 지정하면:

1. 기존 `SCREENING-{YYYYMMDD}-{NNN}.md`를 `SCREENING-{YYYYMMDD}-{NNN}-{prev_framework}.md`로 rename하여 이력 보존
2. 새 framework 기준으로 `SCREENING-{YYYYMMDD}-{NNN}.md`를 재생성
3. `screening-matrix.md`의 해당 행에 `framework` 컬럼을 신규 값으로 갱신
4. 기존 5축 결과 파일은 **절대 재작성하지 않음** (rename 이후 원본 보존)

Framework가 동일한 경우 `--rescore`는 기존 파일을 덮어쓸 수 있다 (기존 동작 유지).

## Framework 임계값

| 프레임워크 | Go | Hold | Kill |
|:-:|:-:|:-:|:-:|
| RICE | ≥ 10.0 | 2.0 ~ 10.0 | < 2.0 |
| 5axis | 70+ | 40 ~ 69 | < 40 |

임계값은 프로젝트별 조정 가능 (AGENTS.md/CLAUDE.md `idea-screening thresholds` 섹션).

## Workflow

1. **프레임워크 결정**: `--framework` 인자 → AGENTS.md/CLAUDE.md 기본값 → `rice` 폴백 순으로 해석
2. **대상 확인**: `backlog.md` 인덱스에서 위치 확인 → 해당 폴더의 IDEA 파일 로드
3. **에이전트 스폰**: `plan-idea-screener` 에이전트 호출 (framework 인자 전달)
   - IDEA 파일을 `00-inbox/` → `10-screening/`으로 이동
   - 선택된 프레임워크로 평가 + Go/Hold/Kill **제안** 산출
   - `SCREENING-{YYYYMMDD}-{NNN}.md`를 `10-screening/`에 생성 (첫 줄에 프레임워크 명시)
   - `backlog.md` 상태를 `screened`로, 위치를 `10-screening`으로 업데이트
4. **PCC-01 검증**: 모든 아이디어가 스크리닝되었는지 확인
5. **Human Checkpoint 1 — 점수 확인**: 점수 확인/오버라이드 기회 제공
6. **Human Checkpoint 2 — 승인 결정** (핵심 게이트):
   - 각 아이디어에 대해 승인/보류/반려 결정을 사용자에게 요청
   - **승인** → IDEA + SCREENING 파일을 `10-screening/` → `20-approved/`로 이동, 상태 `approved`
   - **보류** → 파일을 `10-screening/` → `90-archive/`로 이동, 상태 `on-hold`
   - **반려** → 파일을 `10-screening/` → `90-archive/`로 이동, 상태 `rejected`
   - `backlog.md` 인덱스의 상태 + 위치 컬럼 업데이트
7. **`--auto-approve` 옵션**: Go 제안 아이디어를 Checkpoint 2 생략하고 자동 승인 (배치 작업용)

## 출력 스키마

- RICE: `src/codex/plan/_schemas/rice.schema.json`
- 5축: `src/codex/plan/_schemas/5axis.schema.json`

## Output

- `.plans/ideas/10-screening/SCREENING-{YYYYMMDD}-{NNN}.md` 개별 파일에 상세 점수 및 판정 기록 (첫 줄에 사용한 framework 명시)
- `screening-matrix.md` 인덱스에 요약 행 반영 (framework 컬럼 포함)
- 승인된 아이디어는 `20-approved/`로 이동
- Lite/Standard 카테고리 판정 포함
- WBS 계층 예비 분류: Epic(10+ 파일, 5+ 뷰포트) / Feature(3~10 파일) / Story(1~3 파일) / Task(단일 파일)
- 충실도 해석: RICE Impact 또는 5축 사용자 영향에 시각적 충실도 영향도를 반영 (copy 도메인 활성 시)
- 다음 단계 안내: `plan-draft IDEA-{YYYYMMDD}-{NNN}` (approved 상태에서만)

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/plan/commands/plan-screen.md
