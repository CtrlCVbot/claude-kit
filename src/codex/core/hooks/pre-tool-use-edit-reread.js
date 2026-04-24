// kit-convert generated: 2026-04-24
'use strict';
/**
 * pre-tool-use-edit-reread.js — PreToolUse(Edit|Write) 훅
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-RACE-02.md
 * SSOT: src/claude/core/rules/agent-file-ownership.md (T-RACE-01)
 * 대응: N-03 — 에이전트 완료 후 메인 Edit 시 "File has not been read yet" 에러 반복.
 *
 * 동작:
 *  1. pending-reread.json 조회
 *  2. 현재 세션에 pending 에이전트가 있으면 systemMessage 로 경고 (non-blocking)
 *  3. 경고 후 해당 에이전트 항목 clear (1 회성)
 *
 * 차단하지 않음 (exit 0). Claude Code hook 시스템에서 자동 Read 호출은 불가능하므로
 * 메인 에이전트에게 "Edit 전 Read 재호출" 을 명시적 경고로 유도한다.
 *
 * fail-open: 훅 크래시 시 exit 0 (세션 보호).
  *
 * Codex 등록 포맷:
 *   .codex/hooks.json: { type: "command", command: "./hooks/pre-tool-use-edit-reread.js" }
 *
 * Codex hooks 공식 제약 (2026-04 기준):
 *   - hooks는 experimental 기능
 *   - PreToolUse/PostToolUse matcher: 공식 문서상 Bash 범위가 핵심.
 *   - Stop event: runtime 상태 파일 의존 hook은 skill/command fallback 필요.
 *   - Windows: 현재 비활성화.
 *
 * Claude sibling: src/claude/core/hooks/pre-tool-use-edit-reread.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const state = require('./_read-cache-state.js');

const STATE_FILE = path.join(process.cwd(), '.claude', 'state', 'pending-reread.json');

function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return state.createState();
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    return state.deserialize(raw);
  } catch {
    return state.createState();
  }
}

function saveState(newState) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, state.serialize(newState), 'utf8');
  } catch {
    // fail-open
  }
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    input += chunk;
  });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const sessionId = data.session_id || process.env.CLAUDE_SESSION_ID || '';
      const toolName = data.tool_name || data.tool || '';
      const args = data.tool_args || data.arguments || {};
      const filePath = args.file_path || args.path || '';

      // Edit/Write 이외는 통과
      if (toolName !== 'Edit' && toolName !== 'Write' && toolName !== 'NotebookEdit') {
        process.exit(0);
      }

      if (!sessionId) {
        process.exit(0);
      }

      const currentState = loadState();
      if (!state.hasAnyPending(currentState, sessionId)) {
        process.exit(0);
      }

      // File 별 dedup: 같은 세션에서 같은 파일 경고는 1 회만
      const markerFile = path.join(
        os.tmpdir(),
        `edit-reread-${sessionId}-${Buffer.from(filePath || 'unknown').toString('base64').slice(0, 40)}`,
      );
      if (fs.existsSync(markerFile)) {
        process.exit(0);
      }
      try {
        fs.writeFileSync(markerFile, '1');
      } catch {
        // ignore
      }

      const pendingAgents = state.listPendingAgents(currentState, sessionId);
      const agentList = pendingAgents.map((e) => e.agent).join(', ');

      const response = {
        continue: true,
        systemMessage:
          `[Read Cache] Edit/Write 전 주의 — 다음 서브에이전트가 파일을 수정했을 수 있습니다: ` +
          `${agentList}. ` +
          `대상 파일 "${filePath || '(unknown)'}" 을 아직 이 세션에서 Read 하지 않았다면 ` +
          `Edit 전 Read를 먼저 호출하십시오. ` +
          `(T-RACE-02: pending-reread.json 에서 조회)`,
      };

      // 경고 후 pending 항목 clear (1 회성)
      saveState(state.clearSession(currentState, sessionId));

      process.stdout.write(JSON.stringify(response));
    } catch {
      // fail-open
    }
    process.exit(0);
  });
}

main();
