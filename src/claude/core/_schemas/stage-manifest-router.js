'use strict';
/**
 * stage-manifest-router.js — IMP-KIT-014 stage-manifest 스키마 거버넌스
 *
 * ajv 기반 런타임 검증 (IMP-KIT-011 거버넌스 원칙 상속).
 * Claude peer/Codex sibling: src/codex/core/_schemas/stage-manifest-router.js
 *
 * 스키마: src/claude/core/_schemas/stage-manifest.schema.json
 * 소비자 등록부: src/claude/core/_registry/stage-manifest-consumers.json
 * 거버넌스 문서: src/claude/dev/rules/edit-coordinates-governance.md (공통 원칙)
 * 스펙: docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-014-stage-manifest-schema-version.md
 */

const Ajv = require('ajv');
const schemaV1 = require('./stage-manifest.schema.json');

const ajv = new Ajv({ allErrors: true, strict: false });
const validatorV1 = ajv.compile(schemaV1);

const SUPPORTED_MAJORS = ['1'];

function extractMajor(version) {
  if (!version || typeof version !== 'string') return '1';
  const match = version.match(/^(\d+)\.\d+/);
  return match ? match[1] : null;
}

/**
 * stage-manifest payload 검증.
 * @param {object} payload
 * @returns {{valid: boolean, errors: Array}}
 */
function validateStageManifest(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['payload is not an object'] };
  }
  const version = payload.schema_version;
  const major = extractMajor(version);
  if (!major || !SUPPORTED_MAJORS.includes(major)) {
    return {
      valid: false,
      errors: ['Unsupported schema_version: ' + (version || 'undefined') +
               '. Supported majors: ' + SUPPORTED_MAJORS.join(', ')]
    };
  }
  const valid = validatorV1(payload);
  return {
    valid: valid === true,
    errors: valid === true ? [] : (validatorV1.errors || [])
  };
}

/**
 * 소비자 등록부의 reads 경로가 schema properties에 존재하는지 검증.
 * @param {Array<{id: string, reads: string[]}>} consumers
 * @returns {{valid: boolean, missingPaths: string[]}}
 */
function checkConsumerPaths(consumers) {
  if (!Array.isArray(consumers)) return { valid: true, missingPaths: [] };
  const schemaProps = Object.keys(schemaV1.properties || {});
  const missingPaths = [];
  for (const consumer of consumers) {
    const reads = Array.isArray(consumer.reads) ? consumer.reads : [];
    for (const path of reads) {
      const topLevel = path.split('.')[0];
      if (!schemaProps.includes(topLevel) && !missingPaths.includes(topLevel)) {
        missingPaths.push(topLevel);
      }
    }
  }
  return {
    valid: missingPaths.length === 0,
    missingPaths
  };
}

module.exports = {
  validateStageManifest,
  checkConsumerPaths,
  extractMajor,
  SUPPORTED_MAJORS
};
