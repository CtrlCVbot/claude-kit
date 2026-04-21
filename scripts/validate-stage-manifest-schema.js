#!/usr/bin/env node
/**
 * validate-stage-manifest-schema.js — IMP-KIT-014 CI 검증 스크립트
 *
 * 역할: .plans/features 하위 stage-manifest.json 파일을 탐색하여 ajv 스키마 검증 + 소비자 경로 일관성 확인.
 * 검증 실패 시 exit 1, 성공 시 exit 0.
 *
 * 관련:
 *  - 유틸: src/claude/core/_schemas/stage-manifest-router.js (validateStageManifest, checkConsumerPaths)
 *  - 스키마: src/claude/core/_schemas/stage-manifest.schema.json
 *  - 등록부: src/claude/core/_registry/stage-manifest-consumers.json
 *  - 스펙: docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-014-stage-manifest-schema-version.md
 */

'use strict';

const fs = require('fs');
const path = require('path');

const {
  validateStageManifest,
  checkConsumerPaths
} = require('../src/claude/core/_schemas/stage-manifest-router.js');

const FEATURES_DIR = path.resolve(__dirname, '..', '.plans', 'features');
const CONSUMERS_PATH = path.resolve(
  __dirname,
  '..',
  'src/claude/core/_registry/stage-manifest-consumers.json'
);

function findStageManifests(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findStageManifests(full));
    } else if (entry.isFile() && entry.name === 'stage-manifest.json') {
      results.push(full);
    }
  }
  return results;
}

function main() {
  let failCount = 0;
  const issues = [];

  // 1. 소비자 등록부 경로 일관성
  try {
    if (fs.existsSync(CONSUMERS_PATH)) {
      const registry = JSON.parse(fs.readFileSync(CONSUMERS_PATH, 'utf8'));
      const consumers = Array.isArray(registry.consumers) ? registry.consumers : [];
      const consumerCheck = checkConsumerPaths(consumers);
      if (!consumerCheck.valid) {
        failCount++;
        issues.push(
          '[consumers] 등록부의 reads 경로가 schema properties에 부재: ' +
          consumerCheck.missingPaths.join(', ')
        );
      } else {
        console.log('[consumers] ' + consumers.length + '건 등록부 경로 일관성 ✓');
      }
    } else {
      console.log('[consumers] 등록부 파일 없음 — skip');
    }
  } catch (err) {
    failCount++;
    issues.push('[consumers] 등록부 파싱 실패: ' + err.message);
  }

  // 2. 실제 stage-manifest.json 파일들 검증
  const manifests = findStageManifests(FEATURES_DIR);
  if (manifests.length === 0) {
    console.log('[manifests] .plans/features/ 내 stage-manifest.json 없음 — skip (exit 0)');
  } else {
    console.log('[manifests] ' + manifests.length + '건 검증 시작');
    for (const file of manifests) {
      try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        const result = validateStageManifest(content);
        if (!result.valid) {
          failCount++;
          const firstErr = result.errors[0];
          const msg = typeof firstErr === 'string'
            ? firstErr
            : (firstErr && firstErr.message) || JSON.stringify(firstErr);
          issues.push('[' + file + '] invalid: ' + msg);
        } else {
          console.log('  ✓ ' + path.relative(path.resolve(__dirname, '..'), file));
        }
      } catch (err) {
        failCount++;
        issues.push('[' + file + '] 파싱 실패: ' + err.message);
      }
    }
  }

  if (failCount > 0) {
    console.error('\n=== FAIL (' + failCount + ') ===');
    issues.forEach(i => console.error('  ' + i));
    process.exit(1);
  }
  console.log('\nAll checks passed.');
  process.exit(0);
}

main();
