/**
 * claude-md-renderer.js
 * CLAUDE.md의 kit-managed 섹션(마커 내부)을 도메인별 블록을 조합해 렌더링한다.
 *
 * 반환 값에는 마커가 포함되지 않는다. 마커 래핑은 호출자(또는 merger)가 담당한다.
 *
 * 사용법:
 *   const { renderClaudeManagedSection } = require('./claude-md-renderer');
 *   const body = renderClaudeManagedSection({ activeDomains, activeTargets, vars });
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { substituteVars } = require('./_utils/template-vars');

const BLOCKS_DIR = path.resolve(__dirname, '..', 'src', 'templates', 'claude-md');

const DOMAIN_BLOCKS = {
  core: '40-core.md',
  dev: '10-dev.md',
  plan: '20-plan.md',
  copy: '30-copy.md'
};

function renderClaudeManagedSection({ activeDomains, activeTargets, vars }) {
  const context = {
    ...vars,
    ACTIVE_DOMAINS: activeDomains.join(', '),
    ACTIVE_TARGETS: activeTargets.join(', ')
  };

  const parts = [];
  parts.push(renderBlock('00-preamble.md', context));

  for (const domain of activeDomains) {
    const blockFile = DOMAIN_BLOCKS[domain];
    if (blockFile) {
      parts.push(renderBlock(blockFile, context));
    }
  }

  parts.push(renderBlock('90-currentdate.md', context));

  return parts.map(block => block.trim()).join('\n\n');
}

function renderBlock(filename, vars) {
  const filePath = path.join(BLOCKS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  return substituteVars(content, vars);
}

module.exports = {
  renderClaudeManagedSection
};
