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

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_CODEX = path.join(ROOT, 'src', 'codex');
const PORTABILITY_MANIFEST = path.join(ROOT, 'src', 'claude', '_meta', 'codex-portability.json');

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
  'copy-evidence-reminder.js': {
    strategy: 'paired-review',
    officialSurface: 'hooks',
    evidenceLevel: '추정',
    docConstraints: [
      'PostToolUse Edit|Write reminder',
      'evidence path convention depends on .plans/ structure',
    ],
    fallbackTarget: null,
    compatible: false,
    reason: 'paired-review: copy domain hook, Codex validation pending',
  },
  'copy-doc-drift-check.js': {
    strategy: 'paired-review',
    officialSurface: 'hooks',
    evidenceLevel: '추정',
    docConstraints: [
      'PostToolUse Edit|Write reminder',
      'document-implementation drift detection',
    ],
    fallbackTarget: null,
    compatible: false,
    reason: 'paired-review: copy domain hook, Codex validation pending',
  },
  'copy-scope-guard.js': {
    strategy: 'paired-review',
    officialSurface: 'hooks',
    evidenceLevel: '추정',
    docConstraints: [
      'PreToolUse Edit|Write reminder (initially)',
      'execution unit scope tracking depends on .plans/ metadata',
    ],
    fallbackTarget: null,
    compatible: false,
    reason: 'paired-review: copy domain hook, Codex validation pending',
  },
  'copy-variant-env-guard.js': {
    strategy: 'paired-review',
    officialSurface: 'hooks',
    evidenceLevel: '추정',
    docConstraints: [
      'PostToolUse Edit|Write reminder',
      'variant/host map env detection',
    ],
    fallbackTarget: null,
    compatible: false,
    reason: 'paired-review: copy domain hook, Codex validation pending',
  },
  'copy-gate-stop.js': {
    strategy: 'paired-review',
    officialSurface: 'hooks.stop',
    evidenceLevel: '추정',
    docConstraints: [
      'Stop event blocking candidate (disabled by default)',
      'Phase/R closeout gate logic',
    ],
    fallbackTarget: null,
    compatible: false,
    reason: 'paired-review: copy domain hook, Codex validation pending',
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

let manifestCache = null;

function readPortabilityManifest() {
  if (manifestCache !== null) return manifestCache;
  if (!fs.existsSync(PORTABILITY_MANIFEST)) {
    manifestCache = [];
    return manifestCache;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(PORTABILITY_MANIFEST, 'utf8'));
    manifestCache = Array.isArray(manifest.entries) ? manifest.entries : [];
  } catch {
    manifestCache = [];
  }
  return manifestCache;
}

function hookIdentity(hookFilename) {
  return hookFilename.replace(/\.js$/, '');
}

function getManifestPortability(hookFilename) {
  const identity = hookIdentity(hookFilename);
  const entry = readPortabilityManifest().find(
    item => item.type === 'hook' && item.identity === identity
  );
  if (!entry) return null;

  return {
    strategy: entry.strategy,
    officialSurface: entry.officialSurface,
    evidenceLevel: entry.evidenceLevel,
    docConstraints: entry.docConstraints || [],
    fallbackTarget: entry.fallbackTarget ?? null,
    compatible: entry.strategy === 'paired-direct',
    reason: entry.strategy === 'paired-direct' ? null : `${entry.strategy}: not emitted as direct Codex hook`,
    claudeSource: entry.claudeSource || null,
    codexSource: entry.codexSource || null,
  };
}

/**
 * 훅 파일이 Codex setup.js 복사 대상인지 판정한다.
 * @param {string} hookFilename - 훅 파일명 (예: 'edit-tracker.js')
 * @returns {{ compatible: boolean, reason: string|null }}
 */
function isCodexCompatible(hookFilename) {
  const meta = getPortability(hookFilename);
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
  const manifestMeta = getManifestPortability(hookFilename);
  const runtimeMeta = HOOK_PORTABILITY[hookFilename];
  if (manifestMeta && runtimeMeta) {
    return { ...manifestMeta, ...runtimeMeta, codexSource: manifestMeta.codexSource, claudeSource: manifestMeta.claudeSource };
  }
  return runtimeMeta || manifestMeta || null;
}

function detectHookMetadataDrift() {
  const findings = [];
  for (const entry of readPortabilityManifest()) {
    if (entry.type !== 'hook') continue;
    const expectedSource = path.join(SRC_CODEX, entry.domain, 'hooks', `${entry.identity}.js`);
    const expectedRel = path.relative(ROOT, expectedSource).split(path.sep).join('/');
    const exists = fs.existsSync(expectedSource);

    if (exists && entry.codexSource !== expectedRel) {
      findings.push({
        identity: entry.identity,
        type: 'metadata-drift',
        expected: expectedRel,
        actual: entry.codexSource,
        message: `${entry.identity}: Codex hook source exists but portability codexSource is stale`,
      });
    }

    if (!exists && entry.codexSource) {
      findings.push({
        identity: entry.identity,
        type: 'metadata-drift',
        expected: null,
        actual: entry.codexSource,
        message: `${entry.identity}: portability codexSource points to a missing file`,
      });
    }
  }
  return findings;
}

function main() {
  const findings = detectHookMetadataDrift();
  if (findings.length === 0) {
    console.log('[codex-hook-compat] PASS: no hook metadata drift detected.');
    return;
  }

  console.log(`[codex-hook-compat] FAIL: ${findings.length} metadata drift item(s)`);
  for (const finding of findings) {
    console.log(`  - ${finding.message}`);
    console.log(`    expected: ${finding.expected}`);
    console.log(`    actual: ${finding.actual}`);
  }
  process.exit(1);
}

module.exports = {
  isCodexCompatible,
  filterCodexHooks,
  getPortability,
  detectHookMetadataDrift,
  HOOK_PORTABILITY,
  // backward-compat (deprecated)
  EXCLUDED_HOOKS,
};

if (require.main === module) {
  main();
}
