/**
 * session-wrap-suggest.js — Stop 훅
 * 세션에서 30회 이상 도구 호출 시 /session-wrap을 제안한다.
 * 세션당 1회만 제안 (마커 파일로 중복 방지).
 * 차단하지 않음 (항상 exit 0).
 *
 * Codex fallback artifact: src/claude/core/skills/session-wrap-suggest/SKILL.md
 *   (EX-001 paired-fallback / fallbackTarget=skill, codex-sync Phase 3)
 *   Codex runtime은 ~/.claude/.session-stats.json + tmpdir 마커 의존을 재현 불가하므로
 *   동일 의도(threshold-기반 1회 제안)를 runtime-independent skill로 보존한다.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const sessionId = data.session_id || process.env.CLAUDE_SESSION_ID || '';

      if (!sessionId) {
        process.exit(0);
      }

      // Deduplication: one suggestion per session
      const markerFile = path.join(os.tmpdir(), `session-wrap-suggested-${sessionId}`);
      if (fs.existsSync(markerFile)) {
        process.exit(0);
      }

      // Check session stats
      const statsFile = path.join(os.homedir(), '.claude', '.session-stats.json');
      if (!fs.existsSync(statsFile)) {
        process.exit(0);
      }

      let totalCalls = 0;
      try {
        const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
        totalCalls = (stats[sessionId] && stats[sessionId].total_calls) || stats.total_calls || 0;
      } catch {
        process.exit(0);
      }

      if (totalCalls < 30) {
        process.exit(0);
      }

      // Mark as suggested
      try {
        fs.writeFileSync(markerFile, '1');
      } catch {
        // ignore marker errors
      }

      // Output suggestion as JSON (Stop hook protocol)
      const response = {
        continue: true,
        systemMessage: '[Session Wrap] 이번 세션에서 상당한 작업이 진행되었습니다. 세션 마무리 시 /session-wrap을 실행하면 문서 업데이트, 학습 포인트, 후속 작업을 자동으로 정리할 수 있습니다.'
      };

      process.stdout.write(JSON.stringify(response));
    } catch {
      // ignore errors
    }
    process.exit(0);
  });
}

main();
