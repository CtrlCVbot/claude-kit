'use strict';
/**
 * _plan-state-sync-core.js — IDEA 상태 SSOT 동기 core 모듈 (순수 함수)
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-FSTATE-01.md
 * SSOT: src/claude/plan/rules/plan-epic-hierarchy.md §5 (T-FSTATE-02)
 * 대응: I-02 (High), N-04 — IDEA frontmatter 상태 변경 시 3 곳 수동 갱신 부담.
 *
 * 책임:
 *  - frontmatter 파싱 (YAML 서브셋, 의존성 없이)
 *  - IDEA → Feature 상태 매핑
 *  - backlog.md / children §1 / binding §7 치환 로직 (순수)
 *  - 파일 I/O·lockfile·로그는 hook 파일 책임
 *
 * 불변성:
 *  - 모든 update 함수는 새 문자열 반환. 원본 변경 없음.
 *  - idempotent: 같은 상태로 갱신 시 원본 그대로 반환.
 */

const IDEA_STATES = Object.freeze(['inbox', 'screened', 'approved', 'archived']);
const FEATURE_STATES = Object.freeze(['pending', 'approved', 'active', 'archived']);

// IDEA 상태 → Feature 상태 매핑 (§5-3)
const STATE_TRANSITIONS = Object.freeze({
  inbox: 'pending',
  screened: 'pending',
  approved: 'approved',
  archived: 'archived',
});

/**
 * 간단한 YAML frontmatter 파서 (외부 의존성 없음).
 * `---` ~ `---` 사이의 `key: value` 라인을 추출. 따옴표 stripping.
 * malformed 면 빈 객체 반환 (fail-open).
 */
