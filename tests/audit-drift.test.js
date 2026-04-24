import { execFileSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

function runAuditDrift(args = []) {
  const output = execFileSync(process.execPath, ['scripts/audit-drift.js', ...args, '--json'], {
    encoding: 'utf8'
  })

  return JSON.parse(output)
}

describe('audit-drift', () => {
  it('reports no drift for the current synchronized Codex sources', () => {
    expect(runAuditDrift()).toEqual([])
    expect(runAuditDrift(['--content'])).toEqual([])
  })
})
