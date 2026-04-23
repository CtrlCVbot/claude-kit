/**
 * agents-md-merger.js
 * 기존 AGENTS.md에 kit-managed 섹션을 병합한다.
 *
 * 전략:
 *   1. 마커(`<!-- kit:managed:start -->` ~ `<!-- kit:managed:end -->`)가 있으면
 *      → 마커 사이 내부만 새 managed body로 교체.
 *   2. 마커가 없으면 (legacy AGENTS.md)
 *      → 파일 끝에 마커와 함께 append. (기존 사용자 편집 보존)
 *
 * claude-md-merger.js 와 동일 패턴. AGENTS.md 는 legacy `# currentDate` 제거
 * 로직이 불필요하므로 그 부분만 차이가 있다.
 *
 * 사용법:
 *   const { mergeAgentsMd, MANAGED_START, MANAGED_END } = require('./agents-md-merger');
 *   const next = mergeAgentsMd(existingContent, managedBody);
 */

'use strict';

const MANAGED_START = '<!-- kit:managed:start -->';
const MANAGED_END   = '<!-- kit:managed:end -->';

/**
 * @param {string} existing - 기존 AGENTS.md 전체 텍스트 (없으면 빈 문자열)
 * @param {string} managedBody - renderer가 반환한 managed 섹션 내용 (마커 없음)
 * @returns {string} 병합된 AGENTS.md 전체 텍스트
 */
function mergeAgentsMd(existing, managedBody) {
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

  const stripped = existing.replace(/\s+$/, '');
  const head = stripped.length > 0 ? `${stripped}\n\n` : '';
  return `${head}${wrapped}\n`;
}

module.exports = {
  mergeAgentsMd,
  MANAGED_START,
  MANAGED_END
};