function parseFrontmatter(content) {
  if (!content || typeof content !== 'string') return {};

  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!match) return {};

  const body = match[1];
  const result = {};

  const lines = body.split('\n');
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx <= 0) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // 따옴표 stripping
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // 빈 값 → null
    if (value === '' || value === 'null' || value === '~') {
      result[key] = null;
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 파일 경로에서 IDEA ID 추출 (Windows `\` + Unix `/` 모두 지원).
 */
function extractIdeaIdFromPath(filePath) {
  if (!filePath || typeof filePath !== 'string') return null;
  const match = filePath.match(/IDEA-\d{8}-\d{3}/);
  return match ? match[0] : null;
}

/**
 * IDEA 상태 → Feature 상태 매핑. 미지의 상태는 null.
 */
function mapIdeaToFeatureState(ideaState) {
  if (!ideaState || typeof ideaState !== 'string') return null;
  return STATE_TRANSITIONS[ideaState] || null;
}

/**
 * backlog.md 의 한 행에서 `상태` 컬럼만 교체.
 * markdown 표: `| col1 | col2 | ... | 상태 | 등록일 | ...`
 *
 * 우리는 `| IDEA-{ID} | 제목 | 카테고리 | 상태값 |` 순서를 가정.
 * IDEA ID 가 행 첫 번째 셀에 등장하는 행을 찾고 4 번째 셀(상태)을 교체.
 */
function updateBacklogRow(content, ideaId, newState) {
  if (!content || !ideaId || !newState) return content || '';

  const lines = content.split('\n');
  let changed = false;

  const updated = lines.map(line => {
    // table row 이고 IDEA ID 포함 + 첫 셀에 해당 ID 위치
    if (!line.includes('|') || !line.includes(ideaId)) return line;

    // 셀 파싱: `| cell1 | cell2 | ...` → ['', 'cell1', 'cell2', ..., '']
    const cells = line.split('|');
    if (cells.length < 5) return line;  // 최소: ['', id, 제목, 카테고리, 상태, ...]

    // 첫 번째 데이터 셀이 IDEA ID 인지 확인
    const firstCell = (cells[1] || '').trim();
    if (firstCell !== ideaId) return line;

    // 4 번째 데이터 셀 = 상태 (cells[4])
    const currentState = (cells[4] || '').trim();
    if (currentState === newState) return line;

    cells[4] = ` ${newState} `;
    changed = true;
    return cells.join('|');
  });

  return changed ? updated.join('\n') : content;
}

/**
 * children-features.md §1 F{N} 섹션에서 IDEA ID 가 속한 Feature 의 `**상태**:` 라인 갱신.
 *
 * 알고리즘:
 *  1. `### F{N} — ...` 헤더로 섹션 분할
 *  2. 각 섹션에서 `[IDEA-{ID}]` 또는 `IDEA-{ID}` 등장 확인
 *  3. 등장하는 섹션의 `**상태**:` 라인만 교체
 *  4. 다른 섹션은 불변 유지
 */
function updateChildrenFeatureState(content, ideaId, newFeatureState) {
  if (!content || !ideaId || !newFeatureState) return content || '';

  // `### F{N} — ...` 헤더 위치 색인
  const sectionRegex = /^### F\d+\s+[-—]\s+.+$/gm;
  const headers = [];
  let m;
  while ((m = sectionRegex.exec(content)) !== null) {
    headers.push({ index: m.index, length: m[0].length });
  }

  if (headers.length === 0) return content;

  let changed = false;
  const parts = [];
  let cursor = 0;

  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index;
    const end = (i + 1 < headers.length) ? headers[i + 1].index : content.length;
    const section = content.slice(start, end);
    const before = content.slice(cursor, start);
    parts.push(before);

    // IDEA ID 를 포함하는 섹션?
    if (section.includes(ideaId)) {
      // `**상태**: {value}` 라인 교체 (다음 섹션 헤더 직전까지만)
      const stateRegex = /(\*\*상태\*\*:\s*)([^\r\n]+)/;
      const mm = section.match(stateRegex);
      if (mm) {
        const currentVal = mm[2].trim();
        if (currentVal !== newFeatureState) {
          const replaced = section.replace(stateRegex, `$1${newFeatureState}`);
          parts.push(replaced);
          changed = true;
          cursor = end;
          continue;
        }
      }
    }

    parts.push(section);
    cursor = end;
  }

  if (cursor < content.length) parts.push(content.slice(cursor));

  return changed ? parts.join('') : content;
}

/**
 * 08-epic-binding.md §7 "상태 동기 기록" 섹션에 새 행 append.
 * 섹션이 없으면 파일 끝에 자동 생성.
 *
 * row 스키마: { timestamp, ideaState, featureState }
 */
function appendBindingSyncRow(content, row) {
  if (!content || typeof content !== 'string') return content || '';
  if (!row || !row.timestamp || !row.ideaState || !row.featureState) return content;

  const newRow = `| ${row.timestamp} | ${row.ideaState} | ${row.featureState} |`;

  // §7 섹션 탐색
  const section7Regex = /(## 7\. 상태 동기 기록[^\n]*\n[\s\S]*?\n\|[^\n]*\|[^\n]*\|[^\n]*\|\n\|[-:\s|]+\|\n?)((?:\|[^\n]*\n?)*)/;
  const match = content.match(section7Regex);

  if (match) {
    const before = content.slice(0, match.index);
    const header = match[1];
    const existingRows = match[2] || '';
    const after = content.slice(match.index + match[0].length);

    // existingRows 끝에 개행이 없으면 추가
    const rowsTrimmed = existingRows.replace(/\n+$/, '');
    const separator = rowsTrimmed ? '\n' : '';
    const newBlock = `${header}${rowsTrimmed}${separator}${newRow}\n`;

    return `${before}${newBlock}${after}`;
  }

  // 섹션 없음 → 파일 끝에 생성
  const newSection = `\n\n## 7. 상태 동기 기록 (자동 갱신)\n\n| 타임스탬프 | IDEA 상태 | Feature 상태 |\n|---|---|---|\n${newRow}\n`;
  return content.replace(/\n*$/, '') + newSection;
}

/**
 * 통합 결정 함수.
 * 입력을 분석해 동기 대상과 Feature 상태를 결정한다.
 *
 * @param {object} input
 * @param {string} input.prevState - 이전 IDEA 상태
 * @param {string} input.newState - 신규 IDEA 상태
 * @param {string} input.ideaId - IDEA ID
 * @param {string|null} [input.epicId] - Epic ID (없으면 null)
 * @param {string|null} [input.featureSlug] - Feature slug
 * @returns {{skipped: boolean, reason?: string, targets?: string[], featureState?: string|null}}
 */
function decideStateSync(input) {
  input = input || {};
  const { prevState, newState, ideaId, epicId, featureSlug } = input;

  if (!ideaId) {
    return { skipped: true, reason: 'no-idea-id' };
  }

  if (prevState === newState) {
    return { skipped: true, reason: 'no-change' };
  }

  const featureState = mapIdeaToFeatureState(newState);
  if (!featureState) {
    return { skipped: true, reason: 'invalid-state' };
  }

  const targets = ['backlog'];
  if (epicId) {
    targets.push('children');
    if (featureSlug) {
      targets.push('binding');
    } else {
      // binding 은 featureSlug 가 있어야만 추가. 없어도 skip 아님 (backlog+children).
      targets.push('binding');
    }
  }

  return {
    skipped: false,
    targets,
    featureState,
  };
}

module.exports = {
  parseFrontmatter,
  extractIdeaIdFromPath,
  mapIdeaToFeatureState,
  updateBacklogRow,
  updateChildrenFeatureState,
  appendBindingSyncRow,
  decideStateSync,
  STATE_TRANSITIONS,
  IDEA_STATES,
  FEATURE_STATES,
};
