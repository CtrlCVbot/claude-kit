'use strict';
/**
 * stage-manifest-router.js — IMP-KIT-014 (Codex sibling)
 * Claude peer: src/claude/core/_schemas/stage-manifest-router.js
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

function validateStageManifest(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['payload is not an object'] };
  }
  const version = payload.schema_version;
  const major = extractMajor(version);
  if (!major || !SUPPORTED_MAJORS.includes(major)) {
    return {
      valid: false,
      errors: ['Unsupported schema_version: ' + (version || 'undefined')]
    };
  }
  const valid = validatorV1(payload);
  return {
    valid: valid === true,
    errors: valid === true ? [] : (validatorV1.errors || [])
  };
}

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
  return { valid: missingPaths.length === 0, missingPaths };
}

module.exports = { validateStageManifest, checkConsumerPaths, extractMajor, SUPPORTED_MAJORS };
