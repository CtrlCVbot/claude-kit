/**
 * security-auto-trigger.js — PostToolUse 훅 (Edit|Write)
 * 보안 민감 파일 편집을 감지하고 /security-review를 제안한다.
 * 세션당 파일별 1회만 제안 (마커 파일로 중복 방지).
 * 차단하지 않음 (항상 exit 0).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SECURITY_PATTERNS = [
  /auth/i, /login/i, /session/i, /token/i, /jwt/i, /oauth/i,
  /credential/i, /permission/i, /rbac/i, /acl/i, /middleware/i,
  /\.env/i, /config\/security/i, /security\.(ts|js)/i,
  /rls/i, /policy/i, /migration/i,
  /route\.(ts|js)/i, /api\//i,
  /encrypt/i, /decrypt/i, /hash/i, /crypto/i
];

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const toolName = data.tool_name || '';

      if (toolName !== 'Edit' && toolName !== 'Write') {
        process.exit(0);
      }

      const filePath = (data.tool_input && data.tool_input.file_path) || '';
      if (!filePath) {
        process.exit(0);
      }

      let matchedPattern = null;
      for (const pattern of SECURITY_PATTERNS) {
        if (pattern.test(filePath)) {
          matchedPattern = pattern.source;
          break;
        }
      }

      if (!matchedPattern) {
        process.exit(0);
      }

      // Deduplication: one suggestion per file per session
      const sessionId = data.session_id || process.env.CLAUDE_SESSION_ID || 'unknown';
      const sanitized = filePath.replace(/[^a-zA-Z0-9]/g, '_');
      const markerDir = path.join(os.tmpdir(), 'security-suggest');
      const markerFile = path.join(markerDir, `${sessionId}-${sanitized}`);

      try {
        if (fs.existsSync(markerFile)) {
          process.exit(0);
        }
        fs.mkdirSync(markerDir, { recursive: true });
        fs.writeFileSync(markerFile, '1');
      } catch {
        // ignore marker errors
      }

      const basename = path.basename(filePath);
      process.stderr.write(
        `[Security] 보안 관련 파일 수정 감지: ${basename} (패턴: ${matchedPattern}). 커밋 전 /security-review 실행을 권장합니다.\n`
      );
    } catch {
      // ignore parse errors
    }
    process.exit(0);
  });
}

main();
