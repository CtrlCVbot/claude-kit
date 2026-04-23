/**
 * generate-sync-report.js — codex-sync 상태 보고서 자동 생성
 *
 * codex-sync Phase 5+ (CC6). codex-portability.json + exception-registry.json +
 * pairing-registry.json을 읽어 sync-report markdown을 자동 생성한다.
 *
 * 사용법:
 *   node scripts/generate-sync-report.js                    # stdout으로 출력
 *   node scripts/generate-sync-report.js > sync-report.md   # 파일로 저장
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function loadJSON(relPath) {
  const p = path.join(ROOT, relPath);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
}

function getDate() {
  return new Date().toISOString().split('T')[0];
}

function getRecentCommits(n) {
  try {
    return execSync(`git log --oneline -${n}`, { cwd: ROOT, encoding: 'utf8' }).trim().split('\n');
  } catch {
    return [];
  }
}

function main() {
  const portability = loadJSON('src/claude/_meta/codex-portability.json');
  const exceptions = loadJSON('src/exception-registry.json');
  const pairing = loadJSON('src/pairing-registry.json');
  const date = getDate();

  if (!portability || !exceptions) {
    console.error('ERROR: codex-portability.json 또는 exception-registry.json 없음');
    process.exit(1);
  }

  // Strategy distribution
  const strategyDist = {};
  const evidenceDist = {};
  for (const e of portability.entries) {
    strategyDist[e.strategy] = (strategyDist[e.strategy] || 0) + 1;
    evidenceDist[e.evidenceLevel] = (evidenceDist[e.evidenceLevel] || 0) + 1;
  }

  // Exception status distribution
  const statusDist = {};
  for (const e of exceptions.entries) {
    const key = `${e.strategy}/${e.status}`;
    statusDist[key] = (statusDist[key] || 0) + 1;
  }

  // Type distribution
  const typeDist = {};
  for (const e of portability.entries) {
    typeDist[e.type] = (typeDist[e.type] || 0) + 1;
  }

  const commits = getRecentCommits(20).filter(c => c.includes('codex-sync'));

  const report = `# Codex 동기화 자동 생성 리포트

> 생성: ${date} | 도구: \`node scripts/generate-sync-report.js\`

## 1. 전략 분포 (4-tier)

| Strategy | 개수 |
|----------|------|
${Object.entries(strategyDist).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}
| **합계** | **${portability.entries.length}** |

## 2. Evidence Level 분포

| Evidence Level | 개수 |
|----------------|------|
${Object.entries(evidenceDist).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

## 3. 타입별 분포

| Type | 개수 |
|------|------|
${Object.entries(typeDist).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

## 4. Exception Registry 상태

| Strategy / Status | 개수 |
|-------------------|------|
${Object.entries(statusDist).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}
| **합계** | **${exceptions.entries.length}** |

## 5. Exception Entries 상세

| ID | Component | Type | Strategy | Status | FallbackTarget |
|----|-----------|------|----------|--------|----------------|
${exceptions.entries.map(e => `| ${e.id} | ${e.component} | ${e.type || '-'} | ${e.strategy} | ${e.status} | ${e.fallbackTarget || '-'} |`).join('\n')}

## 6. Pairing Registry

| Identity | Type | Status | PrimaryCodex | Transition | Drift | Claude | Codex | CodexSkill |
|----------|------|--------|--------------|------------|-------|--------|-------|------------|
${pairing ? pairing.entries.map(e => `| ${e.identity} | ${e.type} | ${e.status} | ${e.primaryCodex || '-'} | ${e.transitionState || '-'} | ${e.driftStatus || '-'} | ${e.claude || '-'} | ${e.codex || '-'} | ${e.codexSkill || '-'} |`).join('\n') : '(없음)'}

## 7. 최근 codex-sync Commits

${commits.length > 0 ? commits.map(c => `- \`${c}\``).join('\n') : '(codex-sync 관련 commit 없음)'}

## 8. Drift Detection 요약

> \`node scripts/audit-drift.js --content\` 실행 결과를 별도로 확인하세요.
> 이 섹션은 pairing-registry 기준의 정적 drift 후보만 표시합니다.

${(() => {
  if (!pairing) return '(pairing-registry 없음)';
  const paired = pairing.entries.filter(e => e.status === 'paired' && e.claude && e.codex);
  const withHash = paired.filter(e => e.contentHash);
  const withoutHash = paired.filter(e => !e.contentHash);
  return [
    '| 항목 | 건수 |',
    '|------|------|',
    '| paired 자산 (총) | ' + paired.length + ' |',
    '| contentHash 기록됨 | ' + withHash.length + ' |',
    '| contentHash 미기록 (drift 후보) | ' + withoutHash.length + ' |',
  ].join('\n');
})()}

## 9. 메타데이터

| 항목 | 값 |
|------|-----|
| codex-portability entries | ${portability.entries.length} |
| exception-registry entries | ${exceptions.entries.length} |
| pairing-registry entries | ${pairing ? pairing.entries.length : 0} |
| 생성 시각 | ${new Date().toISOString()} |
`;

  console.log(report);
}

main();
