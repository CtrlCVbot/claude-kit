import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.claude/worktrees'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts}'],
      exclude: ['**/*.test.{js,ts}', 'dist/**', 'node_modules/**']
    },
    reporters: ['default'],
    passWithNoTests: true
  }
})
