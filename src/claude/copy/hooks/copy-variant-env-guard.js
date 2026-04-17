/**
 * Hook: copy Variant Env Guard
 * Event: PostToolUse (Edit|Write)
 * Action: REMINDER (exit 0) — variant/host map 환경 변수 변경 시 QA 안내
 */
'use strict';

const VARIANT_PATTERNS = [
  /SITE_VARIANT/i,
  /SITE_VARIANT_HOST_MAP/i,
  /variant/i,
  /hostMap/i
];

const ENV_FILE_PATTERNS = [
  /\.env/,
  /env\.ts$/,
  /env\.js$/,
  /config\.(ts|js|mjs)$/
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

      const isEnvFile = ENV_FILE_PATTERNS.some(p => p.test(filePath));
      if (!isEnvFile) {
        process.exit(0);
      }

      // 파일 내용에서 variant 관련 변경 감지
      const newContent = (data.tool_input && data.tool_input.new_string) ||
                         (data.tool_input && data.tool_input.content) || '';
      const hasVariantChange = VARIANT_PATTERNS.some(p => p.test(newContent));

      if (!hasVariantChange) {
        process.exit(0);
      }

      process.stderr.write(
        '[copy-variant-guard] variant/host map 관련 변경이 감지되었습니다.\n' +
        '  → variant 변경 후 /copy-verify 실행으로 QA를 재검증하세요.\n'
      );
    } catch {
      // ignore parse errors
    }
    process.exit(0);
  });
}

main();
