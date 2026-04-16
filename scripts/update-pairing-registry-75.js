#!/usr/bin/env node
/**
 * pairing-registry.json에 75개 신규 엔트리 추가.
 * kit-sync 75 full execution 용 일회성 스크립트.
 */

const fs = require("fs");
const path = require("path");

const REGISTRY_PATH = path.join(__dirname, "..", "src", "pairing-registry.json");
const TIMESTAMP = new Date().toISOString();

const newEntries = [
  // === Skills (25) ===
  // Core (2)
  { identity: "continuous-learning", type: "skill", domain: "core" },
  { identity: "session-wrap", type: "skill", domain: "core" },
  // Dev (15)
  { identity: "dev-domain-modeling", type: "skill", domain: "dev" },
  { identity: "dev-observability", type: "skill", domain: "dev" },
  { identity: "dev-refactoring", type: "skill", domain: "dev" },
  { identity: "dev-security-pipeline", type: "skill", domain: "dev" },
  { identity: "dev-tdd-workflow", type: "skill", domain: "dev" },
  { identity: "dev-testing-backend", type: "skill", domain: "dev" },
  { identity: "dev-testing-e2e", type: "skill", domain: "dev" },
  { identity: "dev-testing-frontend", type: "skill", domain: "dev" },
  { identity: "dev-verification-engine", type: "skill", domain: "dev" },
  { identity: "dev-architecture-decision", type: "skill", domain: "dev" },
  { identity: "dev-feature-module", type: "skill", domain: "dev" },
  { identity: "dev-feature-plan", type: "skill", domain: "dev" },
  { identity: "dev-layered-architecture", type: "skill", domain: "dev" },
  { identity: "dev-workflow", type: "skill", domain: "dev" },
  { identity: "dev-frontend-patterns", type: "skill", domain: "dev" },
  // Plan (8)
  { identity: "plan-prd-authoring", type: "skill", domain: "plan" },
  { identity: "plan-wireframe-design", type: "skill", domain: "plan" },
  { identity: "plan-stitch-workflow", type: "skill", domain: "plan" },
  { identity: "plan-review-criteria", type: "skill", domain: "plan" },
  { identity: "plan-archive-workflow", type: "skill", domain: "plan" },
  { identity: "plan-idea-management", type: "skill", domain: "plan" },
  { identity: "plan-screening-workflow", type: "skill", domain: "plan" },
  { identity: "plan-pipeline", type: "skill", domain: "plan" },

  // === Agents (12) ===
  // Dev (6)
  { identity: "dev-architect", type: "agent", domain: "dev" },
  { identity: "dev-code-reviewer", type: "agent", domain: "dev" },
  { identity: "dev-database-reviewer", type: "agent", domain: "dev" },
  { identity: "dev-doc-updater", type: "agent", domain: "dev" },
  { identity: "dev-security-reviewer", type: "agent", domain: "dev" },
  { identity: "dev-verify-agent", type: "agent", domain: "dev" },
  // Plan (6)
  { identity: "plan-prd-writer", type: "agent", domain: "plan" },
  { identity: "plan-wireframe-designer", type: "agent", domain: "plan" },
  { identity: "plan-stitch-integrator", type: "agent", domain: "plan" },
  { identity: "plan-reviewer", type: "agent", domain: "plan" },
  { identity: "plan-idea-collector", type: "agent", domain: "plan" },
  { identity: "plan-idea-screener", type: "agent", domain: "plan" },

  // === Commands (31) ===
  // Dev (21)
  { identity: "dev-build-fix", type: "command", domain: "dev" },
  { identity: "dev-checkpoint", type: "command", domain: "dev" },
  { identity: "dev-commit-push-pr", type: "command", domain: "dev" },
  { identity: "dev-commit", type: "command", domain: "dev" },
  { identity: "dev-continue", type: "command", domain: "dev" },
  { identity: "dev-explore", type: "command", domain: "dev" },
  { identity: "dev-handoff-verify", type: "command", domain: "dev" },
  { identity: "dev-learn", type: "command", domain: "dev" },
  { identity: "dev-plan", type: "command", domain: "dev" },
  { identity: "dev-refactor", type: "command", domain: "dev" },
  { identity: "dev-review", type: "command", domain: "dev" },
  { identity: "dev-security-review", type: "command", domain: "dev" },
  { identity: "dev-sync-docs", type: "command", domain: "dev" },
  { identity: "dev-sync", type: "command", domain: "dev" },
  { identity: "dev-test-verify", type: "command", domain: "dev" },
  { identity: "dev-verify-all", type: "command", domain: "dev" },
  { identity: "dev-verify-fe", type: "command", domain: "dev" },
  { identity: "dev-architecture", type: "command", domain: "dev" },
  { identity: "dev-feature", type: "command", domain: "dev" },
  { identity: "dev-run", type: "command", domain: "dev" },
  { identity: "dev-verify", type: "command", domain: "dev" },
  // Plan (10)
  { identity: "plan-prd", type: "command", domain: "plan" },
  { identity: "plan-wireframe", type: "command", domain: "plan" },
  { identity: "plan-stitch", type: "command", domain: "plan" },
  { identity: "plan-idea", type: "command", domain: "plan" },
  { identity: "plan-screen", type: "command", domain: "plan" },
  { identity: "plan-archive", type: "command", domain: "plan" },
  { identity: "plan-improve", type: "command", domain: "plan" },
  { identity: "plan-draft", type: "command", domain: "plan" },
  { identity: "plan-review", type: "command", domain: "plan" },
  { identity: "plan-bridge", type: "command", domain: "plan" },

  // === Hooks (7) ===
  // Core (3)
  { identity: "edit-tracker", type: "hook", domain: "core" },
  { identity: "code-quality-reminder", type: "hook", domain: "core" },
  { identity: "security-auto-trigger", type: "hook", domain: "core" },
  // Dev (3)
  { identity: "dev-db-guard", type: "hook", domain: "dev" },
  { identity: "dev-tdd-guard", type: "hook", domain: "dev" },
  { identity: "dev-feature-scope-guard", type: "hook", domain: "dev" },
  // Plan (1)
  { identity: "plan-doc-guard", type: "hook", domain: "plan" },
];

