'use strict';
/**
 * no-duplication-guard.js — IMP-KIT-017 문서 재복제 감지 가드
 *
 * 순수 함수 decideDuplication + computeSimilarity export.
 * 훅 등록은 opt-in (~/.claude/settings.json의 "duplicationGuard": true 시 활성).
 *
 * Claude sibling: src/claude/core/hooks/no-duplication-guard.js (동일 로직)
 * kit-convert generated: 2026-04-23
 * 임계값: src/claude/core/_constants/duplication-threshold.json
 * 원칙: src/claude/core/rules/golden-principles.md §13
 * 스펙: docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-017-no-duplication-skill.md
 */

const DEFAULT_THRESHOLD = 0.8;
const DEFAULT_NGRAM_SIZE = 8;

/**
 * 문자 단위 n-gram Set 생성.
 * @param {string} text
 * @param {number} n
 * @returns {Set<string>}
 */
function ngrams(text, n) {
  const set = new Set();
  if (!text || text.length < n) return set;
  for (let i = 0; i <= text.length - n; i++) {
    set.add(text.slice(i, i + n));
  }
  return set;
}

/**
 * Jaccard similarity = |A ∩ B| / |A ∪ B|.
 * 8-gram 기반 문자열 유사도 (0.0 ~ 1.0).
 * @param {string} a
 * @param {string} b
 * @param {number} [n=DEFAULT_NGRAM_SIZE]
 * @returns {number}
 */
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

/**
 * 재복제 감지 결정 로직 (순수 함수).
 * @param {object} [input]
 * @param {string} [input.content] 새로 작성되는 내용
 * @param {string} [input.existing] 기존 파일 내용
 * @param {number} [input.threshold=0.8] 재복제 판정 임계값
 * @param {number} [input.ngramSize=8] n-gram 크기
 * @returns {{isDuplicate: boolean, similarity: number, warning?: string}}
 */
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
        '기존 파일을 경로로 인용하고 본문 복제를 피하세요. ' +
        '(golden-principles §13 재복제 금지 원칙)'
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
