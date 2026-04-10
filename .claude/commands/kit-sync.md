---
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
description: kit-sync-agent를 호출하여 Claude↔Codex 동기화를 실행합니다.
argument-hint: '[--dry-run] [--auto-approve] [--domain <domain>] [--type <type>] [--name <name>]'
---

# /kit-sync

kit-sync-agent를 spawn하여 Claude 자산의 Codex 전환 동기화를 실행한다.

> 참조: `.claude/agents/kit-sync-agent.md`

## Usage

```bash
/kit-sync                          # 전체 동기화 (에이전트 자율 판단)
/kit-sync --dry-run                # 분석만, 파일 수정 없음
/kit-sync --domain <domain>        # 특정 도메인만 동기화
/kit-sync --type <type>            # 특정 타입만 동기화 (agent, command, skill, hook)
/kit-sync --name <name>            # 단일 자산 동기화
```

## 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--dry-run` | 분석만 수행, 실제 파일 수정 없음 | 꺼짐 |
| `--domain` | 처리 대상 도메인 필터 | 전체 |
| `--type` | 처리 대상 타입 필터 | 전체 |
| `--name` | 단일 자산 이름 지정 | 없음 |
| `--auto-approve` | 승인 게이트 건너뛰기 (CI 환경용) | 꺼짐 |

## Workflow

### Phase 1: 인자 파싱

1. 입력 인자를 파싱하여 실행 범위와 모드를 결정한다.
2. `--dry-run` 여부에 따라 에이전트 실행 모드를 설정한다.

### Phase 2: 에이전트 Spawn

3. kit-sync-agent를 spawn하여 동기화 작업을 위임한다.
4. 에이전트는 Investigation_Protocol에 따라 자율적으로 판단하고 실행한다:
   - `--dry-run`: 분석 결과만 출력, 파일 수정 없음
   - 파일 수정 모드: 전환 + 교차 참조 수정 + pairing-registry 갱신 실행

### Phase 3: 결과 리포트 출력

5. 에이전트의 실행 결과를 수신하여 출력한다:
   - 전환된 자산 목록
   - 수정된 교차 참조 목록
   - exception-registry에 등록된 면제 항목
   - 수동 검토가 필요한 항목 목록

## Rules

- `--dry-run` 없이 실행하면 파일을 수정할 수 있다. 신중하게 사용한다.
- `src/exception-registry.json`의 active 항목은 자동으로 면제된다.
- 멱등성이 보장된다. 이미 paired인 자산은 재처리하지 않는다.
- `_archive/` 디렉토리는 처리 대상에서 제외된다.
- 10개 초과 미전환 자산 발견 시 에이전트가 사용자 승인을 요청한다.
