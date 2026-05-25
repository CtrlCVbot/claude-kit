#!/usr/bin/env node
/**
 * Hook: {{FULL_NAME}}
 * Event: PreToolUse ({{MATCHER}})
 * Action: BLOCKING (exit 2) -- {{DESCRIPTION}}
 *
 * Codex 등록 포맷:
 *   .codex/hooks.json: { type: "command", command: "./hooks/{{FULL_NAME}}.js" }
 *
 * Codex hooks 현황 (2026-04 기준):
 *   - hooks는 experimental 기능
 *   - PreToolUse/PostToolUse matcher: 현재 runtime에서 Bash만 실질 매칭
 *   - Windows: hooks 현재 비활성화 상태
 *   - Stop 이벤트: 공식 지원되나 runtime 구현 상태 확인 필요
 */

const fs = require("fs");
const path = require("path");

const EXEMPT_PATTERNS = [
  /\.json$/, /\.yaml$/, /\.yml$/, /\.md$/,
  /\.config\.(ts|js|mjs)$/, /\.d\.ts$/,
];

async function main() {
  try {
    let inputData = "";
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    const parsed = JSON.parse(inputData);
    const toolUse = parsed.tool_use || parsed;
    const toolName = toolUse.tool_name || "";

    if (!["Edit", "Write"].includes(toolName)) {
      process.exit(0);
    }

    const filePath = toolUse.tool_input?.file_path || "";
    if (!filePath) process.exit(0);

    if (EXEMPT_PATTERNS.some((p) => p.test(filePath))) {
      process.exit(0);
    }

    // TODO: 핵심 검증 로직

    const isValid = true;

    if (!isValid) {
      process.stderr.write(`[{{FULL_NAME}}] 차단됨\n파일: ${filePath}\n`);
      process.exit(2);
    }

    process.exit(0);
  } catch {
    process.exit(0);
  }
}

main();
