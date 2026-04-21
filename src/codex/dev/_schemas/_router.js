'use strict';
/**
 * _router.js — IMP-KIT-011 edit-coordinates 스키마 버전 라우터 (Codex sibling)
 * Claude peer: src/claude/dev/_schemas/_router.js (동일 로직)
 */

const Ajv2020 = require('ajv/dist/2020');
const schemaV1 = require('./edit-coordinates.schema.json');

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validatorV1 = ajv.compile(schemaV1);

const SUPPORTED_MAJORS = ['1'];

function extractMajor(version) {
  if (!version || typeof version !== 'string') return '1';
  const match = version.match(/^(\d+)\.\d+/);
  return match ? match[1] : null;
}

function getValidator(version) {
  const major = extractMajor(version);
  if (!major || !SUPPORTED_MAJORS.includes(major)) return null;
  if (major === '1') return validatorV1;
  return null;
}

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
