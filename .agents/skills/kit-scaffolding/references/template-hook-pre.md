#!/usr/bin/env node
/**
 * Hook: {{FULL_NAME}}
 * Event: PreToolUse ({{MATCHER}})
 * Action: BLOCKING (exit 2) -- {{DESCRIPTION}}
 */

const fs = require("fs");
const path = require("path");

// ============================================================
// 면제 패턴
// ============================================================
const EXEMPT_PATTERNS = [
  /\.json$/, /\.yaml$/, /\.yml$/, /\.md$/,
  /\.config\.(ts|js|mjs)$/, /\.d\.ts$/,
  // TODO: 프로젝트별 면제 추가
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

    // 대상 도구 필터링
    if (!["Edit", "Write"].includes(toolName)) {
      process.exit(0);
    }

    const filePath = toolUse.tool_input?.file_path || "";
    if (!filePath) process.exit(0);

    // 면제 패턴 검사
    if (EXEMPT_PATTERNS.some((p) => p.test(filePath))) {
      process.exit(0);
    }

    // ============================================================
    // TODO: 핵심 검증 로직
    // ============================================================

    const isValid = true; // TODO: 검증 결과

    if (!isValid) {
      const message = `
[{{FULL_NAME}}] 차단됨

사유: TODO
파일: ${filePath}

해결 방법:
  TODO
`;
      process.stderr.write(message);
      process.exit(2); // BLOCKING
    }

    process.exit(0); // PASS
  } catch {
    // fail-open: 훅 자체 오류로 사용자 작업을 차단하지 않음
    process.exit(0);
  }
}

main();
