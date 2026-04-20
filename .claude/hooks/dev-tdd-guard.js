#!/usr/bin/env node
/**
 * Hook: TDD Guard (Polyglot)
 * Event: PreToolUse (Edit|Write)
 * Action: BLOCKING (exit 2) -- 테스트 파일 없으면 편집 차단
 *
 * 지원 스택: TypeScript (.ts/.tsx), Java (.java), Python (.py)
 * 스택 자동 감지: build.gradle.kts → Java, pyproject.toml → Python, 기본 → TypeScript
 */

const fs = require("fs");
const path = require("path");

// ============================================================
// TypeScript 면제 패턴
// ============================================================
const TS_EXEMPT_PATTERNS = [
  /\.json$/, /\.yaml$/, /\.yml$/, /\.config\.(ts|js|mjs)$/,
  /\.d\.ts$/, /\.md$/, /\.css$/, /\.sql$/,
  /migrations\//, /index\.ts$/,
  /\.test\.(ts|tsx)$/, /\.spec\.(ts|tsx)$/, /\.e2e\.(ts|tsx)$/,
  /__tests__\//, /\/test\//,
  /CLAUDE\.md$/, /package\.json$/,
  // 아키텍처 면제: 테스트 불필요 파일
  /src\/common\//, /src\/types\//,
  /\.port\.ts$/, /\.vo\.ts$/, /\.errors\.ts$/,
  /env\.ts$/, /middleware\.ts$/,
  /schema\//, /providers\//, /layouts\//,
];

// ============================================================
// Java 면제 패턴
// ============================================================
const JAVA_EXEMPT_PATTERNS = [
  /\.json$/, /\.yaml$/, /\.yml$/, /\.md$/, /\.sql$/, /\.xml$/, /\.properties$/,
  /migrations\//, /\.gradle(\.kts)?$/,
  /Test\.java$/, /Tests\.java$/, /IT\.java$/,
  /src\/test\//, /CLAUDE\.md$/,
  // 아키텍처 면제
  /Config\.java$/, /Configuration\.java$/, /Application\.java$/,
  /Dto\.java$/, /DTO\.java$/, /Exception\.java$/,
  /Repository\.java$/,  // Spring Data interface
  /package-info\.java$/,
];

// ============================================================
// Python 면제 패턴
// ============================================================
const PYTHON_EXEMPT_PATTERNS = [
  /\.json$/, /\.yaml$/, /\.yml$/, /\.md$/, /\.sql$/, /\.toml$/, /\.cfg$/,
  /migrations\//, /alembic\//,
  /test_.*\.py$/, /.*_test\.py$/, /conftest\.py$/,
  /\/tests\//, /CLAUDE\.md$/,
  // 아키텍처 면제
  /__init__\.py$/, /_config\.py$/, /config\.py$/,
  /settings\.py$/, /manage\.py$/,
];

// ============================================================
// 공통 면제 (모든 스택)
// ============================================================
const COMMON_EXEMPT_PATTERNS = [
  /\.json$/, /\.yaml$/, /\.yml$/, /\.md$/, /\.sql$/, /\.css$/,
  /\.gitignore$/, /\.env/, /CLAUDE\.md$/,
  // copy Feature 시각적 작업 면제: CSS/SCSS/스타일 관련 파일
  /\.scss$/, /\.sass$/, /\.less$/, /\.styl$/,
  /\.module\.css$/, /\.module\.scss$/,
];

function detectStack(filePath) {
  if (filePath.endsWith(".java")) return "java";
  if (filePath.endsWith(".py")) return "python";
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) return "typescript";
  return null;
}

function isExempt(filePath, stack) {
  if (COMMON_EXEMPT_PATTERNS.some((p) => p.test(filePath))) return true;

  switch (stack) {
    case "typescript":
      return TS_EXEMPT_PATTERNS.some((p) => p.test(filePath));
    case "java":
      return JAVA_EXEMPT_PATTERNS.some((p) => p.test(filePath));
    case "python":
      return PYTHON_EXEMPT_PATTERNS.some((p) => p.test(filePath));
    default:
      return false;
  }
}

// ============================================================
// TypeScript: 테스트 파일 검색 (기존 로직)
// ============================================================
function findTestFileTS(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  const testExtensions = [`.test${ext}`, `.spec${ext}`];
  if (ext === ".tsx") {
    testExtensions.push(".test.ts", ".spec.ts");
  }
  const uniqueExts = [...new Set(testExtensions)];

  for (const testExt of uniqueExts) {
    // 1. __tests__/ 디렉토리
    const testInDir = path.join(dir, "__tests__", `${base}${testExt}`);
    if (fs.existsSync(testInDir)) return testInDir;

    // 2. 형제 테스트 파일
    const siblingTest = path.join(dir, `${base}${testExt}`);
    if (fs.existsSync(siblingTest)) return siblingTest;
  }

  // 3. packages/*/test/ 디렉토리 (재귀 탐색)
  const pkgRoot = findProjectRoot(dir, "package.json");
  if (pkgRoot) {
    const pkgTestDir = path.join(pkgRoot, "test");
    for (const testExt of uniqueExts) {
      const found = searchRecursive(pkgTestDir, `${base}${testExt}`);
      if (found) return found;
    }
  }

  return null;
}

