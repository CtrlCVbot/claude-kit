#!/usr/bin/env node
'use strict';
/**
 * migrate-agent-frontmatter-v1.1.js — IMP-AGENT-008 마이그레이션 스크립트
 *
 * claude-kit 21개 에이전트의 frontmatter를 v1.0 → v1.1로 승격.
 * - schema_version: '1.1' 추가
 * - team_owner: 도메인 경로에서 자동 추론 (dev/plan/copy)
 * - release_stage: 신규 에이전트는 beta, 기존은 stable
 * - dependencies: 본문 grep으로 calls/called_by 자동 추출
 *
 * 실행: node scripts/migrate-agent-frontmatter-v1.1.js [--dry-run] [--verbose]
 * 설계: docs/archive/kit-agent-improvements-v2.3.1/IMP-AGENT-008-frontmatter-extension.md
 */

const { readFileSync, writeFileSync, readdirSync, statSync } = require('node:fs');
const { join, basename } = require('node:path');

const REPO_ROOT = join(__dirname, '..');
const AGENT_DIRS = [
  { path: 'src/claude/dev/agents', team: 'dev' },
  { path: 'src/claude/plan/agents', team: 'plan' },
  { path: 'src/claude/copy/agents', team: 'copy' }
];

// 신규 추가 에이전트: beta 시작 (IMP-AGENT-005, 006)
const BETA_AGENTS = new Set(['dev-implementer', 'copy-implementer']);

function parseFrontmatter(content) {
  // CRLF → LF 정규화 (Windows 환경 파일 호환)
  const normalized = content.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return null;
  const body = match[1];
  const fields = {};
  const lines = body.split('\n');
  let currentKey = null;
  let currentValue = '';
  for (const line of lines) {
    const fieldMatch = line.match(/^([a-z_]+):\s*(.*)$/);
    if (fieldMatch) {
      if (currentKey) fields[currentKey] = currentValue.trim();
      currentKey = fieldMatch[1];
      currentValue = fieldMatch[2];
    } else if (currentKey) {
      currentValue += '\n' + line;
    }
  }
  if (currentKey) fields[currentKey] = currentValue.trim();
  return {
    frontmatter: fields,
    frontmatterRaw: match[0],
    body: normalized.slice(match[0].length),
    originalCRLF: /\r\n/.test(content)
  };
}

function serializeFrontmatter(fields) {
  const order = [
    'name',
    'description',
    'tools',
    'model',
    'memory',
    'color',
    'schema_version',
    'team_owner',
    'release_stage',
    'dependencies'
  ];
  let out = '---\n';
  const written = new Set();
  for (const key of order) {
    if (fields[key] !== undefined) {
      out += `${key}: ${fields[key]}\n`;
      written.add(key);
    }
  }
  for (const key of Object.keys(fields)) {
    if (!written.has(key)) {
      out += `${key}: ${fields[key]}\n`;
    }
  }
  out += '---\n';
  return out;
}

function resolveStage(name) {
  if (BETA_AGENTS.has(name)) return 'beta';
  return 'stable';
}

function extractDependencies(agentName, allAgents) {
  const calls = [];
  const calledBy = [];

  const agentFile = allAgents.find(a => a.name === agentName);
  if (agentFile) {
    const content = readFileSync(agentFile.filePath, 'utf8');
    for (const peer of allAgents) {
      if (peer.name === agentName) continue;
      const mentionRegex = new RegExp(`\\b${peer.name}\\b`, 'g');
      if (mentionRegex.test(content)) {
        calls.push(peer.name);
      }
    }
  }

  for (const peer of allAgents) {
    if (peer.name === agentName) continue;
    const content = readFileSync(peer.filePath, 'utf8');
    const mentionRegex = new RegExp(`\\b${agentName}\\b`, 'g');
    if (mentionRegex.test(content)) {
      calledBy.push(peer.name);
    }
  }

  return { calls: calls.sort(), called_by: calledBy.sort() };
}

function collectAgents() {
  const agents = [];
  for (const dir of AGENT_DIRS) {
    const absDir = join(REPO_ROOT, dir.path);
    try {
      const entries = readdirSync(absDir);
      for (const entry of entries) {
        if (!entry.endsWith('.md')) continue;
        const filePath = join(absDir, entry);
        if (!statSync(filePath).isFile()) continue;
        const content = readFileSync(filePath, 'utf8');
        const parsed = parseFrontmatter(content);
        if (!parsed) continue;
        agents.push({
          name: parsed.frontmatter.name,
          filePath,
          team: dir.team,
          parsed
        });
      }
    } catch {
      // directory missing — skip
    }
  }
  return agents;
}

function migrateAgent(agent, allAgents, options) {
  const { parsed, team, name } = agent;
  const fm = { ...parsed.frontmatter };

  let changed = false;
  if (!fm.schema_version) {
    fm.schema_version = "'1.1'";
    changed = true;
  }
  if (!fm.team_owner) {
    fm.team_owner = team;
    changed = true;
  }
  if (!fm.release_stage) {
    fm.release_stage = resolveStage(name);
    changed = true;
  }
  if (!fm.dependencies) {
    const deps = extractDependencies(name, allAgents);
    const formatted = `\n  calls: ${JSON.stringify(deps.calls)}\n  called_by: ${JSON.stringify(deps.called_by)}`;
    fm.dependencies = formatted;
    changed = true;
  }

  if (!changed) {
    return { agent, changed: false };
  }

  const newFrontmatter = serializeFrontmatter(fm);
  let newContent = newFrontmatter + parsed.body;
  // 원본이 CRLF면 복원 (Windows 표준 유지)
  if (parsed.originalCRLF) {
    newContent = newContent.replace(/\n/g, '\r\n');
  }

  if (!options.dryRun) {
    writeFileSync(agent.filePath, newContent, 'utf8');
  }

  return { agent, changed: true };
}

function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose')
  };

  const agents = collectAgents();
  // eslint-disable-next-line no-console
  console.log(`[migrate] detected ${agents.length} agents across ${AGENT_DIRS.length} domains`);

  let migratedCount = 0;
  for (const agent of agents) {
    const result = migrateAgent(agent, agents, options);
    if (result.changed) {
      migratedCount += 1;
      if (options.verbose) {
        // eslint-disable-next-line no-console
        console.log(`  migrated: ${agent.name} (${basename(agent.filePath)})`);
      }
    } else if (options.verbose) {
      // eslint-disable-next-line no-console
      console.log(`  skipped (already v1.1): ${agent.name}`);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`[migrate] ${migratedCount}/${agents.length} agents ${options.dryRun ? 'would be' : 'were'} migrated`);
}

if (require.main === module) {
  main();
}

module.exports = {
  parseFrontmatter,
  serializeFrontmatter,
  resolveStage,
  extractDependencies,
  collectAgents,
  migrateAgent
};
