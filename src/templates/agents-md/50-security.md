## 보안 기준 (요약)

사용자 입력·query parameter·request body·file path는 경계에서 검증합니다. SQL injection / XSS / CSRF / 권한 우회 / rate limit 누락을 점검하고, 에러 메시지에 내부 경로나 stack trace를 노출하지 않습니다.

> Mandatory Security Checks 전체와 Secret Management 패턴은 `.claude/rules/security.md` 참조.
