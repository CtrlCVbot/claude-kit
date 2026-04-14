'use strict';

const fs = require('fs');
const path = require('path');
const { renderQuickStart } = require('./quickstart-renderer');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'guide', '13-quick-start.md');
const PACKAGE_JSON = path.join(ROOT, 'package.json');

function main() {
  const version = resolveVersion();
  const content = renderQuickStart({
    variant: 'repo',
    activeDomains: ['core', 'dev', 'plan'],
    activeTargets: ['claude', 'codex'],
    version
  });

  if (process.argv.includes('--check')) {
    const current = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
    if (current !== content) {
      console.error('docs/guide/13-quick-start.md is out of date. Run `node scripts/generate-quickstart-doc.js`.');
      process.exit(1);
    }
    console.log('docs/guide/13-quick-start.md is up to date.');
    return;
  }

  fs.writeFileSync(OUTPUT_PATH, content);
  console.log(`generated ${path.relative(ROOT, OUTPUT_PATH)}`);
}

function resolveVersion() {
  return JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8')).version || '2.0.0';
}

main();
