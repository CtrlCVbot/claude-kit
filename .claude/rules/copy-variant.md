# Variant/Host Map Standards

> 멀티 variant 사이트에서 올바른 대상을 캡처하고 검증하기 위한 규칙. variant 설정 오류는 전체 fidelity 분석을 무효화한다.

## 환경변수

### SITE_VARIANT

현재 작업 대상 variant를 지정한다.

```bash
# 설정 예시
export SITE_VARIANT="kr"
```

| 규칙 | 설명 |
|------|------|
| 필수 | copy 커맨드 실행 시 반드시 설정되어 있어야 함 |
| 단일 값 | 한 번에 하나의 variant만 지정 |
| 소문자 | 대문자 불허 (`KR` 아닌 `kr`) |

### SITE_VARIANT_HOST_MAP

variant별 호스트 주소를 매핑한다.

```bash
# 형식: variant=host,variant=host,...
export SITE_VARIANT_HOST_MAP="kr=www.example.kr,jp=www.example.jp,en=www.example.com"
```

## Host Map 검증

커맨드 실행 시 다음 검증을 자동 수행한다:

| 검증 항목 | 실패 시 동작 |
|----------|-------------|
| `SITE_VARIANT` 미설정 | 즉시 실패, 에러 메시지 출력 |
| `SITE_VARIANT_HOST_MAP` 미설정 | 즉시 실패, 에러 메시지 출력 |
| `SITE_VARIANT` 값이 host map에 없음 | 즉시 실패, 유효 variant 목록 출력 |
| host map 형식 오류 | 즉시 실패, 올바른 형식 안내 |
| host 주소 접근 불가 | 경고 출력, 사용자 확인 요청 |

## Fail Fast 원칙

유효하지 않은 variant로는 어떤 작업도 진행하지 않는다.

```
SITE_VARIANT 검증 실패 → 전체 커맨드 중단
```

부분 실행 후 variant 오류를 발견하면 해당 실행의 모든 산출물을 무효 처리한다. evidence manifest에서 해당 variant의 캡처를 `invalid`로 표시한다.

## Host Map 형식

```
{variant}={host},{variant}={host},...
```

| 필드 | 규칙 |
|------|------|
| variant | 소문자 영문 + 숫자, 2~10자 |
| host | 유효한 hostname (프로토콜 제외) |
| 구분자 | variant와 host 사이 `=`, 항목 사이 `,` |
| 공백 | 허용하지 않음 |

유효: `kr=www.example.kr,jp=www.example.jp` / 무효: `KR=...`(대문자), `kr = ...`(공백), `kr=https://...`(프로토콜)

## Variant 변경 시 재검증

variant 변경(`SITE_VARIANT` 값 변경, host map 항목 추가/수정)은 기존 evidence를 무효화한다. 해당 variant의 모든 evidence를 재캡처해야 한다. 재캡처 없이 이전 evidence를 사용하는 것은 금지한다.
