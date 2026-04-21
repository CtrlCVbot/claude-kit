'use strict';
/**
 * feedback-subagent-collector.js — Phase 3.2.5 (Codex sibling)
 * Claude peer: src/claude/core/hooks/feedback-subagent-collector.js
 */

const { recordSubagentStop, TRACKED_AGENTS } = require('../collectors/dev-collector.js');

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const sessionId = data.session_id || process.env.CODEX_SESSION_ID || '';
      const agent = data.agent_name || data.tool_name || data.subagent_type;

      if (!sessionId || !agent || !TRACKED_AGENTS.includes(agent)) {
        process.exit(0);
      }

      recordSubagentStop({ sessionId, agent, status: data.status || 'success' });
    } catch { /* fail-open */ }
    process.exit(0);
  });
}

if (require.main === module) {
  main();
}

module.exports = { main };
