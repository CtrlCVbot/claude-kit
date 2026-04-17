/**
 * Hook: copy Doc Drift Check
 * Event: PostToolUse (Edit|Write)
 * Action: REMINDER (exit 0) — 구현 파일과 copy 관련 문서 간 drift 감지, 안내만
 */
'use strict';

const path = require('path');
const fs = require('fs');

const COPY_DOC_PATTERNS = [
  /gap-board/i,
  /evidence/i,
  /manifest\.json$/i,
  /routing-metadata\.md$/i,
  /copy-/i
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

      // .plans/ 내부 파일이면 문서 수정 — 구현과 drift 가능성
      const normalized = filePath.replace(/\\/g, '/');
      const isPlansFile = /\.plans\//.test(normalized);
      const isCopyDoc = COPY_DOC_PATTERNS.some(p => p.test(normalized));

      if (!isPlansFile && !isCopyDoc) {
        process.exit(0);
      }

      process.stderr.write(
        '[copy-doc-drift] copy 관련 문서가 수정되었습니다. 구현과의 정합성을 확인하세요.\n' +
        '  → /copy-verify 실행으로 document drift를 점검할 수 있습니다.\n'
      );
    } catch {
      // ignore parse errors
    }
    process.exit(0);
  });
}

main();
