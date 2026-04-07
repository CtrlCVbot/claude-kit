/**
 * code-quality-reminder.js — PostToolUse 훅 (Edit|Write)
 * 코드 파일 편집 시 품질 리마인더를 stderr로 출력한다.
 * 차단하지 않음 (항상 exit 0).
 */
'use strict';

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs',
  '.java', '.rb', '.php', '.swift', '.kt', '.sh'
]);

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
      if (!CODE_EXTENSIONS.has(ext)) {
        process.exit(0);
      }

      process.stderr.write(
        '[code-quality] 수정된 파일의 에러 핸들링, 불변성 패턴, 입력 검증을 확인하세요.\n'
      );
    } catch {
      // ignore parse errors
    }
    process.exit(0);
  });
}

main();
