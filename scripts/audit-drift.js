/**
 * audit-drift.js — C10 codex-sync artifact drift detection
 *
 * 원본 source와 fallback artifact 간 drift를 감지한다.
 * codex-sync Phase 4 (kit-audit.md C10) + cross-phase review CC3.
 *
 * 사용법:
 *   node scripts/audit-drift.js            # 전체 검사 (시간 기반)
 *   node scripts/audit-drift.js --content  # 내용 비대칭 검사 포함
 *   node scripts/audit-drift.js --json     # JSON 출력
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const CONTENT_SAFE_EXTENSIONS = new Set(['.md', '.js', '.json', '.ts', '.yaml', '.yml']);

const RULE_FALLBACKS = [
  {
    identity: 'golden-principles',
    source: 'src/claude/core/rules/golden-principles.md',
    artifact: 'src/templates/agents-md/10-golden-principles.md'
  },
  {
    identity: 'verification',
    source: 'src/claude/core/rules/verification.md',
    artifact: 'src/templates/agents-md/30-verification.md',
    markers: ['/copy-verify', 'copy-reference', '시나리오', '갭 분석']
  },
  {
    identity: 'git-workflow-v2',
    source: 'src/claude/core/rules/git-workflow-v2.md',
    artifact: 'src/templates/agents-md/25-git-workflow.md',
    markers: ['git config --local user.name', 'Co-Authored-By', 'Conventional Commits', '원자적 커밋']
  },
  {
    identity: 'coding-style',
    source: 'src/claude/core/rules/coding-style.md',
    artifact: 'src/templates/agents-md/40-coding-style.md'
  },
  {
    identity: 'security',
    source: 'src/claude/core/rules/security.md',
    artifact: 'src/templates/agents-md/50-security.md'
  },
  {
    identity: 'security-no-hardcoded-secrets',
    source: 'src/claude/core/rules/security.md',
    artifact: 'src/templates/agents-md/55-security-no-hardcoded-secrets.md',
    sourceSections: ['Mandatory Security Checks', 'Secret Management'],
    markers: ['API key', 'password', 'token', 'secret'],
    timeCheck: false
  },
  {
    identity: 'interaction',
    source: 'src/claude/core/rules/interaction.md',
    artifact: 'src/templates/agents-md/60-interaction.md',
    markers: ['시나리오', 'Feature 유형', '/plan-draft']
  },
  {
    identity: 'date-calculation',
    source: 'src/claude/core/rules/date-calculation.md',
    artifact: 'src/templates/agents-md/90-date-calculation.md'
  }
];

const DRIFT_MARKERS = [
  'scenario', 'Feature 유형', '시나리오',
  '/copy-', 'copy-reference', 'routing-metadata', '갭 분석',
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getLastCommitDate(filePath) {
  try {
    const absPath = path.resolve(ROOT, filePath);
    if (!fs.existsSync(absPath)) return null;
    const result = execSync(
      `git log -1 --format=%aI -- "${filePath}"`,
      { cwd: ROOT, encoding: 'utf8' }
    ).trim();
    return result || null;
  } catch {
    return null;
  }
}

function readFileSafe(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!CONTENT_SAFE_EXTENSIONS.has(ext)) return null;
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function stripMarkdownFrontmatter(content) {
  if (!content.startsWith('---')) return content;

  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (!match) return content;

  return content.slice(match[0].length).replace(/^\s+/, '');
}

function findMissingMarkers(sourceContent, targetContent, markers = DRIFT_MARKERS) {
  const missing = [];
  for (const marker of markers) {
    const srcCount = (sourceContent.match(new RegExp(escapeRegExp(marker), 'gi')) || []).length;
    const tgtCount = (targetContent.match(new RegExp(escapeRegExp(marker), 'gi')) || []).length;
    if (srcCount > 0 && tgtCount === 0) {
      missing.push(marker);
    }
  }
  return missing;
}

function extractMarkdownSections(content, headings) {
  const sections = [];

  for (const heading of headings) {
    const headingRegex = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'm');
    const match = headingRegex.exec(content);
    if (!match) continue;

    const sectionStart = match.index;
    const sectionBodyStart = sectionStart + match[0].length;
    const remainder = content.slice(sectionBodyStart);
    const nextH2 = /\n##\s+/.exec(remainder);
    const sectionEnd = nextH2 ? sectionBodyStart + nextH2.index : content.length;
    sections.push(content.slice(sectionStart, sectionEnd).trim());
  }

  return sections.join('\n\n');
}

function readRuleSourceContent(rule) {
  const rulePath = path.join(ROOT, rule.source);
  const content = fs.readFileSync(rulePath, 'utf8');

  if (!Array.isArray(rule.sourceSections) || rule.sourceSections.length === 0) {
    return content;
  }

  const extracted = extractMarkdownSections(content, rule.sourceSections);
  return extracted || content;
}

function loadPairingRegistryByIdentity() {
  const registryPath = path.join(ROOT, 'src/pairing-registry.json');
  if (!fs.existsSync(registryPath)) return new Map();

  try {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    return new Map((registry.entries || []).map(entry => [entry.identity, entry]));
  } catch {
    return new Map();
  }
}

function isSyncedAfterSourceChanges(entry, claudeDate, codexDate, pairingByIdentity) {
  const pairingEntry = pairingByIdentity.get(entry.identity);
  if (!pairingEntry || !pairingEntry.lastSyncedAt) return false;

  const lastSyncedAt = new Date(pairingEntry.lastSyncedAt);
  const latestSourceChange = new Date(Math.max(new Date(claudeDate), new Date(codexDate)));

  if (Number.isNaN(lastSyncedAt.getTime()) || Number.isNaN(latestSourceChange.getTime())) {
    return false;
  }

  return lastSyncedAt >= latestSourceChange;
}

function computeContentHash(filePath) {
  const absPath = path.join(ROOT, filePath);
  if (!fs.existsSync(absPath)) return null;

  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(absPath))
    .digest('hex')
    .slice(0, 8);
}

function isRegistryHashCurrent(entry, pairingByIdentity) {
  const pairingEntry = pairingByIdentity.get(entry.identity);
  if (!pairingEntry || !pairingEntry.contentHash || !entry.claudeSource) return false;

  return computeContentHash(entry.claudeSource) === pairingEntry.contentHash;
}

function preservesSessionWrapSuggestIntent(hookPath, skillPath) {
  const hookContent = readFileSafe(path.join(ROOT, hookPath));
  const skillContent = readFileSafe(path.join(ROOT, skillPath));
  if (!hookContent || !skillContent) return false;

  const thresholdMatch = hookContent.match(/totalCalls\s*<\s*(\d+)/);
  const threshold = thresholdMatch ? thresholdMatch[1] : null;
  if (!threshold) return false;

  return skillContent.includes(threshold)
    && skillContent.includes(hookPath)
    && skillContent.includes('session-wrap');
}

// --- Time-based drift checks ---

function checkRuleFallbackDrift() {
  const findings = [];
  for (const rule of RULE_FALLBACKS) {
    if (rule.timeCheck === false) continue;

    const ruleDate = getLastCommitDate(rule.source);
    const artifactDate = getLastCommitDate(rule.artifact);

    if (!ruleDate || !artifactDate) continue;

    if (new Date(ruleDate) > new Date(artifactDate)) {
      findings.push({
        type: 'rule-fallback-drift',
        level: 'INFO',
        source: rule.source,
        artifact: rule.artifact,
        message: `Rule "${rule.identity}" changed after fallback block (${ruleDate} > ${artifactDate}). Managed guidance may need update.`
      });
    }
  }

  return findings;
}

function checkHookFallbackDrift() {
  const findings = [];

  const hookPath = 'src/claude/core/hooks/session-wrap-suggest.js';
  const skillPath = 'src/claude/core/skills/session-wrap-suggest/SKILL.md';

  const hookDate = getLastCommitDate(hookPath);
  const skillDate = getLastCommitDate(skillPath);

  if (hookDate && skillDate && new Date(hookDate) > new Date(skillDate)) {
    if (preservesSessionWrapSuggestIntent(hookPath, skillPath)) {
      return findings;
    }

    findings.push({
      type: 'hook-fallback-drift',
      level: 'INFO',
      source: hookPath,
      artifact: skillPath,
      message: `Hook "session-wrap-suggest" changed after skill artifact (${hookDate} > ${skillDate}). Check if threshold or logic changes need skill update.`
    });
  }

  return findings;
}

function checkPairedDirectDrift() {
  const findings = [];

  const portabilityPath = path.join(ROOT, 'src/claude/_meta/codex-portability.json');
  if (!fs.existsSync(portabilityPath)) return findings;

  const portability = JSON.parse(fs.readFileSync(portabilityPath, 'utf8'));
  const pairingByIdentity = loadPairingRegistryByIdentity();

  for (const entry of portability.entries) {
    if (entry.strategy !== 'paired-direct') continue;
    if (!entry.claudeSource || !entry.codexSource) continue;

    const claudeDate = getLastCommitDate(entry.claudeSource);
    const codexDate = getLastCommitDate(entry.codexSource);

    if (!claudeDate || !codexDate) continue;
    if (isRegistryHashCurrent(entry, pairingByIdentity)) continue;
    if (isSyncedAfterSourceChanges(entry, claudeDate, codexDate, pairingByIdentity)) continue;

    const diff = Math.abs(new Date(claudeDate) - new Date(codexDate));
    const daysDiff = diff / (1000 * 60 * 60 * 24);

    if (daysDiff > 7) {
      const newer = new Date(claudeDate) > new Date(codexDate) ? 'claude' : 'codex';
      findings.push({
        type: 'paired-direct-drift',
        level: 'INFO',
        source: entry.claudeSource,
        artifact: entry.codexSource,
        message: `Paired-direct "${entry.identity}": ${newer} version is ${Math.round(daysDiff)} days newer. Check semantic consistency.`
      });
    }
  }

  return findings;
}

// --- Content-based drift checks (--content flag) ---

function checkPairedContentDrift() {
  const findings = [];
  const checked = new Set();

  // Source 1: codex-portability.json (paired-direct entries)
  const portabilityPath = path.join(ROOT, 'src/claude/_meta/codex-portability.json');
  if (fs.existsSync(portabilityPath)) {
    const portability = JSON.parse(fs.readFileSync(portabilityPath, 'utf8'));
    for (const entry of portability.entries) {
      if (entry.strategy !== 'paired-direct') continue;
      if (!entry.claudeSource || !entry.codexSource) continue;
      checked.add(entry.identity);
      const drift = detectContentDrift(entry.identity, entry.claudeSource, entry.codexSource);
      if (drift) findings.push(drift);
    }
  }

  // Source 2: pairing-registry.json (status=paired, not yet checked)
  const registryPath = path.join(ROOT, 'src/pairing-registry.json');
  if (fs.existsSync(registryPath)) {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    for (const entry of registry.entries) {
      if (entry.status !== 'paired') continue;
      if (checked.has(entry.identity)) continue;
      if (!entry.claude || !entry.codex) continue;
      checked.add(entry.identity);
      const drift = detectContentDrift(entry.identity, entry.claude, entry.codex);
      if (drift) findings.push(drift);
    }
  }

  return findings;
}

function detectContentDrift(identity, claudeSource, codexSource) {
  const claudePath = path.join(ROOT, claudeSource);
  const codexPath = path.join(ROOT, codexSource);
  if (!fs.existsSync(claudePath) || !fs.existsSync(codexPath)) return null;

  const claudeRawContent = readFileSafe(claudePath);
  const codexRawContent = readFileSafe(codexPath);
  if (!claudeRawContent || !codexRawContent) return null;

  const claudeContent = stripMarkdownFrontmatter(claudeRawContent);
  const codexContent = stripMarkdownFrontmatter(codexRawContent);

  const missingMarkers = findMissingMarkers(claudeContent, codexContent);

  if (missingMarkers.length > 0) {
    return {
      type: 'paired-content-drift',
      level: 'WARN',
      source: claudeSource,
      artifact: codexSource,
      identity,
      missingMarkers,
      message: `Paired "${identity}": Codex version missing domain references: ${missingMarkers.join(', ')}`
    };
  }
  return null;
}

function checkRuleContentDrift() {
  const findings = [];
  for (const rule of RULE_FALLBACKS.filter(entry => entry.contentCheck !== false)) {
    const rulePath = path.join(ROOT, rule.source);
    const artifactPath = path.join(ROOT, rule.artifact);
    if (!fs.existsSync(rulePath) || !fs.existsSync(artifactPath)) continue;

    const ruleContent = readRuleSourceContent(rule);
    const artifactContent = fs.readFileSync(artifactPath, 'utf8');
    const missingMarkers = findMissingMarkers(ruleContent, artifactContent, rule.markers || DRIFT_MARKERS);

    if (missingMarkers.length > 0) {
      findings.push({
        type: 'rule-content-drift',
        level: 'INFO',
        source: rule.source,
        artifact: rule.artifact,
        identity: rule.identity,
        missingMarkers,
        message: `Rule fallback "${rule.identity}": fallback block missing domain references: ${missingMarkers.join(', ')}`
      });
    }
  }

  return findings;
}

// --- Artifact existence checks ---

function checkArtifactExistence() {
  const findings = [];

  // S2: AGENTS managed fallback blocks
  for (const rule of RULE_FALLBACKS) {
    const artifactPath = path.join(ROOT, rule.artifact);
    if (!fs.existsSync(artifactPath)) {
      findings.push({
        type: 'artifact-missing',
        level: 'FAIL',
        source: rule.source,
        artifact: rule.artifact,
        message: `Managed fallback block missing for "${rule.identity}".`
      });
    }
  }

  // S3: skill fallback artifacts
  const registryPath = path.join(ROOT, 'src/exception-registry.json');
  if (fs.existsSync(registryPath)) {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    for (const entry of registry.entries) {
      if (entry.strategy === 'paired-fallback' && entry.fallbackTarget === 'skill' && entry.status === 'resolved') {
        const domain = entry.domain || 'core';
        const skillPath = path.join(ROOT, 'src/claude', domain, 'skills', entry.component, 'SKILL.md');
        if (!fs.existsSync(skillPath)) {
          findings.push({
            type: 'artifact-missing',
            level: 'FAIL',
            source: `exception-registry ${entry.id}`,
            artifact: `src/claude/${domain}/skills/${entry.component}/SKILL.md`,
            message: `Skill fallback artifact missing for "${entry.component}" (${entry.id} status=resolved but artifact not found).`
          });
        }
      }
    }
  }

  return findings;
}

// --- Output formatting ---

function formatFindings(allFindings) {
  const fails = allFindings.filter(f => f.level === 'FAIL');
  const warns = allFindings.filter(f => f.level === 'WARN');
  const infos = allFindings.filter(f => f.level === 'INFO');

  if (fails.length > 0) {
    console.log(`  FAIL (${fails.length}):`);
    for (const f of fails) {
      console.log(`    [${f.type}] ${f.message}`);
      console.log(`      source: ${f.source}`);
      console.log(`      artifact: ${f.artifact}\n`);
    }
  }

  if (warns.length > 0) {
    console.log(`  WARN (${warns.length}):`);
    for (const f of warns) {
      console.log(`    [${f.type}] ${f.message}`);
      if (f.missingMarkers) {
        console.log(`      missing: ${f.missingMarkers.join(', ')}`);
      }
    }
    console.log();
  }

  if (infos.length > 0) {
    console.log(`  INFO (${infos.length}):`);
    for (const f of infos) {
      console.log(`    [${f.type}] ${f.message}`);
      if (f.missingMarkers) {
        console.log(`      missing: ${f.missingMarkers.join(', ')}`);
      }
    }
  }

  if (allFindings.length === 0) {
    console.log('  PASS: no drift detected.\n');
  }

  console.log(`\n  Summary: ${fails.length} FAIL, ${warns.length} WARN, ${infos.length} INFO`);
  return fails.length;
}

// --- Entry point ---

function main() {
  const jsonMode = process.argv.includes('--json');
  const contentMode = process.argv.includes('--content');

  const allFindings = [
    ...checkArtifactExistence(),
    ...checkRuleFallbackDrift(),
    ...checkHookFallbackDrift(),
    ...checkPairedDirectDrift(),
    ...(contentMode ? checkPairedContentDrift() : []),
    ...(contentMode ? checkRuleContentDrift() : []),
  ];

  if (jsonMode) {
    console.log(JSON.stringify(allFindings, null, 2));
    return;
  }

  console.log('[audit-drift] C10 codex-sync artifact drift detection\n');
  if (contentMode) {
    console.log('  (--content mode: domain keyword asymmetry check enabled)\n');
  }

  const failCount = formatFindings(allFindings);
  process.exit(failCount > 0 ? 1 : 0);
}

main();