// ============================================================
// Java: 테스트 파일 검색
// src/main/java/com/example/Foo.java → src/test/java/com/example/FooTest.java
// ============================================================
function findTestFileJava(filePath) {
  const base = path.basename(filePath, ".java");

  // 1. src/main → src/test 미러링
  if (filePath.includes(path.join("src", "main", "java"))) {
    const testPath = filePath
      .replace(path.join("src", "main", "java"), path.join("src", "test", "java"))
      .replace(`${base}.java`, `${base}Test.java`);
    if (fs.existsSync(testPath)) return testPath;
  }

  // 2. 같은 디렉토리에 Test 파일
  const dir = path.dirname(filePath);
  const siblingTest = path.join(dir, `${base}Test.java`);
  if (fs.existsSync(siblingTest)) return siblingTest;

  // 3. 프로젝트 루트의 src/test/ 재귀 탐색
  const projectRoot = findProjectRoot(dir, "build.gradle.kts") || findProjectRoot(dir, "build.gradle");
  if (projectRoot) {
    const testDir = path.join(projectRoot, "src", "test");
    const found = searchRecursive(testDir, `${base}Test.java`);
    if (found) return found;
  }

  return null;
}

// ============================================================
// Python: 테스트 파일 검색
// core/src/myapp_core/order.py → core/tests/test_order.py
// ============================================================
function findTestFilePython(filePath) {
  const base = path.basename(filePath, ".py");

  // 1. tests/ 디렉토리에서 test_{base}.py
  const dir = path.dirname(filePath);
  const testsDir = path.join(dir, "tests");
  const testFile1 = path.join(testsDir, `test_${base}.py`);
  if (fs.existsSync(testFile1)) return testFile1;

  // 2. 형제 test_{base}.py
  const siblingTest = path.join(dir, `test_${base}.py`);
  if (fs.existsSync(siblingTest)) return siblingTest;

  // 3. 프로젝트 루트의 tests/ 재귀 탐색
  const projectRoot = findProjectRoot(dir, "pyproject.toml");
  if (projectRoot) {
    const rootTestDir = path.join(projectRoot, "tests");
    const found = searchRecursive(rootTestDir, `test_${base}.py`);
    if (found) return found;
  }

  return null;
}

// ============================================================
// 공통 유틸리티
// ============================================================
function findProjectRoot(dir, marker) {
  let current = path.resolve(dir);
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, marker))) return current;
    current = path.dirname(current);
  }
  return null;
}

function searchRecursive(dir, fileName) {
  if (!fs.existsSync(dir)) return null;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === fileName) return fullPath;
      if (entry.isDirectory()) {
        const found = searchRecursive(fullPath, fileName);
        if (found) return found;
      }
    }
  } catch { /* ignore */ }
  return null;
}

function getExpectedTestPath(base, stack) {
  switch (stack) {
    case "typescript":
      return `__tests__/${base}.test.ts`;
    case "java":
      return `src/test/java/.../${base}Test.java`;
    case "python":
      return `tests/test_${base}.py`;
    default:
      return `(unknown stack)`;
  }
}

// ============================================================
// 메인
// ============================================================
async function main() {
  const input = await new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => {
      try { resolve(JSON.parse(data)); }
      catch { resolve({}); }
    });
  });

  const { tool_name, tool_input } = input;

  // Edit, Write 도구만 검사
  if (!["Edit", "Write"].includes(tool_name)) process.exit(0);

  const filePath = tool_input?.file_path;
  if (!filePath) process.exit(0);

  // 스택 감지
  const stack = detectStack(filePath);
  if (!stack) process.exit(0); // 지원하지 않는 파일 확장자

  // 면제 파일 스킵
  if (isExempt(filePath, stack)) process.exit(0);

  // 스택별 테스트 파일 검색
  let testFile = null;
  switch (stack) {
    case "typescript":
      testFile = findTestFileTS(filePath);
      break;
    case "java":
      testFile = findTestFileJava(filePath);
      break;
    case "python":
      testFile = findTestFilePython(filePath);
      break;
  }

  if (!testFile) {
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const expected = getExpectedTestPath(base, stack);
    console.error(`\n${"=".repeat(50)}`);
    console.error(`[TDD Guard] BLOCKED: 테스트 파일 없음 (${stack})`);
    console.error(`${"=".repeat(50)}`);
    console.error(`  파일: ${filePath}`);
    console.error(`  예상: ${expected}`);
    console.error(`  -> 테스트를 먼저 작성하세요 (Red-Green-Refactor)`);
    console.error(`${"=".repeat(50)}\n`);
    process.exit(2); // BLOCKING!
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(`[tdd-guard] Error: ${err.message}`);
  process.exit(0); // 훅 자체 오류 시에는 통과
});
