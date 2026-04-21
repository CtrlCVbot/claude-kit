'use strict';
/**
 * plan-idea-move-guard.js — IMP-KIT-009 (Codex sibling)
 * Claude peer: src/claude/plan/hooks/plan-idea-move-guard.js (동일 로직)
 */

const ALLOWED_FOLDERS = ['00-inbox', '10-screening', '20-approved', '30-on-hold'];
const BASE_PATH = '.plans/ideas';

function isIdeaMoveCommand(command) {
  if (!command || typeof command !== 'string') return false;
  const trimmed = command.trim();
  if (!trimmed.startsWith('mv ') && !trimmed.startsWith('mv\t')) return false;
  return trimmed.includes('.plans/ideas') || trimmed.includes('.plans\\ideas');
}

function parseMvCommand(command) {
  const parts = command.trim().split(/\s+/).filter(p => p && !p.startsWith('-'));
  if (parts.length < 3 || parts[0] !== 'mv') return null;
  return { src: parts[1], dst: parts[parts.length - 1] };
}

function matchedFolder(p) {
  if (!p) return null;
  const normalized = p.replace(/\\/g, '/');
  for (const folder of ALLOWED_FOLDERS) {
    if (normalized.includes(BASE_PATH + '/' + folder + '/')) return folder;
  }
  return null;
}

function decideMoveGuard(input) {
  const command = (input && input.command) || '';
  if (!command) return { allowed: true, skipped: true };

  if (!isIdeaMoveCommand(command)) {
    const trimmed = command.trim();
    if ((trimmed.startsWith('rm ') || trimmed.startsWith('cp ')) &&
        (trimmed.includes('.plans/ideas') || trimmed.includes('.plans\\ideas'))) {
      return {
        allowed: false,
        reason: '허용되지 않은 커맨드: .plans/ideas 내 rm/cp 차단'
      };
    }
    return { allowed: true, skipped: true };
  }

  const parsed = parseMvCommand(command);
  if (!parsed) return { allowed: false, reason: 'mv 구문 파싱 실패' };

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
