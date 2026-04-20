/**
 * agent-completion-cache-invalidate.js — SubagentStop 훅
 * 서브에이전트가 파일을 수정했을 가능성이 있을 때 메인 세션에 경고를 출력한다.
 * 메인이 Edit를 시도할 때 "File has not been read yet" 에러가 나는 경우를 줄이는 것이 목적.
 * 차단하지 않음 (항상 exit 0).
 *
 * 관련 백로그: IMP-KIT-005
 * 안티패턴: Read 캐시 미인증 (dash-preview-phase3 타임라인 #16)
 *
 * Codex fallback artifact: src/claude/core/skills/agent-completion-cache-invalidate/SKILL.md
 *   Codex runtime은 SubagentStop 훅을 지원하지 않을 수 있으므로 동일 의도를
 *   runtime-independent skill로 보존한다.
 *
 * 분류 원천:
 *   read-only/write-capable은 각 에이전트 파일의 `tools:` 필드를 SSOT로 한다
 *   (Write/Edit 보유 시 write-capable). Role 서술이 아닌 실제 능력 기반 분류.
 *
 * Read-only 에이전트 (본 배열에 exact-match되는 이름, 경고 생략):
 *   - dev-architect, dev-code-reviewer       (dev 도메인 분석/리뷰 전용)
 *   - plan-reviewer                          (plan 도메인 PCC 전용)
 *   - copy-fidelity, copy-interaction-fidelity, copy-qa-reviewer  (copy 도메인 리뷰 전용)
 *   - Explore, Plan                          (Claude Code 기본 read-only 에이전트)
 *
 * Write-capable 에이전트 (본 배열에 없는 모든 에이전트는 write-capable로 가정):
 *   - dev-doc-updater, dev-security-reviewer, dev-database-reviewer, dev-verify-agent
 *   - plan-idea-collector, plan-idea-screener, plan-prd-writer
 *   - plan-stitch-integrator, plan-wireframe-designer
 *   - copy-reference-baseline
 *   - general-purpose, dev-doc-updater 등
 *
 * Dedup: session_id + agent_type 조합 tmpdir 마커로 동일 세션 내 동일 에이전트 반복
 *   호출 시 경고 noise를 억제 (session-wrap-suggest 패턴 준용).
 *
 * 정책:
 * - read-only 에이전트 → 알림 생략
 * - write-capable 에이전트 → "Edit 전 Read 재호출 권장" systemMessage 출력
 * - exact equality 매칭 (부분 문자열 매칭 금지, false positive/negative 방지)
 * - fail-open: 훅 크래시 시 exit 0 (세션 보호)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const READ_ONLY_AGENTS = new Set([
  'dev-architect',
  'dev-code-reviewer',
  'plan-reviewer',
  'copy-fidelity',
  'copy-interaction-fidelity',
  'copy-qa-reviewer',
  'Explore',
  'Plan',
]);

function isReadOnlyAgent(name) {
  if (!name) return false;
  return READ_ONLY_AGENTS.has(name);
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
      const subagentType =
        data.subagent_type ||
        data.agent_name ||
        data.agent_type ||
        '';
      const sessionId = data.session_id || process.env.CLAUDE_SESSION_ID || '';

      if (!subagentType) {
        process.exit(0);
      }

      if (isReadOnlyAgent(subagentType)) {
        process.exit(0);
      }

      // Dedup: same session + same agent_type → 1회만 경고
      if (sessionId) {
        const markerFile = path.join(
          os.tmpdir(),
          `cache-invalidate-${sessionId}-${subagentType}`,
        );
        if (fs.existsSync(markerFile)) {
          process.exit(0);
        }
        try {
          fs.writeFileSync(markerFile, '1');
        } catch {
          // ignore marker errors
        }
      }

      const response = {
        continue: true,
        systemMessage:
          `[Read Cache] 서브에이전트 "${subagentType}" 완료. ` +
          `에이전트가 수정했을 가능성이 있는 파일을 메인이 편집할 경우 ` +
          `Edit 전 Read를 재호출하십시오 — "File has not been read yet" 에러 방지.`,
      };

      process.stdout.write(JSON.stringify(response));
    } catch {
      // fail-open: hook errors never block session
    }
    process.exit(0);
  });
}

main();
