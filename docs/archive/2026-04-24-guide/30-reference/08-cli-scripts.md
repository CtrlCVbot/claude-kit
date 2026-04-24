# CLI Scripts

> **Status**: Draft (P4, 2026-04-17) ???섍린 ?몃뜳?? 媛??ㅽ겕由쏀듃 ?곷떒 JSDoc ???곸꽭 SSOT.
> **Source**: `scripts/*.js` ?ㅻ뜑 二쇱꽍
> **Related**: [../../package.json](../../package.json) `scripts` ?뱀뀡, [06-settings.md](06-settings.md)

`scripts/` ?꾨옒??Node.js ?좏떥由ы떚 ?몃뜳?ㅼ엯?덈떎. 媛??ㅽ겕由쏀듃??沅뚯쐞???ㅻ챸? **?뚯씪 ?곷떒 JSDoc** ???덉뒿?덈떎 ????臾몄꽌???먯깋???붿빟?낅땲??

二쇱쓽:

- ??臾몄꽌???꾩옱 manual reference?낅땲??
- `node scripts/docs-generate.js --check` ??곸씠 ?꾨땲誘濡? ?ㅼ튂 ?숈옉?대굹 臾몄꽌 ?앹꽦 ?숈옉??諛붾뚮㈃ ?섎룞 由щ럭媛 ?꾩슂?⑸땲??

## 1. ?ㅼ튂쨌鍮뚮뱶

| ?ㅽ겕由쏀듃 | ?몄텧 | ??븷 |
|---------|------|------|
| [`setup.js`](../../scripts/setup.js) | `postinstall` (?먮룞) | claude-kit ?꾩껜 ?ㅼ튂 ?뷀듃由? `profile.json` 湲곕컲?쇰줈 `.claude/`, `plugins/claude-kit/`, `.agents/skills/`, `.codex/agents/`, `AGENTS.md`, marketplace metadata瑜??뺣━ |
| [`claude-md-renderer.js`](../../scripts/claude-md-renderer.js) | `setup.js` ?대? | `CLAUDE.md` ??kit-managed ?뱀뀡???꾨찓??釉붾줉 議고빀?쇰줈 ?뚮뜑留?|
| [`claude-md-merger.js`](../../scripts/claude-md-merger.js) | `setup.js` ?대? | 湲곗〈 `CLAUDE.md` ??kit-managed 釉붾줉 蹂묓빀 (留덉빱 湲곕컲) |
| [`agents-md-renderer.js`](../../scripts/agents-md-renderer.js) | `setup.js` ?대? | `AGENTS.md` managed section???뚮뜑留?|
| [`agents-md-merger.js`](../../scripts/agents-md-merger.js) | `setup.js` ?대? | 湲곗〈 `AGENTS.md` 瑜?managed section merge 諛⑹떇?쇰줈 媛깆떊 |
| [`merge-settings.js`](../../scripts/merge-settings.js) | `setup.js` ?대? | ?쒗뵆由?`settings.json` ???ъ슜??`.claude/settings.json` ??蹂묓빀 (而ㅼ뒪? 蹂댁〈) |
| [`quickstart-renderer.js`](../../scripts/quickstart-renderer.js) | `setup.js` ?대? | ?ㅼ튂蹂?`CLAUDE-KIT-QUICKSTART.md` 瑜??꾨찓???源?議고빀?쇰줈 議곕┰ |

## 2. 臾몄꽌 ?앹꽦

| ?ㅽ겕由쏀듃 | npm script | ??븷 |
|---------|-----------|------|
| [`docs-generate.js`](../../scripts/docs-generate.js) | `generate:docs`, `check:docs` | shared reference(`docs/30-reference/01-05`, `07`)? maintainer reference(`docs/guide/sync/04-kit-maintenance-reference.md`) ?앹꽦 諛?寃利?|
| [`generate-sync-report.js`](../../scripts/generate-sync-report.js) | ?섎룞 | codex-sync ?곹깭 蹂닿퀬??(markdown) ?앹꽦 ??portability/exception/pairing 湲곗? |

### --check 紐⑤뱶 洹쒖빟

`docs-generate.js --check` ??**?꾩옱 ?뚯씪怨??앹꽦 寃곌낵媛 ?ㅻⅤ硫?exit 1**. CI ?뚯씠?꾨씪?몄뿉??drift 媛먯??⑹엯?덈떎.

?ㅻ쭔 ?꾩옱 踰붿쐞???꾨옒 ?먮룞 ?앹꽦 ?명듃???쒖젙?⑸땲??

- `01-commands.md`
- `02-agents.md`
- `03-skills.md`
- `04-hooks.md`
- `05-rules.md`
- `07-pairing-registry.md`
- `../guide/sync/04-kit-maintenance-reference.md`

利? `06-settings.md`? `08-cli-scripts.md`??蹂꾨룄 ?섎룞 由щ럭媛 ?꾩슂?⑸땲??

```bash
pnpm check:docs
```

