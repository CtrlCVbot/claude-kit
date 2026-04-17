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
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const CONTENT_SAFE_EXTENSIONS = new Set(['.md', '.js', '.json', '.ts', '.yaml', '.yml']);

const CORE_RULES = [
  'coding-style', 'date-calculation', 'golden-principles',
  'interaction', 'security', 'verification'
];

const DRIFT_MARKERS = [
  'copy', 'scenario', 'Feature 유형', '시나리오',
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

function findMissingMarkers(sourceContent, targetContent) {
  const missing = [];
  for (const marker of DRIFT_MARKERS) {
    const srcCount = (sourceContent.match(new RegExp(escapeRegExp(marker), 'gi')) || []).length;
    const tgtCount = (targetContent.match(new RegExp(escapeRegExp(marker), 'gi')) || []).length;
    if (srcCount > 0 && tgtCount === 0) {
      missing.push(marker);
    }
  }
  return missing;
}

// --- Time-based drift checks ---

function checkRuleFallbackDrift() {
  const findings = [];
  const templatePath = 'src/templates/AGENTS.md.template';
  const templateDate = getLastCommitDate(templatePath);

  for (const rule of CORE_RULES) {
    const rulePath = `src/claude/core/rules/${rule}.md`;
    const ruleDate = getLastCommitDate(rulePath);

    if (!ruleDate || !templateDate) continue;

    if (new Date(ruleDate) > new Date(templateDate)) {
      findings.push({
        type: 'rule-fallback-drift',
        level: 'INFO',
        source: rulePath,
        artifact: `${templatePath} ### ${rule}`,
        message: `Rule "${rule}" changed after AGENTS.md.template (${ruleDate} > ${templateDate}). Template section may need update.`
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

  for (const entry of portability.entries) {
    if (entry.strategy !== 'paired-direct') continue;
    if (!entry.claudeSource || !entry.codexSource) continue;

    const claudeDate = getLastCommitDate(entry.claudeSource);
    const codexDate = getLastCommitDate(entry.codexSource);

    if (!claudeDate || !codexDate) continue;

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

  const claudeContent = readFileSafe(claudePath);
  const codexContent = readFileSafe(codexPath);
  if (!claudeContent || !codexContent) return null;

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
  const templatePath = path.join(ROOT, 'src/templates/AGENTS.md.template');
  if (!fs.existsSync(templatePath)) return findings;

  const templateContent = fs.readFileSync(templatePath, 'utf8');

  for (const rule of CORE_RULES) {
    const rulePath = path.join(ROOT, `src/claude/core/rules/${rule}.md`);
    if (!fs.existsSync(rulePath)) continue;

    const ruleContent = fs.readFileSync(rulePath, 'utf8');

    // h2/h3 경계 모두에서 정지하여 오버캡처 방지
    const sectionRegex = new RegExp(`### ${escapeRegExp(rule)}\\b[\\s\\S]*?(?=\\n##? |$)`);
    const sectionMatch = templateContent.match(sectionRegex);
    if (!sectionMatch) continue;

    const missingMarkers = findMissingMarkers(ruleContent, sectionMatch[0]);

    if (missingMarkers.length > 0) {
      findings.push({
        type: 'rule-content-drift',
        level: 'INFO',
        source: `src/claude/core/rules/${rule}.md`,
        artifact: `src/templates/AGENTS.md.template ### ${rule}`,
        identity: rule,
        missingMarkers,
        message: `Rule fallback "${rule}": AGENTS.md.template section missing domain references: ${missingMarkers.join(', ')}`
      });
    }
  }

  return findings;
}

// --- Artifact existence checks ---

function checkArtifactExistence() {
  const findings = [];

  // S2: AGENTS.md.template h3 sections
  const templatePath = path.join(ROOT, 'src/templates/AGENTS.md.template');
  if (fs.existsSync(templatePath)) {
    const content = fs.readFileSync(templatePath, 'utf8');
    const h3Count = (content.match(/^### /gm) || []).length;
    if (h3Count < CORE_RULES.length) {
      findings.push({
        type: 'artifact-missing',
        level: 'FAIL',
        source: 'src/templates/AGENTS.md.template',
        artifact: '### sections',
        message: `AGENTS.md.template has ${h3Count} h3 sections (expected ${CORE_RULES.length}). Rule fallback artifact may be deleted.`
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
