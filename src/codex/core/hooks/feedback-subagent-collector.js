// kit-convert generated: 2026-04-24
'use strict';
/**
 * feedback-subagent-collector.js — kit-feedback-archiving Phase 3.2.5 SubagentStop 훅
 *
 * 9개 추적 에이전트의 SubagentStop 발동 시 tmpdir 마커에 누적.
 * Stop 훅 시점에 feedback-collector가 readAggregatedAgents()로 읽어 agents_chain 완성.
 *
 * Claude peer/Codex sibling: src/codex/core/hooks/feedback-subagent-collector.js
 * 설계: docs/plan/kit-feedback-archiving/03-trigger-points.md §4.2
  *
 * Codex 등록 포맷:
 *   .codex/hooks.json: { type: "command", command: "./hooks/feedback-subagent-collector.js" }
 *
 * Codex hooks 공식 제약 (2026-04 기준):
 *   - hooks는 experimental 기능
 *   - PreToolUse/PostToolUse matcher: 공식 문서상 Bash 범위가 핵심.
 *   - Stop event: runtime 상태 파일 의존 hook은 skill/command fallback 필요.
 *   - Windows: 현재 비활성화.
 *
 * Claude sibling: src/claude/core/hooks/feedback-subagent-collector.js
 */

const { recordSubagentStop, TRACKED_AGENTS } = require('../collectors/dev-collector.js');

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const sessionId = data.session_id || process.env.CLAUDE_SESSION_ID || '';
      const agent = data.agent_name || data.tool_name || data.subagent_type;

      if (!sessionId || !agent) {
        process.exit(0);
      }

      // 추적 대상 9 에이전트만 기록 (matcher가 이미 필터링하지만 안전망)
      if (!TRACKED_AGENTS.includes(agent)) {
        process.exit(0);
      }

      recordSubagentStop({
        sessionId,
        agent,
        status: data.status || 'success'
      });
    } catch {
      // fail-open
    }
    process.exit(0);
  });
}

if (require.main === module) {
  main();
}

module.exports = { main };
