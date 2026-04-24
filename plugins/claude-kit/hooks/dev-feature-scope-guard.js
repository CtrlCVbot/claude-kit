// kit-convert generated: 2026-04-24
#!/usr/bin/env node
/**
 * Hook: Feature Scope Guard
 * Event: PreToolUse (Edit|Write)
 * Action: BLOCKING (exit 2)
 *
 * Blocks code edits when:
 * 1. The project architecture profile does not exist
 * 2. Active feature bindings do not exist
 * 3. The target file is outside all allowed binding paths
  *
 * Codex 등록 포맷:
 *   .codex/hooks.json: { type: "command", command: "./hooks/dev-feature-scope-guard.js" }
 *
 * Codex hooks 공식 제약 (2026-04 기준):
 *   - hooks는 experimental 기능
 *   - PreToolUse/PostToolUse matcher: 공식 문서상 Bash 범위가 핵심.
 *   - Stop event: runtime 상태 파일 의존 hook은 skill/command fallback 필요.
 *   - Windows: 현재 비활성화.
 *
 * Claude sibling: src/claude/dev/hooks/dev-feature-scope-guard.js
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = process.cwd();
const ARCHITECTURE_PROFILE = path.join(PROJECT_ROOT, ".plans", "project", "00-dev-architecture.md");
const ACTIVE_FEATURES_ROOT = path.join(PROJECT_ROOT, ".plans", "features", "active");

const CODE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".java", ".go", ".rs"
]);

const CODE_DIR_PATTERNS = [
  /[/\\]src[/\\]/,
  /[/\\]app[/\\]/,
  /[/\\]apps[/\\]/,
  /[/\\]packages[/\\]/,
  /[/\\]features[/\\]/,
  /[/\\]components[/\\]/,
  /[/\\]hooks[/\\]/,
  /[/\\]lib[/\\]/,
  /[/\\]api[/\\]/
];

const EXEMPT_PATTERNS = [
  /[/\\]\.plans[/\\]/,
  /[/\\]docs[/\\]/,
  /[/\\]\.claude[/\\]/,
  /[/\\]plugins[/\\]claude-kit[/\\]/,
  /[/\\]scripts[/\\]/,
  /AGENTS\.md$/i,
  /CLAUDE\.md$/i,
  /\.config\./,
  /package\.json$/,
  /tsconfig.*\.json$/,
  /turbo\.json$/,
  /pnpm-workspace\.yaml$/,
  /eslint\.config\./
];

function normalize(filePath) {
  return path.resolve(filePath).replace(/\\/g, "/");
}

function isGuardedCodeFile(filePath) {
  const normalized = normalize(filePath);
  if (EXEMPT_PATTERNS.some((pattern) => pattern.test(normalized))) return false;

  const ext = path.extname(normalized);
  if (!CODE_EXTENSIONS.has(ext)) return false;

  return CODE_DIR_PATTERNS.some((pattern) => pattern.test(normalized));
}

function findBindingFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const bindings = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      bindings.push(...findBindingFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name === "06-architecture-binding.md") {
      bindings.push(fullPath);
    }
  }

  return bindings;
}

function parseAllowedTargets(bindingPath) {
  const content = fs.readFileSync(bindingPath, "utf8");
  const matches = [...content.matchAll(/`([^`]+)`/g)];
  const targets = [];

  for (const match of matches) {
    const raw = match[1].trim().replace(/\\/g, "/");
    if (!/^(apps|app|packages|src|features|components|hooks|lib|api)\//.test(raw)) {
      continue;
    }

    targets.push(normalize(path.join(PROJECT_ROOT, raw)));
  }

  return targets;
}

function isUnderAllowedTarget(filePath, allowedTargets) {
  const normalizedFile = normalize(filePath);
  return allowedTargets.some((target) => {
    if (normalizedFile === target) return true;
    return normalizedFile.startsWith(`${target}/`);
  });
}

async function main() {
  const input = await new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });

  const { tool_name, tool_input } = input;
  if (!["Edit", "Write"].includes(tool_name)) process.exit(0);

  const filePath = tool_input?.file_path;
  if (!filePath || !isGuardedCodeFile(filePath)) process.exit(0);

  if (!fs.existsSync(ARCHITECTURE_PROFILE)) {
    console.error(`\n${"=".repeat(60)}`);
    console.error("[Feature Scope Guard] BLOCKED: architecture profile is missing");
    console.error(`${"=".repeat(60)}`);
    console.error(`  Missing: ${path.relative(PROJECT_ROOT, ARCHITECTURE_PROFILE)}`);
    console.error("  Run /dev-architecture before editing application or package code.");
    console.error(`${"=".repeat(60)}\n`);
    process.exit(2);
  }

  const bindingFiles = findBindingFiles(ACTIVE_FEATURES_ROOT);
  const activeFeaturesExist = fs.existsSync(ACTIVE_FEATURES_ROOT);

  if (activeFeaturesExist && bindingFiles.length === 0) {
    console.error(`\n${"=".repeat(60)}`);
    console.error("[Feature Scope Guard] BLOCKED: no active feature binding was found");
    console.error(`${"=".repeat(60)}`);
    console.error("  Expected at least one:");
    console.error("  .plans/features/active/{slug}/00-context/06-architecture-binding.md");
    console.error("  Run /dev-architecture --slug <feature-slug> before writing feature code.");
    console.error(`${"=".repeat(60)}\n`);
    process.exit(2);
  }

  if (!activeFeaturesExist) process.exit(0);

  const allowedTargets = bindingFiles.flatMap((bindingPath) => parseAllowedTargets(bindingPath));

  if (allowedTargets.length === 0) {
    console.error(`\n${"=".repeat(60)}`);
    console.error("[Feature Scope Guard] BLOCKED: bindings exist but contain no target paths");
    console.error(`${"=".repeat(60)}`);
    console.error("  Add backtick-wrapped paths under Allowed target paths in the binding file.");
    console.error("  Example: `apps/web/app/(main)/orders`");
    console.error(`${"=".repeat(60)}\n`);
    process.exit(2);
  }

  if (!isUnderAllowedTarget(filePath, allowedTargets)) {
    console.error(`\n${"=".repeat(60)}`);
    console.error("[Feature Scope Guard] BLOCKED: target path is outside the active feature bindings");
    console.error(`${"=".repeat(60)}`);
    console.error(`  File: ${path.relative(PROJECT_ROOT, filePath).replace(/\\/g, "/")}`);
    console.error("  Update 06-architecture-binding.md or bind the correct feature via /dev-architecture.");
    console.error(`${"=".repeat(60)}\n`);
    process.exit(2);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
