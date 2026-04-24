# Settings

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../../src/templates/settings.json.template](../../src/templates/settings.json.template), [../../scripts/setup.js](../../scripts/setup.js), [../../scripts/merge-settings.js](../../scripts/merge-settings.js)
> **Related**: [../guide/shared/02-installation-and-configuration.md](../guide/shared/02-installation-and-configuration.md)

`.claude/settings.json` ? **Claude Code 媛 ?고??꾩뿉 ?쎈뒗 ?ㅼ젙** ?낅땲?? claude-kit ? `profile.json` ??洹쇨굅濡????뚯씪??**?숈쟻 ?앹꽦쨌蹂묓빀** ?⑸땲?? ??臾몄꽌???ㅽ궎留덉? ?앹꽦 硫붿빱?덉쬁???ㅻ챸?⑸땲??

二쇱쓽:

- ??臾몄꽌???꾩옱 manual reference?낅땲??
- `node scripts/docs-generate.js --check` ??곸씠 ?꾨땲誘濡? ?ㅼ튂 ?숈옉?대굹 ?ㅼ젙 merge瑜?諛붽씀硫??섎룞 由щ럭媛 ?꾩슂?⑸땲??

## 1. ?뚯씪 ?꾩튂

| ?뚯씪 | ??븷 | Git |
|------|------|-----|
| `.claude/settings.json` | kit 愿由??ㅼ젙 (?꾨줈?앺듃 怨듭쑀) | tracked |
| `.claude/settings.local.json` | ?ъ슜???꾩슜 ?ㅼ젙 (媛쒖씤) | **gitignore 沅뚯옣** |

???뚯씪? Claude Code ???섑빐 ?먮룞 蹂묓빀?⑸땲?? 媛숈? ?ㅺ? ?덉쑝硫?`settings.local.json` ???곗꽑.

Codex 寃쎄퀎:

- Codex??`.claude/settings.json`??runtime ?ㅼ젙 ?뚯씪濡??ъ슜?섏? ?딆뒿?덈떎.
- Codex 履?runtime ?곌껐?먯? 二쇰줈 `plugins/claude-kit/hooks.json`, `plugins/claude-kit/.codex-plugin/plugin.json`, `AGENTS.md`?낅땲??
- ?곕씪????臾몄꽌??Claude runtime ?ㅼ젙 reference濡??쎄퀬, Codex sync 愿?먯쓽 ?꾩껜 ?ㅼ튂 ?숈옉? [../guide/sync/02-maintenance-workflow.md](../guide/sync/02-maintenance-workflow.md)? [08-cli-scripts.md](08-cli-scripts.md)瑜??④퍡 蹂대뒗 ?몄씠 ?덉쟾?⑸땲??

## 2. ?ㅽ궎留?媛쒖슂