function getFilePaths(entry) {
  const { identity, type, domain } = entry;
  const ext = type === "hook" ? ".js" : ".md";
  const subdir =
    type === "skill"
      ? `skills/${identity}/SKILL`
      : type === "agent"
        ? `agents/${identity}`
        : type === "command"
          ? `commands/${identity}`
          : `hooks/${identity}`;

  return {
    claude: `src/claude/${domain}/${subdir}${ext}`,
    codex: `src/codex/${domain}/${subdir}${ext}`,
  };
}

function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  const existingIds = new Set(registry.entries.map((e) => e.identity));

  let added = 0;
  let skipped = 0;

  for (const entry of newEntries) {
    if (existingIds.has(entry.identity)) {
      console.log(`[skip] ${entry.identity}: already in registry`);
      skipped++;
      continue;
    }

    const paths = getFilePaths(entry);

    // Verify codex file exists
    const codexFullPath = path.join(__dirname, "..", paths.codex);
    if (!fs.existsSync(codexFullPath)) {
      console.log(`[WARN] ${entry.identity}: codex file not found at ${paths.codex}`);
    }

    registry.entries.push({
      identity: entry.identity,
      type: entry.type,
      domain: entry.domain,
      status: "paired",
      reason: null,
      claude: paths.claude,
      codex: paths.codex,
      createdAt: TIMESTAMP,
    });

    added++;
  }

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");
  console.log(`\n=== pairing-registry update ===`);
  console.log(`Added: ${added}`);
  console.log(`Skipped (existing): ${skipped}`);
  console.log(`Total entries: ${registry.entries.length}`);
}

main();
