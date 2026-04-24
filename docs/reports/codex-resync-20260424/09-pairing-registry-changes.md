# 09. Pairing Registry Changes

> **`src/pairing-registry.json` 의 Phase 2 재생성 시 발생한 변경 분석.** 파일 라인 수 증가의 실제 이유, `contentHash` / `lastSyncedAt` 갱신 방식, 무엇이 바뀌었고 무엇이 그대로인지 기록.

## 레지스트리 구조 (v2)

`$schema: "pairing-registry-v2"`. 각 entry 는 다음 필드를 가진다:

| 필드 | 타입 | 설명 |
|------|------|------|
| identity | string | 컴포넌트 고유 식별자 (kebab-case) |
| type | string | `hook`, `skill`, `agent`, `command`, `rule` |
| domain | string | `core`, `dev`, `plan`, `copy` |
| status | enum | `paired` / `codex-skip` / `unpaired` |
| reason | string | (optional) 상태 사유 |
| claude | string | Claude source 상대 경로 |
| codex | string | Codex 상대 경로 (null if skip/unpaired) |
| createdAt | ISO 8601 | 엔트리 생성 시각 |
| primaryCodex | string | Codex 쪽 primary 파일 타입 |
| driftStatus | null/string | Drift 감지 마커 |
| **lastSyncedAt** | ISO 8601 | **마지막 sync 시각** ← 갱신 대상 |
| **contentHash** | string(8) | **SHA-256 앞 8자 hex** ← 갱신 대상 |
| exceptionId | string | (optional) 연결된 exception ID |
| transitionState | enum | (command 전용) 변환 상태 |

## 변경 요약

| 항목 | 변경 전 (Phase 1) | 변경 후 (Phase 2) | 차이 |
|------|:---:|:---:|:---:|
| 총 entries | 125 | 125 | 0 |
| status: paired | 114 | 114 | 0 |
| status: codex-skip | 6 | 6 | 0 |
| status: unpaired | 5 | 5 | 0 |
| 파일 라인 수 | 1699 | 1819 | **+120** |
| 새 필드 추가 (`lastSyncedAt` + `contentHash`) | 일부만 존재 | 114 paired 전원 | — |

**라인 수 증가의 이유**: 대부분의 paired entries 가 `lastSyncedAt` 또는 `contentHash` 를 **갖지 않던 상태**였다. Phase 2 에서 114 entries 전원에 두 필드를 추가했으므로 entry 당 약 +1 라인씩 = 약 +120 라인 증가.

## lastSyncedAt 일괄 갱신

**갱신 값**: `"2026-04-24T01:47:44.210Z"` (kit-sync-agent 가 `new Date().toISOString()` 호출 시점)

**대상**: 114 paired entries 전원

**의미**: 이 시각에 Claude source 와 Codex 파일이 동기화되었음을 기록. 이후 `/kit-audit` 등이 drift 감지 시 이 baseline 과 비교.

**갱신 전 분포** (backup 브랜치 기준):
- 대부분 entries 의 `lastSyncedAt` 가 `"2026-04-17T00:00:00.000Z"` 초기값 또는 `resync-2026-04-23` marker
- **Drift 감지 baseline 으로 신뢰하기 어려운 상태**
- Phase 2 재생성의 주 목적 중 하나가 이 baseline 을 깨끗하게 리셋하는 것

## contentHash 재계산

**계산 방식**: `SHA-256(Claude source 파일 raw UTF-8).slice(0, 8)` hex 문자열

**예시**:
```
identity: output-secret-filter
claude:   src/claude/core/hooks/output-secret-filter.js
hash:     055c1f12
```

**대상**: 114 paired entries 전원

**갱신 이유**:
- 기존 hash 는 재생성 이전 Claude source 에 대한 값. Claude source 가 업데이트되었을 수도 있고 안 되었을 수도 있지만 baseline 을 명확히 하기 위해 전원 재계산
- 향후 Claude source 수정 시 `/kit-audit --content` 실행하면 이 hash 와 비교하여 drift 감지

**codex-skip / unpaired 엔트리는 제외**: `codex` 필드가 null 이거나 Claude 에만 존재하는 경우 hash 불필요.

## 도메인별 갱신 분포

| 도메인 | paired 갱신 수 | 비고 |
|------|:---:|------|
| core | 17 | EX-009 (codex-skip) 제외한 17건 |
| dev | 47 | 전원 |
| plan | 34 | 전원 |
| copy | 16 | paired 만 (skip 5 + unpaired 5 제외) |
| **합계** | **114** | — |

## 신규 entries 존재하는가?

**없음**. Phase 2 는 기존 레지스트리 구조를 유지하면서 메타데이터만 갱신. 새 identity 추가 / 제거 / status 변경은 전혀 없었다.

단, Phase 2 에서 codex 물리 파일 수가 164 → 171 로 **+7 증가**했는데, 이는:
- `.gitkeep` 파일 4개 (core/dev/plan/copy 각 1개)
- core 도메인 유틸리티 추가 (auto-proceed.js, collectors, etc.)
- plan 도메인 boundary 디렉토리

이들은 pairing-registry entry 없이 존재하는 **서포트 파일**이다.

## transitionState 변화

command 타입 entries 에 있는 `transitionState` 필드:

| transitionState | 개수 | 의미 |
|-----------------|:---:|------|
| command-primary | ~40 | command 가 주 surface |
| dual-output | ~0~ | 과도기 |
| skill-primary | ~0~ | command → skill 로 전환 중 |
| (null / undefined) | 나머지 | 단순 paired-direct command |

**Phase 2 처리**: transitionState 는 **변경하지 않았다**. 기존 값 유지. 명시적 command 진화 판단은 별도 세션에서.

## exceptionId 연결

Pairing entry 가 exception-registry 항목과 연결되어 있음을 표시:

| exceptionId | pairing identity | 연결 방식 |
|-------------|------------------|----------|
| EX-002 | output-secret-filter | paired-direct, status=paired |
| EX-009 | security-no-hardcoded-secrets | paired-direct (exception) vs codex-skip (pairing) — **모순 (Phase 3 C7 FAIL 원인)** |

EX-001 / EX-003~008 / EX-010~014 는 pairing-registry 에 exceptionId 연결 필드 없음 (이들은 fallback artifact 기반이라 pairing 관계가 없거나 codex-skip).

## 검증 흔적

Phase 3 C7 감사에서 이 변경을 검증:
- 114 paired entries 전원 `lastSyncedAt` 가 `2026-04-24` 으로 갱신 확인
- 114 paired entries 전원 8자 hex `contentHash` 보유 확인
- codex path 가 실제 파일시스템에 존재 확인
- 단 EX-009 모순은 pre-existing 이슈로 남아 있음

## Claude 소스와의 정합성 체크

이 레지스트리는 **Claude SSOT 기준**의 sync 상태를 기록한다:

```
(변경 전 Claude source) → SHA-256 → contentHash baseline
     ↓ Phase 2 재생성
(재생성된 Codex) → 파일 존재 → pairing status=paired 유지
     ↓ 향후 Claude source 수정 시
/kit-audit --content → 새 hash 계산 → baseline 과 비교 → drift 감지
```

즉 이 레지스트리는 **"이번에 동기화했다" 라는 스탬프**를 찍는 역할. 이후 변경이 있으면 drift 가 자동 탐지된다.

## 참조

- [02 Conversion Overview](02-conversion-overview.md) — kit-converter 의 pairing-registry 갱신 단계
- [08 Exception Handling](08-exception-handling.md) — exceptionId 연결 상세
- [10 Known Issues](10-known-issues.md) — EX-009 모순 상세
