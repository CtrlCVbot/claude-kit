'use strict';
/**
 * plan-idea-screener-rescoring.js — IMP-KIT-008 재판정 메모리 유틸
 *
 * 순수 함수 3종 export: shouldRecord / buildRescoringLogEntry / isValidEntry.
 * plan-idea-screener 에이전트가 Hold→Go(또는 Kill→Go) 전환 감지 시 호출하여
 * agent-memory/plan-idea-screener/MEMORY.md의 "재판정 로그" 섹션에 엔트리 append.
 *
 * Claude peer/Codex sibling: src/codex/plan/agents/plan-idea-screener-rescoring.js
 * 스키마: src/claude/plan/_schemas/rescoring-log-entry.schema.json
 * 템플릿: src/claude/plan/_templates/rescoring-log-entry.template.md
 * 스펙: docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-008-screener-memory.md
 */

/**
 * 전환 기록 여부 판정 (Hold/Kill → Go 전환 시 true).
 * @param {{status: string}} prev
 * @param {{status: string}} cur
 * @returns {boolean}
 */
function shouldRecord(prev, cur) {
  if (!prev || !cur) return false;
  const prevStatus = String(prev.status || '').toLowerCase();
  const curStatus = String(cur.status || '').toLowerCase();
  const negative = ['hold', 'kill'];
  return negative.includes(prevStatus) && curStatus === 'go';
}

/**
 * 엔트리 스키마 검증 (필수 필드).
 * @param {object} entry
 * @returns {boolean}
 */
function isValidEntry(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (!entry.ideaId) return false;
  if (!entry.prev || typeof entry.prev.score !== 'number' || !entry.prev.status) return false;
  if (!entry.new || typeof entry.new.score !== 'number' || !entry.new.status) return false;
  if (!entry.rationale) return false;
  return true;
}

function frameworkLabel(fw) {
  if (!fw) return '-';
  return String(fw).toLowerCase() === 'rice' ? 'RICE' : String(fw);
}

function scoreLabel(judgment) {
  const fw = frameworkLabel(judgment.framework);
  const score = judgment.score !== undefined ? judgment.score : '?';
  const date = judgment.date ? ', ' + judgment.date : '';
  return judgment.status + ' (' + fw + ' ' + score + date + ')';
}

/**
 * 재판정 로그 엔트리 markdown 생성.
 * @param {object} params
 * @param {string} params.ideaId
 * @param {string} params.timestamp
 * @param {object} params.prev
 * @param {object} params.new
 * @param {string} params.rationale
 * @returns {string} markdown 엔트리
 */
function buildRescoringLogEntry(params) {
  const p = params || {};
  const prev = p.prev || {};
  const nxt = p.new || {};
  const fwPrev = frameworkLabel(prev.framework);
  const fwNew = frameworkLabel(nxt.framework);

  const lines = [
    '### ' + p.ideaId + ' — ' + (p.timestamp || ''),
    '',
    '- **이전 판정**: ' + scoreLabel(prev),
    '- **신규 판정**: ' + scoreLabel(nxt),
    '- **프레임워크**: ' + fwPrev + ' → ' + fwNew + (fwPrev === fwNew ? ' (동일)' : ' (변경)'),
    '- **전환 사유**: ' + (p.rationale || '')
  ];
  return lines.join('\n');
}

module.exports = {
  shouldRecord,
  buildRescoringLogEntry,
  isValidEntry,
  frameworkLabel,
  scoreLabel
};
