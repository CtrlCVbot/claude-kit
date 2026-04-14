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
const { mergeSettings } = require('./merge-settings');
const { filterCodexHooks } = require('./codex-hook-compat');
const { renderQuickStart } = require('./quickstart-renderer');

const SRC_BASE   = path.resolve(__dirname, '..', 'src');
const SRC_CLAUDE = path.join(SRC_BASE, 'claude');
const SRC_CODEX  = path.join(SRC_BASE, 'codex');
const TEMPLATES  = path.join(SRC_BASE, 'templates');

const COMPONENT_DIRS = ['agents', 'commands', 'skills', 'hooks', 'rules'];
const CODEX_COMPONENT_DIRS = ['agents', 'commands', 'skills'];

function main() {
  try {
    const projectRoot = detectProjectRoot();
    const mode = detectMode(projectRoot);
    const activeDomains = resolveActiveDomains(projectRoot);
    const activeTargets = resolveTargets(projectRoot);

    const allCounts = {};
    const allByDomain = {};
    const codexSkipped = [];

    // --- Claude emitter ---
    if (activeTargets.includes('claude')) {
      createClaudeDirectories(projectRoot);
      const { counts, byDomain } = emitClaude(projectRoot, activeDomains);
      processClaudeTemplates(projectRoot, mode, activeDomains);
      allCounts.claude = counts;
      allByDomain.claude = byDomain;
    }

    // --- Codex emitter ---
    if (activeTargets.includes('codex')) {
      const { counts, byDomain, skipped } = emitCodex(projectRoot, activeDomains, mode);
      allCounts.codex = counts;
      allByDomain.codex = byDomain;
      codexSkipped.push(...skipped);
    }

    processQuickStartTemplate(projectRoot, activeDomains, activeTargets);
    writeMetadata(projectRoot, mode, allCounts, allByDomain, activeDomains, activeTargets, codexSkipped);
    printResult(mode, allCounts, activeDomains, activeTargets);
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
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
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

function processClaudeTemplates(projectRoot, mode, activeDomains) {
  const templateDir = TEMPLATES;
  if (!fs.existsSync(templateDir)) return;

  const vars = resolveVariables(projectRoot);

  // CLAUDE.md — 신규 설치 시에만 생성
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
  if (mode === 'fresh' && !fs.existsSync(claudeMdPath)) {
    const template = readTemplate(templateDir, 'CLAUDE.md.template');
    if (template) {
      fs.writeFileSync(claudeMdPath, substituteVars(template, vars));
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
    PreToolUse: [],
    PostToolUse: [
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/edit-tracker.js'] },
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/code-quality-reminder.js'] },
      { matcher: '*', hooks: ['node .claude/hooks/output-secret-filter.js'] },
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/security-auto-trigger.js'] }
    ],
    Stop: [
      { hooks: ['node .claude/hooks/session-wrap-suggest.js'] }
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
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/plan-doc-guard.js'] }
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

function emitCodex(projectRoot, activeDomains, mode) {
  const pluginRoot = path.join(projectRoot, 'plugins', 'claude-kit');
  const templateDir = TEMPLATES;
  const vars = resolveVariables(projectRoot);

  // 1. 디렉토리 생성
  for (const dir of CODEX_COMPONENT_DIRS) {
    fs.mkdirSync(path.join(pluginRoot, dir), { recursive: true });
  }
  fs.mkdirSync(path.join(pluginRoot, '.codex-plugin'), { recursive: true });

  // 2. 자산 복사 (skills, commands, agents만 — hooks, rules 제외)
  const byDomain = {};
  for (const domain of activeDomains) {
    byDomain[domain] = {};
    byDomain[domain].hooks = 0;
    const srcDomainDir = path.join(SRC_CLAUDE, domain);

    if (!fs.existsSync(srcDomainDir)) {
      for (const cat of CODEX_COMPONENT_DIRS) {
        byDomain[domain][cat] = 0;
      }
      continue;
    }

    for (const category of CODEX_COMPONENT_DIRS) {
      const srcPath = path.join(srcDomainDir, category);
      if (!fs.existsSync(srcPath)) {
        byDomain[domain][category] = 0;
        continue;
      }

      const destPath = path.join(pluginRoot, category);
      copyDirRecursive(srcPath, destPath);
      byDomain[domain][category] = countFiles(srcPath, category);
    }
  }

  // 3. hooks.json 생성 + 호환 hook JS 파일 복사
  const allHookFiles = collectHookFiles(activeDomains);
  const { compatible, skipped } = filterCodexHooks(allHookFiles);

  // 호환 hook JS 파일을 plugins/claude-kit/hooks/에 복사
  fs.mkdirSync(path.join(pluginRoot, 'hooks'), { recursive: true });
  for (const hookFile of compatible) {
    for (const domain of activeDomains) {
      const srcHook = path.join(SRC_CLAUDE, domain, 'hooks', hookFile);
      if (fs.existsSync(srcHook)) {
        fs.copyFileSync(srcHook, path.join(pluginRoot, 'hooks', hookFile));
        break;
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

  // 6. AGENTS.md — 신규 설치 시에만 생성
  const agentsMdPath = path.join(projectRoot, 'AGENTS.md');
  if (mode === 'fresh' && !fs.existsSync(agentsMdPath)) {
    const template = readTemplate(templateDir, 'AGENTS.md.template');
    if (template) {
      fs.writeFileSync(agentsMdPath, substituteVars(template, vars));
    }
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

  return { counts, byDomain, skipped };
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
    if (['dev-feature-scope-guard.js', 'dev-tdd-guard.js', 'dev-db-guard.js', 'plan-doc-guard.js'].includes(hookFile)) {
      if (hookFile === 'dev-db-guard.js') {
        preToolUse.push({ matcher: 'Bash', hookFile });
      } else {
        preToolUse.push({ matcher: 'Edit|Write', hookFile });
      }
    } else {
      // PostToolUse 훅
      if (['edit-tracker.js', 'code-quality-reminder.js', 'security-auto-trigger.js'].includes(hookFile)) {
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

function writeMetadata(projectRoot, mode, allCounts, allByDomain, activeDomains, activeTargets, codexSkipped) {
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

  const preservedFiles = ['profile.json'];
  if (activeTargets.includes('claude')) preservedFiles.push('CLAUDE.md');
  if (activeTargets.includes('codex')) preservedFiles.push('AGENTS.md');

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
    updated.outputs.codex = {
      root: 'plugins/claude-kit',
      generated: [
        'AGENTS.md',
        'plugins/claude-kit/.codex-plugin/plugin.json',
        '.agents/plugins/marketplace.json',
        'plugins/claude-kit/hooks.json'
      ]
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

function printResult(mode, allCounts, activeDomains, activeTargets) {
  const version = resolveVersion();
  const verb = mode === 'fresh' ? '설치 완료' : '업데이트 완료';

  for (const target of activeTargets) {
    const counts = allCounts[target] || {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const targetLabel = target === 'claude' ? 'Claude (.claude/)' : 'Codex (plugins/claude-kit/)';

    console.log(`\nclaude-kit v${version} ${verb} [${targetLabel}]`);
    console.log(`  ${counts.agents || 0} agents, ${counts.commands || 0} commands, ${counts.skills || 0} skills, ${counts.hooks || 0} hooks, ${counts.rules || 0} rules`);
    console.log(`  총 ${total}개 컴포넌트 (domains: ${activeDomains.join(',')})`);
  }

  console.log('  Quick Start: CLAUDE-KIT-QUICKSTART.md');
  console.log(`  모드: ${mode === 'fresh' ? '신규 설치' : '업데이트'}\n`);
}

main();
