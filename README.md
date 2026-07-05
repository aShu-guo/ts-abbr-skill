# ts-abbreviation-skill

<p align="center">
  <img src="assets/logo.png" alt="ts-abbreviation-skill" width="480">
</p>

<p align="center">
  <a href="README.zh-CN.md">🇨🇳 简体中文</a> |
  <a href="README.md">🇺🇸 English</a>
</p>

<p align="center">
  <a href="https://github.com/aShu-guo/ts-abbreviation-skill/releases"><img src="https://img.shields.io/github/v/release/aShu-guo/ts-abbreviation-skill?style=for-the-badge&color=blue" alt="GitHub Release"></a>
  <a href="https://www.npmjs.com/package/ts-abbreviation-skill"><img src="https://img.shields.io/npm/v/ts-abbreviation-skill?style=for-the-badge&logo=npm&color=red" alt="npm version"></a>
  <a href="https://github.com/aShu-guo/ts-abbreviation-skill/blob/main/LICENSE"><img src="https://img.shields.io/github/license/aShu-guo/ts-abbreviation-skill?style=for-the-badge&color=green" alt="License"></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ts-abbreviation-skill"><img src="https://img.shields.io/npm/dm/ts-abbreviation-skill?style=flat-square&label=downloads" alt="npm downloads"></a>
  <a href="https://github.com/aShu-guo/ts-abbreviation-skill/stargazers"><img src="https://img.shields.io/github/stars/aShu-guo/ts-abbreviation-skill?style=flat-square&logo=github" alt="GitHub stars"></a>
</p>

A Claude Code skill that makes generated/refactored TypeScript naming follow a shared abbreviation dictionary (`business` → `biz`, `context` → `ctx`, `configuration` → `cfg`, ...) instead of verbose full words.

## Install

```bash
npx ts-abbreviation-skill
```

You'll be asked where to install:

- **Project** — `./.claude/skills/ts-abbreviation-skill/` (recommended for team-shared conventions, commit this to your repo)
- **Global** — `~/.claude/skills/ts-abbreviation-skill/` (applies to all your projects)

Both can be selected at once. Re-running the installer is safe: your customized `config/default.config.json` and `dictionary/default.json` are never overwritten.

## What it does

- **When generating new code**: Claude checks the abbreviation dictionary before naming local variables/parameters and uses the abbreviated form when a match exists.
- **When refactoring existing code**: batch renames go through an AST-aware rename script (`ts-morph`-based), never plain-text find/replace, so cross-file references stay correct. A `tsc --noEmit` check is required afterward before the rename is considered done.

See [`skill/SKILL.md`](skill/SKILL.md) for the full rules Claude follows.

## Built-in Dictionary (excerpt)

| Full word | Abbreviation |
|-----------|--------------|
| business | biz |
| context | ctx |
| configuration / config | cfg |
| parameter / parameters | param / params |
| response | res |
| request | req |
| temporary | tmp |
| reference | ref |
| element | el |
| repository | repo |
| service | svc |
| database | db |
| application | app |
| ... | ... |

Full dictionary: [`skill/dictionary/default.json`](skill/dictionary/default.json)

## Customize

**Scope** — edit `<install target>/config/default.config.json`:

```json
{ "scope": ["variable", "parameter"], "exported": false }
```

`scope` accepts `variable`, `parameter`, `localFunction`, `class`. `exported` controls whether public/exported symbols are eligible (default `false`).

**Project-specific additions** — add `.claude/ts-abbreviation.local.json` at your repo root; entries are merged on top of the default dictionary:

```json
{
  "warehouse": "wh",
  "department": "dept"
}
```

## Development

```bash
npm install
npm run build   # bundles src/cli.ts -> dist/cli.js
node dist/cli.js  # try the installer locally
```

For iterating on skill content, use a symlink instead of rebuilding:

```bash
ln -sfn /path/to/ts-abbreviation-skill/skill \
  your-test-project/.claude/skills/ts-abbreviation-skill
```

## License

MIT
