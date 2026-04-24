/**
 * template-vars.js (T-TMPL-16)
 *
 * claude-kit 템플릿 변수 치환 공통 유틸. 4 곳 (setup.js,
 * claude-md-renderer, agents-md-renderer, quickstart-renderer) 에 중복되어
 * 있던 substituteVars 구현을 단일 SSOT 로 통합한다.
 *
 * 문법: `{{KEY}}` — 대문자 + underscore 관행 (강제 아님, 정규식은
 * Object.entries 의 key 를 그대로 허용).
 *
 * 사용법:
 *   const { substituteVars } = require('./_utils/template-vars');
 *   substituteVars('Hello {{NAME}}', { NAME: 'World' }); // 'Hello World'
 *
 * 계약: tests/template-vars.test.js 참조.
 */

'use strict';

function substituteVars(content, vars) {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }
  return result;
}

module.exports = {
  substituteVars
};
