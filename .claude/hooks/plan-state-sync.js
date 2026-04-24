'use strict';
/**
 * plan-state-sync.js — PostToolUse(Edit|Write) 훅
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-FSTATE-01.md
 * SSOT: src/claude/plan/rules/plan-epic-hierarchy.md §5 (T-FSTATE-02)
 * Core: _plan-state-sync-core.js (순수 함수)
 * 대응: I-02 (High), N-04 — IDEA frontmatter `상태:` 변경 시 3 곳 자동 동기.
 *
 * 동작:
 *  1. IDEA 파일(.plans/ideas/**\/IDEA-*.md) 편집 감지
 *  2. 편집 후 파일 읽어 새 상태 추출
 *  3. Edit old_string 에서 이전 상태 추출 (가능하면)
 *  4. decideStateSync 로 대상 결정
 *  5. lockfile 획득 후 순차 sync (backlog → children → binding)
 *  6. 실패 시 rollback
 *  7. 로그 append (~/.claude/logs/state-sync.jsonl)
 *  8. systemMessage 결과 요약
 *
 * fail-open: 훅 크래시 시 exit 0 (세션 보호). 로그만 남김.
 * 비활성화: 환경변수 `CLAUDE_DISABLE_PLAN_STATE_SYNC=1` 설정 시 skip.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const core = require('./_plan-state-sync-core.js');

const LOCK_FILE = path.join(process.cwd(), '.claude', 'state', 'state-sync.lock');
const LOG_FILE = path.join(os.homedir(), '.claude', 'logs', 'state-sync.jsonl');

// 경로 매칭 — IDEA 파일만
const IDEA_PATH_REGEX = /\.plans[/\\]ideas[/\\](?:[^/\\]+[/\\])?IDEA-\d{8}-\d{3}\.md$/;

function isIdeaFile(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  return IDEA_PATH_REGEX.test(filePath);
}

function acquireLock() {
  try {
    const dir = path.dirname(LOCK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // exclusive flag — 이미 있으면 실패
    fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: 'wx' });
    return true;
  } catch {
    return false;
  }
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
  } catch {
    // ignore
  }
}

function logEvent(event) {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(LOG_FILE, JSON.stringify(event) + '\n', 'utf8');
  } catch {
    // fail-open
  }
}

function readFileSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function writeFileSafe(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch {
    return false;
  }
}

/**
 * .plans/epics/ 아래에서 EPIC-ID 가 일치하는 children-features.md 경로 탐색.
 * 상태 디렉터리(00-draft, 10-planning, ...) 를 순회.
 */
