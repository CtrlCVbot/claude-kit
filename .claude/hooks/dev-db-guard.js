/**
 * dev-db-guard.js — PreToolUse 훅 (Bash)
 * 위험한 SQL 작업을 차단한다: DROP, TRUNCATE, WHERE 없는 DELETE, ALTER DROP.
 * Exit 2 = 차단, Exit 0 = 허용.
 */
'use strict';

const DANGEROUS_PATTERNS = [
  { pattern: /DROP\s+(TABLE|DATABASE|SCHEMA)\b/i, reason: 'DROP TABLE/DATABASE/SCHEMA 감지됨' },
  { pattern: /\bTRUNCATE\b/i, reason: 'TRUNCATE 감지됨' },
  { pattern: /ALTER\s+TABLE\s+\S+\s+DROP\b/i, reason: 'ALTER TABLE DROP 감지됨' }
];

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const toolName = data.tool_name || '';

      if (toolName !== 'Bash') {
        process.exit(0);
      }

      const command = (data.tool_input && data.tool_input.command) || '';
      if (!command) {
        process.exit(0);
      }

      const upperCmd = command.toUpperCase();

      for (const { pattern, reason } of DANGEROUS_PATTERNS) {
        if (pattern.test(command)) {
          process.stderr.write(`차단됨: ${reason}\n`);
          process.stderr.write(`쿼리: ${command.substring(0, 200)}\n`);
          process.exit(2);
        }
      }

      // WHERE 없는 DELETE
      if (/DELETE\s+FROM\b/i.test(command) && !/\bWHERE\b/i.test(command)) {
        process.stderr.write('차단됨: WHERE 절 없는 DELETE FROM 감지됨\n');
        process.stderr.write(`쿼리: ${command.substring(0, 200)}\n`);
        process.exit(2);
      }
    } catch {
      // on error, allow
    }
    process.exit(0);
  });
}

main();
