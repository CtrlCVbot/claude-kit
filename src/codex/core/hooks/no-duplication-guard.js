'use strict';
/**
 * no-duplication-guard.js — IMP-KIT-017 재복제 감지 가드 (Codex sibling)
 *
 * Claude peer: src/claude/core/hooks/no-duplication-guard.js (동일 로직)
 * 임계값: src/codex/core/_constants/duplication-threshold.json
 * 원칙: Codex는 AGENTS.md 관리. 공통 원칙은 Claude golden-principles.md §13 참조.
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-017-no-duplication-skill.md
 */

const DEFAULT_THRESHOLD = 0.8;
const DEFAULT_NGRAM_SIZE = 8;

function ngrams(text, n) {
  const set = new Set();
  if (!text || text.length < n) return set;
  for (let i = 0; i <= text.length - n; i++) {
    set.add(text.slice(i, i + n));
  }
  return set;
}

function computeSimilarity(a, b, n) {
  const ngramSize = n || DEFAULT_NGRAM_SIZE;
  const A = ngrams(String(a || '').trim(), ngramSize);
  const B = ngrams(String(b || '').trim(), ngramSize);
  if (A.size === 0 || B.size === 0) return 0;

  let intersect = 0;
  for (const token of A) {
    if (B.has(token)) intersect++;
  }
  const union = A.size + B.size - intersect;
  if (union === 0) return 0;
  return intersect / union;
}

function decideDuplication(input) {
  const opts = input || {};
  const content = opts.content || '';
  const existing = opts.existing || '';
  const threshold = opts.threshold === undefined ? DEFAULT_THRESHOLD : opts.threshold;
  const ngramSize = opts.ngramSize || DEFAULT_NGRAM_SIZE;

  if (!content || !existing) {
    return { isDuplicate: false, similarity: 0 };
  }

  const similarity = computeSimilarity(content, existing, ngramSize);
  const isDuplicate = similarity >= threshold;

  if (isDuplicate) {
    return {
      isDuplicate: true,
      similarity,
      warning:
        '재복제 감지 (유사도 ' + (similarity * 100).toFixed(1) + '%). ' +
        '기존 파일을 경로로 인용하고 본문 복제를 피하세요.'
    };
  }

  return { isDuplicate: false, similarity };
}

module.exports = {
  decideDuplication,
  computeSimilarity,
  ngrams,
  DEFAULT_THRESHOLD,
  DEFAULT_NGRAM_SIZE
};
