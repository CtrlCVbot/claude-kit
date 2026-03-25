/**
 * merge-settings.js
 * claude-kit 템플릿 settings.json을 기존 사용자 settings.json에 병합한다.
 * 사용자 커스텀을 보존하면서 claude-kit 관리 항목을 추가/갱신한다.
 *
 * 사용법: const { mergeSettings } = require('./merge-settings');
 *         const merged = mergeSettings(templateSettings, existingSettings);
 */

'use strict';

/**
 * @param {Object} template - claude-kit settings.json 템플릿
 * @param {Object|null} existing - 사용자의 기존 settings.json (신규 설치 시 null)
 * @returns {Object} 병합된 settings
 */
function mergeSettings(template, existing) {
  if (!existing) {
    return JSON.parse(JSON.stringify(template));
  }

  const merged = JSON.parse(JSON.stringify(existing));

  merged.permissions = mergePermissions(
    template.permissions || {},
    existing.permissions || {}
  );

  merged.hooks = mergeHooks(
    template.hooks || {},
    existing.hooks || {}
  );

  merged.env = mergeEnv(
    template.env || {},
    existing.env || {}
  );

  return merged;
}

function mergePermissions(template, existing) {
  const result = {};

  const templateAllow = template.allow || [];
  const existingAllow = existing.allow || [];
  result.allow = [...new Set([...existingAllow, ...templateAllow])];

  const templateDeny = template.deny || [];
  const existingDeny = existing.deny || [];
  result.deny = [...new Set([...existingDeny, ...templateDeny])];

  return result;
}

function mergeHooks(template, existing) {
  const result = JSON.parse(JSON.stringify(existing));

  for (const [event, templateEntries] of Object.entries(template)) {
    const existingEntries = result[event] || [];

    const existingCommands = new Set();
    for (const entry of existingEntries) {
      for (const hook of (entry.hooks || [])) {
        const cmd = typeof hook === 'string' ? hook : hook.command;
        if (cmd) existingCommands.add(cmd);
      }
    }

    for (const templateEntry of templateEntries) {
      const newHooks = (templateEntry.hooks || []).filter(hook => {
        const cmd = typeof hook === 'string' ? hook : hook.command;
        return !existingCommands.has(cmd);
      });

      if (newHooks.length > 0) {
        existingEntries.push({
          ...templateEntry,
          hooks: newHooks
        });
      }
    }

    result[event] = existingEntries;
  }

  return result;
}

function mergeEnv(template, existing) {
  return {
    ...template,
    ...existing
  };
}

module.exports = { mergeSettings };
