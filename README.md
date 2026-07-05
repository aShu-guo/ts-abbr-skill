# ts-abbreviation-skill

A Claude Code skill that makes generated/refactored TypeScript naming follow a shared abbreviation dictionary (`business` → `biz`, `context` → `ctx`, `configuration` → `cfg`, ...) instead of verbose full words.

## Install

```bash
npx ts-abbreviation-skill
```

You'll be asked where to install:
- **Project** — `./.claude/skills/ts-abbreviation-skill/` (recommended for team-shared conventions, commit this to your repo)
- **Global** — `~/.claude/skills/ts-abbreviation-skill/` (applies to all your projects)

Both can be selected at once.

Re-running the installer is safe: your customized `config/default.config.json` and `dictionary/default.json` at the target are never overwritten.

## What it does

- **When generating new code**: Claude checks the abbreviation dictionary before naming local variables/parameters and uses the abbreviated form when a match exists.
- **When refactoring existing code**: batch renames go through an AST-aware rename script (`ts-morph`-based), never plain-text find/replace, so cross-file references stay correct. A `tsc --noEmit` check is required afterward before the rename is considered done.

See [`skill/SKILL.md`](skill/SKILL.md) for the full rules Claude follows.

## Customize

- **Scope** — edit `<install target>/config/default.config.json`:
  ```json
  { "scope": ["variable", "parameter"], "exported": false }
  ```
  `scope` accepts `variable`, `parameter`, `localFunction`, `class`. `exported` controls whether public/exported symbols are eligible (default `false`).

- **Project-specific dictionary additions** — add a `.claude/ts-abbreviation.local.json` file at your repo root; entries there are merged on top of the default dictionary.

## Development

```bash
npm install
npm run build   # bundles src/cli.ts -> dist/cli.js
node dist/cli.js  # try the installer locally
```

## License

MIT
