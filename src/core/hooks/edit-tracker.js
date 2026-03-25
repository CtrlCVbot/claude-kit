#!/usr/bin/env node
/**
 * Hook: Edit Tracker
 * Event: PostToolUse (Edit|Write)
 * Action: log (exit 0) -- 편집 파일을 .ai/.edit-log.json에 기록
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = process.cwd();
const EDIT_LOG_PATH = path.join(PROJECT_ROOT, ".ai", ".edit-log.json");

async function main() {
  try {
    let inputData = "";
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    const parsed = JSON.parse(inputData);
    const toolUse = parsed.tool_use || parsed;
    const toolName = toolUse.tool_name || "";

    // 파일 수정 도구만 처리
    if (!["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(toolName)) {
      process.exit(0);
    }

    const filePath = toolUse.tool_input?.file_path || "";
    if (!filePath) process.exit(0);

    // .ts/.tsx 파일만 로깅
    if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) {
      process.exit(0);
    }

    // .ai/ 디렉토리 보장
    const aiDir = path.dirname(EDIT_LOG_PATH);
    if (!fs.existsSync(aiDir)) {
      fs.mkdirSync(aiDir, { recursive: true });
    }

    // 로그 엔트리 추가 (JSON Lines)
    const logEntry = {
      timestamp: new Date().toISOString(),
      filePath: filePath,
      toolName: toolName,
    };
    fs.appendFileSync(EDIT_LOG_PATH, JSON.stringify(logEntry) + "\n", "utf8");

    process.exit(0);
  } catch {
    process.exit(0); // 에러 시에도 통과
  }
}

main();