'use strict';
/**
 * _router.js — IMP-KIT-011 edit-coordinates 스키마 버전 라우터
 *
 * ajv 기반 런타임 검증. schema_version에 따라 적절한 스키마 선택.
 * 1.x: edit-coordinates.schema.json (v1, minor 확장 하위호환)
 * 2.x: 미지원 (별도 $id 스키마 파일로 확장 시 추가)
 *
 * Claude peer/Codex sibling: src/codex/dev/_schemas/_router.js
 * 거버넌스 문서: src/claude/dev/rules/edit-coordinates-governance.md
 * 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-011-architect-schema.md
 */

const Ajv2020 = require('ajv/dist/2020');
const schemaV1 = require('./edit-coordinates.schema.json');

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validatorV1 = ajv.compile(schemaV1);

const SUPPORTED_MAJORS = ['1'];

/**
 * schema_version 문자열에서 major 버전 추출.
 * @param {string|undefined} version
 * @returns {string|null}
 */
function extractMajor(version) {
  if (!version || typeof version !== 'string') return '1'; // 기본값
  const match = version.match(/^(\d+)\.\d+/);
  return match ? match[1] : null;
}

/**
 * 버전에 맞는 validator 함수 반환.
 * @param {string} [version]
 * @returns {Function|null}
 */
function getValidator(version) {
  const major = extractMajor(version);
  if (!major || !SUPPORTED_MAJORS.includes(major)) return null;
  if (major === '1') return validatorV1;
  return null;
}

/**
 * payload 검증.
 * @param {object} payload
 * @returns {{valid: boolean, errors: Array<string|object>}}
 */
function validate(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['payload is not an object'] };
  }

  const version = payload.schema_version;
  const validator = getValidator(version);

  if (!validator) {
    return {
      valid: false,
      errors: ['Unsupported schema_version: ' + (version || 'undefined') +
               '. Supported majors: ' + SUPPORTED_MAJORS.join(', ')]
    };
  }

  const valid = validator(payload);
  return {
    valid: valid === true,
    errors: valid === true ? [] : (validator.errors || [])
  };
}

module.exports = {
  validate,
  getValidator,
  extractMajor,
  SUPPORTED_MAJORS
};
