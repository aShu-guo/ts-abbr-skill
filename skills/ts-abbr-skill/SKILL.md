---
name: ts-abbr-skill
description: Use when writing or refactoring TypeScript variable, parameter, function, or class names — applies a configurable abbreviation dictionary (business→biz, context→ctx, configuration→cfg, etc.) so generated and refactored code matches the team's naming conventions.
---

# TS Abbreviation Skill

## Overview

Generated TypeScript code tends to use full, verbose English words for local names (`business`, `context`, `configuration`). This skill applies a shared abbreviation dictionary so naming stays short and consistent, in both newly generated code and refactors of existing code.

## Config and Dictionary Lookup Order

Before naming anything, resolve config and dictionary by merging, most specific first:

1. Project override: `.ts-abbr-skill.local.json` in the current repo root (if present) — entries here are merged on top of the default dictionary/config, not a full replacement.
2. Default config/dictionary shipped with this skill: `config/default.config.json`, `dictionary/default.json`.

Default config (`config/default.config.json`):
```json
{
  "$schema": "./schema.json",
  "scope": ["variable", "parameter"],
  "exported": false
}
```

- `scope`: which kinds of identifiers this applies to. Possible values: `variable`, `parameter`, `localFunction`, `class`. Only apply abbreviations to kinds listed here.
- `exported`: whether exported/public symbols (exported consts, public class members, public function names) are in scope. Default `false` — never abbreviate a symbol that's part of a public API unless the project config explicitly sets `exported: true`.

If the project has no `.ts-abbr-skill.local.json`, use the defaults as-is.

## Mode 1: Generating New Code

When about to name a new local variable, parameter, (optionally) local function, or class — per the resolved `scope` — look it up in the merged dictionary. If a whole-word match exists (case-sensitively adapting to camelCase/PascalCase as needed), use the abbreviation instead of the full word. Compound identifiers should abbreviate the matched segment only, keeping the rest of the identifier as-is (e.g. `businessContext` → `bizCtx`, `userConfiguration` → `userCfg`).

Do not abbreviate:
- Symbols outside the configured `scope`
- Exported/public symbols unless `exported: true` is configured
- Identifiers where abbreviating would collide with an existing name in the same scope

**This is a two-pass task, not a one-pass one.** First draft the code naturally. Then, before finishing, do a second pass: enumerate *every* declared identifier in what you just wrote — every parameter, and every local variable (`const`/`let` inside the function body), regardless of whether that word appeared in the user's request — and check each one against the dictionary independently. It's easy to abbreviate the parameters (because they're named right there in the request) and forget local variables the code introduces on its own (intermediate results, loop variables, destructured values). Both are in the default `scope` and both need the same check.

For example, in a function that takes `configuration` and an `identifier` and returns a `message`, the parameters *and* any local variable holding an intermediate value (e.g. a fetched record, a formatted string) all need the same dictionary lookup — not just the ones named in the prompt. Type/class names and exported symbol names are the only things that stay full by default (see `scope`/`exported` above).

## Mode 2: Refactoring Existing Code (batch rename)

Renaming an existing identifier across a codebase is only safe if every reference updates together. **Never use plain-text `grep`/`sed`/find-and-replace to rename identifiers** — it will corrupt string literals, comments, unrelated identically-named locals in other scopes, and any partial-word matches.

Instead:

1. Identify the exact declaration site (file, line, column) of the symbol to rename.
2. Use `scripts/rename-with-ts-morph.ts` to perform an AST-aware rename — it resolves the symbol via the TypeScript compiler API and updates every reference consistently.
   ```bash
   npx tsx scripts/rename-with-ts-morph.ts --file src/foo.ts --line 12 --col 7 --newName bizCtx
   ```
   (Requires `ts-morph` as a dependency in the target project — install with `npm i -D ts-morph` if not already present.)
3. After renaming, run `tsc --noEmit` in the target project and confirm it exits with no errors before considering the rename complete. Do not report a rename as done without this check passing — if it fails, fix the fallout (e.g. missed re-export) before finishing.

## Common Mistakes

- Abbreviating an exported API name because it "looked local" — check `scope`/`exported` config first.
- Using sed/grep-based renames for "just one variable" — even single renames can hit false positives (e.g. a `context` string literal or an unrelated `context` param in another function).
- Skipping the `tsc --noEmit` check after a rename because "it looked like a simple change."
