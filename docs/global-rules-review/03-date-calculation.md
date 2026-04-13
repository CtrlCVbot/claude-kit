# date-calculation.md 비교 문서

- **변경 강도**: LOW
- **점수**: 4 -> 5

---

## 현재 내용 요약

`date-calculation.md`는 날짜/시간 계산 시 반드시 시스템 도구를 사용하도록 강제하는 규칙이다. 구성:

1. **Absolute Rule** -- LLM의 날짜 연산 오류 경고 (2줄)
2. **Required Patterns** -- 6개 패턴 (macOS 3개 + Linux 3개로 분리)
3. **Complex Date Calculations** -- Python3 패턴 (1개)
4. **Forbidden** -- 금지 행위 3개
5. **Required** -- 필수 도구 지정

---

## 발견된 문제

| # | 문제 | 심각도 |
|---|------|--------|
| 1 | macOS/Linux 패턴이 별도 소제목으로 분리되어 동일 목적의 코드가 2배로 존재 | MEDIUM |
| 2 | Windows Git Bash 환경 언급 없음 (현재 사용 환경이 Windows 11 Git Bash) | LOW |
| 3 | macOS `date -j` 구문이 비표준이라 혼동 유발 가능 | LOW |

---

## 변경 제안

### Before/After 비교

| 섹션 | Before | After | 조치 |
|------|--------|-------|------|
| Current Date/Time | 1개 패턴 (공통) | (유지) | KEEP |
| Day of Week | macOS 소제목 + Linux 소제목 (2개) | GNU date 기본 + macOS 비고 (1개) | MERGE |
| N Days From Now | macOS 소제목 + Linux 소제목 (2개) | GNU date 기본 + macOS 비고 (1개) | MERGE |
| Complex (Python3) | Python3 패턴 | (유지) | KEEP |
| Forbidden/Required | 금지 3개 + 필수 1개 | (유지) | KEEP |

### 패턴 병합 상세

**Day of Week -- 2개를 1개로 병합**

```
# Before (2개 소제목)
### Day of Week (macOS)
\```bash
date -j -f '%Y-%m-%d' '2026-03-15' '+%A'
\```

### Day of Week (Linux)
\```bash
date -d '2026-03-15' '+%A'
\```
```

```
# After (1개 통합)
### Day of Week
\```bash
date -d '2026-03-15' '+%A'
\```
> macOS: `date -j -f '%Y-%m-%d' '2026-03-15' '+%A'` 또는 GNU coreutils 설치 (`brew install coreutils` 후 `gdate`)
```

**N Days From Now -- 2개를 1개로 병합**

```
# Before (2개 소제목)
### N Days From Now (macOS)
\```bash
date -j -v+30d '+%Y-%m-%d %A'    # 30 days later
date -j -v-7d '+%Y-%m-%d %A'     # 7 days ago
\```

### N Days From Now (Linux)
\```bash
date -d '+30 days' '+%Y-%m-%d %A'    # 30 days later
date -d '-7 days' '+%Y-%m-%d %A'     # 7 days ago
\```
```

```
# After (1개 통합)
### N Days From Now
\```bash
date -d '+30 days' '+%Y-%m-%d %A'    # 30일 후
date -d '-7 days' '+%Y-%m-%d %A'     # 7일 전
\```
> macOS: `date -j -v+30d '+%Y-%m-%d %A'` 또는 GNU coreutils 사용
```

**환경 호환성 비고 추가**

```
# After: 파일 상단 또는 Required Patterns 앞에 비고 추가
> `date -d` 구문은 GNU date 기반. Linux 및 Windows Git Bash에서 동작 확인됨.
> macOS는 BSD date를 사용하므로 별도 구문 필요 (각 패턴의 비고 참조).
```

---

## After 내용 요약

개선 후 `date-calculation.md`는 다음으로 구성된다:

1. **Absolute Rule** -- 변경 없음 (2줄)
2. **환경 비고** -- GNU date (Linux/Windows Git Bash) 기본, macOS 비고 (2줄, 신규)
3. **Required Patterns** -- 3개 패턴 (Current, Day of Week, N Days From Now) + macOS 인라인 비고
4. **Complex Date Calculations** -- Python3 (변경 없음)
5. **Forbidden / Required** -- 변경 없음

---

## 토큰 영향

| 항목 | Before | After | 변화 |
|------|:------:|:-----:|:----:|
| 추정 토큰 | ~400 | ~340 | **-15%** |
| 삭제 대상 | macOS 전용 소제목 2개 + 코드 블록 2개 | -- | -- |
| 추가 대상 | -- | 환경 비고 2줄 + macOS 인라인 비고 2줄 | +~40 토큰 |
| 비고 | `date -d` Windows Git Bash 동작 확인 완료 | 범용성 향상 | -- |
