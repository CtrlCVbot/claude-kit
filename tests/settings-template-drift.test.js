/**
 * settings-template-drift.test.js (T-TMPL-09, D-03 옵션 B)
 *
 * src/templates/settings.json.template 은 setup.js buildSettingsTemplate()
 * 의 참조용 스냅샷이다 (실제 settings.json 은 동적 생성). 본 테스트는
 * template 이 최소 구조를 유지하는지를 검증하여 소비자가 참조용으로
 * 보았을 때 실제와 크게 어긋나지 않도록 drift guard 역할을 한다.
 *
 * buildSettingsTemplate() 과의 완전 동기는 수행하지 않는다 (setup.js 는
 * require 시 main() 을 즉시 실행하므로 단위 추출 불가). 대신 template
 * 의 핵심 키·값이 buildSettingsTemplate 이 생성하는 결과와 의미상 일치
 * 하도록 구조적 불변성을 확인한다.
 */

import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const TEMPLATE_PATH = path.join(ROOT, 'src', 'templates', 'settings.json.template')

describe('settings.json.template drift guard', () => {
  const raw = fs.readFileSync(TEMPLATE_PATH, 'utf8')
  const template = JSON.parse(raw)

  it('_note 필드가 template 의 참조 용도를 명시한다', () => {
    expect(template._note).toBeTruthy()
    expect(template._note).toMatch(/setup\.js|buildSettingsTemplate/)
  })

  it('permissions.allow 배열이 핵심 도구 6 종을 포함한다', () => {
    expect(Array.isArray(template.permissions?.allow)).toBe(true)
    for (const tool of ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash']) {
      expect(template.permissions.allow).toContain(tool)
    }
  })

  it('permissions.deny 배열이 WebFetch 차단을 포함한다', () => {
    expect(Array.isArray(template.permissions?.deny)).toBe(true)
    expect(template.permissions.deny).toContain('WebFetch')
  })

  it('hooks 섹션이 setup.js 동적 생성을 안내하는 _comment 를 가진다', () => {
    expect(template.hooks).toBeTruthy()
    expect(template.hooks._comment).toMatch(/setup\.js|buildHooksConfig/)
  })

  it('env 섹션에 ENABLE_TOOL_SEARCH 키가 존재한다', () => {
    expect(template.env).toBeTruthy()
    expect(template.env).toHaveProperty('ENABLE_TOOL_SEARCH')
  })
})
