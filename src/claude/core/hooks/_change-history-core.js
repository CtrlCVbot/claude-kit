'use strict';
/**
 * _change-history-core.js — 변경 이력 자동 append core 모듈 (순수 함수)
 *
 * 스펙: docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-BKLG-01.md
 * 대응: I-18 (Low), N-18 — 변경 이력 수동 append 누락·granularity 불일치.
 *
 * 책임:
 *  - `## N. 변경 이력` 헤더 + markdown 표 감지
 *  - 오늘 날짜 중복 체크 (idempotency)
 *  - 새 행 포맷 (2-column or 3-column)
 *  - 불변 append (원본 변경 없음, 새 content 반환)
 *
 * 활성화 조건 (T-BKLG-01): UX 합의 전까지 hook entrypoint 는 비활성 stub.
 * 본 core 모듈은 v2.6.0+ 승격 대기 중에도 단위 테스트로 유지보수 가능하도록 선행 구현.
 */

/**
 * 오늘 날짜 YYYY-MM-DD 반환. mockTime 지정 시 해당 시각 사용 (테스트).
 */
function today(mockTime) {
  const d = mockTime ? new Date(mockTime) : new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * `## N. 변경 이력` 섹션 + markdown 표 감지.
 * @returns {{found: boolean, sectionNumber?: number, tableStartLine?: number, headerLine?: string}}
 */
function detectChangeLogSection(content) {
  if (!content || typeof content !== 'string') return { found: false };

  const sectionRegex = /^##\s+(\d+)\.\s+변경 이력/m;
  const match = content.match(sectionRegex);
  if (!match) return { found: false };

  const sectionNumber = parseInt(match[1], 10);
  const sectionStart = match.index + match[0].length;
  const rest = content.slice(sectionStart);

  // 섹션 이후 첫 markdown 표 탐색 (다음 ## 섹션 전까지)
  const nextSection = rest.search(/^##\s/m);
  const scope = nextSection > 0 ? rest.slice(0, nextSection) : rest;

  // `| header1 | header2 |` 패턴 + 구분자 `|---|---|`
  const tableMatch = scope.match(/\n(\|[^\n]+\|)\n(\|[-:\s|]+\|)/);
  if (!tableMatch) return { found: false };

  const headerLine = tableMatch[1];
  const tableStartLine = sectionStart + tableMatch.index + 1;

  return {
    found: true,
    sectionNumber,
    tableStartLine,
    headerLine,
  };
}

/**
 * 오늘 날짜가 변경 이력 표에 이미 존재하는지 확인.
 */
function isDuplicateEntryToday(content, date) {
  if (!content || !date) return false;
  // 표 행 내 `| {date} |` 패턴 탐색
  const escapedDate = date.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rowRegex = new RegExp(`\\|\\s*${escapedDate}\\s*\\|`);
  return rowRegex.test(content);
}

/**
 * 표 행 포맷. author 있으면 3-column.
 */
function buildRow({ date, summary, author } = {}) {
  if (!date || !summary) return null;

  // pipe 문자 이스케이프
  const escapedSummary = String(summary).replace(/\|/g, '\\|');

  if (author) {
    return `| ${date} | ${escapedSummary} | ${author} |`;
  }
  return `| ${date} | ${escapedSummary} |`;
}

/**
 * 변경 이력 표 끝에 새 행 append.
 * idempotent: 같은 날짜 행이 이미 있으면 changed=false.
 *
 * @returns {{changed: boolean, content: string, reason?: string}}
 */
function appendRowToContent(content, { date, summary, author } = {}) {
  if (!content || typeof content !== 'string') {
    return { changed: false, content: content || '', reason: 'empty-content' };
  }
  if (!summary) {
    return { changed: false, content, reason: 'no-summary' };
  }

  const section = detectChangeLogSection(content);
  if (!section.found) {
    return { changed: false, content, reason: 'no-section' };
  }

  if (isDuplicateEntryToday(content, date)) {
    return { changed: false, content, reason: 'duplicate-today' };
  }

  const newRow = buildRow({ date, summary, author });
  if (!newRow) {
    return { changed: false, content, reason: 'invalid-row' };
  }

  // 표 영역 찾기 (header + separator + rows)
  const beforeHeader = content.slice(0, section.tableStartLine);
  const rest = content.slice(section.tableStartLine);

  // 표 행들: header 다음 separator 다음 row 라인들 (빈 줄 또는 다음 섹션 전까지)
  const lines = rest.split('\n');
  let tableEndIdx = 0;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('|')) {
      inTable = true;
      tableEndIdx = i;
    } else if (inTable && line.trim() === '') {
      // 빈 줄 → 표 끝
      break;
    } else if (inTable && !line.startsWith('|')) {
      break;
    }
  }

  const tableBlock = lines.slice(0, tableEndIdx + 1).join('\n');
  const afterTable = lines.slice(tableEndIdx + 1).join('\n');

  const updated = beforeHeader + tableBlock + '\n' + newRow + '\n' + (afterTable.startsWith('\n') ? afterTable : (afterTable ? '\n' + afterTable : ''));

  // 앞부분에 실수로 \n 과다 추가되면 정리
  const cleaned = updated.replace(/\n{3,}/g, '\n\n');

  return {
    changed: true,
    content: cleaned,
    reason: 'appended',
  };
}

module.exports = {
  detectChangeLogSection,
  isDuplicateEntryToday,
  buildRow,
  appendRowToContent,
  today,
};
