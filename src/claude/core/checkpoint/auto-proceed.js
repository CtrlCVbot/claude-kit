'use strict';
/**
 * auto-proceed.js — IMP-KIT-016 Checkpoint 자동 진행 유틸
 *
 * Claude Code의 "Human Checkpoint" 패턴에 적용되는 결정 로직.
 * --auto-proceed-on-pass 플래그가 true이고 리뷰 결과가 PASS이면 사용자 프롬프트 없이 진행.
 * 단, Critical 화이트리스트 타입은 플래그 무시하고 항상 정지.
 *
 * Claude peer/Codex sibling 동일 로직: src/codex/core/checkpoint/auto-proceed.js
 * 정책 문서: src/claude/core/rules/checkpoint-policy.md
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md
 */

const path = require('path');
const fs = require('fs');

/**
 * Critical 화이트리스트 (플래그 무시, 항상 정지).
 * 상세: src/claude/core/_constants/critical-checkpoints.json
 */
const CRITICAL_WHITELIST = [
  'destructive',
  'external-api-call',
  'breaking-change',
  'initial-approval-gate'
];

/**
 * type이 Critical 화이트리스트에 포함되는지 검사.
 * @param {string|null|undefined} type
 * @returns {boolean}
 */
function isCritical(type) {
  if (!type || typeof type !== 'string') return false;
  return CRITICAL_WHITELIST.includes(type);
}

/**
 * Checkpoint 결정 로직 (순수 함수).
 * @param {object} [input]
 * @param {string} [input.type] Checkpoint 타입 (review-approval, destructive 등)
 * @param {string} [input.reviewResult] 리뷰 결과 (PASS | FAIL | UNKNOWN)
 * @param {boolean} [input.autoProceedOnPass] 자동 진행 플래그
 * @returns {{action: 'proceed'|'halt', userPromptRequired: boolean, reason?: string}}
 */
function decideCheckpoint(input) {
  const opts = input || {};
  const type = opts.type;
  const reviewResult = opts.reviewResult;
  const autoProceedOnPass = !!opts.autoProceedOnPass;

  // Critical 화이트리스트는 플래그 무관 항상 halt
  if (isCritical(type)) {
    return {
      action: 'halt',
      userPromptRequired: true,
      reason: 'critical-whitelist: ' + type
    };
  }

  // 플래그 false면 항상 halt (기존 동작)
  if (!autoProceedOnPass) {
    return { action: 'halt', userPromptRequired: true };
  }

  // 플래그 true + PASS → proceed
  if (reviewResult === 'PASS') {
    return { action: 'proceed', userPromptRequired: false };
  }

  // FAIL / UNKNOWN / 미지정 → halt (안전)
  return {
    action: 'halt',
    userPromptRequired: true,
    reason: 'reviewResult=' + (reviewResult || 'UNKNOWN')
  };
}

/**
 * 화이트리스트를 JSON 파일에서 로드 (선택적, 런타임 갱신용).
 * 파일 부재 시 상단 상수로 폴백.
 * @returns {string[]}
 */
function loadCriticalWhitelist() {
  try {
    const jsonPath = path.resolve(__dirname, '..', '_constants', 'critical-checkpoints.json');
    if (!fs.existsSync(jsonPath)) return CRITICAL_WHITELIST;
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const types = Array.isArray(data.whitelist)
      ? data.whitelist.map(e => e && e.type).filter(Boolean)
      : [];
    return types.length ? types : CRITICAL_WHITELIST;
  } catch {
    return CRITICAL_WHITELIST;
  }
}

module.exports = {
  decideCheckpoint,
  isCritical,
  loadCriticalWhitelist,
  CRITICAL_WHITELIST
};
