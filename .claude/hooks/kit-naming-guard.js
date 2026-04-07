#!/usr/bin/env node
/**
 * Hook: Kit Naming Guard
 * Event: PreToolUse (Edit|Write)
 * Action: BLOCKING (exit 2) -- src/claude/ 및 src/codex/ 경로의 네이밍 규칙 위반 차단
 */

const path = require("path");

// 유효 도메인
const VALID_DOMAINS = ["core", "dev", "plan"];

// kebab-case 정규식
const KEBAB_CASE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// 카테고리별 규칙
const CATEGORY_RULES = {
  skills: {
    // 디렉토리명이 {domain}-* 패턴
    extract: (parts) => {
      // src/{target}/{domain}/skills/{dirName}/... → dirName
      const idx = parts.indexOf("skills");
      return idx >= 0 && parts.length > idx + 1 ? parts[idx + 1] : null;
    },
    validate: (name, domain) => {
      if (!name.startsWith(`${domain}-`)) {
        return `디렉토리명이 '${domain}-' 접두사로 시작해야 합니다. 올바른 예: ${domain}-${name}`;
      }
      const baseName = name.slice(domain.length + 1);
      if (!KEBAB_CASE.test(baseName)) {
        return `'${baseName}' 부분이 kebab-case가 아닙니다.`;
      }
      return null;
    },
  },
  agents: {
    extract: (parts) => {
      const idx = parts.indexOf("agents");
      if (idx >= 0 && parts.length > idx + 1) {
        const file = parts[idx + 1];
        return file.endsWith(".md") ? file.slice(0, -3) : file;
      }
      return null;
    },
    validate: (name, domain) => {
      if (!name.startsWith(`${domain}-`)) {
        return `파일명이 '${domain}-' 접두사로 시작해야 합니다. 올바른 예: ${domain}-${name}.md`;
      }
      if (!KEBAB_CASE.test(name)) {
        return `'${name}'이 kebab-case가 아닙니다.`;
      }
      return null;
    },
  },
  commands: {
    extract: (parts) => {
      const idx = parts.indexOf("commands");
      if (idx >= 0 && parts.length > idx + 1) {
        const file = parts[idx + 1];
        return file.endsWith(".md") ? file.slice(0, -3) : file;
      }
      return null;
    },
    validate: (name, domain) => {
      if (!name.startsWith(`${domain}-`)) {
        return `파일명이 '${domain}-' 접두사로 시작해야 합니다. 올바른 예: ${domain}-${name}.md`;
      }
      if (!KEBAB_CASE.test(name)) {
        return `'${name}'이 kebab-case가 아닙니다.`;
      }
      return null;
    },
  },
  hooks: {
    extract: (parts) => {
      const idx = parts.indexOf("hooks");
      if (idx >= 0 && parts.length > idx + 1) {
        const file = parts[idx + 1];
        if (file === "package.json") return null; // package.json은 무시
        return file.endsWith(".js") ? file.slice(0, -3) : file;
      }
      return null;
    },
    validate: (name, domain) => {
      if (!name.startsWith(`${domain}-`)) {
        return `파일명이 '${domain}-' 접두사로 시작해야 합니다. 올바른 예: ${domain}-${name}.js`;
      }
      if (!KEBAB_CASE.test(name)) {
        return `'${name}'이 kebab-case가 아닙니다.`;
      }
      return null;
    },
  },
  rules: {
    extract: (parts) => {
      const idx = parts.indexOf("rules");
      if (idx >= 0 && parts.length > idx + 1) {
        const file = parts[idx + 1];
        return file.endsWith(".md") ? file.slice(0, -3) : file;
      }
      return null;
    },
    validate: (name, domain) => {
      // rules는 도메인 접두사 금지
      for (const d of VALID_DOMAINS) {
        if (name.startsWith(`${d}-`)) {
          return `rules 파일에 도메인 접두사 '${d}-'를 사용하면 안 됩니다. 올바른 예: ${name.slice(d.length + 1)}.md`;
        }
      }
      if (!KEBAB_CASE.test(name)) {
        return `'${name}'이 kebab-case가 아닙니다.`;
      }
      return null;
    },
  },
};

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

    // src/claude/ 또는 src/codex/ 경로만 대상
    const normalized = filePath.replace(/\\/g, "/");
    const srcMatch = normalized.match(
      /src\/(claude|codex)\/(core|dev|plan)\/(skills|agents|commands|hooks|rules)\//
    );
    if (!srcMatch) process.exit(0);

    const target = srcMatch[1];
    const domain = srcMatch[2];
    const category = srcMatch[3];

    const rule = CATEGORY_RULES[category];
    if (!rule) process.exit(0);

    // 경로에서 이름 추출
    const parts = normalized.split("/");
    const name = rule.extract(parts);
    if (!name) process.exit(0);

    // 검증
    const error = rule.validate(name, domain);
    if (error) {
      const message = `
[kit-naming-guard] 네이밍 규칙 위반

  파일:     ${filePath}
  타깃:     ${target}
  도메인:   ${domain}
  카테고리: ${category}
  위반:     ${error}

  /kit-create ${category === "skills" ? "skill" : category.slice(0, -1)} ${domain} <name> 을 사용하면 올바른 이름이 자동 생성됩니다.
`;
      process.stderr.write(message);
      process.exit(2);
    }

    process.exit(0);
  } catch {
    // fail-open: 훅 자체 오류로 사용자 작업을 차단하지 않음
    process.exit(0);
  }
}

main();
