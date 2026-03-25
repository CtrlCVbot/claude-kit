/**
 * setup.js — claude-kit v2.0 postinstall 스크립트
 *
 * npm 패키지의 AI 거버넌스 컴포넌트를 프로젝트의 .claude/ 디렉토리에 복사한다.
 * Husky 패턴: npm 패키지 → postinstall → 로컬 경로 복사.
 *
 * v2.0: 도메인 분리 (core/dev/plan) + 도메인별 플래트닝
 *
 * 8단계 흐름:
 * 1. 프로젝트 루트 탐색 (INIT_CWD)
 * 2. 설치 모드 판별 (신규 vs 업데이트)
 * 3. 도메인 감지 (profile.json domains 필드)
 * 4. .claude/ 디렉토리 구조 생성
 * 5. 도메인별 플래트닝 복사
 * 6. 템플릿 처리 (CLAUDE.md, profile.json, settings.json)
 * 7. 메타데이터 기록 (.claude-kit-meta.json)
 * 8. 결과 출력
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { mergeSettings } = require('./merge-settings');

const SRC_DIR = path.resolve(__dirname, '..', 'src');

const COMPONENT_DIRS = ['agents', 'commands', 'skills', 'hooks', 'rules'];

function main() {
  try {
    const projectRoot = detectProjectRoot();
    const mode = detectMode(projectRoot);
    const activeDomains = resolveActiveDomains(projectRoot);
    createDirectories(projectRoot);
    const { counts, byDomain } = copyComponents(projectRoot, activeDomains);
    processTemplates(projectRoot, mode, activeDomains);
    writeMetadata(projectRoot, mode, counts, byDomain, activeDomains);
    printResult(mode, counts, activeDomains);
  } catch (error) {
    console.error(`claude-kit 설치 실패: ${error.message}`);
    process.exit(0);
  }
}

// 1단계: 프로젝트 루트 탐색
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

// 2단계: 설치 모드 판별
function detectMode(projectRoot) {
  const metaPath = path.join(projectRoot, '.claude-kit-meta.json');
  if (fs.existsSync(metaPath)) {
    return 'update';
  }
  return 'fresh';
}

// 3단계: 도메인 감지 (v2 신규)
function resolveActiveDomains(projectRoot) {
  let domains = ['core', 'dev'];

  const profilePath = path.join(projectRoot, 'profile.json');
  if (fs.existsSync(profilePath)) {
    try {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
      if (Array.isArray(profile.domains) && profile.domains.length > 0) {
        domains = profile.domains;
      }
    } catch {
      // profile.json 파싱 실패 시 기본값 사용
    }
  }

  // core는 항상 포함
  if (!domains.includes('core')) {
    domains.unshift('core');
  }

  return domains;
}

// 4단계: 디렉토리 구조 생성
function createDirectories(projectRoot) {
  const claudeDir = path.join(projectRoot, '.claude');
  for (const dir of COMPONENT_DIRS) {
    fs.mkdirSync(path.join(claudeDir, dir), { recursive: true });
  }
}

// 5단계: 도메인별 플래트닝 복사 (v2 변경)
function copyComponents(projectRoot, activeDomains) {
  const byDomain = {};

  for (const domain of activeDomains) {
    byDomain[domain] = {};
    const srcDomainDir = path.join(SRC_DIR, domain);

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

  // 합계 계산
  const counts = {};
  for (const cat of COMPONENT_DIRS) {
    counts[cat] = Object.values(byDomain).reduce(
      (sum, domainCounts) => sum + (domainCounts[cat] || 0),
      0
    );
  }

  return { counts, byDomain };
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

// 6단계: 템플릿 처리
function processTemplates(projectRoot, mode, activeDomains) {
  const templateDir = path.join(SRC_DIR, 'templates');
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

// settings.json 동적 생성 (도메인 조건부 훅 등록)
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
      // Core 훅 — 항상 등록
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/edit-tracker.js'] },
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/code-quality-reminder.js'] },
      { matcher: '*', hooks: ['node .claude/hooks/output-secret-filter.js'] },
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/security-auto-trigger.js'] }
    ],
    Stop: [
      { hooks: ['node .claude/hooks/session-wrap-suggest.js'] }
    ]
  };

  // Dev 도메인 훅 — 조건부
  if (activeDomains.includes('dev')) {
    hooks.PreToolUse.push(
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/dev-tdd-guard.js'] },
      { matcher: 'Bash', hooks: ['node .claude/hooks/dev-db-guard.js'] }
    );
  }

  // Planning 도메인 훅 — 조건부
  if (activeDomains.includes('plan')) {
    hooks.PreToolUse.push(
      { matcher: 'Edit|Write', hooks: ['node .claude/hooks/plan-doc-guard.js'] }
    );
  }

  return hooks;
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
      // ignore parse errors
    }
  }

  // lockfile로 패키지 매니저 감지
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
    DATE: today
  };
}

// 7단계: 메타데이터 기록
function writeMetadata(projectRoot, mode, counts, byDomain, activeDomains) {
  const metaPath = path.join(projectRoot, '.claude-kit-meta.json');

  let meta = {};
  if (mode === 'update' && fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch {
      meta = {};
    }
  }

  const pkgPath = path.join(__dirname, '..', 'package.json');
  let version = '0.0.0';
  if (fs.existsSync(pkgPath)) {
    try {
      version = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version || version;
    } catch {
      // ignore
    }
  }

  const now = new Date().toISOString();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // byDomain에서 0값 제거
  const cleanByDomain = {};
  for (const [domain, domainCounts] of Object.entries(byDomain)) {
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

  const updated = {
    version,
    installedAt: meta.installedAt || now,
    updatedAt: now,
    domains: activeDomains,
    components: {
      agents: counts.agents || 0,
      commands: counts.commands || 0,
      skills: counts.skills || 0,
      hooks: counts.hooks || 0,
      rules: counts.rules || 0
    },
    byDomain: cleanByDomain,
    totalComponents: total,
    preservedFiles: ['CLAUDE.md', 'profile.json']
  };

  fs.writeFileSync(metaPath, JSON.stringify(updated, null, 2) + '\n');
}

// 8단계: 결과 출력
function printResult(mode, counts, activeDomains) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const verb = mode === 'fresh' ? '설치 완료' : '업데이트 완료';

  const pkgPath = path.join(__dirname, '..', 'package.json');
  let version = '2.0.0';
  try {
    version = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version || version;
  } catch {
    // ignore
  }

  console.log(`\nclaude-kit v${version} ${verb} (${total}개 컴포넌트, domains: ${activeDomains.join(',')})`);
  console.log(`  ${counts.agents || 0} agents, ${counts.commands || 0} commands, ${counts.skills || 0} skills, ${counts.hooks || 0} hooks, ${counts.rules || 0} rules`);
  console.log(`  모드: ${mode === 'fresh' ? '신규 설치' : '업데이트'}\n`);
}

main();
