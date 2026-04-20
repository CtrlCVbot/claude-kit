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
 * 정책:
 * - read-only 에이전트(dev-architect, Explore, Plan, dev-verify-agent)는 알림 생략
 * - 그 외 에이전트는 "Edit 전 Read 재호출 권장" systemMessage 출력
 * - systemMessage는 Stop 훅 규약(continue: true, systemMessage: ...)을 따름
 */
'use strict';

const READ_ONLY_AGENTS = [
  'dev-architect',
  'Explore',
  'Plan',
  'dev-verify-agent',
  'dev-code-reviewer',
  'dev-security-reviewer',
  'dev-database-reviewer',
  'plan-reviewer',
];

function isReadOnlyAgent(name) {
  if (!name) return false;
  return READ_ONLY_AGENTS.some((pattern) => name.includes(pattern));
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

      if (!subagentType) {
        process.exit(0);
      }

      if (isReadOnlyAgent(subagentType)) {
        process.exit(0);
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
