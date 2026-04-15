---
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
description: Claude 자산을 Codex 형식으로 전환합니다.
argument-hint: '[--name <name>] [--type <type>] [--domain <domain>] [--all] [--dry-run] [--force]'
---

# /kit-convert

Claude 자산을 Codex 형식으로 변환하여 `src/codex/`에 생성하고 pairing-registry를 갱신한다.

> 참조: `.claude/skills/kit-converter/SKILL.md`

## Usage

```bash
/kit-convert --name dev-architect              # 단일 변환
/kit-convert --name dev-architect --dry-run     # 미리보기
/kit-convert --type skill                       # 모든 스킬 변환
/kit-convert --domain dev                       # dev 도메인 전체
/kit-convert --all                              # 변환 가능한 전체
/kit-convert --domain dev --force               # 기존 파일 덮어쓰기
```

## 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--name <name>` | 단일 컴포넌트 변환 | - |
| `--type <type>` | 타입별 전체 변환 | - |
| `--domain <domain>` | 도메인별 전체 변환 | - |
| `--all` | 변환 가능한 전체 | - |
| `--dry-run` | 미리보기 (파일 생성 안 함) | 꺼짐 |
| `--force` | 기존 Codex 파일 덮어쓰기 | 꺼짐 |

`--name`, `--type`, `--domain`, `--all` 중 하나만 지정. `--type rule`은 거부.

## Workflow

### Phase 1: 범위 결정 + 검증

1. 인자를 파싱하여 변환 대상 목록을 결정한다.
2. 각 대상의 난이도를 분류한다 (auto / review / skip).
3. `skip` 항목은 필터링하고 로그로 기록한다.
4. `--force` 없이 기존 Codex 파일이 있으면 충돌 목록을 출력하고 중단한다.

### Phase 2: 미리보기 (--dry-run)

5. `--dry-run`이면 변환 계획만 출력하고 종료:

```
[kit-convert --dry-run] 변환 계획

  변환 대상: N개
  건너뛰기: M개 (codex-skip)

  | Identity        | Type    | Source                                   | Target                                   | Difficulty |
  |-----------------|---------|------------------------------------------|------------------------------------------|------------|
  | dev-architect   | agent   | src/claude/dev/agents/dev-architect.md   | src/codex/dev/agents/dev-architect.md    | auto       |
  ...
```

### Phase 3: 변환 실행

6. 타입별 변환 규칙을 적용한다 (`kit-converter/references/conversion-rules.md` 참조):
   - **Skill**: 내용 복사 + "Codex 참고 사항" 섹션 추가 + references/ 복사
   - **Agent**: XML Agent_Prompt → 헤딩 기반 변환 (agent-section-mapping.md 참조)
   - **Command**: 슬래시 커맨드 → Entry Flow 변환
   - **Hook**: JS 복사 + Codex 등록 주석 추가
   - **Rule**: paired-fallback (`AGENTS.md.template` merge artifact 활용, 별도 변환 파일 생성 안 함)

### Phase 4: 페어링 레지스트리 갱신

7. 변환 성공 자산을 `src/pairing-registry.json`에 `paired`로 등록한다.
8. skip 자산을 `codex-skip` + reason으로 등록한다.
9. 기존 엔트리가 있으면 업데이트한다.

### Phase 5: 결과 출력

10. 변환 결과를 출력한다:

```
[kit-convert] 변환 완료

  변환: N개 (auto: X, review: Y)
  건너뛰기: M개 (codex-skip)

  | Identity        | Type    | Status  | Target                                  | Review? |
  |-----------------|---------|---------|----------------------------------------|---------|
  | dev-architect   | agent   | paired  | src/codex/dev/agents/dev-architect.md  | No      |
  | plan-prd-writer | agent   | paired  | src/codex/plan/agents/plan-prd-writer.md | YES   |
  ...

  다음 단계:
  1. "YES" 표시 파일을 수동 검토하세요
  2. /kit-validate --target codex 로 스키마 검증
  3. /kit-audit --category C7 으로 페어링 일관성 확인
```

## Rules

- `--force` 없이 기존 파일 덮어쓰지 않는다.
- `--dry-run` 시 파일 생성 안 함.
- `--type rule`은 거부 (discrete 변환 파일 없음 — `AGENTS.md.template` inline merge가 fallback artifact, paired-fallback).
- 변환 파일 상단에 `<!-- kit-convert generated: {날짜} -->` 추적 주석.
- review 난이도 파일에 `<!-- REVIEW NEEDED: {사유} -->` 마커.
- 변환 후 git add 하지 않는다 (사용자 커밋).
- 변환 중 단일 자산 실패 시 건너뛰고 다음 자산으로 진행 (중단하지 않음).
