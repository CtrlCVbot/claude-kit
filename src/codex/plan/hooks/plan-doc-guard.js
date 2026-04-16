#!/usr/bin/env node
/**
 * Hook: Plan Doc Guard
 * Event: PreToolUse (Edit|Write)
 * Action: BLOCKING (exit 2) -- 기획 문서 구조/형식 검증 + 코드 파일 편집 차단
 *
 * 동작:
 * 1. .plans/ 디렉토리 내 기획 문서 편집 시 필수 섹션 존재 여부 확인
 * 2. 기획 단계에서 src/, packages/, apps/ 코드 파일 편집 차단
 * 3. 면제: .md 외 설정 파일, CLAUDE.md
 *
 * Codex 등록 포맷:
 *   .codex/hooks.json: { type: "command", command: "./hooks/plan-doc-guard.js" }
 *
 * Codex hooks 공식 제약 (2026-04 기준):
 *   - hooks는 experimental 기능
 *   - PreToolUse/PostToolUse matcher: 공식 문서상 Bash 범위가 핵심.
 *     Edit|Write 매처는 Codex runtime에서 동작하지만 공식 보장은 Bash가 우선.
 *   - Stop event: 공식 지원. 단, runtime 상태 파일 의존이 있는 hook은
 *     direct 재현 불가 → skill/command fallback 필요
 *   - Windows: 현재 비활성화. 크로스플랫폼 가정 금지.
 *
 * kit-convert generated: 2026-04-16
 */

const fs = require("fs");
const path = require("path");

// ============================================================
// PRD 필수 섹션
// ============================================================
const PRD_REQUIRED_SECTIONS = [
  "overview",
  "problem",
  "goals",
  "user stories",
  "functional requirements",
  "requirements",
  "ux",
  "technical",
  "milestones",
  "risks",
  "success metrics",
];

// ============================================================
// Wireframe 필수 섹션
// ============================================================
const WIREFRAME_REQUIRED_SECTIONS = [
  "화면 목록",
  "screen",
  "네비게이션",
  "navigation",
  "컴포넌트",
  "component",
];

// ============================================================
// Feature Overview 필수 섹션
// ============================================================
const OVERVIEW_REQUIRED_SECTIONS = [
  "배경",
  "background",
  "범위",
  "scope",
  "요구사항",
  "requirement",
  "검증",
  "verification",
];

// ============================================================
// 코드 파일 차단 패턴 (기획 단계에서 편집 금지)
// ============================================================
const CODE_DIR_PATTERNS = [
  /[/\\]src[/\\]/,
  /[/\\]packages[/\\]/,
  /[/\\]apps[/\\]/,
];

// ============================================================
// 면제 패턴
// ============================================================
const EXEMPT_PATTERNS = [
  /CLAUDE\.md$/i,
  /\.json$/,
  /\.yaml$/,
  /\.yml$/,
  /\.js$/,
  /\.ts$/,
  /\.config\./,
  /package\.json$/,
  /tsconfig/,
];

function isPlanningDocument(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.includes(".plans/") || normalized.includes(".plans\\");
}

function isCodeFile(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return CODE_DIR_PATTERNS.some((p) => p.test(normalized));
}

function isExempt(filePath) {
  return EXEMPT_PATTERNS.some((p) => p.test(filePath));
}

function detectDocType(filePath) {
  const normalized = filePath.toLowerCase().replace(/\\/g, "/");
  const basename = path.basename(normalized);

  if (basename.includes("prd")) return "prd";
  if (basename.includes("wireframe")) return "wireframe";
  if (basename.includes("overview") || basename.includes("first-pass")) return "overview";
  return "other";
}

function checkRequiredSections(content, requiredSections) {
  const contentLower = content.toLowerCase();
  const missing = [];

  for (const section of requiredSections) {
    if (!contentLower.includes(section)) {
      missing.push(section);
    }
  }

  return missing;
}

