'use strict';
/**
 * post-edit-history.js — PostToolUse(Edit|Write) 훅 stub (T-BKLG-01, Backlog)
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-BKLG-01.md
 * Core: _change-history-core.js (순수 함수, 20 테스트 PASS)
 * 대응: I-18 (Low), N-18 — 변경 이력 수동 append 누락·granularity 불일치.
 *
 * **활성화 조건** (T-BKLG-01):
 *  - UX 합의: 사용자에게 자동 요청 vs 에이전트 자동 감지 (Option A~D 중 선택)
 *  - 현재 기본값: `CLAUDE_ENABLE_POST_EDIT_HISTORY=1` 환경변수 지정 시에만 동작
 *  - v2.6.0+ 에서 활성화 고려 (합의 완료 시)
 *
 * 동작 (활성화 시):
 *  1. Edit|Write on .md 파일만 처리
 *  2. `## N. 변경 이력` 표 자동 감지
 *  3. 오늘 날짜 중복 체크 (idempotency)
 *  4. 요약 수집 (현재 stub — Option D 합의 후 구현)
 *  5. 행 append
 *
 * fail-open: 훅 크래시 시 exit 0 (세션 보호).
 * 현재는 **logging only** — 실제 write 는 비활성.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const core = require('./_change-history-core.js');

const LOG_FILE = path.join(os.homedir(), '.claude', 'logs', 'change-history.jsonl');

function logEvent(event) {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(LOG_FILE, JSON.stringify(event) + '\n', 'utf8');
  } catch {
    // fail-open
  }
}

function isEnabled() {
  return process.env.CLAUDE_ENABLE_POST_EDIT_HISTORY === '1';
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    input += chunk;
  });
  process.stdin.on('end', () => {
    try {
      // 활성화 조건 미충족 → 조용히 종료
      if (!isEnabled()) {
        process.exit(0);
      }

      const data = JSON.parse(input || '{}');
      const toolName = data.tool_name || data.tool || '';
      const args = data.tool_args || data.arguments || {};
      const filePath = args.file_path || args.path || '';

      if (toolName !== 'Edit' && toolName !== 'Write') {
        process.exit(0);
      }
      if (!filePath.endsWith('.md')) {
        process.exit(0);
      }

      if (!fs.existsSync(filePath)) {
        process.exit(0);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const section = core.detectChangeLogSection(content);
      if (!section.found) {
        process.exit(0);
      }

      // 요약 수집 - Option D (에이전트 추론 + batch 확인) 미구현
      // 현재는 logging only
      logEvent({
        timestamp: new Date().toISOString(),
        event: 'detected-but-skipped',
        file: filePath,
        section_number: section.sectionNumber,
        reason: 'ux-agreement-pending',
        note: 'T-BKLG-01 active — core module ready, hook write disabled until UX agreed.',
      });

      // Write disabled until activation
      // const result = core.appendRowToContent(content, {
      //   date: core.today(),
      //   summary,
      //   author: 'Claude',
      // });
      // if (result.changed) fs.writeFileSync(filePath, result.content, 'utf8');
    } catch (err) {
      logEvent({
        timestamp: new Date().toISOString(),
        event: 'error',
        error: err && err.message ? err.message : String(err),
      });
    }
    process.exit(0);
  });
}

// 테스트용 내부 export
module.exports = {
  isEnabled,
  LOG_FILE,
};

if (require.main === module) {
  main();
}
