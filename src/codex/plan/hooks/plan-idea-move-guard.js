// kit-convert generated: 2026-04-24
'use strict';
/**
 * plan-idea-move-guard.js — IMP-KIT-009 IDEA 파일 이동 화이트리스트 가드
 *
 * Event: PreToolUse (Bash matcher)
 * Action: mv 명령이 .plans/ideas/ 내부 허용된 폴더 간 이동인지 검증.
 *   - 허용: 00-inbox/10-screening/20-approved/30-on-hold 4개 폴더 간 이동
 *   - 거부: 외부 경로, rm, cp 등 비-mv 파괴적 명령
 *   - 무관: ideas 밖 Bash 커맨드 (skipped=true)
 *
 * Claude peer/Codex sibling: src/codex/plan/hooks/plan-idea-move-guard.js
 * 경로 상수: src/claude/plan/_constants/idea-folders.json
 * 스펙: docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-009-screener-file-move.md
  *
 * Codex 등록 포맷:
 *   .codex/hooks.json: { type: "command", command: "./hooks/plan-idea-move-guard.js" }
 *
 * Codex hooks 공식 제약 (2026-04 기준):
 *   - hooks는 experimental 기능
 *   - PreToolUse/PostToolUse matcher: 공식 문서상 Bash 범위가 핵심.
 *   - Stop event: runtime 상태 파일 의존 hook은 skill/command fallback 필요.
 *   - Windows: 현재 비활성화.
 *
 * Claude sibling: src/claude/plan/hooks/plan-idea-move-guard.js
 */

const ALLOWED_FOLDERS = ['00-inbox', '10-screening', '20-approved', '30-on-hold'];
const BASE_PATH = '.plans/ideas';

/**
 * 커맨드가 IDEA 폴더 이동 명령인지 판정.
 * @param {string} command
 * @returns {boolean}
 */
function isIdeaMoveCommand(command) {
  if (!command || typeof command !== 'string') return false;
  // mv 명령 + .plans/ideas 참조 (src 또는 dst 중 하나라도)
  const trimmed = command.trim();
  if (!trimmed.startsWith('mv ') && !trimmed.startsWith('mv\t')) return false;
  return trimmed.includes('.plans/ideas') || trimmed.includes('.plans\\ideas');
}

/**
 * mv 명령에서 src, dst 경로 파싱 (단순 split, 공백 구분 + 옵션 플래그 건너뛰기).
 * @param {string} command
 * @returns {{src: string, dst: string}|null}
 */
function parseMvCommand(command) {
  const parts = command.trim().split(/\s+/).filter(p => p && !p.startsWith('-'));
  if (parts.length < 3 || parts[0] !== 'mv') return null;
  return { src: parts[1], dst: parts[parts.length - 1] };
}

/**
 * 경로가 허용된 폴더 내부에 있는지 검증.
 * @param {string} p
 * @returns {string|null} 매칭된 폴더명 또는 null
 */
function matchedFolder(p) {
  if (!p) return null;
  const normalized = p.replace(/\\/g, '/');
  for (const folder of ALLOWED_FOLDERS) {
    if (normalized.includes(BASE_PATH + '/' + folder + '/')) return folder;
  }
  return null;
}

/**
 * 가드 결정 로직 (순수 함수).
 * @param {object} [input]
 * @param {string} [input.command]
 * @returns {{allowed: boolean, skipped?: boolean, reason?: string}}
 */
function decideMoveGuard(input) {
  const command = (input && input.command) || '';
  if (!command) {
    return { allowed: true, skipped: true };
  }

  // 비-IDEA 관련 Bash → skipped
  if (!isIdeaMoveCommand(command)) {
    // rm/cp가 .plans/ideas 내부를 건드리면 거부 (isIdeaMoveCommand는 mv만 true)
    const trimmed = command.trim();
    if ((trimmed.startsWith('rm ') || trimmed.startsWith('cp ')) &&
        (trimmed.includes('.plans/ideas') || trimmed.includes('.plans\\ideas'))) {
      return {
        allowed: false,
        reason: '허용되지 않은 커맨드: .plans/ideas 내 rm/cp 차단 (이동만 허용)'
      };
    }
    return { allowed: true, skipped: true };
  }

  // mv 파싱
  const parsed = parseMvCommand(command);
  if (!parsed) {
    return { allowed: false, reason: 'mv 구문 파싱 실패' };
  }

  const srcFolder = matchedFolder(parsed.src);
  const dstFolder = matchedFolder(parsed.dst);

  if (!srcFolder || !dstFolder) {
    return {
      allowed: false,
      reason: '허용되지 않은 경로. src/dst 모두 ' + BASE_PATH + '/{' + ALLOWED_FOLDERS.join('|') + '}/ 내부여야 합니다.'
    };
  }

  return { allowed: true };
}

module.exports = {
  decideMoveGuard,
  isIdeaMoveCommand,
  parseMvCommand,
  matchedFolder,
  ALLOWED_FOLDERS,
  BASE_PATH
};
