#!/usr/bin/env node
/**
 * Hook: {{FULL_NAME}}
 * Event: Stop
 * Action: suggest (exit 0) -- {{DESCRIPTION}}
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

    // ============================================================
    // TODO: 세션 종료 시 처리 로직
    // ============================================================

    process.exit(0); // Stop 훅은 항상 exit(0)
  } catch {
    process.exit(0); // 에러 시에도 통과
  }
}

main();
