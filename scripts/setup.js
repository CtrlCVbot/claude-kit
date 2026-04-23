/**
 * setup.js — claude-kit v2.1 postinstall 스크립트
 *
 * npm 패키지의 AI 거버넌스 컴포넌트를 프로젝트에 설치한다.
 *
 * v2.0: 도메인 분리 (core/dev/plan) + 도메인별 플래트닝
 * v2.1: 멀티타겟 (Claude + Codex) + 3-stage 아키텍처
 * v2.2: target-separated source (src/claude/ + src/codex/) + 공유 templates
 *
 * 3-stage 아키텍처:
 *   source assets → normalization → target emitter(s)
 *
 * 8단계 흐름:
 * 1. 프로젝트 루트 탐색 (INIT_CWD)
 * 2. 설치 모드 판별 (신규 vs 업데이트)
 * 3. 도메인 + 타겟 감지
 * 4. 타겟별 디렉토리 구조 생성
 * 5. 도메인별 플래트닝 복사 (타겟별 emitter)
 * 6. 템플릿 처리
 * 7. 메타데이터 기록
 * 8. 결과 출력
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { mergeSettings } = require('./merge-settings');
const { filterCodexHooks, getPortability } = require('./codex-hook-compat');
const { renderQuickStart } = require('./quickstart-renderer');
const { renderClaudeManagedSection } = require('./claude-md-renderer');
const { mergeClaudeMd } = require('./claude-md-merger');
const { renderAgentsManagedSection } = require('./agents-md-renderer');
const { mergeAgentsMd } = require('./agents-md-merger');

const SRC_BASE   = path.resolve(__dirname, '..', 'src');
const SRC_CLAUDE = path.join(SRC_BASE, 'claude');
const SRC_CODEX  = path.join(SRC_BASE, 'codex');
const TEMPLATES  = path.join(SRC_BASE, 'templates');

const COMPONENT_DIRS = ['agents', 'commands', 'skills', 'hooks', 'rules'];
const CODEX_COMPONENT_DIRS = ['agents', 'commands', 'skills'];
const VALID_DOMAINS = ['core', 'dev', 'plan', 'copy'];
const AGENTS_MD_RUNTIME_FORBIDDEN = [
  {
    label: 'claude-kit source path',
    pattern: /\bsrc\/(?:claude|codex)\/[^\s)`"']*/g
  },
  {
    label: 'nonexistent runtime guidance path',
    pattern: /\bdocs\/codex-guidance\/[^\s)`"']*/g
  },
  {
    label: 'maintainer sync metadata',
    pattern: /\b(?:codex-sync Phase|medium merge artifact|codex-portability\.json)\b/g
  }
];

// codex-sync cross-phase review CC2: --dry-run 플래그 (T18 검증 등 dynamic verification)
const DRY_RUN = process.argv.includes('--dry-run');

function printDryRunSummary(projectRoot, activeDomains, activeTargets) {
  console.log('[DRY-RUN] claude-kit 설치 preview (file modification 없음)\n');
  console.log('project root:', projectRoot);
  console.log('active domains:', activeDomains.join(', '));
  console.log('active targets:', activeTargets.join(', '));

  if (!activeTargets.includes('codex')) {
    console.log('\nCodex target inactive — T18 preview 불가.');
    return;
  }

  console.log('\n=== T18 (codex-sync Phase 4): Codex hook source 분기 preview ===\n');
  const hookFiles = collectHookFiles(activeDomains);
  const { compatible, skipped } = filterCodexHooks(hookFiles);

  console.log(`compatible hooks (${compatible.length}):`);
  for (const hookFile of compatible) {
    const meta = getPortability(hookFile);
    const strategy = meta ? meta.strategy : 'default paired-direct';
    const preferCodex = meta && meta.strategy === 'paired-direct';
    let actualSource = null;
    const sourceRoots = preferCodex ? [SRC_CODEX, SRC_CLAUDE] : [SRC_CLAUDE];
    for (const root of sourceRoots) {
      for (const domain of activeDomains) {
        const p = path.join(root, domain, 'hooks', hookFile);
        if (fs.existsSync(p)) { actualSource = p; break; }
      }
      if (actualSource) break;
    }
    const sourceLabel = actualSource
      ? (actualSource.includes(SRC_CODEX) ? 'SRC_CODEX ✓' : 'SRC_CLAUDE (fallback)')
      : 'NOT FOUND';
    console.log(`  - ${hookFile} [${strategy}] → ${sourceLabel}`);
    if (actualSource) console.log(`      ${actualSource}`);
  }

  if (skipped.length > 0) {
    console.log(`\nskipped hooks (${skipped.length}):`);
    for (const s of skipped) {
      console.log(`  - ${s.component}: ${s.reason}`);
    }
  }

  const directUsePreview = previewCodexDirectUse(projectRoot, activeDomains);
  console.log('\n=== Codex direct-use output preview ===\n');
  console.log(`repo-local skills: ${directUsePreview.skills} → .agents/skills/**`);
  console.log(`repo-local agents: ${directUsePreview.agents} → .codex/agents/*.toml`);
  if (directUsePreview.conflicts.length > 0) {
    console.log(`conflicts (${directUsePreview.conflicts.length}):`);
    for (const conflict of directUsePreview.conflicts) {
      console.log(`  - ${conflict.path}: ${conflict.reason} (${conflict.source})`);
    }
  } else {
    console.log('conflicts: 0');
  }

  const agentsPreview = previewAgentsMdRuntimeLint(projectRoot);
  console.log('\n=== AGENTS.md runtime guidance lint ===\n');
  if (agentsPreview.status !== 'ok') {
    console.log(`status: ${agentsPreview.status}`);
  } else if (agentsPreview.warnings.length === 0) {
    console.log('status: ok');
  } else {
    console.log(`warnings: ${agentsPreview.warnings.length}`);
    for (const warning of agentsPreview.warnings) {
      console.log(`  - line ${warning.line}: ${warning.label} (${warning.match})`);
    }
  }

  console.log('\n[DRY-RUN] 완료. --dry-run 제거 시 실제 설치.');
}

function main() {
  try {
    const projectRoot = detectProjectRoot();
    const mode = detectMode(projectRoot);
    const activeDomains = resolveActiveDomains(projectRoot);
    const activeTargets = resolveTargets(projectRoot);
    const initialFiles = captureManagedFileState(projectRoot);

    if (DRY_RUN) {
      printDryRunSummary(projectRoot, activeDomains, activeTargets);
      return;
    }

    const allCounts = {};
    const allByDomain = {};
    const codexSkipped = [];
    const outputStatuses = {};

    // --- Claude emitter ---
    if (activeTargets.includes('claude')) {
      createClaudeDirectories(projectRoot);
      const { counts, byDomain } = emitClaude(projectRoot, activeDomains);
      processClaudeTemplates(projectRoot, mode, activeDomains, activeTargets);
      allCounts.claude = counts;
      allByDomain.claude = byDomain;
    }

    // --- Codex emitter ---
    if (activeTargets.includes('codex')) {
      const { counts, byDomain, skipped, agentsMdStatus, directUse } = emitCodex(projectRoot, activeDomains);
      allCounts.codex = counts;
      allByDomain.codex = byDomain;
      codexSkipped.push(...skipped);
      outputStatuses.codex = { agentsMdStatus, directUse };
    }

    processQuickStartTemplate(projectRoot, activeDomains, activeTargets);
    writeMetadata(projectRoot, mode, allCounts, allByDomain, activeDomains, activeTargets, codexSkipped, initialFiles, outputStatuses);
    printResult(mode, allCounts, activeDomains, activeTargets, outputStatuses);
  } catch (error) {
    console.error(`claude-kit 설치 실패: ${error.message}`);
    process.exit(0);
  }
}

// ═══════════════════════════════════════════
// 공통 단계
// ═══════════════════════════════════════════

function detectProjectRoot() {
  if (process.env.INIT_CWD) {
    return process.env.INIT_CWD;
  }

  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }

  throw new Error('프로젝트 루트를 찾을 수 없습니다 (package.json 없음)');
}

function detectMode(projectRoot) {
  const metaPath = path.join(projectRoot, '.claude-kit-meta.json');
  return fs.existsSync(metaPath) ? 'update' : 'fresh';
}

function captureManagedFileState(projectRoot) {
  return {
    profileJson: fs.existsSync(path.join(projectRoot, 'profile.json')),
    claudeMd: fs.existsSync(path.join(projectRoot, 'CLAUDE.md')),
    agentsMd: fs.existsSync(path.join(projectRoot, 'AGENTS.md'))
  };
}

function resolveActiveDomains(projectRoot) {
  let domains = ['core', 'dev'];

  const profilePath = path.join(projectRoot, 'profile.json');
  if (fs.existsSync(profilePath)) {
    try {
      const profile = readJsonSafe(profilePath);
      if (Array.isArray(profile.domains) && profile.domains.length > 0) {
        domains = profile.domains;
      }
    } catch {
      // profile.json 파싱 실패 시 기본값 사용
    }
  }

  domains = domains.filter(domain => VALID_DOMAINS.includes(domain));

  if (!domains.includes('core')) {
    domains.unshift('core');
  }

  return domains;
}

function resolveTargets(projectRoot) {
  let targets = ['claude'];

  const profilePath = path.join(projectRoot, 'profile.json');
  if (fs.existsSync(profilePath)) {
    try {
      const profile = readJsonSafe(profilePath);
      if (Array.isArray(profile.targets) && profile.targets.length > 0) {
        targets = profile.targets;
      }
    } catch {
      // profile.json 파싱 실패 시 기본값 사용
    }
  }

  return targets;
}

function resolveVariables(projectRoot) {
  let projectName = 'my-project';
  let projectDescription = '';
  let packageManager = 'pnpm';

  const pkgPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = readJsonSafe(pkgPath);
      projectName = pkg.name || projectName;
      projectDescription = pkg.description || projectDescription;
    } catch {
      // ignore
    }
  }

  if (fs.existsSync(path.join(projectRoot, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm';
  } else if (fs.existsSync(path.join(projectRoot, 'yarn.lock'))) {
    packageManager = 'yarn';
  } else if (fs.existsSync(path.join(projectRoot, 'bun.lockb'))) {
    packageManager = 'bun';
  } else {
    packageManager = 'npm';
  }

  const today = new Date().toISOString().split('T')[0];

  return {
    PROJECT_NAME: projectName,
    PROJECT_DESCRIPTION: projectDescription,
    PACKAGE_MANAGER: packageManager,
    DATE: today,
    VERSION: resolveVersion()
  };
}

function resolveVersion() {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version || '2.0.0';
  } catch {
    return '2.0.0';
  }
}

function readTemplate(templateDir, filename) {
  const filePath = path.join(templateDir, filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function substituteVars(content, vars) {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

function collectAgentsMdRuntimeWarnings(content) {
  const warnings = [];
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    for (const check of AGENTS_MD_RUNTIME_FORBIDDEN) {
      check.pattern.lastIndex = 0;
      const matches = lines[i].matchAll(check.pattern);
      for (const match of matches) {
        warnings.push({
          line: i + 1,
          label: check.label,
          match: match[0]
        });
      }
    }
  }

  return warnings;
}

function previewAgentsMdRuntimeLint(projectRoot) {
  const template = readTemplate(TEMPLATES, 'AGENTS.md.template');
  if (!template) {
    return { status: 'missing template', warnings: [] };
  }

  const rendered = substituteVars(template, resolveVariables(projectRoot));
  return {
    status: 'ok',
    warnings: collectAgentsMdRuntimeWarnings(rendered)
  };
}

function warnAgentsMdRuntimeIssues(warnings, targetPath) {
  if (warnings.length === 0) return;

  console.warn(`[WARN] ${targetPath} contains runtime guidance issues:`);
  for (const warning of warnings) {
    console.warn(`  - line ${warning.line}: ${warning.label} (${warning.match})`);
  }
}

function readJsonSafe(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // UTF-8 BOM 제거 (Windows 에디터 호환)
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcEntry = path.join(src, entry.name);
    const destEntry = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcEntry, destEntry);
    } else {
      fs.copyFileSync(srcEntry, destEntry);
    }
  }
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function relativeToRoot(filePath) {
  return toPosix(path.relative(path.resolve(__dirname, '..'), filePath));
}

function relativeToProject(projectRoot, filePath) {
  return toPosix(path.relative(projectRoot, filePath));
}

function normalizeManagedBody(content) {
  return content.endsWith('\n') ? content : `${content}\n`;
}

function hashContent(content) {
  const hash = crypto.createHash('sha256');
  if (Buffer.isBuffer(content)) {
    hash.update(content);
  } else {
    hash.update(String(content), 'utf8');
  }
  return hash.digest('hex');
}

function hashFile(filePath) {
  return hashContent(fs.readFileSync(filePath));
}

function sourceTextHash(content) {
  return hashContent(normalizeManagedBody(content));
}

function findFrontmatterEnd(content) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? match[0].length : 0;
}

function parseManagedContent(content) {
  const html = content.match(/^<!-- kit:managed source=(.*?) hash=([a-f0-9]+) -->\r?\n?/);
  if (html) {
    return {
      style: 'html',
      source: html[1],
      hash: html[2],
      body: content.slice(html[0].length),
    };
  }

  const frontmatterEnd = findFrontmatterEnd(content);
  if (frontmatterEnd > 0) {
    const frontmatter = content.slice(0, frontmatterEnd);
    const rest = content.slice(frontmatterEnd);
    const afterFrontmatter = rest.match(/^<!-- kit:managed source=(.*?) hash=([a-f0-9]+) -->\r?\n?/);
    if (afterFrontmatter) {
      return {
        style: 'html',
        source: afterFrontmatter[1],
        hash: afterFrontmatter[2],
        body: frontmatter + rest.slice(afterFrontmatter[0].length),
      };
    }
  }

  const hash = content.match(/^# kit:managed source=(.*?) hash=([a-f0-9]+)\r?\n?/);
  if (hash) {
    return {
      style: 'hash',
      source: hash[1],
      hash: hash[2],
      body: content.slice(hash[0].length),
    };
  }

  return null;
}

function renderManagedContent(sourceRel, body, style = 'html') {
  const normalized = normalizeManagedBody(body);
  const hash = hashContent(normalized);
  const marker = style === 'hash'
    ? `# kit:managed source=${sourceRel} hash=${hash}\n`
    : `<!-- kit:managed source=${sourceRel} hash=${hash} -->\n`;

  if (style === 'html') {
    const frontmatterEnd = findFrontmatterEnd(normalized);
    if (frontmatterEnd > 0) {
      return normalized.slice(0, frontmatterEnd) + marker + normalized.slice(frontmatterEnd);
    }
  }

  return marker + normalized;
}

function isManagedContentClean(content) {
  const parsed = parseManagedContent(content);
  if (!parsed) return false;
  return hashContent(normalizeManagedBody(parsed.body)) === parsed.hash;
}

function recordDirectUseOutput(state, record) {
  if (!state || !state.manifest) return;
  state.manifest.push(record);
}

function recordManagedConflict(projectRoot, destPath, sourceRel, state, reason, options = {}) {
  const relDest = relativeToProject(projectRoot, destPath);
  const conflict = {
    path: relDest,
    source: sourceRel,
    reason,
    recommendedAction: 'preserve user file and review manually',
  };
  if (options.sourceHash) conflict.sourceHash = options.sourceHash;
  state.conflicts.push(conflict);
  recordDirectUseOutput(state, {
    path: relDest,
    kind: options.kind || 'direct-use',
    source: sourceRel,
    sourceHash: options.sourceHash || null,
    outputHash: fs.existsSync(destPath) ? hashFile(destPath) : null,
    status: 'conflict',
    reason,
  });
}

function writeManagedTextFile(projectRoot, destPath, sourceRel, body, state, style = 'html', options = {}) {
  const relDest = relativeToProject(projectRoot, destPath);
  const outputHash = sourceTextHash(body);
  const sourceHash = options.sourceHash || outputHash;
  const kind = options.kind || 'direct-use';

  if (fs.existsSync(destPath)) {
    const existing = fs.readFileSync(destPath, 'utf8');
    const parsed = parseManagedContent(existing);
    if (!parsed) {
      recordManagedConflict(projectRoot, destPath, sourceRel, state, 'managed marker missing', { kind, sourceHash });
      return false;
    }
    if (!isManagedContentClean(existing)) {
      recordManagedConflict(projectRoot, destPath, sourceRel, state, 'managed output was edited after generation', { kind, sourceHash });
      return false;
    }
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, renderManagedContent(sourceRel, body, style));
  state.generated.push(relDest);
  recordDirectUseOutput(state, {
    path: relDest,
    kind,
    source: sourceRel,
    sourceHash,
    outputHash,
    status: 'generated',
  });
  return true;
}

function canUseManagedTextMarker(filePath) {
  return ['.md', '.mdx'].includes(path.extname(filePath).toLowerCase());
}

function copyManagedExactFile(projectRoot, sourcePath, destPath, sourceRel, state, kind) {
  const relDest = relativeToProject(projectRoot, destPath);
  const sourceHash = hashFile(sourcePath);

  if (fs.existsSync(destPath)) {
    const outputHash = hashFile(destPath);
    if (outputHash !== sourceHash) {
      recordManagedConflict(projectRoot, destPath, sourceRel, state, 'managed support file differs from source', {
        kind,
        sourceHash,
      });
      return false;
    }

    state.preserved.push(relDest);
    recordDirectUseOutput(state, {
      path: relDest,
      kind,
      source: sourceRel,
      sourceHash,
      outputHash,
      status: 'preserved',
    });
    return false;
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(sourcePath, destPath);
  state.generated.push(relDest);
  recordDirectUseOutput(state, {
    path: relDest,
    kind,
    source: sourceRel,
    sourceHash,
    outputHash: sourceHash,
    status: 'generated',
  });
  return true;
}

function copyManagedSkillSupportFiles(src, dest, projectRoot, state) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcEntry = path.join(src, entry.name);
    const destEntry = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyManagedSkillSupportFiles(srcEntry, destEntry, projectRoot, state);
      continue;
    }

    if (entry.name === 'SKILL.md') continue;

    const sourceRel = relativeToRoot(srcEntry);
    if (canUseManagedTextMarker(srcEntry)) {
      const body = fs.readFileSync(srcEntry, 'utf8');
      writeManagedTextFile(projectRoot, destEntry, sourceRel, body, state, 'html', {
        kind: 'skill-support',
        sourceHash: sourceTextHash(body),
      });
    } else {
      copyManagedExactFile(projectRoot, srcEntry, destEntry, sourceRel, state, 'skill-support');
    }
  }
}

function stripCodexGeneratedHeaderComments(source) {
  return source
    .replace(/^(?:<!-- kit-convert generated:.*?-->\r?\n)+/, '')
    .replace(/^(?:<!-- REVIEW NEEDED:.*?-->\r?\n)+/, '')
    .trimStart();
}

function buildCodexSkillOutput(sourcePath) {
  return normalizeManagedBody(stripCodexGeneratedHeaderComments(fs.readFileSync(sourcePath, 'utf8')).trimEnd());
}

function copyCodexSkillDirectory(sourceDir, destDir) {
  copyDirRecursive(sourceDir, destDir);
  const sourceSkill = path.join(sourceDir, 'SKILL.md');
  const destSkill = path.join(destDir, 'SKILL.md');
  if (fs.existsSync(sourceSkill)) {
    fs.writeFileSync(destSkill, buildCodexSkillOutput(sourceSkill));
  }
}

function listCodexComponentEntries(domain, category) {
  const entries = new Map();
  addComponentEntries(entries, path.join(SRC_CODEX, domain, category), category, SRC_CODEX, domain);
  return [...entries.values()].sort((a, b) => a.identity.localeCompare(b.identity));
}

function addComponentEntries(merged, sourceDir, category, root, domain) {
  if (!fs.existsSync(sourceDir)) return;

  if (category === 'skills') {
    for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillMd = path.join(sourceDir, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillMd)) continue;
      merged.set(entry.name, {
        domain,
        category,
        identity: entry.name,
        sourceRoot: root,
        sourceDir: path.join(sourceDir, entry.name),
        sourcePath: skillMd,
        sourceRel: relativeToRoot(skillMd),
      });
    }
    return;
  }

  for (const file of fs.readdirSync(sourceDir)) {
    if (!file.endsWith('.md')) continue;
    const identity = path.basename(file, '.md');
    const sourcePath = path.join(sourceDir, file);
    merged.set(identity, {
      domain,
      category,
      identity,
      sourceRoot: root,
      sourceDir,
      sourcePath,
      sourceRel: relativeToRoot(sourcePath),
    });
  }
}

function collectCodexDirectUseSources(activeDomains) {
  const skills = [];
  const agents = [];

  for (const domain of activeDomains) {
    skills.push(...listCodexComponentEntries(domain, 'skills'));
    agents.push(...listCodexComponentEntries(domain, 'agents'));
  }

  return { skills, agents };
}

function previewCodexDirectUse(projectRoot, activeDomains) {
  const { skills, agents } = collectCodexDirectUseSources(activeDomains);
  const conflicts = [];

  for (const skill of skills) {
    const dest = path.join(projectRoot, '.agents', 'skills', skill.identity, 'SKILL.md');
    collectManagedPreviewConflict(projectRoot, dest, skill.sourceRel, conflicts);
    collectManagedSkillSupportPreviewConflicts(projectRoot, skill.sourceDir, path.join(projectRoot, '.agents', 'skills', skill.identity), conflicts);
  }

  for (const agent of agents) {
    const dest = path.join(projectRoot, '.codex', 'agents', `${agent.identity}.toml`);
    collectManagedPreviewConflict(projectRoot, dest, agent.sourceRel, conflicts);
  }

  return {
    skills: skills.length,
    agents: agents.length,
    conflicts,
  };
}

function collectManagedPreviewConflict(projectRoot, destPath, sourceRel, conflicts) {
  if (!fs.existsSync(destPath)) return;
  const existing = fs.readFileSync(destPath, 'utf8');
  const parsed = parseManagedContent(existing);
  if (!parsed) {
    conflicts.push({
      path: relativeToProject(projectRoot, destPath),
      source: sourceRel,
      reason: 'managed marker missing',
    });
    return;
  }
  if (!isManagedContentClean(existing)) {
    conflicts.push({
      path: relativeToProject(projectRoot, destPath),
      source: sourceRel,
      reason: 'managed output was edited after generation',
    });
  }
}

function collectManagedSkillSupportPreviewConflicts(projectRoot, src, dest, conflicts) {
  if (!fs.existsSync(src)) return;

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcEntry = path.join(src, entry.name);
    const destEntry = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      collectManagedSkillSupportPreviewConflicts(projectRoot, srcEntry, destEntry, conflicts);
      continue;
    }

    if (entry.name === 'SKILL.md') continue;
    if (!fs.existsSync(destEntry)) continue;

    const sourceRel = relativeToRoot(srcEntry);
    if (canUseManagedTextMarker(srcEntry)) {
      collectManagedPreviewConflict(projectRoot, destEntry, sourceRel, conflicts);
      continue;
    }

    if (hashFile(destEntry) !== hashFile(srcEntry)) {
      conflicts.push({
        path: relativeToProject(projectRoot, destEntry),
        source: sourceRel,
        reason: 'managed support file differs from source',
      });
    }
  }
}

function countFiles(dir, type) {
  if (type === 'skills') {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .length;
  }

  if (type === 'hooks') {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.js'))
      .length;
  }

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .length;
}

function collectDomainComponents(activeDomains, categories) {
  const byDomain = {};

  for (const domain of activeDomains) {
    byDomain[domain] = {};
    const srcDomainDir = path.join(SRC_CLAUDE, domain);

    if (!fs.existsSync(srcDomainDir)) {
      for (const cat of categories) {
        byDomain[domain][cat] = 0;
      }
      continue;
    }

    for (const category of categories) {
      const srcPath = path.join(srcDomainDir, category);
      if (!fs.existsSync(srcPath)) {
        byDomain[domain][category] = 0;
        continue;
      }
      byDomain[domain][category] = countFiles(srcPath, category);
    }
  }

  return byDomain;
}

// ═══════════════════════════════════════════
// Claude Emitter
// ═══════════════════════════════════════════

function createClaudeDirectories(projectRoot) {
  const claudeDir = path.join(projectRoot, '.claude');
  for (const dir of COMPONENT_DIRS) {
    fs.mkdirSync(path.join(claudeDir, dir), { recursive: true });
  }
}

function emitClaude(projectRoot, activeDomains) {
  const byDomain = {};

  for (const domain of activeDomains) {
    byDomain[domain] = {};
    const srcDomainDir = path.join(SRC_CLAUDE, domain);

    if (!fs.existsSync(srcDomainDir)) {
      for (const cat of COMPONENT_DIRS) {
        byDomain[domain][cat] = 0;
      }
      continue;
    }

    for (const category of COMPONENT_DIRS) {
      const srcPath = path.join(srcDomainDir, category);
      if (!fs.existsSync(srcPath)) {
        byDomain[domain][category] = 0;
        continue;
      }

      const destPath = path.join(projectRoot, '.claude', category);
      copyDirRecursive(srcPath, destPath);
      byDomain[domain][category] = countFiles(srcPath, category);
    }
  }

  const counts = {};
  for (const cat of COMPONENT_DIRS) {
    counts[cat] = Object.values(byDomain).reduce(
      (sum, domainCounts) => sum + (domainCounts[cat] || 0),
      0
    );
  }

  return { counts, byDomain };
}

function processClaudeTemplates(projectRoot, mode, activeDomains, activeTargets) {
  const templateDir = TEMPLATES;
  if (!fs.existsSync(templateDir)) return;

  const vars = resolveVariables(projectRoot);

  // CLAUDE.md — managed 섹션은 fresh/update 모두 재생성, 사용자 편집 영역은 보존
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
  const managedBody = renderClaudeManagedSection({ activeDomains, activeTargets, vars });

  if (!fs.existsSync(claudeMdPath)) {
    const template = readTemplate(templateDir, 'CLAUDE.md.template');
    if (template) {
      const rendered = substituteVars(template, { ...vars, KIT_MANAGED_SECTION: managedBody });
      fs.writeFileSync(claudeMdPath, rendered);
    }
  } else {
    const existing = fs.readFileSync(claudeMdPath, 'utf8');
    const next = mergeClaudeMd(existing, managedBody);
    if (next !== existing) {
      fs.writeFileSync(claudeMdPath, next);
    }
  }

  // profile.json — 신규 설치 시에만 생성
  const profilePath = path.join(projectRoot, 'profile.json');
  if (mode === 'fresh' && !fs.existsSync(profilePath)) {
    const template = readTemplate(templateDir, 'profile.json.template');
    if (template) {
      fs.writeFileSync(profilePath, substituteVars(template, vars));
    }
  }

  // settings.json — 동적 생성 + 병합
  const settingsPath = path.join(projectRoot, '.claude', 'settings.json');
  const templateSettings = buildSettingsTemplate(activeDomains);

  let existingSettings = null;
  if (fs.existsSync(settingsPath)) {
    try {
      existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch {
      existingSettings = null;
    }
  }

  const merged = mergeSettings(templateSettings, existingSettings);
  fs.writeFileSync(settingsPath, JSON.stringify(merged, null, 2) + '\n');
}

function buildSettingsTemplate(activeDomains) {
  const settings = {
    permissions: {
      allow: [
        'Read',
        'Edit',
        'Write',
        'Glob',
        'Grep',
        'Bash'
      ],
      deny: [
        'WebFetch',
        'WebFetch(*)',
        'Bash(git push --force:*)',
        'Bash(git push -f :*)',
        'Bash(git push origin --force:*)',
        'Bash(git push origin -f :*)',
        'Bash(git push --force*main)*',
        'Bash(git push -f*main)*',
        'Bash(git push --force*master)*',
        'Bash(git push -f*master)*',
        'Bash(git push --force-with-lease*main)*',
        'Bash(git push --force-with-lease*master)*',
        'Bash(git push origin +main)*',
        'Bash(git push origin +master)*',
        'Bash(git reset --hard:*)',
        'Bash(git reset --hard origin/*)*',
        'Bash(git checkout .:*)',
        'Bash(git checkout -- .:*)',
        'Bash(git checkout -- .)*',
        'Bash(git restore .:*)',
        'Bash(git restore .)*',
        'Bash(git clean -f:*)',
        'Bash(git clean -fd:*)',
        'Bash(git clean -fx:*)',
        'Bash(git clean -f*)*',
        'Bash(git branch -D:*)',
        'Bash(git stash drop:*)',
        'Bash(git stash clear:*)',
        'Bash(git rebase:*)',
        'Bash(rm -rf:*)',
        'Bash(rm -r :*)',
        'Bash(rm -rf /)*',
        'Bash(rm -rf ~)*',
        'Bash(rm -rf .)*',
        'Bash(rm -r .)*',
        'Bash(rm -r ./)*',
        'Bash(rm -rf *)*',
        'Bash(rmdir /s:*)',
        'Bash(del /s:*)',
        'Bash(*DROP TABLE:*)',
        'Bash(*DROP DATABASE:*)',
        'Bash(*TRUNCATE:*)',
        'Bash(*DELETE FROM:*)',
        'Bash(sudo:*)',
        'Bash(chmod 777:*)',
        'Bash(>/dev/*)',
        'Bash(source /dev/*)*',
        'Bash(curl*|*sh)*',
        'Bash(wget*|*sh)*',
        'Bash(*>~/.ssh/*)',
        'Bash(*>~/.zshrc)*',
        'Bash(*>~/.bashrc)*',
        'Bash(*>~/.profile)*',
        'Bash(*>~/.zprofile)*',
        'Bash(npm publish)*',
        'Bash(pnpm publish)*',
        'Bash(yarn publish)*',
        'Bash(docker system prune)*',
        'Bash(mkfs*)*',
        'Bash(dd if=*)*',
        'Bash(eval *)*',
        'Bash(bash -c *)*',
        'Bash(/bin/bash -c *)*',
        'Bash(sh -c *)*',
        'Bash(/bin/sh -c *)*',
        'Bash(osascript*)*',
        'Bash(/usr/bin/osascript*)*',
        'Bash(crontab*)*',
        'Bash(launchctl*)*',
        'Bash(python3 -c *import os*)*',
        'Bash(python3 -c *import subprocess*)*',
        'Bash(python3 -c *import importlib*)*',
        'Bash(python3 -c *__import__*)*',
        'Bash(node -e *)*',
        'Bash(/usr/local/bin/node -e *)*',
        'Bash(perl -e *)*',
        'Bash(/usr/bin/perl -e *)*',
        'Bash(xargs *)*',
        'Bash(open http*)*'
      ]
    },
    hooks: buildHooksConfig(activeDomains),
    env: {
      ENABLE_TOOL_SEARCH: 'auto:5',
      CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: '1'
    }
  };

  return settings;
}

function buildHooksConfig(activeDomains) {
  const hooks = {
    PreToolUse: [
      // T-RACE-02 (Phase A 피드백 Step 4A): 에이전트 완료 후 메인 Edit 시
      // "File has not been read yet" 에러 방지용 경고 훅 (non-blocking)
      { matcher: 'Edit|Write|NotebookEdit', hooks: ['node .claude/hooks/pre-tool-use-edit-reread.js'] }
    ],
    PostToolUse: [
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/edit-tracker.js'] },
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/code-quality-reminder.js'] },
      { matcher: '*', hooks: ['node .claude/hooks/output-secret-filter.js'] },
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/security-auto-trigger.js'] }
    ],
    Stop: [
      { hooks: ['node .claude/hooks/session-wrap-suggest.js'] },
      // kit-feedback-archiving Phase 3.2.1 (core): 23 커맨드 화이트리스트 matcher + 피드백 엔트리 수집 훅.
      {
        matcher: '^/(plan-(idea|screen|draft|prd|review|wireframe|stitch|bridge|archive)|copy-(reference-refresh|visual-review|interaction-review|gap-board|plan-unit|verify|closeout)|dev-(architecture|feature|verify|verify-all|verify-fe|commit|commit-push-pr))($|\\s)',
        hooks: ['node .claude/hooks/feedback-collector.js']
      }
    ],
    SubagentStop: [
      { hooks: ['node .claude/hooks/agent-completion-cache-invalidate.js'] },
      // kit-feedback-archiving Phase 3.2.5 (core): 9 추적 에이전트 SubagentStop 누적 → agents_chain 통합
      {
        matcher: '(plan-draft-writer|plan-bridge-writer|dev-architect|dev-doc-updater|plan-wireframe-designer|plan-idea-screener|plan-prd-writer|plan-reviewer|copy-reference-baseline)',
        hooks: ['node .claude/hooks/feedback-subagent-collector.js']
      }
    ]
  };

  if (activeDomains.includes('dev')) {
    hooks.PreToolUse.push(
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/dev-feature-scope-guard.js'] },
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/dev-tdd-guard.js'] },
      { matcher: 'Bash', hooks: ['node .claude/hooks/dev-db-guard.js'] }
    );
  }

  if (activeDomains.includes('plan')) {
    hooks.PreToolUse.push(
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/plan-doc-guard.js'] },
      // IMP-KIT-009: IDEA 폴더 이동 화이트리스트 가드 (Bash matcher)
      { matcher: 'Bash', hooks: ['node .claude/hooks/plan-idea-move-guard.js'] }
    );
    // T-FSTATE-01 (Phase A 피드백 Step 4B): IDEA frontmatter `상태:` 변경 감지 →
    // backlog / Epic Children §1 / binding §7 자동 동기 (비활성화: CLAUDE_DISABLE_PLAN_STATE_SYNC=1)
    hooks.PostToolUse.push(
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/plan-state-sync.js'] }
    );
    // IMP-KIT-007: /plan-review 자동 후속 트리거 (Stop 훅)
    hooks.Stop.push(
      { hooks: ['node .claude/hooks/plan-review-trigger.js'] }
    );
  }

  if (activeDomains.includes('copy')) {
    hooks.PreToolUse.push(
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/copy-scope-guard.js'] }
    );
    hooks.PostToolUse.push(
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/copy-evidence-reminder.js'] },
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/copy-doc-drift-check.js'] },
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/copy-variant-env-guard.js'] }
    );
    hooks.Stop.push(
      { hooks: ['node .claude/hooks/copy-gate-stop.js'] }
    );
  }

  return hooks;
}

function processQuickStartTemplate(projectRoot, activeDomains, activeTargets) {
  const quickStartPath = path.join(projectRoot, 'CLAUDE-KIT-QUICKSTART.md');
  const content = renderQuickStart({
    variant: 'install',
    activeDomains,
    activeTargets,
    version: resolveVersion()
  });
  fs.writeFileSync(quickStartPath, content);
}

// ═══════════════════════════════════════════
// Codex Emitter
// ═══════════════════════════════════════════

function emitCodex(projectRoot, activeDomains) {
  const pluginRoot = path.join(projectRoot, 'plugins', 'claude-kit');
  const templateDir = TEMPLATES;
  const vars = resolveVariables(projectRoot);
  const directUseState = { generated: [], preserved: [], conflicts: [], manifest: [] };
  // Direct Codex surfaces are emitted only from src/codex. Claude fallback is
  // not enabled until an explicit exception/approval path exists.
  const byDomain = {};

  // 1. 디렉토리 생성
  for (const dir of CODEX_COMPONENT_DIRS) {
    const generatedDir = path.join(pluginRoot, dir);
    fs.rmSync(generatedDir, { recursive: true, force: true });
    fs.mkdirSync(generatedDir, { recursive: true });
  }
  fs.mkdirSync(path.join(pluginRoot, '.codex-plugin'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, '.agents', 'skills'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, '.codex', 'agents'), { recursive: true });

  // 2. 자산 복사 (skills, commands, agents만 — hooks, rules 제외)
  for (const domain of activeDomains) {
    byDomain[domain] = {};
    byDomain[domain].hooks = 0;

    for (const category of CODEX_COMPONENT_DIRS) {
      const entries = listCodexComponentEntries(domain, category);
      if (entries.length === 0) {
        byDomain[domain][category] = 0;
        continue;
      }

      const destPath = path.join(pluginRoot, category);
      for (const entry of entries) {
        if (category === 'skills') {
          copyCodexSkillDirectory(entry.sourceDir, path.join(destPath, entry.identity));
        } else {
          fs.mkdirSync(destPath, { recursive: true });
          fs.copyFileSync(entry.sourcePath, path.join(destPath, path.basename(entry.sourcePath)));
        }
      }
      byDomain[domain][category] = entries.length;
    }
  }

  emitCodexDirectUse(projectRoot, activeDomains, directUseState);

  // 3. hooks.json 생성 + 호환 hook JS 파일 복사
  // T18 (codex-sync Phase 4): paired-direct hook은 src/codex/ 우선 소스로 사용
  // 그 외에는 src/claude/ fallback. 자세한 내용: docs/meta-tooling/08-phase4-codex-implementation.md T18
  const { getPortability } = require('./codex-hook-compat');
  const allHookFiles = collectHookFiles(activeDomains);
  const { compatible, skipped } = filterCodexHooks(allHookFiles);

  // 호환 hook JS 파일을 plugins/claude-kit/hooks/에 복사
  fs.mkdirSync(path.join(pluginRoot, 'hooks'), { recursive: true });
  for (const hookFile of compatible) {
    const meta = getPortability(hookFile);
    const preferCodex = meta && meta.strategy === 'paired-direct';
    const sourceRoots = preferCodex ? [SRC_CODEX, SRC_CLAUDE] : [SRC_CLAUDE];

    let copied = false;
    for (const sourceRoot of sourceRoots) {
      if (copied) break;
      for (const domain of activeDomains) {
        const srcHook = path.join(sourceRoot, domain, 'hooks', hookFile);
        if (fs.existsSync(srcHook)) {
          fs.copyFileSync(srcHook, path.join(pluginRoot, 'hooks', hookFile));
          copied = true;
          break;
        }
      }
    }
  }

  const compatibleSet = new Set(compatible);
  for (const domain of activeDomains) {
    const hooksDir = path.join(SRC_CLAUDE, domain, 'hooks');
    if (!fs.existsSync(hooksDir)) {
      byDomain[domain].hooks = 0;
      continue;
    }

    byDomain[domain].hooks = fs.readdirSync(hooksDir)
      .filter(f => f.endsWith('.js') && compatibleSet.has(f))
      .length;
  }

  const hooksJson = buildCodexHooksJson(compatible, activeDomains);
  fs.writeFileSync(
    path.join(pluginRoot, 'hooks.json'),
    JSON.stringify(hooksJson, null, 2) + '\n'
  );

  // 4. plugin.json manifest 생성
  const pluginTemplate = readTemplate(templateDir, 'plugin.json.template');
  if (pluginTemplate) {
    fs.writeFileSync(
      path.join(pluginRoot, '.codex-plugin', 'plugin.json'),
      substituteVars(pluginTemplate, vars)
    );
  }

  // 5. marketplace.json 생성/병합
  const marketplaceTemplate = readTemplate(templateDir, 'marketplace-entry.json.template');
  if (marketplaceTemplate) {
    mergeMarketplace(projectRoot, substituteVars(marketplaceTemplate, vars));
  }

  // 6. AGENTS.md — managed 섹션은 fresh/update 모두 재생성, 사용자 편집 영역은 보존 (T-TMPL-02)
  const agentsMdPath = path.join(projectRoot, 'AGENTS.md');
  let agentsMdStatus = 'preserved';
  const agentsTemplate = readTemplate(templateDir, 'AGENTS.md.template');
  if (agentsTemplate) {
    const agentsManagedBody = renderAgentsManagedSection({
      activeDomains: activeDomains || [],
      activeTargets: ['codex'],
      vars
    });

    if (!fs.existsSync(agentsMdPath)) {
      const wrapper = substituteVars(agentsTemplate, { ...vars, KIT_MANAGED_SECTION: agentsManagedBody });
      warnAgentsMdRuntimeIssues(collectAgentsMdRuntimeWarnings(wrapper), agentsMdPath);
      fs.writeFileSync(agentsMdPath, wrapper);
      agentsMdStatus = 'created';
    } else {
      const existing = fs.readFileSync(agentsMdPath, 'utf8');
      const next = mergeAgentsMd(existing, agentsManagedBody);
      if (next !== existing) {
        warnAgentsMdRuntimeIssues(collectAgentsMdRuntimeWarnings(next), agentsMdPath);
        fs.writeFileSync(agentsMdPath, next);
        agentsMdStatus = 'updated';
      }
    }
  } else {
    agentsMdStatus = 'missing template';
  }

  // 합계 계산
  const counts = {};
  for (const cat of CODEX_COMPONENT_DIRS) {
    counts[cat] = Object.values(byDomain).reduce(
      (sum, domainCounts) => sum + (domainCounts[cat] || 0),
      0
    );
  }
  counts.hooks = compatible.length;

  return { counts, byDomain, skipped, agentsMdStatus, directUse: directUseState };
}

function emitCodexDirectUse(projectRoot, activeDomains, state) {
  const { skills, agents } = collectCodexDirectUseSources(activeDomains);

  for (const skill of skills) {
    const destDir = path.join(projectRoot, '.agents', 'skills', skill.identity);
    const destSkill = path.join(destDir, 'SKILL.md');
    const body = buildCodexSkillOutput(skill.sourcePath);
    const wrote = writeManagedTextFile(projectRoot, destSkill, skill.sourceRel, body, state, 'html', {
      kind: 'skill',
      sourceHash: hashFile(skill.sourcePath),
    });
    if (wrote) {
      copyManagedSkillSupportFiles(skill.sourceDir, destDir, projectRoot, state);
    }
  }

  for (const agent of agents) {
    const destAgent = path.join(projectRoot, '.codex', 'agents', `${agent.identity}.toml`);
    const sourceHash = hashFile(agent.sourcePath);
    const body = buildCodexAgentToml(agent.sourcePath, agent.identity);
    writeManagedTextFile(projectRoot, destAgent, agent.sourceRel, body, state, 'hash', {
      kind: 'agent',
      sourceHash,
    });
  }
}

function buildCodexAgentToml(sourcePath, identity) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const cleaned = stripCodexGeneratedHeaderComments(source).trim();
  const name = identity.replace(/-/g, '_');
  const description = extractAgentDescription(cleaned, identity);
  const instructions = extractAgentInstructions(cleaned);
  const lines = [
    `name = ${tomlString(name)}`,
    `description = ${tomlString(description)}`,
  ];

  if (isReadOnlyAgent(cleaned)) {
    lines.push('sandbox_mode = "read-only"');
  }

  lines.push(`developer_instructions = ${tomlMultilineString(instructions)}`);
  return `${lines.join('\n')}\n`;
}

function extractAgentDescription(markdown, identity) {
  const afterHeading = markdown.replace(new RegExp(`^#\\s+${escapeRegExp(identity)}\\s*\\r?\\n?`), '').trim();
  const sectionIndex = afterHeading.search(/\r?\n##\s+/);
  const lead = sectionIndex >= 0 ? afterHeading.slice(0, sectionIndex).trim() : afterHeading;
  const firstParagraph = lead.split(/\r?\n\s*\r?\n/).map(s => s.trim()).find(Boolean);
  return firstParagraph || `${identity} custom agent.`;
}

function extractAgentInstructions(markdown) {
  return markdown
    .replace(/^#\s+.+\r?\n?/, '')
    .trim() || markdown.trim();
}

function isReadOnlyAgent(markdown) {
  return /읽기 전용|read-only|Write\s+또는\s+Edit\s+도구를\s+절대\s+사용하지\s+않음/i.test(markdown);
}

function tomlString(value) {
  return JSON.stringify(String(value));
}

function tomlMultilineString(value) {
  return `"""\n${String(value).replace(/"""/g, '\\"\\"\\"')}\n"""`;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collectHookFiles(activeDomains) {
  const hookFiles = [];

  for (const domain of activeDomains) {
    const hooksDir = path.join(SRC_CLAUDE, domain, 'hooks');
    if (!fs.existsSync(hooksDir)) continue;

    const files = fs.readdirSync(hooksDir).filter(f => f.endsWith('.js'));
    hookFiles.push(...files);
  }

  return hookFiles;
}

function buildCodexHooksJson(compatibleHooks, activeDomains) {
  const hooks = { hooks: {} };

  // 이벤트별 분류
  const preToolUse = [];
  const postToolUse = [];

  for (const hookFile of compatibleHooks) {
    // PreToolUse 훅 (blocking guards)
    if (['dev-feature-scope-guard.js', 'dev-tdd-guard.js', 'dev-db-guard.js', 'plan-doc-guard.js', 'copy-scope-guard.js'].includes(hookFile)) {
      if (hookFile === 'dev-db-guard.js') {
        preToolUse.push({ matcher: 'Bash', hookFile });
      } else {
        preToolUse.push({ matcher: 'Edit|Write', hookFile });
      }
    } else {
      // PostToolUse 훅
      if (['edit-tracker.js', 'code-quality-reminder.js', 'security-auto-trigger.js', 'copy-evidence-reminder.js', 'copy-doc-drift-check.js', 'copy-variant-env-guard.js', 'plan-state-sync.js'].includes(hookFile)) {
        postToolUse.push({ matcher: 'Edit|Write', hookFile });
      }
    }
  }

  if (preToolUse.length > 0) {
    hooks.hooks.PreToolUse = preToolUse.map(h => ({
      matcher: h.matcher,
      hooks: [{ type: 'command', command: `./hooks/${h.hookFile}` }]
    }));
  }

  if (postToolUse.length > 0) {
    hooks.hooks.PostToolUse = postToolUse.map(h => ({
      matcher: h.matcher,
      hooks: [{ type: 'command', command: `./hooks/${h.hookFile}` }]
    }));
  }

  return hooks;
}

function mergeMarketplace(projectRoot, entryJson) {
  const marketplaceDir = path.join(projectRoot, '.agents', 'plugins');
  fs.mkdirSync(marketplaceDir, { recursive: true });

  const marketplacePath = path.join(marketplaceDir, 'marketplace.json');
  let marketplace = { plugins: [] };

  if (fs.existsSync(marketplacePath)) {
    try {
      marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
      if (!Array.isArray(marketplace.plugins)) {
        marketplace.plugins = [];
      }
    } catch {
      marketplace = { plugins: [] };
    }
  }

  const newEntry = JSON.parse(entryJson);

  // 중복 체크
  const existingIndex = marketplace.plugins.findIndex(p => p.name === newEntry.name);
  if (existingIndex >= 0) {
    // 기존 엔트리 업데이트
    marketplace.plugins[existingIndex] = { ...marketplace.plugins[existingIndex], ...newEntry };
  } else {
    marketplace.plugins.push(newEntry);
  }

  fs.writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + '\n');
}

// ═══════════════════════════════════════════
// 메타데이터 + 결과 출력
// ═══════════════════════════════════════════

function writeMetadata(projectRoot, mode, allCounts, allByDomain, activeDomains, activeTargets, codexSkipped, initialFiles, outputStatuses) {
  const metaPath = path.join(projectRoot, '.claude-kit-meta.json');

  let meta = {};
  if (mode === 'update' && fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch {
      meta = {};
    }
  }

  const version = resolveVersion();
  const now = new Date().toISOString();

  // Claude 카운트 (기존 호환)
  const claudeCounts = allCounts.claude || {};
  const total = Object.values(claudeCounts).reduce((a, b) => a + b, 0);

  // byDomain 정리
  const cleanByDomain = {};
  const primaryByDomain = allByDomain.claude || allByDomain.codex || {};
  for (const [domain, domainCounts] of Object.entries(primaryByDomain)) {
    const filtered = {};
    for (const [cat, count] of Object.entries(domainCounts)) {
      if (count > 0) {
        filtered[cat] = count;
      }
    }
    if (Object.keys(filtered).length > 0) {
      cleanByDomain[domain] = filtered;
    }
  }

  const preservedFiles = resolvePreservedFiles(projectRoot, activeTargets, initialFiles, outputStatuses);

  const updated = {
    version,
    installedAt: meta.installedAt || now,
    updatedAt: now,
    domains: activeDomains,
    targets: activeTargets,
    components: {
      agents: claudeCounts.agents || (allCounts.codex || {}).agents || 0,
      commands: claudeCounts.commands || (allCounts.codex || {}).commands || 0,
      skills: claudeCounts.skills || (allCounts.codex || {}).skills || 0,
      hooks: claudeCounts.hooks || (allCounts.codex || {}).hooks || 0,
      rules: claudeCounts.rules || 0
    },
    byDomain: cleanByDomain,
    totalComponents: total || Object.values(allCounts.codex || {}).reduce((a, b) => a + b, 0),
    preservedFiles
  };

  updated.outputs = updated.outputs || {};
  updated.outputs.shared = {
    root: '.',
    generated: ['CLAUDE-KIT-QUICKSTART.md']
  };

  // Codex 출력 정보
  if (activeTargets.includes('codex')) {
    const directUse = outputStatuses.codex && outputStatuses.codex.directUse
      ? outputStatuses.codex.directUse
      : { generated: [], preserved: [], conflicts: [], manifest: [] };
    updated.outputs.codex = {
      root: 'plugins/claude-kit',
      generated: [
        'AGENTS.md',
        '.agents/skills/**',
        '.codex/agents/*.toml',
        'plugins/claude-kit/.codex-plugin/plugin.json',
        '.agents/plugins/marketplace.json',
        'plugins/claude-kit/hooks.json'
      ],
      directUseGenerated: directUse.generated,
      directUsePreserved: directUse.preserved,
      directUseConflicts: directUse.conflicts,
      directUseManifest: directUse.manifest || []
    };
  }

  if (activeTargets.includes('claude')) {
    updated.outputs.claude = {
      root: '.claude',
      generated: ['CLAUDE.md', '.claude/settings.json']
    };
  }

  // Codex skip 기록
  if (codexSkipped.length > 0) {
    updated.skippedForCodex = codexSkipped;
  }

  fs.writeFileSync(metaPath, JSON.stringify(updated, null, 2) + '\n');
}

function resolvePreservedFiles(projectRoot, activeTargets, initialFiles, outputStatuses) {
  const preservedFiles = [];

  if (initialFiles.profileJson && fs.existsSync(path.join(projectRoot, 'profile.json'))) {
    preservedFiles.push('profile.json');
  }

  if (
    activeTargets.includes('claude') &&
    initialFiles.claudeMd &&
    fs.existsSync(path.join(projectRoot, 'CLAUDE.md'))
  ) {
    preservedFiles.push('CLAUDE.md');
  }

  if (
    activeTargets.includes('codex') &&
    initialFiles.agentsMd &&
    outputStatuses.codex &&
    outputStatuses.codex.agentsMdStatus === 'preserved' &&
    fs.existsSync(path.join(projectRoot, 'AGENTS.md'))
  ) {
    preservedFiles.push('AGENTS.md');
  }

  return preservedFiles;
}

function printResult(mode, allCounts, activeDomains, activeTargets, outputStatuses = {}) {
  const version = resolveVersion();
  const verb = mode === 'fresh' ? '설치 완료' : '업데이트 완료';

  for (const target of activeTargets) {
    const counts = allCounts[target] || {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const targetLabel = target === 'claude' ? 'Claude (.claude/)' : 'Codex (plugins/claude-kit + direct-use)';

    console.log(`\nclaude-kit v${version} ${verb} [${targetLabel}]`);
    console.log(`  ${counts.agents || 0} agents, ${counts.commands || 0} commands, ${counts.skills || 0} skills, ${counts.hooks || 0} hooks, ${counts.rules || 0} rules`);
    console.log(`  총 ${total}개 컴포넌트 (domains: ${activeDomains.join(',')})`);

    if (target === 'codex' && outputStatuses.codex) {
      console.log(`  AGENTS.md: ${outputStatuses.codex.agentsMdStatus}`);
      const directUse = outputStatuses.codex.directUse || { generated: [], conflicts: [] };
      console.log(`  direct-use generated: ${directUse.generated.length}, conflicts: ${directUse.conflicts.length}`);
    }
  }

  console.log('  Quick Start: CLAUDE-KIT-QUICKSTART.md');
  console.log(`  모드: ${mode === 'fresh' ? '신규 설치' : '업데이트'}\n`);
}

main();
