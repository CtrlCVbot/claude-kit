/**
 * agents-md-renderer.js
 * AGENTS.md의 kit-managed 섹션(마커 내부)을 블록 파일 조합으로 렌더링한다.
 *
 * 반환 값에는 마커가 포함되지 않는다. 마커 래핑은 호출자(또는 merger)가 담당한다.
 *
 * 사용법:
 *   const { renderAgentsManagedSection } = require('./agents-md-renderer');
 *   const body = renderAgentsManagedSection({ activeDomains, activeTargets, vars });
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { substituteVars } = require('./_utils/template-vars');

const BLOCKS_DIR = path.resolve(__dirname, '..', 'src', 'templates', 'agents-md');

const CORE_BLOCKS = [
  '00-preamble.md',
  '10-runtime-principles.md',
  '80-codex-runtime.md',
  '90-currentdate.md'
];

function renderAgentsManagedSection({ activeDomains, activeTargets, vars }) {
  const context = {
    ...vars,
    ACTIVE_DOMAINS: (activeDomains || []).join(', '),
    ACTIVE_TARGETS: (activeTargets || []).join(', ')
  };

  const parts = CORE_BLOCKS.map(name => renderBlock(name, context));
  return parts.map(block => block.trim()).join('\n\n');
}

function renderBlock(filename, vars) {
  const filePath = path.join(BLOCKS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  return substituteVars(content, vars);
}

module.exports = {
  renderAgentsManagedSection
};