function findChildrenFeaturesPath(epicId) {
  const epicsRoot = path.join(process.cwd(), '.plans', 'epics');
  if (!fs.existsSync(epicsRoot)) return null;

  let entries;
  try {
    entries = fs.readdirSync(epicsRoot, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statusDir = path.join(epicsRoot, entry.name);
    const epicDir = path.join(statusDir, epicId);
    const childrenPath = path.join(epicDir, '01-children-features.md');
    if (fs.existsSync(childrenPath)) return childrenPath;
  }

  return null;
}

function findBindingPath(featureSlug) {
  if (!featureSlug) return null;
  const bindingPath = path.join(
    process.cwd(),
    '.plans',
    'features',
    'active',
    featureSlug,
    '00-context',
    '08-epic-binding.md',
  );
  return fs.existsSync(bindingPath) ? bindingPath : null;
}

/**
 * Edit 툴의 old_string 에서 이전 상태를 추출.
 * frontmatter 의 `상태:` 또는 `status:` 라인을 탐색.
 */
function extractPrevStateFromOldString(oldString) {
  if (!oldString || typeof oldString !== 'string') return null;
  const match = oldString.match(/^\s*(상태|status)\s*:\s*["']?([a-zA-Z]+)["']?\s*$/m);
  return match ? match[2] : null;
}

function syncAll({ ideaFilePath, newContent, prevState }) {
  const fm = core.parseFrontmatter(newContent);
  const newState = fm.상태 || fm.status;
  const epicId = fm.Epic || fm.epic;
  const featureSlug = fm.slug;
  const ideaId = fm.id || core.extractIdeaIdFromPath(ideaFilePath);

  const decision = core.decideStateSync({
    prevState,
    newState,
    ideaId,
    epicId,
    featureSlug,
  });

  if (decision.skipped) {
    return { synced: false, reason: decision.reason, ideaId };
  }

  const results = { synced: true, targets: [], rollback: [], ideaId, newState, epicId, featureSlug };

  // 1. backlog.md
  if (decision.targets.includes('backlog')) {
    const backlogPath = path.join(process.cwd(), '.plans', 'ideas', 'backlog.md');
    const backlog = readFileSafe(backlogPath);
    if (backlog !== null) {
      const updated = core.updateBacklogRow(backlog, ideaId, newState);
      if (updated !== backlog) {
        if (writeFileSafe(backlogPath, updated)) {
          results.targets.push('backlog');
          results.rollback.push({ path: backlogPath, content: backlog });
        }
      }
    }
  }

  // 2. Epic children
  if (decision.targets.includes('children') && epicId) {
    const childrenPath = findChildrenFeaturesPath(epicId);
    if (childrenPath) {
      const children = readFileSafe(childrenPath);
      if (children !== null) {
        const updated = core.updateChildrenFeatureState(children, ideaId, decision.featureState);
        if (updated !== children) {
          if (writeFileSafe(childrenPath, updated)) {
            results.targets.push('children');
            results.rollback.push({ path: childrenPath, content: children });
          } else {
            // 쓰기 실패 → 롤백
            for (const rb of results.rollback) writeFileSafe(rb.path, rb.content);
            return { synced: false, reason: 'children-write-failed', ideaId };
          }
        }
      }
    }
  }

  // 3. binding §7
  if (decision.targets.includes('binding') && featureSlug) {
    const bindingPath = findBindingPath(featureSlug);
    if (bindingPath) {
      const binding = readFileSafe(bindingPath);
      if (binding !== null) {
        const updated = core.appendBindingSyncRow(binding, {
          timestamp: new Date().toISOString(),
          ideaState: newState,
          featureState: decision.featureState,
        });
        if (updated !== binding) {
          if (writeFileSafe(bindingPath, updated)) {
            results.targets.push('binding');
            results.rollback.push({ path: bindingPath, content: binding });
          } else {
            for (const rb of results.rollback) writeFileSafe(rb.path, rb.content);
            return { synced: false, reason: 'binding-write-failed', ideaId };
          }
        }
      }
    }
  }

  return results;
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    input += chunk;
  });
  process.stdin.on('end', () => {
    try {
      // 비활성화 환경변수
      if (process.env.CLAUDE_DISABLE_PLAN_STATE_SYNC === '1') {
        process.exit(0);
      }

      const data = JSON.parse(input || '{}');
      const toolName = data.tool_name || data.tool || '';
      const args = data.tool_args || data.arguments || {};
      const filePath = args.file_path || args.path || '';

      // Edit/Write 만 처리
      if (toolName !== 'Edit' && toolName !== 'Write') {
        process.exit(0);
      }

      // IDEA 파일만 처리
      if (!isIdeaFile(filePath)) {
        process.exit(0);
      }

      // 파일이 실제로 존재하는지 확인 (Write 직후)
      const content = readFileSafe(filePath);
      if (!content) {
        process.exit(0);
      }

      const prevState = extractPrevStateFromOldString(args.old_string);

      // lockfile 획득
      if (!acquireLock()) {
        logEvent({
          timestamp: new Date().toISOString(),
          event: 'lock-failed',
          file: filePath,
        });
        process.exit(0);
      }

      try {
        const result = syncAll({ ideaFilePath: filePath, newContent: content, prevState });

        logEvent({
          timestamp: new Date().toISOString(),
          event: result.synced ? 'synced' : 'skipped',
          file: filePath,
          idea_id: result.ideaId,
          new_state: result.newState,
          epic_id: result.epicId,
          feature_slug: result.featureSlug,
          targets: result.targets,
          reason: result.reason,
        });

        if (result.synced && result.targets.length > 0) {
          const response = {
            continue: true,
            systemMessage:
              `[State Sync] IDEA ${result.ideaId} 상태 변경 감지 → ${result.targets.join(', ')} 동기화 완료.`,
          };
          process.stdout.write(JSON.stringify(response));
        }
      } finally {
        releaseLock();
      }
    } catch (err) {
      // fail-open
      logEvent({
        timestamp: new Date().toISOString(),
        event: 'error',
        error: err && err.message ? err.message : String(err),
      });
      releaseLock();
    }
    process.exit(0);
  });
}

// 테스트용 내부 export
module.exports = {
  isIdeaFile,
  extractPrevStateFromOldString,
  findChildrenFeaturesPath,
  findBindingPath,
  syncAll,
  IDEA_PATH_REGEX,
};

// CLI 모드 (직접 실행)
if (require.main === module) {
  main();
}
