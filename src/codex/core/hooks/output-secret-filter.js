// kit-convert generated: 2026-04-24
/**
 * output-secret-filter.js — PostToolUse 훅 (전체 도구)
 * 도구 출력에서 비밀값(API 키, 토큰, 비밀번호)을 마스킹한다.
 * CLAUDE_REMOTE_SESSION 환경변수가 설정된 경우에만 활성화.
 * 차단하지 않음 (항상 exit 0).
  *
 * Codex 등록 포맷:
 *   .codex/hooks.json: { type: "command", command: "./hooks/output-secret-filter.js" }
 *
 * Codex hooks 공식 제약 (2026-04 기준):
 *   - hooks는 experimental 기능
 *   - PreToolUse/PostToolUse matcher: 공식 문서상 Bash 범위가 핵심.
 *   - Stop event: runtime 상태 파일 의존 hook은 skill/command fallback 필요.
 *   - Windows: 현재 비활성화.
 *
 * Claude sibling: src/claude/core/hooks/output-secret-filter.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SECRET_PATTERNS = [
  // OpenAI / Anthropic API keys
  /sk-[a-zA-Z0-9]{20,}/g,
  /sk-proj-[a-zA-Z0-9_-]{20,}/g,
  /sk-ant-[a-zA-Z0-9_-]{20,}/g,
  // AWS
  /AKIA[0-9A-Z]{16}/g,
  /[a-zA-Z0-9/+=]{40}(?=\s|$|")/g,
  // GitHub tokens
  /ghp_[a-zA-Z0-9]{36,}/g,
  /gho_[a-zA-Z0-9]{36,}/g,
  /ghs_[a-zA-Z0-9]{36,}/g,
  /github_pat_[a-zA-Z0-9_]{22,}/g,
  // GitLab
  /glpat-[a-zA-Z0-9_-]{20,}/g,
  // NPM
  /npm_[a-zA-Z0-9]{36,}/g,
  // Bearer tokens
  /Bearer\s+[a-zA-Z0-9._-]{20,}/gi,
  // Private keys
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
  // Generic secret assignments
  /(?:password|secret|token|api_key|apikey|api-key)\s*[:=]\s*["']?[a-zA-Z0-9._/+=@-]{8,}["']?/gi,
  // Database URLs with credentials
  /(?:postgres|mysql|mongodb|redis):\/\/[^:]+:[^@]+@[^\s"']+/gi
];

function maskSecret(match) {
  if (match.length > 16) {
    return match.substring(0, 8) + '***MASKED***' + match.substring(match.length - 4);
  }
  return match.substring(0, 4) + '***MASKED***';
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      // Only active in remote sessions
      if (!process.env.CLAUDE_REMOTE_SESSION) {
        process.exit(0);
      }

      const data = JSON.parse(input);
      let result = '';

      if (data.tool_result) {
        if (typeof data.tool_result === 'string') {
          result = data.tool_result;
        } else if (data.tool_result.stdout) {
          result = data.tool_result.stdout;
        } else {
          result = JSON.stringify(data.tool_result);
        }
      }

      if (!result) {
        process.exit(0);
      }

      let masked = result;
      let maskCount = 0;
      const maskedTypes = new Set();

      for (const pattern of SECRET_PATTERNS) {
        const patternCopy = new RegExp(pattern.source, pattern.flags);
        const matches = masked.match(patternCopy);
        if (matches) {
          maskCount += matches.length;
          maskedTypes.add(pattern.source.substring(0, 20));
          masked = masked.replace(patternCopy, maskSecret);
        }
      }

      if (maskCount > 0) {
        // Output masked result
        process.stdout.write(JSON.stringify({ result: masked }));

        // Log (without actual secret values)
        const logDir = path.join(os.homedir(), '.claude');
        const logFile = path.join(logDir, 'security.log');
        try {
          fs.mkdirSync(logDir, { recursive: true });
          const timestamp = new Date().toISOString();
          const toolName = data.tool_name || 'unknown';
          const sessionId = data.session_id || 'unknown';
          const logLine = `${timestamp} | SECRET_MASKED | tool=${toolName} | count=${maskCount} | session=${sessionId}\n`;
          fs.appendFileSync(logFile, logLine);
        } catch {
          // ignore log errors
        }
      }
    } catch {
      // on error, do nothing (allow output through)
    }
    process.exit(0);
  });
}

main();
