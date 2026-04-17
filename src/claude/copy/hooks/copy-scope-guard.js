/**
 * Hook: copy Scope Guard
 * Event: PreToolUse (Edit|Write)
 * Action: REMINDER (exit 0) — 실행 단위 범위 밖 편집 경고 (향후 blocking 전환 가능)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const ACTIVE_FEATURES = path.join(PROJECT_ROOT, '.plans', 'features', 'active');

function findRoutingMetadata(slug) {
  const metaPath = path.join(ACTIVE_FEATURES, slug, '00-context', '07-routing-metadata.md');
  if (fs.existsSync(metaPath)) {
    return fs.readFileSync(metaPath, 'utf8');
  }
  return null;
}

function isCopyFeature(metadata) {
  if (!metadata) return false;
  return /Feature\s*Type:\s*copy/i.test(metadata);
}

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

      // active features에서 copy Feature를 찾아 scope 확인
      if (!fs.existsSync(ACTIVE_FEATURES)) {
        process.exit(0);
      }

      let hasCopyFeature = false;
      try {
        const slugs = fs.readdirSync(ACTIVE_FEATURES, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);

        for (const slug of slugs) {
          const metadata = findRoutingMetadata(slug);
          if (isCopyFeature(metadata)) {
            hasCopyFeature = true;
            break;
          }
        }
      } catch {
        process.exit(0);
      }

      if (!hasCopyFeature) {
        process.exit(0);
      }

      // copy Feature가 활성 상태이면 scope 경고
      const normalized = filePath.replace(/\\/g, '/');
      const isInPlans = /\.plans\//.test(normalized);
      if (isInPlans) {
        process.exit(0); // .plans/ 내부 문서 편집은 허용
      }

      process.stderr.write(
        '[copy-scope-guard] copy Feature가 활성 상태입니다. 실행 단위 범위 내 편집인지 확인하세요.\n' +
        '  → routing metadata와 gap board 범위를 참조하세요.\n'
      );
    } catch {
      // ignore parse errors
    }
    process.exit(0); // reminder mode: 항상 통과
  });
}

main();