```json
{
  "permissions": {
    "allow": ["Read", "Edit", "Write", "Glob", "Grep", "Bash"],
    "deny": ["WebFetch", "WebFetch(*)"]
  },
  "hooks": {
    "PreToolUse": [ /* ?꾨찓??議곌굔遺 ?숈쟻 ?앹꽦 */ ],
    "PostToolUse": [ /* ... */ ],
    "Stop": [ /* ... */ ]
  },
  "env": {
    "ENABLE_TOOL_SEARCH": "auto:5",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### 2.1 permissions

| ??| ???| ??븷 |
|----|------|------|
| `allow` | string[] | ?덉슜 ?꾧뎄 紐⑸줉 |
| `deny` | string[] | 李⑤떒 ?꾧뎄 紐⑸줉 (glob 吏?? |
| `ask` | string[] | 留ㅻ쾲 ?뺤씤 ????꾩슦???꾧뎄 |

湲곕낯 `deny` ??`WebFetch*` 媛 ?ㅼ뼱 ?덈뒗 ?댁쑀: ?꾨줈?앺듃 洹쒖튃 ??WebFetch ???몄뀡 hang 由ъ뒪?щ줈 湲덉?, Jina/Fetch MCP 濡??泥?([interaction.md](../../.claude/rules/interaction.md) 李몄“).

### 2.2 hooks

`setup.js` ??`buildHooksConfig(activeDomains)` 媛 ?쒖꽦 ?꾨찓?몄뿉 留욎떠 ?숈쟻 ?앹꽦?⑸땲??

**?꾨찓?몃퀎 ???덉떆**:

| ?꾨찓??| ?깅줉?섎뒗 ??| ?대깽??|
|--------|------------|-------|
| `core` | `output-secret-filter`, `code-quality-reminder`, `session-wrap-suggest`, `security-auto-trigger`, `edit-tracker` | PostToolUse, Stop ??|
| `dev` | `dev-tdd-guard`, `dev-db-guard`, `dev-feature-scope-guard` | PreToolUse |
| `plan` | `plan-doc-guard` | PreToolUse |
| `copy` | `copy-evidence-reminder`, `copy-scope-guard`, `copy-doc-drift-check`, `copy-variant-env-guard`, `copy-gate-stop` | PreToolUse / PostToolUse / Stop |

???ㅼ껜??`.claude/hooks/*.js`, ?꾩껜 紐⑸줉? [04-hooks.md](04-hooks.md) ?먮룞 ?앹꽦.

### 2.3 env

?섍꼍 蹂?? Claude Code ?몄뀡 ?꾩뿭.

| 蹂??| 湲곕낯 | ??븷 |
|------|------|------|
| `ENABLE_TOOL_SEARCH` | `auto:5` | ?꾧뎄 ??5 珥덇낵 ??ToolSearch 濡?吏??濡쒕뵫 |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | `1` | Agent Teams 湲곕뒫 ?쒖꽦 |

異붽? ?섍꼍 蹂?섎뒗 copy ?꾨찓???깆뿉???????덉뒿?덈떎 (`SITE_VARIANT`, `SITE_VARIANT_HOST_MAP` ????[copy-variant 猷?(../../src/claude/copy/rules/copy-variant.md) 李몄“).

## 3. ?숈쟻 ?앹꽦 硫붿빱?덉쬁

`setup.js` ?대? ?먮쫫:

```
profile.json (domains, targets)
  ??buildSettingsTemplate({ activeDomains })
  ?쒋?? permissions: 湲곕낯媛?+ ?꾨찓?몃퀎 異붽?
  ?쒋?? hooks: buildHooksConfig(activeDomains) ?몄텧
  ?붴?? env: 怨듯넻 + ?꾨찓?몃퀎
  ??湲곗〈 .claude/settings.json 怨?蹂묓빀 (merge-settings.js)
  ?쒋?? 愿由???(kit-managed): ??뼱?곌린
  ?붴?? ?ъ슜??而ㅼ뒪? ?? 蹂댁〈
  ??.claude/settings.json ???```

### 3.1 kit-managed vs ?ъ슜??而ㅼ뒪?

`merge-settings.js` ???ㅼ쓬 ?먯튃?쇰줈 蹂묓빀?⑸땲??

- **kit 愿由???* (permissions 湲곕낯 ?명듃, kit ???뷀듃由? ?쒖? env): 理쒖떊 ?곹깭濡???뼱?
- **?ъ슜??而ㅼ뒪? ??* (異붽? 沅뚰븳, 異붽? env, ??????: 蹂댁〈

?꾩쟾??寃⑸━媛 ?꾩슂?섎떎硫?`.claude/settings.local.json` ?ъ슜.

## 4. 濡쒖뺄 ?ㅻ쾭?쇱씠??(`.claude/settings.local.json`)

媛쒖씤蹂??ㅼ젙. ??

```json
{
  "permissions": {
    "allow": ["Bash(kubectl:*)"]
  },
  "env": {
    "DEBUG": "true"
  }
}
```

**沅뚯옣 ?뺤콉**:
- Git ??而ㅻ컠?섏? ?딆쓬 (`.gitignore` ??異붽?)
- ? 怨듭쑀 ?ㅼ젙? `settings.json` ?? 媛쒖씤 ?ㅼ젙留?`settings.local.json` ??
## 5. ?섏젙 媛?대뱶

| ?섍퀬 ?띠? 寃?| 諛⑸쾿 |
|-------------|------|
| ???꾨찓????異붽? | `profile.json` ??`domains` ?뺤옣 ??`pnpm install` |
| 沅뚰븳 ?섎굹 異붽? | `.claude/settings.local.json` ??`permissions.allow` 異붽? |
| 湲곕낯 ??鍮꾪솢??| **吏곸젒 ?섏젙 湲덉?** ??`profile.json` ?먯꽌 ?대떦 ?꾨찓???쒓굅 |
| ?섍꼍 蹂??異붽? | `.claude/settings.local.json` ??`env` |
| kit 愿由?????뼱?곌린 | 吏??????(?ъ꽕移???蹂듦뎄?? |

## 6. 寃利?
`.claude/settings.json` ?좏슚?깆? Claude Code 湲곕룞 ???먮룞 ?뚯떛 寃利앸맗?덈떎. ?섎룞 寃利?

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json'))" && echo OK
```

## 7. 李멸퀬

- ?꾩껜 ?ㅼ튂 ?ㅽ겕由쏀듃: [../../scripts/setup.js](../../scripts/setup.js)
- 蹂묓빀 濡쒖쭅: [../../scripts/merge-settings.js](../../scripts/merge-settings.js)
- ?쒗뵆由?(李몄“?? ?ㅼ젣 ?앹꽦? ?숈쟻): [../../src/templates/settings.json.template](../../src/templates/settings.json.template)
