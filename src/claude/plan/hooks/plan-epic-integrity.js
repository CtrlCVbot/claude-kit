'use strict';
/**
 * plan-epic-integrity.js — v2.4.0 Phase 2 Step 6 (P2-F)
 *
 * Event: PostToolUse (Edit/Write matcher on .plans/epics/ and .plans/features/)
 * Action: Epic ↔ Feature binding cross-reference 검증 (FLAG only, BLOCK 하지 않음)
 * Default: disabled (Phase 2 기본). Phase 3 에서 enable 전환.
 *
 * 스펙: docs/plan/kit-2.4.0-roadmap/03-kit-반영-포인트.md §8-1
 * SSOT: src/claude/plan/rules/plan-epic-hierarchy.md §8
 * Claude peer/Codex sibling: src/codex/plan/hooks/plan-epic-integrity.js (Phase 3 동기화)
 *
 * 순수 함수 설계 — 파일 시스템 I/O 는 caller 책임. 본 모듈은 경로 매칭 + 파싱 + 불일치 탐지만 담당.
 */

const EPIC_BINDING_PATH_REGEX = /\.plans[/\\]features[/\\]active[/\\][^/\\]+[/\\]00-context[/\\]08-epic-binding\.md$/;
const EPIC_CHILDREN_PATH_REGEX = /\.plans[/\\]epics[/\\][^/\\]+[/\\]EPIC-[^/\\]+[/\\]01-children-features\.md$/;
const EPIC_BRIEF_PATH_REGEX = /\.plans[/\\]epics[/\\][^/\\]+[/\\]EPIC-[^/\\]+[/\\]00-epic-brief\.md$/;

const EPIC_ID_REGEX = /EPIC-\d{8}-\d{3}/;
const IDEA_ID_REGEX = /IDEA-\d{8}-\d{3}/g;
const FEATURE_HEADER_REGEX = /^###\s+F\d+\s+[-—]\s+(.+?)$/gm;
const BINDING_TITLE_REGEX = /^#\s+Epic Binding:\s*([^\n]+)/m;

/**
 * filePath 가 Epic integrity 검증 대상인지 판정.
 * @param {string} filePath
 * @returns {boolean}
 */
function isEpicRelated(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  return EPIC_BINDING_PATH_REGEX.test(filePath) ||
    EPIC_CHILDREN_PATH_REGEX.test(filePath) ||
    EPIC_BRIEF_PATH_REGEX.test(filePath);
}

/**
 * 08-epic-binding.md 내용에서 Epic ID 와 Feature slug 추출.
 * @param {string} content
 * @returns {{epicId: string, featureSlug: string|null}|null}
 */
function parseEpicBinding(content) {
  if (!content || typeof content !== 'string') return null;
  const idMatch = content.match(EPIC_ID_REGEX);
  if (!idMatch) return null;
  const titleMatch = content.match(BINDING_TITLE_REGEX);
  return {
    epicId: idMatch[0],
    featureSlug: titleMatch ? titleMatch[1].trim() : null
  };
}

/**
 * 01-children-features.md 내용에서 자식 Feature 목록 추출.
 * F{N} 헤더 우선, 없으면 IDEA ID 기반.
 * @param {string} content
 * @returns {Array<{slug?: string, ideaId?: string}>}
 */
function parseChildrenFeatures(content) {
  if (!content || typeof content !== 'string') return [];
  const features = [];
  const headerRegex = new RegExp(FEATURE_HEADER_REGEX.source, FEATURE_HEADER_REGEX.flags);
  let match;
  while ((match = headerRegex.exec(content)) !== null) {
    features.push({ slug: match[1].trim() });
  }
  if (features.length > 0) return features;

  const ideaIds = content.match(IDEA_ID_REGEX);
  if (ideaIds && ideaIds.length > 0) {
    return ideaIds.map(id => ({ ideaId: id }));
  }
  return [];
}

/**
 * bindings 와 epicChildrenMap 간 불일치 탐지.
 * @param {Array<{featureSlug: string, epicId: string}>} bindings
 * @param {Record<string, Array<{slug?: string, ideaId?: string}>>} epicChildrenMap
 * @returns {string[]} 경고 메시지 배열 (빈 배열이면 일치)
 */
function detectBindingMismatch(bindings, epicChildrenMap) {
  const warnings = [];
  const safeBindings = Array.isArray(bindings) ? bindings : [];
  const safeMap = (epicChildrenMap && typeof epicChildrenMap === 'object') ? epicChildrenMap : {};

  // Case 1: Feature binding 에 Epic 있으나 Epic children 에 Feature 없음
  for (const binding of safeBindings) {
    if (!binding || !binding.featureSlug || !binding.epicId) continue;
    const children = safeMap[binding.epicId] || [];
    const found = children.some(c =>
      (c.slug && c.slug === binding.featureSlug) ||
      (c.featureSlug && c.featureSlug === binding.featureSlug)
    );
    if (!found) {
      warnings.push(
        `Feature '${binding.featureSlug}' is bound to ${binding.epicId} but not listed in Epic's 01-children-features.md`
      );
    }
  }

  // Case 2: Epic children 에 있으나 binding 없음
  for (const [epicId, children] of Object.entries(safeMap)) {
    if (!Array.isArray(children)) continue;
    for (const child of children) {
      if (!child || !child.slug) continue;
      const hasBinding = safeBindings.some(b =>
        b && b.featureSlug === child.slug && b.epicId === epicId
      );
      if (!hasBinding) {
        warnings.push(
          `Epic '${epicId}' lists '${child.slug}' in children but no binding file exists`
        );
      }
    }
  }

  return warnings;
}

/**
 * 통합 가드 결정 로직 (순수 함수).
 * @param {object} [input]
 * @param {string} [input.filePath] — 수정된 파일 경로
 * @param {boolean} [input.enabled=false] — Phase 2 disable 기본, Phase 3 enable
 * @param {Array} [input.bindings] — 리포 전체 binding 집계 (caller 가 수집)
 * @param {object} [input.epicChildrenMap] — 리포 전체 Epic → children 집계
 * @returns {{valid: boolean, warnings?: string[], skipped?: boolean, reason?: string, blocked?: boolean}}
 */
function decideIntegrityGuard(input) {
  input = input || {};
  const { filePath, enabled = false, bindings, epicChildrenMap } = input;

  // Phase 2 기본: disabled
  if (!enabled) {
    return { valid: true, skipped: true, reason: 'disabled' };
  }

  // 경로 필터: 비-Epic 파일은 skip
  if (!isEpicRelated(filePath)) {
    return { valid: true, skipped: true, reason: 'not-epic-related' };
  }

  // 불일치 탐지
  const warnings = detectBindingMismatch(bindings, epicChildrenMap);

  return {
    valid: warnings.length === 0,
    warnings,
    skipped: false,
    // BLOCK 하지 않음 — FLAG only (Phase 3 에서도 경고만)
    blocked: false
  };
}

module.exports = {
  decideIntegrityGuard,
  isEpicRelated,
  parseEpicBinding,
  parseChildrenFeatures,
  detectBindingMismatch,
  EPIC_BINDING_PATH_REGEX,
  EPIC_CHILDREN_PATH_REGEX,
  EPIC_BRIEF_PATH_REGEX
};
