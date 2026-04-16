/**
 * copy-gate-stop.js — Stop 훅
 * Phase/R 종료 후 자동 진행을 안내한다.
 * 기본 비활성: exit 0 (정보 제공만). blocking(exit 2) 전환은 별도 승인 후.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const STAGE_MANIFEST = path.join(PROJECT_ROOT, '.plans', 'stage-manifest.json');

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      // Stop 훅은 세션 종료 시 실행됨
      if (!fs.existsSync(STAGE_MANIFEST)) {
        process.exit(0);
      }

      const manifest = JSON.parse(fs.readFileSync(STAGE_MANIFEST, 'utf8'));
      const slugs = Object.keys(manifest);

      for (const slug of slugs) {
        const entry = manifest[slug];
        const copyStages = entry.copyStages;
        if (!copyStages) continue;

        // verify가 완료되었지만 closeout이 안 된 경우
        const verifyDone = copyStages.verify && copyStages.verify.status === 'done';
        const closeoutPending = !copyStages.closeout || copyStages.closeout.status === 'pending';

        if (verifyDone && closeoutPending) {
          process.stderr.write(
            `[copy-gate-stop] Feature "${slug}": verify 완료, closeout 미수행.\n` +
            `  → /copy-closeout 실행 후 Phase를 마무리하세요.\n`
          );
        }
      }
    } catch {
      // ignore errors
    }
    process.exit(0); // 기본 비활성: 항상 통과
  });
}

main();
