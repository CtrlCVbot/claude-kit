import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

const setupScriptPath = path.resolve('scripts/setup.js')
const tempDirs = []

function createFixture(targets) {
  const dir = mkdtempSync(path.join(tmpdir(), 'claude-kit-setup-test-'))
  tempDirs.push(dir)

  writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'claude-kit-setup-test', version: '0.0.0' }),
    'utf8'
  )

  writeFileSync(
    path.join(dir, 'profile.json'),
    JSON.stringify({ domains: ['core', 'dev'], targets }),
    'utf8'
  )

  return dir
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop(), { recursive: true, force: true })
  }
})

describe('setup result logging', () => {
  it('explains when Codex outputs are skipped because codex target is inactive', () => {
    const fixtureDir = createFixture(['claude'])
    const output = execFileSync(process.execPath, [setupScriptPath], {
      cwd: fixtureDir,
      encoding: 'utf8',
      env: { ...process.env, INIT_CWD: fixtureDir }
    })

    expect(output).toContain('Codex target inactive: current targets = claude')
    expect(output).toContain('skipped Codex outputs: AGENTS.md, .agents/**, .codex/**, plugins/claude-kit/**')
    expect(output).toContain('add "codex" to profile.json targets')
  })

  it('does not print the inactive warning when codex target is active', () => {
    const fixtureDir = createFixture(['codex'])
    const output = execFileSync(process.execPath, [setupScriptPath], {
      cwd: fixtureDir,
      encoding: 'utf8',
      env: { ...process.env, INIT_CWD: fixtureDir }
    })

    expect(output).not.toContain('Codex target inactive:')
    expect(output).toContain('AGENTS.md: created')
  })

  it('renders dedicated AGENTS managed blocks for interaction and hardcoded secrets guidance', () => {
    const fixtureDir = createFixture(['codex'])
    execFileSync(process.execPath, [setupScriptPath], {
      cwd: fixtureDir,
      encoding: 'utf8',
      env: { ...process.env, INIT_CWD: fixtureDir }
    })

    const agentsMd = readFileSync(path.join(fixtureDir, 'AGENTS.md'), 'utf8')
    expect(agentsMd).toContain('## Git 워크플로우 (요약)')
    expect(agentsMd).toContain('git config --local user.name')
    expect(agentsMd).toContain('Co-Authored-By')
    expect(agentsMd).toContain('Conventional Commits')
    expect(agentsMd).toContain('## 상호작용 기준 (요약)')
    expect(agentsMd).toContain('## 하드코딩된 비밀값 금지')
    expect(agentsMd).toContain('/copy-verify')
    expect(agentsMd).toContain('copy-reference')
    expect(agentsMd).toContain('/plan-draft')
    expect(agentsMd).toContain('Feature 유형')
    expect(agentsMd).toContain('Today\'s date is')
  })
})
