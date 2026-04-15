/**
 * codex-hook-compat.js — Hook의 Codex 호환성과 portability strategy를 판정한다.
 *
 * Phase 1 (docs/codex-sync/04-rollout-validation-plan.md §4.2)부터:
 *   - HOOK_PORTABILITY 구조화된 메타데이터 도입
 *   - strategy / officialSurface / evidenceLevel / docConstraints / fallbackTarget 분류
 *   - backward-compat: isCodexCompatible(), filterCodexHooks() 서명 유지
 *
 * SSOT 우선순위:
 *   1. src/exception-registry.json (예외/승인 흐름)
 *   2. src/claude/_meta/codex-portability.json (Phase 4 도입 예정, 전략/공식 근거)
 *   3. 본 파일의 HOOK_PORTABILITY (hook 한정 setup.js compat 판단)
 */

'use strict';

/**
 * Hook의 Codex portability 메타데이터.
 *
 * @typedef {Object} HookPortability
 * @property {'paired-direct'|'paired-fallback'|'paired-review'|'blocked'} strategy
 * @property {'hooks'|'hooks.stop'|null} officialSurface
 * @property {'공식 지원'|'우회 가능'|'추정'|'검증 필요'} evidenceLevel
 * @property {string[]} docConstraints
 * @property {'skill'|'agents-guidance'|'command'|'wrapper'|null} [fallbackTarget]
 * @property {boolean} compatible - setup.js 의 Claude→Codex plugin 복사 대상 여부
 * @property {string|null} reason  - compatible=false 사유 (backward-compat: 기존 string reason 유지)
 */

/** @type {Record<string, HookPortability>} */
const HOOK_PORTABILITY = {
  'output-secret-filter.js': {
    strategy: 'paired-direct',
    officialSurface: 'hooks',
    evidenceLevel: '검증 필요',
    docConstraints: [
      'prompt-side validation only',
      'Bash-scoped post-processing only',
      'experimental on Codex',
      'Windows hooks currently disabled',
    ],
    fallbackTarget: null,
    // T18 (Phase 4) 적용 후: setup.js의 emitCodex가 paired-direct hook에 한해
    // src/codex/ 우선 소스로 읽으므로 compatible:true로 전환 가능.
    // src/codex/core/hooks/output-secret-filter.js는 dual-aware (CODEX_SANDBOX || CLAUDE_REMOTE_SESSION).
    compatible: true,
    reason: null,
  },
  'session-wrap-suggest.js': {
    strategy: 'paired-fallback',
    officialSurface: 'hooks.stop',
    evidenceLevel: '검증 필요',
    docConstraints: [
      'Stop event is officially documented in Codex Hooks',
      'Claude session-stats.json path not reproducible on Codex',
      'tmpdir marker semantics not documented',
    ],
    fallbackTarget: 'skill',
    compatible: false,
    reason: 'paired-fallback: state-parity not reproducible (Claude session-stats.json + tmpdir marker)',
  },
};

/**
 * 후방 호환용 string-only EXCLUDED_HOOKS view.
 * 신규 코드는 HOOK_PORTABILITY 또는 getPortability(file) 사용 권장.
 *
 * @deprecated Use HOOK_PORTABILITY for structured metadata.
 */
const EXCLUDED_HOOKS = Object.fromEntries(
  Object.entries(HOOK_PORTABILITY)
    .filter(([, meta]) => meta.compatible === false)
    .map(([file, meta]) => [file, meta.reason])
);

/**
 * 훅 파일이 Codex setup.js 복사 대상인지 판정한다.
 * @param {string} hookFilename - 훅 파일명 (예: 'edit-tracker.js')
 * @returns {{ compatible: boolean, reason: string|null }}
 */
function isCodexCompatible(hookFilename) {
  const meta = HOOK_PORTABILITY[hookFilename];
  if (!meta) {
    return { compatible: true, reason: null };
  }
  return {
    compatible: meta.compatible !== false,
    reason: meta.compatible === false ? meta.reason : null,
  };
}

/**
 * 훅 목록에서 Codex setup.js 복사 대상만 필터링한다.
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

/**
 * 훅 파일의 Phase 1 portability 메타데이터를 반환한다.
 * Phase 4 /kit-analyze 가 4-tier 출력에 활용한다.
 * @param {string} hookFilename
 * @returns {HookPortability|null}
 */
function getPortability(hookFilename) {
  return HOOK_PORTABILITY[hookFilename] || null;
}

module.exports = {
  isCodexCompatible,
  filterCodexHooks,
  getPortability,
  HOOK_PORTABILITY,
  // backward-compat (deprecated)
  EXCLUDED_HOOKS,
};
