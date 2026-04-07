# Option C: Install Gates and Reporting

> 설치 결과를 사람과 CI가 모두 읽을 수 있게 만들고, `warn`과 `strict` 정책으로 Codex 호환성 회귀를 제어하는 운영안.

---

## 1. 핵심 아이디어

설치기가 끝난 뒤 `.claude-kit-meta.json`에 타깃별 compatibility report를 남긴다.

예시:

```json
{
  "compatibility": {
    "codex": {
      "policy": "warn",
      "emitted": 42,
      "skipped": [
        {
          "assetId": "core.hook.output-secret-filter",
          "reason": "depends on CLAUDE_REMOTE_SESSION and ~/.claude runtime"
        }
      ],
      "warnings": [
        {
          "assetId": "core.rule.security",
          "message": "Rendered via AGENTS.md summary only."
        }
      ]
    }
  }
}
```

이 계약의 목적은 설치 실패를 늘리는 것이 아니라, 누락을 가시화하고 선택적으로 엄격하게 만드는 것이다.

---

## 2. 정책 제안

`profile.json`에 아래 옵션을 제안한다.

```json
{
  "compatibility": {
    "codexPolicy": "warn"
  }
}
```

| 정책 | 의미 |
|------|------|
| `warn` | 소비자 설치는 계속 진행. skipped/warnings를 report와 콘솔에 남김 |
| `strict` | metadata 누락, 선언 불일치, 무단 codex target 추가를 실패 처리 |

기본값은 `warn`이 적절하다. 소비자 프로젝트의 설치를 깨지 않으면서도, claude-kit 자체 저장소에서는 `strict`를 켤 수 있기 때문이다.

---

## 3. CI 게이트 제안

repo 검증 명령 예시:

```bash
node scripts/verify-codex-parity.js --policy strict
```

검증 항목:

- installable asset인데 metadata 없음
- metadata의 `targets`와 실제 emitter 동작 불일치
- hook 선언 누락 또는 phase/matcher 불일치
- rule이 Codex 반영 방식을 선언하지 않음
- `supportLevel: none`인데 skipReason 없음
- generated output 충돌

---

## 4. 운영 효과

### 소비자 프로젝트

- 설치는 최대한 성공한다.
- Codex에서 제외된 자산이 무엇인지 바로 알 수 있다.
- upgrade 시 “왜 안 깔렸는지”를 metadata와 report로 추적할 수 있다.

### claude-kit 저장소

- PR 단계에서 parity 회귀를 막을 수 있다.
- 새 자산 추가가 문서, installer, compatibility 선언을 동시에 요구하게 된다.
- hardcoded 예외가 숨어드는 것을 방지할 수 있다.

---

## 5. 한계

- report만 있어서는 구조 문제가 해결되지 않는다.
- metadata SSOT와 catalog가 없으면 warning이 많아질수록 오히려 피로해진다.
- `strict`는 저장소 내부 게이트로 쓰는 것이 안전하고, 소비자 기본값으로는 과하다.

---

## 6. 결론

Option C는 단독 해결책이 아니라, 권장 구조를 운영 가능한 품질 체계로 만드는 마지막 층이다. 따라서 권장안에서는 Option B 위에 얹는 게이트로 사용한다.
