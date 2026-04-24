/**
 * audit-pairing.js — C7 pairing 일관성 검증 (즉시 실행 가능 명령 통합)
 *
 * codex-sync cross-phase review CC3 기반. S2/S3/S4 silent failure 감지 통합.
 *
 * 사용법:
 *   node scripts/audit-pairing.js          # 전체 검사
 *   node scripts/audit-pairing.js --json   # JSON 출력
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function checkPairingRegistry() {
  const findings = [];
  const registryPath = path.join(ROOT, 'src/pairing-registry.json');

  if (!fs.existsSync(registryPath)) {
    findings.push({ type: 'pairing-registry-missing', level: 'FAIL', message: 'src/pairing-registry.json not found' });
    return findings;
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const validTypes = ['skill', 'agent', 'command', 'hook', 'rule'];
  const validStatus = ['paired', 'codex-skip', 'codex-native-only', 'unpaired'];
  const validSchemas = ['pairing-registry-v1', 'pairing-registry-v2'];
  const validDomains = ['core', 'dev', 'plan', 'copy'];
  const validPrimaryCodex = ['command', 'skill', 'agent', 'hook', 'fallback', 'none'];
  const validTransitionState = ['command-primary', 'skill-primary', 'dual-output', 'command-wrapper', 'deprecated-command'];
  const validDriftStatus = [null, 'content-drift', 'metadata-drift', 'generated-mismatch'];

  if (!validSchemas.includes(registry.$schema)) {
    findings.push({ type: 'S4-invalid-schema', level: 'FAIL', message: `invalid $schema "${registry.$schema}"` });
  }

  const seen = new Set();

  for (const entry of registry.entries) {
    if (seen.has(entry.identity)) {
      findings.push({ type: 'duplicate-identity', level: 'FAIL', message: `${entry.identity}: duplicate identity` });
    }
    seen.add(entry.identity);

    // S4: enum validation
    if (!validTypes.includes(entry.type)) {
      findings.push({ type: 'S4-invalid-type', level: 'FAIL', message: `${entry.identity}: invalid type "${entry.type}"` });
    }
    if (!validStatus.includes(entry.status)) {
      findings.push({ type: 'S4-invalid-status', level: 'FAIL', message: `${entry.identity}: invalid status "${entry.status}"` });
    }
    if (!validDomains.includes(entry.domain)) {
      findings.push({ type: 'S4-invalid-domain', level: 'FAIL', message: `${entry.identity}: invalid domain "${entry.domain}"` });
    }

    if (registry.$schema === 'pairing-registry-v2') {
      if (!validPrimaryCodex.includes(entry.primaryCodex)) {
        findings.push({ type: 'S4-invalid-primary-codex', level: 'FAIL', message: `${entry.identity}: invalid primaryCodex "${entry.primaryCodex}"` });
      }
      if (!validDriftStatus.includes(entry.driftStatus ?? null)) {
        findings.push({ type: 'S4-invalid-drift-status', level: 'FAIL', message: `${entry.identity}: invalid driftStatus "${entry.driftStatus}"` });
      }
      if (entry.type === 'command') {
        if (!validTransitionState.includes(entry.transitionState)) {
          findings.push({ type: 'S4-invalid-transition-state', level: 'FAIL', message: `${entry.identity}: invalid transitionState "${entry.transitionState}"` });
        }
        if (entry.transitionState !== 'command-primary' && entry.primaryCodex === 'command') {
          findings.push({ type: 'transition-primary-mismatch', level: 'WARN', message: `${entry.identity}: non-command-primary transition still has primaryCodex=command` });
        }
      }
    }

    // Paired file existence
    if (entry.status === 'paired') {
      if (!entry.claude) {
        findings.push({ type: 'paired-claude-missing', level: 'FAIL', message: `${entry.identity}: paired entry has no claude path` });
      } else if (!fs.existsSync(path.join(ROOT, entry.claude))) {
        findings.push({ type: 'paired-claude-missing', level: 'FAIL', message: `${entry.identity}: claude file missing: ${entry.claude}` });
      }
      if (!entry.codex) {
        findings.push({ type: 'paired-codex-missing', level: 'FAIL', message: `${entry.identity}: paired entry has no codex path` });
      } else if (!fs.existsSync(path.join(ROOT, entry.codex))) {
        findings.push({ type: 'paired-codex-missing', level: 'FAIL', message: `${entry.identity}: codex file missing: ${entry.codex}` });
      }
    }

    // codex-skip reason
    if (entry.status === 'codex-skip' && !entry.reason) {
      findings.push({ type: 'codex-skip-no-reason', level: 'FAIL', message: `${entry.identity}: codex-skip without reason` });
    }
  }

  return findings;
}

function checkExceptionCrossCheck() {
  const findings = [];
  const exPath = path.join(ROOT, 'src/exception-registry.json');
  const prPath = path.join(ROOT, 'src/pairing-registry.json');

  if (!fs.existsSync(exPath) || !fs.existsSync(prPath)) return findings;

  const exceptions = JSON.parse(fs.readFileSync(exPath, 'utf8'));
  const pairing = JSON.parse(fs.readFileSync(prPath, 'utf8'));

  for (const ex of exceptions.entries) {
    const pr = pairing.entries.find(p => p.identity === ex.component);

    // paired-direct + resolved → pairing entry should exist + status=paired
    if (ex.strategy === 'paired-direct' && ex.status === 'resolved') {
      if (!pr) {
        findings.push({ type: 'cross-check-missing', level: 'WARN', message: `${ex.id} (${ex.component}): paired-direct/resolved but no pairing entry` });
      } else if (pr.status !== 'paired') {
        findings.push({ type: 'cross-check-mismatch', level: 'FAIL', message: `${ex.id} (${ex.component}): paired-direct/resolved but pairing status="${pr.status}"` });
      }
    }

    // blocked → pairing should be codex-skip
    if (ex.strategy === 'blocked') {
      if (pr && pr.status === 'paired') {
        findings.push({ type: 'cross-check-contradiction', level: 'FAIL', message: `${ex.id} (${ex.component}): blocked but pairing status=paired` });
      }
    }
  }

  return findings;
}

function checkSkillArtifacts() {
  const findings = [];
  const exPath = path.join(ROOT, 'src/exception-registry.json');
  if (!fs.existsSync(exPath)) return findings;

  const exceptions = JSON.parse(fs.readFileSync(exPath, 'utf8'));

  // S3: skill fallback artifact existence
  for (const ex of exceptions.entries) {
    if (ex.strategy === 'paired-fallback' && ex.fallbackTarget === 'skill' && ex.status === 'resolved') {
      const domain = ex.domain || 'core';
      const skillPath = path.join(ROOT, 'src/claude', domain, 'skills', ex.component, 'SKILL.md');
      if (!fs.existsSync(skillPath)) {
        findings.push({ type: 'S3-skill-missing', level: 'FAIL', message: `${ex.id} (${ex.component}): resolved + fallbackTarget=skill but SKILL.md missing` });
      }
    }
  }

  // S2: managed fallback block existence
  const expectedArtifacts = [
    ['golden-principles', 'src/templates/agents-md/10-golden-principles.md'],
    ['verification', 'src/templates/agents-md/30-verification.md'],
    ['coding-style', 'src/templates/agents-md/40-coding-style.md'],
    ['security', 'src/templates/agents-md/50-security.md'],
    ['security-no-hardcoded-secrets', 'src/templates/agents-md/55-security-no-hardcoded-secrets.md'],
    ['interaction', 'src/templates/agents-md/60-interaction.md'],
    ['date-calculation', 'src/templates/agents-md/90-date-calculation.md']
  ];

  for (const [rule, artifact] of expectedArtifacts) {
    if (!fs.existsSync(path.join(ROOT, artifact))) {
      findings.push({ type: 'S2-managed-block-missing', level: 'FAIL', message: `managed fallback block missing for ${rule}: ${artifact}` });
    }
  }

  return findings;
}

function main() {
  const jsonMode = process.argv.includes('--json');

  const allFindings = [
    ...checkPairingRegistry(),
    ...checkExceptionCrossCheck(),
    ...checkSkillArtifacts(),
  ];

  if (jsonMode) {
    console.log(JSON.stringify(allFindings, null, 2));
    return;
  }

  console.log('[audit-pairing] C7 pairing 일관성 + S2/S3/S4 silent failure 검증\n');

  const fails = allFindings.filter(f => f.level === 'FAIL');
  const warns = allFindings.filter(f => f.level === 'WARN');

  if (fails.length > 0) {
    console.log(`  FAIL (${fails.length}):`);
    for (const f of fails) console.log(`    [${f.type}] ${f.message}`);
  }

  if (warns.length > 0) {
    console.log(`  WARN (${warns.length}):`);
    for (const f of warns) console.log(`    [${f.type}] ${f.message}`);
  }

  if (allFindings.length === 0) {
    console.log('  PASS: all pairing checks passed.\n');
  }

  console.log(`\n  Summary: ${fails.length} FAIL, ${warns.length} WARN`);
  process.exit(fails.length > 0 ? 1 : 0);
}

main();
