/**
 * copy-evidence-reminder.js — PostToolUse 훅 (Edit|Write)
 * 시각/인터랙션 관련 파일 수정 시 evidence 갱신을 안내한다.
 * 차단하지 않음 (항상 exit 0).
 */
'use strict';

const VISUAL_EXTENSIONS = new Set([
  '.css', '.scss', '.sass', '.less', '.styl',
  '.module.css', '.module.scss',
  '.tsx', '.jsx'
]);

const VISUAL_PATTERNS = [
  /styles?[/\\]/i,
  /components?[/\\]/i,
  /layout[/\\]/i,
  /theme[/\\]/i
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

      const ext = filePath.substring(filePath.lastIndexOf('.'));
      const isVisualExt = VISUAL_EXTENSIONS.has(ext);
      const isVisualPath = VISUAL_PATTERNS.some(p => p.test(filePath));

      if (!isVisualExt && !isVisualPath) {
        process.exit(0);
      }

      process.stderr.write(
        '[copy-evidence] 시각/인터랙션 파일이 수정되었습니다. evidence manifest 갱신이 필요할 수 있습니다.\n' +
        '  → /copy-reference-refresh 또는 /copy-verify 실행을 검토하세요.\n'
      );
    } catch {
      // ignore parse errors
    }
    process.exit(0);
  });
}

main();