function validatePlanDoc(filePath, toolInput) {
  const docType = detectDocType(filePath);
  if (docType === "other") return null; // 기본 마크다운은 통과

  // Write 도구의 경우 content를 검사, Edit 도구의 경우 기존 파일 + 변경 내용 검사
  let content = "";

  if (toolInput.content) {
    // Write 도구: 전체 내용이 content에 있음
    content = toolInput.content;
  } else if (toolInput.file_path && fs.existsSync(toolInput.file_path)) {
    // Edit 도구: 기존 파일 읽기
    try {
      content = fs.readFileSync(toolInput.file_path, "utf-8");
    } catch {
      return null; // 파일 읽기 실패 시 통과
    }

    // new_string이 있으면 반영된 결과를 시뮬레이션
    if (toolInput.old_string && toolInput.new_string) {
      content = content.replace(toolInput.old_string, toolInput.new_string);
    }
  } else {
    return null; // 확인 불가 시 통과
  }

  let requiredSections;
  let docTypeName;

  switch (docType) {
    case "prd":
      requiredSections = PRD_REQUIRED_SECTIONS;
      docTypeName = "PRD";
      break;
    case "wireframe":
      requiredSections = WIREFRAME_REQUIRED_SECTIONS;
      docTypeName = "Wireframe";
      break;
    case "overview":
      requiredSections = OVERVIEW_REQUIRED_SECTIONS;
      docTypeName = "Feature Overview";
      break;
    default:
      return null;
  }

  const missing = checkRequiredSections(content, requiredSections);

  // 절반 이상 매칭되면 통과 (유연한 검증 - 한국어/영어 혼용 허용)
  const matchCount = requiredSections.length - missing.length;
  const threshold = Math.ceil(requiredSections.length / 3); // 1/3 이상 매칭

  if (matchCount < threshold) {
    return {
      docType: docTypeName,
      missing,
      matchCount,
      total: requiredSections.length,
    };
  }

  return null;
}

// ============================================================
// 메인
// ============================================================
async function main() {
  const input = await new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });

  const { tool_name, tool_input } = input;

  // Edit, Write 도구만 검사
  if (!["Edit", "Write"].includes(tool_name)) process.exit(0);

  const filePath = tool_input?.file_path;
  if (!filePath) process.exit(0);

  // 면제 파일 확인 (CLAUDE.md, 설정 파일 등)
  if (isExempt(filePath)) process.exit(0);

  // .md 파일이 아닌 경우 통과
  if (!filePath.endsWith(".md")) process.exit(0);

  // 기획 단계에서 코드 파일 편집 차단
  if (isCodeFile(filePath)) {
    console.error(`\n${"=".repeat(50)}`);
    console.error("[Plan Doc Guard] BLOCKED: 기획 단계 코드 편집 금지");
    console.error(`${"=".repeat(50)}`);
    console.error(`  파일: ${filePath}`);
    console.error("  -> 기획 단계에서는 src/, packages/, apps/ 코드를 편집할 수 없습니다.");
    console.error("  -> 기획 파이프라인(P1~P7)을 완료한 후 /dev-feature로 개발을 시작하세요.");
    console.error(`${"=".repeat(50)}\n`);
    process.exit(2); // BLOCKING!
  }

  // .plans/ 디렉토리 내 기획 문서 구조 검증
  if (isPlanningDocument(filePath)) {
    const validationResult = validatePlanDoc(filePath, tool_input);

    if (validationResult) {
      console.error(`\n${"=".repeat(50)}`);
      console.error(`[Plan Doc Guard] BLOCKED: ${validationResult.docType} 필수 섹션 부족`);
      console.error(`${"=".repeat(50)}`);
      console.error(`  파일: ${filePath}`);
      console.error(`  매칭: ${validationResult.matchCount}/${validationResult.total} 섹션`);
      console.error(`  누락 후보: ${validationResult.missing.join(", ")}`);
      console.error(`  -> ${validationResult.docType} 템플릿에 맞게 필수 섹션을 포함하세요.`);
      console.error(`${"=".repeat(50)}\n`);
      process.exit(2); // BLOCKING!
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(`[plan-doc-guard] Error: ${err.message}`);
  process.exit(0); // 훅 자체 오류 시에는 통과
});
