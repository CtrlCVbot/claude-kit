/**
 * template-vars.test.js (T-TMPL-16)
 *
 * scripts/_utils/template-vars.js 공통 유틸 계약 검증.
 *
 * 배경: setup.js / claude-md-renderer / agents-md-renderer /
 * quickstart-renderer 4 곳에 substituteVars 가 중복 구현되어 있어
 * 일관성 확보를 위해 단일 유틸로 통합한다 (T-TMPL-16, L3 이슈).
 */

import { describe, it, expect } from 'vitest'
import utils from '../scripts/_utils/template-vars.js'

const { substituteVars } = utils

describe('substituteVars (T-TMPL-16)', () => {
  it('단일 변수를 치환한다', () => {
    expect(substituteVars('Hello {{NAME}}', { NAME: 'World' })).toBe('Hello World')
  })

  it('여러 변수를 동시에 치환한다', () => {
    const content = 'domains: {{DOMAINS}}, targets: {{TARGETS}}'
    const vars = { DOMAINS: 'core, dev', TARGETS: 'claude' }
    expect(substituteVars(content, vars)).toBe('domains: core, dev, targets: claude')
  })

  it('동일 변수가 여러 번 등장하면 모두 치환한다', () => {
    expect(substituteVars('{{X}} and {{X}} again', { X: 'foo' })).toBe('foo and foo again')
  })

  it('존재하지 않는 변수는 원문을 그대로 유지한다', () => {
    expect(substituteVars('Hello {{UNKNOWN}}', { NAME: 'World' })).toBe('Hello {{UNKNOWN}}')
  })

  it('빈 vars 객체면 내용 그대로 반환한다', () => {
    expect(substituteVars('No {{VAR}}', {})).toBe('No {{VAR}}')
  })

  it('빈 문자열 입력은 빈 문자열 반환', () => {
    expect(substituteVars('', { X: 'y' })).toBe('')
  })

  it('값에 정규식 특수문자가 있어도 그대로 치환한다', () => {
    expect(substituteVars('{{X}}', { X: '$1 \\n' })).toBe('$1 \\n')
  })

  it('변수 키 이름이 부분 일치해도 오염시키지 않는다 ({{FOO}} 가 {{FOOBAR}} 를 건드리지 않음)', () => {
    expect(substituteVars('{{FOO}}-{{FOOBAR}}', { FOO: 'a', FOOBAR: 'b' })).toBe('a-b')
  })

  it('숫자 값도 치환한다 (String coercion)', () => {
    expect(substituteVars('Version {{V}}', { V: 2 })).toBe('Version 2')
  })
})
