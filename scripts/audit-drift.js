/**
 * audit-drift.js — C10 codex-sync artifact drift detection
 *
 * 원본 source와 fallback artifact 간 drift를 감지한다.
 * codex-sync Phase 4 (kit-audit.md C10) + cross-phase review CC3.
 *
 * 사용법:
 *   node scripts/audit-drift.js          # 전체 검사
 *   node scripts/audit-drift.js --json   # JSON 출력
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

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

function checkRuleFallbackDrift() {
  const findings = [];
  const templatePath = 'src/templates/AGENTS.md.template';
  const templateDate = getLastCommitDate(templatePath);

  const rules = [
    'coding-style', 'date-calculation', 'golden-principles',
    'interaction', 'security', 'verification'
  ];

  for (const rule of rules) {
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

function checkArtifactExistence() {
  const findings = [];

  // S2: AGENTS.md.template h3 sections
  const templatePath = path.join(ROOT, 'src/templates/AGENTS.md.template');
  if (fs.existsSync(templatePath)) {
    const content = fs.readFileSync(templatePath, 'utf8');
    const h3Count = (content.match(/^### /gm) || []).length;
    if (h3Count < 6) {
      findings.push({
        type: 'artifact-missing',
        level: 'FAIL',
        source: 'src/templates/AGENTS.md.template',
        artifact: '### sections',
        message: `AGENTS.md.template has ${h3Count} h3 sections (expected 6). Rule fallback artifact may be deleted.`
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

function main() {
  const jsonMode = process.argv.includes('--json');

  const allFindings = [
    ...checkArtifactExistence(),
    ...checkRuleFallbackDrift(),
    ...checkHookFallbackDrift(),
    ...checkPairedDirectDrift(),
  ];

  if (jsonMode) {
    console.log(JSON.stringify(allFindings, null, 2));
    return;
  }

  console.log('[audit-drift] C10 codex-sync artifact drift detection\n');

  const fails = allFindings.filter(f => f.level === 'FAIL');
  const infos = allFindings.filter(f => f.level === 'INFO');

  if (fails.length > 0) {
    console.log(`  FAIL (${fails.length}):`);
    for (const f of fails) {
      console.log(`    [${f.type}] ${f.message}`);
      console.log(`      source: ${f.source}`);
      console.log(`      artifact: ${f.artifact}\n`);
    }
  }

  if (infos.length > 0) {
    console.log(`  INFO (${infos.length}):`);
    for (const f of infos) {
      console.log(`    [${f.type}] ${f.message}`);
    }
  }

  if (allFindings.length === 0) {
    console.log('  PASS: no drift detected.\n');
  }

  console.log(`\n  Summary: ${fails.length} FAIL, ${infos.length} INFO`);
  process.exit(fails.length > 0 ? 1 : 0);
}

main();
