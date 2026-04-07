#!/usr/bin/env node
/**
 * Hook: {{FULL_NAME}}
 * Event: PostToolUse ({{MATCHER}})
 * Action: log (exit 0) -- {{DESCRIPTION}}
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = process.cwd();

async function main() {
  try {
    let inputData = "";
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    const parsed = JSON.parse(inputData);
    const toolUse = parsed.tool_use || parsed;
    const toolName = toolUse.tool_name || "";

    // 대상 도구 필터링
    if (!["Edit", "Write"].includes(toolName)) {
      process.exit(0);
    }

    const filePath = toolUse.tool_input?.file_path || "";
    if (!filePath) process.exit(0);

    // ============================================================
    // TODO: 로깅/처리 로직
    // ============================================================

    process.exit(0); // 항상 통과
  } catch {
    process.exit(0); // 에러 시에도 통과
  }
}

main();
