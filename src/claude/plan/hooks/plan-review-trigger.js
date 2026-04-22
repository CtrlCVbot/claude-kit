'use strict';
/**
 * plan-review-trigger.js — Stop 훅
 * IMP-KIT-007 — /plan-review 자동 후속 트리거
 *
 * Stop 훅 발동 시점에 이번 세션의 실행 커맨드 목록을 조회하여:
 *  - /plan-prd, /plan-draft, /plan-wireframe 중 하나 이상 실행됐고
 *  - /plan-review가 미실행이면
 *  → systemMessage로 /plan-review 실행 권장.
 *
 * autoReview 설정 (~/.claude/settings.json의 "autoReview": false)으로 비활성화 가능.
 *
 * Codex fallback: src/codex/plan/hooks/plan-review-trigger.js (동일 로직)
 * 관련 스펙: docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-007-plan-review-auto-trigger.md
 *
 * chain-point: feedback-collector
 *   (kit-feedback-archiving Phase 3에서 본 훅 이후 feedback 수집 훅이 체이닝됨)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const TRIGGER_COMMANDS = ['/plan-prd', '/plan-draft', '/plan-wireframe'];
const REVIEW_COMMAND = '/plan-review';

/**
 * 트리거 결정 로직 (순수 함수, 테스트 용이).
 * @param {object} [input]
 * @param {string[]} [input.commandsExecuted] 세션에서 실행된 커맨드 목록 (예: ['/plan-prd'])
 * @param {boolean} [input.autoReview=true] autoReview 설정값
 * @returns {{systemMessage?: string}} systemMessage 포함 시 Stop 훅이 안내 메시지 출력
 */
function decideTrigger(input) {
  const opts = input || {};
  const commandsExecuted = Array.isArray(opts.commandsExecuted) ? opts.commandsExecuted : [];
  const autoReview = opts.autoReview === undefined ? true : !!opts.autoReview;

  if (!autoReview) return {};
  if (commandsExecuted.includes(REVIEW_COMMAND)) return {};

  const triggered = commandsExecuted.some(cmd => TRIGGER_COMMANDS.includes(cmd));
  if (!triggered) return {};

  return {
    systemMessage:
      '[Plan Review] 이번 세션에서 ' + TRIGGER_COMMANDS.join('/') + ' 중 하나 이상이 실행되었습니다. ' +
      '품질 확인을 위해 ' + REVIEW_COMMAND + ' 실행을 권장합니다. ' +
      '(자동 비활성화: ~/.claude/settings.json에 "autoReview": false 추가)'
  };
}

function readCommandsFromSessionStats(sessionId) {
  if (!sessionId) return [];
  try {
    const statsFile = path.join(os.homedir(), '.claude', '.session-stats.json');
    if (!fs.existsSync(statsFile)) return [];
    const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    const session = stats[sessionId] || {};
    return Array.isArray(session.commands_executed) ? session.commands_executed : [];
  } catch {
    return [];
  }
}

function readAutoReviewSetting() {
  try {
    const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
    if (!fs.existsSync(settingsPath)) return true;
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    return settings.autoReview !== false;
  } catch {
    return true;
  }
}

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

      const markerFile = path.join(os.tmpdir(), 'plan-review-suggested-' + sessionId);
      if (fs.existsSync(markerFile)) {
        process.exit(0);
      }

      const commandsExecuted = readCommandsFromSessionStats(sessionId);
      const autoReview = readAutoReviewSetting();
      const result = decideTrigger({ commandsExecuted, autoReview });

      if (result.systemMessage) {
        try { fs.writeFileSync(markerFile, '1'); } catch { /* ignore marker errors */ }
        process.stdout.write(JSON.stringify({
          continue: true,
          systemMessage: result.systemMessage
        }));
      }
    } catch {
      // ignore parsing errors, never block session termination
    }
    process.exit(0);
  });
}

module.exports = { decideTrigger, TRIGGER_COMMANDS, REVIEW_COMMAND, main };

if (require.main === module) {
  main();
}
