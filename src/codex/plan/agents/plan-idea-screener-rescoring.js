'use strict';
/**
 * plan-idea-screener-rescoring.js — IMP-KIT-008 재판정 메모리 유틸 (Codex sibling)
 * Claude peer: src/claude/plan/agents/plan-idea-screener-rescoring.js (동일 로직)
 */

function shouldRecord(prev, cur) {
  if (!prev || !cur) return false;
  const prevStatus = String(prev.status || '').toLowerCase();
  const curStatus = String(cur.status || '').toLowerCase();
  return ['hold', 'kill'].includes(prevStatus) && curStatus === 'go';
}

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
