# ts-abbr-skill

<p align="center">
  <img src="assets/logo.png" alt="ts-abbr-skill" width="480">
</p>

<p align="center">
  <a href="README.zh-CN.md">🇨🇳 简体中文</a> |
  <a href="README.md">🇺🇸 English</a>
</p>

<p align="center">
  <a href="https://github.com/aShu-guo/ts-abbr-skill/releases"><img src="https://img.shields.io/github/v/release/aShu-guo/ts-abbr-skill?style=for-the-badge&color=blue" alt="GitHub Release"></a>
  <a href="https://www.npmjs.com/package/ts-abbr-skill"><img src="https://img.shields.io/npm/v/ts-abbr-skill?style=for-the-badge&logo=npm&color=red" alt="npm version"></a>
  <a href="https://github.com/aShu-guo/ts-abbr-skill/blob/main/LICENSE"><img src="https://img.shields.io/github/license/aShu-guo/ts-abbr-skill?style=for-the-badge&color=green" alt="License"></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ts-abbr-skill"><img src="https://img.shields.io/npm/dm/ts-abbr-skill?style=flat-square&label=downloads" alt="npm downloads"></a>
  <a href="https://github.com/aShu-guo/ts-abbr-skill/stargazers"><img src="https://img.shields.io/github/stars/aShu-guo/ts-abbr-skill?style=flat-square&logo=github" alt="GitHub stars"></a>
</p>

An agent skill that makes generated/refactored TypeScript naming follow a shared abbreviation dictionary (`business` → `biz`, `context` → `ctx`, `configuration` → `cfg`, ...) instead of verbose full words. Works with **Claude Code**, **Codex**, and [any agent supported by the `skills` CLI](https://github.com/vercel-labs/skills).

## Install

### Option A — universal installer (recommended)

Works with Claude Code, Codex, and 70+ other agents via [`skills`](https://github.com/vercel-labs/skills):

```bash
npx skills add aShu-guo/ts-abbr-skill
```

### Option B — dedicated installer

```bash
npx ts-abbr-skill
```

You'll be asked which agent(s) to install for (Claude Code, Codex — more than one can be selected) and where:

| Agent | Project path | Global path |
|-------|--------------|-------------|
| Claude Code | `./.claude/skills/ts-abbr-skill/` | `~/.claude/skills/ts-abbr-skill/` |
| Codex | `./.agents/skills/ts-abbr-skill/` | `~/.codex/skills/ts-abbr-skill/` |

Project scope is recommended for team-shared conventions — commit it to your repo. Global scope applies to all your projects.

Re-running the installer is safe: your customized `config/default.config.json` and `dictionary/default.json` at the target are never overwritten.

## What it does

- **When generating new code**: the agent checks the abbreviation dictionary before naming local variables/parameters and uses the abbreviated form when a match exists.
- **When refactoring existing code**: batch renames go through an AST-aware rename script (`ts-morph`-based), never plain-text find/replace, so cross-file references stay correct. A `tsc --noEmit` check is required afterward before the rename is considered done.

See [`skills/ts-abbr-skill/SKILL.md`](skills/ts-abbr-skill/SKILL.md) for the full rules the agent follows.

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
| database | db |
| application | app |
| ... | ... |

Full dictionary: [`skills/ts-abbr-skill/dictionary/default.json`](skills/ts-abbr-skill/dictionary/default.json)

## Customize

**Scope** — edit `<install target>/config/default.config.json`:

```json
{ "scope": ["variable", "parameter"], "exported": false }
```

`scope` accepts `variable`, `parameter`, `localFunction`, `class`. `exported` controls whether public/exported symbols are eligible (default `false`).

**Project-specific additions** — add `.ts-abbr-skill.local.json` at your repo root; entries are merged on top of the default dictionary:

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
ln -sfn /path/to/ts-abbr-skill/skills/ts-abbr-skill \
  your-test-project/.claude/skills/ts-abbr-skill
```

## License

MIT
