import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const ROOT = path.resolve('.')

const CASES = [
  ['src/claude/dev/commands/dev-refactor.md', '.claude/skills/dev-refactoring/SKILL.md'],
  ['src/claude/dev/commands/dev-review.md', '.claude/skills/dev-layered-architecture/SKILL.md'],
  ['src/claude/dev/commands/dev-review.md', '.claude/skills/dev-frontend-patterns/SKILL.md'],
  ['src/claude/dev/commands/dev-test-verify.md', '.claude/skills/dev-tdd-workflow/SKILL.md'],
  ['src/claude/dev/commands/dev-verify-fe.md', '.claude/skills/dev-testing-frontend/SKILL.md'],
  ['src/claude/dev/commands/dev-verify-fe.md', '.claude/skills/dev-frontend-patterns/SKILL.md'],
  ['src/codex/dev/commands/dev-refactor.md', '.claude/skills/dev-refactoring/SKILL.md'],
  ['src/codex/dev/commands/dev-review.md', '.claude/skills/dev-layered-architecture/SKILL.md'],
  ['src/codex/dev/commands/dev-review.md', '.claude/skills/dev-frontend-patterns/SKILL.md'],
  ['src/codex/dev/commands/dev-test-verify.md', '.claude/skills/dev-tdd-workflow/SKILL.md'],
  ['src/codex/dev/commands/dev-verify-fe.md', '.claude/skills/dev-testing-frontend/SKILL.md'],
  ['src/codex/dev/commands/dev-verify-fe.md', '.claude/skills/dev-frontend-patterns/SKILL.md'],
  ['src/claude/dev/skills/dev-domain-modeling/SKILL.md', '.claude/skills/dev-layered-architecture/SKILL.md'],
  ['src/claude/dev/skills/dev-observability/SKILL.md', '.claude/skills/dev-layered-architecture/SKILL.md'],
  ['src/claude/dev/skills/dev-refactoring/SKILL.md', '.claude/skills/dev-tdd-workflow/SKILL.md'],
  ['src/claude/dev/skills/dev-refactoring/SKILL.md', '.claude/skills/dev-layered-architecture/SKILL.md'],
  ['src/claude/dev/skills/dev-tdd-workflow/SKILL.md', '.claude/skills/dev-testing-frontend/SKILL.md'],
  ['src/claude/dev/skills/dev-testing-backend/SKILL.md', '.claude/skills/dev-tdd-workflow/SKILL.md'],
  ['src/claude/dev/skills/dev-testing-backend/SKILL.md', '.claude/skills/dev-testing-frontend/SKILL.md'],
  ['src/claude/dev/skills/dev-testing-frontend/SKILL.md', '.claude/skills/dev-tdd-workflow/SKILL.md'],
  ['src/codex/dev/skills/dev-domain-modeling/SKILL.md', '.claude/skills/dev-layered-architecture/SKILL.md'],
  ['src/codex/dev/skills/dev-observability/SKILL.md', '.claude/skills/dev-layered-architecture/SKILL.md'],
  ['src/codex/dev/skills/dev-refactoring/SKILL.md', '.claude/skills/dev-tdd-workflow/SKILL.md'],
  ['src/codex/dev/skills/dev-refactoring/SKILL.md', '.claude/skills/dev-layered-architecture/SKILL.md'],
  ['src/codex/dev/skills/dev-tdd-workflow/SKILL.md', '.claude/skills/dev-testing-frontend/SKILL.md'],
  ['src/codex/dev/skills/dev-testing-backend/SKILL.md', '.claude/skills/dev-tdd-workflow/SKILL.md'],
  ['src/codex/dev/skills/dev-testing-backend/SKILL.md', '.claude/skills/dev-testing-frontend/SKILL.md'],
  ['src/codex/dev/skills/dev-testing-frontend/SKILL.md', '.claude/skills/dev-tdd-workflow/SKILL.md']
]

const REMOVED_PATTERNS = [
  '.claude/skills/refactoring/SKILL.md',
  '.claude/skills/layered-architecture/SKILL.md',
  '.claude/skills/frontend-patterns/SKILL.md',
  '.claude/skills/tdd-workflow/SKILL.md',
  '.claude/skills/testing-frontend/SKILL.md'
]

describe('dev reference paths', () => {
  it('uses the current dev-* skill paths in Claude and Codex dev sources', () => {
    const fileCache = new Map()

    for (const [relativePath, expectedPath] of CASES) {
      if (!fileCache.has(relativePath)) {
        fileCache.set(relativePath, readFileSync(path.join(ROOT, relativePath), 'utf8'))
      }

      expect(fileCache.get(relativePath)).toContain(expectedPath)
    }
  })

  it('does not keep the removed pre-prefix skill paths in the patched dev sources', () => {
    const targetFiles = [...new Set(CASES.map(([relativePath]) => relativePath))]

    for (const relativePath of targetFiles) {
      const content = readFileSync(path.join(ROOT, relativePath), 'utf8')
      for (const removedPattern of REMOVED_PATTERNS) {
        expect(content).not.toContain(removedPattern)
      }
    }
  })
})
