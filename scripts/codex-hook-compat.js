/**
 * codex-hook-compat.js — Hook의 Codex 호환성을 판정한다.
 *
 * Claude 전용 환경변수, 홈 디렉토리 런타임, remote session에 의존하는 훅은
 * Codex에서 오동작할 수 있으므로 제외한다.
 */

'use strict';

/**
 * Codex에서 제외할 훅 목록과 사유
 */
const EXCLUDED_HOOKS = {
  'output-secret-filter.js': 'depends on CLAUDE_REMOTE_SESSION and ~/.claude runtime',
  'session-wrap-suggest.js': 'depends on Claude Stop event (no Codex equivalent)',
};

/**
 * 훅 파일이 Codex에서 호환되는지 판정한다.
 * @param {string} hookFilename - 훅 파일명 (예: 'edit-tracker.js')
 * @returns {{ compatible: boolean, reason?: string }}
 */
function isCodexCompatible(hookFilename) {
  const reason = EXCLUDED_HOOKS[hookFilename];
  if (reason) {
    return { compatible: false, reason };
  }
  return { compatible: true };
}

/**
 * 훅 목록에서 Codex 호환 훅만 필터링한다.
 * @param {string[]} hookFiles - 훅 파일명 배열
 * @returns {{ compatible: string[], skipped: Array<{ component: string, reason: string }> }}
 */
function filterCodexHooks(hookFiles) {
  const compatible = [];
  const skipped = [];

  for (const file of hookFiles) {
    const result = isCodexCompatible(file);
    if (result.compatible) {
      compatible.push(file);
    } else {
      skipped.push({ component: file, reason: result.reason });
    }
  }

  return { compatible, skipped };
}

module.exports = { isCodexCompatible, filterCodexHooks, EXCLUDED_HOOKS };