## 3. 媛먯궗쨌寃利?
| ?ㅽ겕由쏀듃 | ?⑸룄 |
|---------|------|
| [`audit-pairing.js`](../../scripts/audit-pairing.js) | C7 pairing ?쇨???寃利? `pairing-registry.json` ???ㅼ젣 ?뚯씪. silent failure 媛먯? |
| [`audit-drift.js`](../../scripts/audit-drift.js) | C10 codex-sync artifact drift. ?먮낯 source ??fallback artifact 李⑥씠 ?먯? |
| [`codex-hook-compat.js`](../../scripts/codex-hook-compat.js) | Hook ??Codex ?명솚??遺꾨쪟 (Full / Partial / Skip) + portability strategy ?먯젙 |

## 4. ?쇳쉶?굿룸쭏?닿렇?덉씠??
| ?ㅽ겕由쏀듃 | ?⑸룄 |
|---------|------|
| [`update-pairing-registry-75.js`](../../scripts/update-pairing-registry-75.js) | 2026-04 kit-sync 75 full execution ???꾩떆 ?ъ슜. **?ъ떎??湲덉?** |

?쇳쉶???ㅽ겕由쏀듃??紐⑹쟻???ㅽ븯硫?蹂꾨룄 而ㅻ컠?쇰줈 ?쒓굅 or `scripts/_archive/` 濡??대룞 沅뚯옣 (?꾩옱??蹂댁〈 以?.

## 5. ?몄텧 愿怨꾨룄

```
postinstall
  ?붴?? setup.js
      ?쒋?? merge-settings.js
      ?쒋?? claude-md-renderer.js
      ??  ?붴?? (templates/claude-md/ 釉붾줉 議고빀)
      ?쒋?? claude-md-merger.js
      ?쒋?? (Codex ?源? AGENTS.md runtime guidance lint
      ?쒋?? (Codex ?源? codex-hook-compat.js
      ?붴?? quickstart-renderer.js  (CLAUDE-KIT-QUICKSTART.md ?앹꽦)
```

Codex ?源껋뿉??`setup.js --dry-run` ? `AGENTS.md.template` ?뚮뜑留?寃곌낵???ㅼ튂 ?꾨줈?앺듃?먯꽌 源⑥쭏 ???덈뒗 authoring source 寃쎈줈, 議댁옱?섏? ?딅뒗 guidance 寃쎈줈, maintainer sync metadata 媛 ?⑥븘 ?덈뒗吏 preview ?⑸땲?? ?ㅼ젣 ?ㅼ튂 ?쒖뿉????`AGENTS.md` 瑜??앹꽦?섍린 ?꾩뿉 媛숈? warning ??異쒕젰?⑸땲??

## 6. package.json ?ㅽ겕由쏀듃 ?곌껐

```json
{
  "scripts": {
    "postinstall":   "node scripts/setup.js",
    "generate:docs": "node scripts/docs-generate.js",
    "check:docs":    "node scripts/docs-generate.js --check"
  }
}
```

`audit-*`, `codex-hook-compat`, `generate-sync-report` ?깆? **npm script 濡??몄텧?섏? ?딆? 吏곸젒 ?몄텧 ?좏떥** ?낅땲?????꾩슂 ??`node scripts/<name>.js` 濡??ㅽ뻾.

## 7. ???ㅽ겕由쏀듃 異붽? ??洹쒖빟

1. ?뚯씪 ?곷떒??JSDoc 二쇱꽍?쇰줈 **?⑸룄쨌?ъ슜踰빧룹냼??李몄“** 紐낆떆
2. ?쇳쉶?깆씠硫??뚯씪紐낆뿉 ?좎쭨??phase ?ы븿 (?? `update-pairing-registry-75.js`)
3. 諛섎났 ?ㅽ뻾 媛?ν븳 ?앹꽦湲곕㈃ `--check` 紐⑤뱶 ?쒓났
4. `package.json` ??npm script 濡??몄텧??媛移섍? ?덈뒗吏 ?먮떒
5. 蹂?臾몄꽌????ぉ 異붽? (??臾몄꽌???섍린 ?몃뜳??

## 8. 蹂寃??대젰 二쇱쓽

- **2026-04-17**: `generate-quickstart-doc.js` ?쒓굅 (??μ냼 variant ?앹꽦 湲곕뒫 醫낅즺). ?ㅼ튂蹂?`CLAUDE-KIT-QUICKSTART.md` ?섎굹濡??⑥씪?? `quickstart-renderer.js` ??`setup.js` 媛 吏곸젒 ?몄텧.

## ?ㅼ쓬 ?쎄린

- [06-settings.md](06-settings.md) ??`setup.js` 媛 ?앹꽦?섎뒗 settings 援ъ“
- [../guide/mapping/01-claude-to-codex-surface-matrix.md](../guide/mapping/01-claude-to-codex-surface-matrix.md) ??audit/codex-compat ?ㅽ겕由쏀듃??諛곌꼍
- [../guide/sync/02-maintenance-workflow.md](../guide/sync/02-maintenance-workflow.md) ??CI ?듯빀 愿??