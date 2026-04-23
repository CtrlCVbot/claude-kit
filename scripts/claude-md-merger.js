/**
 * claude-md-merger.js
 * 기존 CLAUDE.md에 kit-managed 섹션을 병합한다.
 *
 * 전략:
 *   1. 마커(`<!-- kit:managed:start -->` ~ `<!-- kit:managed:end -->`)가 있으면
 *      → 마커 사이 내부만 새 managed body로 교체.
 *   2. 마커가 없으면 (legacy CLAUDE.md)
 *      → 파일 끝의 레거시 `# currentDate` 블록을 제거한 뒤 파일 끝에 마커와 함께 append.
 *
 * 사용법:
 *   const { mergeClaudeMd, MANAGED_START, MANAGED_END } = require('./claude-md-merger');
 *   const next = mergeClaudeMd(existingContent, managedBody);
 */

'use strict';

const MANAGED_START = '<!-- kit:managed:start -->';
const MANAGED_END   = '<!-- kit:managed:end -->';

/**
 * @param {string} existing - 기존 CLAUDE.md 전체 텍스트
 * @param {string} managedBody - renderer가 반환한 managed 섹션 내용 (마커 없음)
 * @returns {string} 병합된 CLAUDE.md 전체 텍스트
 */
function mergeClaudeMd(existing, managedBody) {
  const wrapped = `${MANAGED_START}\n${managedBody}\n${MANAGED_END}`;

  if (typeof existing !== 'string' || existing.length === 0) {
    return wrapped + '\n';
  }

  const startIdx = existing.indexOf(MANAGED_START);
  const endIdx   = existing.indexOf(MANAGED_END);

  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    const before = existing.slice(0, startIdx).replace(/\s+$/, '');
    const after  = existing.slice(endIdx + MANAGED_END.length).replace(/^\s+/, '');
    const head = before.length > 0 ? `${before}\n\n` : '';
    const tail = after.length  > 0 ? `\n\n${after}` : '';
    return `${head}${wrapped}${tail}`.replace(/\s+$/, '') + '\n';
  }

  const stripped = stripLegacyCurrentDate(existing).replace(/\s+$/, '');
  const head = stripped.length > 0 ? `${stripped}\n\n` : '';
  return `${head}${wrapped}\n`;
}

/**
 * 레거시 CLAUDE.md 말미의 `# currentDate\nToday's date is ...` 블록을 제거한다.
 * 파일 끝에만 있을 때 한 번 제거. 중간에 있으면 사용자 의도로 간주하여 건드리지 않는다.
 */
function stripLegacyCurrentDate(content) {
  const pattern = /\n+#\s*(?:currentDate|Current Date)\s*\nToday's date is [^\n]*\.?\s*$/;
  return content.replace(pattern, '');
}

module.exports = {
  mergeClaudeMd,
  stripLegacyCurrentDate,
  MANAGED_START,
  MANAGED_END
};
